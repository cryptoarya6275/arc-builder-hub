// src/components/ui/ComingSoon.tsx
"use client";

const COMING_SOON_TOOLS = [
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    name: "Token Analytics",
    description: "Deep onchain intelligence for deployed tokens on Arc Layer 1.",
    features: [
      "Analyze onchain token activity",
      "View holder distribution",
      "Track transfer volume",
      "Monitor token supply and key metrics",
    ],
    accentColor: "from-arc-400/20 to-violet-500/10",
    borderHover: "hover:border-arc-400/40",
    iconHover: "group-hover:text-arc-400 group-hover:bg-arc-400/10",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M6 8h.01M6 11h.01M9 8h6M9 11h6" />
      </svg>
    ),
    name: "Portfolio Tracker",
    description: "Unified asset dashboard for monitoring wallet positions across Arc testnet.",
    features: [
      "Track wallet assets",
      "View token balances",
      "Monitor portfolio activity",
      "Unified asset dashboard",
    ],
    accentColor: "from-violet-500/15 to-arc-400/10",
    borderHover: "hover:border-violet-400/40",
    iconHover: "group-hover:text-violet-400 group-hover:bg-violet-400/10",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16V4m0 0L3 8m4-4l4 4" />
        <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
    name: "Token Swap",
    description: "Stablecoin-native token swaps with wallet-integrated execution on Arc Layer 1.",
    features: [
      "Swap supported tokens directly within the application",
      "Stablecoin-native swap experience",
      "Wallet-integrated execution",
      "Fast and intuitive interface",
    ],
    accentColor: "from-blue-500/15 to-arc-400/10",
    borderHover: "hover:border-blue-400/40",
    iconHover: "group-hover:text-blue-400 group-hover:bg-blue-400/10",
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
            More infrastructure modules are being built for the Arc builder community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {COMING_SOON_TOOLS.map((tool) => (
            <div
              key={tool.name}
              className={`arc-card p-6 group ${tool.borderHover} transition-all duration-300 relative overflow-hidden cursor-default`}
            >
              {/* Glassmorphism hover overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              {/* Coming soon badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="arc-badge bg-dark-800 text-dark-500 border border-dark-700 text-xs font-mono">
                  Coming Soon
                </span>
              </div>

              {/* Icon */}
              <div className={`relative z-10 w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-400 ${tool.iconHover} transition-all duration-300 mb-4 group-hover:border-transparent`}>
                {tool.icon}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-display font-bold text-arc-100 mb-2">{tool.name}</h3>
                <p className="text-sm text-dark-400 leading-relaxed mb-4">{tool.description}</p>

                {/* Feature list */}
                <ul className="space-y-1.5">
                  {tool.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs text-dark-500 font-mono group-hover:text-dark-400 transition-colors duration-300">
                      <span className="mt-0.5 w-1 h-1 rounded-full bg-dark-600 group-hover:bg-arc-400/50 flex-shrink-0 transition-colors duration-300" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom shimmer line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-arc-400/0 to-transparent group-hover:via-arc-400/30 transition-all duration-500" />
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
