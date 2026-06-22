"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Code2, Lightbulb, Rocket } from "lucide-react";

const highlights = [
  {
    icon: Code2,
    title: "Clean Code",
    desc: "I write maintainable, well-structured code following best practices.",
  },
  {
    icon: Lightbulb,
    title: "Problem Solver",
    desc: "I enjoy breaking down complex problems and crafting elegant solutions.",
  },
  {
    icon: Rocket,
    title: "Fast Delivery",
    desc: "I ship production-ready features without sacrificing quality.",
  },
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-4"
        >
          <span className="text-sky-400 text-sm font-mono">01.</span>
          <span className="text-sky-400 text-sm font-mono">about_me</span>
          <div className="flex-1 h-px bg-slate-800 max-w-xs" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              About Me
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                I&apos;m a passionate Full Stack Developer with a love for
                crafting digital experiences that are both beautiful and
                functional. With a strong foundation in modern web technologies,
                I bring ideas to life through clean, efficient code.
              </p>
              <p>
                When I&apos;m not coding, you&apos;ll find me exploring new
                technologies, contributing to open source projects, or
                mentoring aspiring developers. I believe in continuous learning
                and pushing the boundaries of what&apos;s possible on the web.
              </p>
              <p>
                I&apos;m currently open to freelance projects and full-time
                opportunities where I can make a meaningful impact.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"].map(
                (tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-xs rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-400 font-mono"
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </motion.div>

          {/* Avatar card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-400/30 to-blue-600/20 blur-xl" />
              <div className="relative w-full h-full rounded-2xl border-2 border-sky-400/30 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur flex items-center justify-center overflow-hidden">
                {/* Placeholder avatar — replace with <Image> when you have a photo */}
                <div className="text-8xl select-none">👩‍💻</div>
                {/* Decorative corners */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-sky-400/60 rounded-tl" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-sky-400/60 rounded-tr" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-sky-400/60 rounded-bl" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-sky-400/60 rounded-br" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {highlights.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-sky-400/40 hover:bg-sky-400/5 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-400/10 flex items-center justify-center mb-4 group-hover:bg-sky-400/20 transition-colors">
                <Icon size={18} className="text-sky-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
