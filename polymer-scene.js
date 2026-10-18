import * as THREE from './three.module.min.js';
import {RoomEnvironment} from './studio-environment.js';
import {petalProfile} from './petal-profile.js';

const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const tips=[[.50,.012],[.974,.245],[.957,.753],[.55,.91],[.032,.716],[.043,.187]];
const center=[.512,.455];
const shapes=tips.map((tip,i)=>{const dx=tip[0]-center[0],dy=center[1]-tip[1],dist=Math.hypot(dx,dy);return{angle:Math.atan2(dy,dx),length:dist*5.05,width:[.72,.83,.80,.70,.83,.79][i],phase:i*.73}});

const deformation=`
attribute vec4 aParams;
uniform float uOpen;
uniform float uAngle;
uniform float uLength;
uniform float uWidth;
uniform float uPhase;
vec3 petalPoint(float u,float t){
 float s=clamp(t,0.0,1.0);
 float p=clamp((uOpen-.17*s)/.83,0.0,1.0);
 p=p*p*(3.0-2.0*p);
 float profile=pow(max(0.0001,sin(3.14159265*s)),.83);
 float radius=.105+.34*profile-.085*s;
 float a=uAngle+u*.52;
 vec3 closed=vec3(radius*cos(a),radius*sin(a),1.92*s);
 vec2 dir=vec2(cos(uAngle),sin(uAngle));
 vec2 side=vec2(-dir.y,dir.x);
 float uneven=1.0+.07*sin(s*8.0+uPhase)+.035*u;
 float width=uWidth*aParams.z*uneven;
 vec2 xy=dir*(.115+uLength*s)+side*(u*width+.055*sin(s*3.14159)*sin(uPhase)+aParams.w*uWidth*.42);
 float bowl=.22*sin(s*3.14159)+.34*pow(abs(u),2.4)*profile+.10*u*profile*cos(uPhase);
 float tip=.16*pow(s,5.0)*sin(uPhase+.4)+.07*u*s*s*sin(uPhase);
 float wrinkle=.008*sin(s*43.0+u*7.0+uPhase)*profile*abs(u);
 vec3 opened=vec3(xy,bowl+tip+wrinkle);
 vec3 point=mix(closed,opened,p);
 point.z+=.38*sin(p*3.14159)*s*s;
 return point;
}
`;

function makeGeometry(shape,i){
 const nx=30,ny=56,positions=[],params=[],uvs=[],indices=[];
 for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++){
  const u=x/nx*2-1,t=y/ny,profile=Math.pow(Math.max(.0001,Math.sin(Math.PI*t)),.83),row=petalProfile[y],w=shape.width*row.width*(1+.07*Math.sin(t*8+shape.phase)+.035*u),lateral=u*w+.055*Math.sin(t*Math.PI)*Math.sin(shape.phase)+row.shift*shape.width*.42;
  const z=.22*Math.sin(t*Math.PI)+.34*Math.pow(Math.abs(u),2.4)*profile+.10*u*profile*Math.cos(shape.phase)+.16*Math.pow(t,5)*Math.sin(shape.phase+.4)+.07*u*t*t*Math.sin(shape.phase)+.008*Math.sin(t*43+u*7+shape.phase)*profile*Math.abs(u);
  positions.push(Math.cos(shape.angle)*(.115+shape.length*t)-Math.sin(shape.angle)*lateral,Math.sin(shape.angle)*(.115+shape.length*t)+Math.cos(shape.angle)*lateral,z);
  params.push(u,t,row.width,row.shift);
  const textureU=i%2?1-(u+1)/2:(u+1)/2;uvs.push(row.left+(row.right-row.left)*textureU,row.v);
 }
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const a=y*(nx+1)+x,b=a+1,c=a+nx+1,d=c+1;indices.push(a,c,b,b,c,d)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('aParams',new THREE.Float32BufferAttribute(params,4));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();return g;
}

function inject(material,uniforms,normal=true){
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\n'+deformation);
  if(normal)shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`vec3 petalT=petalPoint(aParams.x,min(.999,aParams.y+.002))-petalPoint(aParams.x,max(.001,aParams.y-.002));vec3 petalU=petalPoint(aParams.x+.002,aParams.y)-petalPoint(aParams.x-.002,aParams.y);vec3 objectNormal=normalize(cross(petalT,petalU));`);
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','vec3 transformed=petalPoint(aParams.x,aParams.y);');
 };
 material.customProgramCacheKey=()=>normal?'zemskov-petal-v2':'zemskov-petal-depth-v2';
}

export async function createFlowerStage({canvas,onComplete,onSelect,onLabels}){
 const small=matchMedia('(max-width:700px)').matches;
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,small?1.15:1.6));renderer.setClearColor(0xf2f1ee,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.transmissionResolutionScale=small?.5:.75;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.1,40);camera.position.set(.45,.25,10.3);camera.lookAt(0,-.45,0);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.025).texture;room.dispose();pmrem.dispose();
 const background=document.createElement('canvas');background.width=3072;background.height=2048;const bg=background.getContext('2d');await document.fonts.ready;bg.fillStyle='#f2f1ee';bg.fillRect(0,0,3072,2048);bg.fillStyle='#202120';bg.font=small?'800 300px Manrope, Arial':'800 480px Manrope, Arial';bg.fillText('ZEM',small?760:-10,715);const wordWidth=bg.measureText('SKOV').width;bg.fillText('SKOV',(small?2300:3070)-wordWidth,1250);const typography=new THREE.CanvasTexture(background);typography.colorSpace=THREE.SRGBColorSpace;const backplate=new THREE.Mesh(new THREE.PlaneGeometry(14,9.3),new THREE.MeshBasicMaterial({map:typography,toneMapped:false}));backplate.position.set(0,-.45,-3.3);scene.add(backplate);
 const model=new THREE.Group();scene.add(model);const head=new THREE.Group();head.position.y=.28;model.add(head);
 scene.add(new THREE.AmbientLight(0xffffff,.8));
 const key=new THREE.DirectionalLight(0xffffff,3.5);key.position.set(-3.5,4.5,5);key.castShadow=true;key.shadow.mapSize.set(small?512:1024,small?512:1024);key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=3;key.shadow.camera.bottom=-3;key.shadow.camera.near=.5;key.shadow.camera.far=15;key.shadow.bias=-.001;key.shadow.normalBias=.025;scene.add(key);
 const rim=new THREE.DirectionalLight(0xe9f0fa,2.8);rim.position.set(3,1,-3);scene.add(rim);const fill=new THREE.DirectionalLight(0xffffff,.9);fill.position.set(2,-2,4);scene.add(fill);
 const meshes=[],uniformSets=[];
 for(let i=0;i<6;i++){
  const shape=shapes[i],uniforms={uOpen:{value:0},uAngle:{value:shape.angle},uLength:{value:shape.length},uWidth:{value:shape.width},uPhase:{value:shape.phase}};
  const material=new THREE.MeshPhysicalMaterial({color:0xe7eae8,roughness:small?.16:.105,metalness:0,transmission:.93,thickness:.28,ior:1.47,attenuationColor:0xcbd6d1,attenuationDistance:3.5,clearcoat:1,clearcoatRoughness:.08,dispersion:small?0:.025,envMapIntensity:1.35,side:THREE.DoubleSide,emissive:0x000000,emissiveIntensity:0});inject(material,uniforms);
  const mesh=new THREE.Mesh(makeGeometry(shape,i),material);mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=false;mesh.userData.index=i;
  const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});inject(depth,uniforms,false);mesh.customDepthMaterial=depth;head.add(mesh);meshes.push(mesh);uniformSets.push(uniforms);
 }
 const stemMat=new THREE.MeshStandardMaterial({color:0x1a1c1c,roughness:.44,metalness:.55});
 const stemCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(.07,-3.05,-.23),new THREE.Vector3(-.10,-2.05,-.17),new THREE.Vector3(.05,-.92,-.1),new THREE.Vector3(0,.28,0)]);
 const stem=new THREE.Mesh(new THREE.TubeGeometry(stemCurve,42,.025,7,false),stemMat);model.add(stem);
 const leafGeo=new THREE.BufferGeometry(),lp=[],lu=[],li=[];for(let j=0;j<=26;j++)for(let k=0;k<=12;k++){const t=j/26,u=k/12*2-1,w=.29*Math.pow(Math.sin(Math.PI*t),.8);lp.push(.06+1.06*t,-1.72+.58*t+u*w,-.15+.21*Math.sin(t*Math.PI)+.12*u*u);lu.push(.61+.28*t,1-(.84+.1*t+u*w*.18))}for(let j=0;j<26;j++)for(let k=0;k<12;k++){const a=j*13+k;li.push(a,a+13,a+1,a+1,a+13,a+14)}leafGeo.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));leafGeo.setAttribute('uv',new THREE.Float32BufferAttribute(lu,2));leafGeo.setIndex(li);leafGeo.computeVertexNormals();const leaf=new THREE.Mesh(leafGeo,new THREE.MeshStandardMaterial({color:0x303434,side:THREE.DoubleSide,roughness:.95}));leaf.visible=false;model.add(leaf);
 const core=new THREE.Group();head.add(core);const gold=new THREE.MeshStandardMaterial({color:0x999d99,roughness:.3,metalness:1}),base=new THREE.Mesh(new THREE.SphereGeometry(.17,24,18),new THREE.MeshStandardMaterial({color:0xadb2af,roughness:.17,metalness:1}));base.scale.set(1,1,.8);core.add(base);
 const n=190,pollen=new THREE.InstancedMesh(new THREE.CapsuleGeometry(.012,.025,3,6),gold,n),dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),fp=[],fn=[],fi=[];
 for(let i=0;i<n;i++){
  const theta=i*2.399963,r=Math.sqrt((i+.5)/n)*.27,h=.19+.26*(1-r/.37)+.025*Math.sin(i*3.1),start=new THREE.Vector3(Math.cos(theta)*r*.55,Math.sin(theta)*r*.55,.06),end=new THREE.Vector3(Math.cos(theta)*r*1.48,Math.sin(theta)*r*1.48,h);
  const control=start.clone().lerp(end,.55);control.z+=.09;control.x+=.025*Math.sin(i*.7);control.y+=.025*Math.cos(i*.9);
  const curve=new THREE.QuadraticBezierCurve3(start,control,end),tube=new THREE.TubeGeometry(curve,7,.0045,5,false),offset=fp.length/3;
  fp.push(...tube.attributes.position.array);fn.push(...tube.attributes.normal.array);fi.push(...Array.from(tube.index.array,index=>index+offset));tube.dispose();
  dummy.position.copy(end);dummy.quaternion.setFromUnitVectors(up,curve.getTangent(1).normalize());dummy.scale.setScalar(.88+.16*Math.sin(i*2.1));dummy.updateMatrix();pollen.setMatrixAt(i,dummy.matrix);pollen.setColorAt(i,new THREE.Color().setHSL(.15,.015,.5+.15*Math.sin(i*1.7)));
 }const filGeo=new THREE.BufferGeometry();filGeo.setAttribute('position',new THREE.Float32BufferAttribute(fp,3));filGeo.setAttribute('normal',new THREE.Float32BufferAttribute(fn,3));filGeo.setIndex(fi);const filaments=new THREE.Mesh(filGeo,new THREE.MeshStandardMaterial({color:0x686c69,roughness:.38,metalness:1}));core.add(filaments,pollen);core.position.z=.035;
 const chrome=new THREE.MeshStandardMaterial({color:0xc9cecc,metalness:1,roughness:.2,envMapIntensity:1.4}),dark=new THREE.MeshStandardMaterial({color:0x171b19,roughness:.55,metalness:.35});
 const vessel=new THREE.Group();vessel.position.y=-3.03;model.add(vessel);const shell=new THREE.Mesh(new THREE.CylinderGeometry(.62,.71,1.05,72),chrome);shell.castShadow=true;vessel.add(shell);const rimMesh=new THREE.Mesh(new THREE.TorusGeometry(.56,.075,16,72),chrome);rimMesh.rotation.x=Math.PI/2;rimMesh.position.y=.54;vessel.add(rimMesh);const opening=new THREE.Mesh(new THREE.CylinderGeometry(.51,.51,.025,60),dark);opening.position.y=.54;vessel.add(opening);const band=new THREE.Mesh(new THREE.TorusGeometry(.659,.013,8,72),new THREE.MeshStandardMaterial({color:0xb29668,metalness:.8,roughness:.3}));band.rotation.x=Math.PI/2;band.position.y=-.05;vessel.add(band);
 for(const direction of [-1,1]){const cableCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(direction*.15,-2.48,0),new THREE.Vector3(direction*.42,-1.95,.1),new THREE.Vector3(direction*.72,-1.35,.02),new THREE.Vector3(direction*.55,-.8,.02),new THREE.Vector3(0,.28,0)]);model.add(new THREE.Mesh(new THREE.TubeGeometry(cableCurve,48,.017,7),dark))}
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({color:0x727875,opacity:.13}));ground.rotation.x=-Math.PI/2;ground.position.y=-3.57;ground.receiveShadow=true;scene.add(ground);
 const gridPoints=[];for(let n=-12;n<=12;n++){for(let k=-24;k<24;k++){const x=n*.5,z=k*.25;gridPoints.push(x,-3.555,z,x,-3.555,z+.25,z,-3.555,x,z+.25,-3.555,x)}}const gridGeometry=new THREE.BufferGeometry();gridGeometry.setAttribute('position',new THREE.Float32BufferAttribute(gridPoints,3));scene.add(new THREE.LineSegments(gridGeometry,new THREE.LineBasicMaterial({color:0xc5c9c6,transparent:true,opacity:.22})));
 const motion=matchMedia('(prefers-reduced-motion:reduce)');let request=0,started=0,running=false,done=false,progress=0,selected=-1,hovered=-1,dragging=false,lastX=0,lastY=0,moved=0,yaw=.18,pitch=0,targetYaw=.18,targetPitch=0;
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
 function labels(){head.updateMatrixWorld(true);const points=shapes.map(shape=>{const v=new THREE.Vector3(Math.cos(shape.angle)*shape.length*.69,Math.sin(shape.angle)*shape.length*.69,.16);head.localToWorld(v);v.project(camera);return{x:(v.x+1)*50,y:(1-v.y)*50}});onLabels?.(points)}
 function size(){const width=canvas.parentElement.clientWidth,height=canvas.parentElement.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();invalidate()}
 function frame(now){request=0;if(running){progress=clamp((now-started)/5400);if(progress>=1){running=false;done=true}}
  const ease=smooth(progress);for(let i=0;i<6;i++)uniformSets[i].uOpen.value=smooth(clamp((progress-.035*i)/(.825)));
  head.rotation.x=THREE.MathUtils.lerp(-1.24,-.32,ease);head.rotation.y=.17*Math.sin(progress*Math.PI);core.scale.setScalar(.23+.77*smooth((progress-.28)/.65));
  yaw=THREE.MathUtils.lerp(yaw,targetYaw,.13);pitch=THREE.MathUtils.lerp(pitch,targetPitch,.13);model.rotation.y=yaw;model.rotation.x=pitch;
  const light=.18+.82*smooth(progress/.22);key.intensity=3.5*light;rim.intensity=2.8*light;
  let lightChanging=false;for(let i=0;i<6;i++){const target=(i===hovered||i===selected)? .025:0,material=meshes[i].material;material.emissiveIntensity=THREE.MathUtils.lerp(material.emissiveIntensity,target,.17);if(Math.abs(material.emissiveIntensity-target)>.0004)lightChanging=true}
  renderer.render(scene,camera);labels();canvas.dataset.progress=progress.toFixed(3);canvas.dataset.renderer='webgl';
  if(done){done=false;canvas.dataset.state='open';onComplete?.()}
  if(running||lightChanging||Math.abs(yaw-targetYaw)>.0002||Math.abs(pitch-targetPitch)>.0002)request=requestAnimationFrame(frame);
 }
 function invalidate(){if(!request)request=requestAnimationFrame(frame)}
 function finish(){running=false;progress=1;done=true;invalidate()}
 function play(){if(motion.matches){finish();return}progress=0;started=performance.now();running=true;done=false;targetYaw=.18;targetPitch=0;canvas.dataset.state='opening';invalidate()}
 function intersect(event){const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(meshes)[0]?.object.userData.index??-1}
 canvas.addEventListener('pointerdown',event=>{if(progress<1)return;dragging=true;lastX=event.clientX;lastY=event.clientY;moved=0;canvas.setPointerCapture(event.pointerId)});
 canvas.addEventListener('pointermove',event=>{if(progress<1)return;if(dragging){const dx=event.clientX-lastX,dy=event.clientY-lastY;moved+=Math.abs(dx)+Math.abs(dy);targetYaw=clamp(targetYaw+dx*.004,-.55,.55);targetPitch=clamp(targetPitch+dy*.003,-.25,.25);lastX=event.clientX;lastY=event.clientY;invalidate()}else{const hit=intersect(event);if(hit!==hovered){hovered=hit;canvas.style.cursor=hit<0?'grab':'pointer';invalidate()}}});
 canvas.addEventListener('pointerup',event=>{if(!dragging)return;dragging=false;if(moved<7){const hit=intersect(event);if(hit>=0)onSelect?.(hit)}});canvas.addEventListener('pointercancel',()=>dragging=false);canvas.addEventListener('pointerleave',()=>{hovered=-1;invalidate()});
 canvas.tabIndex=0;canvas.setAttribute('aria-label','Объёмный цветок. Поверните перетаскиванием или клавишами со стрелками.');canvas.addEventListener('keydown',event=>{if(progress<1)return;let handled=true;if(event.key==='ArrowLeft')targetYaw=clamp(targetYaw-.14,-.55,.55);else if(event.key==='ArrowRight')targetYaw=clamp(targetYaw+.14,-.55,.55);else if(event.key==='ArrowUp')targetPitch=clamp(targetPitch-.08,-.25,.25);else if(event.key==='ArrowDown')targetPitch=clamp(targetPitch+.08,-.25,.25);else if(event.key==='Home'){targetYaw=.18;targetPitch=0}else handled=false;if(handled){event.preventDefault();invalidate()}});
 const observer=new ResizeObserver(size);observer.observe(canvas.parentElement);size();await renderer.compileAsync(scene,camera);renderer.render(scene,camera);canvas.dataset.ready='true';
 return{play,finish,select(index){selected=index;invalidate()},dispose(){observer.disconnect();cancelAnimationFrame(request);renderer.dispose()},get progress(){return progress}};
}



