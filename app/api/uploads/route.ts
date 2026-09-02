import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const headers={"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36","Accept":"text/html,application/xml,application/json"};
async function text(url:string,extra:Record<string,string>={}){try{const r=await fetch(url,{cache:"no-store",headers:{...headers,...extra}});return r.ok?await r.text():""}catch{return ""}}
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
 try{
  const match=url.match(/instagram\.com\/(?:@)?([^/?#]+)/i);const username=match?.[1]?.replace(/^@/,"");if(!username||["p","reel","tv","explore"].includes(username))return null;
  const api=await text(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,{"x-ig-app-id":"936619743392459","Referer":"https://www.instagram.com/"});
  if(api){const json=JSON.parse(api);const user=json?.data?.user;const item=user?.edge_owner_to_timeline_media?.edges?.[0]?.node;if(item){const code=item.shortcode||item.code;if(!code)return null;const isVideo=Boolean(item.is_video);return {url:`https://www.instagram.com/${isVideo?"reel":"p"}/${code}/`,title:item.edge_media_to_caption?.edges?.[0]?.node?.text?.split("\n")[0]||"Latest Instagram upload",thumbnail:item.display_url||item.thumbnail_src||"",platform:"Instagram",views:"",comments:String(item.edge_media_to_comment?.count??""),likes:String(item.edge_liked_by?.count??""),date:item.taken_at_timestamp?new Date(item.taken_at_timestamp*1000).toISOString().slice(0,10):""};}}
  }
  const html=await text(`https://www.instagram.com/${username}/`);if(!html)return null;
  const canonical=meta(html,"og:url");const post=canonical.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)?.[1];if(!post)return null;
  return {url:canonical,title:meta(html,"og:title")||"Latest Instagram upload",thumbnail:meta(html,"og:image")||"",platform:"Instagram",views:"",comments:"",likes:"",date:""};
 }catch{return null}
}
export async function GET(){
 const [yt,ig]=await Promise.all([youtube(process.env.NEXT_PUBLIC_YOUTUBE_URL||""),instagram(process.env.NEXT_PUBLIC_INSTAGRAM_URL||"")]);
 return NextResponse.json({youtube:yt,instagram:ig,updatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store, max-age=0"}});
}
