import { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { path: '/dashboard',   label: 'Overview' },
    { path: '/energy',      label: 'Energy' },
    { path: '/projects',    label: 'Projects' },
    { path: '/ecobot',      label: 'EcoBot AI' },
    { path: '/reports',     label: 'Reports' },
];

export default function TopNav() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <header
            style={{
                height: 68,
                background: 'rgba(3, 9, 6, 0.75)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                borderBottom: '1px solid rgba(0, 208, 132, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 36px',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                boxShadow: '0 1px 40px rgba(0, 0, 0, 0.3)',
                flexShrink: 0,
            }}
        >
            {/* ── Logo ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #00E676, #00BFA5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 16px rgba(0,230,118,0.35)',
                    }}
                >
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#04150F', letterSpacing: '-0.05em' }}>CP</span>
                </div>
                <div style={{ lineHeight: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
                        Carbonil <span style={{ color: '#00E676' }}>Pasumai</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>
                        AI Climate Intelligence
                    </div>
                </div>
            </div>

            {/* ── Navigation ── */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 16px',
                                textDecoration: 'none',
                                fontSize: 13,
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? '#fff' : 'var(--text-tertiary)',
                                borderRadius: 'var(--r-full)',
                                transition: 'color 0.2s ease',
                                whiteSpace: 'nowrap',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(135deg, rgba(0,208,132,0.18) 0%, rgba(5,150,105,0.12) 100%)',
                                        borderRadius: 'var(--r-full)',
                                        border: '1px solid rgba(0,208,132,0.35)',
                                        boxShadow: '0 0 16px rgba(0,208,132,0.12)',
                                        zIndex: -1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                                />
                            )}
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            {/* ── Right Controls ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {/* Avatar dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <button
                        id="user-menu-btn"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '5px 14px 5px 5px',
                            background: 'rgba(10, 32, 24, 0.6)',
                            border: `1px solid ${dropdownOpen ? 'rgba(0,208,132,0.4)' : 'rgba(0,208,132,0.18)'}`,
                            borderRadius: 'var(--r-full)',
                            cursor: 'pointer',
                            color: '#fff',
                            transition: 'all 0.2s ease',
                            backdropFilter: 'blur(12px)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,208,132,0.4)'}
                        onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.borderColor = 'rgba(0,208,132,0.18)'; }}
                    >
                        {/* Avatar circle */}
                        <div
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #00E676, #00BFA5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 800,
                                color: '#04150F',
                                letterSpacing: '-0.02em',
                                boxShadow: '0 0 10px rgba(0,208,132,0.3)',
                            }}
                        >
                            {initials}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.name?.split(' ')[0] || 'User'}
                        </span>
                        <svg
                            width="12" height="12" viewBox="0 0 12 12" fill="none"
                            style={{ color: 'var(--text-muted)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                        >
                            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 10px)',
                                    right: 0,
                                    width: 240,
                                    background: 'rgba(7, 26, 18, 0.97)',
                                    backdropFilter: 'blur(24px)',
                                    WebkitBackdropFilter: 'blur(24px)',
                                    border: '1px solid rgba(0,208,132,0.2)',
                                    borderRadius: 'var(--r-md)',
                                    boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,208,132,0.08)',
                                    padding: '8px',
                                    zIndex: 999,
                                    overflow: 'hidden',
                                }}
                            >
                                {/* User info header */}
                                <div
                                    style={{
                                        padding: '10px 14px 14px',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        marginBottom: 6,
                                    }}
                                >
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                                        {user?.name || 'User'}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                        {user?.email || 'user@example.com'}
                                    </div>
                                    {user?.organization && (
                                        <div
                                            style={{
                                                display: 'inline-flex',
                                                marginTop: 8,
                                                padding: '3px 10px',
                                                background: 'rgba(0,208,132,0.1)',
                                                border: '1px solid rgba(0,208,132,0.2)',
                                                borderRadius: 'var(--r-full)',
                                                fontSize: 10,
                                                fontWeight: 700,
                                                color: 'var(--accent-primary)',
                                                letterSpacing: '0.04em',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {user.organization}
                                        </div>
                                    )}
                                </div>

                                {/* Menu items */}
                                {[
                                    { label: 'Account Settings', path: '/profile' },
                                ].map(item => (
                                    <button
                                        key={item.path}
                                        onClick={() => { navigate(item.path); setDropdownOpen(false); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: '100%',
                                            padding: '10px 14px',
                                            background: 'transparent',
                                            border: 'none',
                                            borderRadius: 'var(--r-xs)',
                                            color: 'var(--text-secondary)',
                                            fontSize: 13,
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s ease',
                                            fontFamily: 'inherit',
                                            letterSpacing: '-0.01em',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                    >
                                        {item.label}
                                    </button>
                                ))}

                                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '6px 0' }} />

                                <button
                                    onClick={() => { logout(); navigate('/login'); setDropdownOpen(false); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '100%',
                                        padding: '10px 14px',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: 'var(--r-xs)',
                                        color: 'var(--data-red)',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s ease',
                                        fontFamily: 'inherit',
                                        letterSpacing: '-0.01em',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    Sign Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
