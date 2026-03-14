// ── 슬로이스트 메인 앱 ──
// 데이터: Supabase CMS에서 불러옴
// 스타일: src/styles/tokens.js (색상/폰트 변경은 여기서)
// 공용 컴포넌트: src/components/shared.jsx

import { useState, useCallback, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import S from "./styles/tokens";
import { SP_C, SC_C, OB_C, CATS, TAGS, TAG_GROUPS, DAILY_QUOTES } from "./data/constants";
import { aLabel, lLabel, Img, SIcon, UIcon, catColor } from "./components/shared";
import { useSupabaseData } from "./lib/useSupabaseData";
import { useAuth } from "./lib/useAuth";
import { supabase, validatePw } from "./lib/supabase";
import Auth from "./components/Auth";
import WriteEditor from "./components/WriteEditor";
import AdminPanel from "./components/AdminPanel";
import EditorProfile from "./components/EditorProfile";
import SpaceMap from "./components/SpaceMap";
import ScrollReveal from "./components/ScrollReveal";
import StickyCover from "./components/StickyCover";
import Lenis from "lenis";

export default function Sloist(){
  const auth = useAuth();
  const { ED: _ED, PF, ALL, SPACE, SCENE, OBJET, savedIds, setSavedIds, followingIds, setFollowingIds, loading, error, reload: reloadData } = useSupabaseData(auth.user?.id);
  const ED = _ED || {};
  const [showWrite, setShowWrite] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showEditorProfile, setShowEditorProfile] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [view,sView]=useState("home");
  const [items,sItems]=useState([]);
  const [dataLoaded,setDataLoaded]=useState(false);
  const [splashDone,sSplashDone]=useState(false);
  const [splashFading,sSplashFading]=useState(false);
  const [detail,sDetail]=useState(null);
  const [edRoom,sEdRoom]=useState(null);
  const [toast,sToast]=useState(null);
  const [sov,sSov]=useState(false);
  const [sq,sSq]=useState("");
  const [showTags,sShowTags]=useState(false);
  const [searchQ,sSearchQ]=useState("");
  const [myTab,sMyTab]=useState("saved");
  const [editName,sEditName]=useState(false);
  const [nameVal,sNameVal]=useState("");
  const [editPw,sEditPw]=useState(false);
  const [curPw,sCurPw]=useState("");
  const [newPw,sNewPw]=useState("");
  const [delStep,sDelStep]=useState(0); // 0:hidden 1:pw확인 2:문구입력
  const [delPw,sDelPw]=useState("");
  const [delConfirm,sDelConfirm]=useState("");
  const [confirmDel,sConfirmDel]=useState(null); // {id, title} for in-app delete dialog
  const [postsCat,sPostsCat]=useState("");
  const [postsAuthor,sPostsAuthor]=useState("");
  const [rpw,setRpw]=useState("");
  const [rpw2,setRpw2]=useState("");
  const [rmsg,setRmsg]=useState(null);
  const [rsaving,setRsaving]=useState(false);
  const [activeCat,sActiveCat]=useState(null);
  const [spCat,sSpCat]=useState([]);
  const [scCat,sScCat]=useState([]);
  const [obCat,sObCat]=useState([]);
  const [spHov,sSpHov]=useState(null);
  const [objHov,sObjHov]=useState(null);
  const following=followingIds;
  const [legalOpen,sLeg]=useState(null);
  const [cVis,sCVis]=useState(true);
  const [mobFocus,sMobFocus]=useState(null);
  const [userLoc,sUserLoc]=useState(null);
  const [headerVis,sHeaderVis]=useState(true);
  const [showTop,sShowTop]=useState(false);
  const prevState=useRef(null);
  const pendingAction=useRef(null); // {type:"keep"|"fol", id}
  const scrollSave=useRef(0);
  const sqRef=useRef(null);
  const lastScroll=useRef(0);
  const [ww,sWw]=useState(typeof window!=="undefined"?window.innerWidth:1200);
  useEffect(()=>{const h=()=>sWw(window.innerWidth);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  const mob=ww<768,tab=ww<1024;
  const isFirstVisit=useRef(!sessionStorage.getItem("sloist_v"));
  useEffect(()=>{
    const fadeStart=isFirstVisit.current?3200:1200;
    const t1=setTimeout(()=>{sSplashFading(true);},fadeStart);
    const t2=setTimeout(()=>{sSplashDone(true);if(isFirstVisit.current)sessionStorage.setItem("sloist_v","1");},fadeStart+1200);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);

  // ── Lenis smooth scroll ──
  const lenisRef=useRef(null);
  const rafRef=useRef(null);
  function startLenis(){
    if(lenisRef.current)return;
    const lenis=new Lenis({
      duration:0.8,
      easing:t=>1-Math.pow(1-t,2.5),
      smoothWheel:true,
      touchMultiplier:1.2,
    });
    lenisRef.current=lenis;
    function raf(time){lenis.raf(time);rafRef.current=requestAnimationFrame(raf);}
    rafRef.current=requestAnimationFrame(raf);
  }
  function stopLenis(){
    if(lenisRef.current){lenisRef.current.destroy();lenisRef.current=null;}
    if(rafRef.current){cancelAnimationFrame(rafRef.current);rafRef.current=null;}
  }
  useEffect(()=>{
    if(!splashDone)return;
    startLenis();
    return()=>{stopLenis();};
  },[splashDone]);

  // WriteEditor 뒤로가기 지원
  useEffect(()=>{
    if(!showWrite)return;
    window.history.pushState({overlay:"write"},"");
    const onPop=()=>{setShowWrite(false);setEditItem(null);};
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[showWrite]);

  // Lenis 파괴/재생성: 오버레이가 열릴 때
  const overlayOpen=sov||view==="login"||showWrite||showAdmin||showEditorProfile||!!confirmDel;
  useEffect(()=>{
    if(overlayOpen){
      stopLenis();
      document.body.style.overflow="hidden";
    }else{
      document.body.style.overflow="";
      if(splashDone)startLenis();
    }
    return()=>{document.body.style.overflow="";};
  },[overlayOpen,splashDone]);

  // 스크롤 방향 감지 — 데드존으로 떨림 방지
  const scrollAcc=useRef(0);
  useEffect(()=>{
    const h=()=>{
      const y=window.scrollY;
      sShowTop(y>500);
      // 최상단에서는 항상 보이기
      if(y<=10){sHeaderVis(true);scrollAcc.current=0;lastScroll.current=y;return;}
      const delta=y-lastScroll.current;
      lastScroll.current=y;
      // 같은 방향 누적, 방향 전환 시 리셋
      if(delta>0){scrollAcc.current=scrollAcc.current>0?scrollAcc.current+delta:delta;}
      else if(delta<0){scrollAcc.current=scrollAcc.current<0?scrollAcc.current+delta:delta;}
      // 누적량이 임계치를 넘어야 전환 (떨림 방지)
      if(scrollAcc.current>12)sHeaderVis(false);
      else if(scrollAcc.current<-8)sHeaderVis(true);
    };
    window.addEventListener("scroll",h,{passive:true});return()=>window.removeEventListener("scroll",h);
  },[activeCat]);

  // 로그인 후 pending action 실행
  useEffect(()=>{
    if(!auth.user||!pendingAction.current)return;
    const a=pendingAction.current;pendingAction.current=null;
    setTimeout(()=>{if(a.type==="keep")keep(a.id);else if(a.type==="fol")toggleFol(a.id);},500);
  },[auth.user]);

  // Supabase 데이터 로드되면 items 초기화
  useEffect(()=>{
    if(ALL&&ALL.length>0){
      sItems(ALL);
      if(!dataLoaded){
        setDataLoaded(true);
        const path=window.location.pathname;
        const m=path.match(/^\/(space|scene|objet)\/(.+)$/);
        if(m){const it=ALL.find(i=>i.id===m[2]);if(it)sDetail(it);}
      }
    }
  },[ALL,dataLoaded]);

  // ── 초기 URL 라우팅 (마운트 시 1회) ──
  useEffect(()=>{
    const path=window.location.pathname;
    const params=new URLSearchParams(window.location.search);
    // PKCE 인증 확인 (/auth/confirm?token_hash=...&type=...)
    if(path==="/auth/confirm"){
      const tokenHash=params.get("token_hash");
      const type=params.get("type");
      const next=params.get("next")||"/";
      if(tokenHash&&type){
        supabase.auth.verifyOtp({token_hash:tokenHash,type}).then(({error})=>{
          if(error){console.error("auth confirm error:",error.message);}
          // recovery 타입이면 useAuth의 onAuthStateChange가 PASSWORD_RECOVERY 이벤트를 감지
          window.history.replaceState(null,"",next);
        });
      }
      return;
    }
    // 기타 딥링크 라우팅
    if(path==="/login"){sView("login");}
    else if(path==="/about"){sView("about");}
    else if(path==="/search"){sView("search");}
    else if(path==="/mypage"){sView("mypage");}
    else if(path==="/archive"){sView("archive");}
    else if(path==="/terms"){sLeg("terms");sView("legal");}
    else if(path==="/privacy"){sLeg("privacy");sView("legal");}
    else if(path==="/space"){sActiveCat("space");}
    else if(path==="/scene"){sActiveCat("scene");}
    else if(path==="/objet"){sActiveCat("objet");}
    else if(path.startsWith("/room/")){const eid=path.replace("/room/","");sEdRoom(eid);sView("room");}
  },[]);

  // 사용자 위치 — space 카테고리 진입 시에만
  useEffect(()=>{
    if(activeCat==="space"&&!userLoc&&navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>sUserLoc({lat:p.coords.latitude,lng:p.coords.longitude}),()=>{});
  },[activeCat,userLoc]);

  const flash=useCallback(m=>{sToast(m);setTimeout(()=>sToast(null),1400);},[]);
  const isSaved=useCallback(id=>savedIds.includes(id),[savedIds]);
  const keep=useCallback(async(id)=>{if(!auth.user){pendingAction.current={type:"keep",id};goTo("login");return;}const was=savedIds.includes(id);
    setSavedIds(p=>was?p.filter(x=>x!==id):[...p,id]);
    flash(was?"보관 해제":"보관됨");
    const{error}=was
      ?await supabase.from("saves").delete().eq("user_id",auth.user.id).eq("content_id",id)
      :await supabase.from("saves").insert({user_id:auth.user.id,content_id:id});
    if(error){setSavedIds(p=>was?[...p,id]:p.filter(x=>x!==id));flash("저장 실패");}
  },[savedIds,flash,auth.user,setSavedIds]);
  const toggleFol=async(eid)=>{if(!auth.user){pendingAction.current={type:"fol",id:eid};goTo("login");return;}const was=following.includes(eid);
    setFollowingIds(p=>was?p.filter(x=>x!==eid):[...p,eid]);
    flash(was?"팔로우 해제":"팔로우됨");
    const{error}=was
      ?await supabase.from("follows").delete().eq("user_id",auth.user.id).eq("editor_id",eid)
      :await supabase.from("follows").insert({user_id:auth.user.id,editor_id:eid});
    if(error){setFollowingIds(p=>was?[...p,eid]:p.filter(x=>x!==eid));flash("저장 실패");}
  };
  const setCover=useCallback(async(id)=>{
    const prev=items.map(i=>({id:i.id,isCover:i.isCover}));
    sItems(p=>p.map(i=>({...i,isCover:i.id===id})));
    flash("커버로 지정됨");
    const{error:e1}=await supabase.from("contents").update({is_cover:false}).eq("is_cover",true);
    const{error:e2}=await supabase.from("contents").update({is_cover:true}).eq("id",id);
    if(e1||e2){flash("저장 실패");sItems(p=>p.map(i=>{const o=prev.find(x=>x.id===i.id);return{...i,isCover:o?o.isCover:false};}));}
  },[flash,items]);

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
        else if(path==="/terms"){sLeg("terms");sView("legal");sDetail(null);}
        else if(path==="/privacy"){sLeg("privacy");sView("legal");sDetail(null);}
        else if(path==="/reset-password"||path==="/auth/confirm"){sView("home");sDetail(null);}
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

  const live=id=>items.find(i=>i.id===id)||null;
  const sv=k=>items.filter(i=>i.root===k&&savedIds.includes(i.id));
  const edItems=eid=>items.filter(i=>i.editor===eid);
  const dl=detail?live(detail.id):null;
  const fd=(show)=>({opacity:show?1:0,transition:"opacity .8s cubic-bezier(.2,0,.3,1)"});
  const TagLinks=({tags,size=10,color=S.txGh})=>tags?<span>{tags.split(" · ").map((t,i)=><span key={t}>{i>0&&<span style={{margin:"0 3px"}}>{"  "}</span>}<span onClick={e=>{e.stopPropagation();doSearch(t);}} style={{fontFamily:S.ui,fontSize:size,fontWeight:300,letterSpacing:1,color,cursor:"pointer",transition:"color .4s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=color}>{t}</span></span>)}</span>:null;
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
    if(activeCat===k){if(window.scrollY<10){pushUrl("/");if(k==="space"){sActiveCat(null);sSpCat([]);}else lt(()=>{sActiveCat(null);sSpCat([]);sScCat([]);sObCat([]);});return;}window.scrollTo({top:0,behavior:"smooth"});return;}
    pushUrl("/"+k);if(k==="space"){sActiveCat(k);sDetail(null);sMobFocus(null);sSpCat([]);window.scrollTo({top:0});}else lt(()=>{sActiveCat(k);sDetail(null);sMobFocus(null);sObjHov(null);sSpCat([]);sScCat([]);sObCat([]);window.scrollTo({top:0});});
  };
  const FilterBtns=()=>{
    const opts=activeCat==="space"?SP_C:activeCat==="scene"?SC_C:OB_C;
    const fv=activeCat==="space"?spCat:activeCat==="scene"?scCat:obCat;
    const fs=activeCat==="space"?sSpCat:activeCat==="scene"?sScCat:sObCat;
    const multi=activeCat==="space";
    return <>{opts.map(o=>{const a=fv.includes(o);return <button key={o} onClick={()=>{if(multi){fs(a?fv.filter(x=>x!==o):[...fv,o]);}else{window.scrollTo({top:0,behavior:"smooth"});lt(()=>{fs(a?[]:[o]);});}}} style={{fontFamily:S.ui,fontSize:mob?9:10,fontWeight:a?400:300,letterSpacing:"0.1em",color:a?S.txM:S.txGh,background:"none",border:"none",padding:mob?"4px 8px":"5px 10px",cursor:"pointer",transition:"color .5s",flexShrink:0}}>{o}</button>;})}</>;
  };

  /* ── Nav ── */
  const Nav=({showCats,backAction})=>{
    const r1h=mob?44:52;
    return <div style={{position:"sticky",top:0,zIndex:50}}>
      {/* 메인 바 — 항상 고정 */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:r1h,padding:mob?"0 24px":"0 48px",background:S.bg,position:"relative",zIndex:2}}>
        {backAction?<button onClick={backAction} style={{fontFamily:S.ui,fontSize:12,fontWeight:400,letterSpacing:"0.1em",color:S.txQ,background:"none",border:"none",cursor:"pointer",transition:"color .4s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=S.txQ}>뒤로</button>:<div onClick={goHome} style={{fontFamily:S.sf,fontSize:mob?20:24,fontWeight:300,letterSpacing:mob?6:10,color:S.tx,cursor:"pointer",transition:"opacity .5s"}} onMouseEnter={e=>e.currentTarget.style.opacity=".6"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>sloist</div>}
        <div style={{display:"flex",alignItems:"center",gap:mob?12:20}}>
          {auth.canWrite&&!auth.editorId&&(auth.role==="editor")&&<button onClick={()=>setShowEditorProfile(true)} style={{fontFamily:S.ui,fontSize:11,fontWeight:300,letterSpacing:"0.1em",color:S.ac,background:"none",border:"none",cursor:"pointer",padding:4}}>프로필</button>}
          {auth.editorId&&<button onClick={()=>setShowEditorProfile(true)} style={{fontFamily:S.ui,fontSize:11,fontWeight:300,letterSpacing:"0.1em",color:S.txGh,background:"none",border:"none",cursor:"pointer",padding:4}}>프로필</button>}
          {(auth.isMaster||auth.isStaff||(auth.role==="editor"&&auth.editorId))&&<button onClick={()=>{setEditItem(null);setShowWrite(true);}} style={{fontFamily:S.ui,fontSize:11,fontWeight:300,letterSpacing:"0.1em",color:S.ac,background:"none",border:"none",cursor:"pointer",padding:4}}>기록</button>}
          {auth.isAdmin&&<button onClick={()=>setShowAdmin(true)} style={{fontFamily:S.ui,fontSize:11,fontWeight:300,letterSpacing:"0.1em",color:S.txGh,background:"none",border:"none",cursor:"pointer",padding:4}}>관리</button>}
          <button onClick={()=>sSov(true)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:4}}><SIcon/></button>
          <button onClick={()=>{if(auth.user){if(view!=="mypage")goTo("mypage");}else goTo("login");}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:4}}><UIcon/></button>
        </div>
      </div>
      {/* 카테고리 + 필터 */}
      {showCats&&<div style={{position:"absolute",top:r1h,left:0,right:0,background:S.bg,borderTop:"1px solid "+S.lnL,transform:headerVis?"translateY(0)":"translateY(-100%)",transition:"transform .8s cubic-bezier(.22,1,.36,1)",pointerEvents:headerVis?"auto":"none",zIndex:1}}>
        {mob
          ?/* 모바일: 카테고리 한 줄, 필터 있으면 아래 한 줄 */
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:24,padding:"5px 0"}}>
              {CATS.map(k=><button key={k} onClick={()=>onCatClick(k)} style={{fontFamily:S.ui,fontSize:11,fontWeight:activeCat===k?500:300,letterSpacing:"0.15em",textTransform:"lowercase",color:activeCat===k?catColor(k):S.txGh,background:"none",border:"none",padding:"5px 0",cursor:"pointer",transition:"color .5s, font-weight .5s"}}>{k}</button>)}
            </div>
            {activeCat&&activeCat!=="space"&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,padding:"0 20px 6px"}}>
              <FilterBtns/>
            </div>}
          </>
          :/* 데스크톱: 한 줄 통합 */
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,padding:"6px 40px"}}>
            {CATS.map(k=><button key={k} onClick={()=>onCatClick(k)} style={{fontFamily:S.ui,fontSize:11,fontWeight:activeCat===k?500:300,letterSpacing:"0.15em",textTransform:"lowercase",color:activeCat===k?catColor(k):S.txGh,background:"none",border:"none",padding:"5px 14px",cursor:"pointer",transition:"color .5s, font-weight .5s"}}>{k}</button>)}
            {activeCat&&activeCat!=="space"&&<>
              <span style={{color:S.ln,fontSize:10,padding:"0 6px",userSelect:"none"}}>|</span>
              <FilterBtns/>
            </>}
          </div>
        }
      </div>}
    </div>;
  };
  const Foot=()=><div style={{textAlign:"center",padding:"64px 0 40px",flexShrink:0}}><button onClick={()=>goTo("about")} style={{fontFamily:S.sf,fontSize:10,letterSpacing:6,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txF} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>slow with sloist</button></div>;

  /* ── Detail — 기록 한 편을 읽는 방 ── */
  const DetailView=({hideEditor})=>{
    if(!dl)return null;
    const relatedItems=useMemo(()=>{
      if(!dl||!items.length)return [];
      const pool=items.filter(i=>i.id!==dl.id&&i.root===dl.root);
      const dlTags=(dl.tags||"").split(" · ").filter(Boolean);
      const scored=pool.map(i=>{
        let s=0;
        const iTags=(i.tags||"").split(" · ").filter(Boolean);
        const shared=dlTags.filter(t=>iTags.includes(t)).length;
        s+=shared*3;
        if(dl.root==="space"&&dl.cat&&i.cat===dl.cat)s+=2;
        if(dl.root==="scene"&&dl.type&&i.type===dl.type)s+=2;
        if(dl.root==="objet"){if(dl.maker&&i.maker===dl.maker)s+=3;if(dl.otype&&i.otype===dl.otype)s+=2;}
        return {item:i,score:s};
      }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
      return scored.slice(0,2).map(x=>x.item);
    },[dl,items]);
    const relLabel=dl.root==="space"?"비슷한 공기의 장소":dl.root==="scene"?"같은 결의 기록":"비슷한 물성의 기록";
    const relAsp=(it)=>{
      if(it.aspect)return it.aspect;
      if(it.root==="space")return "4/5";
      if(it.root==="scene")return (it.type==="영상"?"16/9":"3/4");
      return "4/5";
    };
    const heroAsp=dl.aspect||(dl.root==="space"?"4/5":dl.root==="scene"?(dl.type==="영상"?"16/9":"3/4"):"1/1");
    const hasAdmin=auth.isAdmin||(auth.editorId&&dl.editor===auth.editorId);
    const editorLine=!hideEditor&&dl.editor&&ED[dl.editor]?aLabel(dl,ED):dl.isOfficial?"by sloist":null;
    const creditLine=editorLine;
    const metaSub=dl.root==="space"?dl.location:dl.root==="scene"?dl.sub:dl.root==="objet"?dl.maker:"";
    const cc=catColor(dl.root);
    const deletePost=()=>sConfirmDel({id:dl.id,title:dl.title,from:"detail"});
    return <div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column",background:S.bg}}>
      <Nav/>
      <div style={{flex:"1 0 auto"}}>

        {/* ── 히어로 이미지 ── */}
        <div style={{maxWidth:mob?undefined:680,margin:"0 auto",padding:mob?"0 16px":"0 48px",paddingTop:mob?8:36}}>
          <Img grad={dl.grad} photo={dl.photo} aspect={heroAsp} r={mob?2:3}/>
        </div>

        {/* ── 기록 본문 영역 ── */}
        <div style={{maxWidth:640,margin:"0 auto",padding:mob?"0 24px":"0 32px"}}>

          {/* 카테고리 라벨 + 제목 */}
          <div style={{paddingTop:mob?28:48}}>
            <div style={{fontFamily:S.ui,fontSize:11,fontWeight:500,letterSpacing:"0.15em",color:cc,marginBottom:mob?10:14}}>{dl.root}</div>
            <h1 style={{fontFamily:S.sf,fontSize:mob?22:32,fontWeight:300,lineHeight:1.5,letterSpacing:mob?0:1,margin:0,color:S.tx}}>{dl.title}</h1>
            {metaSub&&<div style={{fontFamily:S.ui,fontSize:mob?12:13,fontWeight:300,color:S.txF,marginTop:mob?8:10}}>{metaSub}</div>}
          </div>

          {/* 크레딧 — Kinfolk 패턴 */}
          {creditLine&&<div style={{fontFamily:S.ui,fontSize:13,fontWeight:300,color:S.txF,marginTop:mob?20:28,paddingBottom:mob?20:28,borderBottom:"1px solid "+S.ln}}>
            <span onClick={()=>{if(dl.editor&&ED[dl.editor])openRoom(dl.editor);else if(dl.isOfficial)goTo("about");}} style={{cursor:"pointer",transition:"color .4s"}}>{creditLine}</span>
          </div>}

          {/* 본문 텍스트 — & Premium: 짧게, 감각의 연장 */}
          {dl.note&&<div style={{paddingTop:mob?28:40,fontFamily:S.bd,fontSize:mob?14:16,fontWeight:400,color:S.txM,lineHeight:2.0,letterSpacing:".01em"}}>{dl.note}</div>}

          {/* 태그 + 액션 */}
          <div style={{marginTop:mob?40:64,paddingTop:mob?20:24,borderTop:"1px solid "+S.ln}}>
            {dl.tags&&<div style={{marginBottom:mob?16:20}}>
              <TagLinks tags={dl.tags} size={12} color={S.txGh}/>
            </div>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:mob?20:32}}>
            <button onClick={()=>keep(dl.id)} style={{fontFamily:S.ui,fontSize:13,fontWeight:400,letterSpacing:"0.08em",color:isSaved(dl.id)?S.ac:S.txQ,background:"none",border:"none",cursor:"pointer",padding:"6px 0",transition:"color .4s"}}>{isSaved(dl.id)?"보관됨":"보관"}</button>
            <button onClick={()=>{navigator.clipboard?.writeText(window.location.href);flash("링크 복사됨");}} style={{fontFamily:S.ui,fontSize:13,fontWeight:400,letterSpacing:"0.08em",color:S.txQ,background:"none",border:"none",cursor:"pointer",padding:"6px 0",transition:"color .4s"}}>공유</button>
            {dl.link&&<a href={dl.link} target="_blank" rel="noopener noreferrer" style={{fontFamily:S.ui,fontSize:13,fontWeight:400,letterSpacing:"0.08em",color:S.txQ,textDecoration:"none",padding:"6px 0",transition:"color .4s"}}>{lLabel(dl)}</a>}
          </div>

          {/* 관리자 */}
          {hasAdmin&&<div style={{display:"flex",alignItems:"center",gap:mob?20:28,marginTop:12}}>
            <button onClick={()=>{setEditItem(dl);setShowWrite(true);}} style={{fontFamily:S.ui,fontSize:11,fontWeight:300,letterSpacing:"0.1em",color:S.txGh,background:"none",border:"none",cursor:"pointer",padding:"4px 0",transition:"color .4s"}}>수정</button>
            {auth.isAdmin&&<button onClick={()=>setCover(dl.id)} style={{fontFamily:S.ui,fontSize:11,fontWeight:300,letterSpacing:"0.1em",color:dl.isCover?S.ac:S.txGh,background:"none",border:"none",cursor:"pointer",padding:"4px 0",transition:"color .4s"}}>{dl.isCover?"홈 커버":"커버 지정"}</button>}
            <button onClick={deletePost} style={{fontFamily:S.ui,fontSize:11,fontWeight:300,letterSpacing:"0.1em",color:S.txGh,background:"none",border:"none",cursor:"pointer",padding:"4px 0",transition:"color .4s"}}>삭제</button>
          </div>}
        </div>

        {/* ── 관련 기록 — 최대 2개 ── */}
        {relatedItems.length>0&&<div style={{maxWidth:640,margin:"0 auto",padding:mob?"0 24px":"0 32px"}}>
          <div style={{marginTop:mob?64:100,paddingTop:mob?32:48,borderTop:"1px solid "+S.ln}}>
            <div style={{fontFamily:S.ui,fontSize:12,fontWeight:500,letterSpacing:"0.15em",color:S.txGh,marginBottom:mob?24:36}}>{relLabel}</div>
            <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?32:40}}>
              {relatedItems.map(ri=><div key={ri.id} onClick={()=>openDetail(ri)} style={{cursor:"pointer"}}>
                <Img grad={ri.grad} photo={ri.photo} aspect={relAsp(ri)} r={2}/>
                <div style={{marginTop:mob?10:14}}>
                  <div style={{fontFamily:S.ui,fontSize:12,fontWeight:500,letterSpacing:"0.12em",color:catColor(ri.root),marginBottom:4}}>{ri.root}</div>
                  <div style={{fontFamily:S.ui,fontSize:mob?14:15,fontWeight:300,lineHeight:1.5,color:S.tx}}>{ri.title}</div>
                </div>
              </div>)}
            </div>
          </div>
        </div>}

        <div style={{height:mob?64:100}}/>
      </div>
      <Foot/>
    </div>;
  };

  /* ═══ RENDER ═══ */
  if(loading||!dataLoaded||!splashDone){return <div style={{fontFamily:S.sf,background:S.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:splashFading?0:1,transition:"opacity 1.2s cubic-bezier(.2,0,.3,1)"}}>
    <style>{`@keyframes sloistIn{0%{opacity:0}100%{opacity:1}}@keyframes sloistSub{0%{opacity:0}100%{opacity:.6}}`}</style>
    <div style={{fontSize:mob?24:36,fontWeight:300,letterSpacing:mob?8:14,color:S.tx,animation:`sloistIn ${isFirstVisit.current?"2.4s":"1s"} cubic-bezier(.2,0,.3,1) ${isFirstVisit.current?"1s":".3s"} forwards`,opacity:0}}>sloist</div>
    {isFirstVisit.current&&<div style={{fontFamily:S.ui,fontSize:10,fontWeight:300,letterSpacing:3,color:S.txGh,marginTop:14,animation:"sloistSub 1.6s cubic-bezier(.2,0,.3,1) 2.2s forwards",opacity:0}}>멈춰야 보이는 것들</div>}
  </div>;}
  const h=homeFeed;
  return <div style={{fontFamily:S.bd,background:S.bg,color:S.tx,minHeight:"100vh",WebkitFontSmoothing:"antialiased",animation:"mainIn 1s cubic-bezier(.2,0,.3,1) forwards"}}>
    <style>{`html,body{overscroll-behavior:none}::selection{background:rgba(130,125,118,.15);color:inherit}button:focus-visible,a:focus-visible,input:focus-visible{outline:1px solid rgba(130,125,118,.3);outline-offset:2px}@keyframes mainIn{from{opacity:0}to{opacity:1}}@keyframes fi{from{opacity:0}to{opacity:1}}@keyframes tagIn{from{opacity:0}to{opacity:1}}@keyframes stg{from{opacity:0}to{opacity:1}}`}</style>

    {/* SEARCH — Cereal 검색 오버레이 */}
    {sov&&<div style={{position:"fixed",inset:0,background:"rgba(250,250,248,.96)",backdropFilter:"blur(40px)",zIndex:200,overflowY:"auto",animation:"fi .6s cubic-bezier(.2,0,.3,1)"}}>
      <div style={{display:"flex",justifyContent:"flex-end",padding:mob?"16px 24px":"20px 48px"}}>
        <button onClick={()=>sSov(false)} style={{fontFamily:S.ui,fontSize:12,fontWeight:400,letterSpacing:"0.1em",color:S.txQ,background:"none",border:"none",cursor:"pointer",transition:"color .4s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=S.txQ}>닫기</button>
      </div>
      <div style={{maxWidth:600,margin:"0 auto",padding:mob?"8vh 24px 40px":"14vh 32px 80px"}}>
        {/* 큰 검색 입력 */}
        <input ref={sqRef} placeholder="" value={sq} onChange={e=>sSq(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&sq.trim())doSearch(sq.trim());}} style={{width:"100%",background:"transparent",border:"none",borderBottom:"1px solid "+S.ln,padding:"16px 0",fontFamily:S.ui,fontSize:mob?24:32,fontWeight:300,color:S.tx,letterSpacing:"-0.01em",outline:"none"}}/>

        {/* 카테고리 필터 */}
        {!sq.trim()&&<div style={{display:"flex",gap:mob?16:24,marginTop:mob?28:40}}>
          {CATS.map(k=><button key={k} onClick={()=>{sSov(false);setTimeout(()=>{onCatClick(k);},150);}} style={{fontFamily:S.ui,fontSize:13,fontWeight:400,letterSpacing:"0.12em",color:catColor(k),background:"none",border:"none",cursor:"pointer",padding:"6px 0",transition:"opacity .4s"}} onMouseEnter={e=>e.currentTarget.style.opacity=".6"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{k}</button>)}
        </div>}

        {/* 추천 태그 */}
        {!sq.trim()&&<div style={{marginTop:mob?36:56}}>
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(3,1fr)":"repeat(5,1fr)",gap:mob?"24px 16px":"32px 20px"}}>
          {Object.entries(TAG_GROUPS).map(([group,tags],gi)=><div key={group}>
            <div style={{fontFamily:S.ui,fontSize:11,fontWeight:500,letterSpacing:"0.12em",color:S.txGh,marginBottom:mob?8:12}}>{group}</div>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>{tags.map(t=><button key={t} onClick={()=>doSearch(t)} style={{fontFamily:S.ui,fontSize:mob?13:14,fontWeight:300,color:S.txQ,background:"none",border:"none",cursor:"pointer",padding:"4px 0",textAlign:"left",transition:"color .4s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=S.txQ}>{t}</button>)}</div>
          </div>)}
          </div>
        </div>}

        {/* 실시간 검색 결과 미리보기 */}
        {sq.trim()&&(()=>{const q=sq.trim().toLowerCase();const preview=items.filter(i=>[i.title,i.tags||"",i.sub||"",i.maker||"",i.location||"",i.note||""].some(f=>f.toLowerCase().includes(q))).slice(0,6);return preview.length>0?<div style={{marginTop:mob?24:36}}>
          {preview.map(it=><div key={it.id} onClick={()=>{sSov(false);setTimeout(()=>openDetail(it),150);}} style={{display:"flex",gap:mob?14:20,padding:"16px 0",borderBottom:"1px solid "+S.lnL,cursor:"pointer",alignItems:"center"}}>
            <div style={{width:mob?56:72,flexShrink:0}}><Img grad={it.grad} photo={it.photo} aspect="1/1" r={2}/></div>
            <div>
              <div style={{fontFamily:S.ui,fontSize:12,fontWeight:500,letterSpacing:"0.12em",color:catColor(it.root),marginBottom:3}}>{it.root}</div>
              <div style={{fontFamily:S.ui,fontSize:mob?14:15,fontWeight:300,color:S.tx}}>{it.title}</div>
            </div>
          </div>)}
          <button onClick={()=>{if(sq.trim())doSearch(sq.trim());}} style={{fontFamily:S.ui,fontSize:13,fontWeight:400,letterSpacing:"0.08em",color:S.txQ,background:"none",border:"none",cursor:"pointer",padding:"20px 0",transition:"color .4s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=S.txQ}>모든 결과 보기</button>
        </div>:<div style={{marginTop:mob?32:48,fontFamily:S.ui,fontSize:14,fontWeight:300,color:S.txGh}}>아직 기록되지 않은 이야기입니다</div>;})()}
      </div>
    </div>}

    {/* ═══ HOME ═══ */}
    {view==="home"&&!detail&&<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:S.bg}}>
      <Nav showCats={true}/>
      <div style={{flex:"1 0 auto"}}>
        {activeCat&&activeCat!=="space"&&<div style={{...fd(cVis),textAlign:"center",paddingTop:mob?56:72,paddingBottom:mob?4:8}}><span style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:mob?6:8,color:S.txGh,textTransform:"lowercase"}}>{activeCat}</span></div>}

        {/* ── HOME EDITORIAL ── */}
        {!activeCat&&<div style={fd(cVis)}>

          {/* ① 커튼: 풀블리드 장면 하나 */}
          <StickyCover
            curtain={
              <div style={{height:"calc(100 * var(--dvh, 1vh))",background:S.bg,display:"flex",flexDirection:"column",justifyContent:"center",position:"relative"}}>
                {h[0]&&<div onClick={()=>openDetail(h[0])} style={{cursor:"pointer",position:"absolute",inset:0,overflow:"hidden"}}>
                  {h[0].photo&&<img src={h[0].photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",filter:"saturate(.88) contrast(1.04) sepia(.06) brightness(1.01)"}}/>}
                  {/* 하단 그라데이션 + 타이틀 */}
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:"50%",background:"linear-gradient(to top, rgba(42,41,38,.52), transparent)",pointerEvents:"none"}}/>
                  <div style={{position:"absolute",bottom:mob?48:72,left:mob?24:56,right:mob?24:56}}>
                    <div style={{fontFamily:S.sf,fontSize:mob?20:32,fontWeight:300,lineHeight:1.5,letterSpacing:mob?0:1,color:"#f9f8f7"}}>{h[0].title}</div>
                    <div style={{fontFamily:S.ui,fontSize:mob?9:10,fontWeight:300,letterSpacing:3,color:"rgba(249,248,247,.6)",marginTop:mob?8:12}}>{h[0].root}{h[0].location?" · "+h[0].location:h[0].tags?" · "+h[0].tags:""}</div>
                  </div>
                </div>}
              </div>
            }
            reveal={
              <div style={{height:"calc(100 * var(--dvh, 1vh))",background:S.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:mob?"0 24px":"0 56px"}}>
                {mob
                  ?<div style={{width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:24}}>
                    {h.slice(1,3).map((it,i)=>it&&<div key={it.id} onClick={()=>openDetail(it)} style={{cursor:"pointer",position:"relative",width:i===0?"85%":"72%",alignSelf:i===0?"flex-start":"flex-end"}}>
                      <Img saved={isSaved(it.id)} grad={it.grad} photo={it.photo} aspect="4/5" r={4}/>
                      <div style={{marginTop:10}}>
                        <div style={{fontFamily:S.sf,fontSize:13,fontWeight:300,lineHeight:1.5,marginBottom:3}}>{it.title}</div>
                        <div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txF}}>{it.root}</div>
                      </div>
                    </div>)}
                  </div>
                  :<div style={{width:"100%",maxWidth:960,display:"grid",gridTemplateColumns:"1fr 1fr",gap:56}}>
                    {h.slice(1,3).map((it,i)=>it&&<div key={it.id} onClick={()=>openDetail(it)} style={{cursor:"pointer",position:"relative",marginTop:i===1?60:0}}>
                      <Img saved={isSaved(it.id)} grad={it.grad} photo={it.photo} aspect="4/5" r={4}/>
                      <div style={{marginTop:20}}>
                        <div style={{fontFamily:S.sf,fontSize:17,fontWeight:300,lineHeight:1.5,marginBottom:4}}>{it.title}</div>
                        <div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txF}}>{it.root}</div>
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
                <Img saved={isSaved(h[3].id)} grad={h[3].grad} photo={h[3].photo} aspect="3/2" r={4}/>
                <div style={{marginTop:mob?12:20,textAlign:"center"}}>
                  <div style={{fontFamily:S.sf,fontSize:mob?15:20,fontWeight:300,lineHeight:1.5,marginBottom:6}}>{h[3].title}</div>
                  <div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txF}}>{h[3].root}{h[3].location?" · "+h[3].location:""}</div>
                </div>
              </div>
            </ScrollReveal>
          </div>}

          {/* 패널 C — 3점 */}
          {mob
            ?<div style={{padding:"40px 24px 0"}}>
              {h.slice(4,7).map((it,i)=>it&&<ScrollReveal key={it.id} delay={i*100}>
                <div onClick={()=>openDetail(it)} style={{cursor:"pointer",position:"relative",width:"88%",marginBottom:40,margin:"0 auto 40px",marginLeft:i===0?"0":i===1?"auto":i===2?"0":undefined}}>
                  <Img saved={isSaved(it.id)} grad={it.grad} photo={it.photo} aspect="4/5" r={4}/>
                  <div style={{marginTop:10}}>
                    <div style={{fontFamily:S.sf,fontSize:13,fontWeight:300,lineHeight:1.5,marginBottom:3}}>{it.title}</div>
                    <div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txF}}>{it.root}</div>
                  </div>
                </div>
              </ScrollReveal>)}
            </div>
            :<div style={{maxWidth:1140,margin:"0 auto",padding:"120px 56px 0"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:40}}>
                {h.slice(4,7).map((it,i)=>it&&<ScrollReveal key={it.id} delay={i*120}>
                  <div onClick={()=>openDetail(it)} style={{cursor:"pointer",position:"relative"}}>
                    <Img saved={isSaved(it.id)} grad={it.grad} photo={it.photo} aspect="4/5" r={4}/>
                    <div style={{marginTop:16}}>
                      <div style={{fontFamily:S.sf,fontSize:15,fontWeight:300,lineHeight:1.5,marginBottom:4}}>{it.title}</div>
                      <div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txF}}>{it.root}</div>
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
          if(f.length===0)return <div style={{textAlign:"center",padding:"120px 0",fontFamily:S.ui,fontSize:13,fontWeight:300,color:S.txGh}}>등록된 공간이 없습니다</div>;
          const SpaceFilters=()=><div style={{position:"absolute",top:mob?12:14,left:"50%",transform:"translateX(-50%)",zIndex:5,display:"flex",gap:mob?4:6,flexWrap:"nowrap",justifyContent:"center"}}>
            {SP_C.map(c=><button key={c} onClick={()=>sSpCat(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c])} style={{fontFamily:S.ui,fontSize:mob?9:10,fontWeight:spCat.includes(c)?400:300,letterSpacing:mob?0:1,color:spCat.includes(c)?S.tx:S.txQ,background:spCat.includes(c)?"rgba(249,248,247,.95)":"rgba(249,248,247,.75)",border:"none",borderRadius:20,padding:mob?"5px 10px":"6px 14px",cursor:"pointer",transition:"all .3s",backdropFilter:"blur(4px)"}}>{c}</button>)}
          </div>;
          if(mob)return <div>
            <div style={{position:"sticky",top:44,zIndex:12,width:"100%",height:"40vh",minHeight:200,maxHeight:360,overflow:"hidden",borderBottom:"1px solid "+S.ln}}>
              <SpaceMap spaces={f} hovId={mobFocus} onHover={id=>sMobFocus(id)} onClick={s=>openDetail(s)} style={{width:"100%",height:"100%"}}/>
              <SpaceFilters/>
            </div>
            <div style={{background:S.bg,position:"relative",padding:"8px 20px 40px"}}>{f.map(it=><div key={it.id} onClick={()=>openDetail(it)} style={{display:"flex",gap:16,padding:"20px 0",borderBottom:"1px solid "+S.lnL,cursor:"pointer",position:"relative",transition:"background .5s"}}><div style={{width:80,flexShrink:0}}><Img grad={it.grad} photo={it.photo} aspect="1/1" r={2} saved={isSaved(it.id)}/></div><div style={{paddingTop:2,flex:1}}><div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:3,color:S.ac,marginBottom:5}}>{it.location}</div><div style={{fontFamily:S.sf,fontSize:15,fontWeight:300,marginBottom:4}}>{it.title}</div><div style={{fontFamily:S.ui,fontSize:11,fontWeight:300,color:S.txF,lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{it.note}</div></div></div>)}</div>
          </div>;
          return <div style={{display:"flex",flexDirection:"row",minHeight:"100vh"}}>
            <div style={{width:"42vw",flexShrink:0,position:"fixed",left:0,top:52,height:"calc(100 * var(--dvh, 1vh) - 52px)",borderRight:"1px solid "+S.lnL,zIndex:2}}>
              <SpaceMap spaces={f} hovId={spHov} onHover={id=>sSpHov(id)} onClick={s=>openDetail(s)} style={{width:"100%",height:"100%"}}/>
              <SpaceFilters/>
            </div>
            <div style={{flex:1,padding:"48px 40px 100px",marginLeft:"42vw",minHeight:"calc(100 * var(--dvh, 1vh) - 60px)"}}>
              {(()=>{const cover=f.find(x=>x.isCover)||f[0];const rest=f.filter(x=>x.id!==cover.id);return <>
                <div onClick={()=>openDetail(cover)} onMouseEnter={()=>sSpHov(cover.id)} onMouseLeave={()=>sSpHov(null)} style={{cursor:"pointer",position:"relative",marginBottom:80}}><Img saved={isSaved(cover.id)} grad={cover.grad} photo={cover.photo} aspect="3/2" r={3}/><div style={{marginTop:32}}><div style={{fontFamily:S.ui,fontSize:10,fontWeight:300,letterSpacing:3,color:S.ac,marginBottom:14}}>{cover.location}{cover.tags?" · "+cover.tags:""}</div><div style={{fontFamily:S.sf,fontSize:28,fontWeight:300,lineHeight:1.45,letterSpacing:1,marginBottom:16}}>{cover.title}</div><div style={{fontFamily:S.bd,fontSize:14,fontWeight:300,color:S.txM,lineHeight:2.0,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{cover.note}</div></div></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40}}>{rest.map(it=><div key={it.id} onClick={()=>openDetail(it)} onMouseEnter={()=>sSpHov(it.id)} onMouseLeave={()=>sSpHov(null)} style={{cursor:"pointer",position:"relative",marginBottom:24}}><Img saved={isSaved(it.id)} grad={it.grad} photo={it.photo} aspect="4/3" r={2}/><div style={{marginTop:14}}><div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:3,color:S.ac,marginBottom:6}}>{it.location}</div><div style={{fontFamily:S.sf,fontSize:15,fontWeight:300,lineHeight:1.5}}>{it.title}</div></div></div>)}</div>
              </>;})()}
            </div>
          </div>;
        })()}

        {/* ── SCENE ── */}
        {activeCat==="scene"&&(()=>{
          const cols=mob?2:3;const hasF=scCat.length>0;
          return <div style={{...fd(cVis),maxWidth:1100,margin:"0 auto",padding:mob?"0 20px":"0 48px",display:"grid",gridTemplateColumns:"repeat("+cols+",1fr)",columnGap:mob?20:40,rowGap:mob?44:72,gridAutoFlow:"dense"}}>{catItems.map(it=>{const t=it.type||"";const isWide=t==="영상"||(it.aspect==="16/9");const span=isWide?cols:1;const asp=it.aspect||(isWide?"16/9":"3/4");const isMood=t==="장면"||t==="루틴";return <div key={it.id} onClick={()=>openDetail(it)} style={{gridColumn:"span "+span,cursor:"pointer",position:"relative"}}><Img saved={isSaved(it.id)} grad={it.grad} photo={it.photo} aspect={asp} r={2}/><div style={{padding:"16px 0 0"}}><div style={{fontFamily:S.sf,fontSize:mob?13:14,fontWeight:300,lineHeight:1.6}}>{it.title}</div>{isMood?it.tags&&<div style={{fontFamily:S.ui,fontSize:10,fontWeight:300,color:S.txGh,marginTop:5,letterSpacing:1}}>{it.tags}</div>:it.sub?<div style={{fontFamily:S.ui,fontSize:11,fontWeight:300,color:S.txQ,marginTop:4}}>{it.sub}</div>:null}</div></div>;})}</div>;
        })()}

        {/* ── OBJET ── */}
        {activeCat==="objet"&&(()=>{
          const seq=["4/5","4/5","1/1","3/4","4/5","1/1"];const getRatio=(o,i)=>o.aspect||seq[i%seq.length];
          return <div style={{...fd(cVis),maxWidth:1100,margin:"0 auto",padding:mob?"0 20px":"0 48px",display:"grid",gridTemplateColumns:"1fr 1fr",columnGap:mob?24:48,rowGap:mob?48:80,alignItems:"start"}}>{catItems.map((o,i)=><div key={o.id} onClick={()=>openDetail(o)} onMouseEnter={()=>sObjHov(o.id)} onMouseLeave={()=>sObjHov(null)} style={{cursor:"pointer",position:"relative"}}><div style={{overflow:"hidden",borderRadius:2}}><Img saved={isSaved(o.id)} grad={o.grad} photo={o.photo} aspect={getRatio(o,i)} r={2}/></div><div style={{padding:"14px 0 0"}}><div style={{fontFamily:S.sf,fontSize:mob?13:14,fontWeight:300,lineHeight:1.6}}>{o.title}</div>{o.maker&&<div style={{fontFamily:S.ui,fontSize:10,fontWeight:300,color:S.txQ,marginTop:4,letterSpacing:1}}>{o.maker}</div>}</div></div>)}</div>;
        })()}
      </div>
      <div style={{position:"relative",zIndex:3,background:S.bg,marginLeft:activeCat==="space"&&!mob?"42vw":0}}><Foot/></div>
    </div>}
    {view==="home"&&detail&&<DetailView/>}

    {/* SEARCH RESULTS */}
    {view==="search"&&!detail&&<div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column"}}><Nav/><div style={{padding:mob?"0 20px":"0 40px",flex:"1 0 auto"}}><div onClick={()=>sSov(true)} style={{fontFamily:S.sf,fontSize:mob?16:18,fontWeight:300,letterSpacing:2,color:S.tx,textAlign:"center",margin:"32px 0 48px",cursor:"pointer"}}>{searchQ}</div><div style={{maxWidth:860,margin:"0 auto"}}>{searchR.length>0?searchR.map(it=><div key={it.id} onClick={()=>openDetail(it)} style={{display:"flex",gap:mob?16:28,padding:(mob?20:32)+"px 0",borderBottom:"1px solid "+S.lnL,cursor:"pointer",position:"relative"}}><div style={{width:mob?88:160,flexShrink:0}}><Img grad={it.grad} photo={it.photo} aspect="4/3" r={2} saved={isSaved(it.id)}/></div><div style={{flex:1,paddingTop:mob?0:8}}><div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:3,color:S.ac,marginBottom:8}}>{it.root}</div><div style={{fontFamily:S.sf,fontSize:mob?14:17,fontWeight:300,lineHeight:1.6,marginBottom:6}}>{it.title}</div><div style={{fontFamily:S.ui,fontSize:11,fontWeight:300,color:S.txF,lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{it.note}</div>{it.tags&&<div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,color:S.txGh,marginTop:6,letterSpacing:1}}>{it.tags}</div>}</div></div>):<div style={{textAlign:"center",padding:"120px 0",fontFamily:S.ui,fontSize:13,fontWeight:300,color:S.txGh}}>결과가 없습니다</div>}</div></div><Foot/></div>}
    {view==="search"&&detail&&<DetailView/>}

    {/* ABOUT */}
    {view==="about"&&<div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Nav backAction={goBack}/>
      <div style={{flex:"1 0 auto",maxWidth:mob?undefined:720,margin:"0 auto",padding:mob?"36px 20px 60px":"80px 48px 100px"}}>
        <p style={{fontFamily:S.sf,fontSize:mob?24:40,fontWeight:300,lineHeight:1.6,color:S.tx,letterSpacing:mob?0:1,marginBottom:mob?48:80}}>{"\uB290\uB9AC\uAC8C \uAC77\uB294 \uC0AC\uB78C\uB4E4\uC758 \uC2DC\uC120"}</p>
        <div style={{marginBottom:mob?64:120,maxWidth:520}}>
          <p style={{fontFamily:S.bd,fontSize:mob?13:15,fontWeight:400,lineHeight:2.2,color:S.txM}}>{"\uBE44\uC6CC\uC9C4 \uACF5\uAC04, \uC815\uAC08\uD55C \uAE30\uBB3C, \uACE0\uC694\uD55C \uC228\uACB0."}</p>
          <p style={{fontFamily:S.bd,fontSize:mob?13:15,fontWeight:400,lineHeight:2.2,color:S.txM,marginTop:mob?12:16}}>{"\uC290\uB85C\uC774\uC2A4\uD2B8\uB294 \uC790\uAE30\uB9CC\uC758 \uC18D\uB3C4\uB85C \uC0B4\uC544\uAC00\uB294 \uC0AC\uB78C\uB4E4\uC758 \uC7A5\uC18C, \uBB3C\uAC74, \uC7A5\uBA74\uC744 \uAE30\uB85D\uD569\uB2C8\uB2E4. \uC9C1\uC811 \uACBD\uD5D8\uD55C \uAC83\uB4E4\uB9CC\uC744 \uB0A8\uAE30\uACE0, \uADF8 \uC2DC\uC120\uC744 \uD558\uB098\uC758 \uD750\uB984\uC73C\uB85C \uC5EE\uC2B5\uB2C8\uB2E4."}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?48:0,marginBottom:mob?56:100}}>
          <div>
            <div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,marginBottom:28}}>what we record</div>
            <div style={{fontFamily:S.sf,fontSize:mob?13:14,fontWeight:300,lineHeight:2.6}}>
              <div><span style={{color:S.tx,letterSpacing:2}}>space</span> <span style={{color:S.txGh,margin:"0 10px"}}>{"\u2014"}</span> <span style={{color:S.txQ}}>{"\uC7A5\uC18C\uC758 \uAE30\uB85D"}</span></div>
              <div><span style={{color:S.tx,letterSpacing:1}}>objet</span> <span style={{color:S.txGh,margin:"0 10px"}}>{"\u2014"}</span> <span style={{color:S.txQ}}>{"\uBB3C\uAC74\uC758 \uAE30\uB85D"}</span></div>
              <div><span style={{color:S.tx,letterSpacing:1}}>scene</span> <span style={{color:S.txGh,margin:"0 10px"}}>{"\u2014"}</span> <span style={{color:S.txQ}}>{"\uC7A5\uBA74\uC758 \uAE30\uB85D"}</span></div>
            </div>
          </div>
          <div>
            <div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,marginBottom:28}}>how we choose</div>
            <div style={{fontSize:mob?12:13,color:S.txQ,lineHeight:2.8}}>
              <div>{"\uC5EC\uAE30\uC5D0 \uAC00\uBA74 \uC228\uC774 \uB290\uB824\uC9D1\uB2C8\uB2E4."}</div>
              <div>{"\uC774\uAC83\uC744 \uACC1\uC5D0 \uB450\uBA74 \uD558\uB8E8\uAC00 \uACE0\uC694\uD574\uC9D1\uB2C8\uB2E4."}</div>
              <div>{"\uC774\uAC83\uC744 \uB9C8\uC8FC\uD558\uBA74 \uC7A0\uC2DC \uBA48\uCD94\uAC8C \uB429\uB2C8\uB2E4."}</div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?48:0,marginBottom:mob?56:100}}>
          <div>
            <div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,marginBottom:28}}>from sloist</div>
            <div style={{fontSize:mob?13:14,lineHeight:2.8}}>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.tx,letterSpacing:1,width:mob?80:100,flexShrink:0}}>magazine</span><span style={{color:S.lnL,fontSize:11,letterSpacing:1}}>coming soon</span></div>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.tx,letterSpacing:1,width:mob?80:100,flexShrink:0}}>stay</span><span style={{color:S.lnL,fontSize:11,letterSpacing:1}}>coming soon</span></div>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.tx,letterSpacing:1,width:mob?80:100,flexShrink:0}}>goods</span><span style={{color:S.lnL,fontSize:11,letterSpacing:1}}>coming soon</span></div>
            </div>
          </div>
          <div>
            <div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,marginBottom:28}}>contact</div>
            <div style={{fontSize:mob?13:14,lineHeight:2.8}}>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.txQ,fontSize:11,letterSpacing:1,width:mob?80:100,flexShrink:0}}>mail</span><a href="mailto:slow@sloist.com" style={{color:S.txM,textDecoration:"none",borderBottom:"1px solid "+S.lnL}}>slow@sloist.com</a></div>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.txQ,fontSize:11,letterSpacing:1,width:mob?80:100,flexShrink:0}}>social</span><a href="https://instagram.com/sloists" target="_blank" rel="noopener noreferrer" style={{color:S.txM,textDecoration:"none",borderBottom:"1px solid "+S.lnL}}>@sloists</a></div>
              <div style={{display:"flex",alignItems:"baseline"}}><span style={{color:S.txQ,fontSize:11,letterSpacing:1,width:mob?80:100,flexShrink:0}}>letter</span><span style={{color:S.lnL,letterSpacing:1}}>coming soon</span></div>
            </div>
          </div>
        </div>
        <div style={{textAlign:"center",marginBottom:mob?48:72}}><span onClick={()=>goTo("archive")} style={{fontFamily:S.sf,fontSize:mob?12:14,fontWeight:300,letterSpacing:mob?3:5,color:S.txQ,cursor:"pointer",transition:"color .4s"}} onMouseEnter={e=>e.currentTarget.style.color=S.tx} onMouseLeave={e=>e.currentTarget.style.color=S.txQ}>all sloists are here</span></div>
        <div style={{borderTop:"1px solid "+S.ln,paddingTop:mob?28:40}}>
          <div style={{display:"flex",justifyContent:"center",gap:24,marginBottom:mob?16:20}}>
            {["terms","privacy"].map(l=><button key={l} onClick={()=>{sLeg(l);prevState.current={view,activeCat,edRoom,detail,scroll:window.scrollY};pushUrl("/"+l);mt(()=>{sDetail(null);sEdRoom(null);sView("legal");});}} style={{fontFamily:S.ui,fontSize:10,fontWeight:300,letterSpacing:3,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .3s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txF} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>{l}</button>)}
          </div>
          <div style={{textAlign:"center",fontSize:10,color:S.txGh,lineHeight:2,letterSpacing:.5}}>&copy; 2026 sloist. all rights reserved.</div>
        </div>
      </div>
      {/* Legal 페이지는 별도 뷰에서 렌더 */}
    </div>}

    {/* LEGAL — Terms / Privacy 별도 페이지 */}
    {view==="legal"&&legalOpen&&<div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Nav backAction={goBack}/>
      <div style={{flex:"1 0 auto",maxWidth:640,margin:"0 auto",padding:mob?"36px 20px 60px":"64px 48px 80px"}}>
        <div style={{fontFamily:S.sf,fontSize:mob?18:24,letterSpacing:4,fontWeight:300,marginBottom:mob?32:48}}>{legalOpen==="terms"?"이용약관":"개인정보처리방침"}</div>
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
            <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의 개인정보 관련 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다. 개인정보 보호책임자에게 문의하실 수 있으며, 회사는 이용자의 문의에 대해 지체 없이 답변 및 처리해드리겠습니다.<br/>연락처: slow@sloist.com</p>
          </>}
        </div>
      </div>
      <Foot/>
    </div>}

    {/* ARCHIVE */}
    {view==="archive"&&<div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column"}}><Nav/><div style={{maxWidth:900,margin:"0 auto",width:"100%",padding:mob?"48px 20px":"96px 48px",flex:"1 0 auto"}}>
      <div style={{textAlign:"center",marginBottom:mob?64:120}}><p style={{fontFamily:S.sf,fontSize:mob?14:16,lineHeight:2.6,color:S.txQ,letterSpacing:1}}>{"느린 삶을 사는 사람들,"}<br/>{"그리고 그들이 남긴 기록"}</p></div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?"64px 0":"80px 56px"}}>{ED&&Object.entries(ED).map(([eid,ed],idx)=>{const ei=edItems(eid);const coverPhoto=(ei.find(i=>i.photo)||{}).photo;return <div key={eid} style={{opacity:0,animation:"stg .7s ease "+idx*.12+"s both",cursor:"pointer"}} onClick={()=>openRoom(eid)}>
        <div style={{width:"100%",aspectRatio:"4/5",background:ed.grad||S.lnL,borderRadius:2,position:"relative",overflow:"hidden"}}>
          {coverPhoto&&<img src={coverPhoto} alt="" style={{width:"100%",height:"100%",objectFit:"cover",filter:"saturate(.88) contrast(1.04) sepia(.06) brightness(1.01)"}}/>}
        </div>
        <div style={{marginTop:mob?16:20}}>
          <div style={{fontFamily:S.sf,fontSize:mob?15:17,fontWeight:300,letterSpacing:mob?3:4,marginBottom:8}}>{ed.name}</div>
          <div style={{fontFamily:S.ui,fontSize:10,fontWeight:300,color:S.txGh,letterSpacing:1}}>{(ed.tags||[]).join(" · ")}</div>
        </div>
      </div>;})}</div></div><Foot/></div>}

    {/* ROOM */}
    {view==="room"&&edRoom&&ED[edRoom]&&!detail&&(()=>{const ed=ED[edRoom],ei=edItems(edRoom);return <div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column"}}><Nav/>
      <div style={{flex:"1 0 auto"}}>
        <div style={{maxWidth:600,margin:"0 auto",padding:mob?"0 20px":"0 48px"}}>
          <div style={{display:"flex",justifyContent:"flex-end",padding:mob?"16px 0 0":"24px 0 0"}}><button onClick={goBack} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .5s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txQ} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>뒤로</button></div>
          <div style={{textAlign:"center",padding:mob?"28px 0 36px":"48px 0 56px"}}>
            <div style={{width:mob?72:88,height:mob?72:88,borderRadius:"50%",overflow:"hidden",margin:"0 auto 24px",background:ed.grad}}>{ed.img&&<img src={ed.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}</div>
            <div style={{fontFamily:S.sf,fontSize:mob?18:22,fontWeight:300,letterSpacing:mob?4:6,marginBottom:14}}>{"sloist "+ed.name}</div>
            <div style={{fontFamily:S.ui,fontSize:10,fontWeight:300,color:S.txGh,letterSpacing:2,marginBottom:16}}>{(ed.tags||[]).join(" · ")}</div>
            <div style={{fontFamily:S.bd,fontSize:12,fontWeight:300,color:S.txQ,lineHeight:2.0,marginBottom:24}}>{ed.bio}</div>
            <button onClick={()=>toggleFol(edRoom)} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:4,color:following.includes(edRoom)?S.ac:S.txGh,background:"none",border:"none",borderBottom:following.includes(edRoom)?"1px solid "+S.ac:"1px solid "+S.lnL,padding:"4px 0",cursor:"pointer",transition:"all .5s"}}>{following.includes(edRoom)?"팔로잉":"팔로우"}</button>
          </div>
        </div>
        <div style={{maxWidth:1100,margin:"0 auto",padding:mob?"0 20px":"0 48px",borderTop:"1px solid "+S.lnL,paddingTop:mob?32:48}}>
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(3,1fr)",columnGap:mob?20:40,rowGap:mob?44:72,gridAutoFlow:"dense"}}>{ei.map(it=>{const isWide=it.root==="scene"&&it.type==="영상";const cols=mob?2:3;const asp=it.aspect||(it.root==="scene"?(isWide?"16/9":"3/4"):(it.root==="objet"?"4/5":"4/3"));return <div key={it.id} style={{gridColumn:isWide?"span "+cols:"span 1",cursor:"pointer",position:"relative"}} onClick={()=>{scrollSave.current=window.scrollY;pushUrl("/"+it.root+"/"+it.id);lt(()=>sDetail(it));}}><Img saved={isSaved(it.id)} grad={it.grad} photo={it.photo} aspect={asp} r={2}/><div style={{marginTop:14}}><div style={{fontFamily:S.ui,fontSize:8,fontWeight:300,letterSpacing:3,color:S.txGh,marginBottom:4}}>{it.root}</div><div style={{fontFamily:S.sf,fontSize:mob?13:14,fontWeight:300,lineHeight:1.5}}>{it.title}</div></div></div>;})}</div>
        </div>
      </div><Foot/></div>;})()}
    {view==="room"&&detail&&<DetailView hideEditor={true}/>}

    {/* MY PAGE */}
    {view==="mypage"&&!detail&&(()=>{const saveName=async()=>{if(!nameVal.trim())return;await auth.updateProfile({name:nameVal.trim()});sEditName(false);flash("이름 변경됨");};return <div style={{...fd(cVis),minHeight:"100vh",display:"flex",flexDirection:"column"}}><Nav/>
      <div style={{flex:"1 0 auto"}}>
        {/* 탭 — keep / following + 에디터 보조 링크 */}
        <div style={{display:"flex",justifyContent:"center",alignItems:"baseline",gap:mob?28:44,padding:mob?"28px 0 36px":"44px 0 52px"}}>
          {[["saved","보관"],["following","팔로잉"]].map(([k,label])=><button key={k} onClick={()=>lt(()=>sMyTab(k))} style={{fontFamily:S.ui,fontSize:10,fontWeight:300,letterSpacing:mob?3:4,color:S.tx,opacity:(k==="saved"?(myTab==="saved"||myTab==="posts"):myTab===k)?1:.35,background:"none",border:"none",padding:"6px 0",cursor:"pointer",transition:"opacity .5s"}}>{label}</button>)}
          {auth.isEditor&&<button onClick={()=>lt(()=>sMyTab("posts"))} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:3,color:S.tx,opacity:myTab==="posts"?1:.35,background:"none",border:"none",cursor:"pointer",transition:"opacity .4s"}}>내 기록</button>}
        </div>
        <div style={fd(cVis)}>

          {/* posts — 기록 관리 */}
          {myTab==="posts"&&auth.canWrite&&(()=>{
            const allPosts=items.filter(i=>auth.isMaster?true:auth.isStaff?i.authorId===auth.user?.id:i.editor===auth.editorId);
            let filtered=postsCat?allPosts.filter(i=>i.root===postsCat):allPosts;
            if(auth.isMaster&&postsAuthor)filtered=filtered.filter(i=>i.authorId===postsAuthor);
            // 글쓴이 목록 (master용)
            const authors=auth.isMaster?[...new Set(allPosts.map(i=>i.authorId).filter(Boolean))]:[];
            const authorName=(aid)=>PF&&PF[aid]?PF[aid].name:"알 수 없음";
            // 수정/삭제 권한: master는 전부, 나머지는 본인 글만
            const canEdit=(it)=>auth.isMaster||(it.authorId===auth.user?.id)||(it.editor===auth.editorId);
            return <div style={{maxWidth:860,margin:"0 auto",padding:mob?"0 20px":"0 48px"}}>
            {/* 카테고리 필터 */}
            <div style={{display:"flex",gap:mob?16:24,marginBottom:mob?12:16,justifyContent:"center"}}>{["","space","scene","objet"].map(k=><button key={k} onClick={()=>sPostsCat(k)} style={{fontFamily:S.ui,fontSize:10,fontWeight:300,letterSpacing:2,color:S.tx,opacity:postsCat===k?1:.35,background:"none",border:"none",padding:"6px 0",cursor:"pointer",transition:"opacity .4s"}}>{k||"전체"}</button>)}</div>
            {/* 글쓴이 필터 (master만) */}
            {auth.isMaster&&authors.length>1&&<div style={{display:"flex",gap:mob?12:16,marginBottom:mob?28:36,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={()=>sPostsAuthor("")} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.tx,opacity:!postsAuthor?1:.35,background:"none",border:"none",padding:"4px 0",cursor:"pointer",transition:"opacity .4s"}}>전체 작성자</button>
              {authors.map(aid=><button key={aid} onClick={()=>sPostsAuthor(postsAuthor===aid?"":aid)} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.tx,opacity:postsAuthor===aid?1:.35,background:"none",border:"none",padding:"4px 0",cursor:"pointer",transition:"opacity .4s"}}>{authorName(aid)}</button>)}
            </div>}
            {filtered.length>0?filtered.map(it=>{const asp=it.aspect||(it.root==="scene"?(it.type==="영상"?"16/9":"3/4"):(it.root==="objet"?"4/5":"4/3"));return <div key={it.id} style={{display:"flex",gap:mob?14:24,padding:mob?"18px 0":"24px 0",borderBottom:"1px solid "+S.lnL,alignItems:"center"}}>
              <div style={{width:mob?88:140,flexShrink:0,cursor:"pointer"}} onClick={()=>openDetail(it)}><Img grad={it.grad} photo={it.photo} aspect={asp} r={2}/></div>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                  <span style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:4,color:S.ac}}>{it.root}</span>
                  {it.isOfficial&&<span style={{fontFamily:S.ui,fontSize:8,fontWeight:300,letterSpacing:1,color:S.txGh}}>공식</span>}
                </div>
                <div style={{fontFamily:S.sf,fontSize:mob?13:15,fontWeight:300,lineHeight:1.5,cursor:"pointer"}} onClick={()=>openDetail(it)}>{it.title}</div>
                {auth.isMaster&&it.authorId&&<div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,color:S.txGh,marginTop:4}}>{authorName(it.authorId)}</div>}
              </div>
              {canEdit(it)&&<div style={{display:"flex",gap:14,flexShrink:0}}>
                <button onClick={()=>{setEditItem(it);setShowWrite(true);}} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .4s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txQ} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>수정</button>
                <button onClick={()=>sConfirmDel({id:it.id,title:it.title,from:"list"})} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .4s"}} onMouseEnter={e=>e.currentTarget.style.color=S.txQ} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>삭제</button>
              </div>}
            </div>;}):
            <div style={{textAlign:"center",padding:"80px 0",fontFamily:S.ui,fontSize:12,fontWeight:300,color:S.txGh,letterSpacing:1}}>아직 남겨진 기록이 없습니다</div>}</div>;})()}

          {/* keep — 콘텐츠 카드 */}
          {myTab==="saved"&&(()=>{const all=[...sv("space"),...sv("scene"),...sv("objet")];const savedAsp=(it)=>it.aspect||(it.root==="scene"?(it.type==="영상"?"16/9":"3/4"):(it.root==="objet"?"4/5":"4/3"));return all.length>0?<div style={{maxWidth:860,margin:"0 auto",padding:mob?"0 20px":"0 48px",display:"grid",gridTemplateColumns:"1fr 1fr",columnGap:mob?20:40,rowGap:mob?44:64,alignItems:"start"}}>{all.map(it=><div key={it.id} onClick={()=>openDetail(it)} style={{cursor:"pointer"}}><Img grad={it.grad} photo={it.photo} aspect={savedAsp(it)} r={2}/><div style={{marginTop:mob?10:14}}><div style={{fontFamily:S.sf,fontSize:mob?13:14,fontWeight:300,lineHeight:1.5,marginBottom:4}}>{it.title}</div><div style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:4,color:S.txGh}}>{it.root}</div></div></div>)}</div>:<div style={{textAlign:"center",padding:"80px 0",fontFamily:S.ui,fontSize:12,fontWeight:300,color:S.txGh,letterSpacing:1}}>아직 보관한 기록이 없습니다</div>;})()}

          {/* following — 기록자 카드 */}
          {myTab==="following"&&<div style={{maxWidth:860,margin:"0 auto",padding:mob?"0 20px":"0 48px"}}>{following.length>0?<div style={{display:"flex",flexDirection:"column",gap:mob?36:48}}>
            {following.map(eid=>{const ed=ED[eid];if(!ed)return null;const cnt=edItems(eid).length;return <div key={eid} onClick={()=>openRoom(eid)} style={{cursor:"pointer",display:"flex",gap:mob?16:24,alignItems:"center",padding:mob?"0":"0"}}>
              <div style={{width:mob?56:72,height:mob?56:72,flexShrink:0,borderRadius:2,overflow:"hidden",background:ed.grad||S.lnL}}>{ed.img&&<img src={ed.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:S.sf,fontSize:mob?15:17,fontWeight:300,letterSpacing:mob?3:4,marginBottom:4}}>{ed.name}</div>
                <div style={{fontFamily:S.ui,fontSize:10,fontWeight:300,color:S.txQ,letterSpacing:1}}>{(ed.tags||[]).join(" · ")}</div>
              </div>
              <div style={{fontFamily:S.ui,fontSize:10,fontWeight:300,color:S.txGh,letterSpacing:1,flexShrink:0}}>{cnt}개의 기록</div>
            </div>;})}
          </div>:<div style={{textAlign:"center",padding:"80px 0",fontFamily:S.ui,fontSize:12,fontWeight:300,color:S.txGh,letterSpacing:1}}>아직 팔로우한 슬로이스트가 없습니다</div>}</div>}
        </div>

        {/* 하단 보조 — account */}
        <div style={{maxWidth:480,margin:"0 auto",padding:mob?"60px 20px 40px":"80px 48px 40px",borderTop:"1px solid "+S.lnL}}>
          {/* 프로필 정보 */}
          <div style={{padding:mob?"24px 0 20px":"28px 0 24px"}}>
            {editName?<div style={{display:"flex",gap:12,alignItems:"center"}}><input value={nameVal} onChange={e=>sNameVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveName();if(e.key==="Escape")sEditName(false);}} autoFocus style={{fontFamily:S.ui,fontSize:13,fontWeight:300,background:"transparent",border:"none",borderBottom:"1px solid "+S.ln,padding:"4px 0",color:S.tx,outline:"none",flex:1}}/><button onClick={saveName} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.txQ,background:"none",border:"none",cursor:"pointer"}}>저장</button><button onClick={()=>sEditName(false)} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.txGh,background:"none",border:"none",cursor:"pointer"}}>취소</button></div>
            :<div><span style={{fontFamily:S.ui,fontSize:13,fontWeight:300}}>{auth.profile?.name||"guest"}</span><span style={{fontFamily:S.ui,fontSize:10,fontWeight:300,color:S.txGh,marginLeft:mob?12:16}}>{auth.user?.email||""}</span></div>}
          </div>
          {/* 기능 링크 — 한 줄 */}
          {!editPw&&!editName&&<div style={{display:"flex",gap:mob?20:24,paddingBottom:delStep>0?0:20}}>
            <button onClick={()=>{sNameVal(auth.profile?.name||"");sEditName(true);}} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .3s",padding:0}} onMouseEnter={e=>e.currentTarget.style.color=S.txQ} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>이름 수정</button>
            <button onClick={()=>sEditPw(true)} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .3s",padding:0}} onMouseEnter={e=>e.currentTarget.style.color=S.txQ} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>비밀번호 변경</button>
            {auth.user&&<button onClick={()=>{auth.signOut();goHome();}} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .3s",padding:0}} onMouseEnter={e=>e.currentTarget.style.color=S.txQ} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>logout</button>}
            {auth.user&&<button onClick={()=>{sDelStep(1);sDelPw("");sDelConfirm("");}} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.txGh,background:"none",border:"none",cursor:"pointer",transition:"color .3s",padding:0}} onMouseEnter={e=>e.currentTarget.style.color=S.txQ} onMouseLeave={e=>e.currentTarget.style.color=S.txGh}>탈퇴</button>}
          </div>}
          {/* 비밀번호 변경 확장 */}
          {editPw&&<div style={{paddingBottom:20}}>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input type="password" value={curPw} onChange={e=>sCurPw(e.target.value)} placeholder="현재 비밀번호" autoFocus style={{fontFamily:S.ui,fontSize:12,fontWeight:300,background:"transparent",border:"none",borderBottom:"1px solid "+S.ln,padding:"4px 0",color:S.tx,outline:"none"}}/>
              <input type="password" value={newPw} onChange={e=>sNewPw(e.target.value)} placeholder="8자 이상 · 영문과 숫자 포함" onKeyDown={e=>{if(e.key==="Escape"){sEditPw(false);sCurPw("");sNewPw("");}}} style={{fontFamily:S.ui,fontSize:12,fontWeight:300,background:"transparent",border:"none",borderBottom:"1px solid "+S.ln,padding:"4px 0",color:S.tx,outline:"none"}}/>
              <div style={{display:"flex",gap:12,marginTop:6}}>
                <button onClick={async()=>{if(!curPw){flash("현재 비밀번호를 입력하세요");return;}const pwErr=validatePw(newPw,auth.user.email);if(pwErr){flash(pwErr);return;}const{error:e1}=await supabase.auth.signInWithPassword({email:auth.user.email,password:curPw});if(e1){flash("현재 비밀번호가 일치하지 않습니다");return;}const{error:e2}=await supabase.auth.updateUser({password:newPw});if(e2)flash("변경 실패: "+e2.message);else{flash("비밀번호가 변경되었습니다");sEditPw(false);sCurPw("");sNewPw("");}}} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.txQ,background:"none",border:"none",cursor:"pointer"}}>변경</button>
                <button onClick={()=>{sEditPw(false);sCurPw("");sNewPw("");}} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.txGh,background:"none",border:"none",cursor:"pointer"}}>취소</button>
              </div>
            </div>
          </div>}
          {/* 탈퇴 확장 */}
          {delStep>0&&<div style={{paddingTop:16,paddingBottom:20}}>
            <div style={{display:"flex",gap:16,marginBottom:16}}>{[1,2].map(n=><div key={n} style={{fontFamily:S.ui,fontSize:9,fontWeight:delStep===n?400:300,letterSpacing:2,color:delStep===n?S.txM:S.txGh,transition:"all .3s"}}>{n===1?"1. 비밀번호 확인":"2. 최종 확인"}</div>)}</div>
            {delStep===1&&<div>
              <div style={{fontFamily:S.ui,fontSize:11,fontWeight:300,color:S.txQ,lineHeight:1.8,marginBottom:14}}>되돌릴 수 없는 선택입니다.</div>
              <input type="password" value={delPw} onChange={e=>sDelPw(e.target.value)} placeholder="현재 비밀번호" autoFocus style={{fontFamily:S.ui,fontSize:12,fontWeight:300,width:"100%",background:"transparent",border:"none",borderBottom:"1px solid "+S.ln,padding:"6px 0",color:S.tx,outline:"none",marginBottom:14}}/>
              <div style={{display:"flex",gap:16}}>
                <button onClick={async()=>{if(!delPw){flash("비밀번호를 입력하세요");return;}const{error}=await supabase.auth.signInWithPassword({email:auth.user.email,password:delPw});if(error){flash("비밀번호가 일치하지 않습니다");return;}sDelStep(2);}} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.txM,background:"none",border:"none",cursor:"pointer"}}>다음</button>
                <button onClick={()=>sDelStep(0)} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.txGh,background:"none",border:"none",cursor:"pointer"}}>취소</button>
              </div>
            </div>}
            {delStep===2&&<div>
              <div style={{fontFamily:S.ui,fontSize:11,fontWeight:300,color:S.txQ,lineHeight:1.8,marginBottom:14}}>"탈퇴합니다"를 입력해주세요.</div>
              <input value={delConfirm} onChange={e=>sDelConfirm(e.target.value)} placeholder="탈퇴합니다" autoFocus style={{fontFamily:S.ui,fontSize:12,fontWeight:300,width:"100%",background:"transparent",border:"none",borderBottom:"1px solid "+S.ln,padding:"6px 0",color:S.tx,outline:"none",marginBottom:14}}/>
              <div style={{display:"flex",gap:16}}>
                <button disabled={delConfirm!=="탈퇴합니다"} onClick={async()=>{const{error}=await supabase.rpc("delete_user");if(error){flash("탈퇴 실패: "+error.message);}else{await auth.signOut();goHome();flash("탈퇴가 완료되었습니다");}}} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:delConfirm==="탈퇴합니다"?S.txM:S.txGh,background:"none",border:"none",cursor:delConfirm==="탈퇴합니다"?"pointer":"default",opacity:delConfirm==="탈퇴합니다"?1:.35,transition:"all .3s"}}>탈퇴하기</button>
                <button onClick={()=>sDelStep(0)} style={{fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:2,color:S.txGh,background:"none",border:"none",cursor:"pointer"}}>취소</button>
              </div>
            </div>}
          </div>}
        </div>
      </div><Foot/>
    </div>;})()}
    {view==="mypage"&&detail&&<DetailView/>}

    {showTop&&<button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{position:"fixed",bottom:mob?28:40,right:mob?20:40,fontFamily:S.ui,fontSize:9,fontWeight:300,letterSpacing:3,color:S.txGh,background:S.bg,border:"none",cursor:"pointer",padding:"8px 0",transition:"opacity .5s",opacity:.6,zIndex:100}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity=".6"}>top</button>}
    {toast&&<div style={{position:"fixed",bottom:40,left:"50%",transform:"translateX(-50%)",color:S.txM,fontSize:11,fontWeight:300,letterSpacing:3,zIndex:300,fontFamily:S.ui}}>{toast}</div>}

    {/* 삭제 확인 다이얼로그 */}
    {confirmDel&&<div style={{position:"fixed",inset:0,zIndex:400,background:"rgba(249,248,247,.92)",backdropFilter:"blur(24px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fi .4s cubic-bezier(.2,0,.3,1)"}}>
      <div style={{textAlign:"center",maxWidth:280,padding:"0 24px"}}>
        <div style={{fontFamily:S.ui,fontSize:11,fontWeight:300,color:S.txQ,lineHeight:1.8,marginBottom:8}}>이 기록을 삭제할까요?</div>
        <div style={{fontFamily:S.sf,fontSize:15,fontWeight:300,color:S.tx,lineHeight:1.6,marginBottom:32}}>{confirmDel.title}</div>
        <div style={{display:"flex",justifyContent:"center",gap:32}}>
          <button onClick={async()=>{const{error}=await supabase.from("contents").delete().eq("id",confirmDel.id);if(error){flash("삭제 실패");}else{flash("삭제 완료");sItems(p=>p.filter(x=>x.id!==confirmDel.id));if(confirmDel.from==="detail")closeDetail();}sConfirmDel(null);}} style={{fontFamily:S.ui,fontSize:11,fontWeight:400,letterSpacing:3,color:S.tx,background:"none",border:"none",cursor:"pointer",padding:"8px 4px"}}>삭제</button>
          <button onClick={()=>sConfirmDel(null)} style={{fontFamily:S.ui,fontSize:11,fontWeight:300,letterSpacing:3,color:S.txGh,background:"none",border:"none",cursor:"pointer",padding:"8px 4px"}}>취소</button>
        </div>
      </div>
    </div>}

    {/* 로그인/회원가입 — 독립 페이지 */}
    {view==="login"&&!auth.isRecovery&&<Auth onAuth={()=>goHome()} signIn={auth.signIn} signUp={auth.signUp}/>}

    {/* 비밀번호 재설정 화면 */}
    {auth.isRecovery&&(()=>{const doReset=async()=>{const pwErr=validatePw(rpw,auth.user?.email);if(pwErr){setRmsg(pwErr);return;}if(rpw!==rpw2){setRmsg("비밀번호가 일치하지 않습니다");return;}setRsaving(true);const{error}=await auth.updatePassword(rpw);if(error)setRmsg("변경 실패: "+error.message);else{flash("비밀번호가 변경되었습니다");goHome();}setRsaving(false);};return <div style={{position:"fixed",inset:0,zIndex:600,background:S.bg,display:"flex",flexDirection:"column",padding:"0 24px"}}>
      <div style={{display:"flex",justifyContent:"flex-end",padding:mob?"16px 4px 0":"20px 16px 0",flexShrink:0}}>
        <button onClick={()=>goHome()} style={{fontFamily:S.ui,fontSize:10,fontWeight:300,letterSpacing:2,color:S.txGh,background:"none",border:"none",cursor:"pointer",padding:"8px 0"}}>닫기</button>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:300,textAlign:"center"}}>
        <div style={{fontFamily:S.sf,fontSize:mob?28:36,fontWeight:300,letterSpacing:mob?10:16,color:S.tx,marginBottom:12}}>sloist</div>
        <div style={{fontFamily:S.ui,fontSize:11,fontWeight:300,letterSpacing:3,color:S.txF,marginBottom:mob?40:56}}>새 비밀번호 설정</div>
        <div style={{display:"flex",flexDirection:"column",gap:16,textAlign:"left"}}>
          <input type="password" placeholder="새 비밀번호" value={rpw} onChange={e=>setRpw(e.target.value)} style={{width:"100%",background:"transparent",border:"none",borderBottom:"1px solid "+S.ln,padding:"14px 0",fontFamily:S.ui,fontSize:mob?15:14,fontWeight:300,color:S.tx,outline:"none",letterSpacing:1}}/>
          <input type="password" placeholder="새 비밀번호 확인" value={rpw2} onChange={e=>setRpw2(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")doReset();}} style={{width:"100%",background:"transparent",border:"none",borderBottom:"1px solid "+S.ln,padding:"14px 0",fontFamily:S.ui,fontSize:mob?15:14,fontWeight:300,color:S.tx,outline:"none",letterSpacing:1}}/>
          <div style={{minHeight:18}}>{rmsg&&<div style={{fontFamily:S.ui,fontSize:11,fontWeight:300,color:"#c47",lineHeight:1.7,textAlign:"center"}}>{rmsg}</div>}</div>
          <button onClick={doReset} disabled={rsaving} style={{fontFamily:S.ui,fontSize:12,fontWeight:400,letterSpacing:4,color:"#fff",background:S.txM,border:"none",borderRadius:3,padding:"14px 0",cursor:"pointer",opacity:rsaving?.5:1,transition:"opacity .5s"}}>{rsaving?"...":"변경하기"}</button>
        </div>
      </div>
      </div>
    </div>;})()}

    {/* 글쓰기 에디터 */}
    {showWrite&&<div style={{position:"fixed",inset:0,zIndex:500,overflowY:"auto",background:S.bg}}><WriteEditor editorId={auth.editorId} isAdmin={auth.isAdmin} userId={auth.user?.id} isStaff={auth.isStaff} editItem={editItem} onClose={()=>{window.history.back();}} onSaved={()=>{window.history.back();reloadData();}}/></div>}

    {/* 관리자 패널 */}
    {showAdmin&&<div style={{position:"fixed",inset:0,zIndex:500,overflowY:"auto",background:S.bg}}><AdminPanel onClose={()=>setShowAdmin(false)}/></div>}

    {/* 슬로이스트 프로필 만들기 */}
    {showEditorProfile&&<div style={{position:"fixed",inset:0,zIndex:500,overflowY:"auto",background:S.bg}}><EditorProfile userId={auth.user?.id} existingEditor={auth.editorId&&ED[auth.editorId]?{...ED[auth.editorId],id:auth.editorId}:null} onClose={()=>setShowEditorProfile(false)} onSaved={()=>{setShowEditorProfile(false);auth.reloadProfile();reloadData();}}/></div>}
  </div>;
}
