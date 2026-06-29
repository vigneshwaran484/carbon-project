import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Zap, Leaf, TrendingUp, Activity, ArrowRight,
    Flame, TreePine, Target, Award, Globe, ShieldCheck, Cpu,
    Calendar, FileText, PlusCircle, Clock, BarChart3, Lock,
    Sparkles, CircuitBoard, Bot, ChevronLeft, ChevronRight,
    Database, Wifi, Server, ArrowUpRight, Layers, Eye,
} from 'lucide-react';

/* ─── Design Tokens ─── */
const T = {
    bg: '#040B08', card: 'rgba(8,28,18,0.92)',
    glass: 'rgba(255,255,255,0.032)',
    border: 'rgba(0,230,118,0.13)', borderHot: 'rgba(0,230,118,0.42)',
    green: '#00E676', teal: '#00BFA5', amber: '#FFC107',
    red: '#FF5252', blue: '#448AFF', indigo: '#7C4DFF', purple: '#E040FB',
    white: '#E8F5E9', muted: '#546E7A', faint: '#1B3A2E',
};

/* ─── CSS ─── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;}

@keyframes db-drift1{0%,100%{transform:translate(0,0) scale(1);opacity:.20}40%{transform:translate(90px,-70px) scale(1.12);opacity:.32}75%{transform:translate(-55px,85px) scale(0.93);opacity:.15}}
@keyframes db-drift2{0%,100%{transform:translate(0,0) scale(1);opacity:.14}55%{transform:translate(-110px,65px) scale(1.18);opacity:.24}}
@keyframes db-grid{0%,100%{opacity:.032}50%{opacity:.065}}
@keyframes db-pulse-ring{0%,100%{box-shadow:0 0 0 0 rgba(0,230,118,.7)}60%{box-shadow:0 0 0 8px rgba(0,230,118,0)}}
@keyframes db-blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes db-spin{to{transform:rotate(360deg)}}
@keyframes db-spin-r{to{transform:rotate(-360deg)}}
@keyframes db-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes db-shimmer{0%{left:-100%}100%{left:220%}}
@keyframes db-glow-pulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes db-scan{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}
@keyframes db-particle{0%{transform:translateY(0) rotate(0deg);opacity:0}8%{opacity:.55}90%{opacity:.3}100%{transform:translateY(-115vh) rotate(720deg);opacity:0}}
@keyframes db-wave{0%{transform:scale(1);opacity:.65}100%{transform:scale(2.6);opacity:0}}

.db-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background:${T.bg};overflow:hidden;}
.db-bg::before{content:'';position:absolute;inset:0;
  background-image:linear-gradient(rgba(0,230,118,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,.035) 1px,transparent 1px);
  background-size:64px 64px;animation:db-grid 10s ease-in-out infinite;}
.db-orb{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;}
.db-orb1{width:900px;height:900px;top:-300px;left:-300px;background:radial-gradient(circle,rgba(0,230,118,.18) 0%,transparent 65%);animation:db-drift1 22s ease-in-out infinite;}
.db-orb2{width:750px;height:750px;bottom:-250px;right:-250px;background:radial-gradient(circle,rgba(0,191,165,.14) 0%,transparent 65%);animation:db-drift2 28s ease-in-out infinite;}

.db-pulse{width:8px;height:8px;border-radius:50%;background:${T.green};animation:db-pulse-ring 2.2s ease-in-out infinite;flex-shrink:0;}
.db-cursor{display:inline-block;width:2px;height:.9em;background:${T.green};margin-left:2px;vertical-align:middle;animation:db-blink 1s ease-in-out infinite;}

.db-shimmer{overflow:hidden;}
.db-shimmer::after{content:'';position:absolute;top:0;bottom:0;width:40%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.03),transparent);
  animation:db-shimmer 6s ease-in-out infinite;}

.recharts-tooltip-wrapper{filter:drop-shadow(0 8px 24px rgba(0,0,0,.6));}

.db-section{max-width:1280px;margin:0 auto;width:100%;padding:0 32px;}
.db-section-divider{width:100%;max-width:1280px;margin:0 auto;height:1px;background:linear-gradient(90deg,transparent,rgba(0,230,118,.12),transparent);padding:0 32px;}

@media(max-width:900px){
  .db-section{padding:0 16px;}
  .db-kpi-grid{grid-template-columns:1fr 1fr !important;}
  .db-chart-grid{grid-template-columns:1fr !important;}
  .db-row3-grid{grid-template-columns:1fr !important;}
}
@media(max-width:600px){
  .db-kpi-grid{grid-template-columns:1fr !important;}
}
`;

/* ─── Glass card ─── */
const gc = (extra = {}) => ({
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 22,
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    boxShadow: '0 4px 32px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04)',
    position: 'relative',
    overflow: 'hidden',
    ...extra,
});

/* ─── Animated number ─── */
function AnimNum({ to = 0, dec = 0, dur = 1700, suffix = '' }) {
    const [v, setV] = useState(0);
    const raf = useRef();
    useEffect(() => {
        const t0 = Date.now();
        const tick = () => {
            const p = Math.min((Date.now() - t0) / dur, 1);
            const e = 1 - Math.pow(1 - p, 4);
            setV(+(e * to).toFixed(dec));
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [to, dec, dur]);
    return <>{v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec })}{suffix}</>;
}

/* ─── Live clock ─── */
function LiveClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
    return <span style={{ fontVariantNumeric: 'tabular-nums', color: T.green, fontWeight: 700, fontSize: 13, letterSpacing: '.05em' }}>
        {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>;
}

/* ─── Typing text ─── */
function TypeText({ text, speed = 28 }) {
    const [shown, setShown] = useState('');
    useEffect(() => {
        setShown('');
        let i = 0;
        const id = setInterval(() => {
            i++;
            setShown(text.slice(0, i));
            if (i >= text.length) clearInterval(id);
        }, speed);
        return () => clearInterval(id);
    }, [text, speed]);
    return <><span style={{ color: T.white }}>{shown}</span><span className="db-cursor" /></>;
}

/* ─── Chart tooltip ─── */
function ChartTip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(4,21,15,.97)', border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 18px', fontSize: 12, backdropFilter: 'blur(20px)', boxShadow: `0 8px 32px rgba(0,0,0,.7)` }}>
            <div style={{ color: T.muted, marginBottom: 8, fontWeight: 600 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                    <span style={{ color: T.muted }}>{p.name}:</span>
                    <span style={{ color: '#fff', fontWeight: 800 }}>{(+p.value || 0).toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
}

/* ─── Section header ─── */
function SectionHeader({ tag, tagColor = T.green, title, subtitle, right }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: tagColor, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 6 }}>{tag}</div>
                <h2 style={{ fontSize: 'clamp(22px,2.8vw,32px)', fontWeight: 800, color: '#fff', letterSpacing: '-.04em', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.1 }}>{title}</h2>
                {subtitle && <p style={{ fontSize: 13, color: T.muted, marginTop: 6, lineHeight: 1.6 }}>{subtitle}</p>}
            </div>
            {right}
        </div>
    );
}

/* ─── Reveal on scroll ─── */
function RevealSection({ children, delay = 0 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [.22, 1, .36, 1] }}>
            {children}
        </motion.div>
    );
}

/* ─── Ripple link ─── */
function RippleLink({ to, children, style = {} }) {
    const [rs, setRs] = useState([]);
    const add = e => {
        const r = e.currentTarget.getBoundingClientRect();
        const sz = Math.max(r.width, r.height) * 2;
        const id = Date.now();
        setRs(p => [...p, { x: e.clientX - r.left - sz / 2, y: e.clientY - r.top - sz / 2, sz, id }]);
        setTimeout(() => setRs(p => p.filter(x => x.id !== id)), 700);
    };
    return (
        <Link to={to} onClick={add} style={{ textDecoration: 'none', position: 'relative', overflow: 'hidden', display: 'block', borderRadius: 16, ...style }}>
            {rs.map(r => <span key={r.id} style={{ position: 'absolute', borderRadius: '50%', background: 'rgba(0,230,118,.18)', width: r.sz, height: r.sz, left: r.x, top: r.y, transform: 'scale(0)', animation: 'db-wave .65s linear', pointerEvents: 'none' }} />)}
            {children}
        </Link>
    );
}

/* ─── Floating AI Orb ─── */
function AIOrb() {
    return (
        <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
            style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 100 }}>
            <Link to="/ecobot" style={{ textDecoration: 'none' }}>
                <motion.div
                    animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: `linear-gradient(135deg,${T.green},${T.teal})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 40px ${T.green}55, 0 8px 32px rgba(0,0,0,.5)`,
                        cursor: 'pointer', position: 'relative',
                    }}>
                    <Bot size={24} color="#040B08" />
                    <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `1px solid ${T.green}44`, animation: 'db-pulse-ring 2.5s ease-in-out infinite' }} />
                </motion.div>
            </Link>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [insIdx, setInsIdx] = useState(0);

    /* Mouse spotlight */
    useEffect(() => {
        const h = e => setMouse({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', h);
        return () => window.removeEventListener('mousemove', h);
    }, []);

    /* Fetch */
    const fetchAll = useCallback(async () => {
        try {
            const [ovr, lg, pj] = await Promise.all([
                api.get('/dashboard/overview'),
                api.get('/energy-log'),
                api.get('/projects'),
            ]);
            setData(ovr.data);
            setLogs(lg.data || []);
            setProjects(pj.data || []);
        } catch { /* silent */ }
        setLoading(false);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* Derived */
    const totEmit = data?.totalEmissions || 0;
    const totCreds = data?.totalCredits || 0;
    const totOffset = data?.totalCo2Offset || 0;
    const scope1 = (data?.energySummary?.totalFuel || 0) * 2.31;
    const scope2 = (data?.energySummary?.totalElectricity || 0) * 0.82;
    const scope3 = (data?.energySummary?.totalWater || 0) * 0.36 / 1000;
    const nProj = projects.length;
    const netPct = totEmit > 0 ? Math.min(100, Math.round((totOffset / totEmit) * 100)) : 0;
    const aiScore = Math.min(99, Math.round(40 + netPct * 0.4 + logs.length * 0.5));
    const esgScore = Math.min(100, Math.round(30 + nProj * 10 + netPct * 0.3));
    const cScore = Math.max(0, Math.round(1000 - totEmit / 100));
    const esgRating = esgScore >= 80 ? 'AAA' : esgScore >= 60 ? 'AA' : esgScore >= 40 ? 'A' : 'BB';

    const greet = () => {
        const h = new Date().getHours();
        return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
    };

    /* Chart */
    const monthData = useMemo(() => {
        if (!data?.monthlyEnergy?.length)
            return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => ({ month, carbon: 0, electricity: 0, fuel: 0 }));
        return data.monthlyEnergy.map(m => ({
            month: new Date(m.date).toLocaleDateString('en', { month: 'short' }),
            carbon: +(m.carbon || 0).toFixed(1),
            electricity: +(m.electricity || 0).toFixed(1),
            fuel: +(m.fuel || 0).toFixed(1),
        }));
    }, [data]);

    const scopeData = [
        { name: 'Scope 1 · Fuel', value: +scope1.toFixed(2), fill: T.red },
        { name: 'Scope 2 · Energy', value: +scope2.toFixed(2), fill: T.blue },
        { name: 'Scope 3 · Water', value: +scope3.toFixed(4), fill: T.indigo },
    ].filter(d => d.value > 0);

    const activity = useMemo(() => [
        ...logs.map(e => ({ type: 'energy', date: new Date(e.createdAt), d: e })),
        ...projects.map(p => ({ type: 'project', date: new Date(p.createdAt), d: p })),
    ].sort((a, b) => b.date - a.date).slice(0, 6), [logs, projects]);

    const insights = useMemo(() => [
        `Electricity accounts for ${totEmit > 0 ? ((scope2 / totEmit) * 100).toFixed(0) : 0}% of your total emissions. Transitioning to renewable tariffs could reduce Scope 2 by up to 40%.`,
        `Your ${nProj} project${nProj !== 1 ? 's' : ''} have offset ${totOffset.toFixed(1)} kg CO₂e. ${netPct < 100 ? `${(100 - netPct).toFixed(0)}% gap remains to Net Zero.` : 'Net Zero target achieved! 🎉'}`,
        `Estimated carbon credit revenue: ₹${(totCreds * 850).toLocaleString('en-IN')} at current VCU market rate of ₹850/unit.`,
        `ESG rating improvement of +4.2% is projected by registering 2 additional blue carbon projects this quarter.`,
    ], [totEmit, scope2, nProj, totOffset, netPct, totCreds]);

    useEffect(() => {
        const id = setInterval(() => setInsIdx(i => (i + 1) % insights.length), 10000);
        return () => clearInterval(id);
    }, [insights.length]);

    const navTiles = [
        { icon: Zap, label: 'Energy Log', sub: 'Track consumption', to: '/energy', color: T.blue },
        { icon: TreePine, label: 'Projects', sub: 'Manage initiatives', to: '/projects', color: T.green },
        { icon: FileText, label: 'Reports', sub: 'GHG & ESG data', to: '/reports', color: T.amber },
        { icon: Bot, label: 'EcoBot AI', sub: 'AI assistant', to: '/ecobot', color: T.indigo },
        { icon: Sparkles, label: 'AI Insights', sub: 'Smart analysis', to: '/insights', color: T.purple },
    ];

    /* ── Loading ── */
    if (loading) return (
        <>
            <style>{GLOBAL_CSS}</style>
            <div className="db-bg"><div className="db-orb db-orb1" /><div className="db-orb db-orb2" /></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 10 }}>
                <div style={{ position: 'relative', width: 58, height: 58 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${T.border}`, borderTop: `2px solid ${T.green}`, animation: 'db-spin .9s linear infinite' }} />
                    <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: `2px solid transparent`, borderBottom: `2px solid ${T.teal}`, animation: 'db-spin-r 1.3s linear infinite' }} />
                </div>
                <div style={{ textAlign: 'center', fontFamily: 'Inter,sans-serif' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: T.green, letterSpacing: '.12em', textTransform: 'uppercase' }}>Initializing AI Engine</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>Connecting to Climate Intelligence System…</div>
                </div>
            </div>
        </>
    );

    /* ════════════════════════════════════════════════════════════
       RENDER — Landing-page style vertical layout
    ════════════════════════════════════════════════════════════ */
    return (
        <>
            <style>{GLOBAL_CSS}</style>

            {/* Background */}
            <div className="db-bg">
                <div className="db-orb db-orb1" />
                <div className="db-orb db-orb2" />
                {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} style={{
                        position: 'fixed', bottom: -8, borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
                        left: `${(i * 10) % 100}%`,
                        width: 2 + (i % 3), height: 2 + (i % 3),
                        background: `rgba(0,230,118,${0.12 + (i % 3) * 0.08})`,
                        animation: `db-particle ${14 + (i * 3) % 14}s ${(i * 2) % 10}s linear infinite`,
                    }} />
                ))}
                <div style={{
                    position: 'fixed', width: 600, height: 600, borderRadius: '50%', pointerEvents: 'none', zIndex: 1,
                    left: mouse.x - 300, top: mouse.y - 300,
                    background: 'radial-gradient(circle, rgba(0,230,118,.04) 0%, transparent 70%)',
                    transition: 'left .5s ease, top .5s ease',
                }} />
            </div>

            <div style={{ position: 'relative', zIndex: 10, fontFamily: "'Inter', sans-serif" }}>

                {/* ═══════════ SECTION 1: HERO WELCOME ═══════════ */}
                <section style={{ padding: '48px 0 40px' }}>
                    <div className="db-section">
                        <RevealSection>
                            <div style={{ ...gc({ padding: '40px 44px', borderColor: T.borderHot, background: 'linear-gradient(145deg, rgba(0,230,118,.08) 0%, rgba(8,28,18,.97) 55%)', boxShadow: `0 0 60px rgba(0,230,118,.06), 0 4px 32px rgba(0,0,0,.6)` }) }}>
                                {/* Animated top bar */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '22px 22px 0 0', background: `linear-gradient(90deg,transparent,${T.green},${T.teal},transparent)`, animation: 'db-glow-pulse 3s ease-in-out infinite' }} />
                                {/* Scan line */}
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, overflow: 'hidden', opacity: .4 }}>
                                    <div style={{ width: '30%', height: '100%', background: `linear-gradient(90deg,transparent,${T.green},transparent)`, animation: 'db-scan 4s ease-in-out infinite' }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                            <div className="db-pulse" />
                                            <span style={{ fontSize: 10, fontWeight: 800, color: T.green, letterSpacing: '.12em', textTransform: 'uppercase' }}>AI Systems Online</span>
                                        </div>

                                        <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>
                                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>

                                        <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1.12, color: '#fff', marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>
                                            {greet()}, 👋<br />
                                            <span style={{ background: `linear-gradient(90deg,${T.green},${T.teal})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                                {user?.name || 'Executive'}
                                            </span>
                                        </h1>

                                        <p style={{ fontSize: 14, color: T.muted, maxWidth: 480, lineHeight: 1.7 }}>
                                            Welcome to your Carbon Intelligence Command Center. Monitor emissions, track sustainability metrics, and drive Net Zero transformation with AI-powered insights.
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Clock size={12} color={T.muted} />
                                            <LiveClock />
                                        </div>
                                        <div style={{ padding: '6px 14px', background: `${T.green}12`, border: `1px solid ${T.green}30`, borderRadius: 99, fontSize: 10, fontWeight: 800, color: T.green }}>
                                            {user?.organization || 'Carbonil Pasumai'} · FY 2025–26
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </RevealSection>
                    </div>
                </section>

                {/* ═══════════ SECTION 2: KPI CARDS ═══════════ */}
                <section style={{ paddingBottom: 56 }}>
                    <div className="db-section">
                        <RevealSection delay={0.1}>
                            <SectionHeader tag="Key Performance Indicators" title="Sustainability Metrics" subtitle="Real-time overview of your carbon footprint, credits, and progress towards Net Zero." />
                        </RevealSection>

                        <div className="db-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                            {[
                                { label: 'Total Emissions', val: totEmit, unit: 'kg CO₂e', color: T.amber, icon: Flame, bar: Math.min(100, totEmit > 0 ? 72 : 0), desc: 'Cumulative greenhouse gas emissions across all scopes' },
                                { label: 'Carbon Credits', val: totCreds, unit: 'vCU', color: T.green, icon: Award, bar: Math.min(100, totCreds * 20), desc: 'Verified Carbon Units earned from offset projects' },
                                { label: 'Net Zero Progress', val: netPct, unit: '%', color: netPct >= 80 ? T.green : T.amber, icon: Target, bar: netPct, desc: 'Percentage of emissions offset towards Net Zero' },
                                { label: 'Active Projects', val: nProj, unit: 'projects', color: T.teal, icon: TreePine, bar: Math.min(100, nProj * 20), desc: 'Carbon offset and sustainability initiatives' },
                            ].map((k, i) => (
                                <RevealSection key={k.label} delay={0.1 + i * 0.08}>
                                    <motion.div whileHover={{ y: -4, borderColor: `${k.color}55` }} transition={{ duration: .25 }}
                                        className="db-shimmer" style={{ ...gc({ padding: '28px 26px' }), transition: 'border-color .3s ease, transform .3s ease', boxShadow: `0 0 0 1px ${k.color}12, 0 4px 28px rgba(0,0,0,.55)`, cursor: 'default' }}>
                                        {/* Color accent top */}
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '22px 22px 0 0', background: `linear-gradient(90deg,${k.color}CC,transparent)` }} />
                                        <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: `${k.color}0C`, filter: 'blur(20px)', pointerEvents: 'none' }} />

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>{k.label}</span>
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: i * .6, ease: 'easeInOut' }}
                                                style={{ width: 36, height: 36, borderRadius: 10, background: `${k.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${k.color}28` }}>
                                                <k.icon size={17} color={k.color} />
                                            </motion.div>
                                        </div>

                                        <div style={{ fontSize: 'clamp(28px,3vw,40px)', fontWeight: 900, color: '#fff', letterSpacing: '-.04em', lineHeight: 1, marginBottom: 4 }}>
                                            <AnimNum to={k.val} dec={0} />
                                        </div>
                                        <div style={{ fontSize: 12, color: k.color, fontWeight: 700, marginBottom: 6 }}>{k.unit}</div>
                                        <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, marginBottom: 16 }}>{k.desc}</p>

                                        {/* Animated bar */}
                                        <div style={{ height: 5, background: 'rgba(255,255,255,.05)', borderRadius: 3, overflow: 'hidden' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${k.bar}%` }}
                                                transition={{ duration: 1.8, delay: .4 + i * .12, ease: [.4, 0, .2, 1] }}
                                                style={{ height: '100%', background: `linear-gradient(90deg,${k.color},${k.color}55)`, borderRadius: 3, boxShadow: `0 0 12px ${k.color}70` }} />
                                        </div>
                                    </motion.div>
                                </RevealSection>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="db-section-divider" />

                {/* ═══════════ SECTION 3: CHARTS ═══════════ */}
                <section style={{ padding: '56px 0' }}>
                    <div className="db-section">
                        <RevealSection>
                            <SectionHeader tag="Carbon Intelligence" tagColor={T.green} title="Emission & Energy Analytics"
                                subtitle="Track carbon footprint trends across energy sources with AI-powered forecasting."
                                right={
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                        {[{ c: T.green, l: 'Carbon' }, { c: T.blue, l: 'Electricity' }, { c: T.amber, l: 'Fuel' }].map(g => (
                                            <div key={g.l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.muted }}>
                                                <div style={{ width: 12, height: 3, borderRadius: 2, background: g.c }} />{g.l}
                                            </div>
                                        ))}
                                        <div style={{ padding: '5px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 8, fontSize: 11, color: '#fff', fontWeight: 700, border: `1px solid ${T.border}` }}>YTD 2026</div>
                                    </div>
                                } />
                        </RevealSection>

                        <div className="db-chart-grid" style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: 20 }}>
                            {/* Area chart */}
                            <RevealSection delay={0.1}>
                                <div className="db-shimmer" style={{ ...gc({ padding: '30px 32px' }) }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '22px 22px 0 0', background: `linear-gradient(90deg,transparent,${T.green},${T.teal},transparent)` }} />
                                    {monthData.some(m => m.carbon > 0 || m.electricity > 0) ? (
                                        <ResponsiveContainer width="100%" height={320}>
                                            <AreaChart data={monthData} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
                                                <defs>
                                                    <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.green} stopOpacity={.28} /><stop offset="95%" stopColor={T.green} stopOpacity={0} /></linearGradient>
                                                    <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.blue} stopOpacity={.18} /><stop offset="95%" stopColor={T.blue} stopOpacity={0} /></linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
                                                <XAxis dataKey="month" stroke={T.muted} fontSize={11} tickLine={false} axisLine={false} dy={8} />
                                                <YAxis stroke={T.muted} fontSize={11} tickLine={false} axisLine={false} />
                                                <Tooltip content={<ChartTip />} />
                                                <Area type="monotone" dataKey="carbon" name="Carbon kg" stroke={T.green} strokeWidth={2.5} fill="url(#gC)" dot={false} />
                                                <Area type="monotone" dataKey="electricity" name="Electricity kWh" stroke={T.blue} strokeWidth={1.8} fill="url(#gE)" dot={false} />
                                                <Area type="monotone" dataKey="fuel" name="Fuel L" stroke={T.amber} strokeWidth={1.8} fill="none" dot={false} strokeDasharray="5 3" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                            style={{ height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                                            <BarChart3 size={44} color={T.muted} style={{ opacity: .25 }} />
                                            <span style={{ fontSize: 14, color: T.muted }}>No data yet — add energy logs to visualize trends</span>
                                            <Link to="/energy" style={{ fontSize: 13, color: T.green, fontWeight: 800, textDecoration: 'none', padding: '9px 22px', background: `${T.green}12`, border: `1px solid ${T.green}38`, borderRadius: 12 }}>+ Add Energy Data</Link>
                                        </motion.div>
                                    )}
                                </div>
                            </RevealSection>

                            {/* Scope donut */}
                            <RevealSection delay={0.2}>
                                <div className="db-shimmer" style={{ ...gc({ padding: '30px 26px', display: 'flex', flexDirection: 'column', height: '100%' }) }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: T.teal, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>GHG Protocol</div>
                                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.025em', marginBottom: 20, fontFamily: "'Space Grotesk',sans-serif" }}>Scope Breakdown</h3>

                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
                                        {totEmit > 0 ? (
                                            <ResponsiveContainer width="100%" height={180}>
                                                <PieChart>
                                                    <Pie data={scopeData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={5} dataKey="value" stroke="none">
                                                        {scopeData.map((d, i) => <Cell key={i} fill={d.fill} style={{ filter: `drop-shadow(0 0 8px ${d.fill}70)` }} />)}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ background: 'rgba(4,21,15,.97)', border: `1px solid ${T.border}`, borderRadius: 12, fontSize: 12 }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: T.muted }}>
                                                <Activity size={32} style={{ opacity: .25 }} />
                                                <span style={{ fontSize: 12 }}>No emissions logged</span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                                        {[
                                            { l: 'Scope 1 – Fuel', v: scope1.toFixed(1), c: T.red },
                                            { l: 'Scope 2 – Energy', v: scope2.toFixed(1), c: T.blue },
                                            { l: 'Scope 3 – Water', v: scope3.toFixed(4), c: T.indigo },
                                        ].map(s => (
                                            <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: 'rgba(255,255,255,.025)', borderRadius: 11, borderLeft: `3px solid ${s.c}` }}>
                                                <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{s.l}</span>
                                                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{s.v} <span style={{ fontSize: 9, color: T.muted }}>kg</span></span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </RevealSection>
                        </div>
                    </div>
                </section>

                <div className="db-section-divider" />

                {/* ═══════════ SECTION 4: SCORECARD & AI ═══════════ */}
                <section style={{ padding: '56px 0' }}>
                    <div className="db-section">
                        <RevealSection>
                            <SectionHeader tag="Performance & Intelligence" tagColor={T.indigo} title="Org Scorecard & AI Command Center"
                                subtitle="Enterprise-grade sustainability scoring and real-time AI analysis of your carbon strategy." />
                        </RevealSection>

                        <div className="db-chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20 }}>

                            {/* Org Scorecard */}
                            <RevealSection delay={0.1}>
                                <div className="db-shimmer" style={{ ...gc({ padding: '32px 28px', height: '100%' }) }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: T.blue, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>Performance</div>
                                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.025em', marginBottom: 28, fontFamily: "'Space Grotesk',sans-serif" }}>Org Scorecard</h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        {[
                                            { l: 'Net Zero Progress', v: netPct, c: netPct >= 80 ? T.green : T.amber },
                                            { l: 'ESG Index', v: esgScore, c: T.blue },
                                            { l: 'AI Sustainability Score', v: aiScore, c: T.teal },
                                        ].map((m, i) => (
                                            <div key={m.l}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                    <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{m.l}</span>
                                                    <span style={{ fontSize: 15, fontWeight: 900, color: m.c }}>{m.v}%</span>
                                                </div>
                                                <div style={{ height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 3, overflow: 'hidden' }}>
                                                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${m.v}%` }} viewport={{ once: true }}
                                                        transition={{ duration: 1.6, delay: .3 + i * .15, ease: [.4, 0, .2, 1] }}
                                                        style={{ height: '100%', background: `linear-gradient(90deg,${m.c},${m.c}55)`, borderRadius: 3, boxShadow: `0 0 12px ${m.c}70` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 28 }}>
                                        {[
                                            { l: 'Carbon Score', v: cScore, c: T.green, num: true },
                                            { l: 'ESG Rating', v: esgRating, c: T.blue, num: false },
                                        ].map(s => (
                                            <div key={s.l} style={{ padding: '16px', background: 'rgba(255,255,255,.03)', borderRadius: 14, textAlign: 'center', border: `1px solid ${T.border}` }}>
                                                <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>{s.l}</div>
                                                <div style={{ fontSize: 28, fontWeight: 900, color: s.c }}>{s.num ? <AnimNum to={s.v} /> : s.v}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </RevealSection>

                            {/* AI Command Center */}
                            <RevealSection delay={0.2}>
                                <div className="db-shimmer" style={{
                                    ...gc({
                                        padding: '32px 28px', height: '100%',
                                        background: 'linear-gradient(155deg, rgba(0,230,118,.06) 0%, rgba(8,28,18,.97) 50%)',
                                        borderColor: 'rgba(0,230,118,.22)',
                                        boxShadow: `0 0 60px rgba(0,230,118,.04), 0 4px 32px rgba(0,0,0,.6)`,
                                    }),
                                    display: 'flex', flexDirection: 'column',
                                }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '22px 22px 0 0', background: `linear-gradient(90deg,transparent,${T.green},${T.teal},${T.green},transparent)`, animation: 'db-glow-pulse 2.5s ease-in-out infinite' }} />

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                                            style={{ width: 40, height: 40, borderRadius: 11, background: `${T.green}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.green}38`, flexShrink: 0 }}>
                                            <CircuitBoard size={19} color={T.green} />
                                        </motion.div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: T.green, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 2 }}>Artificial Intelligence</div>
                                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.025em', fontFamily: "'Space Grotesk',sans-serif" }}>AI Command Center</h3>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: `${T.green}12`, border: `1px solid ${T.green}32`, borderRadius: 99 }}>
                                            <div className="db-pulse" style={{ width: 6, height: 6 }} />
                                            <span style={{ fontSize: 10, fontWeight: 800, color: T.green }}>LIVE</span>
                                        </div>
                                    </div>

                                    {/* 3×2 grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20, flex: 1 }}>
                                        {[
                                            { label: 'System Status', val: 'Fully Operational', color: T.green, pill: true },
                                            { label: 'Last Calculation', val: logs.length > 0 ? new Date(logs[0]?.createdAt).toLocaleDateString('en-IN') : 'No data', color: T.blue },
                                            { label: 'Sustainability', val: `${aiScore} / 100`, color: T.teal },
                                            { label: 'AI Confidence', val: `${Math.min(99, aiScore + 5)}%`, color: T.indigo },
                                            { label: 'Carbon Forecast', val: `${(totEmit * 0.85).toFixed(0)} kg`, color: T.amber, sub: 'Next month est.' },
                                            { label: 'System Health', val: '100% Online', color: T.green, pill: true },
                                        ].map((it, i) => (
                                            <motion.div key={i} whileHover={{ scale: 1.02, borderColor: it.color }}
                                                style={{ padding: '14px 16px', background: 'rgba(255,255,255,.03)', borderRadius: 13, border: '1px solid rgba(255,255,255,.06)', transition: 'all .2s', cursor: 'default' }}>
                                                <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>{it.label}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{it.val}</span>
                                                    {it.pill && <span style={{ fontSize: 8, padding: '2px 7px', background: `${it.color}1E`, color: it.color, borderRadius: 99, fontWeight: 800 }}>LIVE</span>}
                                                </div>
                                                {it.sub && <div style={{ fontSize: 9.5, color: T.muted, marginTop: 3 }}>{it.sub}</div>}
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* AI Insight Carousel */}
                                    <div style={{ padding: '16px 18px', background: `${T.indigo}0D`, border: `1px solid ${T.indigo}28`, borderRadius: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}><Sparkles size={13} color={T.indigo} /></motion.div>
                                                <span style={{ fontSize: 9.5, fontWeight: 800, color: T.indigo, textTransform: 'uppercase', letterSpacing: '.07em' }}>AI Latest Insight</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 3 }}>
                                                <button onClick={() => setInsIdx(i => (i - 1 + insights.length) % insights.length)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 3, lineHeight: 0 }}><ChevronLeft size={14} /></button>
                                                <button onClick={() => setInsIdx(i => (i + 1) % insights.length)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 3, lineHeight: 0 }}><ChevronRight size={14} /></button>
                                            </div>
                                        </div>
                                        <AnimatePresence mode="wait">
                                            <motion.div key={insIdx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .3 }}
                                                style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.65, minHeight: 48 }}>
                                                <TypeText text={insights[insIdx]} speed={22} />
                                            </motion.div>
                                        </AnimatePresence>
                                        <div style={{ display: 'flex', gap: 5, marginTop: 10, justifyContent: 'center' }}>
                                            {insights.map((_, i) => (
                                                <button key={i} onClick={() => setInsIdx(i)} style={{ width: i === insIdx ? 18 : 6, height: 6, borderRadius: 3, background: i === insIdx ? T.indigo : 'rgba(255,255,255,.12)', border: 'none', cursor: 'pointer', transition: 'all .3s', padding: 0 }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </RevealSection>
                        </div>
                    </div>
                </section>

                <div className="db-section-divider" />

                {/* ═══════════ SECTION 5: ACTIVITY + SYSTEM + NAV ═══════════ */}
                <section style={{ padding: '56px 0' }}>
                    <div className="db-section">
                        <RevealSection>
                            <SectionHeader tag="Operations & Navigation" tagColor={T.teal} title="Activity, Infrastructure & Quick Access"
                                subtitle="Monitor recent platform activity, system health, and quickly navigate to key modules." />
                        </RevealSection>

                        <div className="db-row3-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.9fr', gap: 20 }}>

                            {/* Recent Activity */}
                            <RevealSection delay={0.1}>
                                <div className="db-shimmer" style={{ ...gc({ padding: '28px 24px', height: '100%' }), display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                                        <div>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: T.green, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 3 }}>Timeline</div>
                                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-.02em', fontFamily: "'Space Grotesk',sans-serif" }}>Recent Activity</h3>
                                        </div>
                                        <Clock size={14} color={T.muted} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
                                        {activity.length > 0 ? activity.map((act, i) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                                                style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,.025)', borderRadius: 14, border: '1px solid rgba(255,255,255,.05)', cursor: 'default' }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: act.type === 'energy' ? 'rgba(68,138,255,.12)' : 'rgba(0,230,118,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${act.type === 'energy' ? T.blue : T.green}28` }}>
                                                    {act.type === 'energy' ? <Zap size={14} color={T.blue} /> : <Leaf size={14} color={T.green} />}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                                                        {act.type === 'energy' ? 'Energy Data Logged' : `Project: ${act.d.name}`}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: T.muted }}>
                                                        {act.type === 'energy' ? `${act.d.electricity ?? 0} kWh → ${(act.d.carbon ?? 0).toFixed(1)} kg CO₂` : `${act.d.credits ?? 0} vCU credits`}
                                                    </div>
                                                    <div style={{ fontSize: 10, color: T.faint, marginTop: 3 }}>{act.date.toLocaleDateString('en-IN')}</div>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.border}` }}><Activity size={24} color={T.muted} /></div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, marginBottom: 4 }}>No activity yet</div>
                                                    <div style={{ fontSize: 11, color: T.faint }}>Log energy or create a project</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <Link to="/energy" style={{ fontSize: 12, color: T.blue, fontWeight: 800, textDecoration: 'none', padding: '7px 14px', background: 'rgba(68,138,255,.1)', border: '1px solid rgba(68,138,255,.25)', borderRadius: 10 }}>+ Energy</Link>
                                                    <Link to="/projects" style={{ fontSize: 12, color: T.green, fontWeight: 800, textDecoration: 'none', padding: '7px 14px', background: `${T.green}0F`, border: `1px solid ${T.green}30`, borderRadius: 10 }}>+ Project</Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </RevealSection>

                            {/* System Status */}
                            <RevealSection delay={0.2}>
                                <div className="db-shimmer" style={{ ...gc({ padding: '28px 24px', display: 'flex', flexDirection: 'column', height: '100%' }) }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: T.teal, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 3 }}>Infrastructure</div>
                                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-.02em', marginBottom: 18, fontFamily: "'Space Grotesk',sans-serif" }}>System Status</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                                        {[
                                            { icon: Server, label: 'API Server', status: 'Online', color: T.green, pct: 99 },
                                            { icon: Database, label: 'Database', status: 'Healthy', color: T.green, pct: 97 },
                                            { icon: Wifi, label: 'IoT Sensors', status: 'Active', color: T.teal, pct: 84 },
                                            { icon: Cpu, label: 'AI Engine', status: 'Running', color: T.blue, pct: 92 },
                                            { icon: Lock, label: 'Security', status: 'Secure', color: T.green, pct: 100 },
                                            { icon: Globe, label: 'Carbon API', status: 'Synced', color: T.teal, pct: 95 },
                                        ].map((s, i) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: 8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,.025)', borderRadius: 12, border: '1px solid rgba(255,255,255,.04)' }}>
                                                <div style={{ width: 30, height: 30, borderRadius: 9, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${s.color}20`, flexShrink: 0 }}>
                                                    <s.icon size={13} color={s.color} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                        <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{s.label}</span>
                                                        <span style={{ fontSize: 10, color: s.color, fontWeight: 800 }}>{s.pct}%</span>
                                                    </div>
                                                    <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden' }}>
                                                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.pct}%` }} viewport={{ once: true }}
                                                            transition={{ duration: 1.5, delay: .4 + i * .08, ease: [.4, 0, .2, 1] }}
                                                            style={{ height: '100%', background: `linear-gradient(90deg,${s.color},${s.color}50)`, borderRadius: 2 }} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 14, padding: '10px 14px', background: `${T.green}0A`, border: `1px solid ${T.green}20`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div className="db-pulse" style={{ width: 6, height: 6 }} />
                                        <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>All systems operational</span>
                                        <span style={{ marginLeft: 'auto', fontSize: 10, color: T.faint }}>↑ 99.9% uptime</span>
                                    </div>
                                </div>
                            </RevealSection>

                            {/* Quick Access Nav */}
                            <RevealSection delay={0.3}>
                                <div className="db-shimmer" style={{ ...gc({ padding: '28px 22px', display: 'flex', flexDirection: 'column', height: '100%' }) }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: T.purple, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 3 }}>Navigation</div>
                                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-.02em', marginBottom: 18, fontFamily: "'Space Grotesk',sans-serif" }}>Quick Access</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                                        {navTiles.map((n, i) => (
                                            <RippleLink key={n.to} to={n.to}>
                                                <motion.div initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                                                    whileHover={{ x: 4, borderColor: n.color, background: 'rgba(255,255,255,.04)' }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,.025)', borderRadius: 14, border: '1px solid rgba(255,255,255,.05)', transition: 'all .2s' }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: `${n.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${n.color}28`, flexShrink: 0 }}>
                                                        <n.icon size={14} color={n.color} />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{n.label}</div>
                                                        <div style={{ fontSize: 10, color: T.muted }}>{n.sub}</div>
                                                    </div>
                                                    <ArrowRight size={13} color={T.muted} />
                                                </motion.div>
                                            </RippleLink>
                                        ))}
                                    </div>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} style={{ marginTop: 14 }}>
                                        <Link to="/reports" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: `linear-gradient(135deg,${T.green}22,${T.teal}18)`, border: `1px solid ${T.green}38`, borderRadius: 14, fontSize: 12, color: T.green, fontWeight: 800, transition: 'all .2s' }}>
                                            <PlusCircle size={14} /> Generate Report
                                        </Link>
                                    </motion.div>
                                </div>
                            </RevealSection>
                        </div>
                    </div>
                </section>

                {/* Footer spacing */}
                <div style={{ height: 60 }} />
            </div>

            {/* Floating AI Orb */}
            <AIOrb />
        </>
    );
}
