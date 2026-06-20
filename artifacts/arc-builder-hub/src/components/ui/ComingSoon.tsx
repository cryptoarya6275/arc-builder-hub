// src/components/ui/ComingSoon.tsx
"use client";

const COMING_SOON_TOOLS = [
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    name: "Multi-Send",
    description: "Batch send tokens to hundreds of addresses in a single transaction. CSV import supported.",
    tags: ["Batch", "CSV", "Gas-efficient"],
  },
];

export default function ComingSoon() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-px h-8 bg-arc-400/40" />
            <span className="font-display text-xs text-arc-400/70 uppercase tracking-widest">
              03 / Roadmap
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-arc-50">
            Coming Soon
          </h2>
          <p className="text-dark-400 mt-2">
            More tools are being built for the Arc builder community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {COMING_SOON_TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="arc-card p-6 group hover:border-arc-400/25 transition-all duration-300 relative overflow-hidden"
            >
              {/* Coming soon badge */}
              <div className="absolute top-3 right-3">
                <span className="arc-badge bg-dark-800 text-dark-500 border border-dark-700 text-xs font-mono">
                  Coming Soon
                </span>
              </div>

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-dark-400 group-hover:text-arc-400 group-hover:bg-arc-400/10 transition-all duration-300 mb-4">
                {tool.icon}
              </div>

              {/* Content */}
              <h3 className="font-display font-bold text-arc-100 mb-2">{tool.name}</h3>
              <p className="text-sm text-dark-400 leading-relaxed mb-4">{tool.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono text-dark-500 border border-dark-700 rounded px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-arc-400/0 to-arc-400/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 arc-card p-6 text-center bg-arc-400/5 border-arc-400/15">
          <p className="text-dark-400 text-sm mb-4">
            Have a tool idea? Help build the Arc ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://docs.arc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="arc-button-secondary text-sm py-2 px-6"
            >
              Read the Docs
            </a>
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
              className="arc-button-secondary text-sm py-2 px-6"
            >
              Block Explorer ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
