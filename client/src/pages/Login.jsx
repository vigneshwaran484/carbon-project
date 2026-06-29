import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    Leaf, Mail, Lock, Eye, EyeOff, ArrowRight,
    Bot, Shield, Globe
} from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Bot,    title: 'AI Carbon Intelligence',        desc: 'Predict emissions using advanced AI models.' },
        { icon: Shield, title: 'Blockchain Verified Registry',  desc: 'Immutable and transparent carbon records.' },
        { icon: Globe,  title: 'Blue Carbon Monitoring',        desc: 'Satellite, Drone and AI-powered ecosystem tracking.' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Subtle background glow */}
            <div style={{
                position: 'fixed', top: '30%', left: '25%',
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
                padding: '110px 60px 60px 60px',
                gap: 60,
                maxWidth: 1400,
                margin: '0 auto',
            }}>

                {/* LEFT — Marketing content */}
                <div style={{ flex: '1 1 0', maxWidth: 520, paddingTop: 20 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 18 }}>
                            Carbon Intelligence Platform{' '}
                            <span style={{ color: 'var(--accent-primary)' }}>
                                for Blue Carbon Registry &amp; AI-Powered MRV
                            </span>
                        </h1>
                        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 40, maxWidth: 420 }}>
                            Securely access your carbon projects, AI insights, blockchain registry, and sustainability dashboard.
                        </p>
                    </motion.div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {features.map((f, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                                style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 16,
                                    padding: '16px 20px',
                                    background: 'rgba(10,32,24,0.55)',
                                    border: '1px solid rgba(0,208,132,0.15)',
                                    borderRadius: 12,
                                    maxWidth: 440,
                                    backdropFilter: 'blur(12px)',
                                }}
                            >
                                <div style={{
                                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                    background: 'rgba(0,208,132,0.12)',
                                    border: '1px solid rgba(0,208,132,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <f.icon size={17} color="var(--accent-primary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>{f.title}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* RIGHT — Login card */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    style={{
                        flex: '0 0 420px',
                        background: 'rgba(8,26,18,0.92)',
                        border: '1px solid rgba(0,208,132,0.18)',
                        borderRadius: 20,
                        padding: '40px 36px',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(0,208,132,0.06)',
                    }}
                >
                    {/* Card heading — CENTERED */}
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10, color: 'white' }}>Welcome Back</h2>
                        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Sign in to continue to your Carbon Intelligence Dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                padding: '11px 14px',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 10, color: '#f87171',
                                fontSize: 13, marginBottom: 18, textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <input
                                    type="email"
                                    className="input-field"
                                    style={{ paddingLeft: 40, background: 'white', color: '#0a0a0a', borderRadius: 10, fontSize: 14 }}
                                    placeholder="suchirofficial@gmail.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field"
                                    style={{ paddingLeft: 40, paddingRight: 44, background: 'white', color: '#0a0a0a', borderRadius: 10, fontSize: 14 }}
                                    placeholder="••••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <button type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0, display: 'flex', alignItems: 'center' }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me & Forgot */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{ width: 13, height: 13, accentColor: 'var(--accent-primary)' }}
                                />
                                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Remember Me</span>
                            </label>
                            <Link to="/forgot-password" style={{ fontSize: 12.5, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="btn-primary" disabled={loading}
                            style={{ width: '100%', padding: '13px 20px', fontSize: 15, fontWeight: 700, borderRadius: 12, justifyContent: 'center', marginBottom: 22 }}>
                            {loading ? 'Signing In…' : 'Sign In'}
                            {!loading && <ArrowRight size={17} />}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(0,208,132,0.15)' }} />
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>OR CONTINUE WITH</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(0,208,132,0.15)' }} />
                    </div>

                    {/* SSO Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                        {[
                            { name: 'Google',    src: 'https://www.svgrepo.com/show/475656/google-color.svg' },
                            { name: 'Microsoft', src: 'https://www.svgrepo.com/show/452070/microsoft.svg' },
                            { name: 'GitHub',    src: 'https://www.svgrepo.com/show/512317/github-142.svg', invert: true },
                        ].map((p) => (
                            <button key={p.name} type="button" style={{
                                width: '100%', padding: '11px 18px',
                                background: 'rgba(0,0,0,0.25)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 10, color: 'white', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                                fontSize: 13.5, fontWeight: 500, fontFamily: 'inherit',
                                transition: 'background 0.2s, border-color 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,208,132,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,208,132,0.25)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.25)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            >
                                <img src={p.src} alt={p.name} width={18} height={18} style={p.invert ? { filter: 'invert(1)' } : {}} />
                                Continue with {p.name}
                            </button>
                        ))}
                    </div>

                    <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>Create Account</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
