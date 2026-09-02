import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const headers={"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36","Accept":"text/html,application/xml,application/json"};
async function text(url:string){try{const r=await fetch(url,{cache:"no-store",headers});return r.ok?await r.text():""}catch{return ""}}
function xmlValue(xml:string,tag:string){return xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/,"$1").trim()||""}
function channelId(html:string){return html.match(/(?:"channelId"|"externalId")\s*:\s*"(UC[A-Za-z0-9_-]{20,})"/)?.[1]||html.match(/<meta[^>]+itemprop=["']channelId["'][^>]+content=["'](UC[A-Za-z0-9_-]+)["']/i)?.[1]||html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/www\.youtube\.com\/channel\/(UC[A-Za-z0-9_-]+)["']/i)?.[1]||""}
function meta(html:string,name:string){return html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`,"i"))?.[1]||""}
async function youtube(url:string){
 if(!url)return null;
 try{let id=url.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]+)/)?.[1]||"";if(!id)id=channelId(await text(url));if(!id)return null;
  const rss=await text(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(id)}`);const entry=rss.match(/<entry>([\s\S]*?)<\/entry>/)?.[1]||"";const videoId=xmlValue(entry,"yt:videoId");if(!videoId)return null;
  const title=xmlValue(entry,"title"),published=xmlValue(entry,"published");return {url:`https://www.youtube.com/watch?v=${videoId}`,title,thumbnail:`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,platform:"YouTube",views:"",comments:"",likes:"",date:published.slice(0,10)};
 }catch{return null}
}
async function instagram(url:string){
 if(!url)return null;
 try{const html=await text(url.replace(/\/$/,"/"));if(!html)return null;
  // Public Instagram pages expose OpenGraph metadata and, when available, the canonical post URL.
  const canonical=meta(html,"og:url")||html.match(/https:\/\/www\.instagram\.com\/(?:p|reel)\/[A-Za-z0-9_-]+\/?/)?.[0]||"";
  const post=canonical.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)?.[1];
  if(!post)return null;
  const title=meta(html,"og:title")||"Latest Instagram upload";const thumbnail=meta(html,"og:image")||"";
  return {url:canonical, title, thumbnail, platform:"Instagram", views:"",comments:"",likes:"",date:""};
 }catch{return null}
}
export async function GET(){
 const [yt,ig]=await Promise.all([youtube(process.env.NEXT_PUBLIC_YOUTUBE_URL||""),instagram(process.env.NEXT_PUBLIC_INSTAGRAM_URL||"")]);
 return NextResponse.json({youtube:yt,instagram:ig,updatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store, max-age=0"}});
}
