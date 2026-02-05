# ShopEase VPS Progress Report

> Personal infrastructure & backend setup overview

---

## Table of Contents

### Overview

- [What We Have Done](#what-we-have-done)
- [What We Will Do Next](#what-we-will-do-next)
- [Project Folder Structure](#project-folder-structure)

### VPS Planning

- [Can VPS Be Used as Desktop?](#can-vps-be-used-as-desktop)
- [VPS Upgrade Decision (KVM1 → KVM2)](#vps-upgrade-decision-kvm1--kvm2)
- [Current VPS Health Analysis](#current-vps-health-analysis)
- [VPS as Personal Desktop Decision](#vps-as-personal-desktop-decision)

### Environment Setup

- [WSL-Like Development Setup](#wsl-like-development-setup)
- [ZSH & Oh-My-Zsh](#zsh--oh-my-zsh)
- [Oh-My-Zsh Confirmation](#oh-my-zsh-confirmation)
- [VPS Login Flow](#vps-login-flow)
- [Python Virtual Environment Reset](#python-virtual-environment-reset)

### Docker & MySQL

- [Docker CLI vs Desktop](#docker-cli-vs-desktop)
- [MySQL Setup Strategy](#mysql-setup-strategy)
- [MySQL with Docker Compose](#mysql-with-docker-compose)
- [MySQL Access Denied (User Fix)](#mysql-access-denied-user-fix)
- [Root Password Change](#root-password-change)
- [Root Access Still Denied](#root-access-still-denied)
- [Root Lockout Recovery](#root-lockout-recovery)
- [MySQL Reset Error](#mysql-reset-error)
- [ALTER USER Rule Explained](#alter-user-rule-explained)
- [MySQL Command Not Found](#mysql-command-not-found)
- [Full Docker + MySQL Reinstall](#full-docker--mysql-reinstall)
- [MySQL vs Linux Context](#mysql-vs-linux-context)
- [Root Access Diagnostic](#root-access-diagnostic)
- [Intermittent Root Login Success](#intermittent-root-login-success)
- [Calm Root Login Debugging](#calm-root-login-debugging)
- [shopease_user Stabilization](#shopease_user-stabilization)

### phpMyAdmin

- [PHP & phpMyAdmin Clarification](#php--phpmyadmin-clarification)
- [Directory & Workflow Confusion](#directory--workflow-confusion)
- [PHP Knowledge Not Required](#php-knowledge-not-required)
- [phpMyAdmin via Docker](#phpmyadmin-via-docker)
- [phpMyAdmin Access Denied](#phpmyadmin-access-denied)
- [phpMyAdmin Connected Successfully](#phpmyadmin-connected-successfully)
- [Securing phpMyAdmin](#securing-phpmyadmin)
- [phpMyAdmin Internet Access](#phpmyadmin-internet-access)
- [Finding YOUR_IP](#finding-your_ip)
- [PowerShell curl Warning](#powershell-curl-warning)
- [Firewall Allow-List Decision](#firewall-allow-list-decision)

### Django Setup

- [Pre-Deployment Safety Check](#pre-deployment-safety-check)
- [Repository Cloned & Verified](#repository-cloned--verified)
- [Django Project Structure](#django-project-structure)
- [Requirements Installation Fix](#requirements-installation-fix)
- [MySQL Client Build Fix](#mysql-client-build-fix)
- [Django SECRET_KEY Resolution](#django-secret_key-resolution)
- [.gitignore Update](#gitignore-update)
- [Environment Configuration Cleanup](#environment-configuration-cleanup)

### Security

- [VPS Malware Scanner & Auto-Removal](#vps-malware-scanner--auto-removal)

### Dev-Journal Project

- [Dev-Journal Overview](#dev-journal-overview)
- [What We Have Done (Dev-Journal)](#what-we-have-done-dev-journal)
- [How We Set It Up](#how-we-set-it-up)
- [What We Will Do Next (Dev-Journal)](#what-we-will-do-next-dev-journal)
- [Dev-Journal Folder Structure](#dev-journal-folder-structure)

### StackPilot Project

- [StackPilot Overview](#stackpilot-overview)
- [What We Have Done (StackPilot)](#what-we-have-done-stackpilot)
- [How We Set It Up (StackPilot)](#how-we-set-it-up-stackpilot)
- [MongoDB Atlas (StackPilot)](#mongodb-atlas-stackpilot)
- [Cloning & Running on VPS](#cloning--running-on-vps)
- [ngrok Usage](#ngrok-usage)
- [Deployment Flow](#deployment-flow)
- [StackPilot Roadmap](#stackpilot-roadmap)
- [StackPilot Folder Structure](#stackpilot-folder-structure)

---

## What We Have Done

- [x] Ubuntu 24.04 VPS configured
- [x] SSH access secured
- [x] Docker installed (CLI)
- [x] MySQL running in Docker
- [x] phpMyAdmin connected
- [x] Django project cloned
- [x] Python 3.12 VPS-native venv
- [x] Universal requirements.txt
- [x] .env & secrets externalized
- [x] .gitignore secured

---

## What We Will Do Next

- [ ] Connect Django → MySQL
- [ ] Run migrations
- [ ] Create superuser
- [ ] Gunicorn setup
- [ ] Nginx reverse proxy
- [ ] Domain + HTTPS

---

## Project Folder Structure

```
/home/devuser/dev/projects/
└── ShopEase/
    ├── shopease/
    ├── shopeasedocs/
    ├── docs/
    ├── scripts/
    ├── venv/
    ├── requirements.txt
    ├── .env
    └── .gitignore
```

---

## Can VPS Be Used as Desktop?

### The Question

Can you use a cloud VPS like a desktop PC — with Chrome, VSCode, and a GUI?

### The Answer

**Technically yes, but practically no.**

| Task | Best Done On |
|------|--------------|
| Writing code | Local (VSCode) |
| Running Django/Docker | VPS |
| Browsing | Local |
| DB / Services | VPS |
| Logs / Debug | VPS |
| Git | Both |

### If you REALLY want a desktop (not advised)

XFCE / VNC / RDP are possible but:

- Slower
- Less secure
- Wastes VPS resources
- Not industry practice

> **Your VPS is your engine, not your chair.**
> You sit on your local PC and drive it remotely.

---

## VPS Upgrade Decision (KVM1 → KVM2)

### Question We Solved

Should we **check current VPS usage first** or **directly upgrade from KVM1 to KVM2**?

> ✔ Best practice: **Check once → then decide.**
> ❌ Never upgrade blindly.

### Health Checks Performed

#### RAM Usage

```bash
free -h
```

- Upgrade needed if available RAM < 500MB
- Upgrade needed if swap is used frequently

#### CPU Load

```bash
htop
```

- Upgrade if CPU stays 70–100%
- Load average > 1.0 on 1 vCPU

#### Disk Usage

```bash
df -h
```

- Upgrade if disk usage > 80%
- Important for logs, DB, media growth

#### Overall Server Pressure

```bash
uptime
```

- 1.50 / 1.30 / 1.20 → bad for 1 vCPU
- 0.20 / 0.30 / 0.40 → healthy

### When Upgrading to KVM2 Makes Sense

- Django + MySQL + Nginx
- Docker containers
- Redis & Celery background jobs
- MongoDB / PostgreSQL
- Multiple projects (ShopEase, FinTrack)

---

## Current VPS Health Analysis

*Content from HTML - VPS health metrics and analysis*

---

## VPS as Personal Desktop Decision

*Content from HTML - Decision on using VPS as desktop*

---

## WSL-Like Development Setup

### What is the "WSL-like" Setup?

A development workflow where you:

- Code locally on your PC (Windows/Mac)
- Run services on a remote Linux server (VPS)
- Sync code via Git or live SSH editing

### Why This Approach?

| Local PC | VPS |
|----------|-----|
| VSCode | Docker |
| Browser | MySQL |
| Git | Django |
| Comfort | Nginx |

---

## ZSH & Oh-My-Zsh

### What is ZSH?

ZSH (Z Shell) is an advanced shell with:

- Better autocomplete
- Syntax highlighting
- Plugin support
- Theming

### What is Oh-My-Zsh?

A framework for managing ZSH configuration with:

- 300+ plugins
- 150+ themes
- Easy customization

### Installation

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

---

## Oh-My-Zsh Confirmation

*Verification that Oh-My-Zsh is installed and working*

---

## VPS Login Flow

### Standard Login

```bash
ssh devuser@your-vps-ip
```

### With Key Authentication

```bash
ssh -i ~/.ssh/your_key devuser@your-vps-ip
```

---

## Python Virtual Environment Reset

### Step 1: Remove Broken Virtual Environment

```bash
cd ~/dev/projects/ShopEase
rm -rf venv
```

### Step 2: Verify System Python

```bash
python3 --version
which python3
```

### Step 3: Create Fresh VPS-Native Virtual Environment

```bash
cd ~/dev/projects/ShopEase
python3 -m venv venv
source venv/bin/activate
```

---

## Docker CLI vs Desktop

### Docker CLI (Recommended for VPS)

- Lightweight
- No GUI overhead
- Perfect for servers
- Lower resource usage

### Docker Desktop

- GUI interface
- Designed for local development
- Higher resource usage
- Not suitable for VPS

---

## MySQL Setup Strategy

### Using Docker Compose

Benefits:

- Reproducible setup
- Easy configuration
- Isolated environment
- Simple backup/restore

---

## MySQL with Docker Compose

### docker-compose.yml

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: shopease_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: your_root_password
      MYSQL_DATABASE: shopease_db
      MYSQL_USER: shopease_user
      MYSQL_PASSWORD: your_user_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### Start MySQL

```bash
docker-compose up -d
```

---

## MySQL Access Denied (User Fix)

*Troubleshooting MySQL access denied errors*

---

## Root Password Change

```bash
docker exec -it shopease_mysql mysql -u root -p
```

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

---

## Root Access Still Denied

*Additional troubleshooting for root access issues*

---

## Root Lockout Recovery

*Steps to recover from MySQL root lockout*

---

## MySQL Reset Error

*Handling MySQL reset errors*

---

## ALTER USER Rule Explained

The `ALTER USER` command changes user authentication:

```sql
ALTER USER 'username'@'host' IDENTIFIED BY 'password';
```

Important: The `@'host'` part matters!

- `'root'@'localhost'` - local connections only
- `'root'@'%'` - any host connections

---

## MySQL Command Not Found

### Problem

Running `mysql` outside Docker shows "command not found"

### Solution

Use Docker exec:

```bash
docker exec -it shopease_mysql mysql -u root -p
```

---

## Full Docker + MySQL Reinstall

*Steps for complete reinstallation*

---

## MySQL vs Linux Context

*Understanding the difference between MySQL and Linux contexts*

---

## Root Access Diagnostic

*Diagnostic steps for root access issues*

---

## Intermittent Root Login Success

*Handling intermittent login issues*

---

## Calm Root Login Debugging

*Systematic debugging approach*

---

## shopease_user Stabilization

*Stabilizing the application database user*

---

## PHP & phpMyAdmin Clarification

### What is phpMyAdmin?

A web-based MySQL administration tool written in PHP.

### Do I need to know PHP?

**No!** You just use the web interface to manage MySQL.

---

## Directory & Workflow Confusion

*Clarifying directory structures and workflows*

---

## PHP Knowledge Not Required

phpMyAdmin is a **tool**, not a language you need to learn.

You use it to:

- Browse databases
- Run SQL queries
- Import/export data
- Manage users

---

## phpMyAdmin via Docker

### docker-compose.yml addition

```yaml
phpmyadmin:
  image: phpmyadmin/phpmyadmin
  container_name: shopease_phpmyadmin
  restart: unless-stopped
  environment:
    PMA_HOST: mysql
    PMA_PORT: 3306
  ports:
    - "8080:80"
  depends_on:
    - mysql
```

### Access

Open `http://your-vps-ip:8080` in browser

---

## phpMyAdmin Access Denied

*Troubleshooting phpMyAdmin access issues*

---

## phpMyAdmin Connected Successfully

**phpMyAdmin is now working!**

Access at: `http://your-vps-ip:8080`

---

## Securing phpMyAdmin

### Options

1. **IP Whitelist** - Allow only your IP
2. **VPN** - Access through VPN only
3. **Disable public access** - Local only via SSH tunnel

### UFW Firewall Rules

```bash
sudo ufw allow from YOUR_IP to any port 8080
sudo ufw deny 8080
```

---

## phpMyAdmin Internet Access

*Configuring internet access for phpMyAdmin*

---

## Finding YOUR_IP

### From Windows PowerShell

```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

### From Linux/Mac

```bash
curl https://api.ipify.org
```

---

## PowerShell curl Warning

In PowerShell, `curl` is an alias for `Invoke-WebRequest`, not the real curl.

Use:

```powershell
Invoke-WebRequest -Uri "https://api.ipify.org"
```

Or install real curl via chocolatey.

---

## Firewall Allow-List Decision

*Deciding on firewall configuration approach*

---

## Pre-Deployment Safety Check

Before deploying Django:

- [ ] Database connection configured
- [ ] Environment variables set
- [ ] Static files collected
- [ ] Secret key secured
- [ ] Debug mode disabled

---

## Repository Cloned & Verified

```bash
cd ~/dev/projects
git clone https://github.com/yourusername/ShopEase.git
cd ShopEase
git status
```

---

## Django Project Structure

```
ShopEase/
├── shopease/           ← Main Django project (core)
│   ├── manage.py
│   ├── apps/
│   ├── config/
│   ├── templates/
│   └── static/
├── docs/
├── scripts/
├── shopeasedocs/
├── venv/               ← Python virtual environment
└── install.cmd         ← Windows-only (ignored on VPS)
```

> Django entry point identified correctly
> No confusion between root and project directory

---

## Requirements Installation Fix

### Activating Virtual Environment

```bash
cd ~/dev/projects/ShopEase
source venv/bin/activate
```

### Installing Dependencies

```bash
pip install -r shopease/requirements.txt
```

---

## MySQL Client Build Fix

### Problem

`mysqlclient` fails to build

### Solution

Install system dependencies first:

```bash
sudo apt-get install python3-dev default-libmysqlclient-dev build-essential pkg-config
```

Then retry:

```bash
pip install mysqlclient
```

---

## Django SECRET_KEY Resolution

### Create .env file

```bash
cd ~/dev/projects/ShopEase
nano .env
```

### Add SECRET_KEY

```env
SECRET_KEY=your-super-secret-key-here
DEBUG=False
DATABASE_URL=mysql://shopease_user:password@localhost:3306/shopease_db
```

---

## .gitignore Update

### Essential entries

```gitignore
# Environment
.env
.env.local
.env.*.local
venv/
__pycache__/

# IDE
.vscode/
.idea/

# Database
*.sqlite3
*.db

# Logs
*.log

# OS
.DS_Store
Thumbs.db
```

---

## Environment Configuration Cleanup

### Final Verification

```bash
cd ~/dev/projects/ShopEase/shopease
python3 manage.py check
```

Expected output:

```
System check identified no issues (0 silenced).
```

---

## VPS Malware Scanner & Auto-Removal

After stabilizing Docker, Django, and database services, VPS-level malware protection was reviewed and finalized.

### Scan Status

- [x] Scanner: ACTIVE
- [x] Files scanned: 360,201
- [x] Malicious files: 0
- [x] Compromised files: 0

### Automatic Malware Removal

Automatic malware removal was enabled to provide real-time protection against malicious uploads, exploits, and injected files.

- [x] Quarantine enabled
- [x] No active threats detected
- [x] No impact on Docker or Django

> The scanner does not interfere with Docker containers, Python virtual environments, or application code.

### Security Posture

| Layer | Status |
|-------|--------|
| VPS Malware Scan | Enabled |
| Automatic Removal | Enabled |
| Docker Isolation | Active |
| .env Protection | Git Ignored |

> ✔ VPS security baseline complete.
> Safe for backend development and production use.

---

## Dev-Journal Overview

**Dev-Journal** — Personal Infrastructure & Documentation System

A production-ready documentation system for tracking VPS progress, infrastructure setup, and development workflows.

---

## What We Have Done (Dev-Journal)

- [x] Ubuntu VPS provisioned & secured (SSH)
- [x] Git installed & GitHub connected
- [x] Docker & Docker Compose installed
- [x] MySQL running inside Docker
- [x] phpMyAdmin connected via Docker
- [x] Firewall (UFW) configured (ports 22, 80, 443)
- [x] Node.js v20.20.0 environment ready
- [x] MongoDB Atlas connected & working
- [x] Express backend initialized
- [x] Journal Entry API (CRUD) created
- [x] HTML UI with external CSS/JS built
- [x] PM2 process manager installed
- [x] Nginx installed & configured
- [x] Server block created for stackpilot.in
- [x] SSL certificate installed (Let's Encrypt)
- [x] HTTPS enabled with auto-renewal
- [x] PM2 production server started
- [x] PM2 systemd startup enabled (auto-boot)
- [x] https://stackpilot.in is LIVE!
- [x] JWT Authentication (login/register) implemented
- [x] Admin panel with RBAC (Role-Based Access Control)
- [x] User dashboard with stats and activity charts
- [x] Security: Rate limiting, Helmet headers, CSP
- [x] WCAG 2.2 Accessibility compliance
- [x] Advanced file explorer with keyboard navigation
- [x] Windows 11-style File Explorer UI redesign

---

## Windows 11 File Explorer UI

- [x] Windows 11-style toolbar (New, Refresh, Favorite, Delete)
- [x] Sort and View dropdown menus
- [x] Address bar with Back/Forward/Up navigation
- [x] Breadcrumb navigation path
- [x] Search bar in address bar
- [x] Tabs: Recent, Favorites, All Entries
- [x] Collapsible sidebar sections (Quick Access, Favorites, Tags)
- [x] Colored folder icons by category
- [x] File list with sortable columns (Name, Date, Category, Tags)
- [x] Pinned folders grid (Quick Access section)
- [x] Status bar with item count
- [x] Dashboard and Admin navigation links
- [x] Mobile responsive sidebar with overlay

> ✅ File Explorer redesigned to match Windows 11 aesthetics with toolbar, address bar, tabs, collapsible sidebar, and details view.

---

## UI/UX Enhancements (Completed)

- [x] Mobile responsive design implemented
- [x] Hamburger menu for mobile navigation
- [x] 5 responsive breakpoints (320px to 1280px+)
- [x] CSS variables system for design tokens
- [x] 44px minimum touch targets for accessibility
- [x] Enhanced dark theme with gradients
- [x] Improved typography with font-smoothing
- [x] Shadow system for depth (sm, md, lg, xl)
- [x] Smooth transitions and hover effects
- [x] Entry cards with gradient borders on hover

---

## Animations & Micro-interactions (Completed)

- [x] CSS-first animation approach (no heavy libraries)
- [x] Staggered file list entrance animations
- [x] Dropdown menu fade + slide animations
- [x] Sidebar collapse/expand transitions
- [x] Button hover micro-interactions (scale + shadow)
- [x] Tab switching fade transitions
- [x] Pinned folder entrance + hover animations
- [x] Search box focus expansion animation
- [x] Skeleton loading shimmer effect
- [x] Accessibility: prefers-reduced-motion support

### Animation Timing System

| Speed | Duration | Use Case |
|-------|----------|----------|
| Fast | 150ms | Quick micro-interactions |
| Normal | 200ms | Standard transitions |
| Slow | 300ms | Complex animations |
| Easing | cubic-bezier(0.1, 0.9, 0.2, 1.0) | Fluent Design |

### New File

```
frontend/public/css/animations.css
```

Contains all keyframe animations, utility classes, and accessibility support.

---

## Security & Authentication (Completed)

- [x] JWT Authentication with 7-day token expiration
- [x] User registration with email/password
- [x] Password hashing with bcryptjs (cost factor 12)
- [x] Protected API routes with auth middleware
- [x] User isolation - each user sees only their entries
- [x] Login page with error handling
- [x] Register page with password confirmation
- [x] Logout functionality in navigation
- [x] Token stored in localStorage
- [x] Auto-redirect to login if not authenticated

### Security Features

| Feature | Implementation |
|---------|---------------|
| Password Storage | bcryptjs hash (cost factor 12) |
| Token Type | JWT (JSON Web Token) |
| Token Expiry | 7 days |
| RBAC Roles | user, moderator, admin |
| Rate Limiting | 5 login attempts/15min, 100 API/min |
| Account Lockout | 30 min after 5 failed attempts |
| Security Headers | Helmet.js + CSP configured |
| User Scoping | All queries filtered by userId |

> ✔ JWT Authentication with RBAC
> ✔ Admin panel for user management
> ✔ Rate limiting and account lockout
> ✔ Helmet.js security headers enabled

---

## How We Set It Up

- Used Docker for database isolation
- Kept secrets outside Git using `.env`
- Separated backend, frontend, and docs
- Used VPS only for services (not as desktop)
- Adopted GitHub → VPS pull workflow

---

## What We Will Do Next (Dev-Journal)

- [x] Initialize Express backend
- [x] Connect MongoDB Atlas
- [x] Create Docs API (CRUD)
- [x] Build HTML UI
- [x] Add search & tags
- [x] Add Nginx reverse proxy
- [x] Attach domain + HTTPS
- [x] Mobile responsive UI
- [x] CSS variables system

---

## Features Roadmap

- [x] Auto-detect code blocks in content with copy button
- [x] File explorer style UI for managing entries
- [x] Tree-view sidebar navigation
- [x] List view option with file icons
- [x] Breadcrumb navigation (Home > Category > Entry)
- [x] Syntax highlighting with Prism.js
- [x] JWT Authentication with login/register
- [x] Statistics dashboard with activity charts
- [x] Admin panel with RBAC (user/moderator/admin)
- [x] Security: Rate limiting, Helmet headers, CSP
- [x] WCAG 2.2 Accessibility (skip links, focus indicators, 44px touch targets)
- [x] Password strength meter with visual feedback
- [x] Account lockout after 5 failed login attempts
- [x] Advanced file explorer (context menu, keyboard nav, favorites)
- [x] Windows 11 File Explorer UI (toolbar, address bar, tabs, sidebar)
- [ ] Markdown live preview while editing
- [ ] Export entries to Markdown/PDF
- [ ] Entry templates for different categories
- [ ] Version history for entries
- [ ] GitHub Gist backup integration
- [ ] Dark/Light mode toggle

> ✅ 15 features completed! Dev-Journal now has Windows 11-style UI, JWT auth, admin panel with RBAC, dashboard, security enhancements, and WCAG 2.2 accessibility.

---

## Dev-Journal Folder Structure

```text
Dev-Journal/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── adminController.js    # Admin panel actions
│   │   │   ├── authController.js
│   │   │   ├── entryController.js
│   │   │   └── statsController.js    # Dashboard stats
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── authorize.js          # RBAC authorization
│   │   │   └── security.js           # Rate limiting, Helmet, CSP
│   │   ├── models/
│   │   │   ├── Entry.js
│   │   │   └── User.js               # + role, isActive, lockout fields
│   │   └── routes/
│   │       ├── admin.js              # Admin API routes
│   │       ├── auth.js
│   │       ├── entries.js
│   │       └── stats.js              # Dashboard stats routes
│   ├── scripts/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   ├── css/
│   │   │   ├── styles.css            # + WCAG 2.2 accessibility
│   │   │   ├── admin.css             # Admin panel styles
│   │   │   ├── win11-explorer.css    # Windows 11 File Explorer UI
│   │   │   └── animations.css        # Animations & micro-interactions
│   │   └── js/
│   │       ├── app.js
│   │       ├── auth.js
│   │       ├── admin.js              # Admin panel logic
│   │       ├── dashboard.js          # Dashboard with Chart.js
│   │       ├── fileExplorer.js       # Advanced file explorer
│   │       └── passwordStrength.js   # Password strength meter
│   └── views/
│       ├── index.html
│       ├── entry.html
│       ├── new-entry.html
│       ├── edit-entry.html
│       ├── login.html
│       ├── register.html
│       ├── dashboard.html            # User dashboard
│       └── admin/
│           ├── index.html            # Admin dashboard
│           └── users.html            # User management
├── VPS/
│   ├── vps_progress.html
│   └── vps_progress.md
├── .env.example
├── README.md
└── CHANGELOG.md
```

---

## StackPilot Overview

**StackPilot** — VPS Infrastructure Progress & Dev Journal

VPS Infrastructure Progress • Dev Journal • Production Documentation

Live at: [stackpilot.in](http://stackpilot.in)

---

## What We Have Done (StackPilot)

- [x] Ubuntu VPS provisioned and secured (SSH)
- [x] Git & GitHub integration completed
- [x] Docker & Docker Compose installed
- [x] MySQL running in Docker container
- [x] phpMyAdmin configured via Docker
- [x] Firewall (UFW) configured (ports 22, 80, 443)
- [x] Node.js v20.20.0 + npm ready
- [x] MongoDB Atlas connected & working
- [x] Express.js backend built with CRUD API
- [x] Frontend HTML/CSS/JS built
- [x] PM2 process manager installed
- [x] Nginx web server installed & configured
- [x] Server block created for stackpilot.in
- [x] SSL certificate installed (Let's Encrypt)
- [x] HTTPS enabled with auto-renewal
- [x] PM2 production server started
- [x] PM2 systemd startup enabled (auto-boot)
- [x] https://stackpilot.in is LIVE!
- [x] JWT Authentication (login/register) implemented
- [x] Admin panel with RBAC (Role-Based Access Control)
- [x] User dashboard with stats and activity charts
- [x] Security: Rate limiting, Helmet headers, CSP
- [x] WCAG 2.2 Accessibility compliance
- [x] Advanced file explorer with keyboard navigation

---

## UI/UX Enhancements (StackPilot - Completed)

- [x] Mobile responsive design implemented
- [x] Hamburger menu for mobile navigation
- [x] 5 responsive breakpoints (320px to 1280px+)
- [x] CSS variables system for design tokens
- [x] 44px minimum touch targets for accessibility
- [x] Enhanced dark theme with gradients
- [x] Improved typography with font-smoothing
- [x] Shadow system for depth (sm, md, lg, xl)
- [x] Smooth transitions and hover effects
- [x] Entry cards with gradient borders on hover

---

## Animations & Micro-interactions (StackPilot - Completed)

- [x] CSS-first animation approach (no heavy libraries)
- [x] Staggered file list entrance animations
- [x] Dropdown menu fade + slide animations
- [x] Sidebar collapse/expand transitions
- [x] Button hover micro-interactions (scale + shadow)
- [x] Tab switching fade transitions
- [x] Pinned folder entrance + hover animations
- [x] Search box focus expansion animation
- [x] Skeleton loading shimmer effect
- [x] Accessibility: prefers-reduced-motion support

### Animation Timing System

| Speed | Duration | Use Case |
|-------|----------|----------|
| Fast | 150ms | Quick micro-interactions |
| Normal | 200ms | Standard transitions |
| Slow | 300ms | Complex animations |
| Easing | cubic-bezier(0.1, 0.9, 0.2, 1.0) | Fluent Design |

### New File

```
frontend/public/css/animations.css
```

Contains all keyframe animations, utility classes, and accessibility support.

---

## Security & Authentication (StackPilot - Completed)

- [x] JWT Authentication with 7-day token expiration
- [x] User registration with email/password
- [x] Password hashing with bcryptjs (cost factor 12)
- [x] Protected API routes with auth middleware
- [x] User isolation - each user sees only their entries
- [x] Login page with error handling
- [x] Register page with password confirmation
- [x] Logout functionality in navigation
- [x] Token stored in localStorage
- [x] Auto-redirect to login if not authenticated

### Security Features

| Feature | Implementation |
|---------|---------------|
| Password Storage | bcryptjs hash (cost factor 12) |
| Token Type | JWT (JSON Web Token) |
| Token Expiry | 7 days |
| RBAC Roles | user, moderator, admin |
| Rate Limiting | 5 login attempts/15min, 100 API/min |
| Account Lockout | 30 min after 5 failed attempts |
| Security Headers | Helmet.js + CSP configured |
| User Scoping | All queries filtered by userId |

> ✔ JWT Authentication with RBAC
> ✔ Admin panel for user management
> ✔ Rate limiting and account lockout
> ✔ Helmet.js security headers enabled

---

## How We Set It Up (StackPilot)

- Containerized services using Docker
- Secrets isolated using `.env`
- Separated backend, frontend, and docs
- VPS used strictly for hosting services
- GitHub → VPS pull-based deployment

---

## MongoDB Atlas (StackPilot)

<<<<<<< HEAD
**Recommended database for StackPilot:**

- No VPS load
- Automatic backups
- Free tier sufficient for documentation
- Production-grade reliability

```text
mongodb+srv://user:pass@cluster.mongodb.net/devjournal
```

---

## Cloning & Running on VPS

### Clone Repository

```bash
cd ~
git clone https://github.com/PrathameshB59/Dev-Journal.git
cd Dev-Journal
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Docker Services

```bash
cd docker
docker compose up -d
```

---

## ngrok Usage

- [x] Allowed for development & testing
- [x] Useful for mobile testing & demos
- [ ] Not allowed for production

```bash
ngrok http 3000
```

> ⚠️ Later replaced by Nginx + domain + HTTPS

---

## Deployment Flow

**Industry Standard Deployment:**

```text
Local PC
   ↓ git push
GitHub
   ↓ git pull
VPS
   ↓ Docker / Node
Live Application
```

---

## StackPilot Roadmap

- [x] Finalize repo structure
- [x] Setup Express backend
- [x] Connect MongoDB Atlas
- [x] Build HTML UI
- [x] Add markdown rendering
- [x] Add search & tags
- [x] Add Nginx reverse proxy
- [x] Enable HTTPS for stackpilot.in
- [x] Mobile responsive UI
- [x] CSS variables system
- [x] JWT Authentication

---

## StackPilot Features Roadmap

- [x] Auto-detect code blocks in content with copy button
- [x] File explorer style UI for managing entries
- [x] Tree-view sidebar navigation
- [x] List view option with file icons
- [x] Breadcrumb navigation (Home > Category > Entry)
- [x] Syntax highlighting with Prism.js
- [x] JWT Authentication with login/register
- [x] Statistics dashboard with activity charts
- [x] Admin panel with RBAC (user/moderator/admin)
- [x] Security: Rate limiting, Helmet headers, CSP
- [x] WCAG 2.2 Accessibility (skip links, focus indicators, 44px touch targets)
- [x] Password strength meter with visual feedback
- [x] Account lockout after 5 failed login attempts
- [x] Advanced file explorer (context menu, keyboard nav, favorites)
- [ ] Markdown live preview while editing
- [ ] Export entries to Markdown/PDF
- [ ] Entry templates for different categories
- [ ] Version history for entries
- [ ] GitHub Gist backup integration
- [ ] Dark/Light mode toggle

> ✅ 14 features completed! StackPilot now has JWT auth, admin panel with RBAC, dashboard, security enhancements, and WCAG 2.2 accessibility.

---

## StackPilot Folder Structure

```text
Dev-Journal/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── adminController.js    # Admin panel actions
│   │   │   ├── authController.js
│   │   │   ├── entryController.js
│   │   │   └── statsController.js    # Dashboard stats
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── authorize.js          # RBAC authorization
│   │   │   └── security.js           # Rate limiting, Helmet, CSP
│   │   ├── models/
│   │   │   ├── Entry.js
│   │   │   └── User.js               # + role, isActive, lockout fields
│   │   └── routes/
│   │       ├── admin.js              # Admin API routes
│   │       ├── auth.js
│   │       ├── entries.js
│   │       └── stats.js              # Dashboard stats routes
│   ├── scripts/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   ├── css/
│   │   │   ├── styles.css            # + WCAG 2.2 accessibility
│   │   │   ├── admin.css             # Admin panel styles
│   │   │   ├── win11-explorer.css    # Windows 11 File Explorer UI
│   │   │   └── animations.css        # Animations & micro-interactions
│   │   └── js/
│   │       ├── app.js
│   │       ├── auth.js
│   │       ├── admin.js              # Admin panel logic
│   │       ├── dashboard.js          # Dashboard with Chart.js
│   │       ├── fileExplorer.js       # Advanced file explorer
│   │       └── passwordStrength.js   # Password strength meter
│   └── views/
│       ├── index.html
│       ├── entry.html
│       ├── new-entry.html
│       ├── edit-entry.html
│       ├── login.html
│       ├── register.html
│       ├── dashboard.html            # User dashboard
│       └── admin/
│           ├── index.html            # Admin dashboard
│           └── users.html            # User management
├── VPS/
│   ├── vps_progress.html
│   └── vps_progress.md
├── .env.example
├── README.md
└── CHANGELOG.md
```

---

## Footer

**ShopEase VPS Setup**

- Version: 1.0
- Last Updated: 03/02/2026
- Tech Stack: Ubuntu 24.04 | Docker | MySQL 8.0 | Django | Python 3.12

---

[Back to Top](#shopease-vps-progress-report)
