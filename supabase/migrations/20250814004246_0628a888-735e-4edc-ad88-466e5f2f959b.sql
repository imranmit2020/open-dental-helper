-- Create the trigger on the time_tracking table
CREATE TRIGGER handle_time_tracking_trigger
    AFTER INSERT ON time_tracking
    FOR EACH ROW
    EXECUTE FUNCTION handle_time_tracking_trigger();