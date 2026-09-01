import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function json(url: string) {
  try {
    const r = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d{15,22}$/.test(id)) return NextResponse.json({ error: "Invalid Discord user ID." }, { status: 400 });

  const [lanyard, lantern, profile] = await Promise.all([
    json(`https://api.lanyard.rest/v1/users/${id}`),
    json(`https://lantern.rest/api/v1/users/${id}`),
    json(`https://discord.tsunstudio.pw/api/${id}`),
  ]);

  let data = lanyard?.data ?? null;
  let source = data ? "lanyard" : "lantern";

  if (!data && lantern) {
    const m = lantern.metadata || {};
    const flags = typeof m.flags?.bitfield === "number" ? m.flags.bitfield : undefined;
    data = {
      discord_status: lantern.status || "offline",
      discord_user: {
        id,
        username: m.username,
        global_name: m.global_name,
        avatar: m.avatar || null,
        banner: null,
        accent_color: null,
        public_flags: flags,
        avatar_decoration_data: null,
      },
      activities: Array.isArray(lantern.activities) ? lantern.activities.map((a: any) => ({
        name: a.name, type: a.type === "PLAYING" ? 0 : 0, details: a.details ?? null, state: a.state ?? null, assets: a.assets ? { large_image: a.assets.large_image?.image_url } : undefined,
      })) : [],
    };
  }

  if (!data) data = { discord_status: "unknown", discord_user: { id }, activities: [] };

  const p = profile || {};
  const avatarUrl = p.avatarUrl || p.avatar_url || p.display_avatar_url || p.avatar?.url || null;
  const bannerUrl = p.bannerUrl || p.banner_url || null;
  const avatarHash = data.discord_user?.avatar || (typeof avatarUrl === "string" ? avatarUrl.match(/\/avatars\/\d+\/([^.?/]+)/)?.[1] : null) || null;
  const bannerHash = data.discord_user?.banner || (typeof bannerUrl === "string" ? bannerUrl.match(/\/banners\/\d+\/([^.?/]+)/)?.[1] : null) || null;
  const decorationAsset = data.discord_user?.avatar_decoration_data?.asset || p.avatar_decoration?.asset || null;
  const flags = data.discord_user?.public_flags ?? (typeof p.flags?.bitfield === "number" ? p.flags.bitfield : undefined);

  data.discord_user = {
    ...data.discord_user,
    id,
    avatar: avatarHash,
    banner: bannerHash,
    public_flags: flags,
    avatar_decoration_data: decorationAsset ? { asset: decorationAsset } : null,
  };

  return NextResponse.json({ success: true, data, profile: { avatarUrl, bannerUrl, badges: p.badges || [], source, monitored: Boolean(lanyard?.data || lantern) } }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
