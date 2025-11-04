# Manual Testing Checklist for NoodleNook Features

This document provides a step-by-step testing checklist for the newly implemented features.

## Prerequisites

1. Start NoodleNook with Docker Compose:
   ```bash
   docker compose up -d
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Test 1: Button Styling

### Expected Behavior
All buttons should have uniform rounded corners (0.75rem border-radius) and consistent styling.

### Steps to Test

1. **Login Page**
   - [ ] Navigate to http://localhost:3000/login
   - [ ] Verify "Login" button has rounded corners
   - [ ] Verify button has hover effect

2. **Register Page**
   - [ ] Navigate to http://localhost:3000/register
   - [ ] Verify "Create Account" button has rounded corners
   - [ ] Verify consistent styling

3. **Sidebar**
   - [ ] Login to the application
   - [ ] Check "Dashboard" button (rounded corners)
   - [ ] Check "New Page" button (rounded corners)
   - [ ] Verify both buttons have consistent styling

4. **Page Editor**
   - [ ] Click "New Page"
   - [ ] Verify "Markdown" and "Rich Text" toggle buttons are rounded
   - [ ] Verify "Create Page" button is rounded
   - [ ] Verify "Cancel" button is rounded
   - [ ] Check all buttons have hover effects

5. **Page View**
   - [ ] Create a test page
   - [ ] View the page
   - [ ] Verify "Edit" button is rounded
   - [ ] Verify "Delete" button (admin only) is rounded

### ✅ Pass Criteria
All buttons throughout the application have consistent rounded styling with 0.75rem border-radius.

---

## Test 2: Public Pages Feature

### Expected Behavior
Pages can be marked as public. Public pages are visible to non-logged-in users. Private pages (default) are only visible to logged-in users.

### Steps to Test

1. **Create a Private Page (Default)**
   - [ ] Login as editor or admin
   - [ ] Create a new page (e.g., "Private Test Page")
   - [ ] Do NOT check the "Make this page public" checkbox
   - [ ] Save the page
   - [ ] Note the page URL

2. **Verify Private Page Access**
   - [ ] Logout from the application
   - [ ] Try to access the private page URL directly
   - [ ] Expected: Page not found / access denied
   - [ ] Try to see the page in the sidebar
   - [ ] Expected: Page not listed for non-logged-in users

3. **Create a Public Page**
   - [ ] Login again
   - [ ] Create a new page (e.g., "Public Test Page")
   - [ ] CHECK the "Make this page public" checkbox
   - [ ] Verify helper text: "By default, pages are only visible to logged-in users"
   - [ ] Save the page

4. **Verify Public Page Access**
   - [ ] Logout from the application
   - [ ] Access the public page URL directly
   - [ ] Expected: Page is visible and readable
   - [ ] Check the sidebar
   - [ ] Expected: Public page appears in the list

5. **Edit Public Status**
   - [ ] Login again
   - [ ] Edit the public page
   - [ ] Uncheck the "Make this page public" checkbox
   - [ ] Save the page
   - [ ] Logout and verify the page is no longer accessible

### ✅ Pass Criteria
- Private pages (default) are only visible to logged-in users
- Public pages are visible to everyone
- Public status can be toggled when editing pages

---

## Test 3: User Invitation System

### Expected Behavior
Admins can invite users via the Admin Dashboard. Invitations can be sent via link, SMTP, or webhook. Users register using invitation links and get assigned the specified role.

### Steps to Test

1. **Access Admin Dashboard**
   - [ ] Login as admin (first registered user)
   - [ ] Navigate to http://localhost:3000/admin
   - [ ] Verify "User Invitations" section is visible

2. **Create an Invitation**
   - [ ] Click "Invite User" button
   - [ ] Fill in email: test@example.com
   - [ ] Select role: "Editor"
   - [ ] Select method: "Copy Link (Manual)"
   - [ ] Click "Create Invitation"
   - [ ] Expected: Success message and invitation link copied to clipboard

3. **View Invitation List**
   - [ ] Verify the invitation appears in the table
   - [ ] Check columns: Email, Role, Status (Pending), Created, Expires
   - [ ] Verify "Copy" and "Revoke" buttons are present

4. **Use Invitation Link**
   - [ ] Logout from admin account
   - [ ] Paste the invitation link in browser
   - [ ] Expected: Register page opens with pre-filled email
   - [ ] Notice header says "Accept Invitation" and role is mentioned
   - [ ] Email field should be disabled
   - [ ] Fill in username and password
   - [ ] Submit registration

5. **Verify Invited User**
   - [ ] Expected: Successful registration and automatic login
   - [ ] Login to admin account
   - [ ] Go to Admin Dashboard
   - [ ] Check Users table: new user should have "Editor" role
   - [ ] Check Invitations table: status should be "✓ Used"

6. **Test Copy Link Function**
   - [ ] Create another invitation
   - [ ] Click the "Copy" button (icon) in the Actions column
   - [ ] Expected: Success message "Invitation link copied to clipboard!"
   - [ ] Paste to verify the link is correct

7. **Test Revoke Invitation**
   - [ ] Create a new invitation
   - [ ] Click "Revoke" button
   - [ ] Confirm the action
   - [ ] Expected: Invitation removed from the list
   - [ ] Try to use the revoked invitation link
   - [ ] Expected: "Invalid or expired invitation" error

8. **Test Expired Invitations**
   - [ ] In the database, update an invitation's expires_at to yesterday
   - [ ] Refresh Admin Dashboard
   - [ ] Expected: Status shows "Expired" in red
   - [ ] Copy button should not be visible for expired invitations

9. **Test Duplicate Email Prevention**
   - [ ] Try to invite an email that already has an active invitation
   - [ ] Expected: Error message "An active invitation for this email already exists"
   - [ ] Try to invite an email of an existing user
   - [ ] Expected: Error message "User with this email already exists"

### ✅ Pass Criteria
- Admins can create invitations with specific roles
- Invitation links can be copied and used for registration
- Users are assigned the correct role upon registration
- Invitations can be revoked
- Expired invitations cannot be used
- Duplicate prevention works correctly

---

## Test 4: Reverse Proxy Documentation

### Expected Behavior
Comprehensive documentation exists for setting up reverse proxies.

### Steps to Test

1. **Check Documentation Exists**
   - [ ] Verify REVERSE_PROXY.md exists in the root directory
   - [ ] Open the file and verify it contains documentation

2. **Verify Content Coverage**
   - [ ] Nginx Reverse Proxy Manager section exists
   - [ ] Nginx Reverse Proxy section exists
   - [ ] Traefik section exists
   - [ ] Caddy section exists

3. **Check Documentation Quality**
   - [ ] Each section has clear prerequisites
   - [ ] Configuration examples are provided
   - [ ] Docker Compose examples are included
   - [ ] Security best practices are mentioned
   - [ ] Troubleshooting section exists

4. **Verify README Link**
   - [ ] Open README.md
   - [ ] Check for reference to REVERSE_PROXY.md
   - [ ] Click the link (if viewing in GitHub/web)
   - [ ] Verify it navigates correctly

### ✅ Pass Criteria
- Documentation is comprehensive and well-structured
- All four reverse proxy types are covered
- Configuration examples are clear and complete

---

## Test 5: Backward Compatibility

### Expected Behavior
All existing features continue to work as before.

### Steps to Test

1. **Existing User Accounts**
   - [ ] Existing users can still login
   - [ ] User roles are preserved
   - [ ] Admin functionality works

2. **Page Management**
   - [ ] Existing pages are still accessible
   - [ ] Can create new pages without specifying public status
   - [ ] Can edit existing pages
   - [ ] Can delete pages (admin only)

3. **Search Functionality**
   - [ ] Search still works
   - [ ] Results are relevant

4. **Dark Mode**
   - [ ] Dark mode toggle still works
   - [ ] Theme persists after refresh

5. **Sidebar Options**
   - [ ] Sidebar position can be changed
   - [ ] TOC style toggle works
   - [ ] Page sorting works

### ✅ Pass Criteria
All existing features work without issues.

---

## Test 6: Security Validation

### Expected Behavior
Security measures are properly implemented.

### Steps to Test

1. **Invitation Token Security**
   - [ ] Create an invitation
   - [ ] Inspect the token in the URL
   - [ ] Verify it's a long random string (not predictable)

2. **Role-Based Access Control**
   - [ ] Login as viewer
   - [ ] Try to access /admin
   - [ ] Expected: Redirect to homepage
   - [ ] Try to create a page
   - [ ] Expected: No "New Page" button visible

3. **Public Pages Security**
   - [ ] Logout
   - [ ] Try to access private page API endpoint directly
   - [ ] Expected: 404 or access denied
   - [ ] Access public page API endpoint
   - [ ] Expected: Page data returned

4. **Invitation Expiration**
   - [ ] Wait 7 days or manually expire an invitation
   - [ ] Try to use expired invitation
   - [ ] Expected: Error message

### ✅ Pass Criteria
- No security vulnerabilities
- Access controls work correctly
- Token security is strong

---

## Test 7: Error Handling

### Expected Behavior
The application handles errors gracefully.

### Steps to Test

1. **Invalid Invitation Token**
   - [ ] Navigate to /register?token=invalid
   - [ ] Expected: Error message "Invalid or expired invitation"

2. **Email Mismatch During Registration**
   - [ ] Use invitation link but try different email
   - [ ] Expected: Error "Email does not match invitation"

3. **Database Connection Issues**
   - [ ] Stop PostgreSQL container
   - [ ] Try to load pages
   - [ ] Expected: Error message (not crash)
   - [ ] Restart PostgreSQL
   - [ ] Verify application recovers

### ✅ Pass Criteria
All errors are handled gracefully with appropriate user messages.

---

## Summary Checklist

- [ ] All button styling is consistent and rounded
- [ ] Public pages feature works correctly
- [ ] User invitation system is fully functional
- [ ] Reverse proxy documentation is comprehensive
- [ ] Backward compatibility is maintained
- [ ] Security measures are in place
- [ ] Error handling is proper

---

## Automated Testing Commands

```bash
# Build frontend
cd frontend && npm run build

# Validate backend syntax
cd backend
node -c server.js
node -c routes/invitations.js
node -c routes/auth.js
node -c routes/pages.js

# Run security scan
# (Use codeql_checker tool)

# Check for vulnerabilities
cd frontend && npm audit
cd backend && npm audit
```

---

## Notes

- This checklist assumes a clean installation of NoodleNook
- Some tests require admin privileges
- Database modifications are for testing only - don't do in production
- Always test in a development environment first

---

**Last Updated:** 2024
**Version:** 1.0
