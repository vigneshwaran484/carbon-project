import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Mail, Trash2, RefreshCw, CheckCircle2,
    Zap, Award, TrendingUp, BarChart3, Search,
    ChevronDown, Send, Sparkles, Shield, Globe, Clock,
    XCircle, ChevronLeft, ChevronRight, Filter, AtSign,
    Leaf, AlertTriangle, CheckCircle, Plus
} from 'lucide-react';
import api from '../services/api';

// ─── WORKFLOW STEPS ───────────────────────────────────────────────────────────
const STEPS = [
    { id: 1,  label: 'Retrieving user data',          icon: '🗄️' },
    { id: 2,  label: 'Fetching energy records',       icon: '⚡' },
    { id: 3,  label: 'Running AI analysis',           icon: '🤖' },
    { id: 4,  label: 'Extracting carbon data',        icon: '⚗️' },
    { id: 5,  label: 'Filtering irrelevant data',     icon: '🔍' },
    { id: 6,  label: 'Calculating GHG emissions',     icon: '📊' },
    { id: 7,  label: 'Calculating carbon credits',    icon: '🌿' },
    { id: 8,  label: 'Generating ESG insights',       icon: '✨' },
    { id: 9,  label: 'Building report charts',        icon: '📈' },
    { id: 10, label: 'Generating 6-page PDF',         icon: '📄' },
    { id: 11, label: 'Storing in database',           icon: '💾' },
];

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }) {
    const [val, setVal] = useState(0);
    const raf = useRef(null);
    useEffect(() => {
        if (!to) { setVal(0); return; }
        const start = Date.now();
        const tick = () => {
            const p = Math.min((Date.now() - start) / 1400, 1);
            setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [to]);
    return <>{val}{suffix}</>;
}

// ─── STATUS PILL ─────────────────────────────────────────────────────────────
function Pill({ status }) {
    const map = {
        Sent:       ['#00D084', 'rgba(0,208,132,0.12)'],
        Completed:  ['#00D084', 'rgba(0,208,132,0.12)'],
        Pending:    ['#FBBF24', 'rgba(251,191,36,0.12)'],
        Processing: ['#60A5FA', 'rgba(96,165,250,0.12)'],
        Failed:     ['#F87171', 'rgba(248,113,113,0.12)'],
        Error:      ['#F87171', 'rgba(248,113,113,0.12)'],
    };
    const [color, bg] = map[status] || ['#64748B', 'rgba(100,116,139,0.12)'];
    return (
        <span style={{
            padding: '3px 10px', borderRadius: 99, fontSize: 11,
            fontWeight: 700, color, background: bg, letterSpacing: '0.03em'
        }}>{status}</span>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Reports() {
    const [stats,          setStats]          = useState({ totalReports: 0, emailedReports: 0, avgScore: 0, latestStatus: 'N/A' });
    const [history,        setHistory]        = useState([]);
    
    // Generation states
    const [isGenerating,   setIsGenerating]   = useState(false);
    const [genPhase,       setGenPhase]       = useState('idle'); // idle | generating | success | error
    const [genStep,        setGenStep]        = useState(0);
    const [genMsg,         setGenMsg]         = useState('');
    const stepTimer                           = useRef(null);
    
    // Email sending states (for the latest/selected report)
    const [email,          setEmail]          = useState('');
    const [emailError,     setEmailError]     = useState('');
    const [isSending,      setIsSending]      = useState(false);
    const [sendSuccessMsg, setSendSuccessMsg] = useState('');
    const [showEmailForm,  setShowEmailForm]  = useState(false);
    
    // History states
    const [search,         setSearch]         = useState('');
    const [sortField,      setSortField]      = useState('createdAt');
    const [sortDir,        setSortDir]        = useState('desc');
    const [statusFilter,   setStatusFilter]   = useState('All');
    const [page,           setPage]           = useState(1);
    const [deleteTarget,   setDeleteTarget]   = useState(null);
    const PAGE_SIZE = 5;

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        try {
            const [sr, hr] = await Promise.all([
                api.get('/reports/stats').catch(() => ({ data: {} })),
                api.get('/reports/history').catch(() => ({ data: [] })),
            ]);
            setStats(sr.data || {});
            setHistory(hr.data || []);
        } catch { /* silent */ }
    }

    // ── Generate Report ───────────────────────────────────────────────────────
    const handleGenerate = useCallback(async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setGenPhase('generating');
        setGenStep(0);
        setGenMsg('');

        // Animate steps
        let step = 0;
        const advance = () => {
            step++;
            setGenStep(step);
            if (step < STEPS.length) {
                const delay = step < 6 ? 600 : 800;
                stepTimer.current = setTimeout(advance, delay);
            }
        };
        stepTimer.current = setTimeout(advance, 500);

        try {
            // Generating PDF (not sending email immediately)
            // Wait, our backend POST /email requires an email address.
            // If we just want to generate, let's pass dummy email and it will generate and send. 
            // OR the backend /api/reports/email is designed to email.
            // To just generate, maybe we shouldn't send email. But if we must use the existing endpoint, we can send it to the logged in user's email, or we can just let it email the user by default (which it does if we pass empty email).
            await api.post('/reports/email', { email: '' });
            clearTimeout(stepTimer.current);
            setGenStep(STEPS.length);
            setGenPhase('success');
            setGenMsg('Report successfully generated and saved to your history!');
            await fetchData();
        } catch (apiErr) {
            clearTimeout(stepTimer.current);
            setGenPhase('error');
            setGenMsg(apiErr?.response?.data?.message || 'Failed to generate report.');
        } finally {
            setIsGenerating(false);
        }
    }, [isGenerating]);

    // ── Send Email for Existing Report ────────────────────────────────────────
    function validateEmail(val) {
        if (!val.trim()) return 'Please enter an email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Invalid email address.';
        return '';
    }

    const handleSendEmail = async (reportId) => {
        const err = validateEmail(email);
        if (err) { setEmailError(err); return; }
        setEmailError('');
        if (isSending) return;

        setIsSending(true);
        setSendSuccessMsg('');
        
        try {
            await api.post(`/reports/${reportId}/email`, { email: email.trim() });
            setSendSuccessMsg(`Report successfully emailed to ${email.trim()}`);
            setTimeout(() => {
                setShowEmailForm(false);
                setSendSuccessMsg('');
                setEmail('');
                fetchData(); // Refresh history for updated email status
            }, 3000);
        } catch (apiErr) {
            setEmailError(apiErr?.response?.data?.message || 'Failed to send email.');
        } finally {
            setIsSending(false);
        }
    };

    // ── Download ──────────────────────────────────────────────────────────────
    const handleDownload = async (reportId) => {
        try {
            const res = await api.get(`/reports/download/${reportId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a   = document.createElement('a');
            a.href = url; a.download = `${reportId}.pdf`;
            document.body.appendChild(a); a.click();
            a.remove(); window.URL.revokeObjectURL(url);
        } catch { alert('Download failed. PDF may not exist on the server yet.'); }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (reportId) => {
        try {
            await api.delete(`/reports/${reportId}`);
            setHistory(p => p.filter(r => r.reportId !== reportId));
            setStats(p => ({ ...p, totalReports: Math.max(0, (p.totalReports || 1) - 1) }));
        } catch { alert('Delete failed.'); }
        setDeleteTarget(null);
    };

    // ── Table data ────────────────────────────────────────────────────────────
    const filtered = history
        .filter(r =>
            (statusFilter === 'All' || r.emailStatus === statusFilter) &&
            (!search || r.reportId?.toLowerCase().includes(search.toLowerCase()) ||
             r.organization?.toLowerCase().includes(search.toLowerCase()))
        )
        .sort((a, b) => {
            const av = sortField === 'createdAt' ? new Date(a.createdAt) : (a[sortField] ?? 0);
            const bv = sortField === 'createdAt' ? new Date(b.createdAt) : (b[sortField] ?? 0);
            return sortDir === 'desc' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
        });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const rows       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    
    // The latest report is always the first one in the raw history (since history is sorted by createdAt desc by default from the server)
    const latestReport = history[0];

    const toggleSort = (f) => {
        if (sortField === f) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortField(f); setSortDir('desc'); }
        setPage(1);
    };

    // ── Styles ────────────────────────────────────────────────────────────────
    const glass = (border = 'rgba(0,208,132,0.13)') => ({
        background: 'rgba(5,20,12,0.75)',
        border: `1px solid ${border}`,
        borderRadius: 20,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
    });

    const btn = (v = 'primary', extra = {}) => ({
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '11px 22px', borderRadius: 11,
        fontSize: 14, fontWeight: 700, cursor: 'pointer',
        border: 'none', transition: 'all 0.22s ease',
        whiteSpace: 'nowrap',
        ...(v === 'primary' ? {
            background: 'linear-gradient(135deg,#00D084,#059669)',
            color: '#fff', boxShadow: '0 4px 20px rgba(0,208,132,0.3)',
        } : v === 'outline' ? {
            background: 'transparent', color: '#00D084',
            border: '1.5px solid rgba(0,208,132,0.4)',
        } : {
            background: 'rgba(255,255,255,0.04)', color: '#94A3B8',
            border: '1px solid rgba(255,255,255,0.08)',
        }),
        ...extra,
    });

    return (
        <div style={{
            position: 'relative', minHeight: '100vh',
            background: '#020c06',
            color: '#F1F5F9', fontFamily: "'Inter','Segoe UI',sans-serif",
            paddingBottom: 80,
        }}>
            {/* ── BACKGROUND ── */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <motion.div
                    animate={{ x: [0,50,0], y: [0,-30,0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', top: '-10%', left: '-5%',
                        width: '50vw', height: '50vw', borderRadius: '50%',
                        background: 'radial-gradient(circle,rgba(0,208,132,0.08) 0%,transparent 65%)',
                        filter: 'blur(60px)',
                    }}
                />
                <motion.div
                    animate={{ x: [0,-40,0], y: [0,40,0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
                    style={{
                        position: 'absolute', bottom: '-15%', right: '-5%',
                        width: '55vw', height: '55vw', borderRadius: '50%',
                        background: 'radial-gradient(circle,rgba(5,150,105,0.07) 0%,transparent 65%)',
                        filter: 'blur(70px)',
                    }}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(0,208,132,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,208,132,0.035) 1px,transparent 1px)',
                    backgroundSize: '52px 52px',
                }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

                {/* ── PAGE HEADER ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}
                >
                    <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                            {[
                                ['#00D084', Sparkles, 'AI Powered'],
                                ['#818CF8', Shield,   'Blockchain Verified'],
                            ].map(([color, Icon, label]) => (
                                <span key={label} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                    padding: '4px 12px', borderRadius: 99,
                                    background: `${color}15`, border: `1px solid ${color}35`,
                                    color, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                                }}>
                                    <Icon size={9} /> {label}
                                </span>
                            ))}
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(26px,4.5vw,40px)', fontWeight: 900, margin: '0 0 10px',
                            letterSpacing: '-0.035em', lineHeight: 1.12,
                        }}>
                            Enterprise <span style={{ color: '#00D084' }}>Reports</span>
                        </h1>
                        <p style={{ color: '#94A3B8', fontSize: 14, maxWidth: 500, margin: 0, lineHeight: 1.7 }}>
                            Review your latest AI carbon assessment report, download it in PDF format, or email it directly to your stakeholders.
                        </p>
                    </div>
                    
                    <div>
                        <motion.button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            whileHover={!isGenerating ? { scale: 1.03, boxShadow: '0 8px 24px rgba(0,208,132,0.35)' } : {}}
                            whileTap={!isGenerating ? { scale: 0.97 } : {}}
                            style={{ ...btn('primary'), padding: '14px 26px' }}
                        >
                            {isGenerating ? <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating AI Report...</> : <><Plus size={18} /> Generate New AI Report</>}
                        </motion.button>
                    </div>
                </motion.div>

                {/* ── WORKFLOW PROGRESS PANEL (Only shows when generating) ── */}
                <AnimatePresence>
                    {genPhase !== 'idle' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 28 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ ...glass('rgba(0,208,132,0.2)'), padding: '28px 32px', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#00D084,#34d399)' }} />

                                {/* Phase header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {genPhase === 'generating' && <><RefreshCw size={15} color="#00D084" style={{ animation: 'spin 1s linear infinite' }} /> Generating New Report...</>}
                                            {genPhase === 'success' && <><CheckCircle size={16} color="#00D084" /> Generation Complete!</>}
                                            {genPhase === 'error'   && <><AlertTriangle size={16} color="#F87171" /> Generation Failed</>}
                                        </h3>
                                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748B' }}>
                                            {genPhase === 'generating' && `Processing step ${Math.min(genStep, STEPS.length)} of ${STEPS.length}...`}
                                            {genPhase === 'success' && genMsg}
                                            {genPhase === 'error'   && genMsg}
                                        </p>
                                    </div>
                                    {genPhase !== 'generating' && (
                                        <button
                                            onClick={() => setGenPhase('idle')}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    )}
                                </div>

                                {/* Progress bar */}
                                <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', marginBottom: 20 }}>
                                    <motion.div
                                        animate={{ width: `${(Math.min(genStep, STEPS.length) / STEPS.length) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                        style={{
                                            height: '100%',
                                            background: genPhase === 'error' ? '#F87171' : 'linear-gradient(90deg,#00D084,#34d399)',
                                            borderRadius: 3,
                                        }}
                                    />
                                </div>

                                {/* Steps grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 7 }}>
                                    {STEPS.map(step => {
                                        const done    = genStep > step.id;
                                        const active  = genStep === step.id;
                                        const pending = genStep < step.id;
                                        return (
                                            <motion.div key={step.id}
                                                animate={{ opacity: pending ? 0.3 : 1 }}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 9,
                                                    padding: '9px 12px', borderRadius: 9,
                                                    background: active ? 'rgba(0,208,132,0.1)' : done ? 'rgba(0,208,132,0.05)' : 'transparent',
                                                    border: `1px solid ${active ? 'rgba(0,208,132,0.3)' : 'transparent'}`,
                                                    transition: 'all 0.3s',
                                                }}
                                            >
                                                <span style={{ fontSize: 14, width: 22, textAlign: 'center' }}>
                                                    {done ? '✅' : active ? '⚡' : step.icon}
                                                </span>
                                                <span style={{ fontSize: 11.5, color: done ? '#00D084' : active ? '#F1F5F9' : '#64748B', fontWeight: done || active ? 600 : 400 }}>
                                                    <span style={{ color: '#475569', marginRight: 3 }}>{step.id}.</span>
                                                    {step.label}
                                                </span>
                                                {active && <RefreshCw size={11} color="#00D084" style={{ marginLeft: 'auto', animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── LATEST REPORT (Displayed First) ── */}
                {latestReport ? (
                    <motion.div
                        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        style={{ ...glass('rgba(0,208,132,0.2)'), padding: 0, marginBottom: 36, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{ padding: '32px 36px', borderBottom: '1px solid rgba(0,208,132,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                                {/* Info */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                        <div style={{ padding: '4px 10px', background: 'rgba(0,208,132,0.15)', color: '#00D084', borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>
                                            LATEST REPORT
                                        </div>
                                        <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                                            ID: <span style={{ color: '#F8FAFC' }}>{latestReport.reportId}</span>
                                        </div>
                                    </div>
                                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>{latestReport.organization}</h2>
                                    <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                                        Generated on {new Date(latestReport.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            {/* AI Summary (if any) */}
                            {latestReport.aiSummary && (
                                <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, borderLeft: '3px solid #00D084' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <Sparkles size={14} color="#00D084" />
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#00D084', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Executive Summary</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6, margin: 0 }}>
                                        {latestReport.aiSummary.length > 300 ? latestReport.aiSummary.substring(0, 300) + '...' : latestReport.aiSummary}
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Action Bar (Download & Email) */}
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px 36px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <motion.button 
                                    onClick={() => handleDownload(latestReport.reportId)}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    style={btn('primary')}
                                >
                                    <Download size={16} /> Download PDF
                                </motion.button>
                                
                                <motion.button 
                                    onClick={() => setShowEmailForm(!showEmailForm)}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    style={btn(showEmailForm ? 'ghost' : 'outline')}
                                >
                                    <Mail size={16} /> {showEmailForm ? 'Cancel Email' : 'Email Report'}
                                </motion.button>
                            </div>
                            
                            {/* Expandable Email Form */}
                            <AnimatePresence>
                                {showEmailForm && (
                                    <motion.div 
                                        initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                                        animate={{ opacity: 1, width: 'auto', marginLeft: 10 }}
                                        exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', whiteSpace: 'nowrap' }}
                                    >
                                        <div style={{ position: 'relative', width: 260 }}>
                                            <AtSign size={15} color="#64748B" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                                                onKeyDown={e => e.key === 'Enter' && handleSendEmail(latestReport.reportId)}
                                                placeholder="Recipient email address"
                                                disabled={isSending}
                                                style={{
                                                    width: '100%', boxSizing: 'border-box',
                                                    padding: '10px 14px 10px 40px',
                                                    background: 'rgba(0,0,0,0.4)',
                                                    border: `1.5px solid ${emailError ? '#F87171' : 'rgba(0,208,132,0.2)'}`,
                                                    borderRadius: 10, color: '#F1F5F9', fontSize: 13,
                                                    outline: 'none', transition: 'border-color 0.2s',
                                                }}
                                            />
                                        </div>
                                        <motion.button 
                                            onClick={() => handleSendEmail(latestReport.reportId)}
                                            disabled={isSending}
                                            whileHover={!isSending ? { scale: 1.05 } : {}}
                                            whileTap={!isSending ? { scale: 0.95 } : {}}
                                            style={{
                                                background: '#00D084', color: '#fff', border: 'none',
                                                width: 38, height: 38, borderRadius: 10,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: isSending ? 'not-allowed' : 'pointer',
                                                opacity: isSending ? 0.6 : 1
                                            }}
                                        >
                                            {isSending ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                                        </motion.button>
                                        
                                        {/* Status messages for email */}
                                        {emailError && <span style={{ color: '#F87171', fontSize: 12, marginLeft: 8 }}><AlertTriangle size={12}/> {emailError}</span>}
                                        {sendSuccessMsg && <span style={{ color: '#00D084', fontSize: 12, marginLeft: 8 }}><CheckCircle size={12}/> {sendSuccessMsg}</span>}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ) : (
                    <div style={{ ...glass(), padding: '60px 20px', textAlign: 'center', marginBottom: 36 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 10px' }}>No Reports Found</h2>
                        <p style={{ color: '#94A3B8', fontSize: 14, maxWidth: 400, margin: '0 auto 24px' }}>
                            You haven't generated any carbon assessment reports yet. Click the "Generate New AI Report" button above to get started.
                        </p>
                    </div>
                )}

                {/* ── ALL REPORTS HISTORY TABLE ── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    {/* Table toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>Report Archive</h2>
                            <p style={{ margin: '3px 0 0', fontSize: 11.5, color: '#64748B' }}>Past reports are permanently saved</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={13} color="#64748B" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input
                                    value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search..."
                                    style={{
                                        padding: '8px 11px 8px 32px', background: 'rgba(5,20,12,0.8)',
                                        border: '1px solid rgba(0,208,132,0.15)', borderRadius: 9,
                                        color: '#F1F5F9', fontSize: 12.5, outline: 'none', width: 180,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ ...glass(), overflow: 'hidden' }}>
                        {rows.length === 0 ? (
                            <div style={{ padding: '40px 32px', textAlign: 'center' }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>No archive results found</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                                                {[
                                                    { k: 'reportId',    l: 'Report ID' },
                                                    { k: 'createdAt',   l: 'Date' },
                                                    { k: 'carbonScore', l: 'Score' },
                                                    { k: 'emailStatus', l: 'Email Status' },
                                                    { k: null,          l: 'Actions' },
                                                ].map(col => (
                                                    <th key={col.l}
                                                        onClick={() => col.k && toggleSort(col.k)}
                                                        style={{
                                                            padding: '12px 14px', fontSize: 10.5, color: '#64748B', fontWeight: 700,
                                                            textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left',
                                                            borderBottom: '1px solid rgba(0,208,132,0.07)',
                                                            cursor: col.k ? 'pointer' : 'default', whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                            {col.l}
                                                            {col.k && sortField === col.k && (
                                                                <ChevronDown size={11} style={{ transform: sortDir === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                                            )}
                                                        </span>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map(rep => (
                                                <motion.tr
                                                    key={rep._id}
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                    whileHover={{ background: 'rgba(0,208,132,0.03)' }}
                                                    style={{ transition: 'background 0.18s' }}
                                                >
                                                    {/* Report ID */}
                                                    <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(0,208,132,0.05)', verticalAlign: 'middle' }}>
                                                        <span style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#00D084', fontWeight: 700 }}>
                                                            {rep.reportId}
                                                        </span>
                                                    </td>
                                                    {/* Date */}
                                                    <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(0,208,132,0.05)' }}>
                                                        <div style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 500 }}>
                                                            {new Date(rep.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 2 }}>
                                                            {new Date(rep.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    {/* Score */}
                                                    <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(0,208,132,0.05)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                            <div style={{ width: 48, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                                                                <div style={{
                                                                    height: '100%', borderRadius: 2,
                                                                    width: `${rep.carbonScore || 0}%`,
                                                                    background: rep.carbonScore >= 60 ? '#00D084' : rep.carbonScore >= 30 ? '#FBBF24' : '#F87171',
                                                                }} />
                                                            </div>
                                                            <span style={{
                                                                fontSize: 12, fontWeight: 700,
                                                                color: rep.carbonScore >= 60 ? '#00D084' : rep.carbonScore >= 30 ? '#FBBF24' : '#F87171',
                                                            }}>{rep.carbonScore || 0}</span>
                                                        </div>
                                                    </td>
                                                    {/* Email status */}
                                                    <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(0,208,132,0.05)' }}>
                                                        <Pill status={rep.emailStatus} />
                                                    </td>
                                                    {/* Actions */}
                                                    <td style={{ padding: '13px 14px', borderBottom: '1px solid rgba(0,208,132,0.05)' }}>
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            {[
                                                                { Icon: Download, title: 'Download PDF', action: () => handleDownload(rep.reportId), hoverColor: '#00D084' },
                                                                { Icon: Trash2,   title: 'Delete',       action: () => setDeleteTarget(rep.reportId), hoverColor: '#F87171' },
                                                            ].map((a, ai) => (
                                                                <motion.button key={ai}
                                                                    onClick={a.action} title={a.title}
                                                                    whileHover={{ scale: 1.12, background: `${a.hoverColor}18`, color: a.hoverColor }}
                                                                    whileTap={{ scale: 0.92 }}
                                                                    style={{
                                                                        width: 30, height: 30, borderRadius: 7, cursor: 'pointer',
                                                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                                                                        color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        transition: 'all 0.18s',
                                                                    }}
                                                                >
                                                                    <a.Icon size={13} />
                                                                </motion.button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid rgba(0,208,132,0.07)' }}>
                                        <span style={{ fontSize: 11.5, color: '#64748B' }}>
                                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                                        </span>
                                        <div style={{ display: 'flex', gap: 5 }}>
                                            <button
                                                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                                style={{ ...btn('ghost', { padding: '5px 9px' }), opacity: page === 1 ? 0.4 : 1 }}
                                            >
                                                <ChevronLeft size={14} />
                                            </button>
                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                                                <button key={p} onClick={() => setPage(p)}
                                                    style={{ ...btn(p === page ? 'primary' : 'ghost', { padding: '5px 11px', fontSize: 12 }) }}>
                                                    {p}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                                style={{ ...btn('ghost', { padding: '5px 9px' }), opacity: page === totalPages ? 0.4 : 1 }}
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ── DELETE CONFIRM MODAL ── */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setDeleteTarget(null)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 999,
                            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{ ...glass('rgba(248,113,113,0.22)'), padding: '32px 36px', maxWidth: 360, width: '90%', textAlign: 'center' }}
                        >
                            <div style={{ fontSize: 42, marginBottom: 14 }}>🗑️</div>
                            <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 800 }}>Delete Report?</h3>
                            <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
                                Report <code style={{ color: '#F87171', background: 'rgba(248,113,113,0.1)', padding: '2px 6px', borderRadius: 5 }}>{deleteTarget}</code> will be permanently removed. This cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={() => setDeleteTarget(null)} style={{ ...btn('ghost'), flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button onClick={() => handleDelete(deleteTarget)}
                                    style={{ ...btn('primary'), flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                input::placeholder, textarea::placeholder { color: #475569; }
                input:focus { outline: none; }
            `}</style>
        </div>
    );
}
