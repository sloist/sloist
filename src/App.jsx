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
import ScrollReveal from "./components/ScrollReveal";
import StickyCover from "./components/StickyCover";

export default function Sloist(){
  const { ED: _ED, ALL, SPACE, SCENE, OBJET, loading, error } = useSupabaseData();
  const ED = _ED || {};
  const auth = useAuth();
  const [showAuth, setShowAuth] = useState(false); // 레거시 — 이제 view==="login" 사용
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
  const [postsCat,sPostsCat]=useState("");
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
  const [userLoc,sUserLoc]=useState(null);
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
  },[activeCat]);

  // Supabase 데이터 로드되면 items 초기화
  useEffect(()=>{
    if(ALL&&ALL.length>0&&!dataLoaded){sItems(ALL);setDataLoaded(true);}
  },[ALL,dataLoaded]);
  // 사용자 위치 — space 카테고리 진입 시에만
  useEffect(()=>{
    if(activeCat==="space"&&!userLoc&&navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>sUserLoc({lat:p.coords.latitude,lng:p.coords.longitude}),()=>{});
  },[activeCat,userLoc]);

  const flash=useCallback(m=>{sToast(m);setTimeout(()=>sToast(null),1400);},[]);
  const keep=useCallback(id=>{const was=items.find(i=>i.id===id)?.saved;sItems(p=>p.map(i=>i.id===id?{...i,saved:!i.saved}:i));flash(was?"removed":"saved");},[items,flash]);
  const toggleFol=eid=>{const was=following.includes(eid);sFol(p=>was?p.filter(x=>x!==eid):[...p,eid]);flash(was?"unfollowed":"followed");};
  const isSaved=id=>items.find(i=>i.id===id)?.saved;
  const setCover=useCallback(async(id)=>{
    // optimistic update
    sItems(p=>p.map(i=>({...i,isCover:i.id===id})));
    flash("커버로 지정됨");
    // clear old covers, set new
    const{error:e1}=await supabase.from("contents").update({is_cover:false}).eq("is_cover",true);
    const{error:e2}=await supabase.from("contents").update({is_cover:true}).eq("id",id);
    if(e1||e2){flash("저장 실패");sItems(p=>p.map(i=>({...i,isCover:false})));}
  },[flash]);

  const lt=fn=>{sCVis(false);setTimeout(()=>{fn();sCVis(true);},280);};
  const mt=fn=>{sCVis(false);setTimeout(()=>{fn();window.scrollTo({top:0});setTimeout(()=>sCVis(true),120);},500);};

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
        else if(path==="/login"){sView("login");sDetail(null);}
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
  const fd=(show)=>({opacity:show?1:0,transition:"opacity .8s cubic-bezier(.2,0,.3,1)"});
  const px=mob?"0 16px":"0 36px";
  useEffect(()=>{if(sov){sSq("");sShowTags(false);setTimeout(()=>sqRef.current?.focus(),120);}},[sov]);

  const homeFeed=useMemo(()=>{
    const cover=items.find(i=>i.isCover);
    const rest=items.filter(i=>!i.isCover);
    // 카테고리별 최신순 버킷
    const buckets={space:[],scene:[],objet:[]};
    [...rest].sort((a,b)=>{
      const da=a.created_at||a.id, db=b.created_at||b.id;
      return da<db?1:da>db?-1:0;
    }).forEach(i=>{if(buckets[i.root])buckets[i.root].push(i);});
    // 라운드로빈: space→scene→objet 순환
    const order=["space","scene","objet"];
    const idx=[0,0,0];
    const picked=[];
    for(let r=0;r<7;r++){
      const ci=r%3;
      if(idx[ci]<buckets[order[ci]].length){picked.push(buckets[order[ci]][idx[ci]]);idx[ci]++;}
      else{for(let j=1;j<=2;j++){const ai=(ci+j)%3;if(idx[ai]<buckets[order[ai]].length){picked.push(buckets[order[ai]][idx[ai]]);idx[ai]++;break;}}}
    }
    return cover?[cover,...picked]:picked;
  },[items]);

  const catItems=useMemo(()=>{
    if(!activeCat)return homeFeed;
    const all=items.filter(i=>i.root===activeCat);
    const fv=activeCat==="space"?spCat:activeCat==="scene"?scCat:obCat;
    const fk=activeCat==="space"?"cat":activeCat==="scene"?"type":"otype";
    const filtered=fv.length===0?all:all.filter(i=>fv.includes(i[fk]));
    if(activeCat==="space"||fv.length>0)return filtered;
    // scene/objet: 타입별 라운드로빈
    const buckets={};filtered.forEach(i=>{const k=i[fk]||"";if(!buckets[k])buckets[k]=[];buckets[k].push(i);});
    const keys=Object.keys(buckets);if(keys.length<=1)return filtered;
    const idx=keys.map(()=>0);const result=[];
    while(result.length<filtered.length){for(let j=0;j<keys.length;j++){if(idx[j]<buckets[keys[j]].length){result.push(buckets[keys[j]][idx[j]]);idx[j]++;}}}
    return result;
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
    return <>{opts.map(o=>{const a=fv.includes(o);return <button key={o} onClick={()=>{window.scrollTo({top:0,behavior:"smooth"});lt(()=>{multi?fs(a?fv.filter(x=>x!==o):[...fv,o]):fs(a?[]:[o]);});}} style={{fontFamily:S.sn,fontSize:mob?10:11,fontWeight:a?400:300,letterSpacing:2,color:a?S.tx:S.txGh,background:"none",border:"none",borderBottom:a?"1px solid "+S.ac:"1px solid transparent",padding:mob?"6px 0":"8px 0",cursor:"pointer",transition:"all .5s"}}>{o}</button>;})}</>;
  };

  /* ── Nav ── */
  const Nav=({showCats})=>{
    const r1h=mob?48:60;
    return <div style={{position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:r1h,padding:mob?"0 20px":"0 40px",background:S.bg,position:"relative",zIndex:2}}>
        <div onClick={goHome} style={{fontFamily:S.sf,fontSize:mob?18:24,fontWeight:300,letterSpacing:mob?8:14,color:S.tx,cursor:"pointer",transition:"opacity .5s"}} onMouseEnter={e=>e.currentTarget.style.opacity=".6"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>sloist</div>
        <div style={{display:"flex",alignItems:"center",gap:mob?14:24}}>
          {auth.isEditor&&!auth.isAdmin&&!auth.editorId&&<button onClick={()=>setShowEditorProfile(true)} style={{fontFamily:S.sn,fontSize:10,fontWeight:300,letterSpacing:3,color:S.ac,background:"none",border:"none",cursor:"pointer",padding:4}}>프로필 만들기</button>}
          {auth.editorId&&<button onClick={()=>setShowEditorProfile(true)} style={{fontFamily:S.sn,fontSize:10,fontWeight:300,letterSpacing:3,color:S.txGh,background:"none",border:"none",cursor:"pointer",padding:4}}>프로필</button>}
          {(auth.isAdmin||(auth.isEditor&&auth.editorId))&&<button onClick={()=>{setEditItem(null);setShowWrite(true);}} style={{fontFamily:S.sn,fontSize:10,fontWeight:300,letterSpacing:3,color:S.ac,background:"none",border:"none",cursor:"pointer",padding:4}}>write</button>}
          {auth.isAdmin&&<button onClick={()=>setShowAdmin(true)} style={{fontFamily:S.sn,fontSize:10,fontWeight:300,letterSpacing:3,color:S.txGh,background:"none",border:"none",cursor:"pointer",padding:4}}>admin</button>}
          <button onClick={()=>sSov(true)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:4}}><SIcon/></button>
          <button onClick={()=>{if(auth.user){if(view!=="mypage")goTo("mypage");}else goTo("login");}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:4}}><UIcon/></button>
        </div>
      </div>
      {showCats&&<div style={{position:"absolute",top:r1h,left:0,right:0,zIndex:1,background:S.bg,transform:headerVis?"translateY(0)":"translateY(-110%)",opacity:headerVis?1:0,transition:"transform .6s cubic-bezier(.4,0,.2,1), opacity .5s cubic-bezier(.2,0,.3,1)",pointerEvents:headerVis?"auto":"none"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:mob?32:56,padding:mob?"8px 0":"10px 0"}}>
          {CATS.map(k=><button key={k} onClick={()=>onCatClick(k)} style={{fontFamily:S.sn,fontSize:mob?11:12,fontWeight:activeCat===k?400:300,letterSpacing:mob?4:6,textTransform:"lowercase",color:activeCat===k?S.tx:S.txF,background:"none",border:"none",borderBottom:activeCat===k?"1px solid "+S.tx:"1px solid transparent",padding:mob?"6px 0":"8px 0",cursor:"pointer",transition:"all .5s"}}>{k}</button>)}
        </div>
        {activeCat&&activeCat!=="space"&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:mob?14:28,flexWrap:"wrap",padding:mob?"4px 20px 10px":"4px 40px 12px"}}>
          <FilterBtns/>
        </div>}
      </div>}
    </div>;
  };
  const Foot=()=><div style={{textAlign:"center",padding:"64px 0 40px",flexShrink:0}}><button onClick={()=>goTo("about")} style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txF} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>slow with sloist</button></div>;

  /* ── Detail ── */
  const DetailView=({hideEditor})=>{
    if(!dl)return null;
    return <div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Nav/>
      <div style={{flex:"1 0 auto"}}>
        <div style={{position:"relative",width:"100%",aspectRatio:mob?"16/10":"21/9",overflow:"hidden"}}>
          {dl.photo?<img src={dl.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:dl.grad}}/>}
        </div>
        <div style={{maxWidth:mob?undefined:720,margin:"0 auto",padding:mob?"36px 20px 80px":"64px 48px 120px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:mob?36:56}}>
            <div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,textTransform:"lowercase",color:S.ac}}>{dl.type||dl.cat||dl.otype||""}</div>
            <button onClick={closeDetail} style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txQ} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>back</button>
          </div>
          <h1 style={{fontFamily:S.sf,fontSize:mob?28:48,fontWeight:300,lineHeight:1.4,letterSpacing:mob?0:1,marginBottom:20,textAlign:"center"}}>{dl.title}</h1>

          {/* Space: 위치 + 태그 + 미니맵 */}
          {dl.root==="space"&&<>
            {dl.location&&<div style={{fontFamily:S.sn,fontSize:11,fontWeight:300,letterSpacing:2,color:S.txF,marginBottom:16,textAlign:"center"}}>{dl.location}</div>}
            {dl.tags&&<div style={{fontFamily:S.sn,fontSize:10,fontWeight:300,letterSpacing:2,color:S.txGh,marginBottom:mob?40:64,textAlign:"center"}}>{dl.tags}</div>}
            {!dl.location&&<div style={{height:mob?32:48}}/>}
            <div style={{maxWidth:560,margin:"0 auto"}}>
              {dl.note&&<div style={{fontFamily:S.bd,fontSize:mob?14:15,fontWeight:400,color:S.txM,lineHeight:2.0,marginBottom:mob?48:80}}>{dl.note}</div>}
              {dl.lat&&dl.lng&&<div style={{marginBottom:mob?48:80,borderRadius:4,overflow:"hidden",border:"1px solid "+S.lnL}}><SpaceMap spaces={[dl]} hovId={null} onHover={()=>{}} onClick={()=>{}} style={{width:"100%",height:mob?200:240}}/></div>}
            </div>
          </>}

          {/* Scene: 저자/감독 + 타입 */}
          {dl.root==="scene"&&<>
            {dl.sub&&<p style={{fontFamily:S.bd,fontSize:14,fontWeight:300,color:S.txQ,marginBottom:8,textAlign:"center",lineHeight:1.8}}>{dl.sub}</p>}
            {dl.type&&<div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,marginBottom:mob?48:80,textAlign:"center"}}>{dl.type}</div>}
            {!dl.sub&&!dl.type&&<div style={{height:mob?32:48}}/>}
            <div style={{maxWidth:560,margin:"0 auto"}}>
              {dl.note&&<div style={{fontFamily:S.bd,fontSize:mob?14:15,fontWeight:400,color:S.txM,lineHeight:2.0,marginBottom:mob?48:80}}>{dl.note}</div>}
            </div>
          </>}

          {/* Objet: 제작자 강조 */}
          {dl.root==="objet"&&<>
            {dl.maker&&<div style={{fontFamily:S.sn,fontSize:12,fontWeight:300,letterSpacing:3,color:S.txQ,marginBottom:mob?48:80,textAlign:"center"}}>{dl.maker}</div>}
            {!dl.maker&&<div style={{height:mob?32:48}}/>}
            <div style={{maxWidth:560,margin:"0 auto"}}>
              {dl.note&&<div style={{fontFamily:S.bd,fontSize:mob?14:15,fontWeight:400,color:S.txM,lineHeight:2.0,marginBottom:mob?48:80}}>{dl.note}</div>}
            </div>
          </>}

          {/* 기타 (root 없는 경우 폴백) */}
          {!["space","scene","objet"].includes(dl.root)&&<>
            {dl.sub&&<p style={{fontFamily:S.bd,fontSize:14,fontWeight:300,color:S.txQ,marginBottom:20,textAlign:"center",lineHeight:1.8}}>{dl.sub}</p>}
            <div style={{height:mob?48:80}}/>
            <div style={{maxWidth:560,margin:"0 auto"}}>
              {dl.note&&<div style={{fontFamily:S.bd,fontSize:mob?14:15,fontWeight:400,color:S.txM,lineHeight:2.0,marginBottom:mob?48:80}}>{dl.note}</div>}
            </div>
          </>}
          <div style={{borderTop:"1px solid "+S.lnL,paddingTop:32,display:"flex",alignItems:"center",justifyContent:"center",gap:mob?24:40,flexWrap:"wrap"}}>
            <button onClick={()=>keep(dl.id)} style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:dl.saved?S.ac:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}}>{dl.saved?"kept":"keep"}</button>
            <button onClick={()=>flash("link copied")} style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}}>share</button>
            {dl.link&&<a href={dl.link} target="_blank" rel="noopener noreferrer" style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,textDecoration:"none",transition:"color .5s"}}>{lLabel(dl)}</a>}
            {!hideEditor&&dl.editor&&ED[dl.editor]&&<span onClick={()=>openRoom(dl.editor)} style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txQ,cursor:"pointer",transition:"color .5s"}}>{aLabel(dl,ED)}</span>}
            {dl.isOfficial&&<span onClick={()=>goTo("about")} style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,cursor:"pointer",transition:"color .5s"}}>by sloist</span>}
            {(auth.isAdmin||(auth.editorId&&dl.editor===auth.editorId))&&<button onClick={()=>{setEditItem(dl);setShowWrite(true);}} style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txQ,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}}>수정</button>}
            {auth.isAdmin&&<button onClick={()=>setCover(dl.id)} style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:dl.isCover?S.ac:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}}>{dl.isCover?"홈 커버":"커버 지정"}</button>}
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
    {sov&&<div style={{position:"fixed",inset:0,background:"rgba(249,248,247,.97)",backdropFilter:"blur(32px)",zIndex:200,overflowY:"auto",animation:"fi .8s cubic-bezier(.2,0,.3,1)"}}>
      <div style={{display:"flex",justifyContent:"flex-end",padding:mob?"16px 20px":"20px 40px"}}>
        <button onClick={()=>sSov(false)} style={{fontFamily:S.sn,fontSize:10,fontWeight:300,letterSpacing:3,color:S.txQ,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=S.txQ}>close</button>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",padding:"12vh 24px 80px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <input ref={sqRef} placeholder="search" value={sq} onChange={e=>sSq(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&sq.trim())doSearch(sq.trim());}} style={{width:"100%",maxWidth:280,background:"transparent",border:"none",borderBottom:"1px solid "+S.ln,padding:"14px 0",fontFamily:S.sf,fontSize:mob?16:20,fontWeight:300,color:S.tx,letterSpacing:4,outline:"none",textAlign:"center"}}/>
        {sq.trim()&&<div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txF,marginTop:20}}>begin slow</div>}
        {!sq.trim()&&<button onClick={()=>sShowTags(!showTags)} style={{marginTop:32,fontFamily:S.sn,fontSize:10,fontWeight:300,letterSpacing:3,color:S.txF,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txQ} onMouseLeave={e=>e.currentTarget.style.color=S.txF}>{showTags?"hide":"tags"}</button>}
        {showTags&&!sq.trim()&&<div style={{width:"100%",marginTop:28}}><div style={{display:"grid",gridTemplateColumns:mob?"repeat(3,1fr)":"repeat(4,1fr)",gap:mob?"0 16px":"0 24px"}}>{TAGS.map((t,i)=><button key={t} onClick={()=>doSearch(t)} style={{fontFamily:S.bd,fontSize:12,fontWeight:300,letterSpacing:1,color:S.txQ,background:"none",border:"none",cursor:"pointer",padding:"20px 0",textAlign:"center",opacity:0,animation:"tagIn .5s cubic-bezier(.2,0,.3,1) "+i*.07+"s forwards",transition:"color .5s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=S.txQ}>{t}</button>)}</div></div>}
      </div>
    </div>}

    {/* ═══ HOME ═══ */}
    {view==="home"&&!detail&&<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:activeCat==="space"?"#f8f7f4":activeCat==="objet"?"#f7f8f7":activeCat==="scene"?"#f6f5f3":S.bg}}>
      <Nav showCats={true}/>
      <div style={{flex:"1 0 auto"}}>
        {activeCat&&activeCat!=="space"&&<div style={{...fd(cVis),textAlign:"center",paddingTop:mob?56:72,paddingBottom:mob?4:8}}><span style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:mob?6:8,color:S.txGh,textTransform:"lowercase"}}>{activeCat}</span></div>}

        {/* ── HOME EDITORIAL ── */}
        {!activeCat&&<div style={fd(cVis)}>

          {/* ① 커튼 + 뒤에 숨은 패널 A */}
          <StickyCover
            curtain={
              <div style={{height:"calc(100 * var(--dvh, 1vh))",background:S.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingLeft:mob?32:40,paddingRight:mob?32:40,paddingTop:0,paddingBottom:mob?80:120}}>
                {h[0]&&<div onClick={()=>openDetail(h[0])} style={{cursor:"pointer",position:"relative",width:"100%",maxWidth:mob?280:480}}>
                  <SavedDot isSaved={isSaved(h[0].id)}/>
                  <Img grad={h[0].grad} photo={h[0].photo} aspect="4/5" r={4}/>
                </div>}
              </div>
            }
            reveal={
              <div style={{height:"calc(100 * var(--dvh, 1vh))",background:S.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:mob?"0 24px":"0 56px"}}>
                {mob
                  ?<div style={{width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:24}}>
                    {h.slice(1,3).map((it,i)=>it&&<div key={it.id} onClick={()=>openDetail(it)} style={{cursor:"pointer",position:"relative",width:i===0?"85%":"72%",alignSelf:i===0?"flex-start":"flex-end"}}>
                      <SavedDot isSaved={isSaved(it.id)}/>
                      <Img grad={it.grad} photo={it.photo} aspect="4/5" r={4}/>
                      <div style={{marginTop:10}}>
                        <div style={{fontFamily:S.sf,fontSize:13,fontWeight:300,lineHeight:1.5,marginBottom:3}}>{it.title}</div>
                        <div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txF}}>{it.root}</div>
                      </div>
                    </div>)}
                  </div>
                  :<div style={{width:"100%",maxWidth:960,display:"grid",gridTemplateColumns:"1fr 1fr",gap:56}}>
                    {h.slice(1,3).map((it,i)=>it&&<div key={it.id} onClick={()=>openDetail(it)} style={{cursor:"pointer",position:"relative",marginTop:i===1?60:0}}>
                      <SavedDot isSaved={isSaved(it.id)}/>
                      <Img grad={it.grad} photo={it.photo} aspect="4/5" r={4}/>
                      <div style={{marginTop:20}}>
                        <div style={{fontFamily:S.sf,fontSize:17,fontWeight:300,lineHeight:1.5,marginBottom:4}}>{it.title}</div>
                        <div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txF}}>{it.root}</div>
                      </div>
                    </div>)}
                  </div>
                }
              </div>
            }
          />

          {/* ── 전시 패널 ── */}
          <div style={{position:"relative",zIndex:2,background:S.bg}}>

          {/* 패널 B — 중앙 1점 */}
          {h[3]&&<div style={{margin:"0 auto",padding:mob?"48px 24px 0":"120px 24px 0",maxWidth:mob?undefined:560}}>
            <ScrollReveal>
              <div onClick={()=>openDetail(h[3])} style={{cursor:"pointer",position:"relative",width:mob?"88%":"100%",margin:mob?"0 auto":undefined}}>
                <SavedDot isSaved={isSaved(h[3].id)}/>
                <Img grad={h[3].grad} photo={h[3].photo} aspect="3/2" r={4}/>
                <div style={{marginTop:mob?12:20,textAlign:"center"}}>
                  <div style={{fontFamily:S.sf,fontSize:mob?15:20,fontWeight:300,lineHeight:1.5,marginBottom:6}}>{h[3].title}</div>
                  <div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txF}}>{h[3].root}{h[3].location?" · "+h[3].location:""}</div>
                </div>
              </div>
            </ScrollReveal>
          </div>}

          {/* 패널 C — 3점 */}
          {mob
            ?<div style={{padding:"40px 24px 0"}}>
              {h.slice(4,7).map((it,i)=>it&&<ScrollReveal key={it.id} delay={i*100}>
                <div onClick={()=>openDetail(it)} style={{cursor:"pointer",position:"relative",width:"88%",marginBottom:40,margin:"0 auto 40px",marginLeft:i===0?"0":i===1?"auto":i===2?"0":undefined}}>
                  <SavedDot isSaved={isSaved(it.id)}/>
                  <Img grad={it.grad} photo={it.photo} aspect="4/5" r={4}/>
                  <div style={{marginTop:10}}>
                    <div style={{fontFamily:S.sf,fontSize:13,fontWeight:300,lineHeight:1.5,marginBottom:3}}>{it.title}</div>
                    <div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txF}}>{it.root}</div>
                  </div>
                </div>
              </ScrollReveal>)}
            </div>
            :<div style={{maxWidth:1140,margin:"0 auto",padding:"120px 56px 0"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:40}}>
                {h.slice(4,7).map((it,i)=>it&&<ScrollReveal key={it.id} delay={i*120}>
                  <div onClick={()=>openDetail(it)} style={{cursor:"pointer",position:"relative"}}>
                    <SavedDot isSaved={isSaved(it.id)}/>
                    <Img grad={it.grad} photo={it.photo} aspect="4/5" r={4}/>
                    <div style={{marginTop:16}}>
                      <div style={{fontFamily:S.sf,fontSize:15,fontWeight:300,lineHeight:1.5,marginBottom:4}}>{it.title}</div>
                      <div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txF}}>{it.root}</div>
                    </div>
                  </div>
                </ScrollReveal>)}
              </div>
            </div>
          }

          {/* archive 입구 */}
          <ScrollReveal>
            <div style={{textAlign:"center",padding:mob?"56px 0 20px":"100px 0 24px"}}>
              <span onClick={()=>goTo("archive")} style={{fontFamily:S.sf,fontSize:mob?12:14,fontWeight:300,letterSpacing:mob?3:5,color:S.txQ,cursor:"pointer",transition:"color .5s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=S.txQ}>all sloists are here</span>
            </div>
          </ScrollReveal>

          </div>{/* 전시 패널 닫기 */}
        </div>}

        {/* ── SPACE ── */}
        {activeCat==="space"&&(()=>{
          const f0=spCat.length>0?items.filter(i=>i.root==="space"&&spCat.includes(i.cat)):SPACE;
          const f=userLoc?[...f0].sort((a,b)=>{
            const da=Math.hypot((a.lat||0)-userLoc.lat,(a.lng||0)-userLoc.lng);
            const db=Math.hypot((b.lat||0)-userLoc.lat,(b.lng||0)-userLoc.lng);
            return da-db;
          }):f0;
          if(f.length===0)return <div style={{textAlign:"center",padding:"120px 0",fontFamily:S.sn,fontSize:13,fontWeight:300,color:S.txGh}}>등록된 공간이 없습니다</div>;
          const SpaceFilters=()=><div style={{position:"absolute",top:mob?10:12,left:"50%",transform:"translateX(-50%)",zIndex:5,display:"flex",gap:mob?4:6,flexWrap:"nowrap",justifyContent:"center"}}>
            {SP_C.map(c=><button key={c} onClick={()=>sSpCat(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c])} style={{fontFamily:S.sn,fontSize:mob?9:10,fontWeight:spCat.includes(c)?400:300,letterSpacing:mob?0:1,color:spCat.includes(c)?S.tx:S.txQ,background:spCat.includes(c)?"rgba(249,248,247,.95)":"rgba(249,248,247,.75)",border:"none",borderRadius:20,padding:mob?"5px 10px":"6px 14px",cursor:"pointer",transition:"all .3s",backdropFilter:"blur(4px)"}}>{c}</button>)}
          </div>;
          if(mob)return <div>
            <div style={{position:"sticky",top:48,zIndex:12,width:"100%",height:"40vh",minHeight:200,maxHeight:360,overflow:"hidden",borderBottom:"1px solid "+S.ln}}>
              <SpaceMap spaces={f} hovId={mobFocus} onHover={id=>sMobFocus(id)} onClick={s=>openDetail(s)} style={{width:"100%",height:"100%"}}/>
              <SpaceFilters/>
            </div>
            <div style={{background:S.bg,position:"relative",padding:"8px 20px 40px"}}>{f.map(it=><div key={it.id} onClick={()=>openDetail(it)} style={{display:"flex",gap:16,padding:"20px 0",borderBottom:"1px solid "+S.lnL,cursor:"pointer",position:"relative",transition:"background .5s"}}><SavedDot isSaved={isSaved(it.id)}/><div style={{width:80,flexShrink:0}}><Img grad={it.grad} photo={it.photo} aspect="1/1" r={2}/></div><div style={{paddingTop:2,flex:1}}><div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:3,color:S.ac,marginBottom:5}}>{it.location}</div><div style={{fontFamily:S.sf,fontSize:15,fontWeight:300,marginBottom:4}}>{it.title}</div><div style={{fontFamily:S.sn,fontSize:11,fontWeight:300,color:S.txF,lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{it.note}</div></div></div>)}</div>
          </div>;
          return <div style={{display:"flex",flexDirection:"row",minHeight:"100vh"}}>
            <div style={{width:"42vw",flexShrink:0,position:"sticky",top:0,height:"calc(100 * var(--dvh, 1vh))",overflow:"hidden",borderRight:"1px solid "+S.lnL}}>
              <SpaceMap spaces={f} hovId={spHov} onHover={id=>sSpHov(id)} onClick={s=>openDetail(s)} style={{width:"100%",height:"100%"}}/>
              <SpaceFilters/>
            </div>
            <div style={{...fd(cVis),flex:1,padding:"48px 40px 100px"}}>
              {(()=>{const cover=f.find(x=>x.isCover)||f[0];const rest=f.filter(x=>x.id!==cover.id);return <>
                <div onClick={()=>openDetail(cover)} onMouseEnter={()=>sSpHov(cover.id)} onMouseLeave={()=>sSpHov(null)} style={{cursor:"pointer",position:"relative",marginBottom:80}}><SavedDot isSaved={isSaved(cover.id)}/><Img grad={cover.grad} photo={cover.photo} aspect="3/2" r={3}/><div style={{marginTop:32}}><div style={{fontFamily:S.sn,fontSize:10,fontWeight:300,letterSpacing:3,color:S.ac,marginBottom:14}}>{cover.location}{cover.tags?" · "+cover.tags:""}</div><div style={{fontFamily:S.sf,fontSize:28,fontWeight:300,lineHeight:1.45,letterSpacing:1,marginBottom:16}}>{cover.title}</div><div style={{fontFamily:S.bd,fontSize:14,fontWeight:300,color:S.txM,lineHeight:2.0,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{cover.note}</div></div></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40}}>{rest.map(it=><div key={it.id} onClick={()=>openDetail(it)} onMouseEnter={()=>sSpHov(it.id)} onMouseLeave={()=>sSpHov(null)} style={{cursor:"pointer",position:"relative",marginBottom:24}}><SavedDot isSaved={isSaved(it.id)}/><Img grad={it.grad} photo={it.photo} aspect="4/3" r={2}/><div style={{marginTop:14}}><div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:3,color:S.ac,marginBottom:6}}>{it.location}</div><div style={{fontFamily:S.sf,fontSize:15,fontWeight:300,lineHeight:1.5}}>{it.title}</div></div></div>)}</div>
              </>;})()}
            </div>
          </div>;
        })()}

        {/* ── SCENE ── */}
        {activeCat==="scene"&&(()=>{
          const cols=mob?2:3;const hasF=scCat.length>0;
          return <div style={{...fd(cVis),maxWidth:1100,margin:"0 auto",padding:mob?"0 20px":"0 48px",display:"grid",gridTemplateColumns:"repeat("+cols+",1fr)",columnGap:mob?20:40,rowGap:mob?44:72,gridAutoFlow:"dense"}}>{catItems.map(it=>{const t=it.type||"";const isWide=t==="영상"||(it.aspect==="16/9");const span=isWide?cols:1;const asp=it.aspect||(isWide?"16/9":"3/4");const isMood=t==="장면"||t==="루틴";return <div key={it.id} onClick={()=>openDetail(it)} style={{gridColumn:"span "+span,cursor:"pointer",position:"relative"}}><SavedDot isSaved={isSaved(it.id)}/><Img grad={it.grad} photo={it.photo} aspect={asp} r={2}/><div style={{padding:"16px 0 0"}}><div style={{fontFamily:S.sf,fontSize:mob?13:14,fontWeight:300,lineHeight:1.6}}>{it.title}</div>{isMood?it.tags&&<div style={{fontFamily:S.sn,fontSize:10,fontWeight:300,color:S.txGh,marginTop:5,letterSpacing:1}}>{it.tags}</div>:it.sub?<div style={{fontFamily:S.sn,fontSize:11,fontWeight:300,color:S.txQ,marginTop:4}}>{it.sub}</div>:it.tags?<div style={{fontFamily:S.sn,fontSize:10,fontWeight:300,color:S.txGh,marginTop:5,letterSpacing:1}}>{it.tags}</div>:null}</div></div>;})}</div>;
        })()}

        {/* ── OBJET ── */}
        {activeCat==="objet"&&(()=>{
          const seq=["4/5","4/5","1/1","3/4","4/5","1/1"];const getRatio=(o,i)=>o.aspect||seq[i%seq.length];
          return <div style={{...fd(cVis),maxWidth:1100,margin:"0 auto",padding:mob?"0 20px":"0 48px",display:"grid",gridTemplateColumns:"1fr 1fr",columnGap:mob?24:48,rowGap:mob?48:80,alignItems:"start"}}>{catItems.map((o,i)=><div key={o.id} onClick={()=>openDetail(o)} onMouseEnter={()=>sObjHov(o.id)} onMouseLeave={()=>sObjHov(null)} style={{cursor:"pointer",position:"relative"}}><div style={{overflow:"hidden",borderRadius:2}}><SavedDot isSaved={isSaved(o.id)}/><Img grad={o.grad} photo={o.photo} aspect={getRatio(o,i)} r={2}/></div><div style={{padding:"14px 0 0"}}><div style={{fontFamily:S.sf,fontSize:mob?13:14,fontWeight:300,lineHeight:1.6}}>{o.title}</div>{o.maker&&<div style={{fontFamily:S.sn,fontSize:10,fontWeight:300,color:S.txQ,marginTop:4,letterSpacing:1}}>{o.maker}</div>}{o.tags&&<div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,color:S.txGh,marginTop:4,letterSpacing:1}}>{o.tags}</div>}</div></div>)}</div>;
        })()}
      </div>
      <Foot/>
    </div>}
    {view==="home"&&detail&&<DetailView/>}

    {/* SEARCH RESULTS */}
    {view==="search"&&!detail&&<div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column"}}><Nav/><div style={{padding:mob?"0 20px":"0 40px",flex:"1 0 auto"}}><div onClick={()=>sSov(true)} style={{fontFamily:S.sf,fontSize:mob?16:18,fontWeight:300,letterSpacing:2,color:S.tx,textAlign:"center",margin:"32px 0 48px",cursor:"pointer"}}>{searchQ}</div><div style={{maxWidth:860,margin:"0 auto"}}>{searchR.length>0?searchR.map(it=><div key={it.id} onClick={()=>openDetail(it)} style={{display:"flex",gap:mob?16:28,padding:(mob?20:32)+"px 0",borderBottom:"1px solid "+S.lnL,cursor:"pointer",position:"relative"}}><SavedDot isSaved={isSaved(it.id)}/><div style={{width:mob?88:160,flexShrink:0}}><Img grad={it.grad} photo={it.photo} aspect="4/3" r={2}/></div><div style={{flex:1,paddingTop:mob?0:8}}><div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:3,color:S.ac,marginBottom:8}}>{it.root}</div><div style={{fontFamily:S.sf,fontSize:mob?14:17,fontWeight:300,lineHeight:1.6,marginBottom:6}}>{it.title}</div><div style={{fontFamily:S.sn,fontSize:11,fontWeight:300,color:S.txF,lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{it.note}</div></div></div>):<div style={{textAlign:"center",padding:"120px 0",fontFamily:S.sn,fontSize:13,fontWeight:300,color:S.txGh}}>결과가 없습니다</div>}</div></div><Foot/></div>}
    {view==="search"&&detail&&<DetailView/>}

    {/* ABOUT */}
    {view==="about"&&<div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Nav/>
      <div style={{flex:"1 0 auto",maxWidth:mob?undefined:720,margin:"0 auto",padding:mob?"36px 20px 60px":"80px 48px 100px"}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:mob?28:48}}><button onClick={goBack} style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txQ} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>back</button></div>
        <p style={{fontFamily:S.sf,fontSize:mob?24:40,fontWeight:300,lineHeight:1.6,color:S.tx,letterSpacing:mob?0:1,marginBottom:mob?48:80}}>{"\uB290\uB9AC\uAC8C \uAC77\uB294 \uC0AC\uB78C\uB4E4\uC758 \uC2DC\uC120"}</p>
        <div style={{marginBottom:mob?64:120,maxWidth:520}}>
          <p style={{fontFamily:S.bd,fontSize:mob?13:15,fontWeight:400,lineHeight:2.2,color:S.txM}}>{"\uBE44\uC6CC\uC9C4 \uACF5\uAC04, \uC815\uAC08\uD55C \uAE30\uBB3C, \uACE0\uC694\uD55C \uC228\uACB0."}</p>
          <p style={{fontFamily:S.bd,fontSize:mob?13:15,fontWeight:400,lineHeight:2.2,color:S.txM,marginTop:mob?12:16}}>{"\uC290\uB85C\uC774\uC2A4\uD2B8\uB294 \uC790\uAE30\uB9CC\uC758 \uC18D\uB3C4\uB85C \uC0B4\uC544\uAC00\uB294 \uC0AC\uB78C\uB4E4\uC758 \uC7A5\uC18C, \uBB3C\uAC74, \uC7A5\uBA74\uC744 \uAE30\uB85D\uD569\uB2C8\uB2E4. \uC9C1\uC811 \uACBD\uD5D8\uD55C \uAC83\uB4E4\uB9CC\uC744 \uB0A8\uAE30\uACE0, \uADF8 \uC2DC\uC120\uC744 \uD558\uB098\uC758 \uD750\uB984\uC73C\uB85C \uC5EE\uC2B5\uB2C8\uB2E4."}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?48:0,marginBottom:mob?56:100}}>
          <div>
            <div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,marginBottom:28}}>what we record</div>
            <div style={{fontFamily:S.sf,fontSize:mob?13:14,fontWeight:300,lineHeight:2.6}}>
              <div><span style={{color:S.tx,letterSpacing:2}}>space</span> <span style={{color:S.txGh,margin:"0 10px"}}>{"\u2014"}</span> <span style={{color:S.txQ}}>{"\uC7A5\uC18C\uC758 \uAE30\uB85D"}</span></div>
              <div><span style={{color:S.tx,letterSpacing:1}}>objet</span> <span style={{color:S.txGh,margin:"0 10px"}}>{"\u2014"}</span> <span style={{color:S.txQ}}>{"\uBB3C\uAC74\uC758 \uAE30\uB85D"}</span></div>
              <div><span style={{color:S.tx,letterSpacing:1}}>scene</span> <span style={{color:S.txGh,margin:"0 10px"}}>{"\u2014"}</span> <span style={{color:S.txQ}}>{"\uC7A5\uBA74\uC758 \uAE30\uB85D"}</span></div>
            </div>
          </div>
          <div>
            <div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,marginBottom:28}}>how we choose</div>
            <div style={{fontSize:mob?12:13,color:S.txQ,lineHeight:2.8}}>
              <div>{"\uC5EC\uAE30\uC5D0 \uAC00\uBA74 \uC228\uC774 \uB290\uB824\uC9D1\uB2C8\uB2E4."}</div>
              <div>{"\uC774\uAC83\uC744 \uACC1\uC5D0 \uB450\uBA74 \uD558\uB8E8\uAC00 \uACE0\uC694\uD574\uC9D1\uB2C8\uB2E4."}</div>
              <div>{"\uC774\uAC83\uC744 \uB9C8\uC8FC\uD558\uBA74 \uC7A0\uC2DC \uBA48\uCD94\uAC8C \uB429\uB2C8\uB2E4."}</div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?48:0,marginBottom:mob?56:100}}>
          <div>
            <div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,marginBottom:28}}>from sloist</div>
            <div style={{fontSize:mob?13:14,lineHeight:2.8}}>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.tx,letterSpacing:1,width:mob?80:100,flexShrink:0}}>magazine</span><span style={{color:S.txGh,fontSize:11,cursor:"pointer"}} onClick={()=>flash("coming soon")}>coming soon</span></div>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.tx,letterSpacing:1,width:mob?80:100,flexShrink:0}}>stay</span><span style={{color:S.txGh,fontSize:11,cursor:"pointer"}} onClick={()=>flash("coming soon")}>coming soon</span></div>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.tx,letterSpacing:1,width:mob?80:100,flexShrink:0}}>goods</span><span style={{color:S.txGh,fontSize:11,cursor:"pointer"}} onClick={()=>flash("coming soon")}>coming soon</span></div>
            </div>
          </div>
          <div>
            <div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,marginBottom:28}}>contact</div>
            <div style={{fontSize:mob?13:14,lineHeight:2.8}}>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.txQ,fontSize:11,letterSpacing:1,width:mob?80:100,flexShrink:0}}>mail</span><a href="mailto:slistkr@gmail.com" style={{color:S.txM,textDecoration:"none",borderBottom:"1px solid "+S.lnL}}>slistkr@gmail.com</a></div>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.txQ,fontSize:11,letterSpacing:1,width:mob?80:100,flexShrink:0}}>social</span><a href="https://instagram.com/sloists" target="_blank" rel="noopener noreferrer" style={{color:S.txM,textDecoration:"none",borderBottom:"1px solid "+S.lnL}}>@sloists</a></div>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.txQ,fontSize:11,letterSpacing:1,width:mob?80:100,flexShrink:0}}>letter</span><span style={{color:S.txM,cursor:"pointer",borderBottom:"1px solid "+S.lnL}} onClick={()=>flash("coming soon")}>subscribe</span></div>
            </div>
          </div>
        </div>
        <div style={{textAlign:"center",marginBottom:mob?48:72}}><span onClick={()=>goTo("archive")} style={{fontFamily:S.sf,fontSize:mob?12:14,fontWeight:300,letterSpacing:mob?3:5,color:S.txQ,cursor:"pointer",transition:"color .4s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=S.txQ}>all sloists are here</span></div>
        <div style={{borderTop:"1px solid "+S.ln,paddingTop:mob?28:40}}>
          <div style={{display:"flex",justifyContent:"center",gap:24,marginBottom:mob?16:20}}>
            {["terms","privacy"].map(l=><button key={l} onClick={()=>sLeg(l)} style={{fontFamily:S.sn,fontSize:10,fontWeight:300,letterSpacing:3,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .3s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txF} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>{l}</button>)}
          </div>
          <div style={{textAlign:"center",fontSize:10,color:S.txGh,lineHeight:2,letterSpacing:.5}}>&copy; 2026 sloist. all rights reserved.</div>
        </div>
      </div>
      {legalOpen&&<div onClick={()=>sLeg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.08)",zIndex:190,display:"flex",justifyContent:"center",alignItems:"flex-start",overflowY:"auto",padding:mob?"60px 0":"80px 0"}}><div onClick={e=>e.stopPropagation()} style={{background:S.bg,padding:mob?"36px 24px 48px":"48px 56px 64px",maxWidth:640,width:"92%",border:"1px solid "+S.ln}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:mob?28:36}}>
          <div style={{fontFamily:S.sf,fontSize:mob?16:20,letterSpacing:4,fontWeight:300}}>{legalOpen==="terms"?"Terms of Service":"Privacy Policy"}</div>
          <button onClick={()=>sLeg(null)} style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txF,background:"none",border:"none",cursor:"pointer",transition:"color .3s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=S.txF}>close</button>
        </div>
        <div style={{fontSize:13,lineHeight:2.2,color:S.txM}}>
          {legalOpen==="terms"?<>
            <p style={{fontWeight:400,marginBottom:20}}>제1조 (목적)</p>
            <p style={{marginBottom:24}}>이 약관은 슬로이스트(이하 "회사")가 제공하는 웹사이트 및 관련 서비스(이하 "서비스")의 이용과 관련하여, 회사와 이용자 간의 권리, 의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
            <p style={{fontWeight:400,marginBottom:20}}>제2조 (정의)</p>
            <p style={{marginBottom:24}}>① "서비스"란 회사가 운영하는 슬로이스트 웹사이트(sloist.com)를 통해 제공하는 모든 콘텐츠 열람, 저장, 검색, 에디터 기능 등 일체의 서비스를 의미합니다.<br/>② "이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.<br/>③ "회원"이란 회사에 개인정보를 제공하고 회원 등록을 한 자로서, 서비스를 지속적으로 이용할 수 있는 자를 말합니다.<br/>④ "에디터"란 회사의 승인을 받아 콘텐츠를 직접 작성하고 게시할 수 있는 권한을 부여받은 회원을 말합니다.</p>
            <p style={{fontWeight:400,marginBottom:20}}>제3조 (약관의 효력 및 변경)</p>
            <p style={{marginBottom:24}}>① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.<br/>② 회사는 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있으며, 변경 시 적용일자 및 변경 사유를 명시하여 최소 7일 전에 공지합니다. 다만, 이용자에게 불리한 변경의 경우 30일 전에 공지합니다.</p>
            <p style={{fontWeight:400,marginBottom:20}}>제4조 (서비스의 제공 및 변경)</p>
            <p style={{marginBottom:24}}>① 회사는 다음의 서비스를 제공합니다: 장소(space), 물건(objet), 장면(scene)에 대한 에디토리얼 콘텐츠의 열람, 콘텐츠 저장(keep) 기능, 에디터 팔로우 기능, 검색 기능, 회원 관리 기능.<br/>② 회사는 서비스의 내용을 기술적 사양의 변경 등의 사유로 변경할 수 있으며, 변경 시 변경 내용과 적용일자를 공지합니다.</p>
            <p style={{fontWeight:400,marginBottom:20}}>제5조 (콘텐츠의 저작권)</p>
            <p style={{marginBottom:24}}>① 서비스에 게시된 모든 콘텐츠(텍스트, 사진, 편집물 등)의 저작권은 회사 또는 해당 콘텐츠를 작성한 에디터에게 귀속됩니다.<br/>② 이용자는 서비스를 통해 얻은 콘텐츠를 회사의 사전 동의 없이 복제, 전송, 출판, 배포, 방송, 기타 방법에 의하여 영리 목적으로 이용하거나 제3자에게 이용하게 해서는 안 됩니다.<br/>③ 이용자가 서비스 내에서 작성한 게시물의 저작권은 해당 이용자에게 귀속되며, 회사는 서비스 운영, 홍보 등의 목적으로 이를 사용할 수 있습니다.</p>
            <p style={{fontWeight:400,marginBottom:20}}>제6조 (이용자의 의무)</p>
            <p style={{marginBottom:24}}>이용자는 다음 행위를 해서는 안 됩니다: 허위 정보의 등록, 타인의 정보 도용, 서비스에 게시된 정보의 무단 변경, 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등)의 송신 또는 게시, 회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해, 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위.</p>
            <p style={{fontWeight:400,marginBottom:20}}>제7조 (서비스 이용의 제한 및 중지)</p>
            <p>회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 중지할 수 있습니다: 서비스용 설비의 보수 등 공사로 인한 부득이한 경우, 전기통신사업법에 규정된 기간통신사업자가 전기통신 서비스를 중지한 경우, 기타 불가항력적 사유가 있는 경우.</p>
          </>:<>
            <p style={{fontWeight:400,marginBottom:20}}>1. 개인정보의 수집 및 이용 목적</p>
            <p style={{marginBottom:24}}>슬로이스트(이하 "회사")는 수집한 개인정보를 다음의 목적을 위해 활용합니다: 회원 가입 의사 확인, 회원 식별 및 본인 인증, 서비스 제공에 관한 계약 이행 및 요금 정산, 서비스 이용 기록 분석을 통한 서비스 개선, 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 전달(선택 동의 시).</p>
            <p style={{fontWeight:400,marginBottom:20}}>2. 수집하는 개인정보의 항목</p>
            <p style={{marginBottom:24}}>① 필수항목: 이메일 주소, 비밀번호, 이름(닉네임).<br/>② 서비스 이용 과정에서 자동으로 생성·수집되는 정보: 접속 IP 주소, 브라우저 종류 및 버전, 서비스 이용 기록, 접속 로그, 쿠키 정보.<br/>③ 에디터 신청 시 추가 수집항목: 프로필 사진, 자기소개, 관심 분야 태그.</p>
            <p style={{fontWeight:400,marginBottom:20}}>3. 개인정보의 보유 및 이용 기간</p>
            <p style={{marginBottom:24}}>회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관련 법령에 의하여 보존할 필요가 있는 경우 아래와 같이 일정 기간 동안 회원정보를 보관합니다:<br/>- 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래등에서의 소비자보호에 관한 법률)<br/>- 대금결제 및 재화 등의 공급에 관한 기록: 5년<br/>- 소비자의 불만 또는 분쟁처리에 관한 기록: 3년<br/>- 웹사이트 방문기록: 3개월 (통신비밀보호법)</p>
            <p style={{fontWeight:400,marginBottom:20}}>4. 개인정보의 파기 절차 및 방법</p>
            <p style={{marginBottom:24}}>회사는 개인정보 보유기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다. 전자적 파일 형태의 정보는 복구할 수 없는 방법을 사용하여 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</p>
            <p style={{fontWeight:400,marginBottom:20}}>5. 개인정보의 제3자 제공</p>
            <p style={{marginBottom:24}}>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다: 이용자가 사전에 동의한 경우, 법령의 규정에 의하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우.</p>
            <p style={{fontWeight:400,marginBottom:20}}>6. 이용자의 권리와 행사 방법</p>
            <p style={{marginBottom:24}}>① 이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 개인정보의 수집 및 이용 동의를 철회할 수 있습니다.<br/>② 개인정보의 오류에 대한 정정을 요청한 경우에는 정정을 완료하기 전까지 해당 개인정보를 이용 또는 제공하지 않습니다.</p>
            <p style={{fontWeight:400,marginBottom:20}}>7. 개인정보 보호책임자</p>
            <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의 개인정보 관련 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다. 개인정보 보호책임자에게 문의하실 수 있으며, 회사는 이용자의 문의에 대해 지체 없이 답변 및 처리해드리겠습니다.<br/>연락처: slistkr@gmail.com</p>
          </>}
        </div>
      </div></div>}
    </div>}

    {/* ARCHIVE */}
    {view==="archive"&&<div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column"}}><Nav/><div style={{padding:mob?"48px 16px":"96px 36px",flex:"1 0 auto"}}><div style={{display:"flex",justifyContent:"flex-end",marginBottom:mob?20:32}}><button onClick={goBack} style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txGh,background:"none",border:"none",cursor:"pointer"}}>back</button></div><div style={{textAlign:"center",marginBottom:mob?56:100}}><p style={{fontFamily:S.sf,fontSize:mob?14:16,lineHeight:2.6,color:S.txQ,letterSpacing:1}}>{"\uB290\uB9B0 \uC0B6\uC744 \uC0AC\uB294 \uC0AC\uB78C\uB4E4,"}<br/>{"\uADF8\uB9AC\uACE0 \uADF8\uB4E4\uC774 \uB0A8\uAE34 \uAE30\uB85D"}</p></div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":tab?"repeat(2,1fr)":"repeat(3,1fr)",gap:mob?"56px 0":tab?"64px 40px":"80px 56px"}}>{Object.entries(ED).map(([eid,ed],idx)=><div key={eid} style={{opacity:0,animation:"stg .7s ease "+idx*.1+"s both"}} onClick={()=>openRoom(eid)}>
        <div style={{cursor:"pointer",textAlign:"center"}}><div style={{width:"100%",aspectRatio:"3/4",background:ed.grad,borderRadius:2,marginBottom:24,overflow:"hidden"}}>{ed.img&&<img src={ed.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12}}><span style={{fontFamily:S.sf,fontSize:mob?16:18,letterSpacing:3,fontWeight:300}}>{ed.name}</span><span style={{fontFamily:S.sn,fontSize:10,fontWeight:300,color:S.txGh,letterSpacing:1}}>{ed.tags.join(" · ")}</span></div>
        <div style={{fontFamily:S.sn,fontSize:11,fontWeight:300,color:S.txQ,lineHeight:1.8}}>{ed.bio}</div></div>
      </div>)}</div></div><Foot/></div>}

    {/* ROOM */}
    {view==="room"&&edRoom&&ED[edRoom]&&!detail&&(()=>{const ed=ED[edRoom],ei=edItems(edRoom);return <div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column"}}><Nav/>
      <div style={{padding:mob?"0 20px":"0 40px",flex:"1 0 auto"}}>
        <div style={{display:"flex",justifyContent:"flex-end",padding:mob?"16px 0 0":"24px 0 0"}}><button onClick={goBack} style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txQ} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>back</button></div>
        <div style={{textAlign:"center",padding:"28px 0 28px"}}>
          <div style={{width:80,height:80,borderRadius:"50%",overflow:"hidden",margin:"0 auto 20px",background:ed.grad}}>{ed.img&&<img src={ed.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}</div>
          <div style={{fontFamily:S.sf,fontSize:20,fontWeight:300,letterSpacing:5,marginBottom:12}}>{"sloist "+ed.name}</div>
          <div style={{fontFamily:S.sn,fontSize:10,fontWeight:300,color:S.txGh,letterSpacing:2,marginBottom:14}}>{ed.tags.join(" · ")}</div>
          <div style={{fontFamily:S.sn,fontSize:12,fontWeight:300,color:S.txQ,marginBottom:20,lineHeight:1.8}}>{ed.bio}</div>
          <button onClick={()=>toggleFol(edRoom)} style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:following.includes(edRoom)?S.ac:S.txGh,background:"none",border:"none",borderBottom:following.includes(edRoom)?"1px solid "+S.ac:"1px solid "+S.lnL,padding:"4px 0",cursor:"pointer",transition:"all .5s"}}>{following.includes(edRoom)?"following":"follow"}</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(3,1fr)",gap:mob?12:16,gridAutoFlow:"dense",marginTop:28}}>{ei.map(it=>{const isWide=it.root==="scene"&&it.type==="\uC601\uC0C1";const cols=mob?2:3;const aspect=it.root==="scene"?(it.type==="\uC7A5\uBA74"||it.type==="\uB8E8\uD2F4"?"3/4":"1/1"):(it.root==="objet"?"4/5":"4/3");return <div key={it.id} style={{gridColumn:isWide?"span "+cols:"span 1",cursor:"pointer",position:"relative"}} onClick={()=>{scrollSave.current=window.scrollY;lt(()=>sDetail(it));}}><SavedDot isSaved={isSaved(it.id)}/><Img grad={it.grad} photo={it.photo} aspect={isWide?"16/9":aspect} r={2}/><div style={{fontSize:12,fontWeight:300,marginTop:8}}>{it.title}</div></div>;})}</div>
      </div><Foot/></div>;})()}
    {view==="room"&&detail&&<DetailView hideEditor={true}/>}

    {/* MY PAGE */}
    {view==="mypage"&&!detail&&<div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column"}}><Nav/>
      <div style={{padding:px,flex:"1 0 auto"}}>
        <div style={{textAlign:"center",padding:"32px 0 12px"}}><div style={{fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,marginBottom:12}}>{"sloist "+(auth.profile?.name||"guest")}</div><div style={{fontFamily:S.sf,fontSize:mob?20:24,fontWeight:300,letterSpacing:3}}>my archive</div></div>
        <div style={{display:"flex",justifyContent:"center",gap:mob?28:48,margin:"36px 0 48px"}}>{[...(auth.isEditor?["posts"]:[]),"saved","following","account"].map(k=><button key={k} onClick={()=>lt(()=>sMyTab(k))} style={{fontFamily:S.sn,fontSize:11,fontWeight:myTab===k?400:300,letterSpacing:mob?3:4,textTransform:"lowercase",color:myTab===k?S.tx:S.txGh,background:"none",border:"none",borderBottom:myTab===k?"1px solid "+S.tx:"1px solid transparent",padding:"10px 0",cursor:"pointer",transition:"all .5s"}}>{k}</button>)}</div>
        <div style={fd(cVis)}>
          {myTab==="posts"&&auth.isEditor&&(()=>{const allPosts=items.filter(i=>auth.isAdmin?true:i.editor===auth.editorId);const myPosts=postsCat?allPosts.filter(i=>i.root===postsCat):allPosts;const counts={space:0,scene:0,objet:0};allPosts.forEach(i=>{if(counts[i.root]!==undefined)counts[i.root]++;});return <div style={{maxWidth:860,margin:"0 auto"}}>
            <div style={{display:"flex",gap:mob?16:24,marginBottom:28,justifyContent:"center"}}>{["","space","scene","objet"].map(k=><button key={k} onClick={()=>sPostsCat(k)} style={{fontFamily:S.sn,fontSize:10,fontWeight:postsCat===k?400:300,letterSpacing:2,color:postsCat===k?S.tx:S.txGh,background:"none",border:"none",borderBottom:postsCat===k?"1px solid "+S.tx:"1px solid transparent",padding:"6px 0",cursor:"pointer",transition:"all .4s"}}>{k||"전체"}{k?` ${counts[k]||0}`:` ${allPosts.length}`}</button>)}</div>
            {myPosts.length>0?myPosts.map(it=><div key={it.id} style={{display:"flex",gap:mob?12:20,padding:"20px 0",borderBottom:"1px solid "+S.lnL,alignItems:"center"}}>
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
          </div>):<div style={{textAlign:"center",padding:"80px 0",fontSize:14,color:S.txGh}}>{postsCat?"해당 카테고리에 기록이 없습니다":"아직 작성한 기록이 없습니다"}</div>}</div>;})()}
          {myTab==="saved"&&(()=>{const all=[...sv("space"),...sv("scene"),...sv("objet")];return all.length>0?<div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?16:24,maxWidth:860,margin:"0 auto"}}>{all.map(it=><div key={it.id} onClick={()=>openDetail(it)} style={{cursor:"pointer",position:"relative"}}><Img grad={it.grad} photo={it.photo} aspect="4/3" r={2}/><div style={{marginTop:10}}><div style={{fontSize:14,fontWeight:300,marginBottom:4}}>{it.title}</div><div style={{fontFamily:S.sf,fontSize:9,letterSpacing:5,color:S.ac}}>{it.root}</div></div></div>)}</div>:<div style={{textAlign:"center",padding:"80px 0"}}><div style={{fontSize:14,color:S.txGh,lineHeight:2.2}}>{"\uC544\uC9C1 \uC800\uC7A5\uD55C \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"}<br/><span style={{fontSize:12}}>{"\uB9C8\uC74C\uC5D0 \uB2FF\uB294 \uAE30\uB85D\uC744 keep \uD574\uBCF4\uC138\uC694"}</span></div></div>;})()}
          {myTab==="following"&&<div style={{maxWidth:640,margin:"0 auto"}}>{following.length>0?following.map(eid=>{const ed=ED[eid];if(!ed)return null;return <div key={eid} style={{display:"flex",alignItems:"center",gap:24,padding:"28px 0",borderBottom:"1px solid "+S.lnL}}><div onClick={()=>openRoom(eid)} style={{width:60,height:60,borderRadius:"50%",overflow:"hidden",flexShrink:0,cursor:"pointer",background:ed.grad}}>{ed.img&&<img src={ed.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}</div><div style={{flex:1}}><div onClick={()=>openRoom(eid)} style={{fontSize:16,fontWeight:300,marginBottom:4,cursor:"pointer"}}>{ed.name}</div><div style={{fontSize:12,color:S.txQ}}>{ed.bio}</div></div></div>;}):<div style={{textAlign:"center",padding:"80px 0",fontSize:14,color:S.txGh}}>{"\uC544\uC9C1 \uD314\uB85C\uC6B0\uD55C \uC290\uB85C\uC774\uC2A4\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4"}</div>}</div>}
          {myTab==="account"&&<div style={{maxWidth:480,margin:"0 auto",padding:"20px 0"}}><div style={{borderBottom:"1px solid "+S.lnL,padding:"24px 0"}}><div style={{fontSize:10,letterSpacing:4,color:S.txGh,marginBottom:10}}>profile</div><div style={{fontSize:16,fontWeight:300,marginBottom:4}}>{auth.profile?.name||"guest"}</div><div style={{fontSize:13,color:S.txQ}}>{auth.user?.email||""}</div><div style={{fontSize:11,color:S.ac,marginTop:6,letterSpacing:2}}>{auth.role}</div></div><div style={{borderBottom:"1px solid "+S.lnL,padding:"24px 0"}}><div style={{fontSize:10,letterSpacing:4,color:S.txGh,marginBottom:10}}>preferences</div><div style={{fontSize:13,color:S.txM,lineHeight:2}}>{"\uC54C\uB9BC: \uC0C8 \uAE30\uB85D\uC774 \uC62C\uB77C\uC62C \uB54C"}<br/>{"\uC5B8\uC5B4: \uD55C\uAD6D\uC5B4"}</div></div><div style={{padding:"24px 0"}}><div style={{fontSize:10,letterSpacing:4,color:S.txGh,marginBottom:10}}>support</div><div style={{fontSize:13,color:S.txM,lineHeight:2.4}}><a href="mailto:slistkr@gmail.com" style={{color:S.txM,textDecoration:"none"}}>{"\uBB38\uC758\uD558\uAE30"}</a><br/><span style={{cursor:"pointer"}} onClick={()=>goTo("about")}>{"\uC774\uC6A9\uC57D\uAD00"}</span><br/><span style={{cursor:"pointer"}} onClick={()=>goTo("about")}>{"\uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68"}</span></div></div><div style={{textAlign:"center",padding:"40px 0"}}>{auth.user?<button onClick={()=>{auth.signOut();goHome();}} style={{fontFamily:S.sf,fontSize:11,letterSpacing:4,color:S.txGh,background:"none",border:"1px solid "+S.lnL,borderRadius:4,padding:"8px 24px",cursor:"pointer"}}>logout</button>:<button onClick={()=>goTo("login")} style={{fontFamily:S.sf,fontSize:11,letterSpacing:4,color:S.txGh,background:"none",border:"1px solid "+S.lnL,borderRadius:4,padding:"8px 24px",cursor:"pointer"}}>login</button>}</div></div>}
        </div>
      </div><Foot/>
    </div>}
    {view==="mypage"&&detail&&<DetailView/>}

    {showTop&&<button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{position:"fixed",bottom:mob?28:40,right:mob?20:40,fontFamily:S.sn,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txGh,background:S.bg,border:"none",cursor:"pointer",padding:"8px 0",transition:"opacity .5s",opacity:.6,zIndex:100}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity=".6"}>top</button>}
    {toast&&<div style={{position:"fixed",bottom:40,left:"50%",transform:"translateX(-50%)",color:S.txM,fontSize:11,fontWeight:300,letterSpacing:3,zIndex:300,fontFamily:S.sn}}>{toast}</div>}

    {/* 로그인/회원가입 — 독립 페이지 */}
    {view==="login"&&<Auth onAuth={()=>goHome()} signIn={auth.signIn} signUp={auth.signUp}/>}

    {/* 글쓰기 에디터 */}
    {showWrite&&<div style={{position:"fixed",inset:0,zIndex:500,overflowY:"auto",background:S.bg}}><WriteEditor editorId={auth.editorId} isAdmin={auth.isAdmin} editItem={editItem} onClose={()=>{setShowWrite(false);setEditItem(null);}} onSaved={()=>{setShowWrite(false);setEditItem(null);window.location.reload();}}/></div>}

    {/* 관리자 패널 */}
    {showAdmin&&<div style={{position:"fixed",inset:0,zIndex:500,overflowY:"auto",background:S.bg}}><AdminPanel onClose={()=>setShowAdmin(false)}/></div>}

    {/* 슬로이스트 프로필 만들기 */}
    {showEditorProfile&&<div style={{position:"fixed",inset:0,zIndex:500,overflowY:"auto",background:S.bg}}><EditorProfile userId={auth.user?.id} existingEditor={auth.editorId&&ED[auth.editorId]?{...ED[auth.editorId],id:auth.editorId}:null} onClose={()=>setShowEditorProfile(false)} onSaved={()=>{setShowEditorProfile(false);auth.reloadProfile();window.location.reload();}}/></div>}
  </div>;
}
