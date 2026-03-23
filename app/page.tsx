"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import WalletButton from "@/components/WalletButton";
import UploadProof from "@/components/UploadProof";
import ProofList from "@/components/ProofList";
import AnimatedSection from "@/components/AnimatedSection";
import AnimatedCounter from "@/components/AnimatedCounter";

const MODULES = [
  "TaxProof",
  "TradeProof",
  "AlertArchive",
  "ReportVault",
  "ContractDrop",
] as const;

type Module = (typeof MODULES)[number];

const STATS = [
  {
    label: "Global Status",
    title: "Total Proofs",
    value: "31,204",
    icon: "account_balance_wallet",
  },
  {
    label: "Network Load",
    title: "Storage Used",
    value: "1.4 TB",
    icon: "cloud_done",
  },
  {
    label: "Verification",
    title: "Merkle Certs",
    value: "12,847",
    icon: "verified",
  },
  {
    label: "Optimization",
    title: "Avg Package Size",
    value: "44.2 MB",
    icon: "package_2",
  },
];

export default function Home() {
  const { connected } = useWallet();
  const [activeModule, setActiveModule] = useState<Module>("TaxProof");

  return (
    <div className="bg-background text-on-surface min-h-screen">

      {/* ── NAV ── */}
      <header className="fixed top-0 left-0 right-0 z-50
        bg-background/95 backdrop-blur-md
        border-b border-outline-variant/10">
        <nav className="flex justify-between items-center
          w-full px-6 py-4 max-w-screen-2xl mx-auto">
          <span className="text-2xl font-headline font-bold
            text-on-surface tracking-tight">
            VeriFi Protocol
          </span>
          <div className="flex items-center gap-4">
            {process.env.NEXT_PUBLIC_MOCK === "true" && (
              <div className="hidden md:flex items-center px-4 py-1.5
                rounded-full border border-primary/20
                bg-surface-container-low">
                <span className="text-xs font-label uppercase
                  tracking-widest text-primary">
                  Mock Mode
                </span>
              </div>
            )}
            <WalletButton />
          </div>
        </nav>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-screen-xl mx-auto">

        {/* ── HERO ── */}
        <section className="relative mb-24">
          <div className="absolute -top-48 -left-24 w-96 h-96
            bg-primary/10 rounded-full blur-[120px]
            pointer-events-none" />
          <div className="absolute top-0 -right-24 w-64 h-64
            bg-secondary-container/10 rounded-full blur-[100px]
            pointer-events-none" />
          <div className="max-w-4xl">
            <AnimatedSection delay={0}>
              <h1 className="text-6xl md:text-8xl font-headline
                font-bold text-on-surface leading-[1.1] mb-8">
                Financial Proof <br />
                <span className="italic text-primary">of Record</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <p className="text-xl md:text-2xl font-body
                text-on-surface/70 leading-relaxed max-w-2xl mb-12">
                Anchor your financial documents immutably on Aptos.
                Every upload generates a cryptographic Merkle proof —
                tamper-evident, verifiable forever.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="flex flex-wrap gap-4">
                <button className="bg-primary-container
                  text-on-primary-container px-8 py-4 rounded-full
                  font-bold text-lg hover:brightness-110
                  active:scale-95 transition-all duration-300
                  shadow-xl shadow-primary/10">
                  Secure My Records
                </button>
                <button className="border border-outline-variant/30
                  text-on-surface px-8 py-4 rounded-full font-bold
                  text-lg hover:bg-on-surface/5 active:scale-95
                  transition-all duration-300">
                  View Public Ledger
                </button>
              </div>
              <p className="mt-8 text-xs font-mono
                text-on-surface/30 tracking-widest uppercase">
                Built by{" "}
                <a
                  href="https://x.com/YoneCode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary/60 hover:text-primary transition-colors"
                >
                  @YoneCode
                </a>
                {" "}·{"  "}Powered by{" "}
                <a
                  href="https://docs.shelby.xyz/protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary/60 hover:text-primary transition-colors"
                >
                  Shelby Protocol
                </a>
                {" "}×{" "}
                <a
                  href="https://explorer.aptoslabs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary/60 hover:text-primary transition-colors"
                >
                  Aptos
                </a>
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="relative mb-16 overflow-hidden
          border-y border-pink/10 py-3">
          <div className="flex w-max animate-marquee">
            {[0, 1].map((i) => (
              <span
                key={i}
                className="flex shrink-0 gap-8 pr-8
                  font-mono text-xs uppercase text-on-surface/30
                  whitespace-nowrap"
              >
                {[
                  "SHELBY PROTOCOL",
                  "APTOS L1",
                  "CLAY CODES",
                  "MERKLE PROOF",
                  "TAMPER-EVIDENT",
                  "ERASURE CODING",
                  "10+6 REDUNDANCY",
                  "FINANCIAL TRUTH",
                  "ZERO TRUST",
                  "ON-CHAIN RECORD",
                ].map((word) => (
                  <span key={word}>
                    {word}
                    <span className="ml-8 text-primary/30">·</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ── STATS ── */}
        <section className="grid grid-cols-1 md:grid-cols-2
          lg:grid-cols-4 gap-6 mb-8">
          {STATS.map((stat, i) => (
            <AnimatedSection key={stat.title} delay={0.1 * i}>
              <div className="ghost-border p-8 rounded-DEFAULT
                bg-surface-container-low flex flex-col
                justify-between min-h-[160px]
                hover:bg-surface-container
                transition-colors duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-primary">
                    {stat.icon}
                  </span>
                  <span className="text-xs font-label uppercase
                    text-on-surface/40 tracking-widest">
                    {stat.label}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-body text-on-surface/60 mb-1">
                    {stat.title}
                  </h3>
                  <AnimatedCounter
                    value={stat.value}
                    className="text-4xl font-mono font-bold text-primary"
                  />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </section>

        {/* ── MODULE TABS ── */}
        <section className="flex flex-wrap gap-4 mb-16 overflow-x-auto pb-4">
          {MODULES.map((mod) => (
            <motion.button
              key={mod}
              onClick={() => setActiveModule(mod)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-6 py-3 rounded-full font-label
                text-sm font-semibold transition-all
                ${
                  activeModule === mod
                    ? "active-tab text-primary"
                    : "ghost-border text-on-surface/60 hover:text-primary"
                }`}
            >
              {mod}
            </motion.button>
          ))}
        </section>

        {/* ── MAIN CONTENT ── */}
        {connected ? (
          <section className="grid grid-cols-1 lg:grid-cols-2
            gap-8 items-stretch">
            <AnimatedSection delay={0.2}>
              <UploadProof activeModule={activeModule} />
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <ProofList />
            </AnimatedSection>
          </section>
        ) : (
          <section className="ghost-border rounded-DEFAULT
            bg-surface-container-low p-16 flex flex-col
            items-center justify-center text-center min-h-[400px]">
            <div className="mb-6 w-20 h-20 rounded-full
              bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl">
                lock
              </span>
            </div>
            <h3 className="text-2xl font-headline font-bold mb-4">
              Connect your wallet to get started
            </h3>
            <p className="text-on-surface/60 font-body mb-8 max-w-sm">
              Use any Aptos-compatible wallet to upload and verify
              financial documents on Shelby Protocol.
            </p>
            <WalletButton />
          </section>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="mt-24 py-12
        border-t border-outline-variant/10
        bg-surface-container-lowest">
        <div className="max-w-screen-xl mx-auto px-6
          flex flex-col md:flex-row justify-between
          items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-headline font-bold
              text-on-surface mb-2">
              VeriFi Protocol
            </span>
            <p className="text-sm font-body text-on-surface/40">
              Sovereign Financial Infrastructure for the Web3 Era.
            </p>
          </div>
          <div className="flex gap-8 text-sm font-label
            uppercase tracking-widest text-on-surface/60">
            <a
              href="https://docs.shelby.xyz/protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Shelby Docs
            </a>
            <a
              href="https://x.com/shelbyserves"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Shelby X
            </a>
            <a
              href="https://explorer.shelby.xyz/shelbynet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Explorer
            </a>
            <a
              href="https://x.com/YoneCode"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built by @YoneCode
            </a>
          </div>
        </div>
        <div className="text-center mt-12">
          <p className="text-[10px] font-mono uppercase
            tracking-[0.3em] text-on-surface/20">
            © 2026 VeriFi Protocol. Built on Shelby × Aptos.
          </p>
        </div>
      </footer>
    </div>
  );
}
