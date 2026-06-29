import { useState, useEffect, useRef } from 'react';
import {
    Zap, Droplets, Package, Trash2, Leaf, ClipboardList,
    ChevronDown, ChevronUp, Brain, CheckCircle,
    AlertTriangle, RotateCcw, FileText, Building2,
    Factory, StickyNote, Flame, Wind, Sun, TreePine,
    ShoppingBag, BarChart3, Lightbulb, ArrowRight,
    UploadCloud, FileSpreadsheet, Eye, ShieldCheck,
    File, Sparkles, RefreshCw, Download, BrainCircuit,
    Activity, X
} from 'lucide-react';
import api from '../services/api';

// ─── Emission factors ─────────────────────────────────────────────────────────
const EF = {
    electricity: 0.82, diesel: 2.68, petrol: 2.31, lpg: 1.51,
    naturalGas: 2.04, coal: 2.42, steel: 1.85, cement: 0.83,
    aluminium: 8.24, plastic: 2.53, glass: 0.85, wood: 0.46,
    organicWaste: 0.58, plasticWaste: 2.53, metalWaste: 1.85,
    hazardousWaste: 3.50, freshWater: 0.36,
    treePerYear: 21.77, solarOffset: 0.82, windOffset: 0.82,
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const INDUSTRIES = ['Manufacturing','Government','Healthcare','Education','Agriculture','Construction','Transport','Retail','Hospitality','Energy','IT/Technology','NGO','Research','Other'];

const EMPTY_FORM = {
    projectName: '', organizationName: '', facilityName: '',
    industryType: '', reportingMonth: '', reportingYear: '', remarks: '',
    electricity: '', diesel: '', petrol: '', lpg: '',
    naturalGas: '', coal: '', renewableEnergy: '',
    freshWater: '', recycledWater: '', rainwaterHarvested: '',
    steel: '', cement: '', aluminium: '', plastic: '', glass: '', wood: '',
    organicWaste: '', plasticWaste: '', metalWaste: '', hazardousWaste: '', recycledWaste: '',
    treesPlanted: '', carbonOffsetPurchased: '', solarEnergyGenerated: '', windEnergyUsed: '',
};

const DOC_TIMELINE = [
    { id: 'upload',       label: 'Upload Complete',             icon: UploadCloud },
    { id: 'reading',      label: 'Reading Document',            icon: Eye },
    { id: 'understanding',label: 'Understanding Context',       icon: Brain },
    { id: 'extracting',   label: 'Extracting Carbon Data',      icon: Zap },
    { id: 'ignoring',     label: 'Filtering Irrelevant Content',icon: X },
    { id: 'calculating',  label: 'Calculating Carbon Footprint',icon: Activity },
    { id: 'insights',     label: 'Generating AI Insights',      icon: Sparkles },
    { id: 'saving',       label: 'Saving to MongoDB',           icon: CheckCircle },
    { id: 'done',         label: 'Dashboard Updated ✓',         icon: CheckCircle },
];

function n(v) { return parseFloat(v) || 0; }

function calcLocal(d) {
    const scope1 = n(d.diesel)*EF.diesel + n(d.petrol)*EF.petrol + n(d.lpg)*EF.lpg +
        n(d.naturalGas)*EF.naturalGas + n(d.coal)*EF.coal +
        n(d.organicWaste)*EF.organicWaste + n(d.plasticWaste)*EF.plasticWaste +
        n(d.metalWaste)*EF.metalWaste + n(d.hazardousWaste)*EF.hazardousWaste;
    const scope2 = n(d.electricity)*EF.electricity;
    const scope3 = n(d.steel)*EF.steel + n(d.cement)*EF.cement + n(d.aluminium)*EF.aluminium +
        n(d.plastic)*EF.plastic + n(d.glass)*EF.glass + n(d.wood)*EF.wood +
        (n(d.freshWater)/1000)*EF.freshWater;
    const totalFootprint = scope1 + scope2 + scope3;
    const carbonOffset = n(d.treesPlanted)*EF.treePerYear + n(d.carbonOffsetPurchased) +
        n(d.solarEnergyGenerated)*EF.solarOffset + n(d.windEnergyUsed)*EF.windOffset +
        n(d.renewableEnergy)*EF.solarOffset;
    const netEmissions = Math.max(0, totalFootprint - carbonOffset);
    return {
        scope1: +scope1.toFixed(2), scope2: +scope2.toFixed(2), scope3: +scope3.toFixed(2),
        totalFootprint: +totalFootprint.toFixed(2),
        carbonOffset: +carbonOffset.toFixed(2), netEmissions: +netEmissions.toFixed(2),
        carbonCredits: +(netEmissions / 1000).toFixed(4),
    };
}

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024, sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ─── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, unit, color, sub }) {
    return (
        <div style={{
            background: `${color}10`,
            border: `1px solid ${color}30`,
            borderRadius: 'var(--r-md)',
            padding: '16px 20px',
            flex: 1,
            minWidth: 130,
        }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.02em' }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {unit && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{unit}</div>}
            {sub  && <div style={{ fontSize: 10, color: `${color}90`, marginTop: 4 }}>{sub}</div>}
        </div>
    );
}

// ─── Section accordion ──────────────────────────────────────────────────────────
function Section({ icon: Icon, title, color, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{
            border: `1px solid ${open ? color + '35' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--r-md)',
            overflow: 'hidden',
            transition: 'border-color 0.3s',
            marginBottom: 12,
        }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    background: open ? `${color}0d` : 'rgba(0,0,0,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    transition: 'background 0.25s',
                    fontFamily: 'inherit',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={15} color={color} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em' }}>{title}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {open ? 'Collapse' : 'Expand'}
                    {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </div>
            </button>
            {open && (
                <div style={{ padding: 18, background: 'rgba(0,0,0,0.12)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                    {children}
                </div>
            )}
        </div>
    );
}

function NumField({ label, unit, iconColor = 'var(--accent-primary)', fieldKey, form, setForm, IconComp }) {
    return (
        <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {IconComp && <IconComp size={10} color={iconColor} />}
                {label}
                {unit && <span style={{ color: 'var(--text-faint)', fontWeight: 400, textTransform: 'none', fontSize: 10, marginLeft: 2 }}>({unit})</span>}
            </label>
            <input
                type="number"
                className="input-field"
                placeholder="0"
                min="0"
                value={form[fieldKey]}
                onChange={e => setForm(p => ({ ...p, [fieldKey]: e.target.value }))}
            />
        </div>
    );
}

function ScoreRing({ score }) {
    const r = 48; const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 70 ? 'var(--accent-primary)' : score >= 40 ? 'var(--data-amber)' : 'var(--data-red)';
    return (
        <div style={{ position: 'relative', width: 116, height: 116 }}>
            <svg width="116" height="116" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="58" cy="58" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
                <circle cx="58" cy="58" r={r} fill="none" stroke={color} strokeWidth="9"
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 24, fontWeight: 800, color }}>{score}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/100</span>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AI DOCUMENT UPLOAD PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function AIDocumentPanel({ onHistoryRefresh }) {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle');
    const [stepIdx, setStepIdx] = useState(0);
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);
    const resultRef = useRef(null);

    const validTypes = ['application/pdf','text/csv','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

    const pickFile = (f) => {
        if (!f) return;
        if (!validTypes.includes(f.type)) { setErrorMsg('Invalid type. Upload PDF, Excel or CSV.'); return; }
        if (f.size > 50 * 1024 * 1024) { setErrorMsg('File exceeds 50 MB limit.'); return; }
        setFile(f); setErrorMsg(''); setStatus('idle'); setResult(null);
    };

    const runTimeline = async () => {
        for (let i = 1; i < DOC_TIMELINE.length - 1; i++) {
            setStepIdx(i);
            await new Promise(r => setTimeout(r, 550 + Math.random() * 350));
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('processing'); setStepIdx(0);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const [res] = await Promise.all([
                api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
                runTimeline(),
            ]);
            setStepIdx(DOC_TIMELINE.length - 1);
            setResult(res.data);
            setTimeout(() => {
                setStatus('complete');
                if (onHistoryRefresh) onHistoryRefresh();
                setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
            }, 900);
        } catch (err) {
            setStatus('error');
            setErrorMsg(err.response?.data?.message || 'AI analysis failed. Please try again.');
        }
    };

    const reset = () => { setFile(null); setStatus('idle'); setResult(null); setErrorMsg(''); setStepIdx(0); };

    // ── Idle / Error state ──────────────────────────────────────────────────
    if (status === 'idle' || status === 'error') return (
        <div>
            {/* Hero upload area */}
            <div className="glass-card-feature" style={{ padding: '36px 40px', marginBottom: 24, overflow: 'hidden' }}>
                {/* Ambient glow */}
                <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '50%', height: '160%', background: 'radial-gradient(circle, rgba(0,208,132,0.1) 0%, transparent 65%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
                    {/* Left — copy */}
                    <div>
                        <div className="badge badge-green" style={{ marginBottom: 20 }}>Enterprise AI — Powered</div>
                        <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 14, letterSpacing: '-0.03em', background: 'var(--grad-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.1 }}>
                            AI Document Intelligence
                        </h2>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28, maxWidth: 380 }}>
                            Upload electricity bills, fuel invoices, water reports or ESG documents. The AI reads, understands, extracts only carbon-relevant data, and calculates your footprint automatically.
                        </p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {['PDF Report', 'Excel Sheet', 'CSV Data', 'Utility Bill', 'ESG Report'].map(tag => (
                                <span key={tag} className="badge badge-emerald">{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Right — drop zone */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files[0]); }}
                        onClick={() => fileRef.current?.click()}
                        style={{
                            background: dragOver ? 'rgba(0,208,132,0.09)' : 'rgba(0,0,0,0.28)',
                            border: `2px dashed ${dragOver ? 'rgba(0,208,132,0.7)' : 'rgba(0,208,132,0.28)'}`,
                            borderRadius: 'var(--r-lg)',
                            padding: '36px 28px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <input ref={fileRef} type="file" accept=".pdf,.csv,.xls,.xlsx" style={{ display: 'none' }} onChange={e => pickFile(e.target.files[0])} />
                        <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
                        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>
                            Drag &amp; Drop Document Here
                        </h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>or click to browse your files</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                            {['PDF', 'XLSX', 'XLS', 'CSV'].map(f => (
                                <span key={f} style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }}>{f}</span>
                            ))}
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Maximum file size: 50 MB</p>

                        {/* File selected */}
                        {file && (
                            <div
                                style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(0,208,132,0.1)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(0,208,132,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{file.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'left', marginTop: 2 }}>{formatBytes(file.size)}</div>
                                </div>
                                <button onClick={handleUpload} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
                                    Analyze
                                </button>
                            </div>
                        )}

                        {errorMsg && (
                            <div style={{ marginTop: 12, color: 'var(--data-red)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <AlertTriangle size={14} /> {errorMsg}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );

    // ── Processing Timeline ───────────────────────────────────────────────────
    if (status === 'processing') return (
        <div className="glass-card" style={{ padding: '56px 64px', backdropFilter: 'blur(20px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{ width: 68, height: 68, borderRadius: 'var(--r-lg)', background: 'rgba(0,208,132,0.12)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>🧠</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em' }}>AI is Analyzing Your Document</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{file?.name}</p>
            </div>

            <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 23, top: 24, bottom: 0, width: 2, background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
                {DOC_TIMELINE.map((step, i) => {
                    const active = i === stepIdx, done = i < stepIdx;
                    const StepIcon = step.icon;
                    return (
                        <div
                            key={step.id}
                            style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 20, position: 'relative', zIndex: 1, opacity: active || done ? 1 : 0.28, transition: 'opacity 0.35s' }}
                        >
                            <div style={{
                                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `2px solid ${done ? 'var(--accent-primary)' : active ? 'rgba(0,208,132,0.6)' : 'rgba(255,255,255,0.1)'}`,
                                background: done ? 'var(--accent-primary)' : active ? 'rgba(0,208,132,0.14)' : 'rgba(255,255,255,0.03)',
                                transform: active ? 'scale(1.12)' : 'scale(1)', transition: 'all 0.3s',
                            }}>
                                {done
                                    ? <span style={{ fontSize: 18 }}>✓</span>
                                    : <StepIcon size={18} color={active ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                                }
                            </div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: active ? 700 : 500, color: active ? '#fff' : 'var(--text-secondary)', letterSpacing: '-0.01em' }}>{step.label}</div>
                                {active && <div style={{ fontSize: 11, color: 'var(--accent-primary)', marginTop: 3, animation: 'pulse 1.5s infinite' }}>Processing in real-time...</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ── Complete — Results ────────────────────────────────────────────────────
    const analysis = result?.analysis;
    const calc = result?.calculation;

    return (
        <div ref={resultRef}>
            {/* Success banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'rgba(0,208,132,0.07)', border: '1px solid rgba(0,208,132,0.25)', borderRadius: 'var(--r-md)', marginBottom: 24 }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Analysis Complete</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                        Dashboard updated with <strong style={{ color: 'var(--accent-primary)' }}>{calc?.totalEmissions?.toFixed(1)} kg CO₂e</strong>
                    </div>
                </div>
                <button onClick={reset} className="btn-secondary" style={{ fontSize: 13 }}>
                    Upload New Document
                </button>
            </div>

            {/* AI Summary */}
            <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>Executive AI Summary</span>
                    <span className="badge badge-green" style={{ marginLeft: 'auto' }}>{analysis?.overallConfidence || 0}% Confidence</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 20 }}>
                    {[
                        ['Document Type', file?.type?.includes('pdf') ? 'PDF Report' : 'Spreadsheet', 'var(--data-indigo)'],
                        ['Confidence', `${analysis?.overallConfidence || 0}%`, 'var(--accent-primary)'],
                        ['Fields Extracted', Object.values(analysis?.extractedData || {}).filter(v => v?.value > 0).length, 'var(--data-amber)'],
                        ['Scope 1', `${calc?.scope1?.toFixed(1)} kg`, 'var(--data-red)'],
                        ['Scope 2', `${calc?.scope2?.toFixed(1)} kg`, 'var(--data-amber)'],
                        ['Total Emissions', `${calc?.totalEmissions?.toFixed(1)} kg CO₂e`, 'var(--data-red)'],
                        ['Credits Required', calc?.creditsRequired?.toFixed(3), 'var(--data-indigo)'],
                    ].map(([l, v, c]) => (
                        <div key={l} style={{ minWidth: 120 }}>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{l}</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                        </div>
                    ))}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, padding: '14px 18px', background: 'rgba(0,0,0,0.18)', borderRadius: 10, borderLeft: '3px solid var(--accent-primary)' }}>
                    {analysis?.aiExplanation || 'Document processed successfully. Carbon data was extracted while irrelevant metadata was filtered out.'}
                </div>
            </div>

            {/* Extracted vs Ignored split */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
                {/* Extracted */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 6 }}>Extracted Carbon Data</div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Data points used for carbon calculation</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {['electricity','fuel','water','waste','rawMaterials'].map(key => {
                            const field = analysis?.extractedData?.[key];
                            if (!field || field.value === 0) return null;
                            const colors = { electricity: '#3b82f6', fuel: 'var(--data-amber)', water: 'var(--data-teal)', waste: 'var(--data-red)', rawMaterials: 'var(--data-indigo)' };
                            const c = colors[key];
                            return (
                                <div key={key} style={{ padding: '14px 16px', background: 'rgba(0,208,132,0.05)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(0,208,132,0.15)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)' }}>{key}</span>
                                        <span className="badge badge-green" style={{ fontSize: 10 }}>{field.confidence}% ✓</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                                        <span style={{ fontSize: 22, fontWeight: 800, color: c }}>{field.value}</span>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{field.unit}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>{field.explanation}</div>
                                    <input type="number" defaultValue={field.value}
                                        style={{ marginTop: 8, width: '100%', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,208,132,0.2)', borderRadius: 7, color: 'var(--text-primary)', fontSize: 12, fontFamily: 'inherit', outline: 'none' }}
                                        placeholder="Edit value if incorrect" />
                                </div>
                            );
                        })}
                        {Object.values(analysis?.extractedData || {}).every(v => !v || v.value === 0) && (
                            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No carbon data could be extracted.</div>
                        )}
                    </div>
                </div>

                {/* Ignored */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Ignored Information</div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>AI intentionally filtered these — not relevant to carbon calculations.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {analysis?.ignoredFields?.map((ig, i) => (
                            <div key={i} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{ig.field}</span>
                                    <span className="badge badge-slate" style={{ fontSize: 9 }}>Ignored</span>
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ig.reason}</div>
                            </div>
                        ))}
                        {!analysis?.ignoredFields?.length && (
                            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No irrelevant fields detected.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Carbon Calculation Breakdown */}
            <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, letterSpacing: '-0.01em' }}>Carbon Calculation Breakdown</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'stretch' }}>
                    {[
                        ['Scope 1 (Direct)', calc?.scope1, 'var(--data-red)'],
                        ['Scope 2 (Electricity)', calc?.scope2, 'var(--data-amber)'],
                        ['Total Footprint', calc?.totalEmissions, 'var(--data-red)'],
                        ['Credits Required', calc?.creditsRequired, 'var(--data-indigo)'],
                    ].map(([l, v, c]) => (
                        <KpiCard key={l} label={l} value={v?.toFixed(2) ?? 0} unit="kg CO₂e" color={c} />
                    ))}
                </div>
            </div>

            {/* AI Recommendations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {[
                    ['Reduce Electricity', 'Optimise HVAC scheduling and replace legacy equipment to cut Scope 2 emissions.', '12% reduction', 'var(--data-amber)'],
                    ['Switch to Solar', 'Rooftop solar panels can drastically reduce grid dependency and Scope 2 emissions.', '18% savings', 'var(--accent-primary)'],
                    ['Offset Strategy', 'Purchase certified carbon credits or plant trees to achieve interim Net Zero.', `${calc?.creditsRequired?.toFixed(2) || 0} credits`, 'var(--data-indigo)'],
                ].map(([title, desc, metric, color]) => (
                    <div key={title} className="glass-card" style={{ padding: 22, borderTop: `3px solid ${color}` }}>
                        <h5 style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#fff', letterSpacing: '-0.01em' }}>{title}</h5>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.6 }}>{desc}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
                            <span style={{ color: 'var(--text-muted)' }}>Estimated</span>
                            <span style={{ color }}>{metric}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MANUAL ENTRY PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function ManualEntryPanel({ onSaved }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [errors, setErrors] = useState({});
    const resultRef = useRef(null);
    const preview = calcLocal(form);

    const validate = () => {
        const e = {};
        if (!form.projectName.trim()) e.projectName = true;
        if (!form.organizationName.trim()) e.organizationName = true;
        if (!form.reportingMonth) e.reportingMonth = true;
        if (!form.reportingYear) e.reportingYear = true;
        const hasEnergy = ['electricity','diesel','petrol','lpg','naturalGas','coal'].some(k => n(form[k]) > 0);
        if (!hasEnergy) e._energy = 'Enter at least one energy value';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true); setResult(null);
        try {
            const payload = {};
            Object.keys(form).forEach(k => { payload[k] = isNaN(parseFloat(form[k])) ? form[k] : (parseFloat(form[k]) || 0); });
            const res = await api.post('/energy-log', payload);
            setResult(res.data);
            if (onSaved) onSaved();
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        } catch (err) {
            alert(err.response?.data?.message || 'Submission failed. Please try again.');
        }
        setLoading(false);
    };

    const borderErr = (key) => errors[key] ? { borderColor: 'var(--data-red)' } : {};
    const labelStyle = { fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 7 };

    return (
        <div>
            {/* Live Preview */}
            {preview.totalFootprint > 0 && (
                <div style={{ background: 'rgba(0,208,132,0.07)', border: '1px solid rgba(0,208,132,0.2)', borderRadius: 'var(--r-md)', padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="pulse-dot" style={{ width: 7, height: 7 }} />
                        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Preview</span>
                    </div>
                    {[['Total', preview.totalFootprint, 'kg', 'var(--data-red)'], ['Offset', preview.carbonOffset, 'kg', 'var(--accent-primary)'], ['Net', preview.netEmissions, 'kg', 'var(--data-amber)'], ['Credits', preview.carbonCredits, '', 'var(--data-indigo)']].map(([l, v, u, c]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}:</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: c }}>{v.toLocaleString()}</span>
                            {u && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u}</span>}
                        </div>
                    ))}
                </div>
            )}

            {/* Project Details */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 20, color: 'var(--text-primary)' }}>
                    Project Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {[['projectName', 'Project Name', 'text'], ['organizationName', 'Organization', 'text'], ['facilityName', 'Facility Name', 'text']].map(([key, label, type]) => (
                        <div key={key}>
                            <label style={labelStyle}>{label}{errors[key] && <span style={{ color: 'var(--data-red)', marginLeft: 4 }}>*</span>}</label>
                            <input type={type} className="input-field" placeholder={label} value={form[key]} style={borderErr(key)} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                        </div>
                    ))}
                    <div>
                        <label style={labelStyle}>Industry</label>
                        <select className="input-field" value={form.industryType} onChange={e => setForm(p => ({ ...p, industryType: e.target.value }))}>
                            <option value="">Select...</option>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Month{errors.reportingMonth && <span style={{ color: 'var(--data-red)', marginLeft: 4 }}>*</span>}</label>
                        <select className="input-field" value={form.reportingMonth} style={borderErr('reportingMonth')} onChange={e => setForm(p => ({ ...p, reportingMonth: e.target.value }))}>
                            <option value="">Select...</option>{MONTHS.map(m => <option key={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Year{errors.reportingYear && <span style={{ color: 'var(--data-red)', marginLeft: 4 }}>*</span>}</label>
                        <select className="input-field" value={form.reportingYear} style={borderErr('reportingYear')} onChange={e => setForm(p => ({ ...p, reportingYear: e.target.value }))}>
                            <option value="">Select...</option>{[2025,2024,2023,2022].map(y => <option key={y}>{y}</option>)}
                        </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Remarks</label>
                        <textarea className="input-field" rows={2} placeholder="Additional notes..." value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                </div>
            </div>

            {/* Energy error */}
            {errors._energy && (
                <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={14} color="var(--data-red)" />
                    <span style={{ fontSize: 13, color: 'var(--data-red)' }}>{errors._energy}</span>
                </div>
            )}

            {/* Data sections */}
            <Section icon={Zap} title="Energy Consumption" color="var(--data-amber)" defaultOpen>
                {[['electricity','Electricity','kWh',Zap,'#3b82f6'],['diesel','Diesel','Litres',Flame,'var(--data-amber)'],['petrol','Petrol','Litres',Flame,'var(--data-red)'],['lpg','LPG','kg',Flame,'#f97316'],['naturalGas','Natural Gas','m³',Wind,'var(--text-muted)'],['coal','Coal','kg',Package,'#78716c'],['renewableEnergy','Renewable Generated','kWh',Sun,'var(--accent-primary)']].map(([k,l,u,I,c]) => (
                    <NumField key={k} fieldKey={k} label={l} unit={u} form={form} setForm={setForm} IconComp={I} iconColor={c} />
                ))}
            </Section>
            <Section icon={Droplets} title="Water Consumption" color="var(--data-teal)">
                {[['freshWater','Fresh Water','L'],['recycledWater','Recycled Water','L'],['rainwaterHarvested','Rainwater Harvested','L']].map(([k,l,u]) => (
                    <NumField key={k} fieldKey={k} label={l} unit={u} form={form} setForm={setForm} IconComp={Droplets} iconColor="var(--data-teal)" />
                ))}
            </Section>
            <Section icon={Package} title="Raw Materials" color="var(--data-indigo)">
                {['steel','cement','aluminium','plastic','glass','wood'].map(k => (
                    <NumField key={k} fieldKey={k} label={k.charAt(0).toUpperCase()+k.slice(1)} unit="kg" form={form} setForm={setForm} IconComp={Package} iconColor="var(--data-indigo)" />
                ))}
            </Section>
            <Section icon={Trash2} title="Waste Generation" color="var(--data-red)">
                {[['organicWaste','Organic Waste'],['plasticWaste','Plastic Waste'],['metalWaste','Metal Waste'],['hazardousWaste','Hazardous Waste'],['recycledWaste','Recycled Waste']].map(([k,l]) => (
                    <NumField key={k} fieldKey={k} label={l} unit="kg" form={form} setForm={setForm} IconComp={Trash2} iconColor="var(--data-red)" />
                ))}
            </Section>
            <Section icon={Leaf} title="Carbon Offset Activities" color="var(--accent-primary)">
                {[['treesPlanted','Trees Planted','count',TreePine],['carbonOffsetPurchased','Carbon Offset Purchased','kg CO₂e',ShoppingBag],['solarEnergyGenerated','Solar Generated','kWh',Sun],['windEnergyUsed','Wind Energy','kWh',Wind]].map(([k,l,u,I]) => (
                    <NumField key={k} fieldKey={k} label={l} unit={u} form={form} setForm={setForm} IconComp={I} iconColor="var(--accent-primary)" />
                ))}
            </Section>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ flex: 1, justifyContent: 'center', minWidth: 180, padding: '14px 24px' }}
                >
                    {loading ? 'Calculating & Saving...' : 'Calculate & Save'}
                </button>
                <button
                    onClick={() => { setForm(EMPTY_FORM); setResult(null); setErrors({}); }}
                    className="btn-secondary"
                    style={{ padding: '14px 20px' }}
                >
                    Reset Form
                </button>
            </div>

            {/* Results */}
            {result && (
                <div ref={resultRef} style={{ marginTop: 28 }}>
                    <div className="glass-card" style={{ padding: 28, border: '1px solid rgba(0,208,132,0.3)', marginBottom: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>Carbon Calculation Results</span>
                            <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Saved ✓</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            <KpiCard label="Scope 1" value={result.calculation.scope1} unit="kg CO₂e" color="var(--data-red)" sub="Fuel, Gas, Waste" />
                            <KpiCard label="Scope 2" value={result.calculation.scope2} unit="kg CO₂e" color="var(--data-amber)" sub="Electricity" />
                            <KpiCard label="Scope 3" value={result.calculation.scope3} unit="kg CO₂e" color="#f97316" sub="Materials" />
                            <KpiCard label="Total Footprint" value={result.calculation.totalFootprint} unit="kg CO₂e" color="var(--data-red)" />
                            <KpiCard label="Carbon Offset" value={result.calculation.carbonOffset} unit="kg CO₂e" color="var(--accent-primary)" />
                            <KpiCard label="Net Emissions" value={result.calculation.netEmissions} unit="kg CO₂e" color="var(--data-indigo)" />
                            <KpiCard label="Carbon Credits" value={result.calculation.carbonCredits} unit="credits" color="var(--data-indigo)" />
                        </div>
                    </div>

                    {result.aiAnalysis && (
                        <div className="glass-card" style={{ padding: 28, border: '1px solid rgba(129,140,248,0.25)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                                <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>AI Sustainability Analysis</span>
                                <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>{result.aiAnalysis.confidenceScore}% Confidence</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '116px 1fr', gap: 24, alignItems: 'start' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                    <ScoreRing score={result.aiAnalysis.sustainabilityScore} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sustainability Score</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.18)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                                        {result.aiAnalysis.aiSummary}
                                    </div>
                                    {result.aiAnalysis.recommendations?.length > 0 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                                            {result.aiAnalysis.recommendations.map((r, i) => (
                                                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(0,208,132,0.05)', border: '1px solid rgba(0,208,132,0.14)', borderRadius: 10, padding: '11px 13px' }}>
                                                    <span style={{ color: 'var(--accent-primary)', marginTop: 1, flexShrink: 0, fontWeight: 700 }}>→</span>
                                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HISTORY PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function HistoryPanel({ refresh }) {
    const [docHistory, setDocHistory] = useState([]);
    const [logHistory, setLogHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const [docs, logs] = await Promise.all([
                api.get('/documents/history'),
                api.get('/energy-log'),
            ]);
            setDocHistory(docs.data);
            setLogHistory(logs.data);
        } catch { /* silent */ }
        setLoading(false);
    };

    useEffect(() => { load(); }, [refresh]);

    const deleteDoc = async (id) => {
        if (!window.confirm('Delete this document?')) return;
        await api.delete(`/documents/${id}`); load();
    };
    const deleteLog = async (id) => {
        if (!window.confirm('Delete this log?')) return;
        await api.delete(`/energy-log/${id}`); load();
    };

    if (loading) return (
        <div className="loading-center">
            <div className="pulse-dot" style={{ width: 12, height: 12 }} />
            <span className="loading-label">Loading history...</span>
        </div>
    );

    return (
        <div>
            {/* Document Archive */}
            <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 2 }}>Document Archive</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{docHistory.length} document{docHistory.length !== 1 ? 's' : ''} analyzed</p>
                    </div>
                </div>
                {docHistory.length === 0 ? (
                    <div className="glass-card">
                        <div className="empty-state">
                            <p className="empty-state-title">No Documents Uploaded</p>
                            <p className="empty-state-desc">Upload a PDF, Excel, or CSV document to get started with AI analysis.</p>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card" style={{ overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>File</th>
                                    <th>Type</th>
                                    <th>Upload Date</th>
                                    <th>Status</th>
                                    <th>AI Score</th>
                                    <th>Emissions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docHistory.map(h => (
                                    <tr key={h.document._id}>
                                        <td>
                                            <span style={{ fontWeight: 600, fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                {h.document.originalName}
                                            </span>
                                        </td>
                                        <td><span style={{ fontSize: 11, fontWeight: 700 }}>{h.document.mimetype?.includes('pdf') ? 'PDF' : 'Excel/CSV'}</span></td>
                                        <td style={{ fontSize: 13 }}>{new Date(h.document.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        <td><span className="badge badge-green" style={{ fontSize: 10 }}>{h.document.status || 'Analyzed'}</span></td>
                                        <td style={{ fontWeight: 700 }}>{h.analysis?.overallConfidence || 0}%</td>
                                        <td style={{ fontWeight: 700 }}>{h.calculation?.totalEmissions?.toFixed(1) || 0} kg</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <button style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600 }}>View</button>
                                                <button onClick={() => deleteDoc(h.document._id)} style={{ background: 'none', border: 'none', color: 'var(--data-red)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600 }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Manual Logs */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 2 }}>Manual Entry Logs</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{logHistory.length} record{logHistory.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                {logHistory.length === 0 ? (
                    <div className="glass-card">
                        <div className="empty-state">
                            <p className="empty-state-title">No Manual Entries</p>
                            <p className="empty-state-desc">Switch to the Manual Entry tab to log energy data.</p>
                        </div>
                    </div>
                ) : logHistory.map(({ log, calculation, aiAnalysis }) => (
                    <div key={log._id} className="glass-card" style={{ padding: '18px 22px', marginBottom: 10, borderRadius: 'var(--r-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, letterSpacing: '-0.01em' }}>{log.projectName || 'Unnamed Project'}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.organizationName} · {log.reportingMonth} {log.reportingYear} · {new Date(log.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                {calculation && [['Total', calculation.totalFootprint,'var(--data-red)'],['Net', calculation.netEmissions,'var(--data-amber)'],['Credits', calculation.carbonCredits,'var(--data-indigo)']].map(([l,v,c]) => (
                                    <div key={l} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--r-xs)', padding: '6px 12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{l}</div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: c }}>{typeof v === 'number' ? v.toLocaleString() : v}</div>
                                    </div>
                                ))}
                                {aiAnalysis && (
                                    <div style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 'var(--r-xs)', padding: '6px 12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Score</div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--data-indigo)' }}>{aiAnalysis.sustainabilityScore}/100</div>
                                    </div>
                                )}
                                <button
                                    onClick={() => deleteLog(log._id)}
                                    style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--r-xs)', padding: '6px 12px', cursor: 'pointer', color: 'var(--data-red)', fontFamily: 'inherit', fontSize: 11, fontWeight: 700 }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AddEnergy() {
    const [tab, setTab] = useState('upload');
    const [histRefresh, setHistRefresh] = useState(0);

    const TABS = [
        { id: 'upload',  label: 'AI Document Upload', color: 'var(--accent-primary)' },
        { id: 'manual',  label: 'Manual Entry',        color: 'var(--data-indigo)' },
        { id: 'history', label: 'All History',          color: 'var(--data-indigo)' },
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', paddingBottom: 80 }}>
            {/* ── Page Header ── */}
            <div style={{ marginBottom: 32 }}>
                <div className="section-label" style={{ marginBottom: 8 }}>Carbon Intelligence</div>
                <h1 className="page-title gradient-text">Energy &amp; Emissions</h1>
                <p className="page-subtitle" style={{ marginTop: 8 }}>
                    Upload documents or manually enter data · AI calculates footprint · Auto-saves to MongoDB
                </p>
            </div>

            {/* ── Tab Bar ── */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--r-md)', padding: 5, width: 'fit-content', border: '1px solid var(--border-subtle)' }}>
                {TABS.map(({ id, label, color }) => {
                    const active = tab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            style={{
                                padding: '10px 24px',
                                borderRadius: 'var(--r-sm)',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: active ? 700 : 500,
                                fontSize: 13,
                                fontFamily: 'inherit',
                                letterSpacing: '-0.01em',
                                background: active ? `${color}18` : 'transparent',
                                color: active ? color : 'var(--text-muted)',
                                borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Content ── */}
            {tab === 'upload'  && <AIDocumentPanel  onHistoryRefresh={() => setHistRefresh(r => r + 1)} />}
            {tab === 'manual'  && <ManualEntryPanel onSaved={() => setHistRefresh(r => r + 1)} />}
            {tab === 'history' && <HistoryPanel refresh={histRefresh} />}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
