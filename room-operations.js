/* Aspatal room facilities: synthetic meter snapshots, supplies and maintenance.
 * No building telemetry is connected; requests and resolutions are session-local.
 */
(function () {
  'use strict';
  const esc = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let adapter, ticket = 7000;
  const categories = ['Electrical','Plumbing','Drainage','Ventilation','Supplies','Housekeeping'];
  const activeIssues = room => room.facilities.issues.filter(issue => !issue.resolved);
  function seed(rooms) {
    rooms.forEach(room => {
      const pharmacy = room.type === 'pharmacy', index = room.index, issues = [];
      if (!pharmacy && index === 5) issues.push({id:room.id+'-drain',category:'Drainage',title:'Washbasin drain running slowly',detail:'Facilities inspection pending; wastewater line '+room.floor+'B.'});
      if (!pharmacy && index === 11) issues.push({id:room.id+'-light',category:'Electrical',title:'Reading light flickering',detail:'Bedside light fitting needs inspection.'});
      if (pharmacy && index === 2) issues.push({id:room.id+'-vent',category:'Ventilation',title:'Air grille cleaning due',detail:'Routine cabinet-area ventilation service.'});
      room.facilities = {
      synthetic:true,
      sampledAt:'2026-11-14T12:00:00+05:30',
      power:Number((pharmacy ? 1.14+(index+room.floor)%5*.14 : .42+(index*3+room.floor)%9*.065).toFixed(2)),
      energy:Number((pharmacy ? 16.8+index*1.3 : 6.4+index*.32+room.floor*.4).toFixed(1)),
      water:Number((2.4+(index+room.floor)%5*.1).toFixed(1)),
      temperature:Number((23.4+(index+room.floor)%8*.15).toFixed(1)),
      circuit:`F${room.floor}-${pharmacy?'P':'R'}${pharmacy?index+1:room.id}`,
      checked:['10:45','11:00','11:15','11:30'][index%4],
      delivery:['08:15','08:35','09:00','09:20'][index%4],
      nextRound:['13:30','14:00','14:30','15:00'][index%4],
      linen:pharmacy?null:4+index%3,
      issues:issues.map(issue=>({...issue,requested:false,resolved:false,ticket:null}))
      };
    });
  }
  function systemRow(room, category, description, normal) {
    const issue=activeIssues(room).find(issue=>issue.category===category);
    return `<div class="ops-system"><span><strong>${category}</strong><small>${esc(description)}</small></span><span class="ops-state ${issue?'attention':''}">${issue?'Check needed':normal}</span></div>`;
  }
  function markup(room) {
    const data=room.facilities, issues=activeIssues(room), pharmacy=room.type==='pharmacy';
    const turnover=room.beds.some(bed=>bed.status==='Cleaning');
    return `<section class="room-operations" aria-label="Room facilities and logistics">
      <div class="ops-heading"><div><h3>Room operations</h3><p>Utilities, upkeep & supplies</p></div><span class="ops-state ${issues.length?'attention':''}">${issues.length?issues.length+' to review':'All clear'}</span></div>
      <div class="ops-metrics">
        <div><span>Power now</span><strong>${data.power.toFixed(2)}<small>kW</small></strong><p>Lighting & outlets</p></div>
        <div><span>Energy today</span><strong>${data.energy.toFixed(1)}<small>kWh</small></strong><p>Since 00:00</p></div>
        <div><span>Water pressure</span><strong>${data.water.toFixed(1)}<small>bar</small></strong><p>Supply line</p></div>
        <div><span>Room climate</span><strong>${data.temperature.toFixed(1)}<small>°C</small></strong><p>Air handling</p></div>
      </div>
      <section class="ops-section"><h4>Building systems</h4>
        ${systemRow(room,'Electrical',data.circuit+' · Checked '+data.checked,'Stable')}
        ${systemRow(room,'Plumbing','Basin & supply connections','Flow normal')}
        ${systemRow(room,'Drainage','Wastewater line '+room.floor+'B','Clear')}
        ${systemRow(room,'Ventilation','Room air handling','Running')}
        <div class="ops-system"><span><strong>Connectivity</strong><small>Room network & service point</small></span><span class="ops-state">Connected</span></div>
      </section>
      <section class="ops-section"><h4>Room logistics</h4><dl class="ops-logistics">
        <div><dt>${pharmacy?'Cabinet & counter care':'Housekeeping'}</dt><dd>${turnover?'Turnover in progress':'Checked · '+data.checked}</dd></div>
        <div><dt>${pharmacy?'Last supply delivery':'Clean linen'}</dt><dd>${pharmacy?data.delivery+' IST':data.linen+' sets'}</dd></div>
        <div><dt>${pharmacy?'Labels & cleaning':'Room consumables'}</dt><dd>${activeIssues(room).some(issue=>issue.category==='Supplies')?'Top-up requested':'Stocked'}</dd></div>
        <div><dt>Next service round</dt><dd>${data.nextRound} IST</dd></div>
      </dl></section>
      <section class="ops-section"><div class="ops-section-head"><h4>Maintenance</h4><small>${issues.length} open</small></div>
        ${issues.length?issues.map(issue=>`<article class="ops-issue"><div><span>${issue.category}</span><span>${issue.requested?esc(issue.ticket)+' · '+esc(issue.priority||'Standard'):'To review'}</span></div><h5>${esc(issue.title)}</h5><p>${esc(issue.detail)}</p>${issue.requested?`<div class="ops-requested"><span>Service requested</span><button type="button" class="ops-resolve" data-facility-resolve="${issue.id}">Mark resolved</button></div>`:`<button type="button" class="ops-request" data-facility-request="${issue.id}">Request service</button>`}</article>`).join(''):'<div class="ops-clear"><span aria-hidden="true">✓</span><p>No open maintenance items</p></div>'}
        <button type="button" class="ops-log" data-facility-log>Log an issue</button>
      </section>
      <p class="ops-timestamp">Meter snapshot · 12:00 IST</p>
    </section>`;
  }
  function attach(panel, room, pane) {
    const header=panel.querySelector('.panel-head');
    const introduction=room.type!=='pharmacy'&&header.nextElementSibling?.tagName==='P'?header.nextElementSibling:header;
    const care=document.createElement('div');
    care.className='room-care-content';
    while(introduction.nextSibling)care.append(introduction.nextSibling);
    const tabs=document.createElement('div');
    tabs.className='room-context-tabs';
    tabs.setAttribute('role','group');
    tabs.setAttribute('aria-label','Room information');
    const count=activeIssues(room).length;
    tabs.innerHTML=`<button type="button" data-room-pane="care" aria-pressed="${pane!=='facilities'}">${room.type==='pharmacy'?'Inventory':'Care'}</button><button type="button" data-room-pane="facilities" aria-pressed="${pane==='facilities'}">Facilities${count?`<span>${count}</span>`:''}</button>`;
    const facilities=document.createElement('div');
    facilities.className='room-facilities-content';
    facilities.innerHTML=markup(room);
    care.hidden=pane==='facilities';
    facilities.hidden=pane!=='facilities';
    introduction.after(tabs,care,facilities);
    adapter?.animateTabs?.(tabs,tabs.querySelector('[aria-pressed="true"]'));
  }
  function openRequest(room, issue) {
    const dialog=document.querySelector('#analytics');
    dialog.innerHTML=`<form id="facility-form" data-room="${room.id}" data-issue="${issue?.id||''}"><div class="panel-head"><div><small>${room.type==='pharmacy'?room.name:'Room '+room.id} · Floor ${room.floor}</small><h2 id="analytics-title">${issue?'Request service':'Log a facilities issue'}</h2></div><button type="button" data-action="close-analytics" aria-label="Close facilities request">×</button></div><label>Category<select name="category">${categories.map(category=>`<option ${category===issue?.category?'selected':''}>${category}</option>`).join('')}</select></label><label>Issue<input name="title" required maxlength="100" value="${esc(issue?.title||'')}" placeholder="Describe what needs attention"></label><label>Details<textarea name="detail" rows="3" maxlength="300" placeholder="Location or useful context">${esc(issue?.detail||'')}</textarea></label><label>Priority<select name="priority"><option>Standard</option><option>Soon</option></select></label><button class="primary" type="submit">Submit request</button></form>`;
    dialog.showModal();
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-room-pane],[data-facility-request],[data-facility-resolve],[data-facility-log]');
    if(!button||!adapter)return;
    const room=adapter.getRoom();
    if(!room)return;
    event.preventDefault();
    if(button.dataset.roomPane){
      adapter.captureTabs?.();
      adapter.getState().roomPane=button.dataset.roomPane;
      adapter.refresh();
      document.querySelector(`[data-room-pane="${button.dataset.roomPane}"]`)?.focus({preventScroll:true});
      return;
    }
    if(button.hasAttribute('data-facility-log')){
      openRequest(room);
      return;
    }
    const id=button.dataset.facilityRequest||button.dataset.facilityResolve;
    const issue=room.facilities.issues.find(item=>item.id===id);
    if(!issue)return;
    if(button.dataset.facilityResolve){
      issue.resolved=true;
      adapter.refresh();
      document.querySelector('.ops-log')?.focus({preventScroll:true});
      adapter.notify('Facilities item resolved.');
      return;
    }
    openRequest(room,issue);
  });
  document.addEventListener('submit',event=>{
    if(event.target.id!=='facility-form'||!adapter)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const form=event.target,room=adapter.findRoom(form.dataset.room),data=new FormData(form),title=String(data.get('title')).trim();
    if(!room||!title)return;
    let issue=room.facilities.issues.find(issue=>issue.id===form.dataset.issue);
    if(!issue){
      issue={id:room.id+'-fm-'+(++ticket),resolved:false};
      room.facilities.issues.push(issue);
    }
    Object.assign(issue,{title,category:categories.includes(String(data.get('category')))?String(data.get('category')):'Housekeeping',detail:String(data.get('detail')).trim(),priority:String(data.get('priority')),requested:true,resolved:false,ticket:issue.ticket||'FM-'+(++ticket)});
    document.querySelector('#analytics').addEventListener('close',()=>document.querySelector('.ops-log')?.focus({preventScroll:true}),{once:true});
    adapter.closeDialog(document.querySelector('#analytics'));
    adapter.getState().roomPane='facilities';
    adapter.refresh();
    adapter.notify('Facilities request '+issue.ticket+' recorded.');
  });
  window.AspatalRoomOperations={seed,attach,init:settings=>{
    adapter=settings;
  }
  };
})();
