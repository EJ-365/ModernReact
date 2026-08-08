/* Extracted from app.html — loaded via src/boot.js after Three Vite bridge */
import { loadOsmCbdBuildings } from './render/osm-buildings.js';
import { createCinematic } from './render/cinematic.js';
import {
  buildWeatherZones,
  chunkWeatherZones,
  sampleZoneWeather,
  rainIntensityAt,
  openMeteoMultiUrl,
} from './weather-zones.js';
import {
  fetchNhcStorms,
  fetchSpcTornadoOutlook,
  fetchStormAlerts,
  spcRiskLabel,
  spcRiskAtPoint,
  stormsNearMetro,
  nhcClassLabel,
  nwsStatesForCity,
  distanceMi,
  bearingDeg,
  compassFromBearing,
  clampTowardPoint,
} from './feeds/storm-tracker.js';
import { buildCityHazards } from './cities/hazard-packs.js';
const THREE = window.THREE;
if (!THREE) throw new Error("[HTS] THREE missing — three-bridge must load first");

/* ================================================================
   HOUSTON 3D TRAFFIC SIMULATOR — v2.5
   - True grade-separated interchanges: roads ramp up & over each
     other with smooth vertical profiles, bridge decks, undersides,
     fascia walls and pillars (I-45 stacks 3 levels downtown)
   - Metro map: OSM-aligned freeways/ramps + streamed suburb streets
   - Lakes (Houston, Clear), Addicks & Barker reservoirs, bayous,
     Galveston Bay, forest belts
   - Live Open-Meteo weather · atmospheric sky · cumulus clouds
   ================================================================ */
'use strict';
console.log('%cTraffic Simulator — build v10.16.62 (0803-free-feeds-only). If you do not see this line, an old cached file is running.','color:#7fd6a0;font-weight:bold');
try{localStorage.removeItem('tt_key');localStorage.removeItem('fa_proxy');localStorage.removeItem('houstonSim.boardCache.v1');}catch(_e){}
window.HTS_PAID_APIS_DISABLED=true;
const HTS_PACK=window.HTS_PACK||null;
const HTS_CITY_ID=(window.HTS_CITY&&window.HTS_CITY.id)||'houston';
const HTS_IS_AUS=HTS_CITY_ID==='austin';
const HTS_HAS_PACK=!!(HTS_PACK&&HTS_PACK.useBuiltinRoads===false);
const CITY_NAME=(window.HTS_CITY&&window.HTS_CITY.name)||'Houston';
const METRO_NAME=(HTS_PACK&&HTS_PACK.metroName)||(HTS_IS_AUS?'Greater Austin':(HTS_CITY_ID==='houston'?'Greater Houston':(CITY_NAME+' metro')));
const AREA_NAME=(HTS_PACK&&HTS_PACK.areaName)||(HTS_IS_AUS?'Austin-area':(HTS_CITY_ID==='houston'?'Houston-area':(CITY_NAME+'-area')));
const METRO_LAT=(window.HTS_CITY&&window.HTS_CITY.origin&&window.HTS_CITY.origin.lat)||29.7604;
const METRO_LNG=(window.HTS_CITY&&window.HTS_CITY.origin&&window.HTS_CITY.origin.lng)||-95.3698;
const DEFAULT_APT=(HTS_PACK&&HTS_PACK.boardApts&&HTS_PACK.boardApts[0])||'IAH';
/* Failsafe: never leave the loading screen stuck if a later error occurs.
   Ready can fire before late listeners register (large app-main parse) — use whenHtsReady(). */
let htsReadyFired=false;
const _htsReadyWaiters=[];
function fireHtsReady(){
  if(htsReadyFired)return;
  htsReadyFired=true;
  window.dispatchEvent(new CustomEvent('hts-ready'));
  while(_htsReadyWaiters.length){
    try{_htsReadyWaiters.shift()();}catch(e){console.warn('[HTS] ready waiter',e);}
  }
}
function whenHtsReady(fn){
  if(typeof fn!=='function')return;
  if(htsReadyFired){try{fn();}catch(e){console.warn('[HTS] ready fn',e);}return;}
  _htsReadyWaiters.push(fn);
}
window.whenHtsReady=whenHtsReady;
window.addEventListener('error',(ev)=>{
  console.error('[HTS]',ev.message,ev.filename,ev.lineno);
  try{
    const l=document.getElementById('loading');
    if(l)l.innerHTML='<div class="lsign">Traffic Simulator</div><div class="lsub" style="color:#ff8a7a;letter-spacing:.08em;text-transform:none;max-width:420px;line-height:1.45">Boot error — open DevTools console.<br><span style="color:#aeb7c0;font-size:10px">'+(ev.message||'unknown')+'</span></div>';
  }catch(e){}
});
setTimeout(()=>{
  const l=document.getElementById('loading');
  if(l){l.style.opacity='0';setTimeout(()=>{try{l.remove();}catch(e){} fireHtsReady();},600);}
  else fireHtsReady();
},4500);
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
function fetchWithTimeout(url,opts,ms){
  const ctl=new AbortController();
  const t=setTimeout(()=>ctl.abort(),ms||10000);
  return fetch(url,{...opts,signal:ctl.signal}).finally(()=>clearTimeout(t));
}
const lerp=(a,b,t)=>a+(b-a)*t;
const TAU=Math.PI*2;
const $=id=>document.getElementById(id);
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
/* Use a time-based seed so each load reflects "right now" (not the same spawn each time). */
const rand=rng(((Date.now()/1000)|0) ^ ((Math.random()*0x7fffffff)|0));
const UNITS_PER_MILE=(window.HTS_CORE&&window.HTS_CORE.unitsPerMile)||210;
/* world<->geo — prefers HTS_CORE (city origin) when platform-bridge has loaded */
function geoToWorld(lat,lng){
  if(window.HTS_CORE&&window.HTS_CORE.geoToWorld)return window.HTS_CORE.geoToWorld(lat,lng);
  return {x:(lng+95.3698)*59.9*UNITS_PER_MILE+60, z:-(lat-29.7604)*69*UNITS_PER_MILE+60};
}
function worldToGeo(x,z){
  if(window.HTS_CORE&&window.HTS_CORE.worldToGeo)return window.HTS_CORE.worldToGeo(x,z);
  return {
    lng: ((x-60)/(59.9*UNITS_PER_MILE))-95.3698,
    lat: 29.7604-((z-60)/(69*UNITS_PER_MILE))
  };
}
function packDowntown(){
  if(HTS_PACK&&Number.isFinite(HTS_PACK.originLat)&&Number.isFinite(HTS_PACK.originLng))
    return geoToWorld(HTS_PACK.originLat,HTS_PACK.originLng);
  if(HTS_IS_AUS)return geoToWorld(30.2672,-97.7431);
  return {x:60,z:60};
}
function fmtFlightTime(t){
  return t?new Date(t).toLocaleTimeString('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'}):'—';
}
function icaoToDisp(code){
  if(code==null||code==='')return '—';
  let c=String(code).trim().toUpperCase();
  if(!c||c==='—'||c==='NULL'||c==='UNK'||c==='UNKNOWN')return '—';
  c=c.replace(/^ICAO[:\s-]*/,'').replace(/^IATA[:\s-]*/,'').replace(/[^A-Z0-9]/g,'');
  if(c.length===4&&c[0]==='K'&&/^[A-Z]{4}$/.test(c))return c.slice(1);
  if(/^[A-Z]{3}$/.test(c))return c;
  /* FA sometimes sends ICAO+extra — prefer first Kxxx / xxx token */
  const k4=c.match(/K([A-Z]{3})/);
  if(k4)return k4[1];
  const i3=c.match(/([A-Z]{3})/);
  if(i3&&i3[1]!=='USA'&&i3[1]!=='THE')return i3[1];
  return c.length<=4?c:'—';
}
function extractAptCode(node){
  if(!node)return '—';
  if(typeof node==='string')return icaoToDisp(node);
  return icaoToDisp(
    node.code_iata||node.code_icao||node.iata_code||node.icao_code
    ||node.code||node.airport_code||node.iata||node.icao||''
  );
}
function findBoardRouteForCallsign(f){
  const board=window.HOUSTON_BOARD||[];
  if(!board.length||!f)return null;
  const cs=String(f.csIata||f.cs||'').replace(/\s+/g,'').toUpperCase();
  const reg=String(f.reg||'').replace(/\s+/g,'').toUpperCase();
  if(!cs&&!reg)return null;
  const tail=cs.replace(/^[A-Z]+/,'');
  for(const b of board){
    if(!b)continue;
    const bcs=String(b.csIata||b.cs||'').replace(/\s+/g,'').toUpperCase();
    const breg=String(b.reg||'').replace(/\s+/g,'').toUpperCase();
    const match=(cs&&bcs&&(cs===bcs||(tail&&(bcs.endsWith(tail)||cs.endsWith(bcs.replace(/^[A-Z]+/,''))))))
      ||(reg&&breg&&reg===breg);
    if(!match)continue;
    const dep=icaoToDisp(b.dep),arr=icaoToDisp(b.arr);
    if((dep&&dep!=='—')||(arr&&arr!=='—'))return {dep,arr,src:'board'};
  }
  return null;
}
/** Prefer real IATA codes on cards — fill Houston side / board match; never hide a known code behind … */
function resolveFlightAirports(f){
  let dep=icaoToDisp(f&&f.dep);
  let arr=icaoToDisp(f&&f.arr);
  const br=findBoardRouteForCallsign(f);
  if(br){
    if((!dep||dep==='—')&&br.dep&&br.dep!=='—')dep=br.dep;
    if((!arr||arr==='—')&&br.arr&&br.arr!=='—')arr=br.arr;
  }
  const lat=Number.isFinite(f&&f._lat)?f._lat:(Number.isFinite(f&&f._tLat)?f._tLat:null);
  const lon=Number.isFinite(f&&f._lon)?f._lon:(Number.isFinite(f&&f._tLon)?f._tLon:null);
  const near=Number.isFinite(lat)?nearestHoustonApt(lat,lon):(f&&f.boardApt?icaoToDisp(f.boardApt):DEFAULT_APT);
  if((!dep||dep==='—')&&arr&&arr!=='—'&&!isHoustonApt(arr))dep=near;
  if((!arr||arr==='—')&&dep&&dep!=='—'&&!isHoustonApt(dep))arr=near;
  if(f&&f.boardApt){
    const ba=icaoToDisp(f.boardApt);
    if(f.boardKind==='departures'&&(!dep||dep==='—'))dep=ba;
    if(f.boardKind==='arrivals'&&(!arr||arr==='—'))arr=ba;
  }
  if((!dep||dep==='—')&&(!arr||arr==='—')&&f&&f.kind==='live'&&Number.isFinite(lat)){
    const vs=Number(f.vsFpm)||0;
    if(vs<-250)arr=near;
    else if(vs>250)dep=near;
  }
  const pending=(!dep||dep==='—')||(!arr||arr==='—');
  if(!dep||dep==='—')dep='…';
  if(!arr||arr==='—')arr='…';
  return {dep,arr,pending};
}
const HOU_APT=new Set(
  (HTS_PACK&&HTS_PACK.boardApts&&HTS_PACK.boardApts.length)
    ?HTS_PACK.boardApts
    :['IAH','HOU','EFD','SGR','DWH','IWS','CXO']
);
const APT_DB={
  IAH:{n:'George Bush Intercontinental',c:'Houston'},HOU:{n:'William P. Hobby',c:'Houston'},
  EFD:{n:'Ellington Field',c:'Houston'},SGR:{n:'Sugar Land Regional',c:'Sugar Land'},
  DWH:{n:'David Wayne Hooks',c:'Spring'},IWS:{n:'West Houston',c:'Houston'},CXO:{n:'Conroe North Houston',c:'Conroe'},
  AUS:{n:'Austin-Bergstrom International',c:'Austin'},EDC:{n:'Austin Executive',c:'Austin'},
  LAS:{n:'Harry Reid International',c:'Las Vegas'},DEN:{n:'Denver International',c:'Denver'},
  DFW:{n:'Dallas/Fort Worth International',c:'Dallas'},ATL:{n:'Hartsfield-Jackson Atlanta',c:'Atlanta'},
  LAX:{n:'Los Angeles International',c:'Los Angeles'},ORD:{n:"O'Hare International",c:'Chicago'},
  PHX:{n:'Phoenix Sky Harbor',c:'Phoenix'},MIA:{n:'Miami International',c:'Miami'},
  JFK:{n:'John F. Kennedy International',c:'New York'},SEA:{n:'Seattle-Tacoma International',c:'Seattle'},
  MSY:{n:'Louis Armstrong New Orleans',c:'New Orleans'},AUS:{n:'Austin-Bergstrom',c:'Austin'},
  SAT:{n:'San Antonio International',c:'San Antonio'},MCO:{n:'Orlando International',c:'Orlando'},
  CUN:{n:'Cancún International',c:'Cancún'},MEX:{n:'Mexico City International',c:'Mexico City'},
  SLC:{n:'Salt Lake City International',c:'Salt Lake City'},MSP:{n:'Minneapolis-Saint Paul',c:'Minneapolis'},
  DTW:{n:'Detroit Metropolitan',c:'Detroit'},BNA:{n:'Nashville International',c:'Nashville'},
  STL:{n:'St. Louis Lambert',c:'St. Louis'},CLT:{n:'Charlotte Douglas',c:'Charlotte'},
  IAD:{n:'Washington Dulles',c:'Washington'},DCA:{n:'Reagan National',c:'Washington'},
  EWR:{n:'Newark Liberty',c:'Newark'},LGA:{n:'LaGuardia',c:'New York'},
  BOS:{n:'Logan International',c:'Boston'},PHL:{n:'Philadelphia International',c:'Philadelphia'},
  SAN:{n:'San Diego International',c:'San Diego'},TPA:{n:'Tampa International',c:'Tampa'},
  FLL:{n:'Fort Lauderdale-Hollywood',c:'Fort Lauderdale'},BWI:{n:'Baltimore/Washington',c:'Baltimore'},
  MCI:{n:'Kansas City International',c:'Kansas City'},IND:{n:'Indianapolis International',c:'Indianapolis'},
  ELP:{n:'El Paso International',c:'El Paso'},ABQ:{n:'Albuquerque International',c:'Albuquerque'},
  OKC:{n:'Will Rogers World',c:'Oklahoma City'},TUL:{n:'Tulsa International',c:'Tulsa'},
  MEM:{n:'Memphis International',c:'Memphis'},BHM:{n:'Birmingham-Shuttlesworth',c:'Birmingham'},
  RDU:{n:'Raleigh-Durham',c:'Raleigh'},PIT:{n:'Pittsburgh International',c:'Pittsburgh'},
  CLE:{n:'Cleveland Hopkins',c:'Cleveland'},CMH:{n:'John Glenn Columbus',c:'Columbus'},
  HNL:{n:'Daniel K. Inouye',c:'Honolulu'},SJC:{n:'San Jose International',c:'San Jose'},
  OAK:{n:'Oakland International',c:'Oakland'},SMF:{n:'Sacramento International',c:'Sacramento'},
  PDX:{n:'Portland International',c:'Portland'},ANC:{n:'Ted Stevens Anchorage',c:'Anchorage'},
  BMT:{n:'Jack Brooks Regional',c:'Beaumont'},LCH:{n:'Lake Charles Regional',c:'Lake Charles'},
  CRP:{n:'Corpus Christi International',c:'Corpus Christi'},BRO:{n:'Brownsville South Padre',c:'Brownsville'},
  LRD:{n:'Laredo International',c:'Laredo'},MAF:{n:'Midland International',c:'Midland'},
  AMA:{n:'Rick Husband Amarillo',c:'Amarillo'},LBB:{n:'Lubbock Preston Smith',c:'Lubbock'},
};
const AIRLINE_IATA={SWA:'WN',UAL:'UA',DAL:'DL',AAL:'AA',FFT:'F9',JBU:'B6',NKS:'NK',ASA:'AS',SKW:'OO',ENY:'MQ',RPA:'YX',ASH:'YV'};
const AC_NAMES={
  B738:'Boeing 737-800',B739:'Boeing 737-900',B737:'Boeing 737',B38M:'Boeing 737 MAX 8',B39M:'Boeing 737 MAX 9',
  A320:'Airbus A320',A321:'Airbus A321',A21N:'Airbus A320neo',A20N:'Airbus A320neo',A359:'Airbus A350-900',
  B772:'Boeing 777-200',B77W:'Boeing 777-300ER',B788:'Boeing 787-8',B789:'Boeing 787-9',
  E175:'Embraer E175',E170:'Embraer E170',CRJ9:'Bombardier CRJ-900',CRJ7:'Bombardier CRJ-700',
};
function aptInfo(code){
  const c=String(code||'').trim().toUpperCase();
  if(!c||c==='—'||c==='LOCAL'||c==='UNK')return {n:c==='LOCAL'?'Local pattern':'Route updating…',c:''};
  if(APT_DB[c])return APT_DB[c];
  if(c.length===4&&c[0]==='K'&&APT_DB[c.slice(1)])return APT_DB[c.slice(1)];
  return {n:c+' Airport',c:''};
}
function isHoustonApt(c){return HOU_APT.has(String(c||'').toUpperCase());}
function isHoustonFlight(f){return isHoustonApt(f.dep)||isHoustonApt(f.arr);}
function nearestHoustonApt(lat,lon){
  if(!Number.isFinite(lat)||!Number.isFinite(lon))return DEFAULT_APT;
  let best=DEFAULT_APT,bd=1e9;
  for(const code of HOU_APT){
    const a=APT_COORDS[code];if(!a)continue;
    const d=Math.hypot((a.lat-lat)*69,(a.lng-lon)*59.9*Math.cos(lat*Math.PI/180));
    if(d<bd){bd=d;best=code;}
  }
  return best;
}
function fmtDur(ms){
  const m=Math.max(0,Math.round(ms/60000));
  if(m<60)return m+'m';
  const h=Math.floor(m/60),rm=m%60;
  return h+'h'+(rm?' '+rm+'m':'');
}
function parseMaybeTime(t){
  if(t==null||t==='')return null;
  if(typeof t==='number')return t>1e12?t:t*1000;
  const n=Date.parse(t);
  return Number.isFinite(n)?n:null;
}
function callsignPair(cs,csIata){
  const iataPref=cleanCSPublic(csIata||'');
  const c=String(cs||'').trim().replace(/\s+/g,'');
  if(iataPref)return {main:iataPref,iata:c&&c!==iataPref?c:''};
  const m=c.match(/^([A-Z]{3})(\d.*)$/i);
  if(!m)return {main:c||'—',iata:''};
  const icao=m[1].toUpperCase();
  const iata=(AIRLINE_IATA[icao]||icao.slice(0,2))+m[2];
  return {main:iata,iata:c}; /* show airline flight number first */
}
function hasFlightNumber(f){
  if(f.faFlightId)return true;
  if(f.csIata&&/[A-Z0-9]{2,}\d/i.test(f.csIata))return true;
  const cs=String(f.cs||'').trim();
  return !!(cs&&/^[A-Z]{2,3}\d/i.test(cs)&&!/^[A-F0-9]{6}$/i.test(cs));
}
function isStaleOrLandedAero(fl){
  if(!fl)return true;
  const now=Date.now();
  const st=String(fl.status||'').toLowerCase();
  if(/cancelled|canceled|diverted|result unknown/.test(st))return true;
  const ata=parseMaybeTime(fl.actual_in);
  if(ata&&now-ata>5*60000)return true; /* landed >5 min ago */
  if(/arrived|gate arrival|parked|taxi.?in/.test(st)&&ata)return true;
  if(/arrived/.test(st)&&!fl.actual_out)return true;
  const out=parseMaybeTime(fl.actual_out||fl.estimated_out||fl.scheduled_out);
  if(out&&now-out>20*3600000)return true; /* >20h old leg */
  const eta=parseMaybeTime(fl.estimated_in||fl.scheduled_in);
  if(eta&&now-eta>8*3600000&&fl.actual_in)return true;
  if(eta&&now-eta>36*3600000)return true; /* ETA days ago */
  return false;
}
function isCurrentlyAirborneAero(fl){
  if(isStaleOrLandedAero(fl))return false;
  const st=String(fl.status||'').toLowerCase();
  if(/en route|airborne|departed|taxi|approach|landing|climbing|descending/.test(st))return true;
  if(fl.actual_out&&!fl.actual_in)return true;
  return false;
}
function isLiveFlightActive(f){
  if(!f)return false;
  if(f._stale!=null&&f._stale>=3)return false;
  const now=Date.now();
  const ata=parseMaybeTime(f.ata);
  if(ata&&now-ata>10*60000)return false;
  const st=String(f.status||'').toLowerCase();
  if(/arrived|cancelled|canceled|diverted|parked/.test(st)){
    if(!ata||now-ata>5*60000)return false;
  }
  const eta=parseMaybeTime(f.eta);
  if(eta&&now-eta>6*3600000)return false;
  const spd=flightGsKts(f)||0;
  const alt=flightAltFt(f);
  if(f.kind==='live'&&alt!=null&&alt<200&&spd<40&&ata)return false;
  return true;
}
/* Sky ↔ panel: show live ADS-B tracks inside the rendered metro sky. */
const SKY_PLANE_BOUND=7200; /* keep aircraft inside sky dome / city view */
function flightWorldXZ(f){
  const lat=Number.isFinite(f._lat)?f._lat:f._tLat;
  const lon=Number.isFinite(f._lon)?f._lon:f._tLon;
  if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
  return geoToWorld(lat,lon);
}
function flightInSkyBounds(f){
  const w=flightWorldXZ(f);
  if(!w)return false;
  return Math.abs(w.x)<SKY_PLANE_BOUND&&Math.abs(w.z)<SKY_PLANE_BOUND;
}
function liveFlightEligible(f){
  if(!f||f.kind!=='live')return false;
  const cls=(f.m&&f.m.userData&&f.m.userData.acClass)||classifyAcModel(f.actype,f.category,f.cs);
  /* Helis / GA stay visible even if airline-route enrichment says non-metro */
  if(f._houston===false&&cls!=='heli'&&cls!=='prop')return false;
  if(!isLiveFlightActive(f))return false;
  if(!Number.isFinite(f._tLat)||!Number.isFinite(f._tLon))return false;
  if(!flightInSkyBounds(f))return false;
  /* Parked / gate clutter — never keep cruise GS cache as "still moving" */
  const gsNow=flightGsKts(f);
  const alt=flightAltFt(f);
  if(f.onGround){
    const taxiGs=Math.max(gsNow||0,(f._posMoved&&f._estGs)||0);
    if(taxiGs<25&&(alt==null||alt<400))return false;
  }
  if(cls==='heli'||cls==='prop')return true;
  const cs=String(f.cs||'').trim();
  if(!cs)return false;
  return true;
}
function liveFlightRank(f){
  const cs=String(f.cs||'').trim();
  const named=!/^[a-f0-9]{6}$/i.test(cs);
  const corr=classifyLiveCorridor(f);
  const cls=(f.m&&f.m.userData&&f.m.userData.acClass)||classifyAcModel(f.actype,f.category,f.cs);
  return (f._houston===true?40:0)+(f._routeVerified?20:0)+(f._faOk?15:0)+(f.faFlightId?10:0)
    +(hasFlightNumber(f)?8:0)+(named?12:0)+(corr?55:0)+(corr&&corr.mi<8?25:0)
    +(cls==='heli'?30:0)+(cls==='prop'?12:0)
    +(flightGsKts(f)||0)*0.01+(flightAltFt(f)||0)*0.0001;
}
function getSyncedLiveFlights(limit){
  if(!window.LIVE_FLIGHT_LIST)return [];
  let list=LIVE_FLIGHT_LIST
    .filter(liveFlightEligible)
    .sort((a,b)=>liveFlightRank(b)-liveFlightRank(a));
  const pinned=window._selectedFlight;
  if(pinned&&liveFlightEligible(pinned)){
    list=[pinned,...list.filter(x=>x!==pinned)];
  }
  return (limit!=null)?list.slice(0,limit):list;
}
function syncLiveFlightVisibility(){
  if(!window.LIVE_FLIGHT_LIST)return;
  const show=new Set(getSyncedLiveFlights(24));
  window._syncedLiveFlights=[...show];
  for(const f of LIVE_FLIGHT_LIST){
    if(!f||!f.m)continue;
    const on=show.has(f);
    f.m.visible=on;
    f._onPanel=on;
    if(on&&Number.isFinite(f._tLat)&&Number.isFinite(f._tLon)){
      if(!Number.isFinite(f._lat))f._lat=f._tLat;
      if(!Number.isFinite(f._lon))f._lon=f._tLon;
      if(!Number.isFinite(f._altM))f._altM=f._tAltM||2500;
      /* Position is owned by updateLiveFlights (corridor or geo) — only seed if never placed */
      if(!f._placed){
        const w=geoToWorld(f._lat,f._lon);
        const altFt=flightAltFt(f)||((f._altM||2500)*3.28084);
        f.m.position.set(w.x,displayAltY(altFt),w.z);
        f._placed=true;
      }
      /* Do NOT set rotation here — updateLiveFlights owns smooth heading (avoids flip glitches) */
      if(f.m.userData&&f.m.userData.halo){
        f.m.userData.halo.visible=followPlane===f;
        f.m.userData.halo.position.set(0,10,0);
      }
    }
  }
}
function isBoardFlightCurrent(f){
  const now=Date.now();
  const ata=parseMaybeTime(f.ata);
  if(ata&&now-ata>20*60000)return false;
  const st=String(f.status||'').toLowerCase();
  if(/arrived|cancelled|canceled|diverted/.test(st)&&(!ata||now-ata>10*60000))return false;
  const eta=parseMaybeTime(f.eta);
  const etd=parseMaybeTime(f.atd)||parseMaybeTime(f.etd);
  if(eta&&now-eta>2*3600000)return false;
  if(etd&&now-etd>16*3600000&&(!eta||eta<now-30*60000))return false;
  if(eta&&eta>=now-30*60000&&eta<=now+12*3600000)return true;
  if(etd&&etd>=now-4*3600000&&etd<=now+8*3600000)return true;
  if(/en route|airborne|departed|taxi|approach|landing|scheduled|filed/.test(st))return true;
  return false;
}
function acFullName(t){
  if(!t||t==='—')return 'Aircraft type pending';
  const k=String(t||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  return AC_NAMES[k]||String(t).toUpperCase();
}
function flightDirection(f){
  if(isHoustonApt(f.arr)&&!isHoustonApt(f.dep))return 'arr';
  if(isHoustonApt(f.dep)&&!isHoustonApt(f.arr))return 'dep';
  if(isHoustonApt(f.arr))return 'arr';
  if(isHoustonApt(f.dep))return 'dep';
  return 'unk';
}
function flightTiming(f){
  const now=Date.now();
  let dep=parseMaybeTime(f.atd)||parseMaybeTime(f.etd);
  const ata=parseMaybeTime(f.ata);
  let arr=parseMaybeTime(f.eta);
  if(ata&&now-ata>5*60000)arr=ata; /* landed — show actual */
  else if(!arr)arr=estimateEtaFromNow(f);
  let depTxt='—',arrTxt='—',pct=0;
  if(dep){
    const d=now-dep;
    depTxt=d>=0?('Departed '+fmtDur(d)+' ago'):('Departs in '+fmtDur(-d));
  }else if(f.kind==='live'||f.kind==='board'){
    depTxt='In flight';
  }
  if(arr){
    const a=arr-now;
    arrTxt=a>=0?('ETA in '+fmtDur(a)):('Arrived '+fmtDur(-a)+' ago');
  }else{
    arrTxt='ETA computing…';
  }
  if(dep&&arr&&arr>dep)pct=clamp((now-dep)/(arr-dep),0,1);
  else if((f.kind==='live'||f.kind==='sim')&&(f.altFt||f._tAltM))pct=clamp(((f.altFt!=null?f.altFt:f._tAltM*3.28084)||0)/38000,0.08,0.92);
  return {depTxt,arrTxt,pct};
}
function aptDistMi(code,lat,lon){
  const a=APT_COORDS[icaoToDisp(code)];
  if(!a||!Number.isFinite(lat)||!Number.isFinite(lon))return null;
  return Math.hypot((a.lat-lat)*69,(a.lng-lon)*59.9*Math.cos(lat*Math.PI/180));
}
function routeFitsPosition(dep,arr,lat,lon,vsFpm){
  /* Reject city-pairs that can't match where the plane actually is */
  if(!Number.isFinite(lat)||!Number.isFinite(lon))return true;
  const dDep=aptDistMi(dep,lat,lon);
  const dArr=aptDistMi(arr,lat,lon);
  if(dDep==null&&dArr==null)return true;
  const nearMetro=Math.hypot((METRO_LAT-lat)*69,(METRO_LNG-lon)*59.9)<90;
  /* Plane near this metro must be on a local-airport in/out leg */
  if(nearMetro&&!(isHoustonApt(dep)||isHoustonApt(arr)))return false;
  /* If far from both ends of the pair, it's the wrong leg (e.g. SDF→SAT while over Houston) */
  const closest=Math.min(dDep==null?1e9:dDep,dArr==null?1e9:dArr);
  if(closest>450)return false;
  /* Descending near dest / climbing near origin is a strong fit */
  if(vsFpm!=null&&vsFpm<-200&&dArr!=null&&dArr<120)return true;
  if(vsFpm!=null&&vsFpm>200&&dDep!=null&&dDep<120)return true;
  return closest<320||nearMetro;
}
function pickBestAeroFlight(flights,ctx){
  if(!Array.isArray(flights)||!flights.length)return null;
  const now=Date.now();
  const score=fl=>{
    if(isStaleOrLandedAero(fl))return -2000; /* never pick landed / multi-day-old legs */
    const dep=icaoToDisp(fl.origin&&(fl.origin.code_iata||fl.origin.code_icao));
    const arr=icaoToDisp(fl.destination&&(fl.destination.code_iata||fl.destination.code_icao));
    const hou=isHoustonApt(dep)||isHoustonApt(arr);
    if(!hou)return -1000;
    const st=String(fl.status||'').toLowerCase();
    const out=parseMaybeTime(fl.actual_out||fl.estimated_out||fl.scheduled_out);
    const inn=parseMaybeTime(fl.estimated_in||fl.scheduled_in);
    const airborne=isCurrentlyAirborneAero(fl);
    if(ctx&&Number.isFinite(ctx.lat)&&Number.isFinite(ctx.lon)){
      if(!routeFitsPosition(dep,arr,ctx.lat,ctx.lon,ctx.vsFpm))return -900;
    }
    let s=200;
    if(!airborne)return -500; /* only airborne / taxi / approach Houston legs */
    s+=220;
    if(/en route|airborne/.test(st))s+=80;
    if(/departed|taxi|approach|landing/.test(st))s+=50;
    if(/scheduled|filed/.test(st))s-=200;
    if(out&&inn&&now>=out-20*60000&&now<=inn+45*60000)s+=100;
    else if(out&&Math.abs(now-out)<8*3600000)s+=60;
    if(ctx&&ctx.reg&&fl.registration&&String(fl.registration).replace(/\s+/g,'').toUpperCase()===String(ctx.reg).replace(/\s+/g,'').toUpperCase())s+=160;
    if(ctx&&Number.isFinite(ctx.lat)&&Number.isFinite(ctx.lon)){
      const nearMetro=Math.hypot((METRO_LAT-ctx.lat)*69,(METRO_LNG-ctx.lon)*59.9)<80;
      const dArr=aptDistMi(arr,ctx.lat,ctx.lon);
      const dDep=aptDistMi(dep,ctx.lat,ctx.lon);
      if(nearMetro&&ctx.vsFpm!=null&&ctx.vsFpm<-200&&isHoustonApt(arr))s+=90;
      if(nearMetro&&ctx.vsFpm!=null&&ctx.vsFpm>200&&isHoustonApt(dep))s+=90;
      if(dArr!=null&&dArr<80)s+=40;
      if(dDep!=null&&dDep<80)s+=35;
      if(nearMetro&&isHoustonApt(arr))s+=30;
      if(nearMetro&&isHoustonApt(dep))s+=30;
    }
    if(fl.actual_out&&!fl.actual_in)s+=40;
    if(fl.fa_flight_id)s+=10;
    if(fl.ident_iata)s+=8;
    return s;
  };
  const ranked=flights.slice().map(fl=>({fl,s:score(fl)})).sort((a,b)=>b.s-a.s);
  if(!ranked.length||ranked[0].s<0)return null;
  return ranked[0].fl;
}
function pickAnyActiveAeroFlight(flights,ctx){
  /* Best currently-active FA leg regardless of Houston — used to block stale free-DB routes */
  if(!Array.isArray(flights)||!flights.length)return null;
  const now=Date.now();
  let best=null,bestS=-1e9;
  for(const fl of flights){
    if(isStaleOrLandedAero(fl))continue;
    if(!isCurrentlyAirborneAero(fl))continue;
    const out=parseMaybeTime(fl.actual_out||fl.estimated_out||fl.scheduled_out);
    let s=120;
    if(out&&Math.abs(now-out)<10*3600000)s+=40;
    if(fl.actual_out&&!fl.actual_in)s+=50;
    const dep=icaoToDisp(fl.origin&&(fl.origin.code_iata||fl.origin.code_icao));
    const arr=icaoToDisp(fl.destination&&(fl.destination.code_iata||fl.destination.code_icao));
    if(ctx&&Number.isFinite(ctx.lat)&&Number.isFinite(ctx.lon)&&routeFitsPosition(dep,arr,ctx.lat,ctx.lon,ctx.vsFpm))s+=80;
    else if(ctx&&Number.isFinite(ctx.lat))s-=40;
    if(s>bestS){bestS=s;best=fl;}
  }
  return best;
}
const APT_COORDS={
  IAH:{lat:29.9844,lng:-95.3414},HOU:{lat:29.6454,lng:-95.2789},EFD:{lat:29.6073,lng:-95.1588},
  SGR:{lat:29.6223,lng:-95.6565},DWH:{lat:30.0619,lng:-95.5528},IWS:{lat:29.8182,lng:-95.6726},
  CXO:{lat:30.3518,lng:-95.4145},BMT:{lat:29.9508,lng:-94.0207},DEN:{lat:39.8561,lng:-104.6737},
  ATL:{lat:33.6407,lng:-84.4277},LAX:{lat:33.9416,lng:-118.4085},ORD:{lat:41.9742,lng:-87.9073},
  DFW:{lat:32.8998,lng:-97.0403},AUS:{lat:30.1945,lng:-97.6699},EDC:{lat:30.3975,lng:-97.5664},SAT:{lat:29.5337,lng:-98.4698},
  MSY:{lat:29.9934,lng:-90.2580},DAL:{lat:32.8471,lng:-96.8518},PHX:{lat:33.4373,lng:-112.0078},
  LAS:{lat:36.0840,lng:-115.1537},MIA:{lat:25.7959,lng:-80.2870},JFK:{lat:40.6413,lng:-73.7781},
  SEA:{lat:47.4502,lng:-122.3088},CUN:{lat:21.0365,lng:-86.8771},MEX:{lat:19.4361,lng:-99.0719},
};
function flightPhase(f){
  const alt=flightAltFt(f);
  const spdKnown=flightGsKts(f); /* null = incomplete ADS-B — never treat as "stopped on final" */
  const spd=spdKnown!=null?spdKnown:0;
  const vs=f.vsFpm!=null?f.vsFpm:0;
  const st=String(f.status||'').toLowerCase();
  if(/taxi|take.?off|rolling/.test(st)|| (alt!=null&&alt<800&&spdKnown!=null&&spd<160))return {label:'Taking Off',cls:'takeoff'};
  if(/climb/.test(st)||(alt!=null&&alt<12000&&vs>250))return {label:'Climbing',cls:'climb'};
  /* Landing needs real descent or moving approach — missing/0 kts alone is incomplete data */
  if(/land|approach|final|descend/.test(st)||(alt!=null&&alt<10000&&vs<-250)
    ||(alt!=null&&alt<10000&&spdKnown!=null&&spdKnown>=40&&spdKnown<250&&vs<=50))
    return {label:'Landing',cls:'land'};
  if(alt==null)return {label:'En route',cls:''};
  if(alt>=28000||(spdKnown!=null&&spd>320))return {label:'Cruising',cls:''};
  if(vs>200)return {label:'Climbing',cls:'climb'};
  if(vs<-200)return {label:'Descending',cls:'land'};
  return {label:'En route',cls:''};
}
/* Decorative airport mesh for a Houston code (IAH/HOU/…) */
function airportByCode(code){
  const c=String(code||'').toUpperCase();
  try{return AIRPORTS.find(a=>a.code===c)||null;}catch(e){return null;}
}
function nearestDecorAirport(lat,lon){
  if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
  let best=null,bd=1e9;
  try{
    for(const a of AIRPORTS){
      const d=aptDistMi(a.code,lat,lon);
      if(d!=null&&d<bd){bd=d;best=a;}
    }
  }catch(e){return null;}
  return best?{apt:best,mi:bd}:null;
}
function runwayWorldPos(apt,s,latOff,alt){
  return {
    x:apt.x+apt.dx*s+(-apt.dz)*(latOff||0),
    y:alt,
    z:apt.z+apt.dz*s+(apt.dx)*(latOff||0),
  };
}
/* Map live ADS-B altitude (ft AGL/MSL) → world Y on the SAME scale as ground miles.
   UNITS_PER_MILE/5280 ≈ 0.0398 units per foot — so 3000 ft sits above the city correctly. */
const FT_TO_WORLD=UNITS_PER_MILE/5280;
function altFtToWorldY(altFt){
  if(altFt==null||!Number.isFinite(altFt))return 80;
  return Math.max(5,altFt*FT_TO_WORLD+5); /* +5 = gear/fuselage above pavement */
}
/* Soft visual boost only for very low approaches so they're not buried in buildings —
   still proportional to real altitude (never flattens cruise traffic). */
function displayAltY(altFt){
  const y=altFtToWorldY(altFt);
  if(altFt!=null&&altFt<2500)return y*1.15; /* slight readability near airports */
  return y;
}
/* Along-runway station from live distance-to-airport + phase (world units) */
function corridorStation(apt,mi,mode,altFt){
  const L=apt.runLen;
  const approachStart=-(L/2+2800);
  const touchdown=-(L*0.34);
  const climbEnd=L/2+2600;
  if(mode==='arr'){
    const t=clamp(1-mi/18,0,1);
    return lerp(approachStart,touchdown,t*t);
  }
  if(altFt!=null&&altFt<400)return lerp(-(L*0.42),L*0.2,clamp(altFt/400,0,1));
  const t=clamp(mi/16,0,1);
  return lerp(L*0.15,climbEnd,t);
}
function classifyLiveCorridor(f){
  const lat=Number.isFinite(f._tLat)?f._tLat:f._lat;
  const lon=Number.isFinite(f._tLon)?f._tLon:f._lon;
  if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
  const dir=flightDirection(f);
  const ph=flightPhase(f);
  const alt=flightAltFt(f);
  const vs=f.vsFpm!=null?f.vsFpm:0;
  const gs=flightGsKts(f);
  /* Incomplete ADS-B (common outside denser Houston coverage): no GS / frozen track
     must not be labeled Final <APT> or snapped into approach corridors. */
  const incomplete=(gs==null||gs<12)&&(alt==null||alt>2000)&&Math.abs(vs)<120;
  if(incomplete)return null;
  let apt=null,mode=null,mi=null;
  /* Prefer verified metro airport from route (HOU_APT = pack board airports) */
  if(dir==='arr'&&isHoustonApt(f.arr)){apt=airportByCode(f.arr);mode='arr';}
  else if(dir==='dep'&&isHoustonApt(f.dep)){apt=airportByCode(f.dep);mode='dep';}
  /* Fallback: nearest field when low / climbing / descending with real motion */
  if(!apt){
    const near=nearestDecorAirport(lat,lon);
    if(near&&near.mi<22){
      apt=near.apt;mi=near.mi;
      if(ph.cls==='land'||vs<-200||(alt!=null&&alt<9000&&vs<-80&&gs!=null&&gs>=40))mode='arr';
      else if(ph.cls==='takeoff'||ph.cls==='climb'||vs>150||(alt!=null&&alt<12000&&vs>0&&gs!=null&&gs>=40))mode='dep';
      else if(alt!=null&&alt<6000&&gs!=null&&gs>=40)mode=(vs>=0?'dep':'arr');
    }
  }
  if(!apt||!mode)return null;
  if(mi==null)mi=aptDistMi(apt.code,lat,lon);
  if(mi==null||mi>24)return null;
  if(alt!=null&&alt>16000&&mi>10)return null; /* high cruise — keep geo */
  return {apt,mode,mi,alt};
}
function estimateEtaFromNow(f){
  /* Never treat actual arrival (landed) as a future ETA */
  const known=parseMaybeTime(f.eta);
  if(known&&known>Date.now()-30*60000)return known;
  const dest=icaoToDisp(f.arr);
  const origin=icaoToDisp(f.dep);
  const apt=APT_COORDS[dest]||(isHoustonApt(dest)?APT_COORDS[DEFAULT_APT]:null);
  const lat=Number.isFinite(f._lat)?f._lat:(Number.isFinite(f._tLat)?f._tLat:null);
  const lon=Number.isFinite(f._lon)?f._lon:(Number.isFinite(f._tLon)?f._tLon:null);
  if(apt&&Number.isFinite(lat)&&Number.isFinite(lon)){
    const dLat=(apt.lat-lat)*69, dLng=(apt.lng-lon)*59.9*Math.cos(lat*Math.PI/180);
    const mi=Math.hypot(dLat,dLng);
    const kts=Math.max(120,(f.gsKts||f.kts||380));
    const hours=mi/Math.max(1,kts*1.15078);
    return Date.now()+Math.max(0.12,hours)*3600*1000;
  }
  /* outbound from Houston with known city pair — typical short/medium haul ETA */
  if(isHoustonApt(origin)&&dest&&dest!=='—'&&APT_COORDS[dest]){
    const o=APT_COORDS[origin]||APT_COORDS.IAH;
    const d=APT_COORDS[dest];
    const dLat=(d.lat-o.lat)*69, dLng=(d.lng-o.lng)*59.9*Math.cos(o.lat*Math.PI/180);
    const mi=Math.hypot(dLat,dLng);
    const kts=Math.max(280,(f.gsKts||f.kts||420));
    const hours=mi/Math.max(1,kts*1.15078)+0.35; /* climb/taxi buffer */
    return Date.now()+hours*3600*1000;
  }
  if(f.kind==='live'||f.kind==='board'||f.kind==='sim'){
    const alt=(f.altFt!=null?f.altFt:28000);
    const remH=clamp((38000-Math.min(alt,38000))/18000,0.35,2.8);
    return Date.now()+remH*3600*1000;
  }
  return null;
}
function flightVerifyUrl(f){
  /* Prefer FlightAware flight id — most accurate deep link for THIS leg */
  if(f.faFlightId)return 'https://www.flightaware.com/live/flight/id/'+encodeURIComponent(f.faFlightId);
  const iata=cleanCSPublic(f.csIata||'');
  if(iata&&/[A-Z0-9]{2,}\d/i.test(iata))return 'https://www.flightaware.com/live/flight/'+encodeURIComponent(iata);
  const cs=cleanCSPublic(f.cs);
  if(cs&&/^[A-Z]{2,3}\d/i.test(cs)&&!/^[A-F0-9]{6}$/i.test(cs))return 'https://www.flightaware.com/live/flight/'+encodeURIComponent(cs);
  /* No reliable flight number — open ADS-B track, not a wrong FA search */
  if(f.icao24)return 'https://globe.adsb.lol/?icao='+encodeURIComponent(String(f.icao24).toLowerCase());
  if(f.reg)return 'https://www.flightaware.com/live/flight/'+encodeURIComponent(String(f.reg).replace(/\s+/g,''));
  return 'https://globe.adsb.lol/?lat='+METRO_LAT+'&lon='+METRO_LNG+'&zoom=9';
}
function flightLinkLabel(f){
  if(f.faFlightId||(f.csIata&&/[A-Z0-9]{2,}\d/i.test(f.csIata))||(f.cs&&/^[A-Z]{2,3}\d/i.test(String(f.cs))))return 'Track on FlightAware ↗';
  return 'Track on ADS-B ↗';
}
function numOrNull(v){
  if(v==null||v==='')return null;
  if(typeof v==='string'&&/ground|none|null|undefined/i.test(v))return null;
  const n=Number(v);
  return Number.isFinite(n)?n:null;
}
function flightAltFt(f){
  if(!f)return null;
  let a=numOrNull(f.altFt);
  if(a==null&&f.lastPos)a=numOrNull(f.lastPos.altitude);
  if(a==null&&f._tAltM!=null)a=numOrNull(f._tAltM)*3.28084;
  if(a==null&&f._altM!=null)a=numOrNull(f._altM)*3.28084;
  if(a==null)a=numOrNull(f.alt);
  if(a==null)return null;
  return Math.round(a);
}
function flightGsKts(f){
  if(!f)return null;
  let s=numOrNull(f.gsKts);
  if(s==null)s=numOrNull(f.kts);
  if(s==null&&f.lastPos)s=numOrNull(f.lastPos.groundspeed);
  if(s==null)s=numOrNull(f._estGs);
  if(s==null)s=numOrNull(f._lastGoodGs);
  if(s==null)return null;
  return Math.round(s);
}
/** Typical cruise GS by altitude when ADS-B omits speed (Austin / thinner coverage). */
function assumedAirborneGs(altFt,cls){
  if(cls==='heli')return 90;
  if(cls==='prop'){
    if(altFt==null)return 140;
    if(altFt<3000)return 120;
    if(altFt<10000)return 160;
    return 200;
  }
  if(altFt==null)return 380;
  if(altFt<1500)return 180;
  if(altFt<5000)return 250;
  if(altFt<12000)return 320;
  if(altFt<25000)return 400;
  return 450;
}
function applyFaLastPosition(f,fl){
  const lp=fl&&fl.last_position;
  if(!lp)return;
  f.lastPos={
    altitude:numOrNull(lp.altitude),
    groundspeed:numOrNull(lp.groundspeed),
    heading:numOrNull(lp.heading),
    lat:numOrNull(lp.latitude),
    lon:numOrNull(lp.longitude),
  };
  if(f.altFt==null&&f.lastPos.altitude!=null)f.altFt=f.lastPos.altitude;
  if(f.gsKts==null&&f.lastPos.groundspeed!=null){f.gsKts=f.lastPos.groundspeed;f.kts=f.lastPos.groundspeed;}
  if(Number.isFinite(f.lastPos.lat)&&Number.isFinite(f.lastPos.lon)){
    if(!Number.isFinite(f._lat))f._lat=f.lastPos.lat;
    if(!Number.isFinite(f._lon))f._lon=f.lastPos.lon;
    if(!Number.isFinite(f._tLat))f._tLat=f.lastPos.lat;
    if(!Number.isFinite(f._tLon))f._tLon=f.lastPos.lon;
  }
}
function mergeLiveTelemetry(f){
  /* Attach ADS-B speed/alt onto board rows when the same flight is airborne nearby */
  if(!f||f.kind!=='board'||!window.LIVE_FLIGHT_LIST)return f;
  const cs=String(f.csIata||f.cs||'').replace(/\s+/g,'').toUpperCase();
  const reg=String(f.reg||'').replace(/\s+/g,'').toUpperCase();
  let best=null;
  for(const live of LIVE_FLIGHT_LIST){
    if(!live||live.kind!=='live')continue;
    const lcs=String(live.csIata||live.cs||'').replace(/\s+/g,'').toUpperCase();
    const lreg=String(live.reg||'').replace(/\s+/g,'').toUpperCase();
    const match=(cs&&lcs&&(cs===lcs||cs.endsWith(lcs.replace(/^[A-Z]+/,''))||lcs===cs))
      ||(reg&&lreg&&reg===lreg);
    if(!match)continue;
    if(flightGsKts(live)!=null||flightAltFt(live)!=null){best=live;break;}
  }
  if(!best)return f;
  if(f.gsKts==null&&flightGsKts(best)!=null){f.gsKts=flightGsKts(best);f.kts=f.gsKts;}
  if(f.altFt==null&&flightAltFt(best)!=null)f.altFt=flightAltFt(best);
  if(f.baroInHg==null&&best.baroInHg!=null)f.baroInHg=best.baroInHg;
  if(f.vsFpm==null&&best.vsFpm!=null)f.vsFpm=best.vsFpm;
  if(!Number.isFinite(f._lat)&&Number.isFinite(best._lat)){f._lat=best._lat;f._lon=best._lon;f._tLat=best._tLat;f._tLon=best._tLon;}
  return f;
}
function cleanCSPublic(s){return String(s||'').trim().replace(/\s+/g,'');}
function hasVerifiedRoute(f){
  const dep=icaoToDisp(f.dep),arr=icaoToDisp(f.arr);
  return !!(dep&&dep!=='—'&&arr&&arr!=='—'&&!f._guessRoute&&!f._guessArr&&isHoustonFlight(f));
}
function flightCardSig(f){
  /* Identity + route only — do NOT include alt/speed or links get destroyed mid-click */
  return [f.kind,f.cs,f.dep,f.arr,f.reg,f.actype,f._routeVerified?1:0,f.faFlightId||'',f.csIata||'',f.atd||'',f.etd||'',f.ata||'',Math.round((parseMaybeTime(f.eta)||0)/60000)].join('|');
}
function flightStatsSig(f){
  return [flightAltFt(f),flightGsKts(f),f.baroInHg,f.status||'',f.vsFpm||0].join('|');
}
function patchFlightCardStats(el,f){
  if(!el)return;
  const verified=hasVerifiedRoute(f);
  const phase=flightPhase(f);
  const alt=flightAltFt(f);
  const spd=flightGsKts(f);
  const baro=(f.baroInHg!=null&&isFinite(f.baroInHg))?Number(f.baroInHg).toFixed(2):(typeof liveWx!=='undefined'&&liveWx&&liveWx.press!=null?Number(liveWx.press).toFixed(2):'—');
  const landedAgo=parseMaybeTime(f.ata)&&Date.now()-parseMaybeTime(f.ata)>5*60000;
  const etaT=landedAgo?parseMaybeTime(f.ata):(verified?estimateEtaFromNow(f):parseMaybeTime(f.eta));
  const etaTxt=etaT?fmtFlightTime(etaT):(verified?'—':'Route pending');
  const etaRel=etaT?(etaT>Date.now()?('in '+fmtDur(etaT-Date.now())):('landed '+fmtDur(Date.now()-etaT)+' ago')):'';
  const tim=flightTiming(f);
  const type=f.actype&&f.actype!=='—'?String(f.actype).toUpperCase():'';
  const isLive=f.kind==='live';
  const isBoard=f.kind==='board';
  const srcTag=isLive?('Live ADS-B'+(f._faOk?' + FlightAware':'')):(isBoard?'FlightAware board':'');
  const ph=el.querySelector('.fphase');
  if(ph){
    ph.className='fphase'+(phase.cls?' '+phase.cls:'');
    ph.innerHTML='<span class="dot"></span>'+phase.label+(type?' · '+type:'')+(srcTag?' · '+srcTag:'');
  }
  const chips=el.querySelectorAll('.fchip .v');
  /* order in renderFlightCard: GS, Alt, Baro, ETA */
  if(chips.length>=4){
    chips[0].textContent=(spd!=null?Math.round(spd)+' kts':'—');
    chips[1].textContent=alt!=null?(alt.toLocaleString()+' ft'):'—';
    chips[2].textContent=baro!=='—'?(baro+' inHg'):'—';
    chips[3].innerHTML=etaTxt+(etaRel?' <span style="color:#8a939c;font-weight:600">· '+etaRel+'</span>':'');
  }
  const bar=el.querySelector('.fbar i');
  if(bar)bar.style.width=Math.round(tim.pct*100)+'%';
  const meta=el.querySelector('.fverify span');
  if(meta){
    const lat=Number.isFinite(f._lat)?f._lat:(Number.isFinite(f._tLat)?f._tLat:null);
    const lon=Number.isFinite(f._lon)?f._lon:(Number.isFinite(f._tLon)?f._tLon:null);
    meta.textContent=(lat!=null&&lon!=null)?(lat.toFixed(3)+'°, '+lon.toFixed(3)+'°'):'';
  }
  const a=el.querySelector('.fverify a');
  if(a){a.href=flightVerifyUrl(f);a.textContent=flightLinkLabel(f);}
}
function renderFlightCard(f){
  const verified=hasVerifiedRoute(f);
  const route=resolveFlightAirports(f);
  const depShow=route.dep, arrShow=route.arr;
  const d0=(depShow==='…')?{n:'Origin pending',c:''}:aptInfo(depShow);
  const d1=(arrShow==='…')?{n:'Destination pending',c:''}:aptInfo(arrShow);
  const cs=callsignPair(f.cs,f.csIata);
  const type=f.actype&&f.actype!=='—'?String(f.actype).toUpperCase():'';
  const phase=flightPhase(f);
  const dir=flightDirection(f);
  const isLive=f.kind==='live';
  const isBoard=f.kind==='board';
  const landedAgo=parseMaybeTime(f.ata)&&Date.now()-parseMaybeTime(f.ata)>5*60000;
  const badge=landedAgo?'LANDED':(isBoard?'SCHEDULED':(verified?(dir==='arr'?'ARRIVING':(dir==='dep'?'DEPARTING':'LIVE')):'LIVE ADS-B'));
  const badgeCls=landedAgo?'unk':(isBoard?'unk':(verified?(dir==='arr'?'arr':(dir==='dep'?'dep':'unk')):'unk'));
  const alt=flightAltFt(f);
  const spd=flightGsKts(f);
  const baro=(f.baroInHg!=null&&isFinite(f.baroInHg))?Number(f.baroInHg).toFixed(2):(typeof liveWx!=='undefined'&&liveWx&&liveWx.press!=null?Number(liveWx.press).toFixed(2):'—');
  const etaT=landedAgo?parseMaybeTime(f.ata):(verified?estimateEtaFromNow(f):parseMaybeTime(f.eta));
  const etaTxt=etaT?fmtFlightTime(etaT):(verified?'—':(route.pending?'Route pending':'—'));
  const etaRel=etaT?(etaT>Date.now()?('in '+fmtDur(etaT-Date.now())):('landed '+fmtDur(Date.now()-etaT)+' ago')):'';
  const tim=flightTiming(f);
  const lat=Number.isFinite(f._lat)?f._lat:(Number.isFinite(f._tLat)?f._tLat:null);
  const lon=Number.isFinite(f._lon)?f._lon:(Number.isFinite(f._tLon)?f._tLon:null);
  const posTxt=(lat!=null&&lon!=null)?(lat.toFixed(3)+'°, '+lon.toFixed(3)+'°'):'';
  const fr=flightVerifyUrl(f);
  const linkLab=flightLinkLabel(f);
  const srcTag=isLive?('Live ADS-B'+(f._faOk?' + FlightAware':'')):(isBoard?'FlightAware board':'');
  const fltNo=cs.main&&cs.main!=='—'?cs.main:'';
  return '<div class="fhead"><div class="fcs">'+(fltNo||'—')+(cs.iata?'<small>'+cs.iata+'</small>':'')+'</div>'
    +'<div class="fbadge '+badgeCls+'">'+badge+'</div></div>'
    +'<div class="froutebox">'
      +'<div class="fapt from"><div class="code">'+depShow+'</div><div class="city">'+(d0.c||(depShow!=='…'?'Origin':''))+'</div><div class="aname">'+d0.n+'</div></div>'
      +'<div class="farrow">→</div>'
      +'<div class="fapt to"><div class="code">'+arrShow+'</div><div class="city">'+(d1.c||(arrShow!=='…'?'Destination':''))+'</div><div class="aname">'+d1.n+'</div></div>'
    +'</div>'
    +'<div class="fphase '+phase.cls+'"><span class="dot"></span>'+phase.label+(type?' · '+type:'')+(srcTag?' · '+srcTag:'')+'</div>'
    +'<div class="fmeta">'
      +'<div class="fchip"><div class="k">Ground speed</div><div class="v">'+(spd!=null?(Math.round(spd)+' kts'):'—')+'</div></div>'
      +'<div class="fchip"><div class="k">Altitude</div><div class="v">'+(alt!=null?(alt.toLocaleString()+' ft'):'—')+'</div></div>'
      +'<div class="fchip"><div class="k">Barometric</div><div class="v">'+(baro!=='—'?(baro+' inHg'):'—')+'</div></div>'
      +'<div class="fchip"><div class="k">'+(landedAgo?'ATA':'ETA')+'</div><div class="v">'+etaTxt+(etaRel?' <span style="color:#8a939c;font-weight:600">· '+etaRel+'</span>':'')+'</div></div>'
    +'</div>'
    +'<div class="fbar"><i style="width:'+Math.round(tim.pct*100)+'%"></i></div>'
    +'<div class="fstats"><span><b>'+(f.reg||f.icao24||'—')+'</b> '+(f.reg?'reg':'hex')+'</span><span><b>'+acFullName(f.actype)+'</b></span>'
    +'<span>'+tim.depTxt+'</span><span>'+tim.arrTxt+'</span></div>'
    +'<div class="fverify"><a href="'+fr+'" target="_blank" rel="noopener">'+linkLab+'</a>'
    +(posTxt?'<span>'+posTxt+'</span>':'')+'</div>'
    +(isLive?'<button type="button" class="ffind" data-find-plane="1">Find in sky ↗</button>':'');
}

function evalKeys(keys,h){
  h=((h%24)+24)%24;
  for(let i=0;i<keys.length;i++){
    const a=keys[i], b=keys[(i+1)%keys.length];
    const tb=(i+1<keys.length)?b.t:b.t+24;
    let hh=h; if(hh<a.t) hh+=24;
    if(hh>=a.t&&hh<=tb){const u=(hh-a.t)/Math.max(0.0001,tb-a.t);return {a,b,u};}
  }
  return {a:keys[0],b:keys[0],u:0};
}
function keyNum(keys,h){const k=evalKeys(keys,h);return lerp(k.a.v,k.b.v,k.u);}
const _c1=new THREE.Color(),_c2=new THREE.Color();
function keyCol(keys,h,out){const k=evalKeys(keys,h);_c1.set(k.a.v);_c2.set(k.b.v);out.copy(_c1).lerp(_c2,k.u);return out;}

/* ---------------- renderer / scene ---------------- */
const canvas=document.getElementById('scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,innerWidth<900?1.35:1.75));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=(THREE.SRGBColorSpace||THREE.sRGBEncoding);
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08; /* weather-scaled each frame — clear days brighter, overcast softer */
const MAXAN=renderer.capabilities.getMaxAnisotropy();
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xc5d8ea,1400,18000);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,2,42000);

const hemi=new THREE.HemisphereLight(HTS_IS_AUS?0xe8f0ff:0xd0e4ff,HTS_IS_AUS?0x6a7a50:0x4a5a3a,HTS_IS_AUS?0.95:0.88);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff5e6,HTS_IS_AUS?1.15:1.05);scene.add(sun);
const nightAmb=new THREE.AmbientLight(0x080c14,0.0);scene.add(nightAmb);
const cityFill=new THREE.HemisphereLight(0x3a2e22,0x06080c,0.0);scene.add(cityFill); /* soft warm CBD bounce */
/* LOD groups: full-detail 3D vs zoom-out map mode */
const gRoads3D=new THREE.Group();scene.add(gRoads3D);
const gDetail=new THREE.Group();scene.add(gDetail);

/* ---------------- atmospheric sky dome (follows camera target so find/zoom never leaves the sky) ---------------- */
const skyRoot=new THREE.Group();scene.add(skyRoot);
const skyUni={
  top:{value:new THREE.Color(0x4a9aef)}, bot:{value:new THREE.Color(0xd6ecff)},
  haze:{value:new THREE.Color(0xe8f2fa)},
  sunDir:{value:new THREE.Vector3(0,1,0)},
  glowCol:{value:new THREE.Color(0xffe8b8)}, glowI:{value:0.85},
};
const sky=new THREE.Mesh(new THREE.SphereGeometry(16000,32,20),
  new THREE.ShaderMaterial({side:THREE.BackSide,fog:false,depthWrite:false,uniforms:skyUni,
    vertexShader:`varying vec3 vD;void main(){vec4 w=modelMatrix*vec4(position,1.0);
      vD=normalize(w.xyz-cameraPosition);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform vec3 top;uniform vec3 bot;uniform vec3 haze;
      uniform vec3 sunDir;uniform vec3 glowCol;uniform float glowI;varying vec3 vD;
      void main(){
        vec3 d=normalize(vD);
        float h=max(d.y,0.0);
        vec3 c=mix(bot,top,pow(h,0.62));
        c=mix(haze,c,smoothstep(0.0,0.16,h));
        float s=max(dot(d,sunDir),0.0);
        c+=glowCol*glowI*(pow(s,7.0)*0.55+pow(s,90.0)*0.9);
        gl_FragColor=vec4(c,1.0);
      }`}));
skyRoot.add(sky);

/* stars */
(function(){const n=1200,pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){const th=rand()*TAU,ph=Math.acos(rand()*0.85);const r=15500;
    pos[i*3]=r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=r*Math.cos(ph)+150;pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  window.stars=new THREE.Points(g,new THREE.PointsMaterial({color:0xcfe0ff,size:8,sizeAttenuation:true,transparent:true,opacity:0,fog:false,depthWrite:false}));
  skyRoot.add(stars);})();

/* sun & moon + glare */
function disc(color,size){return new THREE.Mesh(new THREE.CircleGeometry(size,26),
  new THREE.MeshBasicMaterial({color,fog:false,transparent:true,depthWrite:false}));}
const sunDisc=(function(){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  const g=x.createRadialGradient(128,128,4,128,128,128);
  g.addColorStop(0,'rgba(255,255,255,1)');
  g.addColorStop(0.13,'rgba(255,250,235,1)');
  g.addColorStop(0.2,'rgba(255,238,190,.92)');
  g.addColorStop(0.34,'rgba(255,214,140,.4)');
  g.addColorStop(0.6,'rgba(255,190,110,.12)');
  g.addColorStop(1,'rgba(255,180,100,0)');
  x.fillStyle=g;x.fillRect(0,0,256,256);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),
    transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));
  sp.scale.set(760,760,1);skyRoot.add(sp);return sp;})();
const moonDisc=(function(){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  const g=x.createRadialGradient(64,64,30,64,64,64);
  g.addColorStop(0,'rgba(226,232,242,1)');g.addColorStop(0.55,'rgba(226,232,242,.96)');
  g.addColorStop(0.72,'rgba(210,220,235,.4)');g.addColorStop(1,'rgba(210,220,235,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);
  x.fillStyle='rgba(160,172,190,.35)';
  x.beginPath();x.arc(48,52,9,0,TAU);x.fill();
  x.beginPath();x.arc(76,74,6,0,TAU);x.fill();
  x.beginPath();x.arc(66,44,4.5,0,TAU);x.fill();
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),
    transparent:true,depthWrite:false,fog:false}));
  sp.scale.set(400,400,1);skyRoot.add(sp);return sp;})();
const sunGlare=(function(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  const g=x.createRadialGradient(64,64,4,64,64,64);
  g.addColorStop(0,'rgba(255,240,205,.9)');g.addColorStop(.35,'rgba(255,215,150,.26)');g.addColorStop(1,'rgba(255,200,120,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),
    blending:THREE.AdditiveBlending,depthWrite:false,fog:false,transparent:true,opacity:0}));
  sp.scale.set(2800,2800,1);skyRoot.add(sp);return sp;})();

/* ---------------- cumulus clouds (multi-puff billboards) ---------------- */
function cloudTexture(){
  const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');
  const base=92;
  const puffs=8+Math.floor(rand()*5);
  for(let p=0;p<puffs;p++){
    const px=34+rand()*188, pr=20+rand()*30;
    const py=base-pr*(0.45+rand()*0.5);
    const g=x.createRadialGradient(px,py,pr*0.1,px,py,pr);
    g.addColorStop(0,'rgba(255,255,255,.95)');
    g.addColorStop(0.55,'rgba(250,252,255,.55)');
    g.addColorStop(1,'rgba(245,248,255,0)');
    x.fillStyle=g;x.beginPath();x.arc(px,py,pr,0,TAU);x.fill();
  }
  const sg=x.createLinearGradient(0,base-26,0,base+6);
  sg.addColorStop(0,'rgba(0,0,0,0)');sg.addColorStop(1,'rgba(150,165,190,.28)');
  x.globalCompositeOperation='source-atop';
  x.fillStyle=sg;x.fillRect(0,0,256,128);
  x.globalCompositeOperation='source-over';
  const t=new THREE.CanvasTexture(c);t.anisotropy=2;return t;
}
const clouds=new THREE.Group();skyRoot.add(clouds);
(function(){
  const texes=[cloudTexture(),cloudTexture(),cloudTexture(),cloudTexture()];
  for(let i=0;i<32;i++){
    const mat=new THREE.SpriteMaterial({map:texes[i%4],transparent:true,opacity:0.85,depthWrite:false,fog:false});
    const sp=new THREE.Sprite(mat);
    const w=1100+rand()*2200;
    sp.scale.set(w,w*0.5,1);
    sp.position.set((rand()-.5)*22000,920+rand()*640,(rand()-.5)*22000);
    sp.userData.vx=5+rand()*9;
    sp.userData.baseOp=0.85;
    clouds.add(sp);
  }
})();

/* ---------------- ground — Houston lawn / Austin prairie (same green family) ---------------- */
const groundTex=(function(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  /* Both cities: green turf. Austin slightly warmer olive, never beige clay. */
  x.fillStyle=HTS_IS_AUS?'#3f6a34':'#3f5a32';x.fillRect(0,0,512,512);
  for(let i=0;i<(HTS_IS_AUS?3000:3200);i++){const r=rand();
    if(HTS_IS_AUS){
      x.fillStyle=r<.28?'#4a7a3c':(r<.52?'#356830':(r<.72?'#5a8848':(r<.88?'#2e5828':'#6a9050')));
    }else{
      x.fillStyle=r<.28?'#4a6a38':(r<.52?'#385830':(r<.72?'#557848':(r<.88?'#2f4a28':'#5a7040')));
    }
    x.globalAlpha=.2+rand()*.38;
    x.fillRect(rand()*512,rand()*512,2+rand()*12,2+rand()*12);}
  for(let i=0;i<(HTS_IS_AUS?100:160);i++){
    /* sparse dirt patches only — keep them small so the plane stays green */
    x.fillStyle=HTS_IS_AUS?(rand()<.5?'#5a6840':'#4a5e38'):(rand()<.5?'#6e5e42':'#5a4e38');
    x.globalAlpha=HTS_IS_AUS?(.08+rand()*.12):(.14+rand()*.22);
    x.beginPath();x.ellipse(rand()*512,rand()*512,12+rand()*28,8+rand()*20,rand()*TAU,0,TAU);x.fill();
  }
  x.globalAlpha=1;
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(14,14);t.anisotropy=MAXAN;return t;})();
const ground=new THREE.Mesh(new THREE.PlaneGeometry(24000,24000),
  new THREE.MeshLambertMaterial({map:groundTex,color:HTS_IS_AUS?0xb8d090:0xb4c890,
    polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:4}));
ground.rotation.x=-Math.PI/2;ground.position.y=-1.6;scene.add(ground);
ground.userData.baseColor=new THREE.Color(HTS_IS_AUS?0xb8d090:0xb4c890);
/* Cinematic: soft shadows + env (Austin = prairie; Houston = glassy PBR-ish) */
const htsCinematic=createCinematic({renderer,scene,camera,sun,ground,isAus:HTS_IS_AUS});
window.HTS_CINEMATIC=htsCinematic;

/* ---------------- water & greenery (distinct nature palettes) ---------------- */
window.EXCLUDES=[]; /* circles where nothing may be built: water, airfields, stadium bowls */
/* Austin water: flat F4 blue + ripple map (Lambert). Houston keeps reflective PBR. */
const matWater=HTS_IS_AUS
  ?new THREE.MeshLambertMaterial({color:0x2a8ab8})
  :new THREE.MeshStandardMaterial({color:0x2a6a88,metalness:0.55,roughness:0.18,envMapIntensity:1.2});
const matBayou=new THREE.MeshStandardMaterial({color:0x2a6a58,metalness:0.25,roughness:0.35,envMapIntensity:0.7});
const matLake =HTS_IS_AUS
  ?new THREE.MeshLambertMaterial({color:0x2488b8})
  :new THREE.MeshStandardMaterial({color:0x2e78a0,metalness:0.62,roughness:0.12,envMapIntensity:1.35});
const matBay  =new THREE.MeshStandardMaterial({color:0x246080,metalness:0.5,roughness:0.22,envMapIntensity:1.0});
if(htsCinematic&&htsCinematic.envMap&&!HTS_IS_AUS){
  for(const m of [matWater,matBayou,matLake,matBay])m.envMap=htsCinematic.envMap;
}
/* F4-style soft water ripple (repeating) */
if(HTS_IS_AUS)(function(){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  x.fillStyle='#2a8ab8';x.fillRect(0,0,128,128);
  for(let i=0;i<18;i++){
    x.strokeStyle='rgba(255,255,255,'+(0.06+rand()*0.1)+')';
    x.lineWidth=1+rand()*1.5;
    const y=8+i*6.5+(rand()-0.5)*3;
    x.beginPath();
    for(let px=0;px<=128;px+=4)x.lineTo(px,y+Math.sin(px*0.12+i)*2.2);
    x.stroke();
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(14,14);
  matLake.map=t;matLake.needsUpdate=true;
  matWater.map=t;
})();
/* Parks: Austin F4 flat greens; Houston darker so ACES doesn't wash them */
const matForest=new THREE.MeshLambertMaterial({color:HTS_IS_AUS?0x4a8a3a:0x2f5a2c});
const matPark=new THREE.MeshLambertMaterial({color:HTS_IS_AUS?0x5a9a42:0x3f6e34});
const matLawn =new THREE.MeshLambertMaterial({color:HTS_IS_AUS?0x68a84a:0x4a7a3a});
const matScrub =new THREE.MeshLambertMaterial({color:HTS_IS_AUS?0x5a8a42:0x456038});
const matPlaza =new THREE.MeshLambertMaterial({color:HTS_IS_AUS?0x5a9848:0x3a6832});
for(const m of [matForest,matPark,matLawn,matScrub,matPlaza])m.userData.baseColor=m.color.clone();
function blobShape(r,irr,n){
  const sh=new THREE.Shape();
  for(let i=0;i<=n;i++){const a=i/n*TAU;
    const rr=r*(1+irr*Math.sin(a*3+rand()*9)*0.5+irr*Math.sin(a*7+rand()*9)*0.3);
    const x=Math.cos(a)*rr,y=Math.sin(a)*rr;
    if(i===0)sh.moveTo(x,y);else sh.lineTo(x,y);}
  return sh;
}
function blob(cx,cz,r,irr,mat,y){
  const m=new THREE.Mesh(new THREE.ShapeGeometry(blobShape(r,irr,26)),mat);
  m.rotation.x=-Math.PI/2;m.position.set(cx,y,cz);gDetail.add(m);
  if(mat===matWater||mat===matLake||mat===matBay||mat===matBayou)EXCLUDES.push({x:cx,z:cz,r:r*1.12,water:true});
  return m;
}
/* Parks, forests, and neighborhood lawns — visible from altitude */
if(!HTS_HAS_PACK){
blob(-1140,-3620,520,.3,matForest,0.02);    /* Woodlands pines */
blob(1500,-3700,480,.3,matForest,0.02);     /* Kingwood woods */
blob(-2650,-780,360,.3,matScrub,0.018);     /* Addicks land */
blob(-2850,300,380,.3,matScrub,0.018);      /* Barker land */
blob(-880,-130,420,.35,matPark,0.03);       /* Memorial Park */
blob(-1600,-5000,400,.3,matForest,0.02);    /* Conroe woods */
blob(-230,805,280,.3,matPark,0.03);         /* Hermann Park */
blob(-350,-70,260,.35,matPlaza,0.025);      /* Buffalo Bayou Park */
blob(2699,-1383,220,.3,matPark,0.025);      /* Sheldon Lake SP */
blob(60,60,180,.4,matLawn,0.022);           /* downtown green pockets */
blob(-680,470,200,.35,matLawn,0.022);       /* Greenway / Levy */
blob(-420,-1180,240,.3,matLawn,0.02);       /* Greenspoint lawns */
blob(900,1800,260,.3,matLawn,0.02);         /* Pearland fringe */
blob(-2200,900,300,.3,matLawn,0.02);        /* Energy Corridor yards */
blob(1800,-800,220,.3,matPark,0.022);       /* East End parks */
blob(-500,1400,200,.3,matLawn,0.02);        /* Midtown / Museum fringe */
blob(400,-2200,280,.3,matForest,0.02);      /* north pine belt */
blob(-3200,-2000,340,.3,matLawn,0.02);      /* Katy / Cinco Ranch yards */
/* lakes, reservoirs, bay */
blob(2150,-3850,640,.4,matLake,0.03);       /* Lake Houston */
blob(2050,3020,320,.45,matLake,0.03);       /* Clear Lake */
blob(-2650,-780,170,.4,matWater,0.035);     /* Addicks pool */
blob(-2850,300,180,.4,matWater,0.035);      /* Barker pool */
blob(7150,2700,3300,.22,matBay,0.03);       /* Galveston Bay */
blob(2699,-1383,160,.4,matLake,0.03);       /* Sheldon Lake */
}else if(HTS_IS_AUS){
  /* Austin — Balcones edge: flat east prairie, greenbelt + lakes west/central */
  const dtLawn=geoToWorld(30.2672,-97.7431);
  blob(dtLawn.x,dtLawn.z,70,.4,matLawn,0.022);
  /* Republic Square / Wooldridge / Brush Square pocket greens */
  for(const [lat,lng,r] of [[30.2678,-97.7475,45],[30.2712,-97.7468,50],[30.2660,-97.7398,40]]){
    const p=geoToWorld(lat,lng);blob(p.x,p.z,r,.4,matPlaza,0.026);
  }
  const zilker=geoToWorld(30.2685,-97.7729); /* keep park mass north of Lady Bird */
  blob(zilker.x,zilker.z,260,.28,matPark,0.03);
  const barton=geoToWorld(30.2648,-97.7715);
  blob(barton.x,barton.z,110,.35,matPark,0.032);
  /* Auditorium Shores / Butler Park — south bank lawn (photo: bright green park) */
  const audShore=geoToWorld(30.263,-97.753);
  blob(audShore.x,audShore.z,160,.3,matPark,0.03);
  const butler=geoToWorld(30.26,-97.76);
  blob(butler.x,butler.z,140,.32,matLawn,0.028);
  /* Barton Creek greenbelt west of Zilker */
  for(const [lat,lng,r] of [[30.258,-97.795,140],[30.248,-97.805,160],[30.238,-97.818,150]]){
    const p=geoToWorld(lat,lng);blob(p.x,p.z,r,.35,matForest,0.02);
  }
  const capG=geoToWorld(30.2747,-97.7404);
  blob(capG.x,capG.z,200,.25,matLawn,0.028); /* Capitol grounds — big green lawn */
  const utG=geoToWorld(30.28565,-97.73921);
  blob(utG.x,utG.z,90,.26,matLawn,0.022); /* Tower plaza lawn — not fused with DKR */
  /* Pease Park · Shoal Creek corridor */
  const pease=geoToWorld(30.284,-97.752);
  blob(pease.x,pease.z,130,.35,matPark,0.03);
  for(const [lat,lng,r] of [[30.295,-97.755,90],[30.305,-97.758,85],[30.315,-97.76,80]]){
    const p=geoToWorld(lat,lng);blob(p.x,p.z,r,.4,matForest,0.02);
  }
  /* Walnut Creek · Emma Long · McKinney Falls · Mueller lake park */
  const mueller=geoToWorld(30.298,-97.704);blob(mueller.x,mueller.z,140,.35,matPark,0.028);
  const walnut=geoToWorld(30.38,-97.67);blob(walnut.x,walnut.z,240,.3,matForest,0.02);
  const emma=geoToWorld(30.36,-97.84);blob(emma.x,emma.z,220,.32,matForest,0.02);
  const mckinney=geoToWorld(30.185,-97.722);blob(mckinney.x,mckinney.z,200,.35,matPark,0.025);
  /* Lady Bird shore — green belt outside the wide channel (both banks) */
  for(const [lat,lng,r] of [
    [30.268,-97.775,55],[30.267,-97.768,50],[30.266,-97.76,48],[30.265,-97.752,45],
    [30.2645,-97.745,42],[30.263,-97.74,42],[30.260,-97.738,48],[30.256,-97.736,48],
    [30.253,-97.73,50],[30.252,-97.72,48],
    /* south bank */
    [30.260,-97.775,55],[30.258,-97.765,50],[30.256,-97.755,48],[30.254,-97.748,45],
    [30.252,-97.742,48],[30.249,-97.736,45],
  ]){
    const p=geoToWorld(lat,lng);blob(p.x,p.z,r,.4,matPark,0.026);
  }
  const domain=geoToWorld(30.402,-97.725);
  blob(domain.x,domain.z,200,.3,matLawn,0.02);
  /* Suburb neighborhood greens */
  for(const [lat,lng,r] of [
    [30.505,-97.82,180],[30.508,-97.679,200],[30.439,-97.62,160],
    [30.633,-97.678,170],[30.579,-97.853,150],[30.085,-97.84,140],
    [29.989,-97.877,150],[30.309,-97.945,160],[30.367,-97.98,170],
  ]){
    const p=geoToWorld(lat,lng);blob(p.x,p.z,r,.35,matLawn,0.02);
  }
  /* Lady Bird ribbon draws the reservoir — small widenings at Zilker bend only */
  const lblWide=[
    [30.266,-97.785,55],[30.264,-97.775,50],
  ];
  for(const [lat,lng,r] of lblWide){
    const p=geoToWorld(lat,lng);
    blob(p.x,p.z,r,.4,matLake,0.032);
  }
  const lakeAus=geoToWorld(30.32,-97.84);
  blob(lakeAus.x,lakeAus.z,380,.4,matLake,0.03);
  const travis=geoToWorld(30.41,-97.91);
  blob(travis.x,travis.z,480,.35,matLake,0.028);
  /* Hill Country scrub west of MoPac — olive green, not tan dirt */
  for(const [lat,lng,r] of [[30.30,-97.81,280],[30.34,-97.86,320],[30.28,-97.83,240],[30.38,-97.88,300],[30.25,-97.86,260],[30.42,-97.82,280]]){
    const p=geoToWorld(lat,lng);
    blob(p.x,p.z,r,.4,matForest,0.02);
  }
}else if(HTS_HAS_PACK){
  const dtLawn=packDowntown();
  blob(dtLawn.x,dtLawn.z,90,.4,matLawn,0.022);
}
/* Buffalo Bayou + other Houston bayous / rivers (Austin uses Lady Bird + creek corridors) */
const BAYOU=HTS_HAS_PACK?[]:[[-2300,-120],[-1500,-60],[-900,-140],[-400,-40],[0,-90],[420,-20],[900,40],[1600,-30],[2400,80],[3300,220],[4200,520]];
const BRAYS=HTS_HAS_PACK?[]:[[-2400,1520],[-1600,1160],[-800,900],[-200,720],[300,540],[720,400]];
const WHITEOAK=HTS_HAS_PACK?[]:[[-2200,-1800],[-1600,-1200],[-900,-700],[-400,-350],[0,-120],[90,10],[177,0]];
const SIMS=HTS_HAS_PACK?[]:[[-400,2800],[200,2400],[800,2000],[1400,1700],[2000,1500],[2600,1400]];
const GREENS=HTS_HAS_PACK?[]:[[800,-2800],[1400,-2200],[2000,-1600],[2600,-1100],[3200,-700],[3800,-400]];
const SANJAC=HTS_HAS_PACK?[]:[[2400,-3200],[2800,-2600],[3400,-1800],[4200,-800],[5200,400],[6200,1600]];
const LADYBIRD=(HTS_PACK&&HTS_PACK.ladyBird&&HTS_PACK.ladyBird.length>=2)
  ?HTS_PACK.ladyBird.slice()
  :(HTS_IS_AUS?(function(){
  const pts=[[30.2685,-97.805],[30.267,-97.79],[30.2652,-97.78],[30.2635,-97.77],[30.2620,-97.76],[30.2612,-97.752],[30.2608,-97.745],[30.2585,-97.74],[30.2545,-97.7375],[30.2508,-97.7365],[30.2498,-97.725],[30.2505,-97.71],[30.2520,-97.698],[30.2545,-97.685]];
  return pts.map(([lat,lng])=>{const w=geoToWorld(lat,lng);return [w.x,w.z];});
})():[]);
/* Austin creeks — tree banks + thin water ribbons (Shoal · Waller · Barton · Onion) */
function ausCreek(ptsLatLng){
  return ptsLatLng.map(([lat,lng])=>{const w=geoToWorld(lat,lng);return [w.x,w.z];});
}
const SHOAL=HTS_IS_AUS?ausCreek([[30.32,-97.76],[30.31,-97.755],[30.295,-97.752],[30.284,-97.751],[30.275,-97.749],[30.268,-97.748],[30.262,-97.747]]):[];
const WALLER=HTS_IS_AUS?ausCreek([[30.285,-97.735],[30.278,-97.736],[30.272,-97.737],[30.267,-97.738],[30.262,-97.739]]):[];
const BARTON_CK=HTS_IS_AUS?ausCreek([[30.245,-97.81],[30.252,-97.795],[30.258,-97.782],[30.263,-97.774],[30.265,-97.771]]):[];
const ONION=HTS_IS_AUS?ausCreek([[30.15,-97.78],[30.17,-97.76],[30.185,-97.74],[30.20,-97.72],[30.22,-97.70]]):[];
window.ALL_BAYOUS=HTS_IS_AUS?[LADYBIRD,SHOAL,WALLER,BARTON_CK,ONION]:(HTS_HAS_PACK?(LADYBIRD.length>=2?[LADYBIRD]:[]):[BAYOU,BRAYS,WHITEOAK,SIMS,GREENS,SANJAC]);

/* ---------------- curve & ribbon builders (elevation-aware) ---------------- */
function sampleCurve(pts2,closed,step){
  if(!pts2||pts2.length<2){
    /* Safe empty ribbon — callers must not treat total===0 as a real path */
    const px=new Float32Array(1),pz=new Float32Array(1),tx=new Float32Array(1),tz=new Float32Array(1),
          cum=new Float32Array(1),py=new Float32Array(1);
    tx[0]=1;return {px,pz,tx,tz,cum,py,total:0,n:0,closed:!!closed,empty:true};
  }
  const v=pts2.map(p=>new THREE.Vector3(p[0],0,p[1]));
  const curve=new THREE.CatmullRomCurve3(v,closed,'catmullrom',closed?0.5:0.35);
  const len=curve.getLength();const n=Math.max(24,Math.round(len/step));
  const px=new Float32Array(n+1),pz=new Float32Array(n+1),tx=new Float32Array(n+1),tz=new Float32Array(n+1),
        cum=new Float32Array(n+1),py=new Float32Array(n+1);
  let prev=null,acc=0;
  for(let i=0;i<=n;i++){const u=i/n;const p=curve.getPointAt(u);const t=curve.getTangentAt(u);
    px[i]=p.x;pz[i]=p.z;const m=Math.hypot(t.x,t.z)||1;tx[i]=t.x/m;tz[i]=t.z/m;
    if(prev){acc+=Math.hypot(p.x-prev.x,p.z-prev.z);}cum[i]=acc;prev=p;}
  return {px,pz,tx,tz,cum,py,total:acc,n,closed};
}
function ribbonGeom(s,width,yOff,lateral,vcolors,uvRepeat){
  const n=s.n,verts=new Float32Array((n+1)*2*3),idx=[];
  let col=null,uv=null;
  if(vcolors)col=new Float32Array((n+1)*2*3);
  if(uvRepeat)uv=new Float32Array((n+1)*2*2);
  for(let i=0;i<=n;i++){const rx=-s.tz[i],rz=s.tx[i];
    const cx=s.px[i]+rx*lateral,cz=s.pz[i]+rz*lateral;
    const y=s.py[i]+yOff;
    verts[(i*2)*3]=cx-rx*width/2;verts[(i*2)*3+1]=y;verts[(i*2)*3+2]=cz-rz*width/2;
    verts[(i*2+1)*3]=cx+rx*width/2;verts[(i*2+1)*3+1]=y;verts[(i*2+1)*3+2]=cz+rz*width/2;
    if(uv){uv[(i*2)*2]=0;uv[(i*2)*2+1]=s.cum[i]/uvRepeat;
           uv[(i*2+1)*2]=1;uv[(i*2+1)*2+1]=s.cum[i]/uvRepeat;}
    if(i<n){const a=i*2,b=i*2+1,c=i*2+2,d=i*2+3;idx.push(a,c,b,b,c,d);}}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(verts,3));
  if(col)g.setAttribute('color',new THREE.BufferAttribute(col,3));
  if(uv)g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();return g;
}
function flatRibbonGeom(s,width,y){
  const n=s.n,verts=new Float32Array((n+1)*2*3),idx=[];
  for(let i=0;i<=n;i++){const rx=-s.tz[i],rz=s.tx[i];
    verts[(i*2)*3]=s.px[i]-rx*width/2;verts[(i*2)*3+1]=y;verts[(i*2)*3+2]=s.pz[i]-rz*width/2;
    verts[(i*2+1)*3]=s.px[i]+rx*width/2;verts[(i*2+1)*3+1]=y;verts[(i*2+1)*3+2]=s.pz[i]+rz*width/2;
    if(i<n){const a=i*2,b=i*2+1,c=i*2+2,d=i*2+3;idx.push(a,c,b,b,c,d);}}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(verts,3));
  g.setIndex(idx);g.computeVertexNormals();return g;
}
/* grade-aware wall: low jersey barrier at grade, full fascia only on bridges */
function wallGeomVar(s,lateral){
  const n=s.n,verts=new Float32Array((n+1)*2*3),idx=[];
  for(let i=0;i<=n;i++){const rx=-s.tz[i],rz=s.tx[i];
    const cx=s.px[i]+rx*lateral,cz=s.pz[i]+rz*lateral;
    const elevF=clamp((s.py[i]-2.2)/2.2,0,1);
    const yT=s.py[i]+lerp(0.34,1.02,elevF);
    const yB=Math.max(0.05,s.py[i]-lerp(0.3,1.9,elevF));
    verts[(i*2)*3]=cx;verts[(i*2)*3+1]=yT;verts[(i*2)*3+2]=cz;
    verts[(i*2+1)*3]=cx;verts[(i*2+1)*3+1]=yB;verts[(i*2+1)*3+2]=cz;
    if(i<n){const a=i*2,b=i*2+1,c=i*2+2,d=i*2+3;idx.push(a,c,b,b,c,d);}}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(verts,3));
  g.setIndex(idx);g.computeVertexNormals();return g;
}
function wallGeom(s,lateral,yTopOff,yBotAbsMin,yBotOff){
  const n=s.n,verts=new Float32Array((n+1)*2*3),idx=[];
  for(let i=0;i<=n;i++){const rx=-s.tz[i],rz=s.tx[i];
    const cx=s.px[i]+rx*lateral,cz=s.pz[i]+rz*lateral;
    const yT=s.py[i]+yTopOff;
    const yB=Math.max(yBotAbsMin,s.py[i]+yBotOff);
    verts[(i*2)*3]=cx;verts[(i*2)*3+1]=yT;verts[(i*2)*3+2]=cz;
    verts[(i*2+1)*3]=cx;verts[(i*2+1)*3+1]=yB;verts[(i*2+1)*3+2]=cz;
    if(i<n){const a=i*2,b=i*2+1,c=i*2+2,d=i*2+3;idx.push(a,c,b,b,c,d);}}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(verts,3));
  g.setIndex(idx);g.computeVertexNormals();return g;
}
function mergeGeoms(list){
  let vTot=0,iTot=0;
  for(const g of list){vTot+=g.getAttribute('position').count;iTot+=g.getIndex().count;}
  const pos=new Float32Array(vTot*3);const idx=new Uint32Array(iTot);
  let vo=0,io=0;
  for(const g of list){
    const p=g.getAttribute('position');pos.set(p.array,vo*3);
    const ix=g.getIndex().array;
    for(let k=0;k<ix.length;k++)idx[io+k]=ix[k]+vo;
    vo+=p.count;io+=ix.length;g.dispose();
  }
  const out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.BufferAttribute(pos,3));
  out.setIndex(new THREE.BufferAttribute(idx,1));
  return out;
}

/* ---------------- road network ---------------- */
function superellipse(cx,cz,a,b,e,n){const pts=[];
  for(let i=0;i<n;i++){const t=i/n*TAU;const c=Math.cos(t),s=Math.sin(t);
    pts.push([cx+a*Math.sign(c)*Math.pow(Math.abs(c),e),cz+b*Math.sign(s)*Math.pow(Math.abs(s),e)]);}
  return pts;}

/* Legacy hand-drawn corridors — used only if OSM boot data is missing */
const LEGACY_ROAD_DEFS=[
 {id:'westheimer',name:'Westheimer Rd',short:'Westheimer',closed:false,width:20,lanes:2,ff:38,share:0.45,baseY:0.65,prio:0,arterial:true,
  pts:[[-3400,470],[-2600,440],[-1900,430],[-1250,420],[-700,405],[-250,395],[128,335]]},
 {id:'memorial',name:'Memorial Dr',short:'Memorial',closed:false,width:18,lanes:2,ff:36,share:0.35,baseY:0.6,prio:0,arterial:true,
  pts:[[-1895,-60],[-1200,-105],[-650,-95],[-200,-70],[60,-55]]},
 {id:'sh6',name:'State Hwy 6',short:'SH-6',closed:false,width:22,lanes:2,ff:46,share:0.5,baseY:0.92,prio:0.5,surface:true,
  pts:[[-3350,-2660],[-3540,-1500],[-3470,-560],[-3410,340],[-3330,1250],[-3240,2150],[-3300,2300],[-4848,2674]]},
 {id:'sh6s',name:'State Hwy 6 — Missouri City · Sugar Land',short:'SH-6 S',closed:false,width:22,lanes:2,ff:46,share:0.42,baseY:0.9,prio:0.55,surface:true,
  pts:[[-4848,2674],[-3276,2167],[-2018,2891],[-2647,3150]]},
 {id:'fm1960',name:'FM 1960',short:'FM 1960',closed:false,width:20,lanes:2,ff:45,share:0.45,baseY:0.9,prio:0.6,surface:true,
  pts:[[-3842,-2253],[-3120,-2560],[-2200,-2500],[-1400,-2520],[-600,-2560],[200,-2620],[700,-2680],[1230,-2740]]},
 {id:'bw8',name:'Beltway 8 — Sam Houston Tollway',short:'Beltway 8',closed:true,width:36,lanes:3,ff:65,share:1.2,baseY:0.82,prio:1,
  pts:superellipse(-80,-40,1820,1720,0.62,44)},
 {id:'tx99',name:'TX-99 — Grand Parkway',short:'TX-99',closed:true,width:32,lanes:3,ff:70,share:0.9,baseY:0.82,prio:1.5,
  pts:[
   [-5653,-181],[-4031,-2905],[-3276,-3484],[-2144,-4209],[-760,-5078],[1881,-3774],[2636,-3194],
   [5026,-152],[4397,2602],[3517,4051],[-1012,4775],[-3276,2167],[-5100,1225]
  ]},
 {id:'sh146',name:'SH-146 — Baytown · La Porte',short:'SH-146',closed:false,width:26,lanes:3,ff:58,share:0.45,baseY:0.82,prio:1.2,
  pts:[[3760,-900],[3720,-300],[3560,400],[3380,900],[3200,1500],[3050,2200],[2950,3000],[2900,3320],[4523,1442],[5152,428]]},
 {id:'sh225',name:'SH-225 — La Porte Fwy',short:'SH-225',closed:false,width:28,lanes:3,ff:60,share:0.4,baseY:0.82,prio:2.2,
  pts:[[600,320],[1200,420],[1900,520],[2500,640],[3100,820],[3420,920]]},
 {id:'sh288',name:'State Hwy 288 — South Fwy',short:'SH-288',closed:false,width:32,lanes:3,ff:63,share:0.8,baseY:0.82,prio:2,
  pts:[[45,48],[150,420],[210,900],[260,1500],[330,2200],[380,3000],[1127,3036],[430,3900],[246,4340],[-634,5500]]},
 {id:'sh35',name:'SH-35 — Pearland · Alvin',short:'SH-35',closed:false,width:20,lanes:2,ff:50,share:0.35,baseY:0.85,prio:0.8,surface:true,
  pts:[[1127,2891],[1300,3600],[1630,4920]]},
 {id:'fbpkwy',name:'Fort Bend Tollway',short:'FB Toll',closed:false,width:26,lanes:2,ff:62,share:0.45,baseY:0.82,prio:2.4,
  pts:[[150,190],[-1200,1200],[-2647,2602],[-3276,2167]]},
 {id:'fm1093',name:'FM 1093 — Katy · Richmond · Sugar Land',short:'FM 1093',closed:false,width:22,lanes:2,ff:48,share:0.5,baseY:0.88,prio:0.7,surface:true,
  pts:[[-5666,-296],[-5414,428],[-4785,1442],[-3276,2457]]},
 {id:'i610',name:'Interstate 610 — The Loop',short:'I-610',closed:true,width:42,lanes:4,ff:62,share:1.5,baseY:0.82,prio:3,
  pts:superellipse(-60,-30,980,930,0.6,40)},
 {id:'westpark',name:'Westpark Tollway',short:'Westpark Toll',closed:false,width:26,lanes:2,ff:65,share:0.5,baseY:0.82,prio:3.2,
  pts:[[-5414,428],[-4800,520],[-4250,760],[-3500,700],[-2700,650],[-1900,610],[-1250,575],[-1045,555]]},
 {id:'sh249',name:'SH-249 — Tomball Pkwy',short:'SH-249',closed:false,width:30,lanes:3,ff:65,share:0.58,baseY:0.82,prio:3.5,
  pts:[[-950,-935],[-1150,-1400],[-1650,-2050],[-2150,-2700],[-2600,-3300],[-3050,-4000],[-3400,-4800],[-3024,-4788]]},
 {id:'hardy',name:'Hardy Toll Road',short:'Hardy Toll',closed:false,width:28,lanes:3,ff:70,share:0.55,baseY:0.82,prio:4.5,
  pts:[[100,-420],[190,-1050],[300,-1700],[430,-2350],[620,-2920],[760,-3600],[880,-4400],[120,-4788]]},
 {id:'us290',name:'US-290 — Northwest Fwy',short:'US-290',closed:false,width:36,lanes:3,ff:64,share:0.9,baseY:0.82,prio:4,
  pts:[[40,-210],[-700,-720],[-1450,-1240],[-2200,-1800],[-2950,-2380],[-3700,-2920],[-4500,-3480],[-5400,-4050],[-6861,-4281]]},
 {id:'us59',name:'US-59 / I-69 — Southwest Fwy · Eastex',short:'US-59',closed:false,width:42,lanes:4,ff:64,share:1.35,baseY:0.82,prio:5,
  pts:[[-7679,4920],[-5414,3181],[-5400,3750],[-4600,3400],[-3900,2900],[-3300,2420],[-2700,1900],[-2100,1460],[-1500,1080],[-900,720],[-380,380],[-60,180],[260,60],[520,-260],[760,-780],[1000,-1500],[1180,-2600],[1320,-3500],[1450,-4400],[1520,-5400]]},
 {id:'i10',name:'Interstate 10 — Katy Fwy · East Fwy',short:'I-10',closed:false,width:44,lanes:4,ff:68,share:1.5,baseY:0.82,prio:6,
  pts:[[-9754,-224],[-7238,-296],[-5400,-390],[-4300,-360],[-3400,-330],[-2600,-300],[-1750,-265],[-980,-250],[-380,-230],[60,-200],[600,-235],[1200,-260],[2000,-235],[2800,-270],[3600,-250],[4400,-285],[5400,-310]]},
 {id:'i45',name:'Interstate 45 — North Fwy · Gulf Fwy',short:'I-45',closed:false,width:42,lanes:4,ff:65,share:1.4,baseY:0.82,prio:7,
  pts:[[-1850,-5400],[-1550,-4550],[-1260,-3800],[-1090,-3300],[-830,-2600],[-660,-1750],[-420,-1000],[-160,-380],[40,60],[330,560],[640,1150],[880,1850],[1120,2600],[1500,3400],[1950,4400],[2300,5400],[4200,6200],[5800,6600],[7290,6804]]},
];
/* City pack roads (Austin) replace Houston legacy before OSM snap. */
(function applyCityPackRoads(){
  if(!HTS_PACK||!HTS_PACK.roads||!HTS_PACK.roads.length)return;
  LEGACY_ROAD_DEFS.length=0;
  for(const r of HTS_PACK.roads)LEGACY_ROAD_DEFS.push(r);
  console.log('%c'+HTS_CITY_ID+' road pack applied: '+LEGACY_ROAD_DEFS.length+' corridors','color:#7fd6a0');
})();
/* Snap freeways to real Houston OSM geometry (stitched corridors). Keep hand paths if stitch is too short. */
(function applyOsmCorridors(){
  if(HTS_PACK&&HTS_PACK.skipOsmCorridors){console.log('%cOSM corridors skipped — city pack roads','color:#7fd6a0');return;}
  const pack=window.OSM_CORRIDORS&&window.OSM_CORRIDORS.corridors;
  if(!pack){console.warn('OSM corridors missing — legacy road paths');return;}
  let n=0;
  for(const def of LEGACY_ROAD_DEFS){
    const c=pack[def.id];
    if(!c||!Array.isArray(c.pts)||c.pts.length<8||(c.length||0)<1500)continue;
    def.pts=c.pts;
    const a=c.pts[0],b=c.pts[c.pts.length-1];
    const gap=Math.hypot(a[0]-b[0],a[1]-b[1]);
    if(def.id==='i610'||def.id==='bw8'||def.id==='tx99'){
      def.closed=gap<520;
    }else if(gap<180&&(c.length||0)>4000){
      def.closed=true;
    }
    n++;
  }
  console.log('%cReal Houston OSM corridors applied: '+n,'color:#7fd6a0');
})();
function normalizeOsmRoadDef(r){
  if(!r||!Array.isArray(r.pts)||r.pts.length<2)return null;
  return {
    id:String(r.id||('osm-'+Math.random().toString(36).slice(2,8))),
    name:r.name||r.short||r.ref||'Road',
    short:r.short||r.ref||r.name||'Road',
    closed:!!r.closed,
    width:Number(r.width)||18,
    lanes:Math.max(1,Math.min(6,Number(r.lanes)||2)),
    ff:Number(r.ff)||40,
    share:Number(r.share)||0.3,
    baseY:Number(r.baseY)||0.7,
    prio:Number(r.prio)||1,
    arterial:!!r.arterial,
    surface:!!r.surface,
    ramp:!!r.ramp,
    pts:r.pts
  };
}
/* OSM boot merge currently produces self-reversing spaghetti (black screen / invisible close-up roads).
   Keep legacy freeways for the traffic sim; stream arterials/locals via OSM LOD instead.
   Re-enable after `roads:merge` is fixed (set USE_OSM_BOOT=true). */
const USE_OSM_BOOT=false;
function osmPathQuality(pts){
  if(!pts||pts.length<3)return 0;
  let rev=0,dup=0,L=0;
  for(let i=1;i<pts.length;i++){
    const a=pts[i-1],b=pts[i];
    const dx=b[0]-a[0],dz=b[1]-a[1];
    const d=Math.hypot(dx,dz);L+=d;
    if(d<0.05)dup++;
    if(i>=2){
      const c=pts[i-2];
      const ax=a[0]-c[0],az=a[1]-c[1],bx=b[0]-a[0],bz=b[1]-a[1];
      const la=Math.hypot(ax,az),lb=Math.hypot(bx,bz);
      if(la>0.2&&lb>0.2&&(ax*bx+az*bz)<-0.55*la*lb)rev++;
    }
  }
  if(L<80)return 0;
  const revRate=rev/Math.max(1,pts.length-2);
  const dupRate=dup/Math.max(1,pts.length-1);
  if(revRate>0.12||dupRate>0.08)return 0;
  return L;
}
const ROAD_DEFS=(function(){
  if(!USE_OSM_BOOT){
    console.warn('OSM boot disabled — using legacy freeways (stable close-up roads)');
    return LEGACY_ROAD_DEFS;
  }
  const boot=window.OSM_ROAD_BOOT&&Array.isArray(window.OSM_ROAD_BOOT.roads)?window.OSM_ROAD_BOOT.roads:[];
  const mapped=boot.map(normalizeOsmRoadDef).filter(d=>d&&osmPathQuality(d.pts)>0);
  if(mapped.length>=12){
    console.log('%cOSM roads boot: '+mapped.length+' clean corridors','color:#7fd6a0');
    return mapped;
  }
  console.warn('OSM boot missing/dirty — using legacy hand-drawn ROAD_DEFS');
  return LEGACY_ROAD_DEFS;
})();

/* sample all roads, then compute overpass profiles */
const roadSamples=[];
for(const def of ROAD_DEFS){
  const s=sampleCurve(def.pts,def.closed,14);
  for(let i=0;i<=s.n;i++)s.py[i]=def.baseY;
  roadSamples.push({def,s});
}
const CLEAR=8.8;
const UNDERPASSES=[]; /* where a road passes UNDER another — flood-prone in storms */
const byPrio=[...roadSamples].sort((a,b)=>a.def.prio-b.def.prio);
for(let ri=0;ri<byPrio.length;ri++){
  const R=byPrio[ri];if(R.def.prio===0)continue;
  const bumps=[];
  for(let oi=0;oi<ri;oi++){
    const O=byPrio[oi];
    if(O.def.prio===R.def.prio)continue;
    const thresh=(R.def.width+O.def.width)/2+30, t2=thresh*thresh;
    let lastArc=-1e9;
    for(let i=0;i<=R.s.n;i+=2){
      const x=R.s.px[i],z=R.s.pz[i];
      for(let j=0;j<=O.s.n;j+=2){
        const dx=x-O.s.px[j],dz=z-O.s.pz[j];
        if(dx*dx+dz*dz<t2){
          const arc=R.s.cum[i];
          const need=O.s.py[j]+CLEAR-R.def.baseY;
          if(arc-lastArc>170){
            bumps.push({c:arc,H:need});
            if(O.s.py[j]<2.4)UNDERPASSES.push({x:O.s.px[j],z:O.s.pz[j],roadId:O.def.id,arc:O.s.cum[j],over:R.def.short});
          }
          else if(bumps.length){
            const b=bumps[bumps.length-1];
            b.H=Math.max(b.H,need);b.c=(b.c+arc)/2;
          }
          lastArc=arc;
          break;
        }
      }
    }
  }
  for(const b of bumps){
    const HL=130+b.H*14;
    for(let i=0;i<=R.s.n;i++){
      let d=Math.abs(R.s.cum[i]-b.c);
      if(R.s.closed)d=Math.min(d,R.s.total-d);
      if(d<HL){
        const k=0.5+0.5*Math.cos(Math.PI*d/HL);
        const y=R.def.baseY+b.H*k;
        if(y>R.s.py[i])R.s.py[i]=y;
      }
    }
  }
}
/* Austin: lift I-35 / MoPac / Congress / Lamar decks over Lady Bird (shore roads stay at grade) */
if(HTS_IS_AUS&&LADYBIRD&&LADYBIRD.length>=2)(function(){
  const lake=sampleCurve(LADYBIRD,false,36);
  if(!lake||lake.empty||!lake.total)return;
  const BRIDGE=new Set(['i35','mopac','congress','lamar']);
  const HALF=48; /* wide Lady Bird channel — bridges span the river in the middle */
  for(const {def,s} of roadSamples){
    if(!BRIDGE.has(def.id))continue;
    for(let i=0;i<=s.n;i++){
      let best=1e9;
      for(let j=0;j<=lake.n;j+=2){
        const d=Math.hypot(s.px[i]-lake.px[j],s.pz[i]-lake.pz[j]);
        if(d<best)best=d;
      }
      if(best>=HALF)continue;
      const k=0.5+0.5*Math.cos(Math.PI*best/HALF);
      const y=def.baseY+12*k;
      if(y>s.py[i])s.py[i]=y;
    }
  }
})();

/* congestion hotspots — choke points; rings driven by live/modeled congestion nearby */
const HOTSPOTS=[
 {x:0,z:0,r:560,k:0.55,name:'Downtown'},
 {x:-980,z:180,r:430,k:0.6,name:'I-10 W / 610'},
 {x:-980,z:-255,r:340,k:0.5,name:'I-10 E / 610'},
 {x:-420,z:-1000,r:360,k:0.35,name:'US-290'},
 {x:-900,z:720,r:340,k:0.4,name:'US-59 S'},
 {x:-290,z:800,r:320,k:0.35,name:'SH-288'},
 {x:-1820,z:-270,r:340,k:0.32,name:'I-10 W'},
 {x:-3400,z:-330,r:400,k:0.38,name:'I-10 Katy'},
 {x:-2900,z:2000,r:380,k:0.36,name:'US-59 SW'},
 {x:-1090,z:-3400,r:380,k:0.3,name:'IAH / Hardy'},
 {x:-1450,z:-1240,r:340,k:0.3,name:'N Loop 610'},
 {x:380,z:2600,r:330,k:0.26,name:'Hardy Toll'},
 {x:2800,z:-270,r:340,k:0.22,name:'I-10 E'},
 {x:1900,z:3400,r:330,k:0.24,name:'I-45 S'},
 {x:-4550,z:3320,r:340,k:0.24,name:'US-59 Sugar Land'},
 {x:-5653,z:-181,r:380,k:0.32,name:'Grand Pkwy Katy'},
 {x:-4031,z:-2905,r:360,k:0.28,name:'Grand Pkwy Cypress'},
 {x:1881,z:-3774,r:340,k:0.26,name:'Grand Pkwy Kingwood'},
 {x:5026,z:-152,r:360,k:0.28,name:'Grand Pkwy Baytown'},
 {x:-5414,z:428,r:340,k:0.3,name:'Westpark Katy'},
 {x:1127,z:3036,r:330,k:0.28,name:'SH-288 Pearland'},
 {x:-6861,z:-4281,r:360,k:0.26,name:'US-290 Waller'},
 {x:-7238,z:-296,r:340,k:0.24,name:'I-10 Brookshire'},
 {x:7290,z:6804,r:380,k:0.22,name:'I-45 Galveston'},
 {x:-3842,z:-2253,r:320,k:0.24,name:'FM 1960 Cypress'},
];
if(HTS_PACK&&HTS_PACK.hotspots&&HTS_PACK.hotspots.length){
  HOTSPOTS.length=0;
  for(const h of HTS_PACK.hotspots)HOTSPOTS.push(h);
}
function hotspotMult(x,z){let m=1;for(const h of HOTSPOTS){const d=Math.hypot(x-h.x,z-h.z);
  if(d<h.r)m+=h.k*(1-d/h.r);}return m;}
/* Average live/modeled congestion inside a hotspot radius.
   Rings must track REAL slowdowns — never invent rush-hour glow at 3 AM. */
const _hotCongCache=new Map();
let _hotCongAt=0;
function congFromLiveMph(cur,ff){
  const ratio=ff>0?clamp(cur/ff,0,1.3):1;
  /* Free-flow deadband: 80%+ of posted is not a hotspot */
  if(ratio>=0.80)return 0;
  if(ratio>=0.55)return clamp((0.80-ratio)/0.25*0.48,0,0.48); /* slow → just under heavy */
  return clamp(0.48+(0.55-ratio)/0.55*0.52,0.48,1); /* heavy → jam */
}
function hotspotLiveCong(hs){
  const now=performance.now();
  const cached=_hotCongCache.get(hs.name);
  if(cached&&(now-_hotCongAt)<400)return cached;
  if(!window.roads||!roads.length){
    const out={cong:0,liveShare:0,samples:0,live:false};
    _hotCongCache.set(hs.name,out);return out;
  }
  let peak=0,sum=0,n=0,liveSeg=0,liveSum=0,liveMphN=0,liveMphSum=0;
  for(const road of roads){
    if(road.def.arterial||road.def.surface||road.suburbTraffic)continue;
    for(const dir of road.dirs){
      const liveKey=road.def.id+'_'+dir.sign;
      const flow=window.LIVE_TRAFFIC&&window.LIVE_TRAFFIC.flows&&window.LIVE_TRAFFIC.flows.get(liveKey);
      const liveOk=liveMode&&liveFlowFresh(flow);
      const liveC=liveOk?congFromLiveMph(flow.cur,flow.ff||road.def.ff):null;
      for(let k=0;k<dir.segCong.length;k++){
        const x=road.segX[k],z=road.segZ[k];
        if(Math.hypot(x-hs.x,z-hs.z)>hs.r)continue;
        let segC=dir.segCong[k];
        if(liveC!=null){
          segC=liveC; /* live mph is ground truth for the ring */
          liveSeg++;liveSum+=liveC;
          liveMphN++;liveMphSum+=flow.cur;
        }
        peak=Math.max(peak,segC);
        sum+=segC;n++;
      }
    }
  }
  const avg=n?sum/n:0;
  const liveAvg=liveSeg?liveSum/liveSeg:null;
  const rush=(typeof demand==='function'?demand(simH,weekend):0.5);
  const overnight=rush<0.30; /* ~10pm–5:30am weekday / quiet weekend hours */
  let cong=0;
  if(liveMode&&liveAvg!=null&&liveSeg>0){
    /* Live mode: rings follow probes only — no demand floor */
    cong=Math.max(liveAvg,peak*0.75);
    /* Overnight: need a real crawl before lighting a ring */
    if(overnight&&cong<0.62)cong*=0.35;
  }else{
    /* Time-lapse / no live coverage: modeled segments only, soft rush accent */
    cong=Math.max(avg,peak*0.85);
    if(rush>0.75)cong=Math.max(cong,rush*hs.k*0.35);
    else if(overnight)cong*=0.45;
  }
  const out={cong:clamp(cong,0,1),liveShare:n?liveSeg/n:0,samples:n,live:!!(liveAvg!=null&&liveSeg>0),
    avgMph:liveMphN?Math.round(liveMphSum/liveMphN):null};
  _hotCongCache.set(hs.name,out);
  return out;
}
function flushHotCongCache(){_hotCongAt=performance.now();_hotCongCache.clear();}

/* ---------------- road materials ---------------- */
function asphaltTexture(base,noise){
  const c=document.createElement('canvas');c.width=128;c.height=128;const x=c.getContext('2d');
  x.fillStyle=base;x.fillRect(0,0,128,128);
  for(let i=0;i<2200;i++){
    x.fillStyle=rand()<0.5?'rgba(255,255,255,'+(0.02+rand()*noise)+')':'rgba(0,0,0,'+(0.03+rand()*noise)+')';
    x.fillRect(rand()*128,rand()*128,1+rand()*2,1+rand()*2);}
  x.fillStyle='rgba(0,0,0,.12)';
  x.fillRect(18,0,22,128);x.fillRect(88,0,22,128);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
const matAsphalt=new THREE.MeshLambertMaterial({map:asphaltTexture('#2c3036',0.06)});
const matAsphaltArt=new THREE.MeshLambertMaterial({map:asphaltTexture('#34383e',0.05)});
/* real-world road skin: every marking is painted INTO the pavement texture,
   so nothing coplanar can ever z-fight, and lines are properly dashed */
const _skinCache={};window.roadMats=[];
function roadSkinMat(def){
  const key=(HTS_IS_AUS?'a':'h')+'_'+def.lanes+'_'+Math.round(def.width)+'_'+(def.arterial?1:0);
  if(!_skinCache[key]){
    const W=256,H=128,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
    if(HTS_IS_AUS){
      /* F4: flat gray pavement + dark edge (no busy lane paint) */
      x.fillStyle=def.arterial?'#9a9ea4':'#8e9298';x.fillRect(0,0,W,H);
      for(let i=0;i<600;i++){x.fillStyle=rand()<0.5?'rgba(255,255,255,.04)':'rgba(0,0,0,.05)';
        x.fillRect(rand()*W,rand()*H,1.5,1.5);}
      x.fillStyle='rgba(30,32,36,.55)';
      x.fillRect(0,0,10,H);x.fillRect(W-10,0,10,H);
      x.fillStyle='rgba(40,44,48,.28)';
      x.fillRect(W*0.48,0,W*0.04,H);
    }else{
      x.fillStyle=def.arterial?'#4a4f56':'#42474e';x.fillRect(0,0,W,H);
      for(let i=0;i<1600;i++){x.fillStyle=rand()<0.5?'rgba(255,255,255,.05)':'rgba(0,0,0,.07)';
        x.fillRect(rand()*W,rand()*H,1.5,1.5);}
      const u=off=>(off/def.width+0.5)*W;
      const laneW=(def.width/2-2.0-1.7)/def.lanes;
      /* shoulders */
      x.fillStyle='rgba(0,0,0,.22)';
      x.fillRect(0,0,u(-(def.width/2-1.0)),H);
      x.fillRect(u(def.width/2-1.0),0,W-u(def.width/2-1.0),H);
      /* tire polish per lane */
      x.fillStyle='rgba(0,0,0,.13)';
      for(const sg of [1,-1])for(let l=0;l<def.lanes;l++){
        const cU=u(sg*(1.7+(l+0.5)*laneW));
        const halfLanePx=laneW/def.width*W*0.22;
        const wpx=Math.max(3,halfLanePx*0.9);
        x.fillRect(cU-halfLanePx-wpx/2,0,wpx,H);
        x.fillRect(cU+halfLanePx-wpx/2,0,wpx,H);
      }
      /* solid white edge lines — thicker so they read when zoomed in */
      x.fillStyle='#f5f7fa';
      for(const sg of [1,-1]){const eU=u(sg*(def.width/2-1.4));x.fillRect(eU-2.8,0,5.6,H);}
      /* double yellow center */
      x.fillStyle='#e8bc28';
      x.fillRect(u(-1.15)-1.8,0,3.6,H);
      x.fillRect(u(1.15)-1.8,0,3.6,H);
      /* dashed white separators */
      x.fillStyle='#f0f2f5';
      for(const sg of [1,-1])for(let l=1;l<def.lanes;l++){
        const dU=u(sg*(1.7+l*laneW));
        for(let y=4;y<H;y+=26)x.fillRect(dU-2.2,y,4.4,12);
      }
    }
    const t=new THREE.CanvasTexture(c);
    t.wrapS=THREE.ClampToEdgeWrapping;t.wrapT=THREE.RepeatWrapping;
    t.anisotropy=MAXAN;
    _skinCache[key]=t;
  }
  const m=new THREE.MeshLambertMaterial({map:_skinCache[key],
    emissive:new THREE.Color(HTS_IS_AUS?0x6a6e74:0x232529),emissiveIntensity:0,
    polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
  roadMats.push(m);return m;
}
const concreteTex=(function(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  x.fillStyle='#585c62';x.fillRect(0,0,128,128);
  for(let i=0;i<900;i++){x.fillStyle=rand()<0.5?'rgba(255,255,255,.05)':'rgba(0,0,0,.07)';
    x.fillRect(rand()*128,rand()*128,1+rand()*3,1+rand()*3);}
  for(let i=0;i<7;i++){x.fillStyle='rgba(0,0,0,.10)';x.fillRect(0,18*i+rand()*8,128,1.5);} /* form lines */
  for(let i=0;i<10;i++){x.fillStyle='rgba(30,32,36,.16)';const sx=rand()*128;x.fillRect(sx,0,1,60+rand()*68);} /* weep streaks */
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,1);return t;})();
const matDeckSide=new THREE.MeshLambertMaterial({map:concreteTex,side:THREE.DoubleSide});
const matUnder=new THREE.MeshLambertMaterial({map:concreteTex,color:0x84888e});
const matShoulder=new THREE.MeshLambertMaterial({color:0x393d43});
const matShadow=new THREE.MeshBasicMaterial({color:0x0e120c,transparent:true,opacity:0.16,depthWrite:false});
const matLineW=new THREE.MeshBasicMaterial({color:0xdadce0});
const matLineY=new THREE.MeshBasicMaterial({color:0xdcac20});
/* Houston sidewalks — pale concrete, slightly raised */
const matSidewalk=new THREE.MeshLambertMaterial({color:0xa8a9a4});
const matSidewalkDT=new THREE.MeshLambertMaterial({color:0xb0b1ac}); /* downtown a bit lighter */
const matCurb=new THREE.MeshLambertMaterial({color:0x8a8b86});

const CENTER=new THREE.Vector2(0,0);
const roads=[];const roadSamplePts=[];const pillarSpots=[];const girderSpots=[];
for(const {def,s} of roadSamples){
  const surf=new THREE.Mesh(ribbonGeom(s,def.width,0,0,false,34),roadSkinMat(def));
  gRoads3D.add(surf);
  const isFwy=!def.arterial&&!def.surface;
  if(isFwy){
    gRoads3D.add(new THREE.Mesh(wallGeomVar(s, def.width/2), matDeckSide));
    gRoads3D.add(new THREE.Mesh(wallGeomVar(s,-def.width/2), matDeckSide));
    gRoads3D.add(new THREE.Mesh(ribbonGeom(s,def.width*0.985,-1.55,0,false,0),matUnder));
    gRoads3D.add(new THREE.Mesh(flatRibbonGeom(s,def.width*1.05,0.065),matShadow));
    for(let i=0;i<=s.n;i+=8)if(s.py[i]>3.4)pillarSpots.push([s.px[i],s.pz[i],s.py[i]-1.4]);
    for(let i=0;i<=s.n;i+=5)if(s.py[i]>3.0)girderSpots.push([s.px[i],s.pz[i],s.py[i]-1.12,Math.atan2(-s.tz[i],s.tx[i]),def.width*0.96]);
  }else{
    gRoads3D.add(new THREE.Mesh(flatRibbonGeom(s,def.width*1.04,0.055),matShadow));
  }
  /* Sidewalks — Houston-style: concrete strips on arterials / surface only (not freeways).
     Narrow & patchy feel: downtown wider, suburbs thinner. */
  if(def.arterial||def.surface){
    const nearDT=Math.hypot((s.px[0]+s.px[s.n])*0.5-60,(s.pz[0]+s.pz[s.n])*0.5-60)<900;
    const sw=nearDT?(def.arterial?3.4:2.8):(def.arterial?2.4:1.9);
    const lat=def.width*0.5+sw*0.55+0.35;
    const matSW=nearDT?matSidewalkDT:matSidewalk;
    gRoads3D.add(new THREE.Mesh(ribbonGeom(s,sw,0.09, lat,false,0),matSW));
    gRoads3D.add(new THREE.Mesh(ribbonGeom(s,sw,0.09,-lat,false,0),matSW));
    /* thin curb strip between asphalt and walk */
    const curbW=0.55,curbLat=def.width*0.5+0.35;
    gRoads3D.add(new THREE.Mesh(ribbonGeom(s,curbW,0.14, curbLat,false,0),matCurb));
    gRoads3D.add(new THREE.Mesh(ribbonGeom(s,curbW,0.14,-curbLat,false,0),matCurb));
  }
  const laneW=(def.width/2-2.0-1.7)/def.lanes;

  for(let i=0;i<=s.n;i+=3)roadSamplePts.push([s.px[i],s.pz[i],def.short,def.width/2+26,!def.arterial&&!def.surface]);

  const segCount=clamp(Math.round(s.total/300),6,34);
  const segX=new Float32Array(segCount),segZ=new Float32Array(segCount);
  for(let k=0;k<segCount;k++){const i=Math.min(s.n,Math.round((k+0.5)/segCount*s.n));segX[k]=s.px[i];segZ[k]=s.pz[i];}
  const road={def,s,segCount,dirs:[],laneW,segX,segZ};
  for(const sign of [1,-1]){
    const segMult=new Float32Array(segCount),segInb=new Float32Array(segCount),
          segCong=new Float32Array(segCount),segPhase=new Float32Array(segCount);
    for(let k=0;k<segCount;k++){
      const i=Math.min(s.n,Math.round((k+0.5)/segCount*s.n));
      segMult[k]=hotspotMult(s.px[i],s.pz[i]);
      const toC=new THREE.Vector2(CENTER.x-s.px[i],CENTER.y-s.pz[i]).normalize();
      segInb[k]=clamp((s.tx[i]*sign)*toC.x+(s.tz[i]*sign)*toC.y,-1,1);
      segPhase[k]=rand()*TAU;
    }
    const lat=sign*(def.width*0.27);
    /* Congestion tint sits just above asphalt — low opacity so lane paint stays readable */
    const g=ribbonGeom(s,def.width*0.32,0.06,lat,true,0);
    const strip=new THREE.Mesh(g,new THREE.MeshBasicMaterial({
      vertexColors:true,transparent:true,opacity:0.42,depthWrite:false,
      polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4
    }));
    gRoads3D.add(strip);
    const lanes=[];for(let l=0;l<def.lanes;l++)lanes.push([]);
    road.dirs.push({sign,segMult,segInb,segCong,segPhase,strip,lanes,target:0});
  }
  roads.push(road);
}
window.roads=roads;
console.log('%cRoad network ready: '+roads.length+' corridors','color:#7fd6a0');
(function(){
  const n=pillarSpots.length;if(!n)return;
  const g=new THREE.CylinderGeometry(1.9,2.4,1,8);g.translate(0,0.5,0);
  const m=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:0x585d63}),n);
  const d=new THREE.Object3D();
  for(let i=0;i<n;i++){const p=pillarSpots[i];
    d.position.set(p[0],0,p[1]);d.scale.set(1,p[2],1);d.updateMatrix();m.setMatrixAt(i,d.matrix);}
  gRoads3D.add(m);
})();
/* girder crossbeams under elevated spans */
(function(){
  const n=girderSpots.length;if(!n)return;
  const g=new THREE.BoxGeometry(1,0.85,2.2);
  const m=new THREE.InstancedMesh(g,matDeckSide,n);
  const d=new THREE.Object3D();
  for(let i=0;i<n;i++){const p=girderSpots[i];
    d.position.set(p[0],p[2],p[1]);d.rotation.set(0,p[3],0);d.scale.set(p[4],1,1);
    d.updateMatrix();m.setMatrixAt(i,d.matrix);}
  gRoads3D.add(m);
})();
/* bayous & rivers — grassy banks + channel water */
(function(){
  const bankMat=new THREE.MeshLambertMaterial({color:0x4a7a3a});
  const bankOuter=new THREE.MeshLambertMaterial({color:0x5a8a42});
    /* Austin: Lady Bird is a wide river through downtown (not a thin creek) */
    const specs=HTS_IS_AUS
    ?[[LADYBIRD,110,92,matLake],[SHOAL,14,10,matBayou],[WALLER,10,7,matBayou],[BARTON_CK,12,8,matBayou],[ONION,16,11,matBayou]]
    :(HTS_HAS_PACK
      ?(LADYBIRD.length>=2?[[LADYBIRD,70,55,matLake]]:[])
      :[[BAYOU,52,34,matBayou],[BRAYS,36,22,matBayou],[WHITEOAK,40,24,matBayou],
        [SIMS,34,20,matBayou],[GREENS,36,22,matBayou],[SANJAC,58,38,matWater]]);
  for(const [pts,bw,ww,wmat] of specs){
    if(!pts||pts.length<2)continue;
    const s=sampleCurve(pts,false,HTS_IS_AUS?22:30);
    if(!HTS_IS_AUS&&!HTS_HAS_PACK){
      gDetail.add(new THREE.Mesh(ribbonGeom(s,bw*1.55,0.015,0,false,0),bankOuter));
      gDetail.add(new THREE.Mesh(ribbonGeom(s,bw,0.02,0,false,0),bankMat));
    }else if(pts===LADYBIRD){
      /* Green banks outside the wide blue channel */
      gDetail.add(new THREE.Mesh(ribbonGeom(s,14,0.028,52,false,0),bankMat));
      gDetail.add(new THREE.Mesh(ribbonGeom(s,14,0.028,-52,false,0),bankMat));
      gDetail.add(new THREE.Mesh(ribbonGeom(s,10,0.022,62,false,0),bankOuter));
      gDetail.add(new THREE.Mesh(ribbonGeom(s,10,0.022,-62,false,0),bankOuter));
    }else{
      gDetail.add(new THREE.Mesh(ribbonGeom(s,10,0.025,22,false,0),bankMat));
      gDetail.add(new THREE.Mesh(ribbonGeom(s,10,0.025,-22,false,0),bankMat));
    }
    gDetail.add(new THREE.Mesh(ribbonGeom(s,ww,0.055,0,false,0),wmat));
  }
  /* Keep river channel clear of towers/trees */
  if((HTS_IS_AUS||HTS_HAS_PACK)&&LADYBIRD&&LADYBIRD.length>=2){
    const s=sampleCurve(LADYBIRD,false,18);
    const rr=HTS_IS_AUS?48:36;
    for(let i=0;i<=s.n;i++)EXCLUDES.push({x:s.px[i],z:s.pz[i],r:rr,water:true});
  }
})();

/* Austin Hill Country relief — Balcones west of MoPac (Houston stays flat prairie) */
if(HTS_IS_AUS)(function(){
  const hillMat=new THREE.MeshLambertMaterial({color:0x6e7858});
  const limMat=new THREE.MeshLambertMaterial({color:0x9a9484});
  const hills=[
    [30.321,-97.773,160,62],  /* Mount Bonnell */
    [30.298,-97.807,200,48],  /* West Lake Hills */
    [30.28,-97.82,180,40],
    [30.34,-97.86,240,52],
    [30.37,-97.90,260,55],
    [30.41,-97.88,220,45],
    [30.26,-97.81,150,35],
    [30.31,-97.85,190,42],
  ];
  for(const [lat,lng,r,h] of hills){
    const p=geoToWorld(lat,lng);
    const g=new THREE.SphereGeometry(1,20,12,0,TAU,0,Math.PI*0.52);
    const m=new THREE.Mesh(g,rand()<.35?limMat:hillMat);
    m.scale.set(r,h,r*0.88);m.position.set(p.x,-2,p.z);gDetail.add(m);
    EXCLUDES.push({x:p.x,z:p.z,r:r*0.55});
  }
})();

/* position lookup (with elevation) */
function roadPos(road,sdist,out){
  const s=road.s;let d=sdist;
  if(s.closed){d=((d%s.total)+s.total)%s.total;}else{d=clamp(d,0,s.total);}
  let lo=0,hi=s.n;
  while(lo<hi){const mid=(lo+hi)>>1;if(s.cum[mid]<d)lo=mid+1;else hi=mid;}
  const i=Math.max(1,lo);const c0=s.cum[i-1],c1=s.cum[i];
  const u=c1>c0?(d-c0)/(c1-c0):0;
  out.px=lerp(s.px[i-1],s.px[i],u);out.pz=lerp(s.pz[i-1],s.pz[i],u);
  out.py=lerp(s.py[i-1],s.py[i],u);
  out.tx=lerp(s.tx[i-1],s.tx[i],u);out.tz=lerp(s.tz[i-1],s.tz[i],u);
  const m=Math.hypot(out.tx,out.tz)||1;out.tx/=m;out.tz/=m;return out;
}
function nearestArc(road,x,z){
  const s=road.s;let best=1e18,bi=0;
  for(let i=0;i<=s.n;i++){const dx=s.px[i]-x,dz=s.pz[i]-z;const d=dx*dx+dz*dz;
    if(d<best){best=d;bi=i;}}
  return s.cum[bi];
}

/* ---- OSM suburb / arterial visual LOD (streamed, not in traffic sim) ---- */
const gOsmLod=new THREE.Group();scene.add(gOsmLod);
const OSM_LOD={
  ready:false,loading:false,
  arterial:[],local:[],
  artIdx:null,locIdx:null,
  meshes:new Map(), /* id -> mesh */
  matArt:null,matLoc:null,
  lastCell:'',
  maxMeshes:750,
  _lodSkip:0
};
async function initOsmLod(){
  if(HTS_PACK&&HTS_PACK.skipOsmLod)return;
  if(OSM_LOD.loading||OSM_LOD.ready)return;
  OSM_LOD.loading=true;
  try{
    const idx=await fetch('/data/roads-index.json',{cache:'force-cache'}).then(r=>r.ok?r.json():null);
    if(!idx){OSM_LOD.loading=false;return;}
    const [art,loc]=await Promise.all([
      fetch(idx.arterial||'/data/roads-arterial-kept.json',{cache:'force-cache'}).then(r=>r.ok?r.json():{roads:[]}),
      fetch(idx.local||'/data/roads-local-kept.json',{cache:'force-cache'}).then(r=>r.ok?r.json():{roads:[]})
    ]);
    OSM_LOD.arterial=art.roads||[];
    OSM_LOD.local=loc.roads||[];
    OSM_LOD.artIdx=idx.arterialIndex||null;
    OSM_LOD.locIdx=idx.localIndex||null;
    OSM_LOD.matArt=new THREE.MeshLambertMaterial({color:0x5a6068,
      polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
    OSM_LOD.matLoc=new THREE.MeshLambertMaterial({color:0x545a62,
      polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
    OSM_LOD.matLine=new THREE.MeshBasicMaterial({color:0xe8eaee,transparent:true,opacity:0.62,depthWrite:false});
    OSM_LOD.matYellow=new THREE.MeshBasicMaterial({color:0xe0b020,transparent:true,opacity:0.75,depthWrite:false});
    OSM_LOD.ready=true;
    console.log('%cOSM LOD ready: '+OSM_LOD.arterial.length+' arterials, '+OSM_LOD.local.length+' local streets','color:#7fd6a0');
  }catch(e){
    console.warn('OSM LOD load failed',e);
  }finally{
    OSM_LOD.loading=false;
  }
}
function osmCellsAround(x,z,cell,ring){
  const cx=Math.floor(x/cell),cz=Math.floor(z/cell);
  const out=[];
  for(let dx=-ring;dx<=ring;dx++)for(let dz=-ring;dz<=ring;dz++)out.push((cx+dx)+':'+(cz+dz));
  return out;
}
function ensureOsmMesh(def,mat){
  if(OSM_LOD.meshes.has(def.id))return OSM_LOD.meshes.get(def.id);
  if(OSM_LOD.meshes.size>=OSM_LOD.maxMeshes)return null;
  try{
    const s=sampleCurve(def.pts,!!def.closed,def.layer==='local'?28:18);
    for(let i=0;i<=s.n;i++)s.py[i]=def.baseY||0.55;
    const w=Math.max(def.width||(def.layer==='local'?11:15),def.layer==='local'?11:15);
    const grp=new THREE.Group();
    const mesh=new THREE.Mesh(ribbonGeom(s,w,0,0,false,0),mat);
    grp.add(mesh);
    /* Centerline so suburb streets read as roads, not gray ribbons */
    if(def.layer!=='local'&&OSM_LOD.matYellow){
      grp.add(new THREE.Mesh(ribbonGeom(s,0.55,0.04,0,false,0),OSM_LOD.matYellow));
    }else if(OSM_LOD.matLine){
      grp.add(new THREE.Mesh(ribbonGeom(s,0.35,0.04,0,false,0),OSM_LOD.matLine));
    }
    grp.userData.osmId=def.id;
    gOsmLod.add(grp);
    OSM_LOD.meshes.set(def.id,grp);
    return grp;
  }catch(e){return null;}
}
function updateOsmLod(camX,camZ,radius){
  if(!OSM_LOD.ready)return;
  /* Far out: hide suburb mesh to keep FPS. Keep arterials visible when zoomed in. */
  const showArt=radius<7200;
  const showLoc=radius<3200;
  gOsmLod.visible=showArt;
  if(!showArt){syncSuburbTraffic(camX,camZ,radius,new Set());return;}
  const cell=showLoc?400:500;
  const ring=showLoc?3:4;
  const key=Math.floor(camX/cell)+':'+Math.floor(camZ/cell)+':'+(showLoc?1:0);
  if(key===OSM_LOD.lastCell)return; /* suburb cars disabled — no per-frame sync needed */
  OSM_LOD.lastCell=key;

  const want=new Set();
  if(showArt&&OSM_LOD.artIdx){
    for(const c of osmCellsAround(camX,camZ,OSM_LOD.artIdx.cell||500,ring)){
      const list=OSM_LOD.artIdx.index[c];
      if(!list)continue;
      for(const i of list){
        const def=OSM_LOD.arterial[i];
        if(!def)continue;
        want.add(def.id);
        ensureOsmMesh(def,OSM_LOD.matArt);
      }
    }
  }
  if(showLoc&&OSM_LOD.locIdx){
    for(const c of osmCellsAround(camX,camZ,OSM_LOD.locIdx.cell||400,2)){
      const list=OSM_LOD.locIdx.index[c];
      if(!list)continue;
      for(const i of list){
        const def=OSM_LOD.local[i];
        if(!def)continue;
        want.add(def.id);
        ensureOsmMesh(def,OSM_LOD.matLoc);
      }
    }
  }
  /* Cull meshes far from camera */
  for(const [id,mesh] of OSM_LOD.meshes){
    if(want.has(id)){mesh.visible=true;continue;}
    mesh.visible=false;
    if(OSM_LOD.meshes.size>OSM_LOD.maxMeshes*0.9&&!want.has(id)){
      gOsmLod.remove(mesh);
      try{
        mesh.traverse(ch=>{if(ch.geometry)ch.geometry.dispose();});
      }catch(e){}
      OSM_LOD.meshes.delete(id);
    }
  }
  OSM_LOD.lastWant=want;
  syncSuburbTraffic(camX,camZ,radius,want);
}
window.initOsmLod=initOsmLod;
window.updateOsmLod=updateOsmLod;

/* ---- Suburban OSM traffic: moving cars on streamed streets ---- */
const SUBURB_TRAFFIC={active:new Map(),maxRoads:14,seedPerRoad:4,_cell:''};
function osmPathLen(pts){
  if(!pts||pts.length<2)return 0;
  let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
  return L;
}
function osmPathNearClosed(pts,maxGap){
  if(!pts||pts.length<3)return false;
  const a=pts[0],b=pts[pts.length-1];
  return Math.hypot(a[0]-b[0],a[1]-b[1])<(maxGap||100);
}
/** Skip cul-de-sac rings / tiny loops — they look like cars driving rectangles on grass */
function osmDefOkForTraffic(def){
  if(!def||!def.pts||def.pts.length<2)return false;
  if(def.closed)return false;
  const len=def._len||osmPathLen(def.pts);
  if(len<160)return false;
  if(osmPathNearClosed(def.pts,110)&&len<700)return false;
  const hw=String(def.highway||'');
  if(hw==='residential'){
    if(len<380)return false;
    if(def.pts.length<=6&&len<520)return false;
  }
  if(hw==='unclassified'&&len<300)return false;
  /* Prefer named through-streets over anonymous stubs */
  if((!def.name||/^residential$/i.test(def.name))&&hw==='residential'&&len<600)return false;
  return true;
}
function buildSuburbTrafficRoad(osmDef){
  if(!osmDefOkForTraffic(osmDef))return null;
  const isLocal=osmDef.layer==='local';
  const hw=String(osmDef.highway||'');
  const isRes=hw==='residential';
  const s=sampleCurve(osmDef.pts,false,isLocal?30:20);
  if(s.total<160)return null;
  for(let i=0;i<=s.n;i++)s.py[i]=osmDef.baseY||0.55;
  const lanes=Math.max(1,Math.min(isRes?1:2,osmDef.lanes||(isLocal?1:2)));
  const width=Math.max(osmDef.width||(isLocal?10:16),isRes?11:14);
  const def={
    id:'sub-'+osmDef.id,name:osmDef.name||osmDef.short||'Suburban st',short:osmDef.short||'Street',
    closed:false,width,lanes,
    ff:isRes?28:(isLocal?32:42),share:0.045,baseY:0.55,prio:0,
    arterial:!isLocal&&!isRes,surface:isLocal||isRes,suburbTraffic:true,highway:hw
  };
  const laneW=Math.max(2.4,(width/2-1.6-1.2)/lanes);
  const segCount=clamp(Math.round(s.total/180),4,18);
  const segX=new Float32Array(segCount),segZ=new Float32Array(segCount);
  for(let k=0;k<segCount;k++){const i=Math.min(s.n,Math.round((k+0.5)/segCount*s.n));segX[k]=s.px[i];segZ[k]=s.pz[i];}
  const road={def,s,segCount,dirs:[],laneW,segX,segZ,suburbTraffic:true};
  /* Residential: one direction only — two-way on a 4-point loop doubles the “rectangle of cars” glitch */
  const signs=isRes?[1]:[1,-1];
  for(const sign of signs){
    const segMult=new Float32Array(segCount),segInb=new Float32Array(segCount),
          segCong=new Float32Array(segCount),segPhase=new Float32Array(segCount);
    for(let k=0;k<segCount;k++){
      const i=Math.min(s.n,Math.round((k+0.5)/segCount*s.n));
      segMult[k]=hotspotMult(s.px[i],s.pz[i])*0.55;
      const toC=new THREE.Vector2(CENTER.x-s.px[i],CENTER.y-s.pz[i]).normalize();
      segInb[k]=clamp((s.tx[i]*sign)*toC.x+(s.tz[i]*sign)*toC.y,-1,1);
      segPhase[k]=rand()*TAU;
    }
    const lanesArr=[];for(let l=0;l<lanes;l++)lanesArr.push([]);
    road.dirs.push({sign,segMult,segInb,segCong,segPhase,strip:null,lanes:lanesArr,target:0});
  }
  return road;
}
function seedSuburbVehicles(road,n){
  const isRes=road.def&&road.def.highway==='residential';
  const count=isRes?Math.min(n,3):n;
  for(const dir of road.dirs){
    const lanes=dir.lanes,L=road.s.total;
    const perLane=Math.max(1,Math.ceil(count/lanes.length));
    const headway=L/Math.max(perLane,1);
    for(let li=0;li<lanes.length;li++){
      const lane=lanes[li];
      for(let i=0;i<perLane;i++){
        let s0=headway*(i+0.55)+rand()*headway*0.1;
        s0=clamp(s0,L*0.06,L*0.94);
        const v=makeVehicle(road,s0,road.def.ff*(0.45+rand()*0.25));
        v._laneI=li;
        insertVehicleSorted(lane,v);
      }
    }
  }
}
function removeSuburbTrafficRoad(road){
  if(!road||!road.suburbTraffic)return;
  const idx=roads.indexOf(road);
  if(idx>=0)roads.splice(idx,1);
  for(const dir of road.dirs)for(const lane of dir.lanes)lane.length=0;
  SUBURB_TRAFFIC.active.delete(road.def.id);
}
function syncSuburbTraffic(camX,camZ,radius,wantMeshIds){
  /* v10.8.6-style traffic: cars only on the main freeway/arterial network.
     OSM LOD still draws real suburb asphalt — no simulated cars on cul-de-sacs. */
  if(SUBURB_TRAFFIC.active.size){
    for(const road of [...SUBURB_TRAFFIC.active.values()])removeSuburbTrafficRoad(road);
  }
}
function refreshIncidentCount(){
  const el=$('incidentCount');if(!el)return;
  const liveN=(window.LIVE_TRAFFIC&&window.LIVE_TRAFFIC.incidents)?window.LIVE_TRAFFIC.incidents.length:0;
  const nwsN=(window.LIVE_NWS&&window.LIVE_NWS.count)||0;
  const shown=Math.min(10,liveN)+Math.min(6,nwsN);
  if(shown>0){
    el.textContent=shown+(shown===1?' active':(' active'));
    el.classList.remove('empty');
  }else{
    el.textContent='Clear';
    el.classList.add('empty');
  }
}

/* streetlights — arterials, surface roads, AND freeways (night glow) */
const lampHeads=(function(){
  const positions=[];
  for(const road of roads){
    const isFwy=!road.def.arterial&&!road.def.surface;
    const step=isFwy?5:7; /* denser on freeways */
    const s=road.s;
    for(let i=3;i<s.n;i+=step){positions.push([s.px[i],s.pz[i],s.py[i],s.tx[i],s.tz[i],road.def.width,isFwy?1:0]);}
  }
  const n=positions.length;
  const poleG=new THREE.CylinderGeometry(0.28,0.38,11,5);poleG.translate(0,5.5,0);
  const poles=new THREE.InstancedMesh(poleG,new THREE.MeshLambertMaterial({color:0x3a3f45}),n);
  const headG=new THREE.SphereGeometry(1.05,6,5);headG.translate(0,11.4,0);
  const headMat=new THREE.MeshBasicMaterial({color:0xffd080,transparent:true,opacity:0});
  const heads=new THREE.InstancedMesh(headG,headMat,n);
  const d=new THREE.Object3D();
  for(let i=0;i<n;i++){
    const p=positions[i];
    const rx=-p[4], rz=p[3];
    const side=(i%2?1:-1)*(p[5]*0.5+(p[6]?4.5:2.2));
    d.position.set(p[0]+rx*side,p[2],p[1]+rz*side);d.updateMatrix();
    poles.setMatrixAt(i,d.matrix);heads.setMatrixAt(i,d.matrix);
  }
  gRoads3D.add(poles);gRoads3D.add(heads);
  const lpTex=(function(){const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');
    const g=x.createRadialGradient(32,32,2,32,32,30);
    g.addColorStop(0,'rgba(255,220,140,.75)');g.addColorStop(.4,'rgba(255,200,110,.35)');g.addColorStop(.7,'rgba(255,190,100,.12)');g.addColorStop(1,'rgba(255,190,100,0)');
    x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const lpGeo=new THREE.PlaneGeometry(32,32);lpGeo.rotateX(-Math.PI/2);
  window.lampPoolMat=new THREE.MeshBasicMaterial({map:lpTex,transparent:true,opacity:0,
    blending:THREE.AdditiveBlending,depthWrite:false});
  const lp=new THREE.InstancedMesh(lpGeo,lampPoolMat,n);
  for(let i=0;i<n;i++){
    const p=positions[i];
    const rx=-p[4], rz=p[3];
    const side=(i%2?1:-1)*(p[5]*0.5+(p[6]?4.5:2.2));
    d.position.set(p[0]+rx*side,p[2]+0.13,p[1]+rz*side);d.updateMatrix();lp.setMatrixAt(i,d.matrix);
  }
  gRoads3D.add(lp);
  return headMat;
})();

/* District label radius from incorporated land area (sq mi) — √(A/π) miles → world units */
function districtRFromSqMi(sqMi,kind){
  const k=kind==='major'?1.12:kind==='hood'?0.72:kind==='cdp'?1.02:0.94;
  const mi=Math.sqrt(Math.max(sqMi,5)/Math.PI);
  return Math.round(clamp(mi*UNITS_PER_MILE*0.88*k,200,680));
}
function districtAt(id,n,lat,lng,sqMi,kind){
  const w=geoToWorld(lat,lng);
  return {id,n,x:Math.round(w.x),z:Math.round(w.z),r:districtRFromSqMi(sqMi,kind),lat,lng,sqMi};
}
/* ---------------- districts (10-county Houston MSA) ---------------- */
const DISTRICTS_CORE=[
 {id:'downtown',n:'Downtown',x:60,z:60,r:520},
 {id:'galleria',n:'Galleria · Uptown',x:-980,z:180,r:420},
 {id:'medcenter',n:'Texas Medical Center',x:-290,z:800,r:380},
 {id:'greenway',n:'Greenway Plaza',x:-680,z:470,r:280},
 {id:'montrose',n:'Montrose',x:-360,z:260,r:260},
 {id:'heights',n:'The Heights',x:-360,z:-420,r:300},
 {id:'riveroaks',n:'River Oaks',x:-620,z:180,r:240},
 {id:'bellaire',n:'Bellaire',x:-820,z:760,r:260},
 {id:'energycorridor',n:'Energy Corridor',x:-1860,z:-300,r:420},
 {id:'springbranch',n:'Spring Branch',x:-1450,z:-330,r:300},
 {id:'alief',n:'Alief',x:-2050,z:950,r:340},
 {id:'katy',n:'Katy',x:-3520,z:-180,r:560},
 {id:'sugarland',n:'Sugar Land',x:-3050,z:2260,r:560},
 {id:'missouricity',n:'Missouri City',x:-2280,z:2520,r:460},
 {id:'stafford',n:'Stafford',x:-2520,z:1780,r:300},
 {id:'richmond',n:'Richmond · Rosenberg',x:-4550,z:3300,r:520},
 {id:'cypress',n:'Cypress',x:-3020,z:-2420,r:520},
 {id:'tomball',n:'Tomball',x:-2650,z:-3250,r:460},
 {id:'jerseyvillage',n:'Jersey Village',x:-1650,z:-1520,r:300},
 {id:'greenspoint',n:'Greenspoint',x:-420,z:-1180,r:340},
 {id:'spring',n:'Spring',x:-950,z:-2950,r:420},
 {id:'woodlands',n:'The Woodlands',x:-1140,z:-3620,r:600},
 {id:'conroe',n:'Conroe',x:-1600,z:-4950,r:540},
 {id:'kingwood',n:'Humble · Kingwood',x:1340,z:-3620,r:520},
 {id:'atascocita',n:'Atascocita',x:1950,z:-3350,r:460},
 {id:'channelview',n:'Channelview',x:2600,z:-300,r:380},
 {id:'baytown',n:'Baytown',x:3800,z:-360,r:480},
 {id:'pasadena',n:'Pasadena',x:2450,z:420,r:520},
 {id:'deerpark',n:'Deer Park',x:2850,z:700,r:340},
 {id:'laporte',n:'La Porte',x:3250,z:950,r:340},
 {id:'clearlake',n:'Clear Lake · Webster',x:1750,z:2820,r:420},
 {id:'friendswood',n:'Friendswood',x:1250,z:3150,r:380},
 {id:'leaguecity',n:'League City',x:1950,z:3900,r:460},
 {id:'pearland',n:'Pearland',x:430,z:3420,r:520},
 {id:'midtown',n:'Midtown',x:-120,z:320,r:240},
 {id:'eastend',n:'East End · EaDo',x:380,z:120,r:280},
 {id:'fifthward',n:'Fifth Ward',x:280,z:-180,r:260},
 {id:'memorial',n:'Memorial',x:-1280,z:-80,r:380},
 {id:'westu',n:'West University',x:-720,z:520,r:220},
 {id:'meyerland',n:'Meyerland',x:-920,z:680,r:260},
 {id:'westchase',n:'Westchase',x:-1680,z:380,r:320},
 {id:'sharpstown',n:'Sharpstown',x:-1780,z:620,r:340},
 {id:'gulfton',n:'Gulfton',x:-1480,z:520,r:280},
 {id:'magnolia',n:'Magnolia',x:-2100,z:-3950,r:480},
 {id:'montgomery',n:'Montgomery',x:-1850,z:-4300,r:420},
 {id:'porter',n:'Porter · New Caney',x:850,z:-3200,r:460},
 {id:'hockley',n:'Hockley',x:-2350,z:-2850,r:400},
 {id:'crosby',n:'Crosby',x:2100,z:-2100,r:420},
 {id:'texascity',n:'Texas City',x:4200,z:3100,r:480},
 {id:'galveston',n:'Galveston',x:5100,z:3600,r:520},
 {id:'manvel',n:'Manvel',x:180,z:3780,r:380},
 {id:'alvin',n:'Alvin',x:680,z:4020,r:400},
 {id:'dickinson',n:'Dickinson',x:1450,z:3520,r:380},
 {id:'lakejackson',n:'Lake Jackson',x:3200,z:4200,r:460},
 {id:'seabrook',n:'Seabrook · Kemah',x:2750,z:3280,r:380},
];
/* Geo-placed additions — 10-county MSA gaps (lat/lng from USGS/Census; r from land area) */
const DISTRICTS_MORE=[
 districtAt('fulshear','Fulshear',29.690,-95.900,16,'city'),
 districtAt('galenapark','Galena Park',29.734,-95.238,5,'city'),
 districtAt('southhouston','South Houston',29.661,-95.236,3,'city'),
 districtAt('jacintocity','Jacinto City',29.767,-95.234,2,'city'),
 districtAt('webster','Webster',29.538,-95.119,7,'city'),
 districtAt('rosenberg','Rosenberg',29.557,-95.808,23,'city'),
 districtAt('angleton','Angleton',29.169,-95.432,12,'city'),
 districtAt('lamarque','La Marque',29.369,-95.050,14,'city'),
 districtAt('santafe','Santa Fe',29.378,-95.105,18,'city'),
 districtAt('hitchcock','Hitchcock',29.348,-95.019,7,'city'),
 districtAt('freeport','Freeport',28.954,-95.359,14,'city'),
 districtAt('dayton','Dayton',30.047,-94.885,11,'city'),
 districtAt('liberty','Liberty',30.058,-94.796,37,'city'),
 districtAt('cleveland','Cleveland',30.341,-95.085,5,'city'),
 districtAt('brookshire','Brookshire',29.786,-95.951,4,'city'),
 districtAt('waller','Waller',30.058,-95.927,4,'city'),
 districtAt('splendora','Splendora',30.232,-95.161,3,'city'),
 districtAt('rosharon','Rosharon',29.352,-95.462,18,'cdp'),
 districtAt('anahuac','Anahuac',29.773,-94.683,2,'city'),
 districtAt('huntsville','Huntsville',30.723,-95.551,24,'city'),
 districtAt('sealy','Sealy',29.781,-96.157,5,'city'),
 districtAt('hempstead','Hempstead',30.097,-96.078,6,'city'),
 districtAt('brenham','Brenham',30.167,-96.399,11,'city'),
];
/* Tune radii on hand-placed districts to match incorporated land area (sq mi) */
const DISTRICT_R_PATCH={
 downtown:340,galleria:380,medcenter:360,greenway:280,montrose:260,heights:300,riveroaks:240,
 bellaire:260,energycorridor:420,springbranch:300,alief:340,
 katy:districtRFromSqMi(55,'cdp'),sugarland:districtRFromSqMi(42,'city'),
 missouricity:districtRFromSqMi(30,'city'),stafford:districtRFromSqMi(7,'city'),
 richmond:districtRFromSqMi(28,'city'),cypress:districtRFromSqMi(95,'cdp'),
 tomball:districtRFromSqMi(12,'city'),jerseyvillage:districtRFromSqMi(4,'city'),
 greenspoint:districtRFromSqMi(22,'cdp'),spring:districtRFromSqMi(85,'cdp'),
 woodlands:districtRFromSqMi(46,'major'),conroe:districtRFromSqMi(72,'major'),
 kingwood:districtRFromSqMi(80,'cdp'),atascocita:districtRFromSqMi(45,'cdp'),
 channelview:districtRFromSqMi(25,'cdp'),baytown:districtRFromSqMi(36,'city'),
 pasadena:districtRFromSqMi(45,'city'),deerpark:districtRFromSqMi(11,'city'),
 laporte:districtRFromSqMi(20,'city'),clearlake:districtRFromSqMi(42,'cdp'),
 friendswood:districtRFromSqMi(21,'city'),leaguecity:districtRFromSqMi(54,'city'),
 pearland:districtRFromSqMi(48,'city'),manvel:districtRFromSqMi(12,'city'),
 alvin:districtRFromSqMi(26,'city'),dickinson:districtRFromSqMi(10,'city'),
 lakejackson:districtRFromSqMi(21,'city'),seabrook:districtRFromSqMi(8,'city'),
 texascity:districtRFromSqMi(65,'city'),galveston:districtRFromSqMi(46,'city'),
 magnolia:districtRFromSqMi(45,'city'),montgomery:districtRFromSqMi(5,'city'),
 porter:districtRFromSqMi(35,'cdp'),hockley:districtRFromSqMi(40,'cdp'),
 crosby:districtRFromSqMi(18,'city'),
};
const DISTRICTS=DISTRICTS_CORE.concat(DISTRICTS_MORE);
for(const d of DISTRICTS){if(DISTRICT_R_PATCH[d.id]!=null)d.r=DISTRICT_R_PATCH[d.id];}
if(HTS_PACK&&HTS_PACK.districts&&HTS_PACK.districts.length){
  DISTRICTS.length=0;
  for(const d of HTS_PACK.districts)DISTRICTS.push(d);
}
/* Every suburb needs lat/lng for its own Open-Meteo sample */
for(const d of DISTRICTS){
  if(!Number.isFinite(d.lat)||!Number.isFinite(d.lng)){
    const g=worldToGeo(d.x,d.z);
    d.lat=g.lat;d.lng=g.lng;
  }
}

function textSprite(txt,scaleK){
  const pad=26,fs=HTS_IS_AUS?56:64;
  const c=document.createElement('canvas');const x=c.getContext('2d');
  const label=String(txt||'').toUpperCase();
  x.font='900 '+fs+'px Overpass, sans-serif';
  if(x.letterSpacing!=null)x.letterSpacing=HTS_IS_AUS?'0.04em':'0.02em';
  const w=Math.ceil(x.measureText(label).width)+pad*2;
  c.width=Math.max(w,200);c.height=104;
  const g=x.createLinearGradient(0,0,0,c.height);
  g.addColorStop(0,'rgba(9,13,19,.9)');g.addColorStop(1,'rgba(9,13,19,.74)');
  x.fillStyle=g;
  const r=26;x.beginPath();
  x.moveTo(r,0);x.lineTo(c.width-r,0);x.quadraticCurveTo(c.width,0,c.width,r);
  x.lineTo(c.width,c.height-r);x.quadraticCurveTo(c.width,c.height,c.width-r,c.height);
  x.lineTo(r,c.height);x.quadraticCurveTo(0,c.height,0,c.height-r);
  x.lineTo(0,r);x.quadraticCurveTo(0,0,r,0);x.fill();
  x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=3;x.stroke();
  x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';
  x.font='900 '+fs+'px Overpass, sans-serif';
  if(x.letterSpacing!=null)x.letterSpacing=HTS_IS_AUS?'0.04em':'0.02em';
  x.fillText(label,c.width/2,c.height/2+2);
  const t=new THREE.CanvasTexture(c);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false}));
  sp.scale.set(c.width*0.55*scaleK,c.height*0.55*scaleK,1);
  return sp;
}
/** High-visibility hazard / storm warning labels for the 3D map. */
function warnSprite(kind,title,sub,scaleK){
  const themes={
    tornado:{bgTop:'#9f1239',bgBot:'#450a0a',accent:'#f87171',ink:'#fecaca',tag:'TORNADO'},
    hurricane:{bgTop:'#6d28d9',bgBot:'#2e1065',accent:'#c4b5fd',ink:'#ede9fe',tag:'HURRICANE'},
    flood:{bgTop:'#1d4ed8',bgBot:'#172554',accent:'#93c5fd',ink:'#dbeafe',tag:'FLOOD'},
    severe:{bgTop:'#c2410c',bgBot:'#431407',accent:'#fdba74',ink:'#ffedd5',tag:'SEVERE'},
    watch:{bgTop:'#a16207',bgBot:'#422006',accent:'#fde68a',ink:'#fef3c7',tag:'WATCH'},
  };
  const th=themes[kind]||themes.severe;
  const c=document.createElement('canvas');const x=c.getContext('2d');
  const titleTxt=String(title||th.tag).toUpperCase();
  const subTxt=sub?String(sub).toUpperCase():'';
  x.font='900 52px Overpass, sans-serif';
  const tw=x.measureText(titleTxt).width;
  x.font='800 28px Overpass, sans-serif';
  const sw=subTxt?x.measureText(subTxt).width:0;
  x.font='900 18px Overpass, sans-serif';
  const tagW=x.measureText(th.tag).width+28;
  c.width=Math.max(280,Math.ceil(Math.max(tw,sw,tagW)+88));
  c.height=subTxt?128:96;
  const g=x.createLinearGradient(0,0,0,c.height);
  g.addColorStop(0,th.bgTop);g.addColorStop(1,th.bgBot);
  x.fillStyle=g;
  const r=22;x.beginPath();
  x.moveTo(r,0);x.lineTo(c.width-r,0);x.quadraticCurveTo(c.width,0,c.width,r);
  x.lineTo(c.width,c.height-r);x.quadraticCurveTo(c.width,c.height,c.width-r,c.height);
  x.lineTo(r,c.height);x.quadraticCurveTo(0,c.height,0,c.height-r);
  x.lineTo(0,r);x.quadraticCurveTo(0,0,r,0);x.fill();
  x.fillStyle=th.accent;x.fillRect(0,0,10,c.height);
  x.strokeStyle=th.accent;x.lineWidth=3;x.globalAlpha=0.85;x.stroke();x.globalAlpha=1;
  x.fillStyle='rgba(0,0,0,.28)';
  const pillW=Math.min(c.width-28,tagW);
  const py=14,ph=26,px0=18,pr=12;
  x.beginPath();
  x.moveTo(px0+pr,py);x.lineTo(px0+pillW-pr,py);x.quadraticCurveTo(px0+pillW,py,px0+pillW,py+pr);
  x.lineTo(px0+pillW,py+ph-pr);x.quadraticCurveTo(px0+pillW,py+ph,px0+pillW-pr,py+ph);
  x.lineTo(px0+pr,py+ph);x.quadraticCurveTo(px0,py+ph,px0,py+ph-pr);
  x.lineTo(px0,py+pr);x.quadraticCurveTo(px0,py,px0+pr,py);x.fill();
  x.fillStyle=th.accent;x.font='900 18px Overpass, sans-serif';x.textAlign='left';x.textBaseline='middle';
  x.fillText(th.tag,px0+10,py+ph/2+1);
  x.fillStyle=th.ink;x.font='900 48px Overpass, sans-serif';
  x.fillText(titleTxt,24,subTxt?78:68);
  if(subTxt){x.fillStyle='rgba(255,255,255,.72)';x.font='800 26px Overpass, sans-serif';x.fillText(subTxt,24,108);}
  const t=new THREE.CanvasTexture(c);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false}));
  const sk=scaleK!=null?scaleK:0.38;
  sp.scale.set(c.width*0.52*sk,c.height*0.52*sk,1);
  return sp;
}
/* Lakes / reservoirs / bay — labels + later hover hit volumes */
const waterSprites=[];
const WATERS=[
 {n:'Lake Houston',x:2150,z:-3850,r:520,tag:'lake'},
 {n:'Clear Lake',x:2050,z:3020,r:280,tag:'lake'},
 {n:'Sheldon Lake',x:2699,z:-1383,r:200,tag:'lake'},
 {n:'Galveston Bay',x:4650,z:2350,r:900,tag:'bay'},
 {n:'Addicks Reservoir',x:-2650,z:-780,r:320,tag:'reservoir'},
 {n:'Barker Reservoir',x:-2850,z:300,r:340,tag:'reservoir'},
 {n:'Buffalo Bayou',x:900,z:40,r:180,tag:'bayou'},
 {n:'Brays Bayou',x:-800,z:900,r:160,tag:'bayou'},
 {n:'White Oak Bayou',x:-400,z:-350,r:140,tag:'bayou'},
 {n:'San Jacinto River',x:4200,z:-800,r:220,tag:'river'},
 {n:'Lake Conroe',x:-1680,z:-5200,r:480,tag:'lake'},
 {n:'Trinity Bay',x:5200,z:-1200,r:420,tag:'bay'},
];
if(HTS_PACK&&HTS_PACK.waters&&HTS_PACK.waters.length){
  WATERS.length=0;
  for(const w of HTS_PACK.waters)WATERS.push(w);
}
if(HTS_HAS_PACK&&!HTS_IS_AUS){
  const dtLawn=packDowntown();
  blob(dtLawn.x,dtLawn.z,80,.4,matLawn,0.022);
  for(const w of WATERS){
    const mat=w.tag==='harbor'||w.tag==='bay'?matBay:(w.tag==='river'||w.tag==='channel'||w.tag==='bayou'?matBayou:matLake);
    blob(w.x,w.z,Math.min(w.r||200,420),.35,mat,0.03);
  }
}
for(const w of WATERS){
  const sp=textSprite(w.n,0.32);
  sp.material.opacity=0;sp.position.set(w.x,42,w.z);gDetail.add(sp);
  waterSprites.push(sp);
}
const districtSprites=[];
for(const d of DISTRICTS){
  /* Skip downtown — landmarks cover it; smaller mid-zoom-only labels */
  if(d.id==='downtown')continue;
  const sp=textSprite(d.n,0.38);
  sp.material.opacity=0;
  sp.position.set(d.x,110,d.z);
  scene.add(sp);districtSprites.push(sp);
}

/* ---------------- overhead freeway sign gantries ---------------- */
function signTexture(name){
  const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');
  x.fillStyle='#0f7a4a';x.fillRect(0,0,512,128);
  const g=x.createLinearGradient(0,0,0,128);
  g.addColorStop(0,'rgba(255,255,255,.14)');g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.22)');
  x.fillStyle=g;x.fillRect(0,0,512,128);
  x.strokeStyle='#f2f5f0';x.lineWidth=7;x.strokeRect(7,7,498,114);
  x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';
  let fs=52;x.font='900 '+fs+'px Overpass, sans-serif';
  while(x.measureText(name).width>440&&fs>26){fs-=3;x.font='900 '+fs+'px Overpass, sans-serif';}
  x.fillText(name,256,58);
  x.font='700 26px Overpass, sans-serif';x.fillStyle='#d9ecdf';
  x.fillText('▼   ▼   ▼',256,102);
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;
}
const gantryPostMat=new THREE.MeshLambertMaterial({color:0x4c5258});
const gantryPostGeo=new THREE.CylinderGeometry(0.6,0.7,1,6);gantryPostGeo.translate(0,0.5,0);
(function(){
  const posts=[];
  for(const road of roads){
    const def=road.def;if(def.arterial)continue;
    const s=road.s;
    const tex=signTexture(def.name);
    const boardMat=new THREE.MeshLambertMaterial({map:tex,emissive:new THREE.Color(0xffffff),emissiveMap:tex,emissiveIntensity:0});
    road.signMats=boardMat;
    const spacing=Math.max(560,s.total/14);
    for(let dcum=spacing*0.5;dcum<s.total-200;dcum+=spacing){
      let lo=0,hi=s.n;while(lo<hi){const m=(lo+hi)>>1;if(s.cum[m]<dcum)lo=m+1;else hi=m;}
      const i=clamp(lo,1,s.n-1);
      const rx=-s.tz[i],rz=s.tx[i];
      const y=s.py[i];
      const bw=Math.min(def.width*0.94,30),bh=6.2;
      const board=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,0.5),boardMat);
      board.position.set(s.px[i],y+9.6,s.pz[i]);
      board.rotation.y=Math.atan2(rx,rz);
      gRoads3D.add(board);
      const beam=new THREE.Mesh(new THREE.BoxGeometry(def.width+6,1.1,1.1),gantryPostMat);
      beam.position.set(s.px[i],y+12.6,s.pz[i]);beam.rotation.y=board.rotation.y;gRoads3D.add(beam);
      posts.push([s.px[i]+rx*(def.width/2+2.4),s.pz[i]+rz*(def.width/2+2.4),y+13.2]);
      posts.push([s.px[i]-rx*(def.width/2+2.4),s.pz[i]-rz*(def.width/2+2.4),y+13.2]);
    }
  }
  const n=posts.length;
  const m=new THREE.InstancedMesh(gantryPostGeo,gantryPostMat,n);
  const d=new THREE.Object3D();
  for(let i=0;i<n;i++){d.position.set(posts[i][0],0,posts[i][1]);d.scale.set(1,posts[i][2],1);d.updateMatrix();m.setMatrixAt(i,d.matrix);}
  gRoads3D.add(m);
})();

/* street-name blades on arterials & SH-6 */
const bladeSprites=[];
for(const road of roads){
  const def=road.def;if(!(def.arterial||def.surface))continue;
  const s=road.s;
  const spacing=Math.max(420,s.total/8);
  for(let dcum=spacing*0.5;dcum<s.total;dcum+=spacing){
    let lo=0,hi=s.n;while(lo<hi){const m=(lo+hi)>>1;if(s.cum[m]<dcum)lo=m+1;else hi=m;}
    const i=clamp(lo,0,s.n);
    const sp=textSprite(def.short,0.42);
    sp.position.set(s.px[i]+14,26,s.pz[i]+14);
    gDetail.add(sp);bladeSprites.push(sp);
  }
}

/* ---------------- buildings ---------------- */
function nearRoad(x,z,extra){
  for(let i=0;i<roadSamplePts.length;i++){const p=roadSamplePts[i];
    const lim=p[3]+extra;
    const dx=x-p[0],dz=z-p[1];if(dx*dx+dz*dz<lim*lim)return true;}return false;}
/* Freeways only — arterials must not wipe CBD tower footprints */
function nearFreeway(x,z,extra){
  for(let i=0;i<roadSamplePts.length;i++){const p=roadSamplePts[i];
    if(!p[4])continue;
    const lim=p[3]+extra;
    const dx=x-p[0],dz=z-p[1];if(dx*dx+dz*dz<lim*lim)return true;}return false;}
/* ---- airports registry (hoisted so placement can avoid them); repositioned clear of roads ---- */
const AIRPORTS=[
 /* NOTE: airport pads are decorative; keep them clear of freeway ribbons */
 {id:'iah',code:'IAH',name:'George Bush Intercontinental',x:760,z:-3100,rot:0.25,intl:true,runLen:660,
  city:'Houston',lat:29.9902,lng:-95.3368,elev:'97 ft',
  note:'Houston’s primary international hub · United Airlines fortress · 5 terminals (A–E) · ~46M passengers/yr',
  addr:'2800 N Terminal Rd, Houston, TX 77032'},
 {id:'hou',code:'HOU',name:'William P. Hobby',x:1420,z:1680,rot:-0.35,intl:true,runLen:560,
  city:'Houston',lat:29.6454,lng:-95.2789,elev:'46 ft',
  note:'Southwest Airlines focus city · closer to downtown than IAH · international + domestic',
  addr:'7800 Airport Blvd, Houston, TX 77061'},
 {id:'efd',code:'EFD',name:'Ellington Airport',x:2550,z:2400,rot:0.5,intl:false,runLen:520,
  city:'Houston',lat:29.6073,lng:-95.1588,elev:'32 ft',
  note:'Joint civil-military · NASA aircraft · Lone Star Flight Museum · Texas Air National Guard',
  addr:'11602 Aerospace Ave, Houston, TX 77034'},
 {id:'sgr',code:'SGR',name:'Sugar Land Regional',x:-3620,z:3130,rot:-0.2,intl:false,runLen:420,
  city:'Sugar Land',lat:29.6223,lng:-95.6565,elev:'82 ft',
  note:'General aviation · Fort Bend County · corporate & private jets',
  addr:'12888 Hwy 6, Sugar Land, TX 77498'},
 {id:'dwh',code:'DWH',name:'David Wayne Hooks Memorial',x:-1980,z:-2880,rot:0.15,intl:false,runLen:400,
  city:'Spring / Tomball',lat:30.0619,lng:-95.5528,elev:'152 ft',
  note:'Busy GA field northwest of Houston · flight training & private aviation',
  addr:'20803 Stuebner Airline Rd, Spring, TX 77379'},
 {id:'iws',code:'IWS',name:'West Houston Airport',x:-2680,z:-90,rot:0.05,intl:false,runLen:360,
  city:'Houston',lat:29.8182,lng:-95.6726,elev:'111 ft',
  note:'GA airport near Energy Corridor / Katy Freeway · corporate traffic',
  addr:'18000 Groschke Rd, Houston, TX 77084'},
 {id:'cxo',code:'CXO',name:'Conroe-North Houston Regional',x:-1230,z:-4720,rot:0.3,intl:false,runLen:420,
  city:'Conroe',lat:30.3518,lng:-95.4145,elev:'245 ft',
  note:'Montgomery County · GA & regional · gateway to The Woodlands / Conroe',
  addr:'1 Airport Rd, Conroe, TX 77303'},
];
if(HTS_PACK&&HTS_PACK.airports&&HTS_PACK.airports.length){
  AIRPORTS.length=0;
  for(const a of HTS_PACK.airports)AIRPORTS.push(a);
}
for(const a of AIRPORTS)EXCLUDES.push({x:a.x,z:a.z,r:a.intl?540:320,airfield:true});
/* Keep cars off runway/apron pads even if a road polyline clips the field */
window.AIRFIELDS=AIRPORTS.map(a=>({x:a.x,z:a.z,r:a.intl?420:260}));
function inAirfield(x,z){
  for(const a of AIRFIELDS){
    const dx=x-a.x,dz=z-a.z;
    if(dx*dx+dz*dz<a.r*a.r)return a;
  }
  return null;
}
if(!HTS_HAS_PACK){
EXCLUDES.push({x:-455,z:1157,r:140});  /* NRG Stadium */
EXCLUDES.push({x:-245,z:1140,r:110});  /* Astrodome (east of NRG, clear gap) */
EXCLUDES.push({x:240,z:105,r:130});   /* Daikin Park (EaDo) */
EXCLUDES.push({x:157,z:199,r:120});   /* Toyota Center (EaDo / Polk) */
EXCLUDES.push({x:2900,z:3320,r:170}); /* Kemah */
EXCLUDES.push({x:89,z:8,r:90});      /* Downtown Aquarium */
}
/* keep suburban houses out of the dense downtown core */
(function(){
  const dt=packDowntown();
  EXCLUDES.push({x:dt.x,z:dt.z,r:520});
  /* NYC: Midtown / Hudson Yards / LIC / Brooklyn CBDs are far from City Hall */
  if(HTS_CITY_ID==='newyork'){
    const rings=[
      [40.7549,-73.9840,480], /* Midtown */
      [40.7545,-74.0005,260], /* Hudson Yards */
      [40.7460,-73.9430,280], /* LIC */
      [40.6925,-73.9865,260], /* Downtown Brooklyn */
      [40.7155,-74.0355,260], /* Jersey City waterfront */
      [40.7829,-73.9654,480], /* Central Park lawn */
    ];
    for(const [lat,lng,r] of rings){
      const p=geoToWorld(lat,lng);
      EXCLUDES.push({x:p.x,z:p.z,r});
    }
  }
})();
function blocked(x,z,extra){
  for(const e of EXCLUDES){const dx=x-e.x,dz=z-e.z;
    if(dx*dx+dz*dz<e.r*e.r)return true;}
  return nearRoad(x,z,extra);
}
function inWater(x,z){
  for(const e of EXCLUDES){
    if(!e.water)continue;
    const dx=x-e.x,dz=z-e.z;
    if(dx*dx+dz*dz<e.r*e.r)return true;
  }
  return false;
}

/* high-detail tower skins: floor bands + mullions + clustered night lights */
function towerTextures(base,win1,win2,band,litP){
  const W=512,H=1024; /* higher res — stops downtown looking pixelated at night */
  const day=document.createElement('canvas');day.width=W;day.height=H;
  const night=document.createElement('canvas');night.width=W;night.height=H;
  const dx=day.getContext('2d'),nx=night.getContext('2d');
  dx.fillStyle=base;dx.fillRect(0,0,W,H);
  nx.fillStyle='#000';nx.fillRect(0,0,W,H);
  const cols=12,rows=40;
  const cw=(W-24)/cols,ch=(H-28)/rows;
  for(let r=0;r<rows;r++){
    /* floor band */
    dx.fillStyle=band;dx.fillRect(0,14+r*ch-2,W,3);
    let lit=false,run=0;
    for(let cix=0;cix<cols;cix++){
      const x0=12+cix*cw,y0=14+r*ch;
      dx.fillStyle=rand()<0.5?win1:win2;
      dx.fillRect(x0+3,y0+3,cw-6,ch-7);
      /* mullion */
      dx.fillStyle='rgba(0,0,0,.28)';dx.fillRect(x0,y0,2,ch);
      /* night: moderate warm windows — readable, not neon */
      if(run<=0){lit=rand()<litP;run=1+Math.floor(rand()*3);}
      run--;
      if(lit){
        nx.fillStyle=rand()<0.78?'#f0d090':'#b8d0e8';
        nx.globalAlpha=0.5+rand()*0.35;
        nx.fillRect(x0+3,y0+3,cw-6,ch-7);
        nx.globalAlpha=1;
      }
    }
  }
  const dayMap=new THREE.CanvasTexture(day);
  const emMap=new THREE.CanvasTexture(night);
  for(const t of [dayMap,emMap]){
    t.anisotropy=MAXAN;
    t.generateMipmaps=true;
    t.minFilter=THREE.LinearMipmapLinearFilter;
    t.magFilter=THREE.LinearFilter;
    t.needsUpdate=true;
  }
  return {map:dayMap,emissive:emMap};
}
const SKINS=[
  towerTextures('#33414f','#6f8ba6','#597c96','#22303c',0.38),  /* blue glass */
  towerTextures('#3f444c','#1f242c','#2b303a','#15181e',0.32),  /* dark glass */
  towerTextures('#93897a','#5d6a78','#4d5a68','#7c7263',0.40),  /* tan stone */
  towerTextures('#a9abaf','#5f7188','#516074','#8e9094',0.36),  /* white modern */
];
/* Same windowed day/night skins for both cities */
const towerMats=[
  new THREE.MeshPhongMaterial({map:SKINS[0].map,emissiveMap:SKINS[0].emissive,emissive:new THREE.Color(0xe8d4b0),emissiveIntensity:0,shininess:70,specular:0x668,}),
  new THREE.MeshPhongMaterial({map:SKINS[1].map,emissiveMap:SKINS[1].emissive,emissive:new THREE.Color(0xe0cca8),emissiveIntensity:0,shininess:90,specular:0x557}),
  new THREE.MeshLambertMaterial({map:SKINS[2].map,emissiveMap:SKINS[2].emissive,emissive:new THREE.Color(0xd8c098),emissiveIntensity:0}),
  new THREE.MeshLambertMaterial({map:SKINS[3].map,emissiveMap:SKINS[3].emissive,emissive:new THREE.Color(0xe4d0a8),emissiveIntensity:0}),
];
for(const m of towerMats){if(m.shininess!=null)m.userData._shin=m.shininess;}
const towerRoof=new THREE.MeshLambertMaterial({color:0x272c33});
window.towerRoof=towerRoof;
const towerGeo=new THREE.BoxGeometry(1,1,1);towerGeo.translate(0,0.5,0);
const cylGeo=new THREE.CylinderGeometry(0.5,0.5,1,18);cylGeo.translate(0,0.5,0);
const rooftopGeo=new THREE.BoxGeometry(1,1,1);rooftopGeo.translate(0,0.5,0);
const rooftopMat=new THREE.MeshLambertMaterial({color:0x3a4149});
const parapetMat=new THREE.MeshLambertMaterial({color:0x1e2329});

/* Building footprints — spatial grid so car/building checks stay O(nearby) */
window.BLDG_FOOT=[];
window.BLDG_GRID=new Map();
const BLDG_CELL=96;
function bldgCellKey(x,z){return Math.floor(x/BLDG_CELL)+':'+Math.floor(z/BLDG_CELL);}
function registerBldgFoot(x,z,hw,hd){
  const b={x,z,hw:hw*0.55,hd:hd*0.55};
  BLDG_FOOT.push(b);
  const pad=Math.max(b.hw,b.hd)+4;
  const x0=Math.floor((x-pad)/BLDG_CELL),x1=Math.floor((x+pad)/BLDG_CELL);
  const z0=Math.floor((z-pad)/BLDG_CELL),z1=Math.floor((z+pad)/BLDG_CELL);
  for(let ix=x0;ix<=x1;ix++)for(let iz=z0;iz<=z1;iz++){
    const k=ix+':'+iz;
    let arr=BLDG_GRID.get(k);if(!arr){arr=[];BLDG_GRID.set(k,arr);}
    arr.push(b);
  }
}
function footHitsBldg(px,pz){
  const arr=BLDG_GRID.get(bldgCellKey(px,pz));
  if(!arr)return null;
  for(let i=0;i<arr.length;i++){
    const b=arr[i];
    if(Math.abs(px-b.x)<b.hw&&Math.abs(pz-b.z)<b.hd)return b;
  }
  return null;
}
function tower(x,z,w,dep,h,skin,rotY,cyl,opts){
  const faithful=!!(opts&&opts.faithful); /* researched landmarks: keep real proportions */
  const mat=towerMats[skin%towerMats.length];
  const m=new THREE.Mesh(cyl?cylGeo:towerGeo,cyl?mat:[mat,mat,towerRoof,towerRoof,mat,mat]);
  m.scale.set(w,h,dep);m.position.set(x,0,z);m.rotation.y=rotY||0;gDetail.add(m);
  registerBldgFoot(x,z,w,dep);
  /* parapet cap */
  const cap=new THREE.Mesh(cyl?cylGeo:towerGeo,parapetMat);
  cap.scale.set(w*1.03,1.6,dep*1.03);cap.position.set(x,h-0.4,z);cap.rotation.y=rotY||0;gDetail.add(cap);
  if(!faithful&&!cyl&&h>150&&rand()<0.6){
    const m2=new THREE.Mesh(towerGeo,[mat,mat,towerRoof,towerRoof,mat,mat]);
    m2.scale.set(w*0.62,h*1.24,dep*0.62);m2.position.set(x,0,z);m2.rotation.y=rotY||0;gDetail.add(m2);
    const cap2=new THREE.Mesh(towerGeo,parapetMat);
    cap2.scale.set(w*0.64,1.6,dep*0.64);cap2.position.set(x,h*1.24-0.4,z);cap2.rotation.y=rotY||0;gDetail.add(cap2);
  }
  if(!faithful&&rand()<0.7){
    const rb=new THREE.Mesh(rooftopGeo,rooftopMat);
    rb.scale.set(w*0.3,5+rand()*6,dep*0.3);rb.position.set(x,h,z);gDetail.add(rb);
  }
  if(!faithful&&h>210&&rand()<0.5){ /* spire */
    const sp=new THREE.Mesh(new THREE.CylinderGeometry(0.5,1.2,30+rand()*30,5),new THREE.MeshLambertMaterial({color:0x8a9098}));
    sp.geometry.translate(0,sp.geometry.parameters?0:0,0);
    sp.position.set(x,h+18,z);gDetail.add(sp);
  }
  /* Optional researched antenna / known spire tip */
  if(faithful&&opts&&opts.spire){
    const sh=opts.spire;
    const sp=new THREE.Mesh(new THREE.CylinderGeometry(0.6,1.4,sh,6),new THREE.MeshLambertMaterial({color:0x9aa2aa}));
    sp.position.set(x,h+sh*0.5,z);gDetail.add(sp);
  }
  return m;
}
function addTowers(cx,cz,count,rad,hmin,hmax,cylP){
  for(let i=0;i<count;i++){
    const a=rand()*TAU,r=Math.sqrt(rand())*rad;
    const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
    /* Houston: restore pre-Austin placement (blocked + downtown EXCLUDE = landmark CBD).
       Austin: nearRoad only so geo-pinned towers can sit in the core. */
    if(HTS_HAS_PACK){if(nearRoad(x,z,28))continue;}
    else{if(blocked(x,z,28))continue;}
    const w=26+rand()*34,dep=26+rand()*34,h=hmin+Math.pow(rand(),1.6)*(hmax-hmin);
    tower(x,z,w,dep,h,Math.floor(rand()*4),rand()<0.7?0:rand()*0.5,rand()<(cylP||0));
  }
}
window.PICK_TOWERS=[];
window.HTS_AUS_LANDMARK_SKIP=[];
if(HTS_IS_AUS){
  /*
   * Proven approach (before spacing experiments): Houston-style landmark towers at
   * real lat/lng + OSM mid-rise fabric around them. No OSM skyscraper fighting.
   */
  (function placeAusLandmarks(){
    /* Reserve Capitol / UT / Congress Bridge BEFORE pockets so nothing stacks on them */
    const cap0=geoToWorld(30.2747,-97.7404);
    const ut0=geoToWorld(30.28565,-97.73921);
    const br0=geoToWorld(30.2614,-97.7450);
    HTS_AUS_LANDMARK_SKIP.push({x:cap0.x,z:cap0.z,r:170}); /* full Capitol grounds */
    HTS_AUS_LANDMARK_SKIP.push({x:ut0.x,z:ut0.z,r:55});
    HTS_AUS_LANDMARK_SKIP.push({x:br0.x,z:br0.z,r:60});
    EXCLUDES.push({x:cap0.x,z:cap0.z,r:160});
    EXCLUDES.push({x:ut0.x,z:ut0.z,r:50});

    const AUS_LANDMARKS=[
      /* heights ≈ real feet / 3.16 (Houston Williams Tower scale) */
      {n:'Sixth and Guadalupe',lat:30.269687,lng:-97.746691,w:34,d:34,h:277,s:1,info:'875 ft · 66 floors · 2023'},
      {n:'The Independent',lat:30.267850,lng:-97.751192,w:30,d:30,h:220,s:0,info:'694 ft · 58 floors · 2019'},
      {n:'The Republic',lat:30.266790,lng:-97.747762,w:32,d:28,h:210,s:1,info:'58 floors · Republic Square'},
      {n:'The Austonian',lat:30.264730,lng:-97.744511,w:28,d:28,h:216,s:3,info:'683 ft · 56 floors · 2010'},
      {n:'Fairmont Austin',lat:30.262227,lng:-97.738289,w:40,d:34,h:168,s:2,info:'530 ft · 37 floors · 2018'},
      {n:'360 Condominiums',lat:30.267418,lng:-97.749682,w:28,d:28,h:184,s:1,info:'581 ft · 44 floors · 2008'},
      {n:'Frost Bank Tower',lat:30.266500,lng:-97.742847,w:30,d:28,h:163,s:2,info:'516 ft · 33 floors · 2004'},
      {n:'Indeed Tower',lat:30.269093,lng:-97.744427,w:28,d:32,h:170,s:0,info:'36 floors · 2021'},
      {n:'One American Center',lat:30.268618,lng:-97.743259,w:30,d:28,h:140,s:2,info:'32 floors · 1984'},
      {n:'415 Colorado',lat:30.267058,lng:-97.744308,w:26,d:26,h:185,s:0,info:'47 floors'},
      {n:'Block 185',lat:30.26695,lng:-97.74555,w:32,d:30,h:145,s:1,info:'Google Tower · 2015'},
      {n:'JW Marriott Austin',lat:30.2639,lng:-97.7426,w:36,d:32,h:130,s:2,info:'34 floors · 2015'},
      {n:'One Congress Plaza',lat:30.2649,lng:-97.7436,w:28,d:28,h:125,s:0,info:'30 floors'},
      {n:'Spring Condo',lat:30.2634,lng:-97.7408,w:26,d:24,h:145,s:3,info:'Rainey Street residential'},
      {n:'Ashton',lat:30.2645,lng:-97.7475,w:24,d:24,h:140,s:0,info:'Rainey · glass condo'},
      {n:'Fifth & West Residences',lat:30.2682,lng:-97.7515,w:26,d:26,h:155,s:1,info:'West End residential'},
      {n:'Northshore',lat:30.2676,lng:-97.7398,w:28,d:26,h:120,s:2,info:'East CBD · Lady Bird'},
      {n:'Hanover Republic Square',lat:30.2662,lng:-97.7465,w:30,d:28,h:135,s:3,info:'Downtown residential'},
    ];
    for(const L of AUS_LANDMARKS){
      const p=geoToWorld(L.lat,L.lng);
      /* Never plant a skyscraper on Capitol grounds */
      if(Math.hypot(p.x-cap0.x,p.z-cap0.z)<160)continue;
      const m=tower(p.x,p.z,L.w,L.d,L.h,L.s,0,false,{faithful:true});
      m.userData.info={n:L.n,d:L.info};
      PICK_TOWERS.push(m);
      HTS_AUS_LANDMARK_SKIP.push({x:p.x,z:p.z,r:Math.max(L.w,L.d)*0.75+18});
    }
    /* CBD mid-rise pockets — keep clear of Capitol View / grounds */
    const dt=geoToWorld(30.2672,-97.7431);
    const rainey=geoToWorld(30.258,-97.738);
    const soco=geoToWorld(30.248,-97.749);
    const east=geoToWorld(30.262,-97.72);
    const domain=geoToWorld(30.402,-97.725);
    function pocket(cx,cz,n,rad,hmin,hmax){
      let got=0;
      EXCLUDES.push({x:cx,z:cz,r:Math.min(rad*1.1,400)});
      for(let t=0;t<n*8&&got<n;t++){
        const a=rand()*TAU,r=Math.sqrt(rand())*rad;
        const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
        if(nearFreeway(x,z,16))continue;
        if(typeof inWater==='function'&&inWater(x,z))continue;
        if(Math.hypot(x-cap0.x,z-cap0.z)<170)continue;
        let near=false;
        for(const s of HTS_AUS_LANDMARK_SKIP){if(Math.hypot(x-s.x,z-s.z)<(s.r||40)){near=true;break;}}
        if(near)continue;
        const w=22+rand()*18,dep=22+rand()*18;
        const h=hmin+Math.pow(rand(),1.5)*(hmax-hmin);
        tower(x,z,w,dep,h,Math.floor(rand()*4),rand()*0.35,false);
        HTS_AUS_LANDMARK_SKIP.push({x,z,r:Math.max(w,dep)*0.55+12});
        got++;
      }
    }
    pocket(dt.x,dt.z,36,190,55,160); /* denser CBD south of Capitol */
    pocket(rainey.x,rainey.z,18,150,70,175);
    pocket(soco.x,soco.z,12,120,35,95);
    pocket(east.x,east.z,10,130,30,90);
    pocket(domain.x,domain.z,14,160,40,110);
    console.log('%cAustin skyline: '+AUS_LANDMARKS.length+' landmarks + CBD pockets (Capitol cleared)','color:#7fd6a0');
  })();
  window.__htsPlaceAusSkylineFallback=function(){ /* landmarks already placed */ };
}else if(HTS_HAS_PACK){
  (function placePackSkyline(){
    const list=(HTS_PACK&&HTS_PACK.skyline)||[];
    const pockets=(HTS_PACK&&HTS_PACK.skylinePockets)||[];
    const dt=packDowntown();
    /* Central Park clear zone — NYC only (no towers / houses through the lawn) */
    if(HTS_CITY_ID==='newyork'){
      const cp=geoToWorld(40.7829,-73.9654);
      HTS_AUS_LANDMARK_SKIP.push({x:cp.x,z:cp.z,r:520});
      EXCLUDES.push({x:cp.x,z:cp.z,r:480});
    }
    for(const L of list){
      const x=L.x,z=L.z;
      const m=tower(x,z,L.w||28,L.d||28,L.h||120,L.s||0,L.rot||0,!!L.cyl,{faithful:true,spire:L.spire||0});
      m.userData.info={n:L.n,d:L.info||L.n};
      PICK_TOWERS.push(m);
      HTS_AUS_LANDMARK_SKIP.push({x,z,r:Math.max(L.w||28,L.d||28)*0.75+18});
      EXCLUDES.push({x,z,r:Math.max(L.w||28,L.d||28)*0.6+16});
    }
    function pocketAt(cx,cz,n,rad,hmin,hmax){
      let got=0;
      EXCLUDES.push({x:cx,z:cz,r:Math.min(rad*1.05,460)}); /* keep house sprawl out of CBD fabric */
      for(let t=0;t<n*10&&got<n;t++){
        const a=rand()*TAU,r=Math.sqrt(rand())*rad;
        const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
        if(nearFreeway(x,z,16))continue;
        if(typeof inWater==='function'&&inWater(x,z))continue;
        let near=false;
        for(const s of HTS_AUS_LANDMARK_SKIP){if(Math.hypot(x-s.x,z-s.z)<(s.r||40)){near=true;break;}}
        if(near)continue;
        const w=20+rand()*22,dep=20+rand()*22;
        const h=hmin+Math.pow(rand(),1.45)*(hmax-hmin);
        tower(x,z,w,dep,h,Math.floor(rand()*4),rand()*0.35,false);
        HTS_AUS_LANDMARK_SKIP.push({x,z,r:Math.max(w,dep)*0.55+12});
        got++;
      }
      return got;
    }
    let fabric=0;
    if(pockets.length){
      for(const P of pockets){
        fabric+=pocketAt(P.x,P.z,P.count||24,P.rad||200,P.hmin||50,P.hmax||180);
      }
    }else{
      /* Default single CBD pocket for packs without researched fabric */
      fabric+=pocketAt(dt.x,dt.z,36,220,50,170);
    }
    console.log('%c'+CITY_NAME+' skyline: '+list.length+' landmarks + '+fabric+' CBD towers','color:#7fd6a0');
  })();
}else{
  /* Houston skyline — original denser clusters (Galleria / Med Center / …) + landmark CBD */
  addTowers(60,60,72,380,70,345,0.14);   /* downtown (denser / taller) */
  addTowers(60,50,32,220,140,325,0.16);  /* dense supertall core */
  addTowers(40,80,24,180,100,280,0.12); /* east downtown */
  addTowers(-40,-60,20,160,80,220,0.08); /* west downtown */
  addTowers(70,40,18,140,90,220,0.10);   /* mid-rise ring */
  addTowers(120,-60,14,150,60,150,0);    /* east-side mid-rises */
  addTowers(-980,180,13,220,55,200,0.1); /* Galleria */
  (function(){const wt=tower(-1010,150,34,34,285,1,0,false);
    wt.userData.info={n:'Williams Tower',d:'901 ft · 64 floors · 1983 · tallest US skyscraper outside a downtown'};
    PICK_TOWERS.push(wt);})();
  addTowers(-290,800,17,230,50,180,0.08); /* Med Center */
  addTowers(-680,470,8,160,40,120,0);    /* Greenway */
  addTowers(-420,-1180,6,150,35,95,0);   /* Greenspoint */
  addTowers(-1860,-380,10,200,30,85,0);  /* Energy Corridor */
  addTowers(-1140,-3620,10,260,25,110,0);/* Woodlands */
  addTowers(-3050,2260,8,230,20,70,0);   /* Sugar Land */
  addTowers(1750,2820,7,200,20,60,0);    /* Clear Lake / NASA area */
}
if(window.HTS_CINEMATIC&&HTS_CINEMATIC.markShadowCasters){
  try{HTS_CINEMATIC.markShadowCasters(gDetail);}catch(e){}
}
const LANDMARK_TOWERS=HTS_HAS_PACK?[]:[
 /* Offsets keep towers beside freeways, not sitting in the travel lanes */
 {n:'JPMorgan Chase Tower',x:105,z:25,w:40,d:40,h:335,s:0,info:'1,002 ft · 75 floors · 1982 · tallest in Texas until 2019'},
 {n:'Wells Fargo Plaza',x:-55,z:155,w:38,d:30,h:330,s:0,info:'992 ft · 71 floors · 1983 · all-glass twin quarter-cylinders'},
 {n:'Heritage Plaza',x:-110,z:-55,w:34,d:34,h:255,s:2,info:'762 ft · 53 floors · 1987 · Mayan-inspired granite crown'},
 {n:'TC Energy Center',x:155,z:-45,w:32,d:32,h:262,s:2,info:'780 ft · 56 floors · 1983 · Philip Johnson\'s Dutch-gabled icon'},
 {n:'609 Main at Texas',x:175,z:95,w:34,d:34,h:252,s:1,info:'757 ft · 48 floors · 2017 · diagonal-crown glass tower'},
 {n:'Texas Tower',x:-35,z:-105,w:32,d:36,h:230,s:3,info:'47 floors · 2021 · Hines HQ on the old Chronicle site'},
 {n:'One Shell Plaza',x:45,z:175,w:30,d:44,h:238,s:3,info:'715 ft · 50 floors · 1971 · once world\'s tallest concrete building'},
 {n:'Bank of America Center',x:-75,z:115,w:36,d:36,h:285,s:1,info:'780 ft · 56 floors · 1983 · stepped Art Deco crown'},
];
for(const L of LANDMARK_TOWERS){
  let x=L.x,z=L.z;
  /* Nudge off any remaining road corridor so traffic never drives through the lobby */
  if(nearRoad(x,z,L.w*0.55+18)){
    let best=null,bestD=1e9;
    for(let a=0;a<16;a++){
      const ang=a/16*TAU,dist=L.w*0.7+28;
      const nx=L.x+Math.cos(ang)*dist,nz=L.z+Math.sin(ang)*dist;
      if(nearRoad(nx,nz,L.w*0.55+14))continue;
      const d=Math.hypot(nx-L.x,nz-L.z);
      if(d<bestD){bestD=d;best={x:nx,z:nz};}
    }
    if(best){x=best.x;z=best.z;}
  }
  const m=tower(x,z,L.w,L.d,L.h,L.s,0,false);
  m.userData.info={n:L.n,d:L.info};
  PICK_TOWERS.push(m);
}
if(!HTS_HAS_PACK)(function(){const g=new THREE.CylinderGeometry(0.7,1.1,70,5);g.translate(0,35,0);
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0x8a9098}));
  m.position.set(60,330,60);gDetail.add(m);})();
/* Invisible pick volume helper for landmark hover / Wikipedia cards */
function registerLandmarkHit(x,y,z,sx,sy,sz,info,poi){
  const hit=new THREE.Mesh(
    new THREE.BoxGeometry(sx,sy,sz),
    new THREE.MeshBasicMaterial({visible:false})
  );
  hit.position.set(x,y,z);
  hit.userData.info=info;
  if(poi)hit.userData.poi=poi;
  gDetail.add(hit);
  if(!window.PICK_TOWERS)window.PICK_TOWERS=[];
  PICK_TOWERS.push(hit);
  return hit;
}
/* Lakes & suburbs — invisible hover / click volumes + fun-fact cards */
(function registerPlaceCards(){
  for(const w of WATERS){
    const tag=w.tag==='bay'?'Bay':w.tag==='reservoir'?'Flood-control reservoir':w.tag==='bayou'?'Bayou':w.tag==='river'?'River':'Lake';
    const r=Math.min(w.r||200,420);
    registerLandmarkHit(w.x,8,w.z,r*1.6,24,r*1.6,
      {n:w.n,d:tag+' · '+METRO_NAME+' — hover for a fun fact'},
      {n:w.n,x:w.x,z:w.z,addr:tag+' · '+METRO_NAME});
  }
  /* Suburbs / districts — skip places that have real landmark meshes */
  for(const d of DISTRICTS){
    if(d.id==='downtown'||d.id==='ut'||d.id==='capitol')continue;
    const s=Math.min(Math.max(d.r*0.9,160),380);
    registerLandmarkHit(d.x,20,d.z,s,40,s,
      {n:d.n,d:AREA_NAME+' suburb / district — hover for a fun fact'},
      {n:d.n,x:d.x,z:d.z,addr:METRO_NAME+' · '+d.n});
  }
})();
/* --- downtown landmarks --- */
window.crownMats=[];
(function(){
  if(HTS_IS_AUS){
    /* Texas State Capitol — pink granite on hilltop north of Congress */
    const cap=geoToWorld(30.2747,-97.7404);
    const granite=new THREE.MeshLambertMaterial({color:0xc48a72}); /* Sunset Red granite */
    const domeMat=new THREE.MeshLambertMaterial({color:0xd4a080});
    /* raised grounds — lush Capitol lawn */
    const grounds=new THREE.Mesh(new THREE.CylinderGeometry(110,125,8,24),
      new THREE.MeshLambertMaterial({color:0x4a9a3a}));
    grounds.position.set(cap.x,4,cap.z);grounds.receiveShadow=true;gDetail.add(grounds);
    const base=new THREE.Mesh(towerGeo,granite);
    base.scale.set(85,36,70);base.position.set(cap.x,8,cap.z);base.castShadow=true;base.receiveShadow=true;gDetail.add(base);
    const wingL=new THREE.Mesh(towerGeo,granite);
    wingL.scale.set(55,22,40);wingL.position.set(cap.x-55,8,cap.z);wingL.castShadow=true;gDetail.add(wingL);
    const wingR=new THREE.Mesh(towerGeo,granite);
    wingR.scale.set(55,22,40);wingR.position.set(cap.x+55,8,cap.z);wingR.castShadow=true;gDetail.add(wingR);
    const drum=new THREE.Mesh(new THREE.CylinderGeometry(18,20,28,16),granite);
    drum.position.set(cap.x,52,cap.z);drum.castShadow=true;gDetail.add(drum);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(26,20,14),domeMat);
    dome.scale.set(1,0.78,1);dome.position.set(cap.x,72,cap.z);dome.castShadow=true;gDetail.add(dome);
    const god=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.8,18,6),
      new THREE.MeshLambertMaterial({color:0xb8a070}));
    god.position.set(cap.x,92,cap.z);gDetail.add(god);
    registerLandmarkHit(cap.x,50,cap.z,120,100,110,
      {n:'Texas State Capitol',d:'1888 · pink granite · Capitol View Corridors protect this dome'},
      {n:'Texas State Capitol',x:cap.x,z:cap.z,addr:'1100 Congress Ave — Texas State Capitol'});
    registerBldgFoot(cap.x,cap.z,90,75);
    /* UT Tower — Main Building lantern (tall, unmistakable campus anchor) */
    const ut=geoToWorld(30.28565,-97.73921);
    (function buildUtTower(){
      const stone=new THREE.MeshLambertMaterial({color:0xe8e0d0});
      const trim=new THREE.MeshLambertMaterial({color:0xc8b8a0});
      const orange=new THREE.MeshLambertMaterial({color:0xbf5700}); /* burnt orange */
      const geo=new THREE.BoxGeometry(1,1,1);geo.translate(0,0.5,0);
      function b(x,z,w,h,d,mat,y0){
        const m=new THREE.Mesh(geo,mat);
        m.scale.set(w,h,d);m.position.set(x,y0||0,z);m.frustumCulled=false;gDetail.add(m);return m;
      }
      /* Main Building podium */
      b(ut.x,ut.z,52,18,40,stone);
      b(ut.x-28,ut.z,22,14,32,stone);
      b(ut.x+28,ut.z,22,14,32,stone);
      /* Tower shaft — ~307 ft → tall landmark */
      b(ut.x,ut.z,22,150,22,stone,16);
      b(ut.x,ut.z,28,18,28,trim,166);
      b(ut.x,ut.z,16,14,16,orange,184); /* lantern glow block */
      /* Academic halls immediately around the Tower */
      const halls=[
        [-38,-28,30,16,22],[38,-26,28,14,20],[-36,30,26,12,24],[36,28,24,14,20],
        [-52,8,20,10,28],[50,6,20,10,26],[0,-42,36,12,18],[0,44,34,11,18],
      ];
      for(const [dx,dz,w,h,d] of halls)b(ut.x+dx,ut.z+dz,w,h,d,stone);
      registerLandmarkHit(ut.x,80,ut.z,70,200,70,
        {n:'UT Tower',d:'Main Building · University of Texas at Austin · 307 ft'},
        {n:'UT Tower',x:ut.x,z:ut.z,addr:'University of Texas — Main Building'});
      registerLandmarkHit(ut.x,30,ut.z,120,60,120,
        {n:'University of Texas at Austin',d:'Flagship campus · Tower · DKR · Moody · LBJ'},
        {n:'University of Texas at Austin',x:ut.x,z:ut.z,addr:'UT Austin Main Campus'});
      registerBldgFoot(ut.x,ut.z,56,44);
      EXCLUDES.push({x:ut.x,z:ut.z,r:70});
      HTS_AUS_LANDMARK_SKIP.push({x:ut.x,z:ut.z,r:75});
      console.log('%cUT Tower campus at '+ut.x.toFixed(0)+','+ut.z.toFixed(0),'color:#bf5700');
    })();
    /* Congress Ave Bridge bats — deck over Lady Bird */
    const br=geoToWorld(30.2614,-97.7450);
    const deck=new THREE.Mesh(new THREE.BoxGeometry(28,3,110),new THREE.MeshLambertMaterial({color:0x5a6068}));
    deck.position.set(br.x,14,br.z);gDetail.add(deck);
    for(const sx of [-12,12]){
      const pier=new THREE.Mesh(new THREE.BoxGeometry(4,14,6),new THREE.MeshLambertMaterial({color:0x6a7078}));
      pier.position.set(br.x+sx,7,br.z);gDetail.add(pier);
    }
    registerLandmarkHit(br.x,16,br.z,40,30,100,
      {n:'Congress Avenue Bridge',d:'Home of the famous Austin bat colony · Lady Bird Lake'},
      {n:'Congress Avenue Bridge',x:br.x,z:br.z,addr:'Congress Ave over Lady Bird Lake'});
    /* Keep OSM from double-stacking Capitol / UT / bridge props (already reserved above) */
    HTS_AUS_LANDMARK_SKIP.push({x:cap.x,z:cap.z,r:170});
    HTS_AUS_LANDMARK_SKIP.push({x:ut.x,z:ut.z,r:75});
    HTS_AUS_LANDMARK_SKIP.push({x:br.x,z:br.z,r:60});
    /* No street pods on Capitol grounds */
    return;
  }
  const dark=towerMats[1];
  /* twin trapezoid prisms (Pennzoil Place) */
  function trapezoid(x,z,rot){
    const shp=new THREE.Shape();
    shp.moveTo(-16,-16);shp.lineTo(16,-16);shp.lineTo(16,6);shp.lineTo(-16,16);shp.closePath();
    const g=new THREE.ExtrudeGeometry(shp,{depth:170,bevelEnabled:false});
    g.rotateX(-Math.PI/2);
    const m=new THREE.Mesh(g,dark);
    m.position.set(x,0,z);m.rotation.y=rot;gDetail.add(m);
    return m;
  }
  trapezoid(-60,-40,0.35);trapezoid(-14,-84,0.35+Math.PI);
  registerLandmarkHit(-37,90,-62,70,180,90,
    {n:'Pennzoil Place',d:'1975 · Philip Johnson · twin trapezoid towers · downtown icon'},
    {n:'Pennzoil Place',x:-37,z:-62,addr:'700 Milam St — twin trapezoid skyscrapers by Philip Johnson (1975)'});
  registerBldgFoot(-37,-62,55,70);
  /* stepped-crown tower with lit crown */
  const base=new THREE.Mesh(towerGeo,[towerMats[3],towerMats[3],towerRoof,towerRoof,towerMats[3],towerMats[3]]);
  base.scale.set(46,235,46);base.position.set(158,0,-30);gDetail.add(base);
  registerBldgFoot(158,-30,46,46);
  let w=38;
  for(let stp=0;stp<3;stp++){
    const s2=new THREE.Mesh(towerGeo,[towerMats[3],towerMats[3],towerRoof,towerRoof,towerMats[3],towerMats[3]]);
    s2.scale.set(w,235+22*(stp+1),w);s2.position.set(158,0,-30);gDetail.add(s2);w*=0.72;
  }
  const crown=new THREE.Mesh(towerGeo,new THREE.MeshBasicMaterial({color:0xffd9a8,transparent:true,opacity:0}));
  crown.scale.set(30,4,30);crown.position.set(158,301,-30);gDetail.add(crown);
  crownMats.push(crown.material);
  /* Williams Tower crown light */
  const wc=new THREE.Mesh(towerGeo,new THREE.MeshBasicMaterial({color:0xfff2cf,transparent:true,opacity:0}));
  wc.scale.set(36,3,36);wc.position.set(-1010,285,150);gDetail.add(wc);
  crownMats.push(wc.material);
  /* street-level podiums around the core */
  for(let i=0;i<20;i++){
    const a=rand()*TAU,r=140+rand()*260;
    const x=60+Math.cos(a)*r,z=60+Math.sin(a)*r;
    if(blocked(x,z,28))continue;
    const pw=30+rand()*26,pd=30+rand()*26;
    const p=new THREE.Mesh(towerGeo,towerMats[2]);
    p.scale.set(pw,10+rand()*16,pd);
    p.position.set(x,0,z);p.rotation.y=rand()*0.4;gDetail.add(p);
    registerBldgFoot(x,z,pw,pd);
  }
})();

/* ---------------- suburban houses ---------------- */
function prismGeom(){
  const pos=[
    -0.5,0,0.5,  0.5,0,0.5,  0,1,0.5,
    -0.5,0,-0.5, 0,1,-0.5,   0.5,0,-0.5,
    -0.5,0,0.5, 0,1,0.5, 0,1,-0.5,   -0.5,0,0.5, 0,1,-0.5, -0.5,0,-0.5,
    0.5,0,0.5, 0.5,0,-0.5, 0,1,-0.5,  0.5,0,0.5, 0,1,-0.5, 0,1,0.5,
  ];
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.computeVertexNormals();return g;
}
/* facade texture: siding + windows + door (multiplied by instance color) */
const houseTex=(function(){
  const c=document.createElement('canvas');c.width=64;c.height=32;const x=c.getContext('2d');
  x.fillStyle='#ffffff';x.fillRect(0,0,64,32);
  for(let y=0;y<32;y+=4){x.fillStyle='rgba(0,0,0,.06)';x.fillRect(0,y,64,1);}
  x.fillStyle='#2a3138';
  x.fillRect(8,10,10,9);x.fillRect(46,10,10,9);   /* windows */
  x.fillRect(28,8,9,24);                          /* door */
  x.fillStyle='rgba(255,255,255,.5)';x.fillRect(9,11,8,3);x.fillRect(47,11,8,3);
  const t=new THREE.CanvasTexture(c);return t;
})();
const HOUSE_COLS=[0xcabfa8,0xb8a88e,0xc9c2b6,0x9aa0a4,0xa8836b,0xb7b1a2,0xd8cfc0];
const ROOF_COLS=[0x4e4a44,0x5a4a3c,0x44484e,0x5f544a];
const houseClusters=HTS_IS_AUS?[
 /* Austin suburbs — world coords from researched district centers */
 ...(function(){
   const ids=[
     [30.2671,-97.7729,420,220], /* Zilker */
     [30.292,-97.768,380,200], /* Tarrytown */
     [30.306,-97.727,360,190], /* Hyde Park */
     [30.298,-97.704,400,210], /* Mueller */
     [30.402,-97.725,480,240], /* Domain */
     [30.358,-97.752,440,220], /* NW Hills */
     [30.505,-97.82,560,280], /* Cedar Park */
     [30.508,-97.679,600,300], /* Round Rock */
     [30.439,-97.62,520,250], /* Pflugerville */
     [30.633,-97.678,500,240], /* Georgetown */
     [30.579,-97.853,460,220], /* Leander */
     [30.309,-97.945,420,200], /* Bee Cave */
     [30.367,-97.98,440,210], /* Lakeway */
     [30.298,-97.807,300,140], /* West Lake Hills */
     [30.085,-97.84,420,200], /* Buda */
     [29.989,-97.877,440,210], /* Kyle */
     [29.883,-97.941,480,230], /* San Marcos */
     [30.19,-98.087,360,160], /* Dripping Springs */
     [30.24,-97.72,360,170], /* Riverside */
     [30.24,-97.69,320,150], /* Montopolis */
     [30.252,-97.788,340,160], /* Barton Hills */
     [30.248,-97.749,300,140], /* SoCo */
     [30.341,-97.557,380,170], /* Manor */
     [30.21,-97.65,360,160], /* Del Valle */
     [30.275,-97.79,280,120], /* Rollingwood */
     [30.34,-97.74,320,150], /* Allandale */
     [30.345,-97.725,320,150], /* Crestview */
     [30.262,-97.72,340,160], /* East Austin */
   ];
   return ids.map(([lat,lng,rad,cnt])=>{const w=geoToWorld(lat,lng);return [w.x,w.z,rad,cnt];});
 })()
]:(HTS_HAS_PACK?(function(){
  return (HTS_PACK.districts||[])
    .filter((d)=>d.id!=='downtown'&&!d.noHouses)
    .map((d)=>[d.x,d.z,Math.min((d.r||280)*1.35,560),Math.max(90,Math.floor((d.r||280)*0.55))]);
})():[
 [-3520,-120,700,300],[-3050,2260,760,320],[-2280,2520,620,270],[-2520,1780,380,150],
 [-4550,3300,640,260],[-1140,-3620,780,270],[-950,-2950,560,220],[-1600,-4950,640,240],
 [430,3420,680,290],[-3020,-2420,700,270],[-2650,-3250,560,220],[-1650,-1520,380,160],
 [1340,-3620,600,220],[1950,-3350,520,200],[2450,520,460,150],[2850,700,360,130],
 [3250,950,360,130],[1750,2820,520,200],[1250,3150,440,170],[1950,3900,560,220],
 [3800,-380,480,170],[2600,-330,360,130],[-1860,-560,460,150],[-1450,-380,380,140],
 [-2050,950,480,180],[-360,-420,340,140],[-360,300,300,110],[-620,180,300,110],
 [-820,760,320,120],[820,-900,500,160],[-2200,900,540,170],[1500,1500,600,180],
 [-1600,1800,540,160],[900,-2200,540,160],
]);
(function(){
  let N=0;for(const c of houseClusters)N+=c[3];
  if(HTS_HAS_PACK)N=Math.max(N,3200);
  const bodyG=new THREE.BoxGeometry(1,1,1);bodyG.translate(0,0.5,0);
  const bodies=new THREE.InstancedMesh(bodyG,new THREE.MeshLambertMaterial({map:houseTex}),N);
  const roofs=new THREE.InstancedMesh(prismGeom(),new THREE.MeshLambertMaterial({}),N);
  const d=new THREE.Object3D(),col=new THREE.Color();
  let idx=0;
  function placeHouse(x,z,facing){
    if(idx>=N)return false;
    for(const e of EXCLUDES){
      const dx=x-e.x,dz=z-e.z;
      if(dx*dx+dz*dz<(e.r+8)*(e.r+8))return false;
    }
    if(typeof inWater==='function'&&inWater(x,z))return false;
    const w=9+rand()*8,dep=10+rand()*9,h=4.5+rand()*3.5;
    const ry=(facing!=null?facing:Math.floor(rand()*4)*(Math.PI/2))+(rand()-.5)*0.12;
    d.position.set(x,0,z);d.rotation.set(0,ry,0);d.scale.set(w,h,dep);d.updateMatrix();
    bodies.setMatrixAt(idx,d.matrix);
    col.setHex(HOUSE_COLS[Math.floor(rand()*HOUSE_COLS.length)]);bodies.setColorAt(idx,col);
    d.position.set(x,h,z);d.scale.set(w*1.08,3+rand()*2,dep*1.08);d.updateMatrix();
    roofs.setMatrixAt(idx,d.matrix);
    col.setHex(ROOF_COLS[Math.floor(rand()*ROOF_COLS.length)]);roofs.setColorAt(idx,col);
    idx++;return true;
  }
  if(HTS_HAS_PACK){
    /* Sit houses beside arterials/surface roads so suburbs follow the road network */
    const dt=packDowntown();
    for(const {def,s} of roadSamples){
      if(!(def.arterial||def.surface))continue;
      const step=Math.max(2,Math.floor(18/(def.width||16)));
      for(let i=0;i<=s.n;i+=step){
        if(Math.hypot(s.px[i]-dt.x,s.pz[i]-dt.z)<380)continue; /* CBD */
        const rx=-s.tz[i],rz=s.tx[i];
        const face=Math.atan2(s.tx[i],s.tz[i]);
        for(const sg of [1,-1]){
          if(rand()>0.55)continue;
          const setback=(def.width||18)*0.55+10+rand()*14;
          const along=(rand()-0.5)*10;
          const x=s.px[i]+rx*sg*setback+s.tx[i]*along;
          const z=s.pz[i]+rz*sg*setback+s.tz[i]*along;
          placeHouse(x,z,face+Math.PI/2*(sg>0?1:-1));
        }
      }
    }
    for(const [cx,cz,rad,cnt] of houseClusters){
      let placed=0,tries=0;
      while(placed<Math.min(80,cnt*0.28)&&tries<cnt*5&&idx<N){tries++;
        const a=rand()*TAU,r=(0.35+0.65*Math.sqrt(rand()))*rad;
        const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
        if(Math.hypot(x-dt.x,z-dt.z)<400)continue;
        if(nearRoad(x,z,10))continue;
        if(placeHouse(x,z,null))placed++;
      }
    }
    console.log('%c'+CITY_NAME+' houses along roads: '+idx,'color:#7fd6a0');
  }else{
    for(const [cx,cz,rad,cnt] of houseClusters){
      let placed=0,tries=0;
      while(placed<cnt&&tries<cnt*8){tries++;
        const a=rand()*TAU,r=(0.22+0.78*Math.sqrt(rand()))*rad;
        const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
        if(blocked(x,z,14))continue;
        if(placeHouse(x,z,Math.floor(rand()*4)*(Math.PI/2)+(rand()-.5)*0.2))placed++;
      }
    }
  }
  bodies.count=idx;roofs.count=idx;
  gDetail.add(bodies);gDetail.add(roofs);
})();

/* mid/low-rise sprawl */
(function(){
  const g=new THREE.BoxGeometry(1,1,1);g.translate(0,0.5,0);
  /* storefront facade: window band + parapet, multiplied by instance color */
  const sTex=(function(){const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');
    x.fillStyle='#ffffff';x.fillRect(0,0,64,64);
    x.fillStyle='rgba(0,0,0,.32)';x.fillRect(0,0,64,6);           /* parapet */
    x.fillStyle='#18202a';x.fillRect(4,40,56,16);                  /* storefront glass */
    for(let wx2=6;wx2<58;wx2+=10){x.fillStyle='#141b24';x.fillRect(wx2,14,7,10);} /* upper windows */
    x.fillStyle='rgba(255,255,255,.35)';x.fillRect(4,40,56,2);
    return new THREE.CanvasTexture(c);})();
  /* Night emissive map: dim storefront + few upper windows */
  const sEm=(function(){const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');
    x.fillStyle='#000';x.fillRect(0,0,64,64);
    x.fillStyle='#c89850';x.globalAlpha=0.45;x.fillRect(4,40,56,16);
    x.globalAlpha=1;
    for(let wx2=6;wx2<58;wx2+=10){
      if(rand()<0.28){x.fillStyle=rand()<0.75?'#c8a060':'#8898b0';x.globalAlpha=0.4;x.fillRect(wx2,14,7,10);x.globalAlpha=1;}
    }
    return new THREE.CanvasTexture(c);})();
  const mat=new THREE.MeshLambertMaterial({
    map:sTex,emissiveMap:sEm,emissive:new THREE.Color(0xb89860),emissiveIntensity:0
  });
  const SPRAWL_COLS=[0xb9b2a4,0x9aa0a6,0x8a6a54,0xa8b0a2,0xc4bda8,0x7e8890];
  const N=760;const mesh=new THREE.InstancedMesh(g,mat,N);
  const _sc2=new THREE.Color();
  const d=new THREE.Object3D();let placed=0,tries=0;
  const dtSprawl=packDowntown();
  const dtClear=HTS_HAS_PACK?480:380;
  while(placed<N&&tries<7000){tries++;
    const x=(rand()-.5)*9000,z=(rand()-.5)*9000;
    if(Math.hypot(x-dtSprawl.x,z-dtSprawl.z)<dtClear)continue;
    if(blocked(x,z,22))continue;
    d.position.set(x,0,z);d.rotation.y=rand()*Math.PI;
    d.scale.set(16+rand()*24,5+rand()*15,16+rand()*24);d.updateMatrix();
    mesh.setMatrixAt(placed,d.matrix);
    _sc2.setHex(SPRAWL_COLS[Math.floor(rand()*SPRAWL_COLS.length)]);
    mesh.setColorAt(placed,_sc2);placed++;
  }
  mesh.count=placed;gDetail.add(mesh);window.sprawlMat=mat;
})();

/* ---------------- trees (full multi-blob canopies) ---------------- */
function canopyGeom(){
  const parts=[];
  const blobs=[[0,0.9,0,1],[0.55,0.62,0.2,0.7],[-0.5,0.66,-0.15,0.72],[0.1,0.6,0.55,0.66],[-0.15,0.58,-0.5,0.6]];
  for(const [bx,by,bz,bs] of blobs){
    const g=new THREE.IcosahedronGeometry(0.62*bs,1);
    g.translate(bx*0.5,by,bz*0.5);
    parts.push(g);
  }
  const merged=mergeGeoms(parts.map(g=>{if(!g.getIndex()){const n=g.getAttribute('position').count;const ix=[];for(let i=0;i<n;i++)ix.push(i);g.setIndex(ix);}return g;}));
  merged.computeVertexNormals();
  /* baked shading: sunlit crown, shadowed underside */
  const pos=merged.getAttribute('position');
  const col=new Float32Array(pos.count*3);
  let yMin=1e9,yMax=-1e9;
  for(let i=0;i<pos.count;i++){const y=pos.getY(i);if(y<yMin)yMin=y;if(y>yMax)yMax=y;}
  for(let i=0;i<pos.count;i++){
    const k=0.42+0.42*((pos.getY(i)-yMin)/(yMax-yMin));
    col[i*3]=k;col[i*3+1]=k;col[i*3+2]=k;
  }
  merged.setAttribute('color',new THREE.BufferAttribute(col,3));
  return merged;
}
(function(){
  const N=HTS_IS_AUS?6200:4200;
  const trunkG=new THREE.CylinderGeometry(0.45,0.62,1,5);trunkG.translate(0,0.5,0);
  const trunks=new THREE.InstancedMesh(trunkG,new THREE.MeshLambertMaterial({color:0x5a4030}),N);
  const canG=canopyGeom();
  const cans=new THREE.InstancedMesh(canG,new THREE.MeshLambertMaterial({vertexColors:true}),N);
  const pineG=new THREE.ConeGeometry(0.62,1.7,7);pineG.translate(0,0.85,0);
  const pines=new THREE.InstancedMesh(pineG,new THREE.MeshLambertMaterial({}),900);
  const d=new THREE.Object3D(),col=new THREE.Color();
  /* Live-oak / pine greens — saturated but not neon under ACES */
  const GREENS=HTS_IS_AUS
    ?[0x2a6e28,0x348028,0x3a882e,0x246820,0x4a9034,0x2e7424]
    :[0x2f6a28,0x356e2c,0x3a7830,0x2a5e24,0x427a34,0x285820];
  const PINEG=[0x1e4a28,0x285830,0x1a4022];
  let idx=0,pidx=0;
  function put(x,z,pine){
    if(blocked(x,z,4))return;
    if(typeof inWater==='function'&&inWater(x,z))return;
    const h=7+rand()*9;
    if(pine){
      if(pidx>=900)return;
      d.position.set(x,0,z);d.scale.set(6+rand()*3,(12+rand()*8),6+rand()*3);d.updateMatrix();
      pines.setMatrixAt(pidx,d.matrix);
      col.setHex(PINEG[Math.floor(rand()*PINEG.length)]);pines.setColorAt(pidx,col);
      pidx++;return;
    }
    if(idx>=N)return;
    d.position.set(x,0,z);d.rotation.y=0;d.scale.set(1,h,1);d.updateMatrix();trunks.setMatrixAt(idx,d.matrix);
    const cw=(HTS_IS_AUS?10:8)+rand()*(HTS_IS_AUS?9:7);
    d.position.set(x,h*0.72,z);d.rotation.y=rand()*TAU;d.scale.set(cw,cw*0.9,cw);d.updateMatrix();cans.setMatrixAt(idx,d.matrix);
    col.setHex(GREENS[Math.floor(rand()*GREENS.length)]);cans.setColorAt(idx,col);
    idx++;
  }
  /* Water corridors — denser canopy on BANKS (not mid-channel) */
  for(const pts of ALL_BAYOUS){
    if(!pts||pts.length<2)continue;
    const s=sampleCurve(pts,false,HTS_IS_AUS&&pts===LADYBIRD?22:40);
    if(!s||!s.total)continue;
    /* Austin Lady Bird: thick dual-bank canopy like the real hike-and-bike belt */
    const isLb=HTS_IS_AUS&&pts===LADYBIRD;
    const side=isLb?58:HTS_IS_AUS?42:70;
    for(let i=0;i<=s.n;i++){
      const nPut=isLb?4:(HTS_IS_AUS?2:(pts===BAYOU?3:2));
      for(let k=0;k<nPut;k++){
        const sg=rand()<0.5?1:-1;
        const lat=side+(isLb?rand()*22:(rand()-0.5)*10);
        const tx=s.px[i]-s.tz[i]*sg*lat, tz=s.pz[i]+s.tx[i]*sg*lat;
        put(tx,tz,false);
      }
    }
  }
  if(!HTS_HAS_PACK){
    for(let k=0;k<280;k++){const a=rand()*TAU,r=Math.sqrt(rand())*480;
      put(-1140+Math.cos(a)*r,-3620+Math.sin(a)*r,true);}
    for(let k=0;k<220;k++){const a=rand()*TAU,r=Math.sqrt(rand())*420;
      put(1500+Math.cos(a)*r,-3700+Math.sin(a)*r,true);}
    for(let k=0;k<120;k++){const a=rand()*TAU,r=Math.sqrt(rand())*340;
      put(-1600+Math.cos(a)*r,-4950+Math.sin(a)*r,true);}
    for(let k=0;k<180;k++){const a=rand()*TAU,r=Math.sqrt(rand())*280;
      put(-230+Math.cos(a)*r,805+Math.sin(a)*r,false);} /* Hermann */
    for(let k=0;k<140;k++){const a=rand()*TAU,r=Math.sqrt(rand())*360;
      put(-880+Math.cos(a)*r,-130+Math.sin(a)*r,false);} /* Memorial */
    for(let k=0;k<80;k++){put(165+(rand()-.5)*200,28+(rand()-.5)*180,false);}
    for(let k=0;k<120;k++){put(-350+(rand()-.5)*220,-72+(rand()-.5)*180,false);}
    for(let k=0;k<70;k++){const a=rand()*TAU,r=Math.sqrt(rand())*180;
      put(2699+Math.cos(a)*r,-1383+Math.sin(a)*r,false);}
  }else{
    /* Photo refs: urban forest — dense parks + Capitol oaks + south-bank shores */
    const parks=[
      [30.2671,-97.7729,300,420], /* Zilker */
      [30.2648,-97.7715,140,120], /* Barton Springs */
      [30.263,-97.753,180,220], /* Auditorium Shores */
      [30.26,-97.76,160,180], /* Butler Park */
      [30.321,-97.773,180,140], /* Mount Bonnell */
      [30.284,-97.752,160,140], /* Pease */
      [30.2747,-97.7404,200,220], /* Capitol grounds — tree canopy like photos */
      [30.271,-97.741,120,80], /* Congress / Capitol approach */
      [30.28565,-97.73921,90,80], /* UT Tower plaza */
      [30.298,-97.704,160,110], /* Mueller */
      [30.38,-97.67,220,160], /* Walnut Creek */
      [30.36,-97.84,200,140], /* Emma Long */
      [30.185,-97.722,180,120], /* McKinney Falls */
      [30.248,-97.805,160,110], /* Barton greenbelt */
      [30.402,-97.725,140,80], /* Domain */
      [30.292,-97.768,200,140], /* Tarrytown canopy */
      [30.306,-97.727,180,130], /* Hyde Park canopy */
    ];
    for(const [lat,lng,rad,cnt] of parks){
      const p=geoToWorld(lat,lng);
      for(let k=0;k<cnt;k++){
        const a=rand()*TAU,r=Math.sqrt(rand())*rad;
        put(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r,false);
      }
    }
  }
  /* Suburbs: Austin = dense urban forest canopy (houses under oaks) */
  const yardTrees=HTS_IS_AUS?55:22;
  for(const [cx,cz,rad] of houseClusters)for(let k=0;k<yardTrees;k++){
    const a=rand()*TAU,r=Math.sqrt(rand())*rad;
    put(cx+Math.cos(a)*r,cz+Math.sin(a)*r,false);}
  let tries=0;
  const fillMax=HTS_IS_AUS?14000:9000;
  while(idx<N-1&&tries++<fillMax)put((rand()-.5)*10000,(rand()-.5)*10000,false);
  trunks.count=idx;cans.count=idx;pines.count=pidx;
  gDetail.add(trunks);gDetail.add(cans);gDetail.add(pines);
})();

/* shrubs & hedges — neighborhood yards */
(function(){
  const N=1100;
  const g=new THREE.SphereGeometry(1,6,4,0,TAU,0,Math.PI/2);
  const m=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({}),N);
  const d=new THREE.Object3D(),col=new THREE.Color();
  const GS=[0x356e30,0x3f7a36,0x2f6230,0x4a8238];
  let idx=0,tries=0;
  function shrub(x,z){
    if(idx>=N||blocked(x,z,3))return;
    if(typeof inWater==='function'&&inWater(x,z))return;
    d.position.set(x,0,z);
    const s2=1.8+rand()*2.8;
    d.scale.set(s2,s2*(0.7+rand()*0.4),s2);
    d.rotation.y=rand()*TAU;d.updateMatrix();
    m.setMatrixAt(idx,d.matrix);
    col.setHex(GS[Math.floor(rand()*4)]);m.setColorAt(idx,col);idx++;
  }
  for(const [cx,cz,rad] of houseClusters)for(let k=0;k<14;k++){
    const a=rand()*TAU,r=Math.sqrt(rand())*rad;
    shrub(cx+Math.cos(a)*r,cz+Math.sin(a)*r);
  }
  while(idx<N&&tries++<4000)shrub((rand()-.5)*7000,(rand()-.5)*7000);
  m.count=idx;gDetail.add(m);
})();

/* ---------------- ship-channel industry ---------------- */
(function(){
  if(HTS_HAS_PACK)return;
  const spots=[];
  for(let i=0;i<28;i++)spots.push([2050+rand()*1300,140+rand()*600]);
  for(let i=0;i<18;i++)spots.push([3550+rand()*680,-580+rand()*440]);
  const g=new THREE.CylinderGeometry(1,1,1,16);g.translate(0,0.5,0);
  const m=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:0xb9bcb6}),spots.length);
  const d=new THREE.Object3D();let idx=0;
  for(const [x,z] of spots){
    if(blocked(x,z,8))continue;
    const r=14+rand()*18,h=10+rand()*14;
    d.position.set(x,0,z);d.scale.set(r,h,r);d.updateMatrix();m.setMatrixAt(idx++,d.matrix);
  }
  m.count=idx;gDetail.add(m);
  const fg=new THREE.CylinderGeometry(0.8,1.4,60,6);fg.translate(0,30,0);
  for(const [x,z] of [[2280,180],[3920,-620]]){
    const fm=new THREE.Mesh(fg.clone(),new THREE.MeshLambertMaterial({color:0x777d84}));
    fm.position.set(x,0,z);gDetail.add(fm);
  }
})();

/* downtown street grid — Houston CBD + quiet Austin Congress-aligned fabric */
(function(){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  if(HTS_HAS_PACK){
    /* Dim clay-city blocks — N–S / E–W fabric */
    x.fillStyle='#4a463c';
    x.fillRect(0,0,256,256);
    x.strokeStyle='#6a6558';x.lineWidth=4;
    for(let i=0;i<=12;i++){
      const p=i*(256/12);
      x.beginPath();x.moveTo(p,0);x.lineTo(p,256);x.stroke();
    }
    x.strokeStyle='#5c584c';x.lineWidth=5;
    for(let i=0;i<=8;i++){
      const p=i*(256/8);
      x.beginPath();x.moveTo(0,p);x.lineTo(256,p);x.stroke();
    }
    x.strokeStyle='#8a8470';x.lineWidth=9;
    x.beginPath();x.moveTo(128,0);x.lineTo(128,256);x.stroke();
  }else{
    x.strokeStyle='#2c2f34';x.lineWidth=7;
    for(let i=0;i<=8;i++){const p=i*32;x.beginPath();x.moveTo(p,0);x.lineTo(p,256);x.stroke();
      x.beginPath();x.moveTo(0,p);x.lineTo(256,p);x.stroke();}
  }
  const t=new THREE.CanvasTexture(c);
  const dt=packDowntown();
  const m=new THREE.Mesh(new THREE.PlaneGeometry(HTS_HAS_PACK?620:720,HTS_HAS_PACK?640:720),
    new THREE.MeshLambertMaterial({
      map:t,transparent:true,opacity:HTS_HAS_PACK?0.38:0.55,depthWrite:false,
    }));
  m.rotation.x=-Math.PI/2;
  /* Pack cities: axis-aligned fabric; Houston grid is slightly rotated */
  m.rotation.z=HTS_HAS_PACK?0:0.12;
  m.position.set(dt.x,0.12,dt.z);
  gDetail.add(m);
})();

/* ---------------- airports & aviation ---------------- */
/* AIRPORTS registry hoisted above building placement */
function runwayTexture(){
  const c=document.createElement('canvas');c.width=512;c.height=64;const x=c.getContext('2d');
  x.fillStyle='#26282c';x.fillRect(0,0,512,64);
  for(let i=0;i<600;i++){x.fillStyle=rand()<0.5?'rgba(255,255,255,.04)':'rgba(0,0,0,.06)';
    x.fillRect(rand()*512,rand()*64,2,2);}
  /* centerline dashes */
  x.fillStyle='#e8eaec';
  for(let px=26;px<486;px+=34)x.fillRect(px,30,17,4);
  /* threshold piano keys */
  for(const bx of [4,496]){for(let k=0;k<6;k++)x.fillRect(bx,6+k*9,12,5);}
  const t=new THREE.CanvasTexture(c);t.anisotropy=MAXAN;return t;
}
const rwTex=runwayTexture();
window.APPLIGHTS=[];
const glassMat=new THREE.MeshPhongMaterial({color:0x3d4c5c,shininess:90,specular:0x99aabb});
/* ---- aircraft builders ---- */
function makeAirliner(finCol){
  const g=new THREE.Group();
  const white=new THREE.MeshLambertMaterial({color:0xeef0f3});
  const grayB=new THREE.MeshLambertMaterial({color:0x9aa2ab});
  const fus=new THREE.Mesh(new THREE.CylinderGeometry(2.35,2.35,32,12),white);
  fus.rotation.x=Math.PI/2;g.add(fus);
  const nose=new THREE.Mesh(new THREE.SphereGeometry(2.35,10,8),white);nose.position.z=16;g.add(nose);
  const tail=new THREE.Mesh(new THREE.CylinderGeometry(2.35,0.7,9,10),white);
  tail.rotation.x=Math.PI/2;tail.position.z=-20.4;g.add(tail);
  const belly=new THREE.Mesh(new THREE.CylinderGeometry(2.36,2.36,30,12,1,false,Math.PI*0.7,Math.PI*0.6),grayB);
  belly.rotation.x=Math.PI/2;g.add(belly);
  /* swept wings */
  for(const sd of [1,-1]){
    const w=new THREE.Mesh(new THREE.BoxGeometry(21,0.55,6.4),white);
    w.position.set(sd*10.5,-1,0.2);w.rotation.y=sd*0.42;w.rotation.z=sd*0.06;g.add(w);
    const wl=new THREE.Mesh(new THREE.BoxGeometry(0.5,3.2,2.6),new THREE.MeshLambertMaterial({color:finCol}));
    wl.position.set(sd*19.6,0.7,-3.4);g.add(wl);
    const eng=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.35,4.6,10),grayB);
    eng.rotation.x=Math.PI/2;eng.position.set(sd*7.2,-2.5,3.2);g.add(eng);
    const st=new THREE.Mesh(new THREE.BoxGeometry(8.6,0.45,3.6),white);
    st.position.set(sd*4.6,1.6,-21);st.rotation.y=sd*0.5;g.add(st);
  }
  const fin=new THREE.Mesh(new THREE.BoxGeometry(0.7,8.4,5.6),new THREE.MeshLambertMaterial({color:finCol}));
  fin.position.set(0,4.6,-21.5);fin.rotation.x=-0.28;g.add(fin);
  /* passenger window bands */
  for(const sd of [1,-1]){
    const wb=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.7,26),new THREE.MeshLambertMaterial({color:0x121820}));
    wb.position.set(sd*2.32,0.7,-2);g.add(wb);
  }
  /* cockpit windshield */
  const cp=new THREE.Mesh(new THREE.BoxGeometry(3.4,1.1,2.4),new THREE.MeshLambertMaterial({color:0x0e141c}));
  cp.position.set(0,1.05,13.6);g.add(cp);
  /* landing gear (toggled by flight phase) */
  const gear=new THREE.Group();
  const strutM=new THREE.MeshLambertMaterial({color:0x8a9098});
  const tireM=new THREE.MeshLambertMaterial({color:0x14161a});
  function leg(x,z){
    const s2=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,2.6,6),strutM);
    s2.position.set(x,-3.2,z);gear.add(s2);
    const t2=new THREE.Mesh(new THREE.CylinderGeometry(0.85,0.85,0.9,8),tireM);
    t2.rotation.z=Math.PI/2;t2.position.set(x,-4.4,z);gear.add(t2);
  }
  leg(0,11);leg(-2.6,-1.5);leg(2.6,-1.5);
  g.add(gear);g.userData.gear=gear;
  const strobe=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffffff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  strobe.scale.set(8,8,1);strobe.position.set(0,-2.4,0);g.add(strobe);
  const beacon=new THREE.Sprite(new THREE.SpriteMaterial({color:0xff3626,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  beacon.scale.set(6,6,1);beacon.position.set(0,3.4,-2);g.add(beacon);
  g.userData={strobe:strobe.material,beacon:beacon.material};
  return g;
}
function makeProp(col){
  const g=new THREE.Group();
  const body=new THREE.MeshLambertMaterial({color:col});
  const fus=new THREE.Mesh(new THREE.CylinderGeometry(1,0.7,8.5,8),body);
  fus.rotation.x=Math.PI/2;g.add(fus);
  const wing=new THREE.Mesh(new THREE.BoxGeometry(12,0.4,2.3),body);wing.position.set(0,1.1,0.6);g.add(wing);
  const fin=new THREE.Mesh(new THREE.BoxGeometry(0.4,2.6,2),body);fin.position.set(0,1.4,-4.2);g.add(fin);
  const st2=new THREE.Mesh(new THREE.BoxGeometry(4.6,0.3,1.4),body);st2.position.set(0,0.4,-4.2);g.add(st2);
  const prop=new THREE.Mesh(new THREE.CircleGeometry(1.7,12),
    new THREE.MeshBasicMaterial({color:0x888c92,transparent:true,opacity:0.3,side:THREE.DoubleSide}));
  prop.position.z=4.6;g.add(prop);
  g.userData={strobe:{opacity:0},beacon:{opacity:0},acClass:'prop'};
  return g;
}
function makeHeli(col){
  const g=new THREE.Group();
  const body=new THREE.MeshLambertMaterial({color:col||0x3a4a5a});
  const dark=new THREE.MeshLambertMaterial({color:0x1a222c});
  const fus=new THREE.Mesh(new THREE.SphereGeometry(2.4,10,8),body);
  fus.scale.set(1.1,0.85,1.6);g.add(fus);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(3.2,2.2,3.6),new THREE.MeshLambertMaterial({color:0x6a8aaa,transparent:true,opacity:0.55}));
  cabin.position.set(0,0.4,1.2);g.add(cabin);
  const boom=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.55,9,8),body);
  boom.rotation.x=Math.PI/2;boom.position.set(0,0.6,-6.5);g.add(boom);
  const tail=new THREE.Mesh(new THREE.BoxGeometry(0.3,2.2,1.4),body);
  tail.position.set(0,1.4,-11);g.add(tail);
  const skidM=new THREE.MeshLambertMaterial({color:0x333840});
  for(const sd of [-1,1]){
    const sk=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,7,6),skidM);
    sk.rotation.x=Math.PI/2;sk.position.set(sd*1.6,-2.2,0.4);g.add(sk);
  }
  /* main rotor disc (spins in update) */
  const rotor=new THREE.Mesh(new THREE.CircleGeometry(7.5,24),
    new THREE.MeshBasicMaterial({color:0x9aa3ad,transparent:true,opacity:0.28,side:THREE.DoubleSide,depthWrite:false}));
  rotor.rotation.x=-Math.PI/2;rotor.position.y=3.2;g.add(rotor);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,1.2,8),dark);
  hub.position.y=2.6;g.add(hub);
  const tRotor=new THREE.Mesh(new THREE.CircleGeometry(1.4,12),
    new THREE.MeshBasicMaterial({color:0x9aa3ad,transparent:true,opacity:0.35,side:THREE.DoubleSide,depthWrite:false}));
  tRotor.position.set(0.7,1.5,-11);g.add(tRotor);
  g.userData={strobe:{opacity:0},beacon:{opacity:0},acClass:'heli',rotor,tRotor};
  return g;
}
/* Classify ADS-B type → airliner | prop | heli */
function classifyAcModel(actype,category,cs){
  const t=String(actype||'').toUpperCase();
  const cat=String(category||'').toUpperCase();
  if(cat==='A7'||/ROTOR|HELI/.test(cat))return 'heli';
  if(/^(R44|R66|B06|B407|B412|B429|B430|EC35|EC45|EC55|EC75|A109|A119|A139|A169|H60|H64|S76|S92|AS35|AS50|UH1|MD50|MD52|MD90|AW13|AW13|AW169|C208H|H125|H130|H135|H145|H155|H175|H225)/.test(t))return 'heli';
  if(/\b(HELI|HELICOPTER|ROTOR)\b/.test(t))return 'heli';
  if(/^(C172|C152|C182|C206|C208|C210|PA28|PA32|PA44|PA46|BE36|BE58|SR20|SR22|DA40|DA42|M20|TBM|PC12|KODI|BN2)/.test(t))return 'prop';
  if(/^(E55P|C25|C25A|C25B|C25C|C56X|C68A|C750|CL30|CL35|CL60|GLF4|GLF5|GLF6|G150|G280|HA4T|FA50|FA7X|LJ45|LJ60|BE40|BE20)/.test(t))return 'prop'; /* light jets / turboprops → smaller model */
  const call=String(cs||'').toUpperCase();
  if(/^N\d/.test(call)&&!/^(UAL|AAL|DAL|SWA|FFT|NKS|ASA|JBU|ENY|SKW|RPA|ASH|EDV|GJS)/.test(call)){
    /* many GA N-numbers — prefer prop if type unknown and slow/low later */
  }
  return 'airliner';
}
const FIN_COLS=[0x2b5ea8,0xc23a2c,0x1d7a4f,0xd9861f,0x5a3d8f,0x27737e];
const HELI_COLS=[0x3a4a5a,0x2d5a3a,0x5a3a2d,0x2a3a5a,0x4a4a2a];
const PROP_COLS=[0xd9d9d9,0xc23a2c,0x2b5ea8,0x1d7a4f,0xd9861f];
/* ---- airport builder ---- */
for(const a of AIRPORTS){
  const hd=a.rot;
  a.dx=Math.cos(hd);a.dz=-Math.sin(hd); /* runway long-axis direction in world */
  const grp=new THREE.Group();gDetail.add(grp);
  function pad(w,l,color,y,ox,oz,extraRot){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,l),new THREE.MeshLambertMaterial({color}));
    m.rotation.x=-Math.PI/2;m.rotation.z=hd+(extraRot||0);
    m.position.set(a.x+ox,y,a.z+oz);grp.add(m);return m;
  }
  /* apron */
  pad(a.intl?680:360,a.intl?470:220,0x53575c,0.09,0,0);
  /* runway (textured) + parallel taxiway */
  const rw=new THREE.Mesh(new THREE.PlaneGeometry(a.runLen,30),
    new THREE.MeshLambertMaterial({map:rwTex}));
  rw.rotation.x=-Math.PI/2;rw.rotation.z=hd;
  rw.position.set(a.x-a.dz*(-95)*0,0.14,a.z);
  rw.position.set(a.x+(-a.dz)*(-95),0.14,a.z+(a.dx)*(-95));
  grp.add(rw);
  const tw=pad(a.runLen*0.82,13,0x3c4046,0.12,(-a.dz)*(-55),(a.dx)*(-55));
  /* connectors */
  for(const f of [-0.32,0,0.32]){
    const cn=pad(13,42,0x3c4046,0.12,a.dx*a.runLen*f+(-a.dz)*(-75),a.dz*a.runLen*f+(a.dx)*(-75),Math.PI/2);
  }
  if(a.intl){
    /* terminal + jet bridges + tower */
    const term=new THREE.Mesh(towerGeo,towerMats[3]);
    term.scale.set(300,16,44);term.rotation.y=hd;
    term.position.set(a.x+(-a.dz)*90,0,a.z+(a.dx)*90);grp.add(term);
    for(let b=0;b<5;b++){
      const f=(b-2)*0.16;
      const jb=new THREE.Mesh(towerGeo,new THREE.MeshLambertMaterial({color:0x767c84}));
      jb.scale.set(4,6,26);jb.rotation.y=hd;
      jb.position.set(a.x+a.dx*300*f+(-a.dz)*62,0,a.z+a.dz*300*f+(a.dx)*62);grp.add(jb);
      /* Static gate models look like frozen live traffic (esp. AUS) — keep only for Houston legacy */
      if(!HTS_HAS_PACK){
        const pk=makeAirliner(FIN_COLS[(b+AIRPORTS.indexOf(a))%FIN_COLS.length]);
        pk.scale.setScalar(0.85);
        pk.position.set(a.x+a.dx*300*f+(-a.dz)*40,2.6,a.z+a.dz*300*f+(a.dx)*40);
        pk.rotation.y=Math.atan2(-a.dz,a.dx)+Math.PI/2;
        pk.userData.decorParked=true;
        grp.add(pk);
      }
    }
    /* sequenced approach lights leading to the threshold */
    const seq=[];
    for(let li2=0;li2<8;li2++){
      const d=-(a.runLen/2+30+li2*30);
      const sp2=new THREE.Sprite(new THREE.SpriteMaterial({color:0xfff4d0,transparent:true,opacity:0,
        blending:THREE.AdditiveBlending,depthWrite:false}));
      sp2.scale.set(7,7,1);
      sp2.position.set(a.x+a.dx*d+(-a.dz)*(-95),2.2,a.z+a.dz*d+(a.dx)*(-95));
      grp.add(sp2);seq.push(sp2.material);
    }
    APPLIGHTS.push(seq);
    const twr=new THREE.Mesh(new THREE.CylinderGeometry(4,5,44,8),new THREE.MeshLambertMaterial({color:0xb9bec4}));
    twr.position.set(a.x+(-a.dz)*150+a.dx*180,22,a.z+(a.dx)*150+a.dz*180);grp.add(twr);
    const cab=new THREE.Mesh(new THREE.CylinderGeometry(7,8,7,8),glassMat);
    cab.position.copy(twr.position);cab.position.y=47;grp.add(cab);
  }else{
    /* GA hangars + small tower — skip static parked props on pack cities (same freeze confusion) */
    for(let hgi=0;hgi<3;hgi++){
      const f=(hgi-1)*0.24;
      const hg=new THREE.Mesh(new THREE.CylinderGeometry(13,13,34,10,1,false,0,Math.PI),
        new THREE.MeshLambertMaterial({color:0x8d9299,side:THREE.DoubleSide}));
      hg.rotation.z=Math.PI/2;hg.rotation.y=hd;
      hg.position.set(a.x+a.dx*a.runLen*0.6*f+(-a.dz)*66,0,a.z+a.dz*a.runLen*0.6*f+(a.dx)*66);grp.add(hg);
      if(!HTS_HAS_PACK){
        const pp=makeProp([0xd9d9d9,0xc23a2c,0x2b5ea8][hgi]);
        pp.position.set(a.x+a.dx*a.runLen*0.6*f+(-a.dz)*44,1.2,a.z+a.dz*a.runLen*0.6*f+(a.dx)*44);
        pp.rotation.y=rand()*TAU;pp.userData.decorParked=true;grp.add(pp);
      }
    }
    const twr=new THREE.Mesh(new THREE.CylinderGeometry(2.4,3,20,7),new THREE.MeshLambertMaterial({color:0xb9bec4}));
    twr.position.set(a.x+(-a.dz)*46+a.dx*a.runLen*0.42,10,a.z+(a.dx)*46+a.dz*a.runLen*0.42);grp.add(twr);
  }
  /* night operations lighting */
  const edgeMats=[];
  const eg=new THREE.SphereGeometry(0.9,5,4);
  const nEdge=Math.floor(a.runLen/44);
  const edge=new THREE.InstancedMesh(eg,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0}),nEdge*2);
  {const d0=new THREE.Object3D();let ei=0;
   for(let k=0;k<nEdge;k++){const s2=-a.runLen/2+22+k*44;
     for(const sd of [1,-1]){
       d0.position.set(a.x+a.dx*s2+(-a.dz)*(-95+sd*16),1.4,a.z+a.dz*s2+(a.dx)*(-95+sd*16));
       d0.updateMatrix();edge.setMatrixAt(ei++,d0.matrix);}}}
  grp.add(edge);
  if(!window.RWEDGE)window.RWEDGE=[];
  RWEDGE.push(edge.material);
  /* PAPI: 4 lights beside the touchdown zone */
  for(let k=0;k<4;k++){
    const spx=new THREE.Sprite(new THREE.SpriteMaterial({color:k<2?0xffffff:0xff3626,transparent:true,opacity:0,
      blending:THREE.AdditiveBlending,depthWrite:false}));
    spx.scale.set(5,5,1);
    spx.position.set(a.x+a.dx*(-a.runLen*0.3)+(-a.dz)*(-95-22-k*5),2,a.z+a.dz*(-a.runLen*0.3)+(a.dx)*(-95-22-k*5));
    grp.add(spx);RWEDGE.push(spx.material);
  }
  /* airport beacon: alternating white/green */
  const bcn=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffffff,transparent:true,opacity:0,
    blending:THREE.AdditiveBlending,depthWrite:false}));
  bcn.scale.set(11,11,1);
  bcn.position.set(a.x+(-a.dz)*(a.intl?150:46)+a.dx*(a.intl?180:a.runLen*0.42),a.intl?52:24,
                   a.z+(a.dx)*(a.intl?150:46)+a.dz*(a.intl?180:a.runLen*0.42));
  grp.add(bcn);
  if(!window.BEACONS)window.BEACONS=[];
  BEACONS.push(bcn.material);
  const sp=textSprite(a.code,0.46);
  sp.position.set(a.x,58,a.z);gDetail.add(sp);
  /* invisible hover hit volume so users can inspect airport info */
  const hit=new THREE.Mesh(
    new THREE.BoxGeometry(a.intl?520:280,40,a.intl?360:200),
    new THREE.MeshBasicMaterial({visible:false,transparent:true,opacity:0})
  );
  hit.position.set(a.x,20,a.z);
  hit.rotation.y=hd;
  hit.userData.airport=a;
  grp.add(hit);
  if(!window.AIRPORT_HITS)window.AIRPORT_HITS=[];
  AIRPORT_HITS.push(hit);
  a.grp=grp;
}
/* ---- live flights ---- */
const AIRLINES=['UA','WN','AA','DL','B6','F9','NK'];
const ACTYPES=['B737-800','A320neo','B787-9','A321','E175','B737 MAX 8'];
const CITIES=['DEN','ATL','LAX','ORD','MIA','DFW','JFK','SEA','PHX','MSY','SAT','AUS','CUN','MEX','BMT','DAL'];
function newCallsign(){return AIRLINES[Math.floor(rand()*AIRLINES.length)]+(100+Math.floor(rand()*3900));}
window.FLIGHTS=[];
(function(){
  /* Live ADS-B (OpenSky) — best-effort. If rate-limited/offline, sim flights remain. */
  window.LIVE_FLIGHTS_ENABLED=true;
  window.LIVE_FLIGHTS=new Map(); /* icao24 -> flight object */
  window.LIVE_FLIGHT_LIST=[];    /* stable array for UI ordering */
  window.LIVE_FLIGHT_STATUS={ok:false,err:'',at:0};

  function bbox(){
    const b=window.HTS_CITY&&window.HTS_CITY.bbox;
    if(b)return {lamin:b.south,lamax:b.north,lomin:b.west,lomax:b.east};
    return {lamin:28.7,lamax:30.6,lomin:-96.6,lomax:-94.3};
  }
  function mapAdsbLol(ac){
    return (Array.isArray(ac)?ac:[]).map(a=>{
      const altFt=numOrNull(a.alt_baro)!=null?numOrNull(a.alt_baro):(numOrNull(a.alt_geom)!=null?numOrNull(a.alt_geom):null);
      const gs=numOrNull(a.gs);
      return {
        icao24:String(a.hex||'').trim().toLowerCase(),
        cs:cleanCS(a.flight||''),
        country:'',
        lon:numOrNull(a.lon),lat:numOrNull(a.lat),
        altM:(altFt!=null?(altFt*0.3048):null),
        altFt:altFt,
        onGround:!!a.ground||String(a.alt_baro||'').toLowerCase()==='ground',
        vel:(gs!=null?(gs/1.94384):null),
        gsKts:gs!=null?Math.round(gs):null,
        track:numOrNull(a.track),
        vsFpm:numOrNull(a.baro_rate),
        actype:a.t||null,
        category:a.category||a.cat||null,
        reg:a.r||null,
        baroInHg:(numOrNull(a.nav_qnh)!=null?numOrNull(a.nav_qnh)*0.0295299830714:null),
        _adsb:a,
      };
    });
  }
  function mapOpenSky(states){
    return (Array.isArray(states)?states:[]).map(s=>{
      const altM=numOrNull(s[7]);
      const vel=numOrNull(s[9]);
      return {
        icao24:s[0],
        cs:cleanCS(s[1]),
        country:s[2],
        lon:numOrNull(s[5]),lat:numOrNull(s[6]),
        altM:altM,
        altFt:altM!=null?Math.round(altM*3.28084):null,
        onGround:!!s[8],
        vel:vel,
        gsKts:vel!=null?Math.round(vel*1.94384):null,
        track:numOrNull(s[10]),
      };
    });
  }
  async function tryJson(urls){
    let lastErr='';
    for(const url of urls){
      try{
        const r=await fetchWithTimeout(url,{cache:'no-store',mode:'cors'},10000);
        if(!r.ok){lastErr=url+' → '+r.status;continue;}
        return await r.json();
      }catch(e){lastErr=String(e&&e.message?e.message:e);}
    }
    throw new Error(lastErr||'feed unreachable');
  }
  async function fetchLiveAir(){
    /* Production: call public ADS-B hosts directly (CORS). Prefer airplanes.live —
       adsb.lol / OpenSky often 429 from shared Netlify egress IPs. */
    const radiusNm=75;
    const local=typeof isLocalDevHost==='function'?isLocalDevHost():/localhost|127\.0\.0\.1/.test(location.hostname);
    const pointPath='/v2/point/'+METRO_LAT+'/'+METRO_LNG+'/'+radiusNm;
    const adHosts=[
      {src:'airplanes.live', direct:'https://api.airplanes.live'+pointPath, proxy:'/api/airplanes'+pointPath},
      {src:'adsb.lol', direct:'https://api.adsb.lol'+pointPath, proxy:'/api/adsblol'+pointPath},
    ];
    for(const h of adHosts){
      try{
        const urls=local?[h.proxy,h.direct]:[h.direct,h.proxy];
        const j2=await tryJson(urls);
        const rows=mapAdsbLol(j2&&j2.ac);
        if(rows.length)return {src:h.src,rows};
      }catch(e){}
    }
    const b=bbox();
    const qs='lamin='+b.lamin+'&lomin='+b.lomin+'&lamax='+b.lamax+'&lomax='+b.lomax;
    const osDirect='https://opensky-network.org/api/states/all?'+qs;
    const osProxy='/api/opensky/api/states/all?'+qs;
    const j=await tryJson(local?[osProxy,osDirect]:[osDirect,osProxy]);
    return {src:'OpenSky',rows:mapOpenSky(j&&j.states)};
  }
  function flightAwareUrl(aeroPath, query){
    /* FlightAware AeroAPI disabled — never hit the paid proxy. */
    return '';
  }
  window.flightAwareUrl=flightAwareUrl;
  window.HTS_FLIGHTAWARE_ENABLED=false;
  /* Client cache for AeroAPI callsign lookups — unused while FA is off */
  const FA_CS_CACHE=new Map(); /* cs -> {at, data, err, status} */
  const FA_CS_TTL_MS=12*60*1000;
  const FA_CS_NEG_TTL_MS=3*60*1000;
  let faCsCooldownUntil=0;
  async function fetchAeroAPI(callsign){
    /* Paid FlightAware AeroAPI off — free ADS-B / OpenSky / route DBs only */
    return null;
  }
  async function fetchAdsbLol(callsign,icao24){
    const cs=cleanCS(callsign);
    const urls=[];
    function add(host,path){
      urls.push(host+path);
      if(host.includes('airplanes.live'))urls.push('/api/airplanes'+path);
      else if(host.includes('adsb.lol'))urls.push('/api/adsblol'+path);
    }
    if(cs){
      const p='/v2/callsign/'+encodeURIComponent(cs);
      add('https://api.airplanes.live',p);
      add('https://api.adsb.lol',p);
    }
    if(icao24){
      const p='/v2/hex/'+encodeURIComponent(icao24);
      add('https://api.airplanes.live',p);
      add('https://api.adsb.lol',p);
    }
    for(const url of urls){
      try{
        const r=await fetchWithTimeout(url,{cache:'no-store',mode:'cors'},10000);
        if(!r.ok)continue;
        const j=await r.json();
        const ac=(j&&j.ac&&j.ac[0])||null;
        if(ac)return ac;
      }catch(e){}
    }
    return null;
  }
  async function fetchRouteByCallsign(callsign){
    const cs=cleanCS(callsign);
    if(!cs)return null;
    const local=typeof isLocalDevHost==='function'?isLocalDevHost():false;
    /* 1) adsbdb — free route DB (CORS * — call direct on Netlify) */
    try{
      const urls=local
        ?['/api/adsbdb/v0/callsign/'+encodeURIComponent(cs),'https://api.adsbdb.com/v0/callsign/'+encodeURIComponent(cs)]
        :['https://api.adsbdb.com/v0/callsign/'+encodeURIComponent(cs),'/api/adsbdb/v0/callsign/'+encodeURIComponent(cs)];
      for(const url of urls){
        try{
          const r=await fetchWithTimeout(url,{cache:'no-store',mode:'cors'},10000);
          if(!r.ok)continue;
          const j=await r.json();
          const fr=(j&&j.response&&j.response.flightroute)||null;
          if(fr&&(fr.origin||fr.destination)){
            return {
              dep:icaoToDisp((fr.origin&&(fr.origin.iata_code||fr.origin.icao_code))||''),
              arr:icaoToDisp((fr.destination&&(fr.destination.iata_code||fr.destination.icao_code))||''),
              src:'adsbdb'
            };
          }
        }catch(e){}
      }
    }catch(e){}
    /* 2) hexdb route */
    try{
      const urls=local
        ?['/api/hexdb/api/v1/route/icao/'+encodeURIComponent(cs),'https://hexdb.io/api/v1/route/icao/'+encodeURIComponent(cs)]
        :['https://hexdb.io/api/v1/route/icao/'+encodeURIComponent(cs),'/api/hexdb/api/v1/route/icao/'+encodeURIComponent(cs)];
      for(const url of urls){
        try{
          const r=await fetchWithTimeout(url,{cache:'no-store',mode:'cors'},10000);
          if(!r.ok)continue;
          const j=await r.json();
          const route=String(j&&j.route||'');
          const parts=route.split('-').filter(Boolean);
          /* Prefer first→last when multi-leg (e.g. KAUS-KSFO-KPDX) */
          if(parts.length>=2){
            return {dep:icaoToDisp(parts[0]),arr:icaoToDisp(parts[parts.length-1]),src:'hexdb'};
          }
        }catch(e){}
      }
    }catch(e){}
    return null;
  }
  async function fetchOpenSkyRoute(icao24){
    if(!icao24)return null;
    const end=Math.floor(Date.now()/1000);
    const begin=end-4*3600;
    const qs='icao24='+encodeURIComponent(icao24)+'&begin='+begin+'&end='+end;
    const local=typeof isLocalDevHost==='function'?isLocalDevHost():false;
    const urls=local
      ?['/api/opensky/api/flights/aircraft?'+qs,'https://opensky-network.org/api/flights/aircraft?'+qs]
      :['https://opensky-network.org/api/flights/aircraft?'+qs,'/api/opensky/api/flights/aircraft?'+qs];
    for(const url of urls){
      try{
        const r=await fetchWithTimeout(url,{cache:'no-store',mode:'cors'},10000);
        if(!r.ok)continue;
        const flights=await r.json();
        if(!Array.isArray(flights)||!flights.length)continue;
        return flights[flights.length-1];
      }catch(e){}
    }
    return null;
  }
  /* icaoToDisp is global (defined near flight helpers) */
  function syncFlightRoute(f){
    const dep=f.dep||'—',arr=f.arr||'—';
    if(dep==='—'&&arr==='—'){f.sched=null;return;}
    let s=dep+' → '+arr;
    if(f.etd)s+=' · ETD '+fmtFlightTime(f.etd);
    if(f.eta)s+=' · ETA '+fmtFlightTime(f.eta);
    f.sched=s;
  }
  async function enrichFlight(f){
    const nowT=Date.now();
    if(f._enrichAt&&nowT-f._enrichAt<90*1000)return;
    f._enrichAt=nowT;
    const adsb=await fetchAdsbLol(f.cs,f.icao24);
    if(adsb){
      if(adsb.t)f.actype=adsb.t;
      if(adsb.category||adsb.cat)f.category=adsb.category||adsb.cat;
      maybeUpgradeLiveMesh(f);
      if(adsb.r)f.reg=adsb.r;
      const altN=numOrNull(adsb.alt_baro)!=null?numOrNull(adsb.alt_baro):numOrNull(adsb.alt_geom);
      if(altN!=null)f.altFt=altN;
      const gsN=numOrNull(adsb.gs);
      if(gsN!=null){f.gsKts=Math.round(gsN);f.kts=f.gsKts;}
      if(numOrNull(adsb.baro_rate)!=null)f.vsFpm=numOrNull(adsb.baro_rate);
      if(numOrNull(adsb.nav_qnh)!=null)f.baroInHg=numOrNull(adsb.nav_qnh)*0.0295299830714;
    }
    const ctx={
      lat:Number.isFinite(f._lat)?f._lat:f._tLat,
      lon:Number.isFinite(f._lon)?f._lon:f._tLon,
      vsFpm:f.vsFpm,reg:f.reg
    };
    /* Free route DBs first (adsbdb/hexdb) — works without FlightAware key on Netlify */
    if(f.cs&&!f._routeVerified){
      const rr=await fetchRouteByCallsign(f.cs);
      if(rr&&(isHoustonApt(rr.dep)||isHoustonApt(rr.arr))){
        const fits=(!Number.isFinite(ctx.lat))||routeFitsPosition(rr.dep,rr.arr,ctx.lat,ctx.lon,ctx.vsFpm);
        if(fits){
          if(rr.dep&&rr.dep!=='—'){f.dep=rr.dep;f._guessRoute=false;}
          if(rr.arr&&rr.arr!=='—'){f.arr=rr.arr;f._guessArr=false;}
          if(f.dep&&f.dep!=='—'&&f.arr&&f.arr!=='—')f._routeVerified=true;
        }
      }
    }
    /* FlightAware AeroAPI disabled — skip paid route enrichment */
    let gotFa=false;
    let faFlights=null;
    if(false&&f.cs&&!f._routeVerified){
      try{
        const data=await fetchAeroAPI(f.cs);
        faFlights=(data&&data.flights)||null;
        if(faFlights&&faFlights.length){
          const fl=pickBestAeroFlight(faFlights,ctx);
          if(fl){
            let d=extractAptCode(fl.origin);
            if(d==='—')d=extractAptCode(fl.origin&&fl.origin.code);
            let a=extractAptCode(fl.destination);
            if(a==='—')a=extractAptCode(fl.destination&&fl.destination.code);
            const fits=(!Number.isFinite(ctx.lat))||routeFitsPosition(d,a,ctx.lat,ctx.lon,ctx.vsFpm);
            if((isHoustonApt(d)||isHoustonApt(a))&&fits){
              f.dep=d;f.arr=a;f._guessRoute=false;f._guessArr=false;
              f.etd=fl.scheduled_out||fl.estimated_out||fl.actual_out||null;
              f.atd=fl.actual_out||null;
              f.eta=fl.estimated_in||fl.scheduled_in||null; /* never use actual_in as ETA */
              f.ata=fl.actual_in||null;
              if(fl.aircraft_type){f.actype=fl.aircraft_type;maybeUpgradeLiveMesh(f);}
              if(fl.registration)f.reg=fl.registration;
              if(fl.status)f.status=fl.status;
              if(fl.fa_flight_id)f.faFlightId=fl.fa_flight_id;
              if(fl.ident_iata)f.csIata=fl.ident_iata;
              else if(fl.ident)f.csIata=fl.ident;
              if(fl.ident_icao&&(!f.cs||/^[A-F0-9]{6}$/i.test(f.cs)))f.cs=fl.ident_icao;
              applyFaLastPosition(f,fl);
              f._faOk=true;f._routeVerified=true;gotFa=true;
              /* Reject if this FA leg already landed */
              if(isStaleOrLandedAero(fl)){
                f.dep=null;f.arr=null;f._routeVerified=false;f._houston=false;f._faOk=false;gotFa=false;
                if(f.m)f.m.visible=false;
              }
            }
          }
          /* If FA shows an active NON-Houston leg (e.g. SDF→SAT), do not keep a stale Houston pair */
          if(!gotFa){
            const active=pickAnyActiveAeroFlight(faFlights,ctx);
            if(active){
              const dep=icaoToDisp(active.origin&&(active.origin.code_iata||active.origin.code_icao));
              const arr=icaoToDisp(active.destination&&(active.destination.code_iata||active.destination.code_icao));
              if(dep&&arr&&dep!=='—'&&arr!=='—'&&!isHoustonApt(dep)&&!isHoustonApt(arr)){
                f.dep=null;f.arr=null;f._routeVerified=false;f._houston=false;f._faOk=false;
                if(f.m)f.m.visible=false;
                syncFlightRoute(f);
                return; /* not a Houston in/out flight right now */
              }
            }
          }
        }
      }catch(e){
        f._faErr=String(e&&e.message?e.message:e);
      }
    }
    /* OpenSky historical route only if still missing */
    if(!gotFa&&!f._routeVerified){
      const route=await fetchOpenSkyRoute(f.icao24);
      if(route){
        const d=route.estDepartureAirport?icaoToDisp(route.estDepartureAirport):'—';
        const a=route.estArrivalAirport?icaoToDisp(route.estArrivalAirport):'—';
        if(isHoustonApt(d)||isHoustonApt(a)){
          const fits=(!Number.isFinite(ctx.lat))||routeFitsPosition(d,a,ctx.lat,ctx.lon,ctx.vsFpm);
          if(fits){
            if(d!=='—'){f.dep=d;f._guessRoute=false;}
            if(a!=='—'){f.arr=a;f._guessArr=false;}
            f._routeVerified=true;
          }
        }
      }
    }
    /* Match FlightAware airport board by callsign when ADS-B route DBs miss a leg */
    {
      const br=findBoardRouteForCallsign(f);
      if(br){
        if((!f.dep||f.dep==='—')&&br.dep&&br.dep!=='—'){f.dep=br.dep;f._guessRoute=false;}
        if((!f.arr||f.arr==='—')&&br.arr&&br.arr!=='—'){f.arr=br.arr;f._guessArr=false;}
        if(f.dep&&f.arr&&f.dep!=='—'&&f.arr!=='—'&&isHoustonFlight(f))f._routeVerified=true;
      }
    }
    /* NEVER invent remote airports; keep Houston side if a pair fails validation */
    if(f._guessRoute||f._guessArr){f._guessRoute=false;f._guessArr=false;}
    if(f.dep&&f.arr&&f.dep!=='—'&&f.arr!=='—'&&!isHoustonFlight(f)){
      f.dep=null;f.arr=null;f._routeVerified=false;
    }
    if(f.dep&&f.arr&&f.dep!=='—'&&f.arr!=='—'&&Number.isFinite(ctx.lat)&&!routeFitsPosition(f.dep,f.arr,ctx.lat,ctx.lon,ctx.vsFpm)){
      const keepDep=isHoustonApt(f.dep)?f.dep:null;
      const keepArr=isHoustonApt(f.arr)?f.arr:null;
      f.dep=keepDep;f.arr=keepArr;f._routeVerified=false;f._faOk=false;
    }
    if((!f.dep||f.dep==='—')&&(!f.arr||f.arr==='—')){
      f.status=f.status||'Live ADS-B · route enriching…';
      f._routeVerified=false;
    }else if(f.dep&&f.dep!=='—'&&f.arr&&f.arr!=='—'&&isHoustonFlight(f)){
      f._routeVerified=true;
    }
    if(f.baroInHg==null&&typeof liveWx!=='undefined'&&liveWx&&liveWx.press!=null)f.baroInHg=liveWx.press;
    if(!f.eta&&f._routeVerified){
      const est=estimateEtaFromNow(f);
      if(est)f.eta=est;
    }
    syncFlightRoute(f);
    /* Only keep flights that are Houston arrivals or departures once route is known */
    if(f._routeVerified)f._houston=isHoustonFlight(f);
    else f._houston=null; /* unknown — still allow sky display until proven otherwise */
    /* Drop landed / multi-day-stale cards even if route was previously verified */
    if(f.ata&&Date.now()-parseMaybeTime(f.ata)>10*60000){
      f._houston=false;f._routeVerified=false;
    }
    if(f.eta&&Date.now()-parseMaybeTime(f.eta)>8*3600000){
      f._houston=false;f._routeVerified=false;
    }
    /* Visibility owned by syncLiveFlightVisibility (sky ↔ panel) */
    if(typeof syncLiveFlightVisibility==='function')syncLiveFlightVisibility();
  }
  function toKts(ms){return Math.round((ms||0)*1.94384);}
  function ft(m){return Math.round((m||0)*3.28084/100)*100;}
  function cleanCS(s){return String(s||'').trim().replace(/\s+/g,'');}
  /** Prefer real GS from feed; never coerce missing vel → 0 (that freezes planes into airport piles). */
  function feedGsKts(x){
    if(!x)return null;
    /* Treat explicit 0 as missing when airborne — many ADS-B mirrors send gs:0 outside dense metros */
    if(x.gsKts!=null&&Number.isFinite(x.gsKts)){
      if(x.gsKts>0)return Math.round(x.gsKts);
      if(x.onGround)return 0;
      return null;
    }
    if(x.vel!=null&&Number.isFinite(x.vel)&&x.vel>0.5)return toKts(x.vel);
    return null;
  }
  function nmBetween(lat1,lon1,lat2,lon2){
    const dLat=(lat2-lat1)*69;
    const dLon=(lon2-lon1)*59.9*Math.cos(((lat1+lat2)*0.5)*Math.PI/180);
    return Math.hypot(dLat,dLon);
  }

  /* create a live aircraft mesh — airliner, prop, or helicopter from ADS-B type */
  function makeLivePlane(seed,actype,category,cs){
    let cls=classifyAcModel(actype,category,cs);
    /* Slow + low + no airline callsign → often GA / heli even without type */
    let m;
    if(cls==='heli')m=makeHeli(HELI_COLS[seed%HELI_COLS.length]);
    else if(cls==='prop')m=makeProp(PROP_COLS[seed%PROP_COLS.length]);
    else m=makeAirliner(FIN_COLS[seed%FIN_COLS.length]);
    scene.add(m);
    const sc=cls==='heli'?1.9:(cls==='prop'?1.7:1.5);
    m.scale.setScalar(sc);
    m.userData.acClass=cls;
    const haloC=document.createElement('canvas');haloC.width=haloC.height=64;const hx=haloC.getContext('2d');
    const hg=hx.createRadialGradient(32,32,6,32,32,28);
    hg.addColorStop(0,'rgba(180,210,240,.35)');hg.addColorStop(0.5,'rgba(140,180,220,.12)');hg.addColorStop(1,'rgba(140,180,220,0)');
    hx.fillStyle=hg;hx.fillRect(0,0,64,64);
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({
      map:new THREE.CanvasTexture(haloC),transparent:true,opacity:0,depthWrite:false,fog:true,
      blending:THREE.NormalBlending}));
    halo.scale.set(18,18,1);halo.position.set(0,cls==='heli'?8:10,0);halo.visible=false;m.add(halo);
    m.userData.halo=halo;
    const pickR=new THREE.Mesh(
      new THREE.SphereGeometry(cls==='heli'?28:36,8,8),
      new THREE.MeshBasicMaterial({visible:false}));
    pickR.userData.flightPick=true;
    m.add(pickR);
    m.traverse(o=>{
      if(!o||!o.isMesh||!o.material)return;
      const mats=Array.isArray(o.material)?o.material:[o.material];
      for(const mat of mats){
        mat.fog=true;
        if(mat.color&&!mat.transparent)mat.color.multiplyScalar(0.78);
        if(mat.emissive)mat.emissive.setHex(0x000000);
        if(mat.emissiveIntensity!=null)mat.emissiveIntensity=0;
      }
    });
    if(m.userData.strobe&&m.userData.strobe.opacity!==undefined){
      m.userData.strobe.opacity=0;
      if(m.userData.strobe.blending!=null)m.userData.strobe.blending=THREE.NormalBlending;
    }
    if(m.userData.beacon&&m.userData.beacon.opacity!==undefined){
      m.userData.beacon.opacity=0;
      if(m.userData.beacon.blending!=null)m.userData.beacon.blending=THREE.NormalBlending;
    }
    return m;
  }
  function maybeUpgradeLiveMesh(f){
    if(!f||!f.m)return;
    const cls=classifyAcModel(f.actype,f.category,f.cs);
    const cur=f.m.userData&&f.m.userData.acClass;
    if(cur===cls)return;
    /* Swap model when type enrichment arrives (e.g. heli after airliner placeholder) */
    const old=f.m;
    const pos=old.position.clone();
    const rot=old.rotation.clone();
    const vis=old.visible;
    scene.remove(old);
    f.m=makeLivePlane((f.icao24||'').charCodeAt(0)||0,f.actype,f.category,f.cs);
    f.m.position.copy(pos);f.m.rotation.copy(rot);f.m.visible=vis;
    if(typeof wireFlightPick==='function')wireFlightPick(f);
    else f.m.userData.flightRef=f;
  }

  let _liveFlightsInFlight=null;
  async function refreshLiveFlights(){
    if(!window.LIVE_FLIGHTS_ENABLED)return;
    if(_liveFlightsInFlight)return _liveFlightsInFlight;
    _liveFlightsInFlight=(async()=>{
    try{
      const feed=await fetchLiveAir();
      LIVE_FLIGHT_STATUS.ok=true;LIVE_FLIGHT_STATUS.err='';LIVE_FLIGHT_STATUS.at=Date.now();LIVE_FLIGHT_STATUS.src=feed.src;
      /* Prefer terminal-area traffic (takeoff/landing) over high cruise dots */
      const top=feed.rows
        .filter(x=>{
          if(!Number.isFinite(x.lat)||!Number.isFinite(x.lon))return false;
          const altFt=x.altFt!=null?x.altFt:(x.altM!=null?x.altM*3.28084:null);
          const near=nearestDecorAirport(x.lat,x.lon);
          const nearTerm=near&&near.mi<20;
          if(x.onGround){
            /* Active taxi/rollout only — parked gate traffic freezes into AUS piles */
            const g=feedGsKts(x);
            if(g==null||g<25)return false;
            return nearTerm&&near.mi<4;
          }
          if(altFt!=null&&altFt<500&&!nearTerm)return false;
          return true;
        })
        .map(x=>{
          const near=nearestDecorAirport(x.lat,x.lon);
          const altFt=x.altFt!=null?x.altFt:(x.altM!=null?x.altM*3.28084:null);
          const cls=classifyAcModel(x.actype,x.category,x.cs);
          let score=0;
          if(near){
            if(near.mi<6)score+=120;
            else if(near.mi<12)score+=70;
            else if(near.mi<22)score+=35;
          }
          if(cls==='heli')score+=90; /* always want local helicopters in the sky */
          if(cls==='prop')score+=40;
          if(altFt!=null&&altFt<8000)score+=40;
          if(altFt!=null&&altFt<3000)score+=50;
          if(x.vsFpm!=null&&Math.abs(x.vsFpm)>200)score+=25;
          if(x.cs&&!/^[a-f0-9]{6}$/i.test(String(x.cs).trim()))score+=15;
          score+=(x.gsKts||0)*0.02;
          return {x,score};
        })
        .sort((a,b)=>b.score-a.score)
        .slice(0,36)
        .map(o=>o.x);

      const seen=new Set();
      for(let i=0;i<top.length;i++){
        const x=top[i];
        if(!x.icao24)continue;
        seen.add(x.icao24);
        let f=LIVE_FLIGHTS.get(x.icao24);
        if(!f){
          const gs0=feedGsKts(x);
          f={kind:'live',icao24:x.icao24,m:makeLivePlane(i,x.actype,x.category,x.cs),
             cs:x.cs||x.icao24.toUpperCase(),
             actype:x.actype||'—',
             category:x.category||null,
             reg:null,
             dep:null,arr:null,etd:null,eta:null,
             city:(x.country||'')||'—',
             status:'Live ADS-B',
             kts:gs0,
             gsKts:gs0,
             altFt:x.altFt!=null?x.altFt:(x.altM!=null?Math.round(x.altM*3.28084):null),
             sched:null,
             _routeVerified:false,_guessRoute:false,_guessArr:false,_houston:null,
             _lat:x.lat,_lon:x.lon,_altM:x.altM||(x.altFt!=null?x.altFt/3.28084:2500),
             _tLat:x.lat,_tLon:x.lon,_tAltM:x.altM||(x.altFt!=null?x.altFt/3.28084:2500),
             _trk:x.track||0,_tTrk:x.track||0,
             _last:performance.now(),_feedAt:Date.now(),
          };
          f.m.visible=false;
          if(typeof wireFlightPick==='function')wireFlightPick(f);
          else{f.m.userData.flightRef=f;}
          LIVE_FLIGHTS.set(x.icao24,f);
          LIVE_FLIGHT_LIST.push(f);
          if(Number.isFinite(x.lat)&&Number.isFinite(x.lon)){
            const w=geoToWorld(x.lat,x.lon);
            const altFt=f.altFt!=null?f.altFt:((f._tAltM||2500)*3.28084);
            f.m.position.set(w.x,displayAltY(altFt),w.z);
            f._yaw=trackToYaw(f._trk||0);
          }
        }
        f.cs=x.cs||f.cs;
        f.city=(x.country||f.city||'—');
        f.onGround=!!x.onGround;
        const gs=feedGsKts(x);
        /* Only update speed when the feed actually reports it — keep last GS to keep flying */
        if(gs!=null&&gs>0){f.kts=gs;f.gsKts=gs;f._lastGoodGs=gs;}
        else if(gs===0&&x.onGround){
          /* Parked: wipe cruise cache or planes stay visible but stand still at AUS */
          f.kts=0;f.gsKts=0;f._lastGoodGs=0;f._estGs=0;f._assumedMotion=false;
        }
        if(x.onGround&&(gs==null||gs<25)){
          f._lastGoodGs=0;f._estGs=0;
        }
        const altFromFeed=x.altFt!=null?x.altFt:(x.altM!=null?Math.round(x.altM*3.28084):null);
        if(altFromFeed!=null&&Number.isFinite(altFromFeed))f.altFt=altFromFeed;
        else if(f.altFt==null&&f._tAltM!=null)f.altFt=ft(f._tAltM);
        if(x.actype)f.actype=x.actype;
        if(x.category)f.category=x.category;
        if(x.reg)f.reg=x.reg;
        if(x.vsFpm!=null)f.vsFpm=x.vsFpm;
        if(x.baroInHg!=null)f.baroInHg=x.baroInHg;
        /* Heuristic: slow+low unknown type → treat as prop/heli for mesh upgrade */
        if((!f.actype||f.actype==='—')&&f.gsKts!=null&&f.gsKts<140&&f.altFt!=null&&f.altFt<4500){
          f.category=f.category||'A1';
        }
        maybeUpgradeLiveMesh(f);
        /* Estimate GS/track from position deltas when feed omits speed (common in Austin) */
        const prevLat=f._tLat,prevLon=f._tLon,prevAt=f._feedAt||Date.now();
        const posMoved=Number.isFinite(prevLat)&&Number.isFinite(x.lat)&&Number.isFinite(x.lon)
          &&(Math.abs(x.lat-prevLat)>3e-5||Math.abs(x.lon-prevLon)>3e-5);
        if(posMoved){
          const dtSec=Math.max(2,(Date.now()-prevAt)/1000);
          const dNm=nmBetween(prevLat,prevLon,x.lat,x.lon);
          const est=clamp((dNm/dtSec)*3600,0,620);
          if(est>=25){
            f._estGs=est;
            f._lastGoodGs=est;
            if(gs==null||gs<=0){f.gsKts=Math.round(est);f.kts=f.gsKts;}
          }
          const brg=((Math.atan2(
            (x.lon-prevLon)*Math.cos(x.lat*Math.PI/180),
            (x.lat-prevLat)
          )*180/Math.PI)+360)%360;
          f._estTrk=brg;
          if(x.track==null||!Number.isFinite(x.track)||x.track===0){
            f._tTrk=brg;f._trk=brg;
          }
        }
        f._tLat=x.lat;f._tLon=x.lon;
        if(x.altM!=null)f._tAltM=x.altM;
        else if(f.altFt!=null)f._tAltM=f.altFt/3.28084;
        if(x.track!=null&&Number.isFinite(x.track)&&!(x.track===0&&posMoved&&f._estTrk!=null)){
          f._tTrk=x.track;
        }else if(f._estTrk!=null&&(f._tTrk==null||f._tTrk===0)){
          f._tTrk=f._estTrk;
        }else{
          f._tTrk=(x.track!=null?x.track:f._tTrk||0);
        }
        f._feedAt=Date.now();
        /* Only hard-reanchor when the reported position actually moved — otherwise dead-reckon */
        f._fixMoved=!!posMoved;
        f._newFix=!!posMoved;
        const showAlt=flightAltFt(f), showGs=flightGsKts(f)||f._estGs||f._lastGoodGs;
        const corr=classifyLiveCorridor(f);
        if(corr){
          const ph=flightPhase(f);
          f.status=(corr.mode==='arr'?'Final '+corr.apt.code:(ph.cls==='takeoff'?'Departing '+corr.apt.code:'Climbing '+corr.apt.code))
            +' · '+(showAlt!=null?showAlt+' ft':'—')+' · '+(showGs!=null?Math.round(showGs)+' kts':'—');
        }else{
          f.status=(showAlt!=null?showAlt+' ft':'—')+' · '+(showGs!=null?Math.round(showGs)+' kts':'—');
        }
      }

      /* enrich a few flights only — free DBs first; FA only if needed */
      const schedPick=top.filter(x=>x.cs||x.icao24).slice(0,4);
      schedPick.forEach((x,i)=>{
        const f=LIVE_FLIGHTS.get(x.icao24);
        if(!f)return;
        setTimeout(()=>enrichFlight(f),i*2500);
      });

      /* Sky ↔ panel: same eligibility set (max 8) */
      const now=performance.now();
      for(const f of LIVE_FLIGHT_LIST){
        if(seen.has(f.icao24))f._stale=0;
        else{
          f._stale=(f._stale||0)+1;
          f._last=now;
        }
      }
      syncLiveFlightVisibility();
    }catch(e){
      LIVE_FLIGHT_STATUS.ok=false;
      LIVE_FLIGHT_STATUS.err=String(e&&e.message?e.message:e);
      LIVE_FLIGHT_STATUS.at=Date.now();
    }finally{
      _liveFlightsInFlight=null;
    }
    })();
    return _liveFlightsInFlight;
  }

  (function loop(){
    refreshLiveFlights().finally(()=>{
      const msg=(window.LIVE_FLIGHT_STATUS&&LIVE_FLIGHT_STATUS.err)||'';
      /* ADS-B every 45s; back off hard on 429 */
      const backoff=/429|Too many requests/i.test(msg) ? 120000 : 45000;
      setTimeout(loop, backoff);
    });
  })();
})();

/* ---- Airport departure / arrival boards (FlightAware AeroAPI DISABLED) ---- */
(function(){
  window.HOUSTON_BOARD_STATUS={ok:false,err:'FlightAware disabled — free ADS-B sky only',at:Date.now()};
  window.HOUSTON_BOARD=[];
  window.HOUSTON_BOARDS={}; /* apt -> {departures:[], arrivals:[]} */
  const BOARD_APTS=(HTS_PACK&&HTS_PACK.boardApts&&HTS_PACK.boardApts.length)
    ?HTS_PACK.boardApts.slice()
    :['IAH','HOU','EFD','SGR','DWH','IWS','CXO'];
  window.BOARD_UI={apt:BOARD_APTS[0]||'IAH',kind:'departures'};
  /* Paid FlightAware boards off — no polling, no AeroAPI calls */
  window.refreshAirportBoard=function(){
    window.HOUSTON_BOARD_STATUS={ok:false,err:'flightaware_disabled',at:Date.now()};
    if(typeof window.renderAirportBoard==='function')window.renderAirportBoard(true);
    return Promise.resolve();
  };
  /* Clear any cached FA board rows so UI does not look "live" from old paid data */
  try{localStorage.removeItem('houstonSim.boardCache.v1');}catch(e){}
  if(typeof window.renderAirportBoard==='function')setTimeout(()=>window.renderAirportBoard(true),0);
})();
/* Simulated airport-cycle / cruise planes removed — sky is live ADS-B only.
   FLIGHTS stays as an empty array so click/follow helpers remain safe. */
(function(){ window.FLIGHTS = window.FLIGHTS || []; })();
/* ---------------- stadiums & arenas ---------------- */
let ASTRO={x:0,z:0};
/* Module-scoped: trafficTick event congestion must see NRG even though the mesh
   builder lives inside if(!HTS_HAS_PACK). Block-scoped const caused black screens
   whenever event traffic kicked in (ReferenceError: NRG is not defined). */
const NRG=geoToWorld(29.6847,-95.4107);
if(!HTS_HAS_PACK){
/* Real NRG Stadium @ 1 NRG Pkwy — rectangular glass bowl, translucent PTFE roof,
   twin burgundy-red longitudinal supertrusses (signature silhouette from I-610). */
(function(){
  const cx=NRG.x,cz=NRG.z;
  const glass=new THREE.MeshLambertMaterial({color:0xa8c4d8,transparent:true,opacity:0.72});
  const glassDark=new THREE.MeshLambertMaterial({color:0x6a8498,transparent:true,opacity:0.8});
  const steel=new THREE.MeshLambertMaterial({color:0x8a929a});
  const burg=new THREE.MeshLambertMaterial({color:0x6b1f2a}); /* Texans burgundy arches */
  const roofFab=new THREE.MeshLambertMaterial({color:0xe8eef4,transparent:true,opacity:0.86});
  const conc=new THREE.MeshLambertMaterial({color:0xb8b4ac});
  const turf=new THREE.MeshLambertMaterial({color:0x2f6b38});
  const g=gDetail;
  const W=96,D=76; /* sized so Astrodome to the east keeps a clear plaza gap */
  /* Concrete podium */
  const base=new THREE.Mesh(towerGeo,conc);
  base.scale.set(W,8,D);base.position.set(cx,0,cz);g.add(base);
  /* Glass curtain walls — transparent facade like the real stadium */
  const wallH=28;
  const walls=[
    {sx:W*0.98,sz:2.6,px:0,pz:D*0.5-1.3,mat:glass},
    {sx:W*0.98,sz:2.6,px:0,pz:-(D*0.5-1.3),mat:glass},
    {sx:2.6,sz:D*0.98,px:W*0.5-1.3,pz:0,mat:glassDark},
    {sx:2.6,sz:D*0.98,px:-(W*0.5-1.3),pz:0,mat:glassDark},
  ];
  for(const w of walls){
    const wall=new THREE.Mesh(towerGeo,w.mat);
    wall.scale.set(w.sx,wallH,w.sz);wall.position.set(cx+w.px,8,cz+w.pz);g.add(wall);
  }
  /* Upper seating bowl (inset) */
  const bowl=new THREE.Mesh(towerGeo,new THREE.MeshLambertMaterial({color:0x9aa3ab}));
  bowl.scale.set(W*0.88,18,D*0.88);bowl.position.set(cx,8,cz);g.add(bowl);
  /* Playing field + yard lines */
  const field=new THREE.Mesh(new THREE.PlaneGeometry(W*0.62,D*0.55),turf);
  field.rotation.x=-Math.PI/2;field.position.set(cx,26.4,cz);g.add(field);
  for(let i=-4;i<=4;i++){
    const stripe=new THREE.Mesh(new THREE.PlaneGeometry(1.1,D*0.52),new THREE.MeshLambertMaterial({color:0xe8efe8}));
    stripe.rotation.x=-Math.PI/2;stripe.position.set(cx+i*8.2,26.5,cz);g.add(stripe);
  }
  /* Twin longitudinal burgundy supertrusses — the signature “parentheses” arches */
  function superTruss(side){
    const grp=new THREE.Group();
    const len=W*0.92,rise=52,y0=34,segs=18;
    for(let i=0;i<segs;i++){
      const t=(i+0.5)/segs;
      const x=-len/2+t*len;
      const y=y0+Math.sin(t*Math.PI)*rise;
      const piece=new THREE.Mesh(new THREE.BoxGeometry(len/segs*1.2,4.4,5.8),burg);
      piece.position.set(x,y,side*(D*0.5+2));
      piece.rotation.z=Math.cos(t*Math.PI)*0.62;
      grp.add(piece);
    }
    for(const t of [0.06,0.5,0.94]){
      const x=-len/2+t*len;
      const top=y0+Math.sin(t*Math.PI)*rise;
      const post=new THREE.Mesh(towerGeo,burg);
      post.scale.set(4.8,Math.max(8,top-6),5.2);post.position.set(x,6,side*(D*0.5+2));
      grp.add(post);
    }
    grp.position.set(cx,0,cz);g.add(grp);
  }
  superTruss(1);superTruss(-1);
  /* Translucent PTFE retractable roof — two panels meeting at midfield */
  const roofY=58;
  const roofL=new THREE.Mesh(new THREE.BoxGeometry(W*0.44,2.2,D*0.78),roofFab);
  roofL.position.set(cx-W*0.23,roofY,cz);g.add(roofL);
  const roofR=new THREE.Mesh(new THREE.BoxGeometry(W*0.44,2.2,D*0.78),roofFab);
  roofR.position.set(cx+W*0.23,roofY,cz);g.add(roofR);
  /* Cross beams between arches */
  for(let i=0;i<5;i++){
    const t=(i+0.5)/5;
    const x=cx-W*0.42+t*W*0.84;
    const y=34+Math.sin(t*Math.PI)*48;
    const cross=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.2,D*0.96),steel);
    cross.position.set(x,y,cz);g.add(cross);
  }
  /* Corner concrete supercolumns */
  for(const sx of [-1,1])for(const sz of [-1,1]){
    const col=new THREE.Mesh(towerGeo,conc);
    col.scale.set(10,48,8);col.position.set(cx+sx*(W*0.48),0,cz+sz*(D*0.48));g.add(col);
  }
  /* Plaza apron */
  const plaza=new THREE.Mesh(new THREE.PlaneGeometry(W*1.35,D*1.35),new THREE.MeshLambertMaterial({color:0x6a7078}));
  plaza.rotation.x=-Math.PI/2;plaza.position.set(cx,0.15,cz);g.add(plaza);
  const sp=textSprite('NRG Stadium',0.55);sp.position.set(cx,96,cz);g.add(sp);
  /* Pickable volume for hover / Wikipedia card (must stay visible:true for raycasts) */
  const hit=new THREE.Mesh(
    new THREE.BoxGeometry(W*1.15,72,D*1.15),
    new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})
  );
  hit.position.set(cx,36,cz);
  hit.userData.info={
    n:'NRG Stadium',
    d:'Houston Texans · 72,220 seats · first NFL retractable roof (2002) · Super Bowl & Rodeo host'
  };
  hit.userData.poi={
    n:'NRG Stadium',
    x:cx,z:cz,
    addr:'1 NRG Pkwy — Houston Texans · Rodeo · first NFL retractable-roof stadium'
  };
  g.add(hit);
  if(!window.PICK_TOWERS)window.PICK_TOWERS=[];
  PICK_TOWERS.push(hit);
})();
(function(){
  /* Daikin Park @ real EaDo coords — east of downtown, not under towers */
  const dp=geoToWorld(29.7573,-95.3555);
  const cx=dp.x,cz=dp.z;
  const ball=new THREE.Mesh(towerGeo,new THREE.MeshLambertMaterial({color:0x8a5a44}));
  ball.scale.set(88,24,68);ball.position.set(cx,0,cz);gDetail.add(ball);
  const arch=new THREE.Mesh(new THREE.CylinderGeometry(30,30,88,14,1,false,0,Math.PI),
    new THREE.MeshLambertMaterial({color:0x9aa0a6,side:THREE.DoubleSide}));
  arch.rotation.z=Math.PI/2;arch.position.set(cx,24,cz);gDetail.add(arch);
  let sp=textSprite('Daikin Park',0.42);sp.position.set(cx,70,cz);gDetail.add(sp);
  registerLandmarkHit(cx,26,cz,100,55,85,
    {n:'Daikin Park',d:'Houston Astros · opened 2000 · retractable roof · downtown ballpark'},
    {n:'Daikin Park',x:cx,z:cz,addr:'501 Crawford St — Houston Astros · formerly Minute Maid Park'});
})();
(function(){
  /* Toyota Center @ 1510 Polk — south of CBD in EaDo, open plaza (not under skyscrapers) */
  const tc=geoToWorld(29.7508,-95.3621);
  const cx=tc.x,cz=tc.z;
  const plaza=new THREE.Mesh(new THREE.PlaneGeometry(160,140),new THREE.MeshLambertMaterial({color:0x5a6068}));
  plaza.rotation.x=-Math.PI/2;plaza.position.set(cx,0.12,cz);gDetail.add(plaza);
  const arena=new THREE.Mesh(new THREE.CylinderGeometry(42,48,20,16),new THREE.MeshLambertMaterial({color:0x6a727a}));
  arena.scale.z=0.82;arena.position.set(cx,10,cz);gDetail.add(arena);
  /* glass curtain band */
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(44,49,8,16,1,true),
    new THREE.MeshLambertMaterial({color:0x8ab0c8,transparent:true,opacity:0.55,side:THREE.DoubleSide}));
  glass.scale.z=0.82;glass.position.set(cx,16,cz);gDetail.add(glass);
  const roof=new THREE.Mesh(new THREE.CylinderGeometry(40,40,3,16),new THREE.MeshLambertMaterial({color:0x4a525a}));
  roof.scale.z=0.82;roof.position.set(cx,21,cz);gDetail.add(roof);
  const sp=textSprite('Toyota Center',0.4);sp.position.set(cx,52,cz);gDetail.add(sp);
  registerLandmarkHit(cx,16,cz,110,45,100,
    {n:'Toyota Center',d:'Houston Rockets · opened 2003 · downtown arena & concerts'},
    {n:'Toyota Center',x:cx,z:cz,addr:'1510 Polk St — Houston Rockets · concerts'});
})();
/* Astrodome — east of NRG with a clear plaza gap (real sites are neighbors; sim scale needs space) */
ASTRO={x:NRG.x+210,z:NRG.z-18};
(function(){
  const cx=ASTRO.x,cz=ASTRO.z;
  const domeMat=new THREE.MeshLambertMaterial({color:0xc9c4b8});
  const ringMat=new THREE.MeshLambertMaterial({color:0xa8a49a});
  const R=52;
  const base=new THREE.Mesh(new THREE.CylinderGeometry(R*0.92,R*1.05,18,28),ringMat);
  base.position.set(cx,9,cz);gDetail.add(base);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(R,28,16,0,TAU,0,Math.PI*0.52),domeMat);
  dome.position.set(cx,22,cz);gDetail.add(dome);
  /* lattice ribs */
  for(let i=0;i<12;i++){
    const ang=i/12*TAU;
    const rib=new THREE.Mesh(new THREE.TorusGeometry(R-2,0.9,6,20,Math.PI*0.5),
      new THREE.MeshLambertMaterial({color:0x8e8a82}));
    rib.position.set(cx,22,cz);
    rib.rotation.y=ang;rib.rotation.z=Math.PI/2;
    gDetail.add(rib);
  }
  /* parking / plaza strip between NRG and Astrodome */
  const midX=(NRG.x+ASTRO.x)*0.5,midZ=(NRG.z+ASTRO.z)*0.5;
  const lot=new THREE.Mesh(new THREE.PlaneGeometry(95,70),new THREE.MeshLambertMaterial({color:0x4a5058}));
  lot.rotation.x=-Math.PI/2;lot.position.set(midX,0.12,midZ);gDetail.add(lot);
  const sp=textSprite('Astrodome',0.48);sp.position.set(cx,92,cz);gDetail.add(sp);
  EXCLUDES.push({x:cx,z:cz,r:95});
  registerLandmarkHit(cx,32,cz,120,85,120,
    {n:'Astrodome',d:'1965 · world’s first domed stadium · “Eighth Wonder of the World” · NRG Park'},
    {n:'Astrodome',x:cx,z:cz,addr:'8400 Kirby Dr — world’s first domed stadium (1965)'});
})();
/* San Jacinto Monument — 567-ft limestone obelisk */
(function(){
  const m=geoToWorld(29.7499,-95.0807);
  const cx=m.x,cz=m.z;
  const shaft=new THREE.Mesh(new THREE.BoxGeometry(18,200,18),new THREE.MeshLambertMaterial({color:0xd4cfc4}));
  shaft.position.set(cx,100,cz);gDetail.add(shaft);
  const taper=new THREE.Mesh(new THREE.CylinderGeometry(2,10,40,4),new THREE.MeshLambertMaterial({color:0xcfcabf}));
  taper.position.set(cx,220,cz);gDetail.add(taper);
  /* star top */
  const star=new THREE.Mesh(new THREE.OctahedronGeometry(10,0),new THREE.MeshLambertMaterial({color:0xe8e2d4}));
  star.position.set(cx,248,cz);gDetail.add(star);
  const base=new THREE.Mesh(towerGeo,new THREE.MeshLambertMaterial({color:0xb8b3a8}));
  base.scale.set(48,12,48);base.position.set(cx,0,cz);gDetail.add(base);
  const sp=textSprite('San Jacinto',0.5);sp.position.set(cx,270,cz);gDetail.add(sp);
  EXCLUDES.push({x:cx,z:cz,r:80});
  registerLandmarkHit(cx,120,cz,60,260,60,
    {n:'San Jacinto Monument',d:'567 ft · 1939 · marks the 1836 Battle of San Jacinto'},
    {n:'San Jacinto Monument',x:cx,z:cz,addr:'1 Monument Cir, La Porte · 567 ft obelisk'});
})();
/* Gerald D. Hines Waterwall at Williams Tower */
(function(){
  const wx=-1000,wz=262;
  const wall=new THREE.Mesh(new THREE.TorusGeometry(28,4,8,20,Math.PI),
    new THREE.MeshLambertMaterial({color:0xb9bec4,side:THREE.DoubleSide}));
  wall.rotation.x=Math.PI/2;wall.rotation.z=Math.PI;wall.position.set(wx,32,wz);gDetail.add(wall);
  const pool=new THREE.Mesh(new THREE.CircleGeometry(34,20),new THREE.MeshLambertMaterial({color:0x4a7a9a}));
  pool.rotation.x=-Math.PI/2;pool.position.set(wx,0.4,wz);gDetail.add(pool);
  registerLandmarkHit(wx,28,wz,70,55,70,
    {n:'Waterwall Park',d:'Gerald D. Hines Waterwall · 64 ft fountain · 1985 · faces Williams Tower'},
    {n:'Waterwall Park',x:wx,z:wz,addr:'2800 Post Oak Blvd · Gerald D. Hines Waterwall'});
})();
} /* end Houston-only stadiums / monuments */

/* ---------------- Austin attractions — one building per place, real size + coords ---------------- */
if(HTS_IS_AUS)(function placeAusAttractions(){
  /* Map scale: ~210 units/mile. A football stadium footprint ≈ 45×35, not 110. */
  const conc=new THREE.MeshLambertMaterial({color:0xb8b4ac});
  const glass=new THREE.MeshLambertMaterial({color:0x8ab0c8,transparent:true,opacity:0.78});
  const steel=new THREE.MeshLambertMaterial({color:0x6a727a});
  const turf=new THREE.MeshLambertMaterial({color:0x2f7a38});
  const dark=new THREE.MeshLambertMaterial({color:0x3a4048});
  const cream=new THREE.MeshLambertMaterial({color:0xd8d0c0});
  const waterPool=new THREE.MeshLambertMaterial({color:0x3a9aba});

  function pad(x,z,w,d){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({color:0x5a6068}));
    m.rotation.x=-Math.PI/2;m.position.set(x,0.08,z);gDetail.add(m);
  }
  function box(x,z,w,h,d,mat,y0){
    const m=new THREE.Mesh(towerGeo,mat);
    m.scale.set(w,h,d);m.position.set(x,y0||0,z);gDetail.add(m);return m;
  }
  function label(){ /* no floating name tags — hover cards + Where am I cover places */ }
  function clear(x,z,r){EXCLUDES.push({x,z,r});HTS_AUS_LANDMARK_SKIP.push({x,z,r});}

  /* ---- Stadium: Q2 (Austin FC) — North Burnet, far from UT ---- */
  (function(){
    const p=geoToWorld(30.3878,-97.7195);const cx=p.x,cz=p.z;
    clear(cx,cz,55);pad(cx,cz,70,58);
    box(cx,cz,52,8,42,conc);
    box(cx,cz,48,14,38,steel,6);
    const field=new THREE.Mesh(new THREE.PlaneGeometry(36,24),turf);
    field.rotation.x=-Math.PI/2;field.position.set(cx,20.2,cz);gDetail.add(field);
    for(const [dx,dz] of [[26,20],[26,-20],[-26,20],[-26,-20]])box(cx+dx,cz+dz,2.5,28,2.5,steel);
    label('Q2 Stadium',cx,cz,38,0.4);
    registerLandmarkHit(cx,16,cz,60,40,50,
      {n:'Q2 Stadium',d:'Austin FC · MLS · opened 2021'},
      {n:'Q2 Stadium',x:cx,z:cz,addr:'10414 McKalla Pl — Austin FC'});
  })();

  /* ---- Stadium: DKR–Texas Memorial (east of Tower — own building) ---- */
  (function(){
    const p=geoToWorld(30.28361,-97.73252);const cx=p.x,cz=p.z;
    clear(cx,cz,55);
    const geo=new THREE.BoxGeometry(1,1,1);geo.translate(0,0.5,0);
    function b(x,z,w,h,d,mat,y0){
      const m=new THREE.Mesh(geo,mat);
      m.scale.set(w,h,d);m.position.set(x,y0||0,z);m.frustumCulled=false;gDetail.add(m);
    }
    pad(cx,cz,70,58);
    b(cx,cz,56,12,44,conc);              /* podium */
    b(cx,cz,50,22,38,dark,10);           /* seating bowl */
    b(cx,cz+20,48,14,8,steel,20);        /* upper N */
    b(cx,cz-20,48,14,8,steel,20);        /* upper S */
    b(cx+26,cz,8,18,36,steel,12);        /* east stands */
    b(cx-26,cz,8,18,36,steel,12);        /* west stands */
    const field=new THREE.Mesh(new THREE.PlaneGeometry(36,20),turf);
    field.rotation.x=-Math.PI/2;field.position.set(cx,28.2,cz);field.frustumCulled=false;gDetail.add(field);
    /* goal posts */
    for(const dz of [-12,12]){
      b(cx,cz+dz,1.2,18,1.2,steel,28);
      b(cx,cz+dz,10,1.2,1.2,steel,44);
    }
    registerLandmarkHit(cx,22,cz,65,50,55,
      {n:'DKR–Texas Memorial Stadium',d:'Texas Longhorns football'},
      {n:'DKR–Texas Memorial Stadium',x:cx,z:cz,addr:'405 E 23rd St'});
    console.log('%cDKR Stadium at '+cx.toFixed(0)+','+cz.toFixed(0),'color:#bf5700');
  })();

  /* ---- Arena: Moody Center — south of DKR ---- */
  (function(){
    const p=geoToWorld(30.2806,-97.7323);const cx=p.x,cz=p.z;
    clear(cx,cz,42);pad(cx,cz,50,46);
    const geo=new THREE.BoxGeometry(1,1,1);geo.translate(0,0.5,0);
    const base=new THREE.Mesh(geo,conc);
    base.scale.set(42,10,38);base.position.set(cx,0,cz);base.frustumCulled=false;gDetail.add(base);
    const bowl=new THREE.Mesh(new THREE.CylinderGeometry(20,24,18,16),glass);
    bowl.position.set(cx,19,cz);bowl.frustumCulled=false;gDetail.add(bowl);
    const roof=new THREE.Mesh(new THREE.SphereGeometry(22,16,10,0,TAU,0,Math.PI*0.48),steel);
    roof.scale.set(1,0.35,1);roof.position.set(cx,30,cz);roof.frustumCulled=false;gDetail.add(roof);
    registerLandmarkHit(cx,18,cz,48,40,44,
      {n:'Moody Center',d:'UT arena · basketball · concerts'},
      {n:'Moody Center',x:cx,z:cz,addr:'2001 Robert Dedman Dr'});
  })();

  /* (UT Tower + academic halls are built with Capitol landmarks above) */
  /* ---- Museum: LBJ Library — east of DKR on Red River (own building) ---- */
  (function(){
    const p=geoToWorld(30.2857,-97.7292);const cx=p.x,cz=p.z;
    clear(cx,cz,28);pad(cx,cz,36,30);
    box(cx,cz,28,22,22,cream);
    box(cx,cz,20,5,16,dark,22);
    label('LBJ Library',cx,cz,36,0.3);
    registerLandmarkHit(cx,14,cz,35,30,30,
      {n:'LBJ Presidential Library',d:'LBJ Library & Museum · UT campus'},
      {n:'LBJ Presidential Library',x:cx,z:cz,addr:'2313 Red River St'});
  })();

  /* ---- Theater: ACL Live (downtown — not on campus) ---- */
  (function(){
    const p=geoToWorld(30.2654,-97.7497);const cx=p.x,cz=p.z;
    clear(cx,cz,28);
    box(cx,cz,32,16,26,dark);
    box(cx,cz,28,6,22,glass,16);
    label('ACL Live',cx,cz,32,0.3);
    registerLandmarkHit(cx,12,cz,35,28,30,
      {n:'ACL Live · Moody Theater',d:'Austin City Limits studio'},
      {n:'ACL Live · Moody Theater',x:cx,z:cz,addr:'310 Willie Nelson Blvd'});
  })();

  /* ---- Museum: Bullock — north of Capitol ---- */
  (function(){
    const p=geoToWorld(30.2803,-97.739);const cx=p.x,cz=p.z;
    clear(cx,cz,32);pad(cx,cz,40,34);
    box(cx,cz,34,14,28,cream);
    box(cx+6,cz,16,10,16,glass,14);
    label('Bullock Museum',cx,cz,32,0.3);
    registerLandmarkHit(cx,12,cz,38,28,32,
      {n:'Bullock Texas History Museum',d:'Texas history · IMAX'},
      {n:'Bullock Texas History Museum',x:cx,z:cz,addr:'1800 Congress Ave'});
  })();

  /* ---- Pool: Barton Springs ---- */
  (function(){
    const p=geoToWorld(30.264,-97.771);const cx=p.x,cz=p.z;
    clear(cx,cz,32);
    const deck=new THREE.Mesh(new THREE.PlaneGeometry(48,20),new THREE.MeshLambertMaterial({color:0xc8c0b0}));
    deck.rotation.x=-Math.PI/2;deck.position.set(cx,0.12,cz);gDetail.add(deck);
    const pool=new THREE.Mesh(new THREE.PlaneGeometry(36,12),waterPool);
    pool.rotation.x=-Math.PI/2;pool.position.set(cx,0.2,cz);gDetail.add(pool);
    box(cx-20,cz,8,5,16,conc);
    label('Barton Springs',cx,cz,22,0.28);
    registerLandmarkHit(cx,6,cz,40,16,24,
      {n:'Barton Springs Pool',d:'Spring-fed pool · Zilker'},
      {n:'Barton Springs Pool',x:cx,z:cz,addr:'2131 William Barton Dr'});
  })();

  /* ---- Performing arts: Long Center ---- */
  (function(){
    const p=geoToWorld(30.2607,-97.7513);const cx=p.x,cz=p.z;
    clear(cx,cz,30);pad(cx,cz,38,32);
    box(cx,cz,32,12,26,cream);
    box(cx,cz,24,7,18,glass,12);
    label('Long Center',cx,cz,28,0.28);
    registerLandmarkHit(cx,10,cz,36,24,30,
      {n:'Long Center',d:'Performing arts · Auditorium Shores'},
      {n:'Long Center',x:cx,z:cz,addr:'701 W Riverside Dr'});
  })();

  /* ---- Retail campus: The Domain ---- */
  (function(){
    const p=geoToWorld(30.402,-97.725);const cx=p.x,cz=p.z;
    clear(cx,cz,70);pad(cx,cz,90,80);
    for(const [dx,dz,w,d,h] of [[-22,-16,22,16,28],[20,-14,20,14,24],[-18,20,24,14,22],[22,18,18,16,20],[0,0,26,18,32]]){
      box(cx+dx,cz+dz,w,h,d,rand()<.5?glass:cream);
    }
    registerLandmarkHit(cx,16,cz,80,40,70,
      {n:'The Domain',d:'North Austin mixed-use'},
      {n:'The Domain',x:cx,z:cz,addr:'Domain Dr · North Austin'});
  })();

  /* ---- Park: Zilker — Great Lawn + Hillside Theater shell ---- */
  (function(){
    const p=geoToWorld(30.2671,-97.7729);const cx=p.x,cz=p.z;
    clear(cx,cz,40);
    const lawn=new THREE.Mesh(new THREE.CircleGeometry(36,20),new THREE.MeshLambertMaterial({color:0x3f8a3a}));
    lawn.rotation.x=-Math.PI/2;lawn.position.set(cx,0.1,cz);gDetail.add(lawn);
    box(cx+18,cz-10,22,6,14,cream); /* Zilker Clubhouse */
    /* Hillside Theater — open stage shell */
    const shell=new THREE.Mesh(new THREE.CylinderGeometry(10,14,8,10,1,true,0,Math.PI),conc);
    shell.position.set(cx-12,4,cz+14);shell.rotation.y=0.4;gDetail.add(shell);
    registerLandmarkHit(cx,8,cz,50,24,50,
      {n:'Zilker Park',d:'Great Lawn · Hillside Theater · Trail of Lights'},
      {n:'Zilker Park',x:cx,z:cz,addr:'2100 Barton Springs Rd'});
  })();

  /* ---- Overlook: Mount Bonnell ---- */
  (function(){
    const p=geoToWorld(30.321,-97.773);const cx=p.x,cz=p.z;
    clear(cx,cz,28);
    const hill=new THREE.Mesh(new THREE.CylinderGeometry(18,28,14,12),new THREE.MeshLambertMaterial({color:0x4a7a3a}));
    hill.position.set(cx,7,cz);gDetail.add(hill);
    box(cx,cz,14,4,10,cream,14); /* pavilion on summit */
    registerLandmarkHit(cx,14,cz,32,28,32,
      {n:'Mount Bonnell',d:'Covert Park overlook · Lake Austin views'},
      {n:'Mount Bonnell',x:cx,z:cz,addr:'3800 Mount Bonnell Rd'});
  })();

  /* ---- Park: Pease — pavilion by Shoal Creek ---- */
  (function(){
    const p=geoToWorld(30.284,-97.752);const cx=p.x,cz=p.z;
    clear(cx,cz,28);
    box(cx,cz,18,5,12,cream);
    box(cx,cz,20,2,14,dark,5);
    registerLandmarkHit(cx,6,cz,30,18,28,
      {n:'Pease Park',d:'Shoal Creek greenbelt · Kingsbury Commons'},
      {n:'Pease Park',x:cx,z:cz,addr:'1100 Kingsbury St'});
  })();

  /* ---- Parks: visitor buildings at metro parks ---- */
  for(const [lat,lng,name,addr] of [
    [30.38,-97.67,'Walnut Creek Metro Park','12138 N Lamar Blvd'],
    [30.36,-97.84,'Emma Long Metropolitan Park','1600 City Park Rd'],
    [30.185,-97.722,'McKinney Falls State Park','5808 McKinney Falls Pkwy'],
  ]){
    const p=geoToWorld(lat,lng);const cx=p.x,cz=p.z;
    clear(cx,cz,26);
    box(cx,cz,20,6,14,cream);
    box(cx+10,cz,8,4,10,conc);
    registerLandmarkHit(cx,6,cz,28,16,26,{n:name,d:'Austin metro park'},{n:name,x:cx,z:cz,addr:addr});
  }

  /* ---- Sixth Street entertainment row ---- */
  (function(){
    const p=geoToWorld(30.2675,-97.7395);const cx=p.x,cz=p.z;
    clear(cx,cz,36);
    for(let i=-3;i<=3;i++){
      box(cx+i*10,cz-8,8,10+((i*i)%5),10,i%2?dark:cream);
      box(cx+i*10,cz+8,8,8+((i*i)%4),10,i%2?cream:dark);
    }
    registerLandmarkHit(cx,10,cz,42,24,30,
      {n:'Sixth Street',d:'Historic entertainment district'},
      {n:'Sixth Street',x:cx,z:cz,addr:'E 6th St · Downtown Austin'});
  })();

  /* ---- Rainey Street bungalow bars ---- */
  (function(){
    const p=geoToWorld(30.258,-97.738);const cx=p.x,cz=p.z;
    clear(cx,cz,32);
    for(const [dx,dz] of [[-14,-6],[-4,4],[8,-4],[16,6],[-10,10]]){
      box(cx+dx,cz+dz,10,5,8,cream);
      box(cx+dx,cz+dz,11,2,9,dark,5);
    }
    registerLandmarkHit(cx,6,cz,36,18,32,
      {n:'Rainey Street',d:'Bungalow bars · east of Congress'},
      {n:'Rainey Street',x:cx,z:cz,addr:'Rainey St · Downtown Austin'});
  })();

  /* ---- Lady Bird shore pavilion (Zilker bank — not mid-lake) ---- */
  (function(){
    const p=geoToWorld(30.2648,-97.7725);const cx=p.x,cz=p.z;
    clear(cx,cz,22);
    box(cx,cz,16,4,10,cream);
    const dock=new THREE.Mesh(new THREE.PlaneGeometry(20,6),conc);
    dock.rotation.x=-Math.PI/2;dock.position.set(cx,0.15,cz+8);gDetail.add(dock);
    registerLandmarkHit(cx,5,cz,28,14,28,
      {n:'Lady Bird Lake',d:'Colorado River reservoir · boardwalk & trails'},
      {n:'Lady Bird Lake',x:cx,z:cz,addr:'Lady Bird Lake · Zilker shore'});
  })();

  console.log('%cAustin attractions: one landmark building per site','color:#7fd6a0');
})();
/* ---------------- Pack-city attractions (non-Austin) ---------------- */
if(HTS_HAS_PACK&&!HTS_IS_AUS)(function placePackAttractions(){
  const conc=new THREE.MeshLambertMaterial({color:0xb8b4ac});
  const steel=new THREE.MeshLambertMaterial({color:0x6a727a});
  const turf=new THREE.MeshLambertMaterial({color:0x2f7a38});
  const dark=new THREE.MeshLambertMaterial({color:0x3a4048});
  const copper=new THREE.MeshLambertMaterial({color:0x4a8a72});
  const stone=new THREE.MeshLambertMaterial({color:0xcfc8b8});
  const glass=new THREE.MeshLambertMaterial({color:0x8ab0c8,transparent:true,opacity:0.78});
  const sand=new THREE.MeshLambertMaterial({color:0xb8a878});
  const neon=new THREE.MeshLambertMaterial({color:0xe8d8a8,emissive:0x665522,emissiveIntensity:0.35});
  function pad(x,z,w,d,mat,y){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat||new THREE.MeshLambertMaterial({color:0x5a6068}));
    m.rotation.x=-Math.PI/2;m.position.set(x,y==null?0.08:y,z);gDetail.add(m);return m;
  }
  function box(x,z,w,h,d,mat,y0){
    const m=new THREE.Mesh(towerGeo,mat);
    m.scale.set(w,h,d);m.position.set(x,y0||0,z);m.frustumCulled=false;gDetail.add(m);return m;
  }
  function cyl(x,y,z,rTop,rBot,h,mat,seg){
    const m=new THREE.Mesh(new THREE.CylinderGeometry(rTop,rBot,h,seg||10),mat);
    m.position.set(x,y,z);m.frustumCulled=false;gDetail.add(m);return m;
  }
  function clear(x,z,r){EXCLUDES.push({x,z,r});HTS_AUS_LANDMARK_SKIP.push({x,z,r});}
  function mark(A,cx,cy,cz,sx,sy,sz,d){
    registerLandmarkHit(cx,cy,cz,sx,sy,sz,{n:A.n,d:d||A.n},{n:A.n,x:cx,z:cz,addr:A.n});
    const sp=textSprite(A.n.length>18?A.n.slice(0,16)+'…':A.n,0.38);
    sp.position.set(cx,Math.max(sy*0.55,42)+8,cz);gDetail.add(sp);
  }
  for(const A of (HTS_PACK.attractions||[])){
    const cx=A.x,cz=A.z;
    const kind=(A.kind||'museum').toLowerCase();
    clear(cx,cz,kind==='park'?90:60);
    if(kind==='stadium'){
      pad(cx,cz,70,58);box(cx,cz,52,8,42,conc);box(cx,cz,48,14,38,steel,6);
      const field=new THREE.Mesh(new THREE.PlaneGeometry(36,24),turf);
      field.rotation.x=-Math.PI/2;field.position.set(cx,20.2,cz);gDetail.add(field);
      mark(A,cx,16,cz,60,40,50,A.n+' · stadium');
    }else if(kind==='arena'){
      pad(cx,cz,62,52);box(cx,cz,48,10,40,conc);
      const bowl=new THREE.Mesh(new THREE.CylinderGeometry(20,24,18,16),glass);
      bowl.position.set(cx,19,cz);bowl.frustumCulled=false;gDetail.add(bowl);
      mark(A,cx,16,cz,55,40,48,A.n+' · arena');
    }else if(kind==='school'){
      pad(cx,cz,80,70);box(cx,cz,55,22,40,conc);box(cx+28,cz,18,36,18,steel);
      mark(A,cx,20,cz,70,50,60,A.n);
    }else if(kind==='tower'){
      /* Observation / needle towers (Reunion, Tower of the Americas) */
      pad(cx,cz,54,54);
      cyl(cx,8,cz,16,18,16,stone,12);
      cyl(cx,55,cz,5,7,78,steel,10);
      cyl(cx,98,cz,14,14,10,glass,14);
      cyl(cx,118,cz,2.2,3.5,28,steel,8);
      mark(A,cx,70,cz,40,140,40,A.n+' · observation tower');
    }else if(kind==='statue'||kind==='monument'){
      /* Pedestal + figure — Liberty / monument silhouette (exaggerated for map read) */
      const island=new THREE.Mesh(new THREE.CylinderGeometry(38,42,4,20),sand);
      island.position.set(cx,2.2,cz);island.frustumCulled=false;gDetail.add(island);
      pad(cx,cz,70,70,turf,4.4);
      box(cx,cz,22,18,22,stone,4);
      cyl(cx,28,cz,10,12,12,stone,8);
      const body=new THREE.Mesh(new THREE.CapsuleGeometry(6,28,4,8),copper);
      body.position.set(cx,52,cz);body.frustumCulled=false;gDetail.add(body);
      const arm=new THREE.Mesh(new THREE.CapsuleGeometry(2.2,16,3,6),copper);
      arm.position.set(cx+8,68,cz);arm.rotation.z=-0.7;arm.frustumCulled=false;gDetail.add(arm);
      const torch=new THREE.Mesh(new THREE.SphereGeometry(3.2,8,8),neon);
      torch.position.set(cx+14,78,cz);torch.frustumCulled=false;gDetail.add(torch);
      mark(A,cx,48,cz,50,110,50,A.n);
    }else if(kind==='park'){
      pad(cx,cz,110,90,turf,0.12);
      for(let i=0;i<7;i++){
        const a=i/7*TAU,rr=18+10*(i%3);
        cyl(cx+Math.cos(a)*rr,10,cz+Math.sin(a)*rr,0.8,1.2,20,new THREE.MeshLambertMaterial({color:0x6a5038}),6);
        const canopy=new THREE.Mesh(new THREE.SphereGeometry(7,8,6),new THREE.MeshLambertMaterial({color:0x2f7a38}));
        canopy.position.set(cx+Math.cos(a)*rr,22,cz+Math.sin(a)*rr);gDetail.add(canopy);
      }
      mark(A,cx,12,cz,90,30,80,A.n+' · park');
    }else if(kind==='sign'){
      /* Hillside letter bank (Hollywood Sign style) */
      pad(cx,cz,90,28,new THREE.MeshLambertMaterial({color:0x6a7058}),0.15);
      const letters=(A.letters||'HOLLYWOOD').slice(0,10);
      const start=-(letters.length-1)*5.5;
      for(let i=0;i<letters.length;i++){
        box(cx+start+i*11,cz,7,16,2.4,new THREE.MeshLambertMaterial({color:0xf2f0ea}),2);
      }
      mark(A,cx,18,cz,100,40,40,A.n);
    }else if(kind==='themepark'||kind==='castle'){
      pad(cx,cz,90,80,new THREE.MeshLambertMaterial({color:0x6a9070}),0.1);
      box(cx,cz,36,20,28,stone);
      box(cx-14,cz,10,34,10,stone);box(cx+14,cz,10,34,10,stone);
      cyl(cx,48,cz,4,8,20,neon,8);
      mark(A,cx,28,cz,80,60,70,A.n);
    }else if(kind==='bridge'){
      pad(cx,cz,120,28,steel,0.2);
      box(cx,cz,100,3,14,dark,6);
      for(const dx of [-36,36]){box(cx+dx,cz,4,42,4,steel,0);box(cx+dx,cz,28,2,2,steel,40);}
      mark(A,cx,24,cz,110,50,40,A.n+' · bridge');
    }else if(kind==='mission'||kind==='alamo'){
      pad(cx,cz,56,48,sand,0.1);
      box(cx,cz,40,16,28,stone);
      box(cx,cz-6,18,22,8,stone,14);
      mark(A,cx,14,cz,50,40,40,A.n);
    }else{
      /* museum / landmark / default — readable civic block */
      pad(cx,cz,56,46);
      box(cx,cz,40,20,32,conc);
      box(cx,cz,28,8,24,glass,18);
      mark(A,cx,16,cz,52,40,44,A.n);
    }
  }
  console.log('%c'+CITY_NAME+' attractions: '+(HTS_PACK.attractions||[]).length+' physical landmarks','color:#7fd6a0');
})();
/* ---------------- points of interest ---------------- */
function poiBadge(kind){
  const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  const COLS={food:'#e0563a',fuel:'#e8a13a',ev:'#38b26a',park:'#3f9a4d',fun:'#b06cf0',sight:'#3f8fd6',shop:'#e06ca8',school:'#e8d24a',transit:'#4ac8e8',health:'#f0625a',worship:'#d98fc4'};
  x.beginPath();x.arc(32,34,24,0,TAU);x.fillStyle='rgba(10,13,18,.92)';x.fill();
  x.lineWidth=4;x.strokeStyle=COLS[kind]||'#888';x.stroke();
  x.strokeStyle='#fff';x.fillStyle='#fff';x.lineWidth=4;x.lineCap='round';
  if(kind==='food'){x.beginPath();x.moveTo(24,22);x.lineTo(24,46);x.moveTo(20,22);x.lineTo(20,30);x.moveTo(28,22);x.lineTo(28,30);
    x.moveTo(40,22);x.lineTo(40,46);x.stroke();x.beginPath();x.arc(40,26,5,Math.PI*0.9,Math.PI*2.1);x.stroke();}
  else if(kind==='fuel'){x.strokeRect(22,22,14,22);x.beginPath();x.moveTo(38,28);x.lineTo(44,32);x.lineTo(44,42);x.stroke();}
  else if(kind==='ev'){x.beginPath();x.moveTo(36,18);x.lineTo(24,36);x.lineTo(32,36);x.lineTo(28,50);x.lineTo(42,30);x.lineTo(33,30);x.closePath();x.fill();}
  else if(kind==='park'){x.beginPath();x.moveTo(32,18);x.lineTo(42,36);x.lineTo(22,36);x.closePath();x.fill();x.fillRect(30,36,4,10);}
  else if(kind==='fun'){x.beginPath();x.arc(32,32,12,0,TAU);x.stroke();for(let a=0;a<6;a++){x.beginPath();x.moveTo(32,32);
    x.lineTo(32+Math.cos(a/6*TAU)*12,32+Math.sin(a/6*TAU)*12);x.stroke();}}
  else if(kind==='shop'){x.strokeRect(22,26,20,18);x.beginPath();x.arc(32,26,6,Math.PI,0);x.stroke();}
  else if(kind==='school'){x.beginPath();x.moveTo(32,20);x.lineTo(46,27);x.lineTo(32,34);x.lineTo(18,27);x.closePath();x.fill();x.fillRect(41,27,3,10);}
  else if(kind==='transit'){x.strokeRect(23,20,18,20);x.fillRect(26,24,12,7);x.beginPath();x.arc(27,43,2.4,0,TAU);x.fill();x.beginPath();x.arc(37,43,2.4,0,TAU);x.fill();}
  else if(kind==='health'){x.fillRect(29,20,6,24);x.fillRect(20,29,24,6);}
  else if(kind==='worship'){x.beginPath();x.arc(32,28,10,Math.PI,0);x.stroke();
    x.strokeRect(22,28,20,16);x.fillRect(29,34,6,10);}
  else{x.beginPath();for(let a=0;a<5;a++){const A=-Math.PI/2+a/5*TAU;const B=A+TAU/10;
    x.lineTo(32+Math.cos(A)*13,33+Math.sin(A)*13);x.lineTo(32+Math.cos(B)*6,33+Math.sin(B)*6);}x.closePath();x.fill();}
  return new THREE.CanvasTexture(c);
}
function poiAt(n,k,lat,lng,addr,note){
  const w=geoToWorld(lat,lng);
  return {n,k,x:w.x,z:w.z,addr:addr+(note?' — '+note:'')};
}
/* Short history blurbs + Wikipedia titles for hover / click cards */
const PLACE_HISTORY={
  'George Bush Intercontinental':{wiki:'George_Bush_Intercontinental_Airport',blurb:'Opened 1969 as Houston Intercontinental; renamed for President George H. W. Bush in 1997. United’s largest hub and Houston’s main international gateway.'},
  'IAH':{wiki:'George_Bush_Intercontinental_Airport',blurb:'Opened 1969 as Houston Intercontinental; renamed for President George H. W. Bush in 1997. United’s largest hub and Houston’s main international gateway.'},
  'William P. Hobby':{wiki:'William_P._Hobby_Airport',blurb:'Houston’s original commercial airport (1937). Named for former Texas governor William P. Hobby; today a Southwest Airlines focus city closer to downtown than IAH.'},
  'HOU':{wiki:'William_P._Hobby_Airport',blurb:'Houston’s original commercial airport (1937). Named for former Texas governor William P. Hobby; today a Southwest Airlines focus city closer to downtown than IAH.'},
  'Ellington Airport':{wiki:'Ellington_Airport_(Texas)',blurb:'Former Ellington Field (1917). Joint civil-military field hosting NASA aircraft, the Texas Air National Guard, and the Lone Star Flight Museum.'},
  'EFD':{wiki:'Ellington_Airport_(Texas)',blurb:'Former Ellington Field (1917). Joint civil-military field hosting NASA aircraft, the Texas Air National Guard, and the Lone Star Flight Museum.'},
  'Sugar Land Regional':{wiki:'Sugar_Land_Regional_Airport',blurb:'Fort Bend County’s general-aviation airport; serves corporate and private jets for the Sugar Land / Energy Corridor area.'},
  'SGR':{wiki:'Sugar_Land_Regional_Airport',blurb:'Fort Bend County’s general-aviation airport; serves corporate and private jets for the Sugar Land / Energy Corridor area.'},
  'David Wayne Hooks Memorial':{wiki:'David_Wayne_Hooks_Memorial_Airport',blurb:'Busy northwest GA field near Spring/Tomball; a major flight-training and private-aviation hub for Greater Houston.'},
  'DWH':{wiki:'David_Wayne_Hooks_Memorial_Airport',blurb:'Busy northwest GA field near Spring/Tomball; a major flight-training and private-aviation hub for Greater Houston.'},
  'West Houston Airport':{wiki:'West_Houston_Airport',blurb:'General-aviation airport near the Energy Corridor / Katy Freeway; popular with corporate traffic west of downtown.'},
  'IWS':{wiki:'West_Houston_Airport',blurb:'General-aviation airport near the Energy Corridor / Katy Freeway; popular with corporate traffic west of downtown.'},
  'Conroe-North Houston Regional':{wiki:'Conroe-North_Houston_Regional_Airport',blurb:'Montgomery County regional airport serving Conroe and The Woodlands with GA and corporate flights.'},
  'CXO':{wiki:'Conroe-North_Houston_Regional_Airport',blurb:'Montgomery County regional airport serving Conroe and The Woodlands with GA and corporate flights.'},
  'JPMorgan Chase Tower':{wiki:'JPMorgan_Chase_Tower_(Houston)',blurb:'Completed 1982 as Texas Commerce Tower. At 1,002 ft it is Houston’s tallest building and was the tallest in Texas until 2019.'},
  'Wells Fargo Plaza':{wiki:'Wells_Fargo_Plaza_(Houston)',blurb:'All-glass twin quarter-cylinders finished in 1983 (originally Allied Bank Plaza). At 992 ft it is Houston’s second-tallest skyscraper.'},
  'Williams Tower':{wiki:'Williams_Tower',blurb:'Philip Johnson’s 1983 Post Oak tower (originally Transco Tower). At 901 ft it remains the tallest U.S. skyscraper outside a traditional downtown.'},
  'Heritage Plaza':{wiki:'Heritage_Plaza',blurb:'1987 granite tower with a distinctive Mayan-inspired stepped crown overlooking Buffalo Bayou west of downtown.'},
  'TC Energy Center':{wiki:'TC_Energy_Center',blurb:'Philip Johnson’s 1983 Dutch-gabled tower (long known as RepublicBank Center / Bank of America Center neighbor). A downtown skyline icon.'},
  '609 Main at Texas':{wiki:'609_Main_at_Texas',blurb:'2017 glass tower by Pickard Chilton with a dramatic diagonal crown; one of downtown’s newest supertalls.'},
  'Texas Tower':{wiki:'Texas_Tower_(Houston)',blurb:'2021 Hines headquarters on the former Houston Chronicle site; a modern addition to the downtown skyline.'},
  'One Shell Plaza':{wiki:'One_Shell_Plaza',blurb:'1971 concrete skyscraper that was once the world’s tallest concrete building; longtime Shell Oil presence downtown.'},
  'Bank of America Center':{wiki:'Bank_of_America_Center_(Houston)',blurb:'1983 Philip Johnson tower with a stepped Art Deco crown; a defining silhouette of the Houston skyline.'},
  'Minute Maid Park':{wiki:'Daikin_Park',blurb:'Opened 2000 as Enron Field; home of the Houston Astros with a retractable roof and downtown train motif.'},
  'Daikin Park':{wiki:'Daikin_Park',blurb:'Opened 2000 as Enron Field (later Minute Maid Park). Home of the Houston Astros with a retractable roof beside downtown.'},
  'My place':{wiki:'',blurb:'This is your live GPS spot on the Houston map — the little house marks where you are. Use the blue pin or Go to my location to fly home.'},
  'Toyota Center':{wiki:'Toyota_Center',blurb:'Opened 2003 as home of the Houston Rockets and a major downtown concert arena.'},
  'NRG Stadium':{wiki:'NRG_Stadium',blurb:'Opened 2002 as Reliant Stadium. Home of the Houston Texans and Houston Livestock Show and Rodeo; first NFL retractable-roof stadium.'},
  'Lakewood Church':{wiki:'Lakewood_Church',blurb:'America’s largest megachurch, led by Joel Osteen. Occupies the former Compaq Center / Summit arena since 2005.'},
  'Co-Cathedral of the Sacred Heart':{wiki:'Co-Cathedral_of_the_Sacred_Heart_(Houston)',blurb:'Catholic co-cathedral dedicated in 2008; a major downtown worship landmark for the Archdiocese of Galveston–Houston.'},
  'The Galleria':{wiki:'The_Galleria',blurb:'Opened 1970 by Gerald Hines. One of America’s largest malls, famous for its ice rink under a glass vault on Post Oak.'},
  'Rice University':{wiki:'Rice_University',blurb:'Founded 1912 by William Marsh Rice. Private research university in a tree-lined campus beside the Museum District.'},
  'University of Houston':{wiki:'University_of_Houston',blurb:'Founded 1927; Texas’s third-largest university. Known for energy, engineering, and Tier One research.'},
  'Texas Southern University':{wiki:'Texas_Southern_University',blurb:'Historically Black university founded 1947; a cornerstone of Houston’s Third Ward and legal education (Thurgood Marshall School of Law).'},
  'MD Anderson Cancer Center':{wiki:'MD_Anderson_Cancer_Center',blurb:'Founded 1941 within the Texas Medical Center. Consistently ranked among the world’s top cancer hospitals.'},
  'Houston Methodist Hospital':{wiki:'Houston_Methodist_Hospital',blurb:'Flagship of Houston Methodist in the Texas Medical Center; major teaching and research hospital since 1919.'},
  'Space Center Houston':{wiki:'Space_Center_Houston',blurb:'Official visitor center of NASA’s Johnson Space Center. Tram tours, historic spacecraft, and Mission Control exhibits.'},
  'NASA Johnson Space Center':{wiki:'Johnson_Space_Center',blurb:'Established 1961 (Manned Spacecraft Center). Home of Mission Control and astronaut training — the heart of U.S. human spaceflight.'},
  'San Jacinto Monument':{wiki:'San_Jacinto_Monument',blurb:'567-ft limestone obelisk (1939) marking the 1836 Battle of San Jacinto that won Texas independence from Mexico.'},
  'Houston Zoo':{wiki:'Houston_Zoo',blurb:'Opened 1922 in Hermann Park. One of America’s most-visited zoos, with more than 6,000 animals.'},
  'Museum of Fine Arts':{wiki:'Museum_of_Fine_Arts,_Houston',blurb:'Founded 1900; the MFAH is the largest art museum in the Southwest, spanning multiple buildings in the Museum District.'},
  'Houston Museum of Natural Science':{wiki:'Houston_Museum_of_Natural_Science',blurb:'Opened 1909 in Hermann Park. Famous for dinosaurs, the Cullen Hall of Gems, and the Burke Baker Planetarium.'},
  'The Menil Collection':{wiki:'Menil_Collection',blurb:'Opened 1987 in a Renzo Piano building. Free modern, surrealist, and antiquities collection founded by John and Dominique de Menil.'},
  'Rothko Chapel':{wiki:'Rothko_Chapel',blurb:'1971 nondenominational chapel with Mark Rothko’s dark canvases; a quiet landmark of Houston’s art and spiritual life.'},
  'Waterwall Park':{wiki:'Williams_Tower',blurb:'Gerald D. Hines Waterwall (1985) — an 64-ft semicircular fountain facing Williams Tower, a classic Houston photo spot.'},
  'POST Houston':{wiki:'POST_Houston',blurb:'Adaptive reuse of the 1930s Barbara Jordan Post Office. Food hall, shops, and a rooftop park opened in 2021.'},
  'Discovery Green':{wiki:'Discovery_Green',blurb:'12-acre downtown park opened 2008 beside the convention center; concerts, ice rink, and civic gatherings.'},
  'Hermann Park':{wiki:'Hermann_Park',blurb:'Gifted by George H. Hermann; dedicated 1914. 445 acres with the zoo, Miller Theatre, Japanese Garden, and reflecting pool.'},
  'Buffalo Bayou Park':{wiki:'Buffalo_Bayou_Park',blurb:'Linear park along Houston’s founding waterway; trails, art, and skyline views from Shepherd to downtown.'},
  'Memorial Park':{wiki:'Memorial_Park_(Houston)',blurb:'1,500-acre urban park dedicated after WWI. Running trails, golf, and the Houston Arboretum on the west side.'},
  'Allen’s Landing':{wiki:"Allen's_Landing",blurb:'Where the Allen brothers landed in 1836 to found Houston at the confluence of Buffalo and White Oak Bayous.'},
  'Houston City Hall':{wiki:'Houston_City_Hall',blurb:'1939 Art Deco city hall by Joseph Finger, with a reflecting pool and historic downtown civic axis.'},
  'Kemah Boardwalk':{wiki:'Kemah_Boardwalk',blurb:'Landry’s waterfront entertainment district on Galveston Bay — rides, restaurants, and Gulf Coast views.'},
  'Moody Gardens':{wiki:'Moody_Gardens',blurb:'Galveston attraction complex known for its Aquarium, Rainforest, and Palm Beach pyramids.'},
  'Q2 Stadium':{wiki:'Q2_Stadium',blurb:'Opened 2021 as home of Austin FC (MLS) in the North Burnet district near The Domain.'},
  'Moody Center':{wiki:'Moody_Center',blurb:'Opened 2022 on the UT Austin campus — basketball, concerts, and major events beside DKR Stadium.'},
  'DKR–Texas Memorial Stadium':{wiki:'Darrell_K_Royal–Texas_Memorial_Stadium',blurb:'Home of the Texas Longhorns. One of the largest stadiums in college football, on the UT campus.'},
  'DKR Stadium':{wiki:'Darrell_K_Royal–Texas_Memorial_Stadium',blurb:'Home of the Texas Longhorns. One of the largest stadiums in college football, on the UT campus.'},
  'ACL Live · Moody Theater':{wiki:'Moody_Theater',blurb:'Downtown Austin venue and home studio for Austin City Limits — live music on Willie Nelson Blvd.'},
  'ACL Live':{wiki:'Moody_Theater',blurb:'Downtown Austin venue and home studio for Austin City Limits — live music on Willie Nelson Blvd.'},
  'LBJ Presidential Library':{wiki:'Lyndon_Baines_Johnson_Library_and_Museum',blurb:'Presidential library of Lyndon B. Johnson on the UT Austin campus.'},
  'LBJ Library':{wiki:'Lyndon_Baines_Johnson_Library_and_Museum',blurb:'Presidential library of Lyndon B. Johnson on the UT Austin campus.'},
  'Bullock Texas History Museum':{wiki:'Bullock_Texas_State_History_Museum',blurb:'Texas history museum north of the Capitol with exhibits and an IMAX theater.'},
  'Bullock Museum':{wiki:'Bullock_Texas_State_History_Museum',blurb:'Texas history museum north of the Capitol with exhibits and an IMAX theater.'},
  'Barton Springs Pool':{wiki:'Barton_Springs',blurb:'Spring-fed pool in Zilker Park — a defining Austin swimming spot fed by the Edwards Aquifer.'},
  'Barton Springs':{wiki:'Barton_Springs',blurb:'Spring-fed pool in Zilker Park — a defining Austin swimming spot fed by the Edwards Aquifer.'},
  'Long Center':{wiki:'Long_Center_for_the_Performing_Arts',blurb:'Performing arts center on the south shore of Lady Bird Lake at Auditorium Shores.'},
  'The Domain':{wiki:'The_Domain_(Austin,_Texas)',blurb:'North Austin mixed-use district with shops, offices, and apartments near US-183.'},
  'Texas State Capitol':{wiki:'Texas_State_Capitol',blurb:'1888 pink-granite capitol. Capitol View Corridors protect the dome’s skyline presence.'},
  'UT Tower':{wiki:'Main_Building_(University_of_Texas_at_Austin)',blurb:'Main Building lantern of the University of Texas at Austin — the iconic UT Tower.'},
  'Zilker Park':{wiki:'Zilker_Park',blurb:'351-acre park west of downtown — Barton Springs, ACL Festival grounds, and Lady Bird Lake trails.'},
  'University of Texas at Austin':{wiki:'University_of_Texas_at_Austin',blurb:'Flagship UT campus north of the Capitol — Tower, DKR Stadium, Moody Center, and LBJ Library.'},
  'Lone Star Flight Museum':{wiki:'Lone_Star_Flight_Museum',blurb:'Aviation museum at Ellington Field with flying historic aircraft and Texas aviation heritage exhibits.'},
  'Shell Energy Stadium':{wiki:'Shell_Energy_Stadium',blurb:'Opened 2012 as BBVA Stadium. Home of Houston Dynamo FC and the Houston Dash in EaDo.'},
  'Downtown Aquarium':{wiki:'Downtown_Aquarium,_Houston',blurb:'Landry’s aquarium-restaurant complex with a Ferris wheel and shark tunnel near Buffalo Bayou.'},
  'George R. Brown Convention Ctr':{wiki:'George_R._Brown_Convention_Center',blurb:'Opened 1987; expanded for Super Bowl and major conventions along Avenida de las Americas.'},
  'Beer Can House':{wiki:'Beer_Can_House',blurb:'Folk-art house covered in over 50,000 beer cans by John Milkovisch; now a Houston landmark museum.'},
  'Downtown Tunnel System':{wiki:'Houston_tunnel_system',blurb:'More than six miles of air-conditioned pedestrian tunnels linking downtown offices, shops, and restaurants.'},
  'Amtrak Houston Station (HOS)':{wiki:'Houston_station_(Texas)',blurb:'Amtrak’s Houston stop for the Sunset Limited; the historic station sits near downtown on Washington Avenue.'},
  'Meow Wolf Houston — Radio Tave':{wiki:'Meow_Wolf',blurb:'Immersive art experience in Fifth Ward (Radio Tave), part of the Meow Wolf network of walk-through narrative worlds.'},
  'Holocaust Museum Houston':{wiki:'Holocaust_Museum_Houston',blurb:'Opened 1996 in the Museum District; education and remembrance focused on the Holocaust and human rights.'},
  'Bayou Bend Collection & Gardens':{wiki:'Bayou_Bend_Collection_and_Gardens',blurb:'Ima Hogg’s River Oaks estate; MFAH’s American decorative arts collection in historic gardens.'},
  'Buffalo Bayou Park Cistern':{wiki:'Buffalo_Bayou_Park',blurb:'1926 underground drinking-water reservoir reopened for tours — cathedral-like columns beneath the park.'},
  'Galveston Island Historic Pleasure Pier':{wiki:'Galveston_Island_Historic_Pleasure_Pier',blurb:'Gulf-front amusement pier on the Seawall; modern revival of Galveston’s historic pleasure-pier tradition.'},
  "The Original Ninfa's":{wiki:"Ninfa's",blurb:'Ninfa Laurenzo’s Navigation Blvd restaurant (1973) helped popularize fajitas and Tex-Mex beyond Houston.'},
  "Ninfa's on Navigation":{wiki:"Ninfa's",blurb:'Ninfa Laurenzo’s Navigation Blvd restaurant (1973) helped popularize fajitas and Tex-Mex beyond Houston.'},
  'Market Square Park':{wiki:'Market_Square_Park',blurb:'Historic downtown square near Houston’s 19th-century market district; revitalized as a civic park.'},
  'Sam Houston Park':{wiki:'Sam_Houston_Park',blurb:'Downtown historic park with relocated 19th-century houses telling early Houston stories.'},
  'Theater District — Wortham Center':{wiki:'Wortham_Theater_Center',blurb:'Opened 1987; home of Houston Grand Opera and Houston Ballet in the downtown Theater District.'},
  'Jones Hall':{wiki:'Jesse_H._Jones_Hall_for_the_Performing_Arts',blurb:'Opened 1966; home of the Houston Symphony in the Theater District.'},
  'Alley Theatre':{wiki:'Alley_Theatre',blurb:'Resident professional theatre founded 1947; its fortress-like downtown building opened in 1968.'},
  'Astrodome':{wiki:'Astrodome',blurb:'Opened 1965 as the world’s first domed stadium — the “Eighth Wonder of the World.” Now part of NRG Park beside NRG Stadium.'},
  'Pennzoil Place':{wiki:'Pennzoil_Place',blurb:'1975 Philip Johnson twin trapezoid towers. A postmodern downtown icon that redefined Houston’s skyline.'},
  'Independence Plaza (Shuttle replica)':{wiki:'Space_Center_Houston',blurb:'Full-scale Space Shuttle Independence atop a Boeing 747 Shuttle Carrier Aircraft at Space Center Houston.'},
  'Children\'s Museum Houston':{wiki:"Children's_Museum_of_Houston",blurb:'Top-ranked children’s museum in the Museum District with hands-on science and culture exhibits.'},
  'Contemporary Arts Museum Houston':{wiki:'Contemporary_Arts_Museum_Houston',blurb:'Free contemporary art museum on Montrose; rotating exhibitions since 1948.'},
  'The Health Museum':{wiki:'The_Health_Museum',blurb:'Museum District science center focused on the human body and health education.'},
  'Memorial City Mall':{wiki:'Memorial_City_Mall',blurb:'Major west Houston shopping center along I-10 in the Memorial City district.'},
  'Katy Mills':{wiki:'Katy_Mills',blurb:'Outlet mall in Katy opened 1999; a major retail destination west of Houston.'},
  'Islamic Society of Greater Houston':{wiki:'Islamic_Society_of_Greater_Houston',blurb:'Umbrella organization for Houston-area mosques and Islamic community centers.'},
  'Congregation Beth Israel':{wiki:'Congregation_Beth_Israel_(Houston)',blurb:'Houston’s oldest Reform Jewish congregation, founded in 1854.'},
  'Lamar High School':{wiki:'Lamar_High_School_(Houston)',blurb:'Historic Houston ISD high school (1936) on Westheimer; known for academics and athletics.'},
  'Bellaire High School':{wiki:'Bellaire_High_School_(Texas)',blurb:'Bellaire ISD flagship high school; magnet programs and strong academics.'},
  'Smart Financial Centre':{wiki:'Smart_Financial_Centre',blurb:'Sugar Land concert arena opened 2017; major live-music venue for Fort Bend County.'},
  'Art Car Museum':{wiki:'Art_Car_Museum',blurb:'Quirky Heights museum celebrating Houston’s art-car culture and visionary vehicles.'},
  'Orange Show Center for Visionary Art':{wiki:'Orange_Show',blurb:'Folk-art compound in the East End built by Jeff McKissack; home of Houston’s visionary-art scene.'},
  'Houston Botanic Garden':{wiki:'Houston_Botanic_Garden',blurb:'132-acre botanic garden opened 2020 on a former golf course in Glenbrook.'},
  'Armand Bayou Nature Center':{wiki:'Armand_Bayou_Nature_Center',blurb:'Urban wilderness preserve in Clear Lake — prairie, forest, and bayou habitats.'},
  'Mercer Botanic Gardens':{wiki:'Mercer_Botanic_Gardens',blurb:'Harris County botanic gardens in Humble with themed gardens and woodlands.'},
  'The Woodlands Waterway':{wiki:'The_Woodlands,_Texas',blurb:'Pedestrian canal lined with shops and dining at the heart of The Woodlands.'},
  'Houston Graffiti Park':{wiki:'',blurb:'Legal street-art walls in the East End where local artists paint rotating murals.'},
  'Sesquicentennial Park':{wiki:'Sesquicentennial_Park',blurb:'Theater District bayou park celebrating Houston’s 150th anniversary.'},
  'McGovern Centennial Gardens':{wiki:'Hermann_Park',blurb:'Hermann Park botanical gardens and mount opened for the park’s centennial.'},
  'Houston Arboretum & Nature Center':{wiki:'Houston_Arboretum_and_Nature_Center',blurb:'155-acre urban wilderness inside Memorial Park with trails and native habitats.'},
  'Levy Park':{wiki:'Levy_Park',blurb:'Greenway Plaza pocket park with a dog park, playground, and community events.'},
  'Typhoon Texas Waterpark':{wiki:'Typhoon_Texas',blurb:'Katy waterpark with 30+ slides and one of Texas’s longest lazy rivers.'},
  'Six Flags Hurricane Harbor Splashtown':{wiki:'Six_Flags_Hurricane_Harbor_Splashtown',blurb:'Houston’s largest water park on I-45 North in Spring.'},
  'Schlitterbahn Galveston':{wiki:'Schlitterbahn_Galveston',blurb:'Indoor/outdoor waterpark on Galveston Island featuring the MASSIV water coaster.'},
  'Great Wolf Lodge Webster':{wiki:'Great_Wolf_Lodge',blurb:'Indoor water-park resort near NASA / Clear Lake.'},
  'Pirates Bay Water Park':{wiki:'',blurb:'Baytown municipal water park on Main Street.'},
  'Big Rivers Waterpark':{wiki:'',blurb:'Water and adventure park in New Caney north of Houston.'},
  'Goode Co. Barbecue':{wiki:'',blurb:'Classic Houston barbecue institution on Kirby Drive.'},
  'Torchy\'s Tacos — Midtown':{wiki:"Torchy's_Tacos",blurb:'Houston-born taco chain that started as a food trailer and became a Texas favorite.'},
  'The Breakfast Klub':{wiki:'The_Breakfast_Klub',blurb:'Midtown soul-food breakfast landmark famous for wings & waffles and katfish & grits.'},
  'METRO Central Station':{wiki:'METRORail',blurb:'Downtown METRORail Red Line hub at Main & Capitol.'},
  'METRORail Main Street Square':{wiki:'METRORail',blurb:'Red Line platforms in the heart of downtown’s Main Street Square.'},
  'METRORail Theater District':{wiki:'METRORail',blurb:'Theater District light-rail stop serving Green and Purple lines.'},
  'Downtown Transit Center':{wiki:'Metropolitan_Transit_Authority_of_Harris_County',blurb:'Major METRO bus and rail transfer hub at 1900 Main Street.'},
  /* ---- lakes, reservoirs, bayous ---- */
  'Lake Houston':{wiki:'Lake_Houston',blurb:'Fun fact: Built in 1953 on the San Jacinto River, this 12,000-acre reservoir is Houston’s largest lake and a key drinking-water source — plus a hotspot for bass fishing and lakeside neighborhoods like Kingwood.'},
  'Clear Lake':{wiki:'Clear_Lake_(Galveston_Bay)',blurb:'Fun fact: Despite the name, Clear Lake is a tidal lagoon on Galveston Bay — home to NASA’s Johnson Space Center, one of Texas’s densest marina scenes, and the “Space City” waterfront towns of Seabrook, Kemah, and League City.'},
  'Sheldon Lake':{wiki:'Sheldon_Lake_State_Park',blurb:'Fun fact: Sheldon Lake State Park sits on a WWII-era reservoir east of Houston. Today it’s a birding and prairie-restoration gem with an observation tower overlooking wetlands.'},
  'Galveston Bay':{wiki:'Galveston_Bay',blurb:'Fun fact: Texas’s largest estuary — about 600 square miles — feeds the Port of Houston and supports oysters, shrimp, and some of the busiest ship traffic in the U.S.'},
  'Addicks Reservoir':{wiki:'Addicks_Reservoir',blurb:'Fun fact: A dry flood-control basin west of Houston. In Hurricane Harvey (2017) it filled to historic levels, protecting downtown while flooding nearby neighborhoods — a defining chapter in Houston flood history.'},
  'Barker Reservoir':{wiki:'Barker_Reservoir',blurb:'Fun fact: Twin to Addicks on Buffalo Bayou’s west fork. Built by the U.S. Army Corps of Engineers in the 1940s; together the reservoirs are Houston’s biggest flood sponges.'},
  'Buffalo Bayou':{wiki:'Buffalo_Bayou',blurb:'Fun fact: Houston was founded on this bayou in 1836. It still winds from the reservoirs through downtown to the Ship Channel — the city’s original “highway.”'},
  'Brays Bayou':{wiki:'Brays_Bayou',blurb:'Fun fact: A major southside bayou draining the Medical Center and Meyerland. Project Brays is one of Harris County’s largest flood-control rebuilds after repeated storms.'},
  'White Oak Bayou':{wiki:'White_Oak_Bayou',blurb:'Fun fact: Joins Buffalo Bayou at Allen’s Landing — the birthplace of Houston. The Heights and Near Northside grew along its banks.'},
  'San Jacinto River':{wiki:'San_Jacinto_River_(Texas)',blurb:'Fun fact: Flows into Galveston Bay past the San Jacinto Monument, where Texas won independence in 1836. Lake Houston sits on its West Fork.'},
  /* ---- suburbs & districts (fun facts) ---- */
  'Downtown':{wiki:'Downtown_Houston',blurb:'Fun fact: Houston’s 1.84-sq-mi core has ~150k jobs but only ~10–19k residents — and a 6+ mile air-conditioned tunnel system that rivals the sidewalks above.'},
  'Galleria · Uptown':{wiki:'Uptown_Houston',blurb:'Fun fact: Uptown’s Galleria (1970) put an ice rink under a glass vault. Williams Tower (901 ft) is still the tallest U.S. skyscraper outside a traditional downtown.'},
  'Galleria':{wiki:'Uptown_Houston',blurb:'Fun fact: Uptown’s Galleria (1970) put an ice rink under a glass vault. Williams Tower (901 ft) is still the tallest U.S. skyscraper outside a traditional downtown.'},
  'Uptown':{wiki:'Uptown_Houston',blurb:'Fun fact: Post Oak’s Uptown district rivals downtown for skyline drama — and the Waterwall is one of Houston’s most photographed spots.'},
  'Texas Medical Center':{wiki:'Texas_Medical_Center',blurb:'Fun fact: The world’s largest medical complex — 50+ institutions on ~2.1 sq mi — treats millions of patients a year and anchors Houston’s southside economy.'},
  'Greenway Plaza':{wiki:'Greenway_Plaza',blurb:'Fun fact: A master-planned office city-within-a-city from the 1970s between Downtown and the Galleria, with skyways and Levy Park as its living room.'},
  'Montrose':{wiki:'Montrose,_Houston',blurb:'Fun fact: Houston’s bohemian heart — museums, LGBTQ+ history, bungalows, and some of the city’s best restaurants packed into walkable streets.'},
  'The Heights':{wiki:'Houston_Heights',blurb:'Fun fact: Founded 1891 as a streetcar suburb with its own mayor. Today it’s known for 19th Street shops, historic bungalows, and the Heights Hike-and-Bike Trail.'},
  'River Oaks':{wiki:'River_Oaks,_Houston',blurb:'Fun fact: Planned in the 1920s as Houston’s premier garden suburb. Home to River Oaks Country Club and some of Texas’s most expensive estates.'},
  'Bellaire':{wiki:'Bellaire,_Texas',blurb:'Fun fact: A city-within-Houston nicknamed the “City of Homes.” Independent schools and a strong civic identity despite being surrounded by Houston.'},
  'Energy Corridor':{wiki:'Energy_Corridor,_Houston',blurb:'Fun fact: West Houston’s oil-and-gas office belt along I-10 / Eldridge — one of the densest energy-industry job centers on Earth.'},
  'Spring Branch':{wiki:'Spring_Branch,_Houston',blurb:'Fun fact: Once dairy country northwest of downtown; now a diverse inner-loop district known for Spring Branch ISD and international restaurants.'},
  'Alief':{wiki:'Alief,_Houston',blurb:'Fun fact: One of Houston’s most internationally diverse areas — Vietnamese, Chinese, Indian, Nigerian, and Latino communities share strip-center Main Streets.'},
  'Katy':{wiki:'Katy,_Texas',blurb:'Fun fact: Exploded from rice fields into one of America’s fastest-growing suburbs. Katy ISD and Typhoon Texas put it on the map beyond the Katy Mills outlets.'},
  'Sugar Land':{wiki:'Sugar_Land,_Texas',blurb:'Fun fact: Named for Imperial Sugar’s refinery town. Now a Fort Bend powerhouse with Smart Financial Centre, Town Square, and a skyline of its own.'},
  'Missouri City':{wiki:'Missouri_City,_Texas',blurb:'Fun fact: Fort Bend suburb that grew around Quail Valley and Sienna. One of the Houston area’s largest majority-minority cities.'},
  'Stafford':{wiki:'Stafford,_Texas',blurb:'Fun fact: Tiny Fort Bend city famous for having no city property tax for decades — a retail and warehouse magnet between Houston and Sugar Land.'},
  'Richmond · Rosenberg':{wiki:'Richmond,_Texas',blurb:'Fun fact: Twin Fort Bend county seats on the Brazos. Richmond dates to the Republic of Texas; Rosenberg grew with the railroad and Imperial Sugar era.'},
  'Richmond':{wiki:'Richmond,_Texas',blurb:'Fun fact: Fort Bend County seat on the Brazos River — one of Texas’s oldest Anglo settlements west of Houston.'},
  'Rosenberg':{wiki:'Rosenberg,_Texas',blurb:'Fun fact: Railroad town that became a Fort Bend retail hub; pairs with neighboring Richmond as a historic Brazos River duo.'},
  'Cypress':{wiki:'Cypress,_Texas',blurb:'Fun fact: Northwest unincorporated boomtown along US 290. Master-planned communities and Cy-Fair ISD define modern Houston sprawl.'},
  'Tomball':{wiki:'Tomball,_Texas',blurb:'Fun fact: “Tomball” comes from railroad man Thomas Henry Ball. Historic downtown plus oil-patch roots northwest of Houston.'},
  'Jersey Village':{wiki:'Jersey_Village,_Texas',blurb:'Fun fact: Small planned city off US 290 known for its lake, golf course, and being a quiet pocket inside the Beltway chaos.'},
  'Greenspoint':{wiki:'Greenspoint,_Houston',blurb:'Fun fact: North Houston edge city at I-45 & Beltway 8 — once a major office/mall node, now reinventing around transit and new housing.'},
  'Spring':{wiki:'Spring,_Texas',blurb:'Fun fact: Home to Old Town Spring’s antique district and the ExxonMobil campus — a northside mix of small-town Main Street and corporate HQ.'},
  'The Woodlands':{wiki:'The_Woodlands,_Texas',blurb:'Fun fact: George Mitchell’s forested master-planned community (1974). Waterway cafés, pavilion concerts, and a skyline rising from the pines.'},
  'Conroe':{wiki:'Conroe,_Texas',blurb:'Fun fact: Montgomery County seat that boomed with oil in 1931. Today it’s the gateway to Lake Conroe and The Woodlands’ northern neighbor.'},
  'Humble · Kingwood':{wiki:'Kingwood,_Houston',blurb:'Fun fact: Kingwood is the “Livable Forest” on Lake Houston; Humble was an oil-boom town that gave Humble Oil (later Exxon) its name.'},
  'Humble':{wiki:'Humble,_Texas',blurb:'Fun fact: Oil-boom town that lent its name to Humble Oil — the company that became Exxon. Still the gateway to Kingwood and Lake Houston.'},
  'Kingwood':{wiki:'Kingwood,_Houston',blurb:'Fun fact: Nicknamed the “Livable Forest” — a huge master-planned community of pines and trails on the west shore of Lake Houston.'},
  'Atascocita':{wiki:'Atascocita,_Texas',blurb:'Fun fact: Northeast lakeside suburb whose name traces to Spanish colonial “Atascosito” roads. Golf, Lake Houston, and master-planned living.'},
  'Channelview':{wiki:'Channelview,_Texas',blurb:'Fun fact: Industrial community on the Houston Ship Channel — petrochemical plants, shipyards, and working-class Ship Channel culture.'},
  'Baytown':{wiki:'Baytown,_Texas',blurb:'Fun fact: Home to ExxonMobil’s massive Baytown Complex and the Fred Hartman Bridge. A Ship Channel city with its own skyline of flares and towers.'},
  'Pasadena':{wiki:'Pasadena,_Texas',blurb:'Fun fact: “Pasa-get-down-dena” — a big Ship Channel city famous for the Strawberry Festival, Gilley’s-era urban cowboy lore, and heavy industry.'},
  'Deer Park':{wiki:'Deer_Park,_Texas',blurb:'Fun fact: Ship Channel suburb next to the San Jacinto Monument. Refineries on one side, battleground history on the other.'},
  'La Porte':{wiki:'La_Porte,_Texas',blurb:'Fun fact: Bay town at the mouth of the Ship Channel — San Jacinto Monument, Sylvan Beach, and container-ship views.'},
  'Clear Lake · Webster':{wiki:'Clear_Lake_City_(Greater_Houston)',blurb:'Fun fact: Clear Lake City was built for NASA families in the 1960s. Webster next door is the hotel-and-dining strip for Space Center visitors.'},
  'Clear Lake':{wiki:'Clear_Lake_City_(Greater_Houston)',blurb:'Fun fact: Born as a NASA bedroom community in the Space Race — still the heart of Houston’s aerospace and marina culture.'},
  'Webster':{wiki:'Webster,_Texas',blurb:'Fun fact: Small city beside NASA that became the hotel, restaurant, and Great Wolf Lodge gateway to Space Center Houston.'},
  'Friendswood':{wiki:'Friendswood,_Texas',blurb:'Fun fact: Founded by Quakers (“Friends”) in 1895. A quiet bay-area suburb that kept a small-town downtown feel.'},
  'League City':{wiki:'League_City,_Texas',blurb:'Fun fact: One of Texas’s fastest-growing cities — more populous than many assume — between Houston and Galveston on the Gulf Freeway.'},
  'Pearland':{wiki:'Pearland,_Texas',blurb:'Fun fact: Named for pear orchards. Now a major southside suburb with Town Center retail and some of the region’s fastest growth.'},
  'Midtown':{wiki:'Midtown,_Houston',blurb:'Fun fact: Between Downtown and the Med Center — townhomes, light rail, and a nightlife strip that reinvented a former low-rise corridor.'},
  'East End · EaDo':{wiki:'East_Downtown_Houston',blurb:'Fun fact: EaDo (East Downtown) flipped warehouses into breweries, murals, and stadium nights beside Daikin Park and the Toyota Center.'},
  'East End':{wiki:'East_End,_Houston',blurb:'Fun fact: Historic Second Ward / East End — Mexican-American roots, Navigation Blvd, and the art-car / folk-art corridor.'},
  'EaDo':{wiki:'East_Downtown_Houston',blurb:'Fun fact: East Downtown’s stadium district — Astros, Rockets, Dynamo — plus murals and warehouses turned nightlife.'},
  'Fifth Ward':{wiki:'Fifth_Ward,_Houston',blurb:'Fun fact: Historic African-American ward northeast of downtown — birthplace of legends and now home to Meow Wolf’s Radio Tave.'},
  'Memorial':{wiki:'Memorial,_Houston',blurb:'Fun fact: Westside villages along Buffalo Bayou and Memorial Park — energy execs, trails, and some of Houston’s leafiest streets.'},
  'West University':{wiki:'West_University_Place,_Texas',blurb:'Fun fact: “West U” is an independent city famous for strict deed restrictions, top schools, and being a tiny enclave inside Houston.'},
  'Meyerland':{wiki:'Meyerland,_Houston',blurb:'Fun fact: Mid-century Jewish suburb southwest of the Med Center; repeatedly tested by Brays Bayou floods and famous for its resilience.'},
  'Westchase':{wiki:'Westchase,_Houston',blurb:'Fun fact: Edge-city office district at Westheimer & Beltway 8 — a classic 1980s Houston “suburban downtown.”'},
  'Sharpstown':{wiki:'Sharpstown,_Houston',blurb:'Fun fact: Frank Sharp’s pioneering 1950s master-planned suburb — once home to Sharpstown Mall, among America’s early enclosed malls.'},
  'Gulfton':{wiki:'Gulfton,_Houston',blurb:'Fun fact: One of Houston’s densest, most immigrant-rich neighborhoods — sometimes called a “city within a city” of apartments and world cuisine.'},
  'Magnolia':{wiki:'Magnolia,_Texas',blurb:'Fun fact: Timber-and-rail town northwest of The Woodlands that’s become a fast-growing exurb with a historic downtown square.'},
  'Montgomery':{wiki:'Montgomery,_Texas',blurb:'Fun fact: One of Texas’s oldest towns (1837) and namesake of Montgomery County — a historic square near Lake Conroe.'},
  'Porter · New Caney':{wiki:'New_Caney,_Texas',blurb:'Fun fact: East Montgomery County towns on US 59 / I-69 — piney-woods growth, Valley Ranch, and Big Rivers Waterpark country.'},
  'Porter':{wiki:'Porter,_Texas',blurb:'Fun fact: Unincorporated east Montgomery community in the pine belt between Kingwood and New Caney.'},
  'New Caney':{wiki:'New_Caney,_Texas',blurb:'Fun fact: Named for the cane brakes along Caney Creek — now a booming northside suburb on the I-69 corridor.'},
  'Hockley':{wiki:'Hockley,_Texas',blurb:'Fun fact: Northwest Harris County community near US 290 — prairie, rail history, and the edge of Houston’s western sprawl.'},
  'Crosby':{wiki:'Crosby,_Texas',blurb:'Fun fact: Northeast Harris County town on US 90 — railroad roots and a gateway toward the Trinity River bottoms.'},
  'Texas City':{wiki:'Texas_City,_Texas',blurb:'Fun fact: Site of the 1947 Texas City Disaster, one of America’s worst industrial accidents. Today a major port and petrochemical city on Galveston Bay.'},
  'Galveston':{wiki:'Galveston,_Texas',blurb:'Fun fact: “The Wall Street of the South” before the 1900 hurricane — still Texas’s island playground with the Seawall, Strand, and Mardi Gras.'},
  'Manvel':{wiki:'Manvel,_Texas',blurb:'Fun fact: Brazoria County town south of Pearland that’s shifting from rice fields to master-planned suburbs along Texas 288.'},
  'Alvin':{wiki:'Alvin,_Texas',blurb:'Fun fact: Birthplace of Nolan Ryan. A Brazoria County city between Houston and the Gulf with deep baseball bragging rights.'},
  'Dickinson':{wiki:'Dickinson,_Texas',blurb:'Fun fact: Bay Area town on the Gulf Freeway — bayous, Cajun/Creole food culture, and a midpoint between Houston and Galveston.'},
  'Lake Jackson':{wiki:'Lake_Jackson,_Texas',blurb:'Fun fact: Built by Dow Chemical in the 1940s as a company town with curved streets named for trees — a planned Brazosport community.'},
  'Seabrook · Kemah':{wiki:'Kemah,_Texas',blurb:'Fun fact: Twin bay towns — Seabrook’s shrimp boats and Kemah’s Boardwalk face each other across Clear Creek on Galveston Bay.'},
  'Seabrook':{wiki:'Seabrook,_Texas',blurb:'Fun fact: Working waterfront city beside NASA — shrimp fleets, bay homes, and the gateway to Kemah Boardwalk.'},
  'Kemah':{wiki:'Kemah,_Texas',blurb:'Fun fact: Tiny bay town with an outsized Boardwalk — Landry’s rides, restaurants, and fireworks over Galveston Bay.'},
  'Fulshear':{wiki:'Fulshear,_Texas',blurb:'Fun fact: One of America’s fastest-growing cities in the 2020s — Fort Bend exurb west of Sugar Land that exploded from prairie to master-planned boomtown.'},
  'Galena Park':{wiki:'Galena_Park,_Texas',blurb:'Fun fact: Ship Channel industrial city where refineries, railyards, and working-class neighborhoods sit beside the Houston port complex.'},
  'South Houston':{wiki:'South_Houston,_Texas',blurb:'Fun fact: Independent city south of Pasadena — not part of Houston despite the name. Heavy industry and Hispanic cultural roots along Broadway.'},
  'Jacinto City':{wiki:'Jacinto_City,_Texas',blurb:'Fun fact: Tiny incorporated city east of downtown on the Ship Channel — one of Harris County’s smallest municipalities.'},
  'Angleton':{wiki:'Angleton,_Texas',blurb:'Fun fact: Brazoria County seat on the Gulf Prairie — courthouse square, cattle heritage, and gateway to Freeport and Lake Jackson.'},
  'La Marque':{wiki:'La_Marque,_Texas',blurb:'Fun fact: Mainland city between Texas City and Galveston on I-45 — retail corridor and hurricane evacuation route hub.'},
  'Santa Fe':{wiki:'Santa_Fe,_Texas',blurb:'Fun fact: Galveston County city named for the railroad, not the New Mexico capital — suburban growth between Hitchcock and Texas City.'},
  'Hitchcock':{wiki:'Hitchcock,_Texas',blurb:'Fun fact: Bay-side city on Galveston Bay with shrimping roots and a growing mainland community between La Marque and Texas City.'},
  'Freeport':{wiki:'Freeport,_Texas',blurb:'Fun fact: Deepwater port city home to Dow Chemical and some of Texas’s largest petrochemical complexes on the Gulf.'},
  'Dayton':{wiki:'Dayton,_Texas',blurb:'Fun fact: Liberty County seat on the Trinity River — historic courthouse town and gateway to the piney woods northeast of Houston.'},
  'Liberty':{wiki:'Liberty,_Texas',blurb:'Fun fact: One of Texas’s oldest towns (1831) and Liberty County seat — Trinity River port history and a classic courthouse square.'},
  'Cleveland':{wiki:'Cleveland,_Texas',blurb:'Fun fact: San Jacinto County seat on US 59 — timber, rail, and a gateway between Houston and the East Texas pine belt.'},
  'Brookshire':{wiki:'Brookshire,_Texas',blurb:'Fun fact: Waller County railroad town on I-10 west of Katy — prairie, warehouses, and the edge of Houston’s western sprawl.'},
  'Waller':{wiki:'Waller,_Texas',blurb:'Fun fact: Waller County seat northwest of Houston — cotton, rail, and prairie farmland now absorbing Katy-style growth.'},
  'Splendora':{wiki:'Splendora,_Texas',blurb:'Fun fact: Montgomery County town on US 59 — “Gateway to the Piney Woods” between Kingwood and Cleveland.'},
  'Rosharon':{wiki:'Rosharon,_Texas',blurb:'Fun fact: Unincorporated Brazoria County community south of Pearland — prairie, prisons, and fast-growing master-planned suburbs.'},
  'Anahuac':{wiki:'Anahuac,_Texas',blurb:'Fun fact: Chambers County seat on Trinity Bay — “Alligator Capital of Texas” and oyster-country gateway to the upper coast.'},
  'Huntsville':{wiki:'Huntsville,_Texas',blurb:'Fun fact: Walker County seat and home of Sam Houston State University — Sam Houston’s grave and the Texas prison system headquarters.'},
  'Sealy':{wiki:'Sealy,_Texas',blurb:'Fun fact: Austin County railroad town west of Houston — birthplace of the Sealy mattress company and a classic Czech-German prairie community.'},
  'Hempstead':{wiki:'Hempstead,_Texas',blurb:'Fun fact: Waller County crossroads on US 290 — “Watermelon Capital of Texas” and a historic prairie trading town.'},
  'Brenham':{wiki:'Brenham,_Texas',blurb:'Fun fact: Washington County seat famous for Blue Bell ice cream, wildflowers, and a preserved downtown square in the Brazos Valley.'},
  'Lake Conroe':{wiki:'Lake_Conroe',blurb:'Fun fact: 21,000-acre reservoir on the West Fork of the San Jacinto — boating, lake houses, and Conroe’s weekend playground.'},
  'Trinity Bay':{wiki:'Trinity_Bay_(Texas)',blurb:'Fun fact: Upper Galveston Bay inlet fed by the Trinity River — oyster reefs, refineries, and the Anahuac National Wildlife Refuge.'},
};
function wikiUrl(title){
  if(!title)return null;
  if(/^https?:\/\//i.test(title))return title;
  return 'https://en.wikipedia.org/wiki/'+encodeURIComponent(String(title).replace(/ /g,'_'));
}
function placeHistoryFor(name){
  if(!name)return null;
  const raw=String(name).trim();
  if(PLACE_HISTORY[raw])return PLACE_HISTORY[raw];
  const code=raw.split('·')[0].trim();
  if(PLACE_HISTORY[code])return PLACE_HISTORY[code];
  const after=raw.includes('·')?raw.split('·').slice(1).join('·').trim():'';
  if(after&&PLACE_HISTORY[after])return PLACE_HISTORY[after];
  for(const k of Object.keys(PLACE_HISTORY)){
    if(raw===k||raw.includes(k)||k.includes(raw))return PLACE_HISTORY[k];
  }
  return null;
}
function historyTipHtml(name){
  const h=placeHistoryFor(name);
  if(!h)return '';
  const url=h.wiki?wikiUrl(h.wiki):null;
  return '<div class="th">'+h.blurb+'</div>'
    +(url?'<a class="tw" href="'+url+'" target="_blank" rel="noopener noreferrer">Wikipedia ↗</a>':'');
}
function applyPlaceHistoryToCard(name){
  const histEl=document.getElementById('pcHist');
  const wikiBtn=document.getElementById('pcWiki');
  const h=placeHistoryFor(name);
  if(h&&histEl){
    histEl.textContent=h.blurb;
    histEl.style.display='block';
  }else if(histEl){
    histEl.textContent='';histEl.style.display='none';
  }
  if(wikiBtn){
    if(h&&h.wiki){
      wikiBtn.style.display='';
      wikiBtn.onclick=()=>window.open(wikiUrl(h.wiki),'_blank','noopener,noreferrer');
    }else{
      wikiBtn.style.display='none';wikiBtn.onclick=null;
    }
  }
}
const POIS=[
 /* worship / schools / transit (kept + expanded) */
 {n:'Lakewood Church',k:'worship',x:-545,z:455,addr:'3700 Southwest Fwy — 16,000-seat megachurch'},
 {n:'Co-Cathedral of the Sacred Heart',k:'worship',x:55,z:240,addr:'1111 St Joseph Pkwy'},
 {n:'Islamic Society of Greater Houston',k:'worship',x:-682,z:401,addr:'3110 Eastside St — ISGH main center'},
 {n:'Congregation Beth Israel',k:'worship',x:-914,z:1129,addr:'5600 N Braeswood Blvd'},
 {n:'Lamar High School',k:'school',x:-842,z:327,addr:'3325 Westheimer Rd · est. 1936'},
 {n:'Bellaire High School',k:'school',x:-1102,z:892,addr:'5100 Maple St — magnet languages'},
 {n:'The Galleria',k:'shop',x:-980,z:205,addr:'5085 Westheimer Rd — 400 stores, ice rink'},
 {n:'Memorial City Mall',k:'shop',x:-1560,z:-260,addr:'303 Memorial City Way'},
 {n:'Katy Mills',k:'shop',x:-3870,z:-260,addr:'5000 Katy Mills Cir'},
 {n:'METRO Central Station',k:'transit',x:95,z:75,addr:'Main St @ Capitol — Red Line light rail'},
 {n:'METRORail Main Street Square',k:'transit',x:126.2,z:103.5,addr:'Main St · Downtown — Red Line platforms'},
 {n:'METRORail Theater District',k:'transit',x:96.6,z:52.5,addr:'Capitol & Rusk near Smith — Green/Purple lines'},
 {n:'Downtown Transit Center',k:'transit',x:58.5,z:202.2,addr:'1900 Main St — bus bays + METRORail Red Line'},
 {n:'Amtrak Houston Station (HOS)',k:'transit',x:88.4,z:-39.5,addr:'902 Washington Ave — Sunset Limited'},
 {n:'Rice University',k:'school',x:-342,z:683,addr:'6100 Main St · est. 1912'},
 {n:'University of Houston',k:'school',x:405,z:645,addr:'4800 Calhoun Rd · 46,000 students'},
 {n:'Texas Southern University',k:'school',x:145,z:597,addr:'3100 Cleburne St'},
 {n:'MD Anderson Cancer Center',k:'health',x:-282,z:830,addr:'1515 Holcombe Blvd — #1 cancer hospital'},
 {n:'Houston Methodist Hospital',k:'health',x:-305,z:790,addr:'6565 Fannin St'},
 {n:'Downtown Aquarium',k:'fun',x:89,z:8,addr:'410 Bagby St — ferris wheel & shark tunnel'},
 {n:'George R. Brown Convention Ctr',k:'sight',x:215,z:45,addr:'1001 Avenida de las Americas'},
 {n:'The Breakfast Klub',k:'food',x:40,z:290,addr:'3711 Travis St, Midtown'},
 {n:"The Original Ninfa's",k:'food',x:430,z:75,addr:'2704 Navigation Blvd'},
 {n:"Pappadeaux Seafood",k:'food',x:-1160,z:415,addr:'6015 Westheimer Rd'},
 {n:"Killen's Barbecue",k:'food',x:520,z:3340,addr:'3613 E Broadway St, Pearland'},
 {n:"Buc-ee's Baytown",k:'fuel',x:3430,z:-240,addr:'4080 East Fwy, Baytown'},
 {n:'Shell — Energy Corridor',k:'fuel',x:-1830,z:-230,addr:'14555 Katy Fwy'},
 {n:'Tesla Supercharger — Katy Mills',k:'ev',x:-3860,z:-300,addr:'5000 Katy Mills Cir'},
 {n:'Tesla Supercharger — Galleria',k:'ev',x:-1005,z:245,addr:'5085 Westheimer Rd'},
 {n:'EVgo — Downtown',k:'ev',x:105,z:115,addr:'1200 McKinney St garage'},
 {n:'Houston Zoo',k:'fun',x:-200,z:828,addr:'6200 Hermann Park Dr'},
 {n:'Museum of Fine Arts',k:'sight',x:-200,z:565,addr:'1001 Bissonnet St'},
 {n:'Waterwall Park',k:'sight',x:-1000,z:262,addr:'2800 Post Oak Blvd · Gerald D. Hines Waterwall'},
 {n:'Market Square Park',k:'park',x:80,z:40,addr:'301 Milam St · historic downtown square'},
 {n:'POST Houston',k:'sight',x:-30,z:-20,addr:'401 Franklin St · food hall + rooftop park'},
 {n:'San Jacinto Monument',k:'sight',x:3180,z:1180,addr:'1 Monument Cir, La Porte · 567 ft obelisk'},
 {n:'Discovery Green',k:'park',x:165,z:28,addr:'1500 McKinney St'},
 {n:'Hermann Park',k:'park',x:-230,z:805,addr:'6001 Fannin St · 445 acres'},
 {n:'Buffalo Bayou Park',k:'park',x:-350,z:-72,addr:'1800 Allen Pkwy'},
 {n:'Kemah Boardwalk',k:'fun',x:2900,z:3320,addr:'215 Kipp Ave, Kemah — rides, boardwalk, Gulf views'},
 /* NASA / Space City */
 poiAt('Space Center Houston','sight',29.5518,-95.0981,'1601 E NASA Pkwy','Official NASA Johnson Space Center visitor center · tram tours · Mission Control'),
 poiAt('NASA Johnson Space Center','sight',29.5593,-95.0899,'2101 NASA Pkwy','Home of human spaceflight · Mission Control · astronaut training'),
 poiAt('Independence Plaza (Shuttle replica)','sight',29.5506,-95.0972,'Space Center Houston','Full-scale Shuttle Independence atop Boeing 747 SCA'),
 /* Museum District & culture */
 poiAt('Houston Museum of Natural Science','sight',29.7219,-95.3895,'5555 Hermann Park Dr','Dinosaurs, Cullen Hall of Gems, Burke Baker Planetarium'),
 poiAt("Children's Museum Houston",'fun',29.7226,-95.3855,'1500 Binz St','Top-ranked kids museum · interactive exhibits'),
 poiAt('Holocaust Museum Houston','sight',29.7255,-95.3858,'5401 Caroline St','History, education & remembrance'),
 poiAt('The Health Museum','sight',29.7210,-95.3868,'1515 Hermann Dr','Body Worlds-style science · Museum District'),
 poiAt('The Menil Collection','sight',29.7372,-95.3985,'1533 Sul Ross St','Free modern & surrealist art · Renzo Piano campus'),
 poiAt('Contemporary Arts Museum Houston','sight',29.7266,-95.3906,'5216 Montrose Blvd','Free contemporary exhibitions'),
 poiAt('Rothko Chapel','sight',29.7376,-95.3962,'3900 Yupon St','Mark Rothko sacred space · quiet meditation'),
 poiAt('Bayou Bend Collection & Gardens','sight',29.7575,-95.4215,'6003 Memorial Dr','MFAH American decorative arts · Ima Hogg estate'),
 poiAt('Buffalo Bayou Park Cistern','sight',29.7628,-95.3955,'105 Sabine St','Underground 1926 reservoir tours'),
 poiAt('McGovern Centennial Gardens','park',29.7188,-95.3890,'1500 Hermann Dr','Hermann Park botanical gardens & mount'),
 poiAt('Houston Arboretum & Nature Center','park',29.7655,-95.4520,'4501 Woodway Dr','155-acre urban wilderness in Memorial Park'),
 poiAt('Memorial Park','park',29.7670,-95.4405,'6501 Memorial Dr','1,500-acre urban park · running trails · golf'),
 poiAt('Levy Park','park',29.7408,-95.4188,'3801 Eastside St','Greenway Plaza pocket park · dog park · events'),
 /* Immersive / amusement */
 poiAt('Meow Wolf Houston — Radio Tave','fun',29.7708,-95.3425,'2103 Lyons Ave','Immersive art experience · Fifth Ward'),
 poiAt('Typhoon Texas Waterpark','fun',29.7705,-95.7440,'555 Katy Fort Bend Rd, Katy','45 acres · 30+ slides · longest lazy river in Texas'),
 poiAt('Six Flags Hurricane Harbor Splashtown','fun',30.0645,-95.4355,'21300 Interstate 45 N, Spring','Houston’s largest water park'),
 poiAt('Big Rivers Waterpark','fun',30.1620,-95.2270,'2301 Poolside Dr, New Caney','Waterpark + adventure park north of Houston'),
 poiAt('Great Wolf Lodge Webster','fun',29.5445,-95.1435,'1001 Bay Area Blvd, Webster','Indoor water park resort near NASA'),
 poiAt('Pirates Bay Water Park','fun',29.6905,-95.2015,'2300 N Main St, Baytown','Baytown municipal water park'),
 poiAt('Moody Gardens','fun',29.2735,-94.8505,'1 Hope Blvd, Galveston','Pyramids · Aquarium · Rainforest · Palm Beach'),
 poiAt('Schlitterbahn Galveston','fun',29.2635,-94.8500,'2109 Gene Lucas Blvd, Galveston','Indoor/outdoor waterpark · MASSIV water coaster'),
 poiAt('Galveston Island Historic Pleasure Pier','fun',29.2855,-94.7895,'2501 Seawall Blvd, Galveston','Gulf-front amusement pier · rides & games'),
 poiAt('Lone Star Flight Museum','sight',29.6065,-95.1675,'11551 Aerospace Ave','Aviation museum at Ellington · historic aircraft'),
 /* Sports & entertainment */
 poiAt('NRG Stadium','fun',29.6847,-95.4107,'1 NRG Pkwy','Houston Texans · rodeo · mega-events'),
 {n:'Astrodome',k:'sight',x:ASTRO.x,z:ASTRO.z,addr:'8400 Kirby Dr — world’s first domed stadium · Eighth Wonder · NRG Park'},
 poiAt('Pennzoil Place','sight',29.7595,-95.3638,'700 Milam St','1975 Philip Johnson twin trapezoid towers'),
 poiAt('Daikin Park','fun',29.7573,-95.3555,'501 Crawford St','Houston Astros · downtown ballpark'),
 poiAt('Toyota Center','fun',29.7508,-95.3621,'1510 Polk St','Houston Rockets · concerts'),
 poiAt('Shell Energy Stadium','fun',29.7522,-95.3520,'2200 Texas Ave','Houston Dynamo FC & Dash'),
 poiAt('Smart Financial Centre','fun',29.6075,-95.6305,'18111 Lexington Blvd, Sugar Land','Concert arena · Sugar Land'),
 /* Landmarks & more sights */
 poiAt('Williams Tower','sight',29.7372,-95.4614,'2800 Post Oak Blvd','901 ft · tallest outside a CBD · Waterwall neighbor'),
 poiAt('JPMorgan Chase Tower','sight',29.7589,-95.3635,'600 Travis St','Houston’s tallest · 1,002 ft'),
 poiAt('Houston City Hall','sight',29.7601,-95.3698,'901 Bagby St','1939 Art Deco · reflecting pool'),
 poiAt('Allen’s Landing','park',29.7645,-95.3605,'1001 Commerce St','Birthplace of Houston · Buffalo Bayou'),
 poiAt('Sesquicentennial Park','park',29.7638,-95.3638,'400 Texas Ave','Theater District bayou park'),
 poiAt('Sam Houston Park','park',29.7585,-95.3725,'1100 Bagby St','Historic houses museum · downtown'),
 poiAt('Houston Graffiti Park','sight',29.7485,-95.2855,'4900 Lawndale St','Legal street-art walls · East End'),
 poiAt('Art Car Museum','sight',29.7755,-95.4055,'140 Heights Blvd','Quirky art cars · Heights'),
 poiAt('Beer Can House','sight',29.7635,-95.4185,'222 Malone St','Folk-art landmark · 50,000+ cans'),
 poiAt('Orange Show Center for Visionary Art','sight',29.7185,-95.3245,'2402 Munger St','Folk-art compound · East End'),
 poiAt('Houston Botanic Garden','park',29.6705,-95.2785,'8205 N Bayou Dr','132-acre botanic garden · Glenbrook'),
 poiAt('Armand Bayou Nature Center','park',29.5935,-95.0905,'8500 Bay Area Blvd','Urban wilderness · Clear Lake'),
 poiAt('Mercer Botanic Gardens','park',30.0385,-95.3815,'22306 Aldine Westfield Rd','Harris County botanic gardens · Humble'),
 poiAt('The Woodlands Waterway','park',30.1645,-95.4625,'Waterway Ave, The Woodlands','Pedestrian canal · shops & dining'),
 poiAt('Downtown Tunnel System','sight',29.7580,-95.3630,'Downtown Houston','6+ miles of air-conditioned tunnels'),
 poiAt('Theater District — Wortham Center','sight',29.7635,-95.3665,'501 Texas Ave','Houston Grand Opera & Ballet'),
 poiAt('Jones Hall','sight',29.7615,-95.3655,'615 Louisiana St','Houston Symphony'),
 poiAt('Alley Theatre','sight',29.7628,-95.3650,'615 Texas Ave','Resident professional theatre'),
 /* Food icons */
 poiAt("Goode Co. Barbecue",'food',29.7325,-95.4795,'5109 Kirby Dr','Classic Houston BBQ'),
 poiAt('Torchy\'s Tacos — Midtown','food',29.7465,-95.3775,'2411 Times Blvd','Houston-born taco chain'),
 poiAt('Ninfa\'s on Navigation','food',29.7575,-95.3375,'2704 Navigation Blvd','Birthplace of fajitas legend'),
 /* Gulf Coast / new metro districts */
 poiAt('Brazos Bend State Park','park',29.3755,-95.6285,'21901 FM 762','5,000-acre park — alligators, observatory, wetlands'),
 poiAt('George Observatory','sight',29.3735,-95.6245,'Brazos Bend SP','Public telescopes south of Houston'),
 poiAt('San Luis Pass','sight',29.0835,-95.1315,'San Luis Pass','Where Galveston Island meets Follets Island — surf fishing'),
 poiAt('Battleship Texas','sight',29.7455,-95.0995,'3523 Independence Pkwy','WWI dreadnought at San Jacinto Battleground'),
 poiAt('Wallisville Lake','park',29.8385,-94.7375,'Wallisville Lake Project','Trinity River wetlands & nature center'),
 poiAt('Sam Houston Statue','sight',30.7235,-95.5515,'Huntsville','67-ft Sam Houston statue on I-45'),
 poiAt('Blue Bell Creameries','food',30.1645,-96.3975,'1101 S Blue Bell Rd, Brenham','Iconic Texas ice cream factory tours'),
 poiAt('Washington-on-the-Brazos','sight',30.3225,-96.1575,'23400 Park Rd 12','Where Texas declared independence in 1836'),
 poiAt('Buc-ee\'s Katy','fuel',29.7825,-95.8245,'27700 Katy Fwy','World-famous Texas travel stop'),
 poiAt('CityCentre','shop',29.7825,-95.5605,'800 Town & Country Blvd','Mixed-use district in the Energy Corridor'),
];
if(HTS_PACK&&HTS_PACK.pois&&HTS_PACK.pois.length){
  POIS.length=0;
  for(const p of HTS_PACK.pois){
    const n=p.n||'';
    let k='sight';
    if(/park|springs|zilker|pease|walnut|emma|mckinney|lady.?bird|mount bonnell/i.test(n))k='park';
    else if(/stadium|q2|moody center|acl|theater|domain/i.test(n))k='fun';
    else if(/ut |university|school|college|lbj|library/i.test(n))k='school';
    else if(/capitol|museum|bullock/i.test(n))k='sight';
    POIS.push({n,k,x:p.x,z:p.z,addr:p.addr||n,lat:p.lat,lng:p.lng,id:p.id});
  }
}
const poiSprites=[];
for(const p of POIS){
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:poiBadge(p.k),transparent:true,depthWrite:false,opacity:0}));
  sp.scale.set(26,26,1);sp.position.set(p.x,34,p.z);
  sp.userData.poi=p;scene.add(sp);poiSprites.push(sp);
}
/* NASA Johnson Space Center campus pad (visual landmark near Space Center Houston) */
(function(){
  if(HTS_HAS_PACK)return;
  const jsc=geoToWorld(29.5593,-95.0899);
  const pad=new THREE.Mesh(new THREE.PlaneGeometry(280,220),new THREE.MeshLambertMaterial({color:0x4a5560}));
  pad.rotation.x=-Math.PI/2;pad.position.set(jsc.x,0.12,jsc.z);gDetail.add(pad);
  const b1=new THREE.Mesh(towerGeo,new THREE.MeshLambertMaterial({color:0xb9bec4}));
  b1.scale.set(90,22,48);b1.position.set(jsc.x-40,0,jsc.z);gDetail.add(b1);
  const b2=new THREE.Mesh(towerGeo,new THREE.MeshLambertMaterial({color:0x8a9098}));
  b2.scale.set(55,16,70);b2.position.set(jsc.x+55,0,jsc.z+30);gDetail.add(b2);
  const dish=new THREE.Mesh(new THREE.CylinderGeometry(18,18,3,16),new THREE.MeshLambertMaterial({color:0xd8dade}));
  dish.position.set(jsc.x+20,24,jsc.z-40);gDetail.add(dish);
  const sp=textSprite('NASA JSC',0.42);sp.position.set(jsc.x,70,jsc.z);gDetail.add(sp);
  EXCLUDES.push({x:jsc.x,z:jsc.z,r:220});
  registerLandmarkHit(jsc.x,30,jsc.z,280,80,240,
    {n:'NASA Johnson Space Center',d:'Home of human spaceflight · Mission Control · astronaut training'},
    {n:'NASA Johnson Space Center',x:jsc.x,z:jsc.z,addr:'2101 NASA Pkwy — Mission Control & astronaut training'});
})();
/* Kemah: boardwalk pad + working ferris wheel */
window.FERRIS=(function(){
  if(HTS_HAS_PACK)return null;
  const pad=new THREE.Mesh(new THREE.PlaneGeometry(220,140),new THREE.MeshLambertMaterial({color:0x8a7a5e}));
  pad.rotation.x=-Math.PI/2;pad.position.set(2900,0.1,3330);gDetail.add(pad);
  const g=new THREE.Group();
  const rim=new THREE.Mesh(new THREE.TorusGeometry(34,1.2,6,22),new THREE.MeshLambertMaterial({color:0xd8dade}));
  g.add(rim);
  for(let i=0;i<8;i++){
    const a=i/8*TAU;
    const spoke=new THREE.Mesh(new THREE.BoxGeometry(0.8,34,0.8),new THREE.MeshLambertMaterial({color:0xaeb4ba}));
    spoke.position.set(Math.cos(a)*17,Math.sin(a)*17,0);spoke.rotation.z=a+Math.PI/2;g.add(spoke);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(4,4.5,3),
      new THREE.MeshLambertMaterial({color:[0xc23a2c,0x2b5ea8,0xd9a91f,0x1d7a4f][i%4]}));
    cab.position.set(Math.cos(a)*34,Math.sin(a)*34,0);g.add(cab);g.userData['cab'+i]=cab;
  }
  g.position.set(2900,38,3300);g.rotation.y=0.6;
  const legs=new THREE.Mesh(new THREE.CylinderGeometry(1.4,2,38,6),new THREE.MeshLambertMaterial({color:0x777d84}));
  legs.position.set(2900,19,3300);gDetail.add(legs);
  gDetail.add(g);
  registerLandmarkHit(2900,40,3315,200,90,160,
    {n:'Kemah Boardwalk',d:'Landry’s waterfront · rides, restaurants & Gulf views · Galveston Bay'},
    {n:'Kemah Boardwalk',x:2900,z:3320,addr:'215 Kipp Ave, Kemah — rides, boardwalk, Gulf views'});
  return g;
})();

/* Downtown Aquarium — Landry’s complex on Buffalo Bayou (410 Bagby) */
(function buildDowntownAquarium(){
  if(HTS_HAS_PACK)return;
  const ax=89, az=8;
  const pad=new THREE.Mesh(new THREE.PlaneGeometry(95,70),new THREE.MeshLambertMaterial({color:0x6a7068}));
  pad.rotation.x=-Math.PI/2;pad.position.set(ax,0.08,az);gDetail.add(pad);
  /* main aquarium hall — teal glass box */
  const hall=new THREE.Mesh(new THREE.BoxGeometry(48,22,32),
    new THREE.MeshPhongMaterial({color:0x1a6a78,emissive:0x0a3040,emissiveIntensity:0.35,shininess:80,transparent:true,opacity:0.92}));
  hall.position.set(ax-8,11,az);gDetail.add(hall);
  /* restaurant wing */
  const wing=new THREE.Mesh(new THREE.BoxGeometry(28,14,22),
    new THREE.MeshLambertMaterial({color:0xc45a2c}));
  wing.position.set(ax+28,7,az+8);gDetail.add(wing);
  /* shark-tunnel cylinder hint */
  const tun=new THREE.Mesh(new THREE.CylinderGeometry(5,5,18,12),
    new THREE.MeshPhongMaterial({color:0x2a8aaa,emissive:0x104050,emissiveIntensity:0.5,transparent:true,opacity:0.75}));
  tun.rotation.z=Math.PI/2;tun.position.set(ax-8,6,az+18);gDetail.add(tun);
  /* mini Ferris wheel (aquarium’s) */
  const fw=new THREE.Group();
  const rim=new THREE.Mesh(new THREE.TorusGeometry(14,0.7,5,16),new THREE.MeshLambertMaterial({color:0xe8e0d0}));
  fw.add(rim);
  for(let i=0;i<6;i++){
    const a=i/6*TAU;
    const spoke=new THREE.Mesh(new THREE.BoxGeometry(0.45,14,0.45),new THREE.MeshLambertMaterial({color:0xb0b4b8}));
    spoke.position.set(Math.cos(a)*7,Math.sin(a)*7,0);spoke.rotation.z=a+Math.PI/2;fw.add(spoke);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.4,1.8),
      new THREE.MeshLambertMaterial({color:[0x2b8ec8,0xc23a2c,0xd9a91f][i%3]}));
    cab.position.set(Math.cos(a)*14,Math.sin(a)*14,0);fw.add(cab);
  }
  fw.position.set(ax+22,16,az-18);fw.rotation.y=-0.4;gDetail.add(fw);
  window.AQUARIUM_WHEEL=fw;
  const legs=new THREE.Mesh(new THREE.CylinderGeometry(0.7,1.1,16,5),new THREE.MeshLambertMaterial({color:0x6a7078}));
  legs.position.set(ax+22,8,az-18);gDetail.add(legs);
  const sp=textSprite('Downtown Aquarium',0.38);sp.position.set(ax,36,az);gDetail.add(sp);
  registerLandmarkHit(ax,18,az,110,50,90,
    {n:'Downtown Aquarium',d:'Landry’s aquarium-restaurant · Ferris wheel · shark tunnel · Buffalo Bayou'},
    {n:'Downtown Aquarium',x:ax,z:az,addr:'410 Bagby St — ferris wheel & shark tunnel'});
})();

/* ---------------- street life: pedestrians & cyclists ----------------
   Calibrated from Houston urban data (not NYC sidewalk packing):
   - Downtown ~1.84 sq mi · ~10–19k residents (~5.5–11k / sq mi)
   - ~150–180k jobs (~69k employees / sq mi) but most are indoors / tunnels
   - Citywide Houston ~3.3k people / sq mi — auto-oriented, sparse sidewalks
   - Outdoor street life peaks at lunch & evening venues; nights are thin
   Visible characters ≈ outdoor foot traffic, not total population. */
window.updateCrowds=(function(){
  /* dens = relative outdoor foot-traffic weight (1 = quiet park path) */
  const dtAus=HTS_IS_AUS?geoToWorld(30.2672,-97.7431):null;
  const PED_HUBS=HTS_IS_AUS?[
    {x:dtAus.x,z:dtAus.z,r:160,dens:9.5,kind:'core'},
    {x:geoToWorld(30.2675,-97.7395).x,z:geoToWorld(30.2675,-97.7395).z,r:90,dens:7.0,kind:'core'}, /* 6th */
    {x:geoToWorld(30.258,-97.738).x,z:geoToWorld(30.258,-97.738).z,r:70,dens:5.5,kind:'venue'}, /* Rainey — south shore */
    {x:geoToWorld(30.2671,-97.7729).x,z:geoToWorld(30.2671,-97.7729).z,r:140,dens:4.5,kind:'park'}, /* Zilker */
    {x:geoToWorld(30.2747,-97.7404).x,z:geoToWorld(30.2747,-97.7404).z,r:100,dens:4.0,kind:'core'}, /* Capitol grounds */
    {x:geoToWorld(30.28565,-97.73921).x,z:geoToWorld(30.28565,-97.73921).z,r:70,dens:4.0,kind:'school'}, /* UT Tower plaza only */
    /* Skip lake-tagged POIs — those centers sit in open water */
    ...(HTS_PACK&&HTS_PACK.pois?HTS_PACK.pois.filter(p=>{
      const id=(p.id||'')+(p.n||'');
      return !/lady.?bird|lake travis|lake austin/i.test(id);
    }).slice(0,8).map(p=>({x:p.x,z:p.z,r:Math.min(p.r||120,140),dens:3.5,kind:'venue'})):[])
  ]:[
    /* Downtown core — densest outdoor streets (Main / tunnels steal some) */
    {x:60,z:60,r:200,dens:9.5,kind:'core'},
    {x:95,z:75,r:140,dens:8.5,kind:'core'},   /* Main St / transit */
    {x:126,z:104,r:110,dens:7.5,kind:'core'},  /* Main Street Square */
    {x:40,z:40,r:120,dens:6.5,kind:'core'},    /* Theater District */
    {x:180,z:50,r:130,dens:6.0,kind:'venue'},  /* Discovery Green / GRB */
    {x:89,z:8,r:90,dens:5.5,kind:'venue'},     /* Downtown Aquarium */
    {x:240,z:105,r:100,dens:4.5,kind:'venue'}, /* Daikin Park plaza */
    {x:157,z:199,r:95,dens:4.5,kind:'venue'},  /* Toyota Center plaza */
    /* Midtown / Museum / Med Center — walkable nodes */
    {x:40,z:290,r:130,dens:4.0,kind:'core'},
    {x:-200,z:565,r:110,dens:3.5,kind:'park'}, /* MFAH */
    {x:-230,z:805,r:160,dens:5.0,kind:'park'}, /* Hermann Park */
    {x:-200,z:828,r:100,dens:4.5,kind:'venue'},/* Zoo */
    {x:-282,z:830,r:140,dens:5.5,kind:'med'},  /* Med Center */
    {x:-342,z:683,r:120,dens:3.5,kind:'school'},/* Rice */
    {x:405,z:645,r:130,dens:3.0,kind:'school'}, /* UH */
    /* Parks & bayou trails */
    {x:-350,z:-72,r:150,dens:3.5,kind:'park'}, /* Buffalo Bayou Park */
    {x:-880,z:-130,r:180,dens:2.5,kind:'park'},/* Memorial Park */
    /* Retail / suburban activity — lower outdoor density */
    {x:-980,z:205,r:160,dens:4.0,kind:'mall'}, /* Galleria */
    {x:-1560,z:-260,r:120,dens:2.5,kind:'mall'},
    {x:-455,z:1157,r:140,dens:3.5,kind:'venue'},/* NRG */
    {x:2900,z:3320,r:120,dens:4.0,kind:'venue'},/* Kemah */
    {x:165,z:28,r:100,dens:2.0,kind:'core'},
    {x:-1000,z:262,r:80,dens:2.0,kind:'park'}  /* Waterwall */
  ];
  const densSum=PED_HUBS.reduce((s,h)=>s+h.dens,0);
  /* Pool sized for peak lunch outdoor life across hubs (~0.02–0.08 peds
     per 1000 sq ft of active plaza — Houston, not Manhattan) */
  const NP=820;
  const pedGeom=(function(){
    const body=new THREE.BoxGeometry(0.55,1.1,0.34);body.translate(0,0.55,0);
    const head=new THREE.SphereGeometry(0.22,6,5);head.translate(0,1.32,0);
    const g=mergeGeoms([body,head]);
    g.computeVertexNormals();return g;
  })();
  const peds=new THREE.InstancedMesh(pedGeom,new THREE.MeshLambertMaterial({}),NP);
  scene.add(peds);
  /* clothing / skin tones — Houston mix */
  const PCOLS=[0xc7cbd1,0x8c4a3a,0x2b4a7a,0x3a6b3f,0xd9a91f,0x6a4a8a,0xe8e8ea,0x1f2530,
    0xb85a3a,0x4a6a8a,0x2a2a2e,0xd4c4a8,0x5c3a2a,0x1a5a4a,0xc45a6a,0x3a3a5a];
  const pedList=[];const d=new THREE.Object3D(),col=new THREE.Color();
  function pickHub(){
    let t=rand()*densSum;
    for(const h of PED_HUBS){t-=h.dens;if(t<=0)return h;}
    return PED_HUBS[0];
  }
  /* time-of-day outdoor activity (1 = weekday lunch peak) */
  function pedActivity(h){
    if(h<5)return 0.06;
    if(h<7)return 0.18;
    if(h<9)return 0.72;   /* morning commute spill onto sidewalks */
    if(h<11.5)return 0.48;
    if(h<13.5)return 1.0; /* lunch peak — strongest street life */
    if(h<16)return 0.42;
    if(h<18)return 0.68;  /* evening commute */
    if(h<21)return 0.78;  /* dinner / venues / promenade */
    if(h<23)return 0.28;
    return 0.1;
  }
  function hubTimeBoost(kind,h){
    if(kind==='venue'&&h>=17&&h<23)return 1.35;
    if(kind==='med'&&h>=7&&h<18)return 1.15;
    if(kind==='mall'&&h>=11&&h<21)return 1.2;
    if(kind==='park'&&h>=7&&h<19)return 1.1;
    if(kind==='core'&&h>=11.5&&h<13.5)return 1.25;
    if(kind==='core'&&(h<6||h>22))return 0.55;
    return 1;
  }
  for(let i=0;i<NP;i++){
    const hub=pickHub();
    const runner=rand()<0.08;
    pedList.push({
      hub,a:rand()*TAU,
      sp:(runner?2.2:0.85+rand()*0.95)/hub.r*(rand()<0.5?1:-1),
      rr:hub.r*(0.55+rand()*0.5),
      wake:Math.pow(rand(),0.85), /* lower = more often out (skew to busy look) */
      sc:1.35+rand()*0.35,
      kind:hub.kind
    });
    col.setHex(PCOLS[Math.floor(rand()*PCOLS.length)]);peds.setColorAt(i,col);
  }
  /* trail cyclists — bayou greenways (Houston has strong bayou bike culture) */
  const NB=140;
  const bikeGeom=(function(){
    const frame=new THREE.BoxGeometry(0.14,0.5,1.5);frame.translate(0,0.55,0);
    const rider=new THREE.BoxGeometry(0.42,0.85,0.3);rider.translate(0,1.2,-0.1);
    const g=mergeGeoms([frame,rider]);g.computeVertexNormals();return g;
  })();
  const bikes=new THREE.InstancedMesh(bikeGeom,new THREE.MeshLambertMaterial({}),NB);
  scene.add(bikes);
  const bikeTrails=(HTS_IS_AUS?[LADYBIRD,SHOAL,BARTON_CK]:(HTS_HAS_PACK?(LADYBIRD.length>=2?[LADYBIRD]:[]):[BAYOU,WHITEOAK,BRAYS]))
    .filter(pts=>pts&&pts.length>=2)
    .map(pts=>sampleCurve(pts,false,30))
    .filter(t=>t&&t.total>1);
  /* Houston bayou trail ≈ ±52; Austin Lady Bird trail outside wide channel half-width */
  const bikeSide=HTS_IS_AUS?58:52;
  const bikeList=[];
  for(let i=0;i<NB;i++){
    if(!bikeTrails.length)break;
    const trail=bikeTrails[Math.floor(rand()*bikeTrails.length)];
    bikeList.push({trail,s:rand()*trail.total,v:10+rand()*8,side:rand()<0.5?bikeSide:-bikeSide,wake:rand()});
    col.setHex(PCOLS[Math.floor(rand()*PCOLS.length)]);bikes.setColorAt(i,col);
  }
  bikes.count=bikeList.length;
  return function(dt,camRadius,hour){
    const on=camRadius<(HTS_IS_AUS?1600:2800)&&!window.osmMode;
    if(peds.visible!==on){peds.visible=on;bikes.visible=on;}
    if(!on)return;
    const h=(hour==null?12:hour);
    const act=pedActivity(h);
    for(let i=0;i<NP;i++){
      const p=pedList[i];
      const live=p.wake < act*hubTimeBoost(p.kind,h)*0.95;
      if(!live){
        d.position.set(0,-40,0);d.scale.setScalar(0.001);d.updateMatrix();
        peds.setMatrixAt(i,d.matrix);continue;
      }
      p.a+=p.sp*dt*60*0.016;
      let x=p.hub.x+Math.cos(p.a)*p.rr,z=p.hub.z+Math.sin(p.a)*p.rr;
      /* Keep feet dry — nudge off lake / reservoir excludes */
      if(typeof inWater==='function'&&inWater(x,z)){
        for(let t=0;t<6;t++){
          p.a+=0.7;
          x=p.hub.x+Math.cos(p.a)*p.rr;z=p.hub.z+Math.sin(p.a)*p.rr;
          if(!inWater(x,z))break;
        }
        if(inWater(x,z)){
          d.position.set(0,-40,0);d.scale.setScalar(0.001);d.updateMatrix();
          peds.setMatrixAt(i,d.matrix);continue;
        }
      }
      d.position.set(x,0.05,z);
      d.rotation.set(0,Math.atan2(-Math.sin(p.a)*Math.sign(p.sp),Math.cos(p.a)*Math.sign(p.sp)),0);
      d.scale.setScalar(p.sc);d.updateMatrix();peds.setMatrixAt(i,d.matrix);
    }
    peds.instanceMatrix.needsUpdate=true;
    const bikeAct=clamp(act*1.1,0.12,1);
    for(let i=0;i<bikeList.length;i++){
      const b=bikeList[i];
      if(b.wake>bikeAct){
        d.position.set(0,-40,0);d.scale.setScalar(0.001);d.updateMatrix();
        bikes.setMatrixAt(i,d.matrix);continue;
      }
      const trail=b.trail;
      if(!trail||!trail.total)continue;
      b.s=(b.s+b.v*dt)%trail.total;
      let lo=0,hi=trail.n;
      while(lo<hi){const m2=(lo+hi)>>1;if(trail.cum[m2]<b.s)lo=m2+1;else hi=m2;}
      const j=Math.max(1,lo);
      const rx=-trail.tz[j],rz=trail.tx[j];
      d.position.set(trail.px[j]+rx*b.side,0.05,trail.pz[j]+rz*b.side);
      d.rotation.set(0,Math.atan2(trail.tx[j],trail.tz[j]),0);
      d.scale.setScalar(1.45);d.updateMatrix();bikes.setMatrixAt(i,d.matrix);
    }
    bikes.instanceMatrix.needsUpdate=true;
  };
})();

/* pulsing congestion hotspot rings — color/opacity from live traffic */
window.HOTRINGS=[];
(function(){
  function ringTex(hex){
    const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
    const r=((hex>>16)&255),g=((hex>>8)&255),b=(hex&255);
    x.strokeStyle='rgba('+r+','+g+','+b+',.95)';x.lineWidth=8;
    x.beginPath();x.arc(64,64,52,0,TAU);x.stroke();
    x.strokeStyle='rgba('+r+','+g+','+b+',.4)';x.lineWidth=18;
    x.beginPath();x.arc(64,64,40,0,TAU);x.stroke();
    const fill=x.createRadialGradient(64,64,8,64,64,56);
    fill.addColorStop(0,'rgba('+r+','+g+','+b+',.35)');
    fill.addColorStop(0.55,'rgba('+r+','+g+','+b+',.12)');
    fill.addColorStop(1,'rgba('+r+','+g+','+b+',0)');
    x.fillStyle=fill;x.beginPath();x.arc(64,64,56,0,TAU);x.fill();
    return new THREE.CanvasTexture(c);
  }
  const TEX={
    free:ringTex(0x22c55e),slow:ringTex(0xfacc15),heavy:ringTex(0xf97316),jam:ringTex(0xe11d2e)
  };
  function congTier(c){
    if(c<0.28)return 'free';
    if(c<0.48)return 'slow';
    if(c<0.68)return 'heavy';
    return 'jam';
  }
  for(const hs of HOTSPOTS){
    const mat=new THREE.MeshBasicMaterial({map:TEX.jam,transparent:true,opacity:0,depthWrite:false,fog:false});
    const sp=new THREE.Mesh(new THREE.PlaneGeometry(hs.r*1.55,hs.r*1.55),mat);
    sp.rotation.x=-Math.PI/2;sp.position.set(hs.x,3.2,hs.z);
    sp.renderOrder=2;
    scene.add(sp);
    /* floating label */
    const lbl=textSprite(hs.name||'Hotspot',0.55);
    lbl.position.set(hs.x,48,hs.z);
    lbl.material.opacity=0;
    lbl.material.depthWrite=false;
    lbl.renderOrder=3;
    scene.add(lbl);
    HOTRINGS.push({mat,mesh:sp,lbl,hs,tier:'jam',cong:0,TEX,congTier});
  }
  window._hotspotRingTex=TEX;
})();

/* ---------------- METRORail Red Line (Downtown <-> Med Center) ---------------- */
const _rpRail={px:0,pz:0,py:0,tx:0,tz:0};
window.RAIL=HTS_HAS_PACK?null:(function(){
  const pts=[[95,10],[60,190],[-10,390],[-90,570],[-190,705],[-272,812]];
  const s=sampleCurve(pts,false,12);
  gDetail.add(new THREE.Mesh(ribbonGeom(s,5.5,0.86,0,false,0),
    new THREE.MeshLambertMaterial({color:0x3a3e44})));
  /* stations */
  const stops=[0.02,0.3,0.62,0.97].map(f=>f*s.total);
  for(const st of stops){
    roadPos({s},st,_rpRail);
    const plat=new THREE.Mesh(new THREE.BoxGeometry(4,1.2,16),new THREE.MeshLambertMaterial({color:0x9aa0a6}));
    plat.position.set(_rpRail.px+(-_rpRail.tz)*6,0.6,_rpRail.pz+_rpRail.tx*6);
    plat.rotation.y=Math.atan2(_rpRail.tx,_rpRail.tz);gDetail.add(plat);
  }
  /* two-car train */
  const train=new THREE.Group();
  for(const off of [-9,9]){
    const car=new THREE.Mesh(new THREE.BoxGeometry(3.4,3.4,17),
      new THREE.MeshLambertMaterial({color:0xd8dade}));
    car.position.set(0,1.9,off);train.add(car);
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(3.5,0.9,17),
      new THREE.MeshLambertMaterial({color:0xc2242e}));
    stripe.position.set(0,1.1,off);train.add(stripe);
  }
  gDetail.add(train);
  return {s,train,pos:0,dir:1,dwell:0,stops};
})();
window.updateRail=function(dt){
  const R=RAIL;
  if(!R)return;
  if(R.dwell>0){R.dwell-=dt;return;}
  R.pos+=R.dir*16*dt;
  if(R.pos>=R.s.total){R.pos=R.s.total;R.dir=-1;R.dwell=5;}
  if(R.pos<=0){R.pos=0;R.dir=1;R.dwell=5;}
  for(const st of R.stops)if(Math.abs(R.pos-st)<1.2&&R.dwell<=0){R.dwell=4;break;}
  roadPos({s:R.s},R.pos,_rpRail);
  R.train.position.set(_rpRail.px,0,_rpRail.pz);
  R.train.rotation.y=Math.atan2(_rpRail.tx*R.dir,_rpRail.tz*R.dir);
};
/* ---------------- Port of Houston container cranes ---------------- */
(function(){
  if(HTS_HAS_PACK)return;
  const craneMat=new THREE.MeshLambertMaterial({color:0xc94b3a});
  for(let k=0;k<4;k++){
    const x=3050+k*130,z=520;
    const grp=new THREE.Group();
    for(const sd of [-8,8]){
      const leg=new THREE.Mesh(new THREE.BoxGeometry(2.4,58,2.4),craneMat);
      leg.position.set(sd,29,0);grp.add(leg);
    }
    const boom=new THREE.Mesh(new THREE.BoxGeometry(4,3,86),craneMat);
    boom.position.set(0,58,-18);grp.add(boom);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(6,5,8),new THREE.MeshLambertMaterial({color:0x394048}));
    cab.position.set(0,52,6);grp.add(cab);
    grp.position.set(x,0,z);grp.rotation.y=-0.12;gDetail.add(grp);
  }
  /* container stacks */
  const cg=new THREE.BoxGeometry(6,2.6,15);
  const cm=new THREE.InstancedMesh(cg,new THREE.MeshLambertMaterial({}),160);
  const d2=new THREE.Object3D(),cc=new THREE.Color();
  const CCOL=[0xc94b3a,0x2b5ea8,0x1d7a4f,0xd9a91f,0x8a5a44,0x5a6570];
  let ci=0;
  for(let rx2=0;rx2<10;rx2++)for(let rz2=0;rz2<8;rz2++){
    if(rand()<0.25)continue;
    const stack=1+Math.floor(rand()*3);
    for(let lv=0;lv<stack&&ci<160;lv++){
      d2.position.set(3020+rx2*8,1.3+lv*2.7,600+rz2*17);
      d2.updateMatrix();cm.setMatrixAt(ci,d2.matrix);
      cc.setHex(CCOL[Math.floor(rand()*6)]);cm.setColorAt(ci,cc);ci++;
    }
  }
  cm.count=ci;gDetail.add(cm);
})();
/* ---------------- vehicles ---------------- */
const VEH_TYPES=[
 {id:'car',   w:2.3,h:1.42,len:4.8, wr:0.42, ffk:1.0,  p:0.38},
 {id:'suv',   w:2.5,h:1.85,len:5.2, wr:0.48, ffk:1.0,  p:0.12},
 {id:'pickup',w:2.5,h:1.95,len:5.9, wr:0.50, ffk:1.0,  p:0.14},  /* it's Texas */
 {id:'van',   w:2.4,h:2.15,len:5.4, wr:0.46, ffk:0.96, p:0.05},
 {id:'taxi',  w:2.3,h:1.45,len:4.9, wr:0.42, ffk:1.02, p:0.04},
 {id:'semi',  w:2.7,h:3.9, len:18,  wr:0.55, ffk:0.88, p:0.06, axf:0.42, axr:0.30},
 {id:'box',   w:2.6,h:3.2, len:9,   wr:0.52, ffk:0.93, p:0.04},
 {id:'bus',   w:2.7,h:3.3, len:12.5,wr:0.55, ffk:0.9,  p:0.025, axf:0.36, axr:0.34},
 {id:'moto',  w:1.0,h:1.5, len:2.3, wr:0.36, ffk:1.08, p:0.09},
 {id:'scooter',w:0.85,h:1.35,len:1.9,wr:0.32, ffk:0.95, p:0.035},
 {id:'bike',  w:0.55,h:1.55,len:1.7, wr:0.28, ffk:0.55, p:0.02}, /* road cyclists in traffic */
];
const VEH_COLORS=[0xe8e8ea,0xf2f3f5,0x17181c,0x9ba1a8,0x6e747c,0xc7cbd1,0x8c1d1d,0x1d3f7a,0x2f5c33,0x7a4a1d,0xd9d9d9,0x3c3f45,0x8a2f22,0x2b2f38,0x4a6b8a,0xb8b2a4,0x5c2a5e,0x1f6b6b,0xcfa22e,0x22252b,0xf5c542,0xffffff];
const TRAILER_COLS=[0xe9eaec,0xdadde0,0xc4c8cc,0xd8d2c4];
const TAXI_YELLOW=0xf5c542;
function pickType(){let r=rand();for(const t of VEH_TYPES){if(r<t.p)return t;r-=t.p;}return VEH_TYPES[0];}

const MPH=0.338;      /* world u/s per mph */
const VS=1.28;        /* vehicle visual scale */
const MAX_INST=4000;

/* glasshouse texture: dark glass w/ pillars + light roofline */
/* greenhouse texture: dark glass UPPER band, body-colored LOWER band
   (multiplied by instance color -> painted doors under tinted windows) */
const glassTex=(function(){const c=document.createElement('canvas');c.width=64;c.height=32;const x=c.getContext('2d');
  x.fillStyle='#f2f2f2';x.fillRect(0,0,64,32);            /* lower body takes paint */
  const g=x.createLinearGradient(0,0,0,15);
  g.addColorStop(0,'#3d4a58');g.addColorStop(.5,'#141b24');g.addColorStop(1,'#0c1117');
  x.fillStyle=g;x.fillRect(0,3,64,12);                    /* glass band */
  x.fillStyle='#0a0d12';x.fillRect(19,3,3.4,12);x.fillRect(41,3,3.4,12); /* pillars */
  x.fillStyle='rgba(255,255,255,.5)';x.fillRect(0,0,64,3); /* roof */
  x.fillStyle='rgba(0,0,0,.24)';x.fillRect(0,15,64,2);     /* beltline shadow */
  return new THREE.CanvasTexture(c);})();
/* body paint: vertical gradient + dark skirt, multiplied by instance color */
const bodyTex=(function(){const c=document.createElement('canvas');c.width=16;c.height=32;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,32);
  g.addColorStop(0,'#ffffff');g.addColorStop(.45,'#e9e9e9');g.addColorStop(.82,'#c9c9c9');g.addColorStop(.86,'#3c3c3c');g.addColorStop(1,'#2f2f2f');
  x.fillStyle=g;x.fillRect(0,0,16,32);
  return new THREE.CanvasTexture(c);})();

const bodyGeo=new THREE.BoxGeometry(1,1,1);bodyGeo.translate(0,0.5,0);
const bodyMat=new THREE.MeshLambertMaterial({map:bodyTex,transparent:true});
const bodies=new THREE.InstancedMesh(bodyGeo,bodyMat,MAX_INST);
bodies.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
const _white=new THREE.Color(0xffffff);
for(let i=0;i<MAX_INST;i++)bodies.setColorAt(i,_white);
scene.add(bodies);

const cabGeo=new THREE.BoxGeometry(1,1,1);cabGeo.translate(0,0.5,0);
const cabMat=new THREE.MeshLambertMaterial({map:glassTex,color:0xffffff,transparent:true});
const cabs=new THREE.InstancedMesh(cabGeo,cabMat,MAX_INST);
cabs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
for(let i=0;i<MAX_INST;i++)cabs.setColorAt(i,_white);
scene.add(cabs);

/* wheels: 4 per vehicle */
const extraGeo=new THREE.BoxGeometry(1,1,1);extraGeo.translate(0,0.5,0);
const extraMat=new THREE.MeshLambertMaterial({transparent:true});
const extras=new THREE.InstancedMesh(extraGeo,extraMat,MAX_INST);
extras.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
for(let i=0;i<MAX_INST;i++)extras.setColorAt(i,new THREE.Color(0xffffff));
scene.add(extras);
const wheelGeo=new THREE.CylinderGeometry(0.5,0.5,0.36,10);wheelGeo.rotateZ(Math.PI/2);
const wheelMat=new THREE.MeshLambertMaterial({color:0x14161a,transparent:true});
const wheels=new THREE.InstancedMesh(wheelGeo,wheelMat,MAX_INST*4);
wheels.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(wheels);

const glowGeo=new THREE.BoxGeometry(1,1,1);
const headMat2=new THREE.MeshBasicMaterial({color:0xfff4c8,transparent:true,opacity:0});
const tailMat=new THREE.MeshBasicMaterial({color:0xff2418,transparent:true,opacity:0.9});
const heads2=new THREE.InstancedMesh(glowGeo,headMat2,MAX_INST);
const tails=new THREE.InstancedMesh(glowGeo,tailMat,MAX_INST);
heads2.instanceMatrix.setUsage(THREE.DynamicDrawUsage);tails.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
const _dimRed=new THREE.Color(0x3a0f0c),_brakeRed=new THREE.Color(0xff2418);
for(let i=0;i<MAX_INST;i++)tails.setColorAt(i,_dimRed);
scene.add(heads2);scene.add(tails);

/* headlight pools: warm ellipses cast on the pavement ahead of each vehicle */
const poolTex=(function(){const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');
  const g=x.createRadialGradient(32,40,3,32,40,30);
  g.addColorStop(0,'rgba(255,238,190,.75)');g.addColorStop(.5,'rgba(255,225,160,.25)');g.addColorStop(1,'rgba(255,215,140,0)');
  x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
const poolGeo=new THREE.PlaneGeometry(1,1);poolGeo.rotateX(-Math.PI/2);
const poolMat=new THREE.MeshBasicMaterial({map:poolTex,transparent:true,opacity:0,
  blending:THREE.AdditiveBlending,depthWrite:false});
const pools=new THREE.InstancedMesh(poolGeo,poolMat,MAX_INST);
pools.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(pools);
let totalVeh=0,speedSum=0;
const shareSum=ROAD_DEFS.reduce((a,d)=>a+d.share,0);
const TOTAL_TARGET=2800;

function makeVehicle(road,s,speedMph){
  let t=pickType();
  /* keep big rigs off surface streets; bikes/scooters prefer arterials */
  if((road.def.arterial||road.def.surface)&&t.len>9)t=VEH_TYPES[0];
  if(!(road.def.arterial||road.def.surface)&&(t.id==='bike'||t.id==='scooter')&&rand()<0.7){
    t=VEH_TYPES[Math.floor(rand()*3)]; /* freeways: mostly cars */
  }
  const ff=road.def.ff||60;
  const v0=speedMph!=null?speedMph*MPH:(6+rand()*8);
  const v={s,v:clamp(v0,4*MPH,ff*0.95*MPH),type:t,brake:false,
    aggr:0.85+rand()*0.32, /* individual driving style */
    _laneI:0,_lcCd:0,
    col:t.id==='taxi'?TAXI_YELLOW:VEH_COLORS[Math.floor(rand()*VEH_COLORS.length)]};
  if(t.id==='semi')v.tcol=TRAILER_COLS[Math.floor(rand()*TRAILER_COLS.length)];
  if(t.id==='bike'||t.id==='scooter'||t.id==='moto')v.aggr=1.05+rand()*0.25;
  return v;
}
function vehBumpLen(v){return v.type.len*VS;}
function minBumpGap(v,ahead){
  return vehBumpLen(v)+(ahead?vehBumpLen(ahead):vehBumpLen(v))*0.5+4.2;
}
function desiredHeadway(road,dir,live,cong){
  const ff=road.def.ff||60;
  let mph=liveFlowFresh(live)?sanitizeLiveMph(live.cur,live.ff,road):ff*(1-0.62*cong);
  mph=clamp(mph,6,ff);
  const followSec=0.75+1.15*(mph/ff); /* tighter packs when slow — like real Houston jams */
  return Math.max(vehBumpLen({type:{len:5.2}})+6, mph*MPH*followSec);
}
function findOpenSpawnS(lane,L,closed,minGap){
  if(!lane.length)return closed?rand()*L:L*0.04;
  let bestGap=0,bestS=L*0.04;
  for(let i=0;i<lane.length;i++){
    const a=lane[i],b=lane[(i+1)%lane.length];
    let gap=b.s-a.s;if(gap<=0)gap+=L;
    if(gap>bestGap){bestGap=gap;bestS=a.s+gap*(0.32+rand()*0.36);}
  }
  if(!closed){
    const tail=lane[lane.length-1];
    const tailGap=L-tail.s;
    if(tailGap>bestGap){bestGap=tailGap;bestS=tail.s+tailGap*0.45;}
    if(lane[0].s>minGap&&lane[0].s*0.5>bestGap)bestS=0;
  }
  if(bestGap<minGap)return -1;
  return closed?((bestS%L)+L)%L:clamp(bestS,L*0.02,L*0.98);
}
function insertVehicleSorted(lane,v){
  let idx=0;while(idx<lane.length&&lane[idx].s<v.s)idx++;
  lane.splice(idx,0,v);
}
function seedRoad(road,dir,count){
  const L=road.s.total,lanes=dir.lanes;
  const perLane=Math.max(1,Math.ceil(count/lanes.length));
  const headway=L/Math.max(perLane,1);
  let left=count;
  for(let li=0;li<lanes.length;li++){
    const lane=lanes[li];
    const n=Math.min(perLane,left);left-=n;
    for(let i=0;i<n;i++){
      let s0=headway*(i+0.55)+rand()*headway*0.12;
      if(!road.s.closed)s0=clamp(s0,L*0.03,L*0.97);
        const mph=road.def.ff*(0.55+0.35*(1-i/Math.max(n,1)));
        const v=makeVehicle(road,s0,mph);
        v._laneI=li;
        insertVehicleSorted(lane,v);
    }
  }
}

/* ---------------- traffic demand ---------------- */
const VOL_KEYS=[{t:0,v:.10},{t:3,v:.06},{t:5,v:.16},{t:6.3,v:.55},{t:7.5,v:.92},{t:8.7,v:.85},
 {t:10,v:.5},{t:12,v:.55},{t:14.5,v:.58},{t:16,v:.9},{t:17.4,v:1.0},{t:18.8,v:.8},{t:20,v:.45},{t:22,v:.25},{t:23.3,v:.14}];
const VOL_KEYS_WKND=[{t:0,v:.14},{t:4,v:.06},{t:8,v:.25},{t:11,v:.5},{t:14,v:.58},{t:17,v:.55},{t:20,v:.4},{t:23,v:.2}];
const DIRB_KEYS=[{t:0,v:0},{t:5.5,v:.2},{t:7.5,v:1},{t:9.5,v:.2},{t:12,v:0},{t:15,v:-.4},{t:17.3,v:-1},{t:19.5,v:-.3},{t:21,v:0}];
let volumeMode='auto';
function demand(h,weekend){
  if(volumeMode==='light')return 0.22;
  if(volumeMode==='heavy')return 0.97;
  return keyNum(weekend?VOL_KEYS_WKND:VOL_KEYS,h);
}

/* ---------------- weather ---------------- */
const WX={
 clear:  {icon:'sun',   nIcon:'moon', desc:'Clear',        cloud:0.06,fogK:1.0, speed:1.0, cong:0,  rain:0,  storm:false,tempD:0},
 partly: {icon:'partly',nIcon:'moonCloud',desc:'Partly cloudy',cloud:0.45,fogK:0.95,speed:1.0, cong:0,  rain:0,  storm:false,tempD:-1},
 overcast:{icon:'cloud',nIcon:'cloud',desc:'Overcast',     cloud:0.9, fogK:0.72,speed:0.97,cong:.04,rain:0,  storm:false,tempD:-4},
 fog:    {icon:'fog',   nIcon:'fog',  desc:'Fog',          cloud:0.7, fogK:0.2, speed:0.8, cong:.12,rain:0,  storm:false,tempD:-5},
 rain:   {icon:'rain',  nIcon:'rain', desc:'Rain',         cloud:1.0, fogK:0.45,speed:0.85,cong:.14,rain:0.65,storm:false,tempD:-8},
 storm:  {icon:'storm', nIcon:'storm',desc:'Thunderstorm', cloud:1.0, fogK:0.3, speed:0.72,cong:.22,rain:0.95,storm:true, tempD:-11},
};
/* crisp SVG weather glyphs (no emoji) */
const _sunCore='<circle cx="20" cy="20" r="8" fill="#ffd35c"/><g stroke="#ffd35c" stroke-width="2.6" stroke-linecap="round">'
 +'<path d="M20 4v5M20 31v5M4 20h5M31 20h5M8.7 8.7l3.5 3.5M27.8 27.8l3.3 3.3M8.7 31.3l3.5-3.5M27.8 12.2l3.3-3.3"/></g>';
const _cloudPath='<path d="M13 30a7 7 0 0 1-.6-13.97A9.5 9.5 0 0 1 30.7 18.3 6 6 0 0 1 30 30H13z"';
const ICONS={
 sun:'<svg viewBox="0 0 40 40">'+_sunCore+'</svg>',
 moon:'<svg viewBox="0 0 40 40"><path d="M31 24.5A12.5 12.5 0 0 1 15.5 9 12.7 12.7 0 1 0 31 24.5z" fill="#dfe6f2"/></svg>',
 partly:'<svg viewBox="0 0 40 40"><g transform="translate(-4,-5) scale(.72)">'+_sunCore+'</g>'+_cloudPath+' fill="#e8edf3"/></svg>',
 moonCloud:'<svg viewBox="0 0 40 40"><path d="M33 15.5A8.5 8.5 0 0 1 22.5 5 8.7 8.7 0 1 0 33 15.5z" fill="#dfe6f2" transform="translate(3,-1) scale(.8)"/>'+_cloudPath+' fill="#c7cfd9"/></svg>',
 cloud:'<svg viewBox="0 0 40 40">'+_cloudPath+' fill="#c7cfd9"/><path d="M8 34h24" stroke="#9aa5b1" stroke-width="2.4" stroke-linecap="round"/></svg>',
 fog:'<svg viewBox="0 0 40 40">'+_cloudPath+' fill="#b8c2cc" transform="translate(0,-6) scale(.9)"/><g stroke="#93a0ad" stroke-width="2.6" stroke-linecap="round"><path d="M7 29h26M10 34h20"/></g></svg>',
 rain:'<svg viewBox="0 0 40 40">'+_cloudPath+' fill="#b9c3ce" transform="translate(0,-6) scale(.9)"/><g stroke="#5aa7e8" stroke-width="2.6" stroke-linecap="round"><path d="M13 29l-2 6M21 29l-2 6M29 29l-2 6"/></g></svg>',
 storm:'<svg viewBox="0 0 40 40">'+_cloudPath+' fill="#a8b2be" transform="translate(0,-6) scale(.9)"/><path d="M22 26l-6 8h5l-2 6 7-9h-5l3-5z" fill="#ffd35c"/></svg>',
};
let wxMode='auto',wxCur='clear',wxDesc='Clear',wxBlend={...WX.clear},wxNextRoll=-1;

/* live weather via Open-Meteo (works when the file is opened in a browser;
   falls back to a simulated typical Gulf-Coast pattern if blocked/offline) */
let liveWx=null; /* metro-core/downtown forecast — hourly for time-lapse + fallback */
let localWx=null; /* user suburb / locate-me weather (shown alongside metro) */
let zoneWx=null; /* camera-local suburb weather from zonal sample */
window.WX_ZONES=[]; /* suburb / district Open-Meteo samples */
const HOU_WX_LAT=(window.HTS_CITY&&window.HTS_CITY.origin&&window.HTS_CITY.origin.lat)||29.7604;
const HOU_WX_LNG=(window.HTS_CITY&&window.HTS_CITY.origin&&window.HTS_CITY.origin.lng)||-95.3698;
const WMO_MAP=[
  [[0],'clear','Clear',0],[[1],'partly','Mostly clear',0],[[2],'partly','Partly cloudy',0],
  [[3],'overcast','Overcast',0],[[45,48],'fog','Fog',0],
  [[51,53,56],'rain','Light drizzle',0.18],[[55,57],'rain','Drizzle',0.32],
  [[61,80],'rain','Light rain',0.42],[[63,81],'rain','Rain',0.68],
  [[65,66,67,82],'rain','Heavy rain',0.95],
  [[71,73,75,77,85,86],'overcast','Wintry mix',0.22],
  [[95],'storm','Thunderstorm',0.88],[[96,99],'storm','Severe thunderstorm',1.0],
];
function wmoLookup(code){
  for(const [codes,preset,label,rain] of WMO_MAP)
    if(codes.includes(code))return {preset,label,rain};
  return {preset:'partly',label:'Partly cloudy',rain:0};
}
function isLocalDevHost(){
  const h=location.hostname;
  return h==='localhost'||h==='127.0.0.1'||h==='::1'||h.endsWith('.local');
}
/* Open-Meteo supports browser CORS. Prefer direct URL on Netlify/Vercel so weather
   does not depend on host proxy rewrites (which often break query strings). */
function openMeteoHost(){
  /* Same-origin proxy everywhere we have one (Vite / Netlify / Vercel); direct only as last resort */
  try{
    if(/^https?:$/i.test(location.protocol)&&location.hostname)return '/api/openmeteo';
  }catch(e){}
  return 'https://api.open-meteo.com';
}
function nominatimHost(){
  /* Nominatim blocks browser CORS — always use the same-origin proxy when possible */
  try{
    if(/^https?:$/i.test(location.protocol)&&location.hostname)return '/api/nominatim';
  }catch(e){}
  return 'https://nominatim.openstreetmap.org';
}
function nwsApiHost(){
  try{
    if(/^https?:$/i.test(location.protocol)&&location.hostname)return '/api/nws';
  }catch(e){}
  return 'https://api.weather.gov';
}
const NWS_UA='HoustonTrafficSimulator/1.0 (edu; github.com/EJ-365/ModernReact)';
function nwsHeaders(){
  return {Accept:'application/geo+json,application/ld+json,application/json',
    'User-Agent':NWS_UA};
}
function nwsQty(obj){
  if(obj==null)return null;
  if(typeof obj==='number'&&isFinite(obj))return obj;
  if(typeof obj==='object'&&obj.value!=null&&isFinite(+obj.value))return +obj.value;
  return null;
}
function nwsTempF(obj){
  const v=nwsQty(obj);if(v==null)return null;
  const u=String((obj&&obj.unitCode)||'wmoUnit:degC');
  if(/degF|fahrenheit/i.test(u))return v;
  return v*9/5+32; /* NWS obs are usually °C */
}
function nwsWindMph(obj){
  const v=nwsQty(obj);if(v==null)return null;
  const u=String((obj&&obj.unitCode)||'');
  if(/mi_h|mph/i.test(u))return v;
  if(/m_s-1|m\/s/i.test(u))return v*2.23694;
  if(/km_h|km\/h/i.test(u))return v*0.621371;
  return v*0.621371; /* default km/h */
}
function nwsPressInHg(obj){
  const v=nwsQty(obj);if(v==null)return null;
  const u=String((obj&&obj.unitCode)||'');
  if(/inHg|inch_of_mercury/i.test(u))return v;
  if(/Pa\b|pascal/i.test(u))return v*0.0002953;
  if(/hPa|mbar/i.test(u))return v*0.02953;
  return v*0.0002953;
}
function nwsVisMi(obj){
  const v=nwsQty(obj);if(v==null)return null;
  const u=String((obj&&obj.unitCode)||'');
  if(/mi\b|mile/i.test(u))return v;
  return v/1609.34; /* meters */
}
function nwsTextToPreset(text){
  const t=String(text||'').toLowerCase();
  if(/thunder|tstm|lightning/.test(t))return {preset:'storm',label:text||'Thunderstorm',rain:0.88};
  if(/heavy rain|downpour|torrential/.test(t))return {preset:'rain',label:text||'Heavy rain',rain:0.95};
  if(/light rain|sprinkle/.test(t))return {preset:'rain',label:text||'Light rain',rain:0.4};
  if(/drizzle/.test(t))return {preset:'rain',label:text||'Drizzle',rain:0.25};
  if(/rain|shower/.test(t))return {preset:'rain',label:text||'Rain',rain:0.65};
  if(/fog|mist|haze/.test(t))return {preset:'fog',label:text||'Fog',rain:0};
  if(/overcast|cloudy/.test(t)&&!/partly|mostly clear|fair/.test(t))return {preset:'overcast',label:text||'Overcast',rain:0};
  if(/partly|mostly cloudy|broken/.test(t))return {preset:'partly',label:text||'Partly cloudy',rain:0};
  if(/clear|fair|sunny/.test(t))return {preset:'clear',label:text||'Clear',rain:0};
  return {preset:'partly',label:text||'Partly cloudy',rain:0};
}
/** Nearest NWS METAR-style observation for a US lat/lng. Null outside US / on failure. */
async function fetchNwsLocalObservation(lat,lng){
  if(!isFinite(lat)||!isFinite(lng))return null;
  /* CONUS + AK/HI rough bounds — NWS stations aren't global */
  if(lat<18||lat>72||lng<-180||lng>-65)return null;
  const host=nwsApiHost();
  const hdr=nwsHeaders();
  try{
    const pts=await fetchWithTimeout(
      host+'/points/'+Number(lat).toFixed(4)+','+Number(lng).toFixed(4),
      {headers:hdr,cache:'no-store'},8000);
    if(!pts.ok)throw new Error('points '+pts.status);
    const pj=await pts.json();
    const stUrl=pj&&pj.properties&&pj.properties.observationStations;
    if(!stUrl)return null;
    const stPath=String(stUrl).replace(/^https?:\/\/api\.weather\.gov/i,'');
    const stRes=await fetchWithTimeout(host+stPath,{headers:hdr,cache:'no-store'},8000);
    if(!stRes.ok)throw new Error('stations '+stRes.status);
    const sj=await stRes.json();
    const feats=(sj&&sj.features)||[];
    for(let i=0;i<Math.min(feats.length,6);i++){
      const f=feats[i];
      const sid=(f.properties&&(f.properties.stationIdentifier||f.properties.stationId))
        ||(f.id&&String(f.id).split('/').pop());
      const sname=(f.properties&&f.properties.name)||sid;
      if(!sid)continue;
      const obsRes=await fetchWithTimeout(
        host+'/stations/'+encodeURIComponent(sid)+'/observations/latest',
        {headers:hdr,cache:'no-store'},8000);
      if(!obsRes.ok)continue;
      const oj=await obsRes.json();
      const p=oj&&oj.properties;if(!p)continue;
      const temp=nwsTempF(p.temperature);
      if(temp==null||!isFinite(temp))continue; /* skip null-temp stations */
      const feelsRaw=(()=>{
        const hi=nwsTempF(p.heatIndex);if(hi!=null)return hi;
        const wc=nwsTempF(p.windChill);if(wc!=null)return wc;
        return null;
      })();
      const dew=nwsTempF(p.dewpoint);
      const hum=nwsQty(p.relativeHumidity);
      const wind=nwsWindMph(p.windSpeed);
      const windDir=nwsQty(p.windDirection);
      const press=nwsPressInHg(p.seaLevelPressure||p.barometricPressure);
      const vis=nwsVisMi(p.visibility);
      const mapped=nwsTextToPreset(p.textDescription||'');
      let stationMi=null;
      try{
        const g=f.geometry&&f.geometry.coordinates;
        if(g&&g.length>=2)stationMi=+miBetween(lat,lng,g[1],g[0]).toFixed(1);
      }catch(e){}
      return {
        src:'nws',temp:Math.round(temp),
        feels:Math.round(feelsRaw!=null?feelsRaw:temp),
        hum:hum!=null?Math.round(hum):null,
        wind:wind!=null?Math.round(wind):null,
        windDir:windDir!=null?windDir:null,
        dew:dew!=null?Math.round(dew):null,
        press:press!=null?press.toFixed(2):null,
        vis:vis!=null?Math.round(vis):null,
        precip:0,
        cloud:mapped.preset==='overcast'?0.9:(mapped.preset==='partly'?0.45:0.1),
        preset:mapped.preset,label:mapped.label,rainAmt:mapped.rain,
        stationId:sid,stationName:sname,stationMi,
        at:Date.now(),
      };
    }
  }catch(e){
    console.warn('[HTS] NWS obs',e&&e.message?e.message:e);
  }
  return null;
}
function openMeteoUrl(lat,lng,hourly){
  /* 5–6 decimal places ≈ neighborhood / street precision for Open-Meteo grid */
  const la=Number(lat).toFixed(5),lo=Number(lng).toFixed(5);
  const tz=encodeURIComponent((window.HTS_CITY&&window.HTS_CITY.feeds&&window.HTS_CITY.feeds.timezone)||'America/Chicago');
  return openMeteoHost()+'/v1/forecast?latitude='+la+'&longitude='+lo
    +'&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,'
    +'weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,dew_point_2m,pressure_msl,uv_index,visibility'
    +(hourly?'&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,pressure_msl,uv_index,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,precipitation':'')
    +'&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max'
    +'&forecast_days=3'
    +'&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone='+tz;
}
/* GPS “Your location” — no past_minutes lag, auto timezone, best_match model (closer to consumer apps). */
function openMeteoLocalUrl(lat,lng){
  const la=Number(lat).toFixed(5),lo=Number(lng).toFixed(5);
  return openMeteoHost()+'/v1/forecast?latitude='+la+'&longitude='+lo
    +'&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,'
    +'weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,dew_point_2m,pressure_msl,uv_index,visibility'
    +'&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max'
    +'&forecast_days=3'
    +'&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch'
    +'&timezone=auto&models=best_match';
}
function parseDailyForecast(j){
  const d=j&&j.daily;
  if(!d||!d.time||!d.time.length)return null;
  const out=[];
  for(let i=0;i<d.time.length;i++){
    const m=wmoLookup(d.weather_code?d.weather_code[i]:2);
    out.push({
      date:d.time[i],
      hi:Math.round(d.temperature_2m_max[i]),
      lo:Math.round(d.temperature_2m_min[i]),
      precip:(d.precipitation_sum&&d.precipitation_sum[i]!=null)?d.precipitation_sum[i]:0,
      pop:(d.precipitation_probability_max&&d.precipitation_probability_max[i]!=null)?Math.round(d.precipitation_probability_max[i]):null,
      preset:m.preset,label:m.label,
    });
  }
  return out;
}
function parseOpenMeteo(j,extra){
  const c=j.current;const m=wmoLookup(c.weather_code);
  const precip=c.precipitation!=null?c.precipitation:0;
  /* Keep WMO intensity — do not floor light drizzle up to “medium” */
  let rainAmt=m.rain;
  if(rainAmt<=0&&precip>0.02)rainAmt=clamp(precip*5,0.12,0.55);
  if(precip>=0.15)rainAmt=Math.max(rainAmt,0.7);
  if(precip>=0.35)rainAmt=Math.max(rainAmt,0.9);
  return {temp:Math.round(c.temperature_2m),feels:Math.round(c.apparent_temperature),
    hum:Math.round(c.relative_humidity_2m),wind:Math.round(c.wind_speed_10m),
    windDir:c.wind_direction_10m,precip,cloud:c.cloud_cover/100,
    dew:Math.round(c.dew_point_2m),press:(c.pressure_msl*0.02953).toFixed(2),
    uv:Math.round(c.uv_index),vis:Math.round((c.visibility||24000)/1609),
    preset:m.preset,label:m.label,rainAmt,at:Date.now(),
    hourly:j.hourly||null,daily:parseDailyForecast(j),...(extra||{})};
}
function forecastDayLabel(isoDate,idx){
  const tz=(window.HTS_CITY&&window.HTS_CITY.feeds&&window.HTS_CITY.feeds.timezone)||'America/Chicago';
  if(idx===0)return 'Today';
  if(idx===1)return 'Tomorrow';
  try{
    const parts=String(isoDate).split('-');
    const d=new Date(Date.UTC(+parts[0],+parts[1]-1,+parts[2],18,0,0));
    return d.toLocaleDateString('en-US',{weekday:'short',timeZone:tz});
  }catch(e){return 'Day '+(idx+1);}
}
function renderWxForecast(pack){
  const el=$('wxForecast');
  if(!el)return;
  const days=(pack&&pack.daily)||(liveWx&&liveWx.daily)||null;
  if(!days||!days.length){el.style.display='none';el.innerHTML='';return;}
  el.style.display='grid';
  el.innerHTML=days.slice(0,3).map((day,i)=>{
    const icon=ICONS[WX[day.preset]?WX[day.preset].icon:'partly']||ICONS.partly;
    const pop=day.pop!=null?day.pop+'% chance':'';
    const rain=day.precip>0.01?(day.precip.toFixed(2)+'"'):'';
    const meta=[pop,rain].filter(Boolean).join(' · ')||day.label;
    return '<div class="wxDay">'
      +'<div class="wdLab">'+forecastDayLabel(day.date,i)+'</div>'
      +'<div class="wdIcon">'+icon+'</div>'
      +'<div class="wdTemp"><b>'+day.hi+'°</b><span>'+day.lo+'°</span></div>'
      +'<div class="wdMeta">'+meta+'</div>'
      +'</div>';
  }).join('');
}
/* Known Houston-metro neighborhoods (fallback when reverse-geocode is slow/offline) */
const HOU_NEIGHBORHOODS=[
  /* Sugar Land / Fort Bend — denser points for precise suburb labels */
  {n:'Pheasant Creek',c:'Sugar Land',lat:29.6431,lng:-95.6590},
  {n:'Village of Oak Lakes',c:'Sugar Land',lat:29.6445,lng:-95.6515},
  {n:'Summerfield',c:'Sugar Land',lat:29.6495,lng:-95.6640},
  {n:'Sugar Creek',c:'Sugar Land',lat:29.6225,lng:-95.6085},
  {n:'First Colony',c:'Sugar Land',lat:29.5890,lng:-95.6280},
  {n:'Town Center',c:'Sugar Land',lat:29.5965,lng:-95.6235},
  {n:'New Territory',c:'Sugar Land',lat:29.5900,lng:-95.6800},
  {n:'Greatwood',c:'Sugar Land',lat:29.5500,lng:-95.6750},
  {n:'Telfair',c:'Sugar Land',lat:29.5800,lng:-95.6500},
  {n:'Imperial',c:'Sugar Land',lat:29.6000,lng:-95.6000},
  {n:'Riverstone',c:'Sugar Land',lat:29.5400,lng:-95.5700},
  {n:'Lake Pointe',c:'Sugar Land',lat:29.5750,lng:-95.6050},
  {n:'Avalon',c:'Sugar Land',lat:29.5650,lng:-95.6350},
  {n:'Commonwealth',c:'Sugar Land',lat:29.6050,lng:-95.6450},
  {n:'Settlers Park',c:'Sugar Land',lat:29.6150,lng:-95.6350},
  {n:'Sugar Land Proper',c:'Sugar Land',lat:29.6197,lng:-95.6349},
  {n:'Mission Bend',c:'Houston',lat:29.6938,lng:-95.6669},
  {n:'Four Corners',c:'Fort Bend',lat:29.6680,lng:-95.6600},
  {n:'Pecan Grove',c:'Richmond',lat:29.6260,lng:-95.7310},
  {n:'Cinco Ranch',c:'Katy',lat:29.7400,lng:-95.7800},
  {n:'Firethorne',c:'Katy',lat:29.7200,lng:-95.8500},
  {n:'Cross Creek Ranch',c:'Fulshear',lat:29.7000,lng:-95.8700},
  {n:'Energy Corridor',c:'Houston',lat:29.7800,lng:-95.6300},
  {n:'Memorial',c:'Houston',lat:29.7700,lng:-95.5200},
  {n:'River Oaks',c:'Houston',lat:29.7500,lng:-95.4200},
  {n:'Montrose',c:'Houston',lat:29.7450,lng:-95.3900},
  {n:'Midtown',c:'Houston',lat:29.7400,lng:-95.3750},
  {n:'Downtown',c:'Houston',lat:29.7604,lng:-95.3698},
  {n:'The Heights',c:'Houston',lat:29.8000,lng:-95.4000},
  {n:'Galleria',c:'Houston',lat:29.7400,lng:-95.4600},
  {n:'West University',c:'Houston',lat:29.7160,lng:-95.4340},
  {n:'Bellaire',c:'Bellaire',lat:29.7050,lng:-95.4600},
  {n:'Meyerland',c:'Houston',lat:29.6850,lng:-95.4650},
  {n:'Braeswood',c:'Houston',lat:29.7000,lng:-95.4400},
  {n:'Missouri City',c:'Missouri City',lat:29.6180,lng:-95.5370},
  {n:'Sienna',c:'Missouri City',lat:29.5200,lng:-95.5200},
  {n:'Pearland',c:'Pearland',lat:29.5630,lng:-95.2860},
  {n:'Shadow Creek Ranch',c:'Pearland',lat:29.5400,lng:-95.3200},
  {n:'Friendswood',c:'Friendswood',lat:29.5290,lng:-95.2010},
  {n:'Clear Lake',c:'Houston',lat:29.5600,lng:-95.1000},
  {n:'League City',c:'League City',lat:29.5070,lng:-95.0950},
  {n:'Pasadena',c:'Pasadena',lat:29.6910,lng:-95.2090},
  {n:'Baytown',c:'Baytown',lat:29.7350,lng:-94.9770},
  {n:'Katy',c:'Katy',lat:29.7850,lng:-95.8240},
  {n:'Cypress',c:'Cypress',lat:29.9690,lng:-95.6970},
  {n:'Tomball',c:'Tomball',lat:30.0970,lng:-95.6160},
  {n:'The Woodlands',c:'The Woodlands',lat:30.1650,lng:-95.4610},
  {n:'Spring',c:'Spring',lat:30.0800,lng:-95.4170},
  {n:'Humble',c:'Humble',lat:29.9980,lng:-95.2620},
  {n:'Kingwood',c:'Houston',lat:30.0500,lng:-95.2000},
  {n:'Atascocita',c:'Humble',lat:29.9980,lng:-95.1760},
  {n:'Stafford',c:'Stafford',lat:29.6160,lng:-95.5580},
  {n:'Rosenberg',c:'Rosenberg',lat:29.5570,lng:-95.8080},
  {n:'Richmond',c:'Richmond',lat:29.5820,lng:-95.7610},
  {n:'Fulshear',c:'Fulshear',lat:29.6900,lng:-95.9000},
  {n:'Alief',c:'Houston',lat:29.7100,lng:-95.5900},
  {n:'Sharpstown',c:'Houston',lat:29.7000,lng:-95.5200},
  {n:'Chinatown',c:'Houston',lat:29.7000,lng:-95.5600},
  {n:'Copperfield',c:'Houston',lat:29.8900,lng:-95.6400},
  {n:'Jersey Village',c:'Jersey Village',lat:29.8900,lng:-95.5630},
  {n:'Deer Park',c:'Deer Park',lat:29.7050,lng:-95.1230},
  {n:'La Porte',c:'La Porte',lat:29.6660,lng:-95.0190},
  {n:'Seabrook',c:'Seabrook',lat:29.5640,lng:-95.0250},
  {n:'Kemah',c:'Kemah',lat:29.5420,lng:-95.0200},
  {n:'Galveston',c:'Galveston',lat:29.3010,lng:-94.7980},
  {n:'Galena Park',c:'Galena Park',lat:29.7340,lng:-95.2380},
  {n:'South Houston',c:'South Houston',lat:29.6610,lng:-95.2360},
  {n:'Jacinto City',c:'Jacinto City',lat:29.7670,lng:-95.2340},
  {n:'Angleton',c:'Angleton',lat:29.1690,lng:-95.4320},
  {n:'La Marque',c:'La Marque',lat:29.3690,lng:-95.0500},
  {n:'Santa Fe',c:'Santa Fe',lat:29.3780,lng:-95.1050},
  {n:'Hitchcock',c:'Hitchcock',lat:29.3480,lng:-95.0190},
  {n:'Freeport',c:'Freeport',lat:28.9540,lng:-95.3590},
  {n:'Dayton',c:'Dayton',lat:30.0470,lng:-94.8850},
  {n:'Liberty',c:'Liberty',lat:30.0580,lng:-94.7960},
  {n:'Cleveland',c:'Cleveland',lat:30.3410,lng:-95.0850},
  {n:'Brookshire',c:'Brookshire',lat:29.7860,lng:-95.9510},
  {n:'Waller',c:'Waller',lat:30.0580,lng:-95.9270},
  {n:'Splendora',c:'Splendora',lat:30.2320,lng:-95.1610},
  {n:'Rosharon',c:'Rosharon',lat:29.3520,lng:-95.4620},
  {n:'Anahuac',c:'Anahuac',lat:29.7730,lng:-94.6830},
  {n:'Webster',c:'Webster',lat:29.5380,lng:-95.1190},
  {n:'Huntsville',c:'Huntsville',lat:30.7230,lng:-95.5510},
  {n:'Sealy',c:'Sealy',lat:29.7810,lng:-96.1570},
  {n:'Hempstead',c:'Hempstead',lat:30.0970,lng:-96.0780},
  {n:'Brenham',c:'Brenham',lat:30.1670,lng:-96.3990},
  {n:'Lake Conroe',c:'Conroe',lat:30.3500,lng:-95.5500},
  {n:'Sienna Plantation',c:'Missouri City',lat:29.5200,lng:-95.5200},
  {n:'Bridgeland',c:'Cypress',lat:29.9200,lng:-95.7200},
  {n:'Elyson',c:'Katy',lat:29.8200,lng:-95.8200},
];
function miBetween(lat1,lng1,lat2,lng2){
  const dLat=(lat1-lat2)*69,dLng=(lng1-lng2)*59.9*Math.cos(((lat1+lat2)/2)*Math.PI/180);
  return Math.hypot(dLat,dLng);
}
function nearestNeighborhood(lat,lng,maxMi){
  /* Dense Houston-only subdivision DB — never use for pack metros */
  if(!HTS_IS_HOU)return null;
  let best=null,bd=1e9;
  for(const p of HOU_NEIGHBORHOODS){
    const d=miBetween(lat,lng,p.lat,p.lng);
    if(d<bd){bd=d;best=p;}
  }
  if(!best||bd>(maxMi!=null?maxMi:3.2))return null;
  return {place:best,mi:bd};
}
/** Nearest researched district for the active city (Austin Round Rock, NYC Midtown, …). */
function nearestDistrictByGeo(lat,lng,maxMi){
  if(lat==null||lng==null||!DISTRICTS||!DISTRICTS.length)return null;
  let best=null,bd=1e9;
  for(const d of DISTRICTS){
    if(d.lat==null||d.lng==null||!isFinite(d.lat)||!isFinite(d.lng))continue;
    const mi=miBetween(lat,lng,d.lat,d.lng);
    if(mi<bd){bd=mi;best=d;}
  }
  if(!best||bd>(maxMi!=null?maxMi:16))return null;
  return {district:best,mi:bd};
}
function cityPlaceCity(){
  return (window.HTS_CITY&&(window.HTS_CITY.name||window.HTS_CITY.metroName))||CITY_NAME||'Near you';
}
function formatPlaceLabel(hood,city){
  const h=String(hood||'').trim(),c=String(city||'').trim();
  if(h&&c&&h.toLowerCase()!==c.toLowerCase())return h+' · '+c;
  return h||c||'Near you';
}
function placeLabelFromDistricts(lat,lng,maxMi){
  const hit=nearestDistrictByGeo(lat,lng,maxMi!=null?maxMi:14);
  if(!hit)return null;
  return formatPlaceLabel(hit.district.n,cityPlaceCity());
}
/* Compass-bucket fallback only if reverse geocode + neighborhood/district DB both miss */
function suburbNameFromGeo(lat,lng){
  if(lat==null||lng==null)return 'Near you';
  const byDistrict=placeLabelFromDistricts(lat,lng,18);
  if(byDistrict)return byDistrict;
  if(HTS_IS_HOU){
    const near=nearestNeighborhood(lat,lng,6);
    if(near)return formatPlaceLabel(near.place.n,near.place.c);
    const dLat=lat-HOU_WX_LAT,dLng=lng-HOU_WX_LNG;
    const mi=Math.sqrt(dLat*dLat+dLng*dLng)*69;
    if(mi<4)return 'Near downtown';
    const ang=Math.atan2(dLng,dLat)*180/Math.PI;
    const a=((ang%360)+360)%360;
    if(a>=337.5||a<22.5)return mi<18?'Northside':'The Woodlands area';
    if(a<67.5)return mi<20?'Northeast':'Humble / Kingwood area';
    if(a<112.5)return mi<18?'Eastside':'Baytown area';
    if(a<157.5)return mi<22?'Southeast':'Clear Lake / Pearland area';
    if(a<202.5)return mi<18?'Southside':'Pearland / Friendswood area';
    if(a<247.5)return mi<20?'Southwest':'Sugar Land / Missouri City area';
    if(a<292.5)return mi<18?'Westside':'Katy / Energy Corridor area';
    return mi<20?'Northwest':'Cypress / Tomball area';
  }
  const mi=miBetween(lat,lng,HOU_WX_LAT,HOU_WX_LNG);
  if(mi<3.5)return 'Near '+cityPlaceCity()+' downtown';
  return cityPlaceCity()+' area';
}
function enhanceGpsPlaceLabel(label,lat,lng){
  const city=cityPlaceCity();
  const generic=new RegExp('^('+[
    'houston','austin','dallas','san antonio','boston','los angeles','new york',
    'chicago','miami','seattle','denver','atlanta',
    'fort worth','texas','california','massachusetts','illinois','florida','washington','colorado','georgia',
    'new york city','nyc','near you','united states','usa',
  ].map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')$', 'i');
  const dist=placeLabelFromDistricts(lat,lng,4.5);
  if(!label||generic.test(String(label).trim())||String(label).trim().toLowerCase()===city.toLowerCase())
    return dist||label||(city+' area');
  /* Nominatim returned only the city — prefer district when you're in it */
  if(dist&&!String(label).includes('·')&&generic.test(String(label).split('·')[0].trim()))
    return dist;
  return label;
}
let _placeCache={lat:null,lng:null,name:null,at:0};
function pickNominatimPlace(j){
  if(!j||!j.address)return null;
  const a=j.address;
  const hood=a.neighbourhood||a.suburb||a.residential||a.quarter||a.hamlet||a.village
    ||a.city_district||a.borough||a.industrial||a.retail||null;
  const city=a.city||a.town||a.municipality||a.village||a.county||null;
  const road=a.road||a.pedestrian||a.footway||null;
  /* Named OSM place (subdivision / HOA) often more precise than city alone */
  const named=(j.name&&!/^\d/.test(j.name)&&j.name.length<48)?j.name:null;
  let label=null;
  if(hood&&city)label=formatPlaceLabel(hood,city);
  else if(named&&city&&named.toLowerCase()!==String(city).toLowerCase())label=formatPlaceLabel(named,city);
  else if(hood)label=hood;
  else if(named)label=named;
  else if(road&&city)label=formatPlaceLabel(road,city);
  else if(city)label=city;
  return {hood,city,road,named,display:label};
}
async function reverseGeocodePlace(lat,lng){
  if(!Number.isFinite(lat)||!Number.isFinite(lng))return 'Near you';
  /* cache ~0.35 mi / 20 min — tighter so suburb moves update the label */
  if(_placeCache.name&&_placeCache.lat!=null){
    if(miBetween(lat,lng,_placeCache.lat,_placeCache.lng)<0.35&&(Date.now()-_placeCache.at)<20*60*1000)
      return _placeCache.name;
  }
  const distHit=nearestDistrictByGeo(lat,lng,2.2);
  let localName=distHit?formatPlaceLabel(distHit.district.n,cityPlaceCity()):null;
  let houHood=null;
  /* Houston: dense subdivision DB can beat district centroids inside the loop */
  if(HTS_IS_HOU){
    houHood=nearestNeighborhood(lat,lng,1.6);
    if(houHood)localName=formatPlaceLabel(houHood.place.n,houHood.place.c);
    if(localName&&houHood&&houHood.mi<=0.9){
      _placeCache={lat,lng,name:localName,at:Date.now()};
      return localName;
    }
  }else if(localName&&distHit&&distHit.mi<=1.1){
    _placeCache={lat,lng,name:localName,at:Date.now()};
    return localName;
  }
  try{
    const url=nominatimHost()+'/reverse?format=jsonv2&lat='+encodeURIComponent(lat)
      +'&lon='+encodeURIComponent(lng)+'&zoom=18&addressdetails=1';
    const r=await fetch(url,{cache:'no-store',headers:{Accept:'application/json'}});
    if(r.ok){
      const j=await r.json();
      const picked=pickNominatimPlace(j);
      if(picked&&picked.display){
        const hood=picked.hood||picked.named||'';
        const hoodWeak=!hood||/^(sugar land|houston|katy|missouri city|fort bend|fort bend county|harris county|texas|austin|travis county|williamson county|dallas|tarrant county|boston|suffolk county|los angeles|new york|manhattan|san antonio|bexar county|chicago|cook county|miami|miami-dade|miami beach|california|massachusetts|illinois|florida)$/i.test(hood);
        if(localName&&(hoodWeak||(distHit&&distHit.mi<1.6)||(houHood&&houHood.mi<1.25))){
          _placeCache={lat,lng,name:localName,at:Date.now()};
          return localName;
        }
        const name=enhanceGpsPlaceLabel(picked.display,lat,lng);
        _placeCache={lat,lng,name,at:Date.now()};
        return name;
      }
      if(localName){_placeCache={lat,lng,name:localName,at:Date.now()};return localName;}
    }
  }catch(e){ /* proxy/network — fall through */ }
  if(localName){_placeCache={lat,lng,name:localName,at:Date.now()};return localName;}
  if(HTS_IS_HOU){
    const soft=nearestNeighborhood(lat,lng,4);
    if(soft){const name=formatPlaceLabel(soft.place.n,soft.place.c);_placeCache={lat,lng,name,at:Date.now()};return name;}
  }
  const softD=placeLabelFromDistricts(lat,lng,12);
  if(softD){_placeCache={lat,lng,name:softD,at:Date.now()};return softD;}
  const fallback=suburbNameFromGeo(lat,lng);
  _placeCache={lat,lng,name:fallback,at:Date.now()};
  return fallback;
}
async function fetchWeather(){
  try{
    const place=(HTS_PACK&&HTS_PACK.wxPlace)||(CITY_NAME+' · Downtown');
    const r=await fetchWithTimeout(openMeteoUrl(HOU_WX_LAT,HOU_WX_LNG,true),{cache:'no-store'},10000);
    if(!r.ok)throw new Error(r.status);
    liveWx=parseOpenMeteo(await r.json(),{place,lat:HOU_WX_LAT,lng:HOU_WX_LNG});
  }catch(e){ liveWx=null; }
}
function ensureWeatherZones(){
  if(window.WX_ZONES&&window.WX_ZONES.length)return window.WX_ZONES;
  const originW=geoToWorld(HOU_WX_LAT,HOU_WX_LNG);
  window.WX_ZONES=buildWeatherZones(DISTRICTS,{
    lat:HOU_WX_LAT,lng:HOU_WX_LNG,x:originW.x,z:originW.z,
    name:CITY_NAME,unitsPerMile:UNITS_PER_MILE,
    allSuburbs:true,
    worldToGeo,
  });
  return window.WX_ZONES;
}
function parseZonalWeatherRows(j){
  let rows=[];
  if(Array.isArray(j))rows=j;
  else if(j&&Array.isArray(j.location))rows=j.location;
  else if(j&&Array.isArray(j.current)){
    rows=j.current.map((c,i)=>({
      current:{
        temperature_2m:Array.isArray(j.current.temperature_2m)?j.current.temperature_2m[i]:c.temperature_2m,
        apparent_temperature:Array.isArray(j.current.apparent_temperature)?j.current.apparent_temperature[i]:c.apparent_temperature,
        relative_humidity_2m:Array.isArray(j.current.relative_humidity_2m)?j.current.relative_humidity_2m[i]:c.relative_humidity_2m,
        precipitation:Array.isArray(j.current.precipitation)?j.current.precipitation[i]:c.precipitation,
        weather_code:Array.isArray(j.current.weather_code)?j.current.weather_code[i]:c.weather_code,
        cloud_cover:Array.isArray(j.current.cloud_cover)?j.current.cloud_cover[i]:c.cloud_cover,
        wind_speed_10m:Array.isArray(j.current.wind_speed_10m)?j.current.wind_speed_10m[i]:c.wind_speed_10m,
        wind_direction_10m:Array.isArray(j.current.wind_direction_10m)?j.current.wind_direction_10m[i]:c.wind_direction_10m,
        dew_point_2m:Array.isArray(j.current.dew_point_2m)?j.current.dew_point_2m[i]:c.dew_point_2m,
        pressure_msl:Array.isArray(j.current.pressure_msl)?j.current.pressure_msl[i]:c.pressure_msl,
        uv_index:Array.isArray(j.current.uv_index)?j.current.uv_index[i]:c.uv_index,
        visibility:Array.isArray(j.current.visibility)?j.current.visibility[i]:c.visibility,
      },
    }));
  }else if(j&&j.current&&Array.isArray(j.latitude)){
    const n=j.latitude.length;
    for(let i=0;i<n;i++){
      const pick=(arr)=>Array.isArray(arr)?arr[i]:arr;
      const c=j.current;
      rows.push({current:{
        temperature_2m:pick(c.temperature_2m),apparent_temperature:pick(c.apparent_temperature),
        relative_humidity_2m:pick(c.relative_humidity_2m),precipitation:pick(c.precipitation),
        weather_code:pick(c.weather_code),cloud_cover:pick(c.cloud_cover),
        wind_speed_10m:pick(c.wind_speed_10m),wind_direction_10m:pick(c.wind_direction_10m),
        dew_point_2m:pick(c.dew_point_2m),pressure_msl:pick(c.pressure_msl),
        uv_index:pick(c.uv_index),visibility:pick(c.visibility),
      }});
    }
  }else if(j&&j.current){
    rows=[j];
  }
  return rows;
}
async function fetchZonalWeather(){
  try{
    const zones=ensureWeatherZones();
    if(!zones.length)return;
    const tz=(window.HTS_CITY&&window.HTS_CITY.feeds&&window.HTS_CITY.feeds.timezone)||'America/Chicago';
    const batches=chunkWeatherZones(zones,40);
    for(let bi=0;bi<batches.length;bi++){
      const batch=batches[bi];
      const url=openMeteoMultiUrl(batch,openMeteoHost(),tz,false);
      const r=await fetchWithTimeout(url,{cache:'no-store'},18000);
      if(!r.ok)throw new Error(r.status+' batch '+bi);
      const rows=parseZonalWeatherRows(await r.json());
      for(let i=0;i<batch.length;i++){
        const row=rows[i]||rows[0];
        if(!row||!row.current)continue;
        batch[i].wx=parseOpenMeteo(row,{place:batch[i].n,lat:batch[i].lat,lng:batch[i].lng});
      }
    }
    /* Keep downtown liveWx in sync with core zone when available */
    const core=zones.find(z=>z.id==='core'||/downtown/i.test(z.n));
    if(core&&core.wx){
      liveWx={...(liveWx||{}),...core.wx,hourly:(liveWx&&liveWx.hourly)||core.wx.hourly||null,daily:(liveWx&&liveWx.daily)||core.wx.daily||null,place:core.wx.place||liveWx&&liveWx.place};
    }
    console.log('%cWeather zones · '+zones.filter(z=>z.wx).length+'/'+zones.length+' suburbs live ('+CITY_NAME+')','color:#7fd6a0');
  }catch(e){
    console.warn('[HTS] zonal weather',e&&e.message?e.message:e);
  }
}
function activeViewWeather(){
  /* Camera / rain mosaic — weather under the lens (never lock to GPS) */
  if(cam&&cam.target&&window.WX_ZONES&&window.WX_ZONES.length){
    const s=sampleZoneWeather(window.WX_ZONES,cam.target.x,cam.target.z);
    if(s){zoneWx=s;return s;}
  }
  zoneWx=null;
  return liveWx;
}
/** Weather card / HUD follows Fly-to goal (snappy) then camera; GPS stays in “Your location”. */
function activeCardWeather(){
  if(!liveMode)return null;
  try{
    if(window._wxFocus&&window._wxFocus.wx){
      const f=window._wxFocus;
      const age=Date.now()-(f.pinAt||0);
      const tx=(camGoal&&camGoal.target)?camGoal.target.x:null;
      const tz=(camGoal&&camGoal.target)?camGoal.target.z:null;
      if(tx!=null&&tz!=null){
        const d=Math.hypot(tx-f.x,tz-f.z);
        const r=Math.max(f.r||400,320);
        if(d<r*1.6||age<2800){
          return {...f.wx,place:f.n,zoneId:f.id,feels:f.wx.feels!=null?f.wx.feels:f.wx.temp};
        }
      }else if(age<2800){
        return {...f.wx,place:f.n,zoneId:f.id,feels:f.wx.feels!=null?f.wx.feels:f.wx.temp};
      }
      if(age>6000)window._wxFocus=null;
    }
  }catch(e){}
  /* Prefer Fly-to target while the camera is still traveling */
  try{
    if(camGoal&&camGoal.target&&window.WX_ZONES&&window.WX_ZONES.length){
      const s=sampleZoneWeather(window.WX_ZONES,camGoal.target.x,camGoal.target.z);
      if(s){
        if(s.temp==null&&liveWx)return {...liveWx,place:s.place||liveWx.place,zoneId:s.zoneId,
          label:'Loading local weather…',pending:s.pending};
        return s;
      }
    }
  }catch(e){}
  const view=activeViewWeather();
  if(view&&view.temp==null&&liveWx)
    return {...liveWx,place:view.place||liveWx.place,zoneId:view.zoneId,
      label:'Loading local weather…',pending:view.pending};
  return view;
}
/** @deprecated GPS is shown in wxLocal — card uses activeCardWeather */
function activeHudWeather(){
  return activeCardWeather();
}
async function fetchLocalWeather(lat,lng,force){
  if(lat==null||lng==null||!isFinite(lat)||!isFinite(lng))return;
  const latR=+Number(lat).toFixed(5),lngR=+Number(lng).toFixed(5);
  /* skip tiny GPS jitter unless forced / stale — ~80 m */
  if(!force&&localWx&&localWx.lat!=null){
    const dMi=miBetween(latR,lngR,localWx.lat,localWx.lng);
    if(dMi<0.05&&(Date.now()-localWx.at)<2*60*1000)return;
  }
  const box=$('wxLocal');
  if(box)box.style.display='block';
  const nmEl=$('wxLocalName');
  const descEl=$('wxLocalDesc');
  const tempEl=$('wxLocalTemp');
  const metaEl=$('wxLocalMeta');
  if(nmEl&&(!localWx||force))nmEl.textContent='Locating…';
  if(!localWx||force){
    if(tempEl)tempEl.textContent='--°';
    if(descEl)descEl.textContent='Loading…';
    if(metaEl)metaEl.textContent='NWS station + Open-Meteo · your GPS · fetching…';
  }
  try{
    /* NWS station obs (US) + Open-Meteo model fill + place label */
    const [wxRes,rawPlace,nwsObs]=await Promise.all([
      fetchWithTimeout(openMeteoLocalUrl(latR,lngR),{cache:'no-store'},10000).catch(()=>null),
      reverseGeocodePlace(latR,lngR),
      fetchNwsLocalObservation(latR,lngR),
    ]);
    const acc=userGeo&&userGeo.acc!=null?userGeo.acc:null;
    let place=enhanceGpsPlaceLabel(rawPlace||'Near you',latR,lngR);
    let j=null;
    if(wxRes&&wxRes.ok){
      try{j=await wxRes.json();}catch(e){j=null;}
    }
    if(j&&j.current&&j.current.temperature_2m!=null){
      localWx=parseOpenMeteo(j,{
        place:place||'Near you',lat:latR,lng:lngR,acc,
        gpsLat:lat,gpsLng:lng,src:'open-meteo',
      });
    }else if(nwsObs&&nwsObs.temp!=null){
      /* NWS-only fallback when Open-Meteo is down */
      localWx={
        temp:nwsObs.temp,feels:nwsObs.feels!=null?nwsObs.feels:nwsObs.temp,
        hum:nwsObs.hum!=null?nwsObs.hum:50,wind:nwsObs.wind!=null?nwsObs.wind:0,
        windDir:nwsObs.windDir!=null?nwsObs.windDir:0,precip:0,
        cloud:nwsObs.cloud!=null?nwsObs.cloud:0.4,
        dew:nwsObs.dew!=null?nwsObs.dew:nwsObs.temp-10,
        press:nwsObs.press!=null?nwsObs.press:'29.92',
        uv:null,vis:nwsObs.vis!=null?nwsObs.vis:10,
        preset:nwsObs.preset||'partly',label:nwsObs.label||'—',rainAmt:nwsObs.rainAmt||0,
        at:Date.now(),hourly:null,daily:null,
        place:place||'Near you',lat:latR,lng:lngR,acc,gpsLat:lat,gpsLng:lng,src:'nws',
      };
    }else{
      throw new Error(wxRes?('open-meteo '+wxRes.status):'no weather');
    }
    /* Prefer official NWS thermometer at nearest METAR when available */
    if(nwsObs&&nwsObs.temp!=null){
      localWx.temp=nwsObs.temp;
      if(nwsObs.feels!=null)localWx.feels=nwsObs.feels;
      if(nwsObs.hum!=null)localWx.hum=nwsObs.hum;
      if(nwsObs.wind!=null)localWx.wind=nwsObs.wind;
      if(nwsObs.windDir!=null)localWx.windDir=nwsObs.windDir;
      if(nwsObs.dew!=null)localWx.dew=nwsObs.dew;
      if(nwsObs.press!=null)localWx.press=nwsObs.press;
      if(nwsObs.vis!=null)localWx.vis=nwsObs.vis;
      if(nwsObs.label)localWx.label=nwsObs.label;
      if(nwsObs.preset){localWx.preset=nwsObs.preset;localWx.rainAmt=nwsObs.rainAmt||0;}
      localWx.src='nws';
      localWx.stationId=nwsObs.stationId;
      localWx.stationName=nwsObs.stationName;
      localWx.stationMi=nwsObs.stationMi;
    }
    /* Prefer pack district label when mosaic zones are live (Round Rock · Austin, …) */
    try{
      const dist=nearestDistrictByGeo(latR,lngR,2.5);
      if(dist&&window.WX_ZONES){
        const z=window.WX_ZONES.find(zz=>zz&&zz.id===dist.district.id&&zz.wx);
        if(z&&z.n)localWx.place=formatPlaceLabel(z.n,cityPlaceCity());
      }else if(dist){
        localWx.place=formatPlaceLabel(dist.district.n,cityPlaceCity());
      }
    }catch(e){}
    if(nmEl)nmEl.textContent=localWx.place;
    const via=localWx.src==='nws'
      ?('NWS '+(localWx.stationId||'')+(localWx.stationMi!=null?(' · '+localWx.stationMi+' mi'):''))
      :'Open-Meteo';
    console.log('%cYour location wx · '+localWx.temp+'°F (feels '+localWx.feels+'°) via '+via+' @ '+latR+', '+lngR+' · '+localWx.place,'color:#7fd6a0');
  }catch(e){
    if(nmEl)nmEl.textContent=(_placeCache.name)||'Near you';
    if(!localWx){
      if(descEl)descEl.textContent='Weather unavailable';
      if(metaEl)metaEl.textContent='NWS / Open-Meteo · retrying…';
      setTimeout(()=>{if(userGeo&&!localWx)fetchLocalWeather(userGeo.lat,userGeo.lng,true);},4000);
    }
  }
}
fetchWeather().then(()=>fetchZonalWeather());
setTimeout(()=>{if(!liveWx)fetchWeather();},12000);
setTimeout(()=>{if(!liveWx)fetchWeather();},35000);
setTimeout(()=>{if(!window.WX_ZONES||!window.WX_ZONES.some(z=>z.wx))fetchZonalWeather();},18000);
setInterval(fetchWeather,3*60*1000); /* downtown hourly pack */
setInterval(fetchZonalWeather,5*60*1000); /* suburb mosaic */
setInterval(()=>{if(userGeo)fetchLocalWeather(userGeo.lat,userGeo.lng,false);},2*60*1000); /* GPS nowcast */
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible')return;
  houstonNow(true);
  syncSimCalendar();
  if(!liveWx||(Date.now()-liveWx.at)>3*60*1000)fetchWeather();
  if(!window.WX_ZONES||!window.WX_ZONES.some(z=>z&&z.wx)||(window.WX_ZONES[0]&&window.WX_ZONES[0].wx&&(Date.now()-window.WX_ZONES[0].wx.at)>5*60*1000))fetchZonalWeather();
  if(userGeo)fetchLocalWeather(userGeo.lat,userGeo.lng,false);
  /* Resume with fresh probes — tab sleep used to leave traffic hours stale */
  try{
    if(typeof _liveTrafficNext!=='undefined')_liveTrafficNext=0;
    if(typeof _liveIncidentNext!=='undefined')_liveIncidentNext=0;
    if(typeof _liveRouteNext!=='undefined')_liveRouteNext=0;
    if(typeof _nwsNext!=='undefined')_nwsNext=0;
    if(typeof _stormNext!=='undefined')_stormNext=0;
    if(typeof refreshLiveTraffic==='function')refreshLiveTraffic();
    if(typeof refreshNWSAlerts==='function')refreshNWSAlerts();
    if(typeof refreshStormTracker==='function')refreshStormTracker(true);
  }catch(e){}
});

function rollWeather(h){
  const r=rand();const afternoon=h>=13&&h<=19;
  if(afternoon){ if(r<.14)return 'storm'; if(r<.3)return 'rain'; if(r<.62)return 'partly'; if(r<.78)return 'overcast'; return 'clear'; }
  if(h<8&&r<.08)return 'fog';
  if(r<.05)return 'rain'; if(r<.4)return 'partly'; if(r<.52)return 'overcast'; return 'clear';
}
function tempFsim(h,wx){const base=88+9*Math.sin((h-9.5)/24*TAU);return Math.round(base+wx.tempD);}
function humiditySim(h){return Math.round(88-26*Math.sin((h-9.5)/24*TAU));}
function windArrow(deg){ /* direction wind blows FROM */
  const dirs=['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(((deg%360)/45))%8];
}

/* ---------- NWS weather alerts popup ---------- */
function escHtml(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function classifyNwsEvent(ev){
  const e=String(ev||'').toLowerCase();
  if(/tornado/.test(e))return {key:'tornado',label:'Tornado'};
  if(/hurricane|tropical storm|tropical depression|storm surge|typhoon/.test(e))return {key:'hurricane',label:'Hurricane / tropical'};
  if(/excessive heat|heat advisory|heat warning|heat/.test(e))return {key:'heat',label:'Heat'};
  if(/blizzard|winter storm|ice storm|heavy snow|lake effect|snow squall|freezing rain|wind chill|hard freeze|freeze|frost|sleet|wintry/.test(e))return {key:'winter',label:'Winter / snow'};
  if(/flash flood|coastal flood|flood|hydrologic/.test(e))return {key:'flood',label:'Flood'};
  if(/severe thunder|thunderstorm|damaging wind|hail/.test(e))return {key:'severe',label:'Severe thunderstorm'};
  if(/red flag|fire weather|wildfire/.test(e))return {key:'fire',label:'Fire weather'};
  if(/dense fog|fog/.test(e))return {key:'fog',label:'Fog'};
  if(/high wind|wind advisory|gale|extreme wind/.test(e))return {key:'wind',label:'High wind'};
  if(/air quality|smoke|dust/.test(e))return {key:'air',label:'Air quality'};
  return {key:'other',label:'Weather alert'};
}
function nwsSeverityRank(sev){
  const s=String(sev||'').toLowerCase();
  if(s==='extreme')return 4;
  if(s==='severe')return 3;
  if(s==='moderate')return 2;
  if(s==='minor')return 1;
  return 0;
}
function fmtNwsUntil(iso){
  if(!iso)return '';
  try{
    const d=new Date(iso);
    if(!isFinite(d.getTime()))return '';
    return d.toLocaleString('en-US',{timeZone:CHI_TZ,weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  }catch(e){return '';}
}
function renderWeatherWarnings(features){
  const box=$('wrWarns'),countEl=$('wrWarnCount');
  if(!box)return;
  const feats=Array.isArray(features)?features.slice():[];
  feats.sort((a,b)=>{
    const pa=a.properties||{},pb=b.properties||{};
    return nwsSeverityRank(pb.severity)-nwsSeverityRank(pa.severity);
  });
  if(countEl){
    if(!(window.LIVE_NWS&&window.LIVE_NWS.ok)&&!feats.length&&window.LIVE_NWS&&window.LIVE_NWS.err)
      countEl.textContent='NWS unreachable';
    else countEl.textContent=feats.length?(feats.length+' active'):'None active';
  }
  if(!feats.length){
    const err=window.LIVE_NWS&&window.LIVE_NWS.err;
    box.innerHTML='<div class="wrWarnEmpty"><b>'+(err?'Could not reach NWS right now.':((HTS_PACK&&HTS_PACK.nws&&HTS_PACK.nws.empty)||('No active NWS warnings for the '+CITY_NAME+' metro.')))+'</b><br>'
      +(err?'Will retry on the next poll. ':'')
      +'We watch for tornado, hurricane/tropical, heat, winter/snow, flood, severe thunderstorm, and fire-weather alerts.'
      +'<div class="wrWatch"><span>Tornado</span><span>Hurricane</span><span>Heat</span><span>Winter</span><span>Flood</span><span>Severe</span><span>Fire</span></div></div>';
    return;
  }
  box.innerHTML=feats.slice(0,8).map(f=>{
    const p=f.properties||{};
    const ev=p.event||'Weather alert';
    const cls=classifyNwsEvent(ev);
    const sev=String(p.severity||'Unknown');
    const urg=String(p.urgency||'');
    const extreme=/extreme|severe/i.test(sev)?' extreme':'';
    const headline=p.headline||ev;
    const area=p.areaDesc?String(p.areaDesc).replace(/\s+/g,' ').slice(0,120):'';
    const desc=p.description?String(p.description).replace(/\s+/g,' ').slice(0,220):'';
    const until=fmtNwsUntil(p.ends||p.expires);
    const instruction=p.instruction?String(p.instruction).replace(/\s+/g,' ').slice(0,160):'';
    return '<div class="wrWarn '+cls.key+extreme+'">'
      +'<div class="tag">'+escHtml(cls.label)+(sev&&sev!=='Unknown'?' · '+escHtml(sev):'')
      +(urg&&urg!=='Unknown'?' · '+escHtml(urg):'')+'</div>'
      +'<div class="ev">'+escHtml(ev)+'</div>'
      +(area?'<div class="area">'+escHtml(area)+(String(p.areaDesc||'').length>120?'…':'')+'</div>':'')
      +'<p class="body"><b>'+escHtml(headline)+'</b>'
      +(desc?' — '+escHtml(desc)+(String(p.description||'').length>220?'…':'') :'')
      +(instruction?'<br><br>'+escHtml(instruction)+(String(p.instruction||'').length>160?'…':'') :'')
      +'</p>'
      +(until?'<div class="until">In effect until '+escHtml(until)+' CT</div>':'')
      +'</div>';
  }).join('');
}
function openWeatherReport(){
  const panel=$('wxReport'),scrim=$('wxReportScrim');
  if(!panel||!scrim)return;
  $('wrSub').textContent=((window.HTS_CITY&&window.HTS_CITY.name)||'Houston')+' metro · NWS · NHC · SPC';
  renderWeatherWarnings((window.LIVE_NWS&&window.LIVE_NWS.features)||[]);
  renderStormTrackerPanel();
  if(typeof refreshStormTracker==='function')refreshStormTracker(true);
  if(typeof refreshNWSAlerts==='function'){
    _nwsNext=0;
    Promise.resolve(refreshNWSAlerts()).then(()=>{
      if(!($('wxReport')&&$('wxReport').classList.contains('on')))return;
      renderWeatherWarnings((window.LIVE_NWS&&window.LIVE_NWS.features)||[]);
      const nwsAge=window.LIVE_NWS&&window.LIVE_NWS.at?Math.max(0,Math.round((Date.now()-window.LIVE_NWS.at)/60000)):null;
      if($('wrFoot'))$('wrFoot').textContent=((HTS_PACK&&HTS_PACK.nws&&HTS_PACK.nws.foot)||('Official NWS alerts for '+AREA_NAME+' counties'))
        +(nwsAge==null?' · fetching…':(nwsAge<=0?' · updated just now':' · updated '+nwsAge+' min ago'));
    }).catch(()=>{});
  }
  const nwsAge=window.LIVE_NWS&&window.LIVE_NWS.at?Math.max(0,Math.round((Date.now()-window.LIVE_NWS.at)/60000)):null;
  $('wrFoot').textContent=((HTS_PACK&&HTS_PACK.nws&&HTS_PACK.nws.foot)||('Official NWS alerts for '+AREA_NAME+' counties'))
    +(nwsAge==null?' · fetching…':(nwsAge<=0?' · updated just now':' · updated '+nwsAge+' min ago'));
  panel.hidden=false;panel.classList.add('on');scrim.classList.add('on');
}
function closeWeatherReport(){
  const panel=$('wxReport'),scrim=$('wxReportScrim');
  if(panel){panel.classList.remove('on');panel.hidden=true;}
  if(scrim)scrim.classList.remove('on');
}
(function wireWeatherReport(){
  const btn=$('wxReportBtn'),scrim=$('wxReportScrim'),close=$('wrClose');
  if(btn)btn.addEventListener('click',()=>{openWeatherReport();});
  if(scrim)scrim.addEventListener('click',closeWeatherReport);
  if(close)close.addEventListener('click',closeWeatherReport);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&$('wxReport')&&$('wxReport').classList.contains('on'))closeWeatherReport();
  });
})();

/* ---------- Live tornado / hurricane tracker (NHC + SPC + NWS) ---------- */
const STORM_POLL_MS=3*60*1000;
let _stormNext=0;
let _stormAlertEls=[];
window.STORM_TRACKER={
  ok:false,at:0,err:'',
  hurricanes:[],nearStorms:[],tornadoOutlook:[],metroRisk:null,alerts:{tornado:[],hurricane:[],all:[]},
  showTornado:false,showHurricane:false,group:null,labels:[],
};
const STORM_LOCAL_HUR_MI=280; /* only treat storms this close as “nearby” for the map layer */
function stormHasLocalTornado(ST){
  ST=ST||window.STORM_TRACKER;
  return !!((ST.alerts&&ST.alerts.tornado&&ST.alerts.tornado.length)||ST.metroRisk);
}
function stormHasLocalHurricane(ST){
  ST=ST||window.STORM_TRACKER;
  return !!((ST.alerts&&ST.alerts.hurricane&&ST.alerts.hurricane.length)
    ||(ST.nearStorms&&ST.nearStorms.length));
}
function syncStormLayerAvailability(){
  const ST=window.STORM_TRACKER;
  const torOn=stormHasLocalTornado(ST);
  const hurOn=stormHasLocalHurricane(ST);
  if(torOn&&!ST._hadLocalTor)ST.showTornado=true;
  if(!torOn)ST.showTornado=false;
  if(hurOn&&!ST._hadLocalHur)ST.showHurricane=true;
  if(!hurOn)ST.showHurricane=false;
  ST._hadLocalTor=torOn;
  ST._hadLocalHur=hurOn;
  const tBtn=$('stormTornadoBtn'),hBtn=$('stormHurricaneBtn'),row=$('stormTrackRow');
  if(tBtn){
    tBtn.style.display=torOn?'':'none';
    tBtn.disabled=!torOn;
    tBtn.title=torOn?'Toggle local tornado / SPC risk overlay':'No tornado watch, warning, or SPC risk over this metro';
  }
  if(hBtn){
    hBtn.style.display=hurOn?'':'none';
    hBtn.disabled=!hurOn;
    hBtn.title=hurOn?'Toggle local tropical storm / hurricane overlay':'No tropical storm or hurricane nearby';
  }
  if(row)row.style.display=(torOn||hurOn)?'flex':'none';
}
function stormTrackerOrigin(){
  if(HTS_PACK&&Number.isFinite(HTS_PACK.originLat)&&Number.isFinite(HTS_PACK.originLng))
    return {lat:HTS_PACK.originLat,lng:HTS_PACK.originLng};
  if(HTS_IS_AUS)return {lat:30.2672,lng:-97.7431};
  return {lat:29.7604,lng:-95.3698};
}
function stormGeoRings(geom){
  if(!geom||!geom.coordinates)return [];
  if(geom.type==='Polygon')return [geom.coordinates[0]];
  if(geom.type==='MultiPolygon'){
    const rings=[];
    for(const poly of geom.coordinates)if(poly&&poly[0])rings.push(poly[0]);
    return rings;
  }
  return [];
}
function stormRingToShape(ring){
  const shape=new THREE.Shape();
  ring.forEach(([lng,lat],i)=>{
    const w=geoToWorld(lat,lng);
    if(i===0)shape.moveTo(w.x,w.z);else shape.lineTo(w.x,w.z);
  });
  return shape;
}
function stormMakePolyMesh(rings,color,op,y){
  if(!rings||!rings.length||typeof THREE==='undefined')return null;
  const shapes=[];
  for(const ring of rings){
    if(!ring||ring.length<3)continue;
    try{shapes.push(stormRingToShape(ring));}catch(e){}
  }
  if(!shapes.length)return null;
  const geom=new THREE.ShapeGeometry(shapes);
  const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:op||0.28,depthWrite:false,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(geom,mat);
  mesh.rotation.x=-Math.PI/2;mesh.position.y=y||10;
  return mesh;
}
function stormMakeLine(rings,color,op,y){
  if(!rings||!rings.length||typeof THREE==='undefined')return null;
  const pts=[];
  const ring=rings[0]||[];
  for(const [lng,lat] of ring){
    const w=geoToWorld(lat,lng);
    pts.push(w.x,y||12,w.z);
  }
  if(pts.length<6)return null;
  const geom=new THREE.BufferGeometry();
  geom.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  const line=new THREE.LineLoop(geom,new THREE.LineBasicMaterial({color,transparent:true,opacity:op||0.85,depthWrite:false}));
  return line;
}
function stormMakeTrackLine(track,color,op,y){
  if(!track||track.length<2||typeof THREE==='undefined')return null;
  const pts=[];
  for(const [lng,lat] of track){
    const w=geoToWorld(lat,lng);
    pts.push(w.x,y||14,w.z);
  }
  const geom=new THREE.BufferGeometry();
  geom.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  return new THREE.Line(geom,new THREE.LineBasicMaterial({color,transparent:true,opacity:op||0.9,depthWrite:false}));
}
function stormGeometryBounds(geom){
  if(!geom||!geom.coordinates)return null;
  let minLat=90,maxLat=-90,minLng=180,maxLng=-180,n=0;
  const walk=v=>{
    if(!Array.isArray(v))return;
    if(v.length>=2&&Number.isFinite(v[0])&&Number.isFinite(v[1])){
      minLng=Math.min(minLng,v[0]);maxLng=Math.max(maxLng,v[0]);
      minLat=Math.min(minLat,v[1]);maxLat=Math.max(maxLat,v[1]);n++;return;
    }
    v.forEach(walk);
  };
  walk(geom.coordinates);
  return n?{lat:(minLat+maxLat)/2,lng:(minLng+maxLng)/2,minLat,maxLat,minLng,maxLng}:null;
}
function flyToStormLocation(lat,lng,geom,meta){
  if(!Number.isFinite(lat)||!Number.isFinite(lng))return;
  stopFollow();
  closePoiCard();
  const org=stormTrackerOrigin();
  const MAX_FLY_MI=95;
  const aim=clampTowardPoint(org.lat,org.lng,lat,lng,MAX_FLY_MI);
  const w=geoToWorld(aim.lat,aim.lng);
  let radius=900;
  if(!aim.clamped){
    const b=stormGeometryBounds(geom);
    if(b){
      const a=geoToWorld(b.minLat,b.minLng),z=geoToWorld(b.maxLat,b.maxLng);
      radius=clamp(Math.hypot(z.x-a.x,z.z-a.z)*1.15,520,4200);
    }
  }else{
    radius=2200;
  }
  camGoal.target.set(w.x,0,w.z);
  camGoal.radius=radius;camGoal.phi=0.94;
  const status=$('stormLayerStatus');
  if(status&&aim.clamped){
    const name=(meta&&meta.name)||'Storm';
    const br=compassFromBearing(bearingDeg(org.lat,org.lng,lat,lng));
    status.textContent=name+' is ~'+Math.round(aim.mi)+' mi '+br+' of this metro — camera stopped at map edge (storm is offshore)';
    status.classList.add('warn');
  }
  closeWeatherReport();
}
function flyToStormAlert(alert){
  const b=stormGeometryBounds(alert&&alert.feature&&alert.feature.geometry);
  if(b)flyToStormLocation(b.lat,b.lng,alert.feature.geometry,{name:(alert.label||'Alert')});
}
function stormTrackerClearMap(){
  const ST=window.STORM_TRACKER;
  if(ST.group){try{scene.remove(ST.group);}catch(e){}ST.group=null;}
  ST.labels=[];
}
function stormTrackerRenderMap(){
  stormTrackerClearMap();
  const ST=window.STORM_TRACKER;
  if(!scene||typeof THREE==='undefined')return;
  const grp=new THREE.Group();
  ST.group=grp;
  const org=stormTrackerOrigin();
  if(ST.showTornado&&stormHasLocalTornado(ST)){
    /* Only shade SPC polygons that actually cover this metro — never national risk elsewhere */
    if(ST.metroRisk&&ST.metroRisk.geometry){
      for(const ring of stormGeoRings(ST.metroRisk.geometry)){
        const fill=stormMakePolyMesh([ring],0xfbbf24,0.18,9);
        const edge=stormMakeLine([ring],0xf59e0b,0.75,10);
        if(fill)grp.add(fill);
        if(edge)grp.add(edge);
      }
      const w=geoToWorld(org.lat,org.lng);
      const tag=warnSprite('watch','SPC '+(ST.metroRisk.label||'')+' risk','metro inside outlook',0.34);
      tag.position.set(w.x,54,w.z);
      grp.add(tag);ST.labels.push(tag);
    }
    for(const a of ST.alerts.tornado||[]){
      const col=a.tier==='warning'?0xef4444:0xf97316;
      for(const ring of stormGeoRings(a.feature&&a.feature.geometry)){
        const fill=stormMakePolyMesh([ring],col,a.tier==='warning'?0.32:0.2,11);
        const edge=stormMakeLine([ring],col,0.95,12);
        if(fill)grp.add(fill);
        if(edge)grp.add(edge);
      }
      const b=stormGeometryBounds(a.feature&&a.feature.geometry);
      if(b){
        const w=geoToWorld(b.lat,b.lng);
        const tag=warnSprite(a.tier==='warning'?'tornado':'severe',a.label||'Tornado alert','local NWS',0.32);
        tag.position.set(w.x,48,w.z);
        grp.add(tag);ST.labels.push(tag);
      }
    }
  }
  if(ST.showHurricane&&stormHasLocalHurricane(ST)){
    const DRAW_FULL_MI=160;
    const list=ST.nearStorms||[];
    for(const s of list){
      if(s.lat==null||s.lng==null)continue;
      const mi=distanceMi(org.lat,org.lng,s.lat,s.lng);
      if(mi>STORM_LOCAL_HUR_MI)continue;
      const br=compassFromBearing(bearingDeg(org.lat,org.lng,s.lat,s.lng));
      const onMap=mi<=DRAW_FULL_MI;
      const aim=onMap
        ?{lat:s.lat,lng:s.lng,mi,clamped:false}
        :clampTowardPoint(org.lat,org.lng,s.lat,s.lng,78);
      const w=geoToWorld(aim.lat,aim.lng);
      const r=Math.max(80,120+(s.cat||0)*55);
      const col=s.cat>=3?0x7c3aed:s.cat>=1?0x6366f1:0x38bdf8;
      if(onMap&&s.cone&&s.cone.length>=3){
        const cone=stormMakePolyMesh([s.cone],0xa78bfa,0.13,11);
        const coneEdge=stormMakeLine([s.cone],0xc4b5fd,0.58,12);
        if(cone)grp.add(cone);
        if(coneEdge)grp.add(coneEdge);
      }
      grp.add(hazMakeDisk(w.x,w.z,onMap?r:r*1.15,col,onMap?0.24:0.32,13));
      grp.add(hazMakeDisk(w.x,w.z,Math.max(40,r*0.35),0xffffff,0.12,14));
      if(onMap){
        const track=stormMakeTrackLine(s.track,0xc4b5fd,0.85,14);
        if(track)grp.add(track);
      }
      const label=onMap?(s.name||'Storm'):((s.name||'Storm')+' · ~'+Math.round(mi)+' mi '+br);
      const sub=onMap?(s.intensity+' mph'):(s.intensity+' mph · nearby');
      const tag=warnSprite('hurricane',label,sub,0.36);
      tag.position.set(w.x,42,w.z);
      grp.add(tag);ST.labels.push(tag);
    }
    for(const a of ST.alerts.hurricane||[]){
      const col=/surge/i.test(a.label)?0x2563eb:0x7c3aed;
      for(const ring of stormGeoRings(a.feature&&a.feature.geometry)){
        const fill=stormMakePolyMesh([ring],col,0.22,10);
        const edge=stormMakeLine([ring],col,0.8,11);
        if(fill)grp.add(fill);
        if(edge)grp.add(edge);
      }
      const b=stormGeometryBounds(a.feature&&a.feature.geometry);
      if(b){
        const w=geoToWorld(b.lat,b.lng);
        const tag=warnSprite('hurricane',a.label||'Tropical alert','local NWS',0.32);
        tag.position.set(w.x,48,w.z);
        grp.add(tag);ST.labels.push(tag);
      }
    }
  }
  if(grp.children.length)scene.add(grp);
}
function renderStormTrackerPanel(){
  const hBox=$('wrHurTrack'),tBox=$('wrTorTrack'),hCount=$('wrHurCount'),tCount=$('wrTorCount');
  const chip=$('stormTrackChip');
  const ST=window.STORM_TRACKER;
  const torN=(ST.alerts.tornado||[]).length;
  const hurN=(ST.alerts.hurricane||[]).length;
  const near=ST.nearStorms||[];
  const localTor=stormHasLocalTornado(ST);
  const localHur=stormHasLocalHurricane(ST);
  syncStormLayerAvailability();
  if(hCount)hCount.textContent=near.length?(`${near.length} nearby · ${hurN} alert${hurN===1?'':'s'}`)
    :(hurN?(`${hurN} local alert${hurN===1?'':'s'}`):(ST.hurricanes.length?(`${ST.hurricanes.length} basin · none near this metro`):'none nearby'));
  if(tCount)tCount.textContent=torN?(`${torN} local NWS alert${torN===1?'':'s'}`)
    :(ST.metroRisk?`Metro inside SPC ${ST.metroRisk.label||'risk'} area`:'No local tornado risk');
  if(chip){
    const hot=torN||hurN;
    chip.style.display=hot?'inline-flex':'none';
    const parts=[];
    if(torN)parts.push(torN+' tornado alert'+(torN===1?'':'s'));
    if(hurN)parts.push(hurN+' tropical alert'+(hurN===1?'':'s'));
    chip.textContent=hot?parts.join(' · '):'';
  }
  const layerState=$('stormLayerStatus');
  if(layerState){
    const age=ST.at?Math.max(0,Math.round((Date.now()-ST.at)/60000)):null;
    if(!localTor&&!localHur){
      layerState.textContent='No tornado or hurricane warnings near this metro'
        +(age==null?' · fetching':(age===0?' · just now':' · '+age+'m ago'));
      layerState.classList.remove('warn');
    }else{
      const tor=torN?(torN+' local alert'+(torN===1?'':'s'))
        :(ST.metroRisk?('metro inside SPC '+(ST.metroRisk.label||'risk')+' area'):'none local');
      const hur=hurN?(hurN+' local alert'+(hurN===1?'':'s'))
        :(near.length?(function(){
            const org=stormTrackerOrigin();
            const s=near[0];
            const mi=distanceMi(org.lat,org.lng,s.lat,s.lng);
            const br=compassFromBearing(bearingDeg(org.lat,org.lng,s.lat,s.lng));
            return (s.name||'Storm')+' ~'+Math.round(mi)+' mi '+br+(near.length>1?(' +'+(near.length-1)):'');
          })():'none nearby');
      layerState.textContent=(localTor?('Tornado: '+tor):'')
        +(localTor&&localHur?' · ':'')
        +(localHur?('Hurricane: '+hur):'')
        +' · '+(age==null?'fetching':(age===0?'just now':age+'m ago'));
      layerState.classList.toggle('warn',!!(torN||hurN));
    }
  }
  const banner=$('stormImpactBanner');
  if(banner){
    const urgent=[...(ST.alerts.tornado||[]),...(ST.alerts.hurricane||[])]
      .find(a=>a.tier==='warning'||a.tier==='surge'||a.tier==='severe')
      ||[...(ST.alerts.tornado||[]),...(ST.alerts.hurricane||[])][0];
    banner.style.display=urgent?'block':'none';
    banner.className='stormImpact '+(urgent?urgent.kind:'');
    if(!urgent){
      banner.textContent='';
      banner.innerHTML='';
    }else{
      const title=urgent.label||'Storm alert';
      let stormName='';
      if(urgent.kind==='hurricane'){
        /* Nearby NHC storms only — never attach a distant basin name to a local warning */
        const org=stormTrackerOrigin();
        const pool=ST.nearStorms||[];
        let best=null,bestMi=Infinity;
        for(const s of pool){
          if(!s||!s.name||s.lat==null||s.lng==null)continue;
          const mi=distanceMi(org.lat,org.lng,s.lat,s.lng);
          if(mi<bestMi){bestMi=mi;best=s;}
        }
        if(!best)best=(pool.find(s=>s&&s.name))||null;
        stormName=best?String(best.name):'';
      }
      const head=stormName?(title+' for '+stormName):(title+' for this metro');
      const kindCls=urgent.kind==='hurricane'?'hurricane':(urgent.kind==='tornado'?'tornado':'');
      banner.className='stormImpact '+(kindCls||urgent.kind||'');
      const icon=urgent.kind==='hurricane'?'H':(urgent.kind==='tornado'?'T':'!');
      const tag=urgent.tier==='watch'?'Watch':(urgent.tier==='warning'||urgent.tier==='surge'?'Warning':'Alert');
      banner.innerHTML='<div class="siInner"><div class="siIcon" aria-hidden="true">'+icon+'</div>'
        +'<div class="siBody"><span class="siTag">'+escHtml(tag)+'</span>'
        +'<div class="siText">'+escHtml(head)+'</div></div></div>';
    }
  }
  if(hBox){
    if(!near.length&&!hurN){
      const basin=ST.hurricanes.length
        ?('Active basin storms are too far from this metro to show on the map (within ~'+STORM_LOCAL_HUR_MI+' mi).')
        :'No active NHC storms in the Atlantic / East Pacific right now.';
      hBox.innerHTML='<div class="wrStormEmpty"><b>No tropical storm or hurricane threats near this metro.</b><br>'
        +basin+' Local NWS watches/warnings appear here only when they cover this city.</div>';
    }else{
      const cards=near.slice(0,4).map(s=>{
        const cat=s.cat?('Cat '+s.cat+' · '):'';
        const mv=s.movementDir!=null?(' · moving '+Math.round(s.movementDir)+'° at '+s.movementSpeed+' kt'):'';
        const org=stormTrackerOrigin();
        const mi=Number.isFinite(s.lat)?distanceMi(org.lat,org.lng,s.lat,s.lng):null;
        const br=mi!=null?compassFromBearing(bearingDeg(org.lat,org.lng,s.lat,s.lng)):'';
        const offshore=mi!=null&&mi>160;
        const distLine=mi!=null?(' · ~'+Math.round(mi)+' mi '+br+' of this metro'):'';
        return '<div class="wrStormCard hurricane clickable" data-storm-id="'+escHtml(s.id||'')+'">'
          +'<div class="tag">NHC · '+escHtml(s.classLabel||nhcClassLabel(s.classification))+'</div>'
          +'<div class="ev">'+escHtml(s.name||'Storm')+' · '+escHtml(String(s.intensity))+' mph</div>'
          +'<div class="area">'+cat+'Lat '+Number(s.lat).toFixed(1)+' · Lon '+Math.abs(Number(s.lng)).toFixed(1)+(Number(s.lng)<0?'W':'E')+mv
          +distLine+' · '+escHtml(s.trackSource||'NHC track')+'</div>'
          +'<div class="until">'+(offshore
            ?'Offshore — tap to look toward storm from metro edge'
            :'Tap card to fly to storm')+'</div>'
          +(s.advisoryUrl?'<div class="until"><a href="'+escHtml(s.advisoryUrl)+'" target="_blank" rel="noopener">NHC advisory ↗</a></div>':'')
          +'</div>';
      }).join('');
      const alertCards=(ST.alerts.hurricane||[]).slice(0,4).map(a=>{
        const p=a.feature.properties||{};
        return '<div class="wrStormCard hurricane alert clickable" data-hur-alert="'+String((ST.alerts.hurricane||[]).indexOf(a))+'">'
          +'<div class="tag">NWS · '+escHtml(a.label)+'</div>'
          +'<div class="ev">'+escHtml(p.event||a.label)+'</div>'
          +'<div class="area">'+escHtml(String(p.areaDesc||'').slice(0,120))+'</div>'
          +'</div>';
      }).join('');
      hBox.innerHTML=cards+alertCards;
      hBox.querySelectorAll('[data-storm-id]').forEach(el=>el.addEventListener('click',e=>{
        if(e.target&&e.target.closest&&e.target.closest('a'))return;
        const s=(ST.hurricanes||[]).find(x=>String(x.id)===el.getAttribute('data-storm-id'));
        if(s)flyToStormLocation(s.lat,s.lng,null,{name:s.name||'Storm'});
      }));
      hBox.querySelectorAll('[data-hur-alert]').forEach(el=>el.addEventListener('click',()=>{
        flyToStormAlert((ST.alerts.hurricane||[])[+el.getAttribute('data-hur-alert')]);
      }));
    }
  }
  if(tBox){
    if(!localTor&&!torN){
      tBox.innerHTML='<div class="wrStormEmpty"><b>No tornado watch, warning, or SPC risk over this metro.</b><br>'
        +'The tornado layer stays hidden until a local NWS alert or today\u2019s SPC outlook covers this city.</div>';
    }else{
      const metroLine=ST.metroRisk
        ?('<b>This metro is inside today\u2019s '+escHtml(ST.metroRisk.label||'')+' tornado risk area</b> \u2014 that\u2019s the amber shading on the map.')
        :'';
      const outlook=ST.metroRisk
        ?('<div class="wrStormCard tornado outlook"><div class="tag">SPC Day 1</div><div class="ev">Metro inside '+escHtml(ST.metroRisk.label||'risk')+' area</div>'
          +'<div class="area">'+(metroLine||'')+'</div></div>')
        :'';
      const alertCards=(ST.alerts.tornado||[]).slice(0,6).map(a=>{
        const p=a.feature.properties||{};
        return '<div class="wrStormCard tornado alert clickable" data-tor-alert="'+String((ST.alerts.tornado||[]).indexOf(a))+'">'
          +'<div class="tag">NWS · '+escHtml(a.label)+'</div>'
          +'<div class="ev">'+escHtml(p.headline||p.event||a.label)+'</div>'
          +'<div class="area">'+escHtml(String(p.areaDesc||'').slice(0,120))+'</div>'
          +'</div>';
      }).join('');
      tBox.innerHTML=outlook+alertCards+(outlook||alertCards?'':'<div class="wrStormEmpty">No active tornado alerts for this metro.</div>');
      tBox.querySelectorAll('[data-tor-alert]').forEach(el=>el.addEventListener('click',()=>{
        flyToStormAlert((ST.alerts.tornado||[])[+el.getAttribute('data-tor-alert')]);
      }));
    }
  }
  const foot=$('wrStormFoot');
  if(foot){
    const age=ST.at?Math.max(0,Math.round((Date.now()-ST.at)/60000)):null;
    foot.textContent='NHC storms · SPC tornado outlook · NWS tornado/tropical alerts'
      +(ST.err?' · '+ST.err:'')
      +(age==null?' · fetching…':(age<=0?' · updated just now':' · updated '+age+' min ago'));
  }
  const tBtn=$('stormTornadoBtn'),hBtn=$('stormHurricaneBtn');
  if(tBtn)tBtn.classList.toggle('on',!!ST.showTornado);
  if(hBtn)hBtn.classList.toggle('on',!!ST.showHurricane);
}
function clearStormAlertEls(){
  for(const el of _stormAlertEls){try{el.remove();}catch(e){}}
  _stormAlertEls=[];
}
function syncStormTrackerAlerts(){
  clearStormAlertEls();
  const box=document.getElementById('alertsWeather')||document.getElementById('alerts');
  const ST=window.STORM_TRACKER;
  const items=[...(ST.alerts.tornado||[]),...(ST.alerts.hurricane||[])].slice(0,5);
  if(!box||!items.length)return;
  const head=document.createElement('div');
  head.className='alertSec storm';
  head.textContent='Tornado / hurricane · live';
  box.prepend(head);
  _stormAlertEls.push(head);
  for(const a of items){
    const p=a.feature.properties||{};
    const el=document.createElement('div');
    el.className='alert '+(a.kind==='hurricane'?'hurricane':(a.kind==='tornado'?'tornado':'work'))+' clickable storm';
    el.innerHTML='<div class="at"><span class="warnPill">'+escHtml(a.label)+'</span></div>'
      +'<div class="aMeta"><span class="aChip">NWS live</span></div>'
      +'<div class="ab"><b>'+escHtml(p.headline||p.event||a.label)+'</b></div>'
      +'<div class="aHint">Tap for tracker details · map overlay</div>';
    el.addEventListener('click',()=>{
      if(a.kind==='tornado')ST.showTornado=true;
      if(a.kind==='hurricane')ST.showHurricane=true;
      stormTrackerRenderMap();
      flyToStormAlert(a);
    });
    box.prepend(el);
    _stormAlertEls.push(el);
  }
  refreshIncidentCount();
}
async function refreshStormTracker(force){
  if(!force&&Date.now()<_stormNext)return;
  _stormNext=Date.now()+STORM_POLL_MS;
  const ST=window.STORM_TRACKER;
  try{
    const origin=stormTrackerOrigin();
    const [hur,outlook,alerts]=await Promise.all([
      fetchNhcStorms(),
      fetchSpcTornadoOutlook().catch(()=>[]),
      fetchStormAlerts(HTS_PACK,HTS_CITY_ID),
    ]);
    ST.hurricanes=hur;
    ST.nearStorms=stormsNearMetro(hur,origin.lat,origin.lng,STORM_LOCAL_HUR_MI);
    ST.tornadoOutlook=outlook;
    ST.metroRisk=spcRiskAtPoint(outlook,origin.lat,origin.lng);
    ST.alerts=alerts;
    ST.ok=true;ST.err='';ST.at=Date.now();
  }catch(e){
    ST.ok=false;ST.err=String(e&&e.message?e.message:e);ST.at=Date.now();
  }
  stormTrackerRenderMap();
  renderStormTrackerPanel();
  syncStormTrackerAlerts();
  if($('wxReport')&&$('wxReport').classList.contains('on'))renderWeatherWarnings(window.LIVE_NWS.features||[]);
}
(function wireStormTracker(){
  const tBtn=$('stormTornadoBtn'),hBtn=$('stormHurricaneBtn');
  if(tBtn)tBtn.addEventListener('click',()=>{
    if(!stormHasLocalTornado())return;
    window.STORM_TRACKER.showTornado=!window.STORM_TRACKER.showTornado;
    stormTrackerRenderMap();renderStormTrackerPanel();
  });
  if(hBtn)hBtn.addEventListener('click',()=>{
    if(!stormHasLocalHurricane())return;
    window.STORM_TRACKER.showHurricane=!window.STORM_TRACKER.showHurricane;
    stormTrackerRenderMap();renderStormTrackerPanel();
  });
  refreshStormTracker(true);
  setInterval(()=>refreshStormTracker(false),STORM_POLL_MS);
})();

/* weather blending toward current target */
function wxUpdate(dt){
  let targetPreset,label,rainAmt=null,cloudOv=null;
  const fc=(!liveMode&&wxMode==='auto'&&typeof forecastAt==='function')?forecastAt(window.simOffsetSec||0):null;
  if(wxMode!=='auto'){targetPreset=wxMode;label=WX[wxMode].desc;}
  else if(!liveMode){
    /* Time-lapse: weather follows simulated clock (forecast hour or typical pattern) */
    if(fc&&fc.preset){
      targetPreset=fc.preset;label=fc.label||WX[fc.preset].desc;
      rainAmt=fc.rainAmt!=null?fc.rainAmt:null;cloudOv=fc.cloud!=null?fc.cloud:null;
    }else{
      if(simH>wxNextRoll||wxNextRoll-simH>6){wxCur=rollWeather(simH);wxNextRoll=(simH+1.5+rand()*2.5)%24;}
      targetPreset=wxCur;label=WX[wxCur].desc;
    }
  }else if(liveWx||zoneWx||(window.WX_ZONES&&window.WX_ZONES.length)){
    const view=activeViewWeather()||liveWx;
    if(view&&!view.pending){
      targetPreset=view.preset||'clear';
      label=view.label||(WX[targetPreset]?WX[targetPreset].desc:'Clear');
      rainAmt=view.rainAmt!=null?view.rainAmt:(WX[targetPreset]?WX[targetPreset].rain:0);
      cloudOv=view.cloud!=null?view.cloud:null;
    }else{
      targetPreset='clear';label=view&&view.place?(view.place+' · loading'):'Loading…';
      rainAmt=0;cloudOv=0.25;
    }
  }else{
    if(simH>wxNextRoll||wxNextRoll-simH>6){wxCur=rollWeather(simH);wxNextRoll=(simH+1.5+rand()*2.5)%24;}
    targetPreset=wxCur;label=WX[wxCur].desc;
  }
  wxCur=targetPreset;wxDesc=label;
  const T=WX[targetPreset]||WX.clear;
  /* Snap rain faster when flying into a drizzly suburb so streaks appear immediately */
  const rainTarget=rainAmt!=null?rainAmt:T.rain;
  const rainDelta=Math.abs((wxBlend.rain||0)-rainTarget);
  const k=clamp(dt*(liveMode?(rainDelta>0.1?3.2:0.9):Math.min(4.2,0.85+timeScale/180)),0,1);
  const tgt={cloud:cloudOv!=null?Math.max(T.cloud*0.4,cloudOv):T.cloud,
             fogK:T.fogK,speed:T.speed,cong:T.cong,
             rain:rainTarget};
  for(const key of ['cloud','fogK','speed','cong','rain'])wxBlend[key]=lerp(wxBlend[key],tgt[key],k);
  wxBlend.storm=!!(T.storm||rainTarget>=0.85);wxBlend.tempD=T.tempD;
  /* Wind slant always tracks the active weather source — never freeze in preview */
  {
    let wDir=null,wSpd=null;
    if(liveMode){
      const view=activeViewWeather()||liveWx;
      if(view){wDir=view.windDir;wSpd=view.wind;}
    }else if(!liveMode){
      if(fc){wDir=fc.windDir;wSpd=fc.wind;}
      else{wDir=(simH*15)%360;wSpd=6+8*wxBlend.cloud;}
    }
    if(wDir!=null){
      const a=(wDir+180)*Math.PI/180;
      const str=clamp((wSpd||8)/28,0.1,1);
      rainWindX=lerp(rainWindX,Math.sin(a)*0.55*str,k);
      rainWindZ=lerp(rainWindZ,Math.cos(a)*0.55*str,k);
    }
  }
}

/* rain system — src/rain.js (wind slant, splashes, puddles, wet roads, visibility fog) */
let htsRain=null;
function bootRainSystem(){
  if(htsRain||!window.__htsRainInit||typeof THREE==='undefined')return;
  htsRain=window.__htsRainInit({
    THREE,scene,roadMats,getUnderpasses:()=>UNDERPASSES,rand,lerp,clamp,
    getLiveWx:()=>activeViewWeather()||liveWx,getWxBlend:()=>wxBlend,getCam:()=>cam,
    getRainAtWorld:(x,z)=>rainIntensityAt(window.WX_ZONES||[],x,z),
    getRainZonesLive:()=>(window.WX_ZONES||[]).some(z=>z&&z.wx),
  });
  window.__htsRain=htsRain;
}
window.__htsRainPending=bootRainSystem;
bootRainSystem();
let rainWindX=0.28,rainWindZ=0.12; /* slant direction, refreshed from live wind */

/* TOD keyframes = clear-sky baseline; envUpdate dims/grays them from wxBlend.cloud/rain */
/* Night keyed dark — deep ink sky, not dusk-blue “mode” */
const SKY_TOP=[{t:0,v:'#010208'},{t:4.8,v:'#02040e'},{t:6.0,v:'#1d2f5e'},{t:6.6,v:'#3a5a96'},
 {t:8,v:'#3f86d8'},{t:12,v:'#3480d6'},{t:17.5,v:'#3f78c0'},{t:19.6,v:'#3a2e5c'},{t:20.4,v:'#0c1028'},{t:21.4,v:'#02040c'}];
const SKY_BOT=[{t:0,v:'#04060c'},{t:4.8,v:'#060910'},{t:6.0,v:'#c96a3e'},{t:6.7,v:'#ffb066'},
 {t:8,v:'#d4e6f5'},{t:12,v:'#c8dff0'},{t:17.5,v:'#e4d4b0'},{t:19.4,v:'#ff8a4d'},{t:20.3,v:'#4a2238'},{t:21.4,v:'#060810'}];
const SUN_COL=[{t:5.8,v:'#ff9a55'},{t:7,v:'#ffd9a0'},{t:9,v:'#fff8ea'},{t:12,v:'#ffffff'},
 {t:17,v:'#ffe9c4'},{t:19,v:'#ff9e5a'},{t:20.2,v:'#ff7040'},{t:21,v:'#1a2238'},{t:4.5,v:'#1a2238'}];
const SUN_INT=[{t:0,v:0},{t:5.6,v:0},{t:6.6,v:.5},{t:8,v:.95},{t:12,v:1.08},{t:17,v:.95},
 {t:19.3,v:.45},{t:20.5,v:.05},{t:21,v:0}];
const HEMI_INT=[{t:0,v:.04},{t:5.5,v:.08},{t:6.6,v:.48},{t:9,v:.82},{t:12,v:.9},{t:18,v:.72},{t:20,v:.22},{t:21.2,v:.04}];
const FOG_COL=[{t:0,v:'#03050a'},{t:6.2,v:'#7a5a58'},{t:7.5,v:'#c0d4e4'},{t:12,v:'#bcd2e4'},
 {t:18,v:'#ccc4ac'},{t:19.6,v:'#5a3840'},{t:20.6,v:'#04060c'}];

const SUNRISE=6.4,SUNSET=20.4;
function phaseLabel(h){
  if(h>=SUNRISE-0.8&&h<SUNRISE+0.7)return 'Dawn';
  if(h>=SUNRISE+0.7&&h<11.5)return 'Morning';
  if(h>=11.5&&h<16.5)return 'Afternoon';
  if(h>=16.5&&h<SUNSET-0.8)return 'Evening';
  if(h>=SUNSET-0.8&&h<SUNSET+0.7)return 'Dusk';
  return 'Night';
}

/* forecast lookup for the predicted wall-clock hour — blends into the next hour so time-lapse never sits still */
function forecastHourIndex(offsetSec){
  if(!liveWx||!liveWx.hourly||!liveWx.hourly.time||!liveWx.hourly.time.length)return null;
  const d=new Date(Date.now()+offsetSec*1000);
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:CHI_TZ||'America/Chicago',
    year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d);
  const g=k=>{const x=p.find(t=>t.type===k);return x?x.value:'00';};
  const hour=g('hour')==='24'?'00':g('hour');
  const key=g('year')+'-'+g('month')+'-'+g('day')+'T'+hour+':00';
  const i=liveWx.hourly.time.indexOf(key);
  if(i<0)return null;
  const minute=clamp((+g('minute')||0)/60,0,0.999);
  return {i,u:minute};
}
function forecastSample(i){
  const h=liveWx.hourly;
  const m=wmoLookup(h.weather_code[i]);
  const pressRaw=h.pressure_msl?h.pressure_msl[i]:null;
  return {
    temp:h.temperature_2m[i],
    feels:h.apparent_temperature?h.apparent_temperature[i]:h.temperature_2m[i],
    hum:h.relative_humidity_2m[i],
    wind:h.wind_speed_10m[i],
    windDir:h.wind_direction_10m?h.wind_direction_10m[i]:(liveWx.windDir||0),
    precip:h.precipitation[i],
    cloud:h.cloud_cover[i]/100,
    dew:h.dew_point_2m?h.dew_point_2m[i]:(h.temperature_2m[i]-(100-h.relative_humidity_2m[i])/2.8),
    press:pressRaw!=null?(pressRaw*0.02953):null,
    uv:h.uv_index!=null?h.uv_index[i]:0,
    vis:liveWx.vis,
    preset:m.preset,label:m.label,rainAmt:m.rain,at:liveWx.at,
  };
}
function forecastAt(offsetSec){
  const hit=forecastHourIndex(offsetSec);
  if(!hit)return null;
  const a=forecastSample(hit.i);
  const next=hit.i+1<liveWx.hourly.time.length?forecastSample(hit.i+1):null;
  if(!next||hit.u<0.02){
    return {
      temp:Math.round(a.temp),feels:Math.round(a.feels),hum:Math.round(a.hum),
      wind:Math.round(a.wind),windDir:a.windDir,precip:a.precip,cloud:a.cloud,
      dew:Math.round(a.dew),press:a.press!=null?a.press.toFixed(2):liveWx.press,
      uv:Math.round(a.uv),vis:a.vis,preset:a.preset,label:a.label,rainAmt:a.rainAmt,at:a.at,
    };
  }
  const u=hit.u;
  const lerpAng=(x,y,t)=>{let d=((y-x+540)%360)-180;return (x+d*t+360)%360;};
  const cloud=lerp(a.cloud,next.cloud,u);
  const rainAmt=lerp(a.rainAmt,next.rainAmt,u);
  const precip=lerp(a.precip,next.precip,u);
  /* Prefer the wetter / stormier label while transitioning so the sky keeps evolving */
  const pick=rainAmt>=Math.max(a.rainAmt,next.rainAmt)-0.02
    ?(next.rainAmt>=a.rainAmt?next:a)
    :(cloud>=Math.max(a.cloud,next.cloud)-0.02?(next.cloud>=a.cloud?next:a):a);
  const pr=(a.press!=null&&next.press!=null)?lerp(a.press,next.press,u):(a.press!=null?a.press:null);
  return {
    temp:Math.round(lerp(a.temp,next.temp,u)),
    feels:Math.round(lerp(a.feels,next.feels,u)),
    hum:Math.round(lerp(a.hum,next.hum,u)),
    wind:Math.round(lerp(a.wind,next.wind,u)),
    windDir:lerpAng(a.windDir,next.windDir,u),
    precip,cloud,
    dew:Math.round(lerp(a.dew,next.dew,u)),
    press:pr!=null?pr.toFixed(2):liveWx.press,
    uv:Math.round(lerp(a.uv,next.uv,u)),
    vis:a.vis,
    preset:pick.preset,label:pick.label,rainAmt,at:a.at,
  };
}
/* ---------------- camera (custom orbit) ---------------- */
const cam={theta:-0.62,phi:0.86,radius:2300,target:new THREE.Vector3(-120,0,60)};
const camGoal={theta:cam.theta,phi:cam.phi,radius:cam.radius,target:cam.target.clone()};
function applyCam(){
  cam.theta+=(camGoal.theta-cam.theta)*0.12;
  cam.phi  +=(camGoal.phi-cam.phi)*0.12;
  cam.radius+=(camGoal.radius-cam.radius)*0.12;
  cam.target.lerp(camGoal.target,0.12);
  const sp=Math.sin(cam.phi),y=Math.cos(cam.phi);
  camera.position.set(
    cam.target.x+cam.radius*sp*Math.sin(cam.theta),
    cam.target.y+cam.radius*y,
    cam.target.z+cam.radius*sp*Math.cos(cam.theta));
  camera.lookAt(cam.target);
  document.getElementById('rose').style.transform='rotate('+(-cam.theta*180/Math.PI)+'deg)';
}
const PHI_MIN=0.06,PHI_MAX=1.5,R_MIN=55,R_MAX=9200;
let drag=null,ptStart=null,follow=null,followPlane=null;
let hoverPlace=null; /* {n, road?} from pointer hover — drives whereami pill */
function camRadiusLimits(){
  if(followPlane)return {rmin:70,rmax:5200,phiMin:0.12,phiMax:1.48};
  if(follow)return {rmin:28,rmax:900,phiMin:0.55,phiMax:1.42};
  return {rmin:LIMITS.rmin,rmax:LIMITS.rmax,phiMin:PHI_MIN,phiMax:PHI_MAX};
}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);
  drag={x:e.clientX,y:e.clientY,btn:e.button,shift:e.shiftKey};
  ptStart={x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerType==='touch')return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
  const lim=camRadiusLimits();
  if(drag.btn===2||drag.btn===1||drag.shift){pan(dx,dy);}
  else{camGoal.theta-=dx*0.005;camGoal.phi=clamp(camGoal.phi-dy*0.004,lim.phiMin,lim.phiMax);}});
addEventListener('pointerup',e=>{
  if(ptStart&&Math.hypot(e.clientX-ptStart.x,e.clientY-ptStart.y)<6&&e.button===0)tryPickVehicle(e);
  drag=null;ptStart=null;});
const _ray=new THREE.Raycaster(),_ndc=new THREE.Vector2();
const TYPE_NAMES={car:'Car',suv:'SUV',pickup:'Pickup',van:'Van',taxi:'Taxi',semi:'18-wheeler',box:'Box truck',bus:'Metro bus',moto:'Motorcycle',scooter:'Scooter',bike:'Bicycle'};
function allPlaneMeshes(){
  const meshes=[];
  if(window.FLIGHTS)for(const f of FLIGHTS)if(f&&f.m)meshes.push(f.m);
  if(window.LIVE_FLIGHT_LIST)for(const f of LIVE_FLIGHT_LIST)if(f&&f.m&&f.m.visible)meshes.push(f.m);
  return meshes;
}
function findPlaneByHit(obj){
  let o=obj;
  while(o){
    if(o.userData&&o.userData.flightRef)return o.userData.flightRef;
    o=o.parent;
  }
  const root=obj&&obj.parent===scene?obj:obj&&obj.parent?obj.parent:obj;
  if(window.LIVE_FLIGHT_LIST){
    const lf=LIVE_FLIGHT_LIST.find(fl=>fl&&fl.m&&(fl.m===root||fl.m===obj||fl.m.children.includes(obj)||fl.m.children.includes(root)));
    if(lf)return lf;
  }
  if(window.FLIGHTS){
    const sf=FLIGHTS.find(fl=>fl&&fl.m&&(fl.m===root||fl.m===obj||fl.m.children.includes(obj)||fl.m.children.includes(root)));
    if(sf)return sf;
  }
  return null;
}
function pickNearestFlightScreen(e){
  if(!window.LIVE_FLIGHT_LIST||!LIVE_FLIGHT_LIST.length)return null;
  if(typeof syncLiveFlightVisibility==='function')syncLiveFlightVisibility();
  const mx=e.clientX,my=e.clientY;
  let best=null,bd=1e9;
  const hitR=clamp(5200/cam.radius,22,88);
  for(const f of LIVE_FLIGHT_LIST){
    if(!f||!f.m||!f.m.visible)continue;
    const wp=f.m.position.clone();
    wp.project(camera);
    if(wp.z>1)continue;
    const sx=(wp.x*0.5+0.5)*innerWidth;
    const sy=(-wp.y*0.5+0.5)*innerHeight;
    const d=Math.hypot(sx-mx,sy-my);
    if(d<hitR&&d<bd){bd=d;best=f;}
  }
  return best;
}
function tryPickVehicle(e){
  if(window.HAZARD&&HAZARD.active&&HAZARD.mode==='nuclear'&&HAZARD.nukePlaceMode){
    const hit=rayGroundHit(e);
    if(hit){hazNuclearAt(hit.x,hit.z,HAZARD.yieldKt||10);return;}
  }
  if(window.osmMode&&window.osmRouteFromClick){osmRouteFromClick(e);return;}
  _ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);
  _ray.setFromCamera(_ndc,camera);
  /* planes first — lock follow + flexible chase cam (scroll to zoom above/below) */
  const pHits=_ray.intersectObjects(allPlaneMeshes(),true);
  let f=pHits.length?findPlaneByHit(pHits[0].object):null;
  if(!f)f=pickNearestFlightScreen(e);
  if(f){closePoiCard();focusAircraftInSky(f);return;}
  /* airports -> info card */
  if(window.AIRPORT_HITS&&AIRPORT_HITS.length){
    const aHits=_ray.intersectObjects(AIRPORT_HITS,false);
    if(aHits.length&&aHits[0].object.userData.airport){
      const a=aHits[0].object.userData.airport;
      openPoiCard({
        n:a.code+' · '+a.name,
        x:a.x,z:a.z,
        addr:(a.addr||'')+(a.note?' — '+a.note:'')
      },e.clientX,e.clientY);
      return;
    }
  }
  /* landmark towers -> history card */
  if(window.PICK_TOWERS){
    const tHits=_ray.intersectObjects(PICK_TOWERS,false);
    if(tHits.length&&tHits[0].object.userData.info){
      const tw=tHits[0].object;
      if(tw.userData.userHome){
        flyToMyLocation();
        openPoiCard(tw.userData.poi||{n:'My place',x:userWorld&&userWorld.x,z:userWorld&&userWorld.z,lat:userGeo&&userGeo.lat,lng:userGeo&&userGeo.lng,addr:'You are here'},e.clientX,e.clientY);
        return;
      }
      const inf=tw.userData.info;
      const poi=tw.userData.poi;
      openPoiCard(poi||{
        n:inf.n,
        x:tw.position.x,z:tw.position.z,
        addr:inf.d||''
      },e.clientX,e.clientY);
      return;
    }
  }
  /* POIs -> action card */
  const poiHits=_ray.intersectObjects(poiSprites,false);
  if(poiHits.length&&poiHits[0].object.material.opacity>0.05){
    openPoiCard(poiHits[0].object.userData.poi,e.clientX,e.clientY);
    return;
  }
  /* Empty map click — dismiss sticky place card */
  closePoiCard();
  if(!bodies.visible)return;
  const hits=_ray.intersectObject(bodies,false);
  if(hits.length&&hits[0].instanceId!=null&&hits[0].instanceId<bodies.count){
    const v=vehRef[hits[0].instanceId];
    if(v){follow=v;followPlane=null;document.getElementById('followChip').style.display='flex';}
  }
}
/* ---- POI card, geolocation & Google Maps handoff ---- */
let userGeo=null,geoAsked=false,userWorld=null,geoWatchId=null;
setInterval(()=>{if(userGeo)fetchLocalWeather(userGeo.lat,userGeo.lng,false);},2*60*1000);
/* 'you are here' marker — Houston gets a cozy house + go-to pin; others keep the blue dot */
const HTS_IS_HOU=HTS_CITY_ID==='houston';
const userDot=(function(){
  const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  if(HTS_IS_HOU){
    /* Soft ground glow under the house */
    const g=x.createRadialGradient(32,32,4,32,32,30);
    g.addColorStop(0,'rgba(110,180,255,.55)');g.addColorStop(1,'rgba(110,180,255,0)');
    x.fillStyle=g;x.fillRect(0,0,64,64);
  }else{
    x.beginPath();x.arc(32,32,13,0,TAU);x.fillStyle='#2f86ff';x.fill();
    x.lineWidth=5;x.strokeStyle='#fff';x.stroke();
  }
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthWrite:false,transparent:true}));
  sp.scale.set(HTS_IS_HOU?48:26,HTS_IS_HOU?48:26,1);sp.visible=false;scene.add(sp);return sp;
})();
const userHalo=(function(){
  const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  const g=x.createRadialGradient(32,32,6,32,32,32);
  g.addColorStop(0,'rgba(47,134,255,.4)');g.addColorStop(1,'rgba(47,134,255,0)');
  x.fillStyle=g;x.fillRect(0,0,64,64);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthWrite:false,transparent:true}));
  sp.visible=false;scene.add(sp);return sp;
})();
/* Houston: redesigned Craftsman bungalow + go-to pin at your geo fix */
const userHome=(function(){
  if(!HTS_IS_HOU)return null;
  const g=new THREE.Group();g.visible=false;g.frustumCulled=false;gDetail.add(g);
  function add(mesh){mesh.frustumCulled=false;g.add(mesh);return mesh;}
  function box(w,h,d,mat,x,y,z){
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    m.position.set(x,y,z);return add(m);
  }
  const siding=new THREE.MeshLambertMaterial({color:0xf7f1e6});
  const trim=new THREE.MeshLambertMaterial({color:0xffffff});
  const brick=new THREE.MeshLambertMaterial({color:0x9a6a4e});
  const cedar=new THREE.MeshLambertMaterial({color:0x6e4530});
  const roofM=new THREE.MeshLambertMaterial({color:0x2f4a62});
  const glass=new THREE.MeshLambertMaterial({color:0x8ec4ea,emissive:0x3a6a88,emissiveIntensity:0.35});
  const grass=new THREE.MeshLambertMaterial({color:0x3f8f4c});
  const hedge=new THREE.MeshLambertMaterial({color:0x2f6a38});
  /* landscaped lot */
  const lawn=new THREE.Mesh(new THREE.CircleGeometry(26,28),grass);
  lawn.rotation.x=-Math.PI/2;lawn.position.y=0.1;add(lawn);
  const pad=new THREE.Mesh(new THREE.CircleGeometry(16,24),new THREE.MeshLambertMaterial({color:0x5a8f58}));
  pad.rotation.x=-Math.PI/2;pad.position.y=0.12;add(pad);
  /* Front walk + driveway */
  box(4.2,0.18,14,new THREE.MeshLambertMaterial({color:0xc2b5a0}),0,0.18,12);
  box(7.5,0.16,12,new THREE.MeshLambertMaterial({color:0x6a7078}),12.5,0.16,6);
  /* Foundation + main volume */
  box(20,1.4,15,brick,0,0.7,0);
  box(19.2,9.5,14.2,siding,0,6.1,0);
  /* Side garage wing */
  box(9,7.2,11,siding,13.2,4.8,1.2);
  box(9.2,1.2,11.2,brick,13.2,0.6,1.2);
  box(6.4,4.8,0.35,cedar,13.2,3.2,6.85); /* garage door */
  /* Front porch deck + roof slab */
  box(14,0.45,5.5,cedar,0,1.35,9.2);
  box(1.6,0.35,3.2,cedar,-2.2,0.55,12.6); /* steps */
  box(1.6,0.35,2.2,cedar,-2.2,0.95,13.3);
  for(const sx of [-5.5,5.5]){
    box(0.55,5.2,0.55,trim,sx,4.0,11.4);
  }
  box(13.5,0.35,5.8,roofM,0,6.8,9.1);
  /* Craftsman door + sidelights */
  box(3.4,6.2,0.35,cedar,0,4.5,7.25);
  box(0.9,4.4,0.28,glass,-2.4,4.8,7.25);
  box(0.9,4.4,0.28,glass,2.4,4.8,7.25);
  box(3.8,0.35,1.6,trim,0,7.85,7.55); /* door header */
  /* Windows with frames */
  function windowAt(x,y,z,w,h){
    box(w+0.55,h+0.55,0.28,trim,x,y,z);
    box(w,h,0.22,glass,x,y,z+0.05);
    box(0.18,h,0.24,trim,x,y,z+0.08); /* mullion */
  }
  windowAt(-5.4,6.4,7.2,3.4,3.2);
  windowAt(5.4,6.4,7.2,3.4,3.2);
  windowAt(-5.4,6.4,-7.2,3.4,3.2);
  windowAt(5.4,6.4,-7.2,3.4,3.2);
  windowAt(-9.7,5.6,0,2.8,2.8);
  /* Closed gable roof — triangular prism sitting on the wall tops (no rotate; previous Extrude+rotate left the peak open) */
  const wallTop=10.85;
  const gable=new THREE.Shape();
  gable.moveTo(-10.9,0);
  gable.lineTo(0,5.4);
  gable.lineTo(10.9,0);
  gable.closePath();
  const roofGeo=new THREE.ExtrudeGeometry(gable,{depth:15.8,bevelEnabled:false});
  roofGeo.translate(0,0,-7.9);
  const roof=new THREE.Mesh(roofGeo,roofM);
  roof.position.set(0,wallTop,0);
  add(roof);
  /* Gable end fills so the ends read closed */
  function gableEnd(z){
    const s=new THREE.Shape();
    s.moveTo(-9.7,0);s.lineTo(0,4.9);s.lineTo(9.7,0);s.closePath();
    const eg=new THREE.ExtrudeGeometry(s,{depth:0.45,bevelEnabled:false});
    const m=new THREE.Mesh(eg,siding);
    m.position.set(0,wallTop,z);add(m);
  }
  gableEnd(7.55);gableEnd(-8.0);
  /* Garage lean-to roof — pitched toward the driveway */
  const lean=new THREE.Mesh(new THREE.BoxGeometry(10.4,0.45,12.4),roofM);
  lean.rotation.z=-0.18;lean.position.set(13.4,9.2,1.2);add(lean);
  /* Chimney through the closed roof */
  box(2.4,6.2,2.4,brick,-5.8,15.4,-2.2);
  box(2.8,0.45,2.8,trim,-5.8,18.6,-2.2);
  /* Hedges + shade trees */
  for(const hx of [-10,10])box(2.2,2.4,8,hedge,hx,1.4,-2);
  box(8,1.8,2.0,hedge,0,1.1,-9.5);
  function tree(tx,tz,h){
    box(0.9,h*0.55,0.9,cedar,tx,h*0.28,tz);
    const canopy=new THREE.Mesh(new THREE.SphereGeometry(h*0.38,10,8),hedge);
    canopy.position.set(tx,h*0.72,tz);canopy.scale.set(1,0.85,1);add(canopy);
  }
  tree(-14,10,14);tree(18,-8,12);tree(-16,-8,11);
  /* Warm porch glow */
  const porch=new THREE.PointLight(0xffd2a0,0.85,52,2);porch.position.set(0,7.2,10.5);g.add(porch);
  const glow=new THREE.PointLight(0xffc078,0.25,36,2);glow.position.set(0,5,0);g.add(glow);
  /* Go-to-location pin */
  const pinC=document.createElement('canvas');pinC.width=pinC.height=128;const px=pinC.getContext('2d');
  px.clearRect(0,0,128,128);
  const grad=px.createLinearGradient(40,20,90,110);
  grad.addColorStop(0,'#5eb0ff');grad.addColorStop(1,'#1f6fd6');
  px.fillStyle=grad;
  px.beginPath();px.moveTo(64,118);px.quadraticCurveTo(14,70,14,46);px.arc(64,46,50,Math.PI,0,false);
  px.quadraticCurveTo(114,70,64,118);px.closePath();px.fill();
  px.strokeStyle='rgba(255,255,255,.95)';px.lineWidth=5;px.stroke();
  px.beginPath();px.arc(64,46,20,0,Math.PI*2);px.fillStyle='#fff';px.fill();
  /* Mini home glyph in pin */
  px.fillStyle='#1f6fd6';
  px.fillRect(54,44,20,14);
  px.beginPath();px.moveTo(50,44);px.lineTo(64,32);px.lineTo(78,44);px.closePath();px.fill();
  const pin=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(pinC),transparent:true,depthWrite:false}));
  pin.scale.set(24,24,1);pin.position.set(0,30,0);add(pin);
  const hit=new THREE.Mesh(
    new THREE.BoxGeometry(36,38,30),
    new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})
  );
  hit.position.y=14;hit.frustumCulled=false;
  hit.userData.userHome=true;
  hit.userData.info={n:'My place',d:'Your location · tap the pin or use Go to my location'};
  hit.userData.poi={n:'My place',x:0,z:0,lat:null,lng:null,addr:'You are here'};
  g.add(hit);
  if(!window.PICK_TOWERS)window.PICK_TOWERS=[];
  PICK_TOWERS.push(hit);
  g.userData={pin,hit,porch};
  return g;
})();
function flyToMyLocation(){
  requestGeo(()=>{
    if(userGeo)fetchLocalWeather(userGeo.lat,userGeo.lng,true);
    if(userWorld){stopFollow();
      camGoal.target.set(userWorld.x,0,userWorld.z);
      camGoal.radius=HTS_IS_HOU?280:430;camGoal.phi=1.0;}
    else if(userGeo){
      geoToast.querySelector('span').textContent="You're outside the "+CITY_NAME+" map area — showing Downtown instead.";
      geoToast.style.display='flex';setTimeout(hideGeoToast,4200);
      camGoal.target.set(60,0,60);camGoal.radius=800;}
    else{geoToast.style.display='flex';}
  });
}
function updateUserMarker(){
  if(!userGeo)return;
  const w=geoToWorld(userGeo.lat,userGeo.lng);
  userWorld=(Math.abs(w.x)<9000&&Math.abs(w.z)<9000)?w:null;
  const on=!!userWorld;
  userDot.visible=on&&!HTS_IS_HOU;
  userHalo.visible=on;
  if(userHome)userHome.visible=on;
  if(userWorld){
    if(userHome){
      userHome.position.set(userWorld.x,0,userWorld.z);
      if(userHome.userData.hit&&userHome.userData.hit.userData.poi){
        const poi=userHome.userData.hit.userData.poi;
        poi.x=userWorld.x;poi.z=userWorld.z;
        poi.lat=userGeo.lat;poi.lng=userGeo.lng;
        poi.addr=(localWx&&localWx.place)?(localWx.place+' · your GPS'):('Your GPS · '+userGeo.lat.toFixed(5)+', '+userGeo.lng.toFixed(5));
      }
      if(!userHome.userData.ex){userHome.userData.ex={x:userWorld.x,z:userWorld.z,r:42};EXCLUDES.push(userHome.userData.ex);}
      else{userHome.userData.ex.x=userWorld.x;userHome.userData.ex.z=userWorld.z;}
      userHalo.position.set(userWorld.x,0.4,userWorld.z);
      userHalo.scale.set(56,56,1);
    }else{
      userDot.position.set(userWorld.x,42,userWorld.z);
      userHalo.position.set(userWorld.x,40,userWorld.z);
    }
    document.getElementById('locBtn').classList.add('active');
    const mLoc=document.getElementById('mHudLoc');if(mLoc)mLoc.classList.add('on');
    const mLocOld=document.getElementById('mLocFab');if(mLocOld)mLocOld.classList.add('on');
  }
}
function applyGeoPosition(pos,forceWx){
  if(!pos||!pos.coords)return false;
  const lat=pos.coords.latitude,lng=pos.coords.longitude;
  const acc=Number(pos.coords.accuracy);
  if(!Number.isFinite(lat)||!Number.isFinite(lng))return false;
  /* Ignore very coarse IP-ish fixes when we already have a tighter fix */
  if(userGeo&&Number.isFinite(userGeo.acc)&&Number.isFinite(acc)){
    const moved=miBetween(userGeo.lat,userGeo.lng,lat,lng);
    if(acc>Math.max(120,userGeo.acc*1.8)&&moved<0.2)return false;
  }
  const improved=!userGeo||(Number.isFinite(acc)&&(userGeo.acc==null||acc<userGeo.acc*0.85))
    ||(userGeo&&miBetween(userGeo.lat,userGeo.lng,lat,lng)>0.04);
  userGeo={lat,lng,acc:Number.isFinite(acc)?acc:null,at:Date.now()};
  updateUserMarker();
  hideGeoToast();
  if(forceWx||improved||!localWx)fetchLocalWeather(lat,lng,!!forceWx||!localWx);
  return true;
}
function requestGeo(cb){
  if(userGeo&&userGeo.acc!=null&&userGeo.acc<=80){
    fetchLocalWeather(userGeo.lat,userGeo.lng,false);
    return cb&&cb();
  }
  if(!navigator.geolocation)return cb&&cb();
  geoAsked=true;
  const opts={enableHighAccuracy:true,timeout:18000,maximumAge:0};
  navigator.geolocation.getCurrentPosition(
    pos=>{
      applyGeoPosition(pos,true);
      if(geoWatchId==null&&navigator.geolocation.watchPosition){
        geoWatchId=navigator.geolocation.watchPosition(
          p2=>applyGeoPosition(p2,false),
          ()=>{},
          {enableHighAccuracy:true,maximumAge:8000,timeout:20000});
      }
      cb&&cb();
    },
    ()=>{cb&&cb();},
    opts);
}
/* first-run permission flow (deferred until after onboarding tour) */
const geoToast=document.getElementById('geoToast');
function hideGeoToast(){geoToast.style.display='none';}
document.getElementById('gtYes').addEventListener('click',()=>requestGeo());
document.getElementById('gtNo').addEventListener('click',hideGeoToast);
let geoPromptScheduled=false;
function maybePromptGeo(){
  if(geoPromptScheduled)return;
  geoPromptScheduled=true;
  setTimeout(()=>{requestGeo(()=>{if(!userGeo)geoToast.style.display='flex';});},400);
}
/* locate-me: fly to house / blue dot */
document.getElementById('locBtn').addEventListener('click',()=>flyToMyLocation());
/* geoToWorld / worldToGeo defined near UNITS_PER_MILE */

/* ---------------- LIVE traffic: TranStar primary + TomTom fallback ----------------
   TranStar public RSS (incidents + travel times) drives Houston freeway congestion.
   Optional TRANSTAR_*_URL JSON feeds override when configured.
   TomTom fills gaps when a Traffic-enabled key is present. */
window.LIVE_TRAFFIC={ok:false,err:'',at:0,flows:new Map(),corridorTimes:new Map(),incidents:[],authOk:null,src:'',transtar:false,tomtom:false};
/* Mapping tables live in src/feeds/transtar-map.js — kept here as boot fallback until HTS_FEEDS loads */
const TRANSTAR_ROAD_MAP=(window.HTS_FEEDS&&window.HTS_FEEDS.transtar&&window.HTS_FEEDS.transtar.ROAD_MAP)||[
  {re:/beltway\s*8|sam houston toll/i,id:'bw8'},
  {re:/hardy/i,id:'hardy'},
  {re:/westpark/i,id:'westpark'},
  {re:/grand parkway|sh-?99|tx-?99/i,id:'tx99'},
  {re:/sh-?249|tomball/i,id:'sh249'},
  {re:/sh-?288|south fwy/i,id:'sh288'},
  {re:/sh-?225|la porte/i,id:'sh225'},
  {re:/sh-?146/i,id:'sh146'},
  {re:/us-?290|northwest fwy/i,id:'us290'},
  {re:/ih-?69\s*eastex|us-?59\s*eastex|eastex/i,id:'us59'},
  {re:/ih-?69\s*southwest|us-?59\s*southwest|southwest fwy|us-?59/i,id:'us59'},
  {re:/ih-?10\s*(katy|east|west)|i-?10|katy fwy|east fwy/i,id:'i10'},
  {re:/ih-?45\s*(gulf|north)|i-?45|gulf fwy|north fwy/i,id:'i45'},
  {re:/ih-?610|i-?610|the loop/i,id:'i610'},
  {re:/fm\s*1960/i,id:'fm1960'},
  {re:/sh-?6\b|hwy\s*6/i,id:'sh6'},
  {re:/fm\s*1093|westpark.*extension/i,id:'fm1093'},
  {re:/sh-?35\b/i,id:'sh35'},
  {re:/fort bend.*toll|fb toll/i,id:'fbpkwy'},
];
const TRANSTAR_CORRIDOR_HINTS=(window.HTS_FEEDS&&window.HTS_FEEDS.transtar&&window.HTS_FEEDS.transtar.CORRIDOR_HINTS)||{
  i10:[{re:/katy|barker|sh-?99|beltway 8-?west|610 west|downtown/i,ax:-3450,az:-330,bx:60,bz:-200},
       {re:/east|spur-?330|baytown|610 east/i,ax:60,az:-200,bx:3600,bz:-250}],
  us59:[{re:/richmond|rosenberg|fort\s*bend/i,ax:-4600,az:3400,bx:260,bz:60},
        {re:/southwest|sugar|missouri|stafford/i,ax:-2900,az:2000,bx:260,bz:60},
        {re:/eastex|kingwood|humble|airport/i,ax:1320,az:-3500,bx:260,bz:60}],
  i45:[{re:/north|woodlands|conroe|tomball|hardy/i,ax:-1090,az:-3400,bx:40,bz:60},
       {re:/gulf|galveston|clear creek|nasa|webster|league/i,ax:40,az:60,bx:7290,bz:6804}],
  us290:[{re:/.*/,ax:-6861,az:-4281,bx:40,bz:-210}],
  sh288:[{re:/.*/,ax:380,az:2600,bx:-634,bz:5500}],
  bw8:[{re:/.*/,ax:-1820,az:-40,bx:1820,bz:-40}],
  i610:[{re:/.*/,ax:-980,az:-30,bx:980,bz:-30}],
  hardy:[{re:/.*/,ax:100,az:-420,bx:760,bz:-3600}],
  westpark:[{re:/.*/,ax:-5414,az:428,bx:-1045,bz:555}],
  sh249:[{re:/.*/,ax:-950,az:-935,bx:-3050,bz:-4000}],
  sh225:[{re:/.*/,ax:600,az:320,bx:3420,bz:920}],
  tx99:[{re:/katy|cypress|290/i,ax:-5653,az:-181,bx:-3276,bz:-3484},
        {re:/tomball|249|spring/i,ax:-3276,az:-3484,bx:-760,bz:-5078},
        {re:/kingwood|humble|59/i,ax:-760,az:-5078,bx:2636,bz:-3194},
        {re:/baytown|146|east/i,ax:2636,az:-3194,bx:5026,bz:-152},
        {re:/league|rosharon|sugar/i,ax:5026,az:-152,bx:-3276,bz:2167}],
  fm1093:[{re:/.*/,ax:-5666,az:-296,bx:-3276,bz:2457}],
  sh35:[{re:/.*/,ax:1127,az:2891,bx:1630,bz:4920}],
  fbpkwy:[{re:/.*/,ax:150,az:190,bx:-3276,bz:2167}],
};
function findRoadByKey(key){
  if(!key||!roads||!roads.length)return null;
  const k=String(key).toLowerCase();
  let hit=roads.find(r=>String(r.def.id).toLowerCase()===k);
  if(hit)return hit;
  hit=roads.find(r=>String(r.def.id).toLowerCase().startsWith(k+'-')||String(r.def.id).toLowerCase().startsWith(k+'_'));
  if(hit)return hit;
  hit=roads.find(r=>{
    const id=String(r.def.id).toLowerCase();
    const sh=String(r.def.short||'').toLowerCase();
    const nm=String(r.def.name||'').toLowerCase();
    return id.includes(k)||sh.includes(k)||nm.includes(k);
  });
  return hit||null;
}
function mapTranStarRoadId(title){
  const ts=window.HTS_FEEDS&&window.HTS_FEEDS.transtar;
  if(ts&&ts.mapRoadId)return ts.mapRoadId(title);
  const t=String(title||'');
  for(const m of TRANSTAR_ROAD_MAP)if(m.re.test(t))return m.id;
  return null;
}
function mapTranStarDirSign(title,roadId){
  const ts=window.HTS_FEEDS&&window.HTS_FEEDS.transtar;
  if(ts&&ts.mapDirSign)return ts.mapDirSign(title,roadId,{findRoadByKey,nearestArc});
  const t=String(title||'').toLowerCase();
  const road=findRoadByKey(roadId);
  if(!road)return 1;
  const hints=TRANSTAR_CORRIDOR_HINTS[roadId];
  if(hints){
    for(const h of hints){
      if(!h.re.test(t))continue;
      const a=nearestArc(road,h.ax,h.az), b=nearestArc(road,h.bx,h.bz);
      return (b>=a)?1:-1;
    }
  }
  if(/eastbound|northbound|inbound/.test(t)){
    if(roadId==='i10'||roadId==='westpark'||roadId==='sh225')return 1;
    if(roadId==='i45'||roadId==='sh288'||roadId==='hardy'||roadId==='sh249'||roadId==='tx99'||roadId==='sh6')return 1;
    if(roadId==='us290')return -1;
    if(roadId==='us59')return /eastex|north/.test(t)?1:-1;
    return 1;
  }
  if(/westbound|southbound|outbound/.test(t)){
    if(roadId==='i10'||roadId==='westpark'||roadId==='sh225')return -1;
    if(roadId==='i45'||roadId==='sh288'||roadId==='hardy'||roadId==='sh249'||roadId==='tx99'||roadId==='sh6')return -1;
    if(roadId==='us290')return 1;
    if(roadId==='us59')return /eastex|north/.test(t)?-1:1;
    return -1;
  }
  return 1;
}
function parseRssItems(xmlText){
  const ts=window.HTS_FEEDS&&window.HTS_FEEDS.transtar;
  if(ts&&ts.parseRssItems)return ts.parseRssItems(xmlText);
  const out=[];
  if(!xmlText)return out;
  let text=String(xmlText);
  const ix=text.indexOf('<?xml');
  if(ix>0)text=text.slice(ix);
  text=text.replace(/^\uFEFF/,'');
  let doc=null;
  try{doc=new DOMParser().parseFromString(text,'application/xml');}catch(e){return out;}
  if(!doc||doc.querySelector('parsererror'))return out;
  const items=doc.querySelectorAll('item');
  for(const it of items){
    const title=(it.querySelector('title')&&it.querySelector('title').textContent)||'';
    const desc=(it.querySelector('description')&&it.querySelector('description').textContent)||'';
    const guid=(it.querySelector('guid')&&it.querySelector('guid').textContent)||title;
    const pub=(it.querySelector('pubDate')&&it.querySelector('pubDate').textContent)||'';
    out.push({title:title.trim(),desc:desc.trim(),guid:String(guid).trim(),pub});
  }
  return out;
}
function parseTravelMinutes(desc){
  const ts=window.HTS_FEEDS&&window.HTS_FEEDS.transtar;
  if(ts&&ts.parseTravelMinutes)return ts.parseTravelMinutes(desc);
  const m=String(desc||'').match(/travel\s*time\s*:\s*(\d+)\s*min/i)||String(desc||'').match(/(\d+)\s*minutes?/i);
  return m?Number(m[1]):null;
}
function corridorAbsMinMinutes(c){
  if(window.HTS_CORE&&window.HTS_CORE.corridorAbsMinMinutes)return window.HTS_CORE.corridorAbsMinMinutes(c);
  const mi=corridorDriveMiles(c);
  const maxAvgMph=c.toDt?62:70;
  return Math.max(8,Math.ceil(mi/maxAvgMph*60));
}
function saneCorridorMinutes(c,mins){
  if(window.HTS_CORE&&window.HTS_CORE.saneCorridorMinutes)return window.HTS_CORE.saneCorridorMinutes(c,mins);
  const usual=c.typMin||c.baseMin||c.realMi||20;
  if(!(mins>0))return null;
  const abs=corridorAbsMinMinutes(c);
  const lo=Math.max(abs,c.minMin!=null?c.minMin:Math.round(usual*0.72));
  const hi=c.maxMin!=null?c.maxMin:Math.round(usual*2.6);
  if(mins<lo||mins>hi)return null;
  return Math.round(mins);
}
function clampCorridorMinutes(c,mins){
  if(window.HTS_CORE&&window.HTS_CORE.clampCorridorMinutes)return window.HTS_CORE.clampCorridorMinutes(c,mins);
  const usual=c.typMin||c.baseMin||c.realMi||20;
  const abs=corridorAbsMinMinutes(c);
  const lo=Math.max(abs,c.minMin!=null?c.minMin:Math.round(usual*0.85));
  const hi=c.maxMin!=null?c.maxMin:Math.round(usual*2.4);
  return clamp(Math.round(mins>0?mins:usual),lo,hi);
}
function applyCorridorPad(c,mins){
  if(window.HTS_CORE&&window.HTS_CORE.applyCorridorPad)return window.HTS_CORE.applyCorridorPad(c,mins);
  return (mins>0?mins:0)+(c.tsPadMin||0);
}
function corridorDriveMiles(c){
  if(window.HTS_CORE&&window.HTS_CORE.corridorDriveMiles)return window.HTS_CORE.corridorDriveMiles(c);
  if(c.toDt&&c.realMi)return c.realMi;
  const anchor=c.realMi||c.miles||20;
  const mi=c.miles||anchor;
  return mi<anchor*0.72?anchor:mi;
}
function estimateCorridorMiles(road,ax,az,bx,bz){
  if(!road)return null;
  const a=nearestArc(road,ax,az),b=nearestArc(road,bx,bz);
  return Math.max(0.5,Math.abs(b-a)/UNITS_PER_MILE);
}
function sanitizeLiveMph(cur,ff,road){
  const ts=window.HTS_FEEDS&&window.HTS_FEEDS.transtar;
  if(ts&&ts.sanitizeLiveMph)return ts.sanitizeLiveMph(cur,ff,road);
  const limit=(road&&road.def&&road.def.ff)||ff||60;
  const isArt=road&&road.def&&(road.def.arterial||road.def.surface);
  const cap=isArt?Math.min(limit,52):Math.min(limit*1.05,78);
  return clamp(Math.round(cur||0),8,cap);
}
function _transtarRoadDeps(){
  return {
    findRoadByKey,
    nearestArc,
    unitsPerMile:UNITS_PER_MILE,
    mapDirSign:(title,roadId)=>mapTranStarDirSign(title,roadId),
  };
}
function applyTranStarTravelTimes(items){
  const ts=window.HTS_FEEDS&&window.HTS_FEEDS.transtar;
  if(ts&&ts.applyTravelTimes)return ts.applyTravelTimes(items,_transtarRoadDeps());
  let got=0;
  const buckets=new Map();
  for(const it of items){
    const roadId=mapTranStarRoadId(it.title);
    if(!roadId)continue;
    const mins=parseTravelMinutes(it.desc);
    if(!(mins>0))continue;
    const road=findRoadByKey(roadId);
    if(!road)continue;
    const sign=mapTranStarDirSign(it.title,roadId);
    const key=road.def.id+'_'+sign;
    let miles=null;
    const hints=TRANSTAR_CORRIDOR_HINTS[roadId];
    if(hints){
      for(const h of hints){
        if(h.re.test(it.title)){miles=estimateCorridorMiles(road,h.ax,h.az,h.bx,h.bz);break;}
      }
      if(miles==null)miles=estimateCorridorMiles(road,hints[0].ax,hints[0].az,hints[0].bx,hints[0].bz);
    }
    if(!(miles>0))miles=Math.max(4,road.s.total/UNITS_PER_MILE*0.35);
    if(!buckets.has(key))buckets.set(key,{mins:[],miles:[],road,sign});
    const b=buckets.get(key);
    b.mins.push(mins);b.miles.push(miles);
  }
  for(const [key,b] of buckets){
    const ff=b.road.def.ff||60;
    const mphs=[];
    for(let i=0;i<b.mins.length;i++){
      const mi=b.miles[i];
      if(!(mi>0)||!(b.mins[i]>0))continue;
      mphs.push(sanitizeLiveMph(mi/(b.mins[i]/60),ff,b.road));
    }
    if(!mphs.length)continue;
    mphs.sort((a,c)=>a-c);
    const cur=mphs[mphs.length>>1];
    const ratio=ff>0?clamp(cur/ff,0.08,1.25):1;
    const cong=clamp(1-ratio,0,1);
    window.LIVE_TRAFFIC.flows.set(key,{cur:Math.round(cur),ff,ratio,cong,at:Date.now(),src:'transtar'});
    got++;
  }
  return got;
}
function applyTranStarSpeedJson(data){
  const ts=window.HTS_FEEDS&&window.HTS_FEEDS.transtar;
  if(ts&&ts.applySpeedJson)return ts.applySpeedJson(data,_transtarRoadDeps());
  const rows=Array.isArray(data)?data:(data&&(data.segments||data.SegmentSpeeds||data.Speeds||data.data))||[];
  if(!Array.isArray(rows)||!rows.length)return 0;
  let got=0;
  for(const row of rows){
    const title=row.RoadwayName||row.roadway||row.Road||row.name||row.SegmentName||row.Description||'';
    const roadId=mapTranStarRoadId(title)||mapTranStarRoadId(row.Direction||'');
    if(!roadId)continue;
    const road=findRoadByKey(roadId);if(!road)continue;
    const dirTxt=String(row.Direction||row.direction||title||'');
    const sign=mapTranStarDirSign(dirTxt+' '+title,roadId);
    const ff=Number(row.FreeFlowSpeed||row.PostedSpeed||road.def.ff)||road.def.ff;
    const cur=sanitizeLiveMph(Number(row.AverageSpeed||row.Speed||row.speed||row.CurrentSpeed||row.avgSpeed),ff,road);
    if(!(cur>0))continue;
    const ratio=ff>0?clamp(cur/ff,0.08,1.25):1;
    const cong=clamp(1-ratio,0,1);
    window.LIVE_TRAFFIC.flows.set(roadId+'_'+sign,{cur:Math.round(cur),ff,ratio,cong,at:Date.now(),src:'transtar-json'});
    got++;
  }
  return got;
}
async function fetchTranStarRss(name){
  const ts=window.HTS_FEEDS&&window.HTS_FEEDS.transtar;
  if(ts&&ts.fetchRss)return ts.fetchRss(name,{fetchWithTimeout});
  const r=await fetchWithTimeout('/api/transtar/data/rss/'+name,{cache:'no-store'},10000);
  if(!r.ok)throw new Error('TranStar RSS '+name+' '+r.status);
  return parseRssItems(await r.text());
}
async function fetchTranStarOptionalJson(path){
  const ts=window.HTS_FEEDS&&window.HTS_FEEDS.transtar;
  if(ts&&ts.fetchOptionalJson)return ts.fetchOptionalJson(path);
  try{
    const r=await fetch('/api/transtar/'+path,{cache:'no-store'});
    if(!r.ok)return null;
    const ct=(r.headers.get('content-type')||'').toLowerCase();
    const text=await r.text();
    if(/html/.test(ct)||/^\s*</.test(text))return null;
    return JSON.parse(text);
  }catch(e){return null;}
}
function tomtomKey(){
  /* Paid TomTom disabled — ignore env / localStorage keys so nothing can bill. */
  return '';
}
function trafficPrimary(){
  const raw=(window.HTS_CITY&&window.HTS_CITY.feeds&&window.HTS_CITY.feeds.primaryTraffic)||'transtar';
  /* Never prefer TomTom while paid APIs are off */
  return raw==='tomtom'?'transtar':raw;
}
async function tomtomFetch(pathAndQuery){
  window.LIVE_TRAFFIC.authOk=false;
  throw new Error('tomtom_disabled');
}
async function refreshTomTomFallback(missingKeys){
  return 0; /* TomTom disabled */
}
async function refreshTomTomCorridorRoutes(){
  return 0; /* TomTom disabled */
}
async function fetchTomTomFlowAt(lat,lng){
  throw new Error('tomtom_disabled');
}
async function fetchTomTomIncidents(){
  throw new Error('tomtom_disabled');
}
async function fetchTomTomRouteMinutes(){
  return null;
}
/* (TomTom helpers above are stubs — paid API off) */
let _liveTrafficNext=0;
let _liveTrafficInFlight=null;
let _liveTrafficTimer=null;
const LIVE_TRAFFIC_POLL_MS=45*1000; /* TranStar flow — stay fresh */
const LIVE_FLOW_STALE_MS=3.5*60*1000; /* discard probes older than ~3.5 min */
const LIVE_INCIDENT_POLL_MS=40*1000; /* closures / incidents for map markers */
const LIVE_TRAFFIC_RETRY_MS=75*1000;
let _liveIncidentNext=0;
let _liveRouteNext=0;
const LIVE_ROUTE_POLL_MS=120*1000;
let _liveIncidentEls=[];
let _nwsAlertEls=[];
function clearLiveIncidentEls(){
  for(const el of _liveIncidentEls){try{el.remove();}catch(e){}}
  _liveIncidentEls=[];
}
function clearNwsAlertEls(){
  for(const el of _nwsAlertEls){try{el.remove();}catch(e){}}
  _nwsAlertEls=[];
}
const HOU_MSA_COUNTIES=(HTS_PACK&&HTS_PACK.nws&&HTS_PACK.nws.counties)
  ||/\b(Harris|Fort Bend|Montgomery|Brazoria|Galveston|Chambers|Liberty|Waller|Austin|San Jacinto)\b/i;
const HOU_MSA_PLACES=(HTS_PACK&&HTS_PACK.nws&&HTS_PACK.nws.places)
  ||/Houston|Galveston Bay|Clear Lake|The Woodlands|Woodlands|Sugar Land|Katy|Brazoria|Conroe|Pearland|Pasadena|Baytown|Cypress|Spring|League City|Humble|Kingwood|Missouri City|Stafford|Richmond|Rosenberg|Fulshear|Tomball|Jersey Village|Alief|Bellaire|West University|Heights|Montrose|Midtown|Galleria|Energy Corridor|Medical Center|Hobby|Intercontinental|IAH/i;
const NWS_POLL_MS=2*60*1000;
let _nwsNext=0;
window.LIVE_NWS={ok:false,at:0,count:0,err:'',features:[]};
async function fetchNWSAlerts(){
  const hdr=nwsHeaders();
  const host=nwsApiHost();
  const states=nwsStatesForCity(HTS_CITY_ID);
  const seen=new Set();
  const feats=[];
  for(const st of states){
    try{
      const r=await fetch(host+'/alerts/active?area='+encodeURIComponent(st),{headers:hdr,cache:'no-store'});
      if(!r.ok)continue;
      const j=await r.json();
      for(const f of (j.features||[])){
        if(!f||!f.id||seen.has(f.id))continue;
        seen.add(f.id);
        feats.push(f);
      }
    }catch(e){}
  }
  return feats.filter(f=>{
    const p=f.properties||{};
    if(p.status!=='Actual')return false;
    const area=String(p.areaDesc||'')+' '+String(p.event||'')+' '+String(p.headline||'');
    return HOU_MSA_COUNTIES.test(area)||HOU_MSA_PLACES.test(area);
  }).sort((a,b)=>nwsSeverityRank((b.properties||{}).severity)-nwsSeverityRank((a.properties||{}).severity)).slice(0,12);
}
function syncNWSAlerts(features){
  clearNwsAlertEls();
  const box=document.getElementById('alertsWeather')||document.getElementById('alerts');
  if(!box||!features||!features.length)return;
  const head=document.createElement('div');
  head.className='alertSec';
  head.textContent='Weather alerts · NWS';
  box.appendChild(head);
  _nwsAlertEls.push(head);
  for(const f of features.slice(0,6)){
    const p=f.properties||{};
    const ev=String(p.event||'');
    const kind=typeof classifyNwsEvent==='function'?classifyNwsEvent(ev):{key:'other',label:'Alert'};
    const railCls=kind.key==='flood'?' flood'
      :(kind.key==='hurricane'?' hurricane'
      :(kind.key==='tornado'?' tornado'
      :(kind.key==='severe'||kind.key==='heat'||kind.key==='fire'?' work'
      :(kind.key==='winter'?' flood':''))));
    const el=document.createElement('div');
    el.className='alert'+railCls+(typeof openWeatherReport==='function'?' clickable':'');
    const headline=p.headline||ev||'Weather alert';
    const desc=p.description?String(p.description).replace(/\s+/g,' ').slice(0,160):'';
    const sev=p.severity&&p.severity!=='Unknown'?(' · '+p.severity):'';
    el.innerHTML='<div class="at"><span class="warnPill">'+escHtml(kind.label)+'</span></div>'
      +'<div class="aMeta"><span class="aChip">NWS'+escHtml(sev)+'</span></div>'
      +'<div class="ab"><b>'+escHtml(headline)+'</b>'+(desc?' — '+escHtml(desc)+(desc.length>=160?'…':'') :'')+'</div>'
      +(typeof openWeatherReport==='function'?'<div class="aHint">Tap for alert details</div>':'');
    if(typeof openWeatherReport==='function')el.addEventListener('click',()=>openWeatherReport());
    box.appendChild(el);
    _nwsAlertEls.push(el);
  }
  refreshIncidentCount();
}
async function refreshNWSAlerts(){
  if(Date.now()<_nwsNext)return;
  _nwsNext=Date.now()+NWS_POLL_MS;
  try{
    const feats=await fetchNWSAlerts();
    window.LIVE_NWS.features=feats;
    syncNWSAlerts(feats);
    window.LIVE_NWS.ok=true;window.LIVE_NWS.count=feats.length;window.LIVE_NWS.err='';window.LIVE_NWS.at=Date.now();
    if($('wxReport')&&$('wxReport').classList.contains('on')&&typeof renderWeatherWarnings==='function')
      renderWeatherWarnings(feats);
  }catch(e){
    window.LIVE_NWS.ok=false;window.LIVE_NWS.err=String(e&&e.message?e.message:e);window.LIVE_NWS.at=Date.now();
    if($('wxReport')&&$('wxReport').classList.contains('on')&&typeof renderWeatherWarnings==='function')
      renderWeatherWarnings(window.LIVE_NWS.features||[]);
  }
}
function parseIncidentKind(text,forcedKind){
  if(forcedKind==='closure'||forcedKind==='work')return 'work';
  if(forcedKind==='police')return 'police';
  const t=String(text||'').toLowerCase();
  if(/road.?work|construction|maintenance|closure|lane clos|closed|blocked/.test(t))return 'work';
  if(/flood|high water|weather/.test(t))return 'flood';
  if(/stall|disabled|shoulder/.test(t))return 'stall';
  if(/accident|crash|collision|wreck|injury/.test(t))return 'crash';
  if(/police|troopers?|hpd|enforcement|debris|hazard/.test(t))return 'police';
  return 'incident';
}
/** Map TranStar/TomTom text + optional lat/lng onto a sim road arc. */
function locateLiveIncident(inc){
  const props=(inc&&inc.properties)||inc||{};
  const ev=(props.events&&props.events[0])||{};
  const title=props.title||ev.description||props.description||'';
  const desc=props.description||ev.description||title||'';
  const blob=title+' '+desc+' '+(Array.isArray(props.roadNumbers)?props.roadNumbers.join(' '):'');
  let roadId=props.roadId||mapTranStarRoadId(blob)||mapTranStarRoadId(title);
  let road=roadId?findRoadByKey(roadId):null;
  let px=null,pz=null,arc=null,sign=1;
  /* TomTom / GeoJSON point or line midpoint */
  const geom=inc.geometry||props.geometry;
  if(geom&&geom.coordinates){
    let lng,lat;
    if(geom.type==='Point'){lng=geom.coordinates[0];lat=geom.coordinates[1];}
    else if(geom.type==='LineString'&&geom.coordinates.length){
      const mid=geom.coordinates[Math.floor(geom.coordinates.length/2)];
      lng=mid[0];lat=mid[1];
    }else if(Array.isArray(geom.coordinates[0])&&Array.isArray(geom.coordinates[0][0])){
      const ring=geom.coordinates[0];const mid=ring[Math.floor(ring.length/2)];
      lng=mid[0];lat=mid[1];
    }else if(typeof geom.coordinates[0]==='number'){lng=geom.coordinates[0];lat=geom.coordinates[1];}
    if(lat!=null&&lng!=null&&lat>28&&lat<32&&lng>-97&&lng<-93){
      const w=geoToWorld(lat,lng);px=w.x;pz=w.z;
      if(!road){
        let best=null,bd=1e18;
        for(const r of roads){
          if(r.def.arterial||r.def.surface)continue;
          const a=nearestArc(r,px,pz);roadPos(r,a,_ip);
          const d=Math.hypot(_ip.px-px,_ip.pz-pz);
          if(d<bd){bd=d;best=r;arc=a;}
        }
        if(best&&bd<420){road=best;roadId=best.def.id;}
      }
    }
  }
  if(road&&(arc==null)){
    const hints=TRANSTAR_CORRIDOR_HINTS[road.def.id]||TRANSTAR_CORRIDOR_HINTS[roadId];
    let ax=null,az=null,bx=null,bz=null;
    if(hints){
      for(const h of hints){
        if(h.re.test(blob)){ax=h.ax;az=h.az;bx=h.bx;bz=h.bz;break;}
      }
      if(ax==null&&hints[0]){ax=hints[0].ax;az=hints[0].az;bx=hints[0].bx;bz=hints[0].bz;}
    }
    if(ax!=null){
      /* Prefer the corridor end that matches named landmarks in the alert text */
      const aArc=nearestArc(road,ax,az),bArc=nearestArc(road,bx,bz);
      const tLow=blob.toLowerCase();
      const preferB=/downtown|cbd|inner loop|610\s*(east|south|north|west)?\b/.test(tLow)?0.55:0.35;
      arc=lerp(aArc,bArc,preferB+rand()*0.25);
    }else{
      arc=(0.2+rand()*0.6)*road.s.total;
    }
    roadPos(road,arc,_ip);px=_ip.px;pz=_ip.pz;
  }
  if(road)sign=mapTranStarDirSign(blob,road.def.id)||1;
  const forced=inc.kind||props.kind||'';
  const kind=parseIncidentKind(blob+' '+(props.iconCategory||'')+' '+forced,forced);
  const roadTxt=road?road.def.short:(props.road||roadId||CITY_NAME);
  const place=px!=null?nearestDistrictName(px,pz):'';
  return {road,roadId,arc,sign,px,pz,kind,roadTxt,place,title:title||desc,desc,src:inc.source||props.source||'live'};
}
function syncLiveIncidentAlerts(){
  const list=(window.LIVE_TRAFFIC&&window.LIVE_TRAFFIC.incidents)||[];
  clearLiveIncidentEls();
  const box=document.getElementById('alertsTraffic')||document.getElementById('alerts');
  if(!box)return;
  const ranked=[...list].sort((a,b)=>{
    const ka=parseIncidentKind(((a.properties&&a.properties.title)||'')+' '+((a.properties&&a.properties.description)||'')+' '+(a.kind||''),a.kind);
    const kb=parseIncidentKind(((b.properties&&b.properties.title)||'')+' '+((b.properties&&b.properties.description)||'')+' '+(b.kind||''),b.kind);
    const rankOf=k=>({work:0,crash:1,accident:1,police:2,flood:3,stall:4}[k]??5);
    return rankOf(ka)-rankOf(kb);
  });
  const top=ranked.slice(0,10);
  const srcLabel=window.LIVE_TRAFFIC.transtar?'TranStar':(window.LIVE_TRAFFIC.tomtom?'TomTom':'Live');
  const head=document.createElement('div');
  head.className='alertSec';
  head.textContent='Road incidents · '+srcLabel;
  box.appendChild(head);
  _liveIncidentEls.push(head);
  if(!top.length){
    const empty=document.createElement('div');
    empty.className='alert clear';
    empty.innerHTML='<div class="at">All clear</div>'
      +'<div class="aMeta"><span class="aChip">'+srcLabel+'</span></div>'
      +'<div class="ab">No active freeway incidents or lane closures right now.</div>';
    box.appendChild(empty);
    _liveIncidentEls.push(empty);
  }
  for(const inc of top){
    const loc=locateLiveIncident(inc);
    const props=(inc&&inc.properties)||inc||{};
    const ev=(props.events&&props.events[0])||{};
    const roadsArr=ev.roadNumbers||props.roadNumbers||[];
    const roadTxt=loc.roadTxt||(Array.isArray(roadsArr)?roadsArr.join(' / '):String(roadsArr||props.road||''));
    const desc=loc.desc||ev.description||props.description||props.title||'Traffic incident';
    const shortDesc=String(desc).replace(/\s+/g,' ').slice(0,120);
    const cls=loc.kind==='work'?'work':(loc.kind==='flood'?'flood':(/crash|stall|police/.test(loc.kind)?'police':''));
    const label=loc.kind==='work'?'Closure':(loc.kind==='crash'||loc.kind==='accident'?'Crash':(loc.kind==='police'?'Police':(loc.kind==='stall'?'Stall':'Incident')));
    const el=document.createElement('div');
    el.className='alert'+(cls?' '+cls:'')+(loc.px!=null?' clickable':'');
    el.innerHTML='<div class="at"><svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 2 1 21h22L12 2zm0 6.5 6.3 11H5.7L12 8.5z" fill="currentColor"/></svg>'+label+'</div>'
      +'<div class="aMeta">'
      +(roadTxt?'<span class="aChip">'+roadTxt+'</span>':'')
      +(loc.place?'<span class="aChip">'+loc.place+'</span>':'')
      +'<span class="aChip">'+srcLabel+'</span>'
      +'</div>'
      +'<div class="ab">'+shortDesc+(String(desc).length>120?'…':'')+'</div>'
      +(loc.px!=null?'<div class="aHint">Click to fly there</div>':'');
    if(loc.px!=null){
      el.title='Click to fly to incident';
      el.addEventListener('click',()=>{
        stopFollow();
        camGoal.target.set(loc.px,0,loc.pz);
        camGoal.radius=280;camGoal.phi=1.05;
      });
    }
    box.appendChild(el);
    _liveIncidentEls.push(el);
  }
  syncLiveIncidentMeshes(ranked);
  refreshIncidentCount();
}
function normalizeTranStarIncidents(items,kind){
  return (items||[]).slice(0,60).map(it=>{
    const title=it.title||'Incident';
    const blob=title+(it.desc||'');
    const roadId=mapTranStarRoadId(blob);
    const road=roadId?findRoadByKey(roadId):null;
    const cat=kind==='closure'?'road_work':(/flood/i.test(blob)?'flood':(/accident|crash|collision/i.test(blob)?'accident':(/stall|disabled/i.test(blob)?'broken_down_vehicle':(/police|trooper|enforcement/i.test(blob)?'police':'incident'))));
    return {
      source:'transtar',
      kind:kind==='closure'?'closure':(kind||'incident'),
      properties:{
        title,
        description:it.desc||title,
        road:road?road.def.short:(roadId||''),
        roadId:roadId||'',
        roadNumbers:road?[road.def.short]:[],
        iconCategory:cat,
        kind:kind==='closure'?'closure':kind,
      },
      guid:(kind==='closure'?'close:':'inc:')+(it.guid||title)
    };
  });
}
async function refreshLiveTraffic(){
  if(_liveTrafficInFlight)return _liveTrafficInFlight;
  _liveTrafficInFlight=(async()=>{
  try{
    let flowGot=0;
    let usedTranStar=false;
    let usedTomTom=false; /* always false — TomTom billing disabled */
    const now=Date.now();
    const doFlow=now>_liveTrafficNext;
    if(doFlow)_liveTrafficNext=now+LIVE_TRAFFIC_POLL_MS;

    if(doFlow){
      const primary=trafficPrimary();
      const useTranStar=primary==='transtar';
      /* 1) Optional authenticated TranStar speed JSON */
      if(useTranStar){
      const speedJson=await fetchTranStarOptionalJson('speed.json');
      if(speedJson){
        const n=applyTranStarSpeedJson(speedJson);
        if(n>0){flowGot+=n;usedTranStar=true;}
      }
      /* 2) Public TranStar travel-time RSS → congestion on freeways */
      try{
        const tt=await fetchTranStarRss('traveltimes_rss.xml');
        const n=applyTranStarTravelTimes(tt);
        if(typeof indexTranStarCorridorTimes==='function')indexTranStarCorridorTimes(tt);
        if(n>0){flowGot+=n;usedTranStar=true;}
      }catch(te){ /* keep going */ }
      }
    }else{
      /* Keep last known flow count for status */
      flowGot=window.LIVE_TRAFFIC.flows?window.LIVE_TRAFFIC.flows.size:0;
    }

    /* 3) Incidents + lane closures — faster cadence than flow samples */
    refreshNWSAlerts();
    if(now>_liveIncidentNext){
      _liveIncidentNext=now+LIVE_INCIDENT_POLL_MS;
      if(trafficPrimary()==='transtar'){
      try{
        const [incItems,closeItems]=await Promise.all([
          fetchTranStarRss('incidents_rss.xml'),
          fetchTranStarRss('laneclosures_rss.xml').catch(()=>[]),
        ]);
        const activeClosures=(closeItems||[]).filter(x=>!/status:\s*inactive/i.test(x.desc||''));
        /* Closures first so map markers prioritize road closures */
        const merged=normalizeTranStarIncidents(activeClosures.slice(0,24),'closure')
          .concat(normalizeTranStarIncidents(incItems,'incident'));
        if(merged.length){
          window.LIVE_TRAFFIC.incidents=merged;
          window.LIVE_TRAFFIC.transtar=true;
          window.LIVE_TRAFFIC.incAt=Date.now();
          syncLiveIncidentAlerts();
          usedTranStar=true;
        }
      }catch(ie){ /* TomTom fallback below */ }
      }
    }

    /* 4) TomTom DISABLED (billing) — free TranStar / modeled only */
    window.LIVE_TRAFFIC.authOk=false;
    window.LIVE_TRAFFIC.tomtom=false;

    window.LIVE_TRAFFIC.transtar=!!usedTranStar||window.LIVE_TRAFFIC.transtar;
    window.LIVE_TRAFFIC.src=usedTranStar?'TranStar':(window.LIVE_TRAFFIC.src||'');
    if(flowGot>0||(window.LIVE_TRAFFIC.incidents&&window.LIVE_TRAFFIC.incidents.length)){
      window.LIVE_TRAFFIC.ok=flowGot>0;
      window.LIVE_TRAFFIC.err='';
      window.LIVE_TRAFFIC.at=Date.now();
      if(flowGot===0)window.LIVE_TRAFFIC.err='Incidents live · waiting on travel-time mapping';
    }else{
      window.LIVE_TRAFFIC.ok=false;
      window.LIVE_TRAFFIC.err=usedTranStar
        ? 'No live traffic samples yet'
        : 'Free feeds only · TranStar unavailable here · using modeled traffic';
      window.LIVE_TRAFFIC.at=Date.now();
    }
  }catch(e){
    window.LIVE_TRAFFIC.ok=false;window.LIVE_TRAFFIC.err=String(e&&e.message?e.message:e);window.LIVE_TRAFFIC.at=Date.now();
  }finally{
    _liveTrafficInFlight=null;
  }
  })();
  return _liveTrafficInFlight;
}
function startLiveTrafficPolling(){
  if(_liveTrafficTimer)return;
  _liveIncidentNext=0;
  _nwsNext=0;
  refreshLiveTraffic();
  refreshNWSAlerts();
  _liveTrafficTimer=setInterval(()=>{refreshLiveTraffic();},Math.min(LIVE_TRAFFIC_POLL_MS,LIVE_INCIDENT_POLL_MS));
}
window.startLiveTrafficPolling=startLiveTrafficPolling;

/* Smooth heading in radians — rejects 180° ADS-B flips unless they stick for a moment.
   World: +X east, −Z north. Airliner nose is +Z at yaw=0 → yaw = π − trackRad. */
function trackToYaw(trackDeg){
  const t=(((Number(trackDeg)||0)%360)+360)%360;
  return Math.PI-(t*Math.PI/180);
}
function smoothFlightYaw(f,targetDeg,dt){
  let tgtDeg=(((Number(targetDeg)||0)%360)+360)%360;
  /* Prefer motion direction when we have a clear ground track from position deltas */
  if(f._prevLat!=null&&f._prevLon!=null&&Number.isFinite(f._lat)&&Number.isFinite(f._lon)){
    const dLat=f._lat-f._prevLat,dLon=f._lon-f._prevLon;
    const dist=Math.hypot(dLat*69,dLon*59.9*Math.cos((f._lat||29.76)*Math.PI/180));
    if(dist>0.0004){
      tgtDeg=((Math.atan2(dLon*Math.cos(f._lat*Math.PI/180),dLat)*180/Math.PI)+360)%360;
    }
  }
  const tgtRad=trackToYaw(tgtDeg);
  if(f._yaw==null||!Number.isFinite(f._yaw)){f._yaw=tgtRad;f._yawFlipT=0;return f._yaw;}
  let d=tgtRad-f._yaw;
  while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;
  /* Ignore sudden ~180° flips for a short hold (noisy ADS-B) */
  if(Math.abs(d)>2.4){
    f._yawFlipT=(f._yawFlipT||0)+dt;
    if(f._yawFlipT<1.0)return f._yaw;
    f._yawFlipT=0;
  }else f._yawFlipT=0;
  const turnRate=1.35;
  const step=clamp(d,-turnRate*dt,turnRate*dt);
  f._yaw+=lerp(step,d,clamp(dt*1.8,0,1));
  while(f._yaw>Math.PI)f._yaw-=TAU;while(f._yaw<-Math.PI)f._yaw+=TAU;
  return f._yaw;
}

/* Live ADS-B → world — continuous flight like the original sim:
   fly forward every frame at live GS/track; only re-anchor when a new ADS-B fix arrives. */
function updateLiveFlights(dt){
  if(!window.LIVE_FLIGHTS_ENABLED||!window.LIVE_FLIGHT_LIST)return;
  if(simClock%12<1)syncLiveFlightVisibility();
  for(const f of LIVE_FLIGHT_LIST){
    if(!f.m||!f.m.visible)continue;
    f._prevLat=Number.isFinite(f._lat)?f._lat:null;
    f._prevLon=Number.isFinite(f._lon)?f._lon:null;
    if(!Number.isFinite(f._lat))f._lat=f._tLat;
    if(!Number.isFinite(f._lon))f._lon=f._tLon;
    if(!Number.isFinite(f._altM))f._altM=f._tAltM||2500;
    if(Number.isFinite(f._tTrk))f._trk=f._tTrk;
    else if(Number.isFinite(f._estTrk))f._trk=f._estTrk;

    /* New ADS-B sample: snap once toward the fix, then resume free flight */
    if(f._newFix&&Number.isFinite(f._tLat)&&Number.isFinite(f._tLon)){
      f._lat=lerp(f._lat,f._tLat,0.55);
      f._lon=lerp(f._lon,f._tLon,0.55);
      if(Number.isFinite(f._tAltM))f._altM=lerp(f._altM,f._tAltM,0.55);
      if(Number.isFinite(f._tTrk))f._trk=f._tTrk;
      f._newFix=false;
    }

    const gsKnown=flightGsKts(f);
    const gs=Math.max(0,gsKnown!=null?gsKnown:0);
    const trk=Number.isFinite(f._trk)?f._trk:(Number.isFinite(f._estTrk)?f._estTrk:0);
    const vsFpm=Number.isFinite(f.vsFpm)?f.vsFpm:0;
    const cls=(f.m.userData&&f.m.userData.acClass)||'airliner';
    const altFtNow=flightAltFt(f);
    const minGs=cls==='heli'?2:8;
    /* Prefer feed → estimated→ last good → altitude-assumed so airborne never freezes mid-sky.
       On the ground NEVER coast at last cruise GS (Austin Bergstrom "statue" bug). */
    let flyGs=0;
    if(f.onGround){
      /* A reported ground speed is current for accepted ground rows; keep fast runway rollouts moving. */
      if(gs>=minGs)flyGs=gs;
      else if(f._posMoved&&Number.isFinite(f._estGs)&&f._estGs>=minGs&&f._estGs<90)flyGs=f._estGs;
      else{flyGs=0;f._lastGoodGs=0;f._estGs=0;}
      f._assumedMotion=false;
    }else if(gs>=minGs){flyGs=gs;f._lastGoodGs=gs;}
    else if(Number.isFinite(f._estGs)&&f._estGs>=minGs)flyGs=f._estGs;
    else if(Number.isFinite(f._lastGoodGs)&&f._lastGoodGs>=minGs)flyGs=f._lastGoodGs;
    else if(altFtNow==null||altFtNow>600){
      flyGs=assumedAirborneGs(altFtNow,cls);
      f._assumedMotion=true;
    }else{
      f._assumedMotion=false;
    }
    if(flyGs>=minGs&&!f._assumedMotion)f._assumedMotion=false;

    if(flyGs>=minGs&&Number.isFinite(f._lat)&&Number.isFinite(f._lon)){
      const nmPerSec=flyGs/3600;
      const rad=trk*Math.PI/180;
      const dNm=nmPerSec*dt;
      f._lat+= (dNm*Math.cos(rad))/60;
      f._lon+= (dNm*Math.sin(rad))/(60*Math.max(0.2,Math.cos(f._lat*Math.PI/180)));
    }
    if(vsFpm)f._altM+=(vsFpm/60)*dt/3.28084;
    /* Only gently pull toward feed when it reported a fresh moved fix.
       Pulling every frame to a frozen fix cancels dead-reckon (Austin hang bug). */
    if(Number.isFinite(f._tLat)&&Number.isFinite(f._tLon)&&f._fixMoved){
      const age=f._feedAt?(Date.now()-f._feedAt)/1000:30;
      if(age<8){
        const pull=clamp(dt*0.015,0,1);
        f._lat=lerp(f._lat,f._tLat,pull);
        f._lon=lerp(f._lon,f._tLon,pull);
        if(Number.isFinite(f._tAltM))f._altM=lerp(f._altM,f._tAltM,pull);
      }
    }

    const altFt=altFtNow!=null?altFtNow:(f._altM*3.28084);
    const yTarget=displayAltY(altFt);
    f._y=lerp(f._y!=null?f._y:yTarget,yTarget,clamp(dt*3,0,1));

    const corr=classifyLiveCorridor(f);
    if(corr){f._corridorMode=corr.mode;f._corridorApt=corr.apt;}
    else{f._corridorMode=null;f._corridorApt=null;}

    const w=geoToWorld(f._lat,f._lon);
    const yaw=smoothFlightYaw(f,trk,dt);
    let pitchT=0.012;
    if(cls==='heli')pitchT=0.02;
    else if(vsFpm>400)pitchT=0.06;
    else if(vsFpm<-400)pitchT=0.04;
    else if(corr&&corr.mode==='arr'&&altFt!=null&&altFt<2000)pitchT=0.045;
    else if(corr&&corr.mode==='dep'&&altFt!=null&&altFt<5000)pitchT=0.07;
    const bankT=cls==='heli'?0:clamp(-(f._yawRate||0)*0.28,-0.12,0.12);
    f._pitch=lerp(f._pitch||0,pitchT,clamp(dt*1.2,0,1));
    f._bank=lerp(f._bank||0,bankT,clamp(dt*2,0,1));

    f.m.position.set(w.x,f._y,w.z);
    f.m.rotation.set(-(f._pitch||0),yaw,f._bank||0);
    /* Spin helicopter rotors */
    if(cls==='heli'&&f.m.userData){
      if(f.m.userData.rotor)f.m.userData.rotor.rotation.z+=dt*18;
      if(f.m.userData.tRotor)f.m.userData.tRotor.rotation.x+=dt*28;
    }
    if(f._yawPrev!=null){
      let rd=f._yaw-f._yawPrev;
      while(rd>Math.PI)rd-=TAU;while(rd<-Math.PI)rd+=TAU;
      f._yawRate=rd/Math.max(dt,0.001);
    }
    f._yawPrev=f._yaw;
    if(f.m.userData&&f.m.userData.gear)f.m.userData.gear.visible=(cls!=='heli'&&altFt!=null&&altFt<2800);
    f._placed=true;
  }
}
const poiCard=document.getElementById('poiCard');
let pcPoi=null;
let pcOpenedAt=0;
function closePoiCard(){
  if(poiCard)poiCard.style.display='none';
  pcPoi=null;
  pcOpenedAt=0;
}
function poiEtaText(p){
  let ox=cam.target.x,oz=cam.target.z,src='from current view';
  if(userGeo){const w=geoToWorld(userGeo.lat,userGeo.lng);
    if(Math.abs(w.x)<9000&&Math.abs(w.z)<9000){ox=w.x;oz=w.z;src='from your location';}}
  const dist=Math.hypot(ox-p.x,oz-p.z)/UNITS_PER_MILE;
  const eta=dist/(34*(1-0.5*overallCong))*60;
  return dist.toFixed(1)+' mi · about '+fmtMin(Math.max(2,eta))+' in current traffic · '+src;
}
function openPoiCard(p,cx,cy){
  pcPoi=p;
  pcOpenedAt=performance.now();
  document.getElementById('pcName').textContent=p.n;
  document.getElementById('pcAddr').textContent=p.addr||'';
  applyPlaceHistoryToCard(p.n);
  const etaEl=document.getElementById('pcEta');
  if(p.x!=null&&p.z!=null){etaEl.style.display='';etaEl.textContent=poiEtaText(p);}
  else{etaEl.style.display='none';etaEl.textContent='';}
  poiCard.style.display='block';
  poiCard.style.left=Math.min(innerWidth-310,cx+14)+'px';
  poiCard.style.top=Math.min(innerHeight-220,cy+10)+'px';
  if(p.x!=null&&p.z!=null)requestGeo(()=>{if(pcPoi===p)etaEl.textContent=poiEtaText(p);});
}
/* Dismiss place card when the camera leaves the clicked spot (× still works anytime). */
function updatePoiCardVisibility(){
  if(!pcPoi||!poiCard||poiCard.style.display==='none')return;
  if(performance.now()-pcOpenedAt<700)return;
  if(pcPoi.x==null||pcPoi.z==null)return;
  const dist=Math.hypot(cam.target.x-pcPoi.x,cam.target.z-pcPoi.z);
  const leaveR=Math.max(720,cam.radius*0.92);
  if(dist>leaveR)closePoiCard();
}
document.getElementById('pcX').addEventListener('click',()=>{closePoiCard();});
document.getElementById('pcFly').addEventListener('click',()=>{
  if(!pcPoi)return;
  camGoal.target.set(pcPoi.x,0,pcPoi.z);camGoal.radius=340;camGoal.phi=1.0;
  closePoiCard();
});
document.getElementById('pcDir').addEventListener('click',()=>{
  if(!pcPoi)return;const p=pcPoi;
  requestGeo(()=>{
    /* Prefer exact lat/lng so Google does not fuzzy-match words like "metro" to METRO HQ. */
    let dest=null;
    if(Number.isFinite(p.lat)&&Number.isFinite(p.lng))dest=p.lat+','+p.lng;
    else if(p.n==='My place'&&userGeo)dest=userGeo.lat+','+userGeo.lng;
    else if(p.x!=null&&p.z!=null&&typeof worldToGeo==='function'){
      const g=worldToGeo(p.x,p.z);
      if(g&&Number.isFinite(g.lat)&&Number.isFinite(g.lng))dest=g.lat+','+g.lng;
    }
    if(!dest){
      const city=(CITY_NAME||'Houston');
      const bare=String(p.addr||p.n||'').replace(/\s*[—–-].*$/,'').trim()||p.n;
      dest=encodeURIComponent(bare+', '+city+', TX');
    }
    let url='https://www.google.com/maps/dir/?api=1&destination='+dest+'&travelmode=driving';
    const destIsHome=p.n==='My place'||(userGeo&&Number.isFinite(p.lat)&&Math.abs(p.lat-userGeo.lat)<1e-5&&Math.abs(p.lng-userGeo.lng)<1e-5);
    if(userGeo&&!destIsHome)url+='&origin='+userGeo.lat+','+userGeo.lng;
    window.open(url,'_blank');
  });
});

/* hover tooltip for aircraft & POIs */
const tipEl=document.getElementById('tip');
let hovT=0,tipSticky=false;
tipEl.addEventListener('mouseenter',()=>{tipSticky=true;});
tipEl.addEventListener('mouseleave',()=>{tipSticky=false;tipEl.style.display='none';});
canvas.addEventListener('pointermove',e=>{
  if(tipSticky)return;
  const now=performance.now();if(now-hovT<80)return;hovT=now;
  _ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);
  _ray.setFromCamera(_ndc,camera);
  let html=null;
  let placeHint=null;
  const pHits=_ray.intersectObjects(allPlaneMeshes(),true);
  if(pHits.length){
    const f=findPlaneByHit(pHits[0].object);
    if(f){
      const live=(f.kind==='live');
      const dep=f.dep||'—',arr=f.arr||'—';
      const d0=aptInfo(dep),d1=aptInfo(arr);
      const tim=live?flightTiming(f):{depTxt:'',arrTxt:'',pct:0};
      const rt=live
        ? ((dep!=='—'||arr!=='—')?(dep+' → '+arr):'Loading route…')
        : (f.kind==='cruise'?f.city:(f.kind==='pattern'?f.apt.code+' local':(f.arriving?f.city+' → '+f.apt.code:f.apt.code+' → '+f.city)));
      const cs=live?callsignPair(f.cs):{main:f.cs,iata:''};
      html='<div class="tn">'+cs.main+(cs.iata?' · '+cs.iata:'')+(f.actype&&f.actype!=='—'?' · '+f.actype:'')+'</div>'
        +'<div class="ts">'+rt+(live&&d0.n?'<br>'+d0.n+' → '+d1.n:'')+'</div>'
        +(live?'<div class="te">'+tim.depTxt+' · '+tim.arrTxt+' · '+(f.gsKts||f.kts||0)+' kts · FL'+Math.round((f.altFt||0)/100)+'</div>'
          :'<div class="te">'+(f.status||'')+'</div>');
      placeHint={n:cs.main+(cs.iata?' · '+cs.iata:''),road:'in the sky',kind:'aircraft',at:now};
    }
  }
  if(!html&&window.AIRPORT_HITS&&AIRPORT_HITS.length){
    const ah=_ray.intersectObjects(AIRPORT_HITS,false);
    if(ah.length&&ah[0].object.userData.airport){
      const a=ah[0].object.userData.airport;
      html='<div class="tn">'+a.code+' · '+a.name+'</div>'
        +'<div class="ts">'+(a.city||CITY_NAME)+(a.elev?' · elev '+a.elev:'')+(a.intl?' · International':' · General aviation')
        +'<br>'+(a.note||'')+'</div>'
        +historyTipHtml(a.name)
        +'<div class="te">'+(a.addr||'')+' — click for directions / Wikipedia</div>';
      placeHint={n:a.code+' · '+a.name,road:'airport',kind:'airport',at:now};
    }
  }
  if(!html&&window.PICK_TOWERS){
    const th=_ray.intersectObjects(PICK_TOWERS,false);
    if(th.length&&th[0].object.userData.info){
      const inf=th[0].object.userData.info;
      const hit=th[0].object;
      html='<div class="tn">'+inf.n+'</div><div class="ts">'+inf.d+'</div>'
        +historyTipHtml(inf.n)
        +'<div class="te">Click for Wikipedia & directions</div>';
      const road=nearestRoadLabel(hit.position.x,hit.position.z);
      placeHint={n:inf.n,road:road?('near '+road):null,kind:'landmark',at:now};
    }
  }
  if(!html){
    const hits=_ray.intersectObjects(poiSprites,false);
    if(hits.length&&hits[0].object.material.opacity>0.05){
      const p=hits[0].object.userData.poi;
      html='<div class="tn">'+p.n+'</div><div class="ts">'+p.addr+'</div>'
        +historyTipHtml(p.n)
        +'<div class="te">'+poiEtaText(p)+' — click for directions / Wikipedia</div>';
      const road=nearestRoadLabel(p.x,p.z);
      placeHint={n:p.n,road:road?('near '+road):null,kind:'poi',at:now};
    }
  }
  /* Ground hover: update whereami even when no tip card (pan/look around) */
  if(!placeHint){
    const gHits=_ray.intersectObject(ground,false);
    if(gHits.length){
      const gp=gHits[0].point;
      const p=placeNameAt(gp.x,gp.z);
      const road=nearestRoadLabel(gp.x,gp.z);
      placeHint={n:p?p.n:METRO_NAME,road:road?('near '+road):null,kind:p?p.kind:'area',at:now};
    }
  }
  if(placeHint){hoverPlace=placeHint;updateWhereAmI();}
  if(html){tipEl.innerHTML=html;tipEl.style.display='block';
    tipEl.style.left=Math.min(innerWidth-340,e.clientX+16)+'px';
    tipEl.style.top=(e.clientY+14)+'px';}
  else tipEl.style.display='none';
});
function stopFollow(){
  if(followPlane&&followPlane.m&&followPlane.m.userData&&followPlane.m.userData.halo){
    followPlane.m.userData.halo.visible=false;
    followPlane.m.userData.halo.material.opacity=0;
  }
  follow=null;followPlane=null;document.getElementById('followChip').style.display='none';
  clearFlightCardHighlight();
}
function flightIdKey(f){
  if(!f)return '';
  return String(f.icao24||f.faFlightId||'')+'|'+(f.cs||'')+'|'+(f.csIata||'');
}
function clearFlightCardHighlight(){
  window._selectedFlight=null;
  const fl=$('flights');
  if(fl)fl.querySelectorAll('.fcard.selected').forEach(el=>el.classList.remove('selected'));
}
function applyFlightCardSelection(opts){
  const fl=$('flights');
  if(!fl)return;
  const f=window._selectedFlight;
  const key=flightIdKey(f);
  const doScroll=!(opts&&opts.silent);
  let scrolled=false;
  fl.querySelectorAll('.fcard').forEach(el=>{
    const on=!!(f&&key&&el.dataset.fkey===key);
    const was=el.classList.contains('selected');
    el.classList.toggle('selected',on);
    if(on&&doScroll&&!was&&!scrolled){
      scrolled=true;
      try{el.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(e){try{el.scrollIntoView(false);}catch(e2){}}
    }
  });
}
function highlightFlightCard(f){
  if(!f||f.kind==='board'){clearFlightCardHighlight();return;}
  window._selectedFlight=f;
  if(typeof syncLiveFlightVisibility==='function')syncLiveFlightVisibility();
  if(window.htsMobile&&window.htsMobile.isMobile&&window.htsMobile.isMobile()){
    try{window.htsMobile.openPanel('live');}catch(e){}
  }
  applyFlightCardSelection();
  requestAnimationFrame(()=>applyFlightCardSelection());
}
function focusAircraftInSky(f){
  if(!f||f.kind==='board')return false;
  const lat=Number.isFinite(f._lat)?f._lat:(Number.isFinite(f._tLat)?f._tLat:null);
  const lon=Number.isFinite(f._lon)?f._lon:(Number.isFinite(f._tLon)?f._tLon:null);
  let wx,wy,wz;
  if(f.m&&Number.isFinite(f.m.position.x)&&Number.isFinite(f.m.position.z)
     &&(Math.abs(f.m.position.x)>1||Math.abs(f.m.position.z)>1||f.m.position.y>50)){
    wx=f.m.position.x;wy=f.m.position.y;wz=f.m.position.z;
  }else   if(Number.isFinite(lat)&&Number.isFinite(lon)){
    const w=geoToWorld(lat,lon);
    const altFt=flightAltFt(f)||(f._altM!=null?f._altM*3.28084:(f._tAltM!=null?f._tAltM*3.28084:2000));
    wx=w.x;wy=displayAltY(altFt);wz=w.z;
    if(f.m){f.m.visible=true;f.m.position.set(wx,wy,wz);}
  }else{
    const btn=$('findPlaneBtn');
    if(btn){btn.textContent='No position for that flight';setTimeout(()=>{btn.textContent='Find aircraft in sky';},2000);}
    return false;
  }
  /* Never fly outside the rendered metro — that was the dark blank void */
  const pan=window.LIMITS?LIMITS.pan:5600;
  if(Math.abs(wx)>pan||Math.abs(wz)>pan){
    const btn=$('findPlaneBtn');
    if(btn){btn.textContent='Aircraft outside map — next…';setTimeout(()=>{btn.textContent='Find aircraft in sky';},1800);}
    return false;
  }
  if(followPlane&&followPlane!==f&&followPlane.m&&followPlane.m.userData&&followPlane.m.userData.halo){
    followPlane.m.userData.halo.visible=false;
    followPlane.m.userData.halo.material.opacity=0;
  }
  followPlane=f;follow=null;
  if(f.m){
    f.m.visible=true;
    if(f.m.userData&&f.m.userData.halo){f.m.userData.halo.visible=true;f.m.userData.halo.material.opacity=0.4;}
  }
  /* Start beside/below the plane — user can scroll freely above or pull back */
  camGoal.target.set(wx,clamp(wy*0.35,20,900),wz);
  camGoal.radius=clamp(camGoal.radius||380,180,900);
  if(camGoal.radius<200||camGoal.radius>1100)camGoal.radius=380;
  camGoal.phi=clamp(0.95,0.2,1.4);
  document.getElementById('followChip').style.display='flex';
  const cs=callsignPair(f.cs,f.csIata).main||f.cs||'aircraft';
  document.getElementById('fTxt').textContent='Following '+cs+' · '+(flightGsKts(f)!=null?flightGsKts(f)+' kts':'— kts')+' · scroll to zoom';
  highlightFlightCard(f);
  return true;
}
function findNextAircraftInSky(){
  syncLiveFlightVisibility();
  let list=(window._syncedLiveFlights&&window._syncedLiveFlights.length)
    ? window._syncedLiveFlights.filter(flightInSkyBounds)
    : getSyncedLiveFlights(16);
  /* Prefer takeoff/landing corridor traffic so Find shows planes near airports first */
  list=list.slice().sort((a,b)=>{
    const ca=classifyLiveCorridor(a)?1:0,cb=classifyLiveCorridor(b)?1:0;
    return cb-ca;
  });
  if(!list.length){
    const btn=$('findPlaneBtn');
    if(btn){btn.textContent='No aircraft yet — wait for ADS-B…';setTimeout(()=>{btn.textContent='Find aircraft in sky';},2200);}
    return;
  }
  let tries=0;
  while(tries<list.length){
    window._findPlaneIdx=((window._findPlaneIdx||0)%list.length);
    const f=list[window._findPlaneIdx++];
    tries++;
    if(focusAircraftInSky(f)){
      const btn=$('findPlaneBtn');
      const tag=f._corridorMode==='arr'?' · on approach':(f._corridorMode==='dep'?' · departing':'');
      if(btn)btn.textContent='Find next ('+window._findPlaneIdx+'/'+list.length+')'+tag;
      return;
    }
  }
  const btn=$('findPlaneBtn');
  if(btn){btn.textContent='No in-view aircraft right now';setTimeout(()=>{btn.textContent='Find aircraft in sky';},2200);}
}
document.getElementById('fX').addEventListener('click',stopFollow);
addEventListener('keydown',e=>{if(e.key==='Escape')stopFollow();});
(function wireFindPlane(){
  const btn=$('findPlaneBtn');
  if(btn)btn.addEventListener('click',e=>{e.preventDefault();findNextAircraftInSky();});
  const fl=$('flights');
  if(fl)fl.addEventListener('click',e=>{
    if(e.target&&e.target.closest&&e.target.closest('a'))return; /* keep Track links working */
    const card=e.target&&e.target.closest&&e.target.closest('.fcard');
    if(!card)return;
    const kids=[...fl.children];
    const i=kids.indexOf(card);
    if(i<0)return;
    const list=(window._syncedLiveFlights&&window._syncedLiveFlights.length)?window._syncedLiveFlights:[];
    const f=list[i];
    if(f&&f.kind==='live')focusAircraftInSky(f);
  });
})();
function angleLerp(a,b,t){let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return a+d*t;}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('wheel',e=>{e.preventDefault();
  const lim=camRadiusLimits();
  camGoal.radius=clamp(camGoal.radius*Math.pow(1.0016,e.deltaY),lim.rmin,lim.rmax);},{passive:false});
function pan(dx,dy){
  const k=cam.radius*0.0013;
  camGoal.target.x-=(Math.cos(cam.theta)*dx + Math.sin(cam.theta)*dy)*k;
  camGoal.target.z-=(-Math.sin(cam.theta)*dx + Math.cos(cam.theta)*dy)*k;
  camGoal.target.x=clamp(camGoal.target.x,-LIMITS.pan,LIMITS.pan);
  camGoal.target.z=clamp(camGoal.target.z,-LIMITS.pan,LIMITS.pan);
}
const touches=new Map();let pinchD=0,pinchMid=null;
canvas.addEventListener('touchstart',e=>{e.preventDefault();
  for(const t of e.changedTouches)touches.set(t.identifier,{x:t.clientX,y:t.clientY});
  if(touches.size===2){const a=[...touches.values()];pinchD=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
    pinchMid={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};}},{passive:false});
canvas.addEventListener('touchmove',e=>{e.preventDefault();
  if(touches.size===1&&e.touches.length===1){const t=e.touches[0];const p=touches.get(t.identifier);if(!p)return;
    const lim=camRadiusLimits();
    camGoal.theta-=(t.clientX-p.x)*0.006;camGoal.phi=clamp(camGoal.phi-(t.clientY-p.y)*0.005,lim.phiMin,lim.phiMax);
    p.x=t.clientX;p.y=t.clientY;}
  else if(e.touches.length===2){const a=e.touches;
    const d=Math.hypot(a[0].clientX-a[1].clientX,a[0].clientY-a[1].clientY);
    const mid={x:(a[0].clientX+a[1].clientX)/2,y:(a[0].clientY+a[1].clientY)/2};
    if(pinchD>0){const lim=camRadiusLimits();camGoal.radius=clamp(camGoal.radius*(pinchD/d),lim.rmin,lim.rmax);}
    if(pinchMid)pan(mid.x-pinchMid.x,mid.y-pinchMid.y);
    pinchD=d;pinchMid=mid;
    for(const t of a){const p=touches.get(t.identifier);if(p){p.x=t.clientX;p.y=t.clientY;}}}},{passive:false});
canvas.addEventListener('touchend',e=>{for(const t of e.changedTouches)touches.delete(t.identifier);
  if(touches.size<2){pinchD=0;pinchMid=null;}},{passive:false});

const CAM_VIEWS={
  city:{theta:-0.65,phi:0.78,radius:HTS_HAS_PACK?1550:4300,target:(function(){const d=packDowntown();return HTS_HAS_PACK?[d.x,d.z]:[-250,-50];})()},
  freeway:{theta:-1.2,phi:1.34,radius:150,target:(function(){const d=packDowntown();return HTS_HAS_PACK?[d.x+80,d.z+40]:[-980,-255];})()},
};
const INNER=new Set(['downtown','galleria','medcenter','greenway','heights','montrose','riveroaks','bellaire','midtown','eastend','fifthward','memorial','westu','meyerland','westchase','sharpstown','gulfton','capitol','ut','eastaustin','southcongress','zilker','hydepark','mueller','rainey','riverside','backbay','fenway','seaport','fidi','midtown','uptown','alamo','riverwalk']);
for(const d of DISTRICTS){
  let rad=INNER.has(d.id)?560:920;
  if(d.id==='ut')rad=320;
  if(d.id==='capitol')rad=360;
  CAM_VIEWS[d.id]={theta:-0.9+rand()*1.8,phi:0.98,radius:rad,target:[d.x,d.z]};
}
const FACILITIES=HTS_HAS_PACK?{}:{fac_rice:[-342,683],fac_uh:[390.9,635.2],fac_tsu:[183.1,630.5],fac_lamar:[-842,327],
  fac_bellairehs:[-1102,892],fac_lakewood:[-545,455],fac_cocathedral:[55,240],
  fac_isgh:[-682,401],fac_bethisrael:[-914,1129]};
for(const k in FACILITIES)
  CAM_VIEWS[k]={theta:-0.7,phi:1.02,radius:300,target:FACILITIES[k]};
for(const a of AIRPORTS)
  CAM_VIEWS[a.id]={theta:-0.7,phi:1.02,radius:a.intl?860:500,target:[a.x,a.z]};
/* fly-to shortcuts for major attractions (geo-accurate) */
(function(){
  if(HTS_PACK&&HTS_PACK.pois&&HTS_PACK.pois.length){
    for(const p of HTS_PACK.pois){
      CAM_VIEWS[p.id]={theta:-0.85,phi:1.02,radius:p.r||400,target:[p.x,p.z]};
    }
    if(HTS_PACK.camExtras){
      for(const c of HTS_PACK.camExtras){
        CAM_VIEWS[c.id]={theta:-0.85,phi:1.02,radius:c.radius||360,target:c.target};
      }
    }
    return;
  }
  const spots={
    poi_nasa:[29.5593,-95.0899,720],
    poi_sch:[29.5518,-95.0981,520],
    poi_meow:[29.7708,-95.3425,380],
    poi_kemah:[29.5427,-95.0194,520],
    poi_typhoon:[29.7705,-95.7440,520],
    poi_splashtown:[30.0645,-95.4355,520],
    poi_nrg:[29.6847,-95.4107,420],
    poi_astro:(function(){const g=worldToGeo(ASTRO.x,ASTRO.z);return [g.lat,g.lng,480];})(),
    poi_zoo:[29.7162,-95.3906,380],
    poi_hmns:[29.7219,-95.3895,360],
    poi_sanjac:[29.7499,-95.0807,620],
  };
  for(const id in spots){
    const [lat,lng,r]=spots[id];
    const w=geoToWorld(lat,lng);
    CAM_VIEWS[id]={theta:-0.85,phi:1.02,radius:r,target:[w.x,w.z]};
  }
})();

/* Austin: ensure Fly-to Attractions list is city-correct (not Houston leftovers) */
if(HTS_HAS_PACK&&HTS_PACK&&HTS_PACK.jumpGroups){(function applyPackJumpSelect(){
  const sel=document.getElementById('locSelect');
  if(!sel)return;
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const parts=['<option value="city" selected>Full metro view</option>'];
  for(const g of HTS_PACK.jumpGroups){
    parts.push('<optgroup label="'+esc(g.label)+'">');
    for(const [val,label] of g.options)parts.push('<option value="'+esc(val)+'">'+esc(label)+'</option>');
    parts.push('</optgroup>');
  }
  if(HTS_PACK.freewayJumpLabel)parts.push('<option value="freeway">'+esc(HTS_PACK.freewayJumpLabel)+'</option>');
  sel.innerHTML=parts.join('');
})();}

/* ---------------- facility buildings (schools / worship) ---------------- */
function facilityBuilding(kind,x,z){
  const baseCol=kind==='school'?0x1d2b3a:kind==='mosque'?0x163227:kind==='church'?0x2a2520:0x22272f;
  const roofCol=kind==='school'?0x2f5a80:kind==='mosque'?0x2c5c3f:kind==='church'?0x6b5130:0x39414b;
  const base=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:baseCol}));
  const w=52+rand()*30,d=40+rand()*26,h=12+rand()*8;
  base.scale.set(w,h,d);
  base.position.set(x,h*0.5,z);
  base.rotation.y=(rand()-.5)*0.2;
  gDetail.add(base);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:roofCol}));
  roof.scale.set(w*1.02,3.2,d*1.02);
  roof.position.set(x,h+1.6,z);
  roof.rotation.y=base.rotation.y;
  gDetail.add(roof);
  if(kind==='mosque'){
    const dome=new THREE.Mesh(new THREE.SphereGeometry(10,14,10),new THREE.MeshLambertMaterial({color:0x2c5c3f}));
    dome.scale.set(1,0.72,1);
    dome.position.set(x,h+8.5,z);
    gDetail.add(dome);
  }else if(kind==='church'){
    const steeple=new THREE.Mesh(new THREE.CylinderGeometry(1.2,3.2,20,6),new THREE.MeshLambertMaterial({color:0xb9b0a3}));
    steeple.position.set(x+w*0.22,h+12,z-d*0.18);
    gDetail.add(steeple);
  }else if(kind==='school'){
    const gym=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0x283241}));
    gym.scale.set(w*0.52,h*0.85,d*0.65);
    gym.position.set(x-w*0.38,h*0.42,z+d*0.22);
    gym.rotation.y=base.rotation.y;
    gDetail.add(gym);
  }
  return base;
}
/* tie facilities to POI system (hover cards + badges) */
const FACILITY_POIS=HTS_IS_AUS?(function(){
  const rows=[
    {n:'University of Texas at Austin',k:'school',lat:30.28565,lng:-97.73921,addr:'University of Texas · Main Campus'},
    {n:'St. Edward\'s University',k:'school',lat:30.2295,lng:-97.7545,addr:'3001 S Congress Ave'},
    {n:'Austin Community College — Highland',k:'school',lat:30.3295,lng:-97.7155,addr:'6101 Airport Blvd'},
    {n:'Austin High School',k:'school',lat:30.2645,lng:-97.7638,addr:'1715 Cesar Chavez St'},
    {n:'McCallum High School',k:'school',lat:30.3265,lng:-97.7315,addr:'5600 Sunshine Dr'},
    {n:'Texas State University',k:'school',lat:29.889,lng:-97.939,addr:'601 University Dr, San Marcos'},
    {n:'Round Rock High School',k:'school',lat:30.5085,lng:-97.6785,addr:'300 N Lake Creek Dr, Round Rock'},
    {n:'St. David\'s Episcopal Church',k:'worship',lat:30.2685,lng:-97.7415,addr:'301 E 8th St'},
    {n:'Central Christian Church',k:'worship',lat:30.2735,lng:-97.7425,addr:'1110 Guadalupe St'},
  ];
  return rows.map(r=>{
    const w=geoToWorld(r.lat,r.lng);
    return {n:r.n,k:r.k,x:w.x,z:w.z,addr:r.addr};
  });
})():(HTS_HAS_PACK?[]:[
  {n:'Rice University',k:'school',x:-342,z:683,addr:'6100 Main St · est. 1912'},
  {n:'University of Houston',k:'school',x:390.9,z:635.2,addr:'4800 Calhoun Rd'},
  {n:'Texas Southern University',k:'school',x:183.1,z:630.5,addr:'3100 Cleburne St'},
  {n:'Lamar High School',k:'school',x:-842,z:327,addr:'3325 Westheimer Rd'},
  {n:'Bellaire High School',k:'school',x:-1102,z:892,addr:'5100 Maple St'},
  {n:'Lakewood Church',k:'worship',x:-545,z:455,addr:'3700 Southwest Fwy'},
  {n:'Co-Cathedral of the Sacred Heart',k:'worship',x:55,z:240,addr:'1111 St Joseph Pkwy'},
  {n:'Islamic Society of Greater Houston',k:'worship',x:-682,z:401,addr:'3110 Eastside St'},
  {n:'Congregation Beth Israel',k:'worship',x:-914,z:1129,addr:'5600 N Braeswood Blvd'},
]);
for(const p of FACILITY_POIS){
  /* UT Tower already placed — skip duplicate massing under the lantern */
  if(HTS_IS_AUS&&/University of Texas at Austin/i.test(p.n)){
    EXCLUDES.push({x:p.x,z:p.z,r:90});
    continue;
  }
  /* Keep churches/schools off Capitol grounds and athletic venues */
  if(HTS_IS_AUS){
    const cap=geoToWorld(30.2747,-97.7404);
    const dkr=geoToWorld(30.28361,-97.73252);
    const moody=geoToWorld(30.2806,-97.7323);
    if(Math.hypot(p.x-cap.x,p.z-cap.z)<160)continue;
    if(Math.hypot(p.x-dkr.x,p.z-dkr.z)<55)continue;
    if(Math.hypot(p.x-moody.x,p.z-moody.z)<42)continue;
  }
  const kind=(p.n.includes('Islamic')?'mosque':(p.n.includes('Church')||p.n.includes('Cathedral')||p.n.includes('Congregation')||p.n.includes('Episcopal')?'church':'school'));
  const b=facilityBuilding(kind,p.x,p.z);
  b.userData.info={n:p.n,d:p.addr};
  EXCLUDES.push({x:p.x,z:p.z,r:55});
  if(!window.PICK_TOWERS)window.PICK_TOWERS=[];
  PICK_TOWERS.push(b);
  registerLandmarkHit(p.x,16,p.z,60,30,50,
    {n:p.n,d:p.addr},
    {n:p.n,x:p.x,z:p.z,addr:p.addr});
}

/* ---------------- simulation clock ---------------- */
let liveMode=true,timeScale=60,simH=12,weekend=false,scrubbing=false;
window.simDayOffset=0;
function simDayLabel(off){
  const d=off!=null?off:(window.simDayOffset||0);
  if(d<=0)return 'Today';
  if(d===1)return 'Tomorrow';
  return '+'+d+' days';
}
function recomputeSimOffset(){
  const nowH=houstonNow(true);
  window.simOffsetSec=((window.simDayOffset||0)*24+simH-nowH)*3600;
}
function setSimDayOffset(day){
  window.simDayOffset=clamp(Math.round(+day||0),0,2);
  document.querySelectorAll('#dayBtns .btn').forEach(b=>{
    b.classList.toggle('on',String(b.dataset.day)===String(window.simDayOffset));
  });
  const lab=$('timeDayLabel');
  if(lab){
    const d=new Date(Date.now()+((window.simDayOffset||0)*86400)*1000);
    const pretty=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:CHI_TZ});
    lab.textContent='Preview day · '+simDayLabel()+' · '+pretty;
  }
  recomputeSimOffset();
}
function syncDayButtons(){
  document.querySelectorAll('#dayBtns .btn').forEach(b=>{
    b.classList.toggle('on',String(b.dataset.day)===String(window.simDayOffset||0));
  });
  const lab=$('timeDayLabel');
  if(lab){
    if(liveMode)lab.textContent='Live clock · '+simDayLabel(0);
    else{
      const d=new Date(Date.now()+(window.simOffsetSec||0)*1000);
      const pretty=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:CHI_TZ});
      lab.textContent='Preview day · '+simDayLabel()+' · '+pretty;
    }
  }
}
const CHI_TZ=(window.HTS_CITY&&window.HTS_CITY.feeds&&window.HTS_CITY.feeds.timezone)||'America/Chicago';
let _houClock={at:0,h:12,weekend:false};
let _calSyncT=0;
function chicagoParts(d){
  if(window.HTS_CORE&&window.HTS_CORE.chicagoParts)return window.HTS_CORE.chicagoParts(d);
  return new Intl.DateTimeFormat('en-US',{
    timeZone:CHI_TZ,hour:'numeric',minute:'numeric',second:'numeric',hour12:false,weekday:'short'
  }).formatToParts(d);
}
function partsToHourWeekend(p){
  if(window.HTS_CORE&&window.HTS_CORE.partsToHourWeekend)return window.HTS_CORE.partsToHourWeekend(p);
  const g=k=>{const f=p.find(x=>x.type===k);return f?f.value:'0';};
  const wd=g('weekday');
  return {
    h:(+g('hour')%24)+(+g('minute'))/60+(+g('second'))/3600,
    we:(wd==='Sat'||wd==='Sun')
  };
}
/* Cached America/Chicago clock — Intl is expensive; extrapolate between samples */
function houstonNow(force){
  const t=typeof performance!=='undefined'?performance.now():Date.now();
  if(!force&&_houClock.at&&(t-_houClock.at)<450){
    return (_houClock.h+((t-_houClock.at)/1000)/3600)%24;
  }
  try{
    const r=partsToHourWeekend(chicagoParts(new Date()));
    _houClock={at:t,h:r.h,weekend:r.we};
    if(liveMode)weekend=r.we;
    return r.h;
  }catch(e){
    const d=new Date();
    const we=(d.getDay()===0||d.getDay()===6);
    const h=d.getHours()+d.getMinutes()/60+d.getSeconds()/3600;
    _houClock={at:t,h,weekend:we};
    if(liveMode)weekend=we;
    return h;
  }
}
/* Weekend/date pattern always matches the HUD sim instant (live OR time-lapse) */
function syncSimCalendar(){
  try{
    const d=liveMode?new Date():new Date(Date.now()+(window.simOffsetSec||0)*1000);
    const r=partsToHourWeekend(chicagoParts(d));
    weekend=r.we;
    return r;
  }catch(e){
    const d=liveMode?new Date():new Date(Date.now()+(window.simOffsetSec||0)*1000);
    weekend=(d.getDay()===0||d.getDay()===6);
    return null;
  }
}
simH=houstonNow(true);
syncSimCalendar();

/* ---------------- drive-time corridors ---------------- */
/* Downtown dock: TranStar "… to Downtown" titles + researched miles.
   minMin must respect physics (mi ÷ ~62 mph avg) — never claim 13 min for Sugar Land. */
const CORRIDORS=[
 {road:'i10',  label:'I-10 · Katy',       ax:-3450,az:-330, bx:60,  bz:-200, realMi:26, typMin:32, minMin:24, maxMin:85, toDt:true,
  tsIn:/IH-10\s+Katy\s+Eastbound\s+from\s+SH-99\s+Grand Parkway\s+to\s+Downtown/i,
  tsOut:/IH-10\s+Katy\s+Westbound\s+from\s+Downtown\s+to\s+SH-99\s+Grand Parkway/i},
 {road:'us290',label:'US-290 · Cypress',  ax:-2950,az:-2380,bx:40,  bz:-210, realMi:28, typMin:36, minMin:26, maxMin:90, toDt:true,
  tsIn:/US-290\s+Northwest\s+Eastbound\s+from\s+Barker-Cypress\s+to\s+Downtown/i,
  tsOut:/US-290\s+Northwest\s+Westbound\s+from\s+Downtown\s+to\s+Barker-Cypress/i},
 {road:'i45',  label:'I-45 · Woodlands',  ax:-1090,az:-3400,bx:40,  bz:60,   realMi:30, typMin:38, minMin:28, maxMin:90, toDt:true,
  tsIn:/IH-45\s+North\s+Southbound\s+from\s+SH-242\s+to\s+Downtown/i,
  tsOut:/IH-45\s+North\s+Northbound\s+from\s+Downtown\s+to\s+SH-242/i},
 /* TranStar only publishes BW8-West→Downtown for this corridor; pad ~8 min for Sugar Land proper. */
 {road:'us59', label:'US-59 · Sugar Land',ax:-2900,az:2000, bx:260, bz:60,   realMi:22, typMin:30, minMin:22, maxMin:80, toDt:true, tsPadMin:8,
  tsIn:/IH-69\s+Southwest\s+Northbound\s+from\s+Beltway\s+8-West\s+to\s+Downtown/i,
  tsOut:/IH-69\s+Southwest\s+Southbound\s+from\s+Downtown\s+to\s+Beltway\s+8-West/i},
 {road:'sh288',label:'SH-288 · Pearland', ax:380,  az:2600, bx:40,  bz:60,   realMi:18, typMin:24, minMin:17, maxMin:65, toDt:true,
  tsIn:/SH-288\s+Northbound\s+from\s+FM-518\s+to\s+Downtown/i,
  tsOut:/SH-288\s+Southbound\s+from\s+Downtown\s+to\s+FM-518/i},
 {road:'i10',  label:'I-10 · Baytown',    ax:3600, az:-250, bx:60,  bz:-200, realMi:27, typMin:34, minMin:24, maxMin:85, toDt:true,
  tsIn:/IH-10\s+East\s+Westbound\s+from\s+Spur-330\s+to\s+Downtown/i,
  tsOut:/IH-10\s+East\s+Eastbound\s+from\s+Downtown\s+to\s+Spur-330/i},
 /* Richmond→Downtown = IH-69 SW from SH-99 GP (not FM 1093). */
 {road:'us59', label:'US-59 · Richmond',  ax:-4600,az:3400, bx:260, bz:60,   realMi:29, typMin:40, minMin:28, maxMin:95, toDt:true,
  tsIn:/IH-69\s+Southwest\s+Northbound\s+from\s+SH-99\s+Grand Parkway\s+to\s+Downtown/i,
  tsOut:/IH-69\s+Southwest\s+Southbound\s+from\s+Downtown\s+to\s+SH-99\s+Grand Parkway/i},
 {road:'us59', label:'US-59 · Kingwood',  ax:1320, az:-3500,bx:260, bz:60,   realMi:26, typMin:34, minMin:24, maxMin:85, toDt:true,
  tsIn:/IH-69\s+Eastex\s+Southbound\s+from\s+Loop-494\s+to\s+Downtown/i,
  tsOut:/IH-69\s+Eastex\s+Northbound\s+from\s+Downtown\s+to\s+(?:FM-1960|Loop-494|Beltway\s+8-North)/i},
 {road:'tx99', label:'TX-99 · Cypress',   ax:-5653,az:-181, bx:-4031,bz:-2905,realMi:18, typMin:22, minMin:16, maxMin:50, toDt:false},
 {road:'tx99', label:'TX-99 · Kingwood',  ax:-760, az:-5078,bx:1881, bz:-3774,realMi:22, typMin:26, minMin:18, maxMin:55, toDt:false},
 {road:'westpark',label:'Westpark · Katy', ax:-5414,az:428,  bx:-1045,bz:555,  realMi:24, typMin:28, minMin:20, maxMin:60, toDt:false},
 {road:'fm1093',label:'FM 1093 · Katy',  ax:-5666,az:-296, bx:-1045,bz:555,  realMi:22, typMin:28, minMin:22, maxMin:65, toDt:false},
 {road:'i45',  label:'I-45 · Galveston',  ax:2300, az:5400, bx:7290, bz:6804, realMi:42, typMin:48, minMin:38, maxMin:90, toDt:false},
 {road:'us290',label:'US-290 · Waller',   ax:-5400,az:-4050,bx:-6861,bz:-4281,realMi:18, typMin:22, minMin:16, maxMin:50, toDt:false},
 {road:'sh146',label:'SH-146 · Baytown',  ax:2900, az:3320, bx:5152, bz:428,  realMi:16, typMin:20, minMin:14, maxMin:45, toDt:false},
];
if(HTS_PACK&&HTS_PACK.corridors&&HTS_PACK.corridors.length){
  CORRIDORS.length=0;
  for(const c of HTS_PACK.corridors)CORRIDORS.push(c);
}
const DOWNTOWN_CORRIDORS=()=>CORRIDORS.filter(c=>c.toDt);
for(const c of CORRIDORS){
  c.roadObj=findRoadByKey(c.road);
  if(!c.roadObj){c.aArc=0;c.bArc=1;c.baseMin=c.typMin||20;c.miles=c.realMi||20;continue;}
  c.aArc=nearestArc(c.roadObj,c.ax,c.az);
  c.bArc=nearestArc(c.roadObj,c.bx,c.bz);
  const miles=Math.abs(c.bArc-c.aArc)/UNITS_PER_MILE;
  c.baseMin=miles/(c.roadObj.def.ff*0.92)*60;
  /* Prefer researched road miles for display / sanity — sim geometry can shrink after OSM snap */
  c.miles=c.realMi||miles;
}
function corridorTime(c,outbound){
  /* Downtown: scale researched typical by rush/weather — avoid road-wide mph shortcuts. */
  if(c.toDt){
    const rush=(typeof demand==='function'?demand(simH,weekend):0.45);
    const wx=(window.wxBlend&&wxBlend.cong)||0;
    const factor=clamp(0.72+rush*0.85+wx*0.35,0.7,2.1);
    return clampCorridorMinutes(c,(c.typMin||30)*factor);
  }
  const road=c.roadObj||findRoadByKey(c.road);
  if(!road||!road.dirs||!road.dirs.length)return c.typMin||c.baseMin||20;
  if(!c.roadObj)c.roadObj=road;
  const lo=Math.min(c.aArc,c.bArc),hi=Math.max(c.aArc,c.bArc);
  const incTravel=outbound?(c.aArc>c.bArc):(c.bArc>c.aArc);
  const dir=road.dirs[incTravel?0:1]||road.dirs[0];
  if(!dir||!dir.segCong)return c.typMin||c.baseMin||20;
  const segN=dir.segCong.length,L=road.s.total;
  let t=0;
  for(let k=0;k<segN;k++){
    const s0=k/segN*L,s1=(k+1)/segN*L;
    const ov=Math.min(hi,s1)-Math.max(lo,s0);
    if(ov<=0)continue;
    const liveKey=road.def.id+'_'+dir.sign;
    const flow=window.LIVE_TRAFFIC&&window.LIVE_TRAFFIC.flows&&window.LIVE_TRAFFIC.flows.get(liveKey);
    let mph;
    if(liveFlowFresh(flow))mph=sanitizeLiveMph(flow.cur,flow.ff,road);
    else mph=Math.max(9, road.def.ff*(1-0.74*dir.segCong[k])*wxBlend.speed);
    t+=(ov/UNITS_PER_MILE)/mph*60;
  }
  const anchor=corridorDriveMiles(c);
  const mi=c.miles||anchor;
  if(mi>0.5&&mi<anchor*0.8)t*=anchor/mi;
  return clampCorridorMinutes(c,t||c.typMin||20);
}
function corridorPanelKey(c,sign){
  const ts=window.HTS_FEEDS&&window.HTS_FEEDS.transtar;
  if(ts&&ts.corridorPanelKey)return ts.corridorPanelKey(c,sign);
  return c.road+'|'+c.ax+','+c.az+'|'+c.bx+','+c.bz+'|'+sign;
}
function findCorridorForTranStarItem(title,roadId){
  const ts=window.HTS_FEEDS&&window.HTS_FEEDS.transtar;
  if(ts&&ts.findCorridorForItem)return ts.findCorridorForItem(title,roadId,CORRIDORS);
  const t=String(title||'');
  const tl=t.toLowerCase();
  for(const c of CORRIDORS){
    if(c.road!==roadId)continue;
    const dest=(c.label.split(' · ')[1]||'').toLowerCase();
    const token=dest.split(/[\s/]+/)[0];
    if(token.length>2&&tl.includes(token))return c;
  }
  const hints=TRANSTAR_CORRIDOR_HINTS[roadId];
  if(hints){
    for(const h of hints){
      if(h.re&&!h.re.test(t))continue;
      for(const c of CORRIDORS){
        if(c.road!==roadId)continue;
        if(Math.abs(c.ax-h.ax)<900&&Math.abs(c.az-h.az)<900&&Math.abs(c.bx-h.bx)<900&&Math.abs(c.bz-h.bz)<900)return c;
      }
    }
  }
  return null;
}
function corridorTravelSign(c,outbound){
  const road=c.roadObj||findRoadByKey(c.road);
  if(!road||!road.dirs.length)return 1;
  const incTravel=outbound?(c.aArc>c.bArc):(c.bArc>c.aArc);
  return (road.dirs[incTravel?0:1]||road.dirs[0]).sign;
}
function indexTranStarCorridorTimes(items){
  const ts=window.HTS_FEEDS&&window.HTS_FEEDS.transtar;
  if(ts&&ts.indexCorridorTimes){
    return ts.indexCorridorTimes(items,{
      corridors:CORRIDORS,
      travelSign:corridorTravelSign,
      mapDirSign:(title,roadId)=>mapTranStarDirSign(title,roadId),
      saneMinutes:saneCorridorMinutes,
      applyPad:applyCorridorPad,
    });
  }
  if(!window.LIVE_TRAFFIC.corridorTimes)window.LIVE_TRAFFIC.corridorTimes=new Map();
  const list=items||[];
  for(const c of CORRIDORS){
    if(!c.toDt)continue;
    for(const outbound of [false,true]){
      const re=outbound?c.tsOut:c.tsIn;
      if(!re)continue;
      let best=null;
      for(const it of list){
        const title=String(it.title||'');
        if(/\bHOV\b/i.test(title))continue;
        if(!re.test(title))continue;
        const mins=parseTravelMinutes(it.desc);
        if(!(mins>0))continue;
        if(!best||mins<best.mins)best={mins,title};
      }
      if(!best)continue;
      const okMins=saneCorridorMinutes(c,applyCorridorPad(c,best.mins));
      if(okMins==null)continue;
      const sign=corridorTravelSign(c,outbound);
      window.LIVE_TRAFFIC.corridorTimes.set(corridorPanelKey(c,sign),{
        mins:okMins,at:Date.now(),src:'transtar',title:best.title.trim(),
        rawMins:best.mins,pad:c.tsPadMin||0
      });
    }
  }
  for(const it of list){
    const title=String(it.title||'');
    if(/\bHOV\b/i.test(title))continue;
    const roadId=mapTranStarRoadId(title);if(!roadId)continue;
    const mins=parseTravelMinutes(it.desc);if(!(mins>0))continue;
    const corr=findCorridorForTranStarItem(title,roadId);if(!corr)continue;
    if(corr.toDt&&(corr.tsIn||corr.tsOut))continue;
    const okMins=saneCorridorMinutes(corr,applyCorridorPad(corr,mins));if(okMins==null)continue;
    const sign=mapTranStarDirSign(title,roadId);
    const key=corridorPanelKey(corr,sign);
    if(window.LIVE_TRAFFIC.corridorTimes.has(key))continue;
    window.LIVE_TRAFFIC.corridorTimes.set(key,{
      mins:okMins,at:Date.now(),src:'transtar',title:title.trim()
    });
  }
}
function corridorLiveEntry(c,outbound){
  const ct=window.LIVE_TRAFFIC&&window.LIVE_TRAFFIC.corridorTimes;
  if(!ct)return null;
  const sign=corridorTravelSign(c,outbound);
  const live=ct.get(corridorPanelKey(c,sign))||ct.get(corridorPanelKey(c,-sign));
  if(live&&live.mins>0&&(Date.now()-live.at)<LIVE_FLOW_STALE_MS){
    const ok=saneCorridorMinutes(c,live.mins);
    if(ok!=null)return {mins:ok,src:live.src||'transtar',title:live.title||'',miles:live.miles};
  }
  return null;
}
function corridorLiveMinutes(c,outbound){
  const e=corridorLiveEntry(c,outbound);
  return e?e.mins:null;
}
function corridorMinutesFromFlow(c,outbound){
  /* Road-wide mph is too coarse for suburb→downtown chips — skip for toDt. */
  if(c.toDt)return null;
  const road=c.roadObj||findRoadByKey(c.road);
  if(!road)return null;
  const sign=corridorTravelSign(c,outbound);
  const flow=window.LIVE_TRAFFIC&&window.LIVE_TRAFFIC.flows&&window.LIVE_TRAFFIC.flows.get(road.def.id+'_'+sign);
  if(!liveFlowFresh(flow)||!(flow.cur>5))return null;
  const mi=corridorDriveMiles(c);
  const mph=sanitizeLiveMph(flow.cur,flow.ff,road);
  const t=mi/mph*60;
  return saneCorridorMinutes(c,t)||clamp(t,(c.typMin||20)*0.75,(c.typMin||20)*2.4);
}
function corridorPanelMinutes(c,outbound){
  const live=corridorLiveMinutes(c,outbound);
  if(live!=null)return live; /* TranStar or TomTom route — already sanity-checked */
  if(!c.toDt){
    const fromFlow=corridorMinutesFromFlow(c,outbound);
    if(fromFlow!=null)return clampCorridorMinutes(c,fromFlow);
  }
  return corridorTime(c,outbound);
}
/* mph shown on chip must match displayed miles ÷ minutes (no mismatched road-wide speed). */
function corridorChipMph(c,mins){
  const mi=corridorDriveMiles(c);
  const t=Math.max(1,mins||c.typMin||20);
  return clamp(Math.round(mi/(t/60)),8,85);
}
/* Hard floor: researched suburban ETAs must never collapse to arterial shortcuts (e.g. Richmond≠FM 1093). */
function assertCorridorSanity(){
  const rich=CORRIDORS.find(c=>/Richmond/i.test(c.label));
  if(!rich)return;
  if(rich.road!=='us59')console.warn('[corridor] Richmond must use US-59, got',rich.road);
  if(!(rich.realMi>=28&&rich.realMi<=32))console.warn('[corridor] Richmond miles off research (~29):',rich.realMi);
  if(!(rich.typMin>=35&&rich.typMin<=45))console.warn('[corridor] Richmond typMin off research (~40):',rich.typMin);
  const bad=clampCorridorMinutes(rich,12);
  if(bad<28)console.warn('[corridor] Richmond clamp failed; 12min became',bad);
  const cyp=CORRIDORS.find(c=>c.toDt&&/Cypress/i.test(c.label));
  if(cyp&&cyp.road!=='us290')console.warn('[corridor] Cypress→Downtown must use US-290, got',cyp.road);
  const sugar=CORRIDORS.find(c=>/Sugar Land/i.test(c.label));
  if(sugar){
    if(!(sugar.minMin>=22))console.warn('[corridor] Sugar Land minMin too low:',sugar.minMin);
    const tooFast=saneCorridorMinutes(sugar,13);
    if(tooFast!=null)console.warn('[corridor] Sugar Land wrongly accepts 13 min');
    const padded=saneCorridorMinutes(sugar,applyCorridorPad(sugar,13));
    if(padded==null||padded<21)console.warn('[corridor] Sugar Land BW8 pad failed:',padded);
  }
}
assertCorridorSanity();
function visibleTrafficStats(renderedN,renderedSpeedSum){
  const cx=cam.target.x,cz=cam.target.z,viewR=4200;
  const lt=window.LIVE_TRAFFIC;
  const flows=lt&&lt.flows;
  let worstC=-1,worstName='';

  /* LIVE mode: Traffic Flow panel is feed-only (TranStar/TomTom freeways).
     Never average simulated car speeds — those crawl on arterials/suburbs and look “fishy” at midnight. */
  if(liveMode&&flows&&flows.size){
    let localMphN=0,localMphSum=0,localCongN=0,localCongSum=0;
    let metroMphN=0,metroMphSum=0,metroCongN=0,metroCongSum=0;
    for(const road of roads){
      if(road.def.arterial||road.def.surface)continue; /* freeways / tollways only */
      const mid=road.segCount>>1;
      const near=((road.segX[mid]-cx)**2+(road.segZ[mid]-cz)**2)<viewR*viewR;
      for(const dir of road.dirs){
        const flow=flows.get(road.def.id+'_'+dir.sign);
        if(!liveFlowFresh(flow))continue;
        const cur=sanitizeLiveMph(flow.cur,flow.ff,road);
        metroMphSum+=cur;metroMphN++;
        metroCongSum+=flow.cong;metroCongN++;
        if(near){
          localMphSum+=cur;localMphN++;
          localCongSum+=flow.cong;localCongN++;
        }
        if(flow.cong>worstC){worstC=flow.cong;worstName=road.def.short||road.def.name;}
      }
    }
    const useLocal=localMphN>=2;
    const mphN=useLocal?localMphN:metroMphN;
    const mphSum=useLocal?localMphSum:metroMphSum;
    const congN=useLocal?localCongN:metroCongN;
    const congSum=useLocal?localCongSum:metroCongSum;
    const src=lt.transtar?'TranStar':(lt.tomtom?'TomTom':(lt.src||'Live'));
    if(mphN>0){
      return {
        veh:renderedN,
        mph:Math.round(mphSum/mphN),
        congPct:congN>0?Math.round(congSum/congN*100):0,
        congSrc:src+(useLocal?'':' · metro'),
        hot:worstC>=0.42?worstName+(worstC>=0.68?' · jammed':' · heavy'):null,
        live:true,
        mphLabel:'Avg mph · '+src,
      };
    }
    /* Feed connected but no fresh freeway samples yet */
    return {
      veh:renderedN,
      mph:null,
      congPct:null,
      congSrc:'Waiting',
      hot:null,
      live:false,
      mphLabel:'Avg mph',
    };
  }

  /* Time-lapse / offline: modeled freeway congestion near camera (labeled Predicted) */
  let congSum=0,congN=0,mphSum=0,mphN=0;
  for(const road of roads){
    if(road.def.arterial||road.def.surface)continue;
    const mid=road.segCount>>1;
    const d2=(road.segX[mid]-cx)**2+(road.segZ[mid]-cz)**2;
    if(d2>viewR*viewR)continue;
    for(const dir of road.dirs){
      const avg=dir.segCong.reduce((a,b)=>a+b,0)/Math.max(1,dir.segCong.length);
      congSum+=avg;congN++;
      const ff=road.def.ff||60;
      mphSum+=Math.max(8,ff*(1-0.78*avg)*((window.wxBlend&&wxBlend.speed)||1));
      mphN++;
      if(avg>worstC){worstC=avg;worstName=road.def.short||road.def.name;}
    }
  }
  return {
    veh:renderedN,
    mph:mphN>0?Math.round(mphSum/mphN):(renderedN>0?Math.round(renderedSpeedSum/renderedN/MPH):null),
    congPct:congN>0?Math.round(congSum/congN*100):null,
    congSrc:congN>0?'Predicted':'',
    hot:worstC>=0.42?worstName+(worstC>=0.68?' · jammed':' · heavy'):null,
    live:false,
    mphLabel:congN>0?'Avg mph · predicted':'Avg mph',
  };
}
function mphTier(mph){
  if(mph>=55)return 'var(--free)';
  if(mph>=35)return 'var(--slow)';
  if(mph>=15)return 'var(--heavy)';
  return 'var(--jam)';
}

/* ---------------- Google-Maps-style zoom-out layer ---------------- */
const gMap=new THREE.Group();gMap.visible=false;scene.add(gMap);
const mapMats=[];
function mapMat(color){
  /* Soft fog + muted colors so far zoom stays tiny city, not white flash */
  const m=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false,fog:true,
    polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  mapMats.push(m);return m;
}
(function buildMapLayer(){
  /* land — warm gray-green, not blown-out beige */
  const land=new THREE.Mesh(new THREE.PlaneGeometry(24000,24000),mapMat(0xc2c0b6));
  land.rotation.x=-Math.PI/2;land.position.y=0.4;land.renderOrder=10;gMap.add(land);
  /* parks — small muted pockets (match 3D; city stays asphalt-first) */
  const parks=[
    [-1140,-3620,420,0x7a8a6a],[-880,-130,260,0x8a9a72],[1500,-3700,380,0x7a8a6a],
    [-2650,-780,280,0x7a8468],[-2850,300,300,0x7a8468],[-1600,-5000,320,0x6a7a5a],
    [-230,805,160,0x8a9a70],[-350,-70,140,0x7a8a68],[2699,-1383,120,0x8a9a72]
  ];
  for(const [x,z,r,c] of parks){const m=new THREE.Mesh(new THREE.CircleGeometry(r,26),mapMat(c));
    m.rotation.x=-Math.PI/2;m.position.set(x,0.7,z);m.renderOrder=11;gMap.add(m);}
  const waters=[[2150,-3850,640],[2050,3020,320],[-2650,-780,170],[-2850,300,180],[7150,2700,3300],[2699,-1383,160]];
  for(const [x,z,r] of waters){const m=new THREE.Mesh(new THREE.CircleGeometry(r,26),mapMat(0x6fa8c8));
    m.rotation.x=-Math.PI/2;m.position.set(x,1.0,z);m.renderOrder=12;gMap.add(m);}
  for(const pts of ALL_BAYOUS){const s2=sampleCurve(pts,false,30);
    const m=new THREE.Mesh(flatRibbonGeom(s2,pts===SANJAC?50:pts===BAYOU?45:28,1.2),mapMat(0x5a8a88));
    m.renderOrder=12;gMap.add(m);}
  /* roads: casing + fill + live traffic ribbons */
  for(const road of roads){
    const def=road.def;
    const isFwy=!def.arterial&&!def.surface;
    const W=def.width*(isFwy?2.1:2.4);
    const casing=new THREE.Mesh(flatRibbonGeom(road.s,W*1.18,1.6),mapMat(isFwy?0xb8862e:0x8a9096));
    casing.renderOrder=13;gMap.add(casing);
    const fill=new THREE.Mesh(flatRibbonGeom(road.s,W,2.0),mapMat(isFwy?0xe0b84a:0xd4d8dc));
    fill.renderOrder=14;gMap.add(fill);
    const sFlat={px:road.s.px,pz:road.s.pz,tx:road.s.tx,tz:road.s.tz,cum:road.s.cum,
                 py:new Float32Array(road.s.n+1),n:road.s.n,closed:road.s.closed,total:road.s.total};
    for(const dir of road.dirs){
      const g=ribbonGeom(sFlat,W*0.4,2.4,dir.sign*W*0.26,true,0);
      const mm=mapMat(0xd8dde2);mm.vertexColors=true;
      const mesh=new THREE.Mesh(g,mm);mesh.renderOrder=15;gMap.add(mesh);
      dir.mapColAttr=g.getAttribute('color');
    }
    /* road-name pins */
    const nPins=Math.max(2,Math.round(road.s.total/2800));
    for(let k=0;k<nPins;k++){
      const dcum=(k+0.5)/nPins*road.s.total;
      let lo=0,hi=road.s.n;while(lo<hi){const m=(lo+hi)>>1;if(road.s.cum[m]<dcum)lo=m+1;else hi=m;}
      const sp=textSprite(def.short,2.1);
      sp.material.opacity=0;sp.renderOrder=16;
      sp.position.set(road.s.px[lo],72,road.s.pz[lo]);
      gMap.add(sp);mapMats.push(sp.material);
    }
  }
})();
let mapT=0,vehFade=1;
let _fpsDt=0,_fpsN=0,_fpsAvg=58;

/* ---------------- traffic incidents ---------------- */
const incidents=[];
const _ip={px:0,pz:0,py:0,tx:0,tz:0};
const liveIncidentMeshes=new Map(); /* guid -> {grp,red,blue,road,dir,arc,k,kind} */
let _incidentCache=null;
function buildIncidentCache(){
  const list=[];
  for(const inc of incidents)list.push(inc);
  for(const inc of liveIncidentMeshes.values())list.push(inc);
  const byRoad=new Map();
  for(const inc of list){
    if(!inc.road||!inc.road.def)continue;
    const id=inc.road.def.id;
    if(!byRoad.has(id))byRoad.set(id,[]);
    byRoad.get(id).push(inc);
  }
  return {list,byRoad};
}
function roadIncidents(road,dir){
  if(!_incidentCache)return [];
  const arr=_incidentCache.byRoad.get(road.def.id);
  if(!arr)return [];
  if(!dir)return arr;
  const out=[];
  for(const inc of arr)if(inc.dir===dir)out.push(inc);
  return out;
}
function nearestDistrictName(x,z){
  let best=CITY_NAME,bd=1e18;
  for(const d of DISTRICTS){const dd=Math.hypot(x-d.x,z-d.z);if(dd<bd){bd=dd;best=d.n;}}
  return best;
}
function buildIncidentVisual(kind){
  const grp=new THREE.Group();
  const isCrash=kind==='crash'||kind==='accident';
  const isWork=kind==='work'||kind==='closure';
  const isPolice=kind==='police';
  if(isCrash){
    const wreck=new THREE.Mesh(new THREE.BoxGeometry(2.9,1.6,5.6),new THREE.MeshLambertMaterial({color:0x4a4f55}));
    wreck.position.set(0,0.8,0);wreck.rotation.y=0.5;grp.add(wreck);
    const unit=new THREE.Mesh(new THREE.BoxGeometry(3,2.2,6.4),new THREE.MeshLambertMaterial({color:0xe8eaee}));
    unit.position.set(0,1.1,-9);grp.add(unit);
    const bar=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.5,1.2),new THREE.MeshLambertMaterial({color:0x22262c}));
    bar.position.set(0,2.5,-9);grp.add(bar);
  }else if(isWork){
    /* Visible closure: cones + barrier + CLOSED sign sprite */
    for(const [x,z] of [[-2.4,2],[0,0],[2.4,-2],[4.2,-5],[-4,-5]]){
      const cone=new THREE.Mesh(new THREE.ConeGeometry(0.75,1.55,8),new THREE.MeshLambertMaterial({color:0xe8641b}));
      cone.position.set(x,0.78,z);grp.add(cone);
    }
    const barr=new THREE.Mesh(new THREE.BoxGeometry(7.2,1.35,0.55),new THREE.MeshLambertMaterial({color:0xf4f5f6}));
    barr.position.set(0,0.85,-7.5);grp.add(barr);
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(7.2,0.35,0.58),new THREE.MeshLambertMaterial({color:0xe8641b}));
    stripe.position.set(0,1.35,-7.5);grp.add(stripe);
    const closedTex=(function(){
      const c=document.createElement('canvas');c.width=128;c.height=64;const x=c.getContext('2d');
      x.fillStyle='#1a1c20';x.fillRect(0,0,128,64);
      x.fillStyle='#e8641b';x.fillRect(4,4,120,56);
      x.fillStyle='#141517';x.font='900 22px Overpass,sans-serif';x.textAlign='center';x.textBaseline='middle';
      x.fillText('CLOSED',64,32);
      return new THREE.CanvasTexture(c);
    })();
    const sign=new THREE.Sprite(new THREE.SpriteMaterial({map:closedTex,transparent:true,depthWrite:false}));
    sign.scale.set(18,9,1);sign.position.set(0,6.5,-4);grp.add(sign);
  }else if(isPolice){
    const unit=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.55,5.5),new THREE.MeshLambertMaterial({color:0x101216}));
    unit.position.set(0,0.78,0);grp.add(unit);
    const roof=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.45,2.2),new THREE.MeshLambertMaterial({color:0xe8eaee}));
    roof.position.set(0,1.7,0);grp.add(roof);
  }else{
    const stalled=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.5,5.2),new THREE.MeshLambertMaterial({color:0x7a4a1d}));
    stalled.position.set(0,0.75,0);grp.add(stalled);
  }
  const redC=isCrash||isPolice?0xff2a1e:(isWork?0xe8641b:0xffb400);
  const blueC=isCrash||isPolice?0x2a6bff:(isWork?0xffb400:0xffb400);
  const glowScale=isWork?16:(isCrash||isPolice?14:10);
  const red=new THREE.Sprite(new THREE.SpriteMaterial({color:redC,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  red.scale.set(glowScale,glowScale,1);red.position.set(-1,isCrash?3.4:(isWork?4.2:2.2),isCrash?-9:(isWork?-4:0));grp.add(red);
  const blue=new THREE.Sprite(new THREE.SpriteMaterial({color:blueC,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  blue.scale.set(glowScale,glowScale,1);blue.position.set(1,isCrash?3.4:(isWork?4.5:2.4),isCrash?-9:(isWork?-4:0));grp.add(blue);
  return {grp,red:red.material,blue:blue.material};
}
function placeIncidentOnRoad(road,dir,arc,kind){
  roadPos(road,arc,_ip);
  const rx=-_ip.tz,rz=_ip.tx;
  const off=dir.sign*(road.def.width/2-3.2);
  const px=_ip.px+rx*off,pz=_ip.pz+rz*off,py=_ip.py+0.05;
  const heading=Math.atan2(_ip.tx*dir.sign,_ip.tz*dir.sign);
  const vis=buildIncidentVisual(kind);
  vis.grp.position.set(px,py,pz);vis.grp.rotation.y=heading;
  scene.add(vis.grp);
  return {px,pz,py,heading,grp:vis.grp,red:vis.red,blue:vis.blue};
}
function syncLiveIncidentMeshes(list){
  const keep=new Set();
  const ranked=[...(list||[])].sort((a,b)=>{
    const ka=parseIncidentKind(((a.properties&&a.properties.title)||'')+' '+(a.kind||''),a.kind);
    const kb=parseIncidentKind(((b.properties&&b.properties.title)||'')+' '+(b.kind||''),b.kind);
    const rankOf=k=>({work:0,crash:1,accident:1,police:2,flood:3,stall:4}[k]??5);
    return rankOf(ka)-rankOf(kb);
  });
  const top=ranked.slice(0,16);
  for(const inc of top){
    const guid=String(inc.guid||inc.id||((inc.properties&&inc.properties.title)||'')+((inc.properties&&inc.properties.description)||''));
    if(!guid)continue;
    keep.add(guid);
    if(liveIncidentMeshes.has(guid))continue;
    const loc=locateLiveIncident(inc);
    if(!loc.road||loc.arc==null)continue;
    const dir=loc.road.dirs.find(d=>d.sign===loc.sign)||loc.road.dirs[0];
    if(!dir)continue;
    const meshKind=loc.kind==='accident'?'crash':loc.kind;
    const placed=placeIncidentOnRoad(loc.road,dir,loc.arc,meshKind);
    const k=loc.kind==='crash'||loc.kind==='accident'?1.15:(loc.kind==='work'?1.05:0.5);
    liveIncidentMeshes.set(guid,{
      road:loc.road,dir,arc:loc.arc,grp:placed.grp,red:placed.red,blue:placed.blue,
      kind:loc.kind,k,live:true,t:0
    });
  }
  for(const [guid,m] of liveIncidentMeshes){
    if(keep.has(guid))continue;
    scene.remove(m.grp);
    liveIncidentMeshes.delete(guid);
  }
}
function spawnIncident(){
  const fwys=roads.filter(r=>!r.def.arterial&&!r.def.surface);
  if(!fwys.length)return;
  const road=fwys[Math.floor(rand()*fwys.length)];
  const dir=road.dirs[rand()<0.5?0:1];
  const arc=(0.12+rand()*0.76)*road.s.total;
  const kind=rand()<0.4?'stall':'crash';
  const placed=placeIncidentOnRoad(road,dir,arc,kind);
  const distName=nearestDistrictName(placed.px,placed.pz);
  const inbAvg=dir.segInb.reduce((a,b)=>a+b,0)/dir.segInb.length;
  const durS=kind==='crash'?100+rand()*200:60+rand()*90;
  const el=document.createElement('div');el.className='alert';
  el.innerHTML='<div class="at"><svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 2 1 21h22L12 2zm0 6.5 6.3 11H5.7L12 8.5z" fill="#ff7a6e"/><rect x="11" y="11" width="2" height="5" fill="#ff7a6e"/><rect x="11" y="17.4" width="2" height="2" fill="#ff7a6e"/></svg>'+(kind==='crash'?'Crash reported':'Stalled vehicle')+'</div>'
    +'<div class="ab">'+road.def.short+' '+(inbAvg>0?'inbound':'outbound')+' near '+distName
    +(kind==='crash'?' — right lane blocked, clears ~':' — on the shoulder, clears ~')+Math.round(durS/60*10)+' min</div>';
  document.getElementById('alerts').appendChild(el);
  incidents.push({road,dir,arc,t:0,dur:durS,grp:placed.grp,red:placed.red,blue:placed.blue,el,kind,k:kind==='crash'?1.15:0.5,sim:true});
}
function updateIncidents(dt){
  const vol=demand(simH,weekend);
  const liveInc=(window.LIVE_TRAFFIC&&window.LIVE_TRAFFIC.incidents&&window.LIVE_TRAFFIC.incidents.length)||0;
  /* Prefer live TranStar/TomTom markers; only spawn simulated when live feed is empty */
  const spawnRate=liveInc>0?0.0005:0.016;
  if(incidents.length<(liveInc>0?0:3)&&rand()<dt*spawnRate*(0.4+vol))spawnIncident();
  const blinkAll=[...incidents,...liveIncidentMeshes.values()];
  for(const inc of blinkAll){
    inc.t=(inc.t||0)+dt;
    const b=Math.floor(inc.t*7)%2;
    const fade=inc.sim?(inc.t<3?inc.t/3:(inc.dur-inc.t<6?Math.max(0,(inc.dur-inc.t)/6):1)):1;
    if(inc.red)inc.red.opacity=(b?0.95:0.1)*fade;
    if(inc.blue)inc.blue.opacity=(b?0.1:0.95)*fade;
  }
  for(let i=incidents.length-1;i>=0;i--){
    const inc=incidents[i];
    if(inc.t>=inc.dur){
      scene.remove(inc.grp);
      if(inc.el){inc.el.style.opacity=0;inc.el.style.transition='opacity .5s';const el=inc.el;setTimeout(()=>el.remove(),600);}
      incidents.splice(i,1);
    }
  }
}

/* ---------------- police: roaming patrols + speed traps (simulated live) ---------------- */
const POLICE_TRAPS=[];
let patrolCount=0;
window.PATROLS=[];
function placePatrolOnRoad(v,road,dir,lane,s){
  v.s=s;v._dead=false;v.police=true;v.col=0x101216;v.aggr=1.12;v.v=18+rand()*12;
  v.type=VEH_TYPES[0];
  let idx=0;while(idx<lane.length&&lane[idx].s<v.s)idx++;
  lane.splice(idx,0,v);
  v._road=road;v._dir=dir;v._lane=lane;
}
function seedPatrols(){
  const fwys=roads.filter(r=>!r.def.arterial&&!r.def.surface);
  if(!fwys.length)return;
  const need=8;
  while(PATROLS.length<need){
    const road=fwys[Math.floor(rand()*fwys.length)];
    const dir=road.dirs[rand()<0.5?0:1];
    const lane=dir.lanes[Math.floor(rand()*dir.lanes.length)];
    const v=makeVehicle(road,rand()*road.s.total);
    placePatrolOnRoad(v,road,dir,lane,v.s);
    patrolCount++;PATROLS.push(v);
  }
}
/** Keep patrols alive: re-insert if culled / shuffled / wrap-exit */
function ensurePatrolsAlive(){
  const fwys=roads.filter(r=>!r.def.arterial&&!r.def.surface);
  if(!fwys.length)return;
  for(const v of PATROLS){
    let onRoad=v._lane&&v._lane.indexOf(v)>=0;
    if(!onRoad&&!v._dead){
      /* Lane-changed without updating _lane — find them once */
      outer:for(const road of fwys)for(const dir of road.dirs)for(const lane of dir.lanes){
        if(lane.indexOf(v)>=0){v._road=road;v._dir=dir;v._lane=lane;onRoad=true;break outer;}
      }
    }
    if(!onRoad||v._dead){
      const road=fwys[Math.floor(rand()*fwys.length)];
      const dir=road.dirs[rand()<0.5?0:1];
      const lane=dir.lanes[Math.floor(rand()*dir.lanes.length)];
      placePatrolOnRoad(v,road,dir,lane,rand()*road.s.total);
    }
  }
  if(PATROLS.length<8)seedPatrols();
}
function spawnTrap(){
  const fwys=roads.filter(r=>!r.def.arterial&&!r.def.surface);
  const road=fwys[Math.floor(rand()*fwys.length)];
  const dir=road.dirs[rand()<0.5?0:1];
  const arc=(0.1+rand()*0.8)*road.s.total;
  roadPos(road,arc,_ip);
  const rx=-_ip.tz,rz=_ip.tx;
  const off=dir.sign*(road.def.width/2-2.2);
  const grp=new THREE.Group();
  const car=new THREE.Mesh(new THREE.BoxGeometry(2.5,1.5,5.4),new THREE.MeshLambertMaterial({color:0x101216}));
  car.position.y=0.75;grp.add(car);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.5,2.4),new THREE.MeshLambertMaterial({color:0xe8eaee}));
  roof.position.y=1.75;grp.add(roof);
  const red=new THREE.Sprite(new THREE.SpriteMaterial({color:0xff2a1e,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  red.scale.set(11,11,1);red.position.set(-0.8,2.6,0);grp.add(red);
  const blue=new THREE.Sprite(new THREE.SpriteMaterial({color:0x2a6bff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  blue.scale.set(11,11,1);blue.position.set(0.8,2.6,0);grp.add(blue);
  grp.position.set(_ip.px+rx*off,_ip.py+0.05,_ip.pz+rz*off);
  grp.rotation.y=Math.atan2(_ip.tx*dir.sign,_ip.tz*dir.sign);
  scene.add(grp);
  const inbAvg=dir.segInb.reduce((a,b)=>a+b,0)/dir.segInb.length;
  const el=document.createElement('div');el.className='alert police';
  el.innerHTML='<div class="at"><svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 2 3 6v6c0 5 3.8 8.4 9 10 5.2-1.6 9-5 9-10V6l-9-4z" fill="none" stroke="#7da2ff" stroke-width="2.2"/><circle cx="12" cy="11" r="2.6" fill="#7da2ff"/></svg>Police reported</div>'
    +'<div class="ab">Speed enforcement — '+road.def.short+' '+(inbAvg>0?'inbound':'outbound')
    +' near '+nearestDistrictName(grp.position.x,grp.position.z)+'</div>';
  document.getElementById('alerts').appendChild(el);
  POLICE_TRAPS.push({road,dir,arc,t:0,dur:60+rand()*120,grp,red:red.material,blue:blue.material,el});
}
function updatePolice(dt){
  ensurePatrolsAlive();
  if(POLICE_TRAPS.length<2&&rand()<dt*0.012)spawnTrap();
  for(let i=POLICE_TRAPS.length-1;i>=0;i--){
    const tr=POLICE_TRAPS[i];tr.t+=dt;
    const b=Math.floor(tr.t*8)%2;
    const fade=tr.t<2?tr.t/2:(tr.dur-tr.t<4?Math.max(0,(tr.dur-tr.t)/4):1);
    tr.red.opacity=(b?0.95:0.08)*fade;
    tr.blue.opacity=(b?0.08:0.95)*fade;
    if(tr.t>=tr.dur){
      scene.remove(tr.grp);
      const el=tr.el;el.style.opacity=0;el.style.transition='opacity .5s';
      setTimeout(()=>el.remove(),600);
      POLICE_TRAPS.splice(i,1);
    }
  }
}

/* ---------------- construction work zones ---------------- */
const workZones=[];
const barrelTex=(function(){const c=document.createElement('canvas');c.width=16;c.height=32;const x=c.getContext('2d');
  x.fillStyle='#e8641b';x.fillRect(0,0,16,32);
  x.fillStyle='#f4f5f6';x.fillRect(0,7,16,5);x.fillRect(0,19,16,5);
  return new THREE.CanvasTexture(c);})();
function arrowBoardTex(){
  const c=document.createElement('canvas');c.width=128;c.height=64;const x=c.getContext('2d');
  x.fillStyle='#141517';x.fillRect(0,0,128,64);
  x.strokeStyle='#3a3d42';x.lineWidth=4;x.strokeRect(2,2,124,60);
  x.strokeStyle='#ffb400';x.lineWidth=9;x.lineCap='round';
  for(const ox of [30,62,94]){x.beginPath();x.moveTo(ox+14,14);x.lineTo(ox-6,32);x.lineTo(ox+14,50);x.stroke();}
  return new THREE.CanvasTexture(c);
}
function workSignTex(){
  const c=document.createElement('canvas');c.width=128;c.height=128;const x=c.getContext('2d');
  x.translate(64,64);x.rotate(Math.PI/4);
  x.fillStyle='#e8641b';x.fillRect(-42,-42,84,84);
  x.strokeStyle='#141517';x.lineWidth=5;x.strokeRect(-42,-42,84,84);
  x.rotate(-Math.PI/4);
  x.fillStyle='#141517';x.textAlign='center';x.font='900 19px Overpass, sans-serif';
  x.fillText('ROAD',0,-8);x.fillText('WORK',0,12);x.fillText('AHEAD',0,32);
  return new THREE.CanvasTexture(c);
}
function spawnWorkZone(roadId,dirIdx,frac,len,areaHint){
  const road=findRoadByKey(roadId);if(!road)return;
  const dir=road.dirs[dirIdx];
  const L=road.s.total;
  const a0=frac*L,a1=Math.min(L-120,a0+len);
  const lane=dir.lanes.length-1; /* close the outer lane */
  const laneW=road.laneW;
  const innerLat=dir.sign*(1.7+lane*laneW);
  const outerLat=dir.sign*(road.def.width/2-1.2);
  const grp=new THREE.Group();gRoads3D.add(grp);
  /* taper + longitudinal barrels (instanced) */
  const spots=[];
  const taper=130;
  for(let d=0;d<taper;d+=13){
    const t=d/taper;
    spots.push([a0-taper+d,lerp(outerLat,innerLat,t)]);
  }
  for(let d=0;d<(a1-a0);d+=15)spots.push([a0+d,innerLat]);
  const bg=new THREE.CylinderGeometry(0.85,1.0,2.6,8);bg.translate(0,1.3,0);
  const barrels=new THREE.InstancedMesh(bg,new THREE.MeshLambertMaterial({map:barrelTex}),spots.length);
  const bd=new THREE.Object3D();
  spots.forEach((sp2,ix)=>{
    roadPos(road,sp2[0],_ip);
    const rx=-_ip.tz,rz=_ip.tx;
    bd.position.set(_ip.px+rx*sp2[1],_ip.py+0.05,_ip.pz+rz*sp2[1]);
    bd.updateMatrix();barrels.setMatrixAt(ix,bd.matrix);
  });
  grp.add(barrels);
  /* flashing arrow board at taper start */
  roadPos(road,a0-taper-16,_ip);
  const rx0=-_ip.tz,rz0=_ip.tx;
  const abMatTex=arrowBoardTex();
  const abMat=new THREE.MeshLambertMaterial({map:abMatTex,emissiveMap:abMatTex,emissive:new THREE.Color(0xffffff),emissiveIntensity:0.6});
  const board=new THREE.Mesh(new THREE.BoxGeometry(6.4,3.2,0.5),abMat);
  const midLat=(innerLat+outerLat)/2;
  board.position.set(_ip.px+rx0*midLat,_ip.py+3.4,_ip.pz+rz0*midLat);
  board.rotation.y=Math.atan2(_ip.tx*dir.sign,_ip.tz*dir.sign)+Math.PI;
  grp.add(board);
  const trailer=new THREE.Mesh(new THREE.BoxGeometry(4.4,1.4,2.2),new THREE.MeshLambertMaterial({color:0xd8dade}));
  trailer.position.set(board.position.x,_ip.py+0.75,board.position.z);grp.add(trailer);
  /* work sign upstream on the shoulder */
  roadPos(road,Math.max(60,a0-taper-420),_ip);
  const signSp=new THREE.Sprite(new THREE.SpriteMaterial({map:workSignTex(),transparent:true,depthWrite:false}));
  signSp.scale.set(14,14,1);
  signSp.position.set(_ip.px+(-_ip.tz)*(dir.sign*(road.def.width/2+7)),_ip.py+8,_ip.pz+_ip.tx*(dir.sign*(road.def.width/2+7)));
  grp.add(signSp);
  /* parked equipment inside the zone */
  roadPos(road,(a0+a1)/2,_ip);
  const rxm=-_ip.tz,rzm=_ip.tx;
  const dump=new THREE.Mesh(new THREE.BoxGeometry(3,3,8),new THREE.MeshLambertMaterial({color:0xd9a91f}));
  dump.position.set(_ip.px+rxm*innerLat*1.16,_ip.py+1.55,_ip.pz+rzm*innerLat*1.16);
  dump.rotation.y=Math.atan2(_ip.tx,_ip.tz);grp.add(dump);
  /* alert card */
  const inbAvg=dir.segInb.reduce((a,b)=>a+b,0)/dir.segInb.length;
  const el=document.createElement('div');el.className='alert work';
  el.innerHTML='<div class="at"><svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 3 4 21h16L12 3z" fill="none" stroke="#f6b64b" stroke-width="2.4"/><path d="M9.6 13.5h4.8M8.2 17h7.6" stroke="#f6b64b" stroke-width="2.2"/></svg>Road work</div>'
    +'<div class="ab">'+road.def.short+' '+(inbAvg>0?'inbound':'outbound')+' near '+areaHint+' — right lane closed</div>';
  document.getElementById('alerts').appendChild(el);
  workZones.push({road,dir,a0,a1,lane,capMph:38,abMat,taper});
}

/* ---------------- storm flooding at underpasses ---------------- */
const floods=[];
function highWaterTex(){
  const c=document.createElement('canvas');c.width=128;c.height=128;const x=c.getContext('2d');
  x.translate(64,64);x.rotate(Math.PI/4);
  x.fillStyle='#f6b64b';x.fillRect(-42,-42,84,84);
  x.strokeStyle='#141517';x.lineWidth=5;x.strokeRect(-42,-42,84,84);
  x.rotate(-Math.PI/4);
  x.fillStyle='#141517';x.textAlign='center';x.font='900 19px Overpass, sans-serif';
  x.fillText('HIGH',0,-6);x.fillText('WATER',0,16);
  return new THREE.CanvasTexture(c);
}
function activateFlood(up){
  const road=findRoadByKey(up.roadId);if(!road)return;
  const grp=new THREE.Group();scene.add(grp);
  const water=new THREE.Mesh(new THREE.CircleGeometry(road.def.width*0.85,18),
    new THREE.MeshPhongMaterial({color:0x203d4c,shininess:120,specular:0x9fc4da,transparent:true,opacity:0}));
  water.rotation.x=-Math.PI/2;water.scale.y=0.6;
  roadPos(road,up.arc,_ip);
  water.position.set(_ip.px,_ip.py+0.14,_ip.pz);
  water.rotation.z=Math.atan2(_ip.tx,_ip.tz);
  grp.add(water);
  const sign=new THREE.Sprite(new THREE.SpriteMaterial({map:highWaterTex(),transparent:true,depthWrite:false,opacity:0}));
  sign.scale.set(15,15,1);
  sign.position.set(_ip.px+(-_ip.tz)*(road.def.width/2+8),_ip.py+8.5,_ip.pz+_ip.tx*(road.def.width/2+8));
  grp.add(sign);
  const el=document.createElement('div');el.className='alert flood';
  el.innerHTML='<div class="at"><svg width="12" height="12" viewBox="0 0 24 24"><path d="M3 14c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2M3 19c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" fill="none" stroke="#6cb8ff" stroke-width="2.2" stroke-linecap="round"/><path d="M12 3c-2.4 3-4 5-4 7a4 4 0 0 0 8 0c0-2-1.6-4-4-7z" fill="#6cb8ff"/></svg>High water</div>'
    +'<div class="ab">'+road.def.short+' at the '+up.over+' underpass — road nearly impassable</div>';
  document.getElementById('alerts').appendChild(el);
  floods.push({up,roadObj:road,arc:up.arc,level:0,draining:false,waterMat:water.material,signMat:sign.material,grp,el});
}
function updateFloods(dt){
  const raining=wxBlend.rain>0.55 || (window.HAZARD&&HAZARD.mode==='flood'&&HAZARD.active);
  const floodSpawn=window.HAZARD&&HAZARD.mode==='flood'&&HAZARD.active?dt*0.22:dt*0.05;
  const maxFloods=window.HAZARD&&HAZARD.mode==='flood'&&HAZARD.active?6:3;
  if(raining&&floods.length<maxFloods&&rand()<floodSpawn&&UNDERPASSES.length){
    const cand=UNDERPASSES[Math.floor(rand()*UNDERPASSES.length)];
    if(!floods.some(f=>f.up===cand))activateFlood(cand);
  }
  for(let i=floods.length-1;i>=0;i--){
    const f=floods[i];
    const forceKeep=window.HAZARD&&HAZARD.mode==='flood'&&HAZARD.active;
    if(!forceKeep&&wxBlend.rain<0.25)f.draining=true;
    if(forceKeep)f.draining=false;
    f.level=clamp(f.level+(f.draining?-dt/26:dt/14),0,1);
    f.waterMat.opacity=f.level*0.72;
    f.signMat.opacity=Math.min(1,f.level*2);
    if(f.draining&&f.level<=0){
      scene.remove(f.grp);
      const el=f.el;el.style.opacity=0;el.style.transition='opacity .5s';setTimeout(()=>el.remove(),600);
      floods.splice(i,1);
    }
  }
}

/* ---------------- hazard predictions (hurricane / wildfire / flood / nuclear) ----------------
   Simulated forecast overlays for the active metro — educational / what-if, not live NWS alerts. */
window.HAZARD={mode:null,active:false,t:0,intensity:0,congBoost:0,group:null,alertEl:null,rings:[],smoke:[],yieldKt:10,labels:[],
  nukeOrigin:null,nukePlaceMode:false,targetMarkers:[]};
const CITY_HAZ=buildCityHazards({
  cityId:HTS_CITY_ID,
  pack:HTS_PACK,
  cityName:CITY_NAME,
  metroName:METRO_NAME,
  geoToWorld,
});
const HAZ_SCENARIOS=CITY_HAZ.scenarios;
/* Approximate airburst radii (miles) — Glasstone-style W^(1/3) scaling (educational, not weapons design) */
function nukeRadiiMi(kt){
  const W=Math.max(0.001,Number(kt)||10);
  const c=Math.pow(W,1/3);
  return {
    label:W>=1000?((W/1000)|0)+' Mt':(W|0)+' kt',
    fireball:0.28*Math.pow(W,0.4),
    severe:0.92*c,       /* ~5 psi — heavy building collapse */
    moderate:1.18*c,     /* ~3 psi — major structural damage */
    thermal:1.45*c,      /* 3rd-degree burns */
    light:2.72*c,        /* ~1 psi — window breakage / light damage */
    fallout:10.5*c       /* downwind deposition guide (varies with wind) */
  };
}
const NUK_YIELDS={};
[1,10,100,1000].forEach(kt=>{NUK_YIELDS[kt]=nukeRadiiMi(kt);});
/* Strategic / high-value metro targets — weighted for likelihood scoring (simulated targeting model) */
const NUK_TARGETS=CITY_HAZ.nukeTargets||[];
const HOUSTON_WILDFIRE_XZ=[[-3200,-1800,380],[-2800,-2600,320],[-2100,-3200,280],[-3600,-900,260],[-2400,-3950,300]];
function hazNukeLikelihoodAt(x,z){
  let score=0;const hits=[];
  for(const t of NUK_TARGETS){
    const dMi=Math.hypot(x-t.x,z-t.z)/UNITS_PER_MILE;
    const reach=t.radiusMi*2.8;
    if(dMi<reach){
      const contrib=t.w*Math.exp(-dMi/(reach*0.45));
      score+=contrib;
      if(contrib>8)hits.push({n:t.short,w:contrib,why:t.why});
    }
  }
  const dtLL=CITY_HAZ.downtownLatLng||[METRO_LAT,METRO_LNG];
  const dt=geoToWorld(dtLL[0],dtLL[1]);
  const dDownMi=Math.hypot(x-dt.x,z-dt.z)/UNITS_PER_MILE;
  score+=55*Math.exp(-dDownMi/8);
  const hubLL=CITY_HAZ.hubLatLng||dtLL;
  const hub=geoToWorld(hubLL[0],hubLL[1]);
  const dHubMi=Math.hypot(x-hub.x,z-hub.z)/UNITS_PER_MILE;
  score+=40*Math.exp(-dHubMi/6);
  hits.sort((a,b)=>b.w-a.w);
  const pct=clamp(Math.round(score/1.15),0,99);
  return {pct,score,hits:hits.slice(0,4),reasons:hits.map(h=>h.n)};
}
function hazNukeRankTargets(){
  const pts=[];
  for(const t of NUK_TARGETS)pts.push({...t,lik:hazNukeLikelihoodAt(t.x,t.z)});
  /* Never fall back to Houston DISTRICTS_CORE for other metros — that leaked suburb names into nuke UI. */
  const districtPool=(DISTRICTS&&DISTRICTS.length)
    ?DISTRICTS
    :(HTS_CITY_ID==='houston'?DISTRICTS_CORE:[]);
  for(const d of districtPool.slice(0,20)){
    const lik=hazNukeLikelihoodAt(d.x,d.z);
    if(lik.pct>25)pts.push({id:d.id,n:d.n,short:d.n,x:d.x,z:d.z,why:'Urban / economic density',lik});
  }
  pts.sort((a,b)=>(b.lik.pct)-(a.lik.pct));
  const seen=new Set();const out=[];
  for(const p of pts){
    const k=p.id||p.short;
    if(seen.has(k))continue;
    seen.add(k);
    out.push(p);
    if(out.length>=10)break;
  }
  return out;
}
function hazWindRad(){
  const wd=(liveWx&&liveWx.windDir!=null)?liveWx.windDir:150;
  return ((wd+180)%360)*Math.PI/180;
}
function miToUnits(mi){return mi*UNITS_PER_MILE;}
/* Metro corridors that historically flood in major storms */
const HOUSTON_FLOOD_XZ=[
  {x:-2650,z:-780,r:520,name:'Addicks pool'},
  {x:-2850,z:300,r:540,name:'Barker pool'},
  {x:-2200,z:-200,r:380,name:'Addicks release'},
  {x:-2400,z:180,r:360,name:'Barker release'},
  {x:-1600,z:-100,r:220,name:'Buffalo W'},
  {x:-880,z:-130,r:260,name:'Memorial / Bayou'},
  {x:-350,z:-70,r:240,name:'Buffalo Bayou Park'},
  {x:60,z:40,r:200,name:'Downtown bayou'},
  {x:500,z:20,r:210,name:'EaDo / channel head'},
  {x:1200,z:80,r:240,name:'Ship Channel W'},
  {x:-1480,z:520,r:280,name:'Gulfton / Brays'},
  {x:-920,z:680,r:300,name:'Meyerland'},
  {x:-600,z:750,r:240,name:'Brays mid'},
  {x:-290,z:800,r:220,name:'Med Center low'},
  {x:200,z:900,r:200,name:'Brays E'},
  {x:-400,z:-350,r:220,name:'White Oak'},
  {x:0,z:-120,r:180,name:'White Oak join'},
  {x:280,z:-180,r:200,name:'Fifth Ward low'},
  {x:200,z:2400,r:220,name:'Sims Bayou'},
  {x:800,z:2000,r:200,name:'Sims mid'},
  {x:-420,z:-1180,r:320,name:'Greenspoint'},
  {x:200,z:-1400,r:240,name:'Greens Bayou'},
  {x:2050,z:3020,r:380,name:'Clear Lake'},
  {x:2750,z:3280,r:300,name:'Kemah / Seabrook'},
  {x:2450,z:420,r:340,name:'Pasadena channel'},
  {x:3800,z:-200,r:360,name:'Baytown channel'}
];
const FLOOD_CERTAIN=CITY_HAZ.floodZones||(CITY_HAZ.floodRibbonMode==='houston'?HOUSTON_FLOOD_XZ:[]);
function hazClearVisuals(){
  const H=window.HAZARD;
  if(H.group){scene.remove(H.group);H.group=null;}
  H.rings=[];H.smoke=[];H.labels=[];H.targetMarkers=[];
  if(H.alertEl){const el=H.alertEl;el.style.opacity=0;el.style.transition='opacity .4s';setTimeout(()=>{try{el.remove();}catch(e){}},500);H.alertEl=null;}
}
function hazMakeRing(x,z,rInner,rOuter,hex,y,op){
  const g=new THREE.RingGeometry(Math.max(2,rInner),rOuter,64);
  const baseOp=op==null?0.35:op;
  const m=new THREE.MeshBasicMaterial({color:hex,transparent:true,opacity:baseOp,side:THREE.DoubleSide,depthWrite:false});
  m.userData.baseOp=baseOp;
  const mesh=new THREE.Mesh(g,m);
  mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y||2.5,z);
  return {mesh,mat:m,baseR:rOuter,x,z};
}
function hazMakeDisk(x,z,r,hex,op,y){
  const mesh=new THREE.Mesh(new THREE.CircleGeometry(r,48),
    new THREE.MeshBasicMaterial({color:hex,transparent:true,opacity:op||0.22,depthWrite:false,side:THREE.DoubleSide}));
  mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y||1.8,z);
  return mesh;
}
function hazBayouFloodRibbon(pts,halfW,hex,op){
  const s=sampleCurve(pts,false,28);
  const m=new THREE.Mesh(ribbonGeom(s,halfW*2,0.12,0,false,0),
    new THREE.MeshBasicMaterial({color:hex,transparent:true,opacity:op,depthWrite:false}));
  return m;
}
function hazNukeRanges(kt){
  const y=nukeRadiiMi(kt);
  const wind=(liveWx&&liveWx.wind)?liveWx.wind:12;
  const fallMul=1+clamp(wind/35,0,0.55);
  return {
    label:y.label,
    fireball:miToUnits(y.fireball),
    severe:miToUnits(y.severe),
    moderate:miToUnits(y.moderate),
    thermal:miToUnits(y.thermal),
    light:miToUnits(y.light),
    fallout:miToUnits(y.fallout*fallMul),
    mi:{...y,fallout:y.fallout*fallMul},
    windRad:hazWindRad(),
    windMph:wind
  };
}
function hazBuildNuclear(origin,kt){
  const H=window.HAZARD;
  const R=hazNukeRanges(kt);
  const lik=hazNukeLikelihoodAt(origin.x,origin.z);
  H.nukeOrigin={x:origin.x,z:origin.z,lik};
  H.group.add(hazMakeDisk(origin.x,origin.z,R.fireball,0xfef08a,0.78,4.8));
  H.group.add(hazMakeDisk(origin.x,origin.z,R.severe,0xf97316,0.42,3.8));
  H.group.add(hazMakeDisk(origin.x,origin.z,R.moderate,0xfb7185,0.28,3.2));
  H.group.add(hazMakeDisk(origin.x,origin.z,R.thermal,0xef4444,0.2,2.8));
  H.group.add(hazMakeDisk(origin.x,origin.z,R.light,0xa3e635,0.13,2.2));
  const bands=[
    [R.fireball*0.82,R.fireball,0xfde047,0.72,'Fireball'],
    [R.severe*0.9,R.severe,0xfb923c,0.58,'5 psi · severe blast'],
    [R.moderate*0.92,R.moderate,0xf472b6,0.48,'3 psi · heavy damage'],
    [R.thermal*0.93,R.thermal,0xf87171,0.44,'3rd-degree thermal'],
    [R.light*0.95,R.light,0xbef264,0.38,'1 psi · light damage']
  ];
  for(const [ri,ro,hex,op,name] of bands){
    const ring=hazMakeRing(origin.x,origin.z,ri,ro,hex,5.2,op);
    H.group.add(ring.mesh);H.rings.push(ring);
    const miKey=name.includes('5 psi')?'severe':name.includes('3 psi')?'moderate':name.includes('thermal')?'thermal':name.includes('1 psi')?'light':'fireball';
    const sp=textSprite(name+' · '+R.mi[miKey].toFixed(2)+' mi',0.34);
    sp.position.set(origin.x+ro*0.65,30,origin.z);H.group.add(sp);H.labels.push(sp);
  }
  /* wind-aligned fallout deposition guide */
  const wr=R.windRad;
  const fallR=R.fallout;
  for(let i=1;i<=9;i++){
    const t=i/9;
    const px=origin.x+Math.cos(wr)*fallR*t;
    const pz=origin.z+Math.sin(wr)*fallR*t;
    const rr=R.light*(0.28+0.52*t);
    H.group.add(hazMakeDisk(px,pz,rr,0x84cc16,0.11*(1-t*0.45),2.2+i*0.25));
  }
  const fallSp=textSprite('Fallout guide · '+R.mi.fallout.toFixed(1)+' mi · wind '+Math.round(R.windMph)+' mph',0.4);
  fallSp.position.set(origin.x+Math.cos(wr)*fallR*0.5,42,origin.z+Math.sin(wr)*fallR*0.5);
  H.group.add(fallSp);H.labels.push(fallSp);
  const gz=textSprite('GROUND ZERO · '+R.label+' · '+lik.pct+'% likely target',0.52);
  gz.position.set(origin.x,72,origin.z);H.group.add(gz);H.labels.push(gz);
  if(lik.reasons.length){
    const rs=textSprite('Why: '+lik.reasons.slice(0,3).join(' · '),0.36);
    rs.position.set(origin.x,58,origin.z-120);H.group.add(rs);H.labels.push(rs);
  }
  return R;
}
function hazBuildNukeTargetMarkers(kt){
  const H=window.HAZARD;
  const ranked=hazNukeRankTargets();
  const R=hazNukeRanges(kt);
  for(const t of ranked.slice(0,8)){
    const dot=hazMakeDisk(t.x,t.z,Math.max(80,R.light*0.08),0xd9f99d,0.2,6);
    H.group.add(dot);H.targetMarkers.push(dot);
    const sp=textSprite(t.lik.pct+'% · '+t.short,0.36);
    sp.position.set(t.x,38,t.z);H.group.add(sp);H.labels.push(sp);
  }
}
function hazNuclearAt(x,z,kt){
  const H=window.HAZARD;
  H.mode='nuclear';H.active=true;H.nukePlaceMode=false;
  const mapBtn=$('hazNukeMapBtn');if(mapBtn)mapBtn.classList.remove('on');
  hazClearVisuals();
  H.group=new THREE.Group();scene.add(H.group);
  const origin={x,z};
  const R=hazBuildNuclear(origin,kt||H.yieldKt||10);
  hazBuildNukeTargetMarkers(kt||H.yieldKt||10);
  H.congBoost=clamp(0.42+Math.log10((H.yieldKt||10)+1)*0.2,0.5,0.96);
  const lik=H.nukeOrigin.lik;
  const g=worldToGeo(x,z);
  const st=$('hazStatus');
  if(st)st.textContent=R.label+' airburst at '+g.lat.toFixed(3)+', '+g.lng.toFixed(3)
    +' · target likelihood '+lik.pct+'%'
    +' · fireball '+R.mi.fireball.toFixed(2)+' mi · 5 psi '+R.mi.severe.toFixed(2)
    +' mi · thermal '+R.mi.thermal.toFixed(2)+' mi · 1 psi '+R.mi.light.toFixed(2)
    +' mi · fallout ~'+R.mi.fallout.toFixed(1)+' mi downwind ('+Math.round(R.windMph)+' mph).';
  const sc=HAZ_SCENARIOS.nuclear;
  const el=document.createElement('div');el.className='alert '+sc.cls;
  el.innerHTML='<div class="at">'+sc.title+'</div><div class="ab">SIM '+R.label+' at '
    +(lik.reasons[0]||'selected point')+' — '+lik.pct+'% strategic likelihood. '
    +'Blast 5 psi: '+R.mi.severe.toFixed(2)+' mi radius · thermal: '+R.mi.thermal.toFixed(2)
    +' mi · light damage: '+R.mi.light.toFixed(2)+' mi. Training overlay only.</div>';
  document.getElementById('alerts').prepend(el);
  H.alertEl=el;
  stopFollow();
  camGoal.target.set(x,0,z);
  camGoal.radius=clamp(R.light*2.2,1400,7200);
  camGoal.phi=1.05;
  hazPopulateNukeUI();
}
function hazPopulateNukeUI(){
  const sel=$('hazNukeTarget'),list=$('hazTargetList');
  if(!sel)return;
  const ranked=hazNukeRankTargets();
  sel.innerHTML='<option value="">— pick a likely target —</option>'
    +ranked.map(t=>'<option value="'+t.id+'">'+t.lik.pct+'% · '+t.short+'</option>').join('')
    +'<option value="__map__">Click map to place anywhere…</option>';
  if(list){
    list.innerHTML=ranked.slice(0,8).map(t=>'<li data-id="'+t.id+'"><span class="pct">'+t.lik.pct+'%</span>'
      +t.short+'<div style="color:#8a939c;font-size:9px;margin-top:2px">'+((t.why||'').slice(0,72))+'</div></li>').join('');
    list.querySelectorAll('li').forEach(li=>{
      li.addEventListener('click',()=>{
        const id=li.getAttribute('data-id');
        const t=NUK_TARGETS.find(x=>x.id===id)||ranked.find(x=>x.id===id);
        if(t)hazNuclearAt(t.x,t.z,window.HAZARD.yieldKt);
        list.querySelectorAll('li').forEach(x=>x.classList.toggle('on',x===li));
      });
    });
  }
}
function hazBuildFlood(){
  const H=window.HAZARD;
  /* solid water over every certain flood footprint */
  for(const z of FLOOD_CERTAIN){
    H.group.add(hazMakeDisk(z.x,z.z,z.r,0x1e40af,0.42,2.0));
    H.group.add(hazMakeDisk(z.x,z.z,z.r*1.08,0x3b82f6,0.18,2.4));
  }
  /* continuous inundation ribbons — city-local only */
  let ribbons=[];
  if(CITY_HAZ.floodRibbonMode==='austin')ribbons=[[LADYBIRD,160,0x1d4ed8,0.5]];
  else if(CITY_HAZ.floodRibbonMode==='houston')ribbons=[
    [BAYOU,140,0x1d4ed8,0.5],[BRAYS,110,0x1e40af,0.48],[WHITEOAK,100,0x1d4ed8,0.46],
    [SIMS,95,0x1e3a8a,0.44],[GREENS,100,0x1e40af,0.44],[SANJAC,160,0x1e3a8a,0.4]
  ];
  else if(LADYBIRD&&LADYBIRD.length>=2)ribbons=[[LADYBIRD,140,0x1d4ed8,0.48]];
  for(const [pts,w,hex,op] of ribbons){
    if(pts&&pts.length>=2)H.group.add(hazBayouFloodRibbon(pts,w,hex,op));
  }
  /* label a few key certain zones */
  for(const z of FLOOD_CERTAIN.filter((_,i)=>i%4===0)){
    const sp=textSprite(z.name,0.32);
    sp.position.set(z.x,22,z.z);H.group.add(sp);H.labels.push(sp);
  }
  const banner=warnSprite('flood','Likely flood zones','educational overlay',0.48);
  const banLL=CITY_HAZ.floodBannerLatLng||CITY_HAZ.downtownLatLng||[METRO_LAT,METRO_LNG];
  const banAt=geoToWorld(banLL[0],banLL[1]);
  banner.position.set(banAt.x,55,banAt.z);H.group.add(banner);H.labels.push(banner);
  /* activate underpasses that sit inside certain flood footprints */
  if(UNDERPASSES.length){
    let n=0;
    for(const up of UNDERPASSES){
      const hit=FLOOD_CERTAIN.some(z=>{
        const dx=up.x-z.x,dz=up.z-z.z;return dx*dx+dz*dz<(z.r*1.15)*(z.r*1.15);
      });
      if(hit&&!floods.some(f=>f.up===up)){activateFlood(up);n++;if(n>=8)break;}
    }
  }
}
function hazSetYieldUI(mode){
  const row=$('hazYieldRow');
  const nuke=$('hazNukeRow');
  if(row)row.classList.toggle('show',mode==='nuclear');
  if(nuke)nuke.classList.toggle('show',mode==='nuclear');
}
function hazLiveHurricaneStatus(){
  const wx=liveWx||{};
  const w=wx.wind||0;
  const cat=w>=130?4:w>=100?3:w>=75?2:w>=40?1:0;
  const catTxt=cat?('Category '+cat+(cat>=3?'–'+(cat+1):'')+' potential'):'Tropical-storm force winds';
  const hum=wx.hum!=null?wx.hum:65;
  if(HTS_CITY_ID==='austin'){
    const rainIn=cat>=3?8:cat>=2?5:cat>=1?3:1.5;
    return catTxt+' · live wind '+w+' mph · humidity '+hum+'%'
      +' · modeled rain '+rainIn+'–'+(rainIn+3)+' in Central Texas'
      +' · relief: I-35 N–S, MoPac, US-183, SH-71, SH-130';
  }
  if(HTS_CITY_ID==='houston'){
    const surgeFt=cat>=3?12:cat>=2?8:cat>=1?4:2;
    return catTxt+' · live wind '+w+' mph · humidity '+hum+'%'
      +' · modeled surge '+surgeFt+'–'+(surgeFt+4)+' ft Galveston Bay'
      +' · evac: I-45 N, I-10 W, US-59 N, SH-288 N';
  }
  if(CITY_HAZ.coastal){
    const surgeFt=cat>=3?10:cat>=2?6:cat>=1?3:1;
    return catTxt+' · live wind '+w+' mph · humidity '+hum+'%'
      +' · modeled coastal surge '+surgeFt+'–'+(surgeFt+3)+' ft near '+CITY_NAME
      +' · outbound freeways congested';
  }
  const rainIn=cat>=2?5:cat>=1?3:1.5;
  return catTxt+' · live wind '+w+' mph · humidity '+hum+'%'
    +' · modeled rain '+rainIn+'–'+(rainIn+3)+'" over '+METRO_NAME
    +' · flash-flood risk on local corridors';
}
function hazLiveWildfireStatus(){
  const wx=liveWx||{};
  const hum=wx.hum!=null?wx.hum:50;
  const w=wx.wind||0;
  const rain=wxBlend.rain||0;
  const idx=clamp((100-hum)/100*(w/22)*(1-rain*0.85),0,1);
  const risk=idx>0.65?'EXTREME':idx>0.4?'ELEVATED':idx>0.2?'MODERATE':'LOW';
  if(HTS_CITY_ID==='austin'){
    return risk+' fire weather · humidity '+hum+'% · wind '+w+' mph'
      +' · Balcones / Bee Cave / Lake Travis / Dripping Springs most exposed'
      +' · smoke drift toward MoPac & downtown if winds W–SW';
  }
  if(HTS_CITY_ID==='houston'){
    return risk+' fire weather · humidity '+hum+'% · wind '+w+' mph'
      +' · NW prairie / Cypress / Magnolia / Montgomery pine belt most exposed'
      +' · smoke drift toward Energy Corridor if winds SW';
  }
  return risk+' fire weather · humidity '+hum+'% · wind '+w+' mph'
    +' · dry fringe west / northwest of '+CITY_NAME+' most exposed'
    +' · smoke may drift toward the metro core';
}
function hazLiveFloodStatus(){
  let precip24=0;
  if(liveWx&&liveWx.hourly&&liveWx.hourly.precipitation){
    const h=liveWx.hourly.precipitation;
    for(let i=0;i<Math.min(24,h.length);i++)precip24+=h[i]||0;
  }
  if(HTS_CITY_ID==='austin'){
    const cls=precip24>=3?'>Memorial Day–class rain forecast':'Onion Creek / Memorial Day footprint';
    return cls+' ('+precip24.toFixed(2)+'" /24h forecast) · '
      +FLOOD_CERTAIN.length+' certain zones + Lady Bird ribbon'
      +' · Shoal / Onion / Walnut light when forecast >2"';
  }
  if(HTS_CITY_ID==='houston'){
    const harveyClass=precip24>=3?'>Harvey-class rain forecast':'Harvey-class footprint';
    return harveyClass+' ('+precip24.toFixed(2)+'" /24h forecast) · '
      +FLOOD_CERTAIN.length+' certain zones + bayou ribbons'
      +' · Addicks/Barker release paths light when forecast >2"';
  }
  const cls=precip24>=3?'Heavy rain forecast':'Local flood footprint';
  return cls+' ('+precip24.toFixed(2)+'" /24h forecast) · '
    +FLOOD_CERTAIN.length+' flood-prone zones for '+CITY_NAME
    +' · educational overlay';
}
function hazActivate(mode){
  const sc=HAZ_SCENARIOS[mode];if(!sc)return;
  const H=window.HAZARD;
  hazClearVisuals();
  H.mode=mode;H.active=true;H.t=0;H.intensity=0;H.congBoost=sc.cong;
  H.group=new THREE.Group();scene.add(H.group);
  document.querySelectorAll('#hazBtns .btn').forEach(b=>{
    b.classList.toggle('on',b.getAttribute('data-haz')===mode);
    b.classList.remove('hurricane','wildfire','flood','nuclear');
    if(b.getAttribute('data-haz')===mode)b.classList.add(mode);
  });
  hazSetYieldUI(mode);

  if(mode==='hurricane'){
    const wx=liveWx||{};
    const w=wx.wind||0;
    const catScale=clamp(w/85,0.6,1.35);
    if(HTS_IS_AUS){
      const core=geoToWorld(30.15,-97.55); /* Gulf moisture push into SE Travis */
      H.group.add(hazMakeDisk(core.x,core.z,700*catScale,0x6366f1,0.28,3));
      H.group.add(hazMakeDisk(core.x,core.z,1400*catScale,0x4c1d95,0.14,2.2));
      H.group.add(hazMakeDisk(core.x,core.z,2200*catScale,0x312e81,0.08,1.8));
      const r1=hazMakeRing(core.x,core.z,800*catScale,1050*catScale,0xa78bfa,4,0.42);H.group.add(r1.mesh);H.rings.push(r1);
      const r2=hazMakeRing(core.x,core.z,1500*catScale,1850*catScale,0x7c3aed,3.5,0.32);H.group.add(r2.mesh);H.rings.push(r2);
      const trackSp=warnSprite('hurricane','Rain shield','Central Texas',0.4);
      trackSp.position.set(core.x,50,core.z);H.group.add(trackSp);H.labels.push(trackSp);
      for(const [lat,lng,lr] of [[30.245,-97.77,380],[30.265,-97.75,320],[30.21,-97.69,360],[30.35,-97.68,300]]){
        const p=geoToWorld(lat,lng);
        H.group.add(hazMakeDisk(p.x,p.z,lr*catScale,0x2563eb,0.22,2));
      }
      for(const [lat,lng,r,nm] of [[30.35,-97.73,260,'I-35 N'],[30.20,-97.75,260,'I-35 S'],[30.29,-97.76,240,'MoPac'],[30.22,-97.80,240,'SH-71 W'],[30.267,-97.743,220,'Downtown']]){
        const p=geoToWorld(lat,lng);
        H.group.add(hazMakeDisk(p.x,p.z,r,0xc4b5fd,0.14,5));
        const ev=textSprite('Relief · '+nm,0.32);ev.position.set(p.x,24,p.z);H.group.add(ev);H.labels.push(ev);
      }
      sc.fly={x:core.x,z:core.z,r:clamp(2400*catScale,1800,4200)};
    }else if(HTS_CITY_ID==='houston'){
      const core=geoToWorld(29.35,-94.85);
      H.group.add(hazMakeDisk(core.x,core.z,900*catScale,0x6366f1,0.28,3));
      H.group.add(hazMakeDisk(core.x,core.z,1800*catScale,0x4c1d95,0.14,2.2));
      H.group.add(hazMakeDisk(core.x,core.z,2800*catScale,0x312e81,0.08,1.8));
      const r1=hazMakeRing(core.x,core.z,1000*catScale,1300*catScale,0xa78bfa,4,0.42);H.group.add(r1.mesh);H.rings.push(r1);
      const r2=hazMakeRing(core.x,core.z,2000*catScale,2400*catScale,0x7c3aed,3.5,0.32);H.group.add(r2.mesh);H.rings.push(r2);
      const trackSp=warnSprite('hurricane','Landfall cone','Galveston Bay',0.4);
      trackSp.position.set(core.x,50,core.z);H.group.add(trackSp);H.labels.push(trackSp);
      for(const [lx,lz,lr] of [[2050,3020,500],[7150,2700,1400],[3800,-200,600],[2450,420,450]]){
        H.group.add(hazMakeDisk(lx,lz,lr*catScale,0x2563eb,0.22,2));
      }
      for(const [x,z,r,nm] of [[60,-800,280,'I-45 N'],[-1200,-200,320,'I-10 W'],[400,-1400,300,'US-59 N'],[60,60,260,'Downtown']]){
        H.group.add(hazMakeDisk(x,z,r,0xc4b5fd,0.14,5));
        const ev=textSprite('Evac · '+nm,0.32);ev.position.set(x,24,z);H.group.add(ev);H.labels.push(ev);
      }
      sc.fly={x:core.x,z:core.z,r:clamp(2800*catScale,2200,5200)};
    }else{
      /* Pack metros — storm core SE of origin; never reuse Galveston / Houston freeway labels */
      const [oLat,oLng]=CITY_HAZ.downtownLatLng||[METRO_LAT,METRO_LNG];
      const core=geoToWorld(oLat-(CITY_HAZ.coastal?0.28:0.12),oLng+(CITY_HAZ.coastal?0.22:0.10));
      const coreScale=CITY_HAZ.coastal?1:0.72;
      H.group.add(hazMakeDisk(core.x,core.z,800*catScale*coreScale,0x6366f1,0.28,3));
      H.group.add(hazMakeDisk(core.x,core.z,1600*catScale*coreScale,0x4c1d95,0.14,2.2));
      H.group.add(hazMakeDisk(core.x,core.z,2400*catScale*coreScale,0x312e81,0.08,1.8));
      const r1=hazMakeRing(core.x,core.z,900*catScale*coreScale,1200*catScale*coreScale,0xa78bfa,4,0.42);H.group.add(r1.mesh);H.rings.push(r1);
      const r2=hazMakeRing(core.x,core.z,1700*catScale*coreScale,2100*catScale*coreScale,0x7c3aed,3.5,0.32);H.group.add(r2.mesh);H.rings.push(r2);
      const trackSp=warnSprite('hurricane',CITY_HAZ.coastal?'Landfall cone':'Storm shield',METRO_NAME,0.4);
      trackSp.position.set(core.x,50,core.z);H.group.add(trackSp);H.labels.push(trackSp);
      const dt=geoToWorld(oLat,oLng);
      H.group.add(hazMakeDisk(dt.x,dt.z,320*catScale,0x2563eb,0.22,2));
      const roads=(HTS_PACK&&HTS_PACK.roads)||[];
      for(const road of roads.slice(0,4)){
        const pts=road.pts;if(!pts||pts.length<2)continue;
        const mid=pts[Math.floor(pts.length/2)];
        H.group.add(hazMakeDisk(mid[0],mid[1],240,0xc4b5fd,0.14,5));
        const ev=textSprite((CITY_HAZ.coastal?'Evac':'Relief')+' · '+(road.short||road.name||'Corridor'),0.32);
        ev.position.set(mid[0],24,mid[1]);H.group.add(ev);H.labels.push(ev);
      }
      sc.fly={x:core.x,z:core.z,r:clamp(2600*catScale,2000,4800)};
    }
    if(!sc.fly){
      const ll=CITY_HAZ.downtownLatLng||[METRO_LAT,METRO_LNG];
      const p=geoToWorld(ll[0],ll[1]);
      sc.fly={x:p.x,z:p.z,r:3600};
    }
    const st=$('hazStatus');if(st)st.textContent=hazLiveHurricaneStatus();
  }else if(mode==='wildfire'){
    const wx=liveWx||{};
    const hum=wx.hum!=null?wx.hum:50;
    const w=wx.wind||0;
    const idx=clamp((100-hum)/100*(w/22),0.2,1);
    const fires=CITY_HAZ.wildfireLatLng
      ?CITY_HAZ.wildfireLatLng.map(([lat,lng,r])=>{const p=geoToWorld(lat,lng);return [p.x,p.z,r];})
      :(HTS_CITY_ID==='houston'?HOUSTON_WILDFIRE_XZ:[]);
    for(const [x,z,r] of fires){
      const rs=r*(0.7+idx*0.5);
      H.group.add(hazMakeDisk(x,z,rs,0xea580c,0.35+idx*0.15,2.5));
      H.group.add(hazMakeDisk(x,z,rs*1.8,0xf97316,0.16,2));
      const ring=hazMakeRing(x,z,rs*1.9,rs*2.25,0xfdba74,4,0.35);H.group.add(ring.mesh);H.rings.push(ring);
      for(let i=0;i<5;i++){
        const sm=hazMakeDisk(x+i*180+80,z-i*120-40,90+i*40,0x78716c,0.14-i*0.02,8+i*3);
        H.group.add(sm);H.smoke.push(sm);
      }
    }
    const wr=hazWindRad();
    const smokeLL=CITY_HAZ.smokeOriginLatLng||CITY_HAZ.downtownLatLng||[METRO_LAT,METRO_LNG];
    const smokeOrigin=geoToWorld(smokeLL[0],smokeLL[1]);
    for(let i=1;i<=6;i++){
      const t=i/6;
      const sx=smokeOrigin.x+Math.cos(wr)*1200*t;
      const sz=smokeOrigin.z+Math.sin(wr)*1200*t;
      H.group.add(hazMakeDisk(sx,sz,200+120*t,0x57534e,0.1*(1-t*0.3),10+t*2));
    }
    const st=$('hazStatus');if(st)st.textContent=hazLiveWildfireStatus();
    const smokeAt=smokeOrigin;
    sc.fly={x:smokeAt.x,z:smokeAt.z,r:3200};
  }else if(mode==='flood'){
    hazBuildFlood();
    const precip=hazLiveFloodStatus();
    const st=$('hazStatus');if(st)st.textContent=precip;
    const banLL=CITY_HAZ.floodBannerLatLng||CITY_HAZ.downtownLatLng||[METRO_LAT,METRO_LNG];
    const banAt=geoToWorld(banLL[0],banLL[1]);
    sc.fly={x:banAt.x,z:banAt.z,r:2800};
  }else if(mode==='nuclear'){
    hazPopulateNukeUI();
    const top=hazNukeRankTargets()[0];
    const origin=top?{x:top.x,z:top.z}:(function(){
      const ll=CITY_HAZ.downtownLatLng||[METRO_LAT,METRO_LNG];
      const p=geoToWorld(ll[0],ll[1]);
      return {x:p.x,z:p.z};
    })();
    hazBuildNuclear(origin,H.yieldKt||10);
    hazBuildNukeTargetMarkers(H.yieldKt||10);
    const R=hazNukeRanges(H.yieldKt||10);
    const lik=hazNukeLikelihoodAt(origin.x,origin.z);
    H.nukeOrigin={x:origin.x,z:origin.z,lik};
    H.congBoost=clamp(0.42+Math.log10((H.yieldKt||10)+1)*0.2,0.5,0.96);
    const st=$('hazStatus');
    if(st)st.textContent='Top likely: '+(top?top.short:'Downtown')+' ('+(top?top.lik.pct:lik.pct)+'%) · '+R.label
      +' · click map or pick target · 5 psi '+R.mi.severe.toFixed(2)+' mi · thermal '+R.mi.thermal.toFixed(2)
      +' mi · 1 psi '+R.mi.light.toFixed(2)+' mi · fallout ~'+R.mi.fallout.toFixed(1)+' mi.';
    sc.fly={x:origin.x,z:origin.z,r:clamp(R.light*2.4,1600,7200)};
  }

  const el=document.createElement('div');el.className='alert '+sc.cls;
  let ab=sc.alert;
  if(mode==='nuclear'){
    const y=nukeRadiiMi(H.yieldKt||10);
    const top=hazNukeRankTargets()[0];
    ab='SIM '+y.label+' — top likely target '+top.short+' ('+top.lik.pct+'%). Click map for any point. '
      +'5 psi: '+y.severe.toFixed(2)+' mi · thermal: '+y.thermal.toFixed(2)+' mi · 1 psi: '+y.light.toFixed(2)+' mi. Drill only.';
  }
  el.innerHTML='<div class="at">'+sc.title+'</div><div class="ab">'+ab+'</div>';
  document.getElementById('alerts').prepend(el);
  H.alertEl=el;

  stopFollow();
  if(!sc.fly){
    const ll=CITY_HAZ.downtownLatLng||[METRO_LAT,METRO_LNG];
    const p=geoToWorld(ll[0],ll[1]);
    sc.fly={x:p.x,z:p.z,r:3200};
  }
  camGoal.target.set(sc.fly.x,0,sc.fly.z);
  camGoal.radius=sc.fly.r;
  camGoal.phi=1.05;
}
function hazDeactivate(){
  const H=window.HAZARD;
  hazClearVisuals();
  H.mode=null;H.active=false;H.intensity=0;H.congBoost=0;H.t=0;H.nukePlaceMode=false;H.nukeOrigin=null;
  document.querySelectorAll('#hazBtns .btn').forEach(b=>b.classList.remove('on','hurricane','wildfire','flood','nuclear'));
  hazSetYieldUI(null);
  const mapBtn=$('hazNukeMapBtn');if(mapBtn)mapBtn.classList.remove('on');
  const st=$('hazStatus');
  if(st)st.textContent='No active hazard prediction. Pick a scenario to preview impacts on traffic & the map.';
}
function rayGroundHit(e){
  _ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);
  _ray.setFromCamera(_ndc,camera);
  const o=_ray.ray.origin,d=_ray.ray.direction;
  if(Math.abs(d.y)<1e-6)return null;
  const t=-o.y/d.y;
  if(t<0)return null;
  return {x:o.x+d.x*t,z:o.z+d.z*t};
}
function updateHazard(dt){
  const H=window.HAZARD;if(!H.active||!H.mode)return;
  H.t+=dt;
  H.intensity=clamp(H.t/8,0,1);
  const pulse=0.85+0.15*Math.sin(H.t*1.8);
  for(const r of H.rings){
    r.mat.opacity=clamp((r.mat.userData&&r.mat.userData.baseOp!=null?r.mat.userData.baseOp:0.35)*H.intensity*pulse,0.08,0.75);
    const s=1+0.03*Math.sin(H.t*1.2+r.baseR*0.001);
    r.mesh.scale.set(s,s,1);
  }
  for(const sm of H.smoke){
    sm.material.opacity=clamp((sm.material.opacity||0.12)*0.99+0.002*Math.sin(H.t+sm.position.x),0.04,0.22);
    sm.position.x+=dt*12;sm.position.z-=dt*6;
  }
  if(H.group)H.group.visible=!window.osmMode;
}
function hazardCongBoost(){
  const H=window.HAZARD;
  if(!H.active)return 0;
  return H.congBoost*H.intensity;
}
function stormTrafficBoost(){
  const alerts=window.STORM_TRACKER&&window.STORM_TRACKER.alerts&&window.STORM_TRACKER.alerts.all;
  if(!alerts||!alerts.length)return 0;
  if(alerts.some(a=>a.tier==='warning'))return 0.18;
  if(alerts.some(a=>a.tier==='surge'||a.tier==='severe'))return 0.13;
  if(alerts.some(a=>a.tier==='watch'))return 0.07;
  return 0;
}
function hazardNukeRoadBoost(road,arc){
  const H=window.HAZARD;
  if(!H.active||H.mode!=='nuclear'||!H.nukeOrigin)return 0;
  const R=hazNukeRanges(H.yieldKt||10);
  roadPos(road,arc,_rp);
  const d=Math.hypot(_rp.px-H.nukeOrigin.x,_rp.pz-H.nukeOrigin.z);
  if(d<R.severe)return 1.1;
  if(d<R.light)return 0.45*Math.exp(-d/(R.light*0.55));
  return 0;
}

/* ---------------- stadium event traffic ---------------- */
let eventDay=rand()<0.65,eventActive=false,eventEl=null,lastRollDay=-1;
function eventLevel(h){
  if(!eventDay)return 0;
  /* arrivals peak ~18:40, departures ~22:10 */
  const a=Math.exp(-Math.pow((h-18.7)/0.9,2)),b=Math.exp(-Math.pow((h-22.2)/0.7,2));
  return Math.max(a,b*0.9);
}
function updateEvent(){
  /* Pack cities skip Houston NRG event spillover */
  if(HTS_HAS_PACK)return 0;
  const lv=eventLevel(simH);
  const on=lv>0.18;
  /* Roll event day once per sim calendar day (not RAF wall clock) */
  const dayKey=liveMode
    ? Math.floor(Date.now()/86400000)
    : Math.floor((Date.now()+(window.simOffsetSec||0)*1000)/86400000);
  if(Math.floor(simH)===4&&lastRollDay!==dayKey){eventDay=rand()<0.65;lastRollDay=dayKey;}
  if(on&&!eventActive){
    eventActive=true;
    eventEl=document.createElement('div');eventEl.className='alert event';
    eventEl.innerHTML='<div class="at"><svg width="12" height="12" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="#c69bf5" stroke-width="2.2"/><path d="M12 3.5v17M3.5 12h17" stroke="#c69bf5" stroke-width="1.6"/></svg>Event traffic</div>'
      +'<div class="ab">NRG Stadium event tonight — expect heavy traffic on I-610 South &amp; SH-288</div>';
    document.getElementById('alerts').appendChild(eventEl);
  }else if(!on&&eventActive){
    eventActive=false;
    if(eventEl){const el=eventEl;el.style.opacity=0;el.style.transition='opacity .5s';setTimeout(()=>el.remove(),600);eventEl=null;}
  }
  return lv;
}

/* ---------------- congestion + population tick ---------------- */
const COL_FREE=new THREE.Color(0x22c55e),COL_SLOW=new THREE.Color(0xfacc15),
      COL_HEAVY=new THREE.Color(0xf97316),COL_JAM=new THREE.Color(0xe11d2e),_cc=new THREE.Color();
function congColor(c,out){
  if(c<0.35)out.copy(COL_FREE).lerp(COL_SLOW,c/0.35);
  else if(c<0.62)out.copy(COL_SLOW).lerp(COL_HEAVY,(c-0.35)/0.27);
  else out.copy(COL_HEAVY).lerp(COL_JAM,clamp((c-0.62)/0.3,0,1));
  return out;
}
let congTimer=0,overallCong=0,simClock=0,hotLabel='—';
function liveFlowFresh(flow){
  return !!(flow&&flow.cur>0&&flow.at&&(Date.now()-flow.at)<LIVE_FLOW_STALE_MS);
}
function liveSegCongBump(road,dir,k,base){
  let c=base;
  const segN=dir.segCong.length;
  for(const inc of roadIncidents(road,dir)){
    const ki=inc.arc/road.s.total*segN;
    const upstream=dir.sign>0?(k<=ki):(k>=ki);
    const age=inc.sim?Math.min(1,inc.t/25):1;
    if(upstream)c+=inc.k*Math.exp(-Math.abs(ki-k)*0.55)*age*0.12;
  }
  for(const w of workZones){
    if(w.road!==road||w.dir!==dir)continue;
    const ki=(w.a0+w.a1)/2/road.s.total*segN;
    const upstream=dir.sign>0?(k<=ki):(k>=ki);
    if(upstream)c+=0.35*Math.exp(-Math.abs(ki-k)*0.5);
  }
  return clamp(c,0,1);
}
function trafficTick(dt){
  _incidentCache=buildIncidentCache();
  const vol=demand(simH,weekend);
  const dirBias=volumeMode==='auto'?keyNum(DIRB_KEYS,simH):0;
  const evLv=updateEvent();
  const stormBoost=stormTrafficBoost();
  refreshIncidentCount();
  const cx=cam.target.x,cz=cam.target.z;
  let congSum=0,congN=0,hotMax=-1;
  for(const road of roads){
    const mid=road.segCount>>1;
    const d2=(road.segX[mid]-cx)**2+(road.segZ[mid]-cz)**2;
    const nearR=road.suburbTraffic?2400:3400;
    /* Hysteresis — stop pop-in/out when mid-road sits on the cull edge */
    const farR=nearR*1.22;
    if(road._near)road._near=d2<farR*farR;
    else road._near=d2<nearR*nearR;
    const isArt=road.def.arterial||road.def.surface;
    for(const dir of road.dirs){
      if(!road._near){dir.target=0;continue;}
      const liveKey=road.def.id+'_'+dir.sign;
      const live=window.LIVE_TRAFFIC&&window.LIVE_TRAFFIC.flows&&window.LIVE_TRAFFIC.flows.get(liveKey);
      const liveCong=live?live.cong:null;
      let dsum=0;
      /* Time-lapse: ignore live probes — congestion follows simulated rush hour + forecast weather */
      if(liveMode&&liveFlowFresh(live)){
        /* Live TranStar / TomTom probe — use measured speed/congestion only */
        for(let k=0;k<dir.segCong.length;k++){
          dir.segCong[k]=clamp(liveSegCongBump(road,dir,k,live.cong)+stormBoost,0,1);
          if(isArt)dir.segCong[k]=Math.min(dir.segCong[k],0.88);
          dsum+=dir.segCong[k];
        }
      }else{
      for(let k=0;k<dir.segCong.length;k++){
        const inb=dir.segInb[k];
        let d=vol*(1+0.4*dirBias*inb);
        d*=dir.segMult[k];
        d+=wxBlend.cong;
        d+=stormBoost;
        d+=hazardCongBoost();
        d+=hazardNukeRoadBoost(road,(k+0.5)/dir.segCong.length*road.s.total);
        d+=0.05*Math.sin(simClock*0.00025+dir.segPhase[k]);
        for(const inc of roadIncidents(road,dir)){
          const ki=inc.arc/road.s.total*dir.segCong.length;
          const upstream=dir.sign>0?(k<=ki):(k>=ki);
          const age=inc.sim?Math.min(1,inc.t/25):1;
          if(upstream)d+=inc.k*Math.exp(-Math.abs(ki-k)*0.55)*age;
        }
        for(const w of workZones){
          if(w.road!==road||w.dir!==dir)continue;
          const ki=(w.a0+w.a1)/2/road.s.total*dir.segCong.length;
          const upstream=dir.sign>0?(k<=ki):(k>=ki);
          if(upstream)d+=0.8*Math.exp(-Math.abs(ki-k)*0.5);
        }
        for(const f of floods){
          if(f.roadObj!==road)continue;
          const ki=f.arc/road.s.total*dir.segCong.length;
          d+=1.25*f.level*Math.exp(-Math.abs(ki-k)*0.45);
        }
        if(evLv>0.05&&!HTS_HAS_PACK){
          const dx=road.segX[k]-NRG.x,dz=road.segZ[k]-NRG.z;
          const dist=Math.hypot(dx,dz);
          if(dist<820)d+=0.62*evLv*(1-dist/820);
        }
        if(isArt)d*=0.72;
        let modeled=clamp((d-0.22)/0.95,0,1);
        if(isArt)modeled=Math.min(modeled,0.82);
        let blended;
        if(liveMode&&liveCong!=null){
          blended=clamp(lerp(modeled,liveCong,0.9),0,1);
        }else blended=modeled;
        dir.segCong[k]=blended;
        if(isArt)dir.segCong[k]=Math.min(dir.segCong[k],0.88);
        dsum+=dir.segCong[k];
      }
      }
      congSum+=dsum;congN+=dir.segCong.length;
      const avg=dsum/dir.segCong.length;
      if(!isArt&&avg>hotMax){hotMax=avg;
        const inbAvg=dir.segInb.reduce((a,b)=>a+b,0)/dir.segInb.length;
        hotLabel=road.def.short+' '+(inbAvg>0?'inbound':'outbound');}
      const colAttr=dir.strip&&dir.strip.geometry.getAttribute('color');
      const n=road.s.n,segN=dir.segCong.length;
      if(colAttr){
      for(let i=0;i<=n;i++){
        const seg=Math.min(segN-1,Math.floor(i/(n+1)*segN));
        congColor(dir.segCong[seg],_cc);
        colAttr.setXYZ(i*2,_cc.r,_cc.g,_cc.b);colAttr.setXYZ(i*2+1,_cc.r,_cc.g,_cc.b);
        if(dir.mapColAttr){dir.mapColAttr.setXYZ(i*2,_cc.r,_cc.g,_cc.b);dir.mapColAttr.setXYZ(i*2+1,_cc.r,_cc.g,_cc.b);}
      }
      colAttr.needsUpdate=true;
      if(dir.mapColAttr)dir.mapColAttr.needsUpdate=true;
      }
      const share=road.def.share/shareSum;
      const dBias=(1+0.4*dirBias*(dir.segInb.reduce((a,b)=>a+b,0)/dir.segInb.length));
      const artScale=isArt?(road.suburbTraffic?1.2:0.88):1;
      const suburbMul=road.suburbTraffic?clamp(1.8-vol*0.35,0.75,1.6):1;
      const avgCong=dsum/Math.max(1,dir.segCong.length);
      const headway=desiredHeadway(road,dir,liveMode?live:null,avgCong);
      const densityCap=Math.round((road.s.total/headway)*dir.lanes.length*clamp(vol,0.2,1));
      const modelTarget=Math.round(TOTAL_TARGET*share*0.5*clamp(vol*1.35,0.06,1.15)*clamp(dBias,0.6,1.4)*artScale*suburbMul);
      dir.target=clamp(Math.min(densityCap,modelTarget),road.suburbTraffic?2:3,road.suburbTraffic?(road.def.highway==='residential'?10:18):95);
    }
  }
  overallCong=congN?congSum/congN:0;
  /* adjust populations — v10.8.6 style: spawn into gaps, cull far cars */
  for(const road of roads)for(const dir of road.dirs){
    for(const lane of dir.lanes){
      if(lane.length>1)lane.sort((a,b)=>a.s-b.s);
      for(let pi=lane.length-1;pi>=0;pi--){
        if(!Number.isFinite(lane[pi].s))lane.splice(pi,1);
      }
    }
    let cur=0;for(const l of dir.lanes)cur+=l.length;
    if(cur<dir.target){
      const add=Math.min(3,dir.target-cur);
      for(let i=0;i<add;i++){
        const li=Math.floor(rand()*dir.lanes.length);
        const lane=dir.lanes[li];
        const L=road.s.total;
        let s0=road.s.closed?rand()*L:0;
        /* Don't spawn cars on runway / apron */
        if(typeof inAirfield==='function'){
          for(let t=0;t<8;t++){
            roadPos(road,dir.sign>0?s0:L-s0,_rp);
            if(!inAirfield(_rp.px,_rp.pz))break;
            s0=rand()*L;
          }
          roadPos(road,dir.sign>0?s0:L-s0,_rp);
          if(inAirfield(_rp.px,_rp.pz))continue;
        }
        let idx=0;while(idx<lane.length&&lane[idx].s<s0)idx++;
        const nxt=lane.length?lane[idx%lane.length]:null;
        const prv=lane.length?lane[(idx-1+lane.length)%lane.length]:null;
        let ok=true;
        if(nxt&&Math.abs(((nxt.s-s0)+L)%L)<42&&Math.abs(nxt.s-s0)<L*0.5)ok=false;
        if(prv&&Math.abs(((s0-prv.s)+L)%L)<42&&Math.abs(s0-prv.s)<L*0.5)ok=false;
        if(!ok)continue;
        const liveKey=road.def.id+'_'+dir.sign;
        const live=window.LIVE_TRAFFIC&&window.LIVE_TRAFFIC.flows&&window.LIVE_TRAFFIC.flows.get(liveKey);
        const seg=clamp(Math.floor(s0/L*dir.segCong.length),0,dir.segCong.length-1);
        const mph=(liveMode&&liveFlowFresh(live))?sanitizeLiveMph(live.cur,live.ff,road):road.def.ff*(1-0.55*dir.segCong[seg])*wxBlend.speed;
        const v=makeVehicle(road,s0,clamp(mph,8,road.def.ff));
        v._laneI=li;
        insertVehicleSorted(lane,v);
      }
    }else if(cur>dir.target+4){
      let removed=0;
      for(const lane of dir.lanes){
        if(removed>=2)break;
        for(let i=lane.length-1;i>=0;i--){
          if(lane[i].police)continue;
          roadPos(road,dir.sign>0?lane[i].s:road.s.total-lane[i].s,_rp);
          const dx=_rp.px-cam.target.x,dz=_rp.pz-cam.target.z;
          if(dx*dx+dz*dz>1200000){lane.splice(i,1);removed++;break;}
        }
      }
    }
  }
}
const _rp={px:0,pz:0,tx:0,tz:0,py:0};
/* Shared by trafficTick + moveVehicles — must stay module-scope (wrap used to throw ReferenceError) */
function vehicleCullR(){return Math.max(1100,cam.radius*1.08+280);}
function vehicleCullR2(){const r=vehicleCullR();return r*r;}
function arcDist2(road,dir,s){
  roadPos(road,dir.sign>0?s:road.s.total-s,_rp);
  const dx=_rp.px-cam.target.x,dz=_rp.pz-cam.target.z;
  return dx*dx+dz*dz;
}
function arcOffScreen(road,dir,s){return arcDist2(road,dir,s)>vehicleCullR2();}
function vehicleWorldPos(road,dir,li,laneW,sPos,v){
  roadPos(road,dir.sign>0?sPos:road.s.total-sPos,_rp);
  const rx=-_rp.tz,rz=_rp.tx;
  const maxLat=Math.max(2.2,road.def.width*0.5-1.35);
  const lat=clamp(dir.sign*(1.7+(li+0.5)*laneW),-maxLat,maxLat);
  let px=_rp.px+rx*lat,pz=_rp.pz+rz*lat;
  /* Ground footprints only affect surface streets — elevated freeways ignore them */
  const onDeck=_rp.py>=12||(!road.def.arterial&&!road.def.surface);
  if(!onDeck){
    let hitB=footHitsBldg(px,pz);
    if(hitB){
      /* Prefer last clear lateral over shrinking toward centerline (downtown jitter) */
      if(v&&v._latOk!=null&&Number.isFinite(v._latOk)){
        px=_rp.px+rx*v._latOk;pz=_rp.pz+rz*v._latOk;
        if(!footHitsBldg(px,pz)){
          const hd=Math.atan2(_rp.tx*dir.sign,_rp.tz*dir.sign);
          return {px,pz,py:_rp.py+0.05,hd,fx:_rp.tx*dir.sign,fz:_rp.tz*dir.sign};
        }
      }
      let cleared=false,useLat=lat;
      for(const shrink of [0.72,0.55,0.38]){
        useLat=lat*shrink;
        px=_rp.px+rx*useLat;pz=_rp.pz+rz*useLat;
        if(!footHitsBldg(px,pz)){cleared=true;break;}
      }
      if(!cleared)return null; /* skip draw this frame — better than centerline snap */
      if(v)v._latOk=useLat;
    }else if(v)v._latOk=lat;
  }
  const hd=Math.atan2(_rp.tx*dir.sign,_rp.tz*dir.sign);
  return {px,pz,py:_rp.py+0.05,hd,fx:_rp.tx*dir.sign,fz:_rp.tz*dir.sign};
}
function smoothHeading(v,hd,dt){
  if(v._hdSm==null||!Number.isFinite(v._hdSm)){v._hdSm=hd;return hd;}
  let d=hd-v._hdSm;
  while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;
  v._hdSm+=d*clamp(dt*10,0,1);
  while(v._hdSm>Math.PI)v._hdSm-=TAU;while(v._hdSm<-Math.PI)v._hdSm+=TAU;
  return v._hdSm;
}

/* ---------------- vehicle movement + instancing ---------------- */
const dummy=new THREE.Object3D(),dW=new THREE.Object3D(),dLight=new THREE.Object3D();
const vehRef=new Array(MAX_INST);
/* zipper merge: move v from its lane into the adjacent open lane if there's a gap */
function tryMerge(dir,li,lane,i,v){
  const ti=li>0?li-1:li+1;
  const tgt=dir.lanes[ti];if(!tgt)return false;
  let idx=0;while(idx<tgt.length&&tgt[idx].s<v.s)idx++;
  const prev=idx>0?tgt[idx-1]:null,next=idx<tgt.length?tgt[idx]:null;
  const gp=prev?(v.s-prev.s)-((v.type.len+prev.type.len)*0.5*VS+3):1e9;
  const gn=next?(next.s-v.s)-((v.type.len+next.type.len)*0.5*VS+3):1e9;
  if(gp>0&&gn>0){lane.splice(i,1);tgt.splice(idx,0,v);v._laneI=ti;if(v.police)v._lane=tgt;return true;}
  return false;
}
const _col=new THREE.Color();
function moveVehicles(dt,nightF){
  let idx=0,renderedSpeedSum=0,renderedVeh=0;
  const brakeGlow=clamp(0.35+nightF*0.65,0,1);
  /* v10.8.6 motion: no off-screen teleport respawns, smooth lane lerp, simple wrap */
  for(const road of roads){
    if(road._near===false)continue;
    const s=road.s,L=s.total,def=road.def,laneW=road.laneW;
    for(const dir of road.dirs){
      const segN=dir.segCong.length;
      for(let li=0;li<dir.lanes.length;li++){
        const lane=dir.lanes[li];
        const len=lane.length;
        for(let i=Math.min(len,lane.length)-1;i>=0;i--){
          const v=lane[i];
          if(!v||v._dead)continue;
          const sPos=dir.sign>0?v.s:L-v.s;
          const seg=clamp(Math.floor(sPos/L*segN),0,segN-1);
          const cong=dir.segCong[seg];
          const liveKey=def.id+'_'+dir.sign;
          const liveFlow=window.LIVE_TRAFFIC&&window.LIVE_TRAFFIC.flows&&window.LIVE_TRAFFIC.flows.get(liveKey);
          const liveOk=liveMode&&liveFlowFresh(liveFlow);
          let vmax;
          if(liveOk){
            const capMph=sanitizeLiveMph(liveFlow.cur,liveFlow.ff,road);
            vmax=capMph*MPH*(v.aggr||1);
          }else{
            vmax=def.ff*v.type.ffk*(v.aggr||1)*(1-0.82*cong)*wxBlend.speed*MPH;
            if(liveMode&&liveFlow&&liveFlow.cur>5)vmax=lerp(vmax,sanitizeLiveMph(liveFlow.cur,liveFlow.ff,road)*MPH,0.75);
            else vmax*=1.02;
          }
          if(v.police)vmax=Math.max(vmax,def.ff*0.92*MPH);
          if(!liveOk){
            if(cong>0.55)vmax=Math.min(vmax,(cong>0.78?6:14)*MPH*(0.55+0.45*(v.aggr||1)));
            if(cong>0.72&&(v._jamLock||rand()<0.012)){
              v._jamLock=(v._jamLock||0)+dt;
              if(v._jamLock<8+rand()*18)vmax=Math.min(vmax,(0.4+rand()*2.2)*MPH);
              else v._jamLock=0;
            }else if(cong<0.5)v._jamLock=0;
          }else v._jamLock=0;
          let mergedOut=false;
          for(const w of workZones){
            if(w.road!==road||w.dir!==dir)continue;
            const inZone=sPos>=w.a0-w.taper&&sPos<=w.a1;
            const appr=dir.sign>0?(w.a0-w.taper-sPos):(sPos-(w.a1));
            if(inZone)vmax=Math.min(vmax,w.capMph*MPH);
            else if(appr>0&&appr<260)vmax=Math.min(vmax,(w.capMph+14)*MPH);
            if(li===w.lane){
              if(inZone)vmax=Math.min(vmax,4*MPH);
              else if(appr>0&&appr<420){
                vmax=Math.min(vmax,18*MPH);
                if(!v._mCd||simClock>v._mCd){v._mCd=simClock+350;
                  if(tryMerge(dir,li,lane,i,v)){mergedOut=true;break;}}
              }
            }
          }
          if(mergedOut)continue;
          for(const f of floods){
            if(f.roadObj===road&&Math.abs(sPos-f.arc)<95)
              vmax=Math.min(vmax,(14-9*f.level)*MPH);
          }
          for(const tr of POLICE_TRAPS){
            if(tr.road!==road||tr.dir!==dir)continue;
            const ahead2=dir.sign>0?(tr.arc-sPos):(sPos-tr.arc);
            if(ahead2>0&&ahead2<150)vmax*=0.8;
          }
          for(const inc of roadIncidents(road,dir)){
            if(Math.abs(sPos-inc.arc)<70)
              vmax=Math.min(vmax,(inc.kind==='crash'||inc.kind==='accident'?22:38)*MPH);
          }
          let tv=vmax,ahead=null,gap=1e9;
          const lv=lane.length;
          const closed=s.closed;
          const hasAhead=closed?(lv>1):(i<lv-1);
          if(hasAhead){
            ahead=closed?lane[(i+1)%lv]:lane[i+1];
            gap=ahead.s-v.s;if(gap<=0&&closed)gap+=L;
            if(gap<=0)gap=0;
            const minGap=(v.type.len+ahead.type.len)*0.5*VS+2.4;
            gap-=minGap;
            const safe=6+v.v*0.55;
            if(gap<safe){
              const jamHard=cong>0.62&&!liveOk;
              const crawl=jamHard?0:(gap>1.2?2.2*MPH:0);
              const follow=Math.max(ahead.v*(jamHard?0.85:0.92),crawl);
              tv=Math.min(tv,follow*clamp(gap/Math.max(2.5,safe*0.55),0.02,1));
              if(gap<1.5&&ahead.v<1.5)tv=Math.min(tv,jamHard?0:0.4);
              if(jamHard&&gap<4)tv=Math.min(tv,0.15);
              if(dir.lanes.length>1&&v.v<vmax*0.66&&cong<0.7&&simClock>(v._lcCd||0)){
                v._lcCd=simClock+700+rand()*900;
                if(tryMerge(dir,li,lane,i,v))mergedOut=true;
              }
            }
            if(mergedOut)continue;
            if(!liveOk){
              if(!(def.arterial||def.surface)&&cong<0.58&&tv<4*MPH&&gap>8)tv=Math.max(tv,8*MPH*(1-0.5*cong));
            }
            v.brake=tv<v.v*0.9||(cong>0.65&&tv<6*MPH);
            v.v+=(tv-v.v)*clamp(dt*(tv<v.v?3.8:1.25),0,1);
            if(v.v<0)v.v=0;
            let ns=v.s+v.v*dt;
            const maxS=v.s+Math.max(0,gap);
            if(ns>maxS){ns=maxS;v.v=Math.min(v.v,Math.max(0,ahead.v));}
            if(!liveOk&&cong<0.55&&v.v<0.8&&gap>14){v.v=Math.max(v.v,3.5*MPH);ns=v.s+v.v*dt;}
            v.s=ns;
          }else{
            v.brake=false;
            v.v+=(tv-v.v)*clamp(dt*1.25,0,1);
            if(v.v<0)v.v=0;
            v.s+=v.v*dt;
          }
          if(v.s>=L){
            if(closed){v.s-=L;lane.splice(i,1);lane.unshift(v);}
            else if(v.police){
              lane.splice(i,1);v.s=0;v.v=Math.max(v.v,12);lane.unshift(v);v._dead=false;
            }else{
              /* re-enter at start if room — no off-screen teleport (that caused glitches) */
              lane.splice(i,1);
              const first=lane[0];
              const room=(v.type.len+(first?first.type.len:0))*0.5*VS+6;
              if(!first||first.s>room){v.s=0;v.v=Math.min(v.v,10);lane.unshift(v);}
              else continue;
            }
          }
          if(idx>=MAX_INST)continue;
          /* ---- place instances (v10.8.6 lane lerp + soft building push) ---- */
          roadPos(road,dir.sign>0?v.s:L-v.s,_rp);
          const deckY=_rp.py+0.05;
          const rx=-_rp.tz,rz=_rp.tx;
          if(v._laneF==null||v._laneF===undefined)v._laneF=li;
          v._laneF+=(li-v._laneF)*Math.min(1,dt*3.4);
          const off=dir.sign*(1.7+(v._laneF+0.5)*laneW);
          const fx=_rp.tx*dir.sign,fz=_rp.tz*dir.sign;
          let px=_rp.px+rx*off,pz=_rp.pz+rz*off;
          const onDeck=_rp.py>=12||(!def.arterial&&!def.surface);
          if(!onDeck){
            const hitB=footHitsBldg(px,pz);
            if(hitB){
              const side=Math.sign(rx*(px-hitB.x)+rz*(pz-hitB.z))||1;
              px=_rp.px+rx*(off+side*(hitB.hw+hitB.hd)*0.15);
              pz=_rp.pz+rz*(off+side*(hitB.hw+hitB.hd)*0.15);
              if(footHitsBldg(px,pz)){v.v*=0.4;continue;}
              v.v=Math.min(v.v,12*MPH);
            }
          }
          /* Never drive across runway / apron pads */
          if(typeof inAirfield==='function'&&inAirfield(px,pz)){
            let hop=v.s,guard=0;
            while(guard++<24){
              hop+=dir.sign>0?55:-55;
              if(hop<0||hop>L){v._dead=true;lane.splice(i,1);break;}
              roadPos(road,dir.sign>0?hop:L-hop,_rp);
              const hx=_rp.px+rx*off,hz=_rp.pz+rz*off;
              if(!inAirfield(hx,hz)){v.s=hop;v.v=Math.max(v.v,18*MPH);break;}
            }
            if(v._dead)continue;
            roadPos(road,dir.sign>0?v.s:L-v.s,_rp);
            px=_rp.px+rx*off;pz=_rp.pz+rz*off;
          }
          const heading=Math.atan2(fx,fz);
          renderedSpeedSum+=v.v;renderedVeh++;
          vehRef[idx]=v;
          v._px=px;v._pz=pz;v._py=deckY;v._hd=heading;v._laneI=li;
          const t=v.type;
          const isSemi=t.id==='semi',isTall=isSemi||t.id==='box'||t.id==='bus'||t.id==='van';
          const isTwoWheel=t.id==='moto'||t.id==='scooter'||t.id==='bike';
          if(isSemi){
            dummy.position.set(px-fx*t.len*VS*0.08,deckY+0.72,pz-fz*t.len*VS*0.08);
            dummy.rotation.set(0,heading,0);
            dummy.scale.set(t.w*VS,t.h*VS*0.82,t.len*VS*0.74);
            _col.setHex(v.tcol);
          }else if(isTwoWheel){
            dummy.position.set(px,deckY,pz);
            dummy.rotation.set(0,heading,0);
            dummy.scale.set(t.w*VS*0.7,t.h*VS*(t.id==='bike'?0.35:0.45),t.len*VS);
            _col.setHex(t.id==='bike'?0x22262c:v.col);
          }else{
            dummy.position.set(px,deckY,pz);
            dummy.rotation.set(0,heading,0);
            dummy.scale.set(t.w*VS,t.h*VS*(isTall?0.98:0.6),t.len*VS);
            _col.setHex(v.col);
          }
          dummy.updateMatrix();
          bodies.setMatrixAt(idx,dummy.matrix);
          bodies.setColorAt(idx,_col);
          if(isSemi){
            dummy.position.set(px+fx*t.len*VS*0.32,deckY,pz+fz*t.len*VS*0.32);
            dummy.scale.set(t.w*VS,3.15*VS,t.len*VS*0.15);
            _col.setHex(v.col);
          }else if(t.id==='moto'||t.id==='scooter'){
            dummy.position.set(px,deckY+t.h*VS*0.45,pz);
            dummy.scale.set(t.w*VS*0.9,t.h*VS*0.55,t.len*VS*0.4);
            _col.setHex(0x1a1d22);
          }else if(t.id==='bike'){
            dummy.position.set(px,deckY+t.h*VS*0.55,pz);
            dummy.scale.set(0.45,t.h*VS*0.5,0.35);
            _col.setHex(0x1a1d22);
          }else if(isTall){
            dummy.position.set(px+fx*t.len*VS*0.34,deckY+0.4,pz+fz*t.len*VS*0.34);
            dummy.scale.set(t.w*VS*0.94,t.h*VS*0.8,t.len*VS*0.2);
            _col.set(0x151b24);
          }else{
            const front=t.id==='pickup'?0.1:0;
            dummy.position.set(px+fx*t.len*VS*front,deckY+t.h*VS*0.56,pz+fz*t.len*VS*front);
            dummy.scale.set(t.w*VS*0.84,t.h*VS*0.5,t.len*VS*(t.id==='pickup'?0.34:0.52));
            _col.setHex(v.police?0xf2f4f6:v.col);
          }
          dummy.rotation.set(0,heading,0);dummy.updateMatrix();
          cabs.setMatrixAt(idx,dummy.matrix);
          cabs.setColorAt(idx,_col);
          {
            let ex=0,ey=0,ez=0,sx2=0,sy2=0,sz2=0;
            if(v.police){
              const on=Math.floor(simClock*0.014)%2;
              ex=0;ey=t.h*VS*0.62+0.42;sx2=t.w*VS*0.66;sy2=0.34;sz2=1.1;
              _col.setHex(on?0xff2a1e:0x2a6bff);
            }else if(isSemi){
              ex=t.len*VS*0.435;ey=0;sx2=t.w*VS*0.9;sy2=1.85*VS;sz2=t.len*VS*0.13;
              _col.setHex(v.col);
            }else if(t.id==='pickup'){
              ex=-t.len*VS*0.26;ey=t.h*VS*0.34;sx2=t.w*VS*0.78;sy2=0.5;sz2=t.len*VS*0.36;
              _col.set(0x191c21);
            }else if(t.id==='bus'){
              ex=0;ey=t.h*VS*0.55;sx2=t.w*VS*1.02;sy2=t.h*VS*0.26;sz2=t.len*VS*0.8;
              _col.set(0x121820);
            }else if(t.id==='van'){
              ex=0;ey=t.h*VS*0.72;sx2=t.w*VS*0.92;sy2=0.55;sz2=t.len*VS*0.7;
              _col.setHex(v.col);
            }else if(t.id==='taxi'){
              ex=0;ey=t.h*VS*0.72+0.35;sx2=0.7;sy2=0.35;sz2=0.55;
              _col.setHex(0xf5c542);
            }else if(t.id==='moto'||t.id==='scooter'){
              ex=-t.len*VS*0.08;ey=t.h*VS*0.5;sx2=0.62;sy2=1.05;sz2=0.55;
              _col.setHex([0xc23a2c,0x2b5ea8,0xd9a91f,0xe8e8ea,0x1d7a4f][((v.col>>>4)%5+5)%5]);
            }else if(t.id==='bike'){
              ex=-t.len*VS*0.05;ey=t.h*VS*0.55;sx2=0.5;sy2=0.95;sz2=0.4;
              _col.setHex([0x2b5ea8,0xc23a2c,0x1d7a4f,0xe8e8ea][((v.col>>>8)%4+4)%4]);
            }else if(t.id==='box'){
              ex=t.len*VS*0.43;ey=0;sx2=t.w*VS*0.96;sy2=1.7*VS;sz2=t.len*VS*0.15;
              _col.setHex(v.col);
            }else{sx2=0.0001;sy2=0.0001;sz2=0.0001;}
            dummy.position.set(px+fx*ex,deckY+ey,pz+fz*ex);
            dummy.rotation.set(0,heading,0);
            dummy.scale.set(sx2,sy2,sz2);dummy.updateMatrix();
            extras.setMatrixAt(idx,dummy.matrix);
            extras.setColorAt(idx,_col);
          }
          const wy=deckY+t.wr*VS,wsc=t.wr*VS/0.5;
          const rrx=fz,rrz=-fx;
          const halfW=isTwoWheel?0:t.w*VS*0.5-0.12;
          const axFront=(t.axf||0.31)*t.len*VS,axRear=(t.axr||0.31)*t.len*VS;
          const nWheels=isTwoWheel?2:4;
          for(let wq=0;wq<4;wq++){
            if(wq>=nWheels){
              dW.position.set(0,-50,0);dW.scale.set(0.001,0.001,0.001);dW.updateMatrix();
              wheels.setMatrixAt(idx*4+wq,dW.matrix);continue;
            }
            const sx=isTwoWheel?0:((wq&1)?1:-1);
            const sz=isTwoWheel?(wq?1:-1):((wq&2)?1:-1);
            const ax=sz>0?axFront:-axRear;
            dW.position.set(px+fx*ax+rrx*halfW*sx,wy,pz+fz*ax+rrz*halfW*sx);
            dW.rotation.set(0,heading,0);
            dW.scale.set(wsc*(isTwoWheel?0.7:0.9),wsc,wsc);
            dW.updateMatrix();
            wheels.setMatrixAt(idx*4+wq,dW.matrix);
          }
          if(t.id==='bike'){
            dLight.position.set(0,-80,0);dLight.scale.set(0.001,0.001,0.001);dLight.updateMatrix();
            heads2.setMatrixAt(idx,dLight.matrix);tails.setMatrixAt(idx,dLight.matrix);
            pools.setMatrixAt(idx,dLight.matrix);
          }else{
            const hl=t.len*VS*0.5;
            dLight.position.set(px+fx*hl,deckY+(isTwoWheel?0.7:0.85),pz+fz*hl);
            dLight.rotation.set(0,heading,0);
            dLight.scale.set(t.w*VS*(isTwoWheel?0.5:0.7),0.5,0.45);dLight.updateMatrix();
            heads2.setMatrixAt(idx,dLight.matrix);
            dLight.position.set(px-fx*hl,deckY+(isTwoWheel?0.75:0.9),pz-fz*hl);
            dLight.scale.set(t.w*VS*(isTwoWheel?0.5:0.74),0.5,0.4);dLight.updateMatrix();
            tails.setMatrixAt(idx,dLight.matrix);
            tails.setColorAt(idx,v.brake?_brakeRed:_dimRed);
            dLight.position.set(px+fx*(hl+5.5),deckY+0.12,pz+fz*(hl+5.5));
            dLight.rotation.set(0,heading,0);
            dLight.scale.set(t.w*VS*(isTwoWheel?1.4:2.5),1,isTwoWheel?6:10.5);dLight.updateMatrix();
            pools.setMatrixAt(idx,dLight.matrix);
          }
          idx++;
        }
      }
    }
  }
  bodies.count=idx;cabs.count=idx;heads2.count=idx;tails.count=idx;wheels.count=idx*4;pools.count=idx;extras.count=idx;
  speedSum=renderedSpeedSum;totalVeh=renderedVeh;
  extras.instanceMatrix.needsUpdate=true;
  if(extras.instanceColor)extras.instanceColor.needsUpdate=true;
  pools.instanceMatrix.needsUpdate=true;
  poolMat.opacity=clamp(nightF*0.26,0,0.26)*vehFade;
  bodies.instanceMatrix.needsUpdate=true;cabs.instanceMatrix.needsUpdate=true;
  heads2.instanceMatrix.needsUpdate=true;tails.instanceMatrix.needsUpdate=true;
  wheels.instanceMatrix.needsUpdate=true;
  if(bodies.instanceColor)bodies.instanceColor.needsUpdate=true;
  if(cabs.instanceColor)cabs.instanceColor.needsUpdate=true;
  if(tails.instanceColor)tails.instanceColor.needsUpdate=true;
  headMat2.opacity=clamp(nightF*0.9,0,0.9);
  tailMat.opacity=brakeGlow;
}

/* ---------------- environment update ---------------- */
function _sc2Sun(tmp,h){keyCol(SUN_COL,h,tmp);return tmp;}
const _fc=new THREE.Color(),_sc=new THREE.Color();
const _nightHemi=new THREE.Color(0x1c2436),_cityGlow=new THREE.Color(0x1a1410);
const _hemiGroundDay=new THREE.Color(HTS_IS_AUS?0x6a7a50:0x5a6a48),_hemiGroundNight=new THREE.Color(0x05070c);
/* Night ground: ink asphalt / shadowed earth — not dimmed daytime lime */
const _nightLand=new THREE.Color(0x0b0f14),_nightPark=new THREE.Color(0x07100c),_nightPlaza=new THREE.Color(0x121618);
const GRAY_DT=new THREE.Color(0x6a7581),GRAY_DB=new THREE.Color(0xaab3bb),
      GRAY_NT=new THREE.Color(0x02040a),GRAY_NB=new THREE.Color(0x05080e),
      _gt=new THREE.Color(),_gb=new THREE.Color();
let lightningT=0;
function envUpdate(dt,h){
  const x=(h-SUNRISE)/(SUNSET-SUNRISE);
  const el=Math.sin(clamp(x,-0.35,1.35)*Math.PI);
  const nightF=clamp(0.5-el*2.4,0,1);
  keyCol(SKY_TOP,h,skyUni.top.value);
  keyCol(SKY_BOT,h,skyUni.bot.value);
  keyCol(FOG_COL,h,_fc);
  /* Weather pattern drives the whole dome: clear = blue sky + hard sun; overcast = gray + soft light */
  const cl=wxBlend.cloud;
  const rainF=clamp(wxBlend.rain,0,1);
  _gt.copy(GRAY_DT).lerp(GRAY_NT,nightF);
  _gb.copy(GRAY_DB).lerp(GRAY_NB,nightF);
  skyUni.top.value.lerp(_gt,cl*0.95);
  skyUni.bot.value.lerp(_gb,cl*0.92);
  _fc.lerp(_gb,cl*0.78+rainF*0.12);
  skyUni.haze.value.copy(_fc).lerp(skyUni.bot.value,0.4);
  scene.fog.color.copy(_fc);
  const baseFogFar=lerp(2600,16000,wxBlend.fogK)*lerp(1,0.82,rainF);
  if(htsRain)htsRain.updateFog(scene.fog,wxBlend,liveWx,baseFogFar,nightF);
  else{
    /* Night: slightly tighter fog — milky distant haze washes out real darkness */
    const vis=baseFogFar*lerp(1,0.88,nightF);
    const fogLerp=liveMode?0.04:clamp(0.08+timeScale/6000,0.08,0.35);
    scene.fog.far=lerp(scene.fog.far,vis,fogLerp);
    scene.fog.near=scene.fog.far*lerp(0.08,0.1,nightF);
  }
  const A=clamp(x,-0.2,1.2)*Math.PI;
  const sx=Math.cos(A),sy=Math.sin(A);
  const sp=new THREE.Vector3(sx*15000,Math.max(sy,-0.25)*9000+180,4200);
  sunDisc.position.copy(sp);
  /* low sun: bigger, redder; overcast/rain: dimmer, hazier — sun disc nearly gone when socked in */
  const lowSun=clamp(1-sy*1.7,0,1);
  const sscl=740*(1+lowSun*0.8)*(1-cl*0.35);
  sunDisc.scale.set(sscl,sscl,1);
  sunDisc.material.color.copy(_sc2Sun(_sc,h));
  sunDisc.material.opacity=clamp(sy*3,0,1)*(1-cl)*(1-rainF*0.5);
  sunGlare.position.copy(sp);
  sunGlare.material.opacity=sunDisc.material.opacity*0.85;
  keyCol(SUN_COL,h,_sc);sun.color.copy(_sc);
  /* Clear day ≈ full sun; partly cloudy softens; overcast/rain nearly diffuse-only */
  sun.intensity=keyNum(SUN_INT,h)*lerp(1,0.16,cl)*lerp(1,0.7,rainF);
  /* Directional light in world space: skyRoot is centered on cam.target */
  sun.position.set(cam.target.x+sp.x*0.4,sp.y*0.4,cam.target.z+sp.z*0.4);
  skyUni.sunDir.value.copy(sp).normalize();
  skyUni.glowCol.value.copy(_sc);
  skyUni.glowI.value=clamp(keyNum(SUN_INT,h),0,1.2)*lerp(0.85,0.04,cl)*lerp(1,0.5,rainF);
  const mA=A+Math.PI;
  moonDisc.position.set(Math.cos(mA)*15000,Math.max(Math.sin(mA),-0.2)*9000+400,-4200);
  moonDisc.lookAt(camera.position);
  moonDisc.material.opacity=clamp(Math.sin(mA)*2.5,0,0.85)*(1-wxBlend.cloud*0.9);
  hemi.intensity=keyNum(HEMI_INT,h)*lerp(1,0.32,cl)*lerp(1,0.22,nightF)*lerp(1,0.85,rainF);
  nightAmb.intensity=nightF*0.06;          /* faint sky glow only — not a blue fill light */
  cityFill.intensity=nightF*0.12;          /* soft CBD bounce; streetlights carry the rest */
  stars.material.opacity=nightF*(1-wxBlend.cloud)*1.05;
  for(const m of towerMats){
    m.color.setScalar(lerp(1,0.16,nightF)); /* dark facade; windows carry the glow */
    m.emissiveIntensity=nightF*1.05;
    if(m.shininess!=null)m.shininess=lerp(m.userData._shin||(m.shininess||70),8,nightF);
    if(m.specular&&m.specular.isColor)m.specular.setScalar(lerp(0.35,0.03,nightF));
  }
  if(window.HTS_OSM_FACADE_MATS){
    for(const m of HTS_OSM_FACADE_MATS){
      m.color.setScalar(lerp(1,0.16,nightF));
      m.emissiveIntensity=nightF*1.05;
      if(m.shininess!=null)m.shininess=lerp(m.userData._shin||(m.shininess||70),8,nightF);
      if(m.specular&&m.specular.isColor)m.specular.setScalar(lerp(0.35,0.03,nightF));
    }
  }
  for(const m of crownMats)m.opacity=nightF*0.7;
  if(window.sprawlMat){
    sprawlMat.color.setScalar(lerp(1,0.14,nightF));
    sprawlMat.emissiveIntensity=nightF*0.85;
  }
  if(window.towerRoof)towerRoof.color.setScalar(lerp(0.15,0.04,nightF));
  lampHeads.opacity=nightF*1.0;
  if(window.lampPoolMat)lampPoolMat.opacity=nightF*0.85;
  /* runway edge lights, PAPI & rotating beacons */
  if(window.RWEDGE)for(const m of RWEDGE)m.opacity=0.1+nightF*0.7;
  if(window.BEACONS){
    const w=Math.floor(simClock*0.0022)%2===0;
    for(const m of BEACONS){m.color.setHex(w?0xffffff:0x2fd06a);m.opacity=0.12+nightF*0.7;}
  }
  hemi.color.setHex(0xd0e6ff).lerp(_nightHemi,nightF);
  if(hemi.groundColor)hemi.groundColor.copy(_hemiGroundDay).lerp(_hemiGroundNight,nightF);
  /* Greenery / ground follow weather — cloudy days stay green, not blown-out white */
  /* Greenery / ground at night → real dark land, not washed olive */
  {
    const wxMul=lerp(1,0.82,cl)*lerp(1,0.9,rainF);
    if(ground.userData.baseColor){
      ground.material.color.copy(ground.userData.baseColor).lerp(_nightLand,nightF*0.94).multiplyScalar(wxMul);
    }
    for(const m of [matForest,matPark,matLawn,matScrub]){
      if(m.userData.baseColor)m.color.copy(m.userData.baseColor).lerp(_nightPark,nightF*0.92).multiplyScalar(wxMul);
    }
    if(matPlaza.userData.baseColor)matPlaza.color.copy(matPlaza.userData.baseColor).lerp(_nightPlaza,nightF*0.9).multiplyScalar(wxMul);
    /* Asphalt reads darker under streetlight night */
    if(window.roadMats){
      for(const m of roadMats){
        if(!m.userData._dayCol)m.userData._dayCol=m.color.clone();
        m.color.copy(m.userData._dayCol).multiplyScalar(lerp(1,0.42,nightF));
      }
    }
  }
  skyUni.haze.value.lerp(_cityGlow,nightF*0.1*(1-wxBlend.cloud*0.4));
  for(const road of roads)if(road.signMats)road.signMats.emissiveIntensity=nightF*0.55;
  {
    const lowSun2=clamp(1-Math.abs(Math.sin(clamp((h-SUNRISE)/(SUNSET-SUNRISE),-0.3,1.3)*Math.PI))*1.5,0,1);
    const dayN=1-nightF;
    for(const c of clouds.children){
      const base=clamp(0.28+wxBlend.cloud*0.72,0,0.96)*lerp(1,0.35,nightF);
      c.userData.baseOp=base;
      c.material.opacity=base;
      /* white by day -> ember/plum at golden hour -> nearly black silhouettes at night */
      c.material.color.setRGB(
        lerp(lerp(0.14,1,dayN), lerp(1.0,_sc.r*1.05,0.75), lowSun2*dayN),
        lerp(lerp(0.16,1,dayN), lerp(0.86,_sc.g*0.9,0.75),  lowSun2*dayN),
        lerp(lerp(0.22,1,dayN),  lerp(0.9,_sc.b*0.95,0.6),   lowSun2*dayN));
      c.position.x+=c.userData.vx*dt*(liveMode?1:clamp(1+timeScale/70,1,48));
      if(c.position.x>11000)c.position.x=-11000;
      /* Soft vertical bob so the deck never looks frozen during time-lapse */
      if(!liveMode){
        c.position.y+=(Math.sin(simClock*0.0011+c.position.x*0.0002)*c.userData.vx*0.02)*dt*clamp(timeScale/90,1,20);
      }
    }
  }
  if(htsRain)htsRain.update(dt,nightF,wxBlend,rainWindX,rainWindZ,liveWx);
  else bootRainSystem();
  if(wxBlend.storm){
    lightningT-=dt;
    if(lightningT<=0&&rand()<dt*0.25){
      const f=document.getElementById('flash');
      f.style.opacity=0.55;setTimeout(()=>f.style.opacity=0,90+rand()*120);
      lightningT=2+rand()*6;
    }
  }
  return nightF;
}

/* ---------------- HUD ---------------- */
const fmt=n=>n.toLocaleString('en-US');
/* build drive-time chips */
const dtWrap=$('drivetimes');
for(const c of CORRIDORS){
  const el=document.createElement('div');el.className='dtchip';
  el.innerHTML='<div class="r"><span class="dot2"></span><span class="nm"></span></div><div class="tm"></div>';
  if(!c.toDt)el.style.display='none';
  dtWrap.appendChild(el);c.el=el;
}
function fmtMin(t){
  const m=Math.round(t);
  if(m<60)return m+' min';
  return Math.floor(m/60)+' hr '+(m%60?String(m%60)+' min':'');
}
let _chipPick=-1;
function updateDriveTimes(){
  const outbound=keyNum(DIRB_KEYS,simH)<-0.25;
  const pool=DOWNTOWN_CORRIDORS();
  if(simClock>_chipPick){
    _chipPick=simClock+12000;
    const ranked=pool.map(c=>{
      const t=corridorPanelMinutes(c,outbound);
      const r=clamp(t/c.typMin,0.7,4);
      return {c,score:r};
    }).sort((a,b)=>b.score-a.score);
    const show=new Set(ranked.slice(0,4).map(x=>x.c));
    for(const c of CORRIDORS)c.el.style.display=(c.toDt&&show.has(c))?'':'none';
  }
  for(const c of pool){
    if(c.el.style.display==='none')continue;
    const entry=corridorLiveEntry(c,outbound);
    const fromFlow=entry==null?corridorMinutesFromFlow(c,outbound):null;
    const t=corridorPanelMinutes(c,outbound);
    const mi=corridorDriveMiles(c);
    const usual=c.typMin;
    const ratio=clamp(t/usual,0.7,4);
    const chipMph=corridorChipMph(c,t);
    const road=c.roadObj||findRoadByKey(c.road);
    const sign=corridorTravelSign(c,outbound);
    const flow=road&&window.LIVE_TRAFFIC&&window.LIVE_TRAFFIC.flows&&window.LIVE_TRAFFIC.flows.get(road.def.id+'_'+sign);
    const liveMph=liveFlowFresh(flow)?sanitizeLiveMph(flow.cur,flow.ff,road):null;
    const col=liveMph!=null?mphTier(liveMph):(ratio<1.15?'var(--free)':ratio<1.45?'var(--slow)':ratio<1.9?'var(--heavy)':'var(--jam)');
    c.el.querySelector('.dot2').style.background=col;
    const [sub,dtn]=c.label.split(' · ');
    c.el.querySelector('.nm').textContent=outbound?('Downtown → '+dtn):(dtn+' → Downtown');
    const src=entry
      ?(entry.src==='tomtom-route'?'TomTom':'TranStar')
      :(fromFlow!=null?'live mph':'modeled');
    c.el.querySelector('.tm').innerHTML=fmtMin(t)+'<small>'+sub+' · '+mi.toFixed(0)+' mi · usually '+fmtMin(usual)+' · '+src+' · '+chipMph+' mph</small>';
  }
}
function placeNameAt(x,z){
  let best=null,bd=1e18;
  for(const d of DISTRICTS){
    const dd=Math.hypot(x-d.x,z-d.z);
    if(dd<d.r*1.35&&dd<bd){bd=dd;best={n:d.n,kind:'district',r:d.r};}
  }
  for(const w of WATERS){
    const dd=Math.hypot(x-w.x,z-w.z);
    if(dd<(w.r||200)*1.15&&dd<bd){bd=dd;best={n:w.n,kind:w.tag||'water',r:w.r};}
  }
  if(window.AIRPORTS){
    for(const a of AIRPORTS){
      const dd=Math.hypot(x-a.x,z-a.z);
      const ar=a.intl?520:320;
      if(dd<ar&&dd<bd){bd=dd;best={n:a.code+' · '+a.name,kind:'airport',r:ar};}
    }
  }
  return best;
}
function nearestRoadLabel(x,z){
  let br=null,brd=180*180;
  for(let i=0;i<roadSamplePts.length;i+=2){const p=roadSamplePts[i];
    const dx=x-p[0],dz=z-p[1];const dd=dx*dx+dz*dz;
    if(dd<brd){brd=dd;br=p[2];}}
  return br;
}
function updateWhereAmI(){
  /* Prefer GPS suburb label when the camera is near you; else hover / look-at place */
  let name=null,road=null,kind=null;
  const nearYou=userGeo&&userWorld&&Math.hypot(cam.target.x-userWorld.x,cam.target.z-userWorld.z)<520;
  if(nearYou&&(localWx&&localWx.place||_placeCache.name)){
    name=(localWx&&localWx.place)||_placeCache.name;
    road='your location';
    kind='you';
  }else if(hoverPlace&&hoverPlace.n&&(performance.now()-(hoverPlace.at||0)<900)){
    name=hoverPlace.n;road=hoverPlace.road||null;kind=hoverPlace.kind||null;
  }else{
    const x=cam.target.x,z=cam.target.z;
    const p=placeNameAt(x,z);
    name=p?p.n:METRO_NAME;
    kind=p?p.kind:null;
    road=nearestRoadLabel(x,z);
  }
  $('waDist').textContent=name||METRO_NAME;
  let roadTxt='—';
  if(kind==='you'){
    const acc=userGeo&&userGeo.acc!=null?Math.round(userGeo.acc):null;
    roadTxt=acc!=null?('GPS ±'+acc+' m'):'your GPS';
  }
  else if(kind==='airport')roadTxt='airport';
  else if(kind==='bay'||kind==='lake'||kind==='reservoir'||kind==='bayou'||kind==='river'||kind==='water')roadTxt=kind;
  else if(road)roadTxt='near '+road;
  else roadTxt='open country';
  $('waRoad').textContent=roadTxt;
  const mLoc=$('mHudLocLabel');
  if(mLoc)mLoc.textContent=name||CITY_NAME;
}
function updateHUD(nightF,skyH){
  const hh=Math.floor(simH),mm=Math.floor((simH-hh)*60);
  const h12=((hh+11)%12)+1,ap=hh<12?'AM':'PM';
  $('clock').textContent=h12+':'+String(mm).padStart(2,'0')+' '+ap;
  const mTime=$('mHudTime');if(mTime)mTime.textContent=h12+':'+String(mm).padStart(2,'0')+' '+ap;
  const mPhase=$('mHudPhase');if(mPhase)mPhase.textContent=$('phase')?$('phase').textContent:'';
  $('phase').textContent=phaseLabel(simH)+(liveMode?' · LIVE traffic':' · '+simDayLabel()+' time-lapse');
  const now=(!liveMode&&window.simOffsetSec)
    ?new Date(Date.now()+window.simOffsetSec*1000)
    :new Date();
  $('dateLine').textContent=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',timeZone:CHI_TZ})+(weekend?' · weekend pattern':' · weekday pattern');
  /* weather card — follows camera / Fly-to suburb in liveMode; GPS is under “Your location” */
  const P=WX[wxCur];
  const fc=(!liveMode&&wxMode==='auto'&&liveWx)?forecastAt(window.simOffsetSec||0):null;
  const viewWx=liveMode?(activeViewWeather()||liveWx):null;
  const cardWx=liveMode?(activeCardWeather()||viewWx||liveWx):null;
  const wxSrc=fc||cardWx;
  const statsLive=!!(wxSrc&&wxSrc.temp!=null);
  /* When scrubbing forecast, drive sky description from that hour too */
  if(fc&&wxMode==='auto'){wxDesc=fc.label;wxCur=fc.preset;}
  else if(liveMode&&wxMode==='auto'&&cardWx&&cardWx.preset&&!cardWx.pending){
    wxCur=cardWx.preset;wxDesc=cardWx.label||wxDesc;
  }
  const iconKey=nightF>0.6?(WX[wxCur]?WX[wxCur].nIcon:P.nIcon):(WX[wxCur]?WX[wxCur].icon:P.icon);
  if($('wxIcon').dataset.k!==iconKey){$('wxIcon').innerHTML=ICONS[iconKey];$('wxIcon').dataset.k=iconKey;}
  const temp=statsLive?wxSrc.temp:tempFsim(simH,P);
  const feels=statsLive?(wxSrc.feels!=null?wxSrc.feels:wxSrc.temp):temp+(temp>88?4:0);
  const hum=statsLive?wxSrc.hum:humiditySim(simH);
  const windDir=statsLive?(wxSrc.windDir!=null?wxSrc.windDir:0):0;
  $('wxTemp').textContent=(temp!=null?temp:'--')+'°';
  $('wxDesc').textContent=(wxMode==='auto'&&wxSrc)?(wxSrc.label||wxDesc||'—'):wxDesc;
  const mTemp=$('mHudTemp');if(mTemp)mTemp.textContent=(temp!=null?temp:'--')+'°';
  const mDesc=$('mHudDesc');if(mDesc)mDesc.textContent=$('wxDesc').textContent;
  $('wxFeels').textContent=feels!=null?('feels like '+feels+'°'):'feels like —';
  $('wxHum').textContent=hum!=null?(hum+'%'):'—';
  $('wxWind').textContent=statsLive?(wxSrc.wind+' '+windArrow(windDir)):(6+Math.round(6*wxBlend.cloud))+' mph';
  $('wxPrec').textContent=(statsLive?(wxSrc.precip||0):wxBlend.rain*0.22).toFixed(2)+'"';
  const dew=statsLive?(wxSrc.dew!=null?wxSrc.dew:Math.round(temp-(100-hum)/2.8)):Math.round(temp-(100-hum)/2.8);
  $('wxDew').textContent=dew+'°';
  $('wxPress').textContent=(statsLive?(wxSrc.press!=null?wxSrc.press:(liveWx&&liveWx.press)):(29.92+0.06*Math.sin(simH/24*TAU)).toFixed(2))+'"';
  const uvSim=Math.max(0,Math.round(9*Math.sin((simH-6.4)/(20.4-6.4)*Math.PI)*(1-wxBlend.cloud*0.7)));
  const uvVal=statsLive?(wxSrc.uv!=null?wxSrc.uv:uvSim):uvSim;
  const isNight=nightF>0.55||(simH<6.2||simH>20.2);
  $('wxUv').textContent=(statsLive&&isNight&&(!uvVal||uvVal===0))?'Night':uvVal;
  const ageMin=cardWx&&cardWx.at?Math.max(0,Math.round((Date.now()-cardWx.at)/60000))
    :(liveWx?Math.max(0,Math.round((Date.now()-liveWx.at)/60000)):null);
  const wxStale=(cardWx&&cardWx.at?(Date.now()-cardWx.at):liveWx?(Date.now()-liveWx.at):0)>20*60*1000;
  const dot=$('wxDot'),src=$('wxSrcTxt');
  if(dot)dot.className=wxStale?'syncDot stale':'syncDot';
  if(src){
    if(!liveMode&&fc){
      src.textContent='Time-lapse forecast · Open-Meteo · '+houClock(0,false);
    }else if(cardWx&&cardWx.place){
      const via=cardWx.src==='nws'
        ?('NWS '+(cardWx.stationId||'obs'))
        :'Open-Meteo';
      src.textContent='View · '+cardWx.place+' · '+via
        +(ageMin==null?'':(ageMin===0?' · just now':' · '+ageMin+' min ago'));
    }else if(liveWx){
      src.textContent=(wxStale?'Stale · ':'')+CITY_NAME+' live · Open-Meteo · '+(ageMin===0?'just now':ageMin+' min ago');
    }
  }
  const wxPlaceEl=$('wxPlace');
  if(wxPlaceEl&&liveMode&&cardWx&&cardWx.place)wxPlaceEl.textContent=cardWx.place;
  else if(wxPlaceEl&&liveMode&&viewWx&&viewWx.place)wxPlaceEl.textContent=viewWx.place;
  function feedAgeMin(at){
    if(!at)return '—';
    const m=Math.max(0,Math.round((Date.now()-at)/60000));
    return m<=0?'just now':m+'m';
  }
  const sc=$('syncClock');
  if(sc){
    const lt=window.LIVE_TRAFFIC||{};
    const fs=window.LIVE_FLIGHT_STATUS||{};
    sc.textContent='Wx '+feedAgeMin(liveWx&&liveWx.at)
      +' · Traffic '+feedAgeMin(lt.at)
      +' · Flights '+feedAgeMin(fs.at);
    sc.className=wxStale?'syncClk stale':'syncClk';
  }
  if(wxMode!=='auto'){dot.className=statsLive?'pulse':'pulse sim';
    src.textContent=statsLive?('Sky override · stats live · '+(ageMin===0?'just now':ageMin+' min ago')):'Manual override';}
  else if(!liveMode&&fc){dot.className='pulse';
    src.textContent='Time-lapse forecast · Open-Meteo · '+houClock(0,false);}
  else if(!liveMode){dot.className='pulse sim';
    src.textContent='Time-lapse · '+phaseLabel(simH)+' pattern';}
  else if(cardWx&&cardWx.place){
    /* Keep camera / Fly-to suburb line — do not overwrite with downtown */
    dot.className=wxStale?'pulse sim':'pulse';
  }
  else if(viewWx||liveWx){dot.className=wxStale?'pulse sim':'pulse';
    const label=(viewWx&&viewWx.place)||(liveWx&&liveWx.place)||CITY_NAME;
    src.textContent=(wxStale?'Stale · ':'')+label+' · Open-Meteo · '+(ageMin===0?'just now':ageMin+' min ago');}
  else{dot.className='pulse sim';src.textContent='Typical weather pattern · retrying live feed…';}
  /* 3-day outlook — prefer camera/local pack daily, else metro liveWx */
  renderWxForecast((cardWx&&cardWx.daily)?cardWx:(viewWx&&viewWx.daily)?viewWx:(localWx&&localWx.daily?localWx:liveWx));
  /* suburb / locate-me weather — full live stats under Houston */
  const locBox=$('wxLocal');
  if(locBox){
    if(localWx&&userGeo){
      const nearDt=miBetween(userGeo.lat,userGeo.lng,HOU_WX_LAT,HOU_WX_LNG)<2.2;
      locBox.style.display='block';
      const nm=$('wxLocalName');if(nm)nm.textContent=localWx.place||'Near you';
      const lt=$('wxLocalTemp');if(lt)lt.textContent=localWx.temp+'°';
      const ld=$('wxLocalDesc');if(ld)ld.textContent=localWx.label||'—';
      const lm=$('wxLocalMeta');
      const lage=Math.max(0,Math.round((Date.now()-localWx.at)/60000));
      const dist=nearestDistrictByGeo(userGeo.lat,userGeo.lng,8);
      const via=localWx.src==='nws'
        ?('NWS '+(localWx.stationId||'station')
          +(localWx.stationName?(' · '+String(localWx.stationName).split(',')[0]):'')
          +(localWx.stationMi!=null?(' · '+localWx.stationMi+' mi'):'')
          +' · Open-Meteo for outlook')
        :'Open-Meteo at your GPS';
      if(lm)lm.textContent=(nearDt?('Near '+cityPlaceCity()+' downtown · '):(dist?dist.district.n+' · ':''))
        +via
        +(localWx.acc!=null?(' ±'+Math.round(localWx.acc)+'m'):'')
        +' · '+localWx.lat.toFixed(4)+', '+localWx.lng.toFixed(4)
        +' · feels '+localWx.feels+'° · '
        +localWx.hum+'% · wind '+localWx.wind+' '+windArrow(localWx.windDir)
        +' · dew '+localWx.dew+'° · '+localWx.press+'" · UV '+(localWx.uv!=null?localWx.uv:'—')
        +' · '+(lage===0?'just now':lage+' min ago');
    }else if(userGeo){
      locBox.style.display='block';
      const nm=$('wxLocalName');if(nm)nm.textContent='Locating…';
      const lt=$('wxLocalTemp');if(lt)lt.textContent='--°';
      const ld=$('wxLocalDesc');if(ld)ld.textContent='Loading…';
      const lm=$('wxLocalMeta');if(lm)lm.textContent='NWS station + Open-Meteo · your GPS · fetching…';
    }else{
      locBox.style.display='none';
    }
  }
  /* stats — one consistent source: rendered vehicles + visible freeway live probes */
  const panelStats=visibleTrafficStats(totalVeh,speedSum);
  $('stVeh').textContent=fmt(panelStats.veh);
  $('stMph').textContent=panelStats.mph!=null?String(panelStats.mph):'—';
  const mphK=$('stMphK');
  if(mphK)mphK.textContent=panelStats.mphLabel||(panelStats.live?'Avg mph · live':'Avg mph');
  const cEl=$('stCong');
  cEl.textContent=panelStats.congPct!=null?(panelStats.congPct+'%'):'—';
  cEl.className='v '+(panelStats.congPct==null?'':(panelStats.congPct>62?'jam':panelStats.congPct>42?'busy':'ok'));
  const stK=$('stTrafficK');
  if(stK)stK.textContent=panelStats.congSrc?('Congestion · '+panelStats.congSrc):'Congestion';
  $('hotTxt').textContent=panelStats.hot||hotLabel;
  if(!scrubbing)$('timeSlider').value=Math.round(simH*60);
  updateDriveTimes();
  updateWhereAmI();
  const flEl=$('flights');
  const flEmpty=$('flEmpty');
    if(flEl){
    let list=[];
    if(window.LIVE_FLIGHTS_ENABLED&&window.LIVE_FLIGHT_LIST){
      /* Same set as sky meshes — keep panel ↔ 3D in sync */
      syncLiveFlightVisibility();
      list=(window._syncedLiveFlights&&window._syncedLiveFlights.length)
        ? window._syncedLiveFlights.slice(0,12)
        : getSyncedLiveFlights(12);
    }
    let usingBoard=false;
    /* Do NOT hide sky planes for board fallback — board is panel-only when ADS-B is empty */
    if(!list.length && window.HOUSTON_BOARD && window.HOUSTON_BOARD.length){
      list=window.HOUSTON_BOARD
        .filter(f=>f&&f.cs&&f.cs!=='—'&&isHoustonFlight(f)&&isBoardFlightCurrent(f)&&hasFlightNumber(f))
        .map(mergeLiveTelemetry)
        .slice(0,8);
      usingBoard=true;
    }
    if(flEmpty){
      flEmpty.style.display=list.length?'none':'block';
      if(!list.length){
        const st=window.LIVE_FLIGHT_STATUS||{};
        const err=st.err?(' · '+st.err):'';
        flEmpty.textContent=st.ok
          ? ('Matching live ADS-B to '+CITY_NAME+' arrivals/departures…')
          : ('Waiting for live ADS-B feed'+err);
      }
    }
    if(!list.length){
      flEl.innerHTML='';
      window._flightCardSigs=[];
      window._flightStatsSigs=[];
    }else{
      const sigs=list.map(flightCardSig);
      const stats=list.map(flightStatsSig);
      const sameLen=flEl.childElementCount===list.length;
      const sameSigs=sameLen&&window._flightCardSigs&&window._flightCardSigs.length===sigs.length&&sigs.every((s,i)=>s===window._flightCardSigs[i]);
      if(!sameLen){
        flEl.innerHTML='';
        for(const f of list){
          const r=document.createElement('div');
          r.className='fcard';
          r.dataset.fkey=flightIdKey(f);
          flEl.appendChild(r);
          f.cardEl=r;
          r.innerHTML=renderFlightCard(f);
        }
        window._flightCardSigs=sigs;
        window._flightStatsSigs=stats;
      }else if(!sameSigs){
        /* Route/identity changed — rebuild only those cards (preserves other links) */
        for(let i=0;i<list.length;i++){
          const f=list[i];
          f.cardEl=flEl.children[i];
          if(f.cardEl)f.cardEl.dataset.fkey=flightIdKey(f);
          if(f.cardEl&&(!window._flightCardSigs||window._flightCardSigs[i]!==sigs[i])){
            f.cardEl.innerHTML=renderFlightCard(f);
          }
        }
        window._flightCardSigs=sigs;
        window._flightStatsSigs=stats;
      }else{
        /* Same routes — patch live stats without touching <a href> */
        for(let i=0;i<list.length;i++){
          const f=list[i];
          f.cardEl=flEl.children[i];
          if(f.cardEl)f.cardEl.dataset.fkey=flightIdKey(f);
          if(f.cardEl&&(!window._flightStatsSigs||window._flightStatsSigs[i]!==stats[i])){
            patchFlightCardStats(f.cardEl,f);
          }
        }
        window._flightStatsSigs=stats;
      }
      applyFlightCardSelection({silent:true});
    }
    const flSrc=$('flSrc');
    if(flSrc){
      if(list.length){
        const fa=list.some(x=>x._faOk);
        const src=(window.LIVE_FLIGHT_STATUS&&LIVE_FLIGHT_STATUS.src)?LIVE_FLIGHT_STATUS.src:'ADS-B';
        if(usingBoard){
          flSrc.style.color='#ffb400';
          flSrc.textContent='· '+list.length+' '+CITY_NAME+' board · Track on FlightAware';
        }else{
          const houN=list.filter(x=>x._houston===true).length;
          flSrc.style.color='#7fd6a0';
          flSrc.textContent='· '+list.length+' in sky + panel'+(houN?' · '+houN+' '+CITY_NAME+'-verified':'')+' · '+src+(fa?' + FA':'');
        }
      }else{
        flSrc.style.color='#8a939c';
        flSrc.textContent='· '+CITY_NAME+' arrivals & departures only';
      }
    }
  }
  const tlt=$('trafficLiveTag');
  const tsl=$('trafficSrcLine');
  if(tlt){
    const lt=window.LIVE_TRAFFIC;
    const primary=trafficPrimary();
    tlt.classList.remove('off','warn');
    if(!liveMode){
      tlt.textContent='Predicted · time-lapse';
      if(tsl)tsl.textContent='Feed · modeled rush + forecast weather · '+phaseLabel(simH);
    }else if(lt&&lt.ok&&lt.flows&&lt.flows.size>0){
      const src=lt.src||(lt.transtar?'TranStar':(lt.tomtom?'TomTom':'live'));
      tlt.textContent='Live · '+src;
      if(tsl)tsl.textContent='Feed · '+src+' · '+lt.flows.size+' directions'
        +(lt.corridorTimes&&lt.corridorTimes.size?(' · '+lt.corridorTimes.size+' corridor ETAs'):'');
    }else if(lt&&lt.incidents&&lt.incidents.length){
      tlt.classList.add('warn');
      tlt.textContent='Incidents only';
      if(tsl)tsl.textContent='Feed · incidents live · mapping flow…';
    }else if(lt&&lt.authOk===false&&!lt.transtar){
      /* Austin (TomTom-primary) has no TranStar — don’t sit on Connecting forever */
      tlt.classList.add('warn');
      tlt.textContent='Modeled';
      if(tsl)tsl.textContent=primary==='tomtom'
        ? 'Feed · modeled · need TomTom Traffic API key'
        : 'Feed · modeled · TranStar / TomTom unavailable';
    }else if(lt&&lt.err){
      tlt.classList.add('warn');
      tlt.textContent='Modeled';
      if(tsl)tsl.textContent='Feed · modeled · '+String(lt.err).slice(0,48);
    }else{
      tlt.classList.add('off');
      tlt.textContent='Connecting…';
      if(tsl)tsl.textContent=primary==='tomtom'
        ? 'Feed · waiting on TomTom…'
        : 'Feed · waiting on TranStar…';
    }
  }
  if(typeof window.renderAirportBoard==='function')window.renderAirportBoard();
}

/* ---------------- controls ---------------- */
document.querySelectorAll('#hazBtns .btn').forEach(b=>b.addEventListener('click',()=>{
  const mode=b.getAttribute('data-haz');
  if(window.HAZARD&&HAZARD.active&&HAZARD.mode===mode){hazDeactivate();return;}
  hazActivate(mode);
}));
document.querySelectorAll('#hazYieldBtns .btn').forEach(b=>b.addEventListener('click',()=>{
  const kt=Number(b.getAttribute('data-yield'))||10;
  window.HAZARD.yieldKt=kt;
  document.querySelectorAll('#hazYieldBtns .btn').forEach(x=>x.classList.toggle('on',x===b));
  if(window.HAZARD.active&&HAZARD.mode==='nuclear'){
    const o=HAZARD.nukeOrigin;
    if(o)hazNuclearAt(o.x,o.z,kt);
    else hazActivate('nuclear');
  }
}));
const hazNukeTarget=$('hazNukeTarget');
if(hazNukeTarget)hazNukeTarget.addEventListener('change',()=>{
  const v=hazNukeTarget.value;
  if(v==='__map__'){
    window.HAZARD.nukePlaceMode=true;
    const btn=$('hazNukeMapBtn');if(btn)btn.classList.add('on');
    const st=$('hazStatus');if(st)st.textContent='Click anywhere on the map to place ground zero…';
    return;
  }
  if(!v)return;
  const t=NUK_TARGETS.find(x=>x.id===v);
  if(t)hazNuclearAt(t.x,t.z,window.HAZARD.yieldKt||10);
});
const hazNukeMapBtn=$('hazNukeMapBtn');
if(hazNukeMapBtn)hazNukeMapBtn.addEventListener('click',()=>{
  if(!window.HAZARD.active||HAZARD.mode!=='nuclear'){hazActivate('nuclear');}
  window.HAZARD.nukePlaceMode=!window.HAZARD.nukePlaceMode;
  hazNukeMapBtn.classList.toggle('on',HAZARD.nukePlaceMode);
  const st=$('hazStatus');
  if(st&&HAZARD.nukePlaceMode)st.textContent='Click anywhere on the '+CITY_NAME+' map to place ground zero — rings show blast, thermal & fallout ranges.';
  else if(st&&HAZARD.nukeOrigin)st.textContent='Map placement off. Pick a target or re-enable click-to-place.';
});
const hazClearBtn=$('hazClear');
if(hazClearBtn)hazClearBtn.addEventListener('click',()=>hazDeactivate());

$('locSelect').addEventListener('change',e=>{
  stopFollow();
  closePoiCard();
  const id=e.target.value;
  const p=CAM_VIEWS[id];if(!p)return;
  camGoal.theta=p.theta;camGoal.phi=p.phi;camGoal.radius=p.radius;
  camGoal.target.set(p.target[0],0,p.target[1]);
  try{
    const url=new URL(location.href);
    url.searchParams.set('city',HTS_CITY_ID);
    url.searchParams.set('view',id);
    history.replaceState(null,'',url);
  }catch(err){}
  /* Pin weather card to this suburb immediately while the camera flies */
  try{
    const zones=window.WX_ZONES||[];
    let z=zones.find(zz=>zz&&zz.id===id);
    if(!z&&zones.length){
      let best=null,bd=1e18;
      for(const zz of zones){
        const d=Math.hypot(zz.x-p.target[0],zz.z-p.target[1]);
        if(d<bd){bd=d;best=zz;}
      }
      z=best;
    }
    if(z)window._wxFocus={...z,pinAt:Date.now()};
  }catch(err){}
});
(function applySharedView(){
  try{
    const id=new URLSearchParams(location.search).get('view');
    const sel=$('locSelect');
    if(!id||!sel||!CAM_VIEWS[id])return;
    sel.value=id;
    sel.dispatchEvent(new Event('change'));
  }catch(e){}
})();

/* ---- Airport departure / arrival board UI ---- */
window.renderAirportBoard=function(force){
  const el=$('aptBoard'), empty=$('boardEmpty'), src=$('boardSrc');
  if(!el)return;
  const ui=window.BOARD_UI||{apt:'IAH',kind:'departures'};
  const pack=(window.HOUSTON_BOARDS&&window.HOUSTON_BOARDS[ui.apt])||null;
  const stamp=(pack&&pack.at)||0;
  const key=ui.apt+'|'+ui.kind+'|'+stamp+'|'+(pack&&pack.departures?pack.departures.length:0)+'|'+(pack&&pack.arrivals?pack.arrivals.length:0);
  if(!force&&window._boardRenderKey===key)return;
  window._boardRenderKey=key;
  const rows=(pack&&pack[ui.kind])||[];
  const aptInfoN=aptInfo(ui.apt);
  if(src){
    const st=window.HOUSTON_BOARD_STATUS||{};
    const age=pack&&pack.at?Math.max(0,Math.round((Date.now()-pack.at)/60000)):null;
    const ageTxt=age==null?'':(age===0?' · just now':(' · '+age+'m ago'));
    if(rows.length){
      src.style.color=(pack&&pack.cached)||st.cached?'#ffe08a':'#7fd6a0';
      src.textContent='· '+(st.cached||(pack&&pack.cached)?'cached':'live')+' · '+ui.apt+' '+ui.kind+' · '+rows.length+ageTxt;
    }
    else if(st.ok){src.style.color='#ffb400';src.textContent='· '+ui.apt+' '+ui.kind+' empty';}
    else{src.style.color='#ffb400';src.textContent='· '+(st.err||'loading…');}
  }
  if(empty){
    empty.style.display=rows.length?'none':'block';
    if(!rows.length){
      const err=(pack&&pack.err)||(window.HOUSTON_BOARD_STATUS&&HOUSTON_BOARD_STATUS.err)||'';
      if(/flightaware_disabled|FlightAware disabled/i.test(err)){
        empty.textContent='Airport boards are off (FlightAware disabled). Live planes still use free OpenSky / ADS-B.';
      }else if(/FLIGHTAWARE_API_KEY_missing|missing/i.test(err)){
        empty.textContent='Airport boards are off — FlightAware AeroAPI is disabled to avoid billing.';
      }else if(/429|Rate limited|Too many/i.test(err)){
        empty.textContent='Airport boards are off (FlightAware disabled).';
      }else if(/404/.test(err)){
        empty.textContent='Airport boards are off (FlightAware disabled).';
      }else{
        empty.textContent=err||('Airport boards paused — free ADS-B sky only.');
      }
    }
  }
  el.innerHTML='';
  const show=rows.filter(f=>isBoardFlightCurrent(f)).slice(0,14);
  for(const f of show){
    const route=resolveFlightAirports(f);
    const other=ui.kind==='departures'?route.arr:route.dep;
    const otherInfo=other==='…'?{n:'Updating…',c:''}:aptInfo(other);
    const when=ui.kind==='departures'
      ?(parseMaybeTime(f.atd)||parseMaybeTime(f.etd))
      :(parseMaybeTime(f.eta)||parseMaybeTime(f.ata));
    const timeTxt=when?fmtFlightTime(when):'—';
    const rel=when?(when>Date.now()?('in '+fmtDur(when-Date.now())):(fmtDur(Date.now()-when)+' ago')):'';
    const href=flightVerifyUrl(f);
    const csShow=(f.csIata||f.cs||'—');
    const row=document.createElement('div');
    row.className='brow';
    row.innerHTML='<div class="bcs"><a href="'+href+'" target="_blank" rel="noopener">'+csShow+'</a></div>'
      +'<div><div class="brt">'+(ui.kind==='departures'?('→ '+other):('← '+other))+' · '+(otherInfo.c||otherInfo.n||'')+'</div>'
      +'<div class="bmeta">'+(f.status||'')+(f.actype&&f.actype!=='—'?' · '+f.actype:'')+(f.reg?' · '+f.reg:'')+(f.gate?' · gate '+f.gate:'')
      +'<br>'+aptInfoN.n+'</div></div>'
      +'<div class="btime">'+timeTxt+(rel?'<small>'+rel+'</small>':'')+'</div>';
    el.appendChild(row);
  }
};
document.querySelectorAll('#boardAptBtns .btn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('#boardAptBtns .btn').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');
  window.BOARD_UI.apt=b.getAttribute('data-apt');
  const view=CAM_VIEWS[String(window.BOARD_UI.apt).toLowerCase()];
  if(view){camGoal.theta=view.theta;camGoal.phi=view.phi;camGoal.radius=view.radius;camGoal.target.set(view.target[0],0,view.target[1]);}
  window.renderAirportBoard(true);
  /* Fetch only this airport if cache is stale (not all 7) */
  if(typeof window.refreshAirportBoard==='function')window.refreshAirportBoard(false);
}));
document.querySelectorAll('#boardKindBtns .btn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('#boardKindBtns .btn').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');
  window.BOARD_UI.kind=b.getAttribute('data-kind');
  window.renderAirportBoard(true);
  /* Kind switch is local — no extra FA call */
}));

function shuffleTraffic(){
  for(const road of roads)for(const dir of road.dirs){
    for(const lane of dir.lanes)lane.length=0;
    const share=road.def.share/shareSum;
    seedRoad(road,dir,Math.round(TOTAL_TARGET*share*0.5*clamp(demand(simH,weekend)*1.35,0.06,1.1)));
  }
  /* Re-insert roaming police after lanes were wiped */
  for(const v of PATROLS){v._dead=true;v._lane=null;}
  ensurePatrolsAlive();
  trafficTick(0.5);
}
const TOD={dawn:6.33,day:12.5,dusk:20.33,night:23.25};
function enterTimePreview(fromLive){
  liveMode=false;
  if(fromLive){
    simH=houstonNow(true);
    window.simDayOffset=0;
  }
  const sel=$('todSelect');
  if(sel)sel.value='preview';
  recomputeSimOffset();
  syncSimCalendar();
  syncDayButtons();
  const sl=$('timeSlider');
  if(sl&&!scrubbing)sl.value=Math.round(simH*60);
  const hint=$('timeHint');
  if(hint){
    const spd=timeScale>=1800?'30 min/s':(timeScale>=300?'5 min/s':(timeScale>=60?'1 min/s':(Math.round(timeScale)+'×')));
    hint.textContent='Time-lapse '+spd+' on '+simDayLabel()+' — sky, traffic & forecast weather follow the simulated clock. Cross midnight to keep going.';
  }
}
$('todSelect').addEventListener('change',e=>{
  const v=e.target.value;
  if(v==='live'){
    liveMode=true;simH=houstonNow(true);window.simDayOffset=0;window.simOffsetSec=0;syncSimCalendar();syncDayButtons();
    document.querySelectorAll('#speedBtns .btn').forEach(x=>x.classList.remove('on'));
    timeScale=60;
    const hint=$('timeHint');
    if(hint)hint.textContent='Traffic & sky follow live local time. Pick Tomorrow or a speed to scrub the forecast day/night.';
  }else if(v==='preview'){
    liveMode=false;recomputeSimOffset();syncSimCalendar();syncDayButtons();
    const hint=$('timeHint');
    if(hint)hint.textContent='Time-lapse preview — use Today / Tomorrow and 1 / 5 / 30 min/s. Weather tracks Open-Meteo forecast hours.';
  }else{
    liveMode=false;simH=TOD[v];recomputeSimOffset();syncSimCalendar();syncDayButtons();
    const sl=$('timeSlider');if(sl)sl.value=Math.round(simH*60);
    const hint=$('timeHint');
    if(hint)hint.textContent='Jumped to '+e.target.options[e.target.selectedIndex].textContent.replace(/^[^·]+·\s*/,'')+' on '+simDayLabel()+'. Hit 5 or 30 min/s to run the time-lapse.';
  }
  shuffleTraffic();
});
document.querySelectorAll('#dayBtns .btn').forEach(b=>b.addEventListener('click',()=>{
  if(liveMode)enterTimePreview(true);
  setSimDayOffset(b.dataset.day);
  const sel=$('todSelect');if(sel&&sel.value==='live')sel.value='preview';
  syncSimCalendar();
  shuffleTraffic();
  const hint=$('timeHint');
  if(hint)hint.textContent='Previewing '+simDayLabel()+' — drag the slider or run 1 / 5 / 30 min/s. Weather uses the Open-Meteo forecast for that day.';
}));
document.querySelectorAll('#speedBtns .btn').forEach(b=>b.addEventListener('click',()=>{
  enterTimePreview($('todSelect').value==='live'||$('todSelect').value==='preview');
  document.querySelectorAll('#speedBtns .btn').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');timeScale=+b.dataset.speed;
  const sl=$('timeSlider');if(sl)sl.value=Math.round(simH*60);
  const hint=$('timeHint');
  if(hint)hint.textContent='Time-lapse '+b.textContent+' on '+simDayLabel()+' — watch dawn → day → dusk → night, then into the next day.';
}));
const slider=$('timeSlider');
slider.addEventListener('input',()=>{scrubbing=true;
  if(liveMode)enterTimePreview(true);
  const sel=$('todSelect');if(sel)sel.value='preview';
  simH=+slider.value/60;recomputeSimOffset();syncDayButtons();});
slider.addEventListener('change',()=>{scrubbing=false;shuffleTraffic();});
$('wxSelect').addEventListener('change',e=>{wxMode=e.target.value;});
document.querySelectorAll('#volBtns .btn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('#volBtns .btn').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');volumeMode=b.dataset.vol;}));

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  if(window.HTS_CINEMATIC&&HTS_CINEMATIC.resize)HTS_CINEMATIC.resize(innerWidth,innerHeight);
});

/* ---------------- boot & main loop ---------------- */
for(const road of roads)for(const dir of road.dirs){
  const share=road.def.share/shareSum;
  seedRoad(road,dir,Math.round(TOTAL_TARGET*share*0.5*clamp(demand(simH,weekend)*1.35,0.06,1.1)));
}
/* long-running construction projects */
/* live patrol tracker badges */
const patrolBadges=(function(){
  const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  x.beginPath();x.arc(32,34,22,0,Math.PI*2);x.fillStyle='rgba(10,13,18,.94)';x.fill();
  x.lineWidth=4;x.strokeStyle='#4a7dff';x.stroke();
  x.fillStyle='#ff3a2e';x.fillRect(19,26,12,9);
  x.fillStyle='#3d7dff';x.fillRect(33,26,12,9);
  x.fillStyle='#fff';x.fillRect(19,37,26,4);
  const tex=new THREE.CanvasTexture(c);
  const arr=[];
  for(let i=0;i<8;i++){
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:0.95}));
    sp.scale.set(22,22,1);sp.visible=false;scene.add(sp);arr.push(sp);
  }
  return arr;
})();
document.getElementById('legend').insertAdjacentHTML('beforeend',
  '<div class="dataline"><b>LIVE</b> clock · Open-Meteo weather · NWS alerts · NHC hurricane + SPC tornado tracker · TranStar (free) · ADS-B / OpenSky flights (free) · your GPS weather<br>'
  +'<i>MODELED</i> vehicle physics driven by live congestion · patrol motion · hazard drills &nbsp;·&nbsp; <b style="color:#9fb2c2">78 districts</b> · 10-county MSA · Created by <b style="color:#9fb2c2">Ejay Gabriel</b></div>');
seedPatrols();
spawnWorkZone('i45',0,0.30,420,'the North Side');
spawnWorkZone('us59',1,0.24,380,'Sugar Land');
trafficTick(0.5);

/* ---------------- live flight state machines ---------------- */
window.LIMITS={pan:5600,rmax:9200,rmin:55};
window.simOffsetSec=0;
function houClock(offsetSec,withDate){
  const d=new Date(Date.now()+(simOffsetSec+offsetSec)*1000);
  const t=d.toLocaleTimeString('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'});
  if(!withDate)return t;
  const dd=d.toLocaleDateString('en-US',{timeZone:'America/Chicago',weekday:'short',month:'short',day:'numeric'});
  return t+' · '+dd;
}
function ftLabel(alt){return (Math.round(alt*9/100)*100).toLocaleString('en-US')+' ft';}
function rwyOf(a){
  if(!a._rwy){const brg=((Math.atan2(a.dx,-a.dz)*180/Math.PI)+360)%360;
    a._rwy='RWY '+(Math.round(brg/10)||36);}
  return a._rwy;
}
function resetArrival(f){
  f.phase='approach';f.s=-(f.apt.runLen/2+2500);f.alt=330;f.v=46;f.lat=0;
  f.cs=newCallsign();f.city=CITIES[Math.floor(rand()*CITIES.length)];f.arriving=true;
  const etaSec=(2500+f.apt.runLen*0.16)/46;
  f.sched='ETA '+houClock(etaSec,true);
  f.gate='Gate '+'ABCDE'[Math.floor(rand()*5)]+(1+Math.floor(rand()*24));
  f.reg='N'+(100+Math.floor(rand()*900))+String.fromCharCode(65+Math.floor(rand()*26))+String.fromCharCode(65+Math.floor(rand()*26));
}
function updateFlights(dt){
  /* live aircraft from OpenSky (best-effort) */
  updateLiveFlights(dt);

  const beaconOn=Math.floor(simClock*0.002)%2===1;
  const tt=(simClock*0.001)%1.3;
  const dbl=(tt<0.06)||(tt>0.14&&tt<0.2);
  function flashLights(f){
    if(!f||!f.m||!f.m.userData)return;
    const ud=f.m.userData;
    /* Soft anti-collision — no blinding additive flash */
    if(ud.strobe&&ud.strobe.opacity!==undefined)ud.strobe.opacity=dbl?0.35:0;
    if(ud.beacon&&ud.beacon.opacity!==undefined)ud.beacon.opacity=beaconOn?0.4:0.05;
  }
  /* Live ADS-B planes: dim lights; halo only while following */
  if(window.LIVE_FLIGHT_LIST){
    for(const f of LIVE_FLIGHT_LIST){
      if(!f.m||!f.m.visible)continue;
      flashLights(f);
      if(f.m.userData&&f.m.userData.halo){
        const on=followPlane===f;
        f.m.userData.halo.visible=on;
        f.m.userData.halo.material.opacity=on?0.4:0;
      }
    }
  }
  for(const f of FLIGHTS){
    flashLights(f);
    if(f.kind==='cruise'){
      const dx=Math.cos(f.ang),dz=Math.sin(f.ang);
      f.x+=dx*f.spd*dt;f.z+=dz*f.spd*dt;
      if(Math.abs(f.x)>8600||Math.abs(f.z)>8600){
        f.ang=rand()*TAU;f.x=-Math.cos(f.ang)*8200;f.z=-Math.sin(f.ang)*8200;
        f.cs=newCallsign();
        const c1=CITIES[Math.floor(rand()*CITIES.length)],c2=CITIES[Math.floor(rand()*CITIES.length)];
        f.city=c1+'→'+c2;
        f.sched='Dep '+houClock(-(1800+rand()*4200),false)+' · ETA '+c2+' '+houClock(2400+rand()*5400,false);
      }
      f.m.position.set(f.x,f.alt,f.z);
      f.m.rotation.set(0,Math.atan2(dx,dz),0);
      continue;
    }
    if(f.kind==='pattern'){
      f.a=(f.a||0)+0.085*dt;
      const r=520;
      const x=f.apt.x+Math.cos(f.a)*r,z=f.apt.z+Math.sin(f.a)*r;
      f.m.position.set(x,95+14*Math.sin(f.a*2),z);
      const dx=-Math.sin(f.a),dz=Math.cos(f.a);
      f.m.rotation.set(0,Math.atan2(dx,dz),0);
      f.m.rotation.z=-0.2;
      continue;
    }
    /* runway cycle */
    const a=f.apt,L=a.runLen;
    if(f.s===undefined){
      if(f.phase==='hold'){f.s=-(a.runLen*0.1);f.lat=-52;f.alt=3.2;f.t=0;f.dur=6+rand()*8;}
      else resetArrival(f);
    }
    const tdS=-(L*0.34);
    switch(f.phase){
      case 'approach':{
        if(f.m.userData.gear)f.m.userData.gear.visible=f.alt<110;
        f.s+=f.v*dt;
        const p=(f.s-(-(L/2+2500)))/(tdS-(-(L/2+2500)));
        f.alt=lerp(330,3.2,clamp(p,0,1));
        f.pitch=f.alt<26?0.085:0.05; /* flare */
        f.status='Final '+rwyOf(a)+' · '+ftLabel(f.alt);f.kts=142;
        if(f.s>=tdS){f.phase='rollout';f.status='Landing';f.kts=135;f.sched='Arrived '+houClock(0,true);}
        break;}
      case 'rollout':{
        f.v=Math.max(6,f.v-15*dt);f.s+=f.v*dt;f.alt=3.2;f.pitch=0;
        f.status='Landed · rolling out';f.kts=Math.round(f.v*2.2);
        if(f.v<=6.5){f.phase='taxi';f.t=0;}
        break;}
      case 'taxi':{
        f.t+=dt;f.s+=5*dt;f.lat=lerp(0,-52,clamp(f.t/5.5,0,1));f.alt=3.2;
        f.status='Taxiing to '+(f.gate||'the gate');f.kts=14;
        if(f.t>6){f.phase='hold';f.t=0;f.dur=8+rand()*10;
          f.sched='Dep '+houClock(f.dur+11,true);}
        break;}
      case 'hold':{
        if(f.m.userData.gear)f.m.userData.gear.visible=true;
        f.t+=dt;f.alt=3.2;
        f.status='At '+(f.gate||'the gate')+' · '+a.code;f.kts=0;
        if(f.t>f.dur){
          f.phase='lineup';f.t=0;
          f.cs=newCallsign();f.city=CITIES[Math.floor(rand()*CITIES.length)];f.arriving=false;
        }
        break;}
      case 'lineup':{
        f.t+=dt;f.s=lerp(f.s,-(L*0.42),clamp(dt*0.8,0,1));
        f.lat=lerp(-52,0,clamp(f.t/4.5,0,1));f.alt=3.2;
        f.status='Taxiing for departure';f.kts=12;
        if(f.t>4.8){f.phase='takeoff';f.v=4;f.sched='Departing '+houClock(6,false);}
        break;}
      case 'takeoff':{
        if(f.m.userData.gear)f.m.userData.gear.visible=f.alt<110;
        f.v=Math.min(64,f.v+15*dt);f.s+=f.v*dt;
        if(f.v>48){f.pitch=Math.min(0.14,(f.pitch||0)+dt*0.1);}
        if(f.s>L*0.18){if(f.alt<=3.3)f.sched='Departed '+houClock(0,true);f.alt+=f.v*0.3*dt;}else f.alt=3.2;
        f.status=f.alt>6?('Climbing · '+ftLabel(f.alt)):('Rolling '+rwyOf(a));f.kts=Math.round(f.v*2.6)+40;
        if(f.s>L/2+2400)resetArrival(f);
        break;}
    }
    const px=a.x+a.dx*f.s+(-a.dz)*(f.lat||0);
    const pz=a.z+a.dz*f.s+(a.dx)*(f.lat||0);
    f.m.position.set(px,f.alt,pz);
    f.m.rotation.set(-(f.pitch||0),Math.atan2(a.dx,a.dz),0);
  }
}

/* alerts flow inside the left column now — no JS positioning needed */

let last=performance.now(),hudT=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min((now-last)/1000,0.08);last=now;
  const inOSM=!!window.osmMode;
  simClock=now;
  const skyH=houstonNow();
  /* Live = real clock; preview = simulated clock drives sky, lights, weather, slider */
  if(liveMode){
    simH=skyH;
    window.simDayOffset=0;
    window.simOffsetSec=0;
    weekend=_houClock.weekend;
  }else{
    if(!scrubbing){
      simH=simH+dt*timeScale/3600;
      while(simH>=24){
        simH-=24;
        window.simDayOffset=Math.min(2,(window.simDayOffset||0)+1);
      }
      while(simH<0){
        simH+=24;
        window.simDayOffset=Math.max(0,(window.simDayOffset||0)-1);
      }
    }
    recomputeSimOffset();
    const sl=$('timeSlider');
    if(sl&&!scrubbing)sl.value=Math.round(simH*60);
    if(!scrubbing)syncDayButtons();
  }
  /* Keep weekday/weekend pattern locked to the same instant as HUD date */
  _calSyncT-=dt;
  if(_calSyncT<=0){syncSimCalendar();_calSyncT=liveMode?2.5:0.75;}
  wxUpdate(dt);
  congTimer-=dt*(liveMode?1:clamp(timeScale/90,1,12));
  if(congTimer<=0){trafficTick(dt);congTimer=0.5;}
  /* Reseed density when the simulated rush hour shifts so traffic never sits at one pattern */
  if(!liveMode){
    const rushBucket=Math.floor(simH*2); /* every 30 sim-minutes */
    if(window._lapseRush!==rushBucket){
      window._lapseRush=rushBucket;
      for(const road of roads)for(const dir of road.dirs){
        /* nudge targets only — moveVehicles keeps cars flowing without a hard wipe */
        if(dir.target>0)dir.target=Math.max(2,Math.round(dir.target*(0.92+0.16*demand(simH,weekend))));
      }
    }
  }
  /* Day/night + sun/moon follow simH (same as early builds) so 5/30 min/s is a real time-lapse */
  const nightF=envUpdate(dt,simH);
  {
    const tTarget=inOSM?0:clamp((cam.radius-4200)/3200,0,1);
    mapT+=(tTarget-mapT)*0.07;
    _fpsN++;_fpsDt+=dt;
    if(_fpsN>=36){_fpsAvg=36/_fpsDt;_fpsN=0;_fpsDt=0;}
    const perfBinary=_fpsAvg<42&&totalVeh>2200;
    if(mapT<=0.3||perfBinary){
      vehFade=mapT>0.78?0:1;
    }else{
      vehFade=!inOSM?clamp(1-(mapT-0.4)/0.34,0,1):0;
    }
  }
  moveVehicles(dt,nightF);
  updateIncidents(dt);
  updateFloods(dt);
  updateHazard(dt);
  updatePolice(dt);
  for(const w of workZones)w.abMat.emissiveIntensity=(Math.floor(simClock*0.003)%2)?1.1:0.15;
  /* runway approach-light rabbit: strobes race toward the threshold */
  {
    const step=Math.floor(simClock*0.007)%10;
    for(const seq of APPLIGHTS)
      for(let i2=0;i2<seq.length;i2++)
        seq[i2].opacity=(seq.length-1-i2)===step?0.95:(nightF>0.4?0.12:0.04);
  }
  updateFlights(dt);
  /* POI badges: close-in only, soft so they don't wallpaper the map */
  {const o=(inOSM?0:1)*0.45*clamp((1600-cam.radius)/700,0,1)*(1-mapT);
   for(const sp of poiSprites)sp.material.opacity=o;}
  if(userHalo.visible){
    const pk=HTS_IS_HOU?(62+10*Math.sin(simClock*0.003)):(44+14*Math.sin(simClock*0.003));
    userHalo.scale.set(pk,pk,1);
    if(userHome&&userHome.visible&&userHome.userData.pin){
      userHome.userData.pin.position.y=30+2.4*Math.sin(simClock*0.004);
      userHome.userData.pin.material.opacity=0.9+0.1*Math.sin(simClock*0.005);
    }
  }
  updateCrowds(dt,cam.radius,simH);
  updateRail(dt);
  for(let i=0;i<patrolBadges.length;i++){
    const v=PATROLS[i];
    const ok=v&&!v._dead&&v._px!==undefined&&!inOSM;
    patrolBadges[i].visible=ok;
    if(ok)patrolBadges[i].position.set(v._px,(v._py||1)+22,v._pz);
  }
  {
    /* Hotspot rings: only when traffic is actually heavy — not a rush-hour decoration */
    if(performance.now()-_hotCongAt>400)flushHotCongCache();
    const pulse=0.9+0.1*Math.sin(simClock*0.004);
    let worst=null,worstC=-1;
    for(const hr of HOTRINGS){
      const info=hotspotLiveCong(hr.hs);
      const cong=(typeof info==='object'&&info)?info.cong:0;
      hr.cong=lerp(hr.cong||0,cong,0.22);
      const show=hr.cong>=0.52; /* heavy+ only */
      const tier=hr.cong>=0.72?'jam':'heavy';
      if(show&&tier!==hr.tier){
        hr.tier=tier;
        hr.mat.map=hr.TEX[tier];
        hr.mat.needsUpdate=true;
      }
      const op=show
        ? clamp((hr.cong-0.52)/0.4,0.14,0.46)*pulse*clamp(1-mapT*0.85,0.2,1)*(inOSM?0:1)
        : 0;
      hr.mat.opacity=op;
      hr.mesh.visible=op>0.08&&!inOSM;
      hr.mesh.renderOrder=2;
      if(hr.lbl){
        hr.lbl.material.opacity=show?clamp(op*0.75,0,0.4):0;
        hr.lbl.visible=hr.lbl.material.opacity>0.08&&!inOSM&&mapT<0.8;
        hr.lbl.renderOrder=3;
      }
      if(hr.cong>worstC){worstC=hr.cong;worst=hr;}
    }
    if(worst&&worstC>=0.52&&worst.hs&&worst.hs.name){
      hotLabel=worst.hs.name+(worstC>=0.72?' · jammed':' · heavy');
    }else if(demand(simH,weekend)<0.35){
      hotLabel='Clear overnight';
    }
  }
  if(FERRIS){
    FERRIS.rotation.z+=dt*0.25;
    for(let ci=0;ci<8;ci++){const cab=FERRIS.userData['cab'+ci];if(cab)cab.rotation.z=-FERRIS.rotation.z;}
  }
  if(window.AQUARIUM_WHEEL)AQUARIUM_WHEEL.rotation.z+=dt*0.35;
  /* chase cam — flexible: scroll to zoom above/beside the aircraft */
  if(followPlane){
    const f=followPlane;
    if(!f.m||!f.m.visible){stopFollow();}
    else{
      const p=f.m.position;
      const lim=camRadiusLimits();
      /* Keep target near the plane; allow looking above (low phi) or steep down */
      camGoal.target.set(p.x,clamp(p.y*0.45,15,1400),p.z);
      camGoal.radius=clamp(camGoal.radius,lim.rmin,lim.rmax);
      camGoal.phi=clamp(camGoal.phi,lim.phiMin,lim.phiMax);
      const cs=callsignPair(f.cs,f.csIata).main||f.cs||'aircraft';
      document.getElementById('fTxt').textContent='Following '+cs+' · '+(flightGsKts(f)!=null?flightGsKts(f)+' kts':'— kts')+' · '+(f.status||'');
    }
  }
  else if(follow){
    if(follow._dead){stopFollow();}
    else{
      const lim=camRadiusLimits();
      camGoal.target.set(follow._px,follow._py+3.5,follow._pz);
      camGoal.radius=clamp(camGoal.radius,lim.rmin,lim.rmax);
      camGoal.theta=angleLerp(camGoal.theta,follow._hd+Math.PI,0.06);
      camGoal.phi=clamp(camGoal.phi,lim.phiMin,lim.phiMax);
      const mph=Math.round(follow.v/MPH);
      document.getElementById('fTxt').textContent='Following '+(TYPE_NAMES[follow.type.id]||'vehicle')+' · '+mph+' mph';
    }
  }
  applyCam();
  updatePoiCardVisibility();
  /* Sky / clouds / sun always wrap the viewed area — never leave a black void */
  if(typeof skyRoot!=='undefined')skyRoot.position.set(cam.target.x,0,cam.target.z);

  /* map-mode: gentle crossfade — keep 3D city tiny + clouds, avoid white flash */
  const on=mapT>0.04;
  if(gMap.visible!==on)gMap.visible=on;
  /* Cap map opacity so fogged 3D + sky still read; mute bright roads */
  const mapOp=mapT*0.72;
  if(on)for(const m of mapMats)m.opacity=mapOp;
  /* Real night: drop exposure hard so sky/grass aren’t lit like civil twilight */
  renderer.toneMappingExposure=lerp(lerp(1.12,0.58,nightF),0.85,mapT)
    *lerp(1,0.68,wxBlend.cloud)*lerp(1,0.88,wxBlend.rain);
  const showDetail=!inOSM&&mapT<0.98;
  if(gDetail.visible!==showDetail)gDetail.visible=showDetail;
  /* Roads should remain visible whenever vehicles are visible, otherwise cars look like they're "on the grass". */
  const vFade=vehFade;
  const vShow=vFade>0.01;
  const perfBinary=_fpsAvg<42&&totalVeh>2200;
  const showRoads=!inOSM&&(mapT<0.92||vShow);
  if(gRoads3D.visible!==showRoads)gRoads3D.visible=showRoads;
  if(vShow){
    const op=perfBinary?1:vFade;
    bodyMat.opacity=op;cabMat.opacity=op;extraMat.opacity=op;wheelMat.opacity=op;
    bodyMat.transparent=!perfBinary&&mapT>0.3;
    cabMat.transparent=bodyMat.transparent;
    extraMat.transparent=bodyMat.transparent;
    wheelMat.transparent=bodyMat.transparent;
  }
  if(bodies.visible!==vShow){bodies.visible=vShow;cabs.visible=vShow;wheels.visible=vShow;heads2.visible=vShow;tails.visible=vShow;extras.visible=vShow;}
  /* Congestion tint: softer when zoomed in so asphalt + lane lines stay clear */
  const stripO=inOSM?0:0.55*clamp((cam.radius-40)/420,0.35,1)*clamp(1-mapT*1.2,0,1);
  for(const road of roads)for(const dir of road.dirs){if(dir.strip)dir.strip.material.opacity=stripO;}
  /* Freeway decks must stay on when zoomed in — never hide gRoads3D at close range */
  if(!inOSM&&cam.radius<3500&&!gRoads3D.visible)gRoads3D.visible=true;

  /* Clouds stay visible at far zoom (tiny city under sky) — use base opacity, don't multiply-decay */
  const skyFade=inOSM?0:clamp(1-mapT*0.35,0.55,1);
  for(const c of clouds.children){
    const base=(c.userData&&c.userData.baseOp!=null)?c.userData.baseOp:0.85;
    c.material.opacity=base*skyFade;
  }
  /* Place labels: only the nearest name, faint + mid-zoom — no suburb billboard clutter */
  const tgt=(camGoal&&camGoal.target)?camGoal.target:{x:60,z:60};
  const midBand=inOSM?0:clamp((cam.radius-1200)/500,0,1)*clamp((2200-cam.radius)/550,0,1);
  const lblBase=midBand*0.28;
  let bestD=null,bestDd=1e12,bestW=null,bestWd=1e12;
  for(const sp of districtSprites){
    sp.material.opacity=0;
    const dd=Math.hypot(sp.position.x-tgt.x,sp.position.z-tgt.z);
    if(dd<bestDd){bestDd=dd;bestD=sp;}
  }
  for(const sp of waterSprites){
    sp.material.opacity=0;
    const dd=Math.hypot(sp.position.x-tgt.x,sp.position.z-tgt.z);
    if(dd<bestWd){bestWd=dd;bestW=sp;}
  }
  if(bestD&&bestDd<900)bestD.material.opacity=lblBase*clamp(1-bestDd/900,0,1);
  if(bestW&&bestWd<1100)bestW.material.opacity=lblBase*0.7*clamp(1-bestWd/1100,0,1);
  /* street blades: close-in only, soft */
  const bladeO=inOSM?0:0.35*clamp((900-cam.radius)/500,0,1);
  for(const sp of bladeSprites)sp.material.opacity=bladeO;
  if(typeof updateOsmLod==='function'&&camGoal){
    updateOsmLod(camGoal.target.x,camGoal.target.z,camGoal.radius);
  }
  /* Always paint the frame first — HUD/API errors must never blank the canvas */
  if(window.HTS_CINEMATIC&&HTS_CINEMATIC.update){
    try{
      HTS_CINEMATIC.update(camGoal||cam,nightF,_fpsAvg);
    }catch(e){}
  }
  if(window.HTS_CINEMATIC&&HTS_CINEMATIC.render){
    try{HTS_CINEMATIC.render();}
    catch(e){renderer.render(scene,camera);}
  }else{
    renderer.render(scene,camera);
  }
  hudT-=dt;
  if(hudT<=0){
    try{updateHUD(nightF,simH);}catch(e){console.warn('[HTS] HUD',e&&e.message?e.message:e);}
    hudT=liveMode
      ?(_fpsAvg<42?0.45:0.32)
      :clamp(0.28/Math.max(1,timeScale/60),0.06,0.28);
  }
}
requestAnimationFrame(frame);
if(typeof startLiveTrafficPolling==='function')startLiveTrafficPolling();
if(typeof initOsmLod==='function')setTimeout(()=>initOsmLod(),1200);
/* OSM CBD buildings — real footprints + Houston-style window façades */
(function bootOsmBuildings(){
  const cityId=HTS_CITY_ID||'houston';
  /* Austin CBD primary; Houston pack on disk for later (avoid stacking on hand towers) */
  const want=cityId==='austin';
  if(!want)return;
  setTimeout(()=>{
    loadOsmCbdBuildings({
      parent:gDetail,
      geoToWorld,
      unitsPerMile:UNITS_PER_MILE,
      cityId,
      envMap:(window.HTS_CINEMATIC&&HTS_CINEMATIC.envMap)||null,
      skipNear:window.HTS_AUS_LANDMARK_SKIP||[],
      inWater:(x,z)=>typeof inWater==='function'&&inWater(x,z),
      registerFoot:(x,z,hw,hd)=>{if(typeof registerBldgFoot==='function')registerBldgFoot(x,z,hw,hd);},
    }).then((r)=>{
      window.HTS_OSM_BUILDINGS_COUNT=(r&&r.count)||0;
      if(r&&r.group&&window.HTS_CINEMATIC&&HTS_CINEMATIC.markShadowCasters){
        HTS_CINEMATIC.markShadowCasters(r.group);
      }
    }).catch((e)=>{
      console.warn('[HTS] OSM buildings',e&&e.message);
    });
  },900);
})();
setTimeout(()=>{
  const l=$('loading');
  if(!l){fireHtsReady();return;}
  l.style.opacity=0;
  setTimeout(()=>{try{l.remove();}catch(e){} fireHtsReady();},550);
},800);

/* ==================== Mobile chrome (map-first dock) ==================== */
(function setupMobileChrome(){
  const mq=window.matchMedia('(max-width:680px)');
  const goFab=$('mGoFab'), liveFab=$('mLiveFab'), moreFab=$('mMoreFab'), mapFab=$('mMapFab');
  const hudLoc=$('mHudLoc'), scrim=$('mSheetScrim'), tabs=$('mTabs');
  if(!goFab||!liveFab||!moreFab)return;
  let activeTab='go';
  function isMobile(){return mq.matches;}
  function setTab(tab){
    activeTab=tab||'go';
    document.body.classList.remove('m-tab-go','m-tab-live','m-tab-more');
    document.body.classList.add('m-tab-'+activeTab);
    [goFab,liveFab,moreFab].forEach(btn=>{
      const on=btn.dataset.tab===activeTab && document.body.classList.contains('m-panel-open');
      btn.classList.toggle('on',on);
      btn.setAttribute('aria-expanded',on?'true':'false');
    });
    if(tabs)tabs.querySelectorAll('button').forEach(b=>{
      b.classList.toggle('on',b.dataset.tab===activeTab);
    });
    const panel=$('panel');
    if(panel)panel.scrollTop=0;
  }
  function syncFabs(){
    const open=document.body.classList.contains('m-panel-open');
    document.body.classList.toggle('m-sheet-open',open);
    setTab(activeTab);
  }
  function closeSheets(){
    document.body.classList.remove('m-panel-open','m-sheet-open','m-top-open');
    [goFab,liveFab,moreFab].forEach(b=>{b.classList.remove('on');b.setAttribute('aria-expanded','false');});
  }
  function openPanel(tab){
    if(tab)activeTab=tab;
    document.body.classList.add('m-panel-open');
    syncFabs();
  }
  function openTop(){openPanel('more');}
  window.htsMobile={isMobile,openTop,openPanel:(t)=>openPanel(typeof t==='string'?t:(t===true?'go':'go')),closeSheets,syncFabs,setTab};
  /* Compat for tour: openPanel(true) meant open controls */
  window.htsMobile.openPanel=function(arg){
    if(arg===true||arg===false||arg==null)openPanel(activeTab||'go');
    else openPanel(String(arg));
  };
  function toggleTab(tab){
    if(!isMobile())return;
    if(document.body.classList.contains('m-panel-open')&&activeTab===tab)closeSheets();
    else openPanel(tab);
  }
  goFab.addEventListener('click',()=>toggleTab('go'));
  liveFab.addEventListener('click',()=>toggleTab('live'));
  moreFab.addEventListener('click',()=>toggleTab('more'));
  if(mapFab)mapFab.addEventListener('click',()=>closeSheets());
  if(scrim)scrim.addEventListener('click',closeSheets);
  if(hudLoc)hudLoc.addEventListener('click',()=>{const btn=$('locBtn');if(btn)btn.click();});
  if(tabs)tabs.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click',()=>{openPanel(b.dataset.tab||'go');});
  });
  mq.addEventListener('change',()=>{
    if(!mq.matches){
      closeSheets();
      document.body.classList.remove('m-tab-go','m-tab-live','m-tab-more');
      document.querySelectorAll('#panel .grp').forEach(g=>{g.style.display='';});
    }else setTab(activeTab);
  });
  if(isMobile())setTab('go');
})();
/* ==================== Metro switcher ==================== */
(function setupCitySelect(){
  const sel=$('citySelect');
  if(!sel)return;
  const packs=window.HTS_CITIES||{};
  const ids=window.HTS_CITY_IDS||Object.keys(packs);
  const order=Array.isArray(ids)&&ids.length?ids:Object.keys(packs);
  sel.innerHTML=order.map(id=>{
    const m=packs[id]||{};
    const label=m.name||id;
    return '<option value="'+escHtml(id)+'">'+escHtml(label)+'</option>';
  }).join('');
  sel.value=HTS_CITY_ID||'houston';
  sel.addEventListener('change',()=>{
    const id=String(sel.value||'houston').toLowerCase();
    try{localStorage.setItem('hts-city',id);}catch(e){}
    const url=new URL(location.href);
    if(id==='houston')url.searchParams.delete('city');
    else url.searchParams.set('city',id);
    location.assign(url.pathname+url.search+url.hash);
  });
})();
/* ==================== First-visit guided tour ==================== */
(function setupTour(){
  const KEY='houstonSim.tour.v3.'+(HTS_CITY_ID||'houston');
  const root=$('tourRoot');
  const spot=$('tourSpot');
  const card=$('tourCard');
  const titleEl=$('tourTitle');
  const bodyEl=$('tourBody');
  const stepEl=$('tourStep');
  const kickerEl=$('tourKicker');
  const nextBtn=$('tourNext');
  const backBtn=$('tourBack');
  const skipBtn=$('tourSkip');
  const replay=$('tourReplay');
  const replayMobile=$('tourReplayMobile');
  if(!root||!spot||!card)return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileMq=window.matchMedia('(max-width:680px)');
  let idx=0,activeEl=null,running=false,renderTimer=0;
  const city=CITY_NAME||'this metro';
  const STEPS=[
    {
      sel:'#sign',mobileSel:'#mHud',fallback:'#scene',rail:'left',
      title:'Welcome to '+city,
      body:'A live 3D map of freeways, weather, and flights. Drag to look around, scroll to zoom, right-drag to pan. Phone: one finger rotates, pinch zooms, two fingers pan.',
    },
    {
      sel:'#wxCard',mobileSel:'#mHudChip',fallback:'#sign',rail:'left',
      title:'Weather follows the view',
      body:'The card shows conditions for the suburb under the camera — rain intensity included. Tap NWS weather alerts for watches and warnings. Storm layers appear only when a tornado or tropical threat is near this city.',
    },
    {
      sel:'#legend',mobileSel:'#mHud',fallback:'#sign',rail:'left',
      title:'Read the freeways',
      body:'Green is free-flowing. Orange and red mean heavy traffic. Rings mark the worst hotspots right now.',
    },
    {
      sel:'#tourLocGrp',mobileOpen:'go',mobileSel:'#mGoFab',rail:'right',
      title:'Fly anywhere',
      body:'Open Go and pick a district, airport, or landmark. The camera flies there instantly.',
    },
    {
      sel:'#whereami',fallback:'#mHudLoc',
      title:'Know where you are',
      body:'This pill names the district and road under the camera as you move.',
    },
    {
      sel:'#tourFlightGrp',mobileOpen:'live',mobileSel:'#mLiveFab',rail:'right',
      title:'Live aircraft',
      body:'Open Live for planes overhead and airport boards. Tap a flight to jump to it in the sky.',
    },
    {
      sel:'#tourTimeGrp',mobileOpen:'more',mobileSel:'#mMoreFab',rail:'right',
      title:'Time & sky',
      body:'Scrub Today / Tomorrow / +2 days, speed up the clock, or force Clear, Rain, or Storm. Traffic and the sky follow the clock you set.',
    },
    {
      sel:'#tourCityGrp',mobileOpen:'more',mobileSel:'#mMoreFab',rail:'right',fallback:'#tourTimeGrp',
      title:'Sixteen metros',
      body:'Use Metro under More to jump to another city — Phoenix, Philly, New Orleans, and more. Each pack reloads with its own freeways and weather.',
    },
    {
      sel:'#camhint',mobileSel:'#mMapFab',fallback:'#scene',
      title:'You’re set',
      body:'Explore on your own. Replay this tour anytime from Replay tour under More (or the cam hint). On a phone, tap Map to close the sheet.',
    },
  ];
  function isMobile(){return mobileMq.matches;}
  function expandDesktopRails(step){
    if(isMobile())return;
    if(step.rail==='left'&&document.body.classList.contains('left-collapsed')){
      document.body.classList.remove('left-collapsed');
      try{localStorage.setItem('hts-left-collapsed','0');}catch(e){}
    }
    if(step.rail==='right'&&document.body.classList.contains('right-collapsed')){
      document.body.classList.remove('right-collapsed');
      try{localStorage.setItem('hts-right-collapsed','0');}catch(e){}
      const panel=$('panel');
      if(panel){
        panel.style.removeProperty('right');
        panel.style.removeProperty('opacity');
        panel.style.removeProperty('visibility');
        panel.style.removeProperty('pointer-events');
      }
      const btn=$('rightRailToggle')||$('panelCollapseBtn');
      if(btn){btn.setAttribute('aria-expanded','true');btn.title='Hide panel';}
    }
  }
  function done(){try{localStorage.setItem(KEY,'1');}catch(e){} finish(true);}
  function finish(promptGeo){
    running=false;root.classList.remove('on');root.setAttribute('aria-hidden','true');
    if(renderTimer){clearTimeout(renderTimer);renderTimer=0;}
    if(activeEl){activeEl.classList.remove('tour-target-pulse');activeEl=null;}
    if(replay)replay.style.display='inline';
    if(window.htsMobile)window.htsMobile.closeSheets();
    if(promptGeo)maybePromptGeo();
  }
  function prepareStep(step){
    expandDesktopRails(step);
    if(!isMobile()||!window.htsMobile)return;
    if(step.mobileOpen)window.htsMobile.openPanel(step.mobileOpen);
    else window.htsMobile.closeSheets();
  }
  function resolveTarget(step){
    const prefer=(isMobile()&&step.mobileSel)?step.mobileSel:step.sel;
    let el=document.querySelector(prefer);
    if(el){
      const r=el.getBoundingClientRect();const cs=getComputedStyle(el);
      const hidden=r.width<2||r.height<2||cs.display==='none'||cs.visibility==='hidden'||cs.opacity==='0';
      if(!hidden)return el;
    }
    if(step.fallback){
      const fb=document.querySelector(step.fallback);
      if(fb){
        const r=fb.getBoundingClientRect();const cs=getComputedStyle(fb);
        if(r.width>=2&&r.height>=2&&cs.display!=='none'&&cs.visibility!=='hidden')return fb;
      }
    }
    return document.querySelector(step.sel)||document.querySelector('#scene');
  }
  function placeCard(targetRect){
    if(isMobile()){
      card.style.left='';card.style.top='';card.style.transform='';
      return;
    }
    const pad=14,cw=card.offsetWidth||320,ch=card.offsetHeight||180,vw=window.innerWidth,vh=window.innerHeight;
    let left=targetRect.left,top=targetRect.bottom+12;
    if(top+ch>vh-pad)top=targetRect.top-ch-12;
    if(top<pad)top=Math.max(pad,Math.min(vh-ch-pad,targetRect.top+pad));
    if(left+cw>vw-pad)left=vw-cw-pad;if(left<pad)left=pad;
    if(targetRect.left>vw*0.55&&targetRect.left-cw-16>pad){left=targetRect.left-cw-16;top=Math.min(Math.max(pad,targetRect.top),vh-ch-pad);}
    card.style.transform='';card.style.left=left+'px';card.style.top=top+'px';
  }
  function paintStep(){
    const step=STEPS[idx];
    const el=resolveTarget(step);
    if(activeEl)activeEl.classList.remove('tour-target-pulse');
    activeEl=el;
    if(el){
      el.classList.add('tour-target-pulse');
      try{el.scrollIntoView({block:'nearest',inline:'nearest',behavior:reduce?'auto':'smooth'});}catch(e){}
      const r=el.getBoundingClientRect();const m=isMobile()?6:8;
      spot.style.display='block';
      spot.style.top=(r.top-m)+'px';spot.style.left=(r.left-m)+'px';
      spot.style.width=Math.max(24,r.width+m*2)+'px';spot.style.height=Math.max(24,r.height+m*2)+'px';
      spot.style.borderRadius='14px';
      placeCard(r);
    }else{
      spot.style.display='none';
      placeCard({left:0,top:0,bottom:0,right:0,width:0,height:0});
    }
    kickerEl.textContent='City tour · '+city;
    titleEl.textContent=step.title;
    bodyEl.textContent=step.body;
    stepEl.textContent=(idx+1)+' / '+STEPS.length;
    backBtn.style.visibility=idx===0?'hidden':'visible';
    nextBtn.textContent=idx===STEPS.length-1?'Let’s go':'Next';
  }
  function render(){
    const step=STEPS[idx];
    prepareStep(step);
    if(renderTimer)clearTimeout(renderTimer);
    const delay=reduce?0:(step.mobileOpen||step.rail==='right'?320:40);
    requestAnimationFrame(()=>{
      paintStep();
      if(delay)renderTimer=setTimeout(()=>{if(running)paintStep();},delay);
    });
  }
  function start(force){
    if(running)return;
    if(!force){
      try{
        if(localStorage.getItem(KEY)==='1'){
          if(replay)replay.style.display='inline';
          maybePromptGeo();
          return;
        }
      }catch(e){}
    }
    running=true;idx=0;root.classList.add('on');root.setAttribute('aria-hidden','false');
    if(replay)replay.style.display='none';
    if(replayMobile&&!isMobile())replayMobile.style.display='none';
    hideGeoToast();render();
  }
  nextBtn.addEventListener('click',()=>{if(idx>=STEPS.length-1)done();else{idx++;render();}});
  backBtn.addEventListener('click',()=>{if(idx>0){idx--;render();}});
  skipBtn.addEventListener('click',done);
  $('tourScrim').addEventListener('click',done);
  window.addEventListener('keydown',(e)=>{
    if(!running)return;
    if(e.key==='Escape')done();
    if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();nextBtn.click();}
    if(e.key==='ArrowLeft'){e.preventDefault();backBtn.click();}
  });
  window.addEventListener('resize',()=>{if(running)render();},{passive:true});
  if(replay){replay.style.display='none';replay.addEventListener('click',(e)=>{e.preventDefault();start(true);});}
  if(replayMobile)replayMobile.addEventListener('click',()=>start(true));
  const panel=$('panel');
  if(panel&&!document.getElementById('tourReplayPanel')){
    const wrap=document.createElement('div');
    wrap.className='grp';
    wrap.id='tourReplayGrp';
    wrap.innerHTML='<button type="button" class="btn" id="tourReplayPanel" style="width:100%">Replay city tour</button>';
    panel.appendChild(wrap);
    $('tourReplayPanel').addEventListener('click',()=>start(true));
  }else if($('tourReplayPanel')){
    $('tourReplayPanel').textContent='Replay city tour';
  }
  whenHtsReady(()=>setTimeout(()=>start(false),reduce?200:500));
})();
/* Last-chance ready: if loading already gone and timeout somehow skipped, still unlock tour */
if(!htsReadyFired&&!document.getElementById('loading'))fireHtsReady();
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});
}