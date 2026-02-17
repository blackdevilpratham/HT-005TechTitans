<?php
/*
 * ============================================================
 *  MEDI-REMINDER — PHP + MySQL Backend API
 * ============================================================
 *  
 *  This file handles ALL database operations for the
 *  Medi-Reminder application using PHP and MySQL.
 *
 *  SETUP INSTRUCTIONS:
 *  1. Create a MySQL database named 'medi_reminder'
 *  2. Import the database.sql file to create tables
 *  3. Update the DB credentials below
 *  4. Place this file and index.html on a PHP server
 *     (XAMPP, WAMP, LAMP, or any hosting with PHP+MySQL)
 *
 * ============================================================
 */

// ============ CORS HEADERS (Allow frontend to call API) ============
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============ DATABASE CONNECTION ============
// *** UPDATE THESE CREDENTIALS FOR YOUR SERVER ***
$DB_HOST = "localhost";
$DB_USER = "root";
$DB_PASS = "";
$DB_NAME = "medi_reminder";

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $conn->connect_error,
        "hint" => "Make sure MySQL is running and the database 'medi_reminder' exists. Import database.sql first."
    ]);
    exit();
}

$conn->set_charset("utf8mb4");

// ============ AUTO-CREATE TABLES IF NOT EXIST ============
function createTablesIfNeeded($conn) {
    $queries = [
        "CREATE TABLE IF NOT EXISTS patients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            mobile VARCHAR(20) NOT NULL,
            password VARCHAR(255) NOT NULL,
            dob DATE DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS caretakers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(200) NOT NULL,
            relation VARCHAR(50) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            mobile VARCHAR(20) NOT NULL,
            password VARCHAR(255) NOT NULL,
            patient_email VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_patient_email (patient_email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS medicines (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_email VARCHAR(255) NOT NULL,
            course_name VARCHAR(200) NOT NULL,
            medicine_name VARCHAR(200) NOT NULL,
            start_date DATE NOT NULL,
            dosage_time TIME NOT NULL,
            duration_days INT NOT NULL DEFAULT 1,
            frequency INT NOT NULL DEFAULT 1,
            image_data LONGTEXT DEFAULT NULL,
            notes TEXT DEFAULT NULL,
            status ENUM('active','completed') DEFAULT 'active',
            taken_count INT DEFAULT 0,
            missed_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_patient (patient_email),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS dose_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            medicine_id INT NOT NULL,
            patient_email VARCHAR(255) NOT NULL,
            taken_at DATETIME NOT NULL,
            status ENUM('taken','missed','snoozed') DEFAULT 'taken',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_medicine (medicine_id),
            INDEX idx_patient (patient_email),
            FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_email VARCHAR(255) NOT NULL,
            doctor_name VARCHAR(200) NOT NULL,
            specialization VARCHAR(200) DEFAULT NULL,
            appointment_date DATE NOT NULL,
            appointment_time TIME NOT NULL,
            hospital VARCHAR(300) DEFAULT NULL,
            notes TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_patient (patient_email),
            INDEX idx_date (appointment_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS reminders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            medicine_id INT NOT NULL,
            patient_email VARCHAR(255) NOT NULL,
            reminder_time DATETIME NOT NULL,
            is_sent TINYINT(1) DEFAULT 0,
            is_snoozed TINYINT(1) DEFAULT 0,
            snooze_until DATETIME DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_patient (patient_email),
            INDEX idx_time (reminder_time),
            FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    ];

    foreach ($queries as $sql) {
        $conn->query($sql);
    }
}

createTablesIfNeeded($conn);

// ============ ROUTING ============
$action = isset($_GET['action']) ? $_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'];

// Get JSON body for POST/PUT
$input = json_decode(file_get_contents("php://input"), true);
if (!$input) $input = $_POST;

// ============ RESPONSE HELPER ============
function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// ============ API ENDPOINTS ============

switch ($action) {

    // --------------------------------------------------------
    //  PATIENT REGISTRATION
    // --------------------------------------------------------
    case 'patient_register':
        if ($method !== 'POST') respond(["success" => false, "message" => "POST method required"], 405);

        $firstName = $conn->real_escape_string(trim($input['first_name'] ?? ''));
        $lastName  = $conn->real_escape_string(trim($input['last_name'] ?? ''));
        $email     = $conn->real_escape_string(strtolower(trim($input['email'] ?? '')));
        $mobile    = $conn->real_escape_string(trim($input['mobile'] ?? ''));
        $password  = $input['password'] ?? '';
        $dob       = $conn->real_escape_string($input['dob'] ?? '');

        if (!$firstName || !$lastName || !$email || !$mobile || !$password) {
            respond(["success" => false, "message" => "All required fields must be filled"], 400);
        }

        if (strlen($password) < 6) {
            respond(["success" => false, "message" => "Password must be at least 6 characters"], 400);
        }

        // Check if email already exists
        $check = $conn->query("SELECT id FROM patients WHERE email = '$email'");
        if ($check->num_rows > 0) {
            // Update existing patient (login)
            $hashedPw = hashPassword($password);
            $dobSql = $dob ? "'$dob'" : "NULL";
            $conn->query("UPDATE patients SET first_name='$firstName', last_name='$lastName', mobile='$mobile', password='$hashedPw', dob=$dobSql WHERE email='$email'");
            $row = $conn->query("SELECT * FROM patients WHERE email='$email'")->fetch_assoc();
        } else {
            $hashedPw = hashPassword($password);
            $dobSql = $dob ? "'$dob'" : "NULL";
            $sql = "INSERT INTO patients (first_name, last_name, email, mobile, password, dob) VALUES ('$firstName', '$lastName', '$email', '$mobile', '$hashedPw', $dobSql)";
            if (!$conn->query($sql)) {
                respond(["success" => false, "message" => "Registration failed: " . $conn->error], 500);
            }
            $row = $conn->query("SELECT * FROM patients WHERE email='$email'")->fetch_assoc();
        }

        respond([
            "success" => true,
            "message" => "Patient registered successfully",
            "patient" => [
                "id" => $row['id'],
                "firstName" => $row['first_name'],
                "lastName" => $row['last_name'],
                "fullName" => $row['first_name'] . ' ' . $row['last_name'],
                "email" => $row['email'],
                "mobile" => $row['mobile'],
                "dob" => $row['dob']
            ]
        ]);
        break;

    // --------------------------------------------------------
    //  PATIENT LOGIN
    // --------------------------------------------------------
    case 'patient_login':
        if ($method !== 'POST') respond(["success" => false, "message" => "POST method required"], 405);

        $email    = $conn->real_escape_string(strtolower(trim($input['email'] ?? '')));
        $password = $input['password'] ?? '';

        $result = $conn->query("SELECT * FROM patients WHERE email = '$email'");
        if ($result->num_rows === 0) {
            respond(["success" => false, "message" => "No patient found with this email. Please register first."], 404);
        }

        $row = $result->fetch_assoc();
        if (!verifyPassword($password, $row['password'])) {
            respond(["success" => false, "message" => "Incorrect password"], 401);
        }

        respond([
            "success" => true,
            "message" => "Login successful",
            "patient" => [
                "id" => $row['id'],
                "firstName" => $row['first_name'],
                "lastName" => $row['last_name'],
                "fullName" => $row['first_name'] . ' ' . $row['last_name'],
                "email" => $row['email'],
                "mobile" => $row['mobile'],
                "dob" => $row['dob']
            ]
        ]);
        break;

    // --------------------------------------------------------
    //  CARETAKER REGISTRATION / LOGIN
    // --------------------------------------------------------
    case 'caretaker_register':
        if ($method !== 'POST') respond(["success" => false, "message" => "POST method required"], 405);

        $name         = $conn->real_escape_string(trim($input['name'] ?? ''));
        $relation     = $conn->real_escape_string(trim($input['relation'] ?? ''));
        $email        = $conn->real_escape_string(strtolower(trim($input['email'] ?? '')));
        $mobile       = $conn->real_escape_string(trim($input['mobile'] ?? ''));
        $password     = $input['password'] ?? '';
        $patientEmail = $conn->real_escape_string(strtolower(trim($input['patient_email'] ?? '')));

        if (!$name || !$relation || !$email || !$mobile || !$password || !$patientEmail) {
            respond(["success" => false, "message" => "All required fields must be filled"], 400);
        }

        $hashedPw = hashPassword($password);

        // Check if caretaker exists
        $check = $conn->query("SELECT id FROM caretakers WHERE email = '$email'");
        if ($check->num_rows > 0) {
            $conn->query("UPDATE caretakers SET full_name='$name', relation='$relation', mobile='$mobile', password='$hashedPw', patient_email='$patientEmail' WHERE email='$email'");
        } else {
            $conn->query("INSERT INTO caretakers (full_name, relation, email, mobile, password, patient_email) VALUES ('$name', '$relation', '$email', '$mobile', '$hashedPw', '$patientEmail')");
        }

        // Check if patient exists
        $patientResult = $conn->query("SELECT first_name, last_name, email FROM patients WHERE email = '$patientEmail'");
        $patientData = null;
        if ($patientResult->num_rows > 0) {
            $p = $patientResult->fetch_assoc();
            $patientData = [
                "fullName" => $p['first_name'] . ' ' . $p['last_name'],
                "email" => $p['email']
            ];
        }

        respond([
            "success" => true,
            "message" => "Caretaker registered successfully",
            "caretaker" => [
                "name" => $name,
                "relation" => $relation,
                "email" => $email,
                "mobile" => $mobile,
                "patientEmail" => $patientEmail
            ],
            "patient" => $patientData
        ]);
        break;

    // --------------------------------------------------------
    //  ADD MEDICINE
    // --------------------------------------------------------
    case 'add_medicine':
        if ($method !== 'POST') respond(["success" => false, "message" => "POST method required"], 405);

        $patientEmail = $conn->real_escape_string(strtolower(trim($input['patient_email'] ?? '')));
        $course       = $conn->real_escape_string(trim($input['course'] ?? ''));
        $name         = $conn->real_escape_string(trim($input['name'] ?? ''));
        $date         = $conn->real_escape_string($input['date'] ?? '');
        $time         = $conn->real_escape_string($input['time'] ?? '');
        $duration     = intval($input['duration'] ?? 1);
        $frequency    = intval($input['frequency'] ?? 1);
        $image        = $conn->real_escape_string($input['image'] ?? '');
        $notes        = $conn->real_escape_string($input['notes'] ?? '');

        if (!$patientEmail || !$course || !$name || !$date || !$time) {
            respond(["success" => false, "message" => "Required fields missing"], 400);
        }

        $sql = "INSERT INTO medicines (patient_email, course_name, medicine_name, start_date, dosage_time, duration_days, frequency, image_data, notes) VALUES ('$patientEmail', '$course', '$name', '$date', '$time', $duration, $frequency, '$image', '$notes')";

        if ($conn->query($sql)) {
            $medId = $conn->insert_id;
            respond([
                "success" => true,
                "message" => "Medicine added successfully",
                "medicine_id" => $medId
            ]);
        } else {
            respond(["success" => false, "message" => "Failed to add medicine: " . $conn->error], 500);
        }
        break;

    // --------------------------------------------------------
    //  GET ALL MEDICINES FOR A PATIENT
    // --------------------------------------------------------
    case 'get_medicines':
        $email = $conn->real_escape_string(strtolower(trim($_GET['email'] ?? '')));
        if (!$email) respond(["success" => false, "message" => "Email required"], 400);

        $result = $conn->query("SELECT * FROM medicines WHERE patient_email = '$email' ORDER BY created_at DESC");
        $medicines = [];
        while ($row = $result->fetch_assoc()) {
            // Get taken dates from dose_log
            $logResult = $conn->query("SELECT taken_at FROM dose_log WHERE medicine_id = {$row['id']} AND status = 'taken' ORDER BY taken_at DESC");
            $takenDates = [];
            while ($logRow = $logResult->fetch_assoc()) {
                $takenDates[] = $logRow['taken_at'];
            }

            $medicines[] = [
                "id" => intval($row['id']),
                "course" => $row['course_name'],
                "name" => $row['medicine_name'],
                "date" => $row['start_date'],
                "time" => $row['dosage_time'],
                "duration" => intval($row['duration_days']),
                "frequency" => intval($row['frequency']),
                "image" => $row['image_data'],
                "notes" => $row['notes'],
                "status" => $row['status'],
                "takenCount" => intval($row['taken_count']),
                "missedCount" => intval($row['missed_count']),
                "takenDates" => $takenDates
            ];
        }

        respond(["success" => true, "medicines" => $medicines]);
        break;

    // --------------------------------------------------------
    //  TAKE DOSE
    // --------------------------------------------------------
    case 'take_dose':
        if ($method !== 'POST') respond(["success" => false, "message" => "POST method required"], 405);

        $medId = intval($input['medicine_id'] ?? 0);
        $email = $conn->real_escape_string(strtolower(trim($input['patient_email'] ?? '')));

        if (!$medId || !$email) {
            respond(["success" => false, "message" => "Medicine ID and email required"], 400);
        }

        // Get medicine
        $result = $conn->query("SELECT * FROM medicines WHERE id = $medId AND patient_email = '$email'");
        if ($result->num_rows === 0) {
            respond(["success" => false, "message" => "Medicine not found"], 404);
        }

        $med = $result->fetch_assoc();
        $totalDoses = $med['duration_days'] * $med['frequency'];
        $currentTaken = $med['taken_count'];

        if ($currentTaken >= $totalDoses) {
            respond(["success" => false, "message" => "All doses already completed"], 400);
        }

        $newCount = $currentTaken + 1;
        $newStatus = ($newCount >= $totalDoses) ? 'completed' : 'active';
        $now = date('Y-m-d H:i:s');

        // Update medicine
        $conn->query("UPDATE medicines SET taken_count = $newCount, status = '$newStatus', updated_at = '$now' WHERE id = $medId");

        // Log the dose
        $conn->query("INSERT INTO dose_log (medicine_id, patient_email, taken_at, status) VALUES ($medId, '$email', '$now', 'taken')");

        respond([
            "success" => true,
            "message" => "Dose recorded successfully",
            "takenCount" => $newCount,
            "totalDoses" => $totalDoses,
            "status" => $newStatus
        ]);
        break;

    // --------------------------------------------------------
    //  DELETE MEDICINE
    // --------------------------------------------------------
    case 'delete_medicine':
        if ($method !== 'POST' && $method !== 'DELETE') respond(["success" => false, "message" => "POST/DELETE method required"], 405);

        $medId = intval($input['medicine_id'] ?? $_GET['id'] ?? 0);
        $email = $conn->real_escape_string(strtolower(trim($input['patient_email'] ?? $_GET['email'] ?? '')));

        if (!$medId) respond(["success" => false, "message" => "Medicine ID required"], 400);

        $conn->query("DELETE FROM medicines WHERE id = $medId AND patient_email = '$email'");

        respond(["success" => true, "message" => "Medicine deleted successfully"]);
        break;

    // --------------------------------------------------------
    //  ADD APPOINTMENT
    // --------------------------------------------------------
    case 'add_appointment':
        if ($method !== 'POST') respond(["success" => false, "message" => "POST method required"], 405);

        $email   = $conn->real_escape_string(strtolower(trim($input['patient_email'] ?? '')));
        $doctor  = $conn->real_escape_string(trim($input['doctor'] ?? ''));
        $special = $conn->real_escape_string(trim($input['specialization'] ?? ''));
        $date    = $conn->real_escape_string($input['date'] ?? '');
        $time    = $conn->real_escape_string($input['time'] ?? '');
        $hosp    = $conn->real_escape_string(trim($input['hospital'] ?? ''));
        $notes   = $conn->real_escape_string(trim($input['notes'] ?? ''));

        if (!$email || !$doctor || !$date || !$time) {
            respond(["success" => false, "message" => "Required fields missing"], 400);
        }

        $sql = "INSERT INTO appointments (patient_email, doctor_name, specialization, appointment_date, appointment_time, hospital, notes) VALUES ('$email', '$doctor', '$special', '$date', '$time', '$hosp', '$notes')";

        if ($conn->query($sql)) {
            respond([
                "success" => true,
                "message" => "Appointment scheduled successfully",
                "appointment_id" => $conn->insert_id
            ]);
        } else {
            respond(["success" => false, "message" => "Failed: " . $conn->error], 500);
        }
        break;

    // --------------------------------------------------------
    //  GET APPOINTMENTS
    // --------------------------------------------------------
    case 'get_appointments':
        $email = $conn->real_escape_string(strtolower(trim($_GET['email'] ?? '')));
        if (!$email) respond(["success" => false, "message" => "Email required"], 400);

        $result = $conn->query("SELECT * FROM appointments WHERE patient_email = '$email' ORDER BY appointment_date ASC, appointment_time ASC");
        $appointments = [];
        while ($row = $result->fetch_assoc()) {
            $appointments[] = [
                "id" => intval($row['id']),
                "doctor" => $row['doctor_name'],
                "specialization" => $row['specialization'],
                "date" => $row['appointment_date'],
                "time" => $row['appointment_time'],
                "hospital" => $row['hospital'],
                "notes" => $row['notes']
            ];
        }

        respond(["success" => true, "appointments" => $appointments]);
        break;

    // --------------------------------------------------------
    //  DELETE APPOINTMENT
    // --------------------------------------------------------
    case 'delete_appointment':
        if ($method !== 'POST' && $method !== 'DELETE') respond(["success" => false, "message" => "POST/DELETE method required"], 405);

        $apptId = intval($input['appointment_id'] ?? $_GET['id'] ?? 0);
        $email  = $conn->real_escape_string(strtolower(trim($input['patient_email'] ?? $_GET['email'] ?? '')));

        if (!$apptId) respond(["success" => false, "message" => "Appointment ID required"], 400);

        $conn->query("DELETE FROM appointments WHERE id = $apptId AND patient_email = '$email'");

        respond(["success" => true, "message" => "Appointment deleted"]);
        break;

    // --------------------------------------------------------
    //  GET PATIENT DATA (For Caretaker)
    // --------------------------------------------------------
    case 'get_patient_data':
        $patientEmail = $conn->real_escape_string(strtolower(trim($_GET['patient_email'] ?? '')));
        if (!$patientEmail) respond(["success" => false, "message" => "Patient email required"], 400);

        // Get patient info
        $patResult = $conn->query("SELECT * FROM patients WHERE email = '$patientEmail'");
        if ($patResult->num_rows === 0) {
            respond(["success" => false, "message" => "Patient not found. They must register first.", "patient" => null]);
        }

        $pat = $patResult->fetch_assoc();

        // Get medicines
        $medResult = $conn->query("SELECT * FROM medicines WHERE patient_email = '$patientEmail' ORDER BY created_at DESC");
        $medicines = [];
        while ($row = $medResult->fetch_assoc()) {
            $logResult = $conn->query("SELECT taken_at FROM dose_log WHERE medicine_id = {$row['id']} AND status = 'taken'");
            $takenDates = [];
            while ($logRow = $logResult->fetch_assoc()) {
                $takenDates[] = $logRow['taken_at'];
            }
            $medicines[] = [
                "id" => intval($row['id']),
                "course" => $row['course_name'],
                "name" => $row['medicine_name'],
                "date" => $row['start_date'],
                "time" => $row['dosage_time'],
                "duration" => intval($row['duration_days']),
                "frequency" => intval($row['frequency']),
                "image" => $row['image_data'],
                "notes" => $row['notes'],
                "status" => $row['status'],
                "takenCount" => intval($row['taken_count']),
                "missedCount" => intval($row['missed_count']),
                "takenDates" => $takenDates
            ];
        }

        // Get appointments
        $apptResult = $conn->query("SELECT * FROM appointments WHERE patient_email = '$patientEmail' ORDER BY appointment_date ASC");
        $appointments = [];
        while ($row = $apptResult->fetch_assoc()) {
            $appointments[] = [
                "id" => intval($row['id']),
                "doctor" => $row['doctor_name'],
                "specialization" => $row['specialization'],
                "date" => $row['appointment_date'],
                "time" => $row['appointment_time'],
                "hospital" => $row['hospital'],
                "notes" => $row['notes']
            ];
        }

        respond([
            "success" => true,
            "patient" => [
                "firstName" => $pat['first_name'],
                "lastName" => $pat['last_name'],
                "fullName" => $pat['first_name'] . ' ' . $pat['last_name'],
                "email" => $pat['email']
            ],
            "medicines" => $medicines,
            "appointments" => $appointments
        ]);
        break;

    // --------------------------------------------------------
    //  GET STATS (Dashboard summary)
    // --------------------------------------------------------
    case 'get_stats':
        $email = $conn->real_escape_string(strtolower(trim($_GET['email'] ?? '')));
        if (!$email) respond(["success" => false, "message" => "Email required"], 400);

        $result = $conn->query("SELECT 
            COUNT(*) as total_medicines,
            SUM(taken_count) as total_taken,
            SUM(missed_count) as total_missed,
            SUM(duration_days * frequency) as total_doses,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
            FROM medicines WHERE patient_email = '$email'");

        $stats = $result->fetch_assoc();

        $totalDoses = intval($stats['total_doses'] ?? 0);
        $taken = intval($stats['total_taken'] ?? 0);
        $missed = intval($stats['total_missed'] ?? 0);
        $remaining = max(0, $totalDoses - $taken - $missed);
        $adherence = $totalDoses > 0 ? round(($taken / $totalDoses) * 100) : 0;

        respond([
            "success" => true,
            "stats" => [
                "totalMedicines" => intval($stats['total_medicines'] ?? 0),
                "totalDoses" => $totalDoses,
                "completedDoses" => $taken,
                "missedDoses" => $missed,
                "remainingDoses" => $remaining,
                "adherencePercent" => $adherence,
                "activeCourses" => intval($stats['active_count'] ?? 0),
                "completedCourses" => intval($stats['completed_count'] ?? 0)
            ]
        ]);
        break;

    // --------------------------------------------------------
    //  GET DOSE LOG
    // --------------------------------------------------------
    case 'get_dose_log':
        $email = $conn->real_escape_string(strtolower(trim($_GET['email'] ?? '')));
        $medId = intval($_GET['medicine_id'] ?? 0);

        $where = "dl.patient_email = '$email'";
        if ($medId) $where .= " AND dl.medicine_id = $medId";

        $result = $conn->query("SELECT dl.*, m.medicine_name, m.course_name FROM dose_log dl JOIN medicines m ON dl.medicine_id = m.id WHERE $where ORDER BY dl.taken_at DESC LIMIT 100");

        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = [
                "id" => intval($row['id']),
                "medicineId" => intval($row['medicine_id']),
                "medicineName" => $row['medicine_name'],
                "courseName" => $row['course_name'],
                "takenAt" => $row['taken_at'],
                "status" => $row['status']
            ];
        }

        respond(["success" => true, "logs" => $logs]);
        break;

    // --------------------------------------------------------
    //  DATABASE STATUS / HEALTH CHECK
    // --------------------------------------------------------
    case 'status':
    case 'health':
        $tables = [];
        $result = $conn->query("SHOW TABLES");
        while ($row = $result->fetch_array()) {
            $tableName = $row[0];
            $countResult = $conn->query("SELECT COUNT(*) as cnt FROM $tableName");
            $count = $countResult->fetch_assoc()['cnt'];
            $tables[$tableName] = intval($count);
        }

        respond([
            "success" => true,
            "message" => "Medi-Reminder API is running",
            "database" => $DB_NAME,
            "server" => $DB_HOST,
            "tables" => $tables,
            "php_version" => phpversion(),
            "mysql_version" => $conn->server_info,
            "timestamp" => date('Y-m-d H:i:s')
        ]);
        break;

    // --------------------------------------------------------
    //  DEFAULT
    // --------------------------------------------------------
    default:
        respond([
            "success" => false,
            "message" => "Invalid action. Available actions: patient_register, patient_login, caretaker_register, add_medicine, get_medicines, take_dose, delete_medicine, add_appointment, get_appointments, delete_appointment, get_patient_data, get_stats, get_dose_log, status",
            "api" => "Medi-Reminder API v1.0",
            "usage" => "api.php?action=ACTION_NAME"
        ], 400);
        break;
}

$conn->close();
?>
