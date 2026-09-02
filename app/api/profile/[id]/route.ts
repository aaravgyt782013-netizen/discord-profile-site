import {NextResponse} from "next/server";

export const dynamic="force-dynamic";
export const revalidate=0;

type Badge={id:string;label:string;short:string};

const BADGES:[number,string,string][]=[
 [1,"Discord Staff","STAFF"],[2,"Partner","PARTNER"],[4,"HypeSquad Events","EVENTS"],
 [8,"Bug Hunter","BUG"],[16,"HypeSquad Online","HYPESQUAD"],[64,"HypeSquad Bravery","BRAVE"],
 [128,"HypeSquad Brilliance","BRILLIANT"],[256,"HypeSquad Balance","BALANCE"],[512,"Early Supporter","EARLY"],
 [16384,"Bug Hunter Gold","BUG+"],[131072,"Early Verified Bot Developer","DEV"],
 [262144,"Certified Moderator","MOD"],[4194304,"Active Developer","ACTIVE"]
];

async function get(url:string){
 try{
  const r=await fetch(url,{cache:"no-store",headers:{Accept:"application/json","User-Agent":"discord-profile-site/4.0"}});
  return r.ok?await r.json():null;
 }catch{return null}
}

function hash(url:unknown,type:"avatars"|"banners"){
 return typeof url==="string"?url.match(new RegExp(`/${type}/\\d+/([^.?/]+)`))?.[1]||null:null;
}

function flagsToBadges(flags:unknown):Badge[]{
 if(typeof flags!=="number")return [];
 return BADGES.filter(([bit])=>(flags&bit)===bit).map(([bit,label,short])=>({id:String(bit),label,short}));
}

function normalizeBadges(value:unknown,flags:unknown):Badge[]{
 const fromFlags=flagsToBadges(flags);
 if(!Array.isArray(value))return fromFlags;
 const normalized=value.map((b:any,i)=>{
  if(typeof b==="string")return {id:b,label:b,short:b.slice(0,10).toUpperCase()};
  const label=b?.label||b?.name||b?.description||b?.text;
  if(!label)return null;
  return {id:String(b?.id||b?.name||i),label:String(label),short:String(b?.short||label).slice(0,10).toUpperCase()};
 }).filter(Boolean) as Badge[];
 const seen=new Set(normalized.map(x=>x.label));
 return [...normalized,...fromFlags.filter(x=>!seen.has(x.label))];
}

function pickString(...values:unknown[]){return values.find(v=>typeof v==="string"&&v.trim()) as string|undefined}
function decorationAsset(value:any){
 if(typeof value==="string")return value;
 return pickString(value?.asset,value?.id,value?.asset_id,value?.preset_id);
}
function decorationUrl(value:any){
 const direct=pickString(value?.url,value?.image_url,value?.imageUrl,value?.link);
 if(direct)return direct;
 const asset=decorationAsset(value);
 return asset?`https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=512`:null;
}

export async function GET(_req:Request,ctx:{params:Promise<{id:string}>}){
 const {id}=await ctx.params;
 if(!/^\\d{15,22}$/.test(id))return NextResponse.json({error:"Invalid Discord ID"},{status:400});

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
  data={
   discord_status:["online","idle","dnd","offline"].includes(lantern.status)?lantern.status:"offline",
   discord_user:{id,username:m.username,global_name:m.global_name,avatar:m.avatar||null,public_flags:m.flags?.bitfield,accent_color:m.accent_color||null,avatar_decoration_data:m.avatar_decoration_data||m.avatar_decoration||null},
   activities:Array.isArray(lantern.activities)?lantern.activities:[]
  };
  source="lantern";
 }

 if(!data)data={discord_status:"offline",discord_user:{id},activities:[]};

 const c=cyan||{},l=lookup||{};
 const avatarUrl=pickString(c.avatarUrl,c.avatar_url,c.display_avatar_url,c.avatar?.link,l.avatar?.link);
 const bannerUrl=pickString(c.bannerUrl,c.banner_url,c.banner?.link,l.banner?.link);
 const avatarHash=data.discord_user?.avatar||c.avatar||c.avatar?.id||hash(avatarUrl,"avatars")||l.avatar?.id||null;
 const bannerHash=data.discord_user?.banner||c.banner||c.banner?.id||hash(bannerUrl,"banners")||l.banner?.id||null;
 const decoration=data.discord_user?.avatar_decoration_data||c.avatar_decoration||c.avatar_decoration_data||l.avatar_decoration||l.avatar_decoration_data||null;
 const flags=data.discord_user?.public_flags??(typeof c.public_flags==="number"?c.public_flags:undefined)??(typeof l.public_flags==="number"?l.public_flags:undefined);
 const badges=normalizeBadges(c.badges||l.badges,flags);

 data.discord_user={
  ...data.discord_user,id,
  username:data.discord_user?.username||c.username||l.username,
  global_name:data.discord_user?.global_name||c.display_name||l.display_name||null,
  avatar:avatarHash,banner:bannerHash,public_flags:flags,
  accent_color:data.discord_user?.accent_color??c.accent_color??l.accent_color??null,
  avatar_decoration_data:decoration?{asset:decorationAsset(decoration),sku_id:decoration?.sku_id||decoration?.skuId||null}:null
 };

 const animated=typeof avatarHash==="string"&&avatarHash.startsWith("a_");
 const resolvedAvatar=avatarUrl||(avatarHash?`https://cdn.discordapp.com/avatars/${id}/${avatarHash}.${animated?"gif":"webp"}?size=1024`:`https://api.lanyard.rest/${id}.png?size=1024`);
 const resolvedBanner=bannerUrl||(bannerHash?`https://cdn.discordapp.com/banners/${id}/${bannerHash}.${String(bannerHash).startsWith("a_")?"gif":"webp"}?size=2048`:null);
 const resolvedDecoration=decorationUrl(decoration);

 return NextResponse.json({
  success:true,
  data,
  profile:{
   avatarUrl:resolvedAvatar,bannerUrl:resolvedBanner,avatarDecorationUrl:resolvedDecoration,
   badges,source,monitored:Boolean(lanyard?.data||lantern),realtime:Boolean(lanyard?.data),
   profileEffectUrl:c.profileEffectUrl||c.profile_effect_url||null,
   status:data.discord_status||"offline",
   lastChecked:new Date().toISOString()
  }
 },{headers:{"Cache-Control":"no-store, max-age=0"}});
}
