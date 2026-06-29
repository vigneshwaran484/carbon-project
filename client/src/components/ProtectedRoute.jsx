import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                height: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'var(--bg-primary)',
            }}>
                <div className="pulse-dot" style={{ width: 16, height: 16 }} />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    return children;
}
