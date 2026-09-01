import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function json(url: string) {
  try {
    const r = await fetch(url, { cache: "no-store", headers: { Accept: "application/json", "User-Agent": "discord-profile-site/1.0" } });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

function hashFromUrl(url: unknown, type: "avatars" | "banners") {
  if (typeof url !== "string") return null;
  return url.match(new RegExp(`/${type}/\\d+/([^.?/]+)`))?.[1] ?? null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d{15,22}$/.test(id)) return NextResponse.json({ error: "Invalid Discord user ID." }, { status: 400 });

  const [lanyard, lantern, cyan, lookup] = await Promise.all([
    json(`https://api.lanyard.rest/v1/users/${id}`),
    json(`https://lantern.rest/api/v1/users/${id}`),
    json(`https://avatar-cyan.vercel.app/api/${id}`),
    json(`https://discordlookup.mesalytic.moe/v1/user/${id}`),
  ]);

  let data = lanyard?.data ?? null;
  let source = data ? "lanyard" : "none";

  if (!data && lantern) {
    const m = lantern.metadata || {};
    data = {
      discord_status: ["online", "idle", "dnd", "offline"].includes(lantern.status) ? lantern.status : "offline",
      discord_user: {
        id, username: m.username, global_name: m.global_name, avatar: m.avatar || null, banner: m.banner || null,
        accent_color: m.accent_color ?? null, public_flags: typeof m.flags?.bitfield === "number" ? m.flags.bitfield : undefined,
        avatar_decoration_data: m.avatar_decoration_data || null,
      },
      activities: Array.isArray(lantern.activities) ? lantern.activities.map((a: any) => ({ name: a.name, type: typeof a.type === "number" ? a.type : 0, details: a.details ?? null, state: a.state ?? null, assets: a.assets ? { large_image: a.assets.large_image?.image_url, large_text: a.assets.large_text } : undefined })) : [],
    };
    source = "lantern";
  }

  if (!data) data = { discord_status: "offline", discord_user: { id }, activities: [] };

  const profile = cyan || {};
  const lookupProfile = lookup || {};
  const avatarUrl = profile.avatarUrl || profile.avatar_url || profile.display_avatar_url || profile.avatar?.link || lookupProfile.avatar?.link || null;
  const bannerUrl = profile.bannerUrl || profile.banner_url || profile.banner?.link || lookupProfile.banner?.link || null;
  const avatarHash = data.discord_user?.avatar || profile.avatar || profile.avatar?.id || hashFromUrl(avatarUrl, "avatars") || lookupProfile.avatar?.id || null;
  const bannerHash = data.discord_user?.banner || profile.banner || profile.banner?.id || hashFromUrl(bannerUrl, "banners") || lookupProfile.banner?.id || null;
  const decoration = data.discord_user?.avatar_decoration_data || profile.avatar_decoration || lookupProfile.avatar_decoration || null;
  const flags = data.discord_user?.public_flags ?? (typeof profile.public_flags === "number" ? profile.public_flags : undefined) ?? (typeof lookupProfile.public_flags === "number" ? lookupProfile.public_flags : undefined);

  data.discord_user = {
    ...data.discord_user,
    id,
    username: data.discord_user?.username || profile.username || lookupProfile.username,
    global_name: data.discord_user?.global_name || profile.display_name || lookupProfile.display_name || null,
    avatar: avatarHash, banner: bannerHash, accent_color: data.discord_user?.accent_color ?? profile.accent_color ?? null,
    public_flags: flags,
    avatar_decoration_data: decoration ? { asset: decoration.asset || null, sku_id: decoration.sku_id || null } : null,
  };

  const avatarAnimated = typeof avatarHash === "string" && avatarHash.startsWith("a_");
  const resolvedAvatarUrl = avatarUrl || (avatarHash ? `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.${avatarAnimated ? "gif" : "webp"}?size=1024` : `https://api.lanyard.rest/${id}.png?size=1024`);
  const resolvedBannerUrl = bannerUrl || (bannerHash ? `https://cdn.discordapp.com/banners/${id}/${bannerHash}.${String(bannerHash).startsWith("a_") ? "gif" : "webp"}?size=2048` : null);
  const avatarDecorationUrl = decoration?.asset ? `https://cdn.discordapp.com/avatar-decoration-presets/${decoration.asset}.png?size=512` : null;
  const badges = Array.isArray(profile.badges) ? profile.badges : Array.isArray(lookupProfile.badges) ? lookupProfile.badges : [];

  return NextResponse.json({
    success: true,
    data,
    profile: {
      avatarUrl: resolvedAvatarUrl,
      bannerUrl: resolvedBannerUrl,
      avatarDecorationUrl,
      badges,
      source,
      monitored: Boolean(lanyard?.data || lantern),
      realtime: Boolean(lanyard?.data),
      profileEffectUrl: profile.profileEffectUrl || profile.profile_effect_url || null,
    },
  }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
