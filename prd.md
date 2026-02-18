Here is your **`PROJECT_REQUIREMENTS_EMAIL_VPS.md`** tailored specifically for your hardened StackPilot infrastructure and architecture (aligned with your current VPS setup and security model  and deployment structure ).

You can directly save this as:

```
/home/devuser/dev/projects/email-vps/PROJECT_REQUIREMENTS_EMAIL_VPS.md
```

---

# 📧 Email VPS – Project Requirements Document

**Version:** 1.0
**Owner:** Prathamesh B
**Environment:** Production Hardened VPS
**Status:** Planning Phase

---

# 1️⃣ Project Overview

## 1.1 Purpose

The **Email VPS Project** aims to configure and deploy a **secure, production-grade email delivery infrastructure** on the existing hardened Ubuntu VPS.

This system will be used for:

* System alerts
* Application notifications
* Transactional emails
* Security reporting
* Future SaaS email features

---

# 2️⃣ Current Infrastructure Baseline

## VPS Environment

![Image](https://res.cloudinary.com/canonical/image/fetch/f_auto%2Cq_auto%2Cfl_sanitize%2Cc_fill%2Cw_720/https%3A%2F%2Flh7-us.googleusercontent.com%2FzAd1tCZKZcw3tR49VwEYWzvcuBxgV-jFIavV83cpUceUDSrKd_aX80eXgAXk7bmizKhq8QaWvykG9nHOX8fR0bBaPcvkC9bv4c7NojHisBlfN0j_ujOJVjUXMG2Fty0GT6jnAgzO7PtIcL0wHufgbwU)

![Image](https://www.digitalocean.com/api/static-content/v1/images?src=https%3A%2F%2Fjournaldev.nyc3.cdn.digitaloceanspaces.com%2F2019%2F03%2Fnginx-reverse-proxy.png\&width=1920)

![Image](https://www.docker.com/app/uploads/2021/11/docker-containerized-and-vm-transparent-bg.png)

![Image](https://cdn.prod.website-files.com/681e366f54a6e3ce87159ca4/687d7a52cccb7374efbbf8ca_image2-49.png)

* OS: Ubuntu 24.04
* Firewall: UFW (Ports 22, 80, 443 only)
* Reverse Proxy: Nginx
* Containers: Docker (MySQL local bind)
* Node Apps: Bound to `127.0.0.1`
* Intrusion Protection: Fail2Ban
* File Monitoring: AIDE
* Audit Logging: auditd
* Malware Scanner: Active
* SSL: Let's Encrypt
* SSH: Key-based (root disabled)

Security posture already production-hardened.

---

# 3️⃣ Email VPS Objectives

## 3.1 Primary Goals

* Configure secure email sending capability
* Prevent VPS from becoming open relay
* Ensure TLS encrypted SMTP
* Integrate with Gmail SMTP relay (initial phase)
* Enable automated system reporting
* Prepare for domain-based email (Phase 2)

---

# 4️⃣ Architecture Options

## Option A – SMTP Relay (Recommended – Current Phase)

![Image](https://www.ionos.com/digitalguide/fileadmin/DigitalGuide/Schaubilder/smtp-relay-graphic.jpg)

![Image](https://groups.google.com/group/k12appstech/attach/88bbb7f2595d6/image.png?part=0.3\&view=1)

![Image](https://assets.digitalocean.com/articles/postfix-16.04/zJuFrgI.png?1=)

![Image](https://www.linode.com/docs/guides/basic-postfix-email-gateway-on-ubuntu-10-04-lucid/81-postfix-courier-mysql-02-mail-server-type-2_hu8790832921167401955.jpg)

### Flow:

Application → Postfix → Gmail SMTP → Recipient

### Advantages:

* No public port 25 exposure
* Lower spam risk
* No IP reputation management
* Quick setup
* Safe for hardened VPS

### Use Case:

System alerts, Dev-Journal, Atlas AI notifications.

---

## Option B – Full Mail Server (Future / Advanced)

Application → Postfix → Internet

### Requirements:

* PTR (reverse DNS)
* SPF
* DKIM
* DMARC
* Static IP reputation
* Spam filtering
* TLS certificates
* Open port 25

⚠ Not recommended in initial phase.

---

# 5️⃣ Functional Requirements

## 5.1 System-Level

* Postfix installed
* SMTP relay configured
* TLS enabled
* Authentication via app password
* Mail logs enabled
* Root mail forwarding configured

## 5.2 Application-Level

* Node.js email utility module
* Environment-based credentials
* Rate limiting
* Error logging
* Retry mechanism
* Template support (HTML emails)

## 5.3 Security Requirements

* No open relay
* SMTP auth required
* Firewall unchanged (no new public ports)
* Fail2Ban monitoring mail logs
* Daily integrity monitoring via AIDE

---

# 6️⃣ Non-Functional Requirements

| Category     | Requirement                |
| ------------ | -------------------------- |
| Security     | TLS encryption mandatory   |
| Performance  | < 3s delivery delay        |
| Availability | 99% uptime                 |
| Logging      | Mail logs retained 30 days |
| Monitoring   | Daily email report         |
| Scalability  | 500 emails/day (initial)   |

---

# 7️⃣ Domain & DNS Requirements (Phase 2)

If moving to domain email:

* SPF record
* DKIM signing
* DMARC policy
* Reverse DNS (PTR)
* Dedicated IP (recommended)
* Spam score validation

---

# 8️⃣ Risks & Mitigation

| Risk                     | Mitigation                |
| ------------------------ | ------------------------- |
| VPS IP blacklisting      | Use SMTP relay initially  |
| Open relay vulnerability | Strict Postfix config     |
| Credential leak          | Store in `.env`, not repo |
| Spam abuse               | Rate limit + auth         |
| TLS failure              | Enforce secure protocol   |

---

# 9️⃣ Deployment Phases

## Phase 1 – Secure Relay Setup (Current)

* Install Postfix
* Configure Gmail relay
* Enable SASL auth
* Enable TLS
* Configure root forwarding
* Test via CLI mail
* Integrate with Node app

## Phase 2 – Application Integration

* Create mail utility module
* Add notification templates
* Add error logging
* Add monitoring dashboard section

## Phase 3 – Domain Mail (Optional Future)

* Configure DKIM
* Setup SPF
* Configure DMARC
* Monitor deliverability

---

# 🔟 Acceptance Criteria

Project considered complete when:

* Email successfully sent from VPS
* Delivered to inbox (not spam)
* TLS verified
* No public SMTP port exposed
* Logs properly recorded
* Fail2Ban shows no abnormal mail abuse
* Daily report functioning

---

# 1️⃣1️⃣ Success Metrics

* 100% delivery to Gmail
* No relay errors
* No IP reputation damage
* No spam classification
* No additional attack surface

---

# 1️⃣2️⃣ Estimated Resource Impact

| Component | RAM Usage  |
| --------- | ---------- |
| Postfix   | ~40–70MB   |
| SASL      | Minimal    |
| TLS       | Negligible |
| Logs      | Low        |

Total additional load: Low impact on current 7.75GB RAM VPS.

---

# 1️⃣3️⃣ Compliance & Best Practices

* TLS 1.2+
* No plaintext auth
* No open port 25
* No public SMTP listener
* Secure credential storage
* Regular log review

---

# 1️⃣4️⃣ Final Decision

✔ Start with **SMTP Relay (Gmail)**
✔ Maintain hardened network posture
✔ No new public ports
✔ Keep VPS production-grade

---

# 🏁 Conclusion

The Email VPS project will extend the current hardened infrastructure into a secure, monitored email-capable system without compromising security posture.

It aligns with:

* Reverse proxy architecture
* Local-only service binding
* SSH hardened model
* Enterprise-grade monitoring stack

---

# 1️⃣5️⃣ Secure Email VPS Web Dashboard (Unified Multi-Page Control Plane)

## 15.1 Purpose

A unified secure web console is used to operate and monitor the Email VPS system.

This control plane provides:

* Email delivery visibility
* Retry and quota monitoring
* Security/health alerting
* Time-series operational insights

This is NOT a public mail interface.
It is a private infrastructure console for a single owner/operator with route-level deep dives.

## 15.2 Current Live State (Verified February 18, 2026)

* Domain: `mail.stackpilot.in`
* DNS: `A mail.stackpilot.in -> 72.61.251.2`
* HTTPS: active with Let's Encrypt certificate
* HTTP behavior: redirect to HTTPS
* Renewal validation: `certbot renew --dry-run` passed
* Backend bind: `127.0.0.1:8081`
* Runtime model: single Node process (`email-vps`) managed via PM2
* Auth mode: public OTP-first login with credential fallback

## 15.3 Hardened Architecture Model

```text
Internet
  -> Nginx (443)
  -> Email-VPS Service (127.0.0.1:8081)
  -> SQLite (email_vps.sqlite)
  -> Postfix (Local Only)
  -> Gmail SMTP Relay
```

Security rules:

* Backend MUST bind to localhost only
* No direct backend port exposure
* No public SMTP exposure
* No public mail send API
* All web traffic through Nginx reverse proxy

## 15.4 Authentication and Access Security

Access model:

* Primary login: email OTP (`/auth/otp/request` + `/auth/otp/verify`)
* Backup login: env-managed credentials (`/auth/login`)
* Signed HttpOnly session cookie
* Session expiry enforced
* SameSite strict cookie policy
* Optional IP allowlist enforcement (`DASHBOARD_IP_ALLOWLIST_ENABLED=true`)

Operational behavior:

* Default mode: public OTP login (`DASHBOARD_IP_ALLOWLIST_ENABLED=false`)
* Strict mode: allowlist checks operator client IP (via trusted proxy chain), not VPS IP
* OTP controls: TTL, resend cooldown, max attempts, per-IP window, and separate OTP daily quota
* Credential backup path: login rate limiting + temporary lockout on repeated failures
* Optional Nginx Basic Auth layer
* Fail2Ban monitoring remains active

Deprecation note:

* Previous split-admin JWT runtime is deprecated and no longer active.

Compatibility behavior retained:

* `/admin/*` -> redirect to `/dashboard`
* `/api/v1/admin/*` -> deprecation response

## 15.5 Functional Features (Overview + Dedicated Deep-Dive Pages)

### Overview Page (`/dashboard`)

Displays:

* Sent emails (24h)
* Failed emails (24h)
* Retry queue status
* Remaining quota (`500/day`)
* Relay health
* Risk score

### Activity Page (`/dashboard/activity`)

Displays:

* htop-like VPS background activity summary
* top processes by CPU and memory
* task state counters (running/sleeping/stopped/zombie)
* load average, uptime, memory pressure, and collector diagnostics
* 5-second auto-refresh with pause/resume controls

### Security Page (`/dashboard/security`)

Displays:

* Risk posture and source tag
* Fail2Ban/AIDE/report control signals
* System alert state matrix
* Relay error diagnostics

### Health Page (`/dashboard/health`)

Displays:

* Delivery and quota health snapshots
* Host runtime signals (CPU/memory/load/disk)
* Recent retry/failed exception timeline

### Performance Page (`/dashboard/performance`)

Displays:

* `24h` / `7d` / `30d` windows
* Throughput chart (sent/failed/retrying)
* Risk + quota trend chart
* Recent performance buckets table

### Stability Page (`/dashboard/stability`)

Displays:

* Queue pressure score and oldest age
* Active alerts count and top error signature
* Action plan panel and unstable event stream

### Programs Page (`/dashboard/programs`)

Displays:

* Systemd checks (`nginx`, `postfix`, `fail2ban`)
* PM2 inventory and status
* Docker summary
* Critical listener checks (`127.0.0.1:25`, `127.0.0.1:8081`, `80/443`)
* Metrics and snapshot worker freshness

### Mail Page (`/dashboard/mail`)

Displays:

* Relay/queue/quota diagnostics
* Top recent error codes
* Last successful delivery timestamp
* Manual mail probe trigger with cooldown guard

### Email Logs (Metadata Only)

Fields include:

* Recipient
* Category
* Status
* Attempt count
* Timestamp
* Request ID
* Error code/message (if any)

No message body content is exposed in dashboard logs.

### Security and Alerts (Cross-Page)

Displays:

* Fail2Ban signal status
* AIDE baseline signal
* Disk and metric freshness
* Daily report signal
* Relay/SMTP-related alerts

## 15.6 Responsive UX Completion (All Devices)

Responsive dashboard upgrade completed while preserving overview and adding dedicated pages:

* Stacked mobile flow implemented
* Horizontal overflow/cropping issues resolved
* Viewport-aware chart behavior (legend/ticks/animation tuning)
* Mobile log readability improved with labeled row layout
* Touch target and focus visibility improvements added
* Local favicon asset added (favicon 404 removed)
* Shared section navigation added across all dashboard routes

## 15.7 Active Dashboard API Surface

Auth endpoints:

* `POST /auth/otp/request`
* `POST /auth/otp/verify`
* `POST /auth/login` (backup)
* `POST /auth/logout`
* `GET /auth/session`

* `GET /api/v1/dashboard/overview`
* `GET /api/v1/dashboard/trends?window=24h|7d|30d`
* `GET /api/v1/dashboard/timeseries?window=24h|7d|30d`
* `GET /api/v1/dashboard/insights?window=24h|7d|30d`
* `GET /api/v1/dashboard/logs?status=&category=&severity=&q=`
* `GET /api/v1/dashboard/alerts`
* `GET /api/v1/dashboard/security`
* `GET /api/v1/dashboard/activity`
* `GET /api/v1/dashboard/programs`
* `GET /api/v1/dashboard/mail-check`
* `POST /api/v1/dashboard/mail-probe`

Active dashboard page routes:

* `/dashboard`
* `/dashboard/activity`
* `/dashboard/security`
* `/dashboard/health`
* `/dashboard/performance`
* `/dashboard/stability`
* `/dashboard/programs`
* `/dashboard/mail`

Mail API security contract remains unchanged:

* `/api/v1/mail/*` stays local-only + bearer token

## 15.8 Data Storage Strategy

SQLite path:

`/home/devuser/dev/email-vps/data/email_vps.sqlite`

Active tables include:

* `mail_queue`
* `mail_events`
* `daily_quota`
* `system_alert_state`
* `dashboard_metric_snapshots`
* `dashboard_otp_challenges`
* `dashboard_otp_daily_quota`

Snapshot history retention: 90 days with cleanup automation.

Legacy admin-related tables may remain for rollback safety but are not used for active auth flow.

## 15.9 Security Compliance Requirements

The dashboard MUST NOT:

* Open port 25 publicly
* Expose SQLite/MySQL publicly
* Allow unauthenticated dashboard access
* Allow public mail sending endpoints
* Bypass reverse proxy enforcement

Required posture:

* UFW active
* Fail2Ban active
* Root SSH disabled
* Services localhost-bound where required
* Only ports `22` / `80` / `443` public

## 15.10 Monitoring and Logging

Observability sources:

* Nginx access/error logs
* SQLite event/audit records
* Dashboard metric snapshots
* Fail2Ban and daily VPS report signals

Dashboard auth events are auditable and included in operational review.

OTP delivery controls are independent from normal mail quota:

* OTP daily quota is separate from the `500/day` mail send quota.
* OTP request/verify paths enforce cooldown, max attempts, and expiry.

Cron policy:

* Legacy `/opt/stackpilot-monitor` references are deprecated.
* Active metrics cron uses `/home/devuser/dev/email-vps/generate_metrics.sh`.
* Cron mail noise is suppressed with `MAILTO=""`; failures are surfaced via dashboard alerts/logs.

## 15.11 Future Enhancements (Pending)

* Email template editor
* CSV export for dashboard logs
* Alert threshold configuration UI
* Multi-project email segmentation
* SES/SendGrid migration support
* Telegram real-time alerts

## 15.12 Strategic Objective

The Secure Email VPS Dashboard provides a controlled, observable, infrastructure-grade email operations platform.

It improves operational visibility while preserving hardened production security and avoiding additional public attack surface.
