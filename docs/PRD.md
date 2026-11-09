# GRACE RELATIONSHIP RECIPES
## Product Requirements Document (PRD)

**Document Version:** 1.0  
**Date:** November 2026  
**Project Type:** Existing Website Revamp  
**Product Category:** Content Management System (CMS) / Blog Website  
**Status:** Initial Product Specification

---

# 1. Product Overview

## 1.1 Introduction
Grace Relationship Recipes is an existing relationship-focused content platform that currently operates on Blogger.

The purpose of this project is to revamp the existing website into a modern, responsive, full-stack web application that provides an improved content consumption experience for visitors and a simple content management experience for the website owner.

The new platform will allow the owner to independently publish daily inspirational write-ups, known as **Word for the Day**, and share YouTube video links through a private administrative dashboard.

All published content will automatically become available on the public-facing website.

## 1.2 Problem Statement
The existing website requires a design and functional upgrade to provide a more modern digital presence.
The current platform does not meet the desired content management and website experience requirements.

The new website should address the following:
- Provide a modern and visually appealing website.
- Allow the owner to publish daily written content without editing website code.
- Provide a centralised platform for managing YouTube video links.
- Make previously published content accessible to visitors.
- Establish a clear distinction between the public website and the private administration area.
- Provide a responsive experience across desktop, tablet and mobile devices.

## 1.3 Product Vision
To create a beautiful, accessible and easy-to-manage digital platform where people can engage with daily relationship-focused inspiration, biblical teachings and video content.

The platform should make it easy for the content owner to share messages consistently while allowing visitors to discover, read and engage with the available content.

## 1.4 Product Objectives
1. Revamp the existing website with a modern visual identity.
2. Establish a centralised content management system.
3. Enable independent publishing and management of daily content.
4. Integrate YouTube video links into the public website.
5. Improve content accessibility and navigation.
6. Deliver a fully responsive website.
7. Build a maintainable platform that can accommodate future improvements.

---

# 2. Target Audience

## 2.1 Primary Audience: Website Visitors
People interested in relationship guidance, inspirational messages, biblical teachings and relationship-related video content.
Their needs include:
- Accessing daily inspirational messages.
- Reading scripture-backed relationship teachings.
- Exploring previously published messages.
- Discovering video content.
- Accessing the creator's YouTube channel.

## 2.2 Secondary Audience: Website Administrator
The individual responsible for managing Grace Relationship Recipes.
Their needs include:
- Secure access to the administrative dashboard.
- Publishing daily content independently.
- Adding YouTube video links.
- Editing or deleting existing content.
- Managing previously published entries.

---

# 3. Product Structure
The platform will consist of two major sections:
1. **Public-Facing Website**: Accessible without authentication to read daily words, watch videos, and explore archives.
2. **Administrative Dashboard**: Private, authenticated area for managing posts, YouTube links, and drafts.

Both share the same backend and database.

---

# 4. Functional Requirements

### 4.1 Public Website
- **Home Page**: Navigation bar, Hero section, introduction, featured Word for the Day, latest YouTube videos, about preview, CTA, footer.
- **Word for the Day Page**: Latest entry, full scripture and write-up, archive with date filters/pagination, detail views.
- **YouTube Videos Page**: Video card grid, links to YouTube, link to creator channel.
- **About Page**: Creator introduction, mission, vision.
- **Contact Page**: Contact channels, social media links.

### 4.2 Administrative Dashboard
- **Authentication**: Secure login/logout with Supabase Auth.
- **Dashboard Overview**: Metrics (total posts, drafts, videos), quick action buttons.
- **Word for the Day CRUD**: Title, scripture, scripture reference, content, cover image, draft/published status.
- **YouTube Video CRUD**: URL, title, description, URL validation.
- **Content Status**: Explicit draft vs published control.

---

# 5. UI/UX & Technical Architecture

### Brand Identity
- **Primary Colors**: Purple (`#6B21A8` / `#581C87`), White (`#FFFFFF`)
- **Supporting**: Lavender, soft lilac, deep plum, subtle warm neutrals
- **Design Mood**: Elegant, welcoming, editorial, faith-centered, warm

### Tech Stack
- **Frontend**: React (Vite)
- **Styling**: Modern CSS / CSS Modules
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
