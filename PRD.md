# The Nest — Product Requirements Document (PRD)

**Version**: 1.2  
**Date**: 7 March 2026  
**Status**: ✅ Implementation started — pending: 3 host names, welcome message copy

---

## 1. Product Overview

### 1.1 Product Name
**The Nest**（雀巢）

### 1.2 Summary
The Nest is an internal event booking web application for a single party room in Hong Kong. A single staff member logs in with a PIN code, browses availability on a monthly calendar, selects hourly slots, and creates event bookings assigned to one of a fixed set of member hosts. Bookings are stored permanently in a PostgreSQL database. The site is entirely private (PIN-gated) and presented in Traditional Chinese.

### 1.3 Business Context
- **Venue**: 旺角新填地街576號新輝商業中心3樓A室
- **Operating Hours**: 24 hours, 7 days a week
- **Rooms**: One party room
- **Target User**: One staff member / admin

---

## 2. Goals & Non-Goals

### Goals
- Provide a smooth, intuitive interface to create and manage hourly room bookings
- Display a monthly calendar with clear availability indicators
- Store all bookings permanently for historical reference
- Produce a shareable booking confirmation (copy-paste to WhatsApp)
- Deliver a warm, cozy, playful, and professional visual experience

### Non-Goals
- Multi-user registration or user accounts
- Payment processing or invoicing
- Automated notifications (email / SMS / WhatsApp push)
- Multiple rooms or locations
- Editing existing bookings (only cancellation is supported)
- Public calendar access (entire site is PIN-gated)

---

## 3. User & Access Model

### 3.1 Single User
There is exactly **one** user account — the site owner / staff member.

| Attribute | Detail |
|---|---|
| Login method | PIN code only (no username) |
| PIN storage | Hardcoded in server-side environment config (bcrypt-hashed at runtime) |
| PIN changeable | No — requires a config/env update and redeploy |
| Session | No timeout; stays logged in until the user manually logs out |
| Session storage | Server-side session or signed JWT cookie |

### 3.2 Hosts
Hosts are **not user accounts**. They are a fixed name list used as a metadata field on bookings (e.g., who is responsible for / hosting the event).

| # | Name |
|---|---|
| 1 | Andrew |
| 2 | 師傅 |
| 3 | 燊 |
| 4 | Yandy |
| 5 | Victor |
| 6 | Cindy |
| 7 | Cathy |
| 8 | _(TBD)_ |
| 9 | _(TBD)_ |
| 10 | _(TBD)_ |

> **Note**: Hosts are hardcoded in the database seed / config. There is no in-app UI to add or remove hosts.
> 3 additional host names will be added to seed when provided (currently 7 active hosts).

---

## 4. Site Architecture — Pages

| # | Page | Route | Access |
|---|---|---|---|
| 1 | Landing Page | `/` | Public (PIN-gated entry point) |
| 2 | Login Page | `/login` | Public |
| 3 | Event Calendar | `/calendar` | Authenticated |
| 4 | Booking Confirmation | `/confirmation` | Authenticated (post-booking) |
| 5 | Booking Logbook | `/logbook` | Authenticated |

> There is **no** Host management page. Hosts are managed at the data/config level.

---

## 5. Page Specifications

### 5.1 Landing Page (`/`)

**Purpose**: First impression — sets the mood/brand of The Nest.

**Content**:
- Full-width hero section with bold The Nest branding
- Warm, playful mood copy in Traditional Chinese (taglines themed around gathering, warmth, The Nest)
- Single prominent CTA button: 「立即預訂」(Book Now) → navigates to `/login`
- Subtle ambient animation (e.g., gentle floating particles, warm light pulse, or parallax background)
- No navigation bar — focused, single-action page

**Design Notes**:
- Full-viewport hero, no scroll required on desktop
- Animated entrance (fade-in staggered text + button)
- Background: warm textured gradient (terracotta/cream tones)

---

### 5.2 Login Page (`/login`)

**Purpose**: PIN code authentication.

**Content**:
- The Nest logo / wordmark
- PIN input (single field, masked, numeric only)
- 「進入」(Enter) button
- Error state: inline message for wrong PIN (e.g., 「密碼錯誤，請再試」)
- Success state: brief success animation → redirect to `/calendar`

**Behaviour**:
- Input accepts 4–6 digits
- Server validates PIN against bcrypt hash
- On success: set session cookie, redirect to `/calendar`
- On failure: show error, reset input, allow retry (no lockout)
- No username field, no "forgot PIN" flow

---

### 5.3 Event Calendar (`/calendar`)

**Purpose**: Main hub — browse all bookings, see availability, and initiate a new booking.

#### 5.3.1 Calendar View
- **Layout**: Full monthly grid view (Mon–Sun columns)
- **Navigation**: `< Prev` / `Next >` arrows + current month/year header
- **Today**: Highlighted with warm accent colour
- **Day cell indicators**:
  - No bookings: plain
  - Has bookings: small coloured dot or partial fill to signal activity
- **Past days**: Dimmed but still clickable (can view history)

#### 5.3.2 Day Detail — Click on any Day
Clicking a day opens a **modal / side drawer** containing:

**A. Events for the Day**
- List of all existing bookings for that date
- Each entry shows: time slot(s) | event name | host | open/close badge

**B. Slot Grid**
- 24 hourly slots displayed (00:00 – 23:00)
- Each slot shows its status:
  - 🟢 Available — clickable, selectable
  - 🔴 Booked — disabled, shows which event it belongs to
- User clicks one or more **available** slots to select them (multi-select)
- Selected slots highlighted with warm accent

**C. Proceed to Book**
- A sticky「建立預訂」(Create Booking) button appears once ≥ 1 slot is selected
- Shows count of selected slots (e.g., 「已選擇 3 個時段」)
- Tapping it opens the **Booking Form** (modal or next step in the same drawer)

**Rules**:
- Slots must be on the **same calendar day** (one booking = one day)
- Non-consecutive slots allowed (e.g., 14:00 + 18:00 = valid, one booking)
- Cannot select already-booked slots

---

### 5.4 Booking Form (Modal, triggered from Day Detail)

**Purpose**: Collect the three required booking fields and submit.

**Fields**:

| Field | Type | Required | Notes |
|---|---|---|---|
| 活動名稱 Event Name | Text input | ✅ | Free text |
| 負責人 Host | Dropdown | ✅ | List of 7–10 hosts |
| 狀態 Status | Toggle / Radio | ✅ | 開放 (Open) / 私人 (Close) |

**Display (read-only, pre-filled)**:
- Selected date
- Selected time slots (listed clearly, e.g., 14:00–15:00 / 18:00–19:00)

**Behaviour**:
- All three fields required; inline validation on submit
- Submit button: 「確認預訂」(Confirm Booking)
- On success: navigate to `/confirmation` with booking data
- On error: show API error inline

**Note on Status field**:
- Open/Close is purely a metadata label — no visibility or access control logic is applied

---

### 5.5 Booking Confirmation (`/confirmation`)

**Purpose**: Show booking summary; provide shareable text for WhatsApp.

**Display Content**:

```
✅ 預訂成功！

活動：{Event Name}
日期：{Date}
時段：{Time Slot(s)}
地址：旺角新填地街576號新輝商業中心3樓A室

{Warm welcome message in Traditional Chinese — TBD}
```

**Actions**:
- 「複製資訊」(Copy to Clipboard) — copies the sharing text above
- 「返回日曆」(Back to Calendar) — navigates to `/calendar`

**Sharing text format (when copied)**:
> Date · Time(s) · Event Name · Address

Hosts, status, and other metadata are **not** included in the copied text.

**Design**: Celebratory warm tone — success icon animation, confetti or sparkle effect on load.

---

### 5.6 Booking Logbook (`/logbook`)

**Purpose**: View all bookings (past and future); cancel bookings.

**Layout**: Card list or table

**Columns / Fields per entry**:
| Field | Display |
|---|---|
| 日期 Date | Full date |
| 時段 Time Slot(s) | All slots for this booking |
| 活動名稱 Event Name | — |
| 負責人 Host | — |
| 狀態 Status | Open / Close badge |
| 操作 Action | 「取消」(Cancel) button |

**Sorting**: By event date, **latest first** (most recent at top)

**Cancellation Flow**:
1. User taps「取消」
2. Confirmation dialog: 「確定取消此預訂？」with 確定 / 返回 buttons
3. On confirm → booking is **permanently deleted** from database; slots freed
4. Entry disappears from logbook (no soft-delete / no cancelled state shown)
5. Brief success toast: 「預訂已取消」

**Navigation**: Accessible from Calendar page via top nav link

---

## 6. Booking Data Model

### 6.1 Business Rules
- One booking covers **one calendar day** (no overnight/cross-day bookings)
- One booking may contain **multiple slots** on that day (including non-consecutive)
- Each slot is one hour
- No two bookings may share the same date + time slot (unique constraint)
- Bookings cannot be edited — only cancelled (deleted)

### 6.2 Database Schema (PostgreSQL)

```sql
-- Hosts (seeded, not user-managed)
CREATE TABLE hosts (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Admin PIN
CREATE TABLE admin_config (
  id        SERIAL PRIMARY KEY,
  pin_hash  VARCHAR(255) NOT NULL,  -- bcrypt hash
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id          SERIAL PRIMARY KEY,
  event_name  VARCHAR(255) NOT NULL,
  host_id     INTEGER NOT NULL REFERENCES hosts(id),
  status      VARCHAR(10) NOT NULL CHECK (status IN ('open', 'close')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Slots (each row = one 1-hour slot belonging to a booking)
CREATE TABLE booking_slots (
  id          SERIAL PRIMARY KEY,
  booking_id  INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  slot_date   DATE NOT NULL,
  slot_hour   SMALLINT NOT NULL CHECK (slot_hour >= 0 AND slot_hour <= 23),
  UNIQUE (slot_date, slot_hour)  -- prevent double-booking
);
```

> Deleting a booking cascades to delete all its slots automatically.

---

## 7. Technical Architecture

### 7.1 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | **Next.js 14** (App Router) | Full-stack in one repo; API routes + SSR; easy Vercel deployment |
| Styling | **Tailwind CSS** + CSS variables | Utility-first; supports custom design tokens |
| Animations | **Framer Motion** | Declarative, smooth, performant React animations |
| Database | **PostgreSQL** | Permanent storage; relational integrity for slots |
| ORM | **Prisma** | Type-safe DB access; schema migrations |
| Auth | Server-side session via `iron-session` or `next-auth` (credentials) | Simple PIN session, no OAuth needed |
| PIN security | **bcrypt** | Hash PIN at rest; compare on login |
| Language | **TypeScript** | Type safety across full stack |
| Icons | **Lucide React** | Clean, consistent icon set |

### 7.2 Project Structure (Next.js App Router)

```
/the-nest
├── app/
│   ├── page.tsx                  # Landing Page
│   ├── login/page.tsx            # Login Page
│   ├── calendar/page.tsx         # Event Calendar
│   ├── confirmation/page.tsx     # Booking Confirmation
│   ├── logbook/page.tsx          # Booking Logbook
│   └── api/
│       ├── auth/route.ts         # PIN login / logout
│       ├── bookings/
│       │   ├── route.ts          # GET all / POST create
│       │   └── [id]/route.ts     # DELETE cancel
│       ├── slots/route.ts        # GET availability for a date
│       └── hosts/route.ts        # GET host list
├── components/
│   ├── Calendar/
│   ├── DayModal/
│   ├── BookingForm/
│   ├── ConfirmationCard/
│   └── LogbookTable/
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # Session helpers
│   └── constants.ts              # Address, welcome message
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # Seeds hosts + admin PIN
└── middleware.ts                 # Route protection (redirect to /login if unauthenticated)
```

### 7.3 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Validate PIN, create session |
| `POST` | `/api/auth/logout` | Destroy session |
| `GET` | `/api/hosts` | Return list of host names |
| `GET` | `/api/slots?date=YYYY-MM-DD` | Return booked slots for a date |
| `GET` | `/api/bookings` | Return all bookings (for logbook) |
| `POST` | `/api/bookings` | Create new booking with slots |
| `DELETE` | `/api/bookings/[id]` | Cancel (permanently delete) booking |

### 7.4 Auth & Security
- PIN is stored as a bcrypt hash (cost factor 12) in `admin_config` table
- All `/calendar`, `/logbook`, `/confirmation`, `/api/*` routes are protected by `middleware.ts`
- Session cookie is `httpOnly`, `secure`, `sameSite: lax`
- No rate limiting needed (single trusted user, internal tool)
- Database queries use Prisma parameterised queries (no SQL injection risk)

### 7.5 Deployment

| Service | Purpose |
|---|---|
| **Vercel** | Next.js hosting (frontend + API routes serverless) |
| **Neon / Supabase / Railway** | Managed PostgreSQL |
| Environment variables | `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PIN_HASH` |

---

## 8. Design System

### 8.1 Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#E8704A` | CTA buttons, active states, highlights |
| `--color-primary-dark` | `#C95A38` | Button hover, pressed states |
| `--color-bg` | `#F5F1E8` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, modals |
| `--color-gold` | `#C9A961` | Accents, premium details, borders |
| `--color-text` | `#3C3C3C` | Body text |
| `--color-text-muted` | `#8C8070` | Secondary text, labels |
| `--color-available` | `#A8B49F` | Available slots |
| `--color-booked` | `#E8704A` | Booked slots |
| `--color-selected` | `#FDDBB0` | Selected (active choice) slots |
| `--color-open-badge` | `#A8D5A2` | Open status badge |
| `--color-close-badge` | `#F4B8A0` | Close status badge |

### 8.2 Typography

| Role | Font | Weight |
|---|---|---|
| Display / Hero | Noto Serif TC (Traditional Chinese), Poppins (EN) | 700 |
| Headings | Noto Sans TC, Inter | 600 |
| Body | Noto Sans TC, Inter | 400 |
| Labels / Caps | Noto Sans TC, Inter | 500 |

> Noto Sans/Serif TC ensures correct Traditional Chinese glyph rendering.

### 8.3 Animation Specs

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Page enter | Fade-in + slide-up (Y: 20px → 0) | 400ms | `easeOut` |
| Hero text | Staggered fade-in per line | 600ms, 100ms stagger | `easeOut` |
| Button hover | Scale 1.0 → 1.04, colour shift | 150ms | `easeInOut` |
| Modal open | Backdrop fade + content slide-down | 300ms | `spring(stiffness: 300, damping: 30)` |
| Slot selection | Background colour transition + scale 0.97 | 120ms | `easeInOut` |
| Success (confirmation) | Pulse icon → confetti burst | 600ms | `spring` |
| Calendar day hover | Soft background fill | 150ms | `easeOut` |
| Toast notification | Slide-in from bottom | 250ms | `easeOut` |

### 8.4 Component Notes
- **Rounded corners**: `border-radius: 16px` for cards, `12px` for inputs/buttons, `8px` for badges
- **Shadows**: Soft, warm `box-shadow: 0 4px 24px rgba(200, 120, 60, 0.08)`
- **Spacing**: 8px base unit grid

---

## 9. User Flows (Finalized)

### Flow 1 — Create a Booking
```
Landing Page (/)
  → Click CTA 「立即預訂」
  → Login Page (/login)
  → Enter PIN → Correct
  → Calendar Page (/calendar)
  → Click on a date
  → Day modal opens: see existing events + slot grid
  → Click available slots (multi-select, same day only)
  → Click 「建立預訂」
  → Booking Form (modal): fill Event Name, Host, Status
  → Click 「確認預訂」
  → Confirmation Page (/confirmation)
  → Copy sharing text or return to Calendar
```

### Flow 2 — Cancel a Booking
```
Calendar Page (/calendar)
  → Click 「預訂記錄」 (Logbook nav link)
  → Logbook (/logbook): list sorted by date, latest first
  → Find booking → Click 「取消」
  → Confirmation dialog: 「確定取消此預訂？」
  → Click 「確定」
  → Booking deleted, slots freed, entry removed from list
  → Toast: 「預訂已取消」
```

### Flow 3 — Logout
```
Any authenticated page
  → Click 「登出」 in navigation
  → Session destroyed
  → Redirect to Landing Page (/)
```

---

## 10. Copy & Content (Traditional Chinese)

### Navigation
| English | Traditional Chinese |
|---|---|
| Calendar | 預訂日曆 |
| Logbook | 預訂記錄 |
| Logout | 登出 |
| Login | 登入 |

### Actions
| English | Traditional Chinese |
|---|---|
| Book Now (CTA) | 立即預訂 |
| Create Booking | 建立預訂 |
| Confirm Booking | 確認預訂 |
| Cancel Booking | 取消預訂 |
| Back to Calendar | 返回日曆 |
| Copy Info | 複製資訊 |

### Status Labels
| English | Traditional Chinese |
|---|---|
| Open | 開放 |
| Close | 私人 |
| Available | 可預訂 |
| Booked | 已預訂 |

### Confirmation Page Welcome Message
> ⏳ **Pending** — User to provide or approve draft  
> Proposed draft: 「歡迎來到 The Nest！🪺 期待與您共度美好時光，祝您活動順利、歡聚愉快！」

### Landing Page Mood Copy (Proposed Drafts)
- **Hero headline**: 「歡迎回家，這裡是 The Nest 🪺」
- **Sub-headline**: 「聚在一起，每一刻都值得記住」
- **Tagline 1**: 「您的專屬聚腳點，由今日開始」
- **Tagline 2**: 「不只是一個地方，是大家的小天地」

> All copy is in Traditional Chinese. English only used for the brand name "The Nest."

---

## 11. Constraints & Assumptions

| # | Item |
|---|---|
| C1 | Only one staff user will ever use the system |
| C2 | Hosts are static; no in-app host CRUD |
| C3 | PIN is hardcoded in server config — irreversible without redeployment |
| C4 | Bookings cannot be edited, only cancelled |
| C5 | A booking is always within a single calendar day |
| C6 | No real-time sync needed (single user, no concurrency issues) |
| C7 | No public-facing access — entire site behind PIN login |
| C8 | No payment, billing, or invoice features |
| C9 | Sharing is manual copy-paste — no auto WhatsApp integration |

---

## 12. Open Items

| # | Item | Owner | Status |
|---|---|---|---|
| O1 | Complete host list (3 more names) | User | ⏳ Pending |
| O2 | Approve / edit welcome message for confirmation page | User | ⏳ Pending |
| O3 | Confirm final hosting platform | User | ✅ Tencent Cloud (SSH access available for PostgreSQL) |
| O4 | PIN code for admin login | User | ✅ Configured in `.env.local` — not stored in repo |

---

## 13. Implementation Phases

### Phase 1 — Foundation (Setup + Design System)
- Next.js project scaffold with TypeScript + Tailwind CSS
- Design tokens, fonts, global styles
- Prisma schema + PostgreSQL connection
- Database seed (hosts + PIN)
- Auth middleware (session, PIN login/logout)
- Landing Page + Login Page

### Phase 2 — Calendar & Availability
- Monthly calendar component
- Day detail modal with slot grid
- API: fetch booked slots for a date
- Slot selection logic (multi-select, same-day constraint)

### Phase 3 — Booking Flow
- Booking form (event name, host dropdown, open/close toggle)
- API: create booking + slots
- Booking confirmation page + copy-to-clipboard

### Phase 4 — Logbook & Management
- Booking logbook: fetch all bookings, sort by date desc
- API: cancel (delete) booking
- Cancellation confirmation dialog + toast feedback

### Phase 5 — Polish & Deployment
- Framer Motion animations (all pages and interactions)
- Responsive layout (mobile + desktop)
- Error states, loading states, empty states
- End-to-end testing
- Vercel + PostgreSQL deployment setup

---

*PRD prepared by GitHub Copilot · The Nest · March 2026*

---

## 14. Implementation Kickoff — Engineering Brief

> This section is written from the perspective of the lead full-stack engineer taking over the project. It is a precise, zero-ambiguity technical brief covering environment setup, conventions, architecture decisions, and the exact sequence of work to deliver Phase 1.

---

### 14.1 Prerequisites (Environment)

Before writing a single line of application code, the following must be in place:

```
Node.js      >= 20.x LTS
npm          >= 10.x
PostgreSQL   >= 15  (local dev via Docker or Neon free tier)
Git          configured + GitHub repo (acgitprojects/TheNest)
```

Recommended local PostgreSQL setup via Docker (no local install needed):

```bash
docker run --name thenest-db \
  -e POSTGRES_USER=thenest \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=thenest \
  -p 5432:5432 \
  -d postgres:15-alpine
```

---

### 14.2 Project Scaffold

```bash
# Bootstrap Next.js 14 with App Router + TypeScript + Tailwind CSS
npx create-next-app@latest the-nest \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd the-nest

# Install all production dependencies in one shot
npm install \
  prisma @prisma/client \
  iron-session \
  bcryptjs \
  framer-motion \
  lucide-react \
  clsx \
  tailwind-merge \
  date-fns \
  react-hot-toast

# Install dev dependencies
npm install -D \
  @types/bcryptjs \
  prisma
```

---

### 14.3 Environment Variables

Create `.env.local` (never commit this):

```env
# PostgreSQL connection (Prisma)
DATABASE_URL="postgresql://thenest:devpassword@localhost:5432/thenest"

# iron-session secret — generate with: openssl rand -base64 32
SESSION_SECRET="replace-with-32-char-random-string"

# Admin PIN — stored as bcrypt hash at runtime, but raw value needed for seed
# Generate hash: node -e "const b=require('bcryptjs');console.log(b.hashSync('YOUR_PIN',12))"
ADMIN_PIN_HASH="$2a$12$..."
```

Create `.env.example` (committed — documents required vars without values):

```env
DATABASE_URL=
SESSION_SECRET=
ADMIN_PIN_HASH=
```

---

### 14.4 Prisma Setup & Schema

```bash
npx prisma init --datasource-provider postgresql
```

Replace `prisma/schema.prisma` with the canonical schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Host {
  id       Int       @id @default(autoincrement())
  name     String    @db.VarChar(100)
  bookings Booking[]
}

model AdminConfig {
  id        Int      @id @default(autoincrement())
  pinHash   String   @db.VarChar(255)
  createdAt DateTime @default(now())
}

model Booking {
  id        Int           @id @default(autoincrement())
  eventName String        @db.VarChar(255)
  host      Host          @relation(fields: [hostId], references: [id])
  hostId    Int
  status    BookingStatus
  slots     BookingSlot[]
  createdAt DateTime      @default(now())
}

model BookingSlot {
  id        Int      @id @default(autoincrement())
  booking   Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  bookingId Int
  slotDate  DateTime @db.Date
  slotHour  Int      // 0–23

  @@unique([slotDate, slotHour]) // prevents double-booking
}

enum BookingStatus {
  open
  close
}
```

Run initial migration:

```bash
npx prisma migrate dev --name init
```

---

### 14.5 Database Seed

`prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Seed hosts
  const hosts = [
    'Andrew', '師傅', '燊', 'Yandy', 'Victor', 'Cindy', 'Cathy',
    // Add remaining 3 when confirmed:
    // 'Host8', 'Host9', 'Host10',
  ]
  for (const name of hosts) {
    await prisma.host.upsert({
      where: { id: hosts.indexOf(name) + 1 },
      update: { name },
      create: { name },
    })
  }

  // Seed admin PIN (reads from env — never hardcode in source)
  const pinHash = process.env.ADMIN_PIN_HASH
  if (!pinHash) throw new Error('ADMIN_PIN_HASH env var is required for seeding')
  await prisma.adminConfig.upsert({
    where: { id: 1 },
    update: { pinHash },
    create: { pinHash },
  })

  console.log('✅ Seed complete')
}

main().finally(() => prisma.$disconnect())
```

Add to `package.json`:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Run: `npx prisma db seed`

---

### 14.6 Design System — Token Setup

`src/styles/globals.css` — define all custom tokens under `:root`:

```css
@layer base {
  :root {
    --color-primary:       #E8704A;
    --color-primary-dark:  #C95A38;
    --color-bg:            #F5F1E8;
    --color-surface:       #FFFFFF;
    --color-gold:          #C9A961;
    --color-text:          #3C3C3C;
    --color-text-muted:    #8C8070;
    --color-available:     #A8B49F;
    --color-booked:        #E8704A;
    --color-selected:      #FDDBB0;
    --color-open-badge:    #A8D5A2;
    --color-close-badge:   #F4B8A0;
    --radius-card:         16px;
    --radius-input:        12px;
    --radius-badge:        8px;
    --shadow-warm:         0 4px 24px rgba(200, 120, 60, 0.08);
  }
}
```

`tailwind.config.ts` — extend with tokens:

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:    'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        bg:         'var(--color-bg)',
        surface:    'var(--color-surface)',
        gold:       'var(--color-gold)',
        'text-main':'var(--color-text)',
        muted:      'var(--color-text-muted)',
        available:  'var(--color-available)',
        booked:     'var(--color-booked)',
        selected:   'var(--color-selected)',
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'Inter', 'sans-serif'],
        serif: ['Noto Serif TC', 'Poppins', 'serif'],
      },
      boxShadow: {
        warm: 'var(--shadow-warm)',
      },
      borderRadius: {
        card:  'var(--radius-card)',
        input: 'var(--radius-input)',
        badge: 'var(--radius-badge)',
      },
    },
  },
  plugins: [],
} satisfies Config
```

Load Google Fonts in `src/app/layout.tsx`:

```typescript
import { Inter, Noto_Sans_TC, Noto_Serif_TC } from 'next/font/google'

const notoSans = Noto_Sans_TC({ subsets: ['latin'], weight: ['400', '500', '600'] })
const notoSerif = Noto_Serif_TC({ subsets: ['latin'], weight: ['700'] })
```

---

### 14.7 Auth Layer

`src/lib/session.ts`:

```typescript
import { getIronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  isLoggedIn: boolean
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'thenest_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions)
}
```

`src/middleware.ts` — protect all authenticated routes:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'

const PUBLIC_PATHS = ['/', '/login', '/api/auth/login']

export async function middleware(req: NextRequest) {
  if (PUBLIC_PATHS.some(p => req.nextUrl.pathname === p)) {
    return NextResponse.next()
  }
  const res = NextResponse.next()
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return res
}

export const config = {
  matcher: ['/calendar/:path*', '/logbook/:path*', '/confirmation/:path*', '/api/bookings/:path*', '/api/hosts/:path*', '/api/slots/:path*'],
}
```

---

### 14.8 API Route Contracts

All API routes live under `src/app/api/`. They return JSON and follow these conventions:
- **Success**: `{ data: ... }` with appropriate 2xx status
- **Error**: `{ error: "message" }` with 4xx/5xx status
- **Auth check**: Every protected route calls `getSession()` and returns 401 if not logged in

**Route map:**

```
POST   /api/auth/login           { pin }             → { ok: true }
POST   /api/auth/logout          (no body)           → { ok: true }
GET    /api/hosts                                    → { data: Host[] }
GET    /api/slots?date=YYYY-MM-DD                    → { data: number[] }  (booked hours)
GET    /api/bookings                                 → { data: BookingWithSlots[] }
POST   /api/bookings             { eventName, hostId, status, date, hours: number[] }
                                                     → { data: Booking }
DELETE /api/bookings/[id]                            → { ok: true }
```

---

### 14.9 Component Architecture

Build components bottom-up. Every component is:
- A pure TypeScript React function component
- Styled with Tailwind, animated with Framer Motion
- Receives typed props — no `any`

**Priority build order:**

```
1. <PinInput />           — PIN field with masked input + shake animation on error
2. <CalendarGrid />       — Month view, receives bookingDates: string[] for dot indicators
3. <DayModal />           — Slide-up drawer with slot grid + event list
4. <SlotGrid />           — 24 hourly slots; receives bookedHours[], selectedHours[]
5. <BookingForm />        — Event name + host dropdown + status toggle
6. <ConfirmationCard />   — Booking summary + copy button
7. <LogbookList />        — Sorted booking cards with cancel action
8. <ConfirmDialog />      — Reusable confirmation modal
9. <Toast />              — Handled by react-hot-toast
10. <Nav />               — Authenticated top nav (Calendar | Logbook | Logout)
```

---

### 14.10 File & Naming Conventions

| Convention | Rule |
|---|---|
| Components | `PascalCase.tsx` in `src/components/ComponentName/index.tsx` |
| API routes | `src/app/api/resource/route.ts` |
| Pages | `src/app/route/page.tsx` |
| Lib utilities | `camelCase.ts` in `src/lib/` |
| Types | Defined in `src/types/index.ts`, exported as named interfaces |
| Constants | `src/lib/constants.ts` — address, welcome message, host seed data |
| Env access | Only in `src/lib/` or API routes — never in client components |

---

### 14.11 Strict Quality Rules

1. **No `any`** — use `unknown` and narrow with guards
2. **Server / Client boundary** — mark all client-interactive components with `'use client'`; keep API calls and DB access in Server Components or API routes only
3. **No secrets on the client** — `ADMIN_PIN_HASH`, `SESSION_SECRET`, `DATABASE_URL` are server-only; never referenced in client components
4. **Parameterised queries only** — all DB access through Prisma (no raw SQL unless using `$queryRaw` with template literals, never string concatenation)
5. **Input validation** — validate all POST body fields in API routes before touching the DB; return 400 for invalid input
6. **Error boundaries** — wrap major page sections in Next.js `error.tsx` files

---

### 14.12 Git Workflow

```bash
# One feature branch per phase
git checkout -b phase/1-foundation
git checkout -b phase/2-calendar
git checkout -b phase/3-booking-flow
git checkout -b phase/4-logbook
git checkout -b phase/5-polish

# Commit message format
feat: add PIN login API route
feat: build CalendarGrid component
fix: prevent double-booking on concurrent slot submit
style: apply warm colour tokens to DayModal
chore: seed hosts into database
```

---

### 14.13 Phase 1 Completion Checklist

Before moving to Phase 2, every item below must be done:

- [ ] `npx prisma migrate dev` runs cleanly against local Postgres
- [ ] `npx prisma db seed` populates 7 hosts + hashed PIN
- [ ] `POST /api/auth/login` with correct PIN returns session cookie
- [ ] `POST /api/auth/login` with wrong PIN returns 401
- [ ] `middleware.ts` redirects unauthenticated requests from `/calendar` to `/login`
- [ ] Landing Page renders with hero, animated text, and CTA button
- [ ] Login Page renders PIN input; correct PIN redirects to `/calendar`; wrong PIN shows error
- [ ] Design tokens applied: correct background colour (`#F5F1E8`), fonts (`Noto Sans TC`), primary colour (`#E8704A`)
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] `npm run lint` passes with zero ESLint errors
