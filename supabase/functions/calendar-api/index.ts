import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Extract API key from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Hash the API key to compare with stored hash
    const encoder = new TextEncoder()
    const keyData = encoder.encode(apiKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Validate API key
    const { data: apiKeyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (keyError || !apiKeyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if key is expired
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'API key has expired' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse URL and extract endpoint
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const endpoint = pathParts[pathParts.length - 1] || 'calendar-api'
    
    // Get request details for logging
    const method = req.method
    const userAgent = req.headers.get('user-agent') || ''
    const requestSize = parseInt(req.headers.get('content-length') || '0')
    const startTime = Date.now()

    let response: Response | undefined
    let responseData: any = null

    // Route to appropriate handler
    if (endpoint === 'appointments') {
      responseData = await handleAppointments(req, supabase, apiKeyData)
    } else if (endpoint === 'patients') {
      responseData = await handlePatients(req, supabase, apiKeyData)
    } else if (endpoint === 'schedules') {
      responseData = await handleSchedules(req, supabase, apiKeyData)
    } else {
      responseData = {
        error: 'Endpoint not found',
        available_endpoints: ['/appointments', '/patients', '/schedules']
      }
      response = new Response(
        JSON.stringify(responseData),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create successful response if not already created
    if (!response) {
      response = new Response(
        JSON.stringify(responseData),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': apiKeyData.rate_limit.toString(),
            'X-RateLimit-Remaining': (apiKeyData.rate_limit - apiKeyData.usage_count).toString()
          } 
        }
      )
    }

    // Log API usage
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    // Background task for logging
    const logUsage = async () => {
      await supabase
        .from('api_usage_logs')
        .insert({
          api_key_id: apiKeyData.id,
          tenant_id: apiKeyData.tenant_id,
          endpoint: `/${endpoint}`,
          method,
          status_code: response.status,
          response_time_ms: responseTime,
          user_agent: userAgent,
          request_size: requestSize,
          response_size: JSON.stringify(responseData).length
        })

      // Update API key usage count
      await supabase
        .from('api_keys')
        .update({ 
          usage_count: apiKeyData.usage_count + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', apiKeyData.id)
    }

    // Run logging in background
    logUsage().catch(console.error)

    return response

  } catch (error) {
    console.error('Calendar API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleAppointments(req: Request, supabase: any, apiKeyData: any) {
  // Check permissions
  if (!apiKeyData.permissions.includes('appointments:read') && req.method === 'GET') {
    throw new Error('Insufficient permissions for reading appointments')
  }
  if (!apiKeyData.permissions.includes('appointments:write') && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    throw new Error('Insufficient permissions for writing appointments')
  }

  const url = new URL(req.url)
  
  if (req.method === 'GET') {
    let query = supabase
      .from('appointments')
      .select(`
        id,
        title,
        description,
        appointment_date,
        duration,
        status,
        treatment_type,
        patient_id,
        dentist_id,
        created_at,
        updated_at
      `)
      .eq('tenant_id', apiKeyData.tenant_id)

    // Apply filters from query parameters
    const date = url.searchParams.get('date')
    const patientId = url.searchParams.get('patient_id')
    const status = url.searchParams.get('status')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      query = query.gte('appointment_date', startDate.toISOString())
                  .lt('appointment_date', endDate.toISOString())
    }

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    query = query.limit(limit).order('appointment_date', { ascending: true })

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      pagination: {
        limit,
        total: count || data?.length || 0
      }
    }
  }

  if (req.method === 'POST') {
    const body = await req.json()
    
    // Validate required fields
    if (!body.patient_id || !body.title || !body.appointment_date) {
      throw new Error('Missing required fields: patient_id, title, appointment_date')
    }

    const appointmentData = {
      ...body,
      tenant_id: apiKeyData.tenant_id,
      status: body.status || 'scheduled',
      duration: body.duration || 60
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single()

    if (error) throw error

    return { data }
  }

  throw new Error(`Method ${req.method} not supported for appointments`)
}

async function handlePatients(req: Request, supabase: any, apiKeyData: any) {
  // Check permissions
  if (!apiKeyData.permissions.includes('patients:read') && req.method === 'GET') {
    throw new Error('Insufficient permissions for reading patients')
  }
  if (!apiKeyData.permissions.includes('patients:write') && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    throw new Error('Insufficient permissions for writing patients')
  }

  const url = new URL(req.url)

  if (req.method === 'GET') {
    let query = supabase
      .from('patients')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        gender,
        address,
        emergency_contact,
        last_visit,
        risk_level,
        created_at,
        updated_at
      `)
      .eq('tenant_id', apiKeyData.tenant_id)

    // Apply filters
    const search = url.searchParams.get('search')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    query = query.limit(limit).order('last_name', { ascending: true })

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      pagination: {
        limit,
        total: count || data?.length || 0
      }
    }
  }

  if (req.method === 'POST') {
    const body = await req.json()
    
    // Validate required fields
    if (!body.first_name || !body.last_name) {
      throw new Error('Missing required fields: first_name, last_name')
    }

    const patientData = {
      ...body,
      tenant_id: apiKeyData.tenant_id,
      risk_level: body.risk_level || 'low'
    }

    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single()

    if (error) throw error

    return { data }
  }

  throw new Error(`Method ${req.method} not supported for patients`)
}

async function handleSchedules(req: Request, supabase: any, apiKeyData: any) {
  // Check permissions
  if (!apiKeyData.permissions.includes('schedules:read') && req.method === 'GET') {
    throw new Error('Insufficient permissions for reading schedules')
  }

  const url = new URL(req.url)

  if (req.method === 'GET') {
    // Get dentist availability and appointments for scheduling
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]
    const dentistId = url.searchParams.get('dentist_id')

    let availabilityQuery = supabase
      .from('dentist_availability')
      .select('*')
      .eq('tenant_id', apiKeyData.tenant_id)

    if (dentistId) {
      availabilityQuery = availabilityQuery.eq('dentist_id', dentistId)
    }

    const { data: availability, error: availabilityError } = await availabilityQuery

    if (availabilityError) throw availabilityError

    // Get appointments for the date
    const startDate = new Date(date)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 1)

    let appointmentsQuery = supabase
      .from('appointments')
      .select('*')
      .eq('tenant_id', apiKeyData.tenant_id)
      .gte('appointment_date', startDate.toISOString())
      .lt('appointment_date', endDate.toISOString())

    if (dentistId) {
      appointmentsQuery = appointmentsQuery.eq('dentist_id', dentistId)
    }

    const { data: appointments, error: appointmentsError } = await appointmentsQuery

    if (appointmentsError) throw appointmentsError

    return {
      data: {
        date,
        availability: availability || [],
        appointments: appointments || []
      }
    }
  }

  throw new Error(`Method ${req.method} not supported for schedules`)
}