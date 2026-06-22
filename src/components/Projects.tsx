"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ExternalLink, Tag } from "lucide-react";
import { GithubIcon } from "@/components/SocialIcons";

const projects = [
  {
    title: "E-Commerce Platform",
    description:
      "A full-featured e-commerce platform with real-time inventory, Stripe payments, and an admin dashboard. Built with Next.js App Router, Prisma ORM, and PostgreSQL.",
    tags: ["Next.js", "TypeScript", "Prisma", "Stripe", "PostgreSQL"],
    github: "https://github.com",
    live: "https://example.com",
    featured: true,
    color: "from-sky-500/20 to-blue-600/10",
  },
  {
    title: "AI Task Manager",
    description:
      "A smart task management app powered by OpenAI that auto-categorizes tasks, estimates durations, and suggests priorities using natural language input.",
    tags: ["React", "Node.js", "OpenAI API", "MongoDB", "Tailwind"],
    github: "https://github.com",
    live: "https://example.com",
    featured: true,
    color: "from-purple-500/20 to-indigo-600/10",
  },
  {
    title: "Real-time Chat App",
    description:
      "A Socket.io powered chat application with rooms, direct messages, read receipts, and file sharing. Deployed on AWS with a Redis message queue.",
    tags: ["React", "Socket.io", "Redis", "AWS", "Express"],
    github: "https://github.com",
    live: "https://example.com",
    featured: true,
    color: "from-emerald-500/20 to-teal-600/10",
  },
  {
    title: "Analytics Dashboard",
    description:
      "Interactive data visualization dashboard with Recharts, dark/light mode, exportable reports, and customizable widgets.",
    tags: ["Next.js", "Recharts", "Zustand", "Tailwind"],
    github: "https://github.com",
    live: "https://example.com",
    featured: false,
    color: "from-orange-500/20 to-amber-600/10",
  },
  {
    title: "Portfolio CMS",
    description:
      "A headless CMS built with Sanity.io for managing portfolio content. Features live preview, image optimization, and SEO automation.",
    tags: ["Next.js", "Sanity.io", "TypeScript", "Vercel"],
    github: "https://github.com",
    live: "https://example.com",
    featured: false,
    color: "from-rose-500/20 to-pink-600/10",
  },
  {
    title: "Dev Blog Platform",
    description:
      "MDX-powered blog with syntax highlighting, reading progress, newsletter subscription, and automated OG image generation.",
    tags: ["Next.js", "MDX", "Resend", "Tailwind"],
    github: "https://github.com",
    live: "https://example.com",
    featured: false,
    color: "from-cyan-500/20 to-sky-600/10",
  },
];

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? projects : projects.filter((p) => p.featured);

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-4"
        >
          <span className="text-sky-400 text-sm font-mono">03.</span>
          <span className="text-sky-400 text-sm font-mono">projects</span>
          <div className="flex-1 h-px bg-slate-800 max-w-xs" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Featured Projects
          </h2>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-sky-400 hover:text-sky-300 transition-colors font-mono border border-sky-400/30 px-4 py-1.5 rounded-full hover:bg-sky-400/10"
          >
            {showAll ? "Show less" : `Show all (${projects.length})`}
          </button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((project, i) => (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
              className={`group relative rounded-xl border border-slate-800 bg-gradient-to-br ${project.color} bg-slate-900/60 overflow-hidden hover:border-sky-400/40 transition-all duration-300 flex flex-col`}
            >
              {/* Top bar accent */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <Tag size={18} className="text-sky-400 mt-0.5" />
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="text-slate-400 hover:text-sky-400 transition-colors"
                    >
                      <GithubIcon size={16} />
                    </a>
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Live demo"
                      className="text-slate-400 hover:text-sky-400 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>

                <h3 className="text-white font-semibold text-lg mb-3 group-hover:text-sky-400 transition-colors duration-200">
                  {project.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-5">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-slate-500 font-mono hover:text-sky-400 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
