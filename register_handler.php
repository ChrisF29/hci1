<?php
require 'db_config.php';

if (isset($_POST['register_btn'])) {
    $user = $_POST['username'];
    $email = $_POST['email'];
    $pass = $_POST['password'];

    // 1. Check if Username or Email already exists
    $checkQuery = $conn->prepare("SELECT id FROM players WHERE username = ? OR email = ?");
    $checkQuery->bind_param("ss", $user, $email);
    $checkQuery->execute();
    $result = $checkQuery->get_result();

    if ($result->num_rows > 0) {
        $checkQuery->close(); // Close this before redirecting
        header("Location: register.php?error=exists");
        exit();
    } 
    $checkQuery->close(); // Always close your statements

    // 2. Hash Password
    $hashed_password = password_hash($pass, PASSWORD_DEFAULT);

    // 3. Insert new player
    $stmt = $conn->prepare("INSERT INTO players (username, email, password_hash) VALUES (?, ?, ?)");
    
    if ($stmt) {
        $stmt->bind_param("sss", $user, $email, $hashed_password);
        
        if ($stmt->execute()) {
            $stmt->close();
            $conn->close();
            // Using success=registered to match the check in index.php
            header("Location: index.php?success=registered");
            exit();
        } else {
            // Log actual error for debugging (Remove in production)
            // error_log($stmt->error); 
            header("Location: register.php?error=stmt");
            exit();
        }
    } else {
        header("Location: register.php?error=stmt");
        exit();
    }
}
?>