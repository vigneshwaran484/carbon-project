import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import AnimatedBackground from './AnimatedBackground';

export default function AppShell() {
    return (
        <div
            className="bg-dashboard"
            style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
        >
            <AnimatedBackground />
            <TopNav />
            <main
                style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '0',
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    scrollBehavior: 'smooth',
                }}
            >
                <Outlet />
            </main>
        </div>
    );
}
