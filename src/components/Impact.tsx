"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Database, Layers, Cpu, Search, Sparkles } from "lucide-react";

/* ─── Neural Network Canvas (optimized) ─── */
function NeuralNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const visibleRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); };
    window.addEventListener("resize", onResize);

    const observer = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; }, { threshold: 0.1 });
    observer.observe(canvas);

    const layers = [3, 5, 6, 5, 3, 2];
    const xGap = w / (layers.length + 1);

    interface Node { x: number; y: number; layer: number }
    const nodes: Node[] = [];
    layers.forEach((count, li) => {
      const yGap = h / (count + 1);
      for (let ni = 0; ni < count; ni++) nodes.push({ x: xGap * (li + 1), y: yGap * (ni + 1), layer: li });
    });

    // Pre-compute connections (avoid O(n²) every frame)
    const connections: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].layer === nodes[i].layer + 1) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          if (dx * dx + dy * dy < 40000) connections.push([i, j]);
        }
      }
    }

    // Pre-group nodes by layer for fast signal spawning
    const nodesByLayer: Node[][] = layers.map((_, li) => nodes.filter(n => n.layer === li));

    interface Signal { fromX: number; fromY: number; toX: number; toY: number; progress: number; speed: number }
    const signals: Signal[] = [];

    let time = 0;
    let lastTime = 0;

    const draw = (timestamp: number) => {
      if (!visibleRef.current) { animRef.current = requestAnimationFrame(draw); return; }

      const dt = lastTime ? Math.min((timestamp - lastTime) / 16.667, 3) : 1;
      lastTime = timestamp;
      time += dt;

      ctx.clearRect(0, 0, w, h);

      // connections (single style set, batched path)
      ctx.beginPath();
      for (const [i, j] of connections) {
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
      }
      ctx.strokeStyle = "rgba(200,165,90,0.12)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // spawn signals
      if (Math.floor(time) % 20 === 0 && signals.length < 15) {
        const li = Math.floor(Math.random() * (layers.length - 1));
        const fromArr = nodesByLayer[li];
        const toArr = nodesByLayer[li + 1];
        if (fromArr.length && toArr.length) {
          const from = fromArr[Math.floor(Math.random() * fromArr.length)];
          const to = toArr[Math.floor(Math.random() * toArr.length)];
          signals.push({ fromX: from.x, fromY: from.y, toX: to.x, toY: to.y, progress: 0, speed: 0.012 + Math.random() * 0.012 });
        }
      }

      // draw signals
      for (let s = signals.length - 1; s >= 0; s--) {
        const sig = signals[s];
        sig.progress += sig.speed * dt;
        if (sig.progress > 1) { signals.splice(s, 1); continue; }
        const sx = sig.fromX + (sig.toX - sig.fromX) * sig.progress;
        const sy = sig.fromY + (sig.toY - sig.fromY) * sig.progress;
        const alpha = sig.progress < 0.2 ? sig.progress / 0.2 : sig.progress > 0.8 ? (1 - sig.progress) / 0.2 : 1;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,165,90,${(0.85 * alpha).toFixed(2)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,165,90,${(0.2 * alpha).toFixed(2)})`;
        ctx.fill();
      }

      // nodes
      for (const n of nodes) {
        const pulse = Math.sin(time * 0.03 + n.x * 0.01 + n.y * 0.01) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,165,90,${(0.08 * pulse).toFixed(3)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,165,90,${(0.6 * pulse).toFixed(2)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,213,163,${(0.9 * pulse).toFixed(2)})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative mb-24">
      <p className="text-[10px] text-gold/60 font-mono tracking-[0.3em] uppercase text-center mb-6">
        Neural Network Data Flow
      </p>
      <canvas ref={canvasRef} className="w-full h-[260px] md:h-[320px] opacity-80" style={{ willChange: "transform" }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(90deg, #0a0a0a 0%, transparent 10%, transparent 90%, #0a0a0a 100%)"
      }} />
    </div>
  );
}

/* ─── Circular Gauge ─── */
function CircularGauge({ value, label, sublabel, delay }: { value: number; label: string; sublabel: string; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      const duration = 2000;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setCurrent(Math.round(eased * value));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [isInView, value, delay]);

  const r = 62;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (circumference * current) / 100;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-[160px] h-[160px]">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(200,165,90,0.06)" strokeWidth="5" />
          <circle
            cx="70" cy="70" r={r} fill="none"
            stroke="url(#gaugeGradient)" strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-100"
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c8a55a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#e8d5a3" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold gold-shimmer">{current}%</span>
        </div>
        <div className="absolute inset-0 rounded-full" style={{
          background: `radial-gradient(circle, rgba(200,165,90,${0.03 * (current / 100)}) 0%, transparent 70%)`
        }} />
      </div>
      <span className="text-xs text-white/80 font-medium mt-3 text-center">{label}</span>
      <span className="text-[10px] text-neutral-700 mt-0.5 text-center">{sublabel}</span>
    </motion.div>
  );
}

/* ─── Pipeline ─── */
const pipelineSteps = [
  { icon: Database, label: "Ingest", sub: "S3 / Data Lake" },
  { icon: Layers, label: "Chunk", sub: "Parse & Split" },
  { icon: Cpu, label: "Embed", sub: "Vectorize" },
  { icon: Search, label: "Retrieve", sub: "Semantic Search" },
  { icon: Sparkles, label: "Generate", sub: "LLM Response" },
];

function Pipeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="mb-24">
      <p className="text-[10px] text-gold/60 font-mono tracking-[0.3em] uppercase text-center mb-10">
        RAG Pipeline Architecture
      </p>

      {/* Desktop */}
      <div className="hidden md:flex items-start justify-center">
        {pipelineSteps.map((step, i) => (
          <div key={step.label} className="flex items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.18, duration: 0.7 }}
              className="flex flex-col items-center w-36"
            >
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl border border-gold/12 bg-gold/[0.03] flex items-center justify-center mb-3 hover:border-gold/30 hover:bg-gold/[0.07] transition-all duration-500 relative z-10">
                  <step.icon size={26} className="text-gold/50 group-hover:text-gold transition-colors duration-500" strokeWidth={1.5} />
                </div>
                <div className="absolute -inset-3 rounded-3xl bg-gold/[0.02] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold/30 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
              </div>
              <span className="text-xs text-white/85 font-semibold tracking-wide">{step.label}</span>
              <span className="text-[10px] text-neutral-600 mt-1">{step.sub}</span>
            </motion.div>

            {i < pipelineSteps.length - 1 && (
              <div className="relative w-14 mt-10 mx-0">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ delay: i * 0.18 + 0.1, duration: 0.5 }}
                  className="h-px bg-gold/15 origin-left"
                />
                <div className="absolute top-[-2.5px] left-0 w-2 h-2 rounded-full bg-gold/60 animate-flow-dot" style={{ animationDelay: `${i * 0.5}s` }} />
                <div className="absolute top-[-2.5px] left-0 w-2 h-2 rounded-full bg-gold/30 animate-flow-dot" style={{ animationDelay: `${i * 0.5 + 0.8}s` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="flex md:hidden flex-col items-center gap-2">
        {pipelineSteps.map((step, i) => (
          <div key={step.label} className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.12 }}
              className="flex items-center gap-4 w-full max-w-[260px]"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-xl border border-gold/12 bg-gold/[0.03] flex items-center justify-center shrink-0">
                  <step.icon size={20} className="text-gold/50" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold/30 animate-pulse" />
              </div>
              <div>
                <div className="text-xs text-white/85 font-semibold">{step.label}</div>
                <div className="text-[10px] text-neutral-600">{step.sub}</div>
              </div>
            </motion.div>
            {i < pipelineSteps.length - 1 && (
              <div className="relative w-px h-6 bg-gold/10 self-center" style={{ marginLeft: '-90px' }}>
                <div className="absolute top-0 left-[-2px] w-[5px] h-[5px] rounded-full bg-gold/40 animate-flow-dot-vertical" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Hex Grid Scale Visualization ─── */
function HexGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setRevealed(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  const cols = 22;
  const rows = 10;
  const hexSize = 14;
  const hexW = hexSize * 2;
  const hexH = Math.sqrt(3) * hexSize;

  const hexPath = (cx: number, cy: number) => {
    const pts = [];
    for (let a = 0; a < 6; a++) {
      const angle = (Math.PI / 3) * a - Math.PI / 6;
      pts.push(`${cx + hexSize * Math.cos(angle)},${cy + hexSize * Math.sin(angle)}`);
    }
    return pts.join(" ");
  };

  const hexagons: { x: number; y: number; idx: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * hexW * 0.75 + 20;
      const y = r * hexH + (c % 2 === 1 ? hexH / 2 : 0) + 20;
      hexagons.push({ x, y, idx: r * cols + c });
    }
  }

  const svgW = cols * hexW * 0.75 + 40;
  const svgH = rows * hexH + hexH / 2 + 40;

  return (
    <div ref={ref} className="text-center mb-24">
      <p className="text-[10px] text-gold/60 font-mono tracking-[0.3em] uppercase mb-8">
        Document Processing Scale
      </p>

      <div className="flex justify-center mb-8 overflow-hidden">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-2xl">
          {hexagons.map((h) => {
            const intensity = revealed ? 0.08 + Math.random() * 0.35 : 0.02;
            const distFromCenter = Math.abs(h.idx - hexagons.length / 2) / (hexagons.length / 2);
            const heatIntensity = revealed ? (1 - distFromCenter * 0.6) * 0.4 : 0.02;
            return (
              <polygon
                key={h.idx}
                points={hexPath(h.x, h.y)}
                fill={`rgba(200,165,90,${heatIntensity})`}
                stroke={`rgba(200,165,90,${revealed ? 0.12 : 0.03})`}
                strokeWidth="0.5"
                style={{
                  transition: `all 0.5s ease ${h.idx * 5}ms`,
                  filter: revealed && heatIntensity > 0.25 ? `drop-shadow(0 0 3px rgba(200,165,90,0.15))` : "none",
                }}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/20" />
        <div className="text-5xl md:text-6xl font-bold gold-shimmer tracking-tight">22M+</div>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/20" />
      </div>
      <p className="text-[10px] text-neutral-600 font-mono tracking-[0.2em]">DOCUMENTS PROCESSED & CLASSIFIED</p>
      <div className="flex justify-center gap-8 mt-5">
        <div className="text-center">
          <div className="text-lg font-bold text-gold/80">3M</div>
          <div className="text-[9px] text-neutral-700 font-mono uppercase tracking-wider">per month</div>
        </div>
        <div className="w-px h-8 bg-gold/10" />
        <div className="text-center">
          <div className="text-lg font-bold text-gold/80">100K</div>
          <div className="text-[9px] text-neutral-700 font-mono uppercase tracking-wider">per day</div>
        </div>
        <div className="w-px h-8 bg-gold/10" />
        <div className="text-center">
          <div className="text-lg font-bold text-gold/80">&lt;2s</div>
          <div className="text-[9px] text-neutral-700 font-mono uppercase tracking-wider">per query</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Concentric Pulse Rings ─── */
function PulseRings() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const cx = 350;
  const cy = 200;
  const rings = [
    { r: 30, label: "Core ML Models", delay: 0 },
    { r: 60, label: "Feature Engineering", delay: 0.3 },
    { r: 90, label: "Search & Retrieval", delay: 0.6 },
    { r: 120, label: "Data Pipeline", delay: 0.9 },
    { r: 155, label: "Cloud Infrastructure", delay: 1.2 },
  ];

  return (
    <div ref={ref} className="mb-24">
      <p className="text-[10px] text-gold/60 font-mono tracking-[0.3em] uppercase text-center mb-10">
        Technology Stack Depth
      </p>
      <div className="flex justify-center overflow-hidden">
        <svg viewBox="0 0 700 400" className="w-full max-w-2xl">
          {rings.map((ring, i) => {
            const labelAngle = -Math.PI / 4 - i * 0.15;
            const lx = cx + (ring.r + 12) * Math.cos(labelAngle);
            const ly = cy + (ring.r + 12) * Math.sin(labelAngle);
            return (
              <g key={ring.label}>
                <motion.circle
                  cx={cx} cy={cy} r={ring.r}
                  fill="none"
                  stroke="rgba(200,165,90,0.1)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: ring.delay, duration: 0.8, ease: "easeOut" }}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
                <motion.circle
                  cx={cx} cy={cy} r={ring.r}
                  fill={`rgba(200,165,90,${0.025 - i * 0.004})`}
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ delay: ring.delay, duration: 0.8 }}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
                <motion.line
                  x1={lx} y1={ly}
                  x2={lx - 40} y2={ly - 25}
                  stroke="rgba(200,165,90,0.12)"
                  strokeWidth="0.5"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: ring.delay + 0.5 }}
                />
                <motion.text
                  x={lx - 44}
                  y={ly - 28}
                  fill="rgba(200,165,90,0.5)"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                  dominantBaseline="middle"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: ring.delay + 0.6 }}
                >
                  {ring.label}
                </motion.text>
                <motion.circle
                  cx={cx + ring.r}
                  cy={cy}
                  r="2.5"
                  fill="rgba(200,165,90,0.5)"
                  initial={{ opacity: 0 }}
                  animate={isInView ? {
                    opacity: [0, 0.6, 0.6, 0],
                    rotate: [0, 360],
                  } : {}}
                  transition={{
                    delay: ring.delay + 0.8,
                    duration: 6 + i * 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
              </g>
            );
          })}
          <motion.circle
            cx={cx} cy={cy} r="8"
            fill="rgba(200,165,90,0.4)"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: [0, 1.2, 1] } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          />
          <motion.circle
            cx={cx} cy={cy} r="4"
            fill="rgba(232,213,163,0.7)"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.4 }}
          />
        </svg>
      </div>
    </div>
  );
}

/* ─── Metric Bars ─── */
const metrics = [
  { label: "Retrieval Accuracy (HRT)", value: 86 },
  { label: "Processing Speed Improvement", value: 45 },
  { label: "Monitoring Response Time ↓", value: 40 },
  { label: "Reporting Efficiency Gain", value: 25 },
  { label: "Forecast Accuracy ↑", value: 22 },
];

function MetricBars() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="max-w-xl mx-auto">
      <p className="text-[10px] text-gold/60 font-mono tracking-[0.3em] uppercase text-center mb-10">
        Measurable Impact
      </p>
      <div className="space-y-5">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-neutral-500">{m.label}</span>
              <span className="text-sm text-gold font-mono font-bold">{m.value}%</span>
            </div>
            <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${m.value}%` } : {}}
                transition={{ duration: 2, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  background: `linear-gradient(90deg, rgba(200,165,90,0.3), rgba(200,165,90,0.6))`,
                }}
              >
                <div className="absolute inset-0 animate-bar-shimmer" style={{
                  background: "linear-gradient(90deg, transparent, rgba(232,213,163,0.3), transparent)",
                  backgroundSize: "200% 100%",
                }} />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function Impact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="impact" className="py-28 px-6">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span className="text-[10px] text-gold/60 font-mono tracking-[0.3em] uppercase">
            Results
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 tracking-tight">
            Impact
          </h2>
        </motion.div>

        <NeuralNetworkCanvas />

        <Pipeline />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 mb-24 max-w-3xl mx-auto">
          <CircularGauge value={86} label="Retrieval Accuracy" sublabel="HRT Score" delay={0} />
          <CircularGauge value={45} label="Faster Processing" sublabel="Pipeline Speed" delay={200} />
          <CircularGauge value={40} label="Response Time ↓" sublabel="Monitoring" delay={400} />
          <CircularGauge value={95} label="Classification" sublabel="Precision" delay={600} />
        </div>

        <HexGrid />

        <PulseRings />

        <MetricBars />
      </div>
    </section>
  );
}
