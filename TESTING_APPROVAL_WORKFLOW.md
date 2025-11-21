# Testing Guide: Approval Workflow for Page Creation

## Test Environment Setup

1. Start the application: `docker compose up -d`
2. Access frontend: http://localhost:3000
3. Create test accounts:
   - Admin user (first registered user becomes admin automatically)
   - Editor user (create via Admin dashboard or set role in database)
   - Viewer user (default role)

## Test Scenarios

### Scenario 1: Approval Workflow Disabled (Default Behavior)

**Objective:** Verify that editors can publish pages directly when approval workflow is disabled.

**Steps:**
1. Log in as admin
2. Navigate to Admin → Settings
3. Verify "Approval Workflow" is disabled (toggle off)
4. Log out and log in as editor
5. Click "New Page"
6. Create a page with title "Test Page 1"
7. Click "Create Page"

**Expected Results:**
- ✓ Page is created successfully
- ✓ No approval message is shown
- ✓ Page is immediately visible in the sidebar
- ✓ Page can be viewed by all authenticated users
- ✓ No entry in "Unpublished" section

---

### Scenario 2: Enable Approval Workflow

**Objective:** Verify that the approval workflow setting can be enabled.

**Steps:**
1. Log in as admin
2. Navigate to Admin → Settings
3. Toggle "Enable approval workflow for page edits" ON
4. Click "Save Settings"
5. Verify success message appears

**Expected Results:**
- ✓ Setting is saved successfully
- ✓ Success message appears
- ✓ Setting persists after page refresh

---

### Scenario 3: Editor Creates Page with Approval Enabled

**Objective:** Verify that editors cannot publish pages directly when approval is enabled.

**Steps:**
1. Ensure approval workflow is enabled (Scenario 2)
2. Log in as editor
3. Click "New Page"
4. Create a page:
   - Title: "Test Page Pending"
   - Content: "This page requires approval"
5. Click "Create Page"

**Expected Results:**
- ✓ Alert message appears: "Page created and submitted for approval..."
- ✓ Redirected to homepage
- ✓ Page does NOT appear in sidebar for viewers
- ✓ Page does NOT appear in "All Pages" list for viewers

---

### Scenario 4: Editor Views Own Unpublished Page

**Objective:** Verify that editors can see and edit their own unpublished pages.

**Steps:**
1. Log in as same editor from Scenario 3
2. Click "Unpublished" button in header
3. Verify "Test Page Pending" appears in list
4. Click eye icon to view the page
5. Verify page content is visible
6. Click "Edit" button
7. Modify content
8. Click "Update Page"

**Expected Results:**
- ✓ Unpublished page appears in list
- ✓ Editor can view their own unpublished page
- ✓ Edit button is visible
- ✓ Page can be edited
- ✓ Changes are saved to unpublished version

---

### Scenario 5: Admin Views All Unpublished Pages

**Objective:** Verify that admins can see all unpublished pages from all editors.

**Steps:**
1. Create second editor account
2. Log in as second editor
3. Create a page "Test Page 2" (should require approval)
4. Log out and log in as admin
5. Click "Unpublished" button in header

**Expected Results:**
- ✓ Admin sees unpublished pages from ALL editors
- ✓ List shows both "Test Page Pending" and "Test Page 2"
- ✓ Author names are displayed correctly
- ✓ Creation timestamps are shown

---

### Scenario 6: Admin Publishes Unpublished Page

**Objective:** Verify that admins can approve and publish pages.

**Steps:**
1. Log in as admin
2. Navigate to "Unpublished" section
3. Find "Test Page Pending"
4. Click eye icon to preview
5. Verify content looks correct
6. Go back to "Unpublished" list
7. Click green checkmark (Publish) button
8. Confirm the action
9. Wait for success message

**Expected Results:**
- ✓ Confirmation dialog appears
- ✓ Success message: "Page published successfully"
- ✓ Page is removed from "Unpublished" list
- ✓ Page now appears in sidebar for all users
- ✓ Page is accessible to all authenticated users
- ✓ Auto-redirect to the published page

---

### Scenario 7: Admin Rejects Unpublished Page

**Objective:** Verify that admins can reject and delete unpublished pages.

**Steps:**
1. Log in as admin
2. Navigate to "Unpublished" section
3. Find "Test Page 2"
4. Click red X (Reject) button
5. Enter rejection reason: "Content needs more detail"
6. Click "Reject and Delete"

**Expected Results:**
- ✓ Modal appears asking for reason
- ✓ Success message: "Page rejected and deleted"
- ✓ Page is removed from "Unpublished" list
- ✓ Page is permanently deleted (cannot be accessed)
- ✓ Page does not appear in sidebar

---

### Scenario 8: Editor Deletes Own Unpublished Page

**Objective:** Verify that editors can delete their own unpublished pages.

**Steps:**
1. Log in as editor
2. Create a new page "Test Delete" (should require approval)
3. Click "Unpublished" button
4. Find "Test Delete" in list
5. Click trash icon (Delete) button
6. Confirm the action

**Expected Results:**
- ✓ Confirmation dialog appears
- ✓ Success message: "Page deleted successfully"
- ✓ Page is removed from list
- ✓ Page is permanently deleted

---

### Scenario 9: Admin Creates Page (Bypass Approval)

**Objective:** Verify that admins can publish pages directly even with approval enabled.

**Steps:**
1. Ensure approval workflow is enabled
2. Log in as admin
3. Click "New Page"
4. Create a page "Admin Direct Publish"
5. Click "Create Page"

**Expected Results:**
- ✓ No approval message appears
- ✓ Page is published immediately
- ✓ Page appears in sidebar for all users
- ✓ Page does NOT appear in "Unpublished" section

---

### Scenario 10: Viewer Access Control

**Objective:** Verify that viewers cannot see unpublished pages.

**Steps:**
1. As editor, create unpublished page "Hidden Page"
2. Note the slug (e.g., "hidden-page")
3. Log out and log in as viewer
4. Try to access http://localhost:3000/page/hidden-page directly
5. Check if "Unpublished" button appears in header
6. Check sidebar for the page

**Expected Results:**
- ✓ "Unpublished" button does NOT appear in header
- ✓ Direct URL access returns "Page not found" error
- ✓ Page does NOT appear in sidebar
- ✓ Viewer cannot access unpublished content

---

### Scenario 11: Unauthenticated User Access

**Objective:** Verify that unauthenticated users cannot see unpublished pages.

**Steps:**
1. Ensure an unpublished page exists
2. Log out completely
3. Try to access the unpublished page URL directly
4. Try to find it in any public listings

**Expected Results:**
- ✓ Direct URL access returns "Page not found"
- ✓ Page does not appear in any public listings
- ✓ No access to unpublished content

---

### Scenario 12: Disable Approval Workflow

**Objective:** Verify that disabling approval workflow allows editors to publish again.

**Steps:**
1. Log in as admin
2. Navigate to Admin → Settings
3. Toggle "Enable approval workflow for page edits" OFF
4. Click "Save Settings"
5. Log out and log in as editor
6. Create a new page "Test Direct Publish"
7. Click "Create Page"

**Expected Results:**
- ✓ Setting is disabled successfully
- ✓ Page is published immediately
- ✓ No approval message appears
- ✓ Page appears in sidebar immediately
- ✓ Editor can publish pages directly again

---

### Scenario 13: Edge Cases

**Test 13.1: Empty Unpublished List**
- Navigate to "Unpublished" with no pending pages
- Expected: Message "No unpublished pages at this time"

**Test 13.2: Cancel Rejection**
- Click reject button, then click "Cancel" in modal
- Expected: Page remains unpublished, no changes made

**Test 13.3: Multiple Editors, Same Time**
- Two editors create pages simultaneously
- Expected: Both pages appear in admin's unpublished list

**Test 13.4: Page Slug Conflicts**
- Editor creates page with slug "test"
- Another editor tries same slug
- Expected: Error "Slug already exists" (existing behavior preserved)

---

## Regression Testing

Ensure existing functionality still works:

1. **Page Editing with Approval:** Edits to published pages still go through pending edits workflow
2. **Search Functionality:** Unpublished pages should NOT appear in search results
3. **Sidebar Display:** Only published pages appear in sidebar for non-authors
4. **Direct URL Access:** Proper permission checks are enforced
5. **Admin Dashboard:** User management still works correctly
6. **Settings Page:** Other settings are not affected

---

## Performance Testing

1. **Large Number of Unpublished Pages:**
   - Create 50+ unpublished pages
   - Verify list loads quickly
   - Verify pagination works (if implemented)

2. **Rapid Create/Approve Cycle:**
   - Create page as editor
   - Immediately approve as admin
   - Verify no race conditions

---

## Security Testing

1. **Authorization:**
   - Try to access `/api/pages/unpublished/list` as viewer (should fail)
   - Try to publish page as editor (should fail)
   - Try to reject page as editor who didn't create it (should fail)

2. **Authentication:**
   - Access unpublished endpoints without token (should fail)
   - Use expired token (should fail)

3. **SQL Injection:**
   - Try malicious input in page titles, slugs, rejection reasons
   - Expected: Parameterized queries prevent injection

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Test Summary

| Scenario | Pass | Fail | Notes |
|----------|------|------|-------|
| 1. Workflow Disabled | ☐ | ☐ | |
| 2. Enable Workflow | ☐ | ☐ | |
| 3. Editor Creates | ☐ | ☐ | |
| 4. Editor Views Own | ☐ | ☐ | |
| 5. Admin Views All | ☐ | ☐ | |
| 6. Admin Publishes | ☐ | ☐ | |
| 7. Admin Rejects | ☐ | ☐ | |
| 8. Editor Deletes Own | ☐ | ☐ | |
| 9. Admin Bypasses | ☐ | ☐ | |
| 10. Viewer Access | ☐ | ☐ | |
| 11. Unauth Access | ☐ | ☐ | |
| 12. Disable Workflow | ☐ | ☐ | |
| 13. Edge Cases | ☐ | ☐ | |

---

## Notes for Testers

- Test data can be reset by restarting the database container
- Use browser dev tools to inspect API calls
- Check browser console for errors
- Verify success/error messages are user-friendly
- Test keyboard navigation and accessibility
