# ✦ Discord Live Profile Site

> A cinematic, responsive Discord-inspired personal profile website built with **Next.js + React + TypeScript** and designed for deployment on **Vercel**.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20with-Vercel-black?logo=vercel)](https://vercel.com/)

## ✨ Overview

This project turns a normal personal profile into a polished, interactive public profile experience.

The original profile-card aesthetic is preserved while additional sections add a more modern cinematic feel: live Discord presence, capability cards, technology stack, social links, and separate YouTube/Instagram upload tracking.

The project is intentionally configuration-driven, so you can use the same codebase for your own profile without changing the core UI.

---

## 🌌 What You Get

### 👤 Live Discord Profile
- Discord display name and username presentation
- Discord avatar resolution through Lanyard
- Live online/status information when the account is available to Lanyard
- Current activity/presence information when available
- Automatic presence refresh
- Public profile presentation without requiring a Discord user token

### 🎬 Cinematic Profile Experience
- Dark, premium profile-card aesthetic
- Neon/glass visual treatment
- Responsive desktop and mobile layouts
- Smooth hover interactions
- Gradient accents and animated UI details
- Capability/skill cards with experience levels
- Technology stack showcase
- Journey/experience section

### 📺 Social & Upload Tracking
- Dedicated **YouTube** upload tab
- Dedicated **Instagram** upload tab
- Automatic latest-upload checking
- Thumbnail, title and upload metadata where available
- Auto-refresh every few minutes
- Last-check indicator
- Graceful empty/error states when a platform cannot be read

### 🔗 Social Links
Configure your public links for:
- Discord
- GitHub
- YouTube
- Instagram
- X/Twitter

### ⚡ Deployment Friendly
- Next.js App Router
- React 19
- TypeScript
- No database required for the basic profile
- Designed for Vercel deployment
- Environment-variable based configuration

---

## 🧩 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | Application framework and routing |
| **React 19** | Interactive UI components |
| **TypeScript** | Type-safe development |
| **Lanyard** | Live Discord presence data |
| **YouTube RSS** | Latest YouTube upload tracking |
| **Instagram web data** | Latest Instagram upload detection where publicly available |
| **Vercel** | Hosting and deployment |

---

## 🚀 Setup Guide

Follow these steps if you want to run your own copy.

### 1. Fork or clone the repository

Create your own copy of this repository on GitHub.

Then download it locally and open a terminal in the project folder.

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

Create a file named `.env.local` in the project root.

Add the following variables:

```env
NEXT_PUBLIC_DISCORD_ID=YOUR_DISCORD_USER_ID
NEXT_PUBLIC_NAME=Your Name
NEXT_PUBLIC_USERNAME=@yourusername
NEXT_PUBLIC_TAGLINE=Creator • Developer • Gamer
NEXT_PUBLIC_BIO=Your short public bio
NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/yourserver
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourusername
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/@yourchannel
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/yourusername
NEXT_PUBLIC_TWITTER_URL=https://x.com/yourusername
NEXT_PUBLIC_SITE_TITLE=Your Name
NEXT_PUBLIC_SITE_DESCRIPTION=Personal profile website
```

### 4. Find your Discord User ID

Discord must have **Developer Mode** enabled to copy a user ID.

On Discord:
1. Open **Settings**.
2. Open **Advanced**.
3. Enable **Developer Mode**.
4. Open your profile.
5. Choose **Copy User ID**.
6. Put that ID into `NEXT_PUBLIC_DISCORD_ID`.

### 5. Configure your social accounts

Replace the example values with your own public profile/channel links.

For upload tracking, make sure both of these are configured:

```env
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/@yourchannel
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/yourusername
```

If a platform does not expose usable public data, the website will show a graceful unavailable/empty state instead of requiring private credentials.

### 6. Run locally

```bash
npm run dev
```

Open the local development address shown by Next.js, normally `http://localhost:3000`.

### 7. Build before publishing

```bash
npm run build
```

If the build completes successfully, the project is ready for deployment.

---

## ☁️ Vercel Deployment Guide

### Method A — Import from GitHub

1. Sign in to Vercel.
2. Select **Add New → Project**.
3. Import this GitHub repository.
4. Keep the framework as **Next.js**.
5. Add every required `NEXT_PUBLIC_*` variable in the Vercel project settings.
6. Deploy.

### Method B — Deploy from the Vercel CLI

Install/login to Vercel and deploy the project from the repository directory:

```bash
npm install -g vercel
vercel
```

For production deployment:

```bash
vercel --prod
```

### Important

Whenever you change an environment variable in Vercel, create a **new deployment**. Environment-variable changes do not retroactively update an already-built deployment.

---

## 🔐 Security & Privacy

This project is designed to work without a Discord user token.

**Never put any of these into the repository or a `NEXT_PUBLIC_*` variable:**
- Discord user tokens
- Discord bot tokens
- Passwords
- API secrets
- Private keys
- Database credentials
- Any other private credentials

`NEXT_PUBLIC_*` values are intended for browser-visible configuration, so assume their values can be seen by visitors.

---

## 🧠 How Discord Data Works

A Discord user ID by itself does not provide unrestricted access to private Discord profile information.

This project uses **Lanyard** for public presence information. Depending on availability, the site can display the user's avatar, name and current presence/activity.

The profile bio is configured through `NEXT_PUBLIC_BIO` because an exact private Discord profile bio is not something a public website can freely retrieve from a Discord user ID.

---

## 📡 How Upload Tracking Works

The website has a dedicated uploads API route that checks the configured YouTube and Instagram profiles.

### YouTube

The tracker resolves the configured channel and reads the latest publicly available upload information through YouTube's public feed.

### Instagram

The tracker attempts to read publicly available profile/post metadata without requiring an Instagram password or private account credentials.

Instagram can change its public web structure or restrict automated requests, so Instagram tracking is inherently less reliable than a first-party authenticated API. The UI therefore handles unavailable data gracefully.

### Refreshing

The upload tabs automatically check for updates periodically and also request fresh data when the profile page loads.

---

## 🎨 Customization

Most personal information can be changed using environment variables without touching the main UI.

The visual system is intentionally split into components and CSS layers so additional sections can be added without replacing the original profile design.

Recommended customization areas:

- Profile name and username
- Bio and tagline
- Discord invite
- Social accounts
- Capability cards
- Technology stack
- Journey/experience content
- Upload sources
- Site title and description

---

## 📁 Project Structure

```text
.
├── app/
│   ├── api/
│   │   └── uploads/          # YouTube + Instagram upload API
│   ├── page.tsx              # Main profile composition
│   └── ...
├── components/
│   ├── ProfilePageV4.tsx     # Original profile experience
│   ├── ProfileExtras.tsx     # Capabilities / stack / journey
│   ├── ProfileUploadsTabs.tsx# YouTube + Instagram tabs
│   ├── AlwaysOnline.tsx      # Presence/status layer
│   └── *.css                 # Visual enhancement layers
├── public/                   # Public static assets
├── package.json
└── README.md
```

---

## 🛠️ Available Commands

```bash
npm install      # Install dependencies
npm run dev      # Start development server
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run linting
```

---

## 🐛 Troubleshooting

### Discord presence is not appearing

- Confirm the Discord ID is correct.
- Make sure the account is available to Lanyard.
- Refresh the page after changing environment variables.
- Check the browser console and Vercel deployment logs for errors.

### YouTube tab is empty

- Confirm `NEXT_PUBLIC_YOUTUBE_URL` points to the correct public channel.
- Use a channel URL or handle that can be resolved publicly.
- Check that the channel has a public upload available.

### Instagram tab is empty

- Confirm `NEXT_PUBLIC_INSTAGRAM_URL` contains the correct public Instagram profile.
- Make sure the profile is public.
- Instagram may temporarily block or change public web endpoints; this can cause tracking to return no result even when the profile exists.

### Environment variables are not updating

Create a fresh Vercel deployment after changing them.

---

## 📣 Public Release Message

Use the following announcement when sharing the project publicly:

> ## ✦ Discord Live Profile Site — PUBLIC RELEASE 🚀
>
> I’m officially making my **Discord Live Profile Site** public!
>
> This isn’t just a basic profile page — it’s a cinematic, responsive personal profile experience built with **Next.js, React and TypeScript**.
>
> ### ✨ Highlights
> • Live Discord presence & activity
> • Cinematic dark/neon profile design
> • Responsive mobile + desktop UI
> • Capability & technology showcase
> • Discord, GitHub and social links
> • Separate YouTube & Instagram upload tabs
> • Automatic upload tracking
> • Vercel-ready deployment
> • Configuration through environment variables
> • No Discord user token required
>
> ### 🛠️ Tech
> Next.js • React • TypeScript • Lanyard • YouTube RSS • Instagram public data • Vercel
>
> ### 📖 Setup
> Check the README for the complete setup guide, environment variables, deployment instructions, troubleshooting and customization details.
>
> ⭐ If you find it useful, consider starring the repository and sharing it with someone who wants a modern personal profile site.
>
> **Built to be customized. Built to be public. Built to stand out. ✦**

---

## ⭐ Contributing

Suggestions, improvements and bug reports are welcome.

If you want to improve the project, open an issue or submit a pull request with a clear explanation of the change.

---

## 📜 License

Add your preferred open-source license before accepting external contributions. If you intend the project to be freely reused, an MIT license is a common choice.

---

## ✦ Credits

Built with **Next.js**, **React**, **TypeScript**, **Lanyard**, and **Vercel**.

Made with curiosity, experimentation and a lot of UI polish. 🚀
