"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const skills = [
  { name: "GenAI & LLMs", value: 90 },
  { name: "Search & Retrieval", value: 92 },
  { name: "Machine Learning", value: 88 },
  { name: "Data Engineering", value: 85 },
  { name: "Cloud Platforms", value: 87 },
  { name: "Visualization", value: 82 },
];

const techsRow1 = [
  "Python", "SQL", "GPT-4", "OpenAI API", "LangChain", "Prompt Engineering",
  "ElasticSearch", "OpenSearch", "Pinecone", "Vector Databases", "Semantic Search",
  "BM25", "TensorFlow", "PyTorch", "XGBoost", "Scikit-Learn", "LightGBM",
  "CatBoost", "Pandas", "NumPy", "Apache Spark", "Airflow", "DBT", "MLflow",
  "Docker", "Kubernetes",
];

const techsRow2 = [
  "AWS", "Azure", "GCP", "SageMaker", "S3", "Lambda", "BigQuery", "PostgreSQL",
  "MySQL", "Tableau", "Power BI", "Plotly", "Looker", "Matplotlib", "Seaborn",
  "Keras", "Weights & Biases", "Optuna", "CI/CD", "Git", "Azure Data Factory",
  "CloudWatch", "Dataflow", "Azure Synapse", "Feature Engineering",
  "Predictive Modeling",
];

function RadarChart() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const cx = 250;
  const cy = 250;
  const maxR = 140;
  const angleStep = (2 * Math.PI) / skills.length;
  const startAngle = -Math.PI / 2;

  const gridPaths = [25, 50, 75, 100].map((level) => {
    const r = (level / 100) * maxR;
    return skills
      .map((_, i) => {
        const a = startAngle + i * angleStep;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      })
      .join(" ");
  });

  const dataPathD =
    skills
      .map((s, i) => {
        const r = (s.value / 100) * maxR;
        const a = startAngle + i * angleStep;
        return `${i === 0 ? "M" : "L"}${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
      })
      .join(" ") + " Z";

  const points = skills.map((s, i) => {
    const r = (s.value / 100) * maxR;
    const a = startAngle + i * angleStep;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

  const labels = skills.map((s, i) => {
    const a = startAngle + i * angleStep;
    const lr = maxR + 35;
    const x = cx + lr * Math.cos(a);
    const y = cy + lr * Math.sin(a);
    const cosA = Math.cos(a);
    const textAnchor: "start" | "middle" | "end" =
      cosA > 0.1 ? "start" : cosA < -0.1 ? "end" : "middle";
    return { x, y, name: s.name, value: s.value, textAnchor };
  });

  return (
    <div ref={ref} className="flex justify-center mb-4">
      <svg viewBox="0 0 500 500" className="w-full max-w-lg">
        {gridPaths.map((pts, i) => (
          <polygon key={i} points={pts} fill="none" stroke="rgba(200,165,90,0.06)" strokeWidth="1" />
        ))}

        {skills.map((_, i) => {
          const a = startAngle + i * angleStep;
          return (
            <line key={i} x1={cx} y1={cy} x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)}
              stroke="rgba(200,165,90,0.06)" strokeWidth="1" />
          );
        })}

        <motion.path
          d={dataPathD} fill="rgba(200,165,90,0.08)" stroke="none"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 2 }}
        />

        <motion.path
          d={dataPathD} fill="none" stroke="#c8a55a" strokeWidth="1.5"
          strokeLinejoin="round" strokeOpacity={0.6}
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />

        {points.map((p, i) => (
          <motion.circle key={i} cx={p.x} cy={p.y} r="3" fill="#c8a55a" fillOpacity={0.7}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 2.3 + i * 0.1 }}
          />
        ))}

        {labels.map((l, i) => (
          <g key={i}>
            <motion.text
              x={l.x} y={l.y - 6} textAnchor={l.textAnchor} dominantBaseline="middle"
              fill="#737373" fontSize="10" fontFamily="monospace"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              {l.name}
            </motion.text>
            <motion.text
              x={l.x} y={l.y + 10} textAnchor={l.textAnchor} dominantBaseline="middle"
              fill="#c8a55a" fontSize="11" fontFamily="monospace" fontWeight="600"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 2.5 + i * 0.1 }}
            >
              {l.value}%
            </motion.text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="py-28 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-[10px] text-gold/60 font-mono tracking-[0.3em] uppercase">Expertise</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 tracking-tight">Skills</h2>
        </motion.div>

        <RadarChart />

        <div className="mt-20 space-y-3">
          <div className="flex w-max animate-marquee">
            {[...techsRow1, ...techsRow1].map((tech, i) => (
              <span key={`a-${i}`}
                className="mx-1.5 px-4 py-2 rounded-full border border-gold/8 bg-gold/[0.02] text-[11px] text-neutral-600 whitespace-nowrap font-mono hover:text-gold/80 hover:border-gold/20 transition-colors duration-500 cursor-default">
                {tech}
              </span>
            ))}
          </div>
          <div className="flex w-max animate-marquee-reverse">
            {[...techsRow2, ...techsRow2].map((tech, i) => (
              <span key={`b-${i}`}
                className="mx-1.5 px-4 py-2 rounded-full border border-gold/8 bg-gold/[0.02] text-[11px] text-neutral-600 whitespace-nowrap font-mono hover:text-gold/80 hover:border-gold/20 transition-colors duration-500 cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
