<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer" alt="Framer Motion" />
</p>

<h1 align="center">🎓 Lost & Found Portal</h1>

<p align="center">
  <strong>A modern, full-stack lost and found management system for educational institutions</strong>
</p>

<p align="center">
  Built with Next.js 16, Supabase, and premium glassmorphic UI design following Catppuccin Mocha theme
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Use Cases](#-use-cases)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Getting Started](#-getting-started)
- [Database Schema](#-database-schema)
- [Authentication Flow](#-authentication-flow)
- [Future Roadmap](#-future-roadmap)
- [Scaling Considerations](#-scaling-considerations)

---

## 🎯 Overview

Lost & Found Portal is a comprehensive web application designed to streamline the management of lost and found items in educational institutions. It provides a unified platform connecting students, administrators, and directors with role-based access control, real-time tracking, and beautiful modern UI.

### The Problem

Educational institutions face a common challenge: students frequently lose items on campus. Traditional methods (bulletin boards, emails, physical claim systems) are:
- **Inefficient**: Items pile up, matching is manual
- **Disorganized**: No central tracking or status updates
- **Time-consuming**: Staff spend hours on item management
- **Opaque**: Students don't know if their item was found

### Our Solution

A digital platform that:
- **Centralizes** all lost and found operations
- **Automates** matching and notification workflows
- **Empowers** students to track their items in real-time
- **Provides** administrators with powerful management tools
- **Gives** directors oversight and user management capabilities

---

## 💼 Use Cases

### For Students
| Use Case | Description |
|----------|-------------|
| Report Lost Item | Submit detailed reports (name, category, description, location, date) |
| Track Status | Monitor item status in real-time (Searching → Found → Claimed) |
| Browse Found Items | Search through found items to identify belongings |
| Manage Reports | Edit or delete submitted reports |

### For Administrators (Staff)
| Use Case | Description |
|----------|-------------|
| Review Submissions | Process incoming lost item reports |
| Log Found Items | Record items found on campus with details |
| Match Items | Connect found items with student reports |
| Manage Inventory | Full CRUD operations on all items |
| Student Management | Create, edit, deactivate student accounts |
| Statistics Dashboard | View analytics on items, resolution rates |

### For Directors (Super Admin)
| Use Case | Description |
|----------|-------------|
| User Management | Create/manage admins and students |
| System Oversight | Access all platform statistics |
| Audit Trail | Review all system activity |
| Configuration | Manage system-wide settings |

---

## ✨ Features

### 🎨 User Interface
- **Glassmorphic Design** - Modern frosted glass aesthetics with backdrop blur
- **Catppuccin Mocha Theme** - Cohesive dark mode color palette
- **Smooth Animations** - Framer Motion powered transitions
- **Scroll Stacking Effect** - Innovative section animations on landing page
- **Responsive Design** - Mobile-first, works on all devices
- **Custom Components** - Hand-crafted UI elements (Toast, DatePicker, ConfirmDialog)

### 🔐 Authentication & Security
- **JWT-based Authentication** - Secure token-based sessions
- **Role-based Access Control** - Student, Admin, Director roles
- **Password Hashing** - bcrypt with salt rounds
- **Protected Routes** - Server-side route protection
- **Token Expiration** - Automatic session invalidation

### 📦 Item Management
- **Unique Item IDs** - Auto-generated tracking codes (e.g., LF-ABC123)
- **Rich Item Details** - Name, category, description, location, date, contact info
- **Status Workflow** - Lost → Found → Claimed → Returned
- **Category System** - Electronics, Accessories, Clothing, Books, Keys, Bags, Sports, Other
- **Search & Filter** - Full-text search across all item fields

### 📊 Analytics Dashboard
- **Real-time Statistics** - Total items, by status, by category
- **Resolution Metrics** - Track success rates
- **User Analytics** - Active users, submissions per user

### 🚀 Performance
- **In-memory Caching** - Reduces database load
- **Singleton Database Pattern** - Connection reuse
- **Optimistic UI Updates** - Instant feedback
- **Lazy Loading** - Component-level code splitting

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router, Turbopack |
| **React 19** | UI library with latest features |
| **Framer Motion 12** | Animation library for smooth transitions |
| **Lenis** | Smooth scrolling library |
| **CSS Modules** | Scoped styling with no conflicts |

### Backend

| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints |
| **Supabase** | PostgreSQL database with real-time capabilities |
| **JWT (jsonwebtoken)** | Token-based authentication |
| **bcryptjs** | Password hashing |
| **Custom Caching** | In-memory cache layer |

### Database

| Technology | Purpose |
|------------|---------|
| **Supabase PostgreSQL** | Managed PostgreSQL database |
| **Row Level Security** | Database-level access control |
| **Foreign Key Relations** | Referential integrity |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Bun** | Fast JavaScript runtime & package manager |
| **Turbopack** | Next.js bundler for fast dev builds |
| **ESLint** | Code linting |

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Landing   │  │   Student   │  │  Admin/Director         │  │
│  │    Page     │  │  Dashboard  │  │     Dashboards          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  /auth   │  │ /student │  │  /admin  │  │    /director     │ │
│  │  login   │  │ requests │  │  items   │  │   users/stats    │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Supabase    │  │     JWT      │  │      Cache           │   │
│  │   Client     │  │   Handler    │  │      Layer           │   │
│  │  (Singleton) │  │              │  │   (In-Memory)        │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│                  ┌─────────────────────┐                         │
│                  │  Supabase PostgreSQL │                        │
│                  │  • users table       │                        │
│                  │  • lost_items table  │                        │
│                  └─────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── page.js            # Landing page
│   ├── LogIn/             # Authentication page
│   ├── StudentDashboard/  # Student portal
│   ├── AdminDashboard/    # Staff portal
│   ├── DirectorDashboard/ # Director portal
│   ├── search/            # Public item search
│   └── api/               # API endpoints
│
├── components/            # Reusable UI components
│   ├── Hero/             # Landing hero section
│   ├── Features/         # Feature showcase
│   ├── Stats/            # Statistics display
│   ├── CTA/              # Call to action
│   ├── Navbar/           # Global navigation
│   ├── StickyFooter/     # Footer component
│   ├── ScrollSection/    # Scroll animation wrapper
│   ├── Toast/            # Notification system
│   ├── DatePicker/       # Custom date picker
│   └── ConfirmDialog/    # Confirmation modals
│
└── lib/                   # Utility libraries
    ├── supabase.js       # Database client (singleton)
    ├── supabase-auth.js  # Auth helpers
    └── cache.js          # Caching layer
```

---

## 📁 Project Structure

```
lost-and-found/
├── 📂 lib/                         # Core libraries
│   ├── supabase.js                 # Supabase client (singleton pattern)
│   ├── supabase-auth.js            # JWT auth helpers
│   └── cache.js                    # In-memory caching system
│
├── 📂 public/                      # Static assets
│   └── fonts/                      # Custom fonts (Gilroy)
│
├── 📂 scripts/                     # Utility scripts
│   └── seedDirector.js             # Database seeding
│
├── 📂 src/
│   ├── 📂 app/                     # Next.js App Router
│   │   ├── 📂 api/                 # API Routes
│   │   │   ├── 📂 admin/           # Admin endpoints
│   │   │   │   ├── claims/         # Claim management
│   │   │   │   ├── items/          # Item CRUD
│   │   │   │   ├── students/       # Student management
│   │   │   │   ├── users/          # User management
│   │   │   │   └── stats/          # Analytics
│   │   │   ├── 📂 auth/            # Authentication
│   │   │   │   ├── login/          # Login endpoint
│   │   │   │   └── director/       # Director auth
│   │   │   ├── 📂 director/        # Director endpoints
│   │   │   ├── 📂 student/         # Student endpoints
│   │   │   ├── 📂 health/          # Health checks
│   │   │   └── 📂 setup/           # Database setup
│   │   │
│   │   ├── 📂 AdminDashboard/      # Admin UI
│   │   ├── 📂 DirectorDashboard/   # Director UI
│   │   ├── 📂 StudentDashboard/    # Student UI
│   │   ├── 📂 LogIn/               # Login page
│   │   ├── 📂 Director/            # Director login
│   │   └── 📂 search/              # Public search
│   │
│   └── 📂 components/              # UI Components
│       ├── Hero/                   # Landing hero
│       ├── Features/               # Features section
│       ├── Stats/                  # Statistics
│       ├── CTA/                    # Call to action
│       ├── Navbar/                 # Navigation
│       ├── StickyFooter/           # Footer
│       ├── ScrollSection/          # Scroll animations
│       ├── PageLoader/             # Loading screen
│       ├── PageTransition/         # Page transitions
│       ├── Toast/                  # Notifications
│       ├── DatePicker/             # Date picker
│       ├── ConfirmDialog/          # Dialogs
│       └── TransitionLink/         # Animated links
│
├── .env.local                      # Environment variables
├── package.json                    # Dependencies
└── next.config.mjs                 # Next.js config
```

---

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Student/Admin login |
| `POST` | `/api/auth/director/login` | Director login |
| `POST` | `/api/auth/director/verify` | Verify director token |

### Student Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/student/requests` | Get student's reports |
| `POST` | `/api/student/requests` | Create new report |
| `DELETE` | `/api/student/requests` | Delete own report |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/items` | List all items (filterable) |
| `POST` | `/api/admin/items-new` | Create new item |
| `PUT` | `/api/admin/items-new` | Update item |
| `DELETE` | `/api/admin/items-new` | Delete item |
| `GET` | `/api/admin/students` | List students |
| `POST` | `/api/admin/students` | Create student |
| `GET` | `/api/admin/stats` | Get statistics |

### Director Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/director/users` | List all users |
| `POST` | `/api/director/users` | Create user |
| `PUT` | `/api/director/users` | Update user |
| `DELETE` | `/api/director/users` | Delete user |
| `GET` | `/api/director/stats` | System statistics |

---

## 🚀 Getting Started

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Supabase** account with project
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/lost-and-found.git
cd lost-and-found
```

2. **Install dependencies**
```bash
bun install
```

3. **Configure environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

4. **Seed the database (first time)**
```bash
bun run seed:director
```

5. **Run development server**
```bash
bun run dev
```

6. **Open in browser**
```
http://localhost:3000
```

### Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Director | director | (set during seed) |

---

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  role VARCHAR(20) DEFAULT 'student', -- student, admin, director
  department VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Lost Items Table
```sql
CREATE TABLE lost_items (
  id SERIAL PRIMARY KEY,
  unique_item_id VARCHAR(20) UNIQUE, -- e.g., LF-ABC123
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'lost', -- lost, found, claimed, returned
  location_lost VARCHAR(255),
  location_found VARCHAR(255),
  date_lost DATE,
  date_found DATE,
  date_returned DATE,
  contact_info VARCHAR(255),
  color VARCHAR(50),
  brand VARCHAR(100),
  image_url TEXT,
  reward_amount DECIMAL(10,2),
  notes TEXT,
  owner_user_id UUID REFERENCES users(id),
  finder_user_id UUID REFERENCES users(id),
  reported_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Authentication Flow

```
┌─────────┐       ┌─────────────┐       ┌──────────┐       ┌──────────┐
│ Client  │──────▶│ Login Page  │──────▶│ API Route│──────▶│ Supabase │
└─────────┘       └─────────────┘       └──────────┘       └──────────┘
     │                   │                    │                  │
     │  1. Enter creds   │                    │                  │
     │──────────────────▶│                    │                  │
     │                   │  2. POST /login    │                  │
     │                   │───────────────────▶│                  │
     │                   │                    │  3. Query user   │
     │                   │                    │─────────────────▶│
     │                   │                    │◀─────────────────│
     │                   │                    │  4. Verify pass  │
     │                   │                    │  (bcrypt.compare)│
     │                   │  5. Return JWT     │                  │
     │                   │◀───────────────────│                  │
     │  6. Store token   │                    │                  │
     │◀──────────────────│                    │                  │
     │  (localStorage)   │                    │                  │
     │                   │                    │                  │
     │  7. Redirect to   │                    │                  │
     │     Dashboard     │                    │                  │
     └───────────────────┴────────────────────┴──────────────────┘
```

---

## 🔮 Future Roadmap

### Phase 1: Enhanced Matching (v1.1)
- [ ] **AI-powered Item Matching** - Use ML to suggest matches between lost/found items
- [ ] **Image Upload** - Allow photo uploads for better identification
- [ ] **Email Notifications** - Notify students when their item is found

### Phase 2: Communication (v1.2)
- [ ] **In-app Messaging** - Direct communication between finders and owners
- [ ] **SMS Notifications** - Text alerts for urgent updates
- [ ] **Push Notifications** - Browser/mobile push support

### Phase 3: Integration (v1.3)
- [ ] **Student ID Integration** - Link with campus ID systems
- [ ] **QR Code Labels** - Generate trackable QR codes for items
- [ ] **Campus Maps** - Visual location selection with maps

### Phase 4: Mobile (v2.0)
- [ ] **Progressive Web App** - Installable PWA with offline support
- [ ] **React Native App** - Native mobile experience
- [ ] **Camera Integration** - Direct photo capture

### Phase 5: Enterprise (v3.0)
- [ ] **Multi-campus Support** - Manage multiple institutions
- [ ] **Analytics Dashboard** - Advanced reporting and insights
- [ ] **Audit Logs** - Complete activity tracking
- [ ] **SSO Integration** - SAML/OAuth for campus authentication

---

## 📈 Scaling Considerations

### Current Architecture Limits
- **In-memory cache**: Lost on server restart, not shared across instances
- **Single database**: Supabase free tier limits

### Recommended Scaling Path

1. **Horizontal Scaling**
   - Replace in-memory cache with **Redis**
   - Deploy multiple API instances behind load balancer

2. **Database Optimization**
   - Add indexes on frequently queried columns
   - Implement connection pooling (pgBouncer)
   - Consider read replicas for analytics

3. **CDN & Static Assets**
   - Serve static files via CDN (Vercel Edge, Cloudflare)
   - Optimize images with Next.js Image component

4. **Monitoring & Observability**
   - Add APM (Application Performance Monitoring)
   - Implement structured logging
   - Set up alerting for errors/performance

5. **Security Hardening**
   - Implement rate limiting
   - Add CSRF protection
   - Security headers (CSP, HSTS)
   - Regular dependency audits

### Infrastructure Recommendations

| Scale | Users | Recommended Setup |
|-------|-------|-------------------|
| Small | <100 | Vercel Free + Supabase Free |
| Medium | 100-1000 | Vercel Pro + Supabase Pro + Redis |
| Large | 1000+ | Self-hosted K8s + Managed PostgreSQL + Redis Cluster |

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for educational institutions
</p>
