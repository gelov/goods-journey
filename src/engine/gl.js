'use strict';
/* ================= GL ================= */
const cv=$('#stage');let gl,PR={},FB={};const GLS={w:1,h:1,cw:1,ch:1};
const VS=`attribute vec3 aP,aN,aC,aD;uniform mat4 uVP,uM,uL;uniform float uT,uGrow;varying vec3 vN,vC,vW,vD;varying vec4 vS;varying float vZ;
void main(){vec4 w=uM*vec4(aP,1.);w.x+=sin(uT*1.6+w.x*.35+w.z*.27)*aD.y*.13;w.z+=cos(uT*1.3+w.x*.21)*aD.y*.08;if(w.y>0.)w.y*=uGrow;
vN=mat3(uM)*aN;vC=aC;vW=w.xyz;vD=aD;vS=uL*vec4(w.xyz+normalize(vN)*.22,1.);gl_Position=uVP*w;vZ=gl_Position.z*.5+.5;}`;
/* main surface shader. uSty 0 = cartoon (soft clay look), 1 = industrial (metal, glass, corrugated sheet, grain, sky reflections, filmic tone) */
const FS=`precision highp float;varying vec3 vN,vC,vW,vD;varying vec4 vS;uniform vec3 uKey,uEye;uniform sampler2D uSh;uniform float uT,uFocus,uHover,uTrk,uTrkA,uGls,uBias,uFade,uSty;uniform vec2 uCen,uR;
float up(vec4 c){return dot(c,vec4(1.,1./255.,1./65025.,1./16581375.));}
float shadow(){vec3 s=vS.xyz/vS.w*.5+.5;if(s.x<0.||s.x>1.||s.y<0.||s.y>1.||s.z>1.)return 1.;float a=0.;for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++)a+=(s.z-uBias>up(texture2D(uSh,s.xy+vec2(float(i),float(j))/2048.)))?0.:1.;return a/9.;}
float hh(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hh(i),hh(i+vec3(1,0,0)),f.x),mix(hh(i+vec3(0,1,0)),hh(i+vec3(1,1,0)),f.x),f.y),mix(mix(hh(i+vec3(0,0,1)),hh(i+vec3(1,0,1)),f.x),mix(hh(i+vec3(0,1,1)),hh(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){vec3 N=normalize(vN),c=vC;float mat=vD.z;vec3 Vd=normalize(uEye-vW);bool water=mat>.5&&mat<1.5;
if(mat>1.5&&mat<2.5){c=c*(.9+.3*sin(uT*3.+vW.x*.2));}
else if(uSty<.5){
 /* diorama look: each surface gets a procedural texture from its material code, fading out with distance */
 float nr=clamp(140./length(uEye-vW),0.,1.),ao=1.,sp=0.,spw=30.;
 if(water){c=mix(vec3(.13,.36,.47),vec3(.30,.60,.64),vn(vW*.06+uT*.02));N=normalize(N+nr*vec3(.09*sin(vW.x*1.3+uT)+.04*sin(vW.z*3.7-uT*1.4),0.,.09*cos(vW.z*1.1+uT*.8)+.04*sin(vW.x*3.1+uT*1.2)));sp=.55;spw=90.;}
 else if(mat>5.5&&mat<6.5){float lf=vn(vW*4.2)*.55+vn(vW*11.)*.45;c*=(.56+.86*mix(.5,lf,nr))*mix(1.,.62+.38*smoothstep(.3,.52,vn(vW*8.5+5.)),nr);c=mix(c,c*vec3(1.16,1.1,.72),smoothstep(.62,.95,lf)*.45*nr);ao=.58+.42*smoothstep(-.7,.6,N.y);N=normalize(N+(vec3(vn(vW*5.+3.),.5,vn(vW*5.+19.))-.5)*.8*nr);}
 else if(mat>6.5&&mat<7.5){float g=vn(vW*.09);c=mix(c*vec3(.74,.9,.7),c*vec3(1.1,1.04,.8),g);c*=.78+.26*vn(vW*.7)+.26*mix(.5,vn(vW*vec3(8.,1.,8.)),nr);}
 else if(mat>7.5&&mat<8.5){c*=.76+.24*vn(vW*.8)+.22*mix(.5,vn(vW*6.),nr);}
 else if(mat>8.5&&mat<9.5){c*=.78+.34*vn(vec3(vW.x*1.5,vW.y*8.,vW.z*1.5));}
 else if(mat>9.5&&mat<10.5){c*=.86+.14*vn(vW*.7)+.14*mix(.5,vn(vW*9.),nr);}
 else if(mat>10.5){c*=(.74+.3*fract(vW.y*2.6+.3*vn(vW*3.)))*(.9+.2*vn(vW*vec3(2.2,1.,2.2)));}
 else if(mat>4.5){if(abs(N.y)<.5){vec3 tg=normalize(cross(N,vec3(0.,1.,0.)));N=normalize(N+tg*sin(dot(vW,tg)*10.)*.35);}sp=.16;}
 else if(mat>3.5){c=mix(c,vec3(.55,.7,.82),.35);sp=.7;spw=120.;}
 else if(mat>2.5){c*=.95+.08*vn(vW*3.);sp=.2;spw=40.;}
 else c*=.93+.1*vn(vW*2.4);
 if(!water&&N.y<.6)ao*=mix(.72,1.,smoothstep(0.,1.5,vW.y));
 float sh=shadow(),ndl=max(dot(N,uKey),0.),h=N.y*.5+.5;
 vec3 amb=mix(vec3(.40,.38,.34),vec3(.60,.67,.78),h)*ao;
 c=c*(amb+vec3(.98,.90,.74)*ndl*sh);
 c+=pow(max(dot(N,normalize(uKey+Vd)),0.),spw)*sp*sh+pow(1.-max(dot(N,Vd),0.),4.)*.05;
 c=(c*(2.51*c+.03))/(c*(2.43*c+.59)+.14);}
else{
 float gl=mat>3.5&&mat<4.5?1.:(mat>2.5?.5:.06);
 if(mat>4.5&&abs(N.y)<.5){vec3 tg=normalize(cross(N,vec3(0.,1.,0.)));N=normalize(N+tg*sin(dot(vW,tg)*10.)*.4);}
 if(water){gl=1.;c=vec3(.13,.31,.42);float d=clamp(120./length(uEye-vW),0.,1.);N=normalize(N+d*vec3(.1*sin(vW.x*1.7+uT*1.1)+.05*sin(vW.z*4.3-uT*1.6),0.,.1*cos(vW.z*1.4+uT*.9)+.05*sin(vW.x*3.9+uT*1.3)));}
 else if(mat<.5){c*=.9+.18*(vn(vW*1.9)*.6+vn(vW*8.)*.4);if(N.y>.9&&c.g>c.r*1.08&&c.g>c.b*1.15)c*=.86+.3*vn(vW*.1)*vn(vW*.37+9.);}
 float sh=shadow(),ndl=max(dot(N,uKey),0.),h=N.y*.5+.5;
 float ao=(!water&&N.y<.6)?mix(.7,1.,smoothstep(0.,1.6,vW.y)):1.;
 vec3 amb=mix(vec3(.33,.32,.33),vec3(.52,.58,.68),h)*ao;
 vec3 dif=c*(amb+vec3(1.1,1.02,.86)*ndl*sh);
 vec3 Rf=reflect(-Vd,N);vec3 env=Rf.y>0.?mix(vec3(.66,.70,.74),vec3(.28,.42,.66),clamp(Rf.y*1.4,0.,1.)):mix(vec3(.66,.70,.74),vec3(.22,.22,.2),clamp(-Rf.y*3.,0.,1.));
 float fr=pow(1.-max(dot(N,Vd),0.),5.),k=clamp(gl*gl*.22+fr*(.15+.75*gl),0.,.85);
 c=mix(dif,env*(.4+.6*sh),k)+pow(max(dot(N,normalize(uKey+Vd)),0.),mix(14.,110.,gl))*(.05+gl)*sh;
 c=(c*(2.51*c+.03))/(c*(2.43*c+.59)+.14);}
float f=step(abs(vD.x-uFocus),.5)*step(.5,vD.x);c+=f*(.13+.1*sin(uT*4.))*vec3(1.,.9,.55);
float hv=step(abs(vD.x-uHover),.5)*step(.5,vD.x);c+=hv*.09;
if(abs(vD.x-uTrk)<.5&&vD.x>.5){float rim=pow(1.-max(dot(normalize(vN),Vd),0.),2.);c+=vec3(1.,.8,.25)*(.07+.05*sin(uT*3.)+rim*.55)*uTrkA;}
if(uGls>.5)c=mix(c,vec3(.80,.92,.96),.3)+pow(1.-max(dot(normalize(vN),Vd),0.),3.)*.25;
gl_FragColor=vec4(c,uFade*(1.-smoothstep(uR.x,uR.y,length(vW.xz-uCen)))*mix(1.,.2,uGls));}`;
const FSH=`precision highp float;varying float vZ;varying vec3 vN,vC,vW,vD;varying vec4 vS;void main(){vec4 e=fract(vec4(1.,255.,65025.,16581375.)*vZ);e-=e.yzww*vec4(1./255.,1./255.,1./255.,0.);gl_FragColor=e;}`;
const FPK=`precision highp float;varying vec3 vD;varying float vZ;varying vec3 vN,vC,vW;varying vec4 vS;void main(){float id=floor(vD.x+.5);gl_FragColor=vec4(mod(id,256.)/255.,floor(id/256.)/255.,0.,1.);}`;
const VP=`attribute vec3 aP;attribute vec4 aA;uniform mat4 uVP;uniform float uPx;varying vec3 vC;void main(){gl_Position=uVP*vec4(aP,1.);gl_PointSize=clamp(aA.x*uPx/gl_Position.w,1.5,48.);vC=aA.yzw;}`;
const FP=`precision mediump float;varying vec3 vC;uniform float uA;void main(){float d=length(gl_PointCoord-.5)*2.;float a=smoothstep(1.,.25,d);gl_FragColor=vec4(vC,a*.92*uA);}`;
/* space behind the globe: navy gradient, soft blue and purple nebula, three layers of stars that twinkle and drift with the
   camera and pointer, and a glow around the Earth. uIn darkens the left side on the landing screen so the text stays readable. */
const VSP=`attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
const FSP=`precision highp float;uniform vec2 uRes,uOff,uMs;uniform vec3 uG;uniform float uT,uIn;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){return n(p)*.5+n(p*2.03+7.)*.25+n(p*4.1+13.)*.125+n(p*8.3+29.)*.0625;}
float stars(vec2 uv,float sc,float th){vec2 g=uv*sc,i=floor(g),f=fract(g)-.5;float r=h(i);if(r<th)return 0.;vec2 o=(vec2(h(i+3.1),h(i+7.7))-.5)*.7;float b=(r-th)/(1.-th),tw=.72+.28*sin(uT*(.8+2.6*h(i+1.3))+r*40.);
 return smoothstep(.1*(.35+b),0.,length(f-o))*(.3+.7*b)*tw;}
void main(){vec2 p=gl_FragCoord.xy,uv=(p-.5*uRes)/uRes.y,q=uv+uOff;
 vec3 c=mix(vec3(.031,.051,.11),vec3(.063,.106,.208),smoothstep(-.7,.8,uv.y+uv.x*.35));
 float nb=fbm(q*1.2+uMs*.02+vec2(uT*.003,0.)),nb2=fbm(q*1.9+11.+uMs*.03),dust=fbm(q*5.+3.);
 vec3 e=vec3(.106,.192,.333)*smoothstep(.42,.82,nb)*.6+vec3(.188,.149,.31)*smoothstep(.48,.86,nb2)*.55+vec3(.86,.91,1.)*smoothstep(.62,.9,dust)*smoothstep(.5,.8,nb)*.05;
 e+=vec3(.86,.91,1.)*(stars(q+uMs*.012,34.,.85)+stars(q+uMs*.022+vec2(uT*.0012,0.),76.,.9)*.7+stars(q*1.1+uMs*.034,150.,.93)*.45);
 e*=mix(1.,.18+.82*smoothstep(.05,.6,p.x/uRes.x),uIn);
 float d=length(p-uG.xy);c+=e+vec3(.28,.475,.776)*exp(-max(d-uG.z,0.)/(uG.z*.15))*.34*step(1.,uG.z);
 gl_FragColor=vec4(c,1.);}`;
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
