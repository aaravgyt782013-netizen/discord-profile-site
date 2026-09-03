"use client";

import {useEffect,useState} from "react";
import "./profile-extras.css";

const features=[
  ["◈","Web Development","Modern interfaces, landing pages and full-stack experiences.","EXPERT"],
  ["◉","Discord Systems","Bots, communities, automations and server tooling.","ADVANCED"],
  ["⛏","Minecraft Development","Servers, plugins, networks and custom systems.","EXPERT"],
  ["⌘","Automation & APIs","Useful APIs, integrations and workflow automation.","ADVANCED"],
  ["◇","UI / UX Design","Polished layouts, motion, responsive design and interaction.","ADVANCED"],
  ["⚡","Performance","Fast pages, clean components and optimized user flows.","EXPERT"],
  ["◆","Database Systems","Structured data, integrations and backend storage.","ADVANCED"],
  ["✦","Experiments","New technology, creative builds and unusual ideas.","EXPLORING"]
] as const;

const stack=["Next.js","React","TypeScript","Node.js","Python","Discord.js","REST APIs","GitHub","Vercel","Minecraft"];

export default function ProfileExtras(){
 const [time,setTime]=useState(0);
 useEffect(()=>{const t=setInterval(()=>setTime(Date.now()),1000);return()=>clearInterval(t)},[]);
 return <>
  <section className="extrasShowcase" id="capabilities">
   <div className="extrasIntro">
    <div><small>06 / CAPABILITY MATRIX</small><h2>Built for more than a profile.</h2><p>A cinematic feature layer inspired by the reference design — with animated cards, skill levels, live-feeling UI and a cleaner way to explore what gets built.</p></div>
    <div className="extrasPulse"><i/><span>PROFILE SYSTEM</span><b>ONLINE</b><em>{time?"LIVE UI":"STARTING"}</em></div>
   </div>
   <div className="featureGrid">{features.map(([icon,title,desc,level],i)=><article className={`featureCard ${i===1?"featured":""}`} key={title}><span className="featureIcon">{icon}</span><small>0{i+1}</small><h3>{title}</h3><p>{desc}</p><div className="level"><b>{level}</b><i><span style={{width:`${72+(i%4)*6}%`}}/></i></div></article>)}</div>
  </section>

  <section className="extrasStack" id="stack">
   <div className="extrasSectionTitle"><small>07 / TOOLKIT</small><h2>The stack behind the builds.</h2><p>Technologies and platforms used across projects.</p></div>
   <div className="stackCloud">{stack.map((x,i)=><span key={x} style={{"--delay":`${i*0.18}s`} as React.CSSProperties}><i/>{x}</span>)}</div>
  </section>

  <section className="extrasTimeline" id="journey">
   <div className="extrasSectionTitle"><small>08 / BUILD LOG</small><h2>Always building something.</h2><p>A compact project journey instead of a plain list of links.</p></div>
   <div className="timelineGrid">
    <article><span>01</span><div><small>DISCOVER</small><h3>Idea → Prototype</h3><p>Turn a rough concept into a working interface or system.</p></div></article>
    <article><span>02</span><div><small>BUILD</small><h3>Prototype → Product</h3><p>Connect the UI to APIs, data and real interactions.</p></div></article>
    <article><span>03</span><div><small>POLISH</small><h3>Product → Experience</h3><p>Responsive details, motion, performance and visual polish.</p></div></article>
   </div>
  </section>
 </>;
}
