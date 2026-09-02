"use client";
import {useEffect,useMemo,useState,type CSSProperties} from "react";

type Status="online"|"idle"|"dnd"|"offline";
type Badge={id:string;label:string;short:string};
type User={id?:string;username?:string;global_name?:string;avatar?:string|null;public_flags?:number|null;accent_color?:number|null;avatar_decoration_data?:{asset?:string|null}|null};
type Presence={data?:{discord_user?:User;discord_status?:Status;activities?:any[]};profile?:{avatarUrl?:string|null;bannerUrl?:string|null;avatarDecorationUrl?:string|null;badges?:Badge[];source?:string;monitored?:boolean;realtime?:boolean;status?:Status;lastChecked?:string}};
type Upload={title?:string;url?:string;thumbnail?:string;platform?:string;views?:string;comments?:string;likes?:string;date?:string};

const cfg={
 id:process.env.NEXT_PUBLIC_DISCORD_ID||"",name:process.env.NEXT_PUBLIC_NAME||"Your Name",username:process.env.NEXT_PUBLIC_USERNAME||"@username",
 tagline:process.env.NEXT_PUBLIC_TAGLINE||"Turning ideas into code, communities & digital experiences.",bio:process.env.NEXT_PUBLIC_BIO||"Developer, creator and builder.",
 gender:process.env.NEXT_PUBLIC_GENDER||"",discord:process.env.NEXT_PUBLIC_DISCORD_INVITE||"#",github:process.env.NEXT_PUBLIC_GITHUB_URL||"#",
 youtube:process.env.NEXT_PUBLIC_YOUTUBE_URL||"#",instagram:process.env.NEXT_PUBLIC_INSTAGRAM_URL||"#",twitter:process.env.NEXT_PUBLIC_TWITTER_URL||"#",
 age:process.env.NEXT_PUBLIC_AGE||"",role:process.env.NEXT_PUBLIC_ROLE||"DEV",location:process.env.NEXT_PUBLIC_LOCATION||"",frame:process.env.NEXT_PUBLIC_PROFILE_FRAME_URL||""
};

const fallback=(id:string)=>id?`https://api.lanyard.rest/${id}.png?size=1024`:"https://cdn.discordapp.com/embed/avatars/0.png";
const accountDate=(id:string)=>{try{if(!/^\d{15,22}$/.test(id))return "—";return new Date(Number((BigInt(id)>>22n)+1420070400000n)).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})}catch{return "—"}};
function statusLabel(s:Status){return s==="dnd"?"DO NOT DISTURB":s.toUpperCase()}
function detectWork(text:string){const t=text.toLowerCase();const items=[
 {keys:["website","web development","frontend","next.js","react","html","css"],title:"Web Development",desc:"Modern websites, interfaces and interactive digital experiences."},
 {keys:["discord","discord bot","community","server management"],title:"Discord Development",desc:"Bots, community systems, automation and polished Discord experiences."},
 {keys:["minecraft","plugin","minecraft server","network"],title:"Minecraft Development",desc:"Minecraft servers, plugins, systems and network experiences."},
 {keys:["automation","api","backend","system","tool","bot"],title:"Automation & Systems",desc:"Useful tools, APIs, automations and backend systems."},
 {keys:["design","ui","ux","creative","graphics"],title:"Creative & UI",desc:"Clean visual design, interfaces and creative digital experiments."},
 {keys:["ai","artificial intelligence","machine learning","technology"],title:"AI & Experiments",desc:"Exploring new technology and turning ideas into working experiments."}
 ];const found=items.filter(x=>x.keys.some(k=>t.includes(k)));return found.length?found:items.slice(0,3)}

function BadgeIcon({badge}:{badge:Badge}){
 const n=badge.id;
 return <span className={`badgeIcon badge-${n}`} title={badge.label} aria-label={badge.label}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5 10.5 15 16.5 9"/></svg></span>;
}

export default function ProfilePageV4(){
 const [presence,setPresence]=useState<Presence|null>(null),[live,setLive]=useState(false),[menu,setMenu]=useState(false),[uploadTab,setUploadTab]=useState<"instagram"|"youtube">("youtube"),[uploads,setUploads]=useState<{instagram?:Upload|null;youtube?:Upload|null}>({}),[lastSync,setLastSync]=useState("Connecting…"),[wsState,setWsState]=useState("CONNECTING");

 const loadProfile=()=>{
  if(!cfg.id)return;
  fetch(`/api/profile/${cfg.id}?t=${Date.now()}`,{cache:"no-store"}).then(r=>r.ok?r.json():null).then(x=>{
   if(!x)return;
   setPresence(x);
   setLive(Boolean(x.profile?.realtime));
   setWsState(x.profile?.realtime?"LIVE":"MONITORED");
   setLastSync(new Date().toLocaleTimeString());
  }).catch(()=>setWsState("RETRYING"));
 };

 useEffect(()=>{
  loadProfile();
  const poll=setInterval(loadProfile,5000);
  if(!cfg.id)return()=>clearInterval(poll);
  let stopped=false,lws:WebSocket|null=null,beat:ReturnType<typeof setInterval>|null=null,retry:ReturnType<typeof setTimeout>|null=null;
  const connect=()=>{
   if(stopped)return;
   try{
    setWsState("CONNECTING");
    lws=new WebSocket("wss://api.lanyard.rest/socket");
    lws.onopen=()=>setWsState("CONNECTED");
    lws.onmessage=e=>{
     try{
      const m=JSON.parse(e.data);
      if(m.op===1){
       if(beat)clearInterval(beat);
       const interval=Math.max(10000,Number(m.d?.heartbeat_interval)||30000);
       beat=setInterval(()=>{if(lws?.readyState===WebSocket.OPEN)lws.send(JSON.stringify({op:3,d:null}))},interval);
       if(lws.readyState===WebSocket.OPEN)lws.send(JSON.stringify({op:2,d:{subscribe_to_ids:[cfg.id]}}));
      }
      if(m.t==="INIT_STATE"){
       const d=m.d?.[cfg.id];
       if(d){setPresence(q=>({data:d,profile:{...q?.profile,monitored:true,realtime:true,source:"lanyard",status:d.discord_status,lastChecked:new Date().toISOString()}}));setLive(true);setWsState("LIVE");setLastSync(new Date().toLocaleTimeString())}
      }
      if(m.t==="PRESENCE_UPDATE"&&m.d?.user_id===cfg.id){
       const d=m.d;
       setPresence(q=>({data:d,profile:{...q?.profile,monitored:true,realtime:true,source:"lanyard",status:d.discord_status,lastChecked:new Date().toISOString()}}));
       setLive(true);setWsState("LIVE");setLastSync(new Date().toLocaleTimeString());
      }
     }catch{}
    };
    lws.onclose=()=>{if(beat)clearInterval(beat);if(!stopped){setWsState("RECONNECTING");retry=setTimeout(connect,2000)}};
    lws.onerror=()=>{setWsState("RETRYING");lws?.close()};
   }catch{retry=setTimeout(connect,3000)}
  };
  connect();
  return()=>{stopped=true;clearInterval(poll);if(beat)clearInterval(beat);if(retry)clearTimeout(retry);lws?.close()};
 },[]);

 useEffect(()=>{const load=()=>fetch(`/api/uploads?t=${Date.now()}`,{cache:"no-store"}).then(r=>r.ok?r.json():null).then(x=>x&&setUploads({instagram:x.instagram||null,youtube:x.youtube||null})).catch(()=>{});load();const t=setInterval(load,300000);return()=>clearInterval(t)},[]);

 const u=presence?.data?.discord_user;
 const status=(presence?.data?.discord_status||presence?.profile?.status||"offline") as Status;
 const display=u?.global_name||cfg.name,handle=u?.username?`@${u.username}`:cfg.username,brand=u?.username||cfg.username.replace(/^@/,"");
 const avatar=presence?.profile?.avatarUrl||fallback(cfg.id);
 const dec=presence?.profile?.avatarDecorationUrl||(u?.avatar_decoration_data?.asset?`https://cdn.discordapp.com/avatar-decoration-presets/${u.avatar_decoration_data.asset}.png?size=512`:"");
 const badges=Array.isArray(presence?.profile?.badges)?presence!.profile!.badges!:[];
 const activity=presence?.data?.activities?.find(a=>a?.name&&a.name!=="Custom Status");
 const socials=useMemo(()=>[["GitHub",cfg.github,"brand-github"],["YouTube",cfg.youtube,"brand-youtube"],["Instagram",cfg.instagram,"brand-instagram"],["X / Twitter",cfg.twitter,"brand-x"]] as const,[]);
 const connectedSocials=useMemo(()=>socials.filter(([,url])=>url&&url!=="#"),[socials]);
 const work=useMemo(()=>detectWork(`${cfg.bio} ${process.env.NEXT_PUBLIC_SITE_DESCRIPTION||""}`),[]);
 const selected=uploadTab==="youtube"?uploads.youtube:uploads.instagram;
 const accent=u?.accent_color?`#${u.accent_color.toString(16).padStart(6,"0")}`:"#8b7cff";
 const cover=presence?.profile?.bannerUrl?{backgroundImage:`linear-gradient(180deg,#0003,#08080cee),url(${presence.profile.bannerUrl})`}:undefined;

 return <main className="rebuildPage" style={{"--accent":accent} as CSSProperties}>
  <div className="aurora"><i/><i/><i/><i/></div><div className="stars"/><div className="gridNoise"/>
  <header className="rebuildTop"><a className="identity" href="#home"><img src={avatar} onError={e=>{e.currentTarget.src=fallback(cfg.id)}} alt="Discord avatar"/><span>{brand}</span><b className={`liveDot ${status}`}/></a><div className="tracking"><i className={`liveDot ${status}`}/><strong>{statusLabel(status)}</strong><span>•</span>{live?`LIVE REALTIME • ${lastSync}`:presence?.profile?.monitored?`MONITORED • ${lastSync}`:`${wsState} • PUBLIC PROFILE`}</div></header>
  <button className="drawerTrigger" onClick={()=>setMenu(true)} aria-label="Open navigation"><span/><span/><span/></button>
  {menu&&<><button className="drawerBackdrop" onClick={()=>setMenu(false)} aria-label="Close navigation"/><aside className="drawer"><button className="drawerClose" onClick={()=>setMenu(false)}>×</button><div className="drawerProfile"><img src={avatar} alt=""/><div><strong>{display}</strong><span>{handle}</span></div></div><div className="drawerTitle">NAVIGATION</div><nav><a href="#home" onClick={()=>setMenu(false)}><span>01</span><span>Home</span></a><a href={cfg.discord} target="_blank" rel="noreferrer"><span>02</span><span>Discord</span><b>↗</b></a><a href="#work" onClick={()=>setMenu(false)}><span>03</span><span>Work</span></a><a href="#uploads" onClick={()=>setMenu(false)}><span>04</span><span>Uploads</span></a>{connectedSocials.length>0&&<div className="drawerTitle">SOCIALS</div>}{connectedSocials.map(([n,url,ic])=><a key={n} href={url} target="_blank" rel="noreferrer"><span className={`brandMark ${ic}`}/><span>{n}</span><b>↗</b></a>)}</nav></aside></>}

  <section id="home" className="rebuildHero"><div className="heroText"><div className="liveBadge"><i className={`liveDot ${status}`}/>{live?"LIVE DISCORD PRESENCE":presence?.profile?.monitored?"MONITORED DISCORD PRESENCE":"DISCORD PROFILE"}<span>•</span>{presence?.profile?.source||"SYNC"}</div><h1>{display}</h1><div className="handle">{handle}</div><p className="tagline">{cfg.tagline}</p><p className="bio">{cfg.bio}</p><div className="heroButtons"><a className="btnBright" href={cfg.discord} target="_blank" rel="noreferrer"><span className="brandMark brand-discord"/>Discord ↗</a><a className="btnGlass" href="#work">Explore profile ↓</a></div><div className="tinyFacts"><span><b>{live?"LIVE":presence?.profile?.monitored?"MONITORED":"PUBLIC"}</b> Presence</span><span><b>{badges.length}</b> Badges</span><span><b>{work.length}</b> Skills</span></div></div>

  <article className="discordCard"><div className="cardBanner" style={cover}><span className="bannerTag">DISCORD PROFILE</span></div><div className="avatarDock"><img className="mainAvatar" src={avatar} onError={e=>{e.currentTarget.src=fallback(cfg.id)}} alt="Discord avatar"/>{cfg.frame&&<img className="frame" src={cfg.frame} alt=""/>}{dec&&<img className="decoration" src={dec} alt=""/>}<i className={`cardStatus ${status}`}/></div><div className="cardBody">
   <div className="cardName"><h2>{display}</h2>{badges.slice(0,4).map(b=><BadgeIcon key={b.id} badge={b}/>)}</div><p>{handle}</p><div className="cardBio">{cfg.bio}</div>
   {activity&&<div className="nowPlaying"><div className="activityIcon">ACT</div><div><small>ACTIVE NOW</small><strong>{activity.name}</strong><span>{activity.details||activity.state||"Discord activity"}</span></div><em>{live?"LIVE":"SYNC"}</em></div>}
   {badges.length>0?<div className="badgeBox"><small>DISCORD BADGES</small><div className="badgeList">{badges.map(b=><div className="badgeItem" key={b.id}><BadgeIcon badge={b}/><span>{b.label}</span></div>)}</div></div>:<div className="badgeBox badgeEmpty"><small>DISCORD BADGES</small><span>No public badges were returned for this account.</span></div>}
   <div className="stats statsFour"><div><b>{cfg.age||"—"}</b><span>AGE</span></div><div><b>{cfg.gender||"—"}</b><span>GENDER</span></div><div><b>{cfg.role}</b><span>ROLE</span></div><div><b>{cfg.location||"—"}</b><span>LOCATION</span></div></div>
   <div className="created"><div><b>{accountDate(cfg.id)}</b><span>ACCOUNT CREATED</span></div><div><b>{live?"REALTIME":presence?.profile?.monitored?"MONITORED":"PUBLIC"}</b><span>DATA MODE</span></div></div>
  </div></article></section>

  <section id="work" className="rebuildSection"><div className="sectionHead"><span>01</span><div><small>WHAT I DO</small><h2>Things I build.</h2></div></div><div className="workGrid">{work.map((w,i)=><article className="workCard" key={w.title}><small>{String(i+1).padStart(2,"0")}</small><div className="workIcon">{String(i+1).padStart(2,"0")}</div><h3>{w.title}</h3><p>{w.desc}</p></article>)}</div></section>

  <section id="uploads" className="rebuildSection"><div className="sectionHead"><span>02</span><div><small>LATEST UPLOADS</small><h2>Recent content.</h2></div></div><div className="uploadTabs"><button className={uploadTab==="instagram"?"active":""} onClick={()=>setUploadTab("instagram")}><span className="brandMark brand-instagram"/>Instagram</button><button className={uploadTab==="youtube"?"active":""} onClick={()=>setUploadTab("youtube")}><span className="brandMark brand-youtube"/>YouTube</button></div>{selected?.url?<a className="upload" href={selected.url} target="_blank" rel="noreferrer"><img src={selected.thumbnail||avatar} alt=""/><div><small>{selected.platform||uploadTab.toUpperCase()}</small><h3>{selected.title||"Latest upload"}</h3><p>{[selected.views&&`${selected.views} views`,selected.comments&&`${selected.comments} comments`,selected.likes&&`${selected.likes} likes`,selected.date].filter(Boolean).join(" · ")||"Open content ↗"}</p></div><b>↗</b></a>:<div className="empty">No public {uploadTab} upload could be read automatically yet. The site checks again every 5 minutes.</div>}</section>

  {connectedSocials.length>0&&<section id="socials" className="rebuildSection"><div className="sectionHead"><span>03</span><div><small>FIND ME</small><h2>Socials.</h2></div></div><div className="socials">{connectedSocials.map(([n,url,ic])=><a className="socialCard" key={n} href={url} target="_blank" rel="noreferrer"><span className={`brandMark ${ic}`}/><div><small>SOCIAL</small><strong>{n}</strong></div><b>↗</b></a>)}</div></section>}

  <footer><span>Built around the Discord profile • {display}</span><span>Status: {live?"realtime":presence?.profile?.monitored?"monitored":"public"} • Last update {lastSync}</span></footer>
  <div className="bottomBar"><div className="bottomPic"><img src={avatar} alt="Discord avatar"/>{dec&&<img src={dec} alt=""/>}<i className={`liveDot ${status}`}/></div><div className="bottomInfo"><strong>{display}</strong><span>{handle} • {statusLabel(status)}{live?" • REALTIME":" • SYNCED"}</span></div><a href={cfg.discord} target="_blank" rel="noreferrer" aria-label="Open Discord"><span className="brandMark brand-discord"/></a></div>
 </main>;
}
