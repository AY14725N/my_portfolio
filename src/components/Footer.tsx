"use client";

import { Mail } from "lucide-react";
import { LinkedinIcon } from "@/components/SocialIcons";

export default function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-white/[0.03]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <p className="text-neutral-800 text-[11px] font-mono tracking-wider">AKSHITHA YARLAGADDA</p>
        <div className="flex items-center gap-5">
          {[
            { icon: LinkedinIcon, href: "https://www.linkedin.com/in/akshitha-yarlagadda", label: "LinkedIn" },
            { icon: Mail, href: "mailto:akshithayarlagadda0607@gmail.com", label: "Email" },
          ].map(({ icon: Icon, href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
              className="text-neutral-800 hover:text-gold transition-colors duration-500">
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
