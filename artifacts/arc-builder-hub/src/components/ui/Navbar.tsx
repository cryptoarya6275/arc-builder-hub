// src/components/ui/Navbar.tsx
"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "Tools", href: "#tools" },
  {
    label: "Documentation",
    href: "https://docs.arc.io",
    external: true,
  },
  {
    label: "GitHub",
    href: "https://github.com/cryptoarya6275/arc-builder-hub",
    external: true,
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-arc-400/10 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-arc-400/20 group-hover:bg-arc-400/30 transition-colors duration-300" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-arc-400 to-arc-600 flex items-center justify-center shadow-lg shadow-arc-400/20">
                <svg className="w-4 h-4 text-dark-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-display text-sm font-bold text-arc-100 tracking-tight">
                ARC BUILDER HUB
              </span>
              <span className="ml-2 text-xs font-mono text-arc-400/50">v1.0</span>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-display text-dark-400 hover:text-arc-400 hover:bg-arc-400/8 transition-all duration-200 tracking-wider uppercase"
              >
                {link.label}
                {link.external && (
                  <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                )}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex flex-col items-center justify-center w-8 h-8 gap-1.5 rounded-md hover:bg-dark-800 transition-colors"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-px bg-arc-400 transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[4px]" : ""}`} />
              <span className={`block w-5 h-px bg-arc-400 transition-all duration-300 ${mobileOpen ? "opacity-0 -translate-x-2" : ""}`} />
              <span className={`block w-5 h-px bg-arc-400 transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[4px]" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 border-t border-arc-400/10 bg-dark-950/95 backdrop-blur-xl ${
          mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-display text-dark-300 hover:text-arc-400 hover:bg-arc-400/8 transition-all duration-200 tracking-wider uppercase"
            >
              {link.label}
              {link.external ? (
                <svg className="w-3.5 h-3.5 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
