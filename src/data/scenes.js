// ── Scene 콘텐츠 (장면의 기록) ──
// type: 서적/음악/영상/장면/루틴 중 하나

import { mk } from "./helpers";

const SCENE = [
  mk("m1","scene",{title:"걷기의 인문학",sub:"레베카 솔닛",type:"서적",photo:"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop&q=80",grad:"linear-gradient(135deg,#C8C0B0,#ACA498)",note:"걷기를 멈출 수 없는 밤에 이 책을 펼친다.",editor:"seojeom",link:"https://books.google.com"}),
  mk("m2","scene",{title:"나는 나를 파괴할 권리가 있다",sub:"김영하",type:"서적",photo:"https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop&q=80",grad:"linear-gradient(135deg,#B8A8A0,#9C8C84)",note:"한 챕터면 충분한 밤이 있다.",editor:"seojeom",link:"https://books.google.com"}),
  mk("m3","scene",{title:"보이지 않는 도시들",sub:"이탈로 칼비노",type:"서적",photo:"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&q=80",grad:"linear-gradient(135deg,#A8B0B8,#8C949C)",note:"한 도시씩 천천히 읽는다.",editor:"seojeom",link:"https://books.google.com"}),
  mk("m4","scene",{title:"리틀 포레스트",sub:"모리 준이치",type:"영상",photo:"https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=900&h=500&fit=crop&q=80",grad:"linear-gradient(135deg,#A8B8A8,#8C9C8C)",note:"계절의 식탁. 직접 기르고 만드는 음식의 질감이 스크린을 통해서도 전해진다.",editor:"soso",link:"https://youtube.com"}),
  mk("m5","scene",{title:"패터슨",sub:"짐 자무쉬",type:"영상",photo:"https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&h=500&fit=crop&q=80",grad:"linear-gradient(135deg,#B0A8B8,#948C9C)",note:"반복이 시가 될 때, 일상이 예술이 된다.",editor:"yunseul",link:"https://youtube.com"}),
  mk("m6","scene",{title:"콜럼버스",sub:"코고나다",type:"영상",photo:"https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&h=500&fit=crop&q=80",grad:"linear-gradient(135deg,#A8A8B0,#8C8C94)",note:"건물이 말을 거는 영화.",editor:"hayan",link:"https://youtube.com"}),
  mk("m7","scene",{title:"Nils Frahm — Says",sub:"Nils Frahm",type:"음악",photo:"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop&q=80",grad:"linear-gradient(135deg,#B4AAC0,#988EA4)",note:"불을 끄고 들으면 피아노 건반 위의 먼지까지 보이는 것 같다.",editor:"yunseul",link:"https://open.spotify.com"}),
  mk("m8","scene",{title:"re:member",sub:"Ólafur Arnalds",type:"음악",photo:"https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=600&fit=crop&q=80",grad:"linear-gradient(135deg,#A0A8B8,#848C9C)",note:"비 오는 오후, 이 앨범 하나면 충분하다.",editor:"yunseul",link:"https://open.spotify.com"}),
  mk("m9","scene",{title:"async",sub:"류이치 사카모토",type:"음악",photo:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#B0B0A8,#94948C)",note:"헤드폰 필수.",editor:"moksu",link:"https://open.spotify.com"}),
  mk("m10","scene",{title:"새벽 창가의 수증기",sub:"",type:"장면",photo:"https://images.unsplash.com/photo-1510711789248-087061cda288?w=600&h=800&fit=crop&q=80",grad:"linear-gradient(135deg,#C0BCB4,#A4A098)",note:"커피 위로 피어오르는 김. 그것만으로 충분한 아침.",editor:"hayan"}),
  mk("m11","scene",{title:"잠들기 전 세 줄 일기",sub:"",type:"루틴",photo:"https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=800&fit=crop&q=80",grad:"linear-gradient(135deg,#B8B4AC,#9C9890)",note:"오늘 감사한 것 하나. 내일 하고 싶은 것 하나. 지금 느끼는 것 하나.",editor:"soso"}),
  mk("m12","scene",{title:"빨래가 마르는 오후",sub:"",type:"장면",photo:"https://images.unsplash.com/photo-1499914485622-a88fac536970?w=600&h=800&fit=crop&q=80",grad:"linear-gradient(135deg,#C4C0B8,#A8A49C)",note:"바람에 흔들리는 하얀 천의 리듬.",editor:"yunseul"}),
  mk("m13","scene",{title:"숲의 시간",sub:"피터 볼레벤",type:"서적",photo:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=600&fit=crop&q=80",grad:"linear-gradient(135deg,#A8B4A8,#8C988C)",note:"나무는 서두르지 않는다.",editor:null,isOfficial:true,link:"https://books.google.com"}),

  // ── 여기 아래에 새 장면을 추가하세요 ──
];

export default SCENE;
