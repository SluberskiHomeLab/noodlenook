# SMTP and Webhook Implementation - Testing Guide

This document provides a quick testing checklist for the newly implemented SMTP and Webhook functionality.

## Prerequisites

Before testing, ensure you have:
1. Admin access to NoodleNook
2. Set `SETTINGS_ENCRYPTION_KEY` in backend `.env` (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
3. Set `BASE_URL` in backend `.env` for production use
4. SMTP credentials OR a webhook endpoint URL

## Quick Test Checklist

### Part 1: Access Settings Page

1. ✅ Log in as an admin user
2. ✅ Navigate to Admin Dashboard (click "Admin" in header)
3. ✅ Click "System Settings" button (top right)
4. ✅ Verify the Settings page loads with two tabs: "SMTP Email" and "Webhooks"

### Part 2: Test SMTP Configuration

#### Configure SMTP

1. ✅ Click the "SMTP Email" tab
2. ✅ Fill in SMTP settings:
   - **For Gmail Testing:**
     - Host: `smtp.gmail.com`
     - Port: `587`
     - SSL/TLS: `No (STARTTLS)`
     - Username: Your Gmail address
     - Password: [App Password](https://myaccount.google.com/apppasswords)
     - From Email: Your Gmail address
   
   - **For Mailpit/Local Testing:**
     - Host: `localhost` or `mailpit`
     - Port: `1025`
     - SSL/TLS: `No`
     - Username: (leave blank)
     - Password: (leave blank)
     - From Email: `noreply@localhost`

3. ✅ Click "Test Connection" button
4. ✅ Verify success message: "SMTP connection successful!"
5. ✅ Click "Save SMTP Settings"
6. ✅ Verify success message: "SMTP settings saved successfully"

#### Send Test Invitation via SMTP

1. ✅ Navigate back to Admin Dashboard
2. ✅ Click "Invite User" button
3. ✅ Fill in the form:
   - Email: A test email address you can access
   - Role: Any role (e.g., "Viewer")
   - Method: **"Send via SMTP Email"**
4. ✅ Click "Create Invitation"
5. ✅ Check your email inbox for the invitation
6. ✅ Verify the email contains:
   - Subject: "You're invited to join NoodleNook"
   - Proper role mentioned
   - Clickable invitation link
   - Link expiration notice (7 days)

### Part 3: Test Webhook Configuration

#### Configure Webhook

**Option A: Using webhook.site (Easiest)**

1. ✅ Go to [webhook.site](https://webhook.site)
2. ✅ Copy your unique URL (e.g., `https://webhook.site/abc-123`)
3. ✅ In NoodleNook, click the "Webhooks" tab
4. ✅ Paste the URL into "Webhook URL"
5. ✅ Leave "Custom Headers" empty for now
6. ✅ Click "Test Webhook" button
7. ✅ Verify success message: "Webhook test successful!"
8. ✅ Check webhook.site - you should see the test payload
9. ✅ Click "Save Webhook Settings"

**Option B: Discord Webhook**

1. ✅ Create a Discord webhook in your server
2. ✅ Copy the webhook URL
3. ✅ Paste into "Webhook URL" field
4. ✅ Add custom headers (if needed):
   ```json
   {
     "Content-Type": "application/json"
   }
   ```
5. ✅ Note: Discord expects specific payload format, so test may not display properly but should succeed
6. ✅ Click "Save Webhook Settings"

#### Send Test Invitation via Webhook

1. ✅ Navigate back to Admin Dashboard
2. ✅ Click "Invite User" button
3. ✅ Fill in the form:
   - Email: A test email address
   - Role: Any role
   - Method: **"Send via Webhook"**
4. ✅ Click "Create Invitation"
5. ✅ Check your webhook endpoint (webhook.site or Discord channel)
6. ✅ Verify the payload contains:
   - `type: "invitation"`
   - `email`: The email you entered
   - `role`: The role you selected
   - `invitation_link`: Full URL with token
   - `timestamp`: ISO timestamp

### Part 4: Test Invitation Registration Flow

1. ✅ Copy an invitation link (from email or webhook)
2. ✅ Open the link in a new browser window (incognito/private mode)
3. ✅ Verify the Register page opens with:
   - Pre-filled email (disabled field)
   - "Accept Invitation" header
   - Role mentioned
4. ✅ Fill in username and password
5. ✅ Click "Create Account"
6. ✅ Verify successful registration and automatic login
7. ✅ Check Admin Dashboard - invitation should show "✓ Used" status

### Part 5: Verify Security Features

#### Test Webhook URL Validation

1. ✅ Try to test a private network URL (e.g., `http://192.168.1.1`)
2. ✅ Verify error: "Requests to private/local networks are not allowed"
3. ✅ Try an invalid protocol (e.g., `ftp://example.com`)
4. ✅ Verify error: "Only HTTP and HTTPS URLs are allowed"

#### Test Webhook Headers Validation

1. ✅ Enter invalid JSON in webhook headers: `{invalid json}`
2. ✅ Click "Save Webhook Settings"
3. ✅ Verify error: "Invalid JSON in webhook headers"

#### Verify Password Encryption

1. ✅ Save SMTP settings with a password
2. ✅ Reload the settings page
3. ✅ Click the eye icon to show password
4. ✅ Verify password is correctly retrieved (proves encryption/decryption works)

### Part 6: Test Error Handling

#### SMTP Errors

1. ✅ Enter incorrect SMTP credentials
2. ✅ Click "Test Connection"
3. ✅ Verify appropriate error message
4. ✅ Fix credentials and test again

#### Webhook Errors

1. ✅ Enter an invalid/unreachable webhook URL
2. ✅ Click "Test Webhook"
3. ✅ Verify error message displays

### Part 7: Visual Verification

#### Settings Page UI

- ✅ Tabs switch correctly between SMTP and Webhook
- ✅ All form fields are properly labeled
- ✅ Test buttons are disabled when required fields are empty
- ✅ Success/error messages display correctly
- ✅ Password visibility toggle works
- ✅ Dark mode support (if enabled)

#### Admin Dashboard

- ✅ "System Settings" button visible and styled correctly
- ✅ Invitation method dropdown includes all three options:
  - "Copy Link (Manual)"
  - "Send via SMTP Email"
  - "Send via Webhook"
- ✅ Help text updates based on selected method

## Expected Results Summary

✅ **SMTP Configuration:**
- Connection can be tested before saving
- Settings are saved and persisted
- Passwords are encrypted in database
- Emails are sent successfully with proper formatting

✅ **Webhook Configuration:**
- Connection can be tested before saving
- Settings are saved and persisted
- Webhooks are posted with correct payload
- URL validation prevents SSRF attacks

✅ **Invitation Flow:**
- Invitations can be sent via all three methods
- Email invitations arrive with proper content
- Webhook invitations post correct data
- Recipients can register using invitation links
- Used invitations are marked correctly

✅ **Security:**
- XSS protection in email HTML
- SSRF protection for webhooks
- Encrypted password storage
- Admin-only access to settings
- Proper error handling throughout

## Troubleshooting

### SMTP Not Working

- Check backend logs: `docker-compose logs backend`
- Verify SETTINGS_ENCRYPTION_KEY is set in `.env`
- Ensure SMTP credentials are correct
- Check firewall/network rules for outbound SMTP ports

### Webhook Not Working

- Verify webhook URL is accessible from server
- Check webhook endpoint logs
- Ensure BASE_URL is set correctly in `.env`
- Test with webhook.site for debugging

### Invitation Links Not Working

- Ensure BASE_URL is set in backend `.env`
- Verify token is included in URL
- Check invitation hasn't expired (7 days)
- Confirm invitation hasn't already been used

## Notes

- All settings require admin role access
- Passwords are stored encrypted with SETTINGS_ENCRYPTION_KEY
- BASE_URL should be set in production to prevent host header attacks
- Webhook test endpoint blocks private network addresses for security
- Invitations expire after 7 days by default

---

**Testing Complete!** 🎉

If all checkmarks are complete, the SMTP and Webhook implementation is working correctly.
