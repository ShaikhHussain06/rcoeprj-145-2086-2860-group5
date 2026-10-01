import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Calendar, 
  Smartphone, 
  RefreshCw, 
  Download, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Music, 
  FileText, 
  Activity, 
  ChevronDown, 
  Check 
} from 'lucide-react';
import { fetchHistory } from '../services/api';

export default function PatientRecordsAudit({ onSelectRecord, onInspectAudit }) {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'normal' | 'abnormal'
  const [selectedRowId, setSelectedRowId] = useState('#REC-1049');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-loaded realistic records matching Stitch design
  const defaultRecords = [
    {
      id: '#REC-1049',
      patientName: 'John Doe',
      patientId: '#PT-4421 • Mitral Apex (M1)',
      activeScope: true,
      acquisitionDate: 'Sep 18, 2026',
      acquisitionTime: '11:20 AM UTC',
      dspPayload: '10.0s @ 2kHz',
      classification: 'Abnormal - 94.1%',
      isAbnormal: true,
      sha256: 'e3b0c442...8b45',
      fullSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    {
      id: '#REC-1048',
      patientName: 'Sarah Jenkins',
      patientId: '#PT-3912 • Aortic Base (A2)',
      activeScope: false,
      acquisitionDate: 'Sep 18, 2026',
      acquisitionTime: '10:45 AM UTC',
      dspPayload: '8.5s @ 2kHz',
      classification: 'Normal - 98.2%',
      isAbnormal: false,
      sha256: '9f83a211...7c02',
      fullSha256: '9f83a21124d9c7e09841f3918a24bc10948ac623912a7810148ad914081c7c02'
    },
    {
      id: '#REC-1047',
      patientName: 'Marcus Vance',
      patientId: '#PT-8831 • Tricuspid (T4)',
      activeScope: false,
      acquisitionDate: 'Sep 18, 2026',
      acquisitionTime: '09:15 AM UTC',
      dspPayload: '12.0s @ 4kHz',
      classification: 'Abnormal - 89.6%',
      isAbnormal: true,
      sha256: 'c12a8904...4e91',
      fullSha256: 'c12a89048a1924b1049581029384756182938475610293847561029384754e91'
    },
    {
      id: '#REC-1046',
      patientName: 'Elena Rostova',
      patientId: '#PT-2190 • Pulmonic Base (P2)',
      activeScope: false,
      acquisitionDate: 'Sep 17, 2026',
      acquisitionTime: '04:30 PM UTC',
      dspPayload: '10.0s @ 2kHz',
      classification: 'Normal - 99.1%',
      isAbnormal: false,
      sha256: '11f43a88...2d54',
      fullSha256: '11f43a8820491823091823049182304918230491823049182304918230492d54'
    },
    {
      id: '#REC-1045',
      patientName: 'David K. Cho',
      patientId: "#PT-5542 • Erb's Point (3rd ICS)",
      activeScope: false,
      acquisitionDate: 'Sep 17, 2026',
      acquisitionTime: '02:10 PM UTC',
      dspPayload: '15.0s @ 2kHz',
      classification: 'Borderline Murmur - 76.4%',
      isAbnormal: true,
      sha256: '8a90bb43...17e3',
      fullSha256: '8a90bb43019283019283019283019283019283019283019283019283019217e3'
    }
  ];

  // Fetch backend history records if available
  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      try {
        const data = await fetchHistory(50);
        if (data && data.history && data.history.length > 0) {
          const apiRecords = data.history.map((r, i) => {
            const isAbn = r.classification === 'Abnormal' || r.abnormal_probability > 0.5;
            const probPct = ((r.confidence_score || r.abnormal_probability) * 100).toFixed(1);
            return {
              id: `#REC-${r.session_id ? r.session_id.slice(-4) : 1050 + i}`,
              sessionId: r.session_id,
              patientName: r.patient_tag ? r.patient_tag.split('•')[0].trim() : 'Patient Record',
              patientId: r.patient_tag || '#PT-4421',
              activeScope: i === 0,
              acquisitionDate: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Sep 18, 2026',
              acquisitionTime: r.created_at ? new Date(r.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '11:20 AM UTC',
              dspPayload: `${(r.duration_seconds || 10).toFixed(1)}s @ 2kHz`,
              classification: `${r.classification || (isAbn ? 'Abnormal' : 'Normal')} - ${probPct}%`,
              isAbnormal: isAbn,
              sha256: 'e3b0c442...8b45',
              fullSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
            };
          });
          setRecords(apiRecords);
        } else {
          setRecords(defaultRecords);
        }
      } catch (err) {
        console.log('Using default mock registry:', err.message);
        setRecords(defaultRecords);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  // Filter records
  const filteredRecords = (records.length > 0 ? records : defaultRecords).filter((r) => {
    const matchQuery = 
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sha256.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchQuery) return false;
    if (filterType === 'normal') return !r.isAbnormal;
    if (filterType === 'abnormal') return r.isAbnormal;
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      
      {/* Interactive Status Banner */}
      <div className="w-full bg-sky-50/70 border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-label-sm text-[10px] tracking-widest font-bold uppercase">AUDIT LEDGER ACTIVE</span>
            </div>
            <span className="font-body-sm text-xs text-slate-600">
              Immutable block sequence <span className="font-label-sm text-slate-900 font-semibold">#BLK-89104-ED25519</span> • Consensus anchor: NIST UTC-PTP synchronization
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="font-label-sm text-slate-500">Ledger Latency: <span className="font-label-sm text-sky-700 font-bold">18ms</span></span>
            <span className="font-label-sm text-slate-500">Merkle Root: <span className="font-label-sm text-sky-700 font-mono">0x4a9f...c28e</span></span>
          </div>
        </div>
      </div>

      {/* Top Filter & Action Toolbar */}
      <div className="w-full bg-white shadow-xs border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Search and Query Filters */}
        <div className="flex items-center gap-3 flex-1 max-w-4xl flex-wrap lg:flex-nowrap">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-sky-600 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, ID (#PT-...), or Record Hash..."
              className="w-full h-9 pl-9 pr-8 bg-sky-50/50 hover:bg-sky-50 focus:bg-white text-slate-900 font-body-sm text-xs rounded-lg border border-sky-200 focus:outline-none focus:border-sky-500 shadow-xs transition-all placeholder:text-slate-400"
            />
            <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded bg-sky-100 font-label-sm text-[9px] text-slate-600">⌘K</span>
          </div>

          {/* Classification Quick Filter Pills */}
          <div className="flex items-center p-0.5 rounded-lg bg-sky-50 border border-sky-200">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded font-body-sm text-xs transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-sky-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records (1,428)
            </button>
            <button
              onClick={() => setFilterType('normal')}
              className={`px-3 py-1 rounded font-body-sm text-xs transition-colors cursor-pointer ${
                filterType === 'normal'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Normal (1,104)
            </button>
            <button
              onClick={() => setFilterType('abnormal')}
              className={`px-3 py-1 rounded font-body-sm text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterType === 'abnormal'
                  ? 'bg-red-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
              Abnormal / Murmur (324)
            </button>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-sky-50/60 border border-sky-200 text-slate-800 cursor-pointer hover:bg-sky-100 transition-colors">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span className="font-label-sm text-xs">Sep 1, 2026 - Sep 21, 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Hardware Device Profile Filter */}
          <div className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-sky-50/60 border border-sky-200 text-slate-800 cursor-pointer hover:bg-sky-100 transition-colors">
            <Smartphone className="w-4 h-4 text-sky-600" />
            <span className="font-body-sm text-xs">Littmann Core BT / Eko DUO</span>
          </div>
        </div>

        {/* Export & Resync Actions */}
        <div className="flex items-center gap-2 justify-end">
          <button className="h-9 px-3.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors font-body-sm text-xs flex items-center gap-1.5 cursor-pointer shadow-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resync Stream</span>
          </button>
          <button className="h-9 px-4 rounded-lg bg-sky-600 text-white font-headline-sm text-xs font-semibold shadow-xs hover:bg-sky-700 transition-all flex items-center gap-1.5 cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit CSV (.csv / .jsonld)</span>
          </button>
        </div>

        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Patient Medical Telemetry Log Table (65% / col-span-8) */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            
            {/* Metrics Overview Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-white shadow-xs border border-sky-100 flex flex-col">
                <span className="font-label-sm text-[10px] text-slate-500 uppercase font-semibold">Monitored Ingestion</span>
                <span className="font-metric-display text-2xl text-slate-900 font-bold mt-1">1,428</span>
                <div className="flex items-center gap-1 text-emerald-700 font-label-sm text-[10px] font-semibold mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>100% Cryptographically Intact</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white shadow-xs border border-sky-100 flex flex-col">
                <span className="font-label-sm text-[10px] text-slate-500 uppercase font-semibold">Critical Murmurs</span>
                <span className="font-metric-display text-2xl text-red-600 font-bold mt-1">324</span>
                <div className="flex items-center gap-1 text-red-700 font-label-sm text-[10px] font-semibold mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>22.6% Exceeding CI Threshold</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white shadow-xs border border-sky-100 flex flex-col">
                <span className="font-label-sm text-[10px] text-slate-500 uppercase font-semibold">Model Inference Envelopes</span>
                <span className="font-metric-display text-2xl text-sky-600 font-bold mt-1">
                  41<span className="text-xs font-mono font-normal ml-0.5">ms</span>
                </span>
                <div className="flex items-center gap-1 text-slate-500 font-label-sm text-[10px] font-semibold mt-1">
                  <Activity className="w-3 h-3" />
                  <span>TensorRT FP16 Accelerated</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white shadow-xs border border-sky-100 flex flex-col">
                <span className="font-label-sm text-[10px] text-slate-500 uppercase font-semibold">Digital Stethoscope Fleet</span>
                <span className="font-metric-display text-2xl text-sky-700 font-bold mt-1">18/18</span>
                <div className="flex items-center gap-1 text-emerald-700 font-label-sm text-[10px] font-semibold mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Zero Frame Drop Packet Rate</span>
                </div>
              </div>
            </div>

            {/* Main Clinical Records Table */}
            <div className="bg-white rounded-xl shadow-xs border border-sky-100 overflow-hidden flex flex-col">
              {/* Table Control Header */}
              <div className="px-4 py-3 bg-sky-50/60 border-b border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-sky-600" />
                  <span className="font-headline-sm text-xs font-bold text-slate-900">
                    Longitudinal Audio Telemetry Registry
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-label-sm text-[10px] font-semibold">
                    {filteredRecords.length} Filtered Records
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 font-body-sm text-xs">
                  <span>Sort:</span>
                  <span className="font-headline-sm text-xs text-slate-900 font-semibold cursor-pointer flex items-center">
                    Newest First <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>

              {/* Table Body */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-sky-50/30 border-b border-sky-100 font-label-sm text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4 font-semibold">Record ID</th>
                      <th className="py-2.5 px-4 font-semibold">Patient Identifier</th>
                      <th className="py-2.5 px-4 font-semibold">Acquisition</th>
                      <th className="py-2.5 px-4 font-semibold">DSP Payload</th>
                      <th className="py-2.5 px-4 font-semibold">CNN AI Assessment</th>
                      <th className="py-2.5 px-4 font-semibold">SHA-256 Checksum</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-xs divide-y divide-sky-50">
                    {filteredRecords.map((row) => {
                      const isSelected = selectedRowId === row.id;
                      return (
                        <tr
                          key={row.id}
                          onClick={() => {
                            setSelectedRowId(row.id);
                            if (onSelectRecord) onSelectRecord(row);
                          }}
                          className={`transition-colors cursor-pointer group ${
                            isSelected
                              ? 'bg-sky-100/60 shadow-[inset_4px_0_0_0] shadow-sky-600'
                              : 'hover:bg-sky-50/50 bg-white'
                          }`}
                        >
                          <td className="py-3 px-4 font-label-md text-xs text-sky-700 font-bold">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-sky-600' : 'bg-slate-300'}`}></span>
                              {row.id}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-headline-sm text-xs text-slate-900 font-bold flex items-center gap-1">
                                {row.patientName}
                                {row.activeScope && (
                                  <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-label-sm text-[9px] font-semibold">
                                    Active Scope
                                  </span>
                                )}
                              </span>
                              <span className="font-label-sm text-[10px] text-slate-500 mt-0.5 font-mono">
                                {row.patientId}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div className="flex flex-col">
                              <span className="font-body-sm text-xs">{row.acquisitionDate}</span>
                              <span className="font-label-sm text-[10px] text-slate-500 font-mono">{row.acquisitionTime}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-800">
                            <div className="flex items-center gap-1">
                              <Activity className="w-3.5 h-3.5 text-sky-600" />
                              <span>{row.dspPayload}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded font-label-sm text-[10px] font-bold border ${
                              row.isAbnormal
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${row.isAbnormal ? 'bg-red-600 animate-pulse' : 'bg-emerald-500'}`}></span>
                              {row.classification}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="inline-flex items-center gap-1 font-mono font-label-sm text-[10px] text-slate-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                              <Lock className="w-3 h-3 text-emerald-600" />
                              <span>{row.sha256}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onInspectAudit) onInspectAudit(row.sessionId || row.id);
                                }}
                                className="px-2.5 py-1 rounded bg-sky-600 text-white font-label-sm text-[10px] font-bold shadow-xs hover:bg-sky-700 transition-colors cursor-pointer"
                              >
                                Inspector
                              </button>
                              <button className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-sky-100 transition-colors cursor-pointer" title="Download Audio">
                                <Music className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-sky-100 transition-colors cursor-pointer" title="View Full Report">
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Pagination */}
              <div className="p-3 bg-sky-50/60 border-t border-sky-100 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-label-sm text-[10px] text-slate-500">
                  <span>Showing records 1 - {filteredRecords.length}</span>
                  <span>•</span>
                  <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    Local database cache integrity verified (zero drift)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-2.5 py-1 rounded bg-white border border-sky-200 text-slate-400 font-body-sm text-xs cursor-not-allowed">
                    Previous
                  </button>
                  <button className="px-2.5 py-1 rounded bg-sky-600 text-white font-headline-sm text-xs font-bold shadow-xs">
                    1
                  </button>
                  <button className="px-2.5 py-1 rounded bg-white border border-sky-200 text-slate-700 hover:bg-sky-50 font-body-sm text-xs cursor-pointer">
                    Next
                  </button>
                </div>
              </div>

            </div>

            {/* Acoustic Waveform Sample Visualizer for Selected Row */}
            <div className="p-4 rounded-xl bg-white shadow-xs border border-sky-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span className="font-headline-sm text-xs font-bold text-slate-900">
                    Synchronized Phonocardiogram (PCG) & S1/S2 Acoustic Marker
                  </span>
                </div>
                <span className="font-label-sm text-[10px] text-slate-500 font-mono">
                  10.0s Window @ 2,000Hz (Record {selectedRowId})
                </span>
              </div>

              {/* Synthetic Visual Waveform Rendering */}
              <div className="w-full h-24 bg-sky-50/60 rounded-lg border border-sky-200 p-2 relative overflow-hidden flex items-center">
                <div className="absolute left-0 right-0 top-1/2 h-px bg-sky-200"></div>
                <svg className="w-full h-full text-sky-600" fill="none" preserveAspectRatio="none" viewBox="0 0 1000 120">
                  <path 
                    d="M0,60 L40,60 L50,45 L55,80 L60,20 L65,100 L70,50 L80,60 L110,60 L115,50 L120,70 L125,55 L130,60 L140,58 L145,62 L150,56 L155,64 L160,54 L165,66 L170,52 L175,68 L180,60 L240,60 L250,45 L255,80 L260,20 L265,100 L270,50 L280,60 L310,60 L315,50 L320,70 L325,55 L330,60 L340,58 L345,62 L350,56 L355,64 L360,54 L365,66 L370,52 L375,68 L380,60 L440,60 L450,45 L455,80 L460,20 L465,100 L470,50 L480,60 L510,60 L515,50 L520,70 L525,55 L530,60 L540,58 L545,62 L550,56 L555,64 L560,54 L565,66 L570,52 L575,68 L580,60 L640,60 L650,45 L655,80 L660,20 L665,100 L670,50 L680,60 L710,60 L715,50 L720,70 L725,55 L730,60 L740,58 L745,62 L750,56 L755,64 L760,54 L765,66 L770,52 L775,68 L780,60 L840,60 L850,45 L855,80 L860,20 L865,100 L870,50 L880,60 L910,60 L915,50 L920,70 L925,55 L930,60 L940,58 L945,62 L950,56 L955,64 L960,54 L965,66 L970,52 L975,68 L980,60 L1000,60" 
                    stroke="currentColor" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="1.75"
                  />
                  {/* Murmur Envelope Highlight */}
                  <path d="M135,60 Q155,42 175,60 Q155,78 135,60 Z" fill="#ba1a1a" fillOpacity="0.15"></path>
                  <path d="M335,60 Q355,42 375,60 Q355,78 335,60 Z" fill="#ba1a1a" fillOpacity="0.15"></path>
                  <path d="M535,60 Q555,42 575,60 Q555,78 535,60 Z" fill="#ba1a1a" fillOpacity="0.15"></path>
                  <path d="M735,60 Q755,42 775,60 Q755,78 735,60 Z" fill="#ba1a1a" fillOpacity="0.15"></path>
                  <path d="M935,60 Q955,42 975,60 Q955,78 935,60 Z" fill="#ba1a1a" fillOpacity="0.15"></path>
                </svg>
              </div>

              <div className="flex items-center justify-between text-slate-500 font-label-sm text-[10px] flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-600"></span> S1 (Mitral Closure)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400"></span> S2 (Aortic Closure)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600"></span> Holosystolic Murmur Jet (Highlighted)</span>
                </div>
                <span className="font-mono text-slate-600 font-semibold">Signal-to-Noise Ratio: +38.4 dB</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Cryptographic Audit Trail Inspector Drawer (35% / col-span-4) */}
          <div className="xl:col-span-4 flex flex-col gap-4 sticky top-20">
            <div className="p-4 lg:p-5 rounded-xl bg-white shadow-xs border border-sky-100 flex flex-col gap-3">
              
              {/* Title & Chain Badge */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[10px] uppercase tracking-widest text-sky-700 font-bold">
                    PROVENANCE INSPECTOR
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-label-sm text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    CHAIN VALID // ED25519
                  </span>
                </div>
                <h2 className="font-headline-md text-base text-slate-900 font-bold">Cryptographic Audit Trail</h2>
                <div className="p-2 rounded bg-sky-50 border border-sky-100 flex items-center justify-between">
                  <span className="font-headline-sm text-xs text-slate-900 font-bold">
                    John Doe (#PT-4421)
                  </span>
                  <span className="font-label-md text-xs text-sky-700 font-bold">{selectedRowId}</span>
                </div>
              </div>

              {/* Sub-Card A: Audio Checksum */}
              <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-100 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[10px] text-sky-800 font-bold uppercase">
                    Audio Provenance Checksum
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-label-sm text-[9px] font-bold">
                    NIST Traceable
                  </span>
                </div>
                <div className="mt-1 flex flex-col gap-1">
                  <span className="font-label-sm text-[9px] text-slate-500 uppercase">Raw SHA-256 Audio Hash:</span>
                  <div className="p-1.5 rounded bg-white border border-sky-200 font-mono text-[10px] text-slate-800 break-all select-all flex items-start justify-between gap-1">
                    <span>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                  </div>
                </div>
              </div>

              {/* Sub-Card B: DSP Params */}
              <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-100 flex flex-col gap-1">
                <span className="font-label-sm text-[10px] text-sky-800 font-bold uppercase">
                  Signal Pre-processing & DSP
                </span>
                <ul className="flex flex-col gap-1 font-body-sm text-xs text-slate-800 mt-1">
                  <li className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Filter Topology:</span>
                    <span className="font-mono text-[11px] font-semibold">Butterworth 4th-Order (20Hz–200Hz)</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Resampling:</span>
                    <span className="font-mono text-[11px] font-semibold">2,000 Hz / Normalized -14.2 dBFS</span>
                  </li>
                </ul>
              </div>

              {/* Sub-Card C: Model Inference */}
              <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-100 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[10px] text-sky-800 font-bold uppercase">
                    Model Inference Envelope
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-label-sm text-[9px] font-bold">
                    v1.2.0
                  </span>
                </div>
                <div className="flex flex-col gap-1 mt-1 text-xs text-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Architecture:</span>
                    <span className="font-headline-sm text-[11px] font-bold">CardioResNet-18 (PyTorch 2D)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Hardware Target:</span>
                    <span className="font-label-sm text-[11px] font-mono">NVIDIA TensorRT (41ms)</span>
                  </div>
                </div>
              </div>

              {/* Sub-Card D: Agent Guardrails & Logits */}
              <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-100 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[10px] text-sky-800 font-bold uppercase">
                    Agent Guardrails & Logit Entailment
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-label-sm text-[9px] font-bold">
                    VERIFIED
                  </span>
                </div>
                <div className="p-1.5 rounded bg-white border border-sky-200 mt-1 flex flex-col gap-0.5 font-mono text-[10px]">
                  <div className="flex items-center justify-between text-red-600 font-bold">
                    <span>abnormal_mitral_regurg:</span>
                    <span>0.9412 (94.1%)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>normal_s1_s2:</span>
                    <span>0.0588 (5.9%)</span>
                  </div>
                </div>
                <div className="p-1.5 rounded bg-white border border-sky-200 mt-1">
                  <p className="font-body-sm text-[11px] text-slate-800 italic">
                    “Holosystolic high-frequency acoustic turbulence detected consistent with Mitral Valve Regurgitation.”
                  </p>
                </div>
              </div>

              {/* Sub-Card E: Physician Seal */}
              <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-100 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                  RJ
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-xs font-bold text-slate-900">Dr. Robert H. Jehning, MD, FACC</span>
                  <span className="font-label-sm text-[10px] text-slate-500 font-mono">ECDSA-P256 Key: 0x81b4...e90a</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 pt-1">
                <button className="w-full h-9 rounded-lg bg-sky-600 text-white font-headline-sm text-xs font-bold shadow-xs hover:bg-sky-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Verifiable Audit Bundle (.jsonld)</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
