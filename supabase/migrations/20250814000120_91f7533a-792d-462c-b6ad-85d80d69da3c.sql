-- Fix the trigger function to properly handle work sessions
CREATE OR REPLACE FUNCTION handle_time_tracking_trigger()
RETURNS TRIGGER AS $$
DECLARE
    session_record record;
    today_date date := current_date;
BEGIN
    -- Handle clock in
    IF NEW.action_type = 'clock_in' THEN
        -- Check if there's already a session for today
        SELECT * INTO session_record 
        FROM work_sessions 
        WHERE employee_id = NEW.employee_id 
        AND tenant_id = NEW.tenant_id 
        AND date = today_date;
        
        IF session_record IS NULL THEN
            -- Create new work session
            INSERT INTO work_sessions (
                employee_id,
                tenant_id,
                date,
                clock_in_time,
                status,
                break_duration,
                overtime_hours
            ) VALUES (
                NEW.employee_id,
                NEW.tenant_id,
                today_date,
                NEW.timestamp,
                'in_progress',
                0,
                0
            );
        ELSE
            -- Update existing session with clock in time
            UPDATE work_sessions 
            SET 
                clock_in_time = NEW.timestamp,
                status = 'in_progress',
                updated_at = NOW()
            WHERE id = session_record.id;
        END IF;
    END IF;
    
    -- Handle clock out
    IF NEW.action_type = 'clock_out' THEN
        -- Find today's session
        SELECT * INTO session_record 
        FROM work_sessions 
        WHERE employee_id = NEW.employee_id 
        AND tenant_id = NEW.tenant_id 
        AND date = today_date
        AND status = 'in_progress';
        
        IF session_record IS NOT NULL THEN
            -- Calculate total hours
            UPDATE work_sessions 
            SET 
                clock_out_time = NEW.timestamp,
                total_hours = EXTRACT(EPOCH FROM (NEW.timestamp::timestamp - clock_in_time::timestamp)) / 3600,
                status = 'completed',
                updated_at = NOW()
            WHERE id = session_record.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;