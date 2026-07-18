import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

// Solar panel with sparkle — "AI-designed system"
export function SolarPanelSparkIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* panel */}
      <path d="M4 6h13l2 10H6L4 6Z" />
      <path d="M8.5 6l-1 10" />
      <path d="M13 6l0 10" />
      <path d="M5 11h14" />
      {/* stand */}
      <path d="M11 16v3" />
      <path d="M8 19h6" />
      {/* sparkle */}
      <path d="M19 4l.6 1.4L21 6l-1.4.6L19 8l-.6-1.4L17 6l1.4-.6L19 4Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Padlock with dollar tag — "Price lock guarantee"
export function LockPriceIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* shackle */}
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      {/* body */}
      <rect x="5.5" y="10" width="13" height="9" rx="2" />
      {/* dollar */}
      <path d="M12 12.5v4.5" />
      <path d="M13.6 13.4c-.4-.5-1-.7-1.6-.7-1 0-1.6.5-1.6 1.1 0 1.6 3.2.7 3.2 2.3 0 .7-.7 1.2-1.6 1.2-.7 0-1.3-.2-1.7-.7" />
    </svg>
  );
}

// Sun rising over mountain — "Built for Lebanon"
export function SunMountainIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* sun */}
      <circle cx="12" cy="8" r="2.6" fill="currentColor" stroke="none" opacity="0.95" />
      <path d="M12 3v1.4" />
      <path d="M6.8 5.2l1 1" />
      <path d="M17.2 5.2l-1 1" />
      <path d="M3.5 8h1.4" />
      <path d="M19.1 8h1.4" />
      {/* mountains */}
      <path d="M3 19l5-7 3.5 5 2.5-3 4 5H3Z" fill="currentColor" fillOpacity="0.18" />
      {/* ground */}
      <path d="M2.5 19h19" />
    </svg>
  );
}
