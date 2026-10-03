import React, { useState, useEffect } from 'react';
import {
  ScanEye,
  Upload,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sprout,
  Image as ImageIcon
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { plantHealthAPI } from '../services/api';

export default function PlantHealth() {
  const { farm, showToast, refreshAll } = useFarm();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [samples, setSamples] = useState([]);
  const [history, setHistory] = useState([]);

  const [analysisResult, setAnalysisResult] = useState({
    health_score: 92,
    health_status: 'Healthy',
    stress_level: 'Low',
    detected_issue: 'No significant stress detected',
    confidence: 91.5,
    recommendation: 'Continue monitoring soil moisture and maintain current irrigation conditions.',
    notice: 'Demo AI inference — replaceable with trained plant disease model (TensorFlow / PyTorch / ONNX).',
    image_url: '/api/uploads/sample_healthy.jpg',
  });

  const fetchHistoryAndSamples = async () => {
    try {
      const [histRes, sampRes] = await Promise.all([
        plantHealthAPI.getHistory(farm.id, 10),
        plantHealthAPI.getSamples(),
      ]);

      if (histRes.success && histRes.data) {
        setHistory(histRes.data);
        if (histRes.data.length > 0) {
          const latest = histRes.data[0];
          setAnalysisResult({
            health_score: latest.health_score,
            health_status: latest.health_status,
            stress_level: latest.stress_level,
            detected_issue: latest.detected_issue,
            confidence: latest.confidence,
            recommendation: latest.recommendation,
            notice: 'Demo AI inference — replaceable with trained plant disease model (TensorFlow / PyTorch / ONNX).',
            image_url: latest.image_path ? `/api/${latest.image_path}` : '/api/uploads/sample_healthy.jpg',
          });
        }
      }
      if (sampRes.success && sampRes.data) {
        setSamples(sampRes.data);
      }
    } catch (err) {
      console.error('Error fetching plant health data:', err);
    }
  };

  useEffect(() => {
    fetchHistoryAndSamples();
  }, [farm.id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select or drag an image first', 'warning');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('farm_id', farm.id);

    try {
      const res = await plantHealthAPI.analyze(formData);
      if (res.success && res.data) {
        setAnalysisResult({
          ...res.data.metrics,
          notice: res.data.notice,
        });
        showToast('Canopy leaf analysis complete', 'success');
        await refreshAll();
        await fetchHistoryAndSamples();
      }
    } catch (err) {
      showToast(err.message || 'Analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleSelect = async (sampleName) => {
    setLoading(true);
    try {
      const res = await plantHealthAPI.analyze({
        sample: sampleName,
        farm_id: farm.id,
      });
      if (res.success && res.data) {
        setAnalysisResult({
          ...res.data.metrics,
          notice: res.data.notice,
        });
        setPreviewUrl(`/api/uploads/${sampleName}`);
        showToast(`Analyzed Sample: ${sampleName}`, 'success');
        await refreshAll();
        await fetchHistoryAndSamples();
      }
    } catch (err) {
      showToast(err.message || 'Sample analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Healthy':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
      case 'Mild Stress':
        return 'bg-sky-950 text-sky-300 border-sky-500/40';
      case 'Moderate Stress':
        return 'bg-amber-950 text-amber-300 border-amber-500/40';
      case 'Severe Stress':
        return 'bg-rose-950 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <ScanEye className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Plant Health AI Vision
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multispectral canopy & foliage pathology assessment for early detection of water stress and foliar blight.
          </p>
        </div>

        {/* Modular AI Architecture Note */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Inference Endpoint: <code className="text-emerald-400 font-mono">POST /api/plant-health/analyze</code></span>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & 1-Click Samples (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upload Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-2">Upload Crop Canopy Photo</h3>
            <p className="text-xs text-slate-400 mb-4">
              Upload a clear leaf or canopy image from mobile, drone, or ESP32-CAM.
            </p>

            <form onSubmit={handleUploadAnalyze} className="space-y-4">
              <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/40 hover:bg-slate-900/80">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">
                  {selectedFile ? selectedFile.name : 'Click to browse or drop leaf image'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">
                  Supports JPG, PNG, WEBP (Max 16MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {previewUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-800 max-h-48 bg-slate-950 flex items-center justify-center">
                  <img src={previewUrl} alt="Leaf Preview" className="max-h-48 object-contain" />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Evaluating Pathology...' : 'Run Vision AI Analysis'}</span>
              </button>
            </form>
          </div>

          {/* 1-Click Test Samples for Hackathon Demonstration */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">1-Click Demonstration Samples</h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                Instant Test
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Click any calibrated leaf pattern below to evaluate live:
            </p>

            <div className="space-y-2">
              {samples.map((samp) => (
                <button
                  key={samp.id}
                  type="button"
                  onClick={() => handleSampleSelect(samp.name)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 transition flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">{samp.title}</span>
                    <span className="text-[11px] text-slate-400">{samp.expected_outcome}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Inference Diagnostic Report (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            {/* Header & Score */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Diagnostic Result
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <h3 className="text-2xl font-black text-white">
                    {analysisResult.health_score}%
                  </h3>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusBadgeColor(analysisResult.health_status)}`}>
                    {analysisResult.health_status}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs">
                <span className="text-slate-400 block">AI Confidence Score</span>
                <span className="text-emerald-400 font-mono font-bold text-base">
                  {analysisResult.confidence}%
                </span>
              </div>
            </div>

            {/* Diagnostic Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Canopy Stress Level</span>
                <span className={`text-sm font-bold ${
                  analysisResult.stress_level === 'High' || analysisResult.stress_level === 'Critical' ? 'text-rose-400' :
                  analysisResult.stress_level === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {analysisResult.stress_level}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Detected Pathology</span>
                <span className="text-xs font-bold text-white truncate block">
                  {analysisResult.detected_issue}
                </span>
              </div>
            </div>

            {/* Agronomic Recommendation Box */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold mb-1.5">
                <Sprout className="w-4 h-4" />
                <span>Agronomic Action Plan:</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed font-medium">
                {analysisResult.recommendation}
              </p>
            </div>

            {/* Mandated AI Model Disclaimer */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-semibold text-emerald-300 block mb-0.5">Architecture Transparency:</span>
                "Demo AI inference — replaceable with trained plant disease model (TensorFlow / PyTorch / ONNX) without frontend modifications."
              </div>
            </div>
          </div>

          {/* Past Scans History */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Inspection History</span>
            </h3>

            <div className="divide-y divide-slate-800/80 text-xs">
              {history.map((h) => (
                <div key={h.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{h.detected_issue}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-white">{h.health_score}%</span>
                    <span className={`block text-[10px] font-bold ${
                      h.health_status === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {h.health_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
