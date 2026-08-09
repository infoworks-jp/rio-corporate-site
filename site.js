(() => {
  'use strict';
  const canvas = document.querySelector('#fluid');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  const gl = canvas.getContext('webgl2', {
    alpha:false, antialias:false, depth:false, stencil:false, powerPreference:mobile?'low-power':'high-performance'
  });
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
    const fallback=document.createElement('canvas');
    fallback.id='fluid-fallback';canvas.replaceWith(fallback);
    const ctx=fallback.getContext('2d',{alpha:false});
    let w=0,h=0,t=0,raf=0;
    const blobs=Array.from({length:mobile?8:14},(_,i)=>({
      x:Math.random(),y:Math.random(),r:.12+Math.random()*.24,
      vx:(Math.random()-.5)*.00008,vy:(Math.random()-.5)*.00006,
      red:i===3
    }));
    function fit(){const d=Math.min(devicePixelRatio||1,2);w=fallback.width=Math.max(1,innerWidth*d);h=fallback.height=Math.max(1,innerHeight*d)}
    function paint(){
      t+=reducedMotion.matches?.05:1;
      ctx.fillStyle='#eee8dc';ctx.fillRect(0,0,w,h);
      for(const b of blobs){
        if(!reducedMotion.matches){b.x+=b.vx*t*.02;b.y+=b.vy*t*.02}
        if(b.x<-.2)b.x=1.2;if(b.x>1.2)b.x=-.2;if(b.y<-.2)b.y=1.2;if(b.y>1.2)b.y=-.2;
        const g=ctx.createRadialGradient(b.x*w,b.y*h,0,b.x*w,b.y*h,b.r*Math.max(w,h));
        g.addColorStop(0,b.red?'rgba(169,45,31,.62)':'rgba(17,20,27,.68)');
        g.addColorStop(.5,b.red?'rgba(169,45,31,.22)':'rgba(25,28,36,.28)');
        g.addColorStop(1,'rgba(238,232,220,0)');
        ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      }
      if(!reducedMotion.matches)raf=requestAnimationFrame(paint);
    }
    const point=(clientX,clientY)=>{
      blobs.push({
        x:clientX/innerWidth,
        y:clientY/innerHeight,
        r:.08+Math.random()*.06,
        vx:(Math.random()-.5)*.00012,
        vy:(Math.random()-.5)*.0001,
        red:Math.random()>.78
      });
      if(blobs.length>(mobile?18:26))blobs.splice(0,blobs.length-(mobile?18:26));
      if(reducedMotion.matches)paint();
    };
    addEventListener('pointerdown',e=>point(e.clientX,e.clientY),{passive:true});
    if(!('PointerEvent' in window)){
      addEventListener('touchstart',e=>{
        for(const touch of e.changedTouches)point(touch.clientX,touch.clientY);
      },{passive:true});
    }
    fit();paint();addEventListener('resize',()=>{fit();cancelAnimationFrame(raf);paint()},{passive:true});
    return;
  }

  const CFG = {
    sim: mobile?96:160, dye: mobile?512:1024, pressureIterations: mobile?12:22,
    pressureDecay: .8, curl: 26,
    velocityDissipation: .38, dyeDissipation: .16,
    radius: .0023, force: 6000
  };

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const makeProgram = (vertex, fragment) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program));
    const uniforms = {};
    for (let i=0; i<gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i++) {
      const name = gl.getActiveUniform(program, i).name;
      uniforms[name] = gl.getUniformLocation(program, name);
    }
    return {program, uniforms, use(){gl.useProgram(program)}};
  };

  const VS = `#version 300 es
  precision highp float;
  layout(location=0) in vec2 position;
  out vec2 uv; out vec2 L; out vec2 R; out vec2 T; out vec2 B;
  uniform vec2 texel;
  void main(){
    uv=position*.5+.5;
    L=uv-vec2(texel.x,0); R=uv+vec2(texel.x,0);
    T=uv+vec2(0,texel.y); B=uv-vec2(0,texel.y);
    gl_Position=vec4(position,0,1);
  }`;
  const vertex = compile(gl.VERTEX_SHADER, VS);
  const HEAD = `#version 300 es
  precision highp float; precision highp sampler2D;
  in vec2 uv; in vec2 L; in vec2 R; in vec2 T; in vec2 B;
  out vec4 outColor;`;

  const P = {
    clear: makeProgram(vertex, HEAD+`
      uniform sampler2D source; uniform float value;
      void main(){outColor=value*texture(source,uv);}`),
    splat: makeProgram(vertex, HEAD+`
      uniform sampler2D target; uniform float aspect;
      uniform vec2 point; uniform vec3 color; uniform float radius;
      void main(){
        vec2 p=uv-point; p.x*=aspect;
        vec3 add=exp(-dot(p,p)/radius)*color;
        outColor=vec4(texture(target,uv).xyz+add,1);
      }`),
    advect: makeProgram(vertex, HEAD+`
      uniform sampler2D velocity; uniform sampler2D source;
      uniform vec2 texel; uniform float dt; uniform float dissipation;
      void main(){
        vec2 p=uv-dt*texture(velocity,uv).xy*texel;
        outColor=texture(source,p)/(1.0+dissipation*dt);
      }`),
    divergence: makeProgram(vertex, HEAD+`
      uniform sampler2D velocity;
      void main(){
        float l=texture(velocity,L).x, r=texture(velocity,R).x;
        float t=texture(velocity,T).y, b=texture(velocity,B).y;
        vec2 c=texture(velocity,uv).xy;
        if(L.x<0.)l=-c.x; if(R.x>1.)r=-c.x;
        if(T.y>1.)t=-c.y; if(B.y<0.)b=-c.y;
        outColor=vec4(.5*(r-l+t-b),0,0,1);
      }`),
    curl: makeProgram(vertex, HEAD+`
      uniform sampler2D velocity;
      void main(){
        float l=texture(velocity,L).y, r=texture(velocity,R).y;
        float t=texture(velocity,T).x, b=texture(velocity,B).x;
        outColor=vec4(.5*(r-l-t+b),0,0,1);
      }`),
    vorticity: makeProgram(vertex, HEAD+`
      uniform sampler2D velocity; uniform sampler2D curlMap;
      uniform float strength; uniform float dt;
      void main(){
        float l=texture(curlMap,L).x, r=texture(curlMap,R).x;
        float t=texture(curlMap,T).x, b=texture(curlMap,B).x;
        float c=texture(curlMap,uv).x;
        vec2 f=.5*vec2(abs(t)-abs(b),abs(r)-abs(l));
        f/=length(f)+.0001; f*=strength*c; f.y*=-1.;
        outColor=vec4(texture(velocity,uv).xy+f*dt,0,1);
      }`),
    pressure: makeProgram(vertex, HEAD+`
      uniform sampler2D pressure; uniform sampler2D divergence;
      void main(){
        float l=texture(pressure,L).x, r=texture(pressure,R).x;
        float t=texture(pressure,T).x, b=texture(pressure,B).x;
        float d=texture(divergence,uv).x;
        outColor=vec4((l+r+t+b-d)*.25,0,0,1);
      }`),
    gradient: makeProgram(vertex, HEAD+`
      uniform sampler2D pressure; uniform sampler2D velocity;
      void main(){
        float l=texture(pressure,L).x, r=texture(pressure,R).x;
        float t=texture(pressure,T).x, b=texture(pressure,B).x;
        vec2 v=texture(velocity,uv).xy-vec2(r-l,t-b);
        outColor=vec4(v,0,1);
      }`),
    display: makeProgram(vertex, HEAD+`
      uniform sampler2D dyeMap; uniform vec2 dyeTexel; uniform float time;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
                   mix(hash(i+vec2(0,1)),hash(i+1.),u.x),u.y);
      }
      float fbm(vec2 p){
        float v=0.,a=.5;
        for(int i=0;i<4;i++){v+=a*noise(p);p*=2.07;a*=.5;}
        return v;
      }
      void main(){
        vec2 d=texture(dyeMap,uv).rg;
        float fiber=fbm(uv*vec2(820,640)), mottle=fbm(uv*16.);
        vec3 paper=vec3(.958,.938,.896)-fiber*.05-mottle*.028;
        float vignette=smoothstep(1.3,.3,length(uv-.5)*1.4);
        paper*=mix(.92,1.,vignette);
        float l=texture(dyeMap,uv-vec2(dyeTexel.x,0)).r;
        float r=texture(dyeMap,uv+vec2(dyeTexel.x,0)).r;
        float b=texture(dyeMap,uv-vec2(0,dyeTexel.y)).r;
        float t=texture(dyeMap,uv+vec2(0,dyeTexel.y)).r;
        float edge=length(vec2(r-l,t-b));
        float ink=1.-exp(-d.r*2.6);
        ink+=edge*1.5*smoothstep(.015,.5,d.r);
        ink*=1.-.2*noise(uv*260.)*smoothstep(.7,.1,d.r);
        vec3 sumi=mix(vec3(.27,.29,.34),vec3(.05,.055,.08),
          clamp(d.r*.85+edge*1.2,0.,1.));
        vec3 color=mix(paper,sumi,clamp(ink,0.,1.));
        float red=1.-exp(-d.g*3.2);
        color=mix(color,vec3(.70,.155,.10),clamp(red,0.,1.)*.92);
        color+=(hash(uv*vec2(1873,1021)+fract(time))-.5)*.024;
        outColor=vec4(color,1);
      }`)
  };

  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);

  const fbo=(w,h,internal,format,filter)=>{
    const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,internal,w,h,0,format,gl.HALF_FLOAT,null);
    const framebuffer=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
    return {texture,framebuffer,width:w,height:h,tx:1/w,ty:1/h,
      bind(unit){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);return unit}};
  };
  const doubleFbo=(w,h,internal,format,filter)=>{
    let a=fbo(w,h,internal,format,filter),b=fbo(w,h,internal,format,filter);
    return {width:w,height:h,tx:1/w,ty:1/h,get read(){return a},get write(){return b},
      swap(){[a,b]=[b,a]}};
  };
  const resolution=(base)=>{
    let a=gl.drawingBufferWidth/gl.drawingBufferHeight;if(a<1)a=1/a;
    return gl.drawingBufferWidth>gl.drawingBufferHeight
      ? [Math.round(base*a),base]:[base,Math.round(base*a)];
  };
  const blit=(target)=>{
    if(target){gl.viewport(0,0,target.width,target.height);gl.bindFramebuffer(gl.FRAMEBUFFER,target.framebuffer)}
    else{gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  };

  let velocity,dye,divergence,curlMap,pressure;
  function init(){
    const [sw,sh]=resolution(CFG.sim),[dw,dh]=resolution(CFG.dye);
    velocity=doubleFbo(sw,sh,gl.RG16F,gl.RG,gl.LINEAR);
    dye=doubleFbo(dw,dh,gl.RGBA16F,gl.RGBA,gl.LINEAR);
    divergence=fbo(sw,sh,gl.R16F,gl.RED,gl.NEAREST);
    curlMap=fbo(sw,sh,gl.R16F,gl.RED,gl.NEAREST);
    pressure=doubleFbo(sw,sh,gl.R16F,gl.RED,gl.NEAREST);
  }
  function resize(){
    const dpr=Math.min(devicePixelRatio||1,2),w=canvas.clientWidth*dpr|0,h=canvas.clientHeight*dpr|0;
    if(canvas.width===w&&canvas.height===h)return false;
    canvas.width=w;canvas.height=h;return true;
  }
  resize();init();
  const texel=(program,target)=>gl.uniform2f(program.uniforms.texel,target.tx,target.ty);

  function splat(x,y,dx,dy,black=.5,red=0,size=1){
    const p=P.splat;p.use();
    gl.uniform1f(p.uniforms.aspect,canvas.width/canvas.height);
    gl.uniform2f(p.uniforms.point,x,y);gl.uniform1f(p.uniforms.radius,CFG.radius*size);
    gl.uniform1i(p.uniforms.target,velocity.read.bind(0));
    gl.uniform3f(p.uniforms.color,dx,dy,0);blit(velocity.write);velocity.swap();
    gl.uniform1i(p.uniforms.target,dye.read.bind(0));
    gl.uniform3f(p.uniforms.color,black,red,0);blit(dye.write);dye.swap();
  }
  let tap=0;
  function burst(x,y){
    const red=(++tap%4===0);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2+Math.random()*.4;
      splat(x,y,Math.cos(a)*320,Math.sin(a)*320,0,0,2.2)}
    splat(x,y,0,0,red?.12:.85,red?.9:0,3.4);
  }

  function step(dt){
    gl.disable(gl.BLEND);
    let p=P.curl;p.use();texel(p,velocity);gl.uniform1i(p.uniforms.velocity,velocity.read.bind(0));blit(curlMap);
    p=P.vorticity;p.use();texel(p,velocity);
    gl.uniform1i(p.uniforms.velocity,velocity.read.bind(0));gl.uniform1i(p.uniforms.curlMap,curlMap.bind(1));
    gl.uniform1f(p.uniforms.strength,CFG.curl);gl.uniform1f(p.uniforms.dt,dt);blit(velocity.write);velocity.swap();
    p=P.divergence;p.use();texel(p,velocity);gl.uniform1i(p.uniforms.velocity,velocity.read.bind(0));blit(divergence);
    p=P.clear;p.use();texel(p,velocity);gl.uniform1i(p.uniforms.source,pressure.read.bind(0));
    gl.uniform1f(p.uniforms.value,CFG.pressureDecay);blit(pressure.write);pressure.swap();
    p=P.pressure;p.use();texel(p,velocity);gl.uniform1i(p.uniforms.divergence,divergence.bind(0));
    for(let i=0;i<CFG.pressureIterations;i++){gl.uniform1i(p.uniforms.pressure,pressure.read.bind(1));blit(pressure.write);pressure.swap()}
    p=P.gradient;p.use();texel(p,velocity);gl.uniform1i(p.uniforms.pressure,pressure.read.bind(0));
    gl.uniform1i(p.uniforms.velocity,velocity.read.bind(1));blit(velocity.write);velocity.swap();
    p=P.advect;p.use();texel(p,velocity);gl.uniform1i(p.uniforms.velocity,velocity.read.bind(0));
    gl.uniform1i(p.uniforms.source,velocity.read.bind(0));gl.uniform1f(p.uniforms.dt,dt);
    gl.uniform1f(p.uniforms.dissipation,CFG.velocityDissipation);blit(velocity.write);velocity.swap();
    gl.uniform1i(p.uniforms.velocity,velocity.read.bind(0));gl.uniform1i(p.uniforms.source,dye.read.bind(1));
    gl.uniform1f(p.uniforms.dissipation,CFG.dyeDissipation);blit(dye.write);dye.swap();
  }
  function draw(time){
    const p=P.display;p.use();texel(p,dye);gl.uniform2f(p.uniforms.dyeTexel,dye.tx,dye.ty);
    gl.uniform1i(p.uniforms.dyeMap,dye.read.bind(0));gl.uniform1f(p.uniforms.time,time*.001);blit(null);
  }

  const active=new Map();
  const uv=e=>({x:e.clientX/innerWidth,y:1-e.clientY/innerHeight});
  addEventListener('pointerdown',e=>{
    const p=uv(e);
    active.set(e.pointerId,{...p,sx:p.x,sy:p.y,moved:0,time:performance.now(),touch:e.pointerType==='touch'});
    if(e.pointerType==='touch')burst(p.x,p.y);
  },{passive:true});
  addEventListener('pointermove',e=>{const q=uv(e),p=active.get(e.pointerId);if(!p)return;
    const dx=q.x-p.x,dy=q.y-p.y,speed=Math.min(Math.hypot(dx,dy)*40,1);p.moved+=Math.abs(dx)+Math.abs(dy);
    splat(q.x,q.y,dx*CFG.force,dy*CFG.force,.14+speed*.5,0,.8+speed*1.4);p.x=q.x;p.y=q.y},{passive:true});
  addEventListener('pointerup',e=>{const p=active.get(e.pointerId);active.delete(e.pointerId);
    if(p&&!p.touch&&performance.now()-p.time<260&&p.moved<.015)burst(p.sx,p.sy)});
  addEventListener('pointercancel',e=>active.delete(e.pointerId));
  if(!('PointerEvent' in window)){
    addEventListener('touchstart',e=>{
      for(const touch of e.changedTouches){
        const p=uv(touch);burst(p.x,p.y);
      }
    },{passive:true});
  }

  let last=performance.now();
  function frame(now){
    const dt=Math.min((now-last)/1000,1/30);last=now;
    if(resize())init();
    if(!document.hidden&&!reducedMotion.matches)step(dt);
    draw(now);requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setTimeout(()=>splat(.62,.7,30,-110,.8,0,2.6),250);
  setTimeout(()=>splat(.35,.55,-25,-80,.45,0,1.4),800);
  setTimeout(()=>burst(.55,.48),1500);
  if(!reducedMotion.matches)setInterval(()=>{
    const y=.2+Math.random()*.6,x=.18+Math.random()*.64;
    splat(x,y,(Math.random()-.5)*55,-35-Math.random()*55,.16+Math.random()*.22,Math.random()>.88?.18:0,1.1+Math.random());
  },mobile?3200:2200);
})();