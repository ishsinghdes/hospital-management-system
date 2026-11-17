/* Aspatal architectural floor renderer — original models by Ish.
 * Three.js r187 (MIT) is bundled locally in vendor/three.js.
 * This layer reads the dashboard's synthetic data; it never owns clinical state.
 */
(function () {
  'use strict';
  const T = window.THREE;
  const U = n => n / 100;
  const world = (x, z, y = 0) => new T.Vector3(U(x - 510), y, U(z - 400));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  class ArchitecturalFloor {
  constructor(adapter) {
    if (!T) throw new Error('The local 3D engine is unavailable.');
    this.adapter = adapter;
    this.renderer = new T.WebGLRenderer({alpha:true, antialias:true, powerPreference:'high-performance'});
    this.renderer.domElement.className = 'floor-canvas';
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.scene = new T.Scene();
    this.camera = new T.OrthographicCamera(-10,10,6,-6,.1,80);
    this.raycaster = new T.Raycaster();
    this.pointer = new T.Vector2();
    this.geometry = new Map();
    this.materials = new Map();
    this.host = null;
    this.key = '';
    this.frame = 0;
    this.lastFrame = -100;
    this.hovered = null;
    this.currentOffset = null;
    this.labels = [];
    this.people = [];
    this.roomCenters = new Map();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.visibility = () => {
      if (document.hidden) this.suspend();
      else if (this.host?.isConnected) this.start();
    };
    document.addEventListener('visibilitychange', this.visibility);
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
    this.reduced.addEventListener('change', () => {
      this.key = '';
      this.update();
    });
    const canvas = this.renderer.domElement;
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      this.suspend();
      adapter.onFailure();
    });
    canvas.addEventListener('click', event => this.pick(event));
    canvas.addEventListener('pointermove', event => this.hover(event));
    canvas.addEventListener('pointerleave', () => {
      this.hovered=null;
      this.updateSelection();
      adapter.onHover?.(null);
    });
  }
  mount(host) {
    this.host = host;
    host.dataset.renderer = 'webgl';
    host.prepend(this.renderer.domElement);
    this.resizeObserver.disconnect();
    this.resizeObserver.observe(host);
    this.key = '';
    this.currentOffset = null;
    this.resize();
    this.update();
    this.start();
  }
  resize() {
    if (!this.host?.isConnected) return;
    const rect = this.host.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.width < 700 ? 1.4 : 1.7));
    this.renderer.setSize(this.width, this.height, false);
    this.invalidate();
  }
  suspend() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }
  start() {
    if (!this.frame && this.host?.isConnected && !document.hidden) this.frame=requestAnimationFrame(time=>this.tick(time));
  }
  invalidate() {
    this.dirty=true;
    this.start();
  }
  update() {
    if (!this.host?.isConnected) return;
    const state = this.adapter.getState();
    const rooms = this.adapter.getRooms();
    const key = [state.floor,state.theme,state.roomFilter,rooms.map(r=>[r.id,r.call,r.beds.map(b=>b.status).join(),r.inventory?.map(i=>i.quantity).join()].join(':')).join('|')].join('/');
    if (this.key !== key) {
      this.key=key;
      this.build(rooms,state);
      this.createLabels(rooms,state);
    }
    this.updateSelection();
    this.invalidate();
  }
  material(color, roughness = .83, extra = {}) {
    const key = JSON.stringify([color,roughness,Object.fromEntries(Object.entries(extra).map(([name,value])=>[name,value?.isTexture?value.uuid:value]))]);
    if (!this.materials.has(key)) this.materials.set(key,new T.MeshStandardMaterial({color,roughness,metalness:0,...extra}));
    return this.materials.get(key);
  }
  surfaceTexture(kind) {
    this.surfaceTextures ||= new Map();
    if(this.surfaceTextures.has(kind))return this.surfaceTextures.get(kind);
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=256;
    const context=canvas.getContext('2d');
    context.fillStyle='#ffffff';
    context.fillRect(0,0,256,256);
    let seed=kind.length*7919;
    const random=()=>{
      seed=(seed*1664525+1013904223)>>>0;
      return seed/4294967296;
    };
    if(kind==='tile'||kind==='pavers'){
      context.strokeStyle=kind==='tile'?'#52666c24':'#6a615a25';
      context.lineWidth=1;
      const step=kind==='tile'?64:48;
      for(let i=step;i<256;i+=step){
        context.beginPath();
        context.moveTo(i,0);
        context.lineTo(i,256);
        context.moveTo(0,i);
        context.lineTo(256,i);
        context.stroke()
      }
    }
    if(kind==='lawn'){
      for(let i=0;i<45;i++){
        context.fillStyle=i%2?'#8a9a8510':'#91a08b0b';
        context.fillRect(random()*256,random()*256,18+random()*40,8+random()*26)
      }
    }
    for(let i=0;i<(kind==='speckle'?420:180);i++){
      context.fillStyle=i%2?'#5b685c13':'#7b827511';
      const size=kind==='speckle'?1+random()*2.2:.6+random();
      context.fillRect(random()*256,random()*256,size,size)
    }
    const texture=new T.CanvasTexture(canvas);
    texture.colorSpace=T.SRGBColorSpace;
    texture.wrapS=texture.wrapT=T.RepeatWrapping;
    texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());
    this.surfaceTextures.set(kind,texture);
    return texture;
  }
  createSelectionHalo() {
    this.selectionHalo=new T.Group();
    this.selectionHalo.visible=false;
    this.content.add(this.selectionHalo);
    this.selectedId=null;
    const material=(opacity)=>new T.MeshBasicMaterial({color:this.dark?'#7ed5ac':'#28a16c',transparent:true,opacity,depthWrite:false,side:T.DoubleSide});
    const disk=new T.Mesh(new T.CircleGeometry(.83,64),material(.055));
    const ring=new T.Mesh(new T.RingGeometry(.805,.828,64),material(.75));
    const pulse=new T.Mesh(new T.RingGeometry(.81,.835,64),material(.5));
    for(const mesh of [disk,ring,pulse]){
      mesh.rotation.x=-Math.PI/2;
      mesh.userData.transient=true;
      this.selectionHalo.add(mesh)
    }
    ring.material.depthTest=false;
    pulse.material.depthTest=false;
    ring.renderOrder=6;
    pulse.renderOrder=7;
    this.haloRing=ring;
    this.haloPulse=pulse;
  }
  positionSelectionHalo(id) {
    const entry=this.roomCenters.get(id);
    if(!entry){
      this.selectionHalo.visible=false;
      this.selectedId=null;
      return;
    }
    if(id!==this.selectedId){
      this.selectedId=id;
      this.selectionAt=performance.now();
    }
    this.selectionHalo.visible=true;
    this.selectionHalo.position.copy(world(entry.x+entry.w/2,entry.z+entry.d/2,.065));
  }
  updateSelectionHalo(time) {
    if(!this.selectionHalo?.visible)return;
    const elapsed=Math.max(0,time-this.selectionAt),progress=this.reduced.matches?1:Math.min(1,elapsed/750);
    const entrance=1-Math.pow(1-Math.min(1,elapsed/360),3);
    const scale=this.reduced.matches?1:.91+.09*entrance;
    this.selectionHalo.scale.setScalar(scale);
    const breathe=this.reduced.matches?1:1+Math.sin(time/1800)*.012;
    this.haloRing.scale.setScalar(breathe);
    this.haloPulse.scale.setScalar(1+progress*.30);
    this.haloPulse.material.opacity=this.reduced.matches?0:.45*(1-progress);
  }
  boxGeometry(w,h,d,rounded=false) {
    const key = `box/${w}/${h}/${d}/${rounded}`;
    if (!this.geometry.has(key)) {
      let geometry;
      if (!rounded) geometry=new T.BoxGeometry(w,h,d);
      else {
        const radius = Math.min(.025,w/5,h/5,d/5), x=-w/2, z=-d/2;
        const shape=new T.Shape();
        shape.moveTo(x+radius,z);
        shape.lineTo(x+w-radius,z);
        shape.quadraticCurveTo(x+w,z,x+w,z+radius);
        shape.lineTo(x+w,z+d-radius);
        shape.quadraticCurveTo(x+w,z+d,x+w-radius,z+d);
        shape.lineTo(x+radius,z+d);
        shape.quadraticCurveTo(x,z+d,x,z+d-radius);
        shape.lineTo(x,z+radius);
        shape.quadraticCurveTo(x,z,x+radius,z);
        geometry=new T.ExtrudeGeometry(shape,{depth:Math.max(.001,h-radius*2),bevelEnabled:true,bevelSize:radius*.45,bevelThickness:radius,bevelSegments:2,steps:1,curveSegments:3});
        geometry.rotateX(-Math.PI/2);
        geometry.computeBoundingBox();
        const center=geometry.boundingBox.getCenter(new T.Vector3());
        geometry.translate(-center.x,-center.y,-center.z);
      }
      this.geometry.set(key,geometry);
    }
    return this.geometry.get(key);
  }
  mesh(geometry,material,x,y,z,meta=null,shadow=true) {
    const mesh=new T.Mesh(geometry,material);
    mesh.position.set(x,y,z);
    mesh.castShadow=shadow;
    mesh.receiveShadow=true;
    if (meta) mesh.userData={...meta};
    this.content.add(mesh);
    return mesh;
  }
  box(x,z,w,d,h,y,mat,meta=null,rounded=false) {
    const p=world(x,z,y);
    return this.mesh(this.boxGeometry(U(w),h,U(d),rounded),mat,p.x,y,p.z,meta);
  }
  cylinder(x,z,radius,height,y,mat,meta=null) {
    const key=`cylinder/${radius}/${height}`;
    if(!this.geometry.has(key))this.geometry.set(key,new T.CylinderGeometry(radius,radius,height,12));
    const p=world(x,z,y);
    return this.mesh(this.geometry.get(key),mat,p.x,y,p.z,meta);
  }
  sphere(x,z,radius,y,mat,scale=[1,1,1]) {
    if(!this.geometry.has('sphere'))this.geometry.set('sphere',new T.SphereGeometry(1,16,12));
    const p=world(x,z,y),mesh=this.mesh(this.geometry.get('sphere'),mat,p.x,y,p.z);
    mesh.scale.set(radius*scale[0],radius*scale[1],radius*scale[2]);
    return mesh;
  }
  roomGeometry(room) {
    if(room.type==='pharmacy')return{x:256+room.index*128,z:0,w:120,d:115};
    if(room.index<4)return{x:[0,128,768,896][room.index],z:0,w:120,d:115};
    const n=room.index-4;
    return{x:[0,210,690,900][Math.floor(n/5)],z:215+(n%5)*118,w:120,d:108};
  }
  build(rooms,state) {
    if (this.content) {
      this.scene.remove(this.content);
      const geometries=new Set(),materials=new Set();
      this.content.traverse(object=>{
        if(object.isInstancedMesh)object.dispose();
        if(object.userData.transient){
          if(object.geometry)geometries.add(object.geometry);
          if(object.material)materials.add(object.material)
        }
      });
      geometries.forEach(geometry=>geometry.dispose());
      materials.forEach(material=>material.dispose());
    }
    if(this.lighting){
      this.lighting.traverse(light=>light.shadow?.map?.dispose());
      this.scene.remove(this.lighting);
    }
    this.content=new T.Group();
    this.scene.add(this.content);
    this.lighting=new T.Group();
    this.scene.add(this.lighting);
    this.dark=state.theme==='dark';
    const palette=this.dark ? {
    wall:'#56655f',trim:'#6b7b72',base:'#26392f',corridor:'#405b6b',corridorEdge:'#6a8791',floor:'#514e42',available:'#3e614a',urgent:'#674b42',pharmacy:'#79684a',pharmacyWall:'#a28c65',wardA:'#538977',wardB:'#6a8198',garden:'#315a3c',gardenPath:'#746d57',frame:'#879c90',linen:'#c6d7cf',pillow:'#e0e9e2',blanket:'#7c9fa9',mint:'#78ae86',wood:'#aca28a',plant:'#4f8759',leaf:'#75a36d',water:'#5da49d'
    } : {
    wall:'#fbf6eb',trim:'#d8d3c5',base:'#f2efe6',corridor:'#b8cfdc',corridorEdge:'#8eafb9',floor:'#efe5d2',available:'#daeace',urgent:'#f3d6c9',pharmacy:'#e4cda2',pharmacyWall:'#d0b27d',wardA:'#99bbae',wardB:'#afc0d5',garden:'#a3c297',gardenPath:'#e2d1b0',frame:'#bcc9bf',linen:'#f7fbf4',pillow:'#ffffff',blanket:'#a9c8cf',mint:'#96c89f',wood:'#d5bd98',plant:'#83ae81',leaf:'#acc992',water:'#78b8b1'
    };
    this.palette=palette;
    const m={};
    for(const [key,color] of Object.entries(palette))m[key]=this.material(color);
    // Painted surfaces use color and fine 2D grain only; no bump/displacement maps.

    m.corridor=this.material(palette.corridor,.9,{map:this.surfaceTexture('tile')});
    m.floor=this.material(palette.floor,.88,{map:this.surfaceTexture('speckle')});
    m.available=this.material(palette.available,.88,{map:this.surfaceTexture('speckle')});
    m.pharmacy=this.material(palette.pharmacy,.88,{map:this.surfaceTexture('tile')});
    m.garden=this.material(palette.garden,.96,{map:this.surfaceTexture('lawn')});
    m.gardenPath=this.material(palette.gardenPath,.95,{map:this.surfaceTexture('pavers')});
    const metal=this.material(this.dark?'#71867a':'#afbfba',.55,{metalness:.15});
    const hemi=new T.HemisphereLight(this.dark?'#cee9d4':'#eff7ff',this.dark?'#16251c':'#c9c9b5',this.dark?2.1:1.8);
    this.lighting.add(hemi);
    const sun=new T.DirectionalLight(this.dark?'#e3f1e4':'#fff6e7',this.dark?2.2:2.6);
    sun.position.set(-4,12,7);
    sun.castShadow=true;
    sun.shadow.mapSize.set(this.width<700?1024:2048,this.width<700?1024:2048);
    Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:30});
    sun.shadow.normalBias=.035;
    sun.shadow.bias=-.0002;
    sun.shadow.radius=3;
    sun.shadow.intensity=.34;
    this.lighting.add(sun);
      // One continuous, bevelled U-shaped slab. Furniture sits on real receiving surfaces.


    const footprint=[[0,0],[1020,0],[1020,810],[690,810],[690,205],[330,205],[330,810],[0,810]];
    const shape=new T.Shape();
    footprint.forEach(([x,z],i)=>{
      const p=world(x,z);
      if(!i)shape.moveTo(p.x,-p.z);
      else shape.lineTo(p.x,-p.z)
    });
    shape.closePath();
    const slabKey='floor-slab';
    if(!this.geometry.has(slabKey)){
      const geometry=new T.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:true,bevelThickness:.015,bevelSize:.015,bevelSegments:2,steps:1});
      geometry.rotateX(-Math.PI/2);
      this.geometry.set(slabKey,geometry)
    }
    this.mesh(this.geometry.get(slabKey),m.base,0,-.10,0);
    this.box(510,162,770,80,.012,.022,m.corridor);
    this.box(165,500,80,605,.012,.022,m.corridor);
    this.box(855,500,80,605,.012,.022,m.corridor);
    for(const z of [124,200])this.box(510,z,770,2,.004,.031,m.corridorEdge);
    for(const x of [127,203,817,893])this.box(x,500,2,605,.004,.031,m.corridorEdge);
    const shadow=new T.Mesh(new T.PlaneGeometry(28,24),new T.ShadowMaterial({color:'#32473c',opacity:this.dark?.17:.13}));
    shadow.rotation.x=-Math.PI/2;
    shadow.position.y=-.14;
    shadow.receiveShadow=true;
    this.content.add(shadow);
    shadow.userData.transient=true;
    this.garden(m);
    this.roomCenters.clear();
    for(const room of rooms) {
      const {x,z,w,d}=this.roomGeometry(room),meta={roomId:room.id},pharmacy=room.type==='pharmacy';
      const available=room.beds.some(b=>b.status==='Available');
      const floorMat=pharmacy?m.pharmacy:room.call?m.urgent:available?m.available:m.floor;
      this.box(x+w/2,z+d/2,w-2,d-2,.025,.017,floorMat,meta,true);
        // Cutaway walls are intentionally low; the open corridor edge remains readable.


      this.box(x+w/2,z+2,w,4,.38,.20,m.wall,meta);
      this.box(x+2,z+d/2,4,d,.38,.20,m.wall,meta);
      this.box(x+w/2,z+3,w,2,.045,.04,m.trim,meta);
      this.box(x+3,z+d/2,2,d,.045,.04,m.trim,meta);
      const paint=pharmacy?m.pharmacyWall:room.index<12?m.wardA:m.wardB;
      this.box(x+w/2,z+4.2,w-4,1,.15,.12,paint,meta);
      this.box(x+4.2,z+d/2,1,d-4,.15,.12,paint,meta);
      this.box(x+10,z+d-1,18,3,.12,.07,m.wall,meta);
      if(pharmacy)this.pharmacy(room,x,z,m,metal,meta);
      else room.beds.forEach((bed,index)=>this.bed(bed,room,x+17+index*49,z+21,m,metal));
      if(room.call)this.sphere(x+109,z+d-12,.032,.15,this.material('#ff6657',.5,{emissive:'#e34732',emissiveIntensity:.25}));
      const center=world(x+w/2,z+d*.67,.53);
      this.roomCenters.set(room.id,{center,room,x,z,w,d});
    }
      // A compact nursing desk connects the wings without adding another room type.


    this.box(409,155,68,36,.28,.15,m.wall,null,true);
    this.box(409,155,72,41,.035,.315,m.wood,null,true);
    this.box(414,148,21,4,.13,.40,m.frame,null,true);
    this.box(414,147,17,1,.085,.40,this.material(this.dark?'#375a4c':'#557e6d'));
    this.box(384,155,8,23,.28,.15,m.mint,null,true);
    this.batchStaticMeshes();
    const outlineMaterial=new T.LineBasicMaterial({color:this.dark?'#8bd3a0':'#0a8e3f',transparent:true,opacity:.9});
    this.outlines=new Map();
    for(const [id,entry] of this.roomCenters){
      const geometry=new T.EdgesGeometry(this.boxGeometry(U(entry.w-3),.032,U(entry.d-3)));
      const line=new T.LineSegments(geometry,outlineMaterial);
      const center=world(entry.x+entry.w/2,entry.z+entry.d/2,.047);
      line.position.copy(center);
      line.visible=false;
      line.userData.transient=true;
      this.content.add(line);
      this.outlines.set(id,line)
    }
    this.createSelectionHalo();
    this.renderer.shadowMap.needsUpdate=true;
  }
  garden(m) {
    this.box(510,506,320,545,.035,-.012,m.garden,null,true);
    this.box(510,502,44,516,.025,.016,m.gardenPath);
    this.box(510,485,285,36,.027,.018,m.gardenPath);
    const positions=[[385,295],[610,295],[385,405],[610,405],[385,625],[610,625],[385,725],[610,725]];
    positions.forEach(([x,z],index)=>{
      this.box(x,z,43,43,.10,.035,m.wood,null,true);
      this.box(x,z,38,38,.018,.095,this.material(this.dark?'#30563a':'#b8cfb1'),null,true);
      this.cylinder(x,z,.024,.34,.25,this.material(this.dark?'#6c7660':'#a4ac8c'));
      this.sphere(x,z,.20,.48,index%2?m.plant:m.leaf,[1,1.15,1]);
      this.sphere(x+10,z+1,.15,.48,m.plant,[1,1,1]);
      this.sphere(x-6,z+8,.13,.59,m.leaf);
    });
    for(const [x,z] of [[439,355],[574,355],[439,610],[574,610]]){
      this.box(x,z,44,14,.045,.15,m.wood,null,true);
      this.box(x,z+7,44,3,.13,.23,m.wood,null,true);
      this.box(x-15,z,3,12,.12,.075,m.trim);
      this.box(x+15,z,3,12,.12,.075,m.trim);
    }
    this.box(510,558,112,37,.09,.045,m.trim,null,true);
    this.box(510,558,101,26,.012,.095,this.material(this.palette.water,.24,{metalness:.15}),null,true);
    this.cylinder(510,558,.025,.06,.13,m.wall);
  }
  bed(bed,room,x,z,m,metal) {
    const meta={roomId:room.id,bedId:bed.id},available=bed.status==='Available',cleaning=bed.status==='Cleaning';
    for(const [dx,dz] of [[5,6],[34,6],[5,49],[34,49]])this.box(x+dx,z+dz,3,3,.07,.07,metal,meta);
    this.box(x+19.5,z+27.5,39,55,.055,.12,m.frame,meta,true);
    this.box(x+19.5,z+27,36,53,.09,.19,m.linen,meta,true);
    this.box(x+19.5,z+10,28,13,.055,.257,m.pillow,meta,true);
    this.box(x+19.5,z+36,36,29,.025,.248,cleaning?m.wood:available?m.mint:m.blanket,meta,true);
    this.box(x+19.5,z+1,39,3,.18,.18,m.frame,meta,true);
    this.box(x+19.5,z+55,39,3,.115,.16,m.frame,meta,true);
    this.box(x+42,z+9,8,12,.16,.10,m.wood,meta,true);
    if(room.index%4===0&&bed.id.endsWith('A')){
      this.cylinder(x+42,z+42,.008,.40,.22,metal,meta);
      this.cylinder(x+42,z+42,.037,.015,.027,metal,meta);
      this.box(x+42,z+40,5,3,.075,.36,this.material(this.dark?'#93b7af':'#d4e9e4',.4),meta,true);
    }
  }
  pharmacy(room,x,z,m,metal,meta) {
    const low=room.inventory.some(item=>item.quantity<item.min),accent=this.material(low?'#cfab68':this.dark?'#6caa7c':'#93bd9b');
    for(let column=0;column<3;column++){
      const cx=x+18+column*30;
      this.box(cx+12,z+16,28,20,.51,.275,m.wall,meta,true);
      this.box(cx+12,z+27,25,2,.12,.12,m.trim,meta,true);
      this.box(cx+12,z+28.5,10,1,.012,.12,metal,meta,true);
      this.box(cx+12,z+26.5,24,1,.27,.35,this.material(this.dark?'#97ad9b':'#b7d1c2',.3,{transparent:true,opacity:.47,depthWrite:false}),meta);
      this.box(cx+12,z+18,24,18,.014,.27,m.trim,meta);
      this.box(cx+12,z+18,24,18,.014,.42,m.trim,meta);
      for(let shelf=0;shelf<2;shelf++)for(let jar=0;jar<2;jar++){
        if(low&&column===1&&shelf===0)continue;
        this.cylinder(cx+6+jar*11,z+22,.021,.065,.32+shelf*.15,accent,meta);
        this.cylinder(cx+6+jar*11,z+22,.022,.013,.357+shelf*.15,m.linen,meta);
      }
    }
    this.box(x+57,z+77,77,24,.25,.145,m.wall,meta,true);
    this.box(x+57,z+77,81,28,.035,.288,m.wood,meta,true);
    this.box(x+57,z+90,56,2,.15,.14,accent,meta,true);
    this.box(x+57,z+91.5,7,1,.07,.15,m.linen,meta);
    this.box(x+57,z+91.5,3,1,.11,.15,m.linen,meta);
    this.box(x+80,z+76,15,3,.10,.355,m.frame,meta,true);
    if(!this.glowTexture){
      const canvas=document.createElement('canvas');
      canvas.width=canvas.height=64;
      const context=canvas.getContext('2d'),gradient=context.createRadialGradient(32,32,4,32,32,32);
      gradient.addColorStop(0,'#ffffff');
      gradient.addColorStop(1,'#ffffff00');
      context.fillStyle=gradient;
      context.fillRect(0,0,64,64);
      this.glowTexture=new T.CanvasTexture(canvas)
    }
    const glow=new T.Mesh(new T.PlaneGeometry(1.5,1.4),new T.MeshBasicMaterial({map:this.glowTexture,color:low?'#eab259':'#6ac188',transparent:true,opacity:this.dark?.25:.12,depthWrite:false}));
    const p=world(x+60,z+65,.035);
    glow.position.copy(p);
    glow.rotation.x=-Math.PI/2;
    glow.userData.transient=true;
    this.content.add(glow);
  }
  batchStaticMeshes() {
    const batches=new Map();
    for(const mesh of [...this.content.children]){
      if(!mesh.isMesh||mesh.userData.transient||mesh.material.transparent)continue;
      const key=mesh.geometry.uuid+'/'+mesh.material.uuid+'/'+mesh.castShadow;
      if(!batches.has(key))batches.set(key,[]);
      batches.get(key).push(mesh);
    }
    for(const meshes of batches.values()){
      if(meshes.length<2)continue;
      const first=meshes[0],batch=new T.InstancedMesh(first.geometry,first.material,meshes.length);
      batch.castShadow=first.castShadow;
      batch.receiveShadow=true;
      batch.userData.instances=[];
      meshes.forEach((mesh,index)=>{
        mesh.updateMatrix();
        batch.setMatrixAt(index,mesh.matrix);
        batch.userData.instances.push(mesh.userData);
        this.content.remove(mesh)
      });
      batch.instanceMatrix.needsUpdate=true;
      batch.computeBoundingSphere();
      this.content.add(batch);
    }
  }
  createLabels(rooms,state) {
    this.host.querySelector('.floor-labels')?.remove();
    const layer=document.createElement('div');
    layer.className='floor-labels';
    for(const room of rooms){
      const label=document.createElement('button');
      label.type='button';
      label.className='map-room-label room-label-overlay';
      label.dataset.room=room.id;
      label.dataset.selected=String(state.room===room.id);
      label.classList.toggle('pharmacy-label',room.type==='pharmacy');
      label.classList.toggle('has-call',!!room.call);
      const number=room.type==='pharmacy'?'P'+(room.index+1):room.id;
      label.textContent=number;
      label.setAttribute('aria-label',(room.type==='pharmacy'?room.name:'Room '+room.id)+(room.call?', nurse call active':''));
      label.setAttribute('aria-pressed',String(state.room===room.id));
      layer.append(label)
    }
    const staticLabels=[['Courtyard',510,514],['Medicine stores',510,-25],['West wing',165,840],['East wing',855,840]];
    for(const [name,x,z] of staticLabels){
      const element=document.createElement('span');
      element.className='map-place-label';
      element.textContent=name;
      layer.append(element);
      this.labels.push({element,point:world(x,z,.04)})
    }
    this.labels=[...rooms.map(room=>({element:layer.querySelector(`[data-room="${room.id}"]`),point:this.roomCenters.get(room.id).center})),...this.labels.filter(label=>layer.contains(label.element))];
    const floor=this.adapter.getFloor();
    const people=[[floor.spoc,'Nurse','#2b70b5',[[165,300],[165,620],[165,162],[440,162],[165,162],[165,300]],155],[floor.doctor,'Doctor','#278259',[[855,350],[855,650],[855,162],[620,162],[855,162],[855,350]],185],[floor.admin,'Administrator','#8555b4',[[350,162],[700,162],[350,162]],135]];
    this.people=people.map(([id,role,color,route,duration],index)=>{
      const staff=this.adapter.getPerson(id),element=document.createElement('button');
      element.type='button';
      element.className='scene-person map-person';
      element.dataset.contact=id;
      element.style.setProperty('--person-color',color);
      element.style.setProperty('--presence-delay',`-${((performance.now()/1000+index*2.3)%7).toFixed(2)}s`);
      element.setAttribute('aria-label',`${staff.name}, ${role}. Open contact details`);
      element.innerHTML=`<span class="map-presence-dot"></span><span class="person-label">${esc(staff.name)}</span>`;
      layer.append(element);
      const points=route.map(([x,z])=>world(x,z,.18)),lengths=[0];
      for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+points[i].distanceTo(points[i-1]));
      return{element,points,lengths,duration,index};
    });
    this.host.append(layer);
  }
  updateSelection() {
    const state=this.adapter.getState();
    this.host?.querySelectorAll('.map-room-label').forEach(label=>{
      const selected=label.dataset.room===state.room;
      label.dataset.selected=String(selected);
      label.setAttribute('aria-pressed',String(selected));
      label.classList.toggle('is-hovered',label.dataset.room===this.hovered)
    });
    this.outlines?.forEach((line,id)=>{
      line.visible=id===state.room||id===this.hovered;
    });
    this.positionSelectionHalo(state.room);
    this.invalidate();
  }
  updateCamera() {
    const s=this.adapter.getState(),aspect=this.width/this.height,phone=this.width<700;
    const h3d=Math.max(11.6,15/aspect),h2d=Math.max(12.0,12.8/aspect),frustum=T.MathUtils.lerp(h3d,h2d,s.blend);
    const zoom=s.zoom*(phone?1.32:s.panelsHidden?1.12:1);
    this.camera.left=-frustum*aspect/2;
    this.camera.right=frustum*aspect/2;
    this.camera.top=frustum/2;
    this.camera.bottom=-frustum/2;
    this.camera.zoom=this.currentOffset?T.MathUtils.lerp(this.camera.zoom,zoom,this.reduced.matches?1:.24):zoom;
    const azimuth=Math.PI/4*(1-s.blend)+s.rotation*Math.PI/180,polar=.91*(1-s.blend)+.0001;
    this.camera.position.set(20*Math.sin(polar)*Math.sin(azimuth),20*Math.cos(polar),20*Math.sin(polar)*Math.cos(azimuth));
    this.camera.lookAt(0,0,0);
    const unit=Math.min(this.width/1480,this.height/(850+440*s.blend));
    const roomWidth=phone||s.panelsHidden?0:parseFloat(getComputedStyle(this.host.closest('.map-shell')).getPropertyValue('--room-width'))||320;
    const target={x:roomWidth/2-s.panX*unit,y:-s.panY*unit};
    if(!this.currentOffset)this.currentOffset={...target};
    const ease=this.reduced.matches||this.host.closest('.is-rotating')?1:.2;
    this.currentOffset.x=T.MathUtils.lerp(this.currentOffset.x,target.x,ease);
    this.currentOffset.y=T.MathUtils.lerp(this.currentOffset.y,target.y,ease);
    this.camera.setViewOffset(this.width,this.height,this.currentOffset.x,this.currentOffset.y,this.width,this.height);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    this.cameraMoving=Math.abs(this.camera.zoom-zoom)>.002||Math.abs(this.currentOffset.x-target.x)>.3||Math.abs(this.currentOffset.y-target.y)>.3;
  }
  project(element,point) {
    const projected=point.clone().project(this.camera),x=(projected.x+1)*this.width/2,y=(1-projected.y)*this.height/2;
    element.style.left=x.toFixed(2)+'px';
    element.style.top=y.toFixed(2)+'px';
    element.style.visibility=projected.z<1&&x>-30&&x<this.width+30&&y>-30&&y<this.height+30?'visible':'hidden';
  }
  updatePresence(time) {
    const times=[0,.18,.34,.54,.69,.87,.98,1],distances=[0,0,.36,.36,.72,.72,1,1];
    for(const person of this.people){
      const phase=this.reduced.matches?0:((time/1000+person.index*21)%person.duration)/person.duration;
      let section=0;
      while(section<times.length-2&&phase>times[section+1])section++;
      const mix=(phase-times[section])/(times[section+1]-times[section]),progress=T.MathUtils.lerp(distances[section],distances[section+1],mix),distance=progress*person.lengths.at(-1);
      let segment=0;
      while(segment<person.points.length-2&&distance>person.lengths[segment+1])segment++;
      const fraction=(distance-person.lengths[segment])/Math.max(.001,person.lengths[segment+1]-person.lengths[segment]);
      this.project(person.element,person.points[segment].clone().lerp(person.points[segment+1],fraction))
    }
  }
  tick(time) {
    this.frame=0;
    if(!this.host?.isConnected||document.hidden)return;
    const active=this.adapter.getState();
    if(!active.signedIn||active.page!=='overview')return;
    const signature=[active.zoom,active.blend,active.rotation,active.panX,active.panY,active.panelsHidden].join('/');
    const cameraChanged=signature!==this.cameraKey;
    this.cameraKey=signature;
    if(this.dirty||cameraChanged||this.cameraMoving||(this.selectedId&&time-this.selectionAt<850)||time-this.lastFrame>=40){
      this.lastFrame=time;
      this.dirty=false;
      this.updateCamera();
      this.updateSelectionHalo(time);
      this.renderer.render(this.scene,this.camera);
      this.labels.forEach(label=>this.project(label.element,label.point));
      this.updatePresence(time)
    }
    if(!this.reduced.matches||this.cameraMoving)this.start();
  }
  setHovered(id) {
    this.hovered=id;
    this.updateSelection();
  }
  hit(event) {
    const rect=this.renderer.domElement.getBoundingClientRect();
    this.pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    this.raycaster.setFromCamera(this.pointer,this.camera);
    for(const hit of this.raycaster.intersectObjects(this.content.children,false)){
      const meta=hit.object.isInstancedMesh?hit.object.userData.instances?.[hit.instanceId]:hit.object.userData;
      if(meta?.roomId)return meta
    }
    return null;
  }
  pick(event) {
    const hit=this.hit(event);
    if(hit)this.adapter.onRoom(hit.roomId,hit.bedId||null);
  }
  hover(event) {
    if(event.buttons)return;
    const hit=this.hit(event),id=hit?.roomId||null;
    if(id!==this.hovered){
      this.hovered=id;
      this.updateSelection();
      this.adapter.onHover?.(id)
    }
    this.renderer.domElement.style.cursor=id?'pointer':'grab';
  }
  snapshot() {
    if(!this.host?.isConnected)return null;
    this.renderer.render(this.scene,this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }
  inputUnit() {
    return Math.min(this.width/1480,this.height/(850+440*this.adapter.getState().blend));
  }
  stats() {
    return{engine:'Three.js '+T.REVISION,webgl:!!this.renderer.getContext(),calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,geometries:this.renderer.info.memory.geometries,rooms:this.roomCenters.size,labels:this.labels.length,staff:this.people.length};
  }
  }
  window.AspatalFloorPlan=ArchitecturalFloor;
})();
