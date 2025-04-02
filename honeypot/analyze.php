<?php
// This would normally be password protected
$sqli_logs = file_exists('/var/log/honeypot/sqli_attempts.log') ? 
    file('/var/log/honeypot/sqli_attempts.log') : [];
$access_logs = file_exists('/var/log/honeypot/access.log') ? 
    file('/var/log/honeypot/access.log') : [];

$total_visits = count($access_logs);
$attack_attempts = count($sqli_logs);

// IP statistics
$ips = [];
foreach ($access_logs as $log) {
    $data = json_decode($log, true);
    $ip = $data['ip'] ?? 'unknown';
    $ips[$ip] = ($ips[$ip] ?? 0) + 1;
}
arsort($ips);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Honeypot Analytics</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Honeypot Analytics Dashboard</h1>
    <h2>Overview</h2>
    <p>Total visits: <?php echo $total_visits; ?></p>
    <p>Attack attempts detected: <?php echo $attack_attempts; ?></p>
    
    <h2>Top Visitor IPs</h2>
    <table>
        <tr><th>IP Address</th><th>Visit Count</th></tr>
        <?php 
        $count = 0;
        foreach ($ips as $ip => $visits) {
            echo "<tr><td>$ip</td><td>$visits</td></tr>";
            $count++;
            if ($count >= 10) break;
        }
        ?>
    </table>
    
    <h2>Recent SQL Injection Attempts</h2>
    <table>
        <tr><th>Time</th><th>IP</th><th>Payload</th></tr>
        <?php 
        $count = 0;
        foreach ($sqli_logs as $log) {
            $data = json_decode($log, true);
            echo "<tr><td>{$data['timestamp']}</td><td>{$data['ip']}</td><td>" . 
                 htmlspecialchars(json_encode($data['payload'])) . "</td></tr>";
            $count++;
            if ($count >= 10) break;
        }
        ?>
    </table>
</body>
</html>
