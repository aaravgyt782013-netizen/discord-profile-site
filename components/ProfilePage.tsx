"use client";

import { useEffect, useMemo, useState } from "react";

type Activity = {
  name?: string;
  type?: number;
  details?: string | null;
  state?: string | null;
  timestamps?: { start?: number; end?: number };
  assets?: { large_image?: string; large_text?: string; small_image?: string; small_text?: string };
};

type DiscordUser = {
  id: string;
  username?: string;
  global_name?: string | null;
  avatar?: string | null;
  banner?: string | null;
  accent_color?: number | null;
  avatar_decoration_data?: { asset?: string | null } | null;
};

type Presence = {
  data?: {
    discord_user?: DiscordUser;
    discord_status?: "online" | "idle" | "dnd" | "offline";
    activities?: Activity[];
  };
};

const env = {
  name: process.env.NEXT_PUBLIC_NAME || "Aaravg",
  username: process.env.NEXT_PUBLIC_USERNAME || "@username",
  tagline: process.env.NEXT_PUBLIC_TAGLINE || "Turning ideas into code, communities & digital experiences.",
  bio: process.env.NEXT_PUBLIC_BIO || "Coder • Website Developer • Discord Developer • Minecraft Developer",
  discordId: process.env.NEXT_PUBLIC_DISCORD_ID || "",
  invite: process.env.NEXT_PUBLIC_DISCORD_INVITE || "#",
  github: process.env.NEXT_PUBLIC_GITHUB_URL || "#",
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "#",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#",
  twitter: process.env.NEXT_PUBLIC_TWITTER_URL || "#",
};

const labels = { online: "Online", idle: "Idle", dnd: "Do Not Disturb", offline: "Offline" };

function avatar(id: string, hash?: string | null) {
  if (hash) return `https://cdn.discordapp.com/avatars/${id}/${hash}.png?size=1024`;
  if (!id) return "https://cdn.discordapp.com/embed/avatars/0.png";
  const index = Number(BigInt(id) >> BigInt(22)) % 5;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

function banner(id: string, hash?: string | null) {
  return hash ? `https://cdn.discordapp.com/banners/${id}/${hash}.png?size=2048` : "";
}

function decoration(asset?: string | null) {
  return asset ? `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=512` : "";
}

function Icon({ kind }: { kind: "github" | "youtube" | "instagram" | "x" | "discord" | "code" | "minecraft" }) {
  const paths = {
    github: <path d="M12 .7a11.3 11.3 0 0 0-3.57 22c.57.1.78-.25.78-.55v-2.13c-3.17.69-3.84-1.34-3.84-1.34-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.53-.29-5.19-1.27-5.19-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.17A10.9 10.9 0 0 1 12 5.96c.97 0 1.94.13 2.85.38 2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.07 0 4.39-2.66 5.36-5.2 5.64.41.36.78 1.08.78 2.18v3.23c0 .3.21.66.79.55A11.3 11.3 0 0 0 12 .7Z" />,
    youtube: <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.4.58A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.58 9.4.58 9.4.58s7.55 0 9.4-.58a3 3 0 0 0 2.1-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.5 3.9-6.5 3.9Z" />,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></>,
    x: <path d="m4 4 16 16M20 4 4 20" />,
    discord: <path d="M19.5 5.2A16 16 0 0 0 15.6 4l-.5 1a14.6 14.6 0 0 0-6.2 0l-.5-1a16 16 0 0 0-3.9 1.2C2 8.1 1.4 12.9 1.7 17.6a16 16 0 0 0 4.8 2.4l1.2-1.7a10 10 0 0 1-1.9-.9l.5-.4c3.7 1.7 7.7 1.7 11.4 0l.5.4a12 12 0 0 1-1.9.9l1.2 1.7a16 16 0 0 0 4.8-2.4c.4-5.5-.7-10.2-2.8-12.4ZM8.9 15.2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm6.2 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Z" />,
    code: <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 3l-4 18" />,
    minecraft: <path d="M4 4h16v16H4zM7 7h4v4H7zm6 0h4v4h-4zM7 13h4v4H7zm6 0h4v4h-4z" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[kind]}</svg>;
}

export default function ProfilePage() {
  const [presence, setPresence] = useState<Presence | null>(null);
  const [copied, setCopied] = useState(false);
  const [views, setViews] = useState(1284);

  useEffect(() => {
    const load = async () => {
      if (!env.discordId) return;
      try {
        const response = await fetch(`/api/discord/${env.discordId}`, { cache: "no-store" });
        if (response.ok) setPresence(await response.json());
      } catch {}
    };
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const key = "aaravg-profile-views";
      const next = Number(localStorage.getItem(key) || "1284") + 1;
      localStorage.setItem(key, String(next));
      setViews(next);
    } catch {}
  }, []);

  const user = presence?.data?.discord_user;
  const name = user?.global_name || user?.username || env.name;
  const username = user?.username ? `@${user.username}` : env.username;
  const status = presence?.data?.discord_status || "offline";
  const activities = presence?.data?.activities || [];
  const activity = activities.find((a) => a.type !== 4);
  const image = avatar(env.discordId, user?.avatar);
  const bannerImage = banner(env.discordId, user?.banner);
  const decorationImage = decoration(user?.avatar_decoration_data?.asset);
  const accent = user?.accent_color ? `#${user.accent_color.toString(16).padStart(6, "0")}` : "#7c6cff";

  const socialLinks = useMemo(() => [
    ["GitHub", env.github, "github"],
    ["YouTube", env.youtube, "youtube"],
    ["Instagram", env.instagram, "instagram"],
    ["X / Twitter", env.twitter, "x"],
  ] as const, []);

  const copy = async () => {
    if (!env.discordId) return;
    try {
      await navigator.clipboard.writeText(env.discordId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <main className="page" style={{ "--accent": accent } as React.CSSProperties}>
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />
      <div className="stars" />

      <nav className="nav">
        <a className="brand" href="#top"><span className="brandMark">A</span> aaravg</a>
        <div className="navLinks"><a href="#about">About</a><a href="#skills">Skills</a><a href="#socials">Socials</a></div>
        <a className="navDiscord" href={env.invite} target="_blank" rel="noreferrer"><Icon kind="discord" /> Discord</a>
      </nav>

      <section id="top" className="hero">
        <div className="heroCopy">
          <div className="eyebrow"><span className={`pulse ${status}`} /> {labels[status].toUpperCase()} <span className="dotSep">•</span> AVAILABLE TO BUILD</div>
          <h1>Code.<br /><span>Create.</span><br />Connect.</h1>
          <p className="heroTagline">{env.tagline}</p>
          <p className="heroBio">{env.bio}. I turn ideas into polished websites, Discord communities, Minecraft servers and custom digital experiences.</p>
          <div className="actions">
            <a className="primary" href={env.invite} target="_blank" rel="noreferrer"><Icon kind="discord" /> Join my Discord <span>↗</span></a>
            <a className="secondary" href="#about">Explore profile <span>↓</span></a>
          </div>
          <div className="heroMeta"><span><b>{views.toLocaleString()}</b> profile views</span><span className="metaLine" /><span>20 · India</span></div>
        </div>

        <div className="profileCard" style={{ "--card-accent": accent } as React.CSSProperties}>
          <div className="cardTop">
            <span className="livePill"><i className={`statusMini ${status}`} /> {labels[status]}</span>
            <button className="more">•••</button>
          </div>
          <div className="cover" style={bannerImage ? { backgroundImage: `linear-gradient(180deg, transparent, #08080b), url(${bannerImage})` } : undefined}>
            <div className="coverGlow" />
          </div>
          <div className="avatarArea">
            <div className="avatarWrap">
              <img className="avatar" src={image} alt="Discord avatar" />
              {decorationImage && <img className="avatarDecoration" src={decorationImage} alt="" />}
              <span className={`statusDot ${status}`} />
            </div>
          </div>
          <div className="profileInfo">
            <div className="nameLine"><h2>{name}</h2><span className="verified">✦</span></div>
            <p>{username}</p>
            <div className="profileTagline">{env.tagline}</div>
          </div>
          <div className="discordBio"><span className="bioIcon">✦</span><span>{env.bio}</span></div>
          {activity && <div className="activityCard">
            {activity.assets?.large_image && <div className="activityImage" style={{ backgroundImage: `url(${activity.assets.large_image.startsWith("mp:") ? `https://media.discordapp.net/${activity.assets.large_image.slice(3)}` : activity.assets.large_image})` }} />}
            <div><small>ACTIVE NOW</small><strong>{activity.name || "Discord activity"}</strong><span>{activity.details || activity.state || "Currently active"}</span></div>
          </div>}
          <div className="cardStats"><div><b>20</b><span>AGE</span></div><div><b>DEV</b><span>ROLE</span></div><div><b>∞</b><span>IDEAS</span></div></div>
          <div className="profileLine" />
          <div className="miniRow"><span>Discord ID</span><button onClick={copy}>{copied ? "Copied ✓" : env.discordId || "Set ID"}</button></div>
        </div>
      </section>

      <section id="about" className="section aboutSection">
        <div className="sectionTitle"><span>01</span><div><p>ABOUT ME</p><h2>A little bit about what I build.</h2></div></div>
        <div className="aboutBig"><div className="aboutText"><p>I&apos;m <b>{name}</b>, a coder and digital creator focused on building things for the communities I care about.</p><p>My world sits between <b>code, websites, Discord and Minecraft</b>. I enjoy taking a blank idea and turning it into something people can actually use, explore and remember.</p><p>Whether it&apos;s a custom website, a structured Discord community, a Minecraft server or a development project, I care about the details — clean design, useful systems and a finished experience.</p></div><div className="quote">“<br /><strong>Build it.<br />Break it.<br />Improve it.</strong><br /><span>— the process</span></div></div>
      </section>

      <section id="skills" className="section">
        <div className="sectionTitle"><span>02</span><div><p>WHAT I DO</p><h2>Things I&apos;m into.</h2></div></div>
        <div className="skillGrid">
          <article className="skillCard"><div className="skillIcon"><Icon kind="code" /></div><span>01</span><h3>Coding & Development</h3><p>Building tools, systems and projects with code — always learning and experimenting.</p><div className="skillBar"><i style={{ width: "92%" }} /></div></article>
          <article className="skillCard"><div className="skillIcon"><Icon kind="code" /></div><span>02</span><h3>Website Development</h3><p>Modern, responsive websites with clean interfaces, animations and interactive experiences.</p><div className="skillBar"><i style={{ width: "88%" }} /></div></article>
          <article className="skillCard"><div className="skillIcon"><Icon kind="discord" /></div><span>03</span><h3>Discord Development</h3><p>Server structure, roles, permissions, automation, communities and custom server systems.</p><div className="skillBar"><i style={{ width: "95%" }} /></div></article>
          <article className="skillCard"><div className="skillIcon"><Icon kind="minecraft" /></div><span>04</span><h3>Minecraft Development</h3><p>Server setups, configurations, plugins, gameplay systems, ranks and network experiences.</p><div className="skillBar"><i style={{ width: "94%" }} /></div></article>
          <article className="skillCard"><div className="skillIcon">◇</div><span>05</span><h3>Discord Server Cloning</h3><p>Authorized server backup and migration work for recreating structures, channels and configurations.</p><div className="skillBar"><i style={{ width: "90%" }} /></div></article>
          <article className="skillCard featured"><div className="skillIcon">✦</div><span>06</span><h3>Ideas & Experiments</h3><p>If there&apos;s something interesting to build, I&apos;ll probably end up trying it.</p><div className="skillBar"><i style={{ width: "100%" }} /></div></article>
        </div>
      </section>

      <section id="socials" className="section socialsSection">
        <div className="sectionTitle"><span>03</span><div><p>CONNECT</p><h2>Find me around the internet.</h2></div></div>
        <div className="socialGrid">{socialLinks.map(([label, href, kind]) => <a className="social" key={label} href={href} target="_blank" rel="noreferrer"><span className="socialIcon"><Icon kind={kind} /></span><span><small>FOLLOW / VISIT</small><strong>{label}</strong></span><span className="arrow">↗</span></a>)}</div>
      </section>

      <footer><span>© {new Date().getFullYear()} {name}</span><span>Designed & built with code · Live Discord presence</span><button onClick={copy}>{copied ? "Discord ID copied" : "Copy Discord ID"}</button></footer>

      <div className="bottomStatus">
        <div className="bottomAvatarWrap"><img src={image} alt="" />{decorationImage && <img className="bottomDecoration" src={decorationImage} alt="" />}<i className={`bottomDot ${status}`} /></div>
        <div className="bottomText"><strong>{name}</strong><span>{username} <i className={`tinyStatus ${status}`} /> {labels[status]}</span></div>
        {activity && <div className="bottomActivity"><small>PLAYING</small><b>{activity.name}</b><span>{activity.details || activity.state || "Active now"}</span></div>}
        <button className="bottomDiscord" onClick={copy} title="Copy Discord ID"><Icon kind="discord" /></button>
      </div>
    </main>
  );
}
