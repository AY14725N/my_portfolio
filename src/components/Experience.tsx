"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap } from "lucide-react";

interface Metric {
  value: string;
  label: string;
}

const experiences = [
  {
    company: "LexisNexis Risk Solutions",
    initials: "LN",
    role: "Data Scientist",
    period: "Jun 2025 – Present",
    type: "work" as const,
    metrics: [
      { value: "22M+", label: "Docs Classified" },
      { value: "86%", label: "HRT Score" },
      { value: "3M", label: "Docs/Month" },
    ] as Metric[],
    techs: ["AWS", "OpenSearch", "LangChain", "SageMaker", "Pinecone"],
  },
  {
    company: "Optum",
    initials: "OP",
    role: "Data Scientist",
    period: "Jul 2023 – May 2025",
    type: "work" as const,
    metrics: [
      { value: "45%", label: "Faster Processing" },
      { value: "40%", label: "Faster Monitoring" },
    ] as Metric[],
    techs: ["Azure", "TensorFlow", "Spark", "PyTorch", "Airflow"],
  },
  {
    company: "Pace University",
    initials: "PU",
    role: "MS in Data Science",
    period: "Jan 2023 – Dec 2024",
    type: "education" as const,
    metrics: [{ value: "3.87", label: "GPA" }] as Metric[],
    techs: [],
  },
  {
    company: "Flipkart",
    initials: "FK",
    role: "Junior Data Scientist",
    period: "Jan 2021 – Dec 2022",
    type: "work" as const,
    metrics: [
      { value: "22%", label: "Forecast Accuracy ↑" },
      { value: "25%", label: "Reporting Efficiency ↑" },
    ] as Metric[],
    techs: ["BigQuery", "Tableau", "Scikit-Learn", "Looker"],
  },
];

export default function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="py-28 px-6">
      <div className="max-w-4xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span className="text-[10px] text-gold/60 font-mono tracking-[0.3em] uppercase">Journey</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 tracking-tight">Experience</h2>
        </motion.div>

        <div className="space-y-5">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.12 }}
              className="group"
            >
              <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 md:p-8 hover:border-gold/15 hover:bg-gold/[0.02] transition-all duration-700">
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  <div className="w-14 h-14 rounded-xl border border-gold/12 bg-gold/[0.05] flex items-center justify-center shrink-0 group-hover:border-gold/25 transition-colors duration-500">
                    {exp.type === "education" ? (
                      <GraduationCap size={20} className="text-gold/60" strokeWidth={1.5} />
                    ) : (
                      <span className="text-gold/60 font-semibold text-sm tracking-wide">{exp.initials}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-5">
                      <div>
                        <h3 className="text-white font-semibold text-lg tracking-tight">{exp.company}</h3>
                        <p className="text-neutral-500 text-sm">{exp.role}</p>
                      </div>
                      <span className="text-[11px] text-neutral-700 font-mono shrink-0">{exp.period}</span>
                    </div>

                    <div className="flex flex-wrap gap-8 mb-5">
                      {exp.metrics.map((m) => (
                        <div key={m.label}>
                          <div className="text-2xl md:text-3xl font-bold gold-shimmer">{m.value}</div>
                          <div className="text-[10px] text-neutral-700 uppercase tracking-wider mt-1">{m.label}</div>
                        </div>
                      ))}
                    </div>

                    {exp.techs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exp.techs.map((t) => (
                          <span key={t} className="text-[10px] px-2.5 py-1 rounded-full border border-gold/8 bg-gold/[0.02] text-neutral-600 font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
