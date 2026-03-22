"use client";

/**
 * components/ProofList.tsx
 * Lists all blobs registered by the connected account via getAccountBlobs().
 */

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  getAccountBlobs,
  formatBlobSize,
  formatMerkleRoot,
  type ShelbyBlob,
} from "@/lib/shelby";
import { MerkleCertificate } from "@/components/MerkleCertificate";

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; blobs: ShelbyBlob[] };

export function ProofList() {
  const { account: walletAccount } = useWallet();
  const account = walletAccount?.address.toString() ?? "";
  const [fetchState, setFetchState] = useState<FetchState>({ status: "loading" });
  const [selected, setSelected] = useState<ShelbyBlob | null>(null);

  const load = useCallback(async () => {
    setFetchState({ status: "loading" });
    try {
      const blobs = await getAccountBlobs(account);
      setFetchState({ status: "success", blobs });
    } catch (err) {
      setFetchState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to fetch records",
      });
    }
  }, [account]);

  useEffect(() => {
    void load();
  }, [load]);

  if (fetchState.status === "loading") return <ProofListSkeleton />;

  if (fetchState.status === "error") {
    return (
      <div className="card flex flex-col items-center gap-4 py-12 text-center">
        <span className="text-3xl">⚠️</span>
        <div>
          <p className="text-shelby-error font-medium">Failed to load records</p>
          <p className="text-shelby-text-muted text-sm mt-1">{fetchState.message}</p>
        </div>
        <button onClick={() => void load()} className="btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  const { blobs } = fetchState;

  if (blobs.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 py-16 text-center border-dashed">
        <span className="text-4xl">📭</span>
        <div>
          <p className="font-display text-shelby-text text-lg">No proofs yet</p>
          <p className="text-shelby-text-muted text-sm mt-1">
            Upload your first document to create an on-chain proof.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-shelby-text">
          My Records
          <span className="ml-2 badge-muted text-xs font-mono">{blobs.length}</span>
        </h2>
        <button onClick={() => void load()} className="btn-ghost text-xs">
          ↻ Refresh
        </button>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <MerkleCertificate blob={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {blobs.map((blob) => (
          <BlobRow
            key={blob.blobName}
            blob={blob}
            onClick={() => setSelected(blob)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── BlobRow ──────────────────────────────────────────────────────────────────

function BlobRow({ blob, onClick }: { blob: ShelbyBlob; onClick: () => void }) {
  const uploadedDate = new Date(blob.uploadedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const expiresDate = new Date(
    Number(blob.expirationMicros / BigInt(1000))
  ).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const isExpired = Number(blob.expirationMicros / BigInt(1000)) < Date.now();

  return (
    <button
      onClick={onClick}
      className="card-hover w-full text-left flex flex-col sm:flex-row sm:items-center gap-4 p-4 group"
      aria-label={`View certificate for ${blob.blobName}`}
    >
      <div className="w-10 h-10 rounded-card bg-shelby-accent/10 border border-shelby-accent/20 flex items-center justify-center shrink-0">
        <span className="text-shelby-accent text-base">📄</span>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-shelby-text text-sm font-medium truncate">{blob.blobName}</p>
        <p className="data-value truncate">{formatMerkleRoot(blob.blobMerkleRoot)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
        <span className="data-value">{formatBlobSize(blob.blobSize)}</span>
        <span className="text-shelby-text-muted">{uploadedDate}</span>
        <span className={isExpired ? "badge-error" : "badge-success"}>
          {isExpired ? "Expired" : `Expires ${expiresDate}`}
        </span>
        <span className="text-shelby-accent opacity-0 group-hover:opacity-100 transition-opacity duration-shelby ease-shelby">
          View →
        </span>
      </div>
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProofListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-7 w-36 rounded-card" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card flex items-center gap-4 p-4">
            <div className="skeleton w-10 h-10 rounded-card shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-48 rounded-pill" />
              <div className="skeleton h-3 w-64 rounded-pill" />
            </div>
            <div className="skeleton h-5 w-20 rounded-pill" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProofList;
