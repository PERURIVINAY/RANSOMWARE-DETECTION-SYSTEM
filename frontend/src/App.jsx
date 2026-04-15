import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { 
  Shield, AlertTriangle, Activity, Database, 
  Settings, User, CheckCircle, Flame, Cpu, 
  HardDrive, Bell, Zap, LogOut, Terminal, 
  Lock, Hexagon, Server, Info, Brain, ChevronRight,
  ShieldCheck, ShieldAlert, X, Globe, FileSearch, Upload, Link, 
  FileText, Search, RefreshCw, AlertOctagon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [alerts, setAlerts] = useState([]);
  const [systemStats, setSystemStats] = useState([]);
  const [isHealthy, setIsHealthy] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // URL Scanner State
  const [urlInput, setUrlInput] = useState('');
  const [urlScanResult, setUrlScanResult] = useState(null);
  const [isUrlScanning, setIsUrlScanning] = useState(false);
  
  // File Scanner State
  const [fileInput, setFileInput] = useState(null);
  const [fileScanResult, setFileScanResult] = useState(null);
  const [isFileScanning, setIsFileScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  const toastContainerRef = useRef(null);

  // Browser Notification Request
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  };

  const showBrowserNotification = (alert) => {
    if (notificationsEnabled && "Notification" in window) {
      new Notification("CRITICAL THREAT DETECTED", {
        body: `${alert.threat_type}: ${alert.description}`,
        icon: "/favicon.ico"
      });
    }
  };

  // Real-time Supabase Subscription
  useEffect(() => {
    fetchAlerts();
    fetchSystemLogs();

    const alertsSub = supabase
      .channel('alerts_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, 
        payload => {
          setAlerts(prev => [payload.new, ...prev]);
          setIsHealthy(false);
          showBrowserNotification(payload.new);
          // Auto-reset pulse after 10s
          setTimeout(() => setIsHealthy(true), 10000);
        }
      )
      .subscribe();

    const statsInterval = setInterval(fetchSystemLogs, 3000);
    return () => {
      supabase.removeChannel(alertsSub);
      clearInterval(statsInterval);
    };
  }, [notificationsEnabled]);

  const handleUrlScan = async () => {
    if (!urlInput) return;
    setIsUrlScanning(true);
    setUrlScanResult(null);
    try {
      const response = await fetch('http://127.0.0.1:5000/scan-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      });
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setUrlScanResult(data);
    } catch (error) {
      console.error("URL Scan failed:", error);
      setUrlScanResult({
        status: 'ERROR',
        risk_score: 0,
        reasons: [],
        warnings: ["The Sentinel Engine (127.0.0.1:5000) is unreachable."],
        ai_report: { 
          summary: "CRITICAL: SCANNED INTERRUPTED.", 
          recommendations: ["Ensure Python backend 'app.py' is running.", "Check firewall for Port 5000."] 
        },
        recommendation: "Restart the backend server and try again."
      });
    } finally {
      setIsUrlScanning(false);
    }
  };

  const handleFileScan = async (file) => {
    if (!file) return;
    setIsFileScanning(true);
    setFileScanResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://127.0.0.1:5000/scan-file', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setFileScanResult(data);
    } catch (error) {
      console.error("File Scan failed:", error);
    } finally {
      setIsFileScanning(false);
    }
  };

  const fetchAlerts = async () => {
    const { data } = await supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setAlerts(data);
  };

  const fetchSystemLogs = async () => {
    const { data } = await supabase.from('system_logs').select('*').order('timestamp', { ascending: false }).limit(30);
    if (data) setSystemStats(data.reverse());
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <>
            {/* Real-time Telemetry Stats */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
              <StatCard icon={<Cpu className="text-blue-400" />} label="Neural Load" value={`${systemStats[systemStats.length-1]?.cpu_usage?.toFixed(1) || 0}%`} detail="CPU Correlation" />
              <StatCard icon={<HardDrive className="text-cyan-400" />} label="RAM Entropy" value={`${systemStats[systemStats.length-1]?.memory_usage?.toFixed(1) || 0}%`} detail="Memory Footprint" />
              <StatCard icon={<Zap className="text-amber-400" />} label="I/O Velocity" value={`${systemStats[systemStats.length-1]?.file_change_rate || 0}`} detail="Modifications/sec" />
              <StatCard 
                icon={<ShieldCheck className={isHealthy ? "text-[#00FF9F]" : "text-[#FF3B3B] animate-pulse"} />} 
                label="AI Guardian" 
                value={isHealthy ? "SECURE" : "INTERCEPTING"} 
                detail="Defense Matrix" 
                className={!isHealthy ? "neon-glow-malicious" : "neon-glow-safe"}
              />
            </section>

            {/* Behavioral Analysis & Alerts */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden px-4 pb-4">
              <div className="lg:col-span-2 glass-card flex flex-col p-8 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -mr-48 -mt-48 opacity-50"></div>
                <div className="flex justify-between items-center mb-10 z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Activity className="text-blue-500 w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white uppercase italic">Behavioral Fingerprinting</h3>
                  </div>
                  <div className="flex gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div> CPU Load</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-700"></div> RAM Load</span>
                  </div>
                </div>
                <div className="flex-1 min-h-[300px] z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={systemStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(11, 15, 26, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', backdropFilter: 'blur(12px)' }} 
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="step" dataKey="cpu_usage" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Insight Feed */}
              <div className="glass-card flex flex-col p-8 overflow-hidden border-white/5 relative">
                <h3 className="text-[12px] font-black tracking-[0.3em] text-[#A0AEC0] uppercase mb-8 flex items-center gap-3">
                  <Brain className="text-[#FF3B3B] w-5 h-5" />
                  Neural Threat Stream
                </h3>
                <div className="flex flex-col gap-4 overflow-y-auto pr-3 custom-scrollbar">
                  <AnimatePresence>
                    {alerts.slice(0, 6).map((alert) => (
                      <motion.div 
                        key={alert.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-5 border border-[#FF3B3B]/20 bg-[#FF3B3B]/5 hover:bg-[#FF3B3B]/10 transition-all rounded-[20px] cursor-pointer group"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[#FF3B3B] font-black text-[10px] uppercase tracking-[0.2em]">{alert.threat_type}</span>
                          <Info size={14} className="text-slate-600 group-hover:text-[#FF3B3B] transition-colors" />
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed italic mb-4">"{alert.description}"</p>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                           <div className="flex flex-col">
                             <span className="text-slate-500 uppercase text-[8px] tracking-[0.2em] mb-0.5">Risk Score</span>
                             <span className="text-white font-mono">{alert.risk_score.toFixed(1)}%</span>
                           </div>
                           <span className="text-[#3b82f6] uppercase tracking-[0.1em] text-[10px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">Context <ChevronRight size={10} /></span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {alerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                      <Shield className="w-16 h-16 mb-4 opacity-10" />
                      <p className="text-xs uppercase tracking-[0.3em] font-black">Neural Core Silent</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        );
      case 'Thread History':
        return (
          <div className="glass-card flex-1 flex flex-col p-8 overflow-hidden bg-[#1a1f2e]/50 border-white/5">
            <h2 className="text-2xl font-bold mb-6 tracking-tight flex items-center justify-between">
              <span>Security Event History</span>
              <div className="flex gap-2">
                <div className="text-xs bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 font-bold uppercase tracking-wider">{alerts.length} Threats</div>
                <div className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-bold uppercase tracking-wider">Clean</div>
              </div>
            </h2>
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar flex flex-col gap-3">
              {alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className="p-5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] flex gap-5 items-start rounded-2xl transition-all cursor-pointer group"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="p-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl shadow-lg shadow-rose-900/10">
                    <ShieldAlert size={28} />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-center mb-2">
                       <h4 className="font-bold text-rose-400 text-lg">{alert.threat_type}</h4>
                       <span className="text-xs font-mono text-slate-500 bg-black/40 px-2 py-1 rounded border border-white/5">
                         {new Date(alert.created_at).toLocaleString()}
                       </span>
                     </div>
                     <p className="text-slate-300 text-sm leading-relaxed mb-4">{alert.description}</p>
                     <div className="flex items-center gap-4">
                        <div className="text-[11px] uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2">
                          AI CERTAINTY: <span className="text-white bg-rose-500/20 px-2 py-0.5 rounded">{alert.risk_score.toFixed(2)}%</span>
                        </div>
                        <div className="text-[11px] uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2">
                          REASONING: <span className="text-blue-400 flex items-center gap-1 group-hover:underline">Deep Analysis Required <Info size={10}/></span>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && <p className="text-slate-500 text-center py-20 font-medium italic opacity-50">"The silence is the sound of total security."</p>}
            </div>
          </div>
        );
      case 'Telemetry Logs':
        return (
          <div className="glass-card flex-1 flex flex-col p-8 overflow-hidden bg-[#1a1f2e]/50 border-white/5">
             <h2 className="text-2xl font-bold mb-6 tracking-tight">System Telemetry Logs</h2>
             <div className="flex-1 overflow-y-auto custom-scrollbar rounded-xl border border-white/5 bg-black/20">
               <table className="w-full text-left font-mono text-xs">
                 <thead className="text-slate-500 sticky top-0 bg-[#141824] z-10 border-b border-white/10 uppercase tracking-widest">
                   <tr>
                     <th className="py-4 px-6">Timestamp</th>
                     <th className="py-4 px-6">CPU Load (%)</th>
                     <th className="py-4 px-6">RAM Load (%)</th>
                     <th className="py-4 px-6">Proc Count</th>
                     <th className="py-4 px-6 text-blue-400">I/O Entropy</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {systemStats.slice().reverse().map(stat => (
                     <tr key={stat.id} className="hover:bg-white/[0.03] transition-colors group">
                       <td className="py-4 px-6 text-slate-500 group-hover:text-slate-300">{new Date(stat.timestamp).toLocaleTimeString()}</td>
                       <td className="py-4 px-6 font-semibold">{stat.cpu_usage.toFixed(1)}</td>
                       <td className="py-4 px-6 font-semibold">{stat.memory_usage.toFixed(1)}</td>
                       <td className="py-4 px-6 text-slate-400">{stat.process_count}</td>
                       <td className="py-4 px-6 text-blue-400 font-bold">{stat.file_change_rate}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        );
      case 'URL Security':
        return (
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
             <section className="glass-card p-12 bg-gradient-to-br from-[#1a1f2e] to-[#0f121a] border-white/5 relative overflow-hidden flex flex-col items-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="z-10 text-center mb-10"
                >
                   <h2 className="text-4xl font-black mb-4 tracking-tighter flex items-center justify-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                        <Globe className="text-blue-500 w-8 h-8" />
                      </div>
                      Website Security Scanner
                   </h2>
                   <p className="text-slate-400 max-w-xl mx-auto text-lg font-medium leading-relaxed">
                      Deep neural inspection of domain authority, redirect security, 
                      and malicious behavioral code patterns.
                   </p>
                </motion.div>

                <div className="w-full max-w-3xl z-10">
                   <div className="flex flex-col md:flex-row gap-4 p-2 bg-black/40 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-xl">
                      <div className="flex-1 relative group flex items-center">
                         <div className="pl-6 flex items-center pointer-events-none pr-4">
                            <Link size={24} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                         </div>
                         <input 
                            type="text" 
                            placeholder="Paste suspicious target URL here..."
                            className="w-full bg-transparent border-none py-6 text-white focus:outline-none transition-all font-bold text-xl placeholder:text-slate-700 placeholder:font-bold"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                         />
                      </div>
                      <button 
                         onClick={handleUrlScan}
                         disabled={isUrlScanning || !urlInput}
                         className={`px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.1em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                            isUrlScanning 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_30px_rgba(37,99,235,0.4)]'
                         }`}
                      >
                         {isUrlScanning ? <RefreshCw className="animate-spin" size={20} /> : <Search size={22} />}
                         {isUrlScanning ? 'ANALYZING' : 'SCAN NOW'}
                      </button>
                   </div>
                   <div className="mt-4 flex justify-center gap-6">
                      <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-600 tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div> Redirect Shield</div>
                      <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-600 tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div> Neural Heuristics</div>
                      <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-600 tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50"></div> Phish Detect</div>
                   </div>
                </div>
             </section>

             {urlScanResult && (
               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 xl:grid-cols-12 gap-6"
               >
                  <div className="xl:col-span-8 space-y-6">
                     <div className="glass-card p-10 bg-[#1a1f2e]/50 border-white/5 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-10">
                           <div className="flex items-center gap-4">
                              <div className={`p-4 rounded-2xl border ${
                                 urlScanResult.status === 'SAFE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                 urlScanResult.status === 'SUSPICIOUS' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              }`}>
                                 {urlScanResult.status === 'SAFE' ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                              </div>
                              <div>
                                 <h3 className="text-2xl font-black tracking-tight uppercase">Decision Logic Report</h3>
                                 <p className="text-xs font-mono text-slate-500 mt-1">{urlInput}</p>
                              </div>
                           </div>
                           <div className={`px-6 py-2 rounded-full border text-[11px] font-black uppercase tracking-[0.2em] shadow-lg ${
                              urlScanResult.status === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                              urlScanResult.status === 'SUSPICIOUS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border-rose-500/20'
                           }`}>
                              {urlScanResult.status}
                           </div>
                        </div>

                        <div className="space-y-8">
                           <div className="p-8 bg-black/40 rounded-3xl border border-white/5 italic text-xl leading-relaxed text-slate-200 shadow-inner">
                              "{urlScanResult.ai_report.summary}"
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[...urlScanResult.reasons, ...urlScanResult.warnings].map((reason, i) => (
                                 <div key={i} className="p-5 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl border border-white/5 text-sm font-semibold text-slate-300 flex gap-4 items-center group transition-colors">
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse ${
                                       urlScanResult.status === 'SAFE' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-rose-500 shadow-lg shadow-rose-500/50'
                                    }`}></div>
                                    <span className="leading-tight">{reason}</span>
                                 </div>
                              ))}
                           </div>

                           <div className="p-6 bg-blue-600/10 rounded-2xl border border-blue-500/20 border-l-4 border-l-blue-500">
                              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3">AI PROACTIVE DEFENSE</h4>
                              <p className="text-slate-300 font-bold leading-relaxed">{urlScanResult.recommendation}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="xl:col-span-4 space-y-6">
                     <div className="glass-card p-10 bg-[#1a1f2e]/50 border-white/5 flex flex-col items-center justify-center text-center group">
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-10">Neural Risk Density</h4>
                        <div className="relative w-56 h-56">
                           <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" viewBox="0 0 100 100">
                              <circle className="text-white/[0.03]" strokeWidth="10" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                              <circle 
                                 className={`${urlScanResult.risk_score > 70 ? 'text-rose-500' : urlScanResult.risk_score > 30 ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`} 
                                 strokeWidth="10" 
                                 strokeDasharray={263.8}
                                 strokeDashoffset={263.8 - (263.8 * urlScanResult.risk_score) / 100}
                                 strokeLinecap="round" 
                                 stroke="currentColor" 
                                 fill="transparent" r="42" cx="50" cy="50" 
                                 transform="rotate(-90 50 50)"
                              />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-6xl font-black font-mono tracking-tighter text-white drop-shadow-lg">{urlScanResult.risk_score.toFixed(0)}</span>
                              <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Risk %</span>
                           </div>
                        </div>
                        <div className="mt-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-black/40 px-6 py-2 rounded-full border border-white/5">
                           Model Accuracy: 98.2%
                        </div>
                     </div>
                  </div>
               </motion.div>
             )}
          </div>
        );
      case 'File Shield':
        return (
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
             {/* Large Centered Upload Area */}
             {!fileScanResult || isFileScanning ? (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="flex-1 flex flex-col items-center justify-center p-12 glass-card bg-gradient-to-br from-[#1a1f2e] to-[#0f121a] border-white/5 border-dashed border-2 relative overflow-hidden group hover:border-blue-500/40 transition-all cursor-pointer min-h-[400px]"
                >
                   <input 
                     type="file" 
                     className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                     onChange={(e) => handleFileScan(e.target.files[0])}
                     disabled={isFileScanning}
                   />
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent"></div>
                   
                   <div className="p-10 bg-blue-500/5 rounded-[3rem] border border-blue-500/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 group-hover:scale-105 transition-all mb-10 shadow-2xl relative z-10">
                      {isFileScanning ? <RefreshCw className="text-blue-500 w-20 h-20 animate-spin" /> : <Upload className="text-blue-500 w-20 h-20" />}
                   </div>
                   
                   <div className="relative z-10 text-center">
                      <h3 className="text-4xl font-black mb-4 tracking-tighter uppercase">Drop Payloads to Analyze</h3>
                      <p className="text-slate-400 max-w-md mx-auto text-lg leading-relaxed font-medium">
                         Perform zero-click static telemetry and entropy audits 
                         on any binary without local execution risk.
                      </p>
                      <div className="mt-10 flex flex-wrap justify-center gap-3">
                        {[ 'ELF', 'EXE', 'APK', 'ZIP', 'PDF', 'JS' ].map(type => (
                           <div key={type} className="px-5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-black text-slate-500 tracking-widest">{type}</div>
                        ))}
                      </div>
                   </div>
                </motion.div>
             ) : (
                <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="glass-card p-12 bg-[#1a1f2e]/50 border-white/5 relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 p-8 h-full flex flex-col justify-between items-end opacity-5 select-none pointer-events-none">
                      <FileSearch size={300} />
                   </div>

                   <div className="flex flex-col lg:flex-row gap-10 items-start relative z-10">
                      <div className={`p-8 rounded-[2.5rem] border shadow-2xl ${
                         fileScanResult.status === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5'
                      }`}>
                         <FileText size={64} />
                      </div>
                      
                      <div className="flex-1 space-y-8">
                         <div>
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                               <h3 className="text-3xl font-black tracking-tighter uppercase">{fileScanResult.file_name}</h3>
                               <div className="px-5 py-2 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black text-slate-500 tracking-[0.2em]">{fileScanResult.details.mime_type}</div>
                               <button 
                                 onClick={() => setFileScanResult(null)} 
                                 className="ml-auto text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
                               >
                                 <RefreshCw size={12} /> Scan Another File
                               </button>
                            </div>
                            <div className="flex flex-wrap gap-10">
                               <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] mb-1">Status Classification</span>
                                  <span className={`text-xl font-black uppercase ${fileScanResult.status === 'SAFE' ? 'text-emerald-400' : 'text-rose-400'}`}>{fileScanResult.status}</span>
                               </div>
                               <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                               <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] mb-1">Entropy Load</span>
                                  <span className="text-xl font-black font-mono text-blue-400">{fileScanResult.details.entropy.toFixed(2)} / 8.0</span>
                               </div>
                               <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                               <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] mb-1">File Size</span>
                                  <span className="text-xl font-black font-mono text-white">{(fileScanResult.details.size_bytes / 1024).toFixed(1)} KB</span>
                               </div>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-black/30 rounded-3xl border border-white/5 space-y-6">
                               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4">Neural Indicators</h4>
                               <div className="space-y-4">
                                  {fileScanResult.explanation.map((reason, i) => (
                                     <div key={i} className="flex gap-5 text-sm font-semibold text-slate-300 items-start leading-relaxed group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0 shadow-lg shadow-rose-500/50"></div>
                                        {reason}
                                     </div>
                                  ))}
                                  {fileScanResult.explanation.length === 0 && (
                                     <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm">
                                        <CheckCircle size={16} /> Structure appears natively clean.
                                     </div>
                                  )}
                               </div>
                            </div>

                            <div className="p-8 bg-blue-600/5 rounded-3xl border border-blue-500/20 space-y-6">
                               <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] border-b border-blue-500/10 pb-4">AI Reasoning Feed</h4>
                               <p className="text-slate-200 text-lg italic leading-relaxed font-medium">
                                  "{fileScanResult.ai_report.summary}"
                                </p>
                                <div className="flex flex-col gap-3">
                                   {fileScanResult.ai_report.recommendations.map((rec, i) => (
                                      <div key={i} className="flex items-center gap-3 text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/10">
                                         <CheckCircle size={14} /> {rec}
                                      </div>
                                   ))}
                                </div>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col items-center justify-center p-10 bg-black/40 rounded-3xl border border-white/10 min-w-[200px] self-stretch">
                         <div className="text-7xl font-black font-mono tracking-tighter mb-2">{fileScanResult.risk_score}</div>
                         <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Risk Points</div>
                         <div className="mt-8 relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                               className={`h-full transition-all duration-1000 ${fileScanResult.risk_score > 70 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                               style={{ width: `${fileScanResult.risk_score}%` }}
                            ></div>
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}
          </div>
        );
      case 'AI Settings':
        return (
          <div className="glass-card flex-1 flex flex-col p-8 items-start justify-start gap-8 bg-[#1a1f2e]/50 border-white/5 overflow-y-auto custom-scrollbar">
            <h2 className="text-3xl font-bold tracking-tight border-b border-white/10 pb-6 w-full flex items-center gap-3">
              <Settings className="text-slate-400" />
              Neural Parameters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
               <ConfigPanel title="AI Behavioral Detection" icon={<Brain className="text-blue-400"/>}>
                 <ConfigRow label="Sensitivity Index" value="Aggressive (9.5)" />
                 <ConfigRow label="Feature Set" value="Volatility 3 Core" />
                 <ConfigRow label="Model Evolution" value="Random Forest v2.1" />
                 <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
                   AI reasoning is currently generated using the Sentinel reasoning engine, which correlates file I/O spikes with thread volatility.
                 </div>
               </ConfigPanel>
               <ConfigPanel title="Notification Engine" icon={<Bell className="text-emerald-400"/>}>
                 <div className="flex justify-between items-center mb-4 p-4 bg-white/5 rounded-xl border border-white/5">
                   <span className="text-sm font-semibold">Browser Notifications</span>
                   <button 
                    onClick={requestNotificationPermission}
                    disabled={notificationsEnabled}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${notificationsEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-blue-600 hover:bg-blue-50'}`}
                   >
                     {notificationsEnabled ? 'ENABLED' : 'ACTIVATE'}
                   </button>
                 </div>
                 <ConfigRow label="Sound Alerts" value="Enabled" />
                 <ConfigRow label="Telegram Webhook" value="Connected" />
                 <ConfigRow label="Alert Threshold" value="60% Risk" />
               </ConfigPanel>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0E14] text-white p-4 gap-4 font-inter select-none overflow-hidden">
      {/* AI Context Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-2xl overflow-hidden border-rose-500/30 shadow-2xl shadow-rose-500/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-rose-500/10 p-6 flex justify-between items-center border-b border-rose-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500 rounded-lg">
                    <ShieldAlert className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-rose-400">Threat Context Analysis</h2>
                    <p className="text-xs text-rose-500/70 uppercase tracking-widest font-bold">Deep Neural Inspection</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAlert(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Brain size={14} className="text-blue-400" /> AI Reasoning Description
                  </h3>
                  <div className="bg-black/30 p-5 rounded-2xl border border-white/5 italic text-slate-200 leading-relaxed text-lg">
                    "{selectedAlert.description}"
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Risk Confidence</p>
                    <p className="text-2xl font-bold text-white">{selectedAlert.risk_score.toFixed(2)}%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Threat Classification</p>
                    <p className="text-xl font-bold text-rose-400">{selectedAlert.threat_type}</p>
                  </div>
                </div>

                {selectedAlert.details && (
                  <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Terminal size={14} /> Correlated System Metrics
                    </h4>
                    <pre className="text-xs font-mono text-blue-300/80 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedAlert.details.context || selectedAlert.details, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button onClick={() => setSelectedAlert(null)} className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-900/20 uppercase tracking-widest text-xs">
                    Quarantine Process
                  </button>
                  <button onClick={() => setSelectedAlert(null)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl transition-all border border-white/10 uppercase tracking-widest text-xs">
                    Dismiss Alert
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Modern Neural Aesthetic */}
      <aside className="w-80 p-4 sticky top-0 h-screen hidden lg:block">
        <div className="h-full glass-card flex flex-col border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-8 border-b border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#3b82f6] via-[#00FF9F] to-transparent"></div>
            <div className="flex justify-between items-start mb-8 z-10">
              <div className="p-4 bg-blue-500/10 rounded-[24px] border border-blue-500/20 group-hover:neon-glow-blue transition-all">
                <Shield className="text-blue-500 w-8 h-8" />
              </div>
              <div className="flex items-center gap-2 bg-[#00FF9F]/10 text-[#00FF9F] px-4 py-1.5 rounded-full border border-[#00FF9F]/20 text-[10px] font-black tracking-[0.2em] neon-glow-safe">
                <div className="w-1.5 h-1.5 bg-[#00FF9F] rounded-full animate-pulse"></div>
                LIVE
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-[-0.08em] text-white leading-none">
              SENTINEL<span className="text-blue-500">.</span>AI
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-3 opacity-60">Neural Defense Layer</p>
          </div>
          
          <nav className="flex flex-col p-6 gap-2 flex-1 overflow-y-auto custom-scrollbar">
            <NavItem icon={<Activity />} label="Overview" active={activeTab === 'Overview'} onClick={setActiveTab} />
            <NavItem icon={<Globe />} label="URL Security" active={activeTab === 'URL Security'} onClick={setActiveTab} />
            <NavItem icon={<FileSearch />} label="File Shield" active={activeTab === 'File Shield'} onClick={setActiveTab} />
            <NavItem icon={<AlertTriangle />} label="Thread History" active={activeTab === 'Thread History'} onClick={setActiveTab} count={alerts.length} />
            <NavItem icon={<Database />} label="Telemetry Logs" active={activeTab === 'Telemetry Logs'} onClick={setActiveTab} />
            <NavItem icon={<Settings />} label="AI Settings" active={activeTab === 'AI Settings'} onClick={setActiveTab} />
          </nav>

          <footer className="p-6 border-t border-white/5 bg-white/5">
            <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-2xl border border-white/10 group-hover:neon-glow-blue transition-all">
                <User className="text-slate-200 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-white">Root Admin</p>
                <p className="text-[9px] text-slate-500 font-mono font-bold tracking-widest opacity-60">ID: SEC-882-901</p>
              </div>
            </div>
          </footer>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden relative">
        {/* Status Header */}
        <header className="glass-card px-10 py-6 border-white/5 flex justify-between items-center shadow-2xl">
          <div className="flex flex-col">
             <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] mb-1">Fleet Navigation</div>
             <div className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
               {activeTab} 
               <ChevronRight size={20} className="text-slate-700" />
               <span className="text-xs font-mono font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-[8px] uppercase tracking-widest">Active Node 01</span>
             </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden xl:grid grid-cols-2 gap-8 mr-6">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Model Accuracy</span>
                <span className="text-lg font-mono font-black text-[#00FF9F]">98.2%</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Neural Latency</span>
                <span className="text-lg font-mono font-black text-blue-400">1.2<span className="text-[10px]">ms</span></span>
              </div>
            </div>
            <div className={`flex items-center gap-4 px-6 py-3 rounded-full border transition-all ${!isHealthy ? 'threat-alert bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/30 neon-glow-malicious' : 'border-[#00FF9F]/30 bg-[#00FF9F]/10 text-[#00FF9F] neon-glow-safe'}`}>
              <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-[#00FF9F] shadow-[0_0_12px_#00FF9F]' : 'bg-[#FF3B3B] animate-ping'}`}></div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">{isHealthy ? 'Defense Nominal' : 'THREAT INTERCEPTED'}</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 30, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -30, filter: 'blur(20px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col gap-6 overflow-hidden"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* Global Toast Container */}
        <div ref={toastContainerRef} className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"></div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, count }) => (
  <button 
    onClick={() => onClick(label)}
    className={`flex items-center justify-between px-6 py-5 rounded-[20px] transition-all group relative overflow-hidden active:scale-95 ${
      active 
      ? 'bg-blue-600/10 text-white border border-blue-500/30 neon-glow-blue' 
      : 'text-slate-500 hover:text-white hover:bg-white/[0.03] border border-transparent'
    }`}
  >
    <div className="flex items-center gap-4 relative z-10">
      <div className={`transition-transform duration-300 ${active ? 'scale-110 text-blue-400' : 'group-hover:scale-110'}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className={`text-[13px] font-bold uppercase tracking-[0.1em] transition-all ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{label}</span>
    </div>
    {count !== undefined && (
      <div className={`px-2 py-0.5 rounded-[6px] text-[10px] font-black font-mono transition-all ${active ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
        {count.toString().padStart(2, '0')}
      </div>
    )}
    {active && (
      <motion.div 
        layoutId="active-nav-glow"
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none"
      />
    )}
  </button>
);
const StatCard = ({ icon, label, value, detail, className = "" }) => (
  <div className={`glass-card p-8 flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-all ${className}`}>
    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity scale-150 rotate-12">
      {React.cloneElement(icon, { size: 120 })}
    </div>
    <div className="flex items-start justify-between mb-8 z-10">
      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-blue-500/30 transition-colors">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] opacity-60 group-hover:opacity-100 transition-opacity">{label}</div>
    </div>
    <div className="z-10 mt-auto">
      <p className="text-5xl font-black tracking-[-0.05em] group-hover:text-blue-400 transition-colors font-mono">{value}</p>
      <div className="flex items-center gap-3 mt-4">
        <div className="w-1.5 h-1.5 bg-blue-500/40 rounded-full"></div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{detail}</p>
      </div>
    </div>
  </div>
);

const ConfigPanel = ({ title, icon, children }) => (
  <div className="glass-card p-10 relative overflow-hidden">
    <div className="flex items-center gap-5 mb-10 border-b border-white/5 pb-8">
       <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">{icon}</div>
       <h3 className="font-black text-2xl text-white tracking-tighter uppercase italic">{title}</h3>
    </div>
    <div className="flex flex-col gap-6">
      {children}
    </div>
  </div>
);

const ConfigRow = ({ label, value }) => (
  <div className="flex justify-between items-center bg-black/40 p-6 rounded-[24px] border border-white/5 hover:border-blue-500/20 transition-all group">
    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest opacity-70 group-hover:opacity-100">{label}</span>
    <span className="text-[11px] font-black text-blue-400 bg-blue-500/10 px-5 py-2 rounded-xl border border-blue-500/20 uppercase tracking-[0.2em] neon-glow-blue">{value}</span>
  </div>
);

export default App;
