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
- [What We Will Do Next (StackPilot)](#what-we-will-do-next-stackpilot)
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
- [x] Firewall (UFW) reviewed
- [x] Node.js environment planned
- [x] MongoDB Atlas selected as primary DB

---

## How We Set It Up

- Used Docker for database isolation
- Kept secrets outside Git using `.env`
- Separated backend, frontend, and docs
- Used VPS only for services (not as desktop)
- Adopted GitHub → VPS pull workflow

---

## What We Will Do Next (Dev-Journal)

- [ ] Initialize Express backend
- [ ] Connect MongoDB Atlas
- [ ] Create Docs API (CRUD)
- [ ] Build HTML UI
- [ ] Add markdown rendering
- [ ] Add search & tags
- [ ] Add Nginx reverse proxy
- [ ] Attach domain + HTTPS

---

## Dev-Journal Folder Structure

```text
Dev-Journal/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   └── modules/
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── public/
│   └── views/
│       └── progress.html
├── docs/
│   ├── daily/
│   ├── docker/
│   ├── linux/
│   └── database/
├── docker/
│   └── docker-compose.yml
├── scripts/
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
- [x] Firewall (UFW) reviewed and aligned
- [x] Node.js backend architecture planned
- [x] MongoDB Atlas selected as primary database

---

## How We Set It Up (StackPilot)

- Containerized databases using Docker
- Environment variables isolated via `.env`
- Strict separation of backend, frontend, and docs
- VPS used as service host (not desktop)
- GitHub → VPS pull-based deployment workflow

---

## What We Will Do Next (StackPilot)

- [ ] Initialize Express backend
- [ ] Connect MongoDB Atlas
- [ ] Build Docs CRUD APIs
- [ ] Create HTML documentation UI
- [ ] Add markdown rendering
- [ ] Implement search & tagging
- [ ] Configure Nginx reverse proxy
- [ ] Enable HTTPS for stackpilot.in

---

## StackPilot Folder Structure

```text
Dev-Journal/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   └── modules/
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── public/
│   └── views/
│       └── progress.html
├── docs/
│   ├── daily/
│   ├── docker/
│   ├── linux/
│   └── database/
├── docker/
│   └── docker-compose.yml
├── scripts/
├── .env.example
├── README.md
└── CHANGELOG.md
```

---

## Footer

**ShopEase VPS Setup**

- Version: 1.0
- Last Updated: 2026
- Tech Stack: Ubuntu 24.04 | Docker | MySQL 8.0 | Django | Python 3.12

---

[Back to Top](#shopease-vps-progress-report)
