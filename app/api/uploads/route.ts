import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const get=(u:string)=>fetch(u,{cache:"no-store",headers:{"User-Agent":"profile-site/1.0"}}).then(r=>r.ok?r.text():null).catch(()=>null);
export async function GET(){
 const fallback={url:process.env.NEXT_PUBLIC_UPLOAD_URL||"",title:process.env.NEXT_PUBLIC_UPLOAD_TITLE||"",thumbnail:process.env.NEXT_PUBLIC_UPLOAD_THUMBNAIL||"",platform:process.env.NEXT_PUBLIC_UPLOAD_PLATFORM||"",views:process.env.NEXT_PUBLIC_UPLOAD_VIEWS||"",comments:process.env.NEXT_PUBLIC_UPLOAD_COMMENTS||"",likes:process.env.NEXT_PUBLIC_UPLOAD_LIKES||"",date:process.env.NEXT_PUBLIC_UPLOAD_DATE||""};
 const channel=process.env.NEXT_PUBLIC_YOUTUBE_URL||""; const key=process.env.YOUTUBE_API_KEY||"";
 if(!channel||!key) return NextResponse.json({upload:fallback});
 const m=channel.match(/youtube\.com\/(?:channel\/|@)([A-Za-z0-9_-]+)/); let channelId=m?.[1]||"";
 try{
  if(channel.includes("/@")){const handle=m?.[1];const a=await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(handle)}&key=${encodeURIComponent(key)}`,{cache:"no-store"}).then(r=>r.json());channelId=a.items?.[0]?.id||"";}
  if(!channelId)return NextResponse.json({upload:fallback});
  const c=await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(channelId)}&key=${encodeURIComponent(key)}`,{cache:"no-store"}).then(r=>r.json()); const playlist=c.items?.[0]?.contentDetails?.relatedPlaylists?.uploads; if(!playlist)return NextResponse.json({upload:fallback});
  const items=await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=${playlist}&key=${encodeURIComponent(key)}`,{cache:"no-store"}).then(r=>r.json()); const v=items.items?.[0]?.snippet; const id=v?.resourceId?.videoId; if(!id)return NextResponse.json({upload:fallback});
  const stats=await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${id}&key=${encodeURIComponent(key)}`,{cache:"no-store"}).then(r=>r.json()); const x=stats.items?.[0];
  return NextResponse.json({upload:{url:`https://www.youtube.com/watch?v=${id}`,title:v.title,thumbnail:v.thumbnails?.maxres?.url||v.thumbnails?.high?.url,platform:"YouTube",views:x?.statistics?.viewCount||"0",comments:x?.statistics?.commentCount||"0",likes:x?.statistics?.likeCount||"0",date:v.publishedAt?.slice(0,10)||""}});
 }catch{return NextResponse.json({upload:fallback});}
}
