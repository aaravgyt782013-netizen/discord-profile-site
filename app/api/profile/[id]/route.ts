import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export const revalidate=0;

type Badge={id:string;label:string;short:string;icon:string};
const STATUSES=new Set(["online","idle","dnd","offline"]);
const FLAG_BADGES:[number,string,string,string][]=[
 [1,"Discord Staff","STAFF","★"],[2,"Partner","PARTNER","◆"],[4,"HypeSquad Events","EVENTS","H"],[8,"Bug Hunter","BUG","⌁"],
 [64,"HypeSquad Bravery","BRAVERY","B"],[128,"HypeSquad Brilliance","BRILLIANCE","✦"],[256,"HypeSquad Balance","BALANCE","◈"],
 [512,"Early Supporter","EARLY","E"],[16384,"Bug Hunter Gold","BUG GOLD","✹"],[65536,"Verified Bot","VERIFIED","✓"],
 [131072,"Early Verified Bot Developer","DEV","⌘"],[262144,"Certified Moderator","MOD","M"],[524288,"Bot HTTP Interactions","BOT","↗"],[4194304,"Active Developer","ACTIVE","⚡"]
];
const BADGE_ALIASES:Record<string,[string,string]>={
 HOUSE_BRAVERY:["HypeSquad Bravery","B"],HOUSE_BRILLIANCE:["HypeSquad Brilliance","✦"],HOUSE_BALANCE:["HypeSquad Balance","◈"],HYPESQUAD_EVENTS:["HypeSquad Events","H"],
 BUG_HUNTER_LEVEL_1:["Bug Hunter","⌁"],BUG_HUNTER_LEVEL_2:["Bug Hunter Gold","✹"],EARLY_SUPPORTER:["Early Supporter","E"],PARTNERED_SERVER_OWNER:["Partner","◆"],DISCORD_EMPLOYEE:["Discord Staff","★"],
 CERTIFIED_MODERATOR:["Certified Moderator","M"],EARLY_VERIFIED_BOT_DEVELOPER:["Early Verified Bot Developer","⌘"],VERIFIED_BOT_DEVELOPER:["Verified Bot Developer","⌘"],ACTIVE_DEVELOPER:["Active Developer","⚡"],VERIFIED_BOT:["Verified Bot","✓"]
};
async function get(url:string){try{const r=await fetch(url,{cache:"no-store",headers:{Accept:"application/json","User-Agent":"discord-profile-site/8.0"}});if(!r.ok)return null;return await r.json()}catch{return null}}
function str(...v:unknown[]){return v.find(x=>typeof x==="string"&&x.trim()) as string|undefined}
function num(...v:unknown[]){for(const x of v){if(typeof x==="number"&&Number.isFinite(x))return x;if(typeof x==="string"&&/^\d+$/.test(x.trim()))return Number(x)}return undefined}
function objId(v:any){return typeof v==="string"?v:str(v?.id,v?.asset,v?.asset_id,v?.hash)}
function img(v:any){return str(v?.link,v?.url,v?.image_url,v?.imageUrl,v?.cdn_url)}
function flagsToBadges(flags:unknown):Badge[]{const n=num(flags);if(n===undefined)return [];return FLAG_BADGES.filter(([bit])=>(n&bit)===bit).map(([bit,label,short,icon])=>({id:String(bit),label,short,icon}))}
function normalizeBadges(value:unknown,flags:unknown,premiumType:unknown):Badge[]{
 const out:Badge[]=[];const seen=new Set<string>();
 const add=(label:string,short?:string,icon?:string,id?:string)=>{const key=label.toLowerCase();if(seen.has(key))return;seen.add(key);out.push({id:id||key.replace(/\s+/g,"-"),label,short:short||label.slice(0,8).toUpperCase(),icon:icon||short?.slice(0,1)||label.slice(0,1)})};
 if(Array.isArray(value))for(const b of value){const raw=typeof b==="string"?b:str(b?.name,b?.label,b?.id,b?.type)||"";const alias=BADGE_ALIASES[raw.toUpperCase()];if(alias)add(alias[0],alias[1],alias[1],raw);else if(raw)add(raw.replace(/_/g," ").toLowerCase().replace(/\b\w/g,m=>m.toUpperCase()),raw.slice(0,8).toUpperCase(),raw.slice(0,1).toUpperCase(),raw)}
 for(const b of flagsToBadges(flags))add(b.label,b.short,b.icon,b.id);
 const premium=num(premiumType);if(premium&&premium>0)add("Discord Nitro","NITRO","N","nitro");
 return out;
}
function decorationUrl(v:any){const direct=img(v);if(direct)return direct;const asset=objId(v);return asset?`https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=512`:null}
function avatarFromHash(id:string,hash:string|null){if(!hash)return null;return `https://cdn.discordapp.com/avatars/${id}/${hash}.${hash.startsWith("a_")?"gif":"webp"}?size=1024`}
function bannerFromHash(id:string,hash:string|null){if(!hash)return null;return `https://cdn.discordapp.com/banners/${id}/${hash}.${hash.startsWith("a_")?"gif":"webp"}?size=2048`}
export async function GET(req:Request,ctx:{params:Promise<{id:string}>}){
 const {id}=await ctx.params;if(!/^\d{15,22}$/.test(id))return NextResponse.json({error:"Invalid Discord ID"},{status:400});
 const usernameHint=new URL(req.url).searchParams.get("username")?.trim().replace(/^@/,"")||null;
 const [lanyard,cyan,lookup,lantern]=await Promise.all([get(`https://api.lanyard.rest/v1/users/${id}`),get(`https://avatar-cyan.vercel.app/api/${id}`),get(`https://discordlookup.mesalytic.moe/v1/user/${id}`),get(`https://lantern.rest/api/v1/users/${id}`)]);
 let data=lanyard?.data||null;let source=data?"lanyard":"public-profile";
 if(!data&&lantern){const m=lantern.metadata||{};data={discord_status:STATUSES.has(lantern.status)?lantern.status:"offline",discord_user:{id,username:m.username,global_name:m.global_name,avatar:m.avatar||null,public_flags:num(m.flags?.bitfield,m.public_flags),premium_type:num(m.premium_type,m.premium?.type),accent_color:m.accent_color||null,avatar_decoration_data:m.avatar_decoration_data||m.avatar_decoration||null},activities:Array.isArray(lantern.activities)?lantern.activities:[]};source="lantern"}
 if(!data)data={discord_status:"offline",discord_user:{id},activities:[]};
 const du=data.discord_user||{},c=cyan||{},l=lookup||{};
 const avatarLink=str(c.avatarUrl,c.avatar_url,c.display_avatar_url,img(c.avatar),img(l.avatar));const bannerLink=str(c.bannerUrl,c.banner_url,img(c.banner),img(l.banner));
 const avatarHash=str(objId(du.avatar),objId(c.avatar),objId(l.avatar));const bannerHash=str(objId(du.banner),objId(c.banner),objId(l.banner));
 const decoration=du.avatar_decoration_data||c.avatar_decoration_data||c.avatar_decoration||l.avatar_decoration_data||l.avatar_decoration||null;
 const flags=num(du.public_flags,c.public_flags,l.public_flags,l.flags?.bitfield);const premiumType=num(du.premium_type,c.premium_type,l.premium_type);
 const badges=normalizeBadges(c.badges||l.badges,flags,premiumType);const username=str(du.username,c.username,l.username)||usernameHint||null;const globalName=str(du.global_name,c.display_name,l.display_name)||null;
 data.discord_user={...du,id,username,global_name:globalName,avatar:avatarHash,banner:bannerHash,public_flags:flags,premium_type:premiumType,accent_color:du.accent_color??c.accent_color??l.accent_color??null,avatar_decoration_data:decoration?{asset:objId(decoration),sku_id:decoration?.sku_id||decoration?.skuId||null}:null};
 const status=STATUSES.has(data.discord_status)?data.discord_status:"offline";const realtime=Boolean(lanyard?.data);const usernameMatches=!usernameHint||!username||username.toLowerCase()===usernameHint.toLowerCase();
 const resolvedAvatar=avatarLink||avatarFromHash(id,avatarHash)||`https://api.lanyard.rest/${id}.webp?size=1024`;const resolvedBanner=bannerLink||bannerFromHash(id,bannerHash);const resolvedDecoration=decorationUrl(decoration);
 return NextResponse.json({success:true,data,profile:{avatarUrl:resolvedAvatar,bannerUrl:resolvedBanner,avatarDecorationUrl:resolvedDecoration,badges,badgesAvailable:badges.length>0,badgeSource:badges.length?"public-discord-data":"not-publicly-exposed",source,monitored:Boolean(lanyard?.data||lantern),realtime,status,usernameMatches,usernameHint,lastChecked:new Date().toISOString()}},{headers:{"Cache-Control":"no-store, max-age=0"}});
}