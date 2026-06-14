// src/app/page.tsx
import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/ui/Hero";
import WalletDashboard from "@/components/wallet/WalletDashboard";
import ERC20Deployer from "@/components/tools/ERC20Deployer";
import ComingSoon from "@/components/ui/ComingSoon";
import Footer from "@/components/ui/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <Hero />

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-arc-400/20 to-transparent" />

      {/* Wallet Dashboard */}
      <WalletDashboard />

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-arc-400/10 to-transparent" />

      {/* ERC20 Deployer */}
      <ERC20Deployer />

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-arc-400/10 to-transparent" />

      {/* Coming Soon */}
      <ComingSoon />

      {/* Footer */}
      <Footer />
    </main>
  );
}
