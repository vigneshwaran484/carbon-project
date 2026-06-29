import { motion } from 'framer-motion';

export default function ProjectCard({ project, onDelete, index }) {
    return (
        <motion.div
            className="glass-card"
            style={{ padding: 28, position: 'relative', overflow: 'hidden' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4 }}
        >
            {/* Top accent */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: 2,
                background: 'var(--grad-emerald)',
            }} />

            {/* Delete button */}
            {onDelete && (
                <button
                    onClick={() => onDelete(project._id)}
                    style={{
                        position: 'absolute', top: 16, right: 16,
                        background: 'rgba(248,113,113,0.08)',
                        border: '1px solid rgba(248,113,113,0.2)',
                        borderRadius: 'var(--r-xs)',
                        color: 'var(--data-red)',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        fontFamily: 'inherit',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                >
                    Remove
                </button>
            )}

            {/* Project name + location */}
            <div style={{ marginBottom: 20, paddingRight: 70 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span className="badge badge-green">Blue Carbon</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Registry</span>
                </div>
                <h3 style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    marginBottom: 6,
                }}>
                    {project.name}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {project.location}
                </p>
            </div>

            {/* Metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                    { label: 'Area', value: `${project.area}`, unit: 'ha' },
                    { label: 'Survival', value: `${project.survivalRate}`, unit: '%' },
                    { label: 'Biomass', value: `${parseFloat(project.biomassFactor).toFixed(1)}`, unit: 't/ha' },
                ].map(m => (
                    <div
                        key={m.label}
                        style={{
                            padding: '10px 12px',
                            background: 'rgba(0,0,0,0.25)',
                            borderRadius: 'var(--r-sm)',
                            border: '1px solid var(--border-subtle)',
                        }}
                    >
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                            {m.label}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Credits hero */}
            <div style={{
                padding: '18px 20px',
                background: 'linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(5,150,105,0.06) 100%)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-strong)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(0,208,132,0.4), transparent)',
                }} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Verified Carbon Credits
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {project.credits.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>tCO₂e equivalent</div>
            </div>

            {/* Calculation trace */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 14,
                padding: '8px 4px',
                borderTop: '1px solid var(--border-subtle)',
            }}>
                {[
                    { label: 'Biomass', val: `${parseFloat(project.biomass).toFixed(1)}t` },
                    { label: 'CO₂', val: `${parseFloat(project.co2).toFixed(1)}kg` },
                    { label: 'Final', val: `${parseFloat(project.finalCo2).toFixed(1)}kg` },
                ].map(t => (
                    <div key={t.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{t.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>{t.val}</div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
