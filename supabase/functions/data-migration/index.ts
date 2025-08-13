import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  dataType: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication and admin role
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin or super_admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Admin access required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const software = formData.get('software') as string;
    const targetTable = formData.get('targetTable') as string;
    const fieldMappingsStr = formData.get('fieldMappings') as string;

    if (!file || !software || !targetTable || !fieldMappingsStr) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fieldMappings: FieldMapping[] = JSON.parse(fieldMappingsStr);
    const fileContent = await file.text();

    // Parse CSV data
    const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataRows = lines.slice(1);

    console.log(`Processing ${dataRows.length} records for table: ${targetTable}`);

    // Get current tenant ID
    const { data: tenantData, error: tenantError } = await supabaseClient.rpc('get_current_tenant_id');
    if (tenantError || !tenantData) {
      return new Response(
        JSON.stringify({ error: 'Failed to get tenant information' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tenantId = tenantData;
    let recordsImported = 0;
    const errors: string[] = [];

    // Process records in batches
    const batchSize = 100;
    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize);
      const batchRecords = [];

      for (const row of batch) {
        try {
          const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
          const record: any = {
            tenant_id: tenantId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Apply field mappings
          for (const mapping of fieldMappings) {
            if (!mapping.sourceField) continue;

            const sourceIndex = headers.indexOf(mapping.sourceField);
            if (sourceIndex === -1) continue;

            let value = values[sourceIndex];
            if (!value || value === '') continue;

            // Transform data based on type
            switch (mapping.dataType) {
              case 'date':
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                  record[mapping.targetField] = date.toISOString();
                }
                break;
              case 'number':
                const num = parseFloat(value);
                if (!isNaN(num)) {
                  record[mapping.targetField] = num;
                }
                break;
              case 'email':
                if (value.includes('@')) {
                  record[mapping.targetField] = value.toLowerCase();
                }
                break;
              case 'phone':
                record[mapping.targetField] = value.replace(/\D/g, '');
                break;
              default:
                record[mapping.targetField] = value;
            }
          }

          // Validate required fields
          const requiredMappings = fieldMappings.filter(m => m.required);
          const missingFields = requiredMappings.filter(m => !record[m.targetField]);
          
          if (missingFields.length > 0) {
            errors.push(`Row ${i + 1}: Missing required fields: ${missingFields.map(f => f.targetField).join(', ')}`);
            continue;
          }

          batchRecords.push(record);
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Insert batch
      if (batchRecords.length > 0) {
        const { error: insertError } = await supabaseClient
          .from(targetTable)
          .insert(batchRecords);

        if (insertError) {
          console.error('Batch insert error:', insertError);
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`);
        } else {
          recordsImported += batchRecords.length;
        }
      }
    }

    console.log(`Migration completed: ${recordsImported} records imported, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        recordsImported,
        totalRecords: dataRows.length,
        errors: errors.slice(0, 10), // Return only first 10 errors
        errorCount: errors.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});