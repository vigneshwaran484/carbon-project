import { motion } from 'framer-motion';

export default function StatsCard({ label, value, suffix = '', icon: Icon, color }) {
    return (
        <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
                    <p style={{ fontSize: 32, fontWeight: 700, color }}>
                        {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                    </p>
                </div>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${color}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={22} color={color} />
                </div>
            </div>
        </motion.div>
    );
}
