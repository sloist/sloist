// ── 슬로이스트 메인 앱 ──
// 데이터: Supabase CMS에서 불러옴
// 스타일: src/styles/tokens.js (색상/폰트 변경은 여기서)
// 공용 컴포넌트: src/components/shared.jsx

import { useState, useCallback, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import S from "./styles/tokens";
import { SP_C, SC_C, OB_C, CATS, TAGS, DAILY_QUOTES } from "./data/constants";
import { aLabel, lLabel, Img, SIcon, UIcon, SavedDot } from "./components/shared";
import { useSupabaseData } from "./lib/useSupabaseData";
import { useAuth } from "./lib/useAuth";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import WriteEditor from "./components/WriteEditor";
import AdminPanel from "./components/AdminPanel";
import EditorProfile from "./components/EditorProfile";
import SpaceMap from "./components/SpaceMap";

export default function Sloist(){
  const { ED: _ED, ALL, SPACE, SCENE, OBJET, loading, error } = useSupabaseData();
  const ED = _ED || {};
  const auth = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showWrite, setShowWrite] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showEditorProfile, setShowEditorProfile] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [view,sView]=useState("home");
  const [items,sItems]=useState([]);
  const [dataLoaded,setDataLoaded]=useState(false);
  const [detail,sDetail]=useState(null);
  const [edRoom,sEdRoom]=useState(null);
  const [toast,sToast]=useState(null);
  const [sov,sSov]=useState(false);
  const [sq,sSq]=useState("");
  const [showTags,sShowTags]=useState(false);
  const [searchQ,sSearchQ]=useState("");
  const [myTab,sMyTab]=useState("saved");
  const [activeCat,sActiveCat]=useState(null);
  const [spCat,sSpCat]=useState([]);
  const [scCat,sScCat]=useState([]);
  const [obCat,sObCat]=useState([]);
  const [spHov,sSpHov]=useState(null);
  const [objHov,sObjHov]=useState(null);
  const [following,sFol]=useState(["hayan","yunseul"]);
  const [legalOpen,sLeg]=useState(null);
  const [cVis,sCVis]=useState(true);
  const [mobFocus,sMobFocus]=useState(null);
  const [headerVis,sHeaderVis]=useState(true);
  const [showTop,sShowTop]=useState(false);
  const prevState=useRef(null);
  const scrollSave=useRef(0);
  const sqRef=useRef(null);
  const lastScroll=useRef(0);
  const [ww,sWw]=useState(typeof window!=="undefined"?window.innerWidth:1200);
  useEffect(()=>{const h=()=>sWw(window.innerWidth);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  const mob=ww<768,tab=ww<1024;

  useEffect(()=>{
    const h=()=>{const y=window.scrollY;sShowTop(y>500);if(y<60)sHeaderVis(true);else if(y>lastScroll.current+8)sHeaderVis(false);else if(y<lastScroll.current-8)sHeaderVis(true);lastScroll.current=y;};
    window.addEventListener("scroll",h,{passive:true});return()=>window.removeEventListener("scroll",h);
  },[]);

  // Supabase 데이터 로드되면 items 초기화
  useEffect(()=>{
    if(ALL&&ALL.length>0&&!dataLoaded){sItems(ALL);setDataLoaded(true);}
  },[ALL,dataLoaded]);

  const flash=useCallback(m=>{sToast(m);setTimeout(()=>sToast(null),1400);},[]);
  const keep=useCallback(id=>{const was=items.find(i=>i.id===id)?.saved;sItems(p=>p.map(i=>i.id===id?{...i,saved:!i.saved}:i));flash(was?"removed":"saved");},[items,flash]);
  const toggleFol=eid=>{const was=following.includes(eid);sFol(p=>was?p.filter(x=>x!==eid):[...p,eid]);flash(was?"unfollowed":"followed");};
  const isSaved=id=>items.find(i=>i.id===id)?.saved;

  const lt=fn=>{sCVis(false);setTimeout(()=>{fn();sCVis(true);},180);};
  const mt=fn=>{sCVis(false);setTimeout(()=>{fn();window.scrollTo({top:0});setTimeout(()=>sCVis(true),80);},350);};

  // ── URL 라우팅 ──
  const isPopping=useRef(false);
  const pushUrl=(path)=>{if(!isPopping.current)window.history.pushState(null,"",path);};

  const goHome=()=>{pushUrl("/");mt(()=>{sView("home");sDetail(null);sEdRoom(null);sActiveCat(null);sSpCat([]);sScCat([]);sObCat([]);});};
  const goTo=v=>{prevState.current={view,activeCat,edRoom,detail,scroll:window.scrollY};pushUrl("/"+v);mt(()=>{sDetail(null);sEdRoom(null);sView(v);});};
  const openDetail=it=>{scrollSave.current=window.scrollY;pushUrl("/"+it.root+"/"+it.id);mt(()=>sDetail(it));};
  const closeDetail=()=>{
    // detail을 닫을 때 현재 view에 맞는 URL로 복귀
    const base=view==="home"?(activeCat?"/":"/"):(view==="room"&&edRoom?"/room/"+edRoom:"/"+view);
    if(activeCat)pushUrl("/"+activeCat);else pushUrl(base);
    const y=scrollSave.current;sCVis(false);setTimeout(()=>{sDetail(null);window.scrollTo({top:y});setTimeout(()=>sCVis(true),80);},300);
  };
  const openRoom=eid=>{prevState.current={view,activeCat,edRoom,detail,scroll:window.scrollY};pushUrl("/room/"+eid);mt(()=>{sEdRoom(eid);sDetail(null);sView("room");});};
  const goBack=()=>{const p=prevState.current;if(p){pushUrl(p.view==="home"?"/":"/"+p.view);sCVis(false);setTimeout(()=>{sView(p.view);sActiveCat(p.activeCat||null);sEdRoom(p.edRoom||null);sDetail(p.detail||null);prevState.current=null;setTimeout(()=>{window.scrollTo({top:p.scroll});setTimeout(()=>sCVis(true),80);},50);},350);}else goHome();};
  const doSearch=q=>{sSearchQ(q);sSov(false);setTimeout(()=>goTo("search"),120);};

  // popstate 핸들러 (브라우저 뒤로/앞으로가기)
  useEffect(()=>{
    const onPop=()=>{
      isPopping.current=true;
      const path=window.location.pathname;
      sCVis(false);
      setTimeout(()=>{
        if(path==="/"||(path==="")){
          sView("home");sDetail(null);sEdRoom(null);sActiveCat(null);
        } else if(path.startsWith("/room/")){
          const eid=path.replace("/room/","");
          sEdRoom(eid);sDetail(null);sView("room");
        } else if(path.match(/^\/(space|scene|objet)\/(.+)$/)){
          const m=path.match(/^\/(space|scene|objet)\/(.+)$/);
          const it=items.find(i=>i.id===m[2]);
          if(it){sDetail(it);} else {sView("home");sDetail(null);}
        } else if(path==="/search"){sView("search");sDetail(null);}
        else if(path==="/about"){sView("about");sDetail(null);}
        else if(path==="/mypage"){sView("mypage");sDetail(null);}
        else if(path==="/archive"){sView("archive");sDetail(null);}
        else if(path==="/space"){sView("home");sDetail(null);sActiveCat("space");}
        else if(path==="/scene"){sView("home");sDetail(null);sActiveCat("scene");}
        else if(path==="/objet"){sView("home");sDetail(null);sActiveCat("objet");}
        else {sView("home");sDetail(null);}
        window.scrollTo({top:0});
        setTimeout(()=>{sCVis(true);isPopping.current=false;},80);
      },300);
    };
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[items]);

  const live=id=>items.find(i=>i.id===id)||{};
  const sv=k=>items.filter(i=>i.root===k&&i.saved);
  const edItems=eid=>items.filter(i=>i.editor===eid);
  const dl=detail?live(detail.id):null;
  const fd=(show,dur="0.7s")=>({opacity:show?1:0,transition:"opacity "+dur+" ease"});
  const px=mob?"0 16px":"0 36px";
  useEffect(()=>{if(sov){sSq("");sShowTags(false);setTimeout(()=>sqRef.current?.focus(),120);}},[sov]);

  const homeFeed=useMemo(()=>{
    const sub=items.filter(i=>i.editor&&following.includes(i.editor));
    const off=items.filter(i=>i.isOfficial);
    const rest=items.filter(i=>!i.isOfficial&&!(i.editor&&following.includes(i.editor)));
    const pool=[...sub,...off,...rest];
    const byRoot={space:[],scene:[],objet:[]};
    pool.forEach(i=>{if(byRoot[i.root])byRoot[i.root].push(i);});
    const result=[];const order=["space","objet","scene"];let idx=[0,0,0];
    for(let r=0;r<9;r++){const ci=r%3;if(idx[ci]<byRoot[order[ci]].length){result.push(byRoot[order[ci]][idx[ci]]);idx[ci]++;}
      else{for(let j=1;j<3;j++){const ai=(r+j)%3;if(idx[ai]<byRoot[order[ai]].length){result.push(byRoot[order[ai]][idx[ai]]);idx[ai]++;break;}}}}
    const day=Math.floor(Date.now()/86400000);
    return[...result.slice(day%result.length),...result.slice(0,day%result.length)].slice(0,9);
  },[items,following]);

  const catItems=useMemo(()=>{
    if(!activeCat)return homeFeed;
    const all=items.filter(i=>i.root===activeCat);
    const fv=activeCat==="space"?spCat:activeCat==="scene"?scCat:obCat;
    const fk=activeCat==="space"?"cat":activeCat==="scene"?"type":"otype";
    return fv.length===0?all:all.filter(i=>fv.includes(i[fk]));
  },[activeCat,items,homeFeed,spCat,scCat,obCat]);

  const searchR=useMemo(()=>{
    if(!searchQ.trim())return[];const q=searchQ.trim().toLowerCase();
    return items.filter(i=>[i.title,i.tags||"",i.sub||"",i.maker||"",i.location||"",i.note||""].some(f=>f.toLowerCase().includes(q)));
  },[items,searchQ]);

  const onCatClick=k=>{
    if(activeCat===k){if(window.scrollY<10){pushUrl("/");lt(()=>{sActiveCat(null);sSpCat([]);sScCat([]);sObCat([]);});return;}window.scrollTo({top:0,behavior:"smooth"});return;}
    pushUrl("/"+k);lt(()=>{sActiveCat(k);sDetail(null);sMobFocus(null);sObjHov(null);sSpCat([]);sScCat([]);sObCat([]);window.scrollTo({top:0});});
  };
  const FilterBtns=()=>{
    const opts=activeCat==="space"?SP_C:activeCat==="scene"?SC_C:OB_C;
    const fv=activeCat==="space"?spCat:activeCat==="scene"?scCat:obCat;
    const fs=activeCat==="space"?sSpCat:activeCat==="scene"?sScCat:sObCat;
    const multi=activeCat==="space";
    return <>{opts.map(o=>{const a=fv.includes(o);return <button key={o} onClick={()=>{window.scrollTo({top:0,behavior:"smooth"});lt(()=>{multi?fs(a?fv.filter(x=>x!==o):[...fv,o]):fs(a?[]:[o]);});}} style={{fontFamily:S.sf,fontSize:mob?11:12,letterSpacing:3,color:a?S.tx:S.txGh,fontWeight:a?400:300,background:"none",border:"none",borderBottom:a?"1px solid "+S.ac:"1px solid transparent",padding:mob?"6px 0":"8px 0",cursor:"pointer",transition:"all .3s"}}>{o}</button>;})}</>;
  };

  /* ── Nav ── */
  const Nav=({showCats})=>{
    const r1h=mob?44:56;
    return <div style={{position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:r1h,padding:mob?"0 16px":"0 36px",background:S.bg,position:"relative",zIndex:2}}>
        <div onClick={goHome} style={{fontFamily:S.sf,fontSize:mob?20:28,fontWeight:300,letterSpacing:mob?8:16,color:S.tx,cursor:"pointer"}}>sloist</div>
        <div style={{display:"flex",alignItems:"center",gap:mob?14:24}}>
          {auth.isEditor&&!auth.isAdmin&&!auth.editorId&&<button onClick={()=>setShowEditorProfile(true)} style={{fontFamily:S.sf,fontSize:10,letterSpacing:3,color:S.ac,background:"none",border:"none",cursor:"pointer",padding:4}}>프로필 만들기</button>}
          {auth.editorId&&<button onClick={()=>setShowEditorProfile(true)} style={{fontFamily:S.sf,fontSize:10,letterSpacing:3,color:S.txGh,background:"none",border:"none",cursor:"pointer",padding:4}}>프로필</button>}
          {(auth.isAdmin||(auth.isEditor&&auth.editorId))&&<button onClick={()=>{setEditItem(null);setShowWrite(true);}} style={{fontFamily:S.sf,fontSize:10,letterSpacing:3,color:S.ac,background:"none",border:"none",cursor:"pointer",padding:4}}>write</button>}
          {auth.isAdmin&&<button onClick={()=>setShowAdmin(true)} style={{fontFamily:S.sf,fontSize:10,letterSpacing:3,color:S.txGh,background:"none",border:"none",cursor:"pointer",padding:4}}>admin</button>}
          <button onClick={()=>sSov(true)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:4}}><SIcon/></button>
          <button onClick={()=>{if(auth.user){if(view!=="mypage")goTo("mypage");}else setShowAuth(true);}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:4}}><UIcon/></button>
        </div>
      </div>
      {showCats&&<div style={{position:"absolute",top:r1h,left:0,right:0,zIndex:1,background:S.bg,transform:headerVis?"translateY(0)":"translateY(-110%)",opacity:headerVis?1:0,transition:"transform .6s cubic-bezier(.4,0,.2,1), opacity .5s ease",pointerEvents:headerVis?"auto":"none"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:mob?28:48,padding:mob?"6px 0":"8px 0"}}>
          {CATS.map(k=><button key={k} onClick={()=>onCatClick(k)} style={{fontFamily:S.sf,fontSize:mob?12:14,fontWeight:300,letterSpacing:mob?4:8,textTransform:"lowercase",color:activeCat===k?S.tx:S.txF,background:"none",border:"none",borderBottom:activeCat===k?"1.5px solid "+S.tx:"1.5px solid transparent",padding:mob?"6px 0":"8px 0",cursor:"pointer",transition:"all .25s"}}>{k}</button>)}
        </div>
        {activeCat&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:mob?12:24,flexWrap:"wrap",padding:mob?"2px 16px 8px":"2px 36px 10px"}}>
          <FilterBtns/>
        </div>}
      </div>}
    </div>;
  };
  const Foot=()=><div style={{textAlign:"center",padding:"64px 0 40px",flexShrink:0}}><button onClick={()=>goTo("about")} style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txF} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>slow with sloist</button></div>;

  /* ── Detail ── */
  const DetailView=({hideEditor})=>{
    if(!dl)return null;
    return <div style={{...fd(cVis,"0.6s"),minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Nav/>
      <div style={{flex:"1 0 auto"}}>
        <div style={{position:"relative",width:"100%",aspectRatio:mob?"16/10":"21/9",overflow:"hidden"}}>
          {dl.photo?<img src={dl.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:dl.grad}}/>}
        </div>
        <div style={{maxWidth:mob?undefined:800,margin:"0 auto",padding:mob?"32px 16px 80px":"56px 48px 100px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:mob?32:48}}>
            <div style={{fontFamily:S.sf,fontSize:10,letterSpacing:5,textTransform:"lowercase",color:S.ac}}>{dl.type||dl.cat||dl.otype||""}</div>
            <button onClick={closeDetail} style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txGh,background:"none",border:"none",cursor:"pointer"}}>back</button>
          </div>
          <h1 style={{fontSize:mob?32:56,fontWeight:300,lineHeight:1.35,letterSpacing:mob?-.5:0,marginBottom:24,textAlign:"center"}}>{dl.title}</h1>
          {dl.sub&&<p style={{fontSize:15,fontWeight:300,color:S.txQ,marginBottom:24,textAlign:"center"}}>{dl.sub}</p>}
          {dl.location&&<div style={{fontSize:12,letterSpacing:3,color:S.txF,marginBottom:mob?64:120,textAlign:"center"}}>{dl.location}{dl.tags?" \u00B7 "+dl.tags:""}</div>}
          {!dl.location&&!dl.sub&&<div style={{height:mob?40:64}}/>}
          <div style={{maxWidth:600,margin:"0 auto"}}>
            {dl.note&&<div style={{fontSize:mob?14:16,fontWeight:400,color:S.txM,lineHeight:2.4,marginBottom:mob?64:100}}>{dl.note}</div>}
            {dl.maker&&<div style={{fontSize:12,color:S.txQ,marginBottom:48,letterSpacing:1}}>{dl.maker}</div>}
          </div>
          <div style={{borderTop:"1px solid "+S.ln,paddingTop:28,display:"flex",alignItems:"center",justifyContent:"center",gap:mob?20:36,flexWrap:"wrap"}}>
            <button onClick={()=>keep(dl.id)} style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:dl.saved?S.ac:S.txGh,background:"none",border:"none",cursor:"pointer"}}>{dl.saved?"kept":"keep"}</button>
            <button onClick={()=>flash("link copied")} style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txGh,background:"none",border:"none",cursor:"pointer"}}>share</button>
            {dl.link&&<a href={dl.link} target="_blank" rel="noopener noreferrer" style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txGh,textDecoration:"none"}}>{lLabel(dl)}</a>}
            {!hideEditor&&dl.editor&&ED[dl.editor]&&<span onClick={()=>openRoom(dl.editor)} style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txQ,cursor:"pointer"}}>{aLabel(dl,ED)}</span>}
            {dl.isOfficial&&<span style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txGh}}>by sloist</span>}
          </div>
        </div>
      </div>
      <Foot/>
    </div>;
  };

  /* ═══ RENDER ═══ */
  if(loading||!dataLoaded) return <div style={{fontFamily:S.sf,background:S.bg,color:S.txGh,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,letterSpacing:6,fontWeight:300}}>sloist</div>;
  const h=homeFeed;
  return <div style={{fontFamily:S.bd,background:S.bg,color:S.tx,minHeight:"100vh",WebkitFontSmoothing:"antialiased"}}>
    <style>{`::selection{background:rgba(130,125,118,.15);color:inherit}@keyframes fi{from{opacity:0}to{opacity:1}}@keyframes tagIn{from{opacity:0}to{opacity:1}}@keyframes stg{from{opacity:0}to{opacity:1}}`}</style>

    {/* SEARCH */}
    {sov&&<div style={{position:"fixed",inset:0,background:"rgba(249,248,247,.97)",backdropFilter:"blur(32px)",zIndex:200,overflowY:"auto",animation:"fi .6s ease"}}>
      <div style={{display:"flex",justifyContent:"flex-end",padding:mob?"16px 16px":"18px 36px"}}>
        <button onClick={()=>sSov(false)} style={{fontFamily:S.sf,fontSize:12,letterSpacing:4,color:S.txQ,background:"none",border:"none",cursor:"pointer"}}>close</button>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",padding:"10vh 24px 80px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <input ref={sqRef} placeholder="search" value={sq} onChange={e=>sSq(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&sq.trim())doSearch(sq.trim());}} style={{width:"100%",maxWidth:300,background:"transparent",border:"none",borderBottom:"1px solid "+S.txQ,padding:"14px 0",fontFamily:S.sf,fontSize:18,fontWeight:300,color:S.tx,letterSpacing:4,outline:"none",textAlign:"center"}}/>
        {sq.trim()&&<div style={{fontFamily:S.sf,fontSize:10,letterSpacing:4,color:S.txQ,marginTop:16}}>begin slow</div>}
        {!sq.trim()&&<button onClick={()=>sShowTags(!showTags)} style={{marginTop:28,fontFamily:S.sf,fontSize:11,letterSpacing:4,color:S.txQ,background:"none",border:"none",cursor:"pointer"}}>{showTags?"hide":"tags"}</button>}
        {showTags&&!sq.trim()&&<div style={{width:"100%",marginTop:24}}><div style={{display:"grid",gridTemplateColumns:mob?"repeat(3,1fr)":"repeat(4,1fr)",gap:mob?"0 16px":"0 28px"}}>{TAGS.map((t,i)=><button key={t} onClick={()=>doSearch(t)} style={{fontFamily:S.sf,fontSize:12,letterSpacing:2,color:S.txQ,background:"none",border:"none",cursor:"pointer",padding:"18px 0",textAlign:"center",opacity:0,animation:"tagIn .4s ease "+i*.06+"s forwards",transition:"color .3s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=S.txQ}>{t}</button>)}</div></div>}
      </div>
    </div>}

    {/* ═══ HOME ═══ */}
    {view==="home"&&!detail&&<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:activeCat==="space"?"#f8f7f4":activeCat==="objet"?"#f7f8f7":activeCat==="scene"?"#f6f5f3":S.bg}}>
      <Nav showCats={true}/>
      <div style={{flex:"1 0 auto"}}>
        {activeCat&&<div style={{...fd(cVis),textAlign:"center",paddingTop:mob?(activeCat!=="space"?52:12):(activeCat!=="space"?64:16),paddingBottom:mob?4:8}}><span style={{fontFamily:S.sf,fontSize:mob?9:10,letterSpacing:mob?6:10,color:S.txGh}}>{activeCat}</span></div>}

        {/* ── HOME EDITORIAL ── */}
        {!activeCat&&<div style={fd(cVis)}>
          {/* 1. Hero quote — massive */}
          <div style={{padding:mob?"48px 16px 0":"80px 36px 0",maxWidth:1100,margin:"0 auto"}}>
            <p style={{fontFamily:S.sf,fontSize:mob?42:88,fontWeight:300,lineHeight:1.15,color:S.tx,letterSpacing:mob?-1:-2}}>{DAILY_QUOTES[Math.floor(Date.now()/86400000)%DAILY_QUOTES.length]}</p>
          </div>

          {/* 2. First item — full bleed image, title overlaid bottom-left */}
          {h[0]&&<div onClick={()=>openDetail(h[0])} style={{cursor:"pointer",position:"relative",margin:mob?"40px 0 0":"72px 0 0"}}>
            <SavedDot isSaved={isSaved(h[0].id)}/>
            <div style={{width:"100%",aspectRatio:mob?"4/3":"21/9",overflow:"hidden",position:"relative"}}>
              {h[0].photo&&<img src={h[0].photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.3),transparent 60%)"}}/>
              <div style={{position:"absolute",bottom:mob?20:40,left:mob?16:36,right:mob?16:undefined,maxWidth:600}}>
                <div style={{fontFamily:S.sf,fontSize:9,letterSpacing:5,color:"rgba(255,255,255,.5)",marginBottom:8}}>{h[0].root}</div>
                <div style={{fontSize:mob?24:40,fontWeight:300,lineHeight:1.3,color:"#fff",letterSpacing:mob?0:.5}}>{h[0].title}</div>
              </div>
            </div>
          </div>}

          {/* 3. Two items — asymmetric: left tall image, right text-dominant */}
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:0,margin:mob?"0":"0"}}>
            {h[1]&&<div onClick={()=>openDetail(h[1])} style={{cursor:"pointer",position:"relative"}}>
              <SavedDot isSaved={isSaved(h[1].id)}/>
              <Img grad={h[1].grad} photo={h[1].photo} aspect={mob?"4/3":"3/4"} r={0}/>
            </div>}
            {h[2]&&<div onClick={()=>openDetail(h[2])} style={{cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:mob?32:60,background:"rgba(234,231,224,.15)"}}>
              <div style={{textAlign:"center",maxWidth:320}}>
                <div style={{fontFamily:S.sf,fontSize:9,letterSpacing:5,color:S.ac,marginBottom:16}}>{h[2].root}</div>
                <div style={{fontSize:mob?20:28,fontWeight:300,lineHeight:1.6,marginBottom:12}}>{h[2].title}</div>
                <div style={{fontSize:12,color:S.txQ,lineHeight:1.8}}>{h[2].note?.slice(0,80)}</div>
              </div>
            </div>}
          </div>

          {/* 4. Three items — tight gallery strip, no text */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:mob?2:4,margin:mob?"0 0 0":"0"}}>
            {h.slice(3,6).map(it=>it&&<div key={it.id} onClick={()=>openDetail(it)} style={{cursor:"pointer",position:"relative"}}>
              <SavedDot isSaved={isSaved(it.id)}/>
              <Img grad={it.grad} photo={it.photo} aspect="1/1" r={0}/>
            </div>)}
          </div>

          {/* 5. Statement break — breathing space */}
          <div style={{padding:mob?"56px 16px":"100px 36px",maxWidth:700,margin:"0 auto",textAlign:"center"}}>
            <p style={{fontFamily:S.sf,fontSize:mob?14:18,fontWeight:300,lineHeight:2.2,color:S.txQ,letterSpacing:1}}>비워진 공간, 정갈한 기물, 고요한 숨결.</p>
          </div>

          {/* 6. Two items — left text + small image, right large image */}
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:0}}>
            {h[6]&&<div onClick={()=>openDetail(h[6])} style={{cursor:"pointer",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:mob?24:48,background:"rgba(234,231,224,.1)"}}>
              <div style={{fontFamily:S.sf,fontSize:9,letterSpacing:5,color:S.ac,marginBottom:12}}>{h[6].root}</div>
              <div style={{fontSize:mob?18:24,fontWeight:300,lineHeight:1.6,marginBottom:16}}>{h[6].title}</div>
              <div style={{width:mob?"100%":"60%"}}><Img grad={h[6].grad} photo={h[6].photo} aspect="3/2" r={2}/></div>
            </div>}
            {h[7]&&<div onClick={()=>openDetail(h[7])} style={{cursor:"pointer",position:"relative"}}>
              <SavedDot isSaved={isSaved(h[7].id)}/>
              <Img grad={h[7].grad} photo={h[7].photo} aspect={mob?"4/3":"3/4"} r={0}/>
            </div>}
          </div>

          {/* 7. Last item — centered, generous space */}
          {h[8]&&<div style={{padding:mob?"48px 16px 32px":"80px 36px 48px",maxWidth:800,margin:"0 auto"}}>
            <div onClick={()=>openDetail(h[8])} style={{cursor:"pointer",textAlign:"center",position:"relative"}}>
              <SavedDot isSaved={isSaved(h[8].id)}/>
              <Img grad={h[8].grad} photo={h[8].photo} aspect={mob?"16/10":"21/9"} r={3}/>
              <div style={{marginTop:mob?16:28}}><div style={{fontSize:mob?16:22,fontWeight:300,lineHeight:1.5}}>{h[8].title}</div><div style={{fontSize:12,color:S.txQ,marginTop:8}}>{h[8].note?.slice(0,60)}</div></div>
            </div>
          </div>}
        </div>}

        {/* ── SPACE ── */}
        {activeCat==="space"&&(()=>{
          const f=spCat.length>0?items.filter(i=>i.root==="space"&&spCat.includes(i.cat)):SPACE;
          if(mob)return <div style={{paddingTop:40}}>
            <div style={{position:"sticky",top:44,zIndex:10,width:"100%",height:"36vh",minHeight:180,maxHeight:320,overflow:"hidden",borderBottom:"1px solid "+S.ln}}>
              <SpaceMap spaces={f} hovId={mobFocus} onHover={id=>sMobFocus(id)} onClick={s=>openDetail(s)} style={{width:"100%",height:"100%"}}/>
            </div>
            <div style={{...fd(cVis),background:S.bg,position:"relative",zIndex:11,padding:"8px 16px 40px"}}>{f.map(it=><div key={it.id} onClick={()=>{if(mobFocus===it.id)openDetail(it);else sMobFocus(it.id);}} style={{display:"flex",gap:16,padding:"18px 0",borderBottom:"1px solid "+S.lnL,cursor:"pointer",position:"relative",background:mobFocus===it.id?"rgba(184,164,140,.03)":"transparent",transition:"background .3s"}}><SavedDot isSaved={isSaved(it.id)}/><div style={{width:80,flexShrink:0}}><Img grad={it.grad} photo={it.photo} aspect="1/1" r={2}/></div><div style={{paddingTop:2,flex:1}}><div style={{fontFamily:S.sf,fontSize:9,letterSpacing:5,color:S.ac,marginBottom:4}}>{it.location}</div><div style={{fontSize:15,fontWeight:300,marginBottom:3}}>{it.title}</div><div style={{fontSize:11,color:S.txF,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{it.note}</div></div></div>)}</div>
          </div>;
          return <div style={{display:"flex",flexDirection:"row",minHeight:"100vh"}}>
            <div style={{width:"42vw",flexShrink:0,position:"sticky",top:0,height:"100vh",overflow:"hidden",borderRight:"1px solid "+S.lnL}}>
              <SpaceMap spaces={f} hovId={spHov} onHover={id=>sSpHov(id)} onClick={s=>openDetail(s)} style={{width:"100%",height:"100%"}}/>
            </div>
            <div style={{...fd(cVis),flex:1,padding:"48px 40px 100px"}}>
              {(()=>{const cover=f.find(x=>x.isCover)||f[0];const rest=f.filter(x=>x.id!==cover.id);return <>
                <div onClick={()=>openDetail(cover)} onMouseEnter={()=>sSpHov(cover.id)} onMouseLeave={()=>sSpHov(null)} style={{cursor:"pointer",position:"relative",marginBottom:64}}><SavedDot isSaved={isSaved(cover.id)}/><Img grad={cover.grad} photo={cover.photo} aspect="3/2" r={3}/><div style={{marginTop:28}}><div style={{fontFamily:S.sf,fontSize:10,letterSpacing:5,color:S.ac,marginBottom:12}}>{cover.location}{cover.tags?" \u00B7 "+cover.tags:""}</div><div style={{fontSize:32,fontWeight:300,lineHeight:1.4,letterSpacing:.5,marginBottom:14}}>{cover.title}</div><div style={{fontSize:14,color:S.txM,lineHeight:1.9,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{cover.note}</div></div></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:36}}>{rest.map(it=><div key={it.id} onClick={()=>openDetail(it)} onMouseEnter={()=>sSpHov(it.id)} onMouseLeave={()=>sSpHov(null)} style={{cursor:"pointer",position:"relative",marginBottom:20}}><SavedDot isSaved={isSaved(it.id)}/><Img grad={it.grad} photo={it.photo} aspect="4/3" r={2}/><div style={{marginTop:12}}><div style={{fontFamily:S.sf,fontSize:9,letterSpacing:5,color:S.ac,marginBottom:4}}>{it.location}</div><div style={{fontSize:15,fontWeight:300,lineHeight:1.5}}>{it.title}</div></div></div>)}</div>
              </>;})()}
            </div>
          </div>;
        })()}

        {/* ── SCENE ── */}
        {activeCat==="scene"&&(()=>{
          const cols=mob?2:3;const hasF=scCat.length>0;
          return <div style={{...fd(cVis),maxWidth:1100,margin:"0 auto",padding:mob?"0 20px":"0 48px",display:"grid",gridTemplateColumns:"repeat("+cols+",1fr)",columnGap:mob?20:36,rowGap:mob?40:64,gridAutoFlow:"dense"}}>{catItems.map(it=>{const t=it.type||"";let span=1,aspect="1/1";if(t==="\uC601\uC0C1"){span=cols;aspect="16/9";}else if(t==="\uC7A5\uBA74"||t==="\uB8E8\uD2F4")aspect="3/4";return <div key={it.id} onClick={()=>openDetail(it)} style={{gridColumn:"span "+span,cursor:"pointer",position:"relative"}}><SavedDot isSaved={isSaved(it.id)}/><Img grad={it.grad} photo={it.photo} aspect={aspect} r={2}/><div style={{padding:"14px 0 0"}}>{!hasF&&<div style={{fontFamily:S.sf,fontSize:9,letterSpacing:5,color:S.ac,marginBottom:4}}>{t}</div>}<div style={{fontSize:13,fontWeight:300,lineHeight:1.6}}>{it.title}</div></div></div>;})}</div>;
        })()}

        {/* ── OBJET ── */}
        {activeCat==="objet"&&<div style={{...fd(cVis),maxWidth:1100,margin:"0 auto",padding:mob?"0 20px":"0 48px",display:"grid",gridTemplateColumns:"1fr 1fr",columnGap:mob?20:36,rowGap:mob?40:64}}>{catItems.map(o=><div key={o.id} onClick={()=>{if(mob&&objHov!==o.id){sObjHov(o.id);return;}openDetail(o);}} onMouseEnter={()=>sObjHov(o.id)} onMouseLeave={()=>sObjHov(null)} style={{cursor:"pointer",position:"relative",overflow:"hidden",borderRadius:2}}><SavedDot isSaved={isSaved(o.id)}/><Img grad={o.grad} photo={o.photo} aspect="3/2" r={2}/><div style={{position:"absolute",bottom:0,left:0,right:0,padding:"24px 16px 14px",background:"linear-gradient(transparent,rgba(0,0,0,.22))",opacity:objHov===o.id?1:0,transition:"opacity .5s"}}><div style={{fontSize:14,color:"rgba(255,255,255,.9)",fontWeight:300,marginBottom:3}}>{o.title}</div><div style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>{o.maker}</div></div></div>)}</div>}
      </div>
      <Foot/>
    </div>}
    {view==="home"&&detail&&<DetailView/>}

    {/* SEARCH RESULTS */}
    {view==="search"&&!detail&&<div style={{...fd(cVis,"0.6s"),minHeight:"100vh",display:"flex",flexDirection:"column"}}><Nav/><div style={{padding:px,flex:"1 0 auto"}}><div onClick={()=>sSov(true)} style={{fontFamily:S.sf,fontSize:16,letterSpacing:3,color:S.tx,textAlign:"center",margin:"28px 0 44px",fontWeight:300,cursor:"pointer"}}>{"\u2022 "+searchQ+" \u2022"}</div><div style={{maxWidth:860,margin:"0 auto"}}>{searchR.length>0?searchR.map(it=><div key={it.id} onClick={()=>openDetail(it)} style={{display:"flex",gap:mob?16:28,padding:(mob?18:28)+"px 0",borderBottom:"1px solid "+S.lnL,cursor:"pointer",position:"relative"}}><SavedDot isSaved={isSaved(it.id)}/><div style={{width:mob?88:160,flexShrink:0}}><Img grad={it.grad} photo={it.photo} aspect="4/3" r={2}/></div><div style={{flex:1,paddingTop:mob?0:6}}><div style={{fontFamily:S.sf,fontSize:9,letterSpacing:5,color:S.ac,marginBottom:6}}>{it.root}</div><div style={{fontSize:mob?14:17,fontWeight:300,lineHeight:1.6,marginBottom:6}}>{it.title}</div><div style={{fontSize:12,color:S.txF,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{it.note}</div></div></div>):<div style={{textAlign:"center",padding:"100px 0",fontSize:14,color:S.txGh}}>{"\uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4"}</div>}</div></div><Foot/></div>}
    {view==="search"&&detail&&<DetailView/>}

    {/* ABOUT */}
    {view==="about"&&<div style={{...fd(cVis,"0.8s"),minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Nav/>
      <div style={{flex:"1 0 auto",maxWidth:mob?undefined:800,margin:"0 auto",padding:mob?"32px 16px 60px":"72px 48px 80px"}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:mob?24:40}}><button onClick={goBack} style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txGh,background:"none",border:"none",cursor:"pointer"}}>back</button></div>
        <p style={{fontFamily:S.sf,fontSize:mob?22:38,fontWeight:300,lineHeight:1.7,color:S.tx,letterSpacing:mob?0:1,marginBottom:mob?40:64}}>{"\uB290\uB9AC\uAC8C \uAC77\uB294 \uC0AC\uB78C\uB4E4\uC758 \uC2DC\uC120"}</p>
        <div style={{marginBottom:mob?56:100,maxWidth:560}}>
          <p style={{fontSize:mob?13:15,fontWeight:400,lineHeight:2.6,color:S.txM}}>{"\uBE44\uC6CC\uC9C4 \uACF5\uAC04, \uC815\uAC08\uD55C \uAE30\uBB3C, \uACE0\uC694\uD55C \uC228\uACB0."}</p>
          <p style={{fontSize:mob?13:15,fontWeight:400,lineHeight:2.6,color:S.txM,marginTop:mob?8:12}}>{"\uC290\uB85C\uC774\uC2A4\uD2B8\uB294 \uC790\uAE30\uB9CC\uC758 \uC18D\uB3C4\uB85C \uC0B4\uC544\uAC00\uB294 \uC0AC\uB78C\uB4E4\uC758 \uC7A5\uC18C, \uBB3C\uAC74, \uC7A5\uBA74\uC744 \uAE30\uB85D\uD569\uB2C8\uB2E4. \uC9C1\uC811 \uACBD\uD5D8\uD55C \uAC83\uB4E4\uB9CC\uC744 \uB0A8\uAE30\uACE0, \uADF8 \uC2DC\uC120\uC744 \uD558\uB098\uC758 \uD750\uB984\uC73C\uB85C \uC5EE\uC2B5\uB2C8\uB2E4."}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?48:0,marginBottom:mob?56:100}}>
          <div>
            <div style={{fontFamily:S.sf,fontSize:10,letterSpacing:5,color:S.txGh,marginBottom:24}}>what we record</div>
            <div style={{fontSize:mob?13:14,lineHeight:2.8}}>
              <div><span style={{color:S.tx,letterSpacing:1}}>space</span> <span style={{color:S.txGh,margin:"0 10px"}}>{"\u2014"}</span> <span style={{color:S.txQ}}>{"\uC7A5\uC18C\uC758 \uAE30\uB85D"}</span></div>
              <div><span style={{color:S.tx,letterSpacing:1}}>objet</span> <span style={{color:S.txGh,margin:"0 10px"}}>{"\u2014"}</span> <span style={{color:S.txQ}}>{"\uBB3C\uAC74\uC758 \uAE30\uB85D"}</span></div>
              <div><span style={{color:S.tx,letterSpacing:1}}>scene</span> <span style={{color:S.txGh,margin:"0 10px"}}>{"\u2014"}</span> <span style={{color:S.txQ}}>{"\uC7A5\uBA74\uC758 \uAE30\uB85D"}</span></div>
            </div>
          </div>
          <div>
            <div style={{fontFamily:S.sf,fontSize:10,letterSpacing:5,color:S.txGh,marginBottom:24}}>how we choose</div>
            <div style={{fontSize:mob?12:13,color:S.txQ,lineHeight:2.8}}>
              <div>{"\uC5EC\uAE30\uC5D0 \uAC00\uBA74 \uC228\uC774 \uB290\uB824\uC9D1\uB2C8\uB2E4."}</div>
              <div>{"\uC774\uAC83\uC744 \uACC1\uC5D0 \uB450\uBA74 \uD558\uB8E8\uAC00 \uACE0\uC694\uD574\uC9D1\uB2C8\uB2E4."}</div>
              <div>{"\uC774\uAC83\uC744 \uB9C8\uC8FC\uD558\uBA74 \uC7A0\uC2DC \uBA48\uCD94\uAC8C \uB429\uB2C8\uB2E4."}</div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?48:0,marginBottom:mob?56:100}}>
          <div>
            <div style={{fontFamily:S.sf,fontSize:10,letterSpacing:5,color:S.txGh,marginBottom:24}}>from sloist</div>
            <div style={{fontSize:mob?13:14,lineHeight:2.8}}>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.tx,letterSpacing:1,width:mob?80:100,flexShrink:0}}>magazine</span><span style={{color:S.txGh,fontSize:11,cursor:"pointer"}} onClick={()=>flash("coming soon")}>coming soon</span></div>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.tx,letterSpacing:1,width:mob?80:100,flexShrink:0}}>stay</span><span style={{color:S.txGh,fontSize:11,cursor:"pointer"}} onClick={()=>flash("coming soon")}>coming soon</span></div>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.tx,letterSpacing:1,width:mob?80:100,flexShrink:0}}>goods</span><span style={{color:S.txGh,fontSize:11,cursor:"pointer"}} onClick={()=>flash("coming soon")}>coming soon</span></div>
            </div>
          </div>
          <div>
            <div style={{fontFamily:S.sf,fontSize:10,letterSpacing:5,color:S.txGh,marginBottom:24}}>contact</div>
            <div style={{fontSize:mob?13:14,lineHeight:2.8}}>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.txQ,fontSize:11,letterSpacing:1,width:mob?80:100,flexShrink:0}}>mail</span><a href="mailto:slistkr@gmail.com" style={{color:S.txM,textDecoration:"none",borderBottom:"1px solid "+S.lnL}}>slistkr@gmail.com</a></div>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.txQ,fontSize:11,letterSpacing:1,width:mob?80:100,flexShrink:0}}>social</span><a href="https://instagram.com/sloists" target="_blank" rel="noopener noreferrer" style={{color:S.txM,textDecoration:"none",borderBottom:"1px solid "+S.lnL}}>@sloists</a></div>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.txQ,fontSize:11,letterSpacing:1,width:mob?80:100,flexShrink:0}}>letter</span><span style={{color:S.txM,cursor:"pointer",borderBottom:"1px solid "+S.lnL}} onClick={()=>flash("coming soon")}>subscribe</span></div>
            </div>
          </div>
        </div>
        <div style={{textAlign:"center",marginBottom:mob?48:72}}><span onClick={()=>goTo("archive")} style={{fontFamily:S.sf,fontSize:mob?12:14,fontWeight:300,letterSpacing:mob?3:5,color:S.txQ,cursor:"pointer",transition:"color .4s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=S.txQ}>all sloists are here</span></div>
        <div style={{borderTop:"1px solid "+S.ln,paddingTop:mob?28:40,display:"flex",justifyContent:"space-between",alignItems:mob?"flex-start":"center",flexDirection:mob?"column":"row",gap:mob?20:0}}>
          <div style={{fontSize:10,color:S.txGh,lineHeight:2,letterSpacing:.5}}>{"\u00A9 2026 sloist. all rights reserved."}<br/><span style={{fontSize:9}}>all content and images are the property of sloist and their respective creators.</span></div>
          <div style={{display:"flex",gap:24}}>{["terms","privacy"].map(l=><button key={l} onClick={()=>sLeg(l)} style={{fontFamily:S.sf,fontSize:10,letterSpacing:3,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .3s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txF} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>{l}</button>)}</div>
        </div>
      </div>
      {legalOpen&&<div onClick={()=>sLeg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.06)",zIndex:190,display:"flex",justifyContent:"center",alignItems:"center"}}><div onClick={e=>e.stopPropagation()} style={{background:S.bg,padding:mob?32:56,maxWidth:520,width:"90%",border:"1px solid "+S.ln}}>
        <div style={{fontFamily:S.sf,fontSize:mob?14:16,letterSpacing:4,marginBottom:28,fontWeight:300}}>{legalOpen}</div>
        <p style={{fontSize:13,lineHeight:2.2,color:S.txM}}>{legalOpen==="terms"?"\uC290\uB85C\uC774\uC2A4\uD2B8\uC758 \uBAA8\uB4E0 \uCF58\uD150\uCE20\uB294 \uC5D0\uB514\uD130\uC758 \uC2DC\uC120\uC73C\uB85C \uAE30\uB85D\uB41C \uAC83\uC774\uBA70, \uBB34\uB2E8 \uBCF5\uC81C \uBC0F \uC0C1\uC5C5\uC801 \uC774\uC6A9\uC744 \uAE08\uD569\uB2C8\uB2E4.":"\uC290\uB85C\uC774\uC2A4\uD2B8\uB294 \uC0AC\uC6A9\uC790\uC758 \uAC1C\uC778\uC815\uBCF4\uB97C \uC18C\uC911\uD788 \uB2E4\uB8F9\uB2C8\uB2E4."}</p>
        <button onClick={()=>sLeg(null)} style={{marginTop:24,fontFamily:S.sf,fontSize:10,letterSpacing:3,color:S.txF,background:"none",border:"none",cursor:"pointer"}}>close</button>
      </div></div>}
    </div>}

    {/* ARCHIVE */}
    {view==="archive"&&<div style={{...fd(cVis,"0.9s"),minHeight:"100vh",display:"flex",flexDirection:"column"}}><Nav/><div style={{padding:mob?"48px 16px":"96px 36px",flex:"1 0 auto"}}><div style={{display:"flex",justifyContent:"flex-end",marginBottom:mob?20:32}}><button onClick={goBack} style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txGh,background:"none",border:"none",cursor:"pointer"}}>back</button></div><div style={{textAlign:"center",marginBottom:mob?56:100}}><p style={{fontFamily:S.sf,fontSize:mob?14:16,lineHeight:2.6,color:S.txQ,letterSpacing:1}}>{"\uB290\uB9B0 \uC0B6\uC744 \uC0AC\uB294 \uC0AC\uB78C\uB4E4,"}<br/>{"\uADF8\uB9AC\uACE0 \uADF8\uB4E4\uC774 \uB0A8\uAE34 \uAE30\uB85D"}</p></div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":tab?"repeat(2,1fr)":"repeat(3,1fr)",gap:mob?"56px 0":tab?"64px 40px":"80px 56px"}}>{Object.entries(ED).map(([eid,ed],idx)=><div key={eid} style={{opacity:0,animation:"stg .7s ease "+idx*.1+"s both"}} onClick={()=>openRoom(eid)}>
        <div style={{cursor:"pointer",textAlign:"center"}}><div style={{width:"100%",aspectRatio:"3/4",background:ed.grad,borderRadius:2,marginBottom:24,overflow:"hidden"}}>{ed.img&&<img src={ed.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:10}}><span style={{fontFamily:S.sf,fontSize:mob?16:18,letterSpacing:3,fontWeight:300}}>{ed.name}</span><span style={{fontSize:10,color:S.txGh,letterSpacing:1}}>{ed.tags.join(" \u00B7 ")}</span></div>
        <div style={{fontSize:12,color:S.txQ,lineHeight:1.7}}>{ed.bio}</div></div>
      </div>)}</div></div><Foot/></div>}

    {/* ROOM */}
    {view==="room"&&edRoom&&ED[edRoom]&&!detail&&(()=>{const ed=ED[edRoom],ei=edItems(edRoom);return <div style={{...fd(cVis,"0.6s"),minHeight:"100vh",display:"flex",flexDirection:"column"}}><Nav/>
      <div style={{padding:mob?"0 16px":"0 36px",flex:"1 0 auto"}}>
        <div style={{display:"flex",justifyContent:"flex-end",padding:mob?"16px 0 0":"24px 0 0"}}><button onClick={goBack} style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txGh,background:"none",border:"none",cursor:"pointer"}}>back</button></div>
        <div style={{textAlign:"center",padding:"24px 0 24px"}}>
          <div style={{width:80,height:80,borderRadius:"50%",overflow:"hidden",margin:"0 auto 16px",background:ed.grad}}>{ed.img&&<img src={ed.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}</div>
          <div style={{fontFamily:S.sf,fontSize:22,fontWeight:300,letterSpacing:6,marginBottom:10}}>{"sloist "+ed.name}</div>
          <div style={{fontSize:11,color:S.txGh,letterSpacing:2,marginBottom:12}}>{ed.tags.join(" \u00B7 ")}</div>
          <div style={{fontSize:13,color:S.txQ,marginBottom:16,lineHeight:1.7}}>{ed.bio}</div>
          <button onClick={()=>toggleFol(edRoom)} style={{fontFamily:S.sf,fontSize:10,letterSpacing:4,color:following.includes(edRoom)?S.ac:S.txGh,background:"none",border:"none",borderBottom:following.includes(edRoom)?"1px solid "+S.ac:"1px solid "+S.lnL,padding:"4px 0",cursor:"pointer",transition:"all .3s"}}>{following.includes(edRoom)?"following":"follow"}</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(3,1fr)",gap:mob?12:16,gridAutoFlow:"dense",marginTop:28}}>{ei.map(it=>{const isWide=it.root==="scene"&&it.type==="\uC601\uC0C1";const cols=mob?2:3;const aspect=it.root==="scene"?(it.type==="\uC7A5\uBA74"||it.type==="\uB8E8\uD2F4"?"3/4":"1/1"):(it.root==="objet"?"4/5":"4/3");return <div key={it.id} style={{gridColumn:isWide?"span "+cols:"span 1",cursor:"pointer",position:"relative"}} onClick={()=>{scrollSave.current=window.scrollY;lt(()=>sDetail(it));}}><SavedDot isSaved={isSaved(it.id)}/><Img grad={it.grad} photo={it.photo} aspect={isWide?"16/9":aspect} r={2}/><div style={{fontSize:12,fontWeight:300,marginTop:8}}>{it.title}</div></div>;})}</div>
      </div><Foot/></div>;})()}
    {view==="room"&&detail&&<DetailView hideEditor={true}/>}

    {/* MY PAGE */}
    {view==="mypage"&&!detail&&<div style={{...fd(cVis,"0.6s"),minHeight:"100vh",display:"flex",flexDirection:"column"}}><Nav/>
      <div style={{padding:px,flex:"1 0 auto"}}>
        <div style={{textAlign:"center",padding:"28px 0 12px"}}><div style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txGh,marginBottom:10}}>{"sloist "+(auth.profile?.name||"guest")}</div><div style={{fontFamily:S.sf,fontSize:mob?20:26,fontWeight:300,letterSpacing:4}}>my archive</div></div>
        <div style={{display:"flex",justifyContent:"center",gap:mob?28:48,margin:"32px 0 44px"}}>{[...(auth.isEditor?["posts"]:[]),"saved","following","account"].map(k=><button key={k} onClick={()=>lt(()=>sMyTab(k))} style={{fontFamily:S.sf,fontSize:14,letterSpacing:mob?3:5,textTransform:"lowercase",color:myTab===k?S.tx:S.txGh,fontWeight:myTab===k?400:300,background:"none",border:"none",borderBottom:myTab===k?"2px solid "+S.tx:"2px solid transparent",padding:"10px 0",cursor:"pointer",transition:"all .25s"}}>{k}</button>)}</div>
        <div style={fd(cVis)}>
          {myTab==="posts"&&auth.isEditor&&(()=>{const myPosts=items.filter(i=>auth.isAdmin?true:i.editor===auth.editorId);return myPosts.length>0?<div style={{maxWidth:860,margin:"0 auto"}}>{myPosts.map(it=><div key={it.id} style={{display:"flex",gap:mob?12:20,padding:"20px 0",borderBottom:"1px solid "+S.lnL,alignItems:"center"}}>
            <div style={{width:mob?72:120,flexShrink:0,cursor:"pointer"}} onClick={()=>openDetail(it)}><Img grad={it.grad} photo={it.photo} aspect="4/3" r={2}/></div>
            <div style={{flex:1}}>
              <div style={{fontFamily:S.sf,fontSize:9,letterSpacing:5,color:S.ac,marginBottom:4}}>{it.root}</div>
              <div style={{fontSize:mob?13:15,fontWeight:300,marginBottom:4,cursor:"pointer"}} onClick={()=>openDetail(it)}>{it.title}</div>
              <div style={{fontSize:11,color:S.txGh}}>{it.editor||"official"}</div>
            </div>
            <div style={{display:"flex",gap:12,flexShrink:0}}>
              <button onClick={()=>{setEditItem(it);setShowWrite(true);}} style={{fontFamily:S.sf,fontSize:10,letterSpacing:3,color:S.txQ,background:"none",border:"none",cursor:"pointer"}}>수정</button>
              <button onClick={async()=>{if(!confirm("정말 삭제하시겠습니까?")){return;}const{error}=await supabase.from("contents").delete().eq("id",it.id);if(error){flash("삭제 실패: "+error.message);}else{flash("삭제 완료");sItems(p=>p.filter(x=>x.id!==it.id));}}} style={{fontFamily:S.sf,fontSize:10,letterSpacing:3,color:S.txGh,background:"none",border:"none",cursor:"pointer"}}>삭제</button>
            </div>
          </div>)}</div>:<div style={{textAlign:"center",padding:"80px 0",fontSize:14,color:S.txGh}}>아직 작성한 기록이 없습니다</div>;})()}
          {myTab==="saved"&&(()=>{const all=[...sv("space"),...sv("scene"),...sv("objet")];return all.length>0?<div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?16:24,maxWidth:860,margin:"0 auto"}}>{all.map(it=><div key={it.id} onClick={()=>openDetail(it)} style={{cursor:"pointer",position:"relative"}}><Img grad={it.grad} photo={it.photo} aspect="4/3" r={2}/><div style={{marginTop:10}}><div style={{fontSize:14,fontWeight:300,marginBottom:4}}>{it.title}</div><div style={{fontFamily:S.sf,fontSize:9,letterSpacing:5,color:S.ac}}>{it.root}</div></div></div>)}</div>:<div style={{textAlign:"center",padding:"80px 0"}}><div style={{fontSize:14,color:S.txGh,lineHeight:2.2}}>{"\uC544\uC9C1 \uC800\uC7A5\uD55C \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"}<br/><span style={{fontSize:12}}>{"\uB9C8\uC74C\uC5D0 \uB2FF\uB294 \uAE30\uB85D\uC744 keep \uD574\uBCF4\uC138\uC694"}</span></div></div>;})()}
          {myTab==="following"&&<div style={{maxWidth:640,margin:"0 auto"}}>{following.length>0?following.map(eid=>{const ed=ED[eid];if(!ed)return null;return <div key={eid} style={{display:"flex",alignItems:"center",gap:24,padding:"28px 0",borderBottom:"1px solid "+S.lnL}}><div onClick={()=>openRoom(eid)} style={{width:60,height:60,borderRadius:"50%",overflow:"hidden",flexShrink:0,cursor:"pointer",background:ed.grad}}>{ed.img&&<img src={ed.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}</div><div style={{flex:1}}><div onClick={()=>openRoom(eid)} style={{fontSize:16,fontWeight:300,marginBottom:4,cursor:"pointer"}}>{ed.name}</div><div style={{fontSize:12,color:S.txQ}}>{ed.bio}</div></div></div>;}):<div style={{textAlign:"center",padding:"80px 0",fontSize:14,color:S.txGh}}>{"\uC544\uC9C1 \uD314\uB85C\uC6B0\uD55C \uC290\uB85C\uC774\uC2A4\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4"}</div>}</div>}
          {myTab==="account"&&<div style={{maxWidth:480,margin:"0 auto",padding:"20px 0"}}><div style={{borderBottom:"1px solid "+S.lnL,padding:"24px 0"}}><div style={{fontSize:10,letterSpacing:4,color:S.txGh,marginBottom:10}}>profile</div><div style={{fontSize:16,fontWeight:300,marginBottom:4}}>{auth.profile?.name||"guest"}</div><div style={{fontSize:13,color:S.txQ}}>{auth.user?.email||""}</div><div style={{fontSize:11,color:S.ac,marginTop:6,letterSpacing:2}}>{auth.role}</div></div><div style={{borderBottom:"1px solid "+S.lnL,padding:"24px 0"}}><div style={{fontSize:10,letterSpacing:4,color:S.txGh,marginBottom:10}}>preferences</div><div style={{fontSize:13,color:S.txM,lineHeight:2}}>{"\uC54C\uB9BC: \uC0C8 \uAE30\uB85D\uC774 \uC62C\uB77C\uC62C \uB54C"}<br/>{"\uC5B8\uC5B4: \uD55C\uAD6D\uC5B4"}</div></div><div style={{padding:"24px 0"}}><div style={{fontSize:10,letterSpacing:4,color:S.txGh,marginBottom:10}}>support</div><div style={{fontSize:13,color:S.txM,lineHeight:2.4}}><a href="mailto:slistkr@gmail.com" style={{color:S.txM,textDecoration:"none"}}>{"\uBB38\uC758\uD558\uAE30"}</a><br/><span style={{cursor:"pointer"}} onClick={()=>goTo("about")}>{"\uC774\uC6A9\uC57D\uAD00"}</span><br/><span style={{cursor:"pointer"}} onClick={()=>goTo("about")}>{"\uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68"}</span></div></div><div style={{textAlign:"center",padding:"40px 0"}}>{auth.user?<button onClick={()=>{auth.signOut();goHome();}} style={{fontFamily:S.sf,fontSize:11,letterSpacing:4,color:S.txGh,background:"none",border:"1px solid "+S.lnL,borderRadius:4,padding:"8px 24px",cursor:"pointer"}}>logout</button>:<button onClick={()=>setShowAuth(true)} style={{fontFamily:S.sf,fontSize:11,letterSpacing:4,color:S.txGh,background:"none",border:"1px solid "+S.lnL,borderRadius:4,padding:"8px 24px",cursor:"pointer"}}>login</button>}</div></div>}
        </div>
      </div><Foot/>
    </div>}
    {view==="mypage"&&detail&&<DetailView/>}

    {showTop&&<button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{position:"fixed",bottom:mob?28:36,right:mob?16:36,fontFamily:S.sf,fontSize:10,letterSpacing:4,color:S.txGh,background:S.bg,border:"none",cursor:"pointer",padding:"8px 0",transition:"opacity .4s",opacity:.7,zIndex:100}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity=".7"}>top</button>}
    {toast&&<div style={{position:"fixed",bottom:36,left:"50%",transform:"translateX(-50%)",color:S.txM,fontSize:12,fontWeight:300,letterSpacing:4,zIndex:300,fontFamily:S.sf}}>{toast}</div>}

    {/* 로그인/회원가입 */}
    {showAuth&&<div style={{position:"fixed",inset:0,zIndex:500}}><Auth onAuth={()=>setShowAuth(false)} signIn={auth.signIn} signUp={auth.signUp}/></div>}

    {/* 글쓰기 에디터 */}
    {showWrite&&<div style={{position:"fixed",inset:0,zIndex:500,overflowY:"auto",background:S.bg}}><WriteEditor editorId={auth.editorId} isAdmin={auth.isAdmin} editItem={editItem} onClose={()=>{setShowWrite(false);setEditItem(null);}} onSaved={()=>{setShowWrite(false);setEditItem(null);window.location.reload();}}/></div>}

    {/* 관리자 패널 */}
    {showAdmin&&<div style={{position:"fixed",inset:0,zIndex:500,overflowY:"auto",background:S.bg}}><AdminPanel onClose={()=>setShowAdmin(false)}/></div>}

    {/* 슬로이스트 프로필 만들기 */}
    {showEditorProfile&&<div style={{position:"fixed",inset:0,zIndex:500,overflowY:"auto",background:S.bg}}><EditorProfile userId={auth.user?.id} existingEditor={auth.editorId&&ED[auth.editorId]?{...ED[auth.editorId],id:auth.editorId}:null} onClose={()=>setShowEditorProfile(false)} onSaved={()=>{setShowEditorProfile(false);auth.reloadProfile();window.location.reload();}}/></div>}
  </div>;
}
