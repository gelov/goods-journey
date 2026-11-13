'use strict';
/* ================= GL ================= */
const cv=$('#stage');let gl,PR={},FB={};const GLS={w:1,h:1,cw:1,ch:1};
const VS=`attribute vec3 aP,aN,aC,aD;uniform mat4 uVP,uM,uL;uniform float uT,uGrow;varying vec3 vN,vC,vW,vD;varying vec4 vS;varying float vZ;
void main(){vec4 w=uM*vec4(aP,1.);w.x+=sin(uT*1.6+w.x*.35+w.z*.27)*aD.y*.13;w.z+=cos(uT*1.3+w.x*.21)*aD.y*.08;if(w.y>0.)w.y*=uGrow;
vN=mat3(uM)*aN;vC=aC;vW=w.xyz;vD=aD;vS=uL*vec4(w.xyz+normalize(vN)*.22,1.);gl_Position=uVP*w;vZ=gl_Position.z*.5+.5;}`;
/* main surface shader. uSty 0 = cartoon (soft clay look), 1 = industrial (metal, glass, corrugated sheet, grain, sky reflections, filmic tone) */
const FS=`precision highp float;varying vec3 vN,vC,vW,vD;varying vec4 vS;uniform vec3 uKey,uEye;uniform sampler2D uSh;uniform float uT,uFocus,uHover,uBias,uFade,uSty;uniform vec2 uCen,uR;
float up(vec4 c){return dot(c,vec4(1.,1./255.,1./65025.,1./16581375.));}
float shadow(){vec3 s=vS.xyz/vS.w*.5+.5;if(s.x<0.||s.x>1.||s.y<0.||s.y>1.||s.z>1.)return 1.;float a=0.;for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++)a+=(s.z-uBias>up(texture2D(uSh,s.xy+vec2(float(i),float(j))/2048.)))?0.:1.;return a/9.;}
float hh(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hh(i),hh(i+vec3(1,0,0)),f.x),mix(hh(i+vec3(0,1,0)),hh(i+vec3(1,1,0)),f.x),f.y),mix(mix(hh(i+vec3(0,0,1)),hh(i+vec3(1,0,1)),f.x),mix(hh(i+vec3(0,1,1)),hh(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){vec3 N=normalize(vN),c=vC;float mat=vD.z;vec3 Vd=normalize(uEye-vW);bool water=mat>.5&&mat<1.5;
if(mat>1.5&&mat<2.5){c=c*(.9+.3*sin(uT*3.+vW.x*.2));}
else if(uSty<.5){
 if(water){float r=sin(vW.x*.8+uT*1.1)*sin(vW.z*1.0-uT*.8)+sin((vW.x+vW.z)*.3+uT*.5);c+=vec3(.03,.045,.05)*r*clamp(90./length(uEye-vW),0.,1.);N=normalize(N+vec3(.07*sin(vW.x*1.3+uT),0.,.07*cos(vW.z*1.1+uT*.8)));}
 float sh=shadow(),ndl=max(dot(N,uKey),0.),h=N.y*.5+.5;
 vec3 amb=mix(vec3(.47,.44,.48),vec3(.64,.68,.75),h);
 c=c*(amb+vec3(.66,.61,.52)*ndl*sh);
 c+=pow(1.-max(dot(N,Vd),0.),3.)*.09;
 if(water)c+=pow(max(dot(N,normalize(uKey+Vd)),0.),70.)*.45*sh;}
else{
 float gl=mat>3.5&&mat<4.5?1.:(mat>2.5?.5:.06);
 if(mat>4.5&&abs(N.y)<.5){vec3 tg=normalize(cross(N,vec3(0.,1.,0.)));N=normalize(N+tg*sin(dot(vW,tg)*10.)*.4);}
 if(water){gl=1.;c=vec3(.05,.16,.24);float d=clamp(120./length(uEye-vW),0.,1.);N=normalize(N+d*vec3(.1*sin(vW.x*1.7+uT*1.1)+.05*sin(vW.z*4.3-uT*1.6),0.,.1*cos(vW.z*1.4+uT*.9)+.05*sin(vW.x*3.9+uT*1.3)));}
 else if(mat<.5){c*=.84+.3*(vn(vW*1.9)*.6+vn(vW*8.)*.4);}
 float sh=shadow(),ndl=max(dot(N,uKey),0.),h=N.y*.5+.5;
 vec3 amb=mix(vec3(.26,.25,.26),vec3(.46,.52,.62),h);
 vec3 dif=c*(amb+vec3(1.1,1.,.84)*ndl*sh);
 vec3 Rf=reflect(-Vd,N);vec3 env=Rf.y>0.?mix(vec3(.66,.70,.74),vec3(.28,.42,.66),clamp(Rf.y*1.4,0.,1.)):mix(vec3(.66,.70,.74),vec3(.22,.22,.2),clamp(-Rf.y*3.,0.,1.));
 float fr=pow(1.-max(dot(N,Vd),0.),5.),k=clamp(gl*gl*.22+fr*(.15+.75*gl),0.,.85);
 c=mix(dif,env*(.4+.6*sh),k)+pow(max(dot(N,normalize(uKey+Vd)),0.),mix(14.,110.,gl))*(.05+gl)*sh;
 c=(c*(2.51*c+.03))/(c*(2.43*c+.59)+.14);}
float f=step(abs(vD.x-uFocus),.5)*step(.5,vD.x);c+=f*(.13+.1*sin(uT*4.))*vec3(1.,.9,.55);
float hv=step(abs(vD.x-uHover),.5)*step(.5,vD.x);c+=hv*.09;
gl_FragColor=vec4(c,uFade*(1.-smoothstep(uR.x,uR.y,length(vW.xz-uCen))));}`;
const FSH=`precision highp float;varying float vZ;varying vec3 vN,vC,vW,vD;varying vec4 vS;void main(){vec4 e=fract(vec4(1.,255.,65025.,16581375.)*vZ);e-=e.yzww*vec4(1./255.,1./255.,1./255.,0.);gl_FragColor=e;}`;
const FPK=`precision highp float;varying vec3 vD;varying float vZ;varying vec3 vN,vC,vW;varying vec4 vS;void main(){float id=floor(vD.x+.5);gl_FragColor=vec4(mod(id,256.)/255.,floor(id/256.)/255.,0.,1.);}`;
const VP=`attribute vec3 aP;attribute vec4 aA;uniform mat4 uVP;uniform float uPx;varying vec3 vC;void main(){gl_Position=uVP*vec4(aP,1.);gl_PointSize=clamp(aA.x*uPx/gl_Position.w,1.5,48.);vC=aA.yzw;}`;
const FP=`precision mediump float;varying vec3 vC;uniform float uA;void main(){float d=length(gl_PointCoord-.5)*2.;float a=smoothstep(1.,.25,d);gl_FragColor=vec4(vC,a*.92*uA);}`;
/* globe: textured sphere, sun lighting, ocean glint, close-up detail noise, atmosphere */
const VG=`attribute vec3 aP;uniform mat4 uVP;varying vec3 vP;void main(){vP=aP;gl_Position=uVP*vec4(aP,1.);}`;
const FG=`precision highp float;varying vec3 vP;uniform sampler2D uTex;uniform vec3 uSun,uEye;uniform float uDet,uAtm;
float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){vec3 N=normalize(vP),V=normalize(uEye-vP);float ndv=dot(N,V);
if(uAtm>.5){float k=clamp(-ndv*4.4,0.,1.);gl_FragColor=vec4(vec3(.32,.58,1.)*pow(k,1.5)*.8,1.);return;}
vec2 uv=vec2(atan(N.x,N.z)/6.2831853+.5,.5-asin(clamp(N.y,-1.,1.))/3.14159265);
vec3 c=texture2D(uTex,uv).rgb;float water=smoothstep(.0,.1,c.b-max(c.r,c.g)+.02);
float n=vn(N*700.)*.45+vn(N*2800.)*.35+vn(N*11000.)*.2;c*=1.+uDet*(n-.5)*mix(1.1,.35,water);
float ndl=max(dot(N,uSun),0.);c*=.42+.82*ndl;c=pow(c,vec3(.86))*1.12;
c+=water*pow(max(dot(N,normalize(uSun+V)),0.),50.)*.3;
c=mix(c,vec3(.52,.72,1.),pow(1.-max(ndv,0.),3.2)*.6);gl_FragColor=vec4(c,1.);}`;
/* route ribbons on the globe */
const VR=`attribute vec3 aP;attribute vec4 aC;attribute float aT;uniform mat4 uVP;varying vec3 vP;varying vec4 vC;varying float vT;void main(){vP=aP;vC=aC;vT=aT;gl_Position=uVP*vec4(aP,1.);}`;
const FR=`precision highp float;varying vec3 vP;varying vec4 vC;varying float vT;uniform vec3 uEye;uniform float uT,uA,uCull,uPul;
void main(){if(uCull>.5&&dot(normalize(vP),uEye)<1.)discard;float a=abs(vC.a);if(vC.a<0.)a*=step(.5,fract(vT*70.));if(uPul>.5)a*=.15+.85*pow(.5+.5*sin(vT*46.-uT*3.2),6.);gl_FragColor=vec4(vC.rgb,a*uA);}`;
function prog(v,f){const mk=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(o));return o};
 const p=gl.createProgram();gl.attachShader(p,mk(gl.VERTEX_SHADER,v));gl.attachShader(p,mk(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));
 const o={p,a:{},u:{}};for(let i=0,n=gl.getProgramParameter(p,gl.ACTIVE_ATTRIBUTES);i<n;i++){const k=gl.getActiveAttrib(p,i).name;o.a[k]=gl.getAttribLocation(p,k)}
 for(let i=0,n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);i<n;i++){const k=gl.getActiveUniform(p,i).name;o.u[k]=gl.getUniformLocation(p,k)}return o}
function fbo(w,h){const f=gl.createFramebuffer(),t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 for(const k of[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.NEAREST);for(const k of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
 const d=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,d);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,d);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return{f,t,d,w,h}}
function upload(arr){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);return{b,n:arr.length/12}}
function bindMesh(p,m){gl.bindBuffer(gl.ARRAY_BUFFER,m.b);const L=[['aP',0],['aN',3],['aC',6],['aD',9]];for(const[k,o]of L){const l=p.a[k];if(l==null||l<0)continue;gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,3,gl.FLOAT,false,48,o*4)}}
