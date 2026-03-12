-- ═══════════════════════════════════════
-- SLOIST 초기 데이터 시드
-- supabase-setup.sql 실행 후에 이것을 실행하세요
-- ═══════════════════════════════════════

-- 에디터 데이터
insert into editors (id, name, bio, ig, tags, img, grad) values
('hayan', '하얀', '비어있음이 주는 충만함을 기록합니다.', '@hayan_void', '{"여백","고요"}', 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=530&fit=crop&q=80', 'linear-gradient(135deg,#e8e4de,#d0ccc6)'),
('yunseul', '윤슬', '빛이 머물다 가는 자리를 수집합니다.', '@yunseul_light', '{"빛","산책"}', 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=530&fit=crop&q=80', 'linear-gradient(135deg,#c8d4d8,#aab8be)'),
('moksu', '목수', '손끝에 닿는 다정한 질감을 믿습니다.', '@moksu_hands', '{"목공","질감"}', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=530&fit=crop&q=80', 'linear-gradient(135deg,#c4b8a4,#a89c88)'),
('seojeom', '서점', '읽고 쓰는 삶을 위한 고요한 구석을 찾습니다.', '@seojeom_page', '{"활자","밤"}', 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=530&fit=crop&q=80', 'linear-gradient(135deg,#b8b0a8,#9c948c)'),
('soso', '소소', '작고 소박한 것들이 주는 거대한 위안.', '@soso_local', '{"소박","일상"}', 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=400&h=530&fit=crop&q=80', 'linear-gradient(135deg,#c0c4b8,#a4a89c)');

-- Space 데이터
insert into contents (id, root, title, tags, location, cat, photo, grad, note, lat, lng, editor, is_cover) values
('s1','space','카페 느린','카페 · 핸드드립','충남 천안','카페','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#C4B8A4,#A89C88)','오후 두 시, 창가 자리에 앉으면 시간이 멈춘다. 핸드드립 한 잔이 내려지는 동안 창밖으로 들어오는 볕의 각도가 천천히 바뀌고, 그 리듬에 맞춰 마음도 가라앉는다.',36.815,127.114,'hayan',true),
('s2','space','공주 한옥마을','한옥 · 1박','충남 공주','숙소','https://images.unsplash.com/photo-1578469645742-46cae010e5d6?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#B8B0A0,#9C9484)','새벽 다섯 시에 눈을 뜨면 안개가 마당 위로 내려앉아 있다.',36.466,127.119,'soso',false),
('s3','space','부여 궁남지','산책 · 연꽃','충남 부여','영감','https://images.unsplash.com/photo-1505567745926-ba89000d255a?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#A8B8A0,#8CA080)','7월이면 연꽃이 수면을 덮는다.',36.275,126.909,'yunseul',false),
('s4','space','안면도 휴양림','숲길 · 파도','충남 태안','휴식','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#A0B0A8,#849888)','숲길을 걷다 보면 어느 순간 파도 소리가 섞여 들린다.',36.513,126.327,'soso',false),
('s5','space','서천 갈대밭','산책 · 갈대','충남 서천','영감','https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#B8C0A8,#9CA888)','바람이 불면 갈대가 한쪽으로 일제히 눕는다.',36.064,126.738,'yunseul',false),
('s6','space','수덕사','사찰 · 고요','충남 예산','휴식','https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#B0A898,#948C7C)','새벽 예불의 목탁 소리가 산을 타고 내려온다.',36.658,126.606,'hayan',false),
('s7','space','이목카페','카페 · 수평선','충남 보령','카페','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#A8B4C0,#8C98A4)','테라스에서 멍하니 수평선을 바라보는 것 외에 할 일이 없다.',36.333,126.494,'yunseul',false),
('s8','space','밥은 보약','식당 · 가정식','충남 천안','식당','https://images.unsplash.com/photo-1547592180-85f173990554?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#C0B4A0,#A49884)','매일 아침 장을 봐서 만드는 가정식.',36.81,127.15,'soso',false),
('s9','space','외암민속마을','산책 · 돌담','충남 아산','영감','https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#B8ACA0,#9C9084)','평일 오전, 돌담길을 걸으면 500년 전 마을의 숨소리가 들린다.',36.727,127.007,'seojeom',false),
('s10','space','소요헌','찻집 · 마루','서울 종로','카페','https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#C8BFB4,#AC9F94)','마당을 바라보며 차를 마시는 오후.',37.582,126.983,'hayan',false),
('s11','space','두물머리','산책 · 물안개','경기 양평','영감','https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#A8B8C8,#8C9CAC)','이른 아침, 물안개가 피어오른다.',37.531,127.329,'yunseul',false),
('s12','space','온양온천','온천','충남 아산','휴식','https://images.unsplash.com/photo-1540555700478-4be289fbec6c?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#B8B0A8,#9C948C)','600년 된 온천수에 몸을 담그면 피부가 먼저 반응한다.',36.782,127.005,'soso',false),
('s13','space','느린 우체통','카페 · 편지','부산 영도','카페','https://images.unsplash.com/photo-1455390582262-044cdead277a?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#B4ACA4,#988C84)','1년 뒤의 나에게 편지를 쓰는 곳.',35.091,129.069,null,false),
('s14','space','삼청 라운지','식당 · 코스','서울 삼청동','식당','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=900&fit=crop&q=80','linear-gradient(135deg,#B8B0A0,#9C9484)','다섯 접시에 담긴 계절.',37.583,126.982,'seojeom',false);

-- s13 is_official 설정
update contents set is_official = true where id = 's13';

-- Scene 데이터
insert into contents (id, root, title, sub, type, photo, grad, note, editor, link) values
('m1','scene','걷기의 인문학','레베카 솔닛','서적','https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop&q=80','linear-gradient(135deg,#C8C0B0,#ACA498)','걷기를 멈출 수 없는 밤에 이 책을 펼친다.','seojeom','https://books.google.com'),
('m2','scene','나는 나를 파괴할 권리가 있다','김영하','서적','https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop&q=80','linear-gradient(135deg,#B8A8A0,#9C8C84)','한 챕터면 충분한 밤이 있다.','seojeom','https://books.google.com'),
('m3','scene','보이지 않는 도시들','이탈로 칼비노','서적','https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&q=80','linear-gradient(135deg,#A8B0B8,#8C949C)','한 도시씩 천천히 읽는다.','seojeom','https://books.google.com'),
('m4','scene','리틀 포레스트','모리 준이치','영상','https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=900&h=500&fit=crop&q=80','linear-gradient(135deg,#A8B8A8,#8C9C8C)','계절의 식탁. 직접 기르고 만드는 음식의 질감이 스크린을 통해서도 전해진다.','soso','https://youtube.com'),
('m5','scene','패터슨','짐 자무쉬','영상','https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&h=500&fit=crop&q=80','linear-gradient(135deg,#B0A8B8,#948C9C)','반복이 시가 될 때, 일상이 예술이 된다.','yunseul','https://youtube.com'),
('m6','scene','콜럼버스','코고나다','영상','https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&h=500&fit=crop&q=80','linear-gradient(135deg,#A8A8B0,#8C8C94)','건물이 말을 거는 영화.','hayan','https://youtube.com'),
('m7','scene','Nils Frahm — Says','Nils Frahm','음악','https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop&q=80','linear-gradient(135deg,#B4AAC0,#988EA4)','불을 끄고 들으면 피아노 건반 위의 먼지까지 보이는 것 같다.','yunseul','https://open.spotify.com'),
('m8','scene','re:member','Ólafur Arnalds','음악','https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=600&fit=crop&q=80','linear-gradient(135deg,#A0A8B8,#848C9C)','비 오는 오후, 이 앨범 하나면 충분하다.','yunseul','https://open.spotify.com'),
('m9','scene','async','류이치 사카모토','음악','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#B0B0A8,#94948C)','헤드폰 필수.','moksu','https://open.spotify.com'),
('m10','scene','새벽 창가의 수증기',null,'장면','https://images.unsplash.com/photo-1510711789248-087061cda288?w=600&h=800&fit=crop&q=80','linear-gradient(135deg,#C0BCB4,#A4A098)','커피 위로 피어오르는 김. 그것만으로 충분한 아침.','hayan',null),
('m11','scene','잠들기 전 세 줄 일기',null,'루틴','https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=800&fit=crop&q=80','linear-gradient(135deg,#B8B4AC,#9C9890)','오늘 감사한 것 하나. 내일 하고 싶은 것 하나. 지금 느끼는 것 하나.','soso',null),
('m12','scene','빨래가 마르는 오후',null,'장면','https://images.unsplash.com/photo-1499914485622-a88fac536970?w=600&h=800&fit=crop&q=80','linear-gradient(135deg,#C4C0B8,#A8A49C)','바람에 흔들리는 하얀 천의 리듬.','yunseul',null),
('m13','scene','숲의 시간','피터 볼레벤','서적','https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=600&fit=crop&q=80','linear-gradient(135deg,#A8B4A8,#8C988C)','나무는 서두르지 않는다.',null,'https://books.google.com');

update contents set is_official = true where id = 'm13';

-- Objet 데이터
insert into contents (id, root, title, maker, otype, photo, grad, note, editor, link) values
('o1','objet','수지 캔들','소이마루','소품','https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#D0C4A8,#B4A88C)','콩기름으로 만든 캔들. 불꽃의 흔들림이 방의 공기를 바꾼다.','moksu','https://example.com'),
('o2','objet','옻칠 찻잔','통영옻칠공방','그릇','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#A09080,#847464)','열두 번의 옻칠이 만들어낸 깊이.','moksu','https://example.com'),
('o3','objet','린넨 러그','리넨하우스','소품','https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#C0B8A8,#A49C8C)','맨발로 딛는 린넨의 질감.','hayan','https://example.com'),
('o4','objet','느리게 쓰는 노트','슬로우스테이셔너리','소품','https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#B8B0A8,#9C948C)','만년필이 종이 위를 지나가는 소리.','seojeom','https://example.com'),
('o5','objet','황동 인센스 홀더','놋담','소품','https://images.unsplash.com/photo-1595856619767-ab951ca4651e?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#C8B898,#AC9C7C)','연기가 피어오르는 3분의 의식.','moksu','https://example.com'),
('o6','objet','나무 버터나이프','목공소 담','그릇','https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#B0A090,#948474)','호두나무를 깎아 만든 버터나이프.','moksu','https://example.com'),
('o7','objet','도자 화병','이도요','소품','https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#B8B8B0,#9C9C94)','흙의 질감이 손에 남는 화병.','hayan','https://example.com'),
('o8','objet','원목 트레이','우드앤굿','가구','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#C0B0A0,#A49484)','아침 식탁에 놓이면 하루가 정돈되는 기분.','soso','https://example.com'),
('o9','objet','양모 쿠션','울하우스','의류','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#B8B0B0,#9C9494)','뉴질랜드산 양모를 손으로 짠 쿠션.','soso','https://example.com'),
('o10','objet','호두나무 스툴','만물상 가구','가구','https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#A89888,#8C7C6C)','30년 된 호두나무로 만든 스툴.','moksu','https://example.com'),
('o11','objet','한지 스탠드','한지공방','조명','https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#C8C4B8,#ACA89C)','한지를 통과한 빛은 부드럽다.','hayan','https://example.com'),
('o12','objet','오크 펜던트','나무등','조명','https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#B4ACA0,#989084)','참나무 원목으로 깎은 갓.','moksu','https://example.com'),
('o13','objet','놋 촛대','담금질','소품','https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&h=750&fit=crop&q=80','linear-gradient(135deg,#C4B8A0,#A89C84)','시간이 만드는 빛깔.',null,'https://example.com');

update contents set is_official = true where id = 'o13';
