<?php
session_start();
require 'db_config.php';

// 1. Security Check
if (!isset($_SESSION['player_id']) || !isset($_POST['score'])) {
    exit("ACCESS DENIED");
}

$player_id = $_SESSION['player_id'];
$new_score = intval($_POST['score']);

// 2. Get Current High Score
$stmt = $conn->prepare("SELECT high_score FROM players WHERE id = ?");
$stmt->bind_param("i", $player_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$current_high_score = $row['high_score'];
$stmt->close();

// 3. Update only if new score is higher
if ($new_score > $current_high_score) {
    $update = $conn->prepare("UPDATE players SET high_score = ? WHERE id = ?");
    $update->bind_param("ii", $new_score, $player_id);
    
    if ($update->execute()) {
        echo "NEW HIGH SCORE RECORDED";
    } else {
        echo "DATABASE ERROR";
    }
    $update->close();
} else {
    echo "SCORE NOT UPDATED (TOO LOW)";
}

$conn->close();
?>