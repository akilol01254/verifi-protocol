/**
 * lib/shelby.ts
 * Shelby Protocol SDK wrapper — typed, mock-aware, error-safe.
 */

import { AccountAddress, Network } from "@aptos-labs/ts-sdk";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlobCommitments {
  blobMerkleRoot: string;
  numChunksets: number;
  blobSize: number;
  chunkHashes: string[];
}

export interface RegisterBlobParams {
  account: string;
  blobName: string;
  blobMerkleRoot: string;
  numChunksets: number;
  expirationMicros: bigint;
  blobSize: number;
}

export interface ShelbyBlob {
  blobName: string;
  blobMerkleRoot: string;
  owner: string;
  uploadedAt: number; // unix ms
  blobSize: number;
  numChunksets: number;
  expirationMicros: bigint;
  txHash?: string;
}

export interface PutBlobParams {
  account: string;
  blobName: string;
  blobData: Uint8Array;
}

export interface ShelbyError {
  code: "COMMITMENT_FAILED" | "REGISTER_FAILED" | "PUT_FAILED" | "FETCH_FAILED" | "UNKNOWN";
  message: string;
  cause?: unknown;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SHELBY_RPC =
  process.env.NEXT_PUBLIC_SHELBY_RPC ?? "https://api.testnet.shelby.xyz/shelby";
const SHELBY_CONTRACT =
  process.env.NEXT_PUBLIC_SHELBY_CONTRACT ??
  "0xc63d6a5efb0080a6029403131715bd4971e1149f7cc099aac69bb0069b3ddbf5";
const IS_MOCK = process.env.NEXT_PUBLIC_MOCK === "true";

// Network.SHELBYNET is Shelby Protocol's testnet network identifier
const SHELBY_NETWORK = Network.SHELBYNET;

// ─── Mock helpers ─────────────────────────────────────────────────────────────

function mockMerkleRoot(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return "0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function mockTxHash(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return "0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const MOCK_BLOBS: ShelbyBlob[] = [
  {
    blobName: "audit-report-q4-2024.pdf",
    blobMerkleRoot: "0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1",
    owner: "0xmock000000000000000000000000000000000000000000000000000000000001",
    uploadedAt: Date.now() - 1000 * 60 * 60 * 48,
    blobSize: 512_000,
    numChunksets: 2,
    expirationMicros: BigInt(Date.now() + 1000 * 60 * 60 * 24 * 365) * BigInt(1000),
    txHash: "0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
  },
  {
    blobName: "financial-statement-2025.xlsx",
    blobMerkleRoot: "0xfed987cba654fed987cba654fed987cba654fed987cba654fed987cba654fed9",
    owner: "0xmock000000000000000000000000000000000000000000000000000000000001",
    uploadedAt: Date.now() - 1000 * 60 * 60 * 12,
    blobSize: 128_000,
    numChunksets: 1,
    expirationMicros: BigInt(Date.now() + 1000 * 60 * 60 * 24 * 180) * BigInt(1000),
    txHash: "0xcafebabe9876543210fedcba9876543210fedcba9876543210fedcba98765432",
  },
];

// ─── generateCommitments ──────────────────────────────────────────────────────

/**
 * Step 1: Compute blob commitments locally from a file buffer.
 * Uses Clay erasure coding provider — no data leaves the browser.
 */
export async function generateCommitments(
  fileBuffer: ArrayBuffer
): Promise<BlobCommitments> {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    const mockRoot = mockMerkleRoot();
    const numChunksets = Math.max(1, Math.ceil(fileBuffer.byteLength / 262_144));
    return {
      blobMerkleRoot: mockRoot,
      numChunksets,
      blobSize: fileBuffer.byteLength,
      chunkHashes: Array.from({ length: numChunksets }, () => mockMerkleRoot()),
    };
  }

  try {
    const { generateCommitments: sdkGenerateCommitments, createDefaultErasureCodingProvider } =
      await import("@shelby-protocol/sdk/browser");

    const provider = await createDefaultErasureCodingProvider();
    const result = await sdkGenerateCommitments(provider, new Uint8Array(fileBuffer));

    return {
      blobMerkleRoot: result.blob_merkle_root,
      numChunksets: result.chunkset_commitments.length,
      blobSize: result.raw_data_size,
      chunkHashes: result.chunkset_commitments.map((c) => c.chunkset_root),
    };
  } catch (err) {
    const shelbyErr: ShelbyError = {
      code: "COMMITMENT_FAILED",
      message: err instanceof Error ? err.message : "Failed to generate commitments",
      cause: err,
    };
    throw shelbyErr;
  }
}

// ─── createRegisterBlobPayload ────────────────────────────────────────────────

/**
 * Step 2: Build the Move transaction payload to register a blob on Aptos.
 * Uses ShelbyBlobClient.createRegisterBlobPayload (static method).
 */
export async function createRegisterBlobPayload(
  params: RegisterBlobParams
): Promise<Record<string, unknown>> {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      type: "entry_function_payload",
      function: `${SHELBY_CONTRACT}::blob_store::register_blob`,
      type_arguments: [],
      arguments: [
        params.blobName,
        params.blobMerkleRoot,
        params.numChunksets,
        params.expirationMicros.toString(),
        params.blobSize,
      ],
    };
  }

  try {
    const { ShelbyBlobClient } = await import("@shelby-protocol/sdk/browser");

    const payload = ShelbyBlobClient.createRegisterBlobPayload({
      account: AccountAddress.from(params.account),
      blobName: params.blobName,
      blobMerkleRoot: params.blobMerkleRoot,
      numChunksets: params.numChunksets,
      expirationMicros: Number(params.expirationMicros),
      blobSize: params.blobSize,
    });

    return payload as Record<string, unknown>;
  } catch (err) {
    const shelbyErr: ShelbyError = {
      code: "REGISTER_FAILED",
      message: err instanceof Error ? err.message : "Failed to create register payload",
      cause: err,
    };
    throw shelbyErr;
  }
}

// ─── putBlob ──────────────────────────────────────────────────────────────────

/**
 * Step 5: Upload raw blob data to Shelby storage after on-chain registration.
 */
export async function putBlob(params: PutBlobParams): Promise<void> {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return;
  }

  try {
    const { ShelbyRPCClient } = await import("@shelby-protocol/sdk/browser");

    const rpcClient = new ShelbyRPCClient({
      network: SHELBY_NETWORK,
      rpc: { baseUrl: SHELBY_RPC },
    });

    await rpcClient.putBlob({
      account: params.account,
      blobName: params.blobName,
      blobData: params.blobData,
    });
  } catch (err) {
    const shelbyErr: ShelbyError = {
      code: "PUT_FAILED",
      message: err instanceof Error ? err.message : "Failed to upload blob data",
      cause: err,
    };
    throw shelbyErr;
  }
}

// ─── getAccountBlobs ──────────────────────────────────────────────────────────

/**
 * Fetch all blobs registered by a given account address via Shelby indexer.
 */
export async function getAccountBlobs(account: string): Promise<ShelbyBlob[]> {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 700));
    return MOCK_BLOBS.map((b) => ({ ...b, owner: account }));
  }

  try {
    const { ShelbyBlobClient } = await import("@shelby-protocol/sdk/browser");

    const client = new ShelbyBlobClient({ network: SHELBY_NETWORK });
    const result = await client.indexer.getBlobs({
      where: { owner: { _eq: account } },
    });

    return result.blobs.map((b) => ({
      blobName: b.blob_name,
      blobMerkleRoot: b.blob_commitment,
      owner: b.owner,
      uploadedAt: Math.floor(Number(b.created_at) / 1000), // micros → ms
      blobSize: Number(b.size),
      numChunksets: Number(b.num_chunksets),
      expirationMicros: BigInt(b.expires_at),
    }));
  } catch (err) {
    const shelbyErr: ShelbyError = {
      code: "FETCH_FAILED",
      message: err instanceof Error ? err.message : "Failed to fetch account blobs",
      cause: err,
    };
    throw shelbyErr;
  }
}

// ─── getBlob ──────────────────────────────────────────────────────────────────

/**
 * Fetch metadata for a single blob by account + blobName.
 */
export async function getBlob(
  account: string,
  blobName: string
): Promise<ShelbyBlob | null> {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const found = MOCK_BLOBS.find((b) => b.blobName === blobName);
    return found ? { ...found, owner: account } : null;
  }

  try {
    const blobs = await getAccountBlobs(account);
    return blobs.find((b) => b.blobName === blobName) ?? null;
  } catch (err) {
    const shelbyErr: ShelbyError = {
      code: "FETCH_FAILED",
      message: err instanceof Error ? err.message : "Failed to fetch blob",
      cause: err,
    };
    throw shelbyErr;
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function isMockMode(): boolean {
  return IS_MOCK;
}

export function formatBlobSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatMerkleRoot(root: string, chars = 8): string {
  if (root.length <= chars * 2 + 2) return root;
  return `${root.slice(0, chars + 2)}…${root.slice(-chars)}`;
}

export function generateBlobName(fileName: string): string {
  const timestamp = Date.now();
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
  return `${timestamp}_${sanitized}`;
}

export function getMockTxHash(): string {
  return mockTxHash();
}

export { SHELBY_CONTRACT, SHELBY_RPC };
