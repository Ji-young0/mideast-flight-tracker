import { useState, useCallback } from "react";

// ══ BRIGHT THEME ══════════════════════════════════════════════════════════════
const C = {
  pageBg:    "#EEF2FF",
  card:      "#FFFFFF",
  cardSub:   "#F8F9FE",
  border:    "#E2E7F8",
  borderMed: "#C7D0EF",
  text:      "#0D1B3E",
  textSub:   "#3B4A72",
  textMuted: "#7B8EC8",
  accent:    "#2563EB",
  accentLight:"#DBEAFE",
  header:    "#1E3A8A",
  ticker:    "#1E40AF",
  tickerText:"#BFDBFE",
  red:       "#DC2626", redBg:"#FEF2F2", redBd:"#FECACA",
  orange:    "#EA580C", orgBg:"#FFF7ED", orgBd:"#FDBA74",
  yellow:    "#CA8A04", yelBg:"#FEFCE8", yelBd:"#FDE047",
  green:     "#16A34A", grnBg:"#F0FDF4", grnBd:"#86EFAC",
  purple:    "#9333EA", purBg:"#FAF5FF", purBd:"#D8B4FE",
};

const ST = {
  "운항중": { bg:C.grnBg, bd:C.grnBd, tx:C.green,  dot:C.green  },
  "정상":   { bg:C.grnBg, bd:C.grnBd, tx:C.green,  dot:C.green  },
  "주의":   { bg:C.yelBg, bd:C.yelBd, tx:C.yellow, dot:C.yellow },
  "지연":   { bg:C.yelBg, bd:C.yelBd, tx:C.yellow, dot:C.yellow },
  "제한":   { bg:C.orgBg, bd:C.orgBd, tx:C.orange, dot:C.orange },
  "우회":   { bg:C.purBg, bd:C.purBd, tx:C.purple, dot:C.purple },
  "중단":   { bg:C.redBg, bd:C.redBd, tx:C.red,    dot:C.red    },
  "취소":   { bg:C.redBg, bd:C.redBd, tx:C.red,    dot:C.red    },
  "폐쇄":   { bg:C.purBg, bd:C.purBd, tx:C.purple, dot:C.purple },
  "정상운항":{ bg:C.grnBg,bd:C.grnBd, tx:C.green,  dot:C.green  },
  "정보없음":{ bg:"#F1F5F9",bd:"#CBD5E1",tx:"#64748B",dot:"#94A3B8"},
};

// ══ DATA ══════════════════════════════════════════════════════════════════════
// ── 마지막 데이터 업데이트: 2026-03-13 ─────────────────────────────────────────
const AIRLINES = [
  {code:"EK",name:"Emirates",            hub:"DXB",city:{ko:"두바이",    en:"Dubai"},     status:"주의", affected:true, note:{ko:"전쟁 전 60% 이상 운항 복구. 100% 복구 목표 유지. 환승은 연결편 확정 시에만 허용. 2/28~3/31 발권 → 4/30까지 무료 재예약 또는 환불.",en:"60%+ of pre-war capacity restored. Targeting 100% recovery. Transit only with confirmed connection. Feb 28–Mar 31 tickets free rebooking to Apr 30."}},
  {code:"EY",name:"Etihad Airways",      hub:"AUH",city:{ko:"아부다비",  en:"Abu Dhabi"}, status:"주의", affected:true, note:{ko:"전쟁 전 대비 약 30% 운항. 3/13~15 급속 증편 진행 중. 2/28 이전 발권·3/21까지 여행 → 5/15까지 무료 재예약 또는 환불. 피싱 사기 주의.",en:"~30% of pre-war ops. Rapidly ramping up Mar 13–15. Tickets by Feb 28, travel to Mar 21 → free rebook to May 15 or refund. Beware phishing scams."}},
  {code:"FZ",name:"flydubai",            hub:"DXB",city:{ko:"두바이",    en:"Dubai"},     status:"주의", affected:true, note:{ko:"감편 운항 중. 바레인·쿠웨이트·도하·다맘 3/20까지, 이라크·레바논·이란 3/28까지 중단. 2/28~3/31 발권 → 30일 이내 동일 목적지 무료 재예약.",en:"Reduced schedule. Bahrain/Kuwait/Doha/Dammam suspended to Mar 20. Iraq/Lebanon/Iran to Mar 28. Feb 28–Mar 31 tickets → free rebook within 30 days same destination."}},
  {code:"QR",name:"Qatar Airways",       hub:"DOH",city:{ko:"도하",      en:"Doha"},      status:"주의", affected:true, note:{ko:"36개 목적지 제한 운항 점진적 확대 중. 3/13 서울(ICN)·런던·방콕·KL·파리·암스테르담 등 출발. 2/28~3/28 발권 → 4/30까지 무료 변경 또는 환불.",en:"36 destinations gradually expanding. Mar 13 departures: Seoul(ICN), London, Bangkok, KL, Paris, Amsterdam etc. Feb 28–Mar 28 tickets → free change or refund to Apr 30."}},
  {code:"WY",name:"Oman Air",            hub:"MCT",city:{ko:"무스카트",  en:"Muscat"},    status:"주의", affected:false,note:{ko:"무스카트 정상 운항. 단 암만·두바이·바레인·도하·다맘·쿠웨이트·코펜하겐·바그다드 3/22까지 취소. 중동 우회 핵심 거점.",en:"Muscat normal ops. BUT Amman/Dubai/Bahrain/Doha/Dammam/Kuwait/Copenhagen/Baghdad cancelled to Mar 22. Key bypass hub."}},
  {code:"SV",name:"Saudia",              hub:"RUH",city:{ko:"리야드",    en:"Riyadh"},    status:"주의", affected:true, note:{ko:"리야드·제다 운항 지속. 다맘發 런던·방콕·뭄바이 Gulf Air 대체편 운항. 리야드가 유럽행 우회 환승 거점으로 급부상.",en:"Riyadh & Jeddah ops continuing. Gulf Air operating Dammam→London/Bangkok/Mumbai. Riyadh emerging as key bypass hub for Europe."}},
  {code:"GF",name:"Gulf Air",            hub:"BAH",city:{ko:"바레인",    en:"Bahrain"},   status:"중단", affected:true, note:{ko:"바레인 영공 폐쇄 지속(3/13 13시 업데이트 예정). 항공기 다맘으로 재배치. 다맘發 런던·방콕·뭄바이 운항 중. 3/31까지 무료 변경, 3/21까지 무료 환불.",en:"Bahrain airspace still closed (update expected Mar 13 13:00). Aircraft repositioned to Dammam. Operating Dammam→London/Bangkok/Mumbai. Free rebook to Jun 15, refund to Mar 21."}},
  {code:"RJ",name:"Royal Jordanian",     hub:"AMM",city:{ko:"암만",      en:"Amman"},     status:"주의", affected:true, note:{ko:"두바이·바레인·도하·다맘·쿠웨이트·코펜하겐·바그다드 노선 취소 연장 중. 최신 일정 확인 필수.",en:"Dubai/Bahrain/Doha/Dammam/Kuwait/Copenhagen/Baghdad flights still cancelled. Check latest schedule directly."}},
  {code:"ME",name:"Middle East Airlines",hub:"BEY",city:{ko:"베이루트",  en:"Beirut"},    status:"주의", affected:true, note:{ko:"베이루트 축소 운항 유지. 레바논 영공 기술적 개방이나 인근 불안정 지속.",en:"Reduced Beirut operations continuing. Lebanese airspace technically open but regionally unstable."}},
  {code:"TK",name:"Turkish Airlines",    hub:"IST",city:{ko:"이스탄불",  en:"Istanbul"},  status:"운항중",affected:false,note:{ko:"이스탄불 정상 운항. 바레인·이란·이라크·요르단·쿠웨이트·레바논·카타르·UAE 등 3/31까지 무료 변경 가능.",en:"Istanbul normal ops. Free changes to Mar 31 for Bahrain/Iran/Iraq/Jordan/Kuwait/Lebanon/Qatar/UAE bookings."}},
  {code:"IR",name:"Iran Air",            hub:"IKA",city:{ko:"테헤란",    en:"Tehran"},    status:"중단", affected:true, note:{ko:"국제선 전면 중단. 이란 영공 3/15 08:30 UTC까지 폐쇄. 재개 시점 미정.",en:"All international flights suspended. Iranian airspace closed until Mar 15 08:30 UTC. No reopening timeline."}},
  {code:"LY",name:"El Al",              hub:"TLV",city:{ko:"텔아비브",  en:"Tel Aviv"},  status:"주의", affected:true, note:{ko:"이스라엘 영공 PPR 제한(3/16까지). 24시간 내 75편 출발·52편 도착 추적됨. 사실상 부분 운항 중.",en:"Israeli airspace PPR required (to Mar 16). 75 departures & 52 arrivals tracked in last 24hrs — effectively partial ops."}},
  {code:"KE",name:"Korean Air",          hub:"ICN",city:{ko:"인천",      en:"Incheon"},   status:"주의", affected:true, note:{ko:"중동 경유 노선 우회 운항 중. 홈페이지에서 편별 확인 필수. 무료 변경·환불 제공.",en:"Rerouting Middle East transit flights. Check website per flight. Free changes/refunds."}},
  {code:"OZ",name:"Asiana Airlines",     hub:"ICN",city:{ko:"인천",      en:"Incheon"},   status:"주의", affected:true, note:{ko:"중동 노선 영향 지속. 환불 수수료 면제. 항공사 공식 채널에서 최신 일정 확인.",en:"Middle East routes still affected. Refund fee waived. Check official channels for latest schedule."}},
];
const AIRSPACE = [
  {country:{ko:"이란",          en:"Iran"},          status:"폐쇄",note:{ko:"민간 영공 전면 폐쇄 지속. OIIX/Tehran FIR 3/15 08:30 UTC까지 폐쇄. 재개 시점 미정.",        en:"Civilian airspace fully closed. OIIX/Tehran FIR closed until Mar 15 08:30 UTC. No reopening timeline."}},
  {country:{ko:"이라크",        en:"Iraq"},          status:"폐쇄",note:{ko:"ORBB/Baghdad FIR 전면 폐쇄. 3/13 09:00 UTC 만료 후 재연장 예상. 지역 내 마지막으로 재개될 전망.",    en:"ORBB/Baghdad FIR fully closed. Expires Mar 13 09:00 UTC — expected to extend again. Last to reopen in region."}},
  {country:{ko:"바레인·쿠웨이트",en:"Bahrain/Kuwait"},status:"폐쇄",note:{ko:"바레인(OBBB) 3/13 16:00 UTC 만료. 출발편 PPR 후 일부 허용으로 변경. 쿠웨이트(OKAC) 전면 폐쇄 유지. Gulf Air 다맘으로 재배치.",en:"Bahrain(OBBB) expires Mar 13 16:00 UTC — amended to allow PPR departures only. Kuwait(OKAC) still fully closed. Gulf Air repositioned to Dammam."}},
  {country:{ko:"이스라엘",      en:"Israel"},        status:"제한",note:{ko:"LLLL/Tel Aviv FIR PPR 필요(3/16까지). 24시간 내 75편 출발·52편 도착 — 사실상 부분 운항 중. EASA 회피 권고.",en:"LLLL/Tel Aviv FIR PPR required (to Mar 16). 75 deps & 52 arrivals in last 24hrs — effectively partial ops. EASA advisory."}},
  {country:{ko:"UAE",           en:"UAE"},           status:"제한",note:{ko:"OMAE FIR 부분 재개. 두바이·아부다비 지정 항로(waypoint corridor)로만 운항. 3/16까지 EST 적용.",      en:"OMAE FIR partial — only via tightly defined waypoint corridors. EST applies until Mar 16."}},
  {country:{ko:"카타르",        en:"Qatar"},         status:"제한",note:{ko:"OTDF/Doha FIR ESCAT 운용 중. 36개 목적지 점진적 재개. 사전 허가 후 운항 가능. 도하↔서울(ICN) 포함.",      en:"OTDF/Doha FIR operating ESCAT zones. 36 destinations gradually resuming with prior permission. Includes Doha↔Seoul(ICN)."}},
  {country:{ko:"시리아",        en:"Syria"},         status:"폐쇄",note:{ko:"OSTT/Damascus FIR 전면 폐쇄. 미·영·EU 운항 금지 NOTAM 발령.",                                    en:"OSTT/Damascus FIR fully closed. US, UK, EU operators prohibited by NOTAM."}},
  {country:{ko:"예멘",          en:"Yemen"},         status:"폐쇄",note:{ko:"영공 완전 폐쇄. 상업 항공편 없음.",                                                               en:"Airspace fully closed. No commercial flights."}},
  {country:{ko:"사우디아라비아", en:"Saudi Arabia"},  status:"주의",note:{ko:"OEJD FIR 대부분 정상. 리야드 우회 환승 급증. EASA 회피 권고 범위에 포함 — 주의 요망.",             en:"OEJD FIR mostly normal. Riyadh transit surging. Included in EASA advisory — caution required."}},
  {country:{ko:"레바논",        en:"Lebanon"},       status:"주의",note:{ko:"OLBB/Beirut FIR 개방 유지. 단 인근 분쟁으로 불안정. EASA 회피 권고 포함.",                         en:"OLBB/Beirut FIR open but unstable due to nearby conflict. Included in EASA advisory."}},
];
const AIRPORTS = [
  {iata:"DXB",name:{ko:"두바이 국제공항",          en:"Dubai International"},      city:{ko:"두바이",   en:"Dubai"},    status:"제한",airline:"Emirates / flydubai",
   detail:{ko:"3/10 드론 공격으로 터미널 3 인근 연기·폭발. 일시 운항 중단 후 재개. Emirates 95개 목적지 운항 중. 확정 탑승권 없이 공항 방문 절대 금지.",en:"Mar 10 drone attack caused smoke/explosion near Terminal 3. Brief halt then resumed. Emirates serving 95 destinations. Do NOT go without confirmed booking."},
   date:"2026-03-10",
   warn:{ko:"항공사 공식 확인 없이 공항 방문 금지",en:"Do NOT go to airport without official airline confirmation"},site:"https://dubaiairports.ae"},
  {iata:"AUH",name:{ko:"자이드 국제공항",          en:"Zayed International"},      city:{ko:"아부다비", en:"Abu Dhabi"},status:"제한",airline:"Etihad Airways",
   detail:{ko:"Etihad 3/13~15 급속 증편 진행 중(전쟁 전 약 30%). 2/28 이전 발권·3/21까지 여행 → 5/15까지 무료 재예약. 피싱 사기 주의 — 공식 채널만 이용. 40~60% 정상 용량 추정.",en:"Etihad rapidly ramping up Mar 13–15 (~30% of pre-war ops). Tickets by Feb 28, travel to Mar 21 → free rebook to May 15. Beware phishing scams. Est. 40–60% normal capacity."},
   date:"2026-03-13",
   warn:{ko:"Etihad 앱·웹에서 실시간 편 확인 필수 — 피싱 사기 주의",en:"Verify on Etihad.com only — beware phishing scams on social media"},site:"https://www.abudhabi-airports.ae"},
  {iata:"DOH",name:{ko:"하마드 국제공항",          en:"Hamad International"},      city:{ko:"도하",     en:"Doha"},     status:"제한",airline:"Qatar Airways",
   detail:{ko:"제한 운항 재개 중. 3/13 서울(ICN)·런던·방콕·KL·파리·암스테르담·밀라노 등 출발. 36개 목적지 점진적 확대. 공항 방문 전 반드시 확정 탑승권 확인.",en:"Limited ops resuming. Mar 13 departures: Seoul(ICN), London, Bangkok, KL, Paris, Amsterdam, Milan etc. 36 destinations expanding. Must have confirmed ticket before going to airport."},
   date:"2026-03-13",
   warn:{ko:"확정 탑승권 없이 공항 방문 절대 금지",en:"Do NOT go to airport without a confirmed booking"},site:"https://dohahamadairport.com"},
  {iata:"MCT",name:{ko:"무스카트 국제공항",        en:"Muscat International"},     city:{ko:"무스카트", en:"Muscat"},   status:"운항중",airline:"Oman Air / BA / Virgin",
   detail:{ko:"중동 우회 핵심 거점. BA 3/9~12 런던행 구조편, Virgin Atlantic·Finnair 구조편 출발. 비즈니스 항공기 혼잡 — 정기편만 접수.",en:"Key bypass hub. BA rescue flights to London Mar 9–12, Virgin Atlantic & Finnair also departing. BizAv congestion — scheduled flights only."},
   date:"2026-03-10",
   warn:null,site:"https://www.omanairports.co.om"},
  {iata:"BAH",name:{ko:"바레인 국제공항",          en:"Bahrain International"},    city:{ko:"마나마",   en:"Manama"},   status:"중단",airline:"Gulf Air",
   detail:{ko:"바레인 영공 폐쇄로 Gulf Air 전편 중단. 114편 이상 취소. BCAA 영공 안전 재개 확인 시에만 운항 재개.",en:"Bahrain airspace closed — Gulf Air all flights suspended. 114+ cancellations. Will resume only when BCAA confirms safe reopening."},
   date:"2026-03-10",
   warn:{ko:"Gulf Air 전편 중단 — 재개 전 직접 확인",en:"Gulf Air all flights suspended — confirm directly before travel"},site:"https://www.bahrainairport.bh"},
  {iata:"TLV",name:{ko:"벤구리온 국제공항",        en:"Ben Gurion Airport"},       city:{ko:"텔아비브", en:"Tel Aviv"}, status:"중단",airline:"El Al",
   detail:{ko:"이스라엘 영공 PPR 제한. El Al 우회 운항(아테네 등 경유)만 가능. 대부분 외국 항공사 운항 중단.",en:"PPR restriction on Israeli airspace. Only El Al diverting via Athens etc. Most foreign airlines suspended."},
   date:"2026-03-10",
   warn:{ko:"외교부 4단계 철수권고",en:"MOFA Level 4 Evacuation Advisory"},site:null},
  {iata:"IKA",name:{ko:"이맘 호메이니 국제공항",   en:"Imam Khomeini Intl"},       city:{ko:"테헤란",   en:"Tehran"},   status:"중단",airline:"Iran Air",
   detail:{ko:"이란 영공 전면 폐쇄. 국제선 전면 중단. 이란 내 외국인 출국 매우 어려운 상황. 육로 탈출 시도 중.",en:"Iran airspace fully closed. All international flights suspended. Very difficult for foreigners to depart. Overland exits being attempted."},
   date:"2026-03-10",
   warn:{ko:"외교부 3단계 — 가능한 수단으로 즉시 출국",en:"MOFA Level 3 — depart by any available means immediately"},site:null},
];
const ADVISORY=[
  {c:{ko:"이스라엘·팔레스타인",en:"Israel / Palestine"},l:{ko:"4단계 철수권고",en:"Lv4 Evacuation"},col:C.red,    warn:{ko:"즉시 철수 — 항공편 대부분 취소, El Al 우회 운항만 가능",en:"Evacuate immediately — most flights cancelled, only El Al diverted routes"}},
  {c:{ko:"레바논",            en:"Lebanon"},           l:{ko:"4단계 철수권고",en:"Lv4 Evacuation"},col:C.red,    warn:{ko:"즉시 철수 — MEA 축소 운항, 이른 시일 내 탈출 권고",en:"Evacuate immediately — MEA reduced ops, depart as soon as possible"}},
  {c:{ko:"예멘",              en:"Yemen"},             l:{ko:"4단계 철수권고",en:"Lv4 Evacuation"},col:C.red,    warn:{ko:"즉시 철수 — 상업 항공편 없음, 특별기 이용",en:"Evacuate immediately — no commercial flights, charter/special flights only"}},
  {c:{ko:"이란",              en:"Iran"},              l:{ko:"3단계 출국권고",en:"Lv3 Departure"}, col:C.orange, warn:{ko:"즉시 출국 — 영공 폐쇄, 육로 포함 가능한 수단 모두 이용",en:"Depart immediately — airspace closed, use any available means including overland"}},
  {c:{ko:"이라크",            en:"Iraq"},              l:{ko:"3단계 여행제한",en:"Lv3 Restricted"},col:C.orange, warn:{ko:"여행 제한 — 영공 폐쇄로 항공편 없음",en:"Restricted — no flights due to airspace closure"}},
  {c:{ko:"UAE",               en:"UAE"},               l:{ko:"2단계 여행자제",en:"Lv2 Caution"},   col:C.yellow, warn:{ko:"두바이·아부다비 제한 운항 중 — 여행 자제 및 항공사 확인 필수",en:"Dubai & Abu Dhabi limited ops — avoid non-essential travel, confirm with airline"}},
];
const US_ADVISORY=[
  {c:{ko:"이란",              en:"Iran"},              l:{ko:"Level 4 — 여행금지",en:"Level 4 — Do Not Travel"},    col:C.red,    warn:{ko:"여행 금지 — 영공 폐쇄, 미국인 즉시 출국 요청",en:"Do not travel — airspace closed, State Dept urging US citizens to depart"}},
  {c:{ko:"이라크",            en:"Iraq"},              l:{ko:"Level 4 — 여행금지",en:"Level 4 — Do Not Travel"},    col:C.red,    warn:{ko:"여행 금지 — 영공 폐쇄, 드론·미사일 공격 위험",en:"Do not travel — airspace closed, drone/missile attack risk"}},
  {c:{ko:"가자지구",          en:"Gaza"},              l:{ko:"Level 4 — 여행금지",en:"Level 4 — Do Not Travel"},    col:C.red,    warn:{ko:"여행 금지 — 항공편 없음",en:"Do not travel — no flights"}},
  {c:{ko:"레바논",            en:"Lebanon"},           l:{ko:"Level 4 — 여행금지",en:"Level 4 — Do Not Travel"},    col:C.red,    warn:{ko:"여행 금지 — 베이루트 노선 불안정",en:"Do not travel — Beirut routes unstable"}},
  {c:{ko:"예멘",              en:"Yemen"},             l:{ko:"Level 4 — 여행금지",en:"Level 4 — Do Not Travel"},    col:C.red,    warn:{ko:"여행 금지 — 상업 항공편 없음",en:"Do not travel — no commercial flights"}},
  {c:{ko:"이스라엘·서안지구", en:"Israel / West Bank"},l:{ko:"Level 3 — 여행재고",en:"Level 3 — Reconsider Travel"},col:C.orange, warn:{ko:"여행 재고 — 영공 PPR 제한, El Al 우회 운항만",en:"Reconsider travel — airspace PPR restriction, El Al diverted routes only"}},
  {c:{ko:"바레인·쿠웨이트",   en:"Bahrain / Kuwait"},  l:{ko:"Level 3 — 여행재고",en:"Level 3 — Reconsider Travel"},col:C.orange, warn:{ko:"여행 재고 — 공항 복구 중, 상황 유동적",en:"Reconsider travel — airports recovering, situation fluid"}},
  {c:{ko:"UAE",               en:"UAE"},               l:{ko:"Level 2 — 주의",   en:"Level 2 — Exercise Caution"}, col:C.yellow, warn:{ko:"두바이·아부다비 제한 운항 — 주의 및 항공사 확인",en:"Dubai & Abu Dhabi limited ops — exercise caution, confirm with airline"}},
  {c:{ko:"사우디아라비아",     en:"Saudi Arabia"},      l:{ko:"Level 2 — 주의",   en:"Level 2 — Exercise Caution"}, col:C.yellow, warn:{ko:"리야드 우회 환승 증가 — 북부 국경지대 주의",en:"Riyadh transit increasing — caution near northern border areas"}},
];
// ── 최신 뉴스 데이터 (수동 업데이트) ─────────────────────────────────────────
const STATIC_NEWS = [
  {icon:"📢",tag:"Emirates",   severity:"high",  time:"3/13",content:"Emirates, 전쟁 전 60% 이상 운항 복구. 100% 목표 유지. 환승은 연결편 확정 시에만 허용. 2/28~3/31 발권 → 4/30까지 무료 재예약 또는 환불.",                    source:"emirates.com",    fresh:true},
  {icon:"📢",tag:"Etihad",     severity:"high",  time:"3/13",content:"Etihad, 3/13~15 급속 증편 진행 중(전쟁 전 대비 약 30%). 2/28 이전 발권·3/21까지 여행 → 5/15까지 무료 재예약. 피싱 사기 주의 — 공식 채널만 이용.",             source:"etihad.com",      fresh:true},
  {icon:"📢",tag:"Qatar",      severity:"high",  time:"3/13",content:"Qatar Airways, 3/13 서울(ICN)·런던·방콕·KL·파리·암스테르담 등 출발. 36개 목적지 점진적 확대. 2/28~3/28 발권 → 4/30까지 무료 변경 또는 환불.",                source:"qatarairways.com",fresh:true},
  {icon:"🚨",tag:"Gulf Air",   severity:"high",  time:"3/13",content:"Gulf Air, 바레인 영공 폐쇄로 항공기 다맘(DMM)으로 재배치. 바레인 공항 인근 연기 목격. 다맘發 런던·방콕·뭄바이 운항 중. 3/13 13시 업데이트 예정.",             source:"Euronews/Reuters", fresh:true},
  {icon:"⛔",tag:"이라크영공",  severity:"high",  time:"3/13",content:"이라크 영공(ORBB) 3/13 09:00 UTC 만료 후 재연장 예상. 지역 내 마지막으로 재개될 전망. 이라크 경유 전 노선 우회 필요.",                                       source:"ICAA/NOTAM",      fresh:true},
  {icon:"⛔",tag:"이란영공",    severity:"high",  time:"3/13",content:"이란 영공(OIIX) 3/15 08:30 UTC까지 폐쇄. Iran Air 국제선 전면 중단 지속. 재개 시점 미정.",                                                              source:"NOTAM/FR24",      fresh:true},
  {icon:"🚨",tag:"KLM",        severity:"medium",time:"3/12",content:"KLM, 두바이에 묶여있던 B787 3/12 빈 채로 네덜란드 귀환. 리야드·다맘 3/28까지 취소 연장. 승객 재배치는 외교부와 협조 중.",                                      source:"KLM newsroom",    fresh:true},
  {icon:"📢",tag:"Turkish",    severity:"low",   time:"3/13",content:"Turkish Airlines, 바레인·이란·이라크·요르단·쿠웨이트·레바논·카타르·UAE 등 3/31까지 무료 변경 가능. 이스탄불(IST) 가장 안정적인 경유지.",                          source:"turkishairlines.com",fresh:true},
  {icon:"✅",tag:"무스카트",   severity:"low",   time:"3/13",content:"무스카트(MCT) 중동 우회 핵심 거점 유지. Oman Air, 암만·두바이·바레인·도하 등 3/22까지 취소이나 무스카트 자체는 정상 운항.",                                     source:"Oman Air",        fresh:true},
  {icon:"🚨",tag:"항공료급등",  severity:"medium",time:"3/10",content:"제트연료 $4.12/갤런 — 4년래 최고가. 항공사들 조용히 요금 인상 시작. 중동 우회로 비행시간 최대 2시간 증가, 여름 항공료 추가 인상 전망.",                          source:"TravelPirates",   fresh:false},
  {icon:"✅",tag:"KE·OZ환불",  severity:"low",   time:"3/3", content:"대한항공·아시아나 중동 경유 노선 무료 변경·환불. 하나투어·모두투어 두바이·카이로 체류 한국인 약 540명 귀환 지원 완료.",                                         source:"Seoul Econ Daily",fresh:false},
  {icon:"📢",tag:"Saudia",     severity:"medium",time:"3/7", content:"Saudia, 리야드·제다 운항 지속. Gulf Air와 협력해 다맘발 런던·방콕·뭄바이 편 운항. 리야드(RUH) 유럽행 우회 환승 거점으로 급부상.",                               source:"saudia.com",      fresh:false},
];
// Ticker static data builder
function buildStaticTicker(lang) {
  const items = [];
  AIRSPACE.filter(a=>a.status==="폐쇄").forEach(a=>{
    items.push(lang==="ko"?`⛔ ${a.country.ko} — ${a.note.ko}`:`⛔ ${a.country.en} — ${a.note.en}`);
  });
  AIRSPACE.filter(a=>a.status==="제한").forEach(a=>{
    items.push(lang==="ko"?`🚨 ${a.country.ko} — ${a.note.ko}`:`🚨 ${a.country.en} — ${a.note.en}`);
  });
  AIRLINES.filter(a=>a.affected).forEach(a=>{
    items.push(lang==="ko"?`✈️ ${a.name} (${a.code}) — ${a.note.ko}`:`✈️ ${a.name} (${a.code}) — ${a.note.en}`);
  });
  AIRSPACE.filter(a=>a.status==="주의").forEach(a=>{
    items.push(lang==="ko"?`⚠️ ${a.country.ko} — ${a.note.ko}`:`⚠️ ${a.country.en} — ${a.note.en}`);
  });
  AIRLINES.filter(a=>!a.affected).forEach(a=>{
    items.push(lang==="ko"?`✅ ${a.name} (${a.hub}) — ${a.note.ko}`:`✅ ${a.name} (${a.hub}) — ${a.note.en}`);
  });
  return items;
}

function Ticker({lang, items, loading}){
  const base = items && items.length > 0 ? items : buildStaticTicker(lang);
  const looped = [...base, ...base];
  const timeLabel = lang==="ko"?"매일 CET 업데이트":"Updated daily CET";
  return(
    <div style={{overflow:"hidden",background:C.ticker,padding:"7px 0",borderBottom:`1px solid ${C.accentLight}`,position:"relative"}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:80,background:`linear-gradient(to right,${C.ticker},transparent)`,zIndex:2,pointerEvents:"none"}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:80,background:`linear-gradient(to left,${C.ticker},transparent)`,zIndex:2,pointerEvents:"none"}}/>
      {loading?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"0 12px"}}>
          <span style={{fontSize:10,color:"#93C5FD",fontFamily:"monospace",display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>
          <span style={{fontSize:10,color:"#93C5FD",fontFamily:"monospace"}}>{lang==="ko"?"업데이트 중…":"updating…"}</span>
        </div>
      ):(
        <div style={{display:"flex",gap:60,animation:"ticker 60s linear infinite",whiteSpace:"nowrap"}}>
          {/* timestamp token at the front */}
          <span style={{fontSize:11,fontFamily:"monospace",color:"#60A5FA",display:"inline-flex",alignItems:"center",gap:6,flexShrink:0,fontWeight:700}}>
            🕐 {timeLabel}
          </span>
          {looped.map((t,i)=>{
            const isOfficial = String(t).startsWith("📢");
            return(
              <span key={i} style={{
                fontSize:12,fontFamily:"monospace",
                color: isOfficial?"#FDE68A":C.tickerText,
                fontWeight: isOfficial?800:400,
                display:"inline-flex",alignItems:"center",gap:8,flexShrink:0,
                ...(isOfficial?{background:"rgba(251,191,36,0.15)",padding:"1px 8px",borderRadius:4}:{})
              }}>
                <span style={{width:4,height:4,borderRadius:"50%",background: isOfficial?"#FDE68A":"#60A5FA",flexShrink:0}}/>
                {t}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
const LABEL={
  ko:{airline:{"운항중":"운항중","주의":"주의","중단":"중단"},airspace:{"정상":"정상","주의":"주의","제한":"제한","폐쇄":"폐쇄"},airport:{"운항중":"운항중","제한":"제한운항","주의":"주의","중단":"운항중단"},flight:{"정상운항":"정상운항","지연":"지연","취소":"취소","우회":"우회","정보없음":"정보없음"}},
  en:{airline:{"운항중":"Normal","주의":"Caution","중단":"Suspended"},airspace:{"정상":"Normal","주의":"Caution","제한":"Restricted","폐쇄":"Closed"},airport:{"운항중":"Operating","제한":"Restricted","주의":"Caution","중단":"Suspended"},flight:{"정상운항":"On Time","지연":"Delayed","취소":"Cancelled","우회":"Diverted","정보없음":"Unknown"}},
};
const TABS=[{id:"airlines",ko:"✈ 항공사",en:"✈ Airlines"},{id:"airports",ko:"🛬 공항",en:"🛬 Airports"},{id:"airspace",ko:"🗺 영공",en:"🗺 Airspace"},{id:"refund",ko:"💳 환불",en:"💳 Refund"},{id:"altflights",ko:"🔄 대체항공편",en:"🔄 Alt Flights"}];

// ══ SHARED COMPONENTS ═════════════════════════════════════════════════════════
function Badge({status,label}){
  const c=ST[status]||ST["정보없음"];
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:99,fontSize:11,fontWeight:700,background:c.bg,border:`1px solid ${c.bd}`,color:c.tx,whiteSpace:"nowrap",flexShrink:0}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:c.dot,flexShrink:0}}/>
      {label||status}
    </span>
  );
}



// ══ AIRPORTS ══════════════════════════════════════════════════════════════════
function Airports({lang, liveData}){
  const [exp,setExp]=useState(null);
  const data=liveData||AIRPORTS;
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(15,30,80,0.07)"}}>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:13,fontWeight:800,color:C.text}}>🛬 {lang==="ko"?"주요 공항 현황":"Major Airport Status"}</span>
          {liveData&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:C.grnBg,border:`1px solid ${C.grnBd}`,color:C.green,fontWeight:800}}>● LIVE</span>}
        </div>
        <span style={{fontSize:10,color:C.textMuted}}>{lang==="ko"?"클릭하여 상세보기":"Click for details"}</span>
      </div>
      <div style={{padding:10,display:"flex",flexDirection:"column",gap:7}}>
        {data.map(ap=>{
          const sc=ST[ap.status]||ST["주의"];
          const isOpen=exp===ap.iata;
          return(
            <div key={ap.iata} style={{borderRadius:10,border:`1.5px solid ${isOpen?sc.bd:C.border}`,background:isOpen?sc.bg:C.cardSub,transition:"all 0.2s",overflow:"hidden"}}>
              <div onClick={()=>setExp(isOpen?null:ap.iata)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",cursor:"pointer"}}>
                <div style={{flexShrink:0,width:48,textAlign:"center"}}>
                  <div style={{fontSize:15,fontWeight:900,fontFamily:"monospace",color:C.text}}>{ap.iata}</div>
                  <div style={{fontSize:9,color:sc.dot,fontWeight:700}}>●</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ap.name[lang]}</div>
                  <div style={{fontSize:11,color:C.textMuted,marginTop:1}}>{ap.city[lang]} · {ap.airline}</div>
                </div>
                <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                  <Badge status={ap.status} label={LABEL[lang].airport[ap.status]||ap.status}/>
                  <span style={{fontSize:10,color:C.textMuted}}>{isOpen?"▲":"▼"}</span>
                </div>
              </div>
              {isOpen&&(
                <div style={{padding:"0 13px 13px",borderTop:`1px solid ${C.border}`,paddingTop:10}}>
                  {ap.date&&(
                    <div style={{display:"inline-flex",alignItems:"center",gap:4,marginBottom:7,padding:"2px 8px",borderRadius:99,background:C.accentLight,border:`1px solid ${C.borderMed}`}}>
                      <span style={{fontSize:10}}>🕐</span>
                      <span style={{fontSize:10,fontFamily:"monospace",color:C.accent,fontWeight:700}}>
                        {lang==="ko"
                          ?`${ap.date.slice(5,7)}/${ap.date.slice(8,10)} 업데이트`
                          :`Updated ${ap.date.slice(5,7)}/${ap.date.slice(8,10)}`}
                      </span>
                    </div>
                  )}
                  <p style={{fontSize:13,color:C.textSub,lineHeight:1.6,margin:"0 0 8px"}}>{ap.detail[lang]}</p>
                  {ap.warn&&<div style={{display:"flex",gap:7,padding:"7px 10px",borderRadius:8,background:C.redBg,border:`1px solid ${C.redBd}`,marginBottom:8}}>
                    <span style={{color:C.red}}>⚠</span>
                    <p style={{fontSize:12,color:C.red,margin:0,fontWeight:700}}>{ap.warn[lang]}</p>
                  </div>}
                  {ap.site&&<a href={ap.site} target="_blank" rel="noreferrer" style={{fontSize:11,color:C.accent,fontFamily:"monospace"}}>{lang==="ko"?"공항 홈페이지 →":"Airport website →"} {ap.site}</a>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══ FLIGHT SEARCH ═════════════════════════════════════════════════════════════
function Search({lang}){
  const [num,setNum]=useState("");
  const [date,setDate]=useState(()=>new Date().toISOString().split("T")[0]);

  const go=useCallback(()=>{
    const q=num.trim().toUpperCase();
    if(!q) return;
    window.open(`https://www.flightradar24.com/${q}/${date.replace(/-/g,"")}`, "_blank");
  },[num,date]);

  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(15,30,80,0.07)",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"11px 15px",borderBottom:`1px solid ${C.border}`,background:C.cardSub}}>
        <span style={{fontSize:17}}>🔍</span>
        <span style={{fontSize:13,fontWeight:800,color:C.text}}>{lang==="ko"?"내 항공편 조회":"My Flight Lookup"}</span>
        <span style={{marginLeft:"auto",fontSize:10,color:C.textMuted}}>{lang==="ko"?"Flightradar24 연동":"via Flightradar24"}</span>
      </div>
      <div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>

        {/* How-to guide */}
        <div style={{background:C.accentLight,border:`1px solid ${C.borderMed}`,borderRadius:10,padding:"10px 13px",display:"flex",flexDirection:"column",gap:6}}>
          <p style={{fontSize:11,fontWeight:800,color:C.accent,margin:0,textTransform:"uppercase",letterSpacing:"0.06em"}}>
            {lang==="ko"?"✈ 항공편명 찾는 법":"✈ How to find your flight number"}
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {[
              lang==="ko"?"① 항공권 or 앱에서 편명 확인 — 예: EK363, QR836, KE957":"① Check your ticket or airline app — e.g. EK363, QR836, KE957",
              lang==="ko"?"② 항공사 2자리 코드 + 숫자 조합 (EK=에미레이트, QR=카타르, KE=대한항공)":"② Airline 2-letter code + number (EK=Emirates, QR=Qatar, KE=Korean Air)",
              lang==="ko"?"③ 편명 + 날짜 입력 후 조회 버튼 클릭 → Flightradar24에서 실시간 위치·지연 확인":"③ Enter flight + date → opens Flightradar24 with live position & delay info",
            ].map((t,i)=>(
              <p key={i} style={{fontSize:12,color:C.textSub,margin:0,lineHeight:1.55}}>{t}</p>
            ))}
          </div>
        </div>

        {/* Example chips */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:10,color:C.textMuted,fontWeight:700}}>{lang==="ko"?"예시:":"e.g."}</span>
          {["EK363","QR836","KE957","TK12","LH600"].map(ex=>(
            <button key={ex} onClick={()=>setNum(ex)}
              style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,background:num===ex?C.accent:"#fff",border:`1.5px solid ${num===ex?C.accent:C.border}`,color:num===ex?"#fff":C.textSub,cursor:"pointer"}}>
              {ex}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          <input value={num} onChange={e=>setNum(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&go()}
            placeholder={lang==="ko"?"편명 직접 입력 (예: EK363)":"Enter flight number (e.g. EK363)"} maxLength={8}
            style={{flex:"1 1 150px",minWidth:0,background:"#fff",border:`1.5px solid ${num.trim()?C.accent:C.borderMed}`,borderRadius:8,padding:"9px 11px",fontSize:14,color:C.text,fontFamily:"monospace",letterSpacing:"0.1em",outline:"none",fontWeight:700}}/>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            style={{flex:"0 0 auto",background:"#fff",border:`1.5px solid ${C.borderMed}`,borderRadius:8,padding:"9px 11px",fontSize:13,color:C.text,outline:"none"}}/>
          <button onClick={go} disabled={!num.trim()}
            style={{padding:"9px 20px",borderRadius:8,fontSize:13,fontWeight:700,background:num.trim()?`linear-gradient(135deg,${C.accent},#1D4ED8)`:"#E2E7F8",border:"none",color:num.trim()?"#fff":C.textMuted,cursor:!num.trim()?"not-allowed":"pointer",transition:"all 0.15s",boxShadow:num.trim()?"0 3px 10px rgba(37,99,235,0.3)":"none"}}>
            {lang==="ko"?"실시간 조회 ↗":"Live Track ↗"}
          </button>
        </div>

        <p style={{fontSize:10,color:C.textMuted,margin:0}}>
          {lang==="ko"
            ?"🔗 Flightradar24에서 해당 편의 실시간 위치·고도·속도·지연 정보를 확인할 수 있어요"
            :"🔗 Opens Flightradar24 showing live position, altitude, speed & delay for your flight"}
        </p>
      </div>
    </div>
  );
}

function Refund({lang}){
  // ── 환불 데이터 (3/9 기준) ────────────────────────────────────────────────
  const REFUND_DATA=[
    {code:"EK",name:"Emirates",            flag:"🇦🇪",
     waiver:{ko:"Waiver CW-2026-ME 확정",en:"Waiver CW-2026-ME confirmed"},
     policy:{
       ko:"2/28~3/20 출발 예약편: ① 무료 날짜 변경(3/31까지 새 출발일 지정) ② 전액 환불(미사용 구간) ③ 여행 크레딧 옵션. 항공사 취소편은 패널티 없이 전액 환불.",
       en:"Bookings for travel Feb 28–Mar 20: ① Free date change (new travel by Mar 31) ② Full refund (unused portion) ③ Travel credit option. Airline-cancelled flights: full refund, no penalty."
     },
     howTo:{ko:"emirates.com → Manage Booking → 'Waiver' 선택 / 고객센터",en:"emirates.com → Manage Booking → select 'Waiver' / call center"},
     url:"https://www.emirates.com/english/help/travel-updates/",
     refundUrl:"https://www.emirates.com/english/manage-booking/",
     phone:"+971 600 555 555",
     deadline:{ko:"3/31까지 새 여정 완료",en:"New travel must be completed by Mar 31"}},

    {code:"EY",name:"Etihad Airways",      flag:"🇦🇪",
     waiver:{ko:"Waiver CW005-2026 확정",en:"Waiver CW005-2026 confirmed"},
     policy:{
       ko:"2/28 이전 발권, 3/21 이전 출발편: 5/15까지 무료 재예약. 미사용 전체 티켓은 전액 환불. 3/9~12 운항 확인 후 환승 불가 시 자동 리스케줄. ※ Avios 등 제휴 포인트 발권은 발권 항공사에 문의.",
       en:"Tickets issued before Feb 28, depart before Mar 21: free rebooking until May 15. Fully unused ticket: full refund. Mar 9–12 transit refused if connecting flight not confirmed. ※ Avios/partner miles tickets: contact issuing programme."
     },
     howTo:{ko:"etihad.com → Manage → Change Flight → 'Waiver' 선택",en:"etihad.com → Manage → Change Flight → select 'Waiver'"},
     url:"https://www.etihad.com/en/manage/regional-flight-disruption-update",
     refundUrl:"https://www.etihad.com/en/help/refund-form",
     phone:"+971 2 599 0000 (UAE) / 1-877-690-0767 (US) / 0345-608-1225 (UK)",
     deadline:{ko:"5/15까지 재예약 가능",en:"Rebooking valid until May 15"}},

    {code:"QR",name:"Qatar Airways",       flag:"🇶🇦",
     waiver:{ko:"웨이버 발령 완료",en:"Waiver issued"},
     policy:{
       ko:"2/28~3/10 출발편: 14일 이내 무료 날짜 변경 또는 미사용 구간 환불. 도하 공항 영공 폐쇄 기간 항공사 취소분은 수수료 없이 전액 환불. ※ 파트너 포인트 발권은 발권 항공사에 문의.",
       en:"Flights Feb 28–Mar 10: free date change within 14 days, or refund for unused portion. Airline-cancelled (DOH closure): full refund, no fee. ※ Partner-miles tickets: contact issuing programme."
     },
     howTo:{ko:"qatarairways.com → Manage Booking / 고객센터",en:"qatarairways.com → Manage Booking / call center"},
     url:"https://www.qatarairways.com/en/travel-alerts.html",
     refundUrl:"https://www.qatarairways.com/en/refund.html",
     phone:"+974 4023 0000",
     deadline:{ko:"취소 후 14일 이내 신청",en:"Apply within 14 days of cancellation"}},

    {code:"TK",name:"Turkish Airlines",    flag:"🇹🇷",
     waiver:{ko:"웨이버 발령 — 중동 전 노선",en:"Waiver — all Middle East routes"},
     policy:{
       ko:"2/28 이전 발권된 중동 노선(바레인·이란·이라크·이스라엘·요르단·쿠웨이트·레바논·오만·카타르·사우디·시리아·UAE) 탑승객: 5/10까지 무료 날짜 변경·무료 환불·유효기간 연장(5/10까지) 중 선택 가능.",
       en:"Tickets issued by Feb 28 to/from Bahrain, Iran, Iraq, Israel, Jordan, Kuwait, Lebanon, Oman, Qatar, Saudi Arabia, Syria, UAE: free change, free refund, or validity extension to May 10."
     },
     howTo:{ko:"turkishairlines.com → My Bookings / 전화 신청",en:"turkishairlines.com → My Bookings / call center"},
     url:"https://www.turkishairlines.com/en-int/announcements/",
     refundUrl:"https://www.turkishairlines.com/en-int/flights/refund-ticket/",
     phone:"+90 212 444 0 849",
     deadline:{ko:"5/10까지 변경·환불 신청 가능",en:"Changes/refunds must be requested by May 10"}},

    {code:"KE",name:"Korean Air",          flag:"🇰🇷",
     waiver:{ko:"중동 노선 긴급 공지 발령",en:"Emergency notice for Middle East routes"},
     policy:{
       ko:"중동 경유 노선(두바이·아부다비·도하·암만·베이루트 등) 운항 변경·취소 시: 수수료 없이 일정 변경 또는 전액 환불. 홈페이지 또는 고객센터(1588-2001) 통해 신청. 여행사 구매 티켓은 해당 여행사에 문의.",
       en:"Middle East routing (Dubai, Abu Dhabi, Doha, Amman, Beirut etc.) changed/cancelled: free schedule change or full refund. Apply online or call 1588-2001. Travel agency tickets: contact agency."
     },
     howTo:{ko:"koreanair.com → 예약관리 → 환불/변경 / 고객센터 1588-2001",en:"koreanair.com → Manage Booking → Refund/Change / Call 1588-2001"},
     url:"https://www.koreanair.com/us/en/travel-info/travel-notice",
     refundUrl:"https://www.koreanair.com/us/en/manage/refund",
     phone:"1588-2001 (국내) / +82-2-2656-2001 (해외)",
     deadline:{ko:"운항 재개 후 일정 기간 내 신청",en:"Apply within a set period after service resumes"}},

    {code:"OZ",name:"Asiana Airlines",     flag:"🇰🇷",
     waiver:{ko:"중동 노선 환불 수수료 면제",en:"Refund fee waiver for Middle East routes"},
     policy:{
       ko:"중동 노선 운항 취소·중단 시 환불 수수료 전액 면제. 하나투어·모두투어 등 패키지 고객은 여행사 통해 귀환편 지원 중(체류객 약 540명 지원). 아시아나 홈페이지 또는 1588-8000으로 신청.",
       en:"Full waiver of refund penalties for cancelled/suspended Middle East routes. Package customers (Hanatour/Modetour): ~540 stranded passengers being assisted by travel agencies. Apply online or call 1588-8000."
     },
     howTo:{ko:"flyasiana.com → 예약관리 → 환불 / 고객센터 1588-8000",en:"flyasiana.com → Manage Booking → Refund / Call 1588-8000"},
     url:"https://flyasiana.com/C/KR/KO/info/notice-list",
     refundUrl:"https://flyasiana.com/C/KR/KO/manage/refund",
     phone:"1588-8000 (국내) / +82-2-2669-8000 (해외)",
     deadline:{ko:"운항 재개 후 일정 기간 내 신청",en:"Apply within a set period after service resumes"}},

    {code:"LH",name:"Lufthansa Group",     flag:"🇩🇪",
     waiver:{ko:"LH·LX·OS·SN·EN 전체 웨이버",en:"Waiver covers LH, LX, OS, SN, EN"},
     policy:{
       ko:"두바이·아부다비·도하·텔아비브·암만·베이루트 운항 중단분: 무료 환불 또는 3/31까지 무료 재예약. 이란 테헤란(IKA) 노선: 3/28까지 운항 취소, 전액 환불 가능.",
       en:"Cancelled flights to Dubai, Abu Dhabi, Doha, Tel Aviv, Amman, Beirut: free refund or rebooking by Mar 31. Tehran (IKA): suspended until Mar 28, full refund available."
     },
     howTo:{ko:"lufthansa.com → My Bookings / 고객센터",en:"lufthansa.com → My Bookings / call center"},
     url:"https://www.lufthansa.com/us/en/travel-requirements-entry-regulations",
     refundUrl:"https://www.lufthansa.com/us/en/refund",
     phone:"+1 800 645 3880 (US) / +49 69 86 799 799 (DE)",
     deadline:{ko:"3/31까지 재예약 완료",en:"Rebooking must be completed by Mar 31"}},

    {code:"BA",name:"British Airways",     flag:"🇬🇧",
     waiver:{ko:"중동 웨이버 + 귀국편 운항",en:"Middle East waiver + repatriation flights"},
     policy:{
       ko:"중동 영향 노선 취소분: 무료 환불 또는 날짜 변경. UK261 적용 탑승객: 영공 폐쇄는 '특별한 상황(extraordinary circumstances)'으로 고정 보상 미적용 — 리부킹 또는 환불만 가능. 오만·리야드 경유 귀국편 일부 운항 중.",
       en:"Cancelled Middle East flights: free refund or rebooking. UK261 passengers: airspace closure = extraordinary circumstances — fixed compensation not applicable; rebooking or refund only. Some repatriation flights via Muscat/Riyadh."
     },
     howTo:{ko:"ba.com → Manage My Booking / 고객센터",en:"ba.com → Manage My Booking / call center"},
     url:"https://www.britishairways.com/en-gb/information/incident/airspace-closures",
     refundUrl:"https://www.britishairways.com/en-gb/information/incident/manage-booking",
     phone:"+44 344 493 0787 (UK)",
     deadline:{ko:"취소 후 최대 7일 이내 환불 신청 권장",en:"Refund recommended within 7 days of cancellation"}},

    {code:"SQ",name:"Singapore Airlines",  flag:"🇸🇬",
     waiver:{ko:"웨이버 확정",en:"Waiver confirmed"},
     policy:{
       ko:"중동 경유 항로 변경 및 운항 취소 발생분: 무료 날짜 변경 또는 전액 환불. 장거리 노선(런던·암스테르담·바르셀로나 등) 우회 운항으로 비행시간 증가.",
       en:"Affected by rerouting/cancellation: free date change or full refund. Long-haul routes (London, Amsterdam, Barcelona etc.) being rerouted, adding significant flight time."
     },
     howTo:{ko:"singaporeair.com → Manage Booking / 고객센터",en:"singaporeair.com → Manage Booking / call center"},
     url:"https://www.singaporeair.com/en_UK/us/travel-info/travel-advisory/",
     refundUrl:"https://www.singaporeair.com/en_UK/us/manage-booking/",
     phone:"+65 6223 8888",
     deadline:{ko:"취소 후 일정 기간 내 신청",en:"Apply within a set period after cancellation"}},

    {code:"GF",name:"Gulf Air",            flag:"🇧🇭",
     waiver:{ko:"바레인 영공 재개 후 단계적 복구",en:"Gradual recovery after Bahrain airspace reopened"},
     policy:{
       ko:"바레인 영공 폐쇄로 운항 중단된 항공편: 무료 환불 또는 재예약. 현재 단계적 복구 진행 중. 최신 운항 현황은 Gulf Air 공식 홈페이지 확인.",
       en:"Flights cancelled due to Bahrain airspace closure: free refund or rebooking. Gradual recovery ongoing. Check Gulf Air official website for latest flight status."
     },
     howTo:{ko:"gulfair.com → Help Center → Refunds",en:"gulfair.com → Help Center → Refunds"},
     url:"https://www.gulfair.com/help-center/travel-updates",
     refundUrl:"https://www.gulfair.com/help-center/refunds",
     phone:"+973 17 373 737",
     deadline:{ko:"공식 홈페이지에서 기한 확인",en:"Check official website for deadline"}},

    {code:"LY",name:"El Al",              flag:"🇮🇱",
     waiver:{ko:"이스라엘 영공 제한 대응 웨이버",en:"Waiver due to Israeli airspace restrictions"},
     policy:{
       ko:"이스라엘 영공 PPR 제한으로 우회 운항 중. 취소된 항공편 전액 환불 또는 재예약. 아테네 경유 귀국편 운항 중. 이스라엘 내 고객: El Al 공식 채널 통해 출국 지원 신청.",
       en:"Diverted due to Israeli airspace PPR restrictions. Cancelled flights: full refund or rebooking. Rescue flights operating via Athens. Customers in Israel: apply via El Al official channels."
     },
     howTo:{ko:"elal.com → Manage Booking / 고객센터",en:"elal.com → Manage Booking / call center"},
     url:"https://www.elal.com/en/Pages/Travel-updates.aspx",
     refundUrl:"https://www.elal.com/en/Pages/Refund.aspx",
     phone:"+972 3 977 1111",
     deadline:{ko:"공식 홈페이지에서 기한 확인",en:"Check official website for deadline"}},
  ];

  const [selected,setSelected]=useState(null);
  const sel=REFUND_DATA.find(a=>a.code===selected);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:C.accentLight,border:`1px solid ${C.borderMed}`,borderRadius:12,padding:"11px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
        <span style={{fontSize:16,flexShrink:0}}>ℹ️</span>
        <p style={{fontSize:12,color:C.textSub,margin:0,lineHeight:1.6}}>
          {lang==="ko"
            ?"항공사를 선택하면 중동 분쟁 관련 환불 정책과 공식 신청 링크를 안내해드려요."
            :"Select an airline to see their Middle East disruption refund policy and official links."}
        </p>
      </div>

      {/* Airline selector */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14,boxShadow:"0 2px 8px rgba(15,30,80,0.06)"}}>
        <p style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",margin:"0 0 10px"}}>
          {lang==="ko"?"항공사 선택":"Select Airline"}
        </p>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {REFUND_DATA.map(a=>{
            const active=selected===a.code;
            return(
              <button key={a.code} onClick={()=>setSelected(active?null:a.code)}
                style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:10,fontSize:12,fontWeight:700,
                  background:active?C.accent:"#fff",
                  border:`1.5px solid ${active?C.accent:C.border}`,
                  color:active?"#fff":C.textSub,
                  cursor:"pointer",transition:"all 0.15s"}}>
                <span>{a.flag}</span>
                <span style={{fontFamily:"monospace",fontSize:10,opacity:0.7}}>{a.code}</span>
                <span>{a.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Policy detail */}
      {sel&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(15,30,80,0.07)"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:C.cardSub,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{sel.flag}</span>
            <div>
              <div style={{fontSize:14,fontWeight:900,color:C.text}}>{sel.name}</div>
              <div style={{fontSize:10,color:C.textMuted}}>{lang==="ko"?"환불 정책":"Refund Policy"}</div>
            </div>
          </div>
          <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>
            {/* Waiver confirmed badge */}
            {sel.waiver&&(
              <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:8,background:C.grnBg,border:`1px solid ${C.grnBd}`,alignSelf:"flex-start"}}>
                <span style={{fontSize:12}}>✅</span>
                <span style={{fontSize:11,fontWeight:800,color:C.green}}>{sel.waiver[lang]||sel.waiver.ko}</span>
              </div>
            )}
            {/* Policy box */}
            <div style={{display:"flex",gap:10,padding:"11px 14px",borderRadius:10,background:"#FFF7ED",border:`1.5px solid ${C.orgBd}`}}>
              <span style={{fontSize:18,flexShrink:0}}>🚨</span>
              <div>
                <p style={{fontSize:11,fontWeight:800,color:C.orange,margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                  {lang==="ko"?"중동 분쟁 환불 조항":"Middle East Disruption Policy"}
                </p>
                <p style={{fontSize:13,color:C.textSub,margin:0,lineHeight:1.65}}>{sel.policy[lang]}</p>
              </div>
            </div>
            {/* Deadline + HowTo 2-col */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {sel.deadline&&(
                <div style={{background:C.yelBg,border:`1px solid ${C.yelBd}`,borderRadius:10,padding:11}}>
                  <p style={{fontSize:10,fontWeight:800,color:C.yellow,margin:"0 0 4px",textTransform:"uppercase"}}>⏰ {lang==="ko"?"신청 기한":"Deadline"}</p>
                  <p style={{fontSize:12,color:C.textSub,margin:0,lineHeight:1.5}}>{sel.deadline[lang]}</p>
                </div>
              )}
              {sel.howTo&&(
                <div style={{background:C.accentLight,border:`1px solid ${C.borderMed}`,borderRadius:10,padding:11}}>
                  <p style={{fontSize:10,fontWeight:800,color:C.accent,margin:"0 0 4px",textTransform:"uppercase"}}>📋 {lang==="ko"?"신청 방법":"How to Apply"}</p>
                  <p style={{fontSize:12,color:C.textSub,margin:0,lineHeight:1.5}}>{sel.howTo[lang]}</p>
                </div>
              )}
            </div>
            {/* Links */}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <a href={sel.url} target="_blank" rel="noreferrer"
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px 16px",borderRadius:10,background:`linear-gradient(135deg,${C.accent},#1D4ED8)`,color:"#fff",textDecoration:"none",fontWeight:800,fontSize:13,boxShadow:"0 3px 12px rgba(37,99,235,0.3)"}}>
                📋 {lang==="ko"?"공식 운항 업데이트 확인":"Check Official Travel Update"} ↗
              </a>
              {sel.refundUrl&&(
                <a href={sel.refundUrl} target="_blank" rel="noreferrer"
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px 16px",borderRadius:10,background:C.grnBg,border:`1.5px solid ${C.grnBd}`,color:C.green,textDecoration:"none",fontWeight:800,fontSize:13}}>
                  💰 {lang==="ko"?"환불 신청 바로가기":"Apply for Refund"} ↗
                </a>
              )}
            </div>
            {/* Phone */}
            {sel.phone&&(
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,background:C.cardSub,border:`1px solid ${C.border}`}}>
                <span style={{fontSize:14}}>📞</span>
                <div>
                  <p style={{fontSize:10,fontWeight:700,color:C.textMuted,margin:"0 0 2px",textTransform:"uppercase"}}>{lang==="ko"?"고객센터":"Customer Service"}</p>
                  <p style={{fontSize:12,fontWeight:700,color:C.text,margin:0,fontFamily:"monospace"}}>{sel.phone}</p>
                </div>
              </div>
            )}
            <p style={{fontSize:10,color:C.textMuted,margin:0}}>
              {lang==="ko"?"※ 여행사 구매 티켓은 해당 여행사에 별도 문의하세요":"※ Tickets from travel agencies: contact the agency directly"}
            </p>
          </div>
        </div>
      )}

      {!selected&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"40px 20px",textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:10,opacity:0.15}}>💳</div>
          <p style={{color:C.textSub,fontSize:13,margin:"0 0 6px",fontWeight:600}}>
            {lang==="ko"?"위에서 항공사를 선택하세요":"Select an airline above"}
          </p>
          <p style={{color:C.textMuted,fontSize:11,margin:0}}>
            {lang==="ko"?"3/9 기준 최신 웨이버 정책 안내":"Latest waiver policies as of Mar 9, 2026"}
          </p>
        </div>
      )}
    </div>
  );
}

// ══ ALTERNATIVE FLIGHTS ═══════════════════════════════════════════════════════
function AltFlights({lang}){
  const [from,setFrom]=useState("");
  const [to,setTo]=useState("");
  const [date,setDate]=useState(()=>new Date().toISOString().split("T")[0]);

  const tripLink=(f,t,d)=>{
    const dd=d?d.replace(/-/g,""):"";
    const base=lang==="ko"?`https://3ha.in/r/387804`:`https://3ha.in/r/387805`;
    return `${base}#search/flight/${f}-${t}/${dd}/1/0/0/Economy`;
  };
  const skyLink=(f,t,d)=>{
    const dd=d?d.replace(/-/g,"").slice(2):"";
    return `https://www.skyscanner.net/transport/flights/${f.toLowerCase()}/${t.toLowerCase()}/${dd}/?adultsv2=1&cabinclass=economy`;
  };
  const canSearch=from.trim().length===3&&to.trim().length===3;

  // 3/9 기준 안전 경유지 가이드
  const TIPS=[
    {icon:"✅",ko:"이스탄불(IST) 경유 — Turkish Airlines 정상 운항. 중동 피해 노선 무료 변경 가능",en:"Via Istanbul (IST) — TK operating normally. Free changes for Middle East routes"},
    {icon:"✅",ko:"무스카트(MCT) 경유 — Oman Air 정상 운항. 현재 중동 우회 핵심 거점. 좌석 수요 매우 높음",en:"Via Muscat (MCT) — Oman Air normal ops. Key bypass hub — very high seat demand"},
    {icon:"✅",ko:"리야드(RUH) 경유 — Saudia 3/7 제한 운항 재개. 런던 등 장거리 환승 수요 급증",en:"Via Riyadh (RUH) — Saudia limited ops resumed Mar 7. High demand for long-haul transit"},
    {icon:"✅",ko:"카이로(CAI) 경유 — 이집트 영공 이상 없음. EgyptAir 정상 운항 중",en:"Via Cairo (CAI) — Egyptian airspace unaffected. EgyptAir operating normally"},
    {icon:"✅",ko:"방콕(BKK)·쿠알라룸푸르(KUL) 경유 — 동남아 우회 가능. Thai Airways 증편 중",en:"Via Bangkok (BKK)/KL (KUL) — SE Asia bypass available. Thai Airways adding capacity"},
    {icon:"⚠️",ko:"두바이(DXB) 경유 — Emirates 60% 운항 재개. 공항 방문 전 반드시 항공사 확인",en:"Via Dubai (DXB) — Emirates ~60% resumed. MUST confirm with airline before going to airport"},
    {icon:"⚠️",ko:"아부다비(AUH) 경유 — Etihad 3/9~12 선별 노선 운항. 환승은 양편 모두 확정 시에만",en:"Via Abu Dhabi (AUH) — Etihad select routes Mar 9–12. Transit only if BOTH flights confirmed"},
    {icon:"⚠️",ko:"도하(DOH) 경유 — Qatar 3/7부터 제한 재개. 최신 편 확인 필수",en:"Via Doha (DOH) — Qatar limited ops from Mar 7. Check latest schedule before booking"},
    {icon:"⛔",ko:"이란(OIIX)·이라크(ORBB) 영공 통과 노선 — 전면 폐쇄. 예약 전 항로 확인 필수",en:"Routes transiting Iran (OIIX)/Iraq (ORBB) airspace — FULLY CLOSED. Check routing before booking"},
    {icon:"⛔",ko:"이스라엘(LLLL) 영공 — PPR(사전허가) 필요. 대부분 항공사 이스라엘 영공 우회 중",en:"Israeli (LLLL) airspace — PPR required. Most airlines diverting around Israeli airspace"},
  ];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:C.accentLight,border:`1px solid ${C.borderMed}`,borderRadius:12,padding:"10px 14px",display:"flex",gap:9,alignItems:"flex-start"}}>
        <span style={{fontSize:15,flexShrink:0}}>💡</span>
        <p style={{fontSize:12,color:C.textSub,margin:0,lineHeight:1.6}}>
          {lang==="ko"
            ?"출발지·도착지 IATA 코드를 입력하고 Trip.com 또는 Skyscanner에서 실시간 항공권을 검색하세요."
            :"Enter origin & destination IATA codes, then search live flights on Trip.com or Skyscanner."}
        </p>
      </div>

      {/* Search inputs */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14,boxShadow:"0 2px 8px rgba(15,30,80,0.06)"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:"1 1 70px",minWidth:64}}>
            <label style={{fontSize:10,color:C.textMuted,fontWeight:700,display:"block",marginBottom:4}}>{lang==="ko"?"출발 (IATA)":"From"}</label>
            <input value={from} onChange={e=>setFrom(e.target.value.toUpperCase().slice(0,3))} placeholder="ICN" maxLength={3}
              style={{width:"100%",background:"#fff",border:`1.5px solid ${from.length===3?C.accent:C.borderMed}`,borderRadius:8,padding:"9px 8px",fontSize:18,fontWeight:900,color:C.text,fontFamily:"monospace",textAlign:"center",outline:"none"}}/>
          </div>
          <div style={{flexShrink:0,paddingBottom:8,color:C.textMuted,fontSize:18}}>→</div>
          <div style={{flex:"1 1 70px",minWidth:64}}>
            <label style={{fontSize:10,color:C.textMuted,fontWeight:700,display:"block",marginBottom:4}}>{lang==="ko"?"도착 (IATA)":"To"}</label>
            <input value={to} onChange={e=>setTo(e.target.value.toUpperCase().slice(0,3))} placeholder="DXB" maxLength={3}
              style={{width:"100%",background:"#fff",border:`1.5px solid ${to.length===3?C.accent:C.borderMed}`,borderRadius:8,padding:"9px 8px",fontSize:18,fontWeight:900,color:C.text,fontFamily:"monospace",textAlign:"center",outline:"none"}}/>
          </div>
          <div style={{flex:"1 1 130px"}}>
            <label style={{fontSize:10,color:C.textMuted,fontWeight:700,display:"block",marginBottom:4}}>{lang==="ko"?"날짜":"Date"}</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={{width:"100%",background:"#fff",border:`1.5px solid ${C.borderMed}`,borderRadius:8,padding:"9px 8px",fontSize:13,color:C.text,outline:"none"}}/>
          </div>
        </div>
        <p style={{fontSize:10,color:C.textMuted,margin:"7px 0 0"}}>
          {lang==="ko"?"ICN=인천 NRT=도쿄 VIE=빈 DXB=두바이 AUH=아부다비 DOH=도하 IST=이스탄불 LHR=런던":"ICN=Incheon NRT=Tokyo VIE=Vienna DXB=Dubai DOH=Doha IST=Istanbul LHR=London"}
        </p>
      </div>

      {/* Booking buttons */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <a href={canSearch?tripLink(from,to,date):"https://3ha.in/r/387804"} target="_blank" rel="noopener noreferrer"
          style={{flex:"1 1 140px",display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"13px 16px",borderRadius:10,background:"linear-gradient(135deg,#1A56DB,#0E3FA8)",color:"#fff",textDecoration:"none",fontWeight:800,fontSize:13,boxShadow:"0 3px 12px rgba(26,86,219,0.3)"}}>
          ✈ Trip.com {lang==="ko"?"항공권 검색":"Search Flights"} ↗
        </a>
        <a href={canSearch?skyLink(from,to,date):"https://www.skyscanner.net"} target="_blank" rel="noopener noreferrer"
          style={{flex:"1 1 120px",display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"13px 16px",borderRadius:10,background:"#0770E3",color:"#fff",textDecoration:"none",fontWeight:700,fontSize:13}}>
          🔍 Skyscanner ↗
        </a>
      </div>

      {/* Static safe routing tips */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(15,30,80,0.05)"}}>
        <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,background:C.cardSub}}>
          <span style={{fontSize:12,fontWeight:800,color:C.text}}>🗺 {lang==="ko"?"현재 안전 경유지 가이드":"Current Safe Routing Guide"}</span>
        </div>
        <div style={{padding:12,display:"flex",flexDirection:"column",gap:7}}>
          {TIPS.map((t,i)=>(
            <div key={i} style={{display:"flex",gap:9,padding:"8px 10px",borderRadius:8,background:C.cardSub,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:14,flexShrink:0}}>{t.icon}</span>
              <p style={{fontSize:12,color:C.textSub,margin:0,lineHeight:1.55}}>{lang==="ko"?t.ko:t.en}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══ NEWS ══════════════════════════════════════════════════════════════════════
function News({lang}){
  const SEV={
    high:   {bg:C.redBg,  color:C.red},
    medium: {bg:C.yelBg,  color:C.yellow},
    low:    {bg:"#F1F5F9",color:"#64748B"},
  };
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(15,30,80,0.07)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{fontSize:15}}>📡</span>
          <span style={{fontSize:13,fontWeight:800,color:C.text}}>{lang==="ko"?"최신 뉴스":"Latest News"}</span>
        </div>
        <span style={{fontSize:10,color:C.textMuted,fontFamily:"monospace"}}>{lang==="ko"?"수동 업데이트":"Manual update"}</span>
      </div>
      <div style={{padding:"5px 14px",background:C.cardSub,borderBottom:`1px solid ${C.border}`}}>
        <p style={{fontSize:10,color:C.textMuted,margin:0}}>🕐 {lang==="ko"?"항공사 공홈 및 주요 외신 기준":"Based on airline newsrooms & major outlets"}</p>
      </div>
      <div style={{padding:12}}>
        {STATIC_NEWS.map((item,i)=>(
          <div key={i} style={{display:"flex",gap:9,padding:9,borderRadius:8,background:item.fresh?C.grnBg:C.cardSub,border:`1px solid ${item.fresh?C.grnBd:C.border}`,marginBottom:7}}>
            <div style={{flexShrink:0,width:28,height:28,borderRadius:"50%",background:C.accentLight,border:`1px solid ${C.borderMed}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{item.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontSize:10,fontWeight:700,padding:"1px 5px",borderRadius:4,...(SEV[item.severity]||SEV.low)}}>{item.tag}</span>
                {item.source&&<span style={{fontSize:10,color:C.accent,fontWeight:600}}>{item.source}</span>}
                <span style={{fontSize:10,color:C.textMuted}}>{item.time}</span>
              </div>
              <p style={{fontSize:12,color:C.textSub,lineHeight:1.55,margin:0}}>{lang==="ko"?item.content:item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══ APP ═══════════════════════════════════════════════════════════════════════
export default function App(){
  const [lang,setLang]=useState("ko");
  const [tab,setTab]=useState("airlines");
  const [af,setAf]=useState("all");
  const [sf,setSf]=useState("all");

  const airlines=AIRLINES;
  const airspace=AIRSPACE;
  const airports=AIRPORTS;

  const affected=airlines.filter(a=>a.affected||["주의","제한","중단","취소","우회"].includes(a.status)).length;
  const normal=airlines.filter(a=>a.status==="운항중"||a.status==="정상").length;
  const restricted=airspace.filter(a=>a.status==="폐쇄"||a.status==="제한").length;
  const filtAirlines=airlines.filter(a=>af==="all"?true:af==="affected"?(a.affected||["주의","제한","중단"].includes(a.status)):(!a.affected&&a.status==="운항중"));
  const filtAirspace=airspace.filter(a=>sf==="all"?true:a.status==="폐쇄"||a.status==="제한");

  const STATS=[
    {lbl:{ko:"영향받는 항공사",en:"Affected Airlines"},val:affected, unit:{ko:"개사",en:"airlines"},col:C.red,   bg:C.redBg,bd:C.redBd,action:()=>{setAf(p=>p==="affected"?"all":"affected");setTab("airlines");},isActive:()=>af==="affected"},
    {lbl:{ko:"정상 운항",      en:"Normal Ops"},       val:normal,   unit:{ko:"개사",en:"airlines"},col:C.green, bg:C.grnBg,bd:C.grnBd,action:()=>{setAf(p=>p==="normal"?"all":"normal");setTab("airlines");},isActive:()=>af==="normal"},
    {lbl:{ko:"제한·폐쇄 영공", en:"Restricted Airspace"},val:restricted,unit:{ko:"개국",en:"countries"},col:C.orange,bg:C.orgBg,bd:C.orgBd,action:()=>{setSf(p=>p==="restricted"?"all":"restricted");setTab("airspace");},isActive:()=>sf==="restricted"},
    {lbl:{ko:"여행경보",       en:"Travel Advisories"},val:lang==="ko"?5:7, unit:{ko:"개국",en:"countries"},col:C.purple,bg:C.purBg,bd:C.purBd,
      action:()=>document.getElementById("advisory-cards")?.scrollIntoView({behavior:"smooth",block:"nearest"}),
      isActive:()=>false,
      sub:{ko:"외교부·미 국무부",en:"MOFA · US State Dept"}},
  ];

  return(
    <div style={{minHeight:"100vh",background:C.pageBg,color:C.text,fontFamily:"'Noto Sans KR','system-ui',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;900&display=swap');
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        *{box-sizing:border-box} input,button{font-family:inherit}
        .hov{transition:all .18s} .hov:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(15,30,80,0.13)!important}
      `}</style>

      {/* Header */}
      <header style={{background:C.header,padding:"10px 14px",boxShadow:"0 2px 14px rgba(0,0,0,0.18)"}}>
        {/* Top row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          {/* Logo + title */}
          <div style={{display:"flex",alignItems:"center",gap:9,minWidth:0}}>
            <div style={{width:34,height:34,flexShrink:0,borderRadius:9,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>✈</div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:14,fontWeight:900,color:"#fff",letterSpacing:"0.01em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {lang==="ko"?"중동 항공 현황":"ME Flight Tracker"}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:1}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#4ADE80",display:"inline-block",animation:"pulse 2s infinite",flexShrink:0}}/>
                <span style={{fontSize:9,color:"#4ADE80",fontFamily:"monospace",fontWeight:700}}>LIVE</span>
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
            {/* Lang toggle */}
            <div style={{display:"flex",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:7,overflow:"hidden"}}>
              {["ko","en"].map(l=>(
                <button key={l} onClick={()=>setLang(l)} style={{padding:"5px 10px",fontSize:11,fontWeight:700,background:lang===l?"rgba(255,255,255,0.18)":"transparent",border:"none",color:lang===l?"#fff":"rgba(255,255,255,0.4)",cursor:"pointer"}}>
                  {l==="ko"?"🇰🇷":"🇺🇸"}
                </button>
              ))}
            </div>
            {/* Update notice */}
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:8,fontSize:11,fontWeight:600,background:"rgba(255,255,255,0.10)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.75)",whiteSpace:"nowrap"}}>
              🕐 {lang==="ko"?"매일 CET 기준 업데이트":"Updated daily CET"}
            </div>
          </div>
        </div>
      </header>

      <Ticker lang={lang} items={buildStaticTicker(lang)} loading={false}/>

      <main style={{maxWidth:1100,margin:"0 auto",padding:"22px 14px"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:22}}>
          {STATS.map((s,i)=>{
            const active=s.isActive();
            return(
              <div key={i} className={s.action?"hov":""} onClick={s.action||undefined}
                style={{borderRadius:14,border:`1.5px solid ${active?s.col:s.bd}`,background:s.bg,padding:16,cursor:s.action?"pointer":"default",outline:active?`2.5px solid ${s.col}`:"none",outlineOffset:2,position:"relative",boxShadow:"0 2px 8px rgba(15,30,80,0.07)"}}>
                {active&&<div style={{position:"absolute",top:7,right:8,fontSize:9,color:s.col,fontWeight:700,fontFamily:"monospace",background:s.bg,padding:"1px 5px",borderRadius:4,border:`1px solid ${s.col}`}}>FILTERED</div>}
                <p style={{fontSize:11,color:C.textSub,margin:"0 0 4px",fontWeight:600}}>{s.lbl[lang]}</p>
                <div style={{display:"flex",alignItems:"baseline",gap:4}}><span style={{fontSize:30,fontWeight:900,color:s.col}}>{s.val}</span><span style={{fontSize:12,color:s.col,fontWeight:700}}>{s.unit[lang]}</span></div>
                {s.action&&<p style={{fontSize:9,color:C.textMuted,margin:"4px 0 0",fontFamily:"monospace"}}>{s.sub?s.sub[lang]:(lang==="ko"?"클릭하여 필터":"click to filter")}</p>}
              </div>
            );
          })}
        </div>

        <Search lang={lang}/>

        {/* Trip.com CPA Banner — lang-aware affiliate links */}
        <a href={lang==="ko"?"https://3ha.in/r/387804":"https://3ha.in/r/387805"}
          target="_blank" rel="noopener noreferrer"
          style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"12px 18px",borderRadius:14,background:"linear-gradient(135deg,#1A56DB 0%,#0E3FA8 100%)",textDecoration:"none",boxShadow:"0 4px 16px rgba(26,86,219,0.25)",flexWrap:"wrap"}}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.92"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>✈️</div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <span style={{fontSize:14,fontWeight:900,color:"#fff"}}>Trip.com</span>
                <span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:"rgba(255,255,255,0.2)",color:"#fff",fontWeight:700,letterSpacing:"0.05em"}}>
                  {lang==="ko"?"제휴 파트너":"Affiliate Partner"}
                </span>
              </div>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.85)"}}>
                {lang==="ko"
                  ?"우회 항공편·호텔 최저가 검색 — 중동 전 노선 실시간 조회"
                  :"Search alternative flights & hotels — all Middle East routes live"}
              </span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.3)",flexShrink:0}}>
            <span style={{fontSize:12,fontWeight:800,color:"#fff"}}>
              {lang==="ko"?"항공편 검색하기":"Search Flights"}
            </span>
            <span style={{fontSize:14,color:"#fff"}}>↗</span>
          </div>
        </a>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,340px),1fr))",gap:20}}>
          <div>
            {/* Tabs */}
            <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:12}}>
              <div style={{display:"flex",gap:4,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:4,boxShadow:"0 1px 4px rgba(15,30,80,0.05)",minWidth:"max-content"}}>
                {TABS.map(t=>{
                  const active=tab===t.id;
                  return(
                    <button key={t.id} onClick={()=>setTab(t.id)}
                      style={{padding:"7px 12px",borderRadius:8,fontSize:11,fontWeight:700,background:active?C.accent:"transparent",border:"none",color:active?"#fff":C.textMuted,cursor:"pointer",transition:"all 0.18s",whiteSpace:"nowrap"}}>
                      {lang==="ko"?t.ko:t.en}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter chips */}
            {tab==="airlines"&&(
              <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                {[["all",{ko:"전체",en:"All"},C.textSub],["affected",{ko:`영향 (${affected})`,en:`Affected (${affected})`},C.red],["normal",{ko:`정상 (${normal})`,en:`Normal (${normal})`},C.green]].map(([id,lbl,col])=>{
                  const active=af===id;
                  return <button key={id} onClick={()=>setAf(id)} style={{padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,background:active?col:"#fff",border:`1.5px solid ${active?col:C.border}`,color:active?"#fff":C.textSub,cursor:"pointer"}}>{lbl[lang]}</button>;
                })}
              </div>
            )}
            {tab==="airspace"&&(
              <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                {[["all",{ko:"전체",en:"All"},C.textSub],["restricted",{ko:`제한·폐쇄 (${restricted})`,en:`Restricted/Closed (${restricted})`},C.orange]].map(([id,lbl,col])=>{
                  const active=sf===id;
                  return <button key={id} onClick={()=>setSf(id)} style={{padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,background:active?col:"#fff",border:`1.5px solid ${active?col:C.border}`,color:active?"#fff":C.textSub,cursor:"pointer"}}>{lbl[lang]}</button>;
                })}
              </div>
            )}

            {/* Airlines */}
            {tab==="airlines"&&(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(15,30,80,0.07)"}}>
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,background:C.cardSub,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{lang==="ko"?"항공사 현황":"Airline Status"}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column"}}>
                  {filtAirlines.map((a,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:i<filtAirlines.length-1?`1px solid ${C.border}`:"none",background:a.affected?"rgba(220,38,38,0.02)":"transparent"}}>
                      {/* Code */}
                      <span style={{fontFamily:"monospace",fontSize:12,background:C.accentLight,padding:"3px 7px",borderRadius:6,color:C.accent,fontWeight:800,flexShrink:0}}>{a.code}</span>
                      {/* Name + note */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name}</div>
                        <div style={{fontSize:11,color:C.textMuted,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.hub} · {a.note[lang]}</div>
                      </div>
                      {/* Badge */}
                      <Badge status={a.status} label={LABEL[lang].airline[a.status]||a.status}/>
                    </div>
                  ))}
                  {filtAirlines.length===0&&<div style={{padding:20,textAlign:"center",color:C.textMuted,fontSize:13}}>{lang==="ko"?"해당 항공사 없음":"No airlines to display"}</div>}
                </div>
              </div>
            )}

            {tab==="airports"&&<Airports lang={lang} liveData={airports}/>}

            {tab==="refund"&&<Refund lang={lang}/>}

            {tab==="altflights"&&<AltFlights lang={lang}/>}

            {/* Airspace */}
            {tab==="airspace"&&(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(15,30,80,0.07)"}}>
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,background:C.cardSub,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{lang==="ko"?"영공 현황":"Airspace Status"}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column"}}>
                  {filtAirspace.map((c,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:i<filtAirspace.length-1?`1px solid ${C.border}`:"none"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.text}}>{c.country[lang]}</div>
                        <div style={{fontSize:11,color:C.textMuted,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.note[lang]}</div>
                      </div>
                      <Badge status={c.status} label={LABEL[lang].airspace[c.status]||c.status}/>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Legend */}
            <div style={{display:"flex",flexWrap:"wrap",gap:12,marginTop:10,padding:"0 4px"}}>
              {(lang==="ko"?["정상/운항중","주의","제한/중단","폐쇄"]:["Normal","Caution","Restricted","Closed"]).map((lbl,i)=>{
                const cols=[C.green,C.yellow,C.orange,C.purple];
                return <div key={lbl} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.textSub}}><span style={{width:8,height:8,borderRadius:"50%",background:cols[i]}}/>{lbl}</div>;
              })}
            </div>
          </div>

          {/* Right column */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <News lang={lang}/>
            {/* Advisory cards — Korea MOFA (ko only) + US State Dept */}
            <div id="advisory-cards" style={{display:"flex",flexDirection:"column",gap:10}}>
              {/* Korea MOFA — Korean UI only */}
              {lang==="ko"&&(
              <div style={{background:C.card,border:`1.5px solid ${C.orgBd}`,borderRadius:14,padding:14,boxShadow:"0 2px 12px rgba(15,30,80,0.07)"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
                  <span style={{fontSize:17}}>🇰🇷</span>
                  <span style={{fontSize:11,fontWeight:800,color:"#92400E",textTransform:"uppercase",letterSpacing:"0.06em"}}>한국 외교부</span>
                </div>
                {ADVISORY.map(a=>(
                  <div key={a.c.ko} style={{marginBottom:6,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:11,color:C.textSub,fontWeight:500}}>{a.c.ko}</span>
                      <span style={{fontWeight:800,color:a.col,fontSize:10,whiteSpace:"nowrap",marginLeft:6}}>{a.l.ko}</span>
                    </div>
                    <p style={{fontSize:9,color:C.textMuted,margin:"2px 0 0",fontFamily:"monospace"}}>{a.warn?.ko||""}</p>
                  </div>
                ))}
                <p style={{fontSize:9,color:C.textMuted,marginTop:6,marginBottom:0}}>www.0404.go.kr</p>
              </div>
              )}
              {/* US State Dept */}
              <div style={{background:C.card,border:`1.5px solid #BFDBFE`,borderRadius:14,padding:14,boxShadow:"0 2px 12px rgba(15,30,80,0.07)"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
                  <span style={{fontSize:17}}>🇺🇸</span>
                  <span style={{fontSize:11,fontWeight:800,color:"#1E40AF",textTransform:"uppercase",letterSpacing:"0.06em"}}>{lang==="ko"?"미국 국무부":"US State Dept"}</span>
                </div>
                {US_ADVISORY.map(a=>(
                  <div key={a.c.en} style={{marginBottom:6,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:11,color:C.textSub,fontWeight:500}}>{a.c[lang]}</span>
                      <span style={{fontWeight:800,color:a.col,fontSize:10,whiteSpace:"nowrap",marginLeft:6}}>{a.l[lang]}</span>
                    </div>
                    <p style={{fontSize:9,color:C.textMuted,margin:"2px 0 0",fontFamily:"monospace"}}>{a.warn[lang]}</p>
                  </div>
                ))}
                <p style={{fontSize:9,color:C.textMuted,marginTop:6,marginBottom:0}}>travel.state.gov</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{marginTop:28,paddingTop:16,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
          <p style={{fontSize:11,color:C.textMuted,margin:0}}>⚠️ {lang==="ko"?"본 정보는 참고용 — 실제 운항 여부는 항공사·공항에 직접 확인하세요":"For reference only — confirm with airlines & airports directly"}</p>
          <p style={{fontSize:11,color:C.textMuted,fontFamily:"monospace",margin:0}}>Powered by Claude AI · {new Date().toLocaleDateString(lang==="ko"?"ko-KR":"en-US")}</p>
        </div>
      </main>
    </div>
  );
}
