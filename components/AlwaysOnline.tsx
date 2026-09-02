"use client";
import {useEffect} from "react";

export default function AlwaysOnline(){
 useEffect(()=>{
  const apply=()=>{
   document.querySelectorAll<HTMLElement>(".v5StatusDot").forEach(el=>{el.classList.remove("offline","idle","dnd");el.classList.add("online")});
   document.querySelectorAll<HTMLElement>(".v5Connection b").forEach(el=>{el.textContent="ONLINE"});
   document.querySelectorAll<HTMLElement>(".v5Connection span").forEach(el=>{el.textContent="ALWAYS ONLINE"});
   document.querySelectorAll<HTMLElement>(".v5Bottom div span").forEach(el=>{if(el.textContent?.includes("/")||el.textContent?.includes("OFFLINE"))el.textContent=el.textContent.replace(/\/\s*(OFFLINE|IDLE|DND|ONLINE|CONNECTING|RETRYING|RECONNECTING|CONNECTED|LIVE)/i," / ONLINE")});
  };
  apply();
  const observer=new MutationObserver(apply);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  const timer=window.setInterval(apply,1000);
  return()=>{observer.disconnect();window.clearInterval(timer)};
 },[]);
 return null;
}
