-- Seed sample data for FocalFinder

-- Insert sample users
INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'sarah.chen@example.com', '$2a$10$hashedpassword1', 'Sarah', 'Chen', 'photographer', '+1-415-555-0101', true),
('550e8400-e29b-41d4-a716-446655440002', 'marcus.rodriguez@example.com', '$2a$10$hashedpassword2', 'Marcus', 'Rodriguez', 'photographer', '+1-212-555-0102', true),
('550e8400-e29b-41d4-a716-446655440003', 'emily.johnson@example.com', '$2a$10$hashedpassword3', 'Emily', 'Johnson', 'photographer', '+1-310-555-0103', true),
('550e8400-e29b-41d4-a716-446655440004', 'john.doe@example.com', '$2a$10$hashedpassword4', 'John', 'Doe', 'client', '+1-555-555-0104', true),
('550e8400-e29b-41d4-a716-446655440005', 'jane.smith@example.com', '$2a$10$hashedpassword5', 'Jane', 'Smith', 'client', '+1-555-555-0105', true);

-- Insert photographer profiles
INSERT INTO photographer_profiles (id, user_id, bio, specialty, location, latitude, longitude, hourly_rate, years_experience, profile_image_url, is_available, rating_average, rating_count) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Professional wedding photographer with 8+ years of experience capturing love stories. I specialize in candid moments and artistic compositions that tell your unique story.', 'Wedding Photography', 'San Francisco, CA', 37.7749, -122.4194, 150.00, 8, '/professional-photographer-woman-portrait.png', true, 4.9, 127),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Fashion and portrait photographer specializing in editorial and commercial work. My style combines contemporary aesthetics with timeless elegance.', 'Fashion Photography', 'New York, NY', 40.7128, -74.0060, 200.00, 6, '/professional-photographer-man-portrait.png', true, 4.8, 89),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Event photographer capturing corporate gatherings, parties, and special occasions. I focus on storytelling through dynamic and engaging imagery.', 'Event Photography', 'Los Angeles, CA', 34.0522, -118.2437, 120.00, 5, '/professional-photographer-woman-with-camera.png', false, 5.0, 156);

-- Insert portfolio items
INSERT INTO portfolio_items (photographer_id, image_url, title, description, category, is_featured) VALUES
('660e8400-e29b-41d4-a716-446655440001', '/wedding-photography-couple-dancing.png', 'Romantic First Dance', 'Capturing the magic of the first dance', 'Wedding', true),
('660e8400-e29b-41d4-a716-446655440001', '/wedding-photography-portfolio-1.png', 'Ceremony Moments', 'Beautiful ceremony photography', 'Wedding', true),
('660e8400-e29b-41d4-a716-446655440001', '/wedding-photography-portfolio-2.png', 'Reception Joy', 'Candid reception moments', 'Wedding', false),
('660e8400-e29b-41d4-a716-446655440002', '/fashion-photography-model-portrait.png', 'Editorial Portrait', 'High-fashion editorial shoot', 'Fashion', true),
('660e8400-e29b-41d4-a716-446655440002', '/fashion-photography-portfolio.png', 'Fashion Collection', 'Commercial fashion photography', 'Fashion', true),
('660e8400-e29b-41d4-a716-446655440003', '/event-photography-corporate-gathering.png', 'Corporate Event', 'Professional corporate gathering', 'Corporate', true),
('660e8400-e29b-41d4-a716-446655440003', '/event-photography-portfolio.png', 'Conference Coverage', 'Full conference documentation', 'Corporate', false);

-- Insert service packages
INSERT INTO service_packages (photographer_id, name, description, price, duration_hours, features) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Basic Wedding Package', 'Perfect for small ceremonies and intimate gatherings', 800.00, 4, ARRAY['4 hours of coverage', '200+ edited photos', 'Online gallery', 'Print release']),
('660e8400-e29b-41d4-a716-446655440001', 'Standard Wedding Package', 'Ideal for most weddings and events', 1200.00, 6, ARRAY['6 hours of coverage', '400+ edited photos', 'Online gallery', 'Print release', 'Engagement session']),
('660e8400-e29b-41d4-a716-446655440001', 'Premium Wedding Package', 'Complete wedding day coverage', 1800.00, 8, ARRAY['8 hours of coverage', '600+ edited photos', 'Online gallery', 'Print release', 'Engagement session', 'Second photographer', 'USB drive']),
('660e8400-e29b-41d4-a716-446655440002', 'Portrait Session', 'Professional portrait photography', 300.00, 2, ARRAY['2 hours of shooting', '50+ edited photos', 'Online gallery', 'Print release']),
('660e8400-e29b-41d4-a716-446655440002', 'Fashion Shoot', 'Commercial fashion photography', 500.00, 4, ARRAY['4 hours of shooting', '100+ edited photos', 'Online gallery', 'Commercial license']),
('660e8400-e29b-41d4-a716-446655440003', 'Corporate Event', 'Professional event coverage', 400.00, 3, ARRAY['3 hours of coverage', '150+ edited photos', 'Online gallery', 'Same-day preview']);

-- Insert sample bookings
INSERT INTO bookings (client_id, photographer_id, package_id, event_date, event_time, duration_hours, location, event_type, total_amount, status, payment_status) VALUES
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM service_packages WHERE name = 'Standard Wedding Package' LIMIT 1), '2024-06-15', '14:00', 6, 'Golden Gate Park, San Francisco, CA', 'Wedding', 1200.00, 'confirmed', 'paid'),
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM service_packages WHERE name = 'Portrait Session' LIMIT 1), '2024-05-20', '10:00', 2, 'Central Park, New York, NY', 'Portrait', 300.00, 'pending', 'pending');

-- Insert sample reviews
INSERT INTO reviews (booking_id, client_id, photographer_id, rating, comment) VALUES
((SELECT id FROM bookings WHERE client_id = '550e8400-e29b-41d4-a716-446655440004' LIMIT 1), '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 5, 'Sarah captured our wedding day perfectly! Her attention to detail and artistic eye exceeded our expectations. The photos are absolutely stunning and we couldn''t be happier.');

-- Insert sample messages
INSERT INTO messages (booking_id, sender_id, recipient_id, message) VALUES
((SELECT id FROM bookings WHERE client_id = '550e8400-e29b-41d4-a716-446655440004' LIMIT 1), '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Hi Sarah, we''re so excited about our upcoming wedding shoot! Do you have any specific requirements for the venue?'),
((SELECT id FROM bookings WHERE client_id = '550e8400-e29b-41d4-a716-446655440004' LIMIT 1), '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Hello! I''m thrilled to be part of your special day. The venue looks perfect for photos. I''ll bring all my equipment and we can discuss the timeline closer to the date.');

-- Insert sample availability
INSERT INTO photographer_availability (photographer_id, date, start_time, end_time, is_available) VALUES
('660e8400-e29b-41d4-a716-446655440001', '2024-05-15', '09:00', '17:00', true),
('660e8400-e29b-41d4-a716-446655440001', '2024-05-16', '10:00', '18:00', true),
('660e8400-e29b-41d4-a716-446655440002', '2024-05-15', '08:00', '16:00', true),
('660e8400-e29b-41d4-a716-446655440003', '2024-05-15', '09:00', '17:00', false);

-- Insert sample favorites
INSERT INTO favorites (client_id, photographer_id) VALUES
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002');
