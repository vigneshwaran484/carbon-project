import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '../components/ProjectCard';
import api from '../services/api';

function calcPreview(area, biomassFactor, survivalRate) {
    const a = parseFloat(area) || 0;
    const b = parseFloat(biomassFactor) || 0;
    const s = parseFloat(survivalRate) || 0;
    const biomass = a * b;
    const carbon = biomass * 0.47;
    const co2 = carbon * 3.67;
    const adjustedCo2 = co2 * (s / 100);
    const finalCo2 = adjustedCo2 * 0.85;
    const credits = Math.round(finalCo2);
    return { biomass, carbon, co2, adjustedCo2, finalCo2, credits };
}

function StepBreakdown({ preview }) {
    const steps = [
        { label: 'Biomass', value: preview.biomass.toFixed(2), unit: 'tons', color: 'var(--accent-mid)' },
        { label: 'Carbon', value: preview.carbon.toFixed(2), unit: 'tons', color: 'var(--data-teal)' },
        { label: 'CO₂', value: preview.co2.toFixed(2), unit: 'kg', color: 'var(--data-indigo)' },
        { label: 'Adjusted', value: preview.adjustedCo2.toFixed(2), unit: 'kg', color: 'var(--data-amber)' },
        { label: 'Final', value: preview.finalCo2.toFixed(2), unit: 'kg', color: 'var(--accent-mint)' },
        { label: 'Credits', value: preview.credits.toLocaleString(), unit: '', color: 'var(--accent-primary)' },
    ];
    return (
        <div style={{
            padding: '16px 20px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border-default)',
        }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Calculation Preview
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {steps.map((step, i) => (
                    <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.06, type: 'spring', stiffness: 280 }}
                            style={{
                                padding: '10px 14px',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: 'var(--r-sm)',
                                border: `1px solid rgba(255,255,255,0.06)`,
                                textAlign: 'center',
                                minWidth: 72,
                            }}
                        >
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{step.label}</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: step.color, letterSpacing: '-0.02em' }}>{step.value}</div>
                            {step.unit && <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{step.unit}</div>}
                        </motion.div>
                        {i < steps.length - 1 && (
                            <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 300 }}>→</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', location: '', area: '', biomassFactor: '', survivalRate: '' });

    const preview = useMemo(
        () => calcPreview(form.area, form.biomassFactor, form.survivalRate),
        [form.area, form.biomassFactor, form.survivalRate]
    );

    const fetchProjects = () => {
        api.get('/projects').then((res) => { setProjects(res.data); setLoading(false); });
    };

    useEffect(fetchProjects, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        await api.post('/projects', form);
        setForm({ name: '', location: '', area: '', biomassFactor: '', survivalRate: '' });
        setShowForm(false);
        setSubmitting(false);
        fetchProjects();
    };

    const handleDelete = async (id) => {
        await api.delete(`/projects/${id}`);
        fetchProjects();
    };

    const totalCredits = projects.reduce((sum, p) => sum + (p.credits || 0), 0);
    const totalArea = projects.reduce((sum, p) => sum + (parseFloat(p.area) || 0), 0);

    if (loading) {
        return (
            <div className="loading-center">
                <div className="pulse-dot" style={{ width: 14, height: 14 }} />
                <span className="loading-label">Loading projects...</span>
            </div>
        );
    }

    const fieldStyle = {
        marginBottom: 0,
    };
    const labelStyle = {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        display: 'block',
        marginBottom: 7,
    };

    return (
        <div style={{ maxWidth: 1440, margin: '0 auto', width: '100%', paddingBottom: 80 }}>

            {/* ── Page Header ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}
            >
                <div>
                    <div className="section-label" style={{ marginBottom: 8 }}>Blue Carbon Registry</div>
                    <h1 className="page-title gradient-text">Carbon Projects</h1>
                    <p className="page-subtitle" style={{ marginTop: 8 }}>
                        Manage verified carbon sequestration projects and track credit generation
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    New Project
                </button>
            </motion.div>

            {/* ── Stats Strip (only if projects exist) ── */}
            {projects.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 36 }}
                >
                    {[
                        { label: 'Active Projects', value: projects.length, unit: 'projects', color: 'var(--accent-primary)' },
                        { label: 'Total Credits', value: totalCredits.toLocaleString(), unit: 'vCU', color: 'var(--accent-mint)' },
                        { label: 'Total Area', value: totalArea.toFixed(1), unit: 'hectares', color: 'var(--data-teal)' },
                        { label: 'Registry Status', value: 'Verified', unit: 'by ISO 14064', color: 'var(--accent-primary)' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            className="stat-card"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 + i * 0.07 }}
                        >
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                                {stat.label}
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: stat.color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>{stat.unit}</div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* ── Create Project Modal ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.75)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 100,
                            padding: 24,
                            overflow: 'auto',
                        }}
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.94, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="glass-card-feature"
                            style={{ padding: 36, width: '100%', maxWidth: 660 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                                <div>
                                    <div className="section-label" style={{ marginBottom: 6 }}>Blue Carbon Registry</div>
                                    <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                                        Create Carbon Project
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowForm(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: 'var(--r-xs)',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        fontSize: 18,
                                        width: 32,
                                        height: 32,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontFamily: 'inherit',
                                        lineHeight: 1,
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                    {/* Full-width: Project name */}
                                    <div style={{ gridColumn: '1 / -1', ...fieldStyle }}>
                                        <label style={labelStyle}>Project Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Mangrove Restoration Phase 1"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Location */}
                                    <div style={fieldStyle}>
                                        <label style={labelStyle}>Location</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Tamil Nadu, India"
                                            value={form.location}
                                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Area */}
                                    <div style={fieldStyle}>
                                        <label style={labelStyle}>Area (hectares)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="input-field"
                                            placeholder="100"
                                            value={form.area}
                                            onChange={(e) => setForm({ ...form, area: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Biomass Factor */}
                                    <div style={fieldStyle}>
                                        <label style={labelStyle}>Biomass Factor (tons/ha)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="input-field"
                                            placeholder="10"
                                            value={form.biomassFactor}
                                            onChange={(e) => setForm({ ...form, biomassFactor: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Survival Rate */}
                                    <div style={fieldStyle}>
                                        <label style={labelStyle}>Survival Rate (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            className="input-field"
                                            placeholder="85"
                                            value={form.survivalRate}
                                            onChange={(e) => setForm({ ...form, survivalRate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Live Calculation Preview */}
                                <AnimatePresence>
                                    {(form.area && form.biomassFactor && form.survivalRate) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{ marginBottom: 24, overflow: 'hidden' }}
                                        >
                                            <StepBreakdown preview={preview} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting}
                                    style={{ width: '100%', justifyContent: 'center', padding: '14px 28px', fontSize: 15 }}
                                >
                                    {submitting ? 'Creating Project...' : 'Create Carbon Project'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Project Cards Grid ── */}
            {projects.length === 0 ? (
                <div className="glass-card">
                    <div className="empty-state">
                        <div
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: 'var(--r-lg)',
                                background: 'linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(5,150,105,0.06) 100%)',
                                border: '1px solid var(--border-default)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 28,
                                marginBottom: 8,
                            }}
                        >
                            🌿
                        </div>
                        <p className="empty-state-title">No Projects Yet</p>
                        <p className="empty-state-desc">
                            Create your first carbon project to start earning verified carbon credits and track your sequestration impact.
                        </p>
                        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: 8 }}>
                            Create First Project
                        </button>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}
                >
                    {projects.map((p, i) => (
                        <ProjectCard key={p._id} project={p} onDelete={handleDelete} index={i} />
                    ))}
                </motion.div>
            )}
        </div>
    );
}
