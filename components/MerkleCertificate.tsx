"use client";

/**
 * components/MerkleCertificate.tsx
 * Proof display card — shareable Merkle certificate for a verified blob.
 */

import { useState } from "react";
import { type ShelbyBlob, formatBlobSize, formatMerkleRoot } from "@/lib/shelby";
import { explorerUrl, formatAddress } from "@/lib/aptos";

interface MerkleCertificateProps {
  blob: ShelbyBlob;
  onClose?: () => void;
}

export function MerkleCertificate({ blob, onClose }: MerkleCertificateProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyToClipboard(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // clipboard access denied — silently ignore
    }
  }

  const uploadedDate = new Date(blob.uploadedAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const expiresDate = new Date(
    Number(blob.expirationMicros / BigInt(1000))
  ).toLocaleDateString("en-US", { dateStyle: "long" });

  const isExpired = Number(blob.expirationMicros / BigInt(1000)) < Date.now();

  const shareText = [
    "VeriFi Protocol — Merkle Certificate",
    `Document: ${blob.blobName}`,
    `Merkle Root: ${blob.blobMerkleRoot}`,
    `Owner: ${blob.owner}`,
    `Anchored: ${uploadedDate}`,
    blob.txHash ? `Tx: ${blob.txHash}` : "",
    "Verify at: https://explorer.aptoslabs.com",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="card space-y-6 relative">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-shelby-accent text-lg">✦</span>
            <h2 className="font-display text-xl text-shelby-text">Merkle Certificate</h2>
          </div>
          <p className="text-shelby-text-muted text-xs">
            Cryptographic proof of record — Shelby × Aptos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={isExpired ? "badge-error" : "badge-success"}>
            {isExpired ? "Expired" : "Active"}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="btn-ghost p-1 rounded-card"
              aria-label="Close certificate"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Certificate body ── */}
      <div className="space-y-3 rounded-card border border-shelby-accent/15 bg-shelby-bg p-4">
        <CertRow
          label="Document"
          value={blob.blobName}
          onCopy={() => void copyToClipboard(blob.blobName, "name")}
          copied={copied === "name"}
        />
        <div className="divider my-0" />
        <CertRow
          label="Merkle Root"
          value={formatMerkleRoot(blob.blobMerkleRoot)}
          fullValue={blob.blobMerkleRoot}
          onCopy={() => void copyToClipboard(blob.blobMerkleRoot, "root")}
          copied={copied === "root"}
          mono
        />
        <CertRow
          label="Owner"
          value={formatAddress(blob.owner)}
          fullValue={blob.owner}
          onCopy={() => void copyToClipboard(blob.owner, "owner")}
          copied={copied === "owner"}
          mono
        />
        {blob.txHash && (
          <CertRow
            label="Transaction"
            value={formatAddress(blob.txHash)}
            fullValue={blob.txHash}
            onCopy={() => void copyToClipboard(blob.txHash!, "tx")}
            copied={copied === "tx"}
            mono
            href={explorerUrl(blob.txHash)}
          />
        )}
        <div className="divider my-0" />
        <CertRow label="Blob Size" value={formatBlobSize(blob.blobSize)} />
        <CertRow label="Chunksets" value={String(blob.numChunksets)} />
        <CertRow label="Anchored" value={uploadedDate} />
        <CertRow label="Expires" value={expiresDate} />
      </div>

      {/* ── Merkle root display ── */}
      <div className="rounded-card bg-shelby-bg-card border border-shelby-accent/20 p-4 space-y-2">
        <p className="text-shelby-text-muted text-xs font-body uppercase tracking-widest">
          Full Merkle Root
        </p>
        <p className="font-mono text-shelby-accent text-xs break-all leading-relaxed">
          {blob.blobMerkleRoot}
        </p>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => void copyToClipboard(shareText, "share")}
          className="btn-secondary flex-1 min-w-[140px]"
        >
          {copied === "share" ? "✓ Copied!" : "Copy Certificate"}
        </button>
        {blob.txHash && (
          <a
            href={explorerUrl(blob.txHash)}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost flex-1 min-w-[140px] justify-center"
          >
            Explorer ↗
          </a>
        )}
      </div>
    </div>
  );
}

// ─── CertRow ──────────────────────────────────────────────────────────────────

interface CertRowProps {
  label: string;
  value: string;
  fullValue?: string;
  onCopy?: () => void;
  copied?: boolean;
  mono?: boolean;
  href?: string;
}

function CertRow({ label, value, onCopy, copied, mono, href }: CertRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="text-shelby-text-muted text-xs shrink-0 w-28">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={[
              "truncate text-xs hover:underline text-shelby-accent",
              mono ? "font-mono" : "font-body",
            ].join(" ")}
          >
            {value}
          </a>
        ) : (
          <span
            className={[
              "truncate text-xs",
              mono ? "font-mono text-shelby-text-muted" : "font-body text-shelby-text",
            ].join(" ")}
          >
            {value}
          </span>
        )}
        {onCopy && (
          <button
            onClick={onCopy}
            className="shrink-0 text-shelby-text-muted hover:text-shelby-accent transition-colors duration-shelby ease-shelby text-[10px] px-1.5 py-0.5 rounded border border-shelby-accent/20 hover:border-shelby-accent/40"
            aria-label={`Copy ${label}`}
          >
            {copied ? "✓" : "⎘"}
          </button>
        )}
      </div>
    </div>
  );
}
