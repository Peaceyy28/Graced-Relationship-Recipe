# Grace Relationship Recipes — Client Handover & Demo Guide

> **Live Local Application:** [http://localhost:5173/](http://localhost:5173/)  
> **Status:** Completed & Tested

---

## 1. Quick Demo Checklist for Your Client

### A. Public Website
1. **Homepage** (`/`):
   - Hero banner with faith-centered typography and call-to-actions.
   - **Featured Word for the Day**: Displays today's leading devotional with scripture quote box and cover photo.
   - **Latest YouTube Videos**: 3-column video grid with custom play overlays and links to YouTube.
   - **About Section Preview**: Story and calling summary.
   - **Footer**: Includes Colossians 3:14 quote, quick navigation, social links, and admin portal link.

2. **Word for the Day Archive** (`/word-for-the-day`):
   - Real-time search by keyword, title, or scripture reference.
   - Sort by Newest or Oldest.
   - Archive cards showing topic, Bible book/chapter, and preview excerpt.

3. **Devotional Reading View** (`/word/:id`):
   - Full message reading page with back navigation.
   - Scripture callout box with quotation icons.
   - Native Web Share / Copy Link button for social sharing.

4. **YouTube Videos Page** (`/videos`):
   - Searchable video library.
   - Direct button to the creator's YouTube channel.

5. **About Us Page** (`/about`):
   - Detailed Blogger transition story.
   - 4 foundational pillar cards.

6. **Contact Page** (`/contact`):
   - Direct email, phone/WhatsApp, and YouTube channels.
   - Working contact message form with simulated instant confirmation.

---

## 2. Administrator Dashboard Demo

* **Admin Login URL:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
* **Demo Email:** `admin@gracerelationships.com`
* **Demo Password:** `grace2026`

### Key Features to Demonstrate to the Owner:
* **Overview:** Live counter cards (Total Published, Saved Drafts, Total Videos) and recent entries table.
* **Word for the Day Manager:** Click "Create New Entry", add scripture, choose Draft or Published, and save. Edit existing entries or delete unwanted ones with safety confirmation prompts.
* **YouTube Video Manager:** Add any YouTube URL—the system validates the URL and fetches the thumbnail preview automatically.
* **Site Settings:** Change the official YouTube channel link or contact info anytime without touching code.
* **Reset Demo Data:** Includes a one-click button in the admin overview to reset back to initial sample data anytime.
