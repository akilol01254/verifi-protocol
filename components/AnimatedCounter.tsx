"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  className?: string;
}

export default function AnimatedCounter({ value, className = "" }: Props) {
  const [display, setDisplay] = useState("0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
    const suffix = value.replace(/[0-9.,]/g, "").trim();

    if (isNaN(numeric)) {
      setDisplay(value);
      return;
    }

    const duration = 1500;
    const steps = 40;
    const interval = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += numeric / steps;
      if (current >= numeric) {
        clearInterval(timer);
        setDisplay(value);
      } else {
        const formatted =
          numeric > 1000
            ? Math.floor(current).toLocaleString()
            : current.toFixed(1);
        setDisplay(formatted + (suffix ? " " + suffix : ""));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [value]);

  return <span className={className}>{display}</span>;
}
