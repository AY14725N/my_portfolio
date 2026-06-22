"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, Mail, Phone } from "lucide-react";
import { LinkedinIcon } from "@/components/SocialIcons";

/* ─── Combined Globe + Data Rain (single RAF loop) ─── */
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(true);

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

    // Throttled resize
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); };
    window.addEventListener("resize", onResize);

    // Throttled mouse (update at most every 32ms)
    let mouseThrottle = false;
    const onMouse = (e: MouseEvent) => {
      if (mouseThrottle) return;
      mouseThrottle = true;
      setTimeout(() => { mouseThrottle = false; }, 32);
      mouseRef.current = {
        x: (e.clientX - w / 2) / (w / 2),
        y: (e.clientY - h / 2) / (h / 2),
      };
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    // Visibility — pause when scrolled away
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(canvas);

    // ── Globe data ──
    const globePoints: { lat: number; lon: number; size: number; pulse: number; speed: number }[] = [];
    for (let i = 0; i < 80; i++) {
      globePoints.push({
        lat: (Math.random() - 0.5) * Math.PI,
        lon: Math.random() * Math.PI * 2,
        size: 1 + Math.random() * 1.5,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
      });
    }

    const arcs: { from: number; to: number; progress: number; speed: number; active: boolean; wait: number }[] = [];
    for (let i = 0; i < 10; i++) {
      arcs.push({
        from: Math.floor(Math.random() * globePoints.length),
        to: Math.floor(Math.random() * globePoints.length),
        progress: 0, speed: 0.005 + Math.random() * 0.007,
        active: Math.random() > 0.5, wait: Math.random() * 150,
      });
    }

    // Pre-compute grid angles (avoid trig in draw loop)
    const latLines: number[][] = [];
    for (let lat = -60; lat <= 60; lat += 30) {
      const latR = (lat * Math.PI) / 180;
      const lonSteps: number[] = [];
      for (let lon = 0; lon <= 360; lon += 8) lonSteps.push((lon * Math.PI) / 180);
      latLines.push([latR, ...lonSteps]);
    }
    const lonLines: number[][] = [];
    for (let lon = 0; lon < 360; lon += 30) {
      const lonR = (lon * Math.PI) / 180;
      const latSteps: number[] = [];
      for (let lat = -90; lat <= 90; lat += 6) latSteps.push((lat * Math.PI) / 180);
      lonLines.push([lonR, ...latSteps]);
    }

    const project = (lat: number, lon: number, rotY: number, tiltX: number, cx: number, cy: number, R: number) => {
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      const cosLon = Math.cos(lon + rotY);
      const sinLon = Math.sin(lon + rotY);
      const x = cosLat * sinLon;
      let y = sinLat;
      let z = cosLat * cosLon;
      const cosTilt = Math.cos(tiltX);
      const sinTilt = Math.sin(tiltX);
      const y2 = y * cosTilt - z * sinTilt;
      const z2 = y * sinTilt + z * cosTilt;
      return { x: cx + x * R, y: cy + y2 * R, z: z2 };
    };

    // ── Rain data ──
    const chars = "01λΣπμσ∇Δ∞→∈⊂∪⟨⟩{}=+×";
    const colCount = Math.floor(w / 28);
    const drops: { x: number; y: number; speed: number; chars: string[]; opacity: number }[] = [];
    for (let i = 0; i < Math.min(colCount, 40); i++) {
      drops.push({
        x: i * 28 + 14,
        y: -Math.random() * h * 2,
        speed: 0.3 + Math.random() * 0.6,
        chars: Array.from({ length: 3 + Math.floor(Math.random() * 4) }, () =>
          chars[Math.floor(Math.random() * chars.length)]
        ),
        opacity: 0.04 + Math.random() * 0.06,
      });
    }

    // ── Draw loop ──
    let time = 0;
    let lastTime = 0;

    const draw = (timestamp: number) => {
      if (!visibleRef.current) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Delta time for frame-rate-independent motion
      const dt = lastTime ? Math.min((timestamp - lastTime) / 16.667, 3) : 1;
      lastTime = timestamp;
      time += dt;

      ctx.clearRect(0, 0, w, h);

      const R = Math.min(w, h) * 0.3;
      const cx = w / 2;
      const cy = h / 2;
      const rotY = time * 0.003;
      const tiltX = mouseRef.current.y * 0.25;
      const tiltMod = mouseRef.current.x * 0.12;

      // ─ Rain ─
      ctx.font = "11px monospace";
      for (const d of drops) {
        d.y += d.speed * dt;
        if (d.y > h + 80) { d.y = -Math.random() * h * 0.5; d.speed = 0.3 + Math.random() * 0.6; }
        for (let ci = 0; ci < d.chars.length; ci++) {
          const dy = d.y + ci * 16;
          if (dy < -16 || dy > h + 16) continue;
          const isHead = ci === d.chars.length - 1;
          ctx.fillStyle = isHead
            ? `rgba(232,213,163,${d.opacity * 2})`
            : `rgba(200,165,90,${d.opacity * (1 - ci * 0.15)})`;
          ctx.fillText(d.chars[ci], d.x, dy);
        }
      }

      // ─ Globe grid ─ (batch draw calls)
      ctx.strokeStyle = "rgba(200,165,90,0.15)";
      ctx.lineWidth = 0.6;
      for (const line of latLines) {
        const latR = line[0];
        ctx.beginPath();
        let started = false;
        for (let k = 1; k < line.length; k++) {
          const p = project(latR, line[k], rotY + tiltMod, tiltX, cx, cy, R);
          if (p.z < -0.05) { started = false; continue; }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      for (const line of lonLines) {
        const lonR = line[0];
        ctx.beginPath();
        let started = false;
        for (let k = 1; k < line.length; k++) {
          const p = project(line[k], lonR, rotY + tiltMod, tiltX, cx, cy, R);
          if (p.z < -0.05) { started = false; continue; }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Equator
      ctx.beginPath();
      ctx.strokeStyle = "rgba(200,165,90,0.3)";
      ctx.lineWidth = 1;
      let eqStarted = false;
      for (let lon = 0; lon <= 360; lon += 6) {
        const p = project(0, (lon * Math.PI) / 180, rotY + tiltMod, tiltX, cx, cy, R);
        if (p.z < -0.05) { eqStarted = false; continue; }
        if (!eqStarted) { ctx.moveTo(p.x, p.y); eqStarted = true; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      // ─ Globe arcs ─
      for (const arc of arcs) {
        if (time < arc.wait) continue;
        if (!arc.active) { arc.active = true; arc.progress = 0; }
        arc.progress += arc.speed * dt;
        if (arc.progress > 2) {
          arc.progress = 0;
          arc.from = Math.floor(Math.random() * globePoints.length);
          arc.to = Math.floor(Math.random() * globePoints.length);
          arc.wait = time + 60 + Math.random() * 100;
          arc.active = false;
          continue;
        }
        const pf = globePoints[arc.from];
        const pt = globePoints[arc.to];
        ctx.beginPath();
        let arcStarted = false;
        for (let s = 0; s <= 20; s++) {
          const t = s / 20;
          if (t > Math.min(arc.progress, 1)) break;
          if (t < arc.progress - 1) continue;
          const lat = pf.lat + (pt.lat - pf.lat) * t;
          const lon = pf.lon + (pt.lon - pf.lon) * t;
          const alt = 1 + Math.sin(t * Math.PI) * 0.12;
          const p = project(lat, lon, rotY + tiltMod, tiltX, cx, cy, R);
          const px = cx + (p.x - cx) * alt;
          const py = cy + (p.y - cy) * alt;
          if (p.z < -0.1) { arcStarted = false; continue; }
          if (!arcStarted) { ctx.moveTo(px, py); arcStarted = true; }
          else ctx.lineTo(px, py);
        }
        const alpha = arc.progress > 1 ? Math.max(0, 2 - arc.progress) : Math.min(1, arc.progress * 2);
        ctx.strokeStyle = `rgba(200,165,90,${(0.6 * alpha).toFixed(2)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ─ Globe points ─ (batch by similar alpha)
      for (const p of globePoints) {
        const proj = project(p.lat, p.lon, rotY + tiltMod, tiltX, cx, cy, R);
        if (proj.z < -0.05) continue;
        const da = 0.3 + proj.z * 0.7;
        const pv = Math.sin(time * 0.04 * p.speed + p.pulse) * 0.3 + 0.7;

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, p.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,165,90,${(0.08 * da * pv).toFixed(3)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, p.size * 1.2 * da, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,165,90,${(0.8 * da * pv).toFixed(2)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, p.size * 0.5 * da, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,213,163,${(0.95 * da * pv).toFixed(2)})`;
        ctx.fill();
      }

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, R + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(200,165,90,0.12)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Scanning line
      const sa = time * 0.012;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sa) * R, cy + Math.sin(sa) * R * 0.3);
      ctx.strokeStyle = "rgba(200,165,90,0.12)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ willChange: "transform" }} />;
}

/* ─── Scramble Text ─── */
function ScrambleText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [display, setDisplay] = useState(text.replace(/./g, " "));
  const [started, setStarted] = useState(false);
  const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const totalFrames = text.length * 4 + 20;
    const interval = setInterval(() => {
      frame++;
      setDisplay(
        text.split("").map((char, i) => {
          if (char === " ") return " ";
          const revealAt = i * 3 + 8;
          if (frame >= revealAt) return char;
          if (frame >= revealAt - 8) return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          return " ";
        }).join("")
      );
      if (frame >= totalFrames) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [started, text]);

  return <span className={className}>{display}</span>;
}

/* ─── TypeWriter ─── */
function TypeWriter({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  useEffect(() => {
    const word = words[index];
    if (phase === "typing") {
      if (text.length < word.length) {
        const t = setTimeout(() => setText(word.slice(0, text.length + 1)), 80);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("deleting"), 2200);
      return () => clearTimeout(t);
    }
    if (phase === "deleting") {
      if (text.length > 0) {
        const t = setTimeout(() => setText(text.slice(0, -1)), 40);
        return () => clearTimeout(t);
      }
      setIndex((i) => (i + 1) % words.length);
      setPhase("typing");
    }
  }, [text, phase, index, words]);

  return <>{text}<span className="animate-blink text-gold">|</span></>;
}

/* ─── Counter ─── */
function Counter({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setDisplay((( 1 - Math.pow(1 - p, 3)) * value).toFixed(decimals));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, value, decimals]);

  return <span ref={ref}>{display}{suffix}</span>;
}

const stats = [
  { value: 5, decimals: 0, suffix: "+", label: "Years" },
  { value: 22, decimals: 0, suffix: "M+", label: "Documents" },
  { value: 86, decimals: 0, suffix: "%", label: "Accuracy" },
  { value: 3.87, decimals: 2, suffix: "", label: "GPA" },
];

const socials = [
  { icon: LinkedinIcon, href: "https://www.linkedin.com/in/akshitha-yarlagadda", label: "LinkedIn" },
  { icon: Mail, href: "mailto:akshithayarlagadda0607@gmail.com", label: "Email" },
  { icon: Phone, href: "tel:+15513449230", label: "Phone" },
];

const roles = ["Building RAG Systems", "Training ML Models", "Designing Search Pipelines", "Engineering AI Solutions"];

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      <HeroCanvas />

      <div className="absolute top-1/4 -left-32 w-[400px] h-[400px] bg-gold/[0.03] animate-morph1 blur-3xl pointer-events-none" style={{ willChange: "border-radius" }} />
      <div className="absolute bottom-1/4 -right-32 w-[350px] h-[350px] bg-gold/[0.025] animate-morph2 blur-3xl pointer-events-none" style={{ willChange: "border-radius" }} />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-gold/[0.04] animate-spin-slow" style={{ willChange: "transform" }} />
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[400px] h-[400px] md:w-[550px] md:h-[550px] rounded-full border border-gold/[0.03] border-dashed animate-spin-reverse" style={{ willChange: "transform" }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold/15 bg-gold/[0.04] backdrop-blur-sm text-gold text-xs font-mono tracking-wider mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          OPEN TO OPPORTUNITIES
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] mb-6 tracking-tight"
        >
          <ScrambleText text="Akshitha" className="gold-shimmer" delay={300} />
          <br />
          <ScrambleText text="Yarlagadda" className="text-white/90" delay={700} />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="text-lg md:text-xl text-neutral-500 font-light tracking-wide mb-3"
        >
          Data Scientist
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="text-sm md:text-base text-neutral-600 font-mono mb-16 h-6"
        >
          <TypeWriter words={roles} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.0 }}
          className="flex justify-center gap-6 md:gap-12 mb-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="relative">
                <div className="text-3xl md:text-4xl font-bold gold-shimmer">
                  <Counter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                </div>
                <div className="absolute -inset-4 bg-gold/[0.02] rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
              <div className="text-[10px] text-neutral-600 mt-2 uppercase tracking-[0.2em] font-mono">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2.3 }}
          className="flex items-center justify-center gap-4"
        >
          {socials.map(({ icon: Icon, href, label }) => (
            <a key={label} href={href} target={label === "Phone" ? undefined : "_blank"} rel="noopener noreferrer" aria-label={label}
              className="w-11 h-11 rounded-full border border-gold/10 bg-gold/[0.03] backdrop-blur-sm flex items-center justify-center text-neutral-500 hover:text-gold hover:border-gold/30 hover:bg-gold/[0.06] transition-all duration-500"
            >
              <Icon size={15} />
            </a>
          ))}
        </motion.div>
      </div>

      <motion.a
        href="#impact"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-neutral-700 hover:text-gold transition-colors duration-500"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          <ArrowDown size={18} strokeWidth={1.5} />
        </motion.div>
      </motion.a>
    </section>
  );
}
