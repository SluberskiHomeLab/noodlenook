# Approval Workflow for Page Creation

## Overview

When the approval workflow is enabled in system settings, editors cannot publish pages directly. Each page they create must be approved by an administrator before it becomes visible to users.

## How It Works

### For Editors

1. **Creating a Page:**
   - Navigate to "New Page"
   - Fill in the page details (title, content, etc.)
   - Click "Create Page"
   - If approval workflow is enabled, you'll see: "Page created and submitted for approval. An admin will review it before it is published."
   - The page is saved but not yet visible to other users

2. **Viewing Your Unpublished Pages:**
   - Click the "Unpublished" button in the header
   - You'll see a list of your pages awaiting approval
   - Click the eye icon to preview your unpublished page
   - You can delete your own unpublished pages if needed

3. **Editing Existing Pages:**
   - The approval workflow for edits works the same as before
   - Your changes go to "Pending Edits" for review

### For Administrators

1. **Reviewing Unpublished Pages:**
   - Click the "Unpublished" button in the header
   - See all pages awaiting approval from all editors
   - Click the eye icon to preview any page

2. **Approving a Page:**
   - Click the green checkmark (✓) button
   - Confirm the action
   - The page becomes published and visible to all users

3. **Rejecting a Page:**
   - Click the red X button
   - Optionally provide a reason for rejection
   - The page is deleted from the system

4. **Viewing Unpublished Pages:**
   - Admins can view any unpublished page by navigating directly to its URL
   - This allows for thorough review before approval

## Enabling the Approval Workflow

1. Log in as an administrator
2. Navigate to Admin → Settings
3. Find the "Approval Workflow" section
4. Toggle "Enable approval workflow for page edits"
5. Click "Save Settings"

**Note:** This setting affects both new page creation and page edits by editors.

## Technical Details

### Database

- Pages have an `is_published` field (boolean)
- Unpublished pages have `is_published = false`
- Published pages have `is_published = true`

### API Endpoints

- `GET /api/pages/unpublished/list` - List unpublished pages
- `POST /api/pages/:slug/publish` - Publish a page (admin only)
- `POST /api/pages/:slug/reject` - Reject and delete a page (admin only)

### Permissions

| Role | Create Published Pages | View Own Unpublished | View All Unpublished | Publish Pages |
|------|----------------------|---------------------|---------------------|---------------|
| Admin | ✓ Always | ✓ | ✓ | ✓ |
| Editor | Only when approval disabled | ✓ | ✗ | ✗ |
| Viewer | ✗ | ✗ | ✗ | ✗ |

## Best Practices

1. **Enable approval workflow** when you have multiple editors and want to maintain quality control
2. **Disable approval workflow** when you trust your editors to publish directly
3. **Regularly review** unpublished pages to avoid backlogs
4. **Provide feedback** when rejecting pages so editors know what to improve
5. **Use the preview** feature to thoroughly review content before approval

## Troubleshooting

**Q: I'm an editor and my page isn't showing up**
A: If approval workflow is enabled, your page is awaiting admin approval. Check the "Unpublished" section to see its status.

**Q: Can I edit an unpublished page?**
A: Yes, navigate to the page and click "Edit". Your changes will update the unpublished version.

**Q: What happens to pending edits when I create a new page?**
A: New page creation and page edits are tracked separately. New pages appear in "Unpublished", while edits to existing pages appear in "Pending Edits".

**Q: Can I disable approval for specific editors?**
A: Not currently. The approval workflow applies to all editors when enabled. To bypass this, promote trusted editors to admins.
