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
    archived_at?: string;
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
    completed_at?: string;
    archived?: boolean;
    latitude?: number;
    longitude?: number;
    geocoded_at?: string;
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
    status?: 'active' | 'completed' | 'resolved';
    completed_at?: string;
    archived?: boolean;
    webhook_received_at: string;
}

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unit_amount: number;
}

export interface Invoice {
    id: string;
    user_id: string;
    inquiry_id?: string;
    appointment_id?: string;
    stripe_invoice_id?: string;
    stripe_customer_id?: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    line_items: InvoiceLineItem[];
    subtotal: number;
    tax?: number;
    total: number;
    status: 'draft' | 'sent' | 'paid' | 'void' | 'uncollectible';
    due_date?: string;
    sent_at?: string;
    paid_at?: string;
    invoice_url?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface StripeAccount {
    id: string;
    user_id: string;
    stripe_account_id: string;
    stripe_user_id?: string;
    access_token: string;
    refresh_token?: string;
    scope?: string;
    account_type?: string;
    business_name?: string;
    business_email?: string;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
    connected_at: string;
    updated_at: string;
}

export interface CallRecording {
    id: string;
    user_id: string;
    call_id?: string;
    appointment_id?: string;
    inquiry_id?: string;
    customer_name?: string;
    customer_phone?: string;
    call_duration_seconds?: number;
    call_started_at?: string;
    call_ended_at?: string;
    audio_url: string;
    audio_file_size?: number;
    audio_format?: string;
    transcript?: string;
    transcript_summary?: string;
    elevenlabs_conversation_id?: string;
    elevenlabs_agent_id?: string;
    call_metadata?: any;
    created_at: string;
    updated_at: string;
}
