// ── Space 콘텐츠 (장소의 기록) ──
// 새 장소를 추가하려면 맨 아래에 mk() 한 줄을 추가하세요.
// id: "s숫자" 형식, 다른 id와 겹치지 않게
// cat: 카페/식당/숙소/휴식/영감 중 하나
// lat, lng: 지도 표시용 위도/경도

import { mk } from "./helpers";

const SPACE = [
  mk("s1","space",{isCover:true,title:"카페 느린",tags:"카페 · 핸드드립",location:"충남 천안",cat:"카페",photo:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#C4B8A4,#A89C88)",note:"오후 두 시, 창가 자리에 앉으면 시간이 멈춘다. 핸드드립 한 잔이 내려지는 동안 창밖으로 들어오는 볕의 각도가 천천히 바뀌고, 그 리듬에 맞춰 마음도 가라앉는다.",lat:36.815,lng:127.114,editor:"hayan"}),
  mk("s2","space",{title:"공주 한옥마을",tags:"한옥 · 1박",location:"충남 공주",cat:"숙소",photo:"https://images.unsplash.com/photo-1578469645742-46cae010e5d6?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#B8B0A0,#9C9484)",note:"새벽 다섯 시에 눈을 뜨면 안개가 마당 위로 내려앉아 있다.",lat:36.466,lng:127.119,editor:"soso"}),
  mk("s3","space",{title:"부여 궁남지",tags:"산책 · 연꽃",location:"충남 부여",cat:"영감",photo:"https://images.unsplash.com/photo-1505567745926-ba89000d255a?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#A8B8A0,#8CA080)",note:"7월이면 연꽃이 수면을 덮는다.",lat:36.275,lng:126.909,editor:"yunseul"}),
  mk("s4","space",{title:"안면도 휴양림",tags:"숲길 · 파도",location:"충남 태안",cat:"휴식",photo:"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#A0B0A8,#849888)",note:"숲길을 걷다 보면 어느 순간 파도 소리가 섞여 들린다.",lat:36.513,lng:126.327,editor:"soso"}),
  mk("s5","space",{title:"서천 갈대밭",tags:"산책 · 갈대",location:"충남 서천",cat:"영감",photo:"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#B8C0A8,#9CA888)",note:"바람이 불면 갈대가 한쪽으로 일제히 눕는다.",lat:36.064,lng:126.738,editor:"yunseul"}),
  mk("s6","space",{title:"수덕사",tags:"사찰 · 고요",location:"충남 예산",cat:"휴식",photo:"https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#B0A898,#948C7C)",note:"새벽 예불의 목탁 소리가 산을 타고 내려온다.",lat:36.658,lng:126.606,editor:"hayan"}),
  mk("s7","space",{title:"이목카페",tags:"카페 · 수평선",location:"충남 보령",cat:"카페",photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#A8B4C0,#8C98A4)",note:"테라스에서 멍하니 수평선을 바라보는 것 외에 할 일이 없다.",lat:36.333,lng:126.494,editor:"yunseul"}),
  mk("s8","space",{title:"밥은 보약",tags:"식당 · 가정식",location:"충남 천안",cat:"식당",photo:"https://images.unsplash.com/photo-1547592180-85f173990554?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#C0B4A0,#A49884)",note:"매일 아침 장을 봐서 만드는 가정식.",lat:36.81,lng:127.15,editor:"soso"}),
  mk("s9","space",{title:"외암민속마을",tags:"산책 · 돌담",location:"충남 아산",cat:"영감",photo:"https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#B8ACA0,#9C9084)",note:"평일 오전, 돌담길을 걸으면 500년 전 마을의 숨소리가 들린다.",lat:36.727,lng:127.007,editor:"seojeom"}),
  mk("s10","space",{title:"소요헌",tags:"찻집 · 마루",location:"서울 종로",cat:"카페",photo:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#C8BFB4,#AC9F94)",note:"마당을 바라보며 차를 마시는 오후.",lat:37.582,lng:126.983,editor:"hayan"}),
  mk("s11","space",{title:"두물머리",tags:"산책 · 물안개",location:"경기 양평",cat:"영감",photo:"https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#A8B8C8,#8C9CAC)",note:"이른 아침, 물안개가 피어오른다.",lat:37.531,lng:127.329,editor:"yunseul"}),
  mk("s12","space",{title:"온양온천",tags:"온천",location:"충남 아산",cat:"휴식",photo:"https://images.unsplash.com/photo-1540555700478-4be289fbec6c?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#B8B0A8,#9C948C)",note:"600년 된 온천수에 몸을 담그면 피부가 먼저 반응한다.",lat:36.782,lng:127.005,editor:"soso"}),
  mk("s13","space",{title:"느린 우체통",tags:"카페 · 편지",location:"부산 영도",cat:"카페",photo:"https://images.unsplash.com/photo-1455390582262-044cdead277a?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#B4ACA4,#988C84)",note:"1년 뒤의 나에게 편지를 쓰는 곳.",lat:35.091,lng:129.069,editor:null,isOfficial:true}),
  mk("s14","space",{title:"삼청 라운지",tags:"식당 · 코스",location:"서울 삼청동",cat:"식당",photo:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=900&fit=crop&q=80",grad:"linear-gradient(135deg,#B8B0A0,#9C9484)",note:"다섯 접시에 담긴 계절.",lat:37.583,lng:126.982,editor:"seojeom"}),

  // ── 여기 아래에 새 장소를 추가하세요 ──
  // mk("s15","space",{ title:"...", location:"...", cat:"카페", ... }),
];

export default SPACE;
