# NoodleNook Wiki & Knowledge Base

A modern, feature-rich Wiki and Knowledge Base application built with React, Node.js, Express, and PostgreSQL. Designed to run seamlessly in Docker with a clean, intuitive interface and powerful features.

## ✨ Features

### Core Functionality
- **📝 Dual Editor Modes**: Switch between Markdown and Rich Text editing
- **🔍 Powerful Search**: Full-text search across all wiki pages with PostgreSQL FTS
- **👥 User Authentication**: Secure JWT-based authentication with role-based access control
- **📚 Page Management**: Create, edit, and delete wiki pages with version history
- **🎨 Modern UI**: Clean, bright design with dark mode support

### Design Features
- **🌓 Dark Mode**: Toggle between light and dark themes
- **📐 Flexible Layout**: Choose between left sidebar, right sidebar, or top bar navigation
- **📑 Table of Contents**: Multiple display options (flat list or grouped by letter)
- **🔎 Quick Search**: Search bar accessible from the top navigation
- **📱 Responsive**: Works great on desktop, tablet, and mobile devices

### User Roles
- **Viewer**: Can read all published pages
- **Editor**: Can create and edit pages
- **Admin**: Full access including page deletion

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed on your system

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SluberskiHomeLab/noodlenook.git
   cd noodlenook
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

4. **Create your first account**
   - Navigate to http://localhost:3000
   - Click "Register" in the top right
   - Create an account (first user will automatically be an admin)

### Stopping the Application
```bash
docker-compose down
```

### Rebuilding After Changes
```bash
docker-compose up -d --build
```

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Port**: 3001
- **Database**: PostgreSQL 15
- **Authentication**: JWT tokens
- **API Endpoints**:
  - `/api/auth/*` - Authentication (register, login, me)
  - `/api/pages/*` - Page management (CRUD operations)
  - `/api/search` - Full-text search

### Frontend (React/Vite)
- **Port**: 3000
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Markdown**: React Markdown

### Database (PostgreSQL)
- **Port**: 5432
- **Schema**:
  - `users` - User accounts with roles
  - `pages` - Wiki pages with content
  - `page_revisions` - Version history
  - `tags` - Page tags
  - `page_tags` - Many-to-many relationship

## 📖 Usage Guide

### Creating Your First Page

1. **Register/Login** as a user with editor or admin role
2. Click **"New Page"** in the sidebar or dashboard
3. Enter a title (slug is auto-generated)
4. Choose between **Markdown** or **Rich Text** mode
5. Write your content
6. Click **"Create Page"** to publish

### Editing a Page

1. Navigate to any page
2. Click the **"Edit"** button (only visible to editors/admins)
3. Make your changes
4. Click **"Update Page"** to save

### Searching

1. Use the search bar in the top navigation
2. Enter your search query
3. View ranked results based on relevance
4. Click any result to view the full page

### Customizing the Interface

- **Dark Mode**: Click the sun/moon icon in the header
- **Sidebar Position**: Click the settings icon and choose left, right, or top
- **Table of Contents**: Toggle between flat list and alphabetical grouping in the sidebar

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- Rate limiting on API endpoints
- Helmet.js security headers
- CORS protection
- SQL injection prevention with parameterized queries

## 🔧 Configuration

### Environment Variables

Backend (`.env` file in `backend/` directory):
```env
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
BASE_URL=https://your-domain.com
DB_HOST=postgres
DB_PORT=5432
DB_NAME=noodlenook
DB_USER=noodlenook
DB_PASSWORD=noodlenook123
SETTINGS_ENCRYPTION_KEY=generate-with-node-crypto
```

**Important Security Notes:**
- `BASE_URL` is **required in production** to prevent host header injection attacks on invitation links
- `SETTINGS_ENCRYPTION_KEY` is **required** for encrypted storage of SMTP passwords. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `JWT_SECRET` should be changed to a strong random value in production

### Running Behind a Reverse Proxy

For production deployments, it's recommended to run NoodleNook behind a reverse proxy. See [REVERSE_PROXY.md](REVERSE_PROXY.md) for detailed guides on:
- Nginx Reverse Proxy Manager
- Nginx Reverse Proxy
- Traefik
- Caddy

### SMTP and Webhook Configuration

NoodleNook supports automated user invitations via SMTP email and webhooks. See [SMTP_WEBHOOK_GUIDE.md](SMTP_WEBHOOK_GUIDE.md) for detailed setup instructions:
- SMTP configuration (Gmail, SendGrid, Mailgun, etc.)
- Webhook integration (Discord, Slack, custom endpoints)
- Testing and troubleshooting

Configure these integrations through the Admin Dashboard → System Settings.

### Managing User Roles

User roles can be managed through the Admin Dashboard:
1. Log in as an admin user
2. Click the "Admin" button in the top navigation
3. Use the dropdown menus to change user roles

**Note**: The first registered user automatically receives admin privileges. Additional admins can be created by existing admins through the Admin Dashboard.

## 🛠️ Development

### Running Locally (Without Docker)

#### Backend
```bash
cd backend
npm install
# Create .env file from .env.example
cp .env.example .env
# Edit .env and set DB_HOST=localhost
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Database
```bash
# Install PostgreSQL locally or use Docker
docker run -d \
  --name noodlenook-postgres \
  -e POSTGRES_DB=noodlenook \
  -e POSTGRES_USER=noodlenook \
  -e POSTGRES_PASSWORD=noodlenook123 \
  -p 5432:5432 \
  postgres:15-alpine
```

## 📦 Tech Stack

### Frontend
- React 18
- React Router v6
- Vite (Build tool)
- Axios (HTTP client)
- React Markdown
- Lucide React (Icons)

### Backend
- Node.js
- Express
- PostgreSQL
- bcrypt (Password hashing)
- jsonwebtoken (JWT)
- Helmet (Security)
- CORS

### DevOps
- Docker
- Docker Compose
- Nginx (Frontend reverse proxy)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by popular wiki platforms like MediaWiki, Confluence, and Notion
- Icons by Lucide

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**NoodleNook** - Your modern knowledge base solution 📚✨
