import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

/* ─── Palette ─── */
const C = {
  bg: '#040B08', green: '#00E676', teal: '#00BFA5',
  amber: '#FFC107', muted: 'rgba(255,255,255,0.55)',
  border: 'rgba(0,230,118,0.18)',
};

/* ─── Global CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

@keyframes core-pulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(0,230,118,.8),0 0 40px rgba(0,230,118,.6)}50%{transform:scale(1.18);box-shadow:0 0 0 40px rgba(0,230,118,0),0 0 80px rgba(0,230,118,.8)}}
@keyframes ring-expand{0%{transform:translate(-50%,-50%) scale(0);opacity:.8}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}
@keyframes scan-rotate{0%{transform:translate(-50%,-50%) rotate(0deg)}100%{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes scan-rotate-r{0%{transform:translate(-50%,-50%) rotate(0deg)}100%{transform:translate(-50%,-50%) rotate(-360deg)}}
@keyframes earth-rotate{0%{transform:rotateY(0deg)}100%{transform:rotateY(360deg)}}
@keyframes dot-pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
@keyframes float-y{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes glow-breathe{0%,100%{opacity:.5;filter:blur(60px)}50%{opacity:.9;filter:blur(80px)}}
@keyframes label-fade{0%{opacity:0;transform:translateX(-8px)}20%{opacity:1;transform:translateX(0)}80%{opacity:1}100%{opacity:0;transform:translateX(8px)}}
@keyframes energy-flow{0%{stroke-dashoffset:1000}100%{stroke-dashoffset:0}}
@keyframes shimmer-bg{0%{background-position:0% 50%}100%{background-position:200% 50%}}
@keyframes particle-up{0%{transform:translateY(0) scale(1);opacity:.7}100%{transform:translateY(-100vh) scale(0.3);opacity:0}}
@keyframes ripple-expand{to{transform:scale(4);opacity:0}}
@keyframes mag-glow{0%,100%{box-shadow:0 0 30px rgba(0,230,118,.35)}50%{box-shadow:0 0 60px rgba(0,230,118,.65)}}
@keyframes transition-flash{0%{opacity:0}40%{opacity:1}100%{opacity:0}}

.land-root{position:fixed;inset:0;background:#040B08;overflow:hidden;font-family:'Inter',sans-serif;}
.hex-canvas{position:absolute;inset:0;z-index:1;pointer-events:none;}
.glow-orb{position:absolute;border-radius:50%;pointer-events:none;animation:glow-breathe 5s ease-in-out infinite;}
.core-dot{width:12px;height:12px;border-radius:50%;background:#00E676;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;animation:core-pulse 1.8s ease-in-out infinite;}
.ring{position:absolute;top:50%;left:50%;border-radius:50%;pointer-events:none;}
.scan-ring{position:absolute;top:50%;left:50%;border-radius:50%;pointer-events:none;border:1px solid rgba(0,230,118,.35);animation:scan-rotate 8s linear infinite;}
.scan-ring-r{position:absolute;top:50%;left:50%;border-radius:50%;pointer-events:none;border:1px dashed rgba(0,191,165,.25);animation:scan-rotate-r 12s linear infinite;}
.earth-sphere{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:5;pointer-events:none;}
.orb-label{position:absolute;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#00E676;white-space:nowrap;animation:label-fade 3s ease-in-out infinite;}
.magnetic-btn{position:relative;overflow:hidden;cursor:pointer;border:none;font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:-.01em;transition:transform .2s ease;}
.ripple-circle{position:absolute;border-radius:50%;transform:scale(0);animation:ripple-expand .65s linear;pointer-events:none;background:rgba(0,230,118,.28);}
.hero-title{font-family:'Space Grotesk',sans-serif;font-weight:700;background:linear-gradient(135deg,#ffffff 0%,#a7f3d0 40%,#00E676 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.transition-overlay{position:fixed;inset:0;z-index:1000;background:#040B08;pointer-events:none;}
`;

/* ─── Canvas hex ecosystem ─── */
function HexCanvas({ active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef();
  const hexesRef = useRef([]);
  const startRef = useRef(null);

  const buildHexes = useCallback((W, H) => {
    const S = 28;
    const W3 = Math.sqrt(3) * S;
    const H3 = 2 * S;
    const cols = Math.ceil(W / W3) + 6;
    const rows = Math.ceil(H / (H3 * 0.75)) + 6;
    const cx = W / 2, cy = H / 2;
    const hexes = [];
    for (let r = -3; r < rows; r++) {
      for (let c = -3; c < cols; c++) {
        const x = c * W3 + (Math.abs(r) % 2 === 1 ? W3 / 2 : 0);
        const y = r * H3 * 0.75;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        hexes.push({ x, y, dist, S, alpha: 0 });
      }
    }
    hexes.sort((a, b) => a.dist - b.dist);
    hexesRef.current = hexes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildHexes(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const drawHex = (ctx, x, y, S, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + S * Math.cos(a);
        const py = y + S * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0,230,118,${alpha * 0.55})`;
      ctx.lineWidth = 0.6;
      if (alpha > 0.25) { ctx.shadowColor = '#00E676'; ctx.shadowBlur = alpha * 8; }
      ctx.stroke();
      ctx.restore();
    };

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (active) {
        const revealR = elapsed * 260;
        hexesRef.current.forEach(hex => {
          const target = hex.dist < revealR ? Math.min(0.65, (revealR - hex.dist) / 130) : 0;
          hex.alpha += (target - hex.alpha) * 0.06;
          if (hex.alpha > 0.01) {
            const breathe = 0.82 + 0.18 * Math.sin(elapsed * 1.1 + hex.dist * 0.009);
            drawHex(ctx, hex.x, hex.y, hex.S, hex.alpha * breathe);
          }
        });
        // Energy particles
        if (elapsed > 1.5 && Math.random() < 0.4) {
          const idx = Math.floor(Math.random() * Math.min(300, hexesRef.current.length));
          const h = hexesRef.current[idx];
          if (h && h.alpha > 0.2) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(h.x, h.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#00E676';
            ctx.shadowColor = '#00E676';
            ctx.shadowBlur = 14;
            ctx.fill();
            ctx.restore();
          }
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, [active, buildHexes]);

  return <canvas ref={canvasRef} className="hex-canvas" />;
}

/* ─── Holographic Earth ─── */
function EarthOrb({ visible }) {
  const size = Math.min(window.innerWidth * 0.28, 320);
  const r = size / 2;
  const labels = ['Carbon Intelligence','AI Monitoring','Emission Analytics','ESG Platform','Net Zero MRV','Carbon Registry','AI Forecasting'];
  const [lblIdx, setLblIdx] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setLblIdx(i => (i + 1) % labels.length), 2800);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible) return null;
  return (
    <motion.div className="earth-sphere"
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [.22, 1, .36, 1] }}
      style={{ width: size, height: size }}
    >
      {/* Glow halo */}
      <div style={{ position:'absolute', inset:-40, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,230,118,.18) 0%,transparent 70%)', filter:'blur(20px)', animation:'glow-breathe 4s ease-in-out infinite' }} />

      {/* Main sphere */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position:'absolute', inset:0, overflow:'visible' }}>
        {/* Outer glow ring */}
        <circle cx={r} cy={r} fill="none" stroke="rgba(0,230,118,.12)" strokeWidth={1} r={r-1} />
        <circle cx={r} cy={r} fill="none" stroke="rgba(0,230,118,.07)" strokeWidth={20} r={r-10} />
        {/* Latitude lines */}
        {[0.2,0.4,0.5,0.6,0.8].map((f,i) => {
          const ry = r * Math.sin(Math.acos(1 - 2*f));
          const cy2 = r * (1 - 2*f) + r;
          return <ellipse key={i} cx={r} cy={cy2} rx={Math.sqrt(r*r - (cy2-r)*(cy2-r))} ry={4 + ry*0.03} fill="none" stroke={`rgba(0,230,118,${0.08 + (i===2?0.14:0)})`} strokeWidth={i===2?1.2:0.6} />;
        })}
        {/* Longitude arcs */}
        {[0,45,90,135].map((deg,i) => (
          <ellipse key={i} cx={r} cy={r} rx={Math.abs(Math.cos(deg*Math.PI/180))*r*0.9} ry={r*0.9} fill="none" stroke={`rgba(0,191,165,${0.06+i*0.02})`} strokeWidth={0.6}
            style={{ transformOrigin:`${r}px ${r}px`, transform:`rotateY(${deg}deg)` }} />
        ))}
        {/* Data dots on surface */}
        {Array.from({length:28},(_,i) => {
          const theta = (i/28)*Math.PI*2;
          const phi = Math.acos(1-2*((i*0.618)%1));
          const x = r + (r*0.85)*Math.sin(phi)*Math.cos(theta);
          const y = r + (r*0.85)*Math.cos(phi);
          return <circle key={i} cx={x} cy={y} r={i%5===0?2:1.2} fill={i%3===0?'#00E676':'#00BFA5'} opacity={0.5+(i%3)*0.15} style={{animation:`dot-pulse ${1.5+i*0.12}s ease-in-out infinite`,animationDelay:`${i*0.08}s`}} />;
        })}
        {/* Energy arcs */}
        <path d={`M ${r*0.25},${r} Q ${r},${r*0.1} ${r*1.75},${r}`} fill="none" stroke="rgba(0,230,118,.25)" strokeWidth={1} strokeDasharray="6 4" style={{animation:'energy-flow 4s linear infinite'}} />
        <path d={`M ${r*0.3},${r*1.4} Q ${r},${r*0.4} ${r*1.7},${r*0.6}`} fill="none" stroke="rgba(0,191,165,.2)" strokeWidth={0.8} strokeDasharray="4 6" style={{animation:'energy-flow 6s linear infinite reverse'}} />
      </svg>

      {/* Scanning rings */}
      <div className="scan-ring" style={{ width:size+60, height:size+60, marginLeft:-(size+60)/2, marginTop:-(size+60)/2, borderColor:'rgba(0,230,118,.2)' }} />
      <div className="scan-ring-r" style={{ width:size+100, height:size+100, marginLeft:-(size+100)/2, marginTop:-(size+100)/2, borderColor:'rgba(0,191,165,.12)' }} />
      <div className="scan-ring" style={{ width:size+40, height:size+40, marginLeft:-(size+40)/2, marginTop:-(size+40)/2, animationDuration:'5s', borderColor:'rgba(255,193,7,.1)' }} />

      {/* Rotating label */}
      <AnimatePresence mode="wait">
        <motion.div key={lblIdx}
          initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:6 }}
          transition={{ duration:.5 }}
          style={{ position:'absolute', bottom:-38, left:'50%', transform:'translateX(-50%)', fontSize:10, fontWeight:800, letterSpacing:'.12em', color:C.green, textTransform:'uppercase', whiteSpace:'nowrap', textAlign:'center' }}>
          {labels[lblIdx]}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Magnetic Button ─── */
function MagBtn({ children, primary, onClick, href }) {
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ x:0, y:0 });
  const [ripples, setRipples] = useState([]);

  const onMove = (e) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width/2) * 0.25;
    const y = (e.clientY - rect.top - rect.height/2) * 0.25;
    setPos({ x, y });
  };
  const onLeave = () => setPos({ x:0, y:0 });
  const addRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const sz = Math.max(rect.width, rect.height) * 2;
    const id = Date.now();
    setRipples(r => [...r, { x: e.clientX-rect.left-sz/2, y: e.clientY-rect.top-sz/2, sz, id }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 700);
    onClick?.();
  };

  const base = {
    display:'flex', alignItems:'center', gap:10, padding:'14px 32px',
    borderRadius:99, fontSize:15, fontWeight:700, cursor:'pointer',
    fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'-.01em',
    position:'relative', overflow:'hidden', border:'none',
    transform:`translate(${pos.x}px,${pos.y}px)`,
    transition:'transform .2s ease, box-shadow .3s ease',
    userSelect:'none',
  };
  const style = primary ? {
    ...base,
    background:`linear-gradient(135deg,${C.green},${C.teal})`,
    color:'#040B08', boxShadow:`0 0 40px rgba(0,230,118,.45)`,
    animation:'mag-glow 3s ease-in-out infinite',
  } : {
    ...base,
    background:'rgba(255,255,255,.06)', color:'#fff',
    border:`1px solid rgba(0,230,118,.3)`, backdropFilter:'blur(12px)',
  };

  const el = (
    <div ref={btnRef} style={style} onMouseMove={onMove} onMouseLeave={onLeave} onClick={addRipple}>
      {ripples.map(r => <span key={r.id} className="ripple-circle" style={{ width:r.sz, height:r.sz, left:r.x, top:r.y }} />)}
      {children}
    </div>
  );
  if (href) return <Link to={href} style={{textDecoration:'none'}}>{el}</Link>;
  return el;
}

/* ─── Expanding rings for core ─── */
function PulseRings() {
  return (
    <div style={{ position:'absolute', top:'50%', left:'50%', zIndex:8, pointerEvents:'none' }}>
      {[0,600,1200,1800].map(d => (
        <div key={d} style={{
          position:'absolute', borderRadius:'50%',
          border:'1px solid rgba(0,230,118,.5)',
          width:60, height:60, marginLeft:-30, marginTop:-30,
          animation:`ring-expand 2.4s ease-out infinite`,
          animationDelay:`${d}ms`,
        }} />
      ))}
    </div>
  );
}

/* ─── Main Landing ─── */
export default function Landing() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  // 0=black, 1=core, 2=ecosystem, 3=earth, 4=hero
  const [transitioning, setTransitioning] = useState(false);
  const [transPhase, setTransPhase] = useState(0);
  // 0=idle, 1=flash, 2=logo, 3=scan, 4=done

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => setPhase(4), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const enterDashboard = () => {
    setTransitioning(true);
    setTransPhase(1);
    setTimeout(() => setTransPhase(2), 400);
    setTimeout(() => setTransPhase(3), 900);
    setTimeout(() => navigate('/dashboard'), 1800);
  };

  return (
    <div className="land-root">
      <style>{CSS}</style>

      {/* Ambient glow orbs */}
      <div className="glow-orb" style={{ width:700,height:700,top:-200,left:-200,background:'radial-gradient(circle,rgba(0,230,118,.14) 0%,transparent 65%)',animationDelay:'0s' }} />
      <div className="glow-orb" style={{ width:600,height:600,bottom:-150,right:-150,background:'radial-gradient(circle,rgba(0,191,165,.11) 0%,transparent 65%)',animationDelay:'2s' }} />

      {/* Hex canvas */}
      <HexCanvas active={phase >= 2} />

      {/* Phase 1+: Core pulse */}
      {phase >= 1 && <div className="core-dot" style={{ zIndex:20 }} />}
      {phase >= 1 && phase < 3 && <PulseRings />}

      {/* Phase 3+: Earth orb */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-55%)', zIndex:6, animation:'float-y 5s ease-in-out infinite' }}>
        <EarthOrb visible={phase >= 3} />
      </div>

      {/* Phase 4+: Hero */}
      <AnimatePresence>
        {phase >= 4 && !transitioning && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, scale:.96 }}
            transition={{ duration:.8 }}
            style={{
              position:'absolute', inset:0, zIndex:30,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end',
              paddingBottom:'8vh',
              background:'linear-gradient(to top, rgba(4,11,8,.95) 0%, rgba(4,11,8,.6) 40%, transparent 70%)',
            }}
          >
            {/* Floating particles */}
            {Array.from({length:10},(_,i) => (
              <div key={i} style={{
                position:'absolute',
                left:`${10 + i*8}%`,
                bottom:0,
                width:2+i%3,
                height:2+i%3,
                borderRadius:'50%',
                background:`rgba(0,230,118,${0.2+i*0.05})`,
                animationName:'particle-up',
                animationDuration:`${8+i*2}s`,
                animationDelay:`${i*1.2}s`,
                animationTimingFunction:'linear',
                animationIterationCount:'infinite',
              }} />
            ))}

            {/* Badge */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.1}}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 18px', background:'rgba(0,230,118,.1)', border:'1px solid rgba(0,230,118,.3)', borderRadius:99, marginBottom:28 }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:C.green,animation:'core-pulse .8s ease-in-out infinite' }} />
              <span style={{ fontSize:11,fontWeight:800,color:C.green,letterSpacing:'.12em',textTransform:'uppercase' }}>AI Climate Intelligence Platform</span>
            </motion.div>

            {/* Title */}
            <motion.h1 className="hero-title"
              initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:.22,duration:.8,ease:[.22,1,.36,1]}}
              style={{ fontSize:'clamp(38px,6vw,80px)', lineHeight:1.08, textAlign:'center', marginBottom:18, letterSpacing:'-.04em' }}
            >
              Carbonil Pasumai 2.0
            </motion.h1>

            {/* Subtitle */}
            <motion.p initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.38}}
              style={{ fontSize:'clamp(14px,1.8vw,20px)', color:'rgba(255,255,255,.65)', textAlign:'center', maxWidth:560, lineHeight:1.65, marginBottom:14, fontFamily:"'Space Grotesk',sans-serif" }}>
              AI-Powered Carbon Intelligence Platform
            </motion.p>

            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.52}}
              style={{ fontSize:'clamp(12px,1.2vw,14px)', color:'rgba(255,255,255,.38)', textAlign:'center', maxWidth:520, lineHeight:1.7, marginBottom:44, fontFamily:"'Inter',sans-serif" }}>
              Empowering industries with intelligent carbon accounting, sustainability analytics, emission monitoring, AI-driven insights, carbon forecasting, ESG reporting, and Net Zero transformation.
            </motion.p>

            {/* Buttons */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.65}}
              style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap', justifyContent:'center' }}>
              <MagBtn primary onClick={enterDashboard}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Enter Dashboard
              </MagBtn>
              <MagBtn href="/register">
                Explore Platform
              </MagBtn>
            </motion.div>

            {/* Stats row */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.85}}
              style={{ display:'flex', gap:32, marginTop:52, borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:28 }}>
              {[
                { v:'ISO 14064', l:'Certified' },
                { v:'AI-Powered', l:'Intelligence' },
                { v:'Real-Time', l:'Monitoring' },
                { v:'Net Zero', l:'Roadmap' },
              ].map(s => (
                <div key={s.v} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:13, fontWeight:800, color:C.green, fontFamily:"'Space Grotesk',sans-serif" }}>{s.v}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginTop:2 }}>{s.l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Transition Overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div className="transition-overlay"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:24 }}>

            {/* Flash burst */}
            {transPhase >= 1 && (
              <motion.div
                initial={{ scale:0, opacity:1 }} animate={{ scale:60, opacity:0 }}
                transition={{ duration:.6, ease:'easeOut' }}
                style={{ position:'absolute', width:40, height:40, borderRadius:'50%', background:`radial-gradient(circle,${C.green},transparent)` }}
              />
            )}

            {/* Logo assembly */}
            {transPhase >= 2 && (
              <motion.div initial={{ opacity:0, scale:.8 }} animate={{ opacity:1, scale:1 }} transition={{ duration:.5 }}
                style={{ textAlign:'center' }}>
                <div style={{ fontSize:42, fontWeight:900, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'-.04em',
                  background:`linear-gradient(135deg,${C.green},${C.teal})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  CP
                </div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,.5)', letterSpacing:'.18em', textTransform:'uppercase', marginTop:4 }}>Carbonil Pasumai 2.0</div>
              </motion.div>
            )}

            {/* Scanning ring */}
            {transPhase >= 3 && (
              <motion.div
                initial={{ scale:0, opacity:.8 }} animate={{ scale:40, opacity:0 }}
                transition={{ duration:.9, ease:'easeOut' }}
                style={{ position:'absolute', width:60, height:60, borderRadius:'50%', border:`2px solid ${C.green}`, boxShadow:`0 0 30px ${C.green}` }}
              />
            )}

            {/* Loading text */}
            {transPhase >= 2 && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ position:'absolute', bottom:'20%', fontSize:11, color:'rgba(0,230,118,.6)', letterSpacing:'.14em', textTransform:'uppercase' }}>
                Initializing Dashboard…
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
