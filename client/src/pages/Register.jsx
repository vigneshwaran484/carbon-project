import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    Leaf, User, Mail, Lock, Phone, Building2,
    Eye, EyeOff, ArrowRight, CheckCircle2, ChevronDown
} from 'lucide-react';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', organization: '', email: '',
        phone: '', orgType: '', password: '', confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) return setError('Passwords do not match');
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.organization, form.phone, form.orgType);
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration Error:', err);
            const backendMsg = err.response?.data?.message;
            const fallbackMsg = err.message === 'Network Error' 
                ? 'Cannot connect to server. Please try again.' 
                : 'Registration failed';
            setError(backendMsg || fallbackMsg);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { title: 'AI Carbon Calculator',         desc: 'Measure emissions with AI-powered precision.' },
        { title: 'Blockchain Carbon Registry',    desc: 'Secure, immutable, and transparent project records.' },
        { title: 'Sustainability Dashboard',      desc: 'Track emissions, carbon credits, and ESG reports in real time.' },
    ];

    const inputStyle = {
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(0,208,132,0.18)',
        borderRadius: 10,
        color: 'white',
        fontSize: 13.5,
        padding: '12px 14px 12px 38px',
        width: '100%',
        outline: 'none',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
    };

    const iconStyle = {
        position: 'absolute', left: 13, top: '50%',
        transform: 'translateY(-50%)',
        color: 'rgba(0,208,132,0.5)',
        pointerEvents: 'none',
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background glow */}
            <div style={{
                position: 'fixed', top: '20%', left: '20%',
                width: 700, height: 700, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,208,132,0.05) 0%, transparent 65%)',
                pointerEvents: 'none',
            }} />

            {/* ── Top-left Logo ── */}
            <div style={{ position: 'absolute', top: 32, left: 40, display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Leaf size={20} color="white" />
                </div>
                <span style={{ fontSize: 18, fontWeight: 700 }}>
                    Carbonil <span style={{ color: 'var(--accent-green)' }}>Pasumai</span>
                </span>
            </div>

            {/* ── Main layout ── */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                minHeight: '100vh',
                padding: '100px 60px 60px 60px',
                gap: 60,
                maxWidth: 1400,
                margin: '0 auto',
            }}>

                {/* LEFT — Marketing content */}
                <div style={{ flex: '1 1 0', maxWidth: 480, paddingTop: 16 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, marginBottom: 18 }}>
                            Start Your Carbon<br />Intelligence Journey
                        </h1>
                        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 400 }}>
                            Create your enterprise account and gain access to AI-powered carbon management, blockchain registry, MRV automation, Blue Carbon projects, and sustainability insights.
                        </p>
                    </motion.div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 48 }}>
                        {features.map((f, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                                style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 14,
                                    padding: '14px 18px',
                                    background: 'rgba(10,32,24,0.55)',
                                    border: '1px solid rgba(0,208,132,0.15)',
                                    borderRadius: 12,
                                    maxWidth: 420,
                                    backdropFilter: 'blur(12px)',
                                }}
                            >
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                    background: 'rgba(0,208,132,0.12)',
                                    border: '1px solid rgba(0,208,132,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginTop: 1,
                                }}>
                                    <CheckCircle2 size={15} color="var(--accent-primary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'white', marginBottom: 2 }}>{f.title}</div>
                                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Stats */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        style={{ display: 'flex', gap: 36, borderTop: '1px solid rgba(0,208,132,0.12)', paddingTop: 24 }}>
                        {[['250+', 'REGISTERED PROJECTS'], ['500+', 'ORGANIZATIONS'], ['10M+', 'TONNES CO₂ TRACKED']].map(([val, lbl]) => (
                            <div key={lbl}>
                                <div style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{val}</div>
                                <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{lbl}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* RIGHT — Register card */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    style={{
                        flex: '0 0 440px',
                        background: 'rgba(8,26,18,0.92)',
                        border: '1px solid rgba(0,208,132,0.18)',
                        borderRadius: 20,
                        padding: '36px 32px',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(0,208,132,0.06)',
                        alignSelf: 'flex-start',
                    }}
                >
                    {/* Card heading — CENTERED */}
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'white' }}>Create Your Account</h2>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
                            Join the Carbon Intelligence Platform and accelerate your sustainability journey.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                padding: '10px 14px',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 10, color: '#f87171',
                                fontSize: 12.5, marginBottom: 16, textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Row 1: Full Name + Organization */}
                        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <User size={14} style={iconStyle} />
                                <input
                                    type="text" placeholder="Full Name"
                                    style={{ ...inputStyle }}
                                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                                    onFocus={e => e.target.style.borderColor = 'rgba(0,208,132,0.5)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(0,208,132,0.18)'}
                                />
                            </div>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Building2 size={14} style={iconStyle} />
                                <input
                                    type="text" placeholder="Organization Name"
                                    style={{ ...inputStyle }}
                                    value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })}
                                    onFocus={e => e.target.style.borderColor = 'rgba(0,208,132,0.5)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(0,208,132,0.18)'}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ position: 'relative', marginBottom: 10 }}>
                            <Mail size={14} style={iconStyle} />
                            <input
                                type="email" placeholder="Work Email Address"
                                style={{ ...inputStyle }}
                                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                                onFocus={e => e.target.style.borderColor = 'rgba(0,208,132,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(0,208,132,0.18)'}
                            />
                        </div>

                        {/* Phone */}
                        <div style={{ position: 'relative', marginBottom: 10 }}>
                            <Phone size={14} style={iconStyle} />
                            <input
                                type="tel" placeholder="Phone Number"
                                style={{ ...inputStyle }}
                                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                onFocus={e => e.target.style.borderColor = 'rgba(0,208,132,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(0,208,132,0.18)'}
                            />
                        </div>

                        {/* Org Type */}
                        <div style={{ position: 'relative', marginBottom: 10 }}>
                            <Building2 size={14} style={iconStyle} />
                            <select
                                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', color: form.orgType ? 'white' : 'rgba(255,255,255,0.35)' }}
                                value={form.orgType} onChange={(e) => setForm({ ...form, orgType: e.target.value })}
                                onFocus={e => e.target.style.borderColor = 'rgba(0,208,132,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(0,208,132,0.18)'}
                            >
                                <option value="" disabled hidden>Organization Type</option>
                                <option value="Enterprise">Enterprise</option>
                                <option value="Startup">Startup</option>
                                <option value="Non-profit">Non-profit</option>
                                <option value="Government">Government</option>
                                <option value="Research">Research</option>
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,208,132,0.5)', pointerEvents: 'none' }} />
                        </div>

                        {/* Password + Confirm */}
                        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Lock size={14} style={iconStyle} />
                                <input
                                    type={showPassword ? 'text' : 'password'} placeholder="Password"
                                    style={{ ...inputStyle, paddingRight: 40 }}
                                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                                    onFocus={e => e.target.style.borderColor = 'rgba(0,208,132,0.5)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(0,208,132,0.18)'}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,208,132,0.5)', padding: 0, display: 'flex', alignItems: 'center' }}>
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Lock size={14} style={iconStyle} />
                                <input
                                    type={showPassword ? 'text' : 'password'} placeholder="Confirm Password"
                                    style={{ ...inputStyle }}
                                    value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required
                                    onFocus={e => e.target.style.borderColor = 'rgba(0,208,132,0.5)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(0,208,132,0.18)'}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="btn-primary" disabled={loading}
                            style={{ width: '100%', padding: '13px 20px', fontSize: 14.5, fontWeight: 700, borderRadius: 12, justifyContent: 'center', marginBottom: 20 }}>
                            {loading ? 'Creating Account…' : 'Create Enterprise Account'}
                            {!loading && <ArrowRight size={16} />}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(0,208,132,0.15)' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>OR CONTINUE WITH</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(0,208,132,0.15)' }} />
                    </div>

                    {/* SSO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                        {[
                            { name: 'Google',    src: 'https://www.svgrepo.com/show/475656/google-color.svg' },
                            { name: 'Microsoft', src: 'https://www.svgrepo.com/show/452070/microsoft.svg' },
                            { name: 'GitHub',    src: 'https://www.svgrepo.com/show/512317/github-142.svg', invert: true },
                        ].map((p) => (
                            <button key={p.name} type="button" style={{
                                width: '100%', padding: '10px 18px',
                                background: 'rgba(0,0,0,0.25)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 10, color: 'white', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                                fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                                transition: 'background 0.2s, border-color 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,208,132,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,208,132,0.25)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.25)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            >
                                <img src={p.src} alt={p.name} width={17} height={17} style={p.invert ? { filter: 'invert(1)' } : {}} />
                                Continue with {p.name}
                            </button>
                        ))}
                    </div>

                    <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
