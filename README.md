# apache2-web-honeypot
Honeypot for Apache2 service

#### As a developer running a portfolio website, I’ve always been conscious of security. My site runs on Apache2, serving content over ports 80 and 443 with HTTPS and HSTS (HTTP Strict Transport Security) enforced for secure communication. But in today’s world, where bots, script kiddies, and sophisticated attackers roam the internet, I wanted to go a step further — not just protect my site, but also learn about the threats targeting it. That’s where the idea of setting up a honeypot came in.

### Step 1: Set up a separate virtual host
We’ll create a convincing but fake admin portal that looks vulnerable to SQL injection and other common web attacks. This will:

Attract attackers looking for easy targets
Log all interactions for analysis
Run safely alongside your actual portfolio website
Create a honeypot directory in `/var/www` and set the appropriate ownership and permissions to ensure controlled access.

```bash
sudo mkdir -p /var/www/honeypot
sudo chown -R $USER:$USER /var/www/honeypot
sudo chmod -R 755 /var/www/honeypot

# Create virtual host configuration
sudo nano /etc/apache2/sites-available/honeypot.conf
```
now configure the honeypot

```bash
# HTTP Honeypot (appears as an unsecured admin portal)
<VirtualHost *:8080>
    ServerName 192.168.29.8
    ServerAlias admin.portfolio.mihir.dev
    DocumentRoot /var/www/honeypot
    
    ErrorLog ${APACHE_LOG_DIR}/honeypot_error.log
    CustomLog ${APACHE_LOG_DIR}/honeypot_access.log combined
    
    <Directory /var/www/honeypot>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

# HTTPS Honeypot (for more sophisticated attackers)
<VirtualHost *:8443>
    ServerName 192.168.29.8
    ServerAlias admin.portfolio.mihir.dev
    DocumentRoot /var/www/honeypot
    
    ErrorLog ${APACHE_LOG_DIR}/honeypot_error.log
    CustomLog ${APACHE_LOG_DIR}/honeypot_access.log combined
    
    <Directory /var/www/honeypot>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/cert+1.pem
    SSLCertificateKeyFile /etc/ssl/private/cert-key.pem
</VirtualHost>
```
Enable these ports in Apache

```bash
sudo nano /etc/apache2/ports.conf
```
```bash
Listen 8080
Listen 8443
```
Enable the site and required modules
```bash
sudo a2ensite honeypot.conf
sudo a2enmod rewrite
sudo systemctl restart apache
```
### Step 2: Create a convincing fake admin portal
Let’s create files for our fake admin portal:
```bash
mkdir -p /var/www/honeypot/admin
touch /var/www/honeypot/index.php
touch /var/www/honeypot/admin/index.php
touch /var/www/honeypot/admin/login.php
```
For the main index.php:
```php
<?php
// Redirect to admin login
header("Location: /admin/login.php");
exit;
?>
```
For admin/login.php:

```php
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
```
The honeypot login page is designed to always fail login attempts, regardless of what credentials are entered. This is intentional — it logs the attempted credentials and techniques while never actually granting access.

### Step 3: Set up comprehensive logging
Create a log rotation configuration:

```bash
sudo nano /etc/logrotate.d/honeypot
```
Add:
```bash
/var/log/honeypot/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
}
```
### Step 4: Set up a log analyzer
Create a simple log analyzer script:
```bash
sudo nano /var/www/honeypot/analyze.php
```
Add:
```php
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
```
**Set up access to your analytics dashboard**
Password protect the analytics page:
```bash
sudo nano /var/www/honeypot/.htaccess
```
```bash
<Files "analyze.php">
    AuthType Basic
    AuthName "Restricted Area"
    AuthUserFile /etc/apache2/.htpasswd
    Require valid-user
</Files>
```
Create a password file:
```bash
sudo htpasswd -c /etc/apache2/.htpasswd youruser
```
Enable the site and required modules
```bash
sudo a2ensite honeypot.conf
sudo a2enmod rewrite
sudo systemctl restart apache2
```
Make sure your firewall allows these ports:
```bash
sudo ufw allow 8080/tcp
sudo ufw allow 8443/tcp
```
Verify Apache configuration
```bash
sudo apache2ctl configtest
```
Test your honeypot
Try accessing your honeypot in a browser:

http://192.x.x.x:8080
https://192.x.x.x:8443
### Step 5: Review logs to ensure everything is working
```bash
# Check if Apache started successfully
sudo systemctl status apache2

# Check Apache error logs for any issues
sudo tail -f /var/log/apache2/error.log

# Check honeypot access logs
sudo tail -f /var/log/apache2/honeypot_access.log

# Check honeypot-specific logs (once you get some traffic)
sudo tail -f /var/log/honeypot/access.log
sudo tail -f /var/log/honeypot/sqli_attempts.log
```
## Monitor and collect data:
Check the logs regularly to see if you’re catching any interesting attacks.

Create a simple script to check for attacks
```bash
sudo nano /etc/cron.daily/honeypot-alert
```
```bash
#!/bin/bash
ATTACKS=$(grep -c . /var/log/honeypot/sqli_attempts.log)
if [ $ATTACKS -gt 0 ]; then
    echo "Honeypot has detected $ATTACKS SQL injection attempts today." | mail -s "Honeypot Alert" walter@white.dev
fi
```
Make it executable:
```bash
sudo chmod +x /etc/cron.daily/honeypot-alert
```
#### Now that honeypot is set up, here’s what you should monitor and analyze:
1. Attack Patterns:
- Monitor the `/var/log/honeypot/access.log`
- log for all visitor activity Check `/var/log/honeypot/sqli_attempts.log`
- log for SQL injection attempts
- Look for patterns in IP addresses, attack times, and attack methods

2. Visitor Statistics:

- Track unique IP addresses accessing your honeypot
- Monitor geographic distribution of visitors (you can use GeoIP tools)
- Identify recurring visitors who might be conducting targeted attacks

3. Attack Techniques:

- Analyze the payloads attackers are using
- Look for emerging attack patterns or zero-day exploits
- Categorize attacks (SQL injection, XSS, credential stuffing, etc.)

4. Regular Log Reviews:

- Set a schedule to review logs (daily or weekly)
- Use analytics dashboard ( analyze.php ) to visualize trends
- Consider setting up automated alerts for unusual activity

5. System Health:

- Monitor server load to ensure the honeypot isn’t affecting your main site
- Check disk space to ensure logs aren’t filling up your drive
- Verify Apache is running properly with apache2 systemctl status

### You can enhance your monitoring with these commands:
```bash  
# Check for recent visitors
sudo tail -n 50 /var/log/apache2/honeypot_access.log

# See SQL injection attempts
sudo cat /var/log/honeypot/sqli_attempts.log | jq '.'

# Count unique IP addresses
sudo cat /var/log/apache2/honeypot_access.log | awk '{print $1}' | sort | uniq -c | sort -nr

# Watch for real-time attacks
sudo tail -f /var/log/honeypot/access.log
```
## How Attacker attacks the portfolio website
#### Start with reconnaissance
```bash
root@white:/var/www/portfolio# nmap -sC -sV 192.168.29.8
Starting Nmap 7.80 ( https://nmap.org ) at 2025-03-22 00:14 IST
Nmap scan report for mihir.dev (192.168.29.8)
Host is up (0.0000080s latency).
Not shown: 994 closed ports
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 8.9p1 Ubuntu 3ubuntu0.11 (Ubuntu Linux; protocol 2.0)
25/tcp   open  smtp     Postfix smtpd
|_smtp-commands: white.ts.net, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, SMTPUTF8, CHUNKING,
| ssl-cert: Subject: commonName=ubuntu
| Subject Alternative Name: DNS:ubuntu
| Not valid before: 2025-02-06T15:15:51
|_Not valid after:  2035-02-04T15:15:51
|_ssl-date: TLS randomness does not represent time
80/tcp   open  http     Apache httpd 2.4.52
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Did not follow redirect to https://192.168.29.8/
443/tcp  open  ssl/http Apache httpd 2.4.52
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: 403 Forbidden
| ssl-cert: Subject: commonName=ubuntu
| Subject Alternative Name: DNS:ubuntu
| Not valid before: 2025-02-06T15:15:51
|_Not valid after:  2035-02-04T15:15:51
| tls-alpn:
|_  http/1.1
8080/tcp open  http     Apache httpd 2.4.52 ((Ubuntu))
|_http-open-proxy: Proxy might be redirecting requests
|_http-server-header: Apache/2.4.52 (Ubuntu)
| http-title: Company Admin Portal
|_Requested resource was /admin/login.php
8443/tcp open  ssl/http Apache httpd 2.4.52 ((Ubuntu))
|_http-server-header: Apache/2.4.52 (Ubuntu)
| http-title: Company Admin Portal
|_Requested resource was /admin/login.php
| ssl-cert: Subject: organizationName=mkcert development certificate
| Subject Alternative Name: DNS:mihir.dev, DNS:portfolio.mihir.dev
| Not valid before: 2025-03-09T11:56:41
|_Not valid after:  2027-06-09T11:56:41
| tls-alpn:
|_  http/1.1
Service Info: Hosts:  white.tail.ts.net, 192.168.29.8, 127.0.1.1; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.24 seconds
```
The first thing he/she will do is to visit the admin panel

![image](https://github.com/user-attachments/assets/2d5d2510-d90e-4828-a32f-c6f2a5a9fe2a)

Since it is designed to always fail login attempts, regardless of the credentials entered, we can analyze attacker behavior and take actions such as blocking the IP address.

Now Let’s look at the data analyze dashboard

![image](https://github.com/user-attachments/assets/4f4f4665-2fa4-438e-9841-2aa4db394caa)

After authentication, you can visualize the visitors, SQL injection attempts.

![image](https://github.com/user-attachments/assets/40f29423-2ed6-45cf-b984-0f434e1553c3)

> Make sure you’ve PHP installed, if not then install it
```bash
 sudo apt update
 sudo apt install php libapache2-mod-php
 sudo a2enmod php
 sudo systemctl restart apache2
```
Check that your files have the correct permissions:

```bash
sudo chown -R www-data:www-data /var/www/honeypot
sudo chmod -R 755 /var/www/honeypot
```
Verify that the PHP module is loading correctly:
```bash
 php -v
 apachectl -M | grep PHP
```

> #### The next step is to forward these logs to the SIEM tool with proper indexing to enable advanced analysis.
