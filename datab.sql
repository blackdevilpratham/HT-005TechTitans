
@@ -1,230 +0,0 @@
-- ============================================================
--  MEDI-REMINDER — MySQL Database Schema
-- ============================================================
--  
--  HOW TO USE:
--  1. Open phpMyAdmin (http://localhost/phpmyadmin) or MySQL CLI
--  2. Create database: CREATE DATABASE medi_reminder;
--  3. Select database: USE medi_reminder;
--  4. Import this file OR copy-paste and execute
--
--  Compatible with MySQL 5.7+ and MariaDB 10.2+
-- ============================================================

-- Create the database
CREATE DATABASE IF NOT EXISTS medi_reminder
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE medi_reminder;

-- ============================================================
-- TABLE: patients
-- Stores patient registration and login data
-- ============================================================
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS dose_log;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS caretakers;
DROP TABLE IF EXISTS patients;

CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed password',
    dob DATE DEFAULT NULL COMMENT 'Date of birth',
    profile_image LONGTEXT DEFAULT NULL COMMENT 'Base64 profile image',
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Patient accounts and login credentials';

-- ============================================================
-- TABLE: caretakers
-- Stores caretaker/parent registration data
-- They have READ-ONLY access to linked patient's data
-- ============================================================
CREATE TABLE caretakers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    relation VARCHAR(50) NOT NULL COMMENT 'Parent, Spouse, Sibling, Caretaker, Nurse, Other',
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed password',
    patient_email VARCHAR(255) NOT NULL COMMENT 'Email of linked patient',
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_patient_email (patient_email),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Caretaker/Parent accounts with read-only patient access';

-- ============================================================
-- TABLE: medicines
-- Stores medicine courses and tracking data
-- ============================================================
CREATE TABLE medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_email VARCHAR(255) NOT NULL,
    course_name VARCHAR(200) NOT NULL COMMENT 'e.g., Diabetes Treatment, BP Control',
    medicine_name VARCHAR(200) NOT NULL COMMENT 'e.g., Metformin 500mg',
    start_date DATE NOT NULL COMMENT 'When to start taking',
    dosage_time TIME NOT NULL COMMENT 'Time of day for dose',
    duration_days INT NOT NULL DEFAULT 1 COMMENT 'How many days the course lasts',
    frequency INT NOT NULL DEFAULT 1 COMMENT 'Doses per day (1=once, 2=twice, etc.)',
    image_data LONGTEXT DEFAULT NULL COMMENT 'Base64 encoded medicine image',
    notes TEXT DEFAULT NULL COMMENT 'Additional notes like Take after meals',
    status ENUM('active', 'completed') DEFAULT 'active',
    taken_count INT DEFAULT 0 COMMENT 'Total doses taken so far',
    missed_count INT DEFAULT 0 COMMENT 'Total doses missed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_patient (patient_email),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_dosage_time (dosage_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Medicine courses and dose tracking';

-- ============================================================
-- TABLE: dose_log
-- Records every dose taken/missed/snoozed with timestamp
-- ============================================================
CREATE TABLE dose_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    taken_at DATETIME NOT NULL COMMENT 'When the dose was taken',
    status ENUM('taken', 'missed', 'snoozed') DEFAULT 'taken',
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_medicine (medicine_id),
    INDEX idx_patient (patient_email),
    INDEX idx_taken_at (taken_at),
    INDEX idx_status (status),
    
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Log of every dose action';

-- ============================================================
-- TABLE: appointments
-- Doctor appointment scheduling
-- ============================================================
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_email VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(200) NOT NULL,
    specialization VARCHAR(200) DEFAULT NULL COMMENT 'e.g., Cardiologist, General',
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    hospital VARCHAR(300) DEFAULT NULL COMMENT 'Hospital or clinic name',
    notes TEXT DEFAULT NULL COMMENT 'e.g., Carry previous reports',
    status ENUM('upcoming', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_patient (patient_email),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Doctor appointment records';

-- ============================================================
-- TABLE: reminders
-- Reminder scheduling and tracking
-- ============================================================
CREATE TABLE reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    reminder_time DATETIME NOT NULL COMMENT 'When to send reminder',
    is_sent TINYINT(1) DEFAULT 0 COMMENT 'Whether reminder was displayed',
    is_snoozed TINYINT(1) DEFAULT 0,
    snooze_until DATETIME DEFAULT NULL COMMENT 'Snooze end time',
    is_acknowledged TINYINT(1) DEFAULT 0 COMMENT 'User saw the reminder',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_patient (patient_email),
    INDEX idx_time (reminder_time),
    INDEX idx_sent (is_sent),
    
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Dose reminder scheduling';

-- ============================================================
-- SAMPLE DATA (Optional - Remove in production)
-- ============================================================

-- Sample Patient (password: test123)
INSERT INTO patients (first_name, last_name, email, mobile, password, dob) VALUES
('Rahul', 'Sharma', 'rahul@example.com', '+91 98765 43210', '$2y$10$YWRhbGFzZGZhc2RmYXNkZux5e5E5x5x5x5x5x5x5x5x5x5x5x5', '1990-05-15');

-- Sample Medicines for Rahul
INSERT INTO medicines (patient_email, course_name, medicine_name, start_date, dosage_time, duration_days, frequency, notes, taken_count) VALUES
('rahul@example.com', 'Diabetes Control', 'Metformin 500mg', CURDATE(), '08:00:00', 30, 2, 'Take after breakfast and dinner', 5),
('rahul@example.com', 'Blood Pressure', 'Amlodipine 5mg', CURDATE(), '09:00:00', 60, 1, 'Take in the morning', 3),
('rahul@example.com', 'Vitamin Supplement', 'Vitamin D3 1000IU', CURDATE(), '12:00:00', 90, 1, 'Take with lunch', 8);

-- Sample Appointments for Rahul
INSERT INTO appointments (patient_email, doctor_name, specialization, appointment_date, appointment_time, hospital, notes) VALUES
('rahul@example.com', 'Dr. Priya Verma', 'Endocrinologist', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '10:30:00', 'Apollo Hospital', 'Carry blood sugar reports'),
('rahul@example.com', 'Dr. Amit Patel', 'Cardiologist', DATE_ADD(CURDATE(), INTERVAL 14 DAY), '14:00:00', 'Max Healthcare', 'Annual heart checkup');

-- Sample Caretaker (password: test123)
INSERT INTO caretakers (full_name, relation, email, mobile, password, patient_email) VALUES
('Priya Sharma', 'Spouse', 'priya@example.com', '+91 98765 43211', '$2y$10$YWRhbGFzZGZhc2RmYXNkZux5e5E5x5x5x5x5x5x5x5x5x5x5x5', 'rahul@example.com');

-- Sample Dose Logs
INSERT INTO dose_log (medicine_id, patient_email, taken_at, status) VALUES
(1, 'rahul@example.com', DATE_SUB(NOW(), INTERVAL 1 DAY), 'taken'),
(1, 'rahul@example.com', DATE_SUB(NOW(), INTERVAL 2 DAY), 'taken'),
(2, 'rahul@example.com', DATE_SUB(NOW(), INTERVAL 1 DAY), 'taken'),
(3, 'rahul@example.com', NOW(), 'taken');


-- ============================================================
-- USEFUL QUERIES FOR REPORTING
-- ============================================================

-- View all patients with their medicine count
-- SELECT p.email, p.first_name, p.last_name, COUNT(m.id) as medicine_count
-- FROM patients p LEFT JOIN medicines m ON p.email = m.patient_email
-- GROUP BY p.email;

-- View adherence report per patient
-- SELECT patient_email, 
--     SUM(taken_count) as total_taken,
--     SUM(duration_days * frequency) as total_expected,
--     ROUND(SUM(taken_count) / SUM(duration_days * frequency) * 100, 1) as adherence_pct
-- FROM medicines GROUP BY patient_email;

-- View today's pending doses
-- SELECT m.medicine_name, m.dosage_time, m.patient_email, p.first_name
-- FROM medicines m 
-- JOIN patients p ON m.patient_email = p.email
-- WHERE m.status = 'active' 
--   AND CURDATE() BETWEEN m.start_date AND DATE_ADD(m.start_date, INTERVAL m.duration_days DAY);

-- View caretaker -> patient relationships
-- SELECT c.full_name as caretaker, c.relation, c.patient_email, 
--     p.first_name as patient_first, p.last_name as patient_last
-- FROM caretakers c LEFT JOIN patients p ON c.patient_email = p.email;

SELECT 'Medi-Reminder database setup complete!' AS message;