-- Add metadata column to seller_verification_tokens table
-- This stores registration details for automatic account creation

ALTER TABLE seller_verification_tokens
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add comment for documentation
COMMENT ON COLUMN seller_verification_tokens.metadata IS 'Stores registration details like password, storeName, whatsappNumber for automatic account creation';