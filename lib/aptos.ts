/**
 * lib/aptos.ts
 * Aptos client configuration for VeriFi Protocol.
 */

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TransactionResult {
  hash: string;
  success: boolean;
  vmStatus: string;
  gasUsed: number;
}

export interface AptosError {
  code: "TX_FAILED" | "WAIT_FAILED" | "QUERY_FAILED" | "UNKNOWN";
  message: string;
  cause?: unknown;
}

// ─── Config ───────────────────────────────────────────────────────────────────

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

// Singleton client — instantiated once per module load.
let _aptosClient: Aptos | null = null;

export function getAptosClient(): Aptos {
  if (_aptosClient) return _aptosClient;
  const config = new AptosConfig({ network: resolveNetwork() });
  _aptosClient = new Aptos(config);
  return _aptosClient;
}

// ─── waitForTransaction ───────────────────────────────────────────────────────

/**
 * Step 4: Poll until the submitted transaction is finalized on-chain.
 * Returns a typed result summary.
 */
export async function waitForTransaction(hash: string): Promise<TransactionResult> {
  const isMock = process.env.NEXT_PUBLIC_MOCK === "true";

  if (isMock) {
    await new Promise((r) => setTimeout(r, 1200));
    return {
      hash,
      success: true,
      vmStatus: "Executed successfully",
      gasUsed: 42,
    };
  }

  try {
    const client = getAptosClient();
    const tx = await client.waitForTransaction({ transactionHash: hash });
    return {
      hash: tx.hash,
      success: tx.success,
      vmStatus: tx.vm_status,
      gasUsed: Number(tx.gas_used),
    };
  } catch (err) {
    const aptosErr: AptosError = {
      code: "WAIT_FAILED",
      message: err instanceof Error ? err.message : "Transaction wait failed",
      cause: err,
    };
    throw aptosErr;
  }
}

// ─── getAccountBalance ────────────────────────────────────────────────────────

export async function getAccountBalance(address: string): Promise<bigint> {
  const isMock = process.env.NEXT_PUBLIC_MOCK === "true";

  if (isMock) {
    await new Promise((r) => setTimeout(r, 300));
    return BigInt(100_000_000); // 1 APT in octas
  }

  try {
    const client = getAptosClient();
    const balance = await client.getAccountAPTAmount({ accountAddress: address });
    return BigInt(balance);
  } catch (err) {
    const aptosErr: AptosError = {
      code: "QUERY_FAILED",
      message: err instanceof Error ? err.message : "Failed to fetch balance",
      cause: err,
    };
    throw aptosErr;
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function formatAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function octasToApt(octas: bigint): string {
  const apt = Number(octas) / 1e8;
  return apt.toFixed(4);
}

export function explorerUrl(hashOrAddress: string, type: "txn" | "account" = "txn"): string {
  const base = "https://explorer.aptoslabs.com";
  const network = NETWORK_ENV === "mainnet" ? "" : `?network=${NETWORK_ENV}`;
  return type === "txn"
    ? `${base}/txn/${hashOrAddress}${network}`
    : `${base}/account/${hashOrAddress}${network}`;
}
