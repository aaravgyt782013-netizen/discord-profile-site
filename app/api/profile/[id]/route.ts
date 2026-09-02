import {NextResponse} from "next/server";

export const dynamic="force-dynamic";
export const revalidate=0;

type Badge={id:string;label:string;short:string};
const STATUSES=new Set(["online","idle","dnd","offline"]);
const BADGES:[number,string,string][]=[
 [1,"Discord Staff","STAFF"],[2,"Partner","PARTNER"],[4,"HypeSquad Events","EVENTS"],[8,"Bug Hunter","BUG"],
 [16,"HypeSquad Online","HYPESQUAD"],[64,"HypeSquad Bravery","BRAVE"],[128,"HypeSquad Brilliance","BRILLIANT"],
 [256,"HypeSquad Balance","BALANCE"],[512,"Early Supporter","EARLY"],[1024,"Discord Certified Bot","CERTIFIED"],
 [16384,"Bug Hunter Gold","BUG+"],[65536,"Verified Bot","VERIFIED"],[131072,"Early Verified Bot Developer","DEV"],
 [262144,"Certified Moderator","MOD"],[524288,"Bot HTTP Interactions","BOT"],[4194304,"Active Developer","ACTIVE"]
];

async function get(url:string){
 try{
  const r=await fetch(url,{cache:"no-store",headers:{Accept:"application/json","User-Agent":"discord-profile-site/6.0"}});
  if(!r.ok)return null;
  return await r.json();
 }catch{return null}
}
function stringValue(...v:unknown[]){return v.find(x=>typeof x==="string"&&x.trim()) as string|undefined}
function numberValue(...v:unknown[]){for(const x of v){if(typeof x==="number"&&Number.isFinite(x))return x;if(typeof x==="string"&&/^\d+$/.test(x.trim()))return Number(x)}return undefined}
function objectId(v:any){if(typeof v==="string")return v;return stringValue(v?.id,v?.asset,v?.asset_id,v?.hash)}
function imageUrl(v:any){return stringValue(v?.link,v?.url,v?.image_url,v?.imageUrl,v?.cdn_url)}
function flagsToBadges(flags:unknown):Badge[]{
 const n=numberValue(flags);if(n===undefined)return [];
 return BADGES.filter(([bit])=>(n&bit)===bit).map(([bit,label,short])=>({id:String(bit),label,short}));
}
function normalizeBadges(value:unknown,flags:unknown):Badge[]{
 const fromFlags=flagsToBadges(flags);
 if(!Array.isArray(value))return fromFlags;
 const normalized=value.map((b:any,i)=>{
  if(typeof b==="string")return {id:b,label:b,short:b.slice(0,10).toUpperCase()};
  const label=stringValue(b?.label,b?.name,b?.description,b?.text,b?.title);
  return label?{id:String(b?.id||b?.name||i),label,short:String(b?.short||label).slice(0,10).toUpperCase()}:null;
 }).filter(Boolean) as Badge[];
 const seen=new Set(normalized.map(x=>x.label));
 return [...normalized,...fromFlags.filter(x=>!seen.has(x.label))];
}
function decorationUrl(v:any){const direct=imageUrl(v);if(direct)return direct;const asset=objectId(v);return asset?`https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=512`:null}
function avatarFromHash(id:string,hash:string|null){if(!hash)return null;return `https://cdn.discordapp.com/avatars/${id}/${hash}.${hash.startsWith("a_")?"gif":"webp"}?size=1024`}
function bannerFromHash(id:string,hash:string|null){if(!hash)return null;return `https://cdn.discordapp.com/banners/${id}/${hash}.${hash.startsWith("a_")?"gif":"webp"}?size=2048`}

export async function GET(req:Request,ctx:{params:Promise<{id:string}>}){
 const {id}=await ctx.params;
 if(!/^\d{15,22}$/.test(id))return NextResponse.json({error:"Invalid Discord ID"},{status:400});
 const usernameHint=new URL(req.url).searchParams.get("username")?.trim()||null;
 const [lanyard,cyan,lookup,lantern]=await Promise.all([
  get(`https://api.lanyard.rest/v1/users/${id}`),
  get(`https://avatar-cyan.vercel.app/api/${id}`),
  get(`https://discordlookup.mesalytic.moe/v1/user/${id}`),
  get(`https://lantern.rest/api/v1/users/${id}`)
 ]);
 let data=lanyard?.data||null;
 let source=data?"lanyard":"public-profile";
 if(!data&&lantern){
  const m=lantern.metadata||{};
  data={discord_status:STATUSES.has(lantern.status)?lantern.status:"offline",discord_user:{id,username:m.username,global_name:m.global_name,avatar:m.avatar||null,public_flags:numberValue(m.flags?.bitfield,m.public_flags),accent_color:m.accent_color||null,avatar_decoration_data:m.avatar_decoration_data||m.avatar_decoration||null},activities:Array.isArray(lantern.activities)?lantern.activities:[]};
  source="lantern";
 }
 if(!data)data={discord_status:"offline",discord_user:{id},activities:[]};
 const c=cyan||{},l=lookup||{};
 const avatarLink=stringValue(c.avatarUrl,c.avatar_url,c.display_avatar_url,imageUrl(c.avatar),imageUrl(l.avatar));
 const bannerLink=stringValue(c.bannerUrl,c.banner_url,imageUrl(c.banner),imageUrl(l.banner));
 const avatarHash=stringValue(objectId(data.discord_user?.avatar),objectId(c.avatar),objectId(l.avatar));
 const bannerHash=stringValue(objectId(data.discord_user?.banner),objectId(c.banner),objectId(l.banner));
 const decoration=data.discord_user?.avatar_decoration_data||c.avatar_decoration_data||c.avatar_decoration||l.avatar_decoration_data||l.avatar_decoration||null;
 const flags=numberValue(data.discord_user?.public_flags,c.public_flags,l.public_flags,l.flags?.bitfield);
 const badges=normalizeBadges(c.badges||l.badges,flags);
 const username=stringValue(data.discord_user?.username,c.username,l.username)||usernameHint||null;
 const globalName=stringValue(data.discord_user?.global_name,c.display_name,l.display_name)||null;
 data.discord_user={...data.discord_user,id,username,global_name:globalName,avatar:avatarHash,banner:bannerHash,public_flags:flags,accent_color:data.discord_user?.accent_color??c.accent_color??l.accent_color??null,avatar_decoration_data:decoration?{asset:objectId(decoration),sku_id:decoration?.sku_id||decoration?.skuId||null}:null};
 const resolvedAvatar=avatarLink||avatarFromHash(id,avatarHash)||`https://api.lanyard.rest/${id}.webp?size=1024`;
 const resolvedBanner=bannerLink||bannerFromHash(id,bannerHash);
 const resolvedDecoration=decorationUrl(decoration);
 const realtime=Boolean(lanyard?.data);
 const status=STATUSES.has(data.discord_status)?data.discord_status:"offline";
 const usernameMatches=!usernameHint||!username||username.toLowerCase()===usernameHint.toLowerCase().replace(/^@/,"");
 return NextResponse.json({success:true,data,profile:{avatarUrl:resolvedAvatar,bannerUrl:resolvedBanner,avatarDecorationUrl:resolvedDecoration,badges,source,monitored:Boolean(lanyard?.data||lantern),realtime,status,usernameMatches,usernameHint,lastChecked:new Date().toISOString()}},{headers:{"Cache-Control":"no-store, max-age=0"}});
}
