"use client";

/**
 * components/UploadProof.tsx
 * 5-step Shelby blob upload flow.
 * Steps: 1=Select → 2=Commit → 3=Register → 4=Confirm → 5=Store → done
 */

import { useCallback, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  generateCommitments,
  createRegisterBlobPayload,
  putBlob,
  generateBlobName,
  formatBlobSize,
  formatMerkleRoot,
  getMockTxHash,
  type BlobCommitments,
} from "@/lib/shelby";
import { waitForTransaction, explorerUrl } from "@/lib/aptos";
import { StepIndicator } from "@/components/StepIndicator";
import { FileDropZone } from "@/components/FileDropZone";

interface UploadProofProps {
  activeModule: string;
  onSuccess?: () => void;
}

interface UploadState {
  step: 1 | 2 | 3 | 4 | 5;
  file: File | null;
  blobName: string;
  commitments: BlobCommitments | null;
  txHash: string;
  error: string | null;
  loading: boolean;
}

const INITIAL: UploadState = {
  step: 1,
  file: null,
  blobName: "",
  commitments: null,
  txHash: "",
  error: null,
  loading: false,
};

export function UploadProof({ activeModule, onSuccess }: UploadProofProps) {
  const { signAndSubmitTransaction, account: walletAccount } = useWallet();
  const account = walletAccount?.address.toString() ?? "";
  const [state, setState] = useState<UploadState>(INITIAL);

  const set = useCallback(
    (patch: Partial<UploadState>) =>
      setState((prev) => ({ ...prev, ...patch })),
    []
  );

  // ── Step 2: Generate commitments ──────────────────────────────────────────
  async function handleCommit() {
    if (!state.file) return;
    set({ loading: true, error: null, step: 2 });
    try {
      const buffer = await state.file.arrayBuffer();
      const commitments = await generateCommitments(buffer);
      const blobName = generateBlobName(state.file.name);
      set({ commitments, blobName, step: 3, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Commitment generation failed",
        loading: false,
        step: 1,
      });
    }
  }

  // ── Step 3 → 4: Register on-chain ────────────────────────────────────────
  async function handleRegister() {
    if (!state.commitments) return;
    set({ loading: true, error: null, step: 3 });
    try {
      const expirationMicros =
        BigInt(Date.now() + 365 * 24 * 60 * 60 * 1000) * BigInt(1000);
      const payload = await createRegisterBlobPayload({
        account,
        blobName: state.blobName,
        blobMerkleRoot: state.commitments.blobMerkleRoot,
        numChunksets: state.commitments.numChunksets,
        expirationMicros,
        blobSize: state.commitments.blobSize,
      });

      const isMock = process.env.NEXT_PUBLIC_MOCK === "true";
      let txHash: string;

      if (isMock) {
        await new Promise((r) => setTimeout(r, 900));
        txHash = getMockTxHash();
      } else {
        const result = await signAndSubmitTransaction({
          data: payload as Parameters<typeof signAndSubmitTransaction>[0]["data"],
        });
        txHash = result.hash;
      }

      set({ txHash, step: 4, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Transaction failed",
        loading: false,
        step: 3,
      });
    }
  }

  // ── Step 4 → 5: Wait for tx + put blob ───────────────────────────────────
  async function handleConfirm() {
    if (!state.file || !state.txHash) return;
    set({ loading: true, error: null, step: 4 });
    try {
      await waitForTransaction(state.txHash);
      set({ step: 5 });

      const blobData = new Uint8Array(await state.file.arrayBuffer());
      await putBlob({ account, blobName: state.blobName, blobData });

      set({ loading: false });
      setTimeout(() => onSuccess?.(), 1800);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Upload finalization failed",
        loading: false,
        step: 4,
      });
    }
  }

  const { step, file, commitments, txHash, error, loading } = state;

  return (
    <div className="card space-y-8 max-w-2xl">
      <div className="space-y-1">
        <h2 className="font-display text-xl text-shelby-text">
          {activeModule} — Upload Proof
        </h2>
        <p className="text-shelby-text-muted text-sm">
          Anchor your document on Shelby × Aptos in 5 steps.
        </p>
      </div>

      <StepIndicator current={step} />

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-card bg-shelby-error/10 border border-shelby-error/20 text-shelby-error text-sm">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Step panels ── */}
      {step === 1 && (
        <StepOne
          file={file}
          onFile={(f) => set({ file: f, error: null })}
          onNext={() => void handleCommit()}
          loading={loading}
        />
      )}

      {step === 2 && <StepWorking label="Generating Merkle commitments…" />}

      {step === 3 && commitments && (
        <StepThree
          commitments={commitments}
          onRegister={() => void handleRegister()}
          loading={loading}
        />
      )}

      {step === 4 && (
        <StepFour
          txHash={txHash}
          onConfirm={() => void handleConfirm()}
          loading={loading}
        />
      )}

      {step === 5 && <StepFive loading={loading} />}
    </div>
  );
}

// ─── Step sub-components ──────────────────────────────────────────────────────

function StepOne({
  file,
  onFile,
  onNext,
  loading,
}: {
  file: File | null;
  onFile: (f: File) => void;
  onNext: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <FileDropZone onFile={onFile} />
      {file && (
        <div className="flex items-center justify-between px-4 py-3 rounded-card bg-shelby-bg border border-shelby-accent/15">
          <div className="flex items-center gap-3">
            <span className="text-shelby-accent text-lg">📄</span>
            <div>
              <p className="text-shelby-text text-sm font-medium truncate max-w-xs">{file.name}</p>
              <p className="data-value">{formatBlobSize(file.size)}</p>
            </div>
          </div>
          <button onClick={onNext} disabled={loading} className="btn-primary">
            {loading ? "Processing…" : "Commit →"}
          </button>
        </div>
      )}
    </div>
  );
}

function StepWorking({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="w-10 h-10 rounded-full border-2 border-shelby-accent border-t-transparent animate-spin" />
      <p className="text-shelby-text-muted text-sm">{label}</p>
    </div>
  );
}

function StepThree({
  commitments,
  onRegister,
  loading,
}: {
  commitments: BlobCommitments;
  onRegister: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-shelby-text-muted text-sm">
        Merkle commitments ready. Sign the transaction to register on Aptos.
      </p>
      <div className="space-y-2">
        <DataRow label="Merkle Root" value={formatMerkleRoot(commitments.blobMerkleRoot)} />
        <DataRow label="Chunksets" value={String(commitments.numChunksets)} />
        <DataRow label="Blob Size" value={formatBlobSize(commitments.blobSize)} />
      </div>
      <button onClick={onRegister} disabled={loading} className="btn-primary w-full">
        {loading ? (
          <>
            <span className="w-3 h-3 rounded-full border-2 border-shelby-bg border-t-transparent animate-spin" />
            Waiting for wallet…
          </>
        ) : (
          "Sign & Register →"
        )}
      </button>
    </div>
  );
}

function StepFour({
  txHash,
  onConfirm,
  loading,
}: {
  txHash: string;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-shelby-text-muted text-sm">
        Transaction submitted. Confirm finalization to upload blob data.
      </p>
      <DataRow label="Tx Hash" value={formatMerkleRoot(txHash)} />
      <a
        href={explorerUrl(txHash)}
        target="_blank"
        rel="noreferrer"
        className="text-shelby-accent text-xs hover:underline"
      >
        View on Aptos Explorer ↗
      </a>
      <button onClick={onConfirm} disabled={loading} className="btn-primary w-full">
        {loading ? (
          <>
            <span className="w-3 h-3 rounded-full border-2 border-shelby-bg border-t-transparent animate-spin" />
            Finalizing…
          </>
        ) : (
          "Confirm & Store →"
        )}
      </button>
    </div>
  );
}

function StepFive({ loading }: { loading: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      {loading ? (
        <>
          <div className="w-10 h-10 rounded-full border-2 border-shelby-accent border-t-transparent animate-spin" />
          <p className="text-shelby-text-muted text-sm">Uploading blob data to Shelby…</p>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-full bg-shelby-success/20 border border-shelby-success/40 flex items-center justify-center text-2xl animate-fade-up">
            ✓
          </div>
          <p className="font-display text-shelby-text text-lg">Proof anchored successfully</p>
          <p className="text-shelby-text-muted text-sm">Redirecting to your records…</p>
        </>
      )}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-card bg-shelby-bg border border-shelby-accent/15">
      <span className="text-shelby-text-muted text-xs font-body">{label}</span>
      <span className="data-value">{value}</span>
    </div>
  );
}

export default UploadProof;
