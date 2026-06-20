// src/components/ui/Footer.tsx

const TOOLS_LINKS = [
  { label: "ERC20 Deployer", href: "#deployer" },
  { label: "Faucet Checker", href: "#faucet" },
  { label: "Multi-Send", href: "#multisend" },
  { label: "Token History", href: "#history" },
];

const RESOURCE_LINKS = [
  { label: "Documentation", href: "https://docs.arc.io", external: true },
  { label: "Block Explorer", href: "https://testnet.arcscan.app", external: true },
  { label: "GitHub", href: "https://github.com/cryptoarya6275/arc-builder-hub", external: true },
  { label: "Arc Network", href: "https://arc.io", external: true },
];

const NETWORK_INFO = [
  { label: "Chain ID", value: "5042002" },
  { label: "RPC", value: "rpc.testnet.arc.network" },
  { label: "Gas Token", value: "USDC" },
  { label: "Explorer", value: "testnet.arcscan.app" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-arc-400/10 bg-dark-950/80 backdrop-blur-sm">
      {/* Top gradient line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-arc-400/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arc-400 to-arc-600 flex items-center justify-center shadow-lg shadow-arc-400/20">
                <svg className="w-4 h-4 text-dark-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div>
                <div className="font-display text-sm font-bold text-arc-100 tracking-tight">
                  ARC BUILDER HUB
                </div>
                <div className="text-xs font-mono text-arc-400/40">v1.0 · Testnet</div>
              </div>
            </div>
            <p className="text-xs font-body text-dark-500 leading-relaxed max-w-[200px]">
              A modular Builder OS for Arc Layer 1. Infrastructure tooling for onchain developers.
            </p>
            <div className="mt-5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
              <span className="text-xs font-mono text-green-400/80">Arc Testnet Live</span>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-display text-xs text-arc-400/60 uppercase tracking-widest mb-4">
              Tools
            </h4>
            <ul className="space-y-2.5">
              {TOOLS_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-xs font-mono text-dark-500 hover:text-arc-400 transition-colors group"
                  >
                    <span className="w-1 h-1 rounded-full bg-arc-400/30 group-hover:bg-arc-400 transition-colors" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-xs text-arc-400/60 uppercase tracking-widest mb-4">
              Ecosystem
            </h4>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-2 text-xs font-mono text-dark-500 hover:text-arc-400 transition-colors group"
                  >
                    <span className="w-1 h-1 rounded-full bg-arc-400/30 group-hover:bg-arc-400 transition-colors" />
                    {link.label}
                    {link.external && (
                      <svg className="w-2.5 h-2.5 opacity-30 group-hover:opacity-70 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                      </svg>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Network info */}
          <div>
            <h4 className="font-display text-xs text-arc-400/60 uppercase tracking-widest mb-4">
              Network
            </h4>
            <ul className="space-y-2.5">
              {NETWORK_INFO.map(({ label, value }) => (
                <li key={label} className="flex items-start justify-between gap-3">
                  <span className="text-xs font-mono text-dark-600">{label}</span>
                  <span className="text-xs font-mono text-dark-400 text-right">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-dark-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-mono text-dark-700">
            © 2025 Arc Builder Hub · Built for Arc Testnet developers
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://docs.arc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-dark-700 hover:text-arc-400 transition-colors"
            >
              Docs
            </a>
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-dark-700 hover:text-arc-400 transition-colors"
            >
              Explorer
            </a>
            <a
              href="https://github.com/cryptoarya6275/arc-builder-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-dark-700 hover:text-arc-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
