export interface Inquiry {
    id: string;
    user_id: string;
    call_id?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    inquiry_type?: string;
    description?: string;
    interest_level?: string;
    status: 'new' | 'processed' | 'action_required' | 'archived';
    priority?: string;
    follow_up_required?: boolean;
    follow_up_date?: string;
    follow_up_method?: string;
    outcome?: string;
    tags?: string[];
    created_at: string;
    updated_at: string;
}

export interface Appointment {
    id: string;
    user_id: string;
    call_id?: string;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    service_type?: string;
    appointment_date?: string;
    appointment_time?: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    service_address?: string;
    service_city?: string;
    service_state?: string;
    service_zip?: string;
    service_description?: string;
    service_category?: string;
    special_instructions?: string;
    access_instructions?: string;
    equipment_needed?: string;
    materials_needed?: string;
    team_members?: string;
    estimated_cost?: string;
    quoted_price?: string;
    deposit_required?: string;
    payment_method?: string;
    estimated_duration?: string;
    duration_minutes?: number;
    booking_source?: string;
    location_type?: string;
    timezone?: string;
    urgency_level?: string;
    assigned_to?: string;
    created_at: string;
}

export interface Emergency {
    id: string;
    user_id: string;
    customer_email?: string;
    customer_name?: string;
    customer_phone?: string;
    inquiry_type?: string;
    severity?: string;
    description?: string;
    location?: string;
    follow_up_required?: boolean;
    emergency_details?: any; // JSONB
    source?: string;
    webhook_received_at: string;
}
