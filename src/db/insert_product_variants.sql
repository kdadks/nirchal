-- Insert sample product variants for testing QuickView functionality

-- First, get the product IDs we want to add variants for
DO $$
DECLARE
    banarasi_id INTEGER;
    kurti_id INTEGER;
    lehenga_id INTEGER;
    salwar_id INTEGER;
BEGIN
    -- Get product IDs
    SELECT id INTO banarasi_id FROM products WHERE slug = 'banarasi-silk-saree-red';
    SELECT id INTO kurti_id FROM products WHERE slug = 'cotton-kurti-blue';
    SELECT id INTO lehenga_id FROM products WHERE slug = 'georgette-lehenga-pink';
    
    -- Insert variants for Banarasi Saree (different colors, one size)
    IF banarasi_id IS NOT NULL THEN
        INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price) VALUES
        (banarasi_id, 'Free Size', 'Red', 'BSS-RED-FS', 5, 6999.00),
        (banarasi_id, 'Free Size', 'Royal Blue', 'BSS-BLUE-FS', 3, 6999.00),
        (banarasi_id, 'Free Size', 'Golden', 'BSS-GOLD-FS', 2, 7499.00),
        (banarasi_id, 'Free Size', 'Maroon', 'BSS-MAR-FS', 4, 6999.00);
    END IF;

    -- Insert variants for Cotton Kurti (different sizes and colors)
    IF kurti_id IS NOT NULL THEN
        INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price) VALUES
        (kurti_id, 'S', 'Blue', 'CK-BLUE-S', 10, 1999.00),
        (kurti_id, 'M', 'Blue', 'CK-BLUE-M', 15, 1999.00),
        (kurti_id, 'L', 'Blue', 'CK-BLUE-L', 12, 1999.00),
        (kurti_id, 'XL', 'Blue', 'CK-BLUE-XL', 8, 1999.00),
        (kurti_id, 'S', 'White', 'CK-WHITE-S', 6, 1999.00),
        (kurti_id, 'M', 'White', 'CK-WHITE-M', 9, 1999.00),
        (kurti_id, 'L', 'White', 'CK-WHITE-L', 7, 1999.00),
        (kurti_id, 'XL', 'White', 'CK-WHITE-XL', 4, 1999.00),
        (kurti_id, 'S', 'Black', 'CK-BLACK-S', 8, 1999.00),
        (kurti_id, 'M', 'Black', 'CK-BLACK-M', 11, 1999.00),
        (kurti_id, 'L', 'Black', 'CK-BLACK-L', 9, 1999.00);
    END IF;

    -- Insert variants for Georgette Lehenga (different sizes, limited colors)
    IF lehenga_id IS NOT NULL THEN
        INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price) VALUES
        (lehenga_id, 'S', 'Pink', 'GL-PINK-S', 2, 12999.00),
        (lehenga_id, 'M', 'Pink', 'GL-PINK-M', 3, 12999.00),
        (lehenga_id, 'L', 'Pink', 'GL-PINK-L', 2, 12999.00),
        (lehenga_id, 'S', 'Purple', 'GL-PURPLE-S', 1, 13499.00),
        (lehenga_id, 'M', 'Purple', 'GL-PURPLE-M', 2, 13499.00),
        (lehenga_id, 'L', 'Purple', 'GL-PURPLE-L', 1, 13499.00),
        (lehenga_id, 'S', 'Mint Green', 'GL-GREEN-S', 1, 13999.00),
        (lehenga_id, 'M', 'Mint Green', 'GL-GREEN-M', 1, 13999.00);
    END IF;

    -- Get the salwar suit product if it exists
    SELECT id INTO salwar_id FROM products WHERE slug LIKE '%salwar%' LIMIT 1;
    IF salwar_id IS NOT NULL THEN
        INSERT INTO product_variants (product_id, size, color, sku, stock_quantity, price) VALUES
        (salwar_id, 'S', 'Yellow', 'SS-YELLOW-S', 5, 2999.00),
        (salwar_id, 'M', 'Yellow', 'SS-YELLOW-M', 7, 2999.00),
        (salwar_id, 'L', 'Yellow', 'SS-YELLOW-L', 6, 2999.00),
        (salwar_id, 'XL', 'Yellow', 'SS-YELLOW-XL', 4, 2999.00),
        (salwar_id, 'S', 'Green', 'SS-GREEN-S', 3, 2999.00),
        (salwar_id, 'M', 'Green', 'SS-GREEN-M', 4, 2999.00),
        (salwar_id, 'L', 'Green', 'SS-GREEN-L', 3, 2999.00);
    END IF;

    RAISE NOTICE 'Product variants inserted successfully!';
END $$;

-- Verify the insertion
SELECT 
    p.name as product_name,
    pv.size,
    pv.color,
    pv.sku,
    pv.stock_quantity,
    pv.price
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
ORDER BY p.name, pv.color, pv.size;
