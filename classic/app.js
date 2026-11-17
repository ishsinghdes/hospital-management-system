// FICTIONAL PROTOTYPE: all hospital, patient and staff data is synthetic. No backend, authentication or persistence. Never use for real care.
'use strict';
// Original SVG architecture; user-supplied NaveXa references inform composition only.
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const insightDock=document.querySelector('#dock'),insightPanel=document.querySelector('#metrics'),detailPanel=document.querySelector('#detail');
const segmentCache=new Map();
const sections=['Overview','Patients','Beds & Rooms','Schedule','Staff','Reports'];
const slugs=['overview','patients','beds','schedule','staff','reports'];
const routes=[...slugs,'profile','settings'];
function readPreference(key,fallback){
  try{
    return JSON.parse(localStorage.getItem('aspatal-'+key))??fallback
  }catch{
    return fallback
  }
}
function savePreference(key,value){
  try{
    localStorage.setItem('aspatal-'+key,JSON.stringify(value))
  }catch{
  }
}
const account={name:'Ananya Kapoor',email:'ananya.kapoor@astergrove.example',role:'Care coordinator',staffId:'AG-ST-011',extension:'2211'};
const preferences={theme:readPreference('theme','light'),alerts:readPreference('alerts',true),floor:readPreference('floor',1)};
document.documentElement.dataset.theme=preferences.theme;
const floors=[{id:1,name:'General medicine',ward:['Medicine A','Medicine B']},{id:2,name:'Surgical care',ward:['Surgical A','Surgical B']},{id:3,name:'Recovery & step-down',ward:['Recovery A','Recovery B']}];
const team=[{id:1,name:'Meera Nair',role:'Registered nurse',floor:1,shift:'07:00–15:00',on:true},{id:2,name:'Arjun Rao',role:'Registered nurse',floor:1,shift:'07:00–15:00',on:true},{id:3,name:'Zoya Khan',role:'Registered nurse',floor:2,shift:'07:00–15:00',on:true},{id:4,name:'Dev Patel',role:'Registered nurse',floor:2,shift:'07:00–15:00',on:true},{id:5,name:'Tara Joseph',role:'Registered nurse',floor:3,shift:'07:00–15:00',on:true},{id:6,name:'Rohan Sen',role:'Registered nurse',floor:3,shift:'15:00–23:00',on:false},{id:7,name:'Dr. Kavya Menon',role:'Duty physician',floor:1,shift:'08:00–16:00',on:true},{id:8,name:'Dr. Aman Verma',role:'Duty physician',floor:2,shift:'08:00–16:00',on:true},{id:9,name:'Isha Das',role:'Care assistant',floor:3,shift:'07:00–15:00',on:true}];
team.push({id:10,name:'Dr. Neelima Roy',role:'Duty physician',floor:3,shift:'08:00–16:00',on:true},{id:11,name:'Ananya Kapoor',role:'Floor administrator',floor:1,shift:'07:00–15:00',on:true},{id:12,name:'Nitin Malhotra',role:'Floor administrator',floor:2,shift:'07:00–15:00',on:true},{id:13,name:'Anjali Fernandes',role:'Floor administrator',floor:3,shift:'07:00–15:00',on:true});
// Reserved .example addresses and internal extensions are fictional contact data.
team.forEach(t=>{
  t.email=t.name.replace('Dr. ','').toLowerCase().replaceAll(' ','.')+'@astergrove.example';
  t.extension=String(2100+t.floor*100+t.id)
});
floors.forEach(f=>{
  f.spoc=(f.id-1)*2+1;
  f.doctor=f.id===1?7:f.id===2?8:10;
  f.admin=10+f.id
});
const names=['Aarav Shah','Diya Menon','Kabir Sethi','Anika Rao','Vihaan Kapoor','Sara Ali','Neel Joshi','Riya Das','Ishaan Roy','Avni Nair','Rehan Khan','Mira Patel','Aditya Sen','Tanya George','Om Prakash','Naina Bhat','Kunal Bose','Asha Verma','Yash Jain','Leela Kumar','Ravi Mehta','Pooja Sinha','Varun Iyer','Sana Mir','Arnav Dutt','Eva Thomas','Manav Gill','Nisha Reddy','Dhruv Sood','Tara Bansal','Rohan Paul','Zara Sheikh','Ved Anand','Ira Chawla','Neil Mathur','Sia Desai','Vivaan Goel','Myra John','Aryan Dev','Anya Dey','Samar Lal','Kiara Seth','Ayaan Malik','Vani Saxena','Rudra Dubey','Anvi Babu','Parth Naik','Meher Kaur','Darsh Nanda','Suhana Kohli','Reyansh Pal','Navya Ray','Krish Pillai','Aditi Shetty'];
names.push('Sahil Arora','Palak Thakur','Pranav Hegde','Hina Qureshi','Ashwin Rao','Jaya Sethi','Siddharth Shah','Rhea Ghosh','Gautam Yadav','Anjali Dhar','Karan Kapur','Vidya Pandey','Imran Shaikh','Payal Nanda','Suresh Bhatt','Nandita Bose','Harsh Batra','Fatima Ali','Chirag Dutta','Shreya Nair','Akash Mahajan','Divya Krishnan','Farhan Noor','Simran Chadha','Rahul Walia','Sneha Mohan','Vikram Thapa','Amrita Guha','Mohit Bedi','Swati Raina','Amit Raval','Deepa Handa','Nikhil Varma','Gauri Roy','Sanjay Kamat','Pallavi Mitra','Jatin Bhalla','Sonal Suri','Anil Ahuja','Bhavna Tiwari','Rajat Sodhi','Kavita Rane','Uday Anand','Malini Mehra','Tanmay Dixit','Ritika Vyas','Pawan Chopra','Aparna Pillai','Sameer Luthra','Priya Madaan','Vivek Bahl','Anshu Khanna','Naveen Tyagi','Sunita Borkar','Tarun Shekhar','Madhavi Kundu','Danish Rizvi','Shalini Talwar','Mukul Saini','Neha Mandal');
const rooms=[],patients=[];
let pi=0;
for(let f=1;f<=3;f++)for(let i=0;i<24;i++){
  const id=String(f*100+i+1), room={id,floor:f,index:i,type:'patient',ward:floors[f-1].ward[i<12?0:1],call:i==3||f==2&&i==8,care:'Routine care',beds:[]};
  for(let b=0;b<2;b++){
    const status=(i*2+b+f)%5===0?'Available':(i*2+b+f)%11===0?'Cleaning':'Occupied';
    const bed={id:id+'-'+(b?'B':'A'),status,patientId:null};
    if(status==='Occupied'){
      const patient={id:'AG-'+String(1041+pi),name:names[pi%names.length],age:24+(pi*7)%54,bed:bed.id,room:id,floor:f,nurse:(f-1)*2+1+i%2,admitted:'12 Nov 2026',care:'Care plan active'};
      bed.patientId=patient.id;
      patients.push(patient);
      pi++
    }
    room.beds.push(bed)
  }
  rooms.push(room)
}
// Synthetic pharmacy inventory: quantities/thresholds are demonstration data, not clinical recommendations.
const stockCatalog=[{name:'Paracetamol 500 mg',unit:'tablets',target:240,min:60},{name:'Oral rehydration salts',unit:'sachets',target:90,min:20},{name:'Sodium chloride 0.9%',unit:'500 mL bags',target:70,min:15},{name:'Povidone iodine',unit:'100 mL bottles',target:36,min:8},{name:'Dextrose 5%',unit:'500 mL bags',target:60,min:15},{name:'Cetirizine 10 mg',unit:'tablets',target:180,min:40}];
for(let f=1;f<=3;f++)for(let i=0;i<4;i++)rooms.push({id:`${f}P${i+1}`,floor:f,index:i,type:'pharmacy',name:`Medicine room ${i+1}`,ward:floors[f-1].name,beds:[],call:false,care:'Operating',inventory:stockCatalog.map((v,j)=>({...v,id:`${f}P${i+1}-${j}`,quantity:(i===1&&j<2)?[12,0][j]:(i===3&&j===2)?8:Math.round(v.target*(.65+((f+i+j)%3)*.1)),requested:false,requestQty:0}))});
const lowStock=r=>r.inventory.filter(i=>i.quantity<i.min),pharmacyState=r=>lowStock(r).length?'Stock needed':'Operating';
const floorRooms=()=>rooms.filter(r=>r.floor===state.floor);
const visibleRooms=()=>floorRooms().filter(r=>state.roomFilter==='all'||r.type===(state.roomFilter==='patients'?'patient':'pharmacy'));
const tasks=patients.slice(0,8).map((p,i)=>({id:i+1,time:['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30'][i],title:['Morning care round','Mobility assistance','Care handover','Comfort check','Family update','Discharge coordination','Care round','Room readiness review'][i],patient:p.id,nurse:p.nurse,done:i<2}));
const trend=[['8 Nov',7],['9 Nov',5],['10 Nov',6],['11 Nov',3],['12 Nov',1],['13 Nov',2]].map(([day,offset])=>({day,occupied:patients.length-offset}));
const flow=[{label:'07:00',admissions:2,discharges:0},{label:'08:00',admissions:3,discharges:1},{label:'09:00',admissions:1,discharges:2},{label:'10:00',admissions:2,discharges:3},{label:'11:00',admissions:1,discharges:1},{label:'12:00',admissions:2,discharges:2}];
flow.forEach((d,i)=>{
  d.byFloor=floors.map(f=>({floor:f.id,admissions:0,discharges:0}));
  for(let j=0;j<d.admissions;j++)d.byFloor[(i+j)%3].admissions++;
  for(let j=0;j<d.discharges;j++)d.byFloor[(i+j+1)%3].discharges++
});
const callAudit=[];
let state={signedIn:true,loginRole:'coordinator',page:'overview',selectedBed:null,floor:preferences.floor,metric:null,room:null,authorized:true,directoryOpen:false,roomFilter:'all',reportFloor:0,reportHour:0,stockOnlyLow:false,mapMode:'3d',blend:0,rotation:0,calendarDay:14,calendarMode:'week',unread:new Set(),taskId:null,zoom:1,panX:0,panY:0,panelsHidden:false,query:'',filter:'All',staffFilter:'All'};
const allBeds=()=>rooms.flatMap(r=>r.beds), count=s=>allBeds().filter(b=>b.status===s).length, occupancy=()=>Math.round(count('Occupied')/allBeds().length*100);
function notify(s){
  $('#toast').textContent=s;
  $('#toast').hidden=false;
  clearTimeout(notify.timer);
  notify.timer=setTimeout(()=>$('#toast').hidden=true,3500)
}
function badge(s){
  return `<span class="status ${s==='Available'||s==='Completed'?'green':s==='Nurse call'?'red':''}">${esc(s)}</span>`
}
function table(headers,rows,caption,rowAttrs=[]){
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(caption)}"><table><caption>${caption}</caption><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map((r,i)=>`<tr ${rowAttrs[i]||''}>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}" class="empty">No matching results. Try another search or filter.</td></tr>`}</tbody></table></div>`
}
function head(title,desc,actions=''){
  return `<div class="page-head"><div><h1>${title}</h1><p>${desc}</p></div><div class="controls">${actions}</div></div>`
}
function lineChart(vals,labels,max=allBeds().length,label='Occupied beds'){
  const x=i=>45+i*460/(vals.length-1),y=v=>145-v/max*120;
  return `<svg class="chart" viewBox="0 0 540 180" role="img" aria-label="${esc(label+': '+vals.map((v,i)=>labels[i]+' '+v).join(', '))}">${[0,max/2,max].map(v=>`<line x1="40" x2="520" y1="${y(v)}" y2="${y(v)}" stroke="#dce4de"/><text x="4" y="${y(v)+4}">${v}</text>`).join('')}<polyline points="${vals.map((v,i)=>`${x(i)},${y(v)}`).join(' ')}" fill="none" stroke="#0aab2a" stroke-width="2.5"/>${labels.map((l,i)=>`<text x="${x(i)}" y="170" text-anchor="middle">${l}</text>`).join('')}</svg>`
}
function flowChart(){
  return `<svg class="chart" viewBox="0 0 540 180" role="img" aria-label="Hourly admissions and discharges. ${flow.map(f=>`${f.label}: ${f.admissions} admissions, ${f.discharges} discharges`).join('; ')}">${[0,2,4].map(n=>`<line x1="35" x2="520" y1="${145-n*29}" y2="${145-n*29}" stroke="#dce4de"/><text x="10" y="${149-n*29}">${n}</text>`).join('')}${flow.map((f,i)=>`<rect x="${54+i*77}" y="${145-f.admissions*29}" width="16" height="${f.admissions*29}" rx="2" fill="#0aab2a"/><rect x="${75+i*77}" y="${145-f.discharges*29}" width="16" height="${f.discharges*29}" rx="2" fill="#a5b3a9"/><text x="${73+i*77}" y="170" text-anchor="middle">${f.label}</text>`).join('')}</svg>`
}
function floorOptions(){
  return floors.map(f=>`<option value="${f.id}" ${state.floor===f.id?'selected':''}>Floor ${f.id} · ${f.name}</option>`).join('')
}
function render(){
  if(!state.signedIn){
    showLogin();
    return
  }
  if(!$('#nav a'))$('#nav').innerHTML=sections.map((n,i)=>`<a href="#${slugs[i]}" ${state.page===slugs[i]?'aria-current="page"':''}>${n}</a>`).join('');
  updateNav();
  $('#dock').hidden=state.page!=='overview';
  $('#metrics').hidden=state.metric===null||state.page!=='overview';
  const pages={overview:overview,patients:patientsPage,beds:bedsPage,schedule:schedulePage,staff:staffPage,reports:reportsPage,profile:profilePage,settings:settingsPage};
  $('#main').innerHTML=(pages[state.page]||overview)();
  placeDock();
  renderDock();
  if(state.metric!==null)renderMetric();
  renderDetail();
  if(state.room)syncRoomSelection();
  applyChartTheme();
  updateThemeLabel();
}
function overview(){
  return head('Floor overview',`${floors[state.floor-1].name} · 24 patient rooms · 4 pharmacies · 48 beds`,`<label class="sr-floor"><span class="muted">Viewing </span><select class="floor-select" id="floor" aria-label="Hospital floor">${floorOptions()}</select></label>`)+`<section class="map-shell ${state.room?'has-room-detail':''} ${state.panelsHidden?'panels-hidden':''}" aria-label="Interactive hospital floor plan"><div class="map-caption">${floorContacts()}</div>${mapSVG()}<div class="map-legend"><span><i class="swatch free"></i> Available</span><span><i class="swatch"></i> Occupied / cleaning</span><span><i class="swatch call"></i> Nurse call</span></div><div class="map-tools"><button class="panels-toggle" data-action="toggle-panels" aria-label="${state.panelsHidden?'Show panels':'Hide panels'}" aria-pressed="${state.panelsHidden}" title="${state.panelsHidden?'Show panels':'Hide panels'}">${panelToggleIcon()}</button><div class="view-toggle"><button data-map-mode="3d" aria-pressed="${state.mapMode==='3d'}">3D</button><button data-map-mode="2d" aria-pressed="${state.mapMode==='2d'}">2D</button></div><button data-action="zoom-out" aria-label="Zoom out">−</button><button data-action="zoom-in" aria-label="Zoom in">+</button><span class="map-tool-divider" aria-hidden="true"></span><button class="map-theme-toggle" data-action="theme" aria-label="Switch to ${preferences.theme==='dark'?'light':'dark'} mode" aria-pressed="${preferences.theme==='dark'}" title="Switch to ${preferences.theme==='dark'?'light':'dark'} mode">${preferences.theme==='dark'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z"/></svg>'}</button></div>${roomDirectory()}</section>`
}
function mapSVG(){
  const blend=state.blend,P=(x,y,z=0)=>{
    const a=state.rotation*Math.PI/180,rx=(x-510)*Math.cos(a)-(y-400)*Math.sin(a),ry=(x-510)*Math.sin(a)+(y-400)*Math.cos(a);
    return [700+(rx-ry)*.72*(1-blend)+rx*.88*blend,450+(rx+ry)*.36*(1-blend)+ry*.88*blend-z*(1-blend)]
  },pts=a=>a.map(v=>P(...v).join(',')).join(' ');
  const poly=(a,fill,extra='')=>`<polygon points="${pts(a)}" fill="${fill}" ${extra}/>`;
  const block=(x,y,w,d,h,color)=>poly([[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]],color)+poly([[x,y+d,0],[x+w,y+d,0],[x+w,y+d,h],[x,y+d,h]],'#dce4ec')+poly([[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]],'#c6d2de');
  const text=(x,y,z,label,size=15,color='#617387',extra='')=>{
    const p=P(x,y,z);
    return `<text x="${p[0]}" y="${p[1]}" text-anchor="middle" font-size="${size}" fill="${color}" ${extra}>${label}</text>`
  };
  let out=`<svg class="map-art" tabindex="0" aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home" aria-description="Drag to move. Shift-drag or right-drag to rotate. Arrow keys move; Shift and Left or Right rotate. Home resets the view." viewBox="-40 ${20-220*blend} 1480 ${850+440*blend}" aria-label="Floor ${state.floor}, U-shaped plan with 24 patient rooms and four medicine rooms. ${state.roomFilter==='all'?'All rooms shown':state.roomFilter==='pharmacy'?'Pharmacy rooms shown':'Patient rooms shown'}." role="group"><defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="13" flood-color="#57718b" flood-opacity=".14"/></filter><filter id="pharma-green" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="10" flood-color="#3eb775" flood-opacity=".5"/></filter><filter id="pharma-orange" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="10" flood-color="#ef9a2c" flood-opacity=".55"/></filter></defs><g class="scene-camera" style="transform:${cameraTransform()}">`;
  const outline=[[0,0,12],[1020,0,12],[1020,810,12],[690,810,12],[690,205,12],[330,205,12],[330,810,12],[0,810,12]];
  out+=poly(outline,'#f8fbfd','filter="url(#shadow)" stroke="#d3dfe9" stroke-width="2"');
 // A continuous U-shaped circulation route connects both wings and four pharmacy stores.
 
  out+=poly([[125,125,14],[895,125,14],[895,800,14],[815,800,14],[815,200,14],[205,200,14],[205,800,14],[125,800,14]],'#e3edf6');
  out+=`<polyline points="${pts([[165,790,15],[165,162,15],[855,162,15],[855,790,15]])}" fill="none" stroke="#85ad9c" stroke-width="3" stroke-dasharray="7 7"/>`;
  out+=poly([[350,235,0],[670,235,0],[670,780,0],[350,780,0]],'#e8f0ec');
 // Garden paths, raised planting beds, shade trees and benches are original vector details.
 
  out+=poly([[485,245,2],[535,245,2],[535,760,2],[485,760,2]],'#d3dfe9');
  out+=poly([[365,465,2],[655,465,2],[655,505,2],[365,505,2]],'#d3dfe9');
  for(const [x,y] of [[385,295],[610,295],[385,405],[610,405],[385,625],[610,625],[385,725],[610,725]]){
    out+=block(x-22,y-22,44,44,9,'#bed5c6');
    out+=block(x-3,y-3,6,6,40,'#7c9387');
    const c=P(x,y,50);
    out+=`<g class="courtyard-tree"><ellipse cx="${c[0]}" cy="${c[1]+7}" rx="25" ry="${14+8*blend}" fill="#85ad9c"/><ellipse cx="${c[0]-5}" cy="${c[1]}" rx="21" ry="${15+5*blend}" fill="#b7d6b5"/><ellipse cx="${c[0]+7}" cy="${c[1]-6}" rx="14" ry="${10+4*blend}" fill="#b4e0bd"/></g>`
  }
  for(const [x,y] of [[430,350],[550,350],[430,600],[550,600]]){
    out+=block(x,y,38,13,13,'#e5dcc5')+block(x,y+12,38,3,25,'#c6d2de')
  }
  out+=poly([[455,545,4],[565,545,4],[565,575,4],[455,575,4]],'#bed5c6')+poly([[461,550,5],[559,550,5],[559,570,5],[461,570,5]],'#a8cce8');
  out+=text(510,530,2,'Courtyard',18,'#7c9387');
  function geo(r){
    if(r.type==='pharmacy')return{x:256+r.index*128,y:0,w:120,d:115};
    if(r.index<4)return{x:[0,128,768,896][r.index],y:0,w:120,d:115};
    const n=r.index-4,side=Math.floor(n/5),slot=n%5;
    return{x:[0,210,690,900][side],y:215+slot*118,w:120,d:108}
  }
  const roomLabels=[];
  const depth=r=>{
    const g=geo(r),a=state.rotation*Math.PI/180,x=g.x+60-510,y=g.y+55-400;
    return x*(Math.cos(a)+Math.sin(a))+y*(Math.cos(a)-Math.sin(a))
  };
  for(const r of visibleRooms().sort((a,b)=>depth(a)-depth(b))){
    const {x,y,w,d}=geo(r),pharma=r.type==='pharmacy',low=pharma&&lowStock(r).length,available=r.beds.some(b=>b.status==='Available'),fill=pharma?(low?'#fff1d7':'#e7f5df'):r.call?'#fff0ed':available?'#edf7ee':'#f3f7fb',label=pharma?'P'+(r.index+1):r.id;
    out+=`<g class="room ${pharma?'pharmacy-room':''}" role="button" tabindex="0" data-room="${r.id}" aria-label="${pharma?r.name+', '+pharmacyState(r):'Room '+r.id+(r.call?', nurse call active':'')}" aria-pressed="${state.room===r.id}">`;
    out+=poly([[x,y,14],[x+w,y,14],[x+w,y+d,14],[x,y+d,14]],fill,`class="room-shape" ${pharma?`filter="url(#pharma-${low?'orange':'green'})"`:''}`);
    out+=block(x,y,w,4,36,'#fcfdff')+block(x,y,4,d,36,pharma?'#e6edda':'#f6f9fc');
    if(pharma){
 // Tall cabinets with glazed doors, shelf seams and a preparation counter.
 
      out+=block(x+12,y+7,94,20,48,low?'#e5dcc5':'#bed5c6');
      for(let col=0;col<3;col++){
        const cx=x+16+col*30;
        out+=poly([[cx,y+28,13],[cx+25,y+28,13],[cx+25,y+28,43],[cx,y+28,43]],'#e3edf6','stroke="#b8c6d3" stroke-width="1"');
        out+=poly([[cx+3,y+29,27],[cx+22,y+29,27],[cx+22,y+29,29],[cx+3,y+29,29]],'#85ad9c');
        const h=P(cx+21,y+29,33);
        out+=`<circle cx="${h[0]}" cy="${h[1]}" r="1.4" fill="#617387"/>`
      }
      out+=block(x+18,y+68,78,25,25,'#d3dfe8')+block(x+16,y+66,82,29,28,'#fcfdff');
      for(let v=0;v<3;v++){
        out+=block(x+27+v*17,y+73,8,8,33,low?'#e7c98e':'#b7d6b5')
      }
      out+=text(x+61,y+52,34,'+',20,low?'#b96e1f':'#3d8e56')
    }
    else{
      r.beds.forEach((b,i)=>{
        const bx=x+17+i*49,by=y+20;
        out+=block(bx,by,39,55,22,b.status==='Available'?'#b4e0bd':b.status==='Cleaning'?'#e5dcc5':'#d3dfe8');
        out+=poly([[bx+4,by+4,24],[bx+35,by+4,24],[bx+35,by+17,24],[bx+4,by+17,24]],'#fff');
        out+=text(bx+19,by+43,24,i?'B':'A',11,'#546778')
      })
    }
    const [lx,ly]=P(x+w/2,y+d-9,50);
    roomLabels.push(`<g class="room-label room-label-overlay" data-room="${r.id}" data-selected="${state.room===r.id}" aria-hidden="true"><rect x="${lx-27}" y="${ly-16}" width="54" height="25" rx="12" fill="${pharma?low?'#fff2d9':'#f1faea':'white'}" stroke="${pharma?low?'#d5a55d':'#91b68d':'#b8c6d3'}"/><text x="${lx}" y="${ly+2}" text-anchor="middle" font-size="16" font-weight="600" fill="#31475a">${label}</text></g>`);
    if(r.call){
      const [cx,cy]=P(x+103,y+86,30);
      out+=`<circle cx="${cx}" cy="${cy}" r="6" fill="#ed3d3d"/>`
    }
    out+=`<title>${pharma?r.name+' · '+pharmacyState(r):'Room '+r.id}</title></g>`;
  }
  out+=block(375,135,68,45,36,'#f6fafc')+text(408,156,46,'+',25,'#4a8e77');
  out+=text(165,840,0,'West wing',16)+text(855,840,0,'East wing',16)+text(510,-25,0,'Medicine stores',16);
  out+=scenePeople(P);
  out+=`<g class="room-label-layer">${roomLabels.join('')}</g>`;
  out+='</g></svg>';
  return preferences.theme==='dark'?darkMap(out):out
}
const metricNames=['Patient Flow','Bed Occupancy Trend',"Today’s Care Schedule",'Staff on Duty'];
function illustration(i){
  const drawings=[`<path d="M6 22h7l5-9 7 15 6-10h11" stroke="#168bd0" stroke-width="3" fill="none"/><circle cx="8" cy="10" r="5" fill="#a5daf8"/><circle cx="36" cy="30" r="5" fill="#77cdae"/>`,`<rect x="8" y="13" width="31" height="17" rx="4" fill="#9abbe9"/><rect x="10" y="12" width="10" height="7" rx="2" fill="#fff"/><path d="M6 10v24m34-14v14" stroke="#4675b4" stroke-width="3"/>`,`<rect x="9" y="7" width="29" height="28" rx="6" fill="#ffd39a"/><path d="M9 16h29M17 5v7m12-7v7" stroke="#b97b2e" stroke-width="2"/><path d="m18 25 4 4 8-9" fill="none" stroke="#9c6724" stroke-width="2.5"/>`,`<circle cx="22" cy="12" r="7" fill="#caadea"/><path d="M9 34v-5a13 13 0 0 1 26 0v5" fill="#b2c7ef"/><path d="M30 24v10m-5-5h10" stroke="#5c65a0" stroke-width="2.5"/>`];
  return `<svg class="dock-art" viewBox="0 0 48 40" aria-hidden="true">${drawings[i]}</svg>`
}
function renderDock(){
  if(insightDock.querySelectorAll('button').length!==4)insightDock.innerHTML=metricNames.map((n,i)=>`<button data-metric="${i}" aria-expanded="false" aria-controls="metrics">${illustration(i)}<span>${n}</span><i class="notice-dot" hidden></i></button>`).join('');
  insightDock.querySelectorAll('button').forEach((button,i)=>{
    button.setAttribute('aria-expanded',String(state.metric===i));
    const dot=button.querySelector('.notice-dot'),pending=preferences.alerts&&(state.unread.has(i)||i===2&&tasks.some(t=>!t.done));
    dot.hidden=!pending;
    dot.setAttribute('aria-label',i===2?'Pending care tasks':'Updated this session')
  });
  updateSegmentedControls()
}
function updateNav(){
  const nav=$('#nav');
  nav.querySelectorAll('a').forEach(a=>{
    if(a.hash==='#'+state.page)a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current')
  });
  let pill=nav.querySelector('.nav-highlight');
  if(!pill){
    pill=document.createElement('span');
    pill.className='nav-highlight';
    nav.prepend(pill)
  }
  const active=nav.querySelector('[aria-current]');
  pill.style.opacity=active?'1':'0';
  if(active){
    pill.style.width=active.offsetWidth+'px';
    pill.style.height=active.offsetHeight+'px';
    pill.style.transform=`translate(${active.offsetLeft}px,${active.offsetTop}px)`
  }
}
window.addEventListener('resize',updateNav);
function renderMetric(){
  let i=state.metric;
  if(i===null)return;
  const switched=insightPanel.dataset.activeMetric!==String(i);
  insightPanel.dataset.activeMetric=String(i);
  let content='';
  if(i===0)content=`<div class="insight-grid"><div><div class="big-number">${flow.reduce((s,f)=>s+f.admissions,0)}</div><p>Admissions, 07:00–12:00</p><p class="hint">${flow.reduce((s,f)=>s+f.discharges,0)} discharges · shift log</p><span class="dot"></span><small style="display:inline">Admissions</small> &nbsp; <i class="swatch"></i> <small style="display:inline">Discharges</small></div>${flowChart()}</div>`;
  if(i===1)content=`<div class="insight-grid"><div><div class="big-number">${occupancy()}<span style="font-size:23px">%</span></div><p>${count('Occupied')} occupied / ${allBeds().length} total beds</p><p class="hint">${count('Available')} available · ${count('Cleaning')} cleaning<br>All three floors · 8–14 November</p></div>${lineChart([...trend.map(d=>d.occupied),count('Occupied')],[...trend.map(d=>d.day),'14 Nov'])}</div>`;
  if(i===2)content=tasks.slice(0,4).map(taskRow).join('')+`<button data-go="schedule">Open full schedule</button>`;
  if(i===3)content=team.filter(s=>s.on).slice(0,4).map(s=>`<div class="list-row"><span>${s.name}<p>${s.role} · Floor ${s.floor}</p></span><span>${s.shift}</span></div>`).join('')+`<button data-go="staff">View all ${team.filter(s=>s.on).length} on duty</button>`;
  $('#metrics').classList.toggle('compact-insight',i===2||i===3);
  $('#metrics').innerHTML=`<div class="panel-head"><div><h2>${metricNames[i]}</h2><small>14 November 2026</small></div></div><div class="metric-body">${content}</div>`;
  $('#metrics').hidden=false;
  alignInsightPanel();
  applyChartTheme();
  if(switched&&!reducedMotion())insightPanel.animate([{opacity:.8},{opacity:1}],{duration:160,easing:'cubic-bezier(.2,.7,.2,1)'});
}
function renderDetail(){
  let r=rooms.find(r=>r.id===state.room);
  if(!r){
    $('#detail').hidden=true;
    return
  }
  $('#detail').hidden=false;
  $('#detail').classList.toggle('map-detail',state.page==='overview');
  if(r.type==='pharmacy'){
    renderPharmacy(r);
    return
  }
  $('#detail').innerHTML=`<div class="panel-head"><div><small>Floor ${r.floor} / ${r.ward}</small><h2 id="detail-title" tabindex="-1">Room ${r.id}</h2></div><button data-action="close-detail" aria-label="Close room details">×</button></div><p>Two-bed room · ${r.care}</p><div class="nurse-call ${r.call?'is-calling':''}"><span class="call-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5z"/><path d="M10 20h4M12 2v2"/></svg></span><div><strong>${r.call?'Nurse call active':'Nurse call'}</strong><small>${r.call?'Awaiting acknowledgement':'No active call'}</small></div><button data-action="toggle-call">${r.call?'Acknowledge':'Raise call'}</button></div>${!state.authorized?`<div class="bed-item"><h3>Patient details are private</h3><p>Access patient details in your care-coordinator view.</p><button data-action="authorize">Open care view</button></div>`:''}${[...r.beds].sort((a,b)=>a.id===state.selectedBed?-1:b.id===state.selectedBed?1:0).map(b=>{
    let p=patients.find(p=>p.id===b.patientId);
    return `<div class="bed-item patient-card ${state.selectedBed===b.id?'selected-bed':''}"><small class="bed-tag">BED ${b.id}</small><div style="margin-top:8px">${badge(b.status)}</div>${p&&state.authorized?`<div class="patient-id"><span class="id-avatar">${p.name.split(' ').map(n=>n[0]).join('')}</span><div><h3>${esc(p.name)}</h3><small>${p.id} · ${p.age} years</small></div></div><dl class="id-fields"><div><dt>Admitted</dt><dd>${p.admitted}</dd></div><div><dt>Assigned nurse</dt><dd>${team.find(s=>s.id===p.nurse).name}</dd></div><div><dt>Care state</dt><dd>${p.care}</dd></div></dl><button class="discharge-action" data-discharge="${p.id}">Discharge patient</button>`:p?'<p style="margin-top:8px">Patient identity hidden</p>':`<p style="margin-top:8px">${b.status==='Cleaning'?'Turnover in progress':'Ready for a new admission'}</p><button ${b.status==='Cleaning'?`class="ready-action" data-ready="${b.id}"`:'data-action="admit"'}>${b.status==='Cleaning'?'Mark bed ready':'Register patient'}</button>`}</div>`
  }).join('')}<label>Room care state<select id="care-state">${['Routine care','Round in progress','Handover requested'].map(v=>`<option ${r.care===v?'selected':''}>${v}</option>`).join('')}</select></label>`
}
function patientsPage(){
  const filtered=patients.filter(p=>(p.name+' '+p.id+' '+p.room).toLowerCase().includes(state.query.toLowerCase())),rows=filtered.map(p=>[`<span class="person-initial">${esc(p.name.split(' ').map(n=>n[0]).join(''))}</span><span class="person-name">${esc(p.name)}<small>${p.id} · ${p.age} years</small></span>`,`${p.bed}<small>Floor ${p.floor}</small>`,esc(team.find(s=>s.id===p.nurse).name),p.admitted]);
  return head('Patients',`${patients.length} active admissions`,`<button class="primary" data-action="admit">Register patient</button>`)+`<div class="work-page compact-register patients-register"><div class="toolbar"><label class="search-label"><input id="search" aria-label="Search patients" placeholder="Search name, ID or room" value="${esc(state.query)}"></label><button class="analytics-trigger" data-action="admission-flow">${illustration(0)}Admission flow</button><span class="result-count">${rows.length} patients</span></div>${table(['Patient','Bed / floor','Assigned nurse','Admitted'],rows,'Active inpatient register',filtered.map(p=>`data-room="${p.room}" data-bed="${p.bed}" tabindex="0" aria-label="Open record for ${esc(p.name)}, bed ${p.bed}" aria-description="Press Enter or Space to open patient details"`))}</div>`
}
function capacityContent(){
  return floors.map(f=>{
    const beds=rooms.filter(r=>r.floor===f.id).flatMap(r=>r.beds),occupied=beds.filter(b=>b.status==='Occupied').length;
    return `<div class="list-row"><div style="width:100%">Floor ${f.id} · ${f.name}<span style="float:right">${occupied} / ${beds.length} occupied</span><div class="bar-track"><div class="bar-fill" style="width:${occupied/beds.length*100}%"></div></div></div></div>`
  }).join('')
}
function bedsPage(){
  const filtered=rooms.flatMap(r=>r.beds.map(b=>({r,b}))).filter(({b,r})=>(state.filter==='All'||b.status===state.filter)&&(r.id+' '+r.ward).toLowerCase().includes(state.query.toLowerCase()));
  return head('Beds & rooms',`${count('Available')} available · ${count('Occupied')} occupied · ${count('Cleaning')} cleaning`)+`<div class="work-page compact-register beds-register"><div class="toolbar"><label class="search-label"><input id="search" aria-label="Search room or ward" value="${esc(state.query)}" placeholder="Search room or ward"></label><button class="analytics-trigger" data-action="capacity">${illustration(1)}Capacity by floor</button><label class="inline-filter"><span>Status</span><select id="bed-filter">${['All','Available','Occupied','Cleaning'].map(s=>`<option ${state.filter===s?'selected':''}>${s}</option>`).join('')}</select></label><span class="result-count">${filtered.length} beds</span></div>${table(['Bed / floor','Ward','Status'],filtered.map(({r,b})=>[`${b.id}<small>Floor ${r.floor}</small>`,r.ward,badge(b.status)]),'Bed readiness register',filtered.map(({r,b})=>`data-room="${r.id}" data-bed="${b.id}" tabindex="0" aria-label="Open bed ${b.id}, ${b.status}" aria-description="Press Enter or Space to view bed details and actions"`))}</div>`
}
function taskRow(t){
  const p=patients.find(p=>p.id===t.patient);
  return `<div class="list-row"><div class="${t.done?'task-complete':''}"><strong>${t.time}</strong> &nbsp; ${t.title}<p>${p?`Room ${p.room}`:'Patient discharged'} · ${team.find(s=>s.id===t.nurse).name}</p></div><label><input class="care-check" type="checkbox" data-task="${t.id}" ${t.done?'checked':''} aria-label="Mark ${t.title} at ${t.time} complete"></label></div>`
}
function schedulePage(){
  const days=state.calendarMode==='week'?[9,10,11,12,13,14,15]:[state.calendarDay];
  return head('Schedule','9–15 November 2026 · IST',`<div class="view-toggle"><button data-calendar-mode="day" aria-pressed="${state.calendarMode==='day'}">Day</button><button data-calendar-mode="week" aria-pressed="${state.calendarMode==='week'}">Week</button></div><button data-action="today">Today</button><button class="primary" data-action="new-task">Add task</button>`)+`<div class="work-page"><div class="calendar-shell"><div class="calendar ${days.length===1?'day-layout':''}" style="--days:${days.length}"><div class="cal-corner">IST</div>${days.map(d=>`<button class="cal-day ${d===state.calendarDay?'selected':''}" data-calendar-day="${d}"><small>${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d-9]}</small><strong>${d}</strong></button>`).join('')}<div class="time-axis">${Array.from({length:9},(_,i)=>`<span style="top:${i*72}px">${String(i+8).padStart(2,'0')}:00</span>`).join('')}</div>${days.map(d=>`<div class="cal-column ${d===14?'is-today':''}">${Array.from({length:8},(_,i)=>`<button class="time-slot" data-slot="${d},${i+8}" aria-label="Add task on ${d} November at ${i+8}:00"></button>`).join('')}${tasks.filter(t=>(t.day||14)===d).map(t=>{
    const [h,m]=t.time.split(':').map(Number),peers=tasks.filter(q=>(q.day||14)===d&&q.time===t.time),lane=peers.indexOf(t);
    return `<button class="calendar-event ${t.done?'is-done':''}" title="${esc(t.title)} · ${t.time}" style="top:${(h-8)*72+m*1.2}px;left:calc(${lane/peers.length*100}% + 4px);width:calc(${100/peers.length}% - 8px)" data-edit-task="${t.id}"><span>${t.time} ${t.done?' · Complete':''}</span><strong>${esc(t.title)}</strong><small>Room ${patients.find(p=>p.id===t.patient)?.room||'—'}</small></button>`
  }).join('')}</div>`).join('')}</div></div><div class="calendar-footer"><span><i class="dot"></i>${tasks.filter(t=>!t.done).length} pending tasks</span><span>Click a task to update it · Click a time slot to add</span><span>Day shift 07:00–15:00</span></div></div>`
}
function taskDialog(id=null,day=14,hour=9){
  const t=tasks.find(t=>t.id===id);
  state.taskId=id;
  $('#task-editor').innerHTML=`<form id="task-form"><div class="panel-head"><h2>${t?'Care task':'Add care task'}</h2><button type="button" data-action="close-task" aria-label="Close task">×</button></div><label>Task<input name="title" required maxlength="80" value="${esc(t?.title||'')}"></label><div class="form-pair"><label>November<select name="day">${[9,10,11,12,13,14,15].map(d=>`<option ${d===(t?.day||day)?'selected':''}>${d}</option>`).join('')}</select></label><label>Time<input name="time" type="time" min="08:00" max="15:30" step="1800" required value="${t?.time||String(hour).padStart(2,'0')+':00'}"></label></div><label>Assigned nurse<select name="nurse">${team.filter(s=>s.role==='Registered nurse').map(s=>`<option value="${s.id}" ${s.id===(t?.nurse||1)?'selected':''}>${s.name}</option>`).join('')}</select></label><label>Room / patient<select name="patient">${patients.map(p=>`<option value="${p.id}" ${p.id===t?.patient?'selected':''}>Room ${p.room} · ${esc(p.name)}</option>`).join('')}</select></label><label class="check-label"><input type="checkbox" name="done" ${t?.done?'checked':''}> Completed</label><button class="primary" type="submit">Save task</button></form>`;
  $('#task-editor').showModal()
}
function staffPage(){
  const staff=team.filter(s=>(state.staffFilter==='All'||(state.staffFilter==='On duty'?s.on:!s.on))&&(s.name+' '+s.role).toLowerCase().includes((state.staffQuery||'').toLowerCase()));
  return head('Staff',`${team.filter(s=>s.on).length} on duty · Day shift`)+`<div class="work-page compact-register"><div class="toolbar"><label class="search-label"><input id="staff-search" aria-label="Search staff" placeholder="Search name or role" value="${esc(state.staffQuery||'')}"></label><button class="analytics-trigger" data-action="coverage">${illustration(3)}Floor coverage</button><label class="inline-filter"><span>Status</span><select id="staff-filter">${['All','On duty','Upcoming'].map(s=>`<option ${state.staffFilter===s?'selected':''}>${s}</option>`).join('')}</select></label></div>${table(['Team member','Role / shift','Coverage','Assignment'],staff.map(s=>[`<span class="person-initial">${s.name.split(' ').filter(n=>n!=='Dr.').map(n=>n[0]).join('')}</span><span class="person-name">${s.name}<small>${s.on?'On duty':'Upcoming shift'}</small></span>`,`${s.role}<small>${s.shift}</small>`,`<label class="coverage-label"><select data-staff="${s.id}" aria-label="Assign floor for ${s.name}">${floors.map(f=>`<option value="${f.id}" ${s.floor===f.id?'selected':''}>${f.id} · ${f.name}</option>`).join('')}</select></label>`,s.role==='Registered nurse'?`${patients.filter(p=>p.nurse===s.id).length} patients assigned`:'Shared coverage']),'Staff roster')}</div>`
}
function reportData(){
  const selected=rooms.filter(r=>!state.reportFloor||r.floor===state.reportFloor),beds=selected.flatMap(r=>r.beds),pharmacies=selected.filter(r=>r.type==='pharmacy'),staff=team.filter(t=>(!state.reportFloor||t.floor===state.reportFloor)&&t.on),shift=flow.map(d=>{
    const v=state.reportFloor?d.byFloor[state.reportFloor-1]:d;
    return {label:d.label,admissions:v.admissions,discharges:v.discharges}
  });
  return{selected,beds,pharmacies,staff,shift,low:pharmacies.flatMap(r=>lowStock(r).map(item=>({r,item}))),calls:selected.filter(r=>r.call),resolved:callAudit.filter(a=>a.event==='Acknowledged'&&(!state.reportFloor||a.floor===state.reportFloor))}
}
function reportFlowChart(data){
  const max=Math.max(6,Math.ceil(Math.max(...data.map(d=>Math.max(d.admissions,d.discharges)))/2)*2),step=120/max;
  return `<svg class="chart interactive-chart" viewBox="0 0 540 190" role="group" aria-label="Hourly check-ins and check-outs. Select an hour for details.">${[0,max/2,max].map(n=>`<line x1="34" x2="520" y1="${150-n*step}" y2="${150-n*step}" stroke="#e1e9f1"/><text x="8" y="${154-n*step}">${n}</text>`).join('')}${data.map((d,i)=>`<g tabindex="0" role="button" data-report-hour="${i}" aria-label="${d.label}: ${d.admissions} check-ins, ${d.discharges} check-outs" aria-pressed="${state.reportHour===i}"><rect x="${40+i*80}" y="18" width="69" height="139" rx="5" fill="${state.reportHour===i?'#eaf3ff':'transparent'}"/><rect x="${54+i*80}" y="${150-d.admissions*step}" width="17" height="${d.admissions*step}" rx="2" fill="#508bc4"/><rect x="${76+i*80}" y="${150-d.discharges*step}" width="17" height="${d.discharges*step}" rx="2" fill="#7bc5b0"/><text x="${73+i*80}" y="177" text-anchor="middle">${d.label}</text></g>`).join('')}</svg>`
}
function reportsPage(){
  const d=reportData(),occupied=d.beds.filter(b=>b.status==='Occupied').length,available=d.beds.filter(b=>b.status==='Available').length,cleaning=d.beds.filter(b=>b.status==='Cleaning').length,scope=state.reportFloor?'Floor '+state.reportFloor:'All floors',bin=d.shift[state.reportHour],stockRows=(state.stockOnlyLow?d.pharmacies.filter(r=>lowStock(r).length):d.pharmacies),roles=[['Registered nurse','Nurses','#75a5d3'],['Duty physician','Doctors','#a494c7'],['Care assistant','Care assistants','#81bfa6'],['Floor administrator','Administrators','#a4b6c7']];
  const alloc=(n,f)=>{
    const weights=floors.map(fl=>rooms.filter(r=>r.floor===fl.id).flatMap(r=>r.beds).filter(b=>b.status==='Occupied').length),total=weights.reduce((a,b)=>a+b,0),first=Math.round(n*weights[0]/total),second=Math.round(n*weights[1]/total);
    return [first,second,n-first-second][f-1]
  };
  const history=[...trend.map(t=>state.reportFloor?alloc(t.occupied,state.reportFloor):t.occupied),occupied];
  return head('Reports',`${scope} · Capacity, movement, stock and care activity`,`<label class="report-scope"><select id="report-floor" aria-label="Report floor"><option value="0">All floors</option>${floors.map(f=>`<option value="${f.id}" ${state.reportFloor===f.id?'selected':''}>Floor ${f.id} · ${f.name}</option>`).join('')}</select></label><button class="export-link" data-action="export"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M10 2v10m-4-4 4 4 4-4M4 14v3h12v-3"/></svg><span>Export bed data</span></button>`)+`<div class="work-page reports-workspace"><section class="report-numbers" aria-label="Operations summary"><div><span>Bed occupancy</span><strong>${Math.round(occupied/d.beds.length*100)}<small>%</small></strong><p>${occupied} of ${d.beds.length} beds</p></div><div><span>Ready for admission</span><strong>${available}</strong><p>${cleaning} beds in turnover</p></div><div class="number-amber"><span>Stock attention</span><strong>${d.low.length}</strong><p>medicine lines below minimum</p></div><div class="number-coral"><span>Open nurse calls</span><strong>${d.calls.length}</strong><p>${d.resolved.length} acknowledged this session</p></div></section><div class="report-grid"><section class="report-surface"><div class="report-heading"><div><h2>Capacity over time</h2><p>Occupied beds · 8–14 November</p></div><span class="report-tag">${scope}</span></div>${lineChart(history,[...trend.map(t=>t.day),'14 Nov'],d.beds.length)}<div class="capacity-breakdown"><span><i style="background:#0aab2a"></i>${occupied} occupied</span><span><i style="background:#a8cce8"></i>${available} available</span><span><i style="background:#d9c697"></i>${cleaning} cleaning</span></div></section><section class="report-surface"><div class="report-heading"><div><h2>Check-in & check-out</h2><p>Today's shift · click an hour to inspect</p></div><span class="report-tag">07:00–12:00</span></div>${reportFlowChart(d.shift)}<div class="flow-inspection"><strong>${bin.label}</strong><span><i style="background:#508bc4"></i>${bin.admissions} check-ins</span><span><i style="background:#7bc5b0"></i>${bin.discharges} check-outs</span></div></section><section class="report-surface"><div class="report-heading"><div><h2>Pharmacy readiness</h2><p>${d.pharmacies.length} medicine rooms · ${d.low.length} low-stock lines</p></div><button class="report-toggle" data-action="low-stock" aria-pressed="${state.stockOnlyLow}">${state.stockOnlyLow?'Show all':'Needs stock'}</button></div><div class="stock-report-list">${stockRows.length?stockRows.map(r=>{
    const healthy=r.inventory.length-lowStock(r).length;
    return `<button class="stock-report-room" data-room="${r.id}"><span class="stock-room-id">F${r.floor} / P${r.index+1}</span><span class="stock-report-track"><i style="width:${healthy/r.inventory.length*100}%;background:${healthy===r.inventory.length?'#77b792':'#e3b063'}"></i></span><span>${healthy} / ${r.inventory.length} ready</span></button>`
  }).join(''):'<p class="report-empty">All medicine lines meet their stock minimum.</p>'}</div><div class="report-foot">Select a medicine room to inspect inventory and request replenishment.</div></section><section class="report-surface"><div class="report-heading"><div><h2>Care team coverage</h2><p>On duty · current floor assignments</p></div><span class="report-total">${d.staff.length}<small>people</small></span></div><div class="team-chart">${roles.map(([role,label,color])=>{
    const n=d.staff.filter(s=>s.role===role).length;
    return `<div class="team-chart-row"><span>${label}</span><div class="team-dot-row">${Array.from({length:n},()=>`<i style="background:${color}"></i>`).join('')}${!n?'<small>No coverage assigned</small>':''}</div><strong>${n}</strong></div>`
  }).join('')}</div><div class="report-foot"><button data-go="staff">View staff assignments</button></div></section><section class="report-surface urgent-report"><div class="report-heading"><div><h2>Urgent care coordination</h2><p>Active nurse calls and session acknowledgements</p></div><span class="report-tag coral-tag">${d.calls.length} active</span></div>${d.calls.length?d.calls.map(r=>`<button class="urgent-report-row" data-room="${r.id}"><span class="urgent-dot"></span><strong>${r.id}</strong><span>${r.ward}</span><small>Awaiting acknowledgement</small></button>`).join(''):'<p class="report-empty">No active nurse calls in this scope.</p>'}<div class="report-foot">${d.resolved.length?d.resolved.length+' calls acknowledged this session.':'No calls acknowledged in this session.'}</div></section><section class="report-surface"><div class="report-heading"><div><h2>Stock watchlist</h2><p>Lines needing replenishment</p></div><span class="report-tag amber-tag">${d.low.length} lines</span></div><div class="stock-watchlist">${d.low.length?d.low.slice(0,6).map(({r,item})=>`<button data-room="${r.id}" class="watchlist-row"><span><strong>${item.name}</strong><small>F${r.floor} / P${r.index+1}</small></span><span class="${item.quantity===0?'empty-stock':''}"><b>${item.quantity}</b> / ${item.min}<small>${item.unit} · minimum</small></span></button>`).join(''):'<p class="report-empty">No low-stock medicine lines in this scope.</p>'}</div></section></div></div>`
}
function closeDetail(focus=true){
  let id=state.room;
  state.room=null;
  document.querySelectorAll('.room-label-overlay').forEach(label=>label.dataset.selected='false');
  document.querySelectorAll('tr[data-room]').forEach(r=>r.classList.remove('is-selected'));
  document.querySelectorAll('.room').forEach(r=>r.setAttribute('aria-pressed','false'));
  retirePanel(detailPanel,()=>{
    if(state.room===null){
      detailPanel.hidden=true;
      document.querySelector('.map-shell')?.classList.remove('has-room-detail')
    }
  });
  document.querySelectorAll('.directory-select').forEach(b=>{
    b.classList.remove('is-selected');
    b.setAttribute('aria-pressed','false')
  });
  if(focus)document.querySelector(`[data-room="${id}"]`)?.focus()
}
function openRoom(id,bedId=null){
  detailPanel.getAnimations().forEach(a=>a.cancel());
  detailPanel.classList.remove('is-closing');
  if(state.metric!==null){
    state.metric=null;
    insightPanel.hidden=true;
    renderDock()
  }
  const previousRoom=state.room;
  state.room=id;
  state.selectedBed=bedId;
  syncRoomSelection();
  document.querySelectorAll('tr[data-room]').forEach(r=>r.classList.toggle('is-selected',r.dataset.room===id&&(!bedId||r.dataset.bed===bedId)));
  document.querySelectorAll('.room').forEach(r=>r.setAttribute('aria-pressed',r.dataset.room===id));
  renderDetail();
  $('#detail').scrollTop=0;
  $('#detail-title').focus({preventScroll:true});
  if(previousRoom&&previousRoom!==id&&!reducedMotion())detailPanel.animate([{opacity:.55},{opacity:1}],{duration:220,easing:'cubic-bezier(.2,.7,.2,1)'})
}
function setFloor(f){
  state.floor=+f;
  closeDetail(false);
  render();
  animateMap()
}
function animateMap(){
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.querySelector('.map-art')?.animate([{opacity:.35,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'cubic-bezier(.2,.7,.2,1)'})
}
function showAdmission(){
  let available=rooms.flatMap(r=>r.beds.filter(b=>b.status==='Available').map(b=>({r,b})));
  if(!available.length){
    notify('No available beds. Complete room turnover first.');
    return
  }
  $('#admission select').innerHTML=available.map(({r,b})=>`<option value="${b.id}" ${(state.selectedBed?b.id===state.selectedBed:r.id===state.room)?'selected':''}>${b.id} · ${r.ward}</option>`).join('');
  $('#admission').showModal()
}
function downloadCSV(){
  const csv='Bed,Floor,Ward,Status\r\n'+rooms.filter(r=>state.page!=='reports'||!state.reportFloor||r.floor===state.reportFloor).flatMap(r=>r.beds.map(b=>`${b.id},${r.floor},${r.ward},${b.status}`)).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
  a.href=url;
  a.download='Aspatal-capacity-2026-11-14.csv';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  notify('Capacity report exported. Patient details excluded.')
}
document.addEventListener('click',e=>{
  const personTarget=e.target.closest('.scene-person[data-contact]');
  if(personTarget){
    openContact(+personTarget.dataset.contact);
    return
  }
  const roomTarget=e.target.closest('.room[data-room],.room-label-overlay[data-room],tr[data-room]');
  if(roomTarget){
    openRoom(roomTarget.dataset.room,roomTarget.dataset.bed||null);
    return
  }
  const hour=e.target.closest('[data-report-hour]');
  if(hour){
    state.reportHour=+hour.dataset.reportHour;
    render();
    return
  }
  const b=e.target.closest('button');
  if(!b)return;
  if(b.dataset.contact){
    openContact(+b.dataset.contact);
    return
  }
  if(b.dataset.roomFilter){
    captureSegment('rooms',document.querySelector('.room-filters'));
    state.roomFilter=b.dataset.roomFilter;
    closeDetail(false);
    render();
    return
  }
  if(b.dataset.restock){
    const r=rooms.find(r=>r.id===state.room),item=r?.inventory.find(i=>i.id===b.dataset.restock);
    if(item){
      item.requested=true;
      item.requestQty=item.target-item.quantity;
      render();
      notify('Replenishment requested for '+item.name+'.')
    }
    return
  }
  if(b.dataset.receive){
    const r=rooms.find(r=>r.id===state.room),item=r?.inventory.find(i=>i.id===b.dataset.receive);
    if(item&&item.requested){
      item.quantity+=item.requestQty;
      item.requested=false;
      item.requestQty=0;
      render();
      notify('Receipt recorded. Stock updated.')
    }
    return
  }
  if(b.dataset.mapMode){
    morphMap(b.dataset.mapMode);
    return
  }
  if(b.dataset.calendarMode){
    state.calendarMode=b.dataset.calendarMode;
    render();
    return
  }
  if(b.dataset.calendarDay){
    state.calendarDay=+b.dataset.calendarDay;
    state.calendarMode='day';
    render();
    return
  }
  if(b.dataset.editTask){
    taskDialog(+b.dataset.editTask);
    return
  }
  if(b.dataset.slot){
    const [d,h]=b.dataset.slot.split(',').map(Number);
    taskDialog(null,d,h);
    return
  }
  if(b.dataset.room){
    openRoom(b.dataset.room);
    return
  }
  if(b.dataset.floor){
    setFloor(b.dataset.floor);
    return
  }
  if(b.dataset.go){
    location.hash=b.dataset.go;
    return
  }
  if(b.dataset.metric!==undefined){
    if(state.room)closeDetail(false);
    state.unread.delete(+b.dataset.metric);
    state.metric=state.metric===+b.dataset.metric?null:+b.dataset.metric;
    renderDock();
    if(state.metric===null)retirePanel(insightPanel,()=>{
      if(state.metric===null)insightPanel.hidden=true
    });
    else{
      insightPanel.getAnimations().forEach(a=>a.cancel());
      insightPanel.classList.remove('is-closing');
      renderMetric()
    }
    return
  }
  if(b.dataset.ready){
    const bed=allBeds().find(x=>x.id===b.dataset.ready);
    bed.status='Available';
    render();
    notify('Bed '+bed.id+' is ready for admission.');
    return
  }
  if(b.dataset.discharge){
    let p=patients.find(p=>p.id===b.dataset.discharge);
    const bed=allBeds().find(b=>b.patientId===p.id);
    flow.at(-1).discharges++;
    flow.at(-1).byFloor[p.floor-1].discharges++;
    state.unread.add(0);
    state.unread.add(1);
    bed.status='Cleaning';
    bed.patientId=null;
    patients.splice(patients.indexOf(p),1);
    render();
    notify('Discharge recorded. Bed requires cleaning.');
    return
  }
  switch(b.dataset.action){
    case'toggle-panels':state.panelsHidden=!state.panelsHidden;
    syncPanelVisibility();
    syncCamera();
    break;
    case'theme':setTheme(preferences.theme==='dark'?'light':'dark');
    break;
    case'logout':signOut();
    break;
    case'close-contact':dismissDialog($('#contact-card'));
    break;
    case'low-stock':state.stockOnlyLow=!state.stockOnlyLow;
    render();
    break;
    case'capacity':$('#analytics').innerHTML=`<div class="panel-head"><h2>Capacity by floor</h2><button data-action="close-analytics" aria-label="Close capacity">×</button></div>${capacityContent()}`;
    $('#analytics').showModal();
    break;
    case'coverage':$('#analytics').innerHTML=`<div class="panel-head"><h2>Floor coverage</h2><button data-action="close-analytics" aria-label="Close coverage">×</button></div>${floors.map(f=>`<div class="list-row"><span>Floor ${f.id} · ${f.name}</span><strong>${team.filter(s=>s.floor===f.id&&s.on).length} on duty</strong></div>`).join('')}`;
    $('#analytics').showModal();
    break;
    case'admission-flow':$('#analytics').innerHTML=`<div class="panel-head"><h2>Admission flow</h2><button data-action="close-analytics" aria-label="Close admission flow">×</button></div><p class="muted">Today · 07:00–12:00 IST</p>${flowChart()}<p class="hint">Green: admissions · Gray: discharges</p>`;
    $('#analytics').showModal();
    break;
    case'close-analytics':dismissDialog($('#analytics'));
    break;
    case'new-task':taskDialog(null,state.calendarDay);
    break;
    case'close-task':dismissDialog($('#task-editor'));
    break;
    case'today':state.calendarDay=14;
    render();
    break;
    case'close-detail':closeDetail();
    break;
    case'close-metric':{
      const i=state.metric;
      state.metric=null;
      retirePanel(insightPanel,()=>{
        if(state.metric===null)insightPanel.hidden=true
      });
      renderDock();
      document.querySelector(`[data-metric="${i}"]`).focus();
      break
    }
    case'authorize':state.authorized=true;
    render();
    if(state.room)$('#detail-title').focus();
    notify('Care view opened.');
    break;
    case'toggle-call':{
      let r=rooms.find(r=>r.id===state.room);
      r.call=!r.call;
      callAudit.push({room:r.id,floor:r.floor,event:r.call?'Raised':'Acknowledged'});
      render();
      notify(r.call?'Nurse call raised.':'Nurse call acknowledged.');
      break
    }
    case'admit':showAdmission();
    break;
    case'close-admission':dismissDialog($('#admission'));
    break;
    case'zoom-in':state.zoom=Math.min(1.8,state.zoom+.15);
    syncCamera();
    break;
    case'zoom-out':state.zoom=Math.max(.55,state.zoom-.15);
    syncCamera();
    break;
    case'reset-map':state.zoom=1;
    state.panX=state.panY=0;
    syncCamera();
    break;
    case'export':downloadCSV();
    break;
  }
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(document.querySelector('dialog[open]')||!$('#account-menu')?.hidden)return;
    if(!$('#admission').open){
      if(state.room)closeDetail();
      else if(state.metric!==null){
        let i=state.metric;
        state.metric=null;
        retirePanel(insightPanel,()=>{
          if(state.metric===null)insightPanel.hidden=true
        });
        renderDock();
        document.querySelector(`[data-metric="${i}"]`)?.focus()
      }
    }
  }
  if((e.target.classList.contains('room')||e.target.matches('tr[data-room]'))&&(e.key==='Enter'||e.key===' ')){
    e.preventDefault();
    openRoom(e.target.dataset.room,e.target.dataset.bed||null)
  }
});
document.addEventListener('input',e=>{
  if(e.target.id==='staff-search'){
    let pos=e.target.selectionStart;
    state.staffQuery=e.target.value;
    $('#main').innerHTML=staffPage();
    $('#staff-search').focus();
    $('#staff-search').setSelectionRange(pos,pos);
    return
  }
  if(e.target.id==='rotation'){
    state.rotation=+e.target.value;
    document.querySelector('.map-art').outerHTML=mapSVG();
    return
  }
  if(e.target.id==='search'){
    let start=e.target.selectionStart;
    state.query=e.target.value;
    $('#main').innerHTML=state.page==='patients'?patientsPage():bedsPage();
    $('#search').focus();
    $('#search').setSelectionRange(start,start)
  }
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='settings-theme'){
    setTheme(t.checked?'dark':'light');
    return
  }
  if(t.id==='settings-alerts'){
    preferences.alerts=t.checked;
    savePreference('alerts',preferences.alerts);
    render();
    notify('Notification preference saved.');
    return
  }
  if(t.id==='settings-floor'){
    preferences.floor=+t.value;
    savePreference('floor',preferences.floor);
    notify('Default floor saved.');
    return
  }
  if(t.id==='login-role'){
    state.loginRole=t.value;
    $('#login-error').hidden=true;
    $('#login-role-state').textContent=t.value==='coordinator'?'Ananya Kapoor · Care coordinator access':'This role requires a different workspace permission.';
    return
  }
  if(t.id==='report-floor'){
    state.reportFloor=+t.value;
    closeDetail(false);
    render();
    return
  }
  if(t.id==='floor')setFloor(t.value);
  if(t.id==='bed-filter'){
    state.filter=t.value;
    render()
  }
  if(t.id==='staff-filter'){
    state.staffFilter=t.value;
    render()
  }
  if(t.id==='care-state'){
    rooms.find(r=>r.id===state.room).care=t.value;
    render();
    notify('Room care state updated.')
  }
  if(t.dataset.task){
    tasks.find(x=>x.id===+t.dataset.task).done=t.checked;
    render();
    notify(t.checked?'Coordination task completed.':'Coordination task reopened.')
  }
  if(t.dataset.staff){
    let s=team.find(s=>s.id===+t.dataset.staff);
    s.floor=+t.value;
    state.unread.add(3);
    render();
    notify(s.name+' coverage moved to Floor '+s.floor+'. Patient assignments retained.')
  }
});
$('#admit-form').addEventListener('submit',e=>{
  e.preventDefault();
  const form=new FormData(e.target),name=String(form.get('name')).trim();
  if(!name){
    e.target.elements.name.setCustomValidity('Enter a patient name.');
    e.target.elements.name.reportValidity();
    return
  }
  e.target.elements.name.setCustomValidity('');
  const room=rooms.find(r=>r.beds.some(b=>b.id===form.get('bed'))),bed=room.beds.find(b=>b.id===form.get('bed'));
  if(bed.status!=='Available'){
    notify('This bed is no longer available. Choose another.');
    return
  }
  let id='AG-'+(1041+pi++);
  patients.push({id,name,age:+form.get('age'),bed:bed.id,room:room.id,floor:room.floor,nurse:(room.floor-1)*2+1,admitted:'14 Nov 2026',care:'Admission handover pending'});
  state.unread.add(0);
  state.unread.add(1);
  flow.at(-1).admissions++;
  flow.at(-1).byFloor[room.floor-1].admissions++;
  bed.patientId=id;
  bed.status='Occupied';
  state.authorized=true;
  dismissDialog($('#admission'));
  e.target.reset();
  render();
  notify('Patient registered in bed '+bed.id+'.')
});
$('#admit-form input[name=name]').addEventListener('input',e=>e.target.setCustomValidity(''));
window.addEventListener('hashchange', () => navigateWorkspace(location.hash.slice(1)));
state.page=routes.includes(location.hash.slice(1))?location.hash.slice(1):'overview';
console.assert(allBeds().length===144,'Total bed capacity must be 144');
console.assert(count('Occupied')===patients.length,'Patient / bed totals must reconcile');
render();
document.addEventListener('submit',e=>{
  if(e.target.id!=='task-form')return;
  e.preventDefault();
  const f=new FormData(e.target),data={title:String(f.get('title')).trim(),day:+f.get('day'),time:f.get('time'),nurse:+f.get('nurse'),patient:f.get('patient'),done:f.has('done')};
  if(!data.title)return;
  const t=tasks.find(t=>t.id===state.taskId);
  if(t)Object.assign(t,data);
  else tasks.push({id:Math.max(...tasks.map(t=>t.id))+1,...data});
  state.unread.add(2);
  dismissDialog($('#task-editor'));
  render();
  notify('Care schedule updated.')
});
let morphFrame;
function morphMap(mode){
  cancelAnimationFrame(morphFrame);
  const from=state.blend,to=mode==='2d'?1:0;
  state.mapMode=mode;
  document.querySelectorAll('[data-map-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mapMode===mode));
  slideSegment(document.querySelector('.map-tools>.view-toggle'),document.querySelector('.map-tools [data-map-mode][aria-pressed="true"]'),'map-mode');
  const start=performance.now(),duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:720;
  function tick(now){
    const t=duration?Math.min(1,(now-start)/duration):1,e=t*t*(3-2*t);
    state.blend=from+(to-from)*e;
    const map=document.querySelector('.map-art');
    if(!map)return;
    map.outerHTML=mapSVG();
    if(t<1)morphFrame=requestAnimationFrame(tick)
  }
  morphFrame=requestAnimationFrame(tick)
}
function directoryRoom(r){
  if(r.type==='pharmacy')return pharmacyDirectoryRow(r);
  const people=r.beds.map(b=>patients.find(p=>p.id===b.patientId)).filter(Boolean),available=r.beds.some(b=>b.status==='Available'),names=people.length?people.map(p=>p.name).join(' · '):available?'Room available':'Room turnover';
  return `<div class="directory-room"><button class="directory-select" data-room="${r.id}" aria-label="Room ${r.id}, ${esc(names)}${r.call?', nurse call':''}"><span class="directory-heading"><strong>${r.id}</strong><span class="directory-status">${people.length?'<span class="status">Occupied</span>':''}${r.call?'<span class="status red" title="Nurse call active">Nurse call</span>':''}${available?'<span class="status green">Available</span>':''}</span></span><small title="${esc(names)}">${esc(names)}</small></button></div>`
}

// Pointer capture stays on the stable map shell while SVG geometry is redrawn.
let floorDrag = null, suppressRoomClickUntil = 0;
const touchPointers = new Map();
let touchGesture = null;
function touchPair() {
  const [first, second] = [...touchPointers.values()];
  return { x:(first.x+second.x)/2, y:(first.y+second.y)/2, distance:Math.hypot(second.x-first.x,second.y-first.y), angle:Math.atan2(second.y-first.y,second.x-first.x)*180/Math.PI };
}
document.addEventListener('pointerdown', event => {
  const shell = event.target.closest('.map-shell'), map = event.target.closest('.map-art');
  if (!shell || !map || ![0,1,2].includes(event.button)) return;
  if (event.pointerType === 'touch') {
    touchPointers.set(event.pointerId, {x:event.clientX,y:event.clientY});
    shell.setPointerCapture(event.pointerId);
    if (touchPointers.size === 2) {
      touchGesture = {...touchPair(), rotation:state.rotation, zoom:state.zoom, panX:state.panX, panY:state.panY, unit:map.getScreenCTM()?.a||1};
      floorDrag = null;
      return;
    }
  }
  floorDrag = {shell,id:event.pointerId,x:event.clientX,y:event.clientY,angle:state.rotation,panX:state.panX,panY:state.panY,scale:map.getScreenCTM()?.a||1,rotate:event.shiftKey||event.button!==0,moved:false};
});
document.addEventListener('pointermove', event => {
  if (!touchPointers.has(event.pointerId) || !touchGesture) return;
  touchPointers.set(event.pointerId, {x:event.clientX,y:event.clientY});
  const current = touchPair(), base = touchGesture;
  state.rotation = (base.rotation + current.angle - base.angle + 360) % 360;
  state.zoom = Math.max(.55, Math.min(1.8, base.zoom * current.distance / Math.max(1,base.distance)));
  state.panX = base.panX + (current.x-base.x)/base.unit;
  state.panY = base.panY + (current.y-base.y)/base.unit;
  suppressRoomClickUntil = performance.now()+250;
  const map = document.querySelector('.map-art');
  if (map) map.outerHTML = mapSVG();
});
function releaseTouch(event) {
  touchPointers.delete(event.pointerId);
  if (touchPointers.size < 2) touchGesture = null;
  if (event.pointerType === 'touch') {
    if(floorDrag?.moved)suppressRoomClickUntil=performance.now()+250;
    floorDrag=null;
  }
}
document.addEventListener('pointerup', releaseTouch);
document.addEventListener('pointercancel', releaseTouch);
document.addEventListener('contextmenu',e=>{
  if(e.target.closest('.map-art'))e.preventDefault()
});
document.addEventListener('pointermove',e=>{
  if(!floorDrag||e.pointerId!==floorDrag.id)return;
  const d=floorDrag,dx=e.clientX-d.x,dy=e.clientY-d.y;
  if(Math.hypot(dx,dy)<5&&!d.moved)return;
  d.moved=true;
  d.shell.setPointerCapture(e.pointerId);
  d.shell.classList.add('is-rotating');
  d.shell.classList.toggle('is-panning',!d.rotate);
  if(d.rotate){
    state.rotation=(d.angle+dx*.45+360)%360;
    const map=document.querySelector('.map-art');
    if(map)map.outerHTML=mapSVG()
  }else{
    state.panX=Math.max(-1400,Math.min(1400,d.panX+dx/d.scale));
    state.panY=Math.max(-1100,Math.min(1100,d.panY+dy/d.scale));
    syncCamera()
  }
});
function endFloorDrag(){
  if(!floorDrag)return;
  if(floorDrag.moved)suppressRoomClickUntil=performance.now()+200;
  floorDrag.shell.classList.remove('is-rotating','is-panning');
  if(floorDrag.shell.hasPointerCapture(floorDrag.id))floorDrag.shell.releasePointerCapture(floorDrag.id);
  floorDrag=null
}
document.addEventListener('pointerup',endFloorDrag);
document.addEventListener('pointercancel',endFloorDrag);
document.addEventListener('click',e=>{
  if(performance.now()<suppressRoomClickUntil&&e.target.closest('.map-shell')){
    e.stopImmediatePropagation();
    e.preventDefault()
  }
},true);
document.addEventListener('keydown',e=>{
  if(!e.target.classList.contains('map-art')||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;
  e.preventDefault();
  if(e.key==='Home'){
    state.rotation=state.panX=state.panY=0;
    state.zoom=1
  }else if(e.shiftKey&&['ArrowLeft','ArrowRight'].includes(e.key)){
    state.rotation=(state.rotation+(e.key==='ArrowRight'?10:-10)+360)%360
  }else{
    state.panX+=e.key==='ArrowRight'?40:e.key==='ArrowLeft'?-40:0;
    state.panY+=e.key==='ArrowDown'?40:e.key==='ArrowUp'?-40:0
  }
  const map=document.querySelector('.map-art');
  map.outerHTML=mapSVG();
  document.querySelector('.map-art').focus({preventScroll:true})
});
document.addEventListener('toggle',e=>{
  if(e.target.matches('.room-directory'))state.directoryOpen=e.target.open
},true);
function roomDirectory(){
  const phone=matchMedia('(max-width:700px)').matches,dot=floorRooms().some(r=>r.call)?'<span class="floor-call-dot" role="img" aria-label="Active nurse call on this floor"></span>':'',filter=`<div class="room-filters" role="group" aria-label="Room category">${[['all','All rooms'],['patients','Patients'],['pharmacy','Pharmacy']].map(([key,label])=>`<button data-room-filter="${key}" aria-pressed="${state.roomFilter===key}">${label}${key==='pharmacy'&&floorRooms().some(r=>r.type==='pharmacy'&&lowStock(r).length)?'<i class="stock-dot" aria-label="Stock attention needed"></i>':''}</button>`).join('')}</div>`,rows=`${filter}<div class="room-list-count">${visibleRooms().length} rooms · Floor ${state.floor}</div><div class="directory-grid">${visibleRooms().map((r,i)=>`${state.roomFilter==='all'&&r.type==='pharmacy'&&visibleRooms()[i-1]?.type!=='pharmacy'?'<div class="directory-divider"><span>Pharmacy</span></div>':''}${directoryRoom(r)}`).join('')}</div>`;
  return phone?`<details class="room-directory" ${state.directoryOpen?'open':''}><summary>Rooms ${dot}</summary>${rows}</details>`:`<section class="room-directory" aria-label="Rooms"><h3>Rooms ${dot}</h3>${rows}</section>`
}
function placeDock(){
  const host=state.page==='overview'?document.querySelector('.map-shell'):document.body;
  host?.append(insightDock,insightPanel,detailPanel);
  syncPanelVisibility();
  syncCamera()
}
let mapOnPhone=matchMedia('(max-width:700px)').matches;
window.addEventListener('resize',()=>{
  const phone=matchMedia('(max-width:700px)').matches;
  if(phone!==mapOnPhone&&state.page==='overview'){
    $('#main').innerHTML=overview();
    placeDock();
    renderDock();
    renderDetail();
    if(state.room)syncRoomSelection()
  }
  mapOnPhone=phone
});
function pharmacyDirectoryRow(r){
  const low=lowStock(r).length;
  return `<div class="directory-room pharmacy-entry"><button class="directory-select" data-room="${r.id}"><span class="directory-heading"><strong>P${r.index+1}</strong><span class="status ${low?'amber':'green'}">${low?'Stock needed':'Operating'}</span></span><small>${r.name} · ${low?low+' low stock':r.inventory.length+' stocked lines'}</small></button></div>`
}
function renderPharmacy(r){
  const low=lowStock(r),requested=r.inventory.filter(i=>i.requested).length;
  $('#detail').innerHTML=`<div class="panel-head"><div><small>Floor ${r.floor} · Pharmacy P${r.index+1}</small><h2 id="detail-title" tabindex="-1">${r.name}</h2></div><button data-action="close-detail" aria-label="Close pharmacy details">×</button></div><div class="pharmacy-banner ${low.length?'needs-stock':''}"><span class="pharmacy-cross" aria-hidden="true">+</span><div><strong>${pharmacyState(r)}</strong><small>${r.inventory.length} stock lines · ${low.length} need attention</small></div></div><div class="pharmacy-summary"><span><strong>${r.inventory.filter(i=>i.quantity>0).length}</strong>Available lines</span><span><strong>${requested}</strong>Requests pending</span></div><h3 class="inventory-heading">Medicine inventory</h3>${r.inventory.map(i=>`<article class="inventory-row"><div class="inventory-name"><strong>${i.name}</strong><span class="status ${i.quantity<i.min?'amber':'green'}">${i.quantity===0?'Out of stock':i.quantity<i.min?'Low stock':'In stock'}</span></div><p><b>${i.quantity}</b> ${i.unit} <span>· Reorder below ${i.min}</span></p>${i.requested?`<div class="request-line"><small>${i.requestQty} ${i.unit} requested</small><button data-receive="${i.id}">Record receipt</button></div>`:i.quantity<i.min?`<button class="restock-action" data-restock="${i.id}">Request restock · ${i.target-i.quantity} ${i.unit}</button>`:''}</article>`).join('')}<p class="inventory-footnote">Stock quantities and replenishment requests are managed per room.</p>`
}
document.addEventListener('keydown',e=>{
  const hour=e.target.closest('[data-report-hour]');
  if(hour&&(e.key==='Enter'||e.key===' ')){
    e.preventDefault();
    state.reportHour=+hour.dataset.reportHour;
    render()
  }
});
function syncRoomSelection(){
  document.querySelectorAll('.room-label-overlay').forEach(label=>label.dataset.selected=String(label.dataset.room===state.room));
  const shell=document.querySelector('.map-shell');
  if(shell){
    shell.classList.add('has-room-detail');
    const directory=shell.querySelector('details.room-directory');
    if(directory){
      directory.open=true;
      state.directoryOpen=true
    }
    shell.querySelectorAll('.directory-select').forEach(b=>{
      const selected=b.dataset.room===state.room;
      b.classList.toggle('is-selected',selected);
      b.setAttribute('aria-pressed',selected?'true':'false')
    });
    const target=shell.querySelector(`.directory-select[data-room="${state.room}"]`),grid=shell.querySelector('.directory-grid');
    if(target&&grid){
      const row=target.closest('.directory-room'),top=row.offsetTop-grid.offsetTop;
      if(top<grid.scrollTop)grid.scrollTop=top;
      else if(top+row.offsetHeight>grid.scrollTop+grid.clientHeight)grid.scrollTop=top+row.offsetHeight-grid.clientHeight
    }
  }
}
document.addEventListener('pointerover',e=>{
  const t=e.target.closest('.room[data-room],.room-label-overlay[data-room],.directory-select[data-room]');
  if(!t)return;
  document.querySelectorAll('.room.is-hovered,.room-label-overlay.is-hovered,.directory-select.is-hovered').forEach(x=>x.classList.remove('is-hovered'));
  document.querySelectorAll(`.room[data-room="${t.dataset.room}"],.room-label-overlay[data-room="${t.dataset.room}"],.directory-select[data-room="${t.dataset.room}"]`).forEach(x=>x.classList.add('is-hovered'))
});
document.addEventListener('pointerout',e=>{
  const t=e.target.closest('.room[data-room],.room-label-overlay[data-room],.directory-select[data-room]');
  if(t&&!e.relatedTarget?.closest?.(`[data-room="${t.dataset.room}"]`))document.querySelectorAll('.room.is-hovered,.room-label-overlay.is-hovered,.directory-select.is-hovered').forEach(x=>x.classList.remove('is-hovered'))
});
function floorContacts(){
  const f=floors[state.floor-1];
  return `<section class="floor-charge-card" aria-labelledby="floor-charge-title"><h3 id="floor-charge-title">Floor in charge</h3><div class="floor-contacts" aria-label="Floor contacts">${[['Floor SPOC',f.spoc],['Doctor on duty',f.doctor],['Administrator',f.admin]].map(([label,id])=>{
    const t=team.find(t=>t.id===id);
    return `<div class="floor-contact"><span>${label}</span><button data-contact="${id}" aria-describedby="contact-tip-${id}">${t.name}</button><div class="contact-hover" id="contact-tip-${id}" role="tooltip"><strong>${t.name}</strong><small>${t.role} · ${t.shift}</small><span>${t.email}</span><span>Extension ${t.extension}</span></div></div>`
  }).join('')}</div></section>`
}
function openContact(id){
  const t=team.find(t=>t.id===id);
  $('#contact-card').innerHTML=`<div class="panel-head"><div><small>Floor ${t.floor} · ${floors[t.floor-1].name}</small><h2>${t.name}</h2></div><button data-action="close-contact" aria-label="Close contact details">×</button></div><div class="contact-identity"><span class="avatar">${t.name.replace('Dr. ','').split(' ').map(n=>n[0]).join('')}</span><div><strong>${t.role}</strong><small>${t.on?'On duty':'Upcoming shift'} · ${t.shift}</small></div></div><dl class="contact-fields"><div><dt>Email</dt><dd><a href="mailto:${t.email}">${t.email}</a></dd></div><div><dt>Internal extension</dt><dd>${t.extension}</dd></div><div><dt>Shift</dt><dd>${t.shift} IST</dd></div></dl>`;
  $('#contact-card').showModal()
}
function darkMap(markup){
  const palette={'#f8fbfd':'#26322b','#d3dfe9':'#44574a','#e3edf6':'#34483b','#85ad9c':'#5eaa7c','#e8f0ec':'#141f19','#bed5c6':'#355c40','#7c9387':'#7b9b85','#fcfdff':'#526155','#f6f9fc':'#425247','#dce4ec':'#334137','#c6d2de':'#243329','#fff1d7':'#4a3a21','#e7f5df':'#294a30','#fff0ed':'#47312d','#edf7ee':'#274632','#f3f7fb':'#2b3831','#e6edda':'#4e5e3e','#e7c98e':'#927544','#b7d6b5':'#5a8960','#ffffff':'#b9c9bd','#b96e1f':'#efba69','#3d8e56':'#9fd7a2','#b4e0bd':'#4b9162','#e5dcc5':'#8e835a','#d3dfe8':'#71847a','#546778':'#d5e4d8','#fff2d9':'#544121','#f1faea':'#2b4a31','#d5a55d':'#ba924e','#91b68d':'#648d64','#b8c6d3':'#6b8273','#31475a':'#e7f2e9','#617387':'#aac1b0','#f6fafc':'#526c5b','#4a8e77':'#a8dcc1','#57718b':'#020704'};
  return markup.replace(/#[0-9a-fA-F]{6}/g,c=>palette[c.toLowerCase()]||c).replace(/fill="white"/g,'fill="#233c2b"').replace(/fill="#fff"/g,'fill="#bbccbe"')
}
function applyChartTheme(){
  if(preferences.theme!=='dark')return;
  document.querySelectorAll('.chart').forEach(svg=>{
    svg.querySelectorAll('text').forEach(t=>t.style.fill='#a7bcae');
    svg.querySelectorAll('line').forEach(t=>t.setAttribute('stroke','#344139'));
    svg.querySelectorAll('[fill="#eaf3ff"],[fill="#dfeeff"]').forEach(t=>t.setAttribute('fill','#203a2b'))
  })
}
function setTheme(theme){
  if(theme===preferences.theme&&!visualBusy)return Promise.resolve();
  const focused=document.activeElement?.id,scroll=window.scrollY,paneScroll=detailPanel.scrollTop,listScroll=document.querySelector('.directory-grid')?.scrollTop||0;
  closeAccountMenu();
  return visualTransition(()=>{
    preferences.theme=theme;
    savePreference('theme',theme);
    document.documentElement.dataset.theme=theme;
    if(state.signedIn){
      render();
      detailPanel.scrollTop=paneScroll;
      const grid=document.querySelector('.directory-grid');
      if(grid)grid.scrollTo({top:listScroll,behavior:'instant'});
      window.scrollTo(0,scroll);
      if(focused==='settings-theme')$('#settings-theme')?.focus({preventScroll:true})
    }else updateThemeLabel()
  },'theme')
}
function updateThemeLabel(){
  const button=$('#menu-theme');
  if(button){
    button.innerHTML=`${preferences.theme==='dark'?'Light mode':'Dark mode'} <span>${preferences.theme==='dark'?'Switch to light':'Switch to dark'}</span>`
  }
}
function closeAccountMenu(){
  const menu=$('#account-menu');
  if(menu.hidden||menu.dataset.closing)return;
  menu.dataset.closing='true';
  $('#profile-toggle').setAttribute('aria-expanded','false');
  retirePanel(menu,()=>{
    menu.hidden=true;
    delete menu.dataset.closing
  })
}
$('#profile-toggle').addEventListener('click',()=>{
  const menu=$('#account-menu'),open=menu.hidden||menu.dataset.closing;
  if(open){
    menu.getAnimations().forEach(a=>a.cancel());
    menu.classList.remove('is-closing');
    delete menu.dataset.closing;
    menu.hidden=false;
    $('#profile-toggle').setAttribute('aria-expanded','true');
    updateThemeLabel()
  }else closeAccountMenu()
});
document.addEventListener('click',e=>{
  if(!e.target.closest('.account-wrap'))closeAccountMenu();
  if(e.target.closest('#account-menu a'))closeAccountMenu()
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('#account-menu').hidden){
    closeAccountMenu();
    $('#profile-toggle').focus()
  }
});
function profilePage(){
  return head('My account','Aster Grove Hospital · Bengaluru')+`<div class="work-page account-page"><section class="account-surface"><div class="profile-banner"><span class="profile-avatar">AK</span><div><h2>${account.name}</h2><p>${account.role}</p></div><span class="status green">Active</span></div><dl class="profile-fields"><div><dt>Work email</dt><dd>${account.email}</dd></div><div><dt>Staff ID</dt><dd>${account.staffId}</dd></div><div><dt>Internal extension</dt><dd>${account.extension}</dd></div><div><dt>Workspace</dt><dd>Hospital command center</dd></div></dl><button data-go="settings">Account settings</button></section><section class="account-surface"><h2>Workspace access</h2><p class="muted">Permissions associated with your account</p>${[['Care coordinator','Enabled'],['Doctor','Access required'],['Nurse lead','Access required'],['Administrator','Access required']].map(([role,status])=>`<div class="list-row"><span>${role}</span><span class="status ${status==='Enabled'?'green':''}">${status}</span></div>`).join('')}<button class="logout-control" data-action="logout">Sign out</button></section></div>`
}
function settingsPage(){
  return head('Settings','Your workspace preferences')+`<div class="work-page settings-page"><section class="account-surface"><h2>Appearance</h2><div class="setting-row"><div><strong>Dark mode</strong><p>Charcoal surfaces, green accents and a matching hospital map.</p></div><label class="switch"><input id="settings-theme" aria-label="Dark mode" type="checkbox" ${preferences.theme==='dark'?'checked':''}><span></span></label></div><div class="setting-row"><div><strong>Insight notifications</strong><p>Show dots for pending care tasks and session updates.</p></div><label class="switch"><input id="settings-alerts" aria-label="Insight notifications" type="checkbox" ${preferences.alerts?'checked':''}><span></span></label></div><div class="setting-row"><div><strong>Default floor</strong><p>Open this floor after signing in.</p></div><select id="settings-floor" aria-label="Default floor">${floors.map(f=>`<option value="${f.id}" ${preferences.floor===f.id?'selected':''}>Floor ${f.id} · ${f.name}</option>`).join('')}</select></div><p class="hint">Preferences are saved on this device.</p></section></div>`
}
// Local preview sign-in: no authentication service, no credentials transmitted or persisted.
function signOut(){
  closeAccountMenu();
  return visualTransition(()=>{
    state.signedIn=false;
    closeDetail(false);
    state.metric=null;
    state.roomFilter='all';
    showLogin()
  },'auth')
}
function showLogin(){
  document.body.classList.add('signed-out');
  $('.app-header').hidden=true;
  $('.context').hidden=true;
  $('#main').hidden=true;
  insightDock.hidden=true;
  insightPanel.hidden=true;
  detailPanel.hidden=true;
  $('#toast').hidden=true;
  $('#login-screen').hidden=false;
  $('#login-screen').innerHTML=`<div class="login-brand"><span class="mark">✚</span><span>aspatal</span></div><div class="login-layout"><div class="login-intro"><h1>Hospital<br>command center.</h1><p>Patient care and operations.</p><div class="login-architecture" aria-hidden="true"><i></i><i></i><i></i></div></div><section class="login-card"><span class="login-caption">Hospital dashboard · Aster Grove Hospital</span><h2>Welcome back</h2><form id="login-form"><label>Sign in as<select id="login-role" name="role">${[['coordinator','Care coordinator'],['doctor','Doctor'],['lead','Nurse lead'],['administrator','Administrator']].map(([key,label])=>`<option value="${key}" ${state.loginRole===key?'selected':''}>${label}</option>`).join('')}</select></label><div class="login-role-state" id="login-role-state">${state.loginRole==='coordinator'?'Ananya Kapoor · Care coordinator access':'This role requires a different workspace permission.'}</div><label>Work email<input type="email" name="email" required autocomplete="username" value="${account.email}"></label><label>Password<input type="password" name="password" required autocomplete="current-password" value="aspatal"></label><p id="login-error" role="alert" hidden></p><button class="login-submit" type="submit">Sign in</button></form><small class="login-help">Workspace permissions are managed by your hospital administrator.</small></section></div><small class="login-credit">Designed by ISH</small><div class="login-glow" aria-hidden="true"></div>`;
  window.scrollTo(0,0)
}
document.addEventListener('submit',e=>{
  if(e.target.id!=='login-form')return;
  e.preventDefault();
  const f=new FormData(e.target),error=$('#login-error');
  if(f.get('role')!=='coordinator'){
    error.textContent='This account has Care coordinator access. Choose Care coordinator to continue.';
    error.hidden=false;
    return
  }
  if(String(f.get('email')).toLowerCase()!==account.email||f.get('password')!=='aspatal'){
    error.textContent='The account details do not match. Check your email and password.';
    error.hidden=false;
    return
  }
  visualTransition(()=>{
    state.signedIn=true;
    state.page='overview';
    state.floor=preferences.floor;
    state.room=null;
    state.metric=null;
    document.body.classList.remove('signed-out');
    if(!reducedMotion())document.body.classList.add('dashboard-arrival');
    $('.app-header').hidden=false;
    $('.context').hidden=false;
    $('#main').hidden=false;
    $('#login-screen').hidden=true;
    history.replaceState(null,'','#overview');
    render();
    window.scrollTo(0,0)
  },'auth')
});

// Snapshot crossfades keep every surface and SVG room in sync during theme/auth changes.
let activeVisualTransition=null,visualSequence=0,visualBusy=false;
function reducedMotion(){
  return matchMedia('(prefers-reduced-motion: reduce)').matches
}
function visualTransition(update,kind='theme'){
  const sequence=++visualSequence,root=document.documentElement;
  visualBusy=true;
  const commit=()=>{
    if(sequence===visualSequence)update()
  };
  activeVisualTransition?.skipTransition?.();
  root.style.setProperty('--scene-fade',kind==='theme'?'480ms':'320ms');
  const finish=()=>{
    if(sequence!==visualSequence)return;
    root.classList.remove('snapshot-lock');
    if(reducedMotion())document.body.classList.remove('dashboard-arrival');
    else requestAnimationFrame(()=>document.body.classList.remove('dashboard-arrival'));
    activeVisualTransition=null;
    visualBusy=false
  };
  if(reducedMotion()){
    commit();
    finish();
    return Promise.resolve()
  }
  if(document.startViewTransition){
    root.classList.add('snapshot-lock');
    try{
      const transition=document.startViewTransition(commit);
      transition.ready.catch(()=>{
      });
      transition.updateCallbackDone.catch(()=>{
      });
      activeVisualTransition=transition;
      return transition.finished.catch(()=>{
      }).finally(finish)
    }catch{
      root.classList.remove('snapshot-lock')
    }
  }
  const out=document.body.animate([{opacity:1},{opacity:.1}],{duration:120,easing:'ease-out',fill:'forwards'});
  return out.finished.catch(()=>{
  }).then(()=>{
    if(sequence!==visualSequence){
      out.cancel();
      return
    }
    commit();
    out.cancel();
    return document.body.animate([{opacity:.1},{opacity:1}],{duration:260,easing:'cubic-bezier(.2,.7,.2,1)'}).finished.catch(()=>{
    })
  }).finally(finish)
}
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('page-asleep',document.hidden));
function captureSegment(key,container){
  const track=container?.querySelector('.segment-highlight');
  if(!track||!container.offsetWidth)return;
  const box=track.getBoundingClientRect(),base=container.getBoundingClientRect();
  segmentCache.set(key,{left:box.left-base.left,top:box.top-base.top,width:box.width,height:box.height,containerWidth:base.width})
}
function slideSegment(container,active,key){
  if(!container||!container.offsetWidth)return;
  let track=container.querySelector('.segment-highlight');
  if(!active){
    if(track)track.style.opacity='0';
    return
  }
  const existing=!!track;
  if(!track){
    track=document.createElement('span');
    track.className='segment-highlight';
    track.setAttribute('aria-hidden','true');
    container.prepend(track)
  }
  const target={left:active.offsetLeft,top:active.offsetTop,width:active.offsetWidth,height:active.offsetHeight,containerWidth:container.getBoundingClientRect().width};
  if(existing&&track.style.opacity!=='0')captureSegment(key,container);
  const previous=segmentCache.get(key);
  track.getAnimations().forEach(a=>a.cancel());
  track.style.width=target.width+'px';
  track.style.height=target.height+'px';
  track.style.opacity='1';
  const end=`translate(${target.left}px,${target.top}px) scaleX(1)`;
  track.style.transform=end;
  if(previous&&Math.abs(previous.containerWidth-target.containerWidth)<2&&!reducedMotion()&&(Math.abs(previous.left-target.left)>.5||Math.abs(previous.width-target.width)>.5)){
    const from=`translate(${previous.left}px,${target.top}px) scaleX(${previous.width/target.width})`;
    track.animate([{transform:from},{transform:end}],{duration:360,easing:'cubic-bezier(.2,.75,.2,1)'})
  }
  segmentCache.set(key,target)
}
function alignInsightPanel(){
  if(matchMedia('(min-width:701px)').matches&&insightDock.offsetWidth)insightPanel.style.width=insightDock.getBoundingClientRect().width+'px';
  else insightPanel.style.removeProperty('width')
}
function updateSegmentedControls(){
  slideSegment(document.querySelector('.map-tools>.view-toggle'),document.querySelector('.map-tools [data-map-mode][aria-pressed="true"]'),'map-mode');
  slideSegment(document.querySelector('.room-filters'),document.querySelector('.room-filters [aria-pressed="true"]'),'rooms');
  slideSegment(insightDock,insightDock.querySelector('[aria-expanded="true"]'),'insights');
  alignInsightPanel()
}
window.addEventListener('resize',()=>requestAnimationFrame(updateSegmentedControls));
document.addEventListener('toggle',e=>{
  if(e.target.matches('.room-directory'))requestAnimationFrame(updateSegmentedControls)
},true);
let glowFrame=0,glowPoint={x:0,y:0};
document.addEventListener('pointermove',e=>{
  if(state.signedIn||e.pointerType==='touch'||reducedMotion())return;
  glowPoint={x:e.clientX,y:e.clientY};
  if(!glowFrame)glowFrame=requestAnimationFrame(()=>{
    glowFrame=0;
    const glow=document.querySelector('.login-glow');
    if(glow){
      glow.style.transform=`translate3d(${glowPoint.x-150}px,${glowPoint.y-150}px,0)`;
      glow.classList.add('is-visible')
    }
  })
});
document.addEventListener('pointerout',e=>{
  if(!e.relatedTarget)document.querySelector('.login-glow')?.classList.remove('is-visible')
});

// Context leaves along the same path it entered; native dialog focus trapping is retained.
function retirePanel(panel,finish){
  panel.getAnimations().forEach(a=>a.cancel());
  if(panel.hidden||reducedMotion()){
    finish();
    return
  }
  panel.classList.add('is-closing');
  const motion=panel.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(8px)'}],{duration:180,easing:'cubic-bezier(.4,0,.8,.4)'});
  motion.finished.then(()=>{
    panel.classList.remove('is-closing');
    finish()
  }).catch(()=>panel.classList.remove('is-closing'))
}
function dismissDialog(dialog){
  if(!dialog.open||dialog.dataset.closing)return;
  dialog.dataset.closing='true';
  retirePanel(dialog,()=>{
    dialog.close();
    delete dialog.dataset.closing
  })
}
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('cancel',event=>{
  event.preventDefault();
  dismissDialog(dialog)
}));
function panelToggleIcon(){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>${state.panelsHidden?'':'<path d="m4 3 16 18"/>'}</svg>`
}
function cameraTransform() {
  const phone = matchMedia('(max-width:700px)').matches;
  const shell = document.querySelector('.map-shell');
  const width = shell?.clientWidth || innerWidth-32;
  const height = phone ? 300 : shell?.clientHeight || 700;
  const unit = Math.min((width-40)/1480,(height-40)/(850+440*state.blend));
  const roomWidth = phone ? 0 : parseFloat(getComputedStyle(shell||document.documentElement).getPropertyValue('--room-width')) || 320;
  const shift = phone || state.panelsHidden ? 0 : -roomWidth/(2*Math.max(.2,unit));
  const baseScale = phone ? .94+.3*state.blend : state.panelsHidden ? .92+.35*state.blend : .76+.38*state.blend;
  const scale = state.zoom*baseScale;
  return `translate(${shift+state.panX+700*(1-scale)}px,${state.panY+450*(1-scale)}px) scale(${scale})`;
}

function syncCamera(){
  const camera=document.querySelector('.scene-camera');
  if(camera)camera.style.transform=cameraTransform()
}
function syncPanelVisibility(){
  const shell=document.querySelector('.map-shell');
  if(!shell)return;
  shell.classList.toggle('panels-hidden',state.panelsHidden);
  shell.querySelectorAll('.map-caption,.room-directory,#detail,#metrics,#dock').forEach(el=>{
    el.inert=state.panelsHidden;
    if(state.panelsHidden)el.setAttribute('aria-hidden','true');
    else el.removeAttribute('aria-hidden')
  });
  const toggle=shell.querySelector('.panels-toggle');
  if(toggle){
    toggle.setAttribute('aria-pressed',String(state.panelsHidden));
    toggle.setAttribute('aria-label',state.panelsHidden?'Show panels':'Hide panels');
    toggle.title=state.panelsHidden?'Show panels':'Hide panels';
    toggle.innerHTML=panelToggleIcon()
  }
}
// Synthetic staff activity illustrates circulation; these are not real-time location feeds.
function scenePeople(P) {
  const floor = floors[state.floor - 1];
  const people = [
  [floor.spoc, 'Nurse', '#2b70b5', [[165,300],[165,620],[165,162],[440,162],[165,162],[165,300]], 155],
  [floor.doctor, 'Doctor', '#278259', [[855,350],[855,650],[855,162],[620,162],[855,162],[855,350]], 185],
  [floor.admin, 'Administrator', '#8555b4', [[350,162],[700,162],[350,162]], 135]
  ];
  return people.map(([id, role, color, route, duration], index) => {
    const staff = team.find(person => person.id === id);
    const points = route.map(([x, y]) => P(x, y, 22));
    const path = points.map((point, i) => (i ? 'L' : 'M') + point.join(',')).join(' ');
    const motion = reducedMotion() ? '' : `<animateMotion dur="${duration}s" begin="-${((performance.now()/1000+index*21)%duration).toFixed(2)}s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;.36;.36;.72;.72;1;1" keyTimes="0;.18;.34;.54;.69;.87;.98;1" path="${path}"/>`;
    const labelWidth = Math.max(100, staff.name.length * 7 + 20);
    return `<g class="scene-person" style="--person-color:${color};--presence-delay:-${((performance.now()/1000+index*2.3)%7).toFixed(2)}s" data-contact="${id}" role="button" tabindex="0" aria-label="${esc(staff.name)}, ${role}, on duty. Open contact details." ${reducedMotion() ? `transform="translate(${points[0].join(' ')})"` : ''}>
      ${motion}<circle class="presence-hit" r="22" fill="transparent"/>
      <g class="presence-dot"><circle r="10" fill="${color}" opacity=".12"/><circle r="5.5" fill="${color}" stroke="white" stroke-width="2" vector-effect="non-scaling-stroke"/></g>
      <g class="person-label"><rect x="${-labelWidth/2}" y="-36" width="${labelWidth}" height="25" rx="8"/><path d="m-4-11 4 5 4-5Z"/><text y="-19" text-anchor="middle" font-size="12" font-weight="600">${esc(staff.name)}</text></g>
      <title>${esc(staff.name)} · ${role} · On duty</title>
    </g>`;
  }).join('');
}
document.addEventListener('keydown',event=>{
  const person=event.target.closest('.scene-person[data-contact]');
  if(person&&['Enter',' '].includes(event.key)){
    event.preventDefault();
    openContact(+person.dataset.contact)
  }
});
window.addEventListener('resize',()=>requestAnimationFrame(syncCamera));

// Canvas wheel gestures do not change the surrounding page's zoom or scroll.
document.addEventListener('wheel', event => {
  const map = event.target.closest('.map-art');
  if (!map) return;
  event.preventDefault();
  if (event.ctrlKey) {
    state.zoom = Math.max(.55, Math.min(1.8, state.zoom * Math.exp(-event.deltaY * .006)));
    syncCamera();
  } else if (event.shiftKey || event.altKey) {
    state.rotation = (state.rotation + (event.deltaX || event.deltaY) * .2 + 360) % 360;
    map.outerHTML = mapSVG();
  } else {
    const unit = map.getScreenCTM()?.a || 1;
    state.panX = Math.max(-1400, Math.min(1400, state.panX - event.deltaX/unit));
    state.panY = Math.max(-1100, Math.min(1100, state.panY - event.deltaY/unit));
    syncCamera();
  }
}, {passive:false});

// A short-lived, inert outgoing scene makes tabs move without freezing the header.
let routeMotion = null;
function navigateWorkspace(route) {
  const next = routes.includes(route) ? route : 'overview';
  if (next === state.page) return;
  routeMotion?.();
  const main = $('#main'), previous = state.page;
  const direction = routes.indexOf(next) > routes.indexOf(previous) ? 1 : -1;
  const distance = Math.abs(routes.indexOf(next)-routes.indexOf(previous));
  const oldRect = main.getBoundingClientRect();
  const snapshot = state.signedIn && !reducedMotion() ? main.cloneNode(true) : null;
  state.page = next;
  state.query = '';
  state.metric = state.room = null;
  window.scrollTo({top:0,behavior:'instant'});
  render();
  main.focus({preventScroll:true});
  if (!snapshot) return;
  snapshot.removeAttribute('id');
  snapshot.removeAttribute('tabindex');
  snapshot.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
  snapshot.querySelectorAll('*').forEach(node => [...node.attributes].forEach(attribute => {
    if (attribute.name.startsWith('data-')) node.removeAttribute(attribute.name);
  }));
  snapshot.setAttribute('aria-hidden','true');
  snapshot.inert = true;
  snapshot.classList.add('route-snapshot');
  const portal = document.createElement('div');
  portal.className = 'route-portal';
  const top = Math.max(0, document.querySelector('.app-header').getBoundingClientRect().bottom);
  portal.style.top = top+'px';
  Object.assign(snapshot.style,{top:(oldRect.top-top)+'px',left:oldRect.left+'px',width:oldRect.width+'px',margin:'0'});
  portal.append(snapshot);
  document.body.append(portal);
  const timing = {duration:Math.min(540,360+distance*30),easing:'cubic-bezier(.22,.75,.15,1)'};
  const outgoing = snapshot.animate([{transform:'translateX(0)'},{transform:`translateX(${-direction*innerWidth}px)`}],timing);
  const incoming = main.animate([{transform:`translateX(${direction*innerWidth}px)`},{transform:'translateX(0)'}],timing);
  const cleanup = () => {
    outgoing.cancel();
    incoming.cancel();
    portal.remove();
    if(routeMotion===cleanup)routeMotion=null;
  };
  routeMotion = cleanup;
  Promise.allSettled([outgoing.finished,incoming.finished]).then(cleanup);
}
function updateCurrentTime() {
  const clock = document.querySelector('#current-time');
  if (clock) {
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false}).format(now)+' IST';
  }
  setTimeout(updateCurrentTime, 60000-Date.now()%60000+20);
}
updateCurrentTime();

// Safari exposes native trackpad twist/pinch separately from wheel events.
let nativeMapGesture = null;
document.addEventListener('gesturestart', event => {
  if (!event.target.closest('.map-art')) return;
  event.preventDefault();
  nativeMapGesture = {rotation:state.rotation,zoom:state.zoom};
}, {passive:false});
document.addEventListener('gesturechange', event => {
  if (!nativeMapGesture) return;
  event.preventDefault();
  state.rotation = (nativeMapGesture.rotation + event.rotation + 360) % 360;
  state.zoom = Math.max(.55,Math.min(1.8,nativeMapGesture.zoom*event.scale));
  const map = document.querySelector('.map-art');
  if (map) map.outerHTML = mapSVG();
}, {passive:false});
document.addEventListener('gestureend', () => {
  nativeMapGesture=null;
});
