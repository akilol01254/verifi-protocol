"use client";

/**
 * components/WalletButton.tsx
 * Connect / disconnect wallet button using Aptos wallet adapter.
 */

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import { formatAddress } from "@/lib/aptos";

interface WalletButtonProps {
  size?: "sm" | "md" | "lg";
}

export function WalletButton({ size = "md" }: WalletButtonProps) {
  const { connected, account, connect, disconnect, wallets, isLoading } = useWallet();
  const [connecting, setConnecting] = useState(false);

  // Reset local connecting flag once the adapter finishes (success or failure)
  useEffect(() => {
    if (!isLoading) setConnecting(false);
  }, [isLoading]);

  const sizeClasses =
    size === "lg"
      ? "px-8 py-3 text-base"
      : size === "sm"
      ? "px-4 py-1.5 text-xs"
      : "px-6 py-2.5 text-sm";

  // Only show spinner during an active user-initiated connect attempt
  const isBusy = connecting && isLoading;

  if (connected && account) {
    return (
      <button
        onClick={() => void disconnect()}
        className={`btn-secondary ${sizeClasses}`}
        aria-label="Disconnect wallet"
      >
        <span className="w-2 h-2 rounded-full bg-shelby-success" />
        {formatAddress(account.address.toString())}
      </button>
    );
  }

  const firstWallet = wallets?.[0];

  if (!firstWallet) {
    return (
      <a
        href="https://petra.app"
        target="_blank"
        rel="noreferrer"
        className={`btn-primary ${sizeClasses}`}
      >
        Install Petra Wallet
      </a>
    );
  }

  return (
    <button
      onClick={() => {
        setConnecting(true);
        connect(firstWallet.name);
      }}
      disabled={isBusy}
      className={`btn-primary ${sizeClasses}`}
      aria-label="Connect wallet"
    >
      {isBusy ? (
        <>
          <span className="w-3 h-3 rounded-full border-2 border-shelby-bg border-t-transparent animate-spin" />
          Connecting…
        </>
      ) : (
        "Connect Wallet"
      )}
    </button>
  );
}

export default WalletButton;
