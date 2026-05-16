<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - MV Oxygen Trading</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            color: #1E88E5;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .otp-code {
            background-color: #f8f9fa;
            border: 2px dashed #1E88E5;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #1E88E5;
            margin: 20px 0;
            border-radius: 5px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #1E88E5;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MV Oxygen Trading</div>
            <h1>Email Verification</h1>
        </div>

        <p>Hello {{ $user->name ?? 'Customer' }},</p>

        <p>Thank you for signing up with MV Oxygen Trading! To complete your registration and verify your email address, please use the following One-Time Password (OTP) code:</p>

        <div class="otp-code">{{ $otp }}</div>

        <p><strong>This code will expire in 10 minutes.</strong></p>

        <p>If you didn't request this verification, please ignore this email.</p>

        <p>For your security, please do not share this code with anyone.</p>

        <div class="footer">
            <p>Thank you for choosing MV Oxygen Trading!</p>
            <p><small>This is an automated message. Please do not reply to this email.</small></p>
        </div>
    </div>
</body>
</html>
