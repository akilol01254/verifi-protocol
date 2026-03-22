"use client";

/**
 * components/StepIndicator.tsx
 * Visual step progress indicator for the upload flow.
 */

const STEPS = [
  "Select File",
  "Commit",
  "Register",
  "Confirm",
  "Store",
] as const;

interface StepIndicatorProps {
  current: number; // 1-indexed
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={
                  isDone
                    ? "step-dot-done"
                    : isActive
                    ? "step-dot-active"
                    : "step-dot-pending"
                }
                aria-current={isActive ? "step" : undefined}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={[
                  "text-[10px] font-body whitespace-nowrap hidden sm:block",
                  isActive ? "text-shelby-accent" : "text-shelby-text-muted",
                ].join(" ")}
              >
                {label}
              </span>
            </div>

            {/* Connector line — not after last step */}
            {i < STEPS.length - 1 && (
              <div
                className={[
                  "h-px flex-1 mx-1 mb-5 transition-colors duration-shelby ease-shelby",
                  isDone ? "bg-shelby-success/40" : "bg-shelby-accent/20",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
