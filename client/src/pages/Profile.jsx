import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Building, ShieldCheck, Calendar, Activity, Cpu, Save, CheckCircle } from 'lucide-react';

const T = {
    green: '#00E676', teal: '#00BFA5', amber: '#FFC107',
    blue: '#448AFF', indigo: '#7C4DFF', purple: '#E040FB',
    red: '#FF5252', muted: '#546E7A', border: 'rgba(0,230,118,0.13)',
    card: 'rgba(8,28,18,0.92)'
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
@keyframes prof-pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,230,118,.6)}60%{box-shadow:0 0 0 8px rgba(0,230,118,0)}}
@keyframes prof-shimmer{0%{left:-100%}100%{left:220%}}
.prof-input{width:100%;padding:14px 18px 14px 44px;background:rgba(255,255,255,.03);border:1px solid rgba(0,230,118,.15);borderRadius:12px;color:#fff;font-family:'Inter',sans-serif;font-size:14px;transition:all .2s;}
.prof-input:focus{outline:none;border-color:${T.green};background:rgba(0,230,118,.05);box-shadow:0 0 0 3px rgba(0,230,118,.1);}
.prof-input:disabled{opacity:0.5;cursor:not-allowed;background:rgba(255,255,255,.02);}
.prof-shimmer{overflow:hidden;}
.prof-shimmer::after{content:'';position:absolute;top:0;bottom:0;width:35%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.03),transparent);animation:prof-shimmer 5s ease-in-out infinite;}
`;

const gc = (extra={}) => ({
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 20,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 4px 32px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04)',
    position: 'relative',
    overflow: 'hidden',
    ...extra,
});

const fu = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: .55, ease: [.22, 1, .36, 1] } } };
const sg = { hidden: {}, show: { transition: { staggerChildren: .08 } } };

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', organization: user?.organization || '' });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [stats, setStats] = useState({ logs: 0, credits: 0 });

    useEffect(() => {
        if (user) { setForm({ name: user.name, organization: user.organization || '' }); }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await updateProfile({ name: form.name, organization: form.organization });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

    return (
        <>
            <style>{CSS}</style>
            <motion.div variants={sg} initial="hidden" animate="show"
                style={{ padding: '28px 28px', fontFamily: "'Inter',sans-serif", maxWidth: 900, margin: '0 auto', width: '100%' }}>
                
                {/* Header */}
                <motion.div variants={fu} style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 46, height: 46, borderRadius: 13, background: `${T.green}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.green}38` }}>
                        <User size={24} color={T.green} />
                    </motion.div>
                    <div>
                        <div style={{ fontSize: 9.5, fontWeight: 800, color: T.green, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 3 }}>Enterprise Member</div>
                        <h1 style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 800, color: '#fff', letterSpacing: '-.035em', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.1 }}>
                            Account Settings
                        </h1>
                        <p style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>Manage your profile and platform preferences</p>
                    </div>
                </motion.div>

                {/* Profile Card */}
                <motion.div variants={fu} className="prof-shimmer" style={{ ...gc({ padding: 32, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }) }}>
                    {/* Top glow */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${T.green},${T.teal},transparent)` }} />
                    
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', background: `linear-gradient(135deg,${T.green},${T.teal})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, color: '#04150F', boxShadow: `0 0 40px ${T.green}55`, zIndex: 2 }}>
                            {initials}
                        </div>
                        <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: `1px dashed ${T.green}44`, animation: 'prof-pulse 3s ease-in-out infinite', zIndex: 1 }} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-.03em', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 6 }}>{user?.name || 'User'}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <span style={{ fontSize: 13, color: T.muted, display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} />{user?.email}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ padding: '6px 14px', background: `${T.green}15`, border: `1px solid ${T.green}30`, borderRadius: 99, fontSize: 11, fontWeight: 800, color: T.green, display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={12} /> VERIFIED</span>
                            <span style={{ padding: '6px 14px', background: `${T.blue}15`, border: `1px solid ${T.blue}30`, borderRadius: 99, fontSize: 11, fontWeight: 800, color: T.blue, display: 'flex', alignItems: 'center', gap: 6 }}><Building size={12} /> {user?.organization || 'Enterprise Org'}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Form */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    
                    <motion.div variants={fu} style={gc({ padding: 32 })}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 24, fontFamily: "'Space Grotesk',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}><Cpu size={16} color={T.green} /> Profile Information</h3>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ position: 'relative' }}>
                                <label style={{ fontSize: 10, fontWeight: 800, color: T.green, textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 8 }}>Full Name</label>
                                <div style={{ position: 'absolute', left: 16, top: 41, color: T.muted }}><User size={16} /></div>
                                <input type="text" className="prof-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <label style={{ fontSize: 10, fontWeight: 800, color: T.green, textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 8 }}>Organization</label>
                                <div style={{ position: 'absolute', left: 16, top: 41, color: T.muted }}><Building size={16} /></div>
                                <input type="text" className="prof-input" value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <label style={{ fontSize: 10, fontWeight: 800, color: T.green, textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 8 }}>Email Address</label>
                                <div style={{ position: 'absolute', left: 16, top: 41, color: T.muted }}><Mail size={16} /></div>
                                <input type="email" className="prof-input" value={user?.email || ''} disabled />
                                <div style={{ fontSize: 10, color: T.muted, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={10} color={T.teal} /> Tied to enterprise authentication</div>
                            </div>

                            <button type="submit" disabled={saving || saved}
                                style={{
                                    marginTop: 10, padding: '14px', background: saved ? `${T.teal}22` : `linear-gradient(135deg,${T.green},${T.teal})`,
                                    border: saved ? `1px solid ${T.teal}` : 'none', borderRadius: 12, cursor: saving ? 'wait' : 'pointer',
                                    color: saved ? T.teal : '#04150F', fontSize: 14, fontWeight: 800, fontFamily: 'inherit',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s'
                                }}>
                                {saving ? 'Saving Changes...' : saved ? <><CheckCircle size={16} /> Changes Saved</> : <><Save size={16} /> Save Profile</>}
                            </button>
                        </form>
                    </motion.div>

                    <motion.div variants={fu} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={gc({ padding: '28px 24px' })}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>Security & Access</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: `1px solid rgba(255,255,255,.05)` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <ShieldCheck size={18} color={T.green} />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Role Access</div>
                                        <div style={{ fontSize: 11, color: T.muted }}>Enterprise Admin Level</div>
                                    </div>
                                </div>
                                <span style={{ padding: '4px 10px', background: `${T.green}1A`, borderRadius: 6, fontSize: 10, fontWeight: 800, color: T.green }}>ACTIVE</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Calendar size={18} color={T.blue} />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Member Since</div>
                                        <div style={{ fontSize: 11, color: T.muted }}>January 2025</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ ...gc({ padding: '28px 24px', flex: 1 }), border: `1px solid ${T.indigo}33`, background: `linear-gradient(145deg, rgba(8,28,18,0.92) 0%, rgba(124,77,255,0.06) 100%)` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div style={{ padding: 6, background: `${T.indigo}1A`, borderRadius: 8, border: `1px solid ${T.indigo}33` }}><Activity size={16} color={T.indigo} /></div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Platform Analytics</span>
                            </div>
                            <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 16 }}>
                                Your enterprise account is linked to the AI Command Center. Platform data usage and sustainability metrics are processed under enterprise privacy terms.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, boxShadow: `0 0 10px ${T.green}` }} />
                                <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>Syncing Active</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}
