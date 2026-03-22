# VeriFi Protocol

On-chain proof-of-record for financial documents, built on Shelby × Aptos.

**Live demo:** https://verifi-protocol-nu.vercel.app
**Built by:** [@YoneCode](https://x.com/YoneCode)
**Storage layer:** [Shelby Protocol](https://docs.shelby.xyz/protocol)

## The Problem

Financial records get deleted, altered, or selectively disclosed. Courts, auditors, and regulators require tamper-proof evidence that a document existed at a specific point in time and has not been modified since. Existing solutions rely on trusted intermediaries — which defeats the purpose.

## How It Works

Every document goes through a five-step flow. Steps 1–2 run locally in the browser. Steps 3–5 touch the network.

```typescript
import { generateCommitments, createRegisterBlobPayload,
  putBlob } from "@/lib/shelby";
import { waitForTransaction } from "@/lib/aptos";

const buffer = await file.arrayBuffer();
const { blobMerkleRoot, numChunksets, blobSize } =
  await generateCommitments(buffer);

const payload = await createRegisterBlobPayload({
  account,
  blobName: "audit-report-q4-2024.pdf",
  blobMerkleRoot,
  numChunksets,
  blobSize,
  expirationMicros: BigInt(
    Date.now() + 365 * 24 * 60 * 60 * 1e9
  ),
});

const { hash } = await signAndSubmitTransaction({
  data: payload
});
await waitForTransaction(hash);

await putBlob({
  account,
  blobName,
  blobData: new Uint8Array(buffer)
});
```

The Merkle root is permanently anchored on Aptos. Anyone with the root can verify document integrity without seeing the contents.

## Storage Architecture

| Layer | Technology | Role |
|---|---|---|
| Blob storage | Shelby Protocol RPC | Stores raw document data across nodes |
| Coordination | Aptos L1 | Records Merkle root, ownership, expiry |
| Erasure coding | Clay Codes (10+6) | Reconstructs data from any 10 of 16 shards |

## Modules

| Module | Purpose |
|---|---|
| TaxProof | Anchors tax filings with year-end timestamps |
| TradeProof | Records trade confirmations at execution time |
| AlertArchive | Preserves compliance notices as they arrive |
| ReportVault | Stores audited statements with Merkle roots |
| ContractDrop | Registers agreements before version disputes |

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

Full UI runs without testnet access or an API key.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SHELBY_API_KEY` | Yes (testnet) | API key from geomi.dev |
| `NEXT_PUBLIC_APTOS_API_KEY` | No | Aptos Labs API key |
| `NEXT_PUBLIC_MOCK` | No | Set to `true` to skip network calls |

## Links

- [Shelby Protocol Docs](https://docs.shelby.xyz/protocol)
- [Shelby on X](https://x.com/shelbyserves)
- [Shelby Explorer](https://explorer.shelby.xyz/shelbynet)
- [Live Demo](https://verifi-protocol-nu.vercel.app)

## Built With

- [Shelby Protocol](https://shelby.xyz) — decentralized blob storage with erasure coding
- [Aptos](https://aptoslabs.com) — coordination and settlement layer
- [Next.js 14](https://nextjs.org) — frontend (App Router)
- Clay Codes — erasure coding scheme (10+6)

## License

MIT
