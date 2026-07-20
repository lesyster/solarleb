import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { className?: string };

// Shared palette (used across icon set):
//   cream badge  #F5E6D3
//   dark brown   #5C3D1E
//   orange       #E8A33D
//   coral        #D4574A
//   teal         #1B6B5C

// ---------- Logo / brand mark ----------

export function SolvoraLBLogo({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <circle cx="80" cy="60" r="15" fill="none" stroke="#5C3D1E" strokeWidth="3" />
      <g stroke="#5C3D1E" strokeWidth="3" strokeLinecap="round">
        <line x1="80" y1="32" x2="80" y2="22" />
        <line x1="102" y1="38" x2="109" y2="31" />
        <line x1="58" y1="38" x2="51" y2="31" />
      </g>
      <path d="M42 108 L80 86 L118 108 L118 120 L42 120 Z" fill="#E8A33D" />
      <line x1="55" y1="102" x2="55" y2="118" stroke="#5C3D1E" strokeWidth="2" />
      <line x1="80" y1="95" x2="80" y2="118" stroke="#5C3D1E" strokeWidth="2" />
      <line x1="105" y1="102" x2="105" y2="118" stroke="#5C3D1E" strokeWidth="2" />
    </svg>
  );
}

// ---------- Homepage feature icons ----------

export function SolarPanelSparkIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <rect x="45" y="58" width="70" height="44" rx="2" fill="none" stroke="#5C3D1E" strokeWidth="3" />
      <line x1="68" y1="58" x2="68" y2="102" stroke="#5C3D1E" strokeWidth="2" />
      <line x1="92" y1="58" x2="92" y2="102" stroke="#5C3D1E" strokeWidth="2" />
      <line x1="45" y1="80" x2="115" y2="80" stroke="#5C3D1E" strokeWidth="2" />
      <polyline
        points="35,80 52,80 58,64 66,92 74,80 125,80"
        fill="none"
        stroke="#D4574A"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LockPriceIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <path d="M55 66 A25 25 0 0 1 105 66" fill="none" stroke="#5C3D1E" strokeWidth="4" strokeLinecap="round" />
      <rect x="52" y="66" width="56" height="42" rx="8" fill="#E8A33D" />
      <text x="80" y="95" textAnchor="middle" fontSize="18" fontWeight="500" fill="#5C3D1E">$</text>
    </svg>
  );
}

export function CedarSunIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <path d="M80 30 A20 20 0 0 1 100 50" fill="none" stroke="#D4574A" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M80 108 L66 86 L73 86 L62 68 L71 68 L59 50 L101 50 L89 68 L98 68 L86 86 L94 86 Z"
        fill="#1B6B5C"
      />
      <rect x="76" y="108" width="8" height="12" fill="#5C3D1E" />
    </svg>
  );
}

// Backward-compat alias (older imports)
export const SunMountainIcon = CedarSunIcon;

// ---------- Contact page icons ----------

export function EmailIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <rect x="38" y="55" width="64" height="44" rx="3" fill="none" stroke="#5C3D1E" strokeWidth="3" />
      <polyline points="38,55 70,80 102,55" fill="none" stroke="#5C3D1E" strokeWidth="3" strokeLinejoin="round" />
      <path d="M92 41 A11 11 0 0 1 101 56" fill="none" stroke="#E8A33D" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function LocationIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <path
        d="M80 37 C57 37 42 53 42 73 C42 100 80 130 80 130 C80 130 118 100 118 73 C118 53 103 37 80 37 Z"
        fill="none"
        stroke="#5C3D1E"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M69 79 L64 60 L71 60 L66 47 L92 47 L87 60 L94 60 L89 79 Z" fill="#1B6B5C" />
    </svg>
  );
}

export function MessageIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <path
        d="M40 60 C40 54 44 50 50 50 L110 50 C116 50 120 54 120 60 L120 92 C120 98 116 102 110 102 L70 102 L54 116 L54 102 L50 102 C44 102 40 98 40 92 Z"
        fill="none"
        stroke="#5C3D1E"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <line x1="56" y1="68" x2="104" y2="68" stroke="#E8A33D" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="82" x2="90" y2="82" stroke="#E8A33D" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ---------- Result card icons (compact, same visual language) ----------
// All use cream badge background + brown line art + one palette accent.

export function ResultSystemIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <path d="M42 108 L80 86 L118 108 L118 120 L42 120 Z" fill="#E8A33D" />
      <line x1="55" y1="102" x2="55" y2="118" stroke="#5C3D1E" strokeWidth="3" />
      <line x1="80" y1="95" x2="80" y2="118" stroke="#5C3D1E" strokeWidth="3" />
      <line x1="105" y1="102" x2="105" y2="118" stroke="#5C3D1E" strokeWidth="3" />
      <line x1="42" y1="108" x2="118" y2="108" stroke="#5C3D1E" strokeWidth="3" />
    </svg>
  );
}

// Battery capacity — outlined battery with 3 orange charge bars
export function ResultBatteryIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <rect x="38" y="58" width="76" height="44" rx="4" fill="none" stroke="#5C3D1E" strokeWidth="3" />
      <rect x="114" y="70" width="8" height="20" rx="2" fill="none" stroke="#5C3D1E" strokeWidth="3" />
      <rect x="46" y="66" width="12" height="28" fill="#E8A33D" />
      <rect x="64" y="66" width="12" height="28" fill="#E8A33D" />
      <rect x="82" y="66" width="12" height="28" fill="#E8A33D" />
    </svg>
  );
}

// Installation cost — dollar coin
export function ResultDollarIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <circle cx="80" cy="80" r="30" fill="#E8A33D" stroke="#5C3D1E" strokeWidth="3" />
      <text x="80" y="90" textAnchor="middle" fontSize="30" fontWeight="600" fill="#5C3D1E">$</text>
    </svg>
  );
}

// Panel cost — small solar panel outline
export function ResultPanelIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <rect x="42" y="54" width="76" height="52" rx="3" fill="none" stroke="#5C3D1E" strokeWidth="3" />
      <line x1="42" y1="80" x2="118" y2="80" stroke="#5C3D1E" strokeWidth="3" />
      <line x1="67" y1="54" x2="67" y2="106" stroke="#5C3D1E" strokeWidth="3" />
      <line x1="93" y1="54" x2="93" y2="106" stroke="#5C3D1E" strokeWidth="3" />
    </svg>
  );
}

// Battery cost — battery with dollar sign
export function ResultChargeIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <rect x="40" y="58" width="72" height="44" rx="4" fill="#E8A33D" stroke="#5C3D1E" strokeWidth="3" />
      <rect x="112" y="70" width="8" height="20" rx="2" fill="none" stroke="#5C3D1E" strokeWidth="3" />
      <text x="76" y="90" textAnchor="middle" fontSize="26" fontWeight="600" fill="#5C3D1E">$</text>
    </svg>
  );
}

// Monthly savings — downward trend line (coral)
export function ResultTrendDownIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <line x1="38" y1="112" x2="122" y2="112" stroke="#5C3D1E" strokeWidth="3" strokeLinecap="round" />
      <line x1="38" y1="112" x2="38" y2="48" stroke="#5C3D1E" strokeWidth="3" strokeLinecap="round" />
      <polyline
        points="46,58 68,78 84,68 108,98"
        fill="none"
        stroke="#D4574A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="108,98 118,98 118,88"
        fill="none"
        stroke="#D4574A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Payback period — clock outline
export function ResultClockIcon({ className, ...props }: Props) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden {...props}>
      <circle cx="80" cy="80" r="72" fill="#F5E6D3" />
      <circle cx="80" cy="82" r="34" fill="none" stroke="#5C3D1E" strokeWidth="3" />
      <line x1="80" y1="82" x2="80" y2="60" stroke="#1B6B5C" strokeWidth="3" strokeLinecap="round" />
      <line x1="80" y1="82" x2="96" y2="90" stroke="#1B6B5C" strokeWidth="3" strokeLinecap="round" />
      <circle cx="80" cy="82" r="2.5" fill="#5C3D1E" />
      <line x1="80" y1="44" x2="80" y2="40" stroke="#5C3D1E" strokeWidth="3" strokeLinecap="round" />
      <line x1="72" y1="44" x2="88" y2="44" stroke="#5C3D1E" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
