# NoodleNook Wiki & Knowledge Base

A modern, feature-rich Wiki and Knowledge Base application built with React, Node.js, Express, and PostgreSQL. Designed to run seamlessly in Docker with a clean, intuitive interface and powerful features.

Check out the Demo Documentation Site: [https://kb.sluberskihomelab.com/](https://kb.sluberskihomelab.com/)
If you want to get a feel for the editor, you can login with the editor account.  Approval workflow is on and backups are made daily so you will not break anything.

*Username*: demo
*Password*: noodlenook!

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
