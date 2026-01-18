<?php
session_start();
require 'db_config.php';

if (isset($_POST['login_btn'])) {
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $password = $_POST['password'];

    $sql = "SELECT * FROM players WHERE email = '$email'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        // Check if the typed password matches the hashed password in DB
        if (password_verify($password, $user['password_hash'])) {
            $_SESSION['player_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            header("Location: dashboard.php"); // Path to your game/home
        } else {
            header("Location: index.php?error=1");
        }
    } else {
        header("Location: index.php?error=1");
    }
}
?>