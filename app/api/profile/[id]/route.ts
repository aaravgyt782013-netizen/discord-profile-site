import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
async function get(url:string){try{const r=await fetch(url,{cache:"no-store",headers:{Accept:"application/json","User-Agent":"discord-profile-site/2.0"}});return r.ok?await r.json():null}catch{return null}}
function hash(url:any,type:"avatars"|"banners"){return typeof url==="string"?url.match(new RegExp(`/${type}/\\d+/([^.?/]+)`))?.[1]||null:null}
export async function GET(_req:Request,ctx:{params:Promise<{id:string}>}){
 const {id}=await ctx.params;
 if(!/^\d{15,22}$/.test(id))return NextResponse.json({error:"Invalid Discord ID"},{status:400});
 const [lanyard,cyan,lookup,lantern]=await Promise.all([get(`https://api.lanyard.rest/v1/users/${id}`),get(`https://avatar-cyan.vercel.app/api/${id}`),get(`https://discordlookup.mesalytic.moe/v1/user/${id}`),get(`https://lantern.rest/api/v1/users/${id}`)]);
 let data=lanyard?.data||null;let source=data?"lanyard":"public-profile";
 if(!data&&lantern){const m=lantern.metadata||{};data={discord_status:["online","idle","dnd","offline"].includes(lantern.status)?lantern.status:"offline",discord_user:{id,username:m.username,global_name:m.global_name,avatar:m.avatar||null,public_flags:m.flags?.bitfield,accent_color:m.accent_color||null,avatar_decoration_data:m.avatar_decoration_data||null},activities:Array.isArray(lantern.activities)?lantern.activities:[]};source="lantern"}
 if(!data)data={discord_status:"offline",discord_user:{id},activities:[]};
 const c=cyan||{},l=lookup||{},avatarUrl=c.avatarUrl||c.avatar_url||c.display_avatar_url||c.avatar?.link||l.avatar?.link||null,bannerUrl=c.bannerUrl||c.banner_url||c.banner?.link||l.banner?.link||null;
 const avatarHash=data.discord_user?.avatar||c.avatar||c.avatar?.id||hash(avatarUrl,"avatars")||l.avatar?.id||null,bannerHash=data.discord_user?.banner||c.banner||c.banner?.id||hash(bannerUrl,"banners")||l.banner?.id||null;
 const decoration=data.discord_user?.avatar_decoration_data||c.avatar_decoration||l.avatar_decoration||null;
 const flags=data.discord_user?.public_flags??(typeof c.public_flags==="number"?c.public_flags:undefined)??(typeof l.public_flags==="number"?l.public_flags:undefined);
 data.discord_user={...data.discord_user,id,username:data.discord_user?.username||c.username||l.username,global_name:data.discord_user?.global_name||c.display_name||l.display_name||null,avatar:avatarHash,banner:bannerHash,public_flags:flags,avatar_decoration_data:decoration?{asset:decoration.asset||null,sku_id:decoration.sku_id||null}:null};
 const animated=typeof avatarHash==="string"&&avatarHash.startsWith("a_");
 const resolvedAvatar=avatarUrl||(avatarHash?`https://cdn.discordapp.com/avatars/${id}/${avatarHash}.${animated?"gif":"webp"}?size=1024`:`https://api.lanyard.rest/${id}.png?size=1024`);
 const resolvedBanner=bannerUrl||(bannerHash?`https://cdn.discordapp.com/banners/${id}/${bannerHash}.${String(bannerHash).startsWith("a_")?"gif":"webp"}?size=2048`:null);
 const decorationUrl=decoration?.asset?`https://cdn.discordapp.com/avatar-decoration-presets/${decoration.asset}.png?size=512`:null;
 return NextResponse.json({success:true,data,profile:{avatarUrl:resolvedAvatar,bannerUrl:resolvedBanner,avatarDecorationUrl:decorationUrl,badges:Array.isArray(c.badges)?c.badges:Array.isArray(l.badges)?l.badges:[],source,monitored:Boolean(lanyard?.data||lantern),realtime:Boolean(lanyard?.data),profileEffectUrl:c.profileEffectUrl||c.profile_effect_url||null}},{headers:{"Cache-Control":"no-store, max-age=0"}});
}
