import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
    const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });

    useEffect(() => {
        let frameId = null;
        const handleMouseMove = (e) => {
            if (frameId) cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                setMousePos({ x: e.clientX, y: e.clientY });
            });
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <>
            {/* Deep emerald aurora — dual focal points */}
            <div className="bg-aurora" />

            {/* Top radial glow */}
            <div className="bg-radial" />

            {/* Topographic contour lines */}
            <div className="bg-topo" />

            {/* Scientific hex mesh */}
            <div className="bg-hex" />

            {/* Subtle grid / contour drift */}
            <div className="bg-grid" />

            {/* Conic radial overlay */}
            <div className="bg-overlay" />

            {/* Ambient breathing center glow */}
            <div className="bg-ambient" />

            {/* Mouse-tracked spotlight */}
            <div
                className="bg-spotlight"
                style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
            />
        </>
    );
}
