import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Leaf, Zap, Trophy, Heart, Lightbulb, Target, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const T = {
    green: '#00E676', teal: '#00BFA5', amber: '#FFC107',
    blue: '#448AFF', indigo: '#7C4DFF', purple: '#E040FB',
    red: '#FF5252', muted: '#546E7A', border: 'rgba(0,230,118,0.13)',
};

const iconMap = {
    leaf: Leaf, zap: Zap, trophy: Trophy, heart: Heart,
    lightbulb: Lightbulb, target: Target, trending: TrendingUp,
    alert: AlertTriangle, sparkles: Sparkles,
};

const typeStyles = {
    positive: { bg: 'rgba(0,230,118,0.07)',  border: `rgba(0,230,118,0.25)`,  color: T.green,  label: 'Positive' },
    warning:  { bg: 'rgba(255,193,7,0.07)',   border: 'rgba(255,193,7,0.25)',   color: T.amber,  label: 'Warning' },
    info:     { bg: 'rgba(68,138,255,0.07)',  border: 'rgba(68,138,255,0.25)',  color: T.blue,   label: 'Info' },
    tip:      { bg: 'rgba(124,77,255,0.07)', border: 'rgba(124,77,255,0.25)', color: T.indigo, label: 'Tip' },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
@keyframes ins-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes ins-pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,230,118,.6)}60%{box-shadow:0 0 0 8px rgba(0,230,118,0)}}
@keyframes ins-shimmer{0%{left:-100%}100%{left:220%}}
@keyframes ins-spin{to{transform:rotate(360deg)}}
.ins-card-shimmer{overflow:hidden;}
.ins-card-shimmer::after{content:'';position:absolute;top:0;bottom:0;width:35%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.03),transparent);animation:ins-shimmer 5s ease-in-out infinite;}
`;

const gc = (extra={}) => ({
    background: 'rgba(8,28,18,0.92)',
    border: `1px solid ${T.border}`,
    borderRadius: 20,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 4px 32px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04)',
    position: 'relative',
    overflow: 'hidden',
    ...extra,
});

const sg = { hidden: {}, show: { transition: { staggerChildren: .09 } } };
const fu = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: .55, ease: [.22, 1, .36, 1] } } };

export default function AIInsights() {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        api.get('/insights')
            .then(res => { setInsights(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = filter === 'all' ? insights : insights.filter(i => i.type === filter);

    if (loading) return (
        <>
            <style>{CSS}</style>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16, fontFamily: 'Inter,sans-serif' }}>
                <div style={{ position: 'relative', width: 50, height: 50 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(0,230,118,.2)', borderTop: `2px solid ${T.green}`, animation: 'ins-spin .9s linear infinite' }} />
                </div>
                <span style={{ fontSize: 12, color: T.muted, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>Loading AI Insights…</span>
            </div>
        </>
    );

    return (
        <>
            <style>{CSS}</style>
            <motion.div variants={sg} initial="hidden" animate="show"
                style={{ padding: '28px 28px', fontFamily: "'Inter',sans-serif", maxWidth: 1400, margin: '0 auto', width: '100%' }}>

                {/* Header */}
                <motion.div variants={fu} style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            style={{ width: 46, height: 46, borderRadius: 13, background: `${T.indigo}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.indigo}38` }}>
                            <BrainCircuit size={24} color={T.indigo} />
                        </motion.div>
                        <div>
                            <div style={{ fontSize: 9.5, fontWeight: 800, color: T.indigo, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 3 }}>AI POWERED</div>
                            <h1 style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 800, color: '#fff', letterSpacing: '-.035em', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.1 }}>
                                Sustainability Insights
                            </h1>
                            <p style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>AI-generated intelligence from your carbon data</p>
                        </div>
                    </div>

                    {/* Filter tabs */}
                    {insights.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,.04)', padding: 4, borderRadius: 12, border: `1px solid ${T.border}` }}>
                            {['all', 'positive', 'warning', 'info', 'tip'].map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, textTransform: 'capitalize', fontFamily: 'Inter,sans-serif', transition: 'all .18s', letterSpacing: '.02em',
                                        background: filter === f ? `${T.green}18` : 'transparent',
                                        color: filter === f ? T.green : T.muted,
                                        boxShadow: filter === f ? `0 0 0 1px ${T.green}30` : 'none',
                                    }}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Stats row */}
                {insights.length > 0 && (
                    <motion.div variants={fu} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                        {[
                            { l: 'Total Insights', v: insights.length, c: T.green },
                            { l: 'Positive', v: insights.filter(i => i.type === 'positive').length, c: T.green },
                            { l: 'Warnings', v: insights.filter(i => i.type === 'warning').length, c: T.amber },
                            { l: 'AI Tips', v: insights.filter(i => i.type === 'tip').length, c: T.indigo },
                        ].map((s, i) => (
                            <motion.div key={s.l} whileHover={{ scale: 1.02 }}
                                style={{ ...gc({ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }) }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${s.c}CC,transparent)`, borderRadius: '20px 20px 0 0' }} />
                                <span style={{ fontSize: 26, fontWeight: 900, color: s.c }}>{s.v}</span>
                                <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{s.l}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Insights grid */}
                <AnimatePresence mode="wait">
                    {filtered.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ ...gc({ padding: '80px 40px', textAlign: 'center' }) }}>
                            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ display: 'inline-flex', marginBottom: 20 }}>
                                <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${T.indigo}10`, border: `1px solid ${T.indigo}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BrainCircuit size={32} color={T.indigo} style={{ opacity: .6 }} />
                                </div>
                            </motion.div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>
                                {insights.length === 0 ? 'No Insights Yet' : 'No results for this filter'}
                            </h3>
                            <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.65, maxWidth: 380, margin: '0 auto 24px' }}>
                                {insights.length === 0
                                    ? 'Add energy data and carbon projects to generate AI-powered sustainability insights.'
                                    : 'Try selecting a different filter to see more insights.'}
                            </p>
                            {insights.length === 0 && (
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {[{ l: 'Add Energy Data', href: '/energy', c: T.blue }, { l: 'Add Projects', href: '/projects', c: T.green }].map(btn => (
                                        <a key={btn.l} href={btn.href}
                                            style={{ padding: '9px 22px', background: `${btn.c}12`, border: `1px solid ${btn.c}38`, borderRadius: 10, fontSize: 12.5, fontWeight: 800, color: btn.c, textDecoration: 'none' }}>
                                            {btn.l}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="grid" variants={sg} initial="hidden" animate="show"
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
                            {filtered.map((insight, i) => {
                                const ts = typeStyles[insight.type] || typeStyles.info;
                                const Icon = iconMap[insight.icon] || BrainCircuit;
                                return (
                                    <motion.div key={insight.id || i} variants={fu}
                                        whileHover={{ y: -4, borderColor: ts.border, boxShadow: `0 8px 40px rgba(0,0,0,.6), 0 0 24px ${ts.color}12` }}
                                        className="ins-card-shimmer"
                                        style={{ ...gc({ padding: 24, cursor: 'default', transition: 'all .25s ease', borderLeft: `3px solid ${ts.color}` }) }}>

                                        {/* Type badge */}
                                        <div style={{ position: 'absolute', top: 14, right: 14, padding: '3px 9px', background: ts.bg, border: `1px solid ${ts.border}`, borderRadius: 99, fontSize: 9, fontWeight: 800, color: ts.color, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                                            {ts.label}
                                        </div>

                                        {/* Glow blob */}
                                        <div style={{ position: 'absolute', top: -16, left: -16, width: 80, height: 80, borderRadius: '50%', background: `${ts.color}0D`, filter: 'blur(20px)', pointerEvents: 'none' }} />

                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                                            <motion.div whileHover={{ rotate: 12, scale: 1.08 }}
                                                style={{ width: 42, height: 42, borderRadius: 12, background: ts.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${ts.border}`, flexShrink: 0 }}>
                                                <Icon size={20} color={ts.color} />
                                            </motion.div>
                                            <div style={{ flex: 1, paddingRight: 40 }}>
                                                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-.01em', lineHeight: 1.3, fontFamily: "'Space Grotesk',sans-serif" }}>{insight.title}</h3>
                                                {insight.value && (
                                                    <span style={{ fontSize: 22, fontWeight: 900, color: ts.color, letterSpacing: '-.04em', lineHeight: 1 }}>{insight.value}</span>
                                                )}
                                            </div>
                                        </div>

                                        <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65 }}>{insight.description}</p>

                                        {/* Bottom accent bar */}
                                        <div style={{ marginTop: 16, height: 3, background: 'rgba(255,255,255,.04)', borderRadius: 2, overflow: 'hidden' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1.2, delay: .2 + i * .05, ease: [.4, 0, .2, 1] }}
                                                style={{ height: '100%', background: `linear-gradient(90deg,${ts.color},${ts.color}40)`, borderRadius: 2 }} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}
