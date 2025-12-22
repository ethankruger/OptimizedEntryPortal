-- Create stripe_accounts table to store connected Stripe accounts
CREATE TABLE stripe_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    stripe_account_id TEXT NOT NULL,
    stripe_user_id TEXT,
    access_token TEXT NOT NULL, -- Encrypted in production
    refresh_token TEXT,
    scope TEXT,
    account_type TEXT, -- 'standard' or 'express'
    business_name TEXT,
    business_email TEXT,
    charges_enabled BOOLEAN DEFAULT false,
    payouts_enabled BOOLEAN DEFAULT false,
    details_submitted BOOLEAN DEFAULT false,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE stripe_accounts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own Stripe account
CREATE POLICY "Users can view their own stripe account"
    ON stripe_accounts FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own Stripe account
CREATE POLICY "Users can insert their own stripe account"
    ON stripe_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own Stripe account
CREATE POLICY "Users can update their own stripe account"
    ON stripe_accounts FOR UPDATE
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_stripe_accounts_user_id ON stripe_accounts(user_id);
CREATE INDEX idx_stripe_accounts_stripe_account_id ON stripe_accounts(stripe_account_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stripe_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stripe_accounts_updated_at
    BEFORE UPDATE ON stripe_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_stripe_accounts_updated_at();
