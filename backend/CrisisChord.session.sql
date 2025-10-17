-- Use the database
USE crisischord;

-- -----------------------
-- Volunteers table
-- -----------------------
CREATE TABLE IF NOT EXISTS volunteers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255)
);

-- Sample data for volunteers
INSERT INTO volunteers (name, email, phone, location) VALUES
('John Doe', 'john@example.com', '9876543210', 'Sector 1'),
('Jane Smith', 'jane@example.com', '9123456780', 'Sector 5');

-- -----------------------
-- Incidents table
-- -----------------------
CREATE TABLE IF NOT EXISTS incidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DOUBLE,
    longitude DOUBLE,
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'REPORTED',
    reporter_id BIGINT,
    FOREIGN KEY (reporter_id) REFERENCES volunteers(id)
);

-- Sample data for incidents
INSERT INTO incidents (title, description, latitude, longitude, severity, status, reporter_id) VALUES
('Flood near Riverbank', 'Water level rising rapidly after heavy rain', 28.6139, 77.2090, 'HIGH', 'REPORTED', 1),
('Earthquake in Sector 12', 'Minor tremors felt across the city', 28.7041, 77.1025, 'MEDIUM', 'REPORTED', 2);

-- -----------------------
-- Volunteer Tasks table
-- -----------------------
CREATE TABLE IF NOT EXISTS volunteer_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id BIGINT NOT NULL,
    incident_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id),
    FOREIGN KEY (incident_id) REFERENCES incidents(id)
);

-- Sample data for volunteer tasks
INSERT INTO volunteer_tasks (volunteer_id, incident_id, status) VALUES
(1, 1, 'PENDING'),
(2, 2, 'PENDING');
