"use client";

/**
 * components/FileDropZone.tsx
 * Drag-and-drop + click-to-browse file input.
 */

import { useCallback, useRef, useState } from "react";
import { formatBlobSize } from "@/lib/shelby";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/png",
  "image/jpeg",
  "application/zip",
];

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface FileDropZoneProps {
  onFile: (file: File) => void;
}

export function FileDropZone({ onFile }: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    (file: File): boolean => {
      if (file.size > MAX_SIZE_BYTES) {
        setError(`File too large — max ${MAX_SIZE_MB} MB`);
        return false;
      }
      setError(null);
      return true;
    },
    []
  );

  const handleFile = useCallback(
    (file: File) => {
      if (validate(file)) onFile(file);
    },
    [validate, onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // reset so same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        aria-label="Drop zone — click or drag to upload a file"
        className={[
          "relative flex flex-col items-center justify-center gap-3 h-40 rounded-card border-2 border-dashed cursor-pointer",
          "transition-all duration-shelby ease-shelby select-none",
          dragging
            ? "border-shelby-accent bg-shelby-accent-glow scale-[1.01]"
            : "border-shelby-accent/20 bg-shelby-bg hover:border-shelby-accent/40 hover:bg-shelby-bg-light",
        ].join(" ")}
      >
        <span className="text-3xl pointer-events-none">{dragging ? "📂" : "📁"}</span>
        <div className="text-center pointer-events-none">
          <p className="text-shelby-text text-sm font-medium">
            {dragging ? "Drop to upload" : "Drop your file here"}
          </p>
          <p className="text-shelby-text-muted text-xs mt-0.5">
            or click to browse · max {MAX_SIZE_MB} MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={onInputChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {error && (
        <p className="text-shelby-error text-xs px-1">{error}</p>
      )}

      <p className="text-shelby-text-muted text-xs px-1">
        Accepted: PDF, Excel, CSV, PNG, JPG, ZIP
      </p>
    </div>
  );
}
