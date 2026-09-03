"use client";
import {useEffect,useState} from "react";
import "./profile-uploads-tabs.css";

type Upload={title?:string;url?:string;thumbnail?:string;platform?:string;views?:string;comments?:string;likes?:string;date?:string};

type UploadResponse={youtube?:Upload|null;instagram?:Upload|null;updatedAt?:string};

const youtube=process.env.NEXT_PUBLIC_YOUTUBE_URL?.trim()||"";
const instagram=process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim()||"";
const validUrl=(v:string)=>/^https?:\/\//i.test(v);

function Icon({name}:{name:"youtube"|"instagram"}){
  return <span aria-hidden="true" className={`uploadTabIcon ${name}`}><span>{name==="youtube"?"▶":"◎"}</span></span>;
}

export default function ProfileUploadsTabs(){
  const [active,setActive]=useState<"youtube"|"instagram">(validUrl(youtube)?"youtube":"instagram");
  const [data,setData]=useState<UploadResponse>({});
  const [lastChecked,setLastChecked]=useState("");

  useEffect(()=>{
    let stopped=false;
    const load=async()=>{
      try{
        const r=await fetch(`/api/uploads?t=${Date.now()}`,{cache:"no-store"});
        if(!r.ok) return;
        const x=await r.json();
        if(stopped)return;
        setData({youtube:x.youtube||null,instagram:x.instagram||null,updatedAt:x.updatedAt});
        setLastChecked(new Date().toLocaleTimeString());
      }catch{}
    };
    load();
    const timer=setInterval(load,300000);
    return()=>{stopped=true;clearInterval(timer)};
  },[]);

  const current=active==="youtube"?data.youtube:data.instagram;
  const enabled=active==="youtube"?validUrl(youtube):validUrl(instagram);
  const other=active==="youtube"?validUrl(instagram):validUrl(youtube);

  return <section id="uploads" className="v5Section uploadTabsSection">
    <div className="v5SectionTitle">
      <small>04 / CONTENT TRACKER</small>
      <h2>Latest uploads.</h2>
      <p>YouTube and Instagram are tracked automatically and checked every five minutes.</p>
    </div>
    <div className="uploadTabsShell">
      <div className="uploadTabs" role="tablist" aria-label="Upload platforms">
        {validUrl(youtube)&&<button className={active==="youtube"?"active":""} onClick={()=>setActive("youtube")} role="tab" aria-selected={active==="youtube"}><Icon name="youtube"/><span>YouTube</span><em>VIDEO</em></button>}
        {validUrl(instagram)&&<button className={active==="instagram"?"active":""} onClick={()=>setActive("instagram")} role="tab" aria-selected={active==="instagram"}><Icon name="instagram"/><span>Instagram</span><em>REELS / POSTS</em></button>}
      </div>
      <div className="uploadTabStatus"><i/> AUTO TRACKING <span>•</span> LAST CHECK {lastChecked||"WAITING"}</div>
      <div className="uploadTabPanel" role="tabpanel">
        {!enabled?<div className="uploadTabEmpty">Connect this platform with its public URL to enable tracking.</div>:current?.url?
          <a className="uploadTabCard" href={current.url} target="_blank" rel="noreferrer">
            <div className="uploadTabMedia"><img src={current.thumbnail||"/favicon.svg"} alt=""/><span>OPEN {active.toUpperCase()} ↗</span></div>
            <div className="uploadTabInfo"><div className="uploadTabLabel"><Icon name={active}/><small>{current.platform||active}</small></div><h3>{current.title||"Latest upload"}</h3><p>{[current.views&&`${current.views} views`,current.likes&&`${current.likes} likes`,current.comments&&`${current.comments} comments`,current.date].filter(Boolean).join(" · ")||"Open the latest upload ↗"}</p></div>
            <b className="uploadTabArrow">↗</b>
          </a>:<div className="uploadTabEmpty">No public {active} upload is available yet. The tracker will keep checking automatically.</div>}
      </div>
      {other&&<div className="uploadTabHint">Switch tabs to view the other connected platform.</div>}
    </div>
  </section>;
}
