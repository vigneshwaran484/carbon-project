import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Leaf, Zap, Globe, Sparkles, X } from 'lucide-react';
import api from '../services/api';

const T = {
    green: '#00E676', teal: '#00BFA5', amber: '#FFC107',
    blue: '#448AFF', indigo: '#7C4DFF', muted: '#546E7A',
    border: 'rgba(0,230,118,0.13)',
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
@keyframes eco-spin{to{transform:rotate(360deg)}}
@keyframes eco-pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,230,118,.6)}60%{box-shadow:0 0 0 8px rgba(0,230,118,0)}}
@keyframes eco-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes eco-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes eco-typing-dot{0%,80%,100%{opacity:.2}40%{opacity:1}}
.eco-typing-dot{width:7px;height:7px;border-radius:50%;background:#00E676;animation:eco-typing-dot 1.4s ease-in-out infinite;}
.eco-typing-dot:nth-child(2){animation-delay:.16s;}
.eco-typing-dot:nth-child(3){animation-delay:.32s;}
.eco-input:focus{outline:none;border-color:rgba(0,230,118,.45)!important;box-shadow:0 0 0 3px rgba(0,230,118,.08);}
.eco-msg-area::-webkit-scrollbar{width:3px;}
.eco-msg-area::-webkit-scrollbar-track{background:transparent;}
.eco-msg-area::-webkit-scrollbar-thumb{background:rgba(0,230,118,.2);border-radius:2px;}
`;

const gc = (extra={}) => ({
    background: 'rgba(8,28,18,0.92)',
    border: `1px solid ${T.border}`,
    borderRadius: 20,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 4px 32px rgba(0,0,0,.55)',
    position: 'relative',
    overflow: 'hidden',
    ...extra,
});

const fu = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: .55, ease: [.22, 1, .36, 1] } } };

export default function EcoBot() {
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hello! I'm EcoBot, your enterprise AI for sustainability intelligence. Ask me anything about your carbon footprint, emission reduction strategies, ESG compliance, or Net Zero roadmap. 🌱" }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, typing]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput('');
        setMessages(p => [...p, { role: 'user', content: userMsg }]);
        setTyping(true);
        try {
            const res = await api.post('/ecobot', { message: userMsg });
            setTyping(false);
            const fullText = res.data.reply;
            let currentText = '';
            const msgIndex = messages.length + 1;
            setMessages(p => [...p, { role: 'bot', content: '' }]);

            for (let i = 0; i < fullText.length; i++) {
                currentText += fullText[i];
                setMessages(p => {
                    const newM = [...p];
                    newM[msgIndex] = { role: 'bot', content: currentText };
                    return newM;
                });
                await new Promise(r => setTimeout(r, 14));
            }
        } catch {
            setTyping(false);
            setMessages(p => [...p, { role: 'bot', content: "I'm experiencing a connection issue. Please try again shortly." }]);
        }
    };

    const suggestions = [
        { text: "What are my highest emitting areas?", icon: Zap },
        { text: "How can I reduce electricity consumption?", icon: Leaf },
        { text: "Explain Scope 3 emissions", icon: Globe },
        { text: "Generate Net Zero roadmap", icon: Sparkles },
    ];

    return (
        <>
            <style>{CSS}</style>
            <div style={{ display: 'flex', gap: 18, height: '100%', padding: '18px 24px', fontFamily: "'Inter',sans-serif", maxWidth: 1400, margin: '0 auto', width: '100%' }}>

                {/* Chat workspace */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .6, ease: [.22, 1, .36, 1] }}
                    style={{ ...gc({ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }) }}>

                    {/* Top glow bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${T.green},${T.teal},transparent)` }} />

                    {/* Header */}
                    <div style={{ padding: '18px 26px', borderBottom: `1px solid rgba(0,230,118,.08)`, background: 'rgba(0,0,0,.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${T.green},${T.teal})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${T.green}55`, animation: 'eco-pulse 2.5s ease-in-out infinite', flexShrink: 0 }}>
                            <Bot size={20} color="#040B08" />
                        </motion.div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-.025em', fontFamily: "'Space Grotesk',sans-serif" }}>EcoBot AI</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, animation: 'eco-pulse 2s ease-in-out infinite' }} />
                                <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>Sustainability Intelligence · Online</span>
                            </div>
                        </div>
                        <div style={{ padding: '5px 12px', background: `${T.green}0F`, border: `1px solid ${T.green}28`, borderRadius: 99, fontSize: 10, fontWeight: 800, color: T.green }}>
                            Gemini AI
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="eco-msg-area"
                        style={{ flex: 1, overflowY: 'auto', padding: '24px 26px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {messages.map((m, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}
                                style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                {m.role === 'bot' && (
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${T.green}44,${T.teal}44)`, border: `1px solid ${T.green}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: T.green, flexShrink: 0, marginRight: 10, marginTop: 2 }}>AI</div>
                                )}
                                <div style={{
                                    maxWidth: '78%', padding: '14px 18px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    fontSize: 13.5, lineHeight: 1.65,
                                    background: m.role === 'user'
                                        ? `linear-gradient(135deg,${T.green},${T.teal})`
                                        : 'rgba(255,255,255,.04)',
                                    color: m.role === 'user' ? '#040B08' : '#E8F5E9',
                                    fontWeight: m.role === 'user' ? 600 : 400,
                                    border: m.role === 'bot' ? `1px solid rgba(0,230,118,.12)` : 'none',
                                }}>
                                    {m.content}
                                </div>
                            </motion.div>
                        ))}
                        {typing && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                style={{ display: 'flex', justifyContent: 'flex-start', gap: 0 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${T.green}44,${T.teal}44)`, border: `1px solid ${T.green}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: T.green, flexShrink: 0, marginRight: 10, marginTop: 2 }}>AI</div>
                                <div style={{ padding: '14px 20px', borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,.04)', border: `1px solid rgba(0,230,118,.12)`, display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <div className="eco-typing-dot" />
                                    <div className="eco-typing-dot" />
                                    <div className="eco-typing-dot" />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Suggestions */}
                    {messages.length <= 1 && (
                        <div style={{ padding: '0 26px 10px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {suggestions.map(s => (
                                <button key={s.text} onClick={() => setInput(s.text)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,.03)', border: `1px solid rgba(0,230,118,.15)`, borderRadius: 10, fontSize: 11.5, fontWeight: 600, color: T.muted, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .18s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(0,230,118,.4)`; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = `rgba(0,230,118,.15)`; e.currentTarget.style.color = T.muted; }}>
                                    <s.icon size={11} color={T.green} />{s.text}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div style={{ padding: '14px 26px 18px', background: 'rgba(0,0,0,.25)', borderTop: `1px solid rgba(0,230,118,.07)`, display: 'flex', gap: 10 }}>
                        <input
                            type="text" value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about emissions, ESG, Net Zero, carbon strategy…"
                            className="eco-input"
                            style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: `1px solid rgba(0,230,118,.18)`, borderRadius: 12, padding: '12px 18px', fontSize: 13, color: '#fff', fontFamily: 'inherit', transition: 'all .2s' }}
                        />
                        <button onClick={handleSend} disabled={!input.trim() || typing}
                            style={{ padding: '0 22px', background: `linear-gradient(135deg,${T.green},${T.teal})`, border: 'none', borderRadius: 12, cursor: input.trim() && !typing ? 'pointer' : 'not-allowed', opacity: input.trim() && !typing ? 1 : .45, color: '#040B08', fontWeight: 800, fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7, transition: 'all .2s', whiteSpace: 'nowrap' }}>
                            Send <ArrowRight size={14} />
                        </button>
                    </div>
                </motion.div>

                {/* Right panel */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .6, delay: .1, ease: [.22, 1, .36, 1] }}
                    style={{ ...gc({ width: 260, padding: 22, display: 'flex', flexDirection: 'column', gap: 18, flexShrink: 0 }) }}>

                    <div>
                        <div style={{ fontSize: 9, fontWeight: 800, color: T.green, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10 }}>AI Context</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { l: 'Carbon Credit Calculation', c: T.green },
                                { l: 'Emission Reduction Strategy', c: T.teal },
                                { l: 'ESG Compliance Guidance', c: T.blue },
                                { l: 'Net Zero Roadmap', c: T.indigo },
                                { l: 'Renewable Energy Options', c: T.amber },
                            ].map(t => (
                                <div key={t.l} style={{ padding: '10px 13px', background: 'rgba(255,255,255,.025)', borderLeft: `2px solid ${t.c}`, borderRadius: 10, fontSize: 11.5, fontWeight: 600, color: T.muted, cursor: 'pointer', transition: 'all .18s' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = 'rgba(255,255,255,.025)'; }}>
                                    {t.l}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ flex: 1 }} />

                    {/* Capabilities */}
                    <div style={{ padding: 14, background: `${T.green}07`, border: `1px solid ${T.border}`, borderRadius: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: T.green, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Capabilities</div>
                        {['Carbon accounting', 'ESG reporting', 'Scope 1-2-3 analysis', 'Net Zero planning', 'Market intelligence'].map(c => (
                            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.green, flexShrink: 0 }} />
                                <span style={{ fontSize: 11, color: T.muted }}>{c}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', fontSize: 10, color: T.muted, lineHeight: 1.5 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', background: `${T.indigo}10`, border: `1px solid ${T.indigo}25`, borderRadius: 99, marginBottom: 8, fontSize: 10, fontWeight: 800, color: T.indigo }}>
                            Powered by Gemini Pro
                        </div>
                        <br />Ask anything about sustainability, climate tech, or carbon strategy.
                    </div>
                </motion.div>
            </div>
        </>
    );
}
