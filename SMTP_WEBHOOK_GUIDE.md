# SMTP and Webhook Configuration Guide

This guide explains how to configure SMTP email and Webhook integrations in NoodleNook for sending user invitations.

## Table of Contents

- [Overview](#overview)
- [SMTP Configuration](#smtp-configuration)
  - [Gmail Setup](#gmail-setup)
  - [SendGrid Setup](#sendgrid-setup)
  - [Mailgun Setup](#mailgun-setup)
  - [Generic SMTP Setup](#generic-smtp-setup)
- [Webhook Configuration](#webhook-configuration)
  - [Discord Webhook](#discord-webhook)
  - [Slack Webhook](#slack-webhook)
  - [Custom Webhook](#custom-webhook)
- [Testing Your Configuration](#testing-your-configuration)
- [Troubleshooting](#troubleshooting)

## Overview

NoodleNook supports three methods for sending user invitations:

1. **Manual Link** - Copy the invitation link and send it manually
2. **SMTP Email** - Automatically send invitation emails via SMTP
3. **Webhook** - Send notifications to external services via HTTP POST

Admin users can configure these methods through the System Settings page.

## SMTP Configuration

### Accessing SMTP Settings

1. Log in as an admin user
2. Navigate to **Admin Dashboard** (click "Admin" in the header)
3. Click **"System Settings"** button in the top right
4. Select the **"SMTP Email"** tab

### Gmail Setup

**Note:** Gmail requires an App Password for third-party applications when 2FA is enabled.

1. **Enable 2-Step Verification** in your Google Account
2. **Generate an App Password:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Under "2-Step Verification", find "App passwords"
   - Generate a new app password for "Mail"
3. **Configure SMTP Settings:**
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   Use SSL/TLS: No (STARTTLS)
   SMTP Username: your-email@gmail.com
   SMTP Password: your-app-password (16 characters)
   From Email Address: your-email@gmail.com
   ```

### SendGrid Setup

SendGrid is a popular email service provider with a free tier.

1. **Sign up** for a [SendGrid account](https://sendgrid.com/)
2. **Create an API Key:**
   - Go to Settings → API Keys
   - Create a new API key with "Mail Send" permissions
3. **Configure SMTP Settings:**
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   Use SSL/TLS: No (STARTTLS)
   SMTP Username: apikey
   SMTP Password: YOUR_SENDGRID_API_KEY
   From Email Address: noreply@yourdomain.com
   ```

### Mailgun Setup

Mailgun offers a free tier with 5,000 emails per month.

1. **Sign up** for a [Mailgun account](https://www.mailgun.com/)
2. **Verify your domain** or use Mailgun's sandbox domain
3. **Get SMTP credentials:**
   - Go to Sending → Domain Settings → SMTP credentials
4. **Configure SMTP Settings:**
   ```
   SMTP Host: smtp.mailgun.org
   SMTP Port: 587
   Use SSL/TLS: No (STARTTLS)
   SMTP Username: postmaster@your-domain.mailgun.org
   SMTP Password: your-mailgun-password
   From Email Address: noreply@your-domain.com
   ```

### Generic SMTP Setup

For any other SMTP provider:

1. **Get SMTP credentials** from your email provider
2. **Common SMTP Ports:**
   - `587` - TLS/STARTTLS (most common)
   - `465` - SSL (older, but still used)
   - `25` - Plain text (not recommended)
3. **Configure SMTP Settings** in the System Settings page
4. **Test the connection** using the "Test Connection" button

### Security Notes

- SMTP passwords are encrypted in the database
- Use App Passwords when available (Gmail, Outlook)
- Enable TLS/SSL when possible
- Never commit SMTP credentials to version control

## Webhook Configuration

### Accessing Webhook Settings

1. Log in as an admin user
2. Navigate to **Admin Dashboard** → **System Settings**
3. Select the **"Webhooks"** tab

### Discord Webhook

Discord allows you to post messages to channels via webhooks.

1. **Create a Discord Webhook:**
   - Open Discord and go to Server Settings → Integrations
   - Click "Create Webhook"
   - Copy the webhook URL
2. **Configure Webhook Settings:**
   ```
   Webhook URL: https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
   Custom Headers: {} (leave empty or use default)
   ```
3. **Note:** Discord expects a specific payload format. You may need to create a middleware service to transform NoodleNook's webhook payload into Discord's expected format.

### Slack Webhook

Slack provides incoming webhooks for posting messages.

1. **Create a Slack App:**
   - Go to [Slack API](https://api.slack.com/apps)
   - Create a new app
   - Enable "Incoming Webhooks"
   - Add a webhook to your workspace
2. **Configure Webhook Settings:**
   ```
   Webhook URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   Custom Headers: 
   {
     "Content-Type": "application/json"
   }
   ```

### Custom Webhook

You can create your own webhook endpoint to receive invitation notifications.

**Webhook Payload Format:**

When an invitation is created, NoodleNook sends a POST request with this JSON payload:

```json
{
  "type": "invitation",
  "email": "user@example.com",
  "role": "editor",
  "invitation_link": "https://your-noodlenook.com/register?token=abc123...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example Webhook Handler (Node.js/Express):**

```javascript
app.post('/webhooks/noodlenook', (req, res) => {
  const { type, email, role, invitation_link } = req.body;
  
  if (type === 'invitation') {
    // Process the invitation
    console.log(`New invitation for ${email} as ${role}`);
    console.log(`Link: ${invitation_link}`);
    
    // Send email, create ticket, log to database, etc.
    // ...
    
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ error: 'Unknown webhook type' });
  }
});
```

**Configure Webhook Settings:**

```
Webhook URL: https://your-api.com/webhooks/noodlenook
Custom Headers:
{
  "Authorization": "Bearer your-secret-token",
  "Content-Type": "application/json"
}
```

### Webhook Security

- Use HTTPS for webhook URLs
- Implement authentication via custom headers
- Validate incoming webhook payloads
- Consider using webhook signing for additional security

## Testing Your Configuration

### Testing SMTP

1. Configure your SMTP settings in the System Settings page
2. Click **"Test Connection"** button
3. If successful, you'll see: "SMTP connection successful! Your email configuration is working."
4. If failed, check the error message and verify your credentials

### Testing Webhooks

1. Configure your webhook URL and headers
2. Click **"Test Webhook"** button
3. NoodleNook will send a test payload:
   ```json
   {
     "test": true,
     "message": "This is a test webhook from NoodleNook",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```
4. Check your webhook endpoint logs to verify receipt

### Sending a Test Invitation

After configuration, test the full flow:

1. Go to **Admin Dashboard**
2. Click **"Invite User"**
3. Enter a test email address
4. Select the role
5. Choose your configured method (SMTP or Webhook)
6. Click **"Create Invitation"**
7. Check if the email was sent or webhook was triggered

## Troubleshooting

### SMTP Issues

**Problem: "SMTP connection failed"**
- Verify host and port are correct
- Check if your SMTP provider requires SSL/TLS
- Ensure firewall allows outbound connections on SMTP port
- Verify username and password are correct

**Problem: "Authentication failed"**
- Use App Passwords for Gmail/Outlook
- Check if 2FA is enabled (requires app password)
- Verify username format (some providers use email, others use username only)

**Problem: "Connection timeout"**
- Check network connectivity
- Verify firewall rules
- Try different SMTP ports (587, 465, 25)

**Problem: Emails not received**
- Check spam/junk folder
- Verify "From" email address is valid
- Check email provider's sending limits
- Review SMTP provider logs

### Webhook Issues

**Problem: "Webhook test failed"**
- Verify URL is accessible from the server
- Check if webhook endpoint is running
- Verify SSL certificate is valid
- Test URL manually with curl or Postman

**Problem: "Connection refused"**
- Webhook endpoint may be down
- Check firewall rules
- Verify the port is open

**Problem: "401 Unauthorized"**
- Check authentication headers
- Verify API tokens/keys are correct
- Ensure headers are valid JSON

**Problem: Webhook received but no action taken**
- Check webhook endpoint logs
- Verify payload parsing
- Ensure endpoint responds with 2xx status code

### General Tips

1. **Enable Debug Logging**: Check backend console for detailed error messages
2. **Test with Public Services**: Use services like [webhook.site](https://webhook.site) to test webhooks
3. **Check Environment Variables**: Ensure `BASE_URL` is set correctly in backend `.env`
4. **Review Docker Logs**: If running in Docker, check container logs:
   ```bash
   docker-compose logs backend
   ```

## Environment Variables

Add these to your backend `.env` file for enhanced security:

```env
# Optional: Encryption key for settings (auto-generated if not provided)
SETTINGS_ENCRYPTION_KEY=your-64-character-hex-string

# Optional: Base URL for invitation links
BASE_URL=https://your-noodlenook-domain.com
```

Generate a secure encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Best Practices

1. **Use Environment Variables**: Don't hardcode credentials
2. **Enable Encryption**: Sensitive settings are automatically encrypted
3. **Test Regularly**: Verify your configuration after changes
4. **Monitor Logs**: Check for delivery failures
5. **Backup Settings**: Export settings before major changes
6. **Use Rate Limiting**: Prevent abuse of invitation system
7. **Implement Retry Logic**: For webhook failures in production

## Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [SendGrid SMTP Documentation](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Mailgun SMTP Documentation](https://documentation.mailgun.com/en/latest/user_manual.html#smtp)
- [Discord Webhooks Guide](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)

## Support

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/SluberskiHomeLab/noodlenook/issues)
2. Review backend logs for detailed error messages
3. Open a new issue with:
   - Error message
   - Configuration details (without credentials)
   - Steps to reproduce

---

**Last Updated:** November 2024
**Version:** 1.0
