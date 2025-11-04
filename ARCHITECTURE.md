# NoodleNook Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Docker Network                             │
│                                                                       │
│  ┌──────────────────┐     ┌──────────────────┐    ┌───────────────┐│
│  │   Frontend       │     │    Backend       │    │  PostgreSQL   ││
│  │   (React/Vite)   │────▶│  (Express/Node)  │───▶│   Database    ││
│  │   Port: 3000     │     │   Port: 3001     │    │  Port: 5432   ││
│  │                  │     │                  │    │               ││
│  │  - React 18      │     │  - JWT Auth      │    │  - FTS Index  ││
│  │  - React Router  │     │  - Rate Limiting │    │  - Revisions  ││
│  │  - Axios Client  │     │  - Helmet        │    │  - Users      ││
│  │  - Dark Mode     │     │  - CORS          │    │  - Pages      ││
│  │  - Nginx Server  │     │  - REST API      │    │  - Tags       ││
│  └──────────────────┘     └──────────────────┘    └───────────────┘│
│           ▲                        ▲                                 │
│           │                        │                                 │
└───────────┼────────────────────────┼─────────────────────────────────┘
            │                        │
            │                        │
    ┌───────┴────────┐      ┌───────┴────────┐
    │  Web Browser   │      │  API Clients   │
    │  localhost:3000│      │  localhost:3001│
    └────────────────┘      └────────────────┘
```

## Data Flow

### User Registration/Login
```
Browser → Frontend → POST /api/auth/register → Backend
                                                   ↓
                                              Hash Password (bcrypt)
                                                   ↓
                                              Save to PostgreSQL
                                                   ↓
                                              Generate JWT Token
                                                   ↓
Frontend ← Return User + Token ← Backend
    ↓
Store Token in localStorage
```

### Creating a Wiki Page
```
Browser → Frontend → POST /api/pages → Backend (Check JWT)
                                           ↓
                                      Validate Role (editor/admin)
                                           ↓
                                      Save to pages table
                                           ↓
                                      Create search index
                                           ↓
Frontend ← Return Page Data ← Backend
    ↓
Navigate to /page/:slug
```

### Searching Pages
```
Browser → Frontend → GET /api/search?q=query → Backend
                                                   ↓
                                              PostgreSQL FTS Query
                                              (to_tsvector + ts_rank)
                                                   ↓
Frontend ← Return Ranked Results ← Backend
    ↓
Display Search Results
```

## Component Hierarchy

```
App (Context Provider)
├── Router
│   ├── Header
│   │   ├── Logo & Title
│   │   ├── Search Bar
│   │   ├── Dark Mode Toggle
│   │   ├── Settings Menu
│   │   └── Login/Logout Button
│   │
│   ├── Sidebar (Conditional)
│   │   ├── Dashboard Link
│   │   ├── New Page Button
│   │   └── Page List
│   │       ├── TOC Style Toggle
│   │       └── Grouped/Flat List
│   │
│   └── Main Content (Routes)
│       ├── Dashboard
│       │   ├── Welcome Section
│       │   ├── Quick Actions
│       │   └── Recent Pages Grid
│       │
│       ├── Login/Register
│       │   ├── Form
│       │   └── Error Display
│       │
│       ├── PageView
│       │   ├── Page Header
│       │   ├── Metadata (author, date)
│       │   ├── Markdown Renderer
│       │   └── Edit/Delete Buttons
│       │
│       ├── PageEditor
│       │   ├── Editor Type Toggle
│       │   ├── Title Input
│       │   ├── Slug Input (new pages)
│       │   ├── Content Editor
│       │   └── Save/Cancel Buttons
│       │
│       └── SearchPage
│           ├── Search Form
│           └── Results List
```

## Database Schema Relationships

```
users (1) ────────┬──────────▶ pages (N)
                  │              │
                  │              │ (1)
                  │              │
                  │              ▼
                  │         page_revisions (N)
                  │
                  └──────────▶ page_revisions (N)

pages (N) ──────────────────▶ page_tags (N) ──────────────────▶ tags (N)
```

## Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. POST /api/auth/login
       │    {username, password}
       ▼
┌──────────────────┐
│   Backend API    │
└────────┬─────────┘
         │ 2. Check PostgreSQL
         ▼
┌──────────────────┐
│    PostgreSQL    │
└────────┬─────────┘
         │ 3. Return user record
         ▼
┌──────────────────┐
│   Backend API    │
│                  │
│  - Verify bcrypt │
│  - Generate JWT  │
└────────┬─────────┘
         │ 4. Return {user, token}
         ▼
┌─────────────┐
│   Browser   │
│             │
│ localStorage│
│ .setItem(   │
│  'token',   │
│   jwt       │
│ )           │
└─────────────┘
```

## Request Authentication

```
Every API Request:
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ Authorization: Bearer <JWT>
       ▼
┌──────────────────┐
│  Auth Middleware │
│                  │
│  1. Extract JWT  │
│  2. Verify JWT   │
│  3. Decode user  │
│  4. Add to req   │
└────────┬─────────┘
         │ req.user = {id, username, role}
         ▼
┌──────────────────┐
│  Route Handler   │
│                  │
│  - Check role    │
│  - Process req   │
│  - Return resp   │
└──────────────────┘
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  React Components, CSS, Dark Mode, Responsive Design    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                   Application Layer                      │
│  React Router, Context API, State Management, Axios     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                     API Layer                            │
│  REST Endpoints, JWT Middleware, Rate Limiting          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                   Business Logic                         │
│  Authentication, Page CRUD, Search, Validation          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                    Data Layer                            │
│  PostgreSQL, Connection Pool, Queries, Transactions     │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture (Docker)

```
Docker Compose
    │
    ├─── postgres Service
    │    ├── Image: postgres:15-alpine
    │    ├── Volume: postgres-data
    │    ├── Health Check: pg_isready
    │    └── Network: default bridge
    │
    ├─── backend Service
    │    ├── Build: ./backend/Dockerfile
    │    ├── Depends: postgres (healthy)
    │    ├── Env: DB_HOST, JWT_SECRET
    │    └── Port: 3001:3001
    │
    └─── frontend Service
         ├── Build: ./frontend/Dockerfile (multi-stage)
         │   ├── Stage 1: Node (build React)
         │   └── Stage 2: Nginx (serve static)
         ├── Depends: backend
         ├── Nginx Reverse Proxy
         │   ├── /api → http://backend:3001
         │   └── /* → /usr/share/nginx/html
         └── Port: 3000:3000
```

## Feature Implementation Map

```
Feature                    │ Frontend              │ Backend           │ Database
──────────────────────────┼──────────────────────┼──────────────────┼─────────────
User Authentication        │ Login.jsx             │ routes/auth.js    │ users table
                          │ Register.jsx          │ middleware/auth   │
                          │ Context API           │                   │
──────────────────────────┼──────────────────────┼──────────────────┼─────────────
Role-Based Access         │ Protected Routes      │ authorizeRole()   │ users.role
                          │ Conditional UI        │                   │
──────────────────────────┼──────────────────────┼──────────────────┼─────────────
Page Management           │ PageView.jsx          │ routes/pages.js   │ pages table
                          │ PageEditor.jsx        │                   │ page_revisions
──────────────────────────┼──────────────────────┼──────────────────┼─────────────
Markdown/Rich Text        │ Editor Type Toggle    │ content_type      │ pages.content_type
                          │ ReactMarkdown         │                   │
──────────────────────────┼──────────────────────┼──────────────────┼─────────────
Search Functionality      │ SearchPage.jsx        │ routes/search.js  │ GIN FTS index
                          │ Header search bar     │ ts_rank()         │
──────────────────────────┼──────────────────────┼──────────────────┼─────────────
Dark Mode                 │ Context API           │ N/A               │ N/A
                          │ CSS variables         │                   │
                          │ localStorage          │                   │
──────────────────────────┼──────────────────────┼──────────────────┼─────────────
Flexible Sidebar          │ Context API           │ N/A               │ N/A
                          │ Conditional render    │                   │
                          │ localStorage          │                   │
──────────────────────────┼──────────────────────┼──────────────────┼─────────────
Table of Contents         │ Sidebar.jsx           │ N/A               │ N/A
                          │ TOC style toggle      │                   │
                          │ localStorage          │                   │
```

## Key Design Decisions

1. **JWT vs Sessions**: Chose JWT for stateless authentication, easier scaling
2. **PostgreSQL FTS vs Elasticsearch**: Used native PG FTS for simplicity, can upgrade later
3. **Vite vs CRA**: Chose Vite for faster builds and better DX
4. **CSS vs CSS-in-JS**: Used vanilla CSS with variables for simplicity and performance
5. **Context API vs Redux**: Context API sufficient for this app's state management needs
6. **Nginx vs Node serving**: Nginx for better performance serving static files
7. **Multi-stage Docker**: Smaller image size, separate build/runtime concerns
