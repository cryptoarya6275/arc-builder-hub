import { Switch, Route, Router as WouterRouter } from "wouter";
import { Providers } from "@/lib/Providers";
import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/ui/Hero";
import WalletDashboard from "@/components/wallet/WalletDashboard";
import ERC20Deployer from "@/components/tools/ERC20Deployer";
import TokenHistory from "@/components/tools/TokenHistory";
import ComingSoon from "@/components/ui/ComingSoon";
import Footer from "@/components/ui/Footer";
import { useTokenHistory } from "@/lib/tokenHistory";

function Home() {
  const history = useTokenHistory();

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <div className="h-px bg-gradient-to-r from-transparent via-arc-400/20 to-transparent" />
      <WalletDashboard />
      <div className="h-px bg-gradient-to-r from-transparent via-arc-400/10 to-transparent" />
      <ERC20Deployer onTokenDeployed={history.addToken} />
      {history.tokens.length > 0 && (
        <div className="h-px bg-gradient-to-r from-transparent via-arc-400/10 to-transparent" />
      )}
      <TokenHistory
        tokens={history.tokens}
        clearHistory={history.clearHistory}
        removeToken={history.removeToken}
      />
      <div className="h-px bg-gradient-to-r from-transparent via-arc-400/10 to-transparent" />
      <ComingSoon />
      <Footer />
    </main>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
    </Switch>
  );
}

function App() {
  return (
    <Providers>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </Providers>
  );
}

export default App;
