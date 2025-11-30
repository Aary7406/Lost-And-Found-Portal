-- Update lost_items table for new requirements
-- 1. Add unique 12-character ID for each item
-- 2. Add item_type field (lost/found)
-- 3. Update status to use VARCHAR instead of enum (unclaimed/claimed)

-- First, add the item_type column
ALTER TABLE lost_items ADD COLUMN IF NOT EXISTS item_type VARCHAR(10) DEFAULT 'lost';
ALTER TABLE lost_items ADD COLUMN IF NOT EXISTS unique_item_id VARCHAR(12) UNIQUE;

-- Create function to generate 12-character unique ID
CREATE OR REPLACE FUNCTION generate_unique_item_id()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate unique_item_id on insert
CREATE OR REPLACE FUNCTION set_unique_item_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.unique_item_id IS NULL THEN
        NEW.unique_item_id := generate_unique_item_id();
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM lost_items WHERE unique_item_id = NEW.unique_item_id) LOOP
            NEW.unique_item_id := generate_unique_item_id();
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_unique_item_id ON lost_items;
CREATE TRIGGER trigger_set_unique_item_id
    BEFORE INSERT ON lost_items
    FOR EACH ROW
    EXECUTE FUNCTION set_unique_item_id();

-- Update existing rows with unique IDs
UPDATE lost_items 
SET unique_item_id = generate_unique_item_id()
WHERE unique_item_id IS NULL;

-- Add constraint to ensure item_type is valid
ALTER TABLE lost_items ADD CONSTRAINT check_item_type 
CHECK (item_type IN ('lost', 'found'));

-- Convert status from enum to VARCHAR
-- Step 1: Drop RLS policies that depend on status column
DROP POLICY IF EXISTS "Authenticated users can view approved items" ON lost_items;
DROP POLICY IF EXISTS "Students can report items" ON lost_items;
DROP POLICY IF EXISTS "Students can update own pending items" ON lost_items;

-- Step 2: Update existing items to map to new status values
UPDATE lost_items SET status = 'claimed' WHERE status = 'claimed';
UPDATE lost_items SET status = 'pending' WHERE status IN ('pending', 'approved', 'rejected');

-- Step 3: Drop the old constraint
ALTER TABLE lost_items DROP CONSTRAINT IF EXISTS valid_status_transitions;

-- Step 4: Change column type from enum to VARCHAR
ALTER TABLE lost_items ALTER COLUMN status TYPE VARCHAR(20);

-- Step 5: Map old statuses to new statuses
UPDATE lost_items SET status = 'unclaimed' WHERE status = 'pending';

-- Step 6: Add new constraint for unclaimed/claimed only
ALTER TABLE lost_items ADD CONSTRAINT check_status 
CHECK (status IN ('unclaimed', 'claimed'));

-- Step 7: Recreate RLS policies with new status values
CREATE POLICY "Authenticated users can view all items"
    ON lost_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Students can report items"
    ON lost_items
    FOR INSERT
    TO authenticated
    WITH CHECK (reported_by = auth.uid() AND status = 'unclaimed');

CREATE POLICY "Students can update own unclaimed items"
    ON lost_items
    FOR UPDATE
    TO authenticated
    USING (reported_by = auth.uid() AND status = 'unclaimed')
    WITH CHECK (reported_by = auth.uid());

-- Update default status to 'unclaimed'
ALTER TABLE lost_items ALTER COLUMN status SET DEFAULT 'unclaimed';

-- Create index on unique_item_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_items_unique_id ON lost_items(unique_item_id);
CREATE INDEX IF NOT EXISTS idx_items_type ON lost_items(item_type);
CREATE INDEX IF NOT EXISTS idx_items_status ON lost_items(status);

COMMENT ON COLUMN lost_items.unique_item_id IS '12-character unique identifier for precise item identification';
COMMENT ON COLUMN lost_items.item_type IS 'Type of item: lost or found';
COMMENT ON COLUMN lost_items.status IS 'Item status: unclaimed or claimed';
