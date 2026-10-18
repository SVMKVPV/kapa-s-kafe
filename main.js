let THREE; // 3D is optional; navigation and scroll UX load independently.

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lowPower = window.matchMedia("(max-width: 700px)").matches;
const motion = { progress: 0, smoothed: 0, mouseX: 0, mouseY: 0 };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smoother = (a, b, value) => { const t = clamp((value-a)/(b-a)); return t*t*(3-2*t); };
const seededRandom = (() => { let seed = 43117; return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }; })();

function initChrome() {
  const header = $(".site-header");
  const tracker = $(".chapter-tracker");
  const progressFill = $("#progress-fill");
  const trackerNumber = $("#tracker-number");
  const captions = ["01 — THE ORIGIN", "02 — THE TRANSFORMATION", "03 — THE FOUNDATION", "04 — THE EXTRACTION", "05 — THE CONNECTION"];
  const stage = $(".scene-fixed");
  const chapters = $$(".chapter");
  const story = $(".story");
  const menu = $(".menu-toggle");
  const mobile = $("#mobile-menu");

  function onScroll() {
    const y = window.scrollY;
    const storyStart = story.getBoundingClientRect().top + y;
    const sceneEnd = storyStart + story.offsetHeight - innerHeight;
    motion.progress = clamp((y - storyStart) / Math.max(sceneEnd - storyStart, 1)) * 4;
    const current = Math.min(4, Math.round(motion.progress));
    trackerNumber.textContent = `0${current + 1} / 05`;
    progressFill.style.height = `${(motion.progress / 4) * 100}%`;
    $("#scene-caption").textContent = captions[current];
    const hiding = y > storyStart + story.offsetHeight - innerHeight * .35;
    stage.style.opacity = hiding ? "0" : "1";
    tracker.style.opacity = hiding ? "0" : "1";
    header.classList.toggle("is-solid", y > 80);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  menu.addEventListener("click", () => {
    const expanded = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", String(!expanded));
    menu.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
    mobile.hidden = expanded;
  });
  mobile.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    mobile.hidden = true;
    menu.setAttribute("aria-expanded", "false");
  }));

  $("#copyright-year").textContent = String(new Date().getFullYear());
  const cursor = $(".cursor-glow");
  if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", event => {
      motion.mouseX = ((event.clientX / innerWidth) - .5) * 2;
      motion.mouseY = ((event.clientY / innerHeight) - .5) * 2;
      cursor.style.left = event.clientX + "px";
      cursor.style.top = event.clientY + "px";
    }, { passive: true });
  }

  const cityInput = $("#city-name");
  const cityResult = $("#city-result");
  function updateDestination() {
    const city = cityInput.value.trim().replace(/\s+/g, " ");
    cityResult.textContent = city ? city.toLocaleUpperCase().slice(0, 36) : "YOUR CITY";
  }
  $("#city-update").addEventListener("click", updateDestination);
  cityInput.addEventListener("keydown", event => { if(event.key === "Enter"){ event.preventDefault(); updateDestination(); } });

  const bag = $("#bag-wrap");
  if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    bag.addEventListener("pointermove", event => {
      const r = bag.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - .5;
      const y = (event.clientY - r.top) / r.height - .5;
      bag.style.transform = `perspective(850px) rotateY(${x * 23}deg) rotateX(${-y * 12}deg)`;
    });
    bag.addEventListener("pointerleave", () => { bag.style.transform = ""; });
  }
  bag.addEventListener("focus", () => { bag.style.transform = "perspective(850px) rotateY(12deg)"; });
  bag.addEventListener("blur", () => { bag.style.transform = ""; });

  // Progressive enhancement: all text and navigation work without GSAP.
  if (window.gsap && window.ScrollTrigger && !reducedMotion) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray(".chapter-content").forEach((content) => {
      gsap.fromTo(content, { y: 42, opacity: .35 }, {
        y: 0, opacity: 1, ease: "none",
        scrollTrigger: { trigger: content.parentElement, start: "top 90%", end: "center center", scrub: true }
      });
    });
    gsap.utils.toArray(".origin-copy,.collection-head,.collection-details,.route-head").forEach((el) => {
      gsap.from(el, { y: 45, opacity: 0, duration: 1.15, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    gsap.to("#route-line", { strokeDashoffset: 0, duration: 2.5, ease: "power2.out", scrollTrigger: { trigger: ".route-map", start: "top 83%", once: true } });
    gsap.fromTo(".coffee-bag", { y: 90, rotate: -13, scale: .87 }, {
      y: 0, rotate: 0, scale: 1, ease: "power2.out",
      scrollTrigger: { trigger: ".collection-grid", start: "top 95%", end: "center center", scrub: true }
    });
  } else {
    $("#route-line").style.strokeDashoffset = "0";
  }
}
initChrome();

// Minimal procedural 3D models: no large downloads or video backgrounds.
function setupScene() {
  const mount = $("#webgl-stage");
  if (reducedMotion) {
    document.body.classList.add("no-webgl");
    return;
  }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: true, powerPreference: "high-performance" });
  } catch (error) {
    document.body.classList.add("no-webgl");
    return;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.27;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.35 : 1.65));
  mount.appendChild(renderer.domElement);
  $(".scene-fallback").style.display = "none";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(lowPower ? 38 : 32, 1, .1, 100);
  camera.position.set(0, 1.35, lowPower ? 11.6 : 10.6);
  camera.lookAt(0, 0, 0);
  const world = new THREE.Group();
  scene.add(world);
  scene.add(new THREE.HemisphereLight(0xf2d5ad, 0x38271b, 2));
  const mainLight = new THREE.PointLight(0xffbe73, 95, 24, 1.6);
  mainLight.position.set(3.4, 4.5, 6);
  scene.add(mainLight);
  const rimLight = new THREE.PointLight(0xa1693c, 65, 20, 1.2);
  rimLight.position.set(-4, -1, -3);
  scene.add(rimLight);

  const beanMaterial = new THREE.MeshStandardMaterial({ color: 0x683b23, roughness: .78, metalness: .02 });
  const creaseMaterial = new THREE.MeshStandardMaterial({ color: 0x211009, roughness: 1 });
  function makeBean() {
    const group = new THREE.Group();
    const geometry = new THREE.SphereGeometry(1, 36, 28);
    const positions = geometry.attributes.position;
    for (let i=0; i<positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      // Flatten the bean and softly pinch the central face.
      const taper = 1 - .09 * Math.abs(y);
      positions.setXYZ(i, x * .71 * taper, y * 1.04, z * .56 - (Math.exp(-x*x*24) * Math.max(z,0) * .15));
    }
    geometry.computeVertexNormals();
    group.add(new THREE.Mesh(geometry, beanMaterial));
    const pts = [];
    for(let i=0;i<=20;i++){
      const y = -.87 + i * 1.74/20;
      pts.push(new THREE.Vector3(Math.sin(y*3.8)*.087, y, .48 * Math.sqrt(Math.max(.06,1-y*y)) + .019));
    }
    group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, .034, 6, false), creaseMaterial));
    return group;
  }

  const heroBean = makeBean();
  heroBean.scale.setScalar(1.65);
  world.add(heroBean);

  const cloud = new THREE.Group();
  const beans = [];
  for(let i=0;i<(lowPower?18:30);i++){
    const bean = makeBean();
    bean.position.set((seededRandom()-.5)*8.4,(seededRandom()-.5)*8,(seededRandom()-.5)*4);
    const s = .15+seededRandom()*.31;
    bean.scale.setScalar(s);
    bean.rotation.set(seededRandom()*6,seededRandom()*6,seededRandom()*6);
    bean.userData.spin=(seededRandom()-.5)*.003;
    bean.userData.origin=bean.position.clone();
    cloud.add(bean); beans.push(bean);
  }
  world.add(cloud);

  const dustCount = lowPower ? 420 : 920;
  const dustArr = new Float32Array(dustCount*3);
  for(let i=0;i<dustCount;i++){
    dustArr[i*3]=(seededRandom()-.5)*7;
    dustArr[i*3+1]=(seededRandom()-.5)*7;
    dustArr[i*3+2]=(seededRandom()-.5)*4;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position",new THREE.BufferAttribute(dustArr,3));
  const dust = new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xefbe7f,size:lowPower?.035:.024,transparent:true,opacity:.65,depthWrite:false}));
  world.add(dust);

  const vessel = new THREE.Group();
  const glassMat = new THREE.MeshPhysicalMaterial({color:0xe0cbb3,roughness:.06,metalness:0,transparent:true,opacity:.23,side:THREE.DoubleSide,depthWrite:false});
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(1, .82, 2.35, 48,1,true),glassMat);
  vessel.add(glass);
  const glassRim = new THREE.Mesh(new THREE.TorusGeometry(1,.035,10,60),new THREE.MeshStandardMaterial({color:0xf1d3ab,roughness:.19,transparent:true,opacity:.65}));
  glassRim.rotation.x=Math.PI/2; glassRim.position.y=1.175; vessel.add(glassRim);
  const coffeeFill=new THREE.Mesh(new THREE.CylinderGeometry(.83,.78,1,48),new THREE.MeshStandardMaterial({color:0x4b291a,roughness:1}));
  coffeeFill.position.y=-.65; vessel.add(coffeeFill);
  const fall=new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:0xc99d6a,size:.034,transparent:true,opacity:.7}));
  const falling=new Float32Array(330*3);
  for(let i=0;i<330;i++){falling[i*3]=(seededRandom()-.5)*.7;falling[i*3+1]=seededRandom()*4-1.2;falling[i*3+2]=(seededRandom()-.5)*.6;}
  fall.geometry.setAttribute("position",new THREE.BufferAttribute(falling,3));
  vessel.add(fall);
  world.add(vessel);

  function latteTexture(){
    const canvas=document.createElement("canvas");canvas.width=512;canvas.height=512;
    const ctx=canvas.getContext("2d");
    ctx.fillStyle="#6d381e";ctx.fillRect(0,0,512,512);
    const gradient=ctx.createRadialGradient(240,220,15,256,256,245);
    gradient.addColorStop(0,"#ab6942");gradient.addColorStop(.75,"#92512b");gradient.addColorStop(1,"#4f2b1a");
    ctx.fillStyle=gradient;ctx.fillRect(0,0,512,512);
    ctx.strokeStyle="#efe2c9";ctx.lineCap="round";ctx.lineJoin="round";
    // Leaf-shaped rosetta made with strokes — a stylised latte-art graphic.
    for(let i=0;i<8;i++){
      const y=128+i*31;
      const w=15+i*14;
      ctx.beginPath();ctx.moveTo(256-w,y-13);ctx.bezierCurveTo(256-w-20,y+14,256,y+34,256,y+20);
      ctx.bezierCurveTo(256,y+34,256+w+20,y+14,256+w,y-13);
      ctx.strokeStyle=i%2?"#ead5b5":"#f7e6c9";ctx.lineWidth=13-i*.65;ctx.stroke();
    }
    ctx.beginPath();ctx.moveTo(256,345);ctx.quadraticCurveTo(259,290,256,145);ctx.strokeStyle="#f5e3c5";ctx.lineWidth=8;ctx.stroke();
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
  }
  const cupGroup = new THREE.Group();
  const ceramic = new THREE.MeshStandardMaterial({color:0xf2e5d2,roughness:.32,metalness:.06});
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(.92,.68,.97,56,1,true),ceramic);
  cup.position.y=-.14; cupGroup.add(cup);
  const base = new THREE.Mesh(new THREE.CircleGeometry(.70,56),ceramic);
  base.rotation.x=-Math.PI/2;base.position.y=-.64;cupGroup.add(base);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.92,.068,12,64),ceramic);
  rim.rotation.x=Math.PI/2;rim.position.y=.35;cupGroup.add(rim);
  const handle=new THREE.Mesh(new THREE.TorusGeometry(.31,.09,12,44,Math.PI*1.75),ceramic);
  handle.position.set(1.06,-.13,0);handle.rotation.y=Math.PI/2;cupGroup.add(handle);
  const latte=new THREE.Mesh(new THREE.CircleGeometry(.875,64),new THREE.MeshBasicMaterial({map:latteTexture(),side:THREE.DoubleSide}));
  latte.rotation.x=-Math.PI/2;latte.position.y=.335;cupGroup.add(latte);
  const saucer=new THREE.Mesh(new THREE.CylinderGeometry(1.27,1.17,.095,64),ceramic);
  saucer.position.y=-.68;cupGroup.add(saucer);
  cupGroup.rotation.y=-.25;
  world.add(cupGroup);

  const streams = new THREE.Group();
  const streamMaterial = new THREE.MeshStandardMaterial({color:0x7d3e1e,roughness:.28,metalness:.1,emissive:0x371808,emissiveIntensity:.14});
  for(const x of [-.32,.32]){
    const points = [new THREE.Vector3(x,2.4,0),new THREE.Vector3(x+.02,1.85,.06),new THREE.Vector3(x*.85,1.15,.04),new THREE.Vector3(x*.45,.44,0)];
    streams.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),40,.055,8,false),streamMaterial));
  }
  world.add(streams);

  const steam = new THREE.Group();
  const steamMaterial = new THREE.MeshBasicMaterial({color:0xf0dcc6,transparent:true,opacity:.22,depthWrite:false});
  for(let i=0;i<5;i++){
    const pts=[];
    for(let j=0;j<20;j++){
      const t=j/19;
      pts.push(new THREE.Vector3((i-2)*.21+Math.sin(t*10+i)*(.06+t*.12),.45+t*1.8,Math.sin(t*7+i)*.1));
    }
    const line=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),30,.012,5,false),steamMaterial.clone());
    steam.add(line);
  }
  world.add(steam);

  function showGroup(group, amount) {
    const scale=Math.max(.001,amount);
    group.visible=amount>.025;
    group.scale.setScalar(scale);
  }
  function resize(){
    const rect=mount.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    camera.aspect=rect.width/rect.height;
    camera.fov=lowPower?42:33;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width,rect.height,false);
  }
  resize();
  window.addEventListener("resize",resize,{passive:true});

  let active=true;
  let previous=0;
  const clock = new THREE.Clock();
  function animate() {
    if(!active)return;
    requestAnimationFrame(animate);
    // Avoid rendering when the entire story is off-screen.
    if(window.scrollY > $(".story").offsetHeight + innerHeight || document.hidden){clock.getDelta();return;}
    const dt=Math.min(.045,clock.getDelta());
    motion.smoothed += (motion.progress-motion.smoothed)*Math.min(1,dt*4.8);
    const p=motion.smoothed;
    world.rotation.y += (motion.mouseX*.075-world.rotation.y)*Math.min(1,dt*2.3);
    world.rotation.x += (-motion.mouseY*.035-world.rotation.x)*Math.min(1,dt*2.3);

    // Chapter 1 -> Chapter 2: isolated bean becomes a suspended cloud.
    const singleAmount=1-smoother(.42,1.1,p);
    showGroup(heroBean,singleAmount*1.65);
    heroBean.rotation.y+=dt*.26;
    heroBean.rotation.z=.36+Math.sin(clock.elapsedTime*.33)*.085;
    heroBean.position.y=Math.sin(clock.elapsedTime*.65)*.11;
    const cloudAmount=smoother(.65,1.1,p)*(1-smoother(1.7,2.2,p));
    showGroup(cloud,cloudAmount);
    beans.forEach((bean,i)=>{
      bean.rotation.y+=dt*(i%2?-.26:.31);
      const drift = Math.sin(clock.elapsedTime*.52+i)*.11;
      bean.position.y=bean.userData.origin.y+drift+(p-1)*.14;
    });
    const dustAmount=(1-smoother(2.1,2.8,p))*smoother(.1,.7,p)+smoother(1.55,1.9,p)*(1-smoother(2.8,3.1,p));
    dust.visible=dustAmount>.05;
    dust.material.opacity=clamp(dustAmount)*.58;
    dust.rotation.y+=dt*.025;
    dust.position.y=-((p*1.6)%2.8)*.35;

    // Chapter 3: grounds accumulating inside a glass vessel.
    const vesselAmount=smoother(1.7,2.18,p)*(1-smoother(2.85,3.15,p));
    showGroup(vessel,vesselAmount*1.48);
    const fill=smoother(2,2.85,p);
    coffeeFill.scale.y=.12+fill*1.78;
    coffeeFill.position.y=-1.04+fill*.88;
    fall.visible=p>1.85&&p<2.91;
    const fallingPosition=fall.geometry.attributes.position;
    for(let i=0;i<330;i++){const current=fallingPosition.getY(i)-dt*(.75+(i%7)*.11);fallingPosition.setY(i,current < -1.1 ? 3.2 : current);}
    fallingPosition.needsUpdate=true;

    // Chapter 4 -> Chapter 5: espresso extraction turns into a finished cup.
    const cupAmount=smoother(2.75,3.2,p);
    showGroup(cupGroup,cupAmount*1.38);
    const extraction=smoother(2.75,3.2,p)*(1-smoother(3.55,3.98,p));
    showGroup(streams,extraction);
    const finalCup=smoother(3.55,4,p);
    cupGroup.rotation.y=-.25+(finalCup*-.3);
    cupGroup.rotation.x=finalCup*(-.10);
    steam.visible=p>3.05;
    steam.scale.setScalar(.7+finalCup*.6);
    steam.rotation.y=Math.sin(clock.elapsedTime*.35)*.14;
    steam.children.forEach((line,i)=>{line.material.opacity=(.09+finalCup*.15)*(1+.18*Math.sin(clock.elapsedTime+i));});
    cupGroup.position.y=-.2+finalCup*.3;
    camera.position.y+=(1.5+finalCup*.35-camera.position.y)*Math.min(1,dt*1.5);
    camera.lookAt(0,0,0);

    renderer.render(scene,camera);
    previous=p;
  }
  animate();
  const contextLost=()=>{active=false;document.body.classList.add("no-webgl");$(".scene-fallback").style.display="flex"};
  renderer.domElement.addEventListener("webglcontextlost",contextLost,{once:true});
}

import("https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js")
  .then(module => {
    THREE = module;
    try { setupScene(); } catch (error) {
      console.warn("3D scene failed to initialise; using illustrated fallback.", error);
      document.body.classList.add("no-webgl");
    }
  })
  .catch(error => {
    console.warn("3D library was unavailable; the interactive page remains usable.", error);
    document.body.classList.add("no-webgl");
  });
window.addEventListener("load", () => document.body.classList.add("ready"), { once:true });
setTimeout(() => document.body.classList.add("ready"), 1700);
