import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Zap, 
  Send, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  Terminal
} from 'lucide-react';

interface ModelProfile {
  id: string;
  name: string;
  provider: string;
  costPerMillion: string;
  avgLatencyMs: number;
  bestFor: string;
  status: 'nominal' | 'degraded';
}

const MODELS_CATALOG: ModelProfile[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    costPerMillion: '$0.075 / $0.30',
    avgLatencyMs: 142,
    bestFor: 'Ultra-fast multimodal, real-time dispatch logic & coding',
    status: 'nominal'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    costPerMillion: '$3.00 / $15.00',
    avgLatencyMs: 480,
    bestFor: 'Complex architectural reasoning & nuanced prose',
    status: 'nominal'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    costPerMillion: '$2.50 / $10.00',
    avgLatencyMs: 390,
    bestFor: 'General multi-turn reasoning & tool calling',
    status: 'nominal'
  },
  {
    id: 'flux-1-pro',
    name: 'FLUX.1 Pro',
    provider: 'Black Forest Labs',
    costPerMillion: '$0.05 / image',
    avgLatencyMs: 1200,
    bestFor: 'Photorealistic image generation & visual rendering',
    status: 'nominal'
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    costPerMillion: '$0.14 / $0.28',
    avgLatencyMs: 290,
    bestFor: 'High throughput cost-optimized batch evaluation',
    status: 'nominal'
  }
];

export const FluxAIRouterView: React.FC = () => {
  const [prompt, setPrompt] = useState('Analyze traffic surge pattern in Sector 4 and output optimal delivery vehicle allocation.');
  const [routingPolicy, setRoutingPolicy] = useState<'smart' | 'lowest_latency' | 'lowest_cost' | 'visual'>('smart');
  const [isRouting, setIsRouting] = useState(false);
  const [routedResult, setRoutedResult] = useState<{
    selectedModel: ModelProfile;
    reasoning: string;
    output: string;
    tokensUsed: number;
    latencyMs: number;
    estimatedCost: string;
  } | null>(null);

  const samplePrompts = [
    { label: 'Dispatch Telemetry', text: 'Analyze traffic surge pattern in Sector 4 and output optimal delivery vehicle allocation.' },
    { label: 'Graph Optimization Code', text: 'Write a high-performance TypeScript 2-opt TSP solver with capacity constraints.' },
    { label: 'Visual Depot Asset', text: 'Render isometric 3D architectural mockup of an automated EV delivery hub with charging docks.' },
    { label: 'Freight Economics', text: 'Compare cost per ton-mile for Class 8 battery electric trucks versus intermodal freight rail.' }
  ];

  const handleExecuteRoute = () => {
    setIsRouting(true);
    setRoutedResult(null);

    setTimeout(() => {
      let chosenModel = MODELS_CATALOG[0]; // default Gemini 2.5 Flash

      const lower = prompt.toLowerCase();
      if (lower.includes('render') || lower.includes('image') || lower.includes('mockup') || routingPolicy === 'visual') {
        chosenModel = MODELS_CATALOG.find(m => m.id === 'flux-1-pro') || MODELS_CATALOG[0];
      } else if (routingPolicy === 'lowest_cost') {
        chosenModel = MODELS_CATALOG.find(m => m.id === 'gemini-2.5-flash') || MODELS_CATALOG[0];
      } else if (routingPolicy === 'lowest_latency') {
        chosenModel = MODELS_CATALOG.find(m => m.id === 'gemini-2.5-flash') || MODELS_CATALOG[0];
      } else if (lower.includes('code') || lower.includes('solver') || lower.includes('architecture')) {
        chosenModel = MODELS_CATALOG.find(m => m.id === 'gemini-2.5-flash') || MODELS_CATALOG[1];
      }

      let simulatedOutput = '';
      if (chosenModel.id === 'flux-1-pro') {
        simulatedOutput = `[FLUX.1 Pro Generative Pipeline Triggered]\nArtifact generated: isometric_ev_delivery_depot_v2.png\nResolution: 1024x1024 · Guidance Scale: 3.5 · Seed: 84920194`;
      } else if (lower.includes('traffic') || lower.includes('dispatch')) {
        simulatedOutput = `FluxRoute Autonomous Telemetry Report:\n1. Sector 4 arterial congestion detected at 101-North (+14 min delay).\n2. Recommended Allocation: Re-route Unit FLX-VAN-01 via 3rd St corridor.\n3. Payload Re-balance: Shift 2 packages (FLX-8924, FLX-8926) to E-Cargo Bike #03 for zero-emissions congestion avoidance.\n4. Net Expected Result: -22 min delay mitigated, 99.4% SLA preserved.`;
      } else {
        simulatedOutput = `Flux Routing Decision Executed Successfully:\nSelected Model: ${chosenModel.name} (${chosenModel.provider})\nHeuristic Policy: ${routingPolicy.toUpperCase()}\nStatus: Optimal response generated with 99.8% precision benchmark.`;
      }

      setRoutedResult({
        selectedModel: chosenModel,
        reasoning: `Flux Router matched prompt tokens & semantic complexity against SLA latency thresholds. Selected ${chosenModel.name} for optimal cost/performance ratio.`,
        output: simulatedOutput,
        tokensUsed: Math.floor(180 + Math.random() * 240),
        latencyMs: Math.round(chosenModel.avgLatencyMs * (0.9 + Math.random() * 0.2)),
        estimatedCost: chosenModel.id === 'flux-1-pro' ? '$0.050' : '$0.00012'
      });
      setIsRouting(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40">
              FLUX ROUTER GATEWAY
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Dynamic Multi-Model Dispatch
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Intelligent Prompt & Model Routing Gateway
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Single unified API proxy that dynamically resolves requests to Gemini, Claude, GPT, or FLUX models
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Avg. Cost Saved</span>
            <span className="text-lg font-bold text-emerald-400">-64.2%</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Failover Uptime</span>
            <span className="text-lg font-bold text-cyan-300">99.98%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Prompt Tester & Routing Policies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Prompt Tester */}
        <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Prompt Routing Testbench</span>
            </h3>
            
            {/* Policy Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              {[
                { id: 'smart', label: 'Smart Balancing' },
                { id: 'lowest_latency', label: 'Fastest (<200ms)' },
                { id: 'lowest_cost', label: 'Lowest Cost' },
                { id: 'visual', label: 'Image/FLUX' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setRoutingPolicy(p.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap font-medium ${
                    routingPolicy === p.id
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-500 mr-1">Benchmarks:</span>
            {samplePrompts.map((s) => (
              <button
                key={s.label}
                onClick={() => setPrompt(s.text)}
                className="px-2.5 py-1 text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter prompt or workload payload to route..."
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono resize-none"
            />
            <button
              onClick={handleExecuteRoute}
              disabled={isRouting || !prompt.trim()}
              className="absolute right-3 bottom-4 flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {isRouting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Route...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Flux Route</span>
                </>
              )}
            </button>
          </div>

          {/* Result Output Card */}
          {routedResult && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Routed Destination:</span>
                  <span className="font-bold text-cyan-300 font-mono px-2 py-0.5 bg-cyan-950/80 rounded border border-cyan-800">
                    {routedResult.selectedModel.name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">({routedResult.selectedModel.provider})</span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                  <span>Latency: <strong className="text-white">{routedResult.latencyMs}ms</strong></span>
                  <span>Tokens: <strong className="text-white">{routedResult.tokensUsed}</strong></span>
                  <span>Cost: <strong className="text-emerald-400">{routedResult.estimatedCost}</strong></span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                "{routedResult.reasoning}"
              </p>

              <pre className="p-3 bg-slate-900 rounded-lg text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800/80">
                {routedResult.output}
              </pre>
            </div>
          )}
        </div>

        {/* Right Col: Active Model Routing Table */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-sm mb-3">Model Gateway Matrix</h3>
            <div className="space-y-3">
              {MODELS_CATALOG.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs space-y-1 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{m.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                      {m.avgLatencyMs}ms
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{m.bestFor}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                    <span>{m.provider}</span>
                    <span>{m.costPerMillion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/40 text-xs text-slate-400 mt-4">
            <span className="text-cyan-300 font-semibold block mb-0.5">Automated Failover Architecture:</span>
            <span>If an API returns 429 or 5xx, Flux Router switches to the secondary lowest-latency model within 45ms.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
