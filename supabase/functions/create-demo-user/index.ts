import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if demo user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const demoUserExists = existingUser?.users.some(u => u.email === 'demo@demo.com')

    if (demoUserExists) {
      return new Response(
        JSON.stringify({ message: 'Demo user already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Create the demo auth user with a specific UUID
    const demoUserId = '00000000-0000-0000-0000-000000000099'
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'demo@demo.com',
      password: 'demo123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Demo',
        last_name: 'User'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      throw authError
    }

    // Update the user's UUID to our specific demo UUID
    const actualUserId = authData.user.id
    
    // Create demo company
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Demo Company LLC',
        email: 'contact@democompany.com',
        phone: '(555) 123-4567',
        address: '123 Demo Street',
        city: 'Demo City',
        state: 'CA',
        zip_code: '90210',
        industry: 'Facilities Management',
        website: 'https://democompany.example.com'
      })
      .select()
      .single()

    if (companyError && companyError.code !== '23505') { // Ignore duplicate key error
      console.error('Company error:', companyError)
    }

    // Update the profile that was auto-created
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        company_id: '00000000-0000-0000-0000-000000000001',
        role: 'administrator',
        first_name: 'Demo',
        last_name: 'User',
        phone_number: '(555) 999-0000'
      })
      .eq('id', actualUserId)

    if (profileError) {
      console.error('Profile error:', profileError)
    }

    // Add user role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: actualUserId,
        role: 'administrator',
        company_id: '00000000-0000-0000-0000-000000000001'
      })

    if (roleError && roleError.code !== '23505') { // Ignore duplicate key error
      console.error('Role error:', roleError)
    }

    // Create demo locations
    await supabaseAdmin.from('locations').insert([
      { id: '00000000-0000-0000-0000-0000000000a1', name: 'Building A', description: 'Main office building', company_id: '00000000-0000-0000-0000-000000000001' },
      { id: '00000000-0000-0000-0000-0000000000a2', name: 'Building B', description: 'Warehouse facility', company_id: '00000000-0000-0000-0000-000000000001' },
      { id: '00000000-0000-0000-0000-0000000000a3', name: 'Parking Lot', description: 'Employee parking area', company_id: '00000000-0000-0000-0000-000000000001' }
    ])

    // Create demo assets
    await supabaseAdmin.from('assets').insert([
      { id: '00000000-0000-0000-0000-0000000000b1', name: 'HVAC System - Floor 1', description: 'Primary heating and cooling system', model: 'Carrier 50TC', serial_number: 'SN-1234567890', status: 'active', location_id: '00000000-0000-0000-0000-0000000000a1', company_id: '00000000-0000-0000-0000-000000000001', purchase_date: '2022-01-15' },
      { id: '00000000-0000-0000-0000-0000000000b2', name: 'Forklift #1', description: 'Electric forklift for warehouse', model: 'Toyota 8FBE25', serial_number: 'FL-9876543210', status: 'active', location_id: '00000000-0000-0000-0000-0000000000a2', company_id: '00000000-0000-0000-0000-000000000001', purchase_date: '2021-06-20' },
      { id: '00000000-0000-0000-0000-0000000000b3', name: 'Fire Alarm Panel', description: 'Central fire detection system', model: 'Honeywell XLS3000', serial_number: 'FA-5555555555', status: 'active', location_id: '00000000-0000-0000-0000-0000000000a1', company_id: '00000000-0000-0000-0000-000000000001', purchase_date: '2020-03-10' },
      { id: '00000000-0000-0000-0000-0000000000b4', name: 'Lighting System - Parking', description: 'LED outdoor lighting', model: 'Philips Arena', serial_number: 'LED-7777777777', status: 'active', location_id: '00000000-0000-0000-0000-0000000000a3', company_id: '00000000-0000-0000-0000-000000000001', purchase_date: '2023-02-28' }
    ])

    // Create demo vendors
    await supabaseAdmin.from('vendors').insert([
      { id: '00000000-0000-0000-0000-0000000000c1', name: 'ABC HVAC Services', vendor_type: 'service', contact_person: 'John Smith', email: 'john@abchvac.com', phone: '(555) 111-2222', address: '456 Service Rd', city: 'Demo City', state: 'CA', zip_code: '90211', status: 'active', rating: 5, company_id: '00000000-0000-0000-0000-000000000001' },
      { id: '00000000-0000-0000-0000-0000000000c2', name: 'Elite Equipment Repair', vendor_type: 'service', contact_person: 'Jane Doe', email: 'jane@eliterepair.com', phone: '(555) 333-4444', address: '789 Industrial Ave', city: 'Demo City', state: 'CA', zip_code: '90212', status: 'active', rating: 4, company_id: '00000000-0000-0000-0000-000000000001' }
    ])

    // Create demo work orders
    const now = new Date()
    await supabaseAdmin.from('work_orders').insert([
      { id: '00000000-0000-0000-0000-0000000000d1', title: 'HVAC Quarterly Maintenance', description: 'Scheduled quarterly maintenance for HVAC system on Floor 1', status: 'in_progress', priority: 'medium', created_by: actualUserId, asset_id: '00000000-0000-0000-0000-0000000000b1', vendor_id: '00000000-0000-0000-0000-0000000000c1', due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '00000000-0000-0000-0000-0000000000d2', title: 'Forklift Annual Inspection', description: 'Required annual safety inspection', status: 'pending', priority: 'high', created_by: actualUserId, asset_id: '00000000-0000-0000-0000-0000000000b2', vendor_id: '00000000-0000-0000-0000-0000000000c2', due_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '00000000-0000-0000-0000-0000000000d3', title: 'Fire Alarm Testing', description: 'Monthly fire alarm system test', status: 'completed', priority: 'high', created_by: actualUserId, asset_id: '00000000-0000-0000-0000-0000000000b3', due_date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ])

    // Create demo checklist
    await supabaseAdmin.from('checklists').insert({
      id: '00000000-0000-0000-0000-0000000000e1',
      name: 'Daily Safety Inspection',
      description: 'Daily walkthrough safety checklist for facilities',
      type: 'safety',
      frequency: 'daily',
      company_id: '00000000-0000-0000-0000-000000000001',
      created_by: actualUserId,
      is_active: true
    })

    // Create demo checklist items
    await supabaseAdmin.from('checklist_items').insert([
      { id: '00000000-0000-0000-0000-0000000000f1', checklist_id: '00000000-0000-0000-0000-0000000000e1', title: 'Check emergency exits', description: 'Verify all emergency exits are clear and accessible', item_type: 'checkbox', is_required: true, sort_order: 1 },
      { id: '00000000-0000-0000-0000-0000000000f2', checklist_id: '00000000-0000-0000-0000-0000000000e1', title: 'Inspect fire extinguishers', description: 'Check that fire extinguishers are in place and charged', item_type: 'checkbox', is_required: true, sort_order: 2 },
      { id: '00000000-0000-0000-0000-0000000000f3', checklist_id: '00000000-0000-0000-0000-0000000000e1', title: 'Lighting condition', description: 'Rate the overall lighting condition', item_type: 'text', is_required: false, sort_order: 3 }
    ])

    // Create demo daily log
    const today = new Date().toISOString().split('T')[0]
    await supabaseAdmin.from('daily_logs').insert({
      id: '00000000-0000-0000-0000-000000000100',
      user_id: actualUserId,
      date: today,
      technician: 'Demo User',
      shift_start: '08:00:00',
      shift_end: '17:00:00',
      weather_conditions: 'Clear, 72°F',
      notes: 'Completed routine inspections. All systems operational.',
      tasks: [{ task: 'Morning walkthrough', status: 'completed' }, { task: 'Check HVAC readings', status: 'completed' }],
      incidents: [],
      equipment_readings: [{ equipment: 'HVAC Floor 1', reading: '72°F', status: 'normal' }]
    })

    // Create demo vendor contracts
    await supabaseAdmin.from('vendor_contracts').insert([
      { id: '00000000-0000-0000-0000-000000000101', vendor_id: '00000000-0000-0000-0000-0000000000c1', title: 'Annual HVAC Maintenance Contract', description: 'Comprehensive HVAC maintenance and repair services', contract_type: 'service', status: 'active', start_date: '2024-01-01', end_date: '2024-12-31', contract_value: 12000, contract_number: 'HVAC-2024-001', terms: 'Quarterly maintenance visits included' },
      { id: '00000000-0000-0000-0000-000000000102', vendor_id: '00000000-0000-0000-0000-0000000000c2', title: 'Equipment Repair Service Agreement', description: 'On-call repair services for warehouse equipment', contract_type: 'service', status: 'active', start_date: '2024-01-01', end_date: '2024-12-31', contract_value: 8500, contract_number: 'EQP-2024-001', terms: '24-hour response time guaranteed' }
    ])

    // Create demo vendor-asset relationships
    await supabaseAdmin.from('vendor_assets').insert([
      { id: '00000000-0000-0000-0000-000000000103', vendor_id: '00000000-0000-0000-0000-0000000000c1', asset_id: '00000000-0000-0000-0000-0000000000b1', relationship_type: 'service', notes: 'Primary HVAC service provider' },
      { id: '00000000-0000-0000-0000-000000000104', vendor_id: '00000000-0000-0000-0000-0000000000c2', asset_id: '00000000-0000-0000-0000-0000000000b2', relationship_type: 'service', notes: 'Authorized forklift service center' },
      { id: '00000000-0000-0000-0000-000000000105', vendor_id: '00000000-0000-0000-0000-0000000000c1', asset_id: '00000000-0000-0000-0000-0000000000b3', relationship_type: 'service', notes: 'Fire system inspection provider' }
    ])

    // Create demo work order comments
    await supabaseAdmin.from('work_order_comments').insert([
      { id: '00000000-0000-0000-0000-000000000106', work_order_id: '00000000-0000-0000-0000-0000000000d1', user_id: actualUserId, comment: 'Technician arrived on site and began initial assessment.' },
      { id: '00000000-0000-0000-0000-000000000107', work_order_id: '00000000-0000-0000-0000-0000000000d1', user_id: actualUserId, comment: 'Replaced air filters and cleaned condenser coils. System running efficiently.' },
      { id: '00000000-0000-0000-0000-000000000108', work_order_id: '00000000-0000-0000-0000-0000000000d3', user_id: actualUserId, comment: 'All fire alarm zones tested successfully. System fully operational.' }
    ])

    // Create demo checklist submission
    const submissionId = '00000000-0000-0000-0000-000000000109'
    await supabaseAdmin.from('checklist_submissions').insert({
      id: submissionId,
      checklist_id: '00000000-0000-0000-0000-0000000000e1',
      submitted_by: actualUserId,
      status: 'completed',
      notes: 'All safety checks passed. No issues found.'
    })

    // Create demo checklist submission items
    await supabaseAdmin.from('checklist_submission_items').insert([
      { id: '00000000-0000-0000-0000-000000000110', submission_id: submissionId, checklist_item_id: '00000000-0000-0000-0000-0000000000f1', is_checked: true, notes: 'All exits clear' },
      { id: '00000000-0000-0000-0000-000000000111', submission_id: submissionId, checklist_item_id: '00000000-0000-0000-0000-0000000000f2', is_checked: true, notes: 'All extinguishers in good condition' },
      { id: '00000000-0000-0000-0000-000000000112', submission_id: submissionId, checklist_item_id: '00000000-0000-0000-0000-0000000000f3', response_value: 'Excellent - all areas well lit' }
    ])

    // Create demo notifications
    await supabaseAdmin.from('notifications').insert([
      { id: '00000000-0000-0000-0000-000000000113', user_id: actualUserId, type: 'work_order', title: 'New Work Order Assigned', body: 'HVAC Quarterly Maintenance has been assigned to you', reference_id: '00000000-0000-0000-0000-0000000000d1', read: false },
      { id: '00000000-0000-0000-0000-000000000114', user_id: actualUserId, type: 'work_order', title: 'Work Order Due Soon', body: 'Forklift Annual Inspection is due in 3 days', reference_id: '00000000-0000-0000-0000-0000000000d2', read: false },
      { id: '00000000-0000-0000-0000-000000000115', user_id: actualUserId, type: 'checklist', title: 'Daily Safety Inspection Completed', body: 'You have completed your daily safety checklist', reference_id: submissionId, read: true }
    ])

    return new Response(
      JSON.stringify({ 
        message: 'Demo user created successfully',
        email: 'demo@demo.com',
        password: 'demo123',
        userId: actualUserId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
