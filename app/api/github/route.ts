import {NextResponse} from "next/server";

export const dynamic="force-dynamic";
export const revalidate=0;

function value(...v:unknown[]){return v.find(x=>typeof x==="string"&&x.trim()) as string|undefined}

async function get(url:string){
 try{
  const r=await fetch(url,{cache:"no-store",headers:{Accept:"application/vnd.github+json","User-Agent":"discord-profile-site/5.0"}});
  if(!r.ok)return null;
  return await r.json();
 }catch{return null}
}

function usernameFromUrl(url:string){
 const m=url.match(/github\.com\/([^/?#]+)/i);
 return m?.[1]||"";
}

export async function GET(req:Request){
 const configured=process.env.NEXT_PUBLIC_GITHUB_URL?.trim()||"";
 const hint=new URL(req.url).searchParams.get("username")?.trim()||"";
 const username=usernameFromUrl(configured)||hint.replace(/^@/,"");
 if(!username)return NextResponse.json({github:null},{headers:{"Cache-Control":"no-store"}});

 const [user,repos]=await Promise.all([
  get(`https://api.github.com/users/${encodeURIComponent(username)}`),
  get(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`)
 ]);
 if(!user)return NextResponse.json({github:null},{headers:{"Cache-Control":"no-store"}});

 const repositoryList=Array.isArray(repos)?repos.filter((r:any)=>!r.fork).slice(0,4).map((r:any)=>({
  name:value(r?.name)||"Repository",
  url:value(r?.html_url)||`https://github.com/${username}`,
  description:value(r?.description)||"No description",
  language:value(r?.language)||"",
  stars:Number(r?.stargazers_count)||0,
  forks:Number(r?.forks_count)||0
 })):[];

 return NextResponse.json({github:{
  login:value(user.login)||username,
  name:value(user.name)||username,
  avatarUrl:value(user.avatar_url)||null,
  profileUrl:value(user.html_url)||`https://github.com/${username}`,
  bio:value(user.bio)||"",
  publicRepos:Number(user.public_repos)||0,
  followers:Number(user.followers)||0,
  following:Number(user.following)||0,
  company:value(user.company)||"",
  location:value(user.location)||"",
  repositories:repositoryList
 },updatedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store, max-age=0"}});
}
