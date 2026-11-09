# 🌿 Graced Relationship Recipes

> **Biblical Relationship Wisdom, Daily Devotionals & Evangelical Media Platform**  
> Designed and engineered for **Anuoluwapo Oluwagbayela Serah** (Founder of **The Sent TV**).

[![Vite](https://img.shields.io/badge/Vite-8.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.0-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](LICENSE)

---

## 📖 Overview

**Graced Relationship Recipes** is a responsive web application that revamps an established Blogger devotional ministry into a high-performance, interactive platform.

It ministers to youths, courting singles, and married couples by coupling scripture-grounded teachings and video productions from **The Sent TV** with daily interactive exercises, habit-building streaks, post scheduling, and a private CMS with real-time audience analytics.

---

## ✨ Key Features

### 🌟 1. Public Sanctuary Experience
* **Asymmetrical Editorial Design:** Modern editorial studio aesthetic with warm alabaster canvas (`#FAF9F6`), serif typography, and royal amethyst accents.
* **Word for the Day Archive:** Full-text instant search (keyword, scripture, topic), chronological sorting, and interactive category pills (*True Love*, *Helpmeet*, *Chastity*, *Restoration*).
* **Reading View:** Clean reading layout with scripture callouts, read time estimates, automated view counters, and **1-click WhatsApp verse copying**.
* **The Sent TV Video Showcase:** Curated video catalog with authentic YouTube placeholder thumbnails and direct watch links.
* **Direct Inbox Contact Portal:** Fully integrated inquiry form with immediate confirmation and direct dispatch to `sentannie@gmail.com`.

### 🧩 2. Automated 365-Day Daily Exercise & Streak Engine
* **A Full Year of Activities:** 365 distinct daily exercises covering every calendar day of the year (Jan 1 to Dec 31) with zero owner maintenance required.
* **3-Way Rotating Daily Modes:**
  1. **Word Unscramble:** Interactive drag-free letter tiles for foundational virtues (*PATIENCE*, *COVENANT*, *GENTLENESS*, *CHASTITY*, *FIDELITY*, *HUMILITY*).
  2. **Wisdom Quiz:** Practical scenario-based decision challenges with instant biblical feedback.
  3. **Scripture Memory Challenge:** Missing-word verse fill-ins with celebration animations.
* **Visitor Streak Tracker:** Daily habit tracker with milestone badges (`🔥 7-Day Streak`) saved locally on the visitor's device and shareable directly to WhatsApp.

### 🛡️ 3. Private Admin Content Management System (`/admin`)
* **Stealth Administration:** Private CMS accessed via direct URL without public links on the client-facing website.
* **Post Scheduler (Write Ahead of Time):** Draft an entire week's worth of devotionals in advance; scheduled posts remain hidden until their designated date and time arrives.
* **⚡ 1-Click Auto-Fetch Bible API:** Enter any scripture reference (e.g., `Proverbs 1:10` or `Isaiah 54:6-7`) and select KJV, WEB, or BBE to fetch the exact scripture text in real-time.
* **Device Image Upload & 1-Click Presets:** Upload graphics directly from your phone/PC gallery, tap one of 6 curated aesthetic relationship presets, or use minimalist typography mode.
* **Live Audience Analytics:** Real-time counters for page reads, WhatsApp shares, video clicks, and community growth.
* **Mobile-Optimized Navigation:** Sliding drawer with hamburger toggle button and auto-close on selection.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19 (Hooks, Context API, Suspense) |
| **Build Tool & Bundler** | Vite 8.3.5 with Hot Module Replacement (HMR) |
| **Routing** | React Router v7 (Nested Layouts, Protected Routes) |
| **Icons & Media** | Lucide React + Custom Brand SVGs |
| **Styling Architecture** | Pure CSS3 (CSS Custom Properties, Fluid `clamp()` Typography, Mobile-First Breakpoints) |
| **External APIs** | Free Bible API (Scripture Fetching) & Formspree (Inbox Dispatch) |
| **Persistence** | Local-First Storage Architecture (`localStorage`) |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* **Node.js** (v18.0 or newer)
* **npm** (v9.0 or newer)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/graced-relationship-recipes.git
   cd graced-relationship-recipes
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📁 Project Architecture

```text
frontend-workspace/
├── public/                     # Static assets (portrait, redirects, favicon)
│   ├── _redirects              # Netlify SPA redirect rules
│   ├── anuoluwapo.jpeg         # Official portrait of founder
│   └── favicon.svg             # Brand favicon
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── DailyExerciseCard.jsx # Interactive 365 daily game & streak
│   │   ├── Footer.jsx          # Site footer with Colossians 3:14 quote
│   │   ├── Navbar.jsx          # Frosted glass responsive header
│   │   ├── VideoCard.jsx       # YouTube video card
│   │   ├── WisdomTicker.jsx    # Continuous marquee ribbon
│   │   ├── WordCard.jsx        # Devotional card with WhatsApp copy
│   │   └── YoutubeIcon.jsx     # Standalone SVG brand icon
│   ├── context/                # Global state providers
│   │   ├── AuthContext.jsx     # Administrator authentication session
│   │   ├── DataContext.jsx     # Devotionals, videos, analytics & scheduling
│   │   └── StreakContext.jsx   # Visitor daily streak persistence
│   ├── data/                   # Initial data & static banks
│   │   ├── dailyExercises.js   # Complete 365-day exercise library
│   │   └── initialData.js      # Real devotionals, videos & settings
│   ├── pages/                  # Route views
│   │   ├── About.jsx           # Biography & The Sent TV pillars
│   │   ├── Contact.jsx         # Contact form with direct inbox delivery
│   │   ├── DailyExercisePage.jsx # Standalone daily game room
│   │   ├── Home.jsx            # Editorial hero & feature sections
│   │   ├── Videos.jsx          # The Sent TV video library
│   │   ├── WordDetail.jsx      # Distraction-free reading sanctuary
│   │   ├── WordForTheDay.jsx   # Archive with live search & filters
│   │   └── admin/              # Private Admin CMS
│   │       ├── AdminAnalytics.jsx # Audience growth & metrics
│   │       ├── AdminLayout.jsx    # Admin layout with mobile drawer
│   │       ├── AdminLogin.jsx     # Secured admin login
│   │       ├── AdminOverview.jsx  # Control centre & quick actions
│   │       ├── AdminPosts.jsx     # Post editor, auto-fetch & scheduler
│   │       ├── AdminSettings.jsx  # Platform & contact configuration
│   │       └── AdminVideos.jsx    # Video curation & YouTube management
│   ├── App.jsx                 # Route definitions & layout wrappers
│   ├── index.css               # Global theme tokens, typography & reset
│   └── main.jsx                # Application root entry point
├── vercel.json                 # Vercel SPA rewrite configuration
└── vite.config.js              # Vite bundler configuration
```

---

## 🔐 Administrator Access (Demo Mode)

The private content management portal is accessible at:
* **URL:** `/admin/login`
* **Email:** `sentannie@gmail.com`
* **Password:** `graced2026`

---

## 👥 Credits & Ministry Attribution

* **Visionary & Founder:** **Anuoluwapo Oluwagbayela Serah**  
  *Chartered Accountant, Entrepreneur, Drama Minister, and Founder of **The Sent TV**.*
* **Official YouTube:** [@THESENT_TV](https://www.youtube.com/@THESENT_TV)
* **Official Contact:** `sentannie@gmail.com` • Lagos, Nigeria
* **Lead Engineer:** **Oluwanifemi Peace Ojewusi**

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
