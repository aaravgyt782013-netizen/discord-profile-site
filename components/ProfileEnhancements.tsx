"use client";
import {useEffect,useState} from "react";

export default function ProfileEnhancements(){
 const[g,setG]=useState<any>();const[p,setP]=useState<any>();
 const github=process.env.NEXT_PUBLIC_GITHUB_URL||"";const id=process.env.NEXT_PUBLIC_DISCORD_ID||"";const username=(process.env.NEXT_PUBLIC_USERNAME||"").replace(/^@/,"");
 useEffect(()=>{if(github)fetch(`/api/github?url=${encodeURIComponent(github)}&username=${encodeURIComponent(username)}&t=${Date.now()}`,{cache:"no-store"}).then(r=>r.ok?r.json():null).then(x=>setG(x?.github||null)).catch(()=>{})},[github,username]);
 useEffect(()=>{if(!id)return;const load=()=>fetch(`/api/profile/${id}?username=${encodeURIComponent(username)}&t=${Date.now()}`,{cache:"no-store"}).then(r=>r.ok?r.json():null).then(x=>setP(x||null)).catch(()=>{});load();const t=setInterval(load,5000);return()=>clearInterval(t)},[id,username]);
 const badges=p?.profile?.badges||[];const status=p?.profile?.status||p?.data?.discord_status||"offline";
 return <div className="profileEnhancements">
  <section className="enhancedBadges">
   <div className="enhancedTitle"><span>DISCORD IDENTITY</span><b>{badges.length?`${badges.length} verified public badge${badges.length===1?"":"s"}:`:(p?.profile?.badgesAvailable===false?"No public badges exposed":"Checking public badges…")}</b></div>
   {badges.length>0?<div className="enhancedBadgeGrid">{badges.map((b:any)=><div className="enhancedBadge" key={b.id}><strong>{b.icon||b.short?.slice(0,1)||"◆"}</strong><div><b>{b.label}</b><span>{b.short}</span></div></div>)}</div>:<div className="enhancedBadgeEmpty"><strong>◈</strong><div><b>Badge visibility is protected by Discord</b><span>The site shows badges only when Discord/public providers expose them. No fake badges are generated.</span></div></div>}
   <div className={`enhancedPresence ${status}`}><i/><b>{status.toUpperCase()}</b><span>{p?.profile?.realtime?"Live Lanyard presence":"Profile sync active"}</span></div>
  </section>
  {g&&<section className="enhancedGithub"><div className="enhancedGhHead"><img src={g.avatarUrl} alt="GitHub"/><div><small>CONNECTED GITHUB</small><h2>{g.name}</h2><span>@{g.login}</span></div><a href={g.profileUrl} target="_blank" rel="noreferrer">View profile ↗</a></div><p>{g.bio||"Open-source projects, experiments and code."}</p><div className="enhancedGhStats"><b>{g.publicRepos}<small>REPOSITORIES</small></b><b>{g.followers}<small>FOLLOWERS</small></b><b>{g.following}<small>FOLLOWING</small></b></div>{g.repositories?.length>0&&<div className="enhancedRepos">{g.repositories.map((r:any)=><a href={r.url} target="_blank" rel="noreferrer" key={r.name}><b>{r.name}</b><span>{r.language||"CODE"} · ★ {r.stars}</span><p>{r.description||"No description"}</p></a>)}</div>}</section>}
 </div>;
}