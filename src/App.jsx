import { useState, useCallback, useEffect } from "react";

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
const AIRLINES = [
  {code:"EK",name:"Emirates",         hub:"DXB",city:{ko:"두바이",   en:"Dubai"},    status:"주의", affected:true, note:{ko:"허가 노선만 제한 운항",                   en:"Limited approved routes only"}},
  {code:"EY",name:"Etihad Airways",   hub:"AUH",city:{ko:"아부다비", en:"Abu Dhabi"},status:"주의", affected:true, note:{ko:"런던·파리 등 소수 승인 노선만",           en:"London, Paris & few routes only"}},
  {code:"FZ",name:"flydubai",         hub:"DXB",city:{ko:"두바이",   en:"Dubai"},    status:"주의", affected:true, note:{ko:"러시아·동유럽 일부 재개",               en:"Some Russia/E.Europe routes resumed"}},
  {code:"QR",name:"Qatar Airways",    hub:"DOH",city:{ko:"도하",     en:"Doha"},     status:"운항중",affected:false,note:{ko:"현재 정상 운항",                       en:"Operating normally"}},
  {code:"WY",name:"Oman Air",         hub:"MCT",city:{ko:"무스카트", en:"Muscat"},   status:"운항중",affected:false,note:{ko:"정상 운항",                             en:"Normal operations"}},
  {code:"SV",name:"Saudia",           hub:"RUH",city:{ko:"리야드",   en:"Riyadh"},   status:"운항중",affected:false,note:{ko:"정상 운항",                             en:"Normal operations"}},
  {code:"GF",name:"Gulf Air",         hub:"BAH",city:{ko:"바레인",   en:"Bahrain"},  status:"주의", affected:true, note:{ko:"일부 노선 우회",                        en:"Some routes diverted"}},
  {code:"RJ",name:"Royal Jordanian",  hub:"AMM",city:{ko:"암만",     en:"Amman"},    status:"주의", affected:true, note:{ko:"일부 노선 지연",                        en:"Some routes delayed"}},
  {code:"ME",name:"Middle East Airlines",hub:"BEY",city:{ko:"베이루트",en:"Beirut"}, status:"주의", affected:true, note:{ko:"운항 축소",                             en:"Reduced operations"}},
  {code:"IR",name:"Iran Air",         hub:"IKA",city:{ko:"테헤란",   en:"Tehran"},   status:"중단", affected:true, note:{ko:"다수 노선 중단",                        en:"Most routes suspended"}},
  {code:"LY",name:"El Al",            hub:"TLV",city:{ko:"텔아비브", en:"Tel Aviv"}, status:"중단", affected:true, note:{ko:"영공 제한으로 우회",                    en:"Diverted — airspace restricted"}},
];
const AIRSPACE = [
  {country:{ko:"이란",         en:"Iran"},         status:"제한",note:{ko:"민간 영공 부분 제한",        en:"Partial civil aviation restriction"}},
  {country:{ko:"이라크",       en:"Iraq"},         status:"주의",note:{ko:"일부 공역 NOTAM 발령",       en:"NOTAM issued for some sectors"}},
  {country:{ko:"이스라엘",     en:"Israel"},       status:"제한",note:{ko:"주요 공역 제한",            en:"Major airspace restricted"}},
  {country:{ko:"레바논",       en:"Lebanon"},      status:"주의",note:{ko:"베이루트 공항 인근 주의",    en:"Caution near Beirut airport"}},
  {country:{ko:"예멘",         en:"Yemen"},        status:"폐쇄",note:{ko:"영공 완전 폐쇄",           en:"Airspace fully closed"}},
  {country:{ko:"UAE",          en:"UAE"},          status:"제한",note:{ko:"이란 드론 공격 후 부분 제한",en:"Partial restriction after Iranian strikes"}},
  {country:{ko:"카타르",       en:"Qatar"},        status:"정상",note:{ko:"정상 운영",               en:"Normal operations"}},
  {country:{ko:"사우디아라비아",en:"Saudi Arabia"},status:"정상",note:{ko:"정상 운영",               en:"Normal operations"}},
  {country:{ko:"요르단",       en:"Jordan"},       status:"주의",note:{ko:"암만 공항 간헐적 지연",     en:"Intermittent delays at Amman"}},
  {country:{ko:"쿠웨이트",     en:"Kuwait"},       status:"주의",note:{ko:"인근 분쟁 여파 주의",       en:"Advisory due to nearby conflict"}},
];
const AIRPORTS = [
  {iata:"DXB",name:{ko:"두바이 국제공항",          en:"Dubai International"},     city:{ko:"두바이",   en:"Dubai"},    status:"제한",airline:"Emirates / flydubai",
   detail:{ko:"이란 공격 후 일시 폐쇄, 3/2부터 제한 재개. 항공사 출발 확정 승객만 공항 입장 가능.",en:"Temporarily closed after Iranian strikes, limited ops resumed Mar 2."},
   date:"2026-03-02",
   warn:{ko:"항공사 확정 없이 공항 방문 금지",en:"Do NOT go to airport without airline confirmation"},site:"https://dubaiairports.ae"},
  {iata:"AUH",name:{ko:"자이드 국제공항",          en:"Zayed International"},      city:{ko:"아부다비", en:"Abu Dhabi"},status:"제한",airline:"Etihad Airways",
   detail:{ko:"드론 파편 낙하로 1명 사망·7명 부상. 소수 승인 노선만 재개.",en:"Drone debris: 1 killed, 7 injured. Only select routes resumed."},
   date:"2026-03-06",
   warn:{ko:"Etihad 앱에서 개별 운항 확인 필수",en:"Check Etihad app for flight status"},site:"https://www.abudhabi-airports.ae"},
  {iata:"DOH",name:{ko:"하마드 국제공항",          en:"Hamad International"},      city:{ko:"도하",     en:"Doha"},     status:"운항중",airline:"Qatar Airways",
   detail:{ko:"현재 정상 운항 중. 카타르 영공은 분쟁 직접 영향권 외부.",en:"Currently operating normally. Qatar airspace outside direct conflict zone."},
   date:"2026-03-07",
   warn:null,site:"https://dohahamadairport.com"},
  {iata:"TLV",name:{ko:"벤구리온 국제공항",        en:"Ben Gurion Airport"},       city:{ko:"텔아비브", en:"Tel Aviv"}, status:"중단",airline:"El Al",
   detail:{ko:"영공 제한으로 다수 항공사 취소 또는 우회. El Al 우회 운항 중.",en:"Most airlines cancelled or diverting. El Al via alternative routes."},
   date:"2026-03-01",
   warn:{ko:"외교부 4단계 철수권고 지역",en:"Level 4 evacuation advisory by Korean MOFA"},site:null},
  {iata:"BEY",name:{ko:"베이루트 하리리 국제공항", en:"Beirut–Rafic Hariri Intl"}, city:{ko:"베이루트", en:"Beirut"},  status:"주의",airline:"Middle East Airlines",
   detail:{ko:"MEA 축소 운항 중. 공항 인근 보안 불안정.",en:"MEA operating reduced schedule. Security situation unstable."},
   date:"2026-03-03",
   warn:{ko:"외교부 4단계 철수권고 지역",en:"Level 4 evacuation advisory"},site:null},
  {iata:"IKA",name:{ko:"이맘 호메이니 국제공항",   en:"Imam Khomeini Intl"},       city:{ko:"테헤란",   en:"Tehran"},   status:"중단",airline:"Iran Air",
   detail:{ko:"이란 영공 제한으로 외국 항공사 운항 불가. 국제선 대부분 중단.",en:"Foreign airlines cannot operate due to Iranian airspace restrictions."},
   date:"2026-02-28",
   warn:{ko:"외교부 3단계 출국권고 지역",en:"Level 3 departure advisory"},site:null},
];
const ADVISORY=[
  {c:{ko:"이스라엘·팔레스타인",en:"Israel / Palestine"},l:{ko:"4단계 철수권고",en:"Lv4 Evacuation"},col:C.red,    warn:{ko:"즉시 철수 권고 — 항공편 운항 매우 제한",en:"Immediate evacuation — very limited flights"}},
  {c:{ko:"레바논",en:"Lebanon"},  l:{ko:"4단계 철수권고",en:"Lv4 Evacuation"},col:C.red,    warn:{ko:"즉시 철수 권고 — 베이루트 노선 대부분 중단",en:"Immediate evacuation — Beirut routes mostly suspended"}},
  {c:{ko:"예멘",  en:"Yemen"},    l:{ko:"4단계 철수권고",en:"Lv4 Evacuation"},col:C.red,    warn:{ko:"즉시 철수 권고 — 상업 항공편 없음",en:"Immediate evacuation — no commercial flights"}},
  {c:{ko:"이란",  en:"Iran"},     l:{ko:"3단계 출국권고",en:"Lv3 Departure"}, col:C.orange, warn:{ko:"출국 권고 — 영공 폐쇄로 우회 운항 중",en:"Departure advised — airspace closed, diversions in effect"}},
  {c:{ko:"이라크",en:"Iraq"},     l:{ko:"3단계 여행제한",en:"Lv3 Restricted"},col:C.orange, warn:{ko:"여행 제한 — 일부 노선 운항 불규칙",en:"Restricted — some routes operating irregularly"}},
];
const US_ADVISORY=[
  {c:{ko:"이스라엘·서안지구",en:"Israel / West Bank"},l:{ko:"Level 2 — 주의",en:"Level 2 — Exercise Caution"},col:C.yellow, warn:{ko:"일부 노선 운항 중 — 상황 주시",en:"Some routes operating — monitor situation"}},
  {c:{ko:"가자지구",en:"Gaza"},             l:{ko:"Level 4 — 여행금지",en:"Level 4 — Do Not Travel"},    col:C.red,    warn:{ko:"여행 금지 — 항공편 없음",en:"Do not travel — no flights available"}},
  {c:{ko:"레바논",  en:"Lebanon"},          l:{ko:"Level 4 — 여행금지",en:"Level 4 — Do Not Travel"},    col:C.red,    warn:{ko:"여행 금지 — 베이루트 노선 중단",en:"Do not travel — Beirut routes suspended"}},
  {c:{ko:"예멘",   en:"Yemen"},             l:{ko:"Level 4 — 여행금지",en:"Level 4 — Do Not Travel"},    col:C.red,    warn:{ko:"여행 금지 — 상업 항공편 없음",en:"Do not travel — no commercial flights"}},
  {c:{ko:"이란",   en:"Iran"},              l:{ko:"Level 4 — 여행금지",en:"Level 4 — Do Not Travel"},    col:C.red,    warn:{ko:"여행 금지 — 영공 폐쇄",en:"Do not travel — airspace closed"}},
  {c:{ko:"이라크", en:"Iraq"},              l:{ko:"Level 4 — 여행금지",en:"Level 4 — Do Not Travel"},    col:C.red,    warn:{ko:"여행 금지 — 운항 불규칙",en:"Do not travel — irregular operations"}},
  {c:{ko:"UAE",    en:"UAE"},               l:{ko:"Level 2 — 주의",en:"Level 2 — Exercise Caution"},    col:C.yellow, warn:{ko:"두바이·아부다비 운항 중 — 주의 권고",en:"Dubai & Abu Dhabi operating — exercise caution"}},
];
// Ticker uses AI-fetched items when available, falls back to static data
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

function Ticker({lang, items, loading, lastRefresh}){
  const base = items && items.length > 0 ? items : buildStaticTicker(lang);
  const looped = [...base, ...base];
  const timeLabel = lastRefresh
    ? lastRefresh.toLocaleTimeString(lang==="ko"?"ko-KR":"en-US",{hour:"2-digit",minute:"2-digit"})
    : (lang==="ko"?"현재":"now");
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

// ══ API ═══════════════════════════════════════════════════════════════════════
async function callClaude(system, user) {
  const r = await fetch("/api/claude", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:2000,
      system,
      tools:[{type:"web_search_20250305",name:"web_search"}],
      messages:[{role:"user",content:user}]
    }),
  });
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e?.error?.message||`HTTP ${r.status}`);}
  const d=await r.json();
  return (d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
}

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
  const [res,setRes]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);

  const go=useCallback(async()=>{
    const q=num.trim().toUpperCase();
    if(!q) return;
    setLoading(true);setRes(null);setErr(null);
    try{
      const raw=await callClaude(
        `Flight status expert. You MUST respond with ONLY a single JSON object. No prose before or after. Start with { and end with }.
Required fields: flightNumber(string), airline(string), status("정상운항"|"지연"|"취소"|"우회"|"정보없음"), departure({iata,city,scheduled,actual}), arrival({iata,city,scheduled,actual}), middleEastImpact(bool), impactDetail(string), routeRisk("낮음"|"보통"|"높음"), alternativeRoute(string), summary(2 sentences in ${lang==="ko"?"Korean":"English"}), sources(array)`,
        `Search live status of flight ${q} on ${date}. Return ONLY the JSON object.`
      );
      // Extract first { ... } block
      const start=raw.indexOf("{"),end=raw.lastIndexOf("}");
      if(start!==-1&&end>start){
        setRes(JSON.parse(raw.slice(start,end+1)));
      } else {
        setRes({status:"정보없음",flightNumber:q,summary:lang==="ko"?"항공편 정보를 찾지 못했습니다.":"Flight info not found."});
      }
    }catch(e){setErr(e.message);}finally{setLoading(false);}
  },[num,date,lang]);

  const sc=res?(ST[res.status]||ST["정보없음"]):null;
  const ICON={"정상운항":"✅","지연":"⏱","취소":"❌","우회":"🔄","정보없음":"❓"};
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(15,30,80,0.07)",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"11px 15px",borderBottom:`1px solid ${C.border}`,background:C.cardSub}}>
        <span style={{fontSize:17}}>🔍</span>
        <span style={{fontSize:13,fontWeight:800,color:C.text}}>{lang==="ko"?"내 항공편 조회":"My Flight Lookup"}</span>
        <span style={{marginLeft:"auto",fontSize:10,color:C.textMuted}}>{lang==="ko"?"AI 웹검색 기반":"AI web search"}</span>
      </div>
      <div style={{padding:14}}>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          <input value={num} onChange={e=>setNum(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&go()}
            placeholder={lang==="ko"?"항공편명 (예: EK323)":"Flight number (e.g. EK323)"} maxLength={8}
            style={{flex:"1 1 150px",minWidth:0,background:"#fff",border:`1.5px solid ${C.borderMed}`,borderRadius:8,padding:"9px 11px",fontSize:13,color:C.text,fontFamily:"monospace",letterSpacing:"0.1em",outline:"none"}}/>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            style={{flex:"0 0 auto",background:"#fff",border:`1.5px solid ${C.borderMed}`,borderRadius:8,padding:"9px 11px",fontSize:13,color:C.text,outline:"none"}}/>
          <button onClick={go} disabled={loading||!num.trim()}
            style={{padding:"9px 20px",borderRadius:8,fontSize:13,fontWeight:700,background:C.accent,border:"none",color:"#fff",cursor:loading||!num.trim()?"not-allowed":"pointer",opacity:loading||!num.trim()?0.5:1}}>
            {loading?(lang==="ko"?"검색 중…":"Searching…"):(lang==="ko"?"조회":"Search")}
          </button>
        </div>
      </div>
      {loading&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",gap:10,borderTop:`1px solid ${C.border}`}}><div style={{fontSize:24,animation:"spin 2s linear infinite",display:"inline-block"}}>✈️</div><p style={{color:C.textMuted,fontSize:13,margin:0}}>{lang==="ko"?"검색 중…":"Searching…"}</p></div>}
      {err&&!loading&&<div style={{margin:"0 14px 14px",padding:10,borderRadius:8,background:C.redBg,border:`1px solid ${C.redBd}`,color:C.red,fontSize:13}}>⚠️ {err}</div>}
      {res&&!loading&&sc&&(
        <div style={{borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",background:sc.bg,borderBottom:`1px solid ${sc.bd}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>{ICON[res.status]||"❓"}</span>
              <div><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:17,fontWeight:900,color:C.text,fontFamily:"monospace"}}>{res.flightNumber}</span>{res.airline&&<span style={{fontSize:11,color:C.textSub}}>{res.airline}</span>}</div><span style={{fontSize:12,fontWeight:700,color:sc.tx}}>{LABEL[lang].flight[res.status]||res.status}</span></div>
            </div>
            {res.middleEastImpact&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:7,background:C.redBg,border:`1px solid ${C.redBd}`}}><span style={{color:C.red,fontSize:12}}>⚠</span><span style={{color:C.red,fontSize:11,fontWeight:700}}>{lang==="ko"?"중동 영향":"ME Impact"}</span></div>}
          </div>
          {(res.departure||res.arrival)&&(
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 22px",borderBottom:`1px solid ${C.border}`}}>
              {res.departure&&<div style={{flex:1,textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,color:C.text,fontFamily:"monospace"}}>{res.departure.iata||"—"}</div><div style={{fontSize:11,color:C.textMuted}}>{res.departure.city||""}</div></div>}
              <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0,color:C.borderMed}}><div style={{width:22,height:1,background:C.borderMed}}/><span style={{fontSize:15}}>✈</span><div style={{width:22,height:1,background:C.borderMed}}/></div>
              {res.arrival&&<div style={{flex:1,textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,color:C.text,fontFamily:"monospace"}}>{res.arrival.iata||"—"}</div><div style={{fontSize:11,color:C.textMuted}}>{res.arrival.city||""}</div></div>}
            </div>
          )}
          <div style={{padding:"10px 14px 14px",display:"flex",flexDirection:"column",gap:7}}>
            {res.summary&&<p style={{fontSize:13,color:C.textSub,lineHeight:1.6,margin:0}}>{res.summary}</p>}
            {res.impactDetail&&<div style={{display:"flex",gap:7,padding:9,borderRadius:7,background:C.redBg,border:`1px solid ${C.redBd}`}}><span style={{color:C.red,flexShrink:0}}>⚡</span><p style={{fontSize:12,color:C.red,lineHeight:1.5,margin:0}}>{res.impactDetail}</p></div>}
            {res.alternativeRoute&&<div style={{display:"flex",gap:7,padding:9,borderRadius:7,background:C.accentLight,border:`1px solid ${C.borderMed}`}}><span style={{color:C.accent,flexShrink:0}}>🔄</span><p style={{fontSize:12,color:C.accent,lineHeight:1.5,margin:0}}>{res.alternativeRoute}</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ══ REFUND POLICY ═════════════════════════════════════════════════════════════
const REFUND_AIRLINES=[
  {code:"EK", name:"Emirates",           flag:"🇦🇪"},
  {code:"EY", name:"Etihad Airways",     flag:"🇦🇪"},
  {code:"QR", name:"Qatar Airways",      flag:"🇶🇦"},
  {code:"FZ", name:"flydubai",           flag:"🇦🇪"},
  {code:"GF", name:"Gulf Air",           flag:"🇧🇭"},
  {code:"RJ", name:"Royal Jordanian",    flag:"🇯🇴"},
  {code:"LY", name:"El Al",             flag:"🇮🇱"},
  {code:"ME", name:"Middle East Airlines",flag:"🇱🇧"},
  {code:"IR", name:"Iran Air",           flag:"🇮🇷"},
  {code:"TK", name:"Turkish Airlines",   flag:"🇹🇷"},
  {code:"LH", name:"Lufthansa",          flag:"🇩🇪"},
  {code:"KE", name:"Korean Air",         flag:"🇰🇷"},
  {code:"OZ", name:"Asiana Airlines",    flag:"🇰🇷"},
];

function Refund({lang}){
  const [selected,setSelected]=useState(null);
  const [result,setResult]=useState({});   // {[code]: {loading,data,err,ts}}
  const [customAirline,setCustomAirline]=useState("");

  const fetchPolicy=useCallback(async(code,name)=>{
    setResult(r=>({...r,[code]:{loading:true,data:null,err:null,ts:null}}));
    try{
      const raw=await callClaude(
        `You are an airline refund policy expert. Search the airline's official website and latest news.
YOUR ENTIRE RESPONSE MUST BE VALID JSON OBJECT. Start with { end with }. No markdown, no text outside.
Return this exact structure:
{
  "lastUpdated": "date string",
  "conflictPolicy": "1-2 sentences: special policy due to Middle East conflict/disruptions",
  "eligibility": ["bullet 1","bullet 2","bullet 3"],
  "howToRefund": [{"method":"방법명","steps":["step1","step2"],"url":"official url or null","time":"processing time"}],
  "deadline": "refund request deadline info",
  "voucher": "travel voucher/credit option if available",
  "contact": {"phone":"","email":"","chat":""},
  "tips": "1 key tip for getting refund approved",
  "sources": ["url1"]
}
Write all text in ${lang==="ko"?"Korean":"English"}.`,
        `Search ${name} (${code}) airline refund policy 2025, especially for Middle East conflict-related cancellations and disruptions. What is the current policy and how do passengers get refunds? Official website info preferred.`
      );
      let cleaned=raw.replace(/```json/gi,"").replace(/```/g,"").replace(/^[^{]*(\{)/,"$1").replace(/\}[^}]*$/,"}").trim();
      if(!cleaned.startsWith("{")){const a=raw.indexOf("{"),b=raw.lastIndexOf("}");if(a!==-1&&b>a)cleaned=raw.slice(a,b+1);}
      const data=cleaned.startsWith("{")?JSON.parse(cleaned):null;
      setResult(r=>({...r,[code]:{loading:false,data,err:data?null:(lang==="ko"?"파싱 실패":"Parse failed"),ts:new Date()}}));
    }catch(e){
      setResult(r=>({...r,[code]:{loading:false,data:null,err:e.message,ts:null}}));
    }
  },[lang]);

  const handleSelect=(code,name)=>{
    setSelected(code);
    if(!result[code]?.data&&!result[code]?.loading) fetchPolicy(code,name);
  };

  const handleCustom=useCallback(()=>{
    const name=customAirline.trim();
    if(!name) return;
    const code="CUSTOM_"+name.toUpperCase().slice(0,4);
    setSelected(code);
    if(!result[code]?.data&&!result[code]?.loading) fetchPolicy(code,name);
  },[customAirline,result,fetchPolicy]);

  const sel=selected?result[selected]:null;
  const selAirline=REFUND_AIRLINES.find(a=>a.code===selected)||
    (selected?.startsWith("CUSTOM_")?{code:selected,name:customAirline,flag:"✈️"}:null);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Intro banner */}
      <div style={{background:C.accentLight,border:`1px solid ${C.borderMed}`,borderRadius:12,padding:"11px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
        <span style={{fontSize:16,flexShrink:0}}>ℹ️</span>
        <p style={{fontSize:12,color:C.textSub,margin:0,lineHeight:1.6}}>
          {lang==="ko"
            ?"항공사를 선택하면 AI가 최신 환불정책과 신청 방법을 실시간으로 검색합니다. 중동 분쟁 관련 특별 환불 조항도 포함해요."
            :"Select an airline to let AI search their latest refund policy and how to apply. Includes special provisions for Middle East conflict-related disruptions."}
        </p>
      </div>

      {/* Airline selector grid */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14,boxShadow:"0 2px 8px rgba(15,30,80,0.06)"}}>
        <p style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",margin:"0 0 10px"}}>
          {lang==="ko"?"항공사 선택":"Select Airline"}
        </p>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {REFUND_AIRLINES.map(a=>{
            const active=selected===a.code;
            const isLoading=result[a.code]?.loading;
            const hasData=!!result[a.code]?.data;
            return(
              <button key={a.code} onClick={()=>handleSelect(a.code,a.name)}
                style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:10,fontSize:12,fontWeight:700,
                  background:active?C.accent:hasData?"#F0FDF4":"#fff",
                  border:`1.5px solid ${active?C.accent:hasData?C.green:C.border}`,
                  color:active?"#fff":hasData?C.green:C.textSub,
                  cursor:"pointer",transition:"all 0.15s"}}>
                <span>{a.flag}</span>
                <span style={{fontFamily:"monospace",fontSize:10,opacity:0.7}}>{a.code}</span>
                <span>{a.name}</span>
                {isLoading&&<span style={{display:"inline-block",animation:"spin 0.8s linear infinite",fontSize:10}}>⟳</span>}
                {hasData&&!active&&<span style={{fontSize:9,color:C.green}}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Custom airline input */}
        <div style={{display:"flex",gap:8,marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
          <input value={customAirline} onChange={e=>setCustomAirline(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleCustom()}
            placeholder={lang==="ko"?"다른 항공사 직접 입력 (예: Air France)":"Other airline (e.g. Air France)"}
            style={{flex:1,background:"#fff",border:`1.5px solid ${C.borderMed}`,borderRadius:8,padding:"7px 11px",fontSize:12,color:C.text,outline:"none"}}/>
          <button onClick={handleCustom} disabled={!customAirline.trim()}
            style={{padding:"7px 16px",borderRadius:8,fontSize:12,fontWeight:700,background:C.accent,border:"none",color:"#fff",cursor:customAirline.trim()?"pointer":"not-allowed",opacity:customAirline.trim()?1:0.5}}>
            {lang==="ko"?"검색":"Search"}
          </button>
        </div>
      </div>

      {/* Result panel */}
      {selected&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(15,30,80,0.07)"}}>
          {/* Result header */}
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:C.cardSub,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:22}}>{selAirline?.flag||"✈️"}</span>
              <div>
                <div style={{fontSize:14,fontWeight:900,color:C.text}}>{selAirline?.name||selected}</div>
                <div style={{fontSize:10,color:C.textMuted}}>{lang==="ko"?"환불정책 · AI 웹검색":"Refund Policy · AI web search"}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {sel?.ts&&<span style={{fontSize:10,color:C.textMuted,fontFamily:"monospace"}}>{sel.ts.toLocaleTimeString(lang==="ko"?"ko-KR":"en-US")}</span>}
              <button onClick={()=>fetchPolicy(selected,selAirline?.name||selected)}
                disabled={sel?.loading}
                style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:8,fontSize:11,fontWeight:700,background:C.accent,border:"none",color:"#fff",cursor:sel?.loading?"not-allowed":"pointer",opacity:sel?.loading?0.6:1}}>
                <span style={sel?.loading?{display:"inline-block",animation:"spin 1s linear infinite"}:{}}>{sel?.loading?"⟳":"⟳"}</span>
                {lang==="ko"?"새로고침":"Refresh"}
              </button>
            </div>
          </div>

          {/* Loading */}
          {sel?.loading&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 20px",gap:12}}>
              <div style={{fontSize:30,animation:"spin 2s linear infinite",display:"inline-block"}}>🔍</div>
              <p style={{color:C.textMuted,fontSize:13,margin:0,textAlign:"center"}}>
                {lang==="ko"
                  ?`${selAirline?.name} 공식 홈페이지 및 최신 뉴스 검색 중…`
                  :`Searching ${selAirline?.name} official site and latest news…`}
              </p>
            </div>
          )}

          {/* Error */}
          {sel?.err&&!sel?.loading&&(
            <div style={{margin:14,padding:12,borderRadius:10,background:C.redBg,border:`1px solid ${C.redBd}`,color:C.red,fontSize:13}}>⚠️ {sel.err}</div>
          )}

          {/* Data */}
          {sel?.data&&!sel?.loading&&(()=>{
            const d=sel.data;
            return(
              <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}}>

                {/* Conflict special policy — highlighted */}
                {d.conflictPolicy&&(
                  <div style={{display:"flex",gap:10,padding:"11px 14px",borderRadius:10,background:"#FFF7ED",border:`1.5px solid ${C.orgBd}`}}>
                    <span style={{fontSize:18,flexShrink:0}}>🚨</span>
                    <div>
                      <p style={{fontSize:11,fontWeight:800,color:C.orange,margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                        {lang==="ko"?"중동 분쟁 특별 환불 조항":"Middle East Conflict — Special Policy"}
                      </p>
                      <p style={{fontSize:13,color:C.textSub,margin:0,lineHeight:1.65}}>{d.conflictPolicy}</p>
                    </div>
                  </div>
                )}

                {/* Two columns: eligibility + deadline/voucher */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {d.eligibility?.length>0&&(
                    <div style={{background:C.cardSub,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
                      <p style={{fontSize:11,fontWeight:800,color:C.text,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                        {lang==="ko"?"환불 대상 조건":"Eligibility"}
                      </p>
                      {d.eligibility.map((e,i)=>(
                        <div key={i} style={{display:"flex",gap:7,marginBottom:6,fontSize:12,color:C.textSub,lineHeight:1.55}}>
                          <span style={{color:C.green,flexShrink:0,fontWeight:700}}>✓</span>{e}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {d.deadline&&(
                      <div style={{background:C.yelBg,border:`1px solid ${C.yelBd}`,borderRadius:10,padding:12}}>
                        <p style={{fontSize:11,fontWeight:800,color:C.yellow,margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"0.06em"}}>⏰ {lang==="ko"?"신청 기한":"Deadline"}</p>
                        <p style={{fontSize:12,color:C.textSub,margin:0,lineHeight:1.55}}>{d.deadline}</p>
                      </div>
                    )}
                    {d.voucher&&(
                      <div style={{background:C.purBg,border:`1px solid ${C.purBd}`,borderRadius:10,padding:12}}>
                        <p style={{fontSize:11,fontWeight:800,color:C.purple,margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"0.06em"}}>🎫 {lang==="ko"?"바우처/크레딧":"Voucher / Credit"}</p>
                        <p style={{fontSize:12,color:C.textSub,margin:0,lineHeight:1.55}}>{d.voucher}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* How to refund — step by step */}
                {d.howToRefund?.length>0&&(
                  <div>
                    <p style={{fontSize:11,fontWeight:800,color:C.text,margin:"0 0 10px",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                      📋 {lang==="ko"?"환불 신청 방법":"How to Request a Refund"}
                    </p>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {d.howToRefund.map((m,i)=>(
                        <div key={i} style={{background:C.cardSub,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                            <div style={{display:"flex",alignItems:"center",gap:7}}>
                              <span style={{width:22,height:22,borderRadius:"50%",background:C.accent,color:"#fff",fontSize:11,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span>
                              <span style={{fontSize:13,fontWeight:800,color:C.text}}>{m.method}</span>
                            </div>
                            {m.time&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:C.accentLight,color:C.accent,fontWeight:700}}>⏱ {m.time}</span>}
                          </div>
                          {m.steps?.length>0&&(
                            <ol style={{margin:"0 0 8px 20px",padding:0}}>
                              {m.steps.map((s,j)=>(
                                <li key={j} style={{fontSize:12,color:C.textSub,lineHeight:1.6,marginBottom:3}}>{s}</li>
                              ))}
                            </ol>
                          )}
                          {m.url&&<a href={m.url} target="_blank" rel="noreferrer"
                            style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,color:C.accent,fontFamily:"monospace",wordBreak:"break-all"}}>
                            🔗 {m.url}
                          </a>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact */}
                {d.contact&&(d.contact.phone||d.contact.email||d.contact.chat)&&(
                  <div style={{background:C.cardSub,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
                    <p style={{fontSize:11,fontWeight:800,color:C.text,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                      📞 {lang==="ko"?"고객센터 연락처":"Contact"}
                    </p>
                    <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                      {d.contact.phone&&<span style={{fontSize:12,color:C.textSub}}>📞 {d.contact.phone}</span>}
                      {d.contact.email&&<span style={{fontSize:12,color:C.textSub}}>✉️ {d.contact.email}</span>}
                      {d.contact.chat&&<span style={{fontSize:12,color:C.textSub}}>💬 {d.contact.chat}</span>}
                    </div>
                  </div>
                )}

                {/* Pro tip */}
                {d.tips&&(
                  <div style={{display:"flex",gap:10,padding:"10px 13px",borderRadius:10,background:C.grnBg,border:`1px solid ${C.grnBd}`}}>
                    <span style={{fontSize:16,flexShrink:0}}>💡</span>
                    <p style={{fontSize:12,color:"#166534",margin:0,lineHeight:1.6,fontWeight:600}}>{d.tips}</p>
                  </div>
                )}

                {/* Source */}
                {d.sources?.length>0&&(
                  <p style={{fontSize:10,color:C.textMuted,margin:0}}>
                    {lang==="ko"?"출처":"Sources"}: {d.sources.join(" · ")}
                  </p>
                )}
                {d.lastUpdated&&(
                  <p style={{fontSize:10,color:C.textMuted,margin:0}}>
                    {lang==="ko"?"정책 업데이트":"Policy updated"}: {d.lastUpdated}
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Empty state */}
      {!selected&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"40px 20px",textAlign:"center",boxShadow:"0 2px 8px rgba(15,30,80,0.05)"}}>
          <div style={{fontSize:40,marginBottom:10,opacity:0.15}}>💳</div>
          <p style={{color:C.textSub,fontSize:13,margin:"0 0 6px",fontWeight:600}}>
            {lang==="ko"?"위에서 항공사를 선택하세요":"Select an airline above"}
          </p>
          <p style={{color:C.textMuted,fontSize:11,margin:0}}>
            {lang==="ko"?"AI가 공식 홈페이지에서 최신 환불정책을 검색합니다":"AI will search the official website for the latest refund policy"}
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
  const [advice,setAdvice]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);

  // Trip.com deep links — lang-aware affiliate
  const tripLink=(f,t,d)=>{
    const dd=d?d.replace(/-/g,""):"";
    const base=lang==="ko"
      ?`https://3ha.in/r/387804`
      :`https://3ha.in/r/387805`;
    // Append search params that Trip.com accepts
    return `${base}#search/flight/${f}-${t}/${dd}/1/0/0/Economy`;
  };

  // Skyscanner deep link
  const skyLink=(f,t,d)=>{
    const dd=d?d.replace(/-/g,"").slice(2):"";
    return `https://www.skyscanner.net/transport/flights/${f.toLowerCase()}/${t.toLowerCase()}/${dd}/?adultsv2=1&cabinclass=economy`;
  };

  const search=useCallback(async()=>{
    const f=from.trim().toUpperCase(),t=to.trim().toUpperCase();
    if(!f||!t) return;
    setLoading(true);setErr(null);setAdvice(null);
    try{
      const raw=await callClaude(
        `Aviation routing expert. Respond ONLY with a valid JSON object. No markdown, no text outside {}.
{
  "safe": ["경유지1 (항공사)","경유지2 (항공사)"],
  "avoid": ["위험/제한 경유지"],
  "bestAirline": "항공사명",
  "reason": "한 문장: 왜 이 경유지/항공사가 현재 가장 안전한지",
  "warning": "현재 주의사항 한 문장 또는 null"
}
Write all text in ${lang==="ko"?"Korean":"English"}.`,
        `What are the safest routing options from ${f} to ${t} on ${date} right now, avoiding Middle East conflict zones (Iran, Iraq, Israel, Yemen, Lebanon airspace)? Which airlines and layover cities are operating safely?`
      );
      let c=raw.replace(/```json/gi,"").replace(/```/g,"").replace(/^[^{]*({)/,"$1").replace(/}[^}]*$/,"}").trim();
      if(!c.startsWith("{")){ const a=raw.indexOf("{"),b=raw.lastIndexOf("}"); if(a!==-1&&b>a)c=raw.slice(a,b+1); }
      if(c.startsWith("{")) setAdvice(JSON.parse(c));
      else setErr(lang==="ko"?"응답 파싱 실패. 다시 시도해주세요.":"Parse error, please retry.");
    }catch(e){setErr(e.message);}
    finally{setLoading(false);}
  },[from,to,date,lang]);

  const canSearch=from.trim().length===3&&to.trim().length===3;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>

      {/* Info banner */}
      <div style={{background:C.accentLight,border:`1px solid ${C.borderMed}`,borderRadius:12,padding:"10px 14px",display:"flex",gap:9,alignItems:"flex-start"}}>
        <span style={{fontSize:15,flexShrink:0}}>💡</span>
        <p style={{fontSize:12,color:C.textSub,margin:0,lineHeight:1.6}}>
          {lang==="ko"
            ?"출발지·도착지를 입력하면 AI가 현재 영공 상황에 맞는 안전 경유지와 항공사를 추천해드려요. 예약은 Trip.com 또는 Skyscanner에서 실시간으로 확인하세요."
            :"Enter origin & destination — AI advises the safest routing given current airspace restrictions. Book live on Trip.com or Skyscanner."}
        </p>
      </div>

      {/* Search inputs */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14,boxShadow:"0 2px 8px rgba(15,30,80,0.06)"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:"1 1 70px",minWidth:64}}>
            <label style={{fontSize:10,color:C.textMuted,fontWeight:700,display:"block",marginBottom:4}}>{lang==="ko"?"출발 (IATA)":"From"}</label>
            <input value={from} onChange={e=>setFrom(e.target.value.toUpperCase().slice(0,3))} placeholder="ICN" maxLength={3}
              style={{width:"100%",background:"#fff",border:`1.5px solid ${from.length===3?C.accent:C.borderMed}`,borderRadius:8,padding:"9px 8px",fontSize:18,fontWeight:900,color:C.text,fontFamily:"monospace",textAlign:"center",outline:"none",transition:"border 0.15s"}}/>
          </div>
          <div style={{flexShrink:0,paddingBottom:8,color:C.textMuted,fontSize:18}}>→</div>
          <div style={{flex:"1 1 70px",minWidth:64}}>
            <label style={{fontSize:10,color:C.textMuted,fontWeight:700,display:"block",marginBottom:4}}>{lang==="ko"?"도착 (IATA)":"To"}</label>
            <input value={to} onChange={e=>setTo(e.target.value.toUpperCase().slice(0,3))} placeholder="DXB" maxLength={3}
              style={{width:"100%",background:"#fff",border:`1.5px solid ${to.length===3?C.accent:C.borderMed}`,borderRadius:8,padding:"9px 8px",fontSize:18,fontWeight:900,color:C.text,fontFamily:"monospace",textAlign:"center",outline:"none",transition:"border 0.15s"}}/>
          </div>
          <div style={{flex:"1 1 130px"}}>
            <label style={{fontSize:10,color:C.textMuted,fontWeight:700,display:"block",marginBottom:4}}>{lang==="ko"?"날짜":"Date"}</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={{width:"100%",background:"#fff",border:`1.5px solid ${C.borderMed}`,borderRadius:8,padding:"9px 8px",fontSize:13,color:C.text,outline:"none"}}/>
          </div>
          <button onClick={search} disabled={loading||!canSearch}
            style={{flexShrink:0,padding:"9px 18px",borderRadius:9,fontSize:13,fontWeight:700,background:C.accent,border:"none",color:"#fff",cursor:(loading||!canSearch)?"not-allowed":"pointer",opacity:(loading||!canSearch)?0.45:1,display:"flex",alignItems:"center",gap:6}}>
            <span style={loading?{display:"inline-block",animation:"spin 0.8s linear infinite"}:{}}>{loading?"⟳":"✨"}</span>
            {loading?(lang==="ko"?"분석 중…":"Analyzing…"):(lang==="ko"?"AI 조언":"AI Advice")}
          </button>
        </div>
        <p style={{fontSize:10,color:C.textMuted,margin:"7px 0 0"}}>
          {lang==="ko"
            ?"IATA: ICN=인천 NRT=도쿄 VIE=빈 DXB=두바이 AUH=아부다비 DOH=도하 IST=이스탄불 LHR=런던 CDG=파리"
            :"IATA: ICN=Incheon NRT=Tokyo VIE=Vienna DXB=Dubai AUH=AbuDhabi DOH=Doha IST=Istanbul LHR=London"}
        </p>
      </div>

      {/* AI Advice result */}
      {loading&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"36px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          <div style={{fontSize:28,animation:"spin 2s linear infinite",display:"inline-block"}}>🔍</div>
          <p style={{color:C.textMuted,fontSize:13,margin:0}}>{lang==="ko"?"영공 상황 분석 중…":"Analyzing current airspace…"}</p>
        </div>
      )}
      {err&&!loading&&<div style={{padding:10,borderRadius:9,background:C.redBg,border:`1px solid ${C.redBd}`,color:C.red,fontSize:12}}>⚠️ {err}</div>}

      {advice&&!loading&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(15,30,80,0.07)"}}>
          {/* Header */}
          <div style={{padding:"11px 15px",borderBottom:`1px solid ${C.border}`,background:C.cardSub,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>✨</span>
              <span style={{fontSize:13,fontWeight:900,color:C.text}}>{from} → {to}</span>
              <span style={{fontSize:11,color:C.textMuted}}>{lang==="ko"?"AI 영공 안전 분석":"AI Airspace Analysis"}</span>
            </div>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:C.grnBg,border:`1px solid ${C.grnBd}`,color:C.green,fontWeight:700}}>
              {lang==="ko"?"실시간":"Live"}
            </span>
          </div>

          <div style={{padding:"13px 15px",display:"flex",flexDirection:"column",gap:10}}>
            {/* Safe + Avoid row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              {advice.safe?.length>0&&(
                <div style={{padding:"9px 12px",borderRadius:10,background:C.grnBg,border:`1px solid ${C.grnBd}`}}>
                  <p style={{fontSize:10,fontWeight:800,color:C.green,margin:"0 0 6px",textTransform:"uppercase",letterSpacing:"0.06em"}}>✓ {lang==="ko"?"안전 경유지":"Safe Layovers"}</p>
                  {advice.safe.map((s,i)=><p key={i} style={{fontSize:12,color:"#166534",margin:"0 0 3px",fontWeight:600,lineHeight:1.4}}>{s}</p>)}
                </div>
              )}
              {advice.avoid?.length>0&&(
                <div style={{padding:"9px 12px",borderRadius:10,background:C.redBg,border:`1px solid ${C.redBd}`}}>
                  <p style={{fontSize:10,fontWeight:800,color:C.red,margin:"0 0 6px",textTransform:"uppercase",letterSpacing:"0.06em"}}>✗ {lang==="ko"?"회피 경유지":"Avoid"}</p>
                  {advice.avoid.map((s,i)=><p key={i} style={{fontSize:12,color:C.red,margin:"0 0 3px",fontWeight:600,lineHeight:1.4}}>{s}</p>)}
                </div>
              )}
            </div>

            {/* Best airline + reason */}
            {advice.bestAirline&&(
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:C.accentLight,border:`1px solid ${C.borderMed}`}}>
                <span style={{fontSize:20,flexShrink:0}}>✈️</span>
                <div>
                  <p style={{fontSize:10,fontWeight:800,color:C.accent,margin:"0 0 2px",textTransform:"uppercase",letterSpacing:"0.06em"}}>{lang==="ko"?"추천 항공사":"Best Airline"}</p>
                  <p style={{fontSize:13,fontWeight:900,color:C.text,margin:"0 0 2px"}}>{advice.bestAirline}</p>
                  {advice.reason&&<p style={{fontSize:11,color:C.textSub,margin:0,lineHeight:1.5}}>{advice.reason}</p>}
                </div>
              </div>
            )}

            {/* Warning */}
            {advice.warning&&advice.warning!=="null"&&(
              <div style={{display:"flex",gap:8,padding:"8px 12px",borderRadius:10,background:C.yelBg,border:`1px solid ${C.yelBd}`}}>
                <span style={{fontSize:14,flexShrink:0}}>⚠️</span>
                <p style={{fontSize:12,color:"#713F12",margin:0,lineHeight:1.55}}>{advice.warning}</p>
              </div>
            )}

            {/* Booking buttons */}
            <div style={{paddingTop:4,borderTop:`1px solid ${C.border}`}}>
              <p style={{fontSize:10,color:C.textMuted,margin:"0 0 8px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                {lang==="ko"?"실시간 항공권 검색":"Book Live"}
              </p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {/* Trip.com — primary, affiliate */}
                <a href={tripLink(from,to,date)} target="_blank" rel="noopener noreferrer"
                  style={{flex:"1 1 140px",display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"11px 16px",borderRadius:10,background:"linear-gradient(135deg,#1A56DB,#0E3FA8)",color:"#fff",textDecoration:"none",fontWeight:800,fontSize:13,boxShadow:"0 3px 12px rgba(26,86,219,0.3)"}}>
                  ✈ Trip.com {lang==="ko"?"에서 예약":"— Book Now"} ↗
                </a>
                {/* Skyscanner — secondary */}
                <a href={skyLink(from,to,date)} target="_blank" rel="noopener noreferrer"
                  style={{flex:"1 1 120px",display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"11px 16px",borderRadius:10,background:"#0770E3",color:"#fff",textDecoration:"none",fontWeight:700,fontSize:13}}>
                  🔍 Skyscanner ↗
                </a>
              </div>
              <p style={{fontSize:9,color:C.textMuted,margin:"7px 0 0"}}>
                {lang==="ko"?"* AI 조언은 참고용입니다. 실제 좌석·가격은 예약 사이트에서 확인하세요.":"* AI advice is for reference. Verify seats & prices on booking sites."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading&&!advice&&!err&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"36px 20px",textAlign:"center",boxShadow:"0 1px 6px rgba(15,30,80,0.05)"}}>
          <div style={{fontSize:38,marginBottom:10,opacity:0.1}}>🔄</div>
          <p style={{color:C.textSub,fontSize:13,margin:"0 0 5px",fontWeight:600}}>
            {lang==="ko"?"출발지·도착지 3자리 IATA 코드를 입력하세요":"Enter 3-letter IATA codes for origin & destination"}
          </p>
          <p style={{color:C.textMuted,fontSize:11,margin:0}}>
            {lang==="ko"?"예: ICN → DXB, NRT → VIE, SEL → LHR":"e.g. ICN → DXB, NRT → VIE, SEL → LHR"}
          </p>
        </div>
      )}
    </div>
  );
}

// ══ NEWS ══════════════════════════════════════════════════════════════════════
function News({lang, refreshKey}){
  const [news,setNews]=useState([]);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);
  const [ts,setTs]=useState(null);

  const fetch_=useCallback(async()=>{
    setLoading(true);setErr(null);
    try{
      const raw=await callClaude(
        `You are a real-time aviation disruption monitor. Do 3 focused searches in this exact order, then return JSON.

SEARCH ORDER:
1. Airline official newsrooms FIRST — fetch latest announcements from:
   etihad.com/en/news  |  emirates.com/english/about-emirates/news  |  qatarairways.com/en/press-releases  |  turkishairlines.com/en-int/press-room  |  koreanair.com/us/en/about/newsroom
2. Wire services: Reuters, AP, Yonhap — "Middle East flight" past 6h
3. Aviation specialists: avherald.com, flightradar24.com/blog, Al Jazeera aviation news

RECENCY RULE: sort newest first. Airline official statement from 1h ago beats Reuters from 10h ago.
MUST INCLUDE: Any airline resume/suspend/reroute announcements from the past 24h.
Only include items published within 24h. Mark fresh:true if within 3h.

YOUR ENTIRE RESPONSE MUST BE VALID JSON array. Start [ end ]. No markdown, nothing outside.
Return 6 items newest-first:
[{"icon":"emoji","tag":"≤8 chars","severity":"high|medium|low","time":"Xmin ago|Xh ago","content":"2 sentences","source":"outlet","fresh":true/false}]
Write content in ${lang==="ko"?"Korean":"English"}.`,
        `Search RIGHT NOW: (1) Check etihad.com/news, emirates.com/news, qatarairways.com/press, turkishairlines.com/pressroom, koreanair.com/newsroom for latest official flight updates. (2) Reuters/AP/Yonhap for Middle East airspace news past 6h. (3) AviationHerald/Flightradar24 for diversions/closures. Return 6 newest items as JSON only.`
      );
      let cleaned=raw
        .replace(/```json/gi,"").replace(/```/g,"")
        .replace(/^[^[]*(\[)/,"$1")
        .replace(/\][^\]]*$/,"]")
        .trim();
      if(!cleaned.startsWith("[")){
        const a=raw.indexOf("["),b=raw.lastIndexOf("]");
        if(a!==-1&&b>a) cleaned=raw.slice(a,b+1);
      }
      if(cleaned.startsWith("[")){
        setNews(JSON.parse(cleaned));
        setTs(new Date());
      } else {
        setErr(lang==="ko"?"파싱 실패. 다시 시도하세요.":"Parse failed. Please retry.");
      }
    }catch(e){setErr(e.message);}finally{setLoading(false);}
  },[lang]);

  // Only fetch on explicit refresh, NOT on mount
  useEffect(()=>{ if(refreshKey>0) fetch_(); },[refreshKey]);

  const SEV={
    high:   {bg:C.redBg,  color:C.red},
    medium: {bg:C.yelBg,  color:C.yellow},
    low:    {bg:"#F1F5F9",color:"#64748B"},
  };
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(15,30,80,0.07)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>📡</span><span style={{fontSize:13,fontWeight:800,color:C.text}}>{lang==="ko"?"AI 실시간 뉴스":"AI Live News"}</span></div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          {ts&&<span style={{fontSize:10,color:C.textMuted,fontFamily:"monospace"}}>{ts.toLocaleTimeString(lang==="ko"?"ko-KR":"en-US")}</span>}
          <button onClick={fetch_} disabled={loading}
            style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:8,fontSize:12,fontWeight:700,background:C.accent,border:"none",color:"#fff",cursor:loading?"not-allowed":"pointer",opacity:loading?0.6:1}}>
            <span style={loading?{display:"inline-block",animation:"spin 1s linear infinite"}:{}}>{loading?"⟳":"⟳"}</span>
            {loading?(lang==="ko"?"분석 중…":"Analyzing…"):(lang==="ko"?"업데이트":"Update")}
          </button>
        </div>
      </div>
      <div style={{padding:"5px 14px",background:C.cardSub,borderBottom:`1px solid ${C.border}`}}>
        <p style={{fontSize:10,color:C.textMuted,margin:0}}>🕐 {lang==="ko"?"최근 6시간 뉴스 우선 · 전체 언론사 검색":"Past 6 hours first · all outlets"}</p>
      </div>
      <div style={{padding:12,minHeight:160}}>
        {loading&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:140,gap:9}}><div style={{fontSize:24}}>🔍</div><p style={{color:C.textMuted,fontSize:13,margin:0}}>{lang==="ko"?"검색 중…":"Searching…"}</p></div>}
        {err&&!loading&&<div style={{padding:10,borderRadius:8,background:C.redBg,border:`1px solid ${C.redBd}`,color:C.red,fontSize:13}}>⚠️ {err}</div>}
        {!loading&&!err&&news.length===0&&<p style={{color:C.textMuted,fontSize:13,textAlign:"center",padding:"24px 0"}}>{lang==="ko"?"업데이트 버튼을 눌러 최신 뉴스를 불러오세요":"Click Update to load latest news"}</p>}
        {!loading&&news.map((item,i)=>(
          <div key={i} style={{display:"flex",gap:9,padding:9,borderRadius:8,background:item.fresh?C.grnBg:C.cardSub,border:`1px solid ${item.fresh?C.grnBd:C.border}`,marginBottom:7}}>
            <div style={{flexShrink:0,width:28,height:28,borderRadius:"50%",background:item.fresh?C.grnBd:C.accentLight,border:`1px solid ${item.fresh?C.green:C.borderMed}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{item.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontSize:10,fontWeight:700,padding:"1px 5px",borderRadius:4,...(SEV[item.severity]||SEV.low)}}>{item.tag}</span>
                {item.fresh&&<span style={{fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:99,background:C.green,color:"#fff"}}>NEW</span>}
                {item.source&&<span style={{fontSize:10,color:C.accent,fontWeight:600}}>{item.source}</span>}
                <span style={{fontSize:10,color:item.fresh?C.green:C.textMuted,fontWeight:item.fresh?700:400}}>{item.time}</span>
              </div>
              <p style={{fontSize:12,color:C.textSub,lineHeight:1.55,margin:0}}>{item.content}</p>
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
  const [refreshKey,setRefreshKey]=useState(0);
  const [refreshing,setRefreshing]=useState(false);
  const [lastRefresh,setLastRefresh]=useState(null);
  const [tickerItems,setTickerItems]=useState([]);
  const [tickerLoading,setTickerLoading]=useState(false);

  // Live data — overrides static defaults after refresh
  const [liveAirlines,setLiveAirlines]=useState(null);
  const [liveAirspace,setLiveAirspace]=useState(null);
  const [liveAirports,setLiveAirports]=useState(null);

  // Fetch live airline/airspace/airport status from AI
  const fetchLiveData=useCallback(async(currentLang)=>{
    try{
      const raw=await callClaude(
        `You are a real-time Middle East aviation status monitor. Search airline newsrooms and aviation authorities NOW.

SEARCH: etihad.com/news, emirates.com/news, qatarairways.com/press, flydubai.com/news, Reuters, AP, NOTAM databases

YOUR ENTIRE RESPONSE MUST BE A VALID JSON OBJECT. Start with { end with }. No markdown, nothing outside.
Return this exact shape:
{
  "airlines": [
    {"code":"EK","status":"운항중|주의|제한|중단|우회","note":{"ko":"한국어 현황","en":"English status"}}
  ],
  "airspace": [
    {"countryKo":"이란","countryEn":"Iran","status":"정상|주의|제한|폐쇄","note":{"ko":"한국어","en":"English"}}
  ],
  "airports": [
    {"iata":"DXB","status":"운항중|제한|중단|주의","detail":{"ko":"한국어 상세","en":"English detail"},"date":"YYYY-MM-DD"}
  ]
}
Update ONLY the statuses you found evidence for. Keep existing values for others.
Airlines to check: EK, EY, FZ, QR, WY, SV, GF, RJ, ME, IR, LY
Airports to check: DXB, AUH, DOH, TLV, BEY, IKA
Airspace to check: Iran, Iraq, Israel, Lebanon, Yemen, UAE, Qatar, Saudi Arabia, Jordan, Kuwait`,
        `Search NOW for the latest Middle East aviation status: (1) Check airline official sites for EK/EY/FZ/QR resume or suspend announcements today. (2) Check NOTAM/airspace authorities for UAE, Iran, Israel, Iraq closures. (3) Return full JSON object only.`
      );
      let c=raw.replace(/```json/gi,"").replace(/```/g,"").replace(/^[^{]*({)/,"$1").replace(/}[^}]*$/,"}").trim();
      if(!c.startsWith("{")){ const a=raw.indexOf("{"),b=raw.lastIndexOf("}"); if(a!==-1&&b>a) c=raw.slice(a,b+1); }
      if(c.startsWith("{")){
        const d=JSON.parse(c);
        // Merge AI updates into static data
        if(d.airlines?.length){
          setLiveAirlines(AIRLINES.map(a=>{
            const upd=d.airlines.find(x=>x.code===a.code);
            return upd?{...a,status:upd.status,note:upd.note}:a;
          }));
        }
        if(d.airspace?.length){
          setLiveAirspace(AIRSPACE.map(a=>{
            const upd=d.airspace.find(x=>x.countryEn===a.country.en);
            return upd?{...a,status:upd.status,note:upd.note}:a;
          }));
        }
        if(d.airports?.length){
          setLiveAirports(AIRPORTS.map(a=>{
            const upd=d.airports.find(x=>x.iata===a.iata);
            return upd?{...a,status:upd.status,detail:upd.detail,date:upd.date}:a;
          }));
        }
      }
    }catch(e){/* silently keep static data */}
  },[]);

  const fetchTicker=useCallback(async(currentLang)=>{
    setTickerLoading(true);
    try{
      const raw=await callClaude(
        `You are a real-time aviation news wire. Search airline official newsrooms FIRST, then wire services.

SEARCH ORDER:
1. Official airline announcements (past 24h): etihad.com/en/news | emirates.com/news | qatarairways.com/press-releases | turkishairlines.com/pressroom | koreanair.com/newsroom | flydubai.com/news
2. Wire services: Reuters, AP, Yonhap — "Middle East flight" past 6h

PRIORITY ORDER for ticker placement:
🔴 Official airline resume/suspend/cancel announcements → MUST go first
🟠 Airspace closures/restrictions
🟡 Route changes / diversions
✅ Normal ops / resumptions

YOUR ENTIRE RESPONSE MUST BE VALID JSON array. Start [ end ]. No markdown.
Return exactly 10 short strings in ${currentLang==="ko"?"Korean":"English"}, newest/most important first.
Each under 90 chars, starting with emoji. Official airline news: use 📢 emoji.
Format: ["📢 Etihad: 3월6일부터 제한 운항 재개 — 인천 포함 25개 노선", "⛔ 이란 영공 전면 폐쇄 유지 중", ...]`,
        `Search NOW: (1) etihad.com/news, emirates.com/news, qatarairways.com/press, turkishairlines.com/pressroom, koreanair.com/newsroom for latest official statements. (2) Reuters/AP/Yonhap Middle East aviation news past 6h. Return 10 ticker strings as JSON array only.`
      );
      let cleaned=raw.replace(/```json/gi,"").replace(/```/g,"").replace(/^[^[]*(\[)/,"$1").replace(/\][^\]]*$/,"]").trim();
      if(!cleaned.startsWith("[")){const a=raw.indexOf("["),b=raw.lastIndexOf("]");if(a!==-1&&b>a)cleaned=raw.slice(a,b+1);}
      if(cleaned.startsWith("[")){
        const arr=JSON.parse(cleaned);
        // Put 📢 official airline items first
        const official=arr.filter(s=>String(s).startsWith("📢"));
        const rest=arr.filter(s=>!String(s).startsWith("📢"));
        const sorted=[...official,...rest];
        if(sorted.length>0) setTickerItems(sorted.map(String));
      }
    }catch(e){/* silently fall back to static */}
    finally{setTickerLoading(false);}
  },[]);

  const handleRefresh=useCallback(()=>{
    setRefreshing(true);
    setRefreshKey(k=>k+1);
    setLastRefresh(new Date());
    fetchTicker(lang);
    fetchLiveData(lang);
    setTimeout(()=>setRefreshing(false),4000);
  },[lang,fetchTicker,fetchLiveData]);

  const airlines=liveAirlines||AIRLINES;
  const airspace=liveAirspace||AIRSPACE;
  const airports=liveAirports||AIRPORTS;

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
    <div style={{minHeight:"100vh",background:C.pageBg,color:C.text,fontFamily:"'Noto Sans KR',system-ui,sans-serif"}}>
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
            {/* Refresh button */}
            <button onClick={handleRefresh} disabled={refreshing}
              title={lang==="ko"?"전체 정보 새로고침":"Refresh all data"}
              style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:8,fontSize:12,fontWeight:700,background:refreshing?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.25)",color:"#fff",cursor:refreshing?"not-allowed":"pointer",opacity:refreshing?0.7:1,transition:"all 0.2s",whiteSpace:"nowrap"}}>
              <span style={refreshing?{display:"inline-block",animation:"spin 0.8s linear infinite"}:{display:"inline-block"}}>⟳</span>
              <span style={{fontSize:11}}>{lang==="ko"?"새로고침":"Refresh"}</span>
              {lastRefresh&&(
                <span style={{fontSize:10,color:"rgba(255,255,255,0.55)",fontFamily:"monospace"}}>
                  {lastRefresh.toLocaleTimeString(lang==="ko"?"ko-KR":"en-US",{hour:"2-digit",minute:"2-digit"})}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <Ticker lang={lang} items={tickerItems} loading={tickerLoading} lastRefresh={lastRefresh}/>

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
                  {liveAirlines&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:99,background:C.grnBg,border:`1px solid ${C.grnBd}`,color:C.green,fontWeight:800}}>● LIVE</span>}
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
                  {liveAirspace&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:99,background:C.grnBg,border:`1px solid ${C.grnBd}`,color:C.green,fontWeight:800}}>● LIVE</span>}
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
            <News lang={lang} refreshKey={refreshKey}/>
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
