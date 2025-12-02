-- Add date_lost and location_lost columns for lost items
-- These are optional fields that are used when item_type = 'lost'

-- First, make location_found and date_found nullable since they're not needed for lost items
ALTER TABLE lost_items 
ALTER COLUMN location_found DROP NOT NULL,
ALTER COLUMN date_found DROP NOT NULL;

-- Make reported_by nullable since admin can create items without a reporter
ALTER TABLE lost_items 
ALTER COLUMN reported_by DROP NOT NULL;

-- Remove annoying length constraints
ALTER TABLE lost_items DROP CONSTRAINT IF EXISTS item_name_length;
ALTER TABLE lost_items DROP CONSTRAINT IF EXISTS description_length;
ALTER TABLE lost_items DROP CONSTRAINT IF EXISTS date_not_future;

-- Add new columns for lost items
ALTER TABLE lost_items 
ADD COLUMN IF NOT EXISTS date_lost DATE,
ADD COLUMN IF NOT EXISTS location_lost VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN lost_items.location_found IS 'Location where item was found (for found items)';
COMMENT ON COLUMN lost_items.date_found IS 'Date when item was found (for found items)';
COMMENT ON COLUMN lost_items.date_lost IS 'Date when item was lost (for lost items)';
COMMENT ON COLUMN lost_items.location_lost IS 'Location where item was lost (for lost items)';
COMMENT ON COLUMN lost_items.reported_by IS 'User who reported the item (nullable for admin-created items)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_items_date_lost ON lost_items(date_lost);
CREATE INDEX IF NOT EXISTS idx_items_location_lost ON lost_items(location_lost);
