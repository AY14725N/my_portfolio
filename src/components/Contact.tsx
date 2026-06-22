"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { LinkedinIcon } from "@/components/SocialIcons";

const contacts = [
  { icon: Mail, label: "Email", value: "akshithayarlagadda0607@gmail.com", href: "mailto:akshithayarlagadda0607@gmail.com" },
  { icon: Phone, label: "Phone", value: "(551) 344-9230", href: "tel:+15513449230" },
  { icon: LinkedinIcon, label: "LinkedIn", value: "LinkedIn Profile", href: "https://www.linkedin.com/in/akshitha-yarlagadda" },
  { icon: MapPin, label: "Location", value: "Jersey City, NJ", href: undefined },
];

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="py-28 px-6">
      <div className="max-w-2xl mx-auto text-center" ref={ref}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <span className="text-[10px] text-gold/60 font-mono tracking-[0.3em] uppercase">Connect</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-14 tracking-tight">Get In Touch</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contacts.map(({ icon: Icon, label, value, href }, i) => {
            const card = (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-5 flex items-center gap-4 hover:border-gold/15 hover:bg-gold/[0.02] transition-all duration-700 group"
              >
                <div className="w-10 h-10 rounded-lg border border-gold/10 bg-gold/[0.04] flex items-center justify-center shrink-0 group-hover:border-gold/25 transition-colors duration-500">
                  <Icon size={16} className="text-gold/50 group-hover:text-gold transition-colors duration-500" strokeWidth={1.5} />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[10px] text-neutral-700 uppercase tracking-wider">{label}</div>
                  <div className="text-sm text-neutral-400 group-hover:text-white transition-colors duration-500 truncate">{value}</div>
                </div>
              </motion.div>
            );

            return href ? (
              <a key={label} href={href} target={label === "LinkedIn" ? "_blank" : undefined} rel="noopener noreferrer">{card}</a>
            ) : (
              <div key={label}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
