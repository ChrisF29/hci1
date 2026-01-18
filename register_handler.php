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
        header("Location: register.php?error=exists");
        exit();
    } else {
        // 2. Hash Password (NEVER store plain text!)
        $hashed_password = password_hash($pass, PASSWORD_DEFAULT);

        // 3. Insert new player
        $stmt = $conn->prepare("INSERT INTO players (username, email, password_hash) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $user, $email, $hashed_password);

        if ($stmt->execute()) {
            // Success! Send to login page
            header("Location: index.php?success=registered");
        } else {
            header("Location: register.php?error=stmt");
        }
    }
    $stmt->close();
    $conn->close();
}
?>