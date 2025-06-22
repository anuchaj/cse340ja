-- One
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Two
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Two two
SELECT * FROM Account;

-- Two two two
SELECT * FROM inventory;

-- Three
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

-- Four
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Five
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- Six
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

-- Seven
SELECT r.review_id, r.user_name, r.rating, r.comment, r.created_at, i.inv_make, i.inv_model
FROM reviews r
JOIN inventory i ON r.inv_id = i.inv_id
WHERE i.inv_id = 8;

