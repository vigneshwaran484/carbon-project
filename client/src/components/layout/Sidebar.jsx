import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Zap, TreePine, BrainCircuit, MessageCircle,
    FileBarChart, Trophy, ChevronLeft, ChevronRight, Leaf
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/energy', label: 'Add Energy', icon: Zap },
    { path: '/projects', label: 'Carbon Projects', icon: TreePine },
    { path: '/insights', label: 'AI Insights', icon: BrainCircuit },
    { path: '/ecobot', label: 'EcoBot', icon: MessageCircle },
    { path: '/reports', label: 'Reports', icon: FileBarChart },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Sidebar({ collapsed, setCollapsed }) {
    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
                background: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--border-color)',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 50,
                overflow: 'hidden',
            }}
        >
            <div style={{
                padding: collapsed ? '20px 16px' : '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderBottom: '1px solid var(--border-color)',
                minHeight: 72,
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'var(--gradient-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <Leaf size={20} color="white" />
                </div>
                {!collapsed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                            Carbonil <span style={{ color: 'var(--accent-green)' }}>Pasumai</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Carbon Credit Platform</div>
                    </motion.div>
                )}
            </div>

            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: collapsed ? '12px 14px' : '12px 16px',
                            borderRadius: 'var(--radius-xs)', textDecoration: 'none',
                            fontSize: 14, fontWeight: isActive ? 600 : 400,
                            color: isActive ? 'var(--accent-green)' : 'var(--text-secondary)',
                            background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            transition: 'all 0.2s ease', whiteSpace: 'nowrap', overflow: 'hidden',
                        })}
                    >
                        <item.icon size={20} style={{ flexShrink: 0 }} />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <button onClick={() => setCollapsed(!collapsed)} style={{
                margin: 12, padding: 10, background: 'var(--bg-card)',
                border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
        </motion.aside>
    );
}
