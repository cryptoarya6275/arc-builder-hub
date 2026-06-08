// src/components/ui/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-arc-400/10 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-arc-400 to-arc-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-dark-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="font-display text-xs text-dark-500 tracking-wide">
              ARC BUILDER HUB · TESTNET TOOLKIT
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://docs.arc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-dark-600 hover:text-arc-400 transition-colors"
            >
              Docs
            </a>
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-dark-600 hover:text-arc-400 transition-colors"
            >
              Explorer
            </a>
            <span className="text-xs font-mono text-dark-700">
              Chain ID: 5042002
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-dark-800/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs font-mono text-dark-700">
            Built for Arc Testnet builders · Use at your own risk
          </p>
          <p className="text-xs font-mono text-dark-700">
            RPC: rpc.testnet.arc.network
          </p>
        </div>
      </div>
    </footer>
  );
}
