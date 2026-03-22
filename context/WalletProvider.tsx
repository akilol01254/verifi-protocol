"use client";

/**
 * context/WalletProvider.tsx
 * AptosWalletAdapterProvider wrapper for VeriFi Protocol.
 */

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { type ReactNode } from "react";

interface WalletProviderProps {
  children: ReactNode;
}

const NETWORK_ENV = process.env.NEXT_PUBLIC_APTOS_NETWORK ?? "testnet";

function resolveNetwork(): Network {
  switch (NETWORK_ENV) {
    case "mainnet":
      return Network.MAINNET;
    case "devnet":
      return Network.DEVNET;
    case "local":
      return Network.LOCAL;
    default:
      return Network.TESTNET;
  }
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <AptosWalletAdapterProvider
      dappConfig={{
        network: resolveNetwork(),
        aptosApiKeys: {},
      }}
      onError={(error: unknown) => {
        if (process.env.NODE_ENV === "development") {
          // Only log in dev — wallet errors are user-facing, not actionable
          void error;
        }
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
