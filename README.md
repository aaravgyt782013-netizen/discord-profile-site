# Discord Live Profile Site

A public Next.js + Vercel profile page inspired by a dark, compact profile-card aesthetic.

## Features

- Configure only the Discord user ID.
- Fetches live Discord presence through Lanyard.
- Automatically resolves the Discord avatar from the returned avatar hash.
- Refreshes presence every 15 seconds.
- Fixed bottom status bar with avatar, username, status and activity.
- No avatar URL variable and no Discord user token.

## Environment variables

```env
NEXT_PUBLIC_DISCORD_ID=YOUR_DISCORD_USER_ID
NEXT_PUBLIC_NAME=Aarav
NEXT_PUBLIC_USERNAME=@aarav
NEXT_PUBLIC_TAGLINE=Creator • Developer • Gamer
NEXT_PUBLIC_BIO=Your bio here
NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/yourserver
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourusername
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/@yourchannel
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/yourusername
NEXT_PUBLIC_TWITTER_URL=https://x.com/yourusername
NEXT_PUBLIC_SITE_TITLE=Aarav
NEXT_PUBLIC_SITE_DESCRIPTION=Personal profile website
```

### Discord API limitation

A Discord ID alone does not give a public website unrestricted access to every private Discord profile field. An exact Discord profile bio is not available from the public user object used here, so `NEXT_PUBLIC_BIO` is used for the bio line.

The avatar, username/display name and live presence/activity can be populated from Lanyard when the user is available to its presence service.

Never put Discord tokens, passwords or API secrets in `NEXT_PUBLIC_*` variables.

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Vercel

Import this repository into Vercel, add the environment variables, and deploy. Environment variable changes require a new deployment to take effect.
