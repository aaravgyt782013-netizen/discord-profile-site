import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
async function api(url:string){try{const r=await fetch(url,{cache:"no-store",headers:{"User-Agent":"profile-site/1.0"}});return r.ok?await r.json():null}catch{return null}}
export async function GET(){
 const fallback={url:process.env.NEXT_PUBLIC_UPLOAD_URL||"",title:process.env.NEXT_PUBLIC_UPLOAD_TITLE||"",thumbnail:process.env.NEXT_PUBLIC_UPLOAD_THUMBNAIL||"",platform:process.env.NEXT_PUBLIC_UPLOAD_PLATFORM||"",views:process.env.NEXT_PUBLIC_UPLOAD_VIEWS||"",comments:process.env.NEXT_PUBLIC_UPLOAD_COMMENTS||"",likes:process.env.NEXT_PUBLIC_UPLOAD_LIKES||"",date:process.env.NEXT_PUBLIC_UPLOAD_DATE||""};
 const channel=process.env.NEXT_PUBLIC_YOUTUBE_URL||"",key=process.env.YOUTUBE_API_KEY||""; if(!channel||!key)return NextResponse.json({upload:fallback});
 try{
  let channelId="";
  const handle=channel.match(/youtube\.com\/@([A-Za-z0-9_.-]+)/)?.[1];
  const id=channel.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]+)/)?.[1];
  if(handle){const r=await api(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(handle)}&key=${encodeURIComponent(key)}`);channelId=r?.items?.[0]?.id||""}
  else channelId=id||"";
  if(!channelId)return NextResponse.json({upload:fallback});
  const c=await api(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(key)}`);const playlist=c?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;if(!playlist)return NextResponse.json({upload:fallback});
  const items=await api(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=${encodeURIComponent(playlist)}&key=${encodeURIComponent(key)}`);const v=items?.items?.[0]?.snippet;const videoId=v?.resourceId?.videoId;if(!videoId)return NextResponse.json({upload:fallback});
  const video=await api(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(key)}`);const s=video?.items?.[0]?.statistics||{};
  return NextResponse.json({upload:{url:`https://www.youtube.com/watch?v=${videoId}`,title:v.title,thumbnail:v.thumbnails?.maxres?.url||v.thumbnails?.high?.url,platform:"YouTube",views:s.viewCount||"0",comments:s.commentCount||"0",likes:s.likeCount||"0",date:v.publishedAt?.slice(0,10)||""}})
 }catch{return NextResponse.json({upload:fallback})}
}
