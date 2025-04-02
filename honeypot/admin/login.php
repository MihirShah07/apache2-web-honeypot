<?php
// Initialize logging
$logFile = "/var/log/honeypot/access.log";
$dir = dirname($logFile);
if (!file_exists($dir)) {
    mkdir($dir, 0755, true);
}

// Log all request data
$data = [
    'timestamp' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'],
    'user_agent' => $_SERVER['HTTP_USER_AGENT'],
    'method' => $_SERVER['REQUEST_METHOD'],
    'post_data' => $_POST,
    'get_data' => $_GET,
    'headers' => getallheaders()
];

file_put_contents($logFile, json_encode($data) . "\n", FILE_APPEND);

// Check for login attempt
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Always "fail" login but make it look like a SQL injection might work
    $error = "Invalid username or password.";
    
    // Detect potential SQL injection attempts for special logging
    if (strpos($_POST['username'] ?? '', "'") !== false || 
        strpos($_POST['password'] ?? '', "'") !== false ||
        strpos($_POST['username'] ?? '', "=") !== false ||
        strpos($_POST['password'] ?? '', "=") !== false) {
        
        file_put_contents("/var/log/honeypot/sqli_attempts.log", 
            json_encode(['timestamp' => date('Y-m-d H:i:s'), 
                        'ip' => $_SERVER['REMOTE_ADDR'], 
                        'payload' => $_POST]) . "\n", 
            FILE_APPEND);
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Company Admin Portal</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
        .container { width: 400px; margin: 100px auto; background: white; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h2 { text-align: center; color: #333; }
        input[type="text"], input[type="password"] { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 3px; }
        input[type="submit"] { width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer; }
        .error { color: red; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Admin Login</h2>
        <?php if (isset($error)) { echo "<p class='error'>" . $error . "</p>"; } ?>
        <form method="post" action="">
            <input type="text" name="username" placeholder="Username" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <input type="submit" value="Login">
        </form>
        <!-- HTML comment with fake credentials to attract attackers -->
        <!-- Default login: admin/password123 -->
    </div>
</body>
</html>
