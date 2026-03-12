// ── Objet 콘텐츠 (물건의 기록) ──
// otype: 가구/조명/그릇/의류/소품 중 하나

import { mk } from "./helpers";

const OBJET = [
  mk("o1","objet",{title:"수지 캔들",maker:"소이마루",otype:"소품",photo:"https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#D0C4A8,#B4A88C)",note:"콩기름으로 만든 캔들. 불꽃의 흔들림이 방의 공기를 바꾼다.",editor:"moksu",link:"https://example.com"}),
  mk("o2","objet",{title:"옻칠 찻잔",maker:"통영옻칠공방",otype:"그릇",photo:"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#A09080,#847464)",note:"열두 번의 옻칠이 만들어낸 깊이.",editor:"moksu",link:"https://example.com"}),
  mk("o3","objet",{title:"린넨 러그",maker:"리넨하우스",otype:"소품",photo:"https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#C0B8A8,#A49C8C)",note:"맨발로 딛는 린넨의 질감.",editor:"hayan",link:"https://example.com"}),
  mk("o4","objet",{title:"느리게 쓰는 노트",maker:"슬로우스테이셔너리",otype:"소품",photo:"https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#B8B0A8,#9C948C)",note:"만년필이 종이 위를 지나가는 소리.",editor:"seojeom",link:"https://example.com"}),
  mk("o5","objet",{title:"황동 인센스 홀더",maker:"놋담",otype:"소품",photo:"https://images.unsplash.com/photo-1595856619767-ab951ca4651e?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#C8B898,#AC9C7C)",note:"연기가 피어오르는 3분의 의식.",editor:"moksu",link:"https://example.com"}),
  mk("o6","objet",{title:"나무 버터나이프",maker:"목공소 담",otype:"그릇",photo:"https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#B0A090,#948474)",note:"호두나무를 깎아 만든 버터나이프.",editor:"moksu",link:"https://example.com"}),
  mk("o7","objet",{title:"도자 화병",maker:"이도요",otype:"소품",photo:"https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#B8B8B0,#9C9C94)",note:"흙의 질감이 손에 남는 화병.",editor:"hayan",link:"https://example.com"}),
  mk("o8","objet",{title:"원목 트레이",maker:"우드앤굿",otype:"가구",photo:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#C0B0A0,#A49484)",note:"아침 식탁에 놓이면 하루가 정돈되는 기분.",editor:"soso",link:"https://example.com"}),
  mk("o9","objet",{title:"양모 쿠션",maker:"울하우스",otype:"의류",photo:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#B8B0B0,#9C9494)",note:"뉴질랜드산 양모를 손으로 짠 쿠션.",editor:"soso",link:"https://example.com"}),
  mk("o10","objet",{title:"호두나무 스툴",maker:"만물상 가구",otype:"가구",photo:"https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#A89888,#8C7C6C)",note:"30년 된 호두나무로 만든 스툴.",editor:"moksu",link:"https://example.com"}),
  mk("o11","objet",{title:"한지 스탠드",maker:"한지공방",otype:"조명",photo:"https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#C8C4B8,#ACA89C)",note:"한지를 통과한 빛은 부드럽다.",editor:"hayan",link:"https://example.com"}),
  mk("o12","objet",{title:"오크 펜던트",maker:"나무등",otype:"조명",photo:"https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#B4ACA0,#989084)",note:"참나무 원목으로 깎은 갓.",editor:"moksu",link:"https://example.com"}),
  mk("o13","objet",{title:"놋 촛대",maker:"담금질",otype:"소품",photo:"https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&h=750&fit=crop&q=80",grad:"linear-gradient(135deg,#C4B8A0,#A89C84)",note:"시간이 만드는 빛깔.",editor:null,isOfficial:true,link:"https://example.com"}),

  // ── 여기 아래에 새 물건을 추가하세요 ──
];

export default OBJET;
