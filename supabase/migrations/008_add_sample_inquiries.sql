-- Add sample inquiry calls for testing and demonstration
-- These represent typical incoming calls that the AI would process
-- Note: This uses the first user_id found in auth.users table
-- If you want to assign to a specific user, update the WHERE clause

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Get the first user from auth.users
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;

    -- Only insert if we found a user
    IF v_user_id IS NOT NULL THEN
        INSERT INTO inquiries (
            user_id,
            customer_name,
            customer_email,
            customer_phone,
            inquiry_type,
            description,
            status,
            priority,
            created_at
        ) VALUES
        (
            v_user_id,
            'Sarah Johnson',
            'sarah.johnson@email.com',
            '+1 (555) 234-5678',
            'Service Request',
            'Calling to schedule a routine maintenance check for HVAC system. Mentioned strange noise from the unit.',
            'new',
            'medium',
            NOW() - INTERVAL '2 hours'
        ),
        (
            v_user_id,
            'Michael Chen',
            'michael.chen@email.com',
            '+1 (555) 876-5432',
            'Emergency',
            'Emergency call about complete heating system failure. Temperature dropping rapidly in building.',
            'action_required',
            'high',
            NOW() - INTERVAL '30 minutes'
        ),
        (
            v_user_id,
            'Emily Rodriguez',
            'emily.r@email.com',
            '+1 (555) 345-6789',
            'Quote Request',
            'Interested in getting a quote for installing a new commercial refrigeration system.',
            'new',
            'medium',
            NOW() - INTERVAL '5 hours'
        ),
        (
            v_user_id,
            'David Thompson',
            'david.thompson@email.com',
            '+1 (555) 654-3210',
            'Follow-up',
            'Following up on previous service appointment. Very satisfied with work, wants to schedule annual maintenance contract.',
            'processed',
            'low',
            NOW() - INTERVAL '1 day'
        ),
        (
            v_user_id,
            'Lisa Martinez',
            'lisa.martinez@email.com',
            '+1 (555) 432-1098',
            'Service Request',
            'Air conditioning not cooling properly. Requesting same-day or next-day service if possible.',
            'new',
            'medium',
            NOW() - INTERVAL '3 hours'
        ),
        (
            v_user_id,
            'Robert Wilson',
            'robert.w@email.com',
            '+1 (555) 789-0123',
            'General Inquiry',
            'Called asking about energy-efficient HVAC upgrade options and available rebates.',
            'new',
            'low',
            NOW() - INTERVAL '6 hours'
        ),
        (
            v_user_id,
            'Jennifer Lee',
            'jennifer.lee@email.com',
            '+1 (555) 567-8901',
            'Emergency',
            'Water leak detected near HVAC unit. Needs immediate attention.',
            'action_required',
            'high',
            NOW() - INTERVAL '45 minutes'
        ),
        (
            v_user_id,
            'James Brown',
            'james.brown@email.com',
            '+1 (555) 890-1234',
            'Service Request',
            'Scheduling preventive maintenance for multiple units in commercial building.',
            'processed',
            'medium',
            NOW() - INTERVAL '2 days'
        ),
        (
            v_user_id,
            'Amanda Garcia',
            'amanda.garcia@email.com',
            '+1 (555) 234-5670',
            'Quote Request',
            'New construction project. Needs quote for complete HVAC installation for 3-story office building.',
            'new',
            'medium',
            NOW() - INTERVAL '4 hours'
        ),
        (
            v_user_id,
            'Christopher Taylor',
            'chris.taylor@email.com',
            '+1 (555) 345-6780',
            'General Inquiry',
            'Questions about thermostat programming and smart HVAC control systems.',
            'processed',
            'low',
            NOW() - INTERVAL '1 day'
        );
    END IF;
END $$;
