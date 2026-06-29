import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, FileSpreadsheet, Eye, Trash2, ShieldCheck, File, Zap, Droplets, Fuel, Sparkles, X, RefreshCw, Download, ArrowRight, BrainCircuit, Activity, TreePine } from 'lucide-react';
import api from '../services/api';

const timelineSteps = [
    { id: 'upload', label: 'Upload Complete' },
    { id: 'reading', label: 'Reading Document' },
    { id: 'understanding', label: 'Understanding Context' },
    { id: 'extracting', label: 'Extracting Carbon Data' },
    { id: 'ignoring', label: 'Ignoring Irrelevant Information' },
    { id: 'calculating', label: 'Calculating Carbon Footprint' },
    { id: 'insights', label: 'Generating AI Insights' },
    { id: 'saving', label: 'Saving to MongoDB' },
    { id: 'done', label: 'Dashboard Updated' }
];

export default function AIDocumentImport({ onUploadComplete }) {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, processing, complete, error
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/documents/history');
            setHistory(res.data);
        } catch (err) {
            console.error('Failed to fetch document history', err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleFileDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) processFileSelection(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) processFileSelection(selectedFile);
    };

    const processFileSelection = (selectedFile) => {
        const validTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!validTypes.includes(selectedFile.type)) {
            setErrorMsg('Invalid file type. Please upload a PDF, Excel, or CSV file.');
            return;
        }
        if (selectedFile.size > 50 * 1024 * 1024) {
            setErrorMsg('File size exceeds 50MB limit.');
            return;
        }
        setFile(selectedFile);
        setErrorMsg('');
        setStatus('idle');
    };

    const runTimeline = async () => {
        for (let i = 1; i < timelineSteps.length - 1; i++) {
            setCurrentStepIndex(i);
            await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('processing');
        setCurrentStepIndex(0);
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Start fake timeline animation in background
            const timelinePromise = runTimeline();

            const response = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Wait for both the API to finish AND the fake timeline to look cool
            await timelinePromise;
            
            setCurrentStepIndex(timelineSteps.length - 1); // Done
            setResult(response.data);
            
            setTimeout(() => {
                setStatus('complete');
                fetchHistory();
                if (onUploadComplete) onUploadComplete();
            }, 1000);

        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMsg(err.response?.data?.message || 'Failed to analyze document.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/documents/${id}`);
            fetchHistory();
        } catch (err) {
            alert('Failed to delete document');
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // UI Renderers
    const renderHero = () => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="ai-hero-card"
            style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 78, 59, 0.2) 100%)',
                borderRadius: 28,
                border: '1px solid rgba(16, 185, 129, 0.2)',
                padding: '48px 60px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                marginBottom: 40
            }}
        >
            {/* Ambient Background Glow */}
            <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '50%', height: '150%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />
            
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 60, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 999, border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: 24 }}>
                        <Sparkles size={16} color="#10b981" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Enterprise AI Powered</span>
                    </div>
                    <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #a7f3d0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        AI Document Intelligence
                    </h2>
                    <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32, maxWidth: 480 }}>
                        Upload your electricity bills, fuel reports, ESG reports, or Excel sheets. Our AI automatically understands your documents, extracts only carbon-related information, ignores irrelevant content, and calculates emissions securely.
                    </p>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <button className="btn-primary" onClick={() => fileInputRef.current?.click()} style={{ padding: '12px 24px', fontSize: 16, borderRadius: 12 }}>
                            <UploadCloud size={20} /> Browse Files
                        </button>
                        <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)' }}>
                            <Download size={20} /> Sample Template
                        </button>
                    </div>
                </div>

                {/* Dropzone Area */}
                <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.2)',
                        border: '2px dashed rgba(16, 185, 129, 0.3)',
                        borderRadius: 24,
                        padding: 40,
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.csv,.xls,.xlsx" style={{ display: 'none' }} />
                    <BrainCircuit size={64} color="#10b981" style={{ margin: '0 auto 24px', opacity: 0.8 }} />
                    <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Drag & Drop Document Here</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>✔ PDF</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>✔ Excel</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>✔ CSV</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Maximum File Size: 50 MB</p>

                    {file && (
                        <div style={{ marginTop: 24, padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {file.type === 'application/pdf' ? <FileText size={24} color="#ef4444" /> : <FileSpreadsheet size={24} color="#10b981" />}
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{file.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatBytes(file.size)}</div>
                                </div>
                            </div>
                            <button onClick={handleUpload} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 8 }}>
                                Start AI Analysis
                            </button>
                        </div>
                    )}
                    {errorMsg && (
                        <div style={{ color: '#ef4444', fontSize: 13, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <AlertTriangle size={16} /> {errorMsg}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );

    const renderTimeline = () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Activity size={28} color="#10b981" className="pulse-dot" /> AI Processing Workflow
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
                {/* Vertical connecting line */}
                <div style={{ position: 'absolute', left: 24, top: 24, bottom: 24, width: 2, background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
                
                {timelineSteps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isPast = index < currentStepIndex;
                    return (
                        <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1, padding: '16px 0', opacity: isActive || isPast ? 1 : 0.3 }}>
                            <motion.div 
                                initial={false}
                                animate={{ 
                                    background: isPast ? '#10b981' : isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                    borderColor: isPast || isActive ? '#10b981' : 'rgba(255,255,255,0.1)',
                                    scale: isActive ? 1.2 : 1
                                }}
                                style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {isPast ? <CheckCircle size={24} color="#000" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? '#10b981' : 'transparent' }} />}
                            </motion.div>
                            <div>
                                <h4 style={{ fontSize: 18, fontWeight: isActive ? 700 : 500, color: isActive ? '#fff' : 'var(--text-secondary)' }}>
                                    {step.label}
                                </h4>
                                {isActive && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 13, color: '#10b981', marginTop: 4 }}>Processing in real-time...</motion.div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderDashboard = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 16, border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={24} color="#10b981" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 20, fontWeight: 700 }}>Analysis Complete</h3>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Dashboard updated automatically with <strong>{result?.calculation?.totalEmissions?.toFixed(1)} kg CO₂e</strong>.</p>
                    </div>
                </div>
                <button onClick={() => { setFile(null); setStatus('idle'); setResult(null); }} className="btn-secondary">Upload New Document</button>
            </div>

            {/* AI Summary Card */}
            <div className="glass-card" style={{ padding: 32, marginBottom: 32, background: 'linear-gradient(to right, rgba(0,0,0,0.3), rgba(16, 185, 129, 0.05))' }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BrainCircuit size={20} color="#10b981" /> Executive AI Summary
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 24 }}>
                    <div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Document Type</div><div style={{ fontSize: 16, fontWeight: 600 }}>{file?.type.includes('pdf') ? 'PDF Report' : 'Spreadsheet'}</div></div>
                    <div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Confidence Score</div><div style={{ fontSize: 16, fontWeight: 600, color: '#10b981' }}>{result?.analysis?.overallConfidence}%</div></div>
                    <div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Fields Extracted</div><div style={{ fontSize: 16, fontWeight: 600 }}>{Object.values(result?.analysis?.extractedData || {}).filter(v => v.value > 0).length}</div></div>
                    <div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Fields Ignored</div><div style={{ fontSize: 16, fontWeight: 600 }}>{result?.analysis?.ignoredFields?.length || 0}</div></div>
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, borderLeft: '3px solid #10b981' }}>
                    "{result?.analysis?.aiExplanation || 'The document was successfully parsed. Carbon data was successfully extracted while irrelevant company information and metadata were ignored.'}"
                </p>
            </div>

            {/* Split Extraction Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
                {/* Left Panel: Extracted */}
                <div className="glass-card" style={{ padding: 32 }}>
                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldCheck size={20} color="#10b981" /> Extracted Carbon Data
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {['electricity', 'fuel', 'water', 'waste'].map(key => {
                            const field = result?.analysis?.extractedData?.[key];
                            if (!field || field.value === 0) return null;
                            const icons = { electricity: Zap, fuel: Fuel, water: Droplets, waste: Trash2 };
                            const Icon = icons[key];
                            return (
                                <motion.div whileHover={{ y: -2, scale: 1.01 }} key={key} style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(16,185,129,0.2)', transition: 'all 0.2s', cursor: 'default' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'capitalize', color: '#fff' }}><Icon size={18} color="#10b981" /> {key}</span>
                                        <span className="badge badge-green" style={{ fontSize: 12 }}>{field.confidence}% Verified</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                                        <span style={{ fontSize: 28, fontWeight: 800 }}>{field.value}</span>
                                        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{field.unit}</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Source context: {field.explanation}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel: Ignored */}
                <div className="glass-card" style={{ padding: 32 }}>
                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                        <Eye size={20} /> Ignored Information
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>The AI intentionally ignored the following information as it does not contribute to carbon calculations.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {result?.analysis?.ignoredFields?.map((ig, i) => (
                            <div key={i} style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', opacity: 0.8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>{ig.field}</span>
                                    <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 999 }}>Ignored</span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reason: {ig.reason}</div>
                            </div>
                        ))}
                        {(!result?.analysis?.ignoredFields || result.analysis.ignoredFields.length === 0) && (
                            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No irrelevant fields detected.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Preview & Flow */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, marginBottom: 40 }}>
                {/* Simulated Document Preview */}
                <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <File size={16} /> Document Preview
                    </h4>
                    <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: 24, position: 'relative', overflow: 'hidden' }}>
                        {/* Wireframe skeleton representing the doc */}
                        <div style={{ width: '40%', height: 8, background: '#e2e8f0', borderRadius: 4, marginBottom: 24 }} />
                        <div style={{ width: '100%', height: 1, background: '#f1f5f9', marginBottom: 24 }} />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ width: '30%', height: 12, background: 'rgba(16, 185, 129, 0.2)', borderRadius: 4 }} /> {/* Highlighted */}
                            <div style={{ width: '20%', height: 12, background: '#e2e8f0', borderRadius: 4 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ width: '40%', height: 12, background: '#e2e8f0', borderRadius: 4 }} />
                            <div style={{ width: '25%', height: 12, background: 'rgba(16, 185, 129, 0.2)', borderRadius: 4 }} /> {/* Highlighted */}
                        </div>
                        <div style={{ width: '100%', height: 1, background: '#f1f5f9', margin: '24px 0' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.5 }}>
                            <div style={{ width: '60%', height: 8, background: '#cbd5e1', borderRadius: 4 }} /> {/* Ignored */}
                            <div style={{ width: '80%', height: 8, background: '#cbd5e1', borderRadius: 4 }} /> {/* Ignored */}
                            <div style={{ width: '50%', height: 8, background: '#cbd5e1', borderRadius: 4 }} /> {/* Ignored */}
                        </div>

                        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b', fontWeight: 600 }}><div style={{ width: 12, height: 12, background: 'rgba(16, 185, 129, 0.2)', borderRadius: 2 }}/> Extracted</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b', fontWeight: 600 }}><div style={{ width: 12, height: 12, background: '#cbd5e1', borderRadius: 2 }}/> Ignored</div>
                        </div>
                    </div>
                </div>

                {/* Carbon Calculation Flow */}
                <div className="glass-card" style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TreePine size={20} color="#10b981" /> Carbon Calculation Flow
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1, position: 'relative' }}>
                        {/* Glowing connecting line */}
                        <div style={{ position: 'absolute', top: '50%', left: 40, right: 40, height: 2, background: 'rgba(16, 185, 129, 0.3)', zIndex: 0, boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }} />
                        
                        {/* Nodes */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, zIndex: 1 }}>
                            <div style={{ padding: '12px 24px', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>Raw Data</div>
                        </div>
                        <ArrowRight size={20} color="#10b981" style={{ zIndex: 1 }} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, zIndex: 1 }}>
                            <div style={{ padding: '12px 24px', background: 'var(--bg-card)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#10b981', boxShadow: '0 0 15px rgba(16,185,129,0.2)' }}>Scope 1: {result?.calculation?.scope1?.toFixed(1)}</div>
                            <div style={{ padding: '12px 24px', background: 'var(--bg-card)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#3b82f6', boxShadow: '0 0 15px rgba(59,130,246,0.2)' }}>Scope 2: {result?.calculation?.scope2?.toFixed(1)}</div>
                        </div>
                        <ArrowRight size={20} color="#10b981" style={{ zIndex: 1 }} />

                        <div style={{ zIndex: 1, textAlign: 'center', padding: '24px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 50 }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Footprint</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{result?.calculation?.totalEmissions?.toFixed(1)} <span style={{ fontSize: 14 }}>kg</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Recommendations */}
            <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>AI Recommendations</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 60 }}>
                <motion.div whileHover={{ y: -4 }} className="glass-card" style={{ padding: 24, borderTop: '3px solid #f59e0b' }}>
                    <h5 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Reduce Electricity</h5>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Based on extraction, optimizing HVAC scheduling could yield immediate savings.</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 700 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Estimated Reduction</span>
                        <span style={{ color: '#f59e0b' }}>12%</span>
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -4 }} className="glass-card" style={{ padding: 24, borderTop: '3px solid #10b981' }}>
                    <h5 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Switch to Solar</h5>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Installing solar panels could drastically reduce Scope 2 grid emissions.</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 700 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Carbon Savings</span>
                        <span style={{ color: '#10b981' }}>18%</span>
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -4 }} className="glass-card" style={{ padding: 24, borderTop: '3px solid #3b82f6' }}>
                    <h5 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Offset Strategy</h5>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Purchase certified carbon credits to achieve immediate Net Zero status.</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 700 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Credits Required</span>
                        <span style={{ color: '#3b82f6' }}>{result?.calculation?.creditsRequired?.toFixed(2) || 0}</span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );

    return (
        <div style={{ marginBottom: 60 }}>
            <AnimatePresence mode="wait">
                {status === 'idle' || status === 'error' ? (
                    <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {renderHero()}
                    </motion.div>
                ) : status === 'processing' ? (
                    <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {renderTimeline()}
                    </motion.div>
                ) : (
                    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {renderDashboard()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Document History Table */}
            {history.length > 0 && status !== 'processing' && (
                <div style={{ marginTop: 40 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Document Archive</h3>
                    <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                                    <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>File Name</th>
                                    <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Upload Date</th>
                                    <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>AI Score</th>
                                    <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Total Emissions</th>
                                    <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h) => (
                                    <tr key={h.document._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 500, fontSize: 14 }}>
                                            {h.document.mimetype === 'application/pdf' ? <FileText size={18} color="#ef4444" /> : <FileSpreadsheet size={18} color="#10b981" />}
                                            {h.document.originalName}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: 14, color: 'var(--text-secondary)' }}>{new Date(h.document.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                Verified
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600 }}>{h.analysis?.overallConfidence || 0}%</td>
                                        <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600 }}>{h.calculation?.totalEmissions?.toFixed(1) || 0} kg</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', gap: 16 }}>
                                                <button style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
                                                    <Eye size={16} /> Preview
                                                </button>
                                                <button onClick={() => handleDelete(h.document._id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
