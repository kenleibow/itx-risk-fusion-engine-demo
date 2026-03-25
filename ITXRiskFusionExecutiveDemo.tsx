"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Pill, FileText, Watch, FlaskConical, CheckCircle2,
  TrendingUp, HeartPulse, Clock3
} from "lucide-react";

type Source = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  defaultRisk: number;
  defaultConfidence: number;
};

const sources: Source[] = [
  { key: "aps", label: "APS Records", icon: FileText, color: "bg-blue-100 text-blue-700", defaultRisk: 65, defaultConfidence: 55 },
  { key: "rx", label: "Rx Data", icon: Pill, color: "bg-purple-100 text-purple-700", defaultRisk: 72, defaultConfidence: 75 },
  { key: "labs", label: "Lab Results", icon: FlaskConical, color: "bg-green-100 text-green-700", defaultRisk: 48, defaultConfidence: 90 },
  { key: "wearables", label: "Wearables", icon: Watch, color: "bg-orange-100 text-orange-700", defaultRisk: 58, defaultConfidence: 65 },
];

type Inputs = Record<string, { risk: number; confidence: number; enabled: boolean }>;

function defaultInputs(): Inputs {
  return sources.reduce((acc, s) => {
    acc[s.key] = { risk: s.defaultRisk, confidence: s.defaultConfidence, enabled: true };
    return acc;
  }, {} as Inputs);
}

function SimpleCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

function ProgressBar({ value, fillClass }: { value: number; fillClass: string }) {
  return (
    <div className="mt-3 h-3 w-full rounded-full bg-white/70">
      <div className={`h-3 rounded-full transition-all ${fillClass}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export default function ITXRiskFusionExecutiveDemo() {
  const [inputs, setInputs] = useState<Inputs>(defaultInputs());
  const [riskProfile, setRiskProfile] = useState({ health: 58, lifestyle: 52, timing: 70 });

  const setField = (key: string, field: "risk" | "confidence" | "enabled", value: number | boolean) => {
    setInputs((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const results = useMemo(() => {
    const active = sources.filter((s) => inputs[s.key].enabled);
    const baselineRisk = Math.round(
      riskProfile.health * 0.45 + riskProfile.lifestyle * 0.3 + (100 - riskProfile.timing) * 0.25
    );

    const evidence = active.map((s) => {
      const sourceRisk = inputs[s.key].risk;
      const confidence = inputs[s.key].confidence;
      const variance = Math.max(1, 101 - confidence);
      const weight = 1 / variance;
      const blendedRisk = Math.round(sourceRisk * 0.75 + baselineRisk * 0.25);
      return { ...s, risk: blendedRisk, sourceRisk, confidence, weight };
    });

    const totalWeight = evidence.reduce((sum, e) => sum + e.weight, 0) || 1;
    const fusedRisk = evidence.reduce((sum, e) => sum + e.risk * e.weight, 0) / totalWeight;
    const weightedConfidence = evidence.reduce((sum, e) => sum + e.confidence * e.weight, 0) / totalWeight;
    const fusedConfidence = Math.round(weightedConfidence);

    let decision = "Standard";
    if (fusedRisk > 75) decision = "Decline";
    else if (fusedRisk > 60) decision = "Table Rated";
    else if (fusedRisk > 45) decision = "Standard Plus";
    else decision = "Preferred";

    return {
      baselineRisk,
      fusedRisk: Math.round(fusedRisk),
      confidence: Math.max(1, Math.min(99, fusedConfidence)),
      decision,
      evidence: [...evidence].sort((a, b) => b.weight - a.weight),
    };
  }, [inputs, riskProfile]);

  const loadConflictDemo = () => {
    setRiskProfile({ health: 72, lifestyle: 60, timing: 35 });
    setInputs({
      aps: { risk: 80, confidence: 50, enabled: true },
      rx: { risk: 75, confidence: 80, enabled: true },
      labs: { risk: 45, confidence: 92, enabled: true },
      wearables: { risk: 60, confidence: 60, enabled: true },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <SimpleCard className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <div className="p-8">
            <div className="w-fit rounded-full bg-white px-3 py-1 text-sm font-semibold text-blue-600">ITX Product Demo</div>
            <h1 className="mt-4 text-4xl font-bold">ITX Risk Fusion Engine™</h1>
            <p className="mt-3 text-lg text-blue-100">Confidence-weighted decision intelligence for life insurance underwriting</p>
          </div>
        </SimpleCard>

        <div className="grid gap-6 md:grid-cols-2">
          <SimpleCard className="border-l-4 border-red-400">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-red-600">Current Challenge</h2>
              <p className="mt-2 text-sm text-slate-600">Conflicting and inconsistent underwriting signals</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div>• APS vs Rx conflicts</div>
                <div>• Missing or delayed data</div>
                <div>• Subjective weighting</div>
                <div>• Inconsistent decisions</div>
              </div>
            </div>
          </SimpleCard>

          <SimpleCard className="border-l-4 border-green-400">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-600">ITX Solution</h2>
              <p className="mt-2 text-sm text-slate-600">Confidence-weighted, explainable decisions</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                <ShieldCheck className="h-10 w-10 text-green-600" />
                <span>Unified risk + confidence + explainability</span>
              </div>
            </div>
          </SimpleCard>
        </div>

        <SimpleCard className="shadow-md">
          <div className="space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-semibold">Live Underwriting Scenario</h2>
              <p className="text-sm text-slate-600">Interactive simulation with applicant profile, source confidence, and fused output</p>
            </div>

            <div className="rounded-2xl border bg-gradient-to-r from-sky-50 to-cyan-50 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-slate-900">1. Define Applicant Risk Profile</div>
                  <div className="text-sm text-slate-600">Health + lifestyle + timing create the baseline profile before source-level fusion begins.</div>
                </div>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm">
                  Baseline Risk {results.baselineRisk}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-white/90 p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 font-medium text-rose-600"><HeartPulse className="h-4 w-4" /> Health Profile</div>
                  <div className="mb-2 text-2xl font-bold text-slate-900">{riskProfile.health}</div>
                  <input type="range" min={0} max={100} value={riskProfile.health} onChange={(e) => setRiskProfile((prev) => ({ ...prev, health: Number(e.target.value) }))} className="w-full" />
                  <div className="mt-2 text-xs text-slate-500">Impairments, build, medical history, and clinical complexity</div>
                </div>

                <div className="rounded-xl border bg-white/90 p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 font-medium text-emerald-600"><ShieldCheck className="h-4 w-4" /> Lifestyle Profile</div>
                  <div className="mb-2 text-2xl font-bold text-slate-900">{riskProfile.lifestyle}</div>
                  <input type="range" min={0} max={100} value={riskProfile.lifestyle} onChange={(e) => setRiskProfile((prev) => ({ ...prev, lifestyle: Number(e.target.value) }))} className="w-full" />
                  <div className="mt-2 text-xs text-slate-500">Nicotine, avocations, habits, and behavioral factors</div>
                </div>

                <div className="rounded-xl border bg-white/90 p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 font-medium text-amber-600"><Clock3 className="h-4 w-4" /> Timing / Recency</div>
                  <div className="mb-2 text-2xl font-bold text-slate-900">{riskProfile.timing}</div>
                  <input type="range" min={0} max={100} value={riskProfile.timing} onChange={(e) => setRiskProfile((prev) => ({ ...prev, timing: Number(e.target.value) }))} className="w-full" />
                  <div className="mt-2 text-xs text-slate-500">Higher means fresher and more decision-ready evidence</div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="text-lg font-semibold text-slate-900">2. Assess Each Input and Assign Confidence</div>
                {sources.map((s, idx) => {
                  const Icon = s.icon;
                  const item = inputs[s.key];
                  return (
                    <motion.div key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-xl border bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${s.color}`}><Icon className="h-4 w-4" /></div>
                        <div className="font-semibold">{s.label}</div>
                      </div>

                      <div className="text-xs">Source Risk Assessment: {item.risk}</div>
                      <input type="range" min={0} max={100} value={item.risk} onChange={(e) => setField(s.key, "risk", Number(e.target.value))} className="w-full" />

                      <div className="mt-2 text-xs">Confidence: {item.confidence}</div>
                      <input type="range" min={0} max={99} value={item.confidence} onChange={(e) => setField(s.key, "confidence", Number(e.target.value))} className="w-full" />
                    </motion.div>
                  );
                })}

                <button onClick={loadConflictDemo} className="rounded-xl bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700">
                  Load Conflicting Case
                </button>
              </div>

              <div className="space-y-6">
                <div className="text-lg font-semibold text-slate-900">3. Fuse the Data and Output the Decision</div>

                <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                  <div className="text-sm text-sky-700">Baseline Risk Profile</div>
                  <div className="text-3xl font-bold text-sky-900">{results.baselineRisk}</div>
                </div>

                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="text-sm text-blue-700">Fused Risk Score</div>
                  <div className="text-4xl font-bold text-blue-900">{results.fusedRisk}</div>
                  <ProgressBar value={results.fusedRisk} fillClass="bg-blue-700" />
                </div>

                <div className="rounded-xl bg-green-50 p-4">
                  <div className="text-sm text-green-700">Confidence</div>
                  <div className="text-4xl font-bold text-green-900">{results.confidence}%</div>
                  <ProgressBar value={results.confidence} fillClass="bg-green-700" />
                </div>

                <div className="rounded-xl border-l-4 border-purple-500 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                    <CheckCircle2 className="h-4 w-4" /> Decision
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{results.decision}</div>
                </div>

                <div>
                  <div className="mb-2 font-semibold">Explainability</div>
                  {results.evidence.map((e) => (
                    <div key={e.key} className="mb-2 flex justify-between rounded border bg-slate-50 p-2 text-sm">
                      <span>{e.label}</span>
                      <span className="font-medium text-purple-600">Weight {e.weight.toFixed(2)} · Blended Risk {e.risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SimpleCard>

        <SimpleCard className="border-0 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="grid gap-4 p-6 text-sm md:grid-cols-3">
            <div className="flex gap-2 text-green-700"><TrendingUp className="h-4 w-4" /> Improved placement</div>
            <div className="flex gap-2 text-blue-700"><CheckCircle2 className="h-4 w-4" /> Fewer false declines</div>
            <div className="flex gap-2 text-purple-700"><ShieldCheck className="h-4 w-4" /> Explainable decisions</div>
          </div>
        </SimpleCard>
      </div>
    </div>
  );
}
