# VeriFi Protocol

On-chain proof-of-record for financial documents, built on Shelby × Aptos.

## The Problem

Financial records get deleted, altered, or selectively disclosed. Courts, auditors, and regulators increasingly require tamper-proof evidence that a document existed at a specific point in time and has not been modified since. Existing solutions rely on trusted intermediaries — which defeats the purpose.

## How It Works

Every document goes through a five-step flow. Steps 1–2 run locally in the browser. Steps 3–5 touch the network.

```typescript
import { generateCommitments, createRegisterBlobPayload, putBlob } from "@/lib/shelby";
import { waitForTransaction } from "@/lib/aptos";

// 1. Read the file
const buffer = await file.arrayBuffer();

// 2. Compute Merkle commitments locally — file never leaves the browser unencrypted
const { blobMerkleRoot, numChunksets, blobSize } = await generateCommitments(buffer);

// 3. Build the Aptos transaction payload
const payload = await createRegisterBlobPayload({
  account,
  blobName: "audit-report-q4-2024.pdf",
  blobMerkleRoot,
  numChunksets,
  blobSize,
  expirationMicros: BigInt(Date.now() + 365 * 24 * 60 * 60 * 1e9),
});

// 4. Sign and submit via wallet adapter, then wait for finality
const { hash } = await signAndSubmitTransaction({ data: payload });
await waitForTransaction(hash);

// 5. Upload blob data to Shelby storage
await putBlob({ account, blobName, blobData: new Uint8Array(buffer) });
```

The Merkle root is permanently anchored on Aptos. Anyone with the root can verify document integrity without seeing the contents.

## Storage Architecture

| Layer | Technology | Role |
|-------|-----------|------|
| Blob storage | Shelby Protocol RPC | Stores raw document data across nodes |
| Coordination | Aptos L1 | Records Merkle root, ownership, expiry |
| Erasure coding | Clay Codes (10+6) | Reconstructs data from any 10 of 16 shards |

## Modules

| Module | Purpose |
|--------|---------|
| TaxProof | Anchors tax filings and supporting schedules with year-end timestamps |
| TradeProof | Records trade confirmations and settlement records at execution time |
| AlertArchive | Preserves regulatory alerts and compliance notices as they arrive |
| ReportVault | Stores audited financial statements with auditor-verified Merkle roots |
| ContractDrop | Registers signed agreements before any party can claim a different version |

## Getting Started

```bash
git clone https://github.com/akilol01254/verifi-protocol
cd verifi-protocol
npm install
cp .env.local .env.local.example
# Add your Shelby API key from geomi.dev
npm run dev
```

## Mock Mode

```bash
NEXT_PUBLIC_MOCK=true npm run dev
```

The full UI — upload flow, Merkle certificates, proof list — runs without testnet access or an API key.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SHELBY_API_KEY` | Yes (testnet) | API key from geomi.dev |
| `NEXT_PUBLIC_APTOS_API_KEY` | No | Aptos Labs API key for higher rate limits |
| `NEXT_PUBLIC_MOCK` | No | Set to `true` to skip all network calls |

## Built With

- Shelby Protocol — decentralized blob storage with erasure coding
- Aptos — coordination and settlement layer
- Next.js 14 — frontend (App Router)
- Clay Codes — erasure coding scheme (10+6 configuration)

## License

MIT
