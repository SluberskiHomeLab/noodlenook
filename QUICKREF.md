# NoodleNook Quick Reference

## 🚀 Quick Start Commands

```bash
# Start the application
docker compose up -d

# Stop the application  
docker compose down

# View logs
docker compose logs -f

# Rebuild after code changes
docker compose up -d --build

# Access database
docker exec -it noodlenook-db psql -U noodlenook -d noodlenook
```

## 📊 Default Credentials

First user must register via the UI. To promote to admin:
```sql
UPDATE users SET role = 'admin' WHERE username = 'your-username';
```

## 🔑 User Roles

| Role   | Permissions                                    |
|--------|-----------------------------------------------|
| viewer | View all published pages, search              |
| editor | Create and edit pages + viewer permissions    |
| admin  | Delete pages + editor permissions             |

## 🛠️ Configuration Files

| File                    | Purpose                           |
|-------------------------|-----------------------------------|
| `backend/.env`          | Backend environment variables     |
| `docker-compose.yml`    | Service orchestration             |
| `backend/server.js`     | API server configuration          |
| `frontend/vite.config.js` | Frontend build configuration    |

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Pages
- `GET /api/pages` - List all pages
- `GET /api/pages/:slug` - Get single page
- `POST /api/pages` - Create page (editor+)
- `PUT /api/pages/:slug` - Update page (editor+)
- `DELETE /api/pages/:slug` - Delete page (admin only)

### Search
- `GET /api/search?q=query` - Search pages

## 🎨 UI Features

### Dark Mode
- Toggle: Click sun/moon icon in header
- Persists: Saved in localStorage
- CSS Variables: Auto-updates all colors

### Sidebar Position
- Options: Left, Right, Top
- Change: Settings icon → Sidebar Position
- Persists: Saved in localStorage

### Table of Contents
- Styles: Flat list, Alphabetically grouped
- Change: Toggle in sidebar header
- Persists: Saved in localStorage

## 📝 Editor Modes

### Markdown Mode
- Syntax highlighting (monospace font)
- Supports standard Markdown
- Real-time preview on view page

### Rich Text Mode
- Normal textarea editing
- HTML rendering on view page
- Good for simple content

## 🔍 Search Features

- Full-text search across titles and content
- Results ranked by relevance (ts_rank)
- Highlighting of matching terms
- No pagination (up to 50 results)

## 🗄️ Database Tables

| Table          | Purpose                        |
|----------------|--------------------------------|
| users          | User accounts and roles        |
| pages          | Wiki pages content             |
| page_revisions | Version history                |
| tags           | Tags for categorization        |
| page_tags      | Many-to-many page-tag relation |

## 📦 Dependencies

### Backend Key Packages
- express: ^4.18.2
- pg: ^8.11.3
- bcrypt: ^5.1.1
- jsonwebtoken: ^9.0.2
- helmet: ^7.1.0

### Frontend Key Packages
- react: ^18.2.0
- react-router-dom: ^6.20.1
- axios: ^1.12.0
- react-markdown: ^9.0.1
- lucide-react: ^0.294.0

## 🔒 Security Features

1. **Password Security**
   - bcrypt hashing (10 rounds)
   - No plain text storage

2. **API Security**
   - JWT authentication
   - Rate limiting (100 req/15min)
   - Helmet security headers
   - CORS protection

3. **Database Security**
   - Parameterized queries
   - Connection pooling
   - Environment variables

## 🐛 Troubleshooting

### Database won't start
```bash
# Check if port 5432 is in use
sudo lsof -i :5432

# Remove old containers and volumes
docker compose down -v
docker compose up -d
```

### Frontend can't reach backend
- Check both containers are running: `docker compose ps`
- Verify backend logs: `docker compose logs backend`
- Check network: `docker network ls`

### Can't login after registration
- Check backend logs for errors
- Verify database connection
- Try registering with different username

### Pages not displaying
- Check browser console for errors
- Verify API calls in Network tab
- Check backend logs

## 📈 Performance Tips

1. **Database**
   - FTS index is automatic
   - Consider adding indexes on frequently queried columns
   - Regular VACUUM for PostgreSQL

2. **Frontend**
   - Static files served by Nginx
   - Vite optimizes bundle size
   - Code splitting automatic

3. **Backend**
   - Connection pooling enabled
   - Rate limiting prevents overload
   - Async/await for all DB calls

## 🔄 Update Process

```bash
# Pull latest changes
git pull

# Rebuild containers
docker compose down
docker compose up -d --build

# Check health
docker compose ps
docker compose logs
```

## 📞 Support Resources

- **README.md** - User documentation
- **IMPLEMENTATION.md** - Technical details
- **ARCHITECTURE.md** - System design
- **SECURITY.md** - Security information
- **GitHub Issues** - Bug reports and features

## 🎯 Common Tasks

### Promote user to admin
```sql
docker exec -it noodlenook-db psql -U noodlenook -d noodlenook -c \
  "UPDATE users SET role = 'admin' WHERE username = 'username';"
```

### Backup database
```bash
docker exec noodlenook-db pg_dump -U noodlenook noodlenook > backup.sql
```

### Restore database
```bash
cat backup.sql | docker exec -i noodlenook-db psql -U noodlenook -d noodlenook
```

### View all users
```sql
docker exec -it noodlenook-db psql -U noodlenook -d noodlenook -c \
  "SELECT id, username, email, role FROM users;"
```

### Reset a user's password
```bash
# Must be done in the application (requires bcrypt hashing)
# Or manually with Node.js:
node -e "console.log(require('bcrypt').hashSync('newpassword', 10))"
# Then update in database
```

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-04  
**License:** GPL-3.0
