import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function Leaderboard() {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/leaderboard').then(res => { setRankings(res.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading-center"><div className="pulse-dot" /><span className="loading-label">Loading Rankings...</span></div>;
    }

    const top3 = rankings.slice(0, 3);
    const rest = rankings.slice(3);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 80 }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div className="section-label" style={{ marginBottom: 8 }}>Global Registry</div>
                <h1 className="page-title gradient-text">Sustainability Rankings</h1>
                <p className="page-subtitle" style={{ marginTop: 8 }}>Top contributors by verified carbon credits</p>
            </div>

            {top3.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 20, marginBottom: 48, height: 280 }}>
                    {/* Rank 2 */}
                    {top3[1] && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card hover-lift" style={{ width: 220, height: 200, padding: 24, textAlign: 'center', position: 'relative', borderTop: '2px solid var(--data-slate)' }}>
                            <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'var(--data-slate)', color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>2</div>
                            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, marginTop: 12 }}>{top3[1].name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>{top3[1].organization}</div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-primary)' }}>{top3[1].totalCredits.toLocaleString()}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Credits</div>
                        </motion.div>
                    )}
                    {/* Rank 1 */}
                    {top3[0] && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-feature hover-lift" style={{ width: 260, height: 240, padding: 28, textAlign: 'center', position: 'relative', border: '1px solid var(--accent-primary)', boxShadow: '0 0 30px rgba(0,208,132,0.15)' }}>
                            <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'var(--grad-emerald)', color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,208,132,0.4)' }}>1</div>
                            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4, marginTop: 16, color: '#fff' }}>{top3[0].name}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>{top3[0].organization}</div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '-0.03em' }}>{top3[0].totalCredits.toLocaleString()}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Credits</div>
                        </motion.div>
                    )}
                    {/* Rank 3 */}
                    {top3[2] && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card hover-lift" style={{ width: 220, height: 180, padding: 24, textAlign: 'center', position: 'relative', borderTop: '2px solid #b45309' }}>
                            <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', width: 32, height: 32, borderRadius: '50%', background: '#b45309', color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>3</div>
                            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, marginTop: 12 }}>{top3[2].name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>{top3[2].organization}</div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-primary)' }}>{top3[2].totalCredits.toLocaleString()}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Credits</div>
                        </motion.div>
                    )}
                </div>
            )}

            {rankings.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card" style={{ overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: 60, textAlign: 'center' }}>Rank</th>
                                <th>Participant</th>
                                <th>Organization</th>
                                <th>Projects</th>
                                <th>CO₂ Offset</th>
                                <th style={{ textAlign: 'right' }}>Credits</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankings.map((r, i) => (
                                <tr key={r._id} style={{ background: i < 3 ? 'rgba(0,208,132,0.02)' : 'transparent' }}>
                                    <td style={{ textAlign: 'center', fontWeight: 800, color: i < 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>#{i + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: i < 3 ? 'var(--grad-emerald)' : 'var(--glass-02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                                                {r.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{r.name}</span>
                                        </div>
                                    </td>
                                    <td>{r.organization || '—'}</td>
                                    <td>{r.projectCount}</td>
                                    <td>{r.totalCo2Offset?.toFixed(1)} kg</td>
                                    <td style={{ textAlign: 'right' }}><span className="badge badge-green">{r.totalCredits.toLocaleString()}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            ) : (
                <div className="glass-card"><div className="empty-state"><p className="empty-state-title">No Rankings Yet</p></div></div>
            )}
        </div>
    );
}
