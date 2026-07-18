/**
 * Kurzgesagt-style flat-vector hero illustration.
 * Left: perspective solar panel array with a slow drifting highlight.
 * Right: crescent moon <-> sun ambient loop with twinkling stars & drifting cloud.
 * Respects prefers-reduced-motion.
 */
export function HeroIllustration() {
  return (
    <div
      aria-hidden="true"
      className="hero-illustration pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Left: Solar panels */}
      <svg
        viewBox="0 0 600 400"
        preserveAspectRatio="xMinYMax meet"
        className="hi-panels absolute bottom-0 left-0 h-[55%] w-[55%] max-w-[640px] md:h-[70%] md:w-[45%]"
      >
        <defs>
          <linearGradient id="hi-panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="55%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0b1e4a" />
          </linearGradient>
          <linearGradient id="hi-panel-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="hi-roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a2a4a" />
            <stop offset="100%" stopColor="#1a1230" />
          </linearGradient>
          <clipPath id="hi-panel-clip">
            {/* Big parallelogram covering the whole array for the highlight sweep */}
            <polygon points="40,320 560,140 600,180 80,360" />
          </clipPath>
          <radialGradient id="hi-highlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Roof band */}
        <polygon points="0,360 600,180 600,400 0,400" fill="url(#hi-roof)" opacity="0.5" />

        {/* Panel rows — three rows, staggered fade/slide on load */}
        {[0, 1, 2].map((row) => {
          // Each row is a parallelogram: top-left, top-right, bottom-right, bottom-left
          const yTop = 300 - row * 55;
          const yBot = yTop + 42;
          const xOff = row * 18;
          return (
            <g
              key={row}
              className="hi-row"
              style={{ animationDelay: `${row * 0.12}s` }}
            >
              <polygon
                points={`${40 + xOff},${yTop} ${520 + xOff},${yTop - 120} ${560 + xOff},${yTop - 100} ${80 + xOff},${yBot}`}
                fill="url(#hi-panel)"
                stroke="#0b1430"
                strokeWidth="1.5"
              />
              {/* Cell grid */}
              {Array.from({ length: 8 }).map((_, i) => {
                const t = i / 8;
                const x1 = 40 + xOff + (520 - 40) * t;
                const y1 = yTop + (yTop - 120 - yTop) * t;
                const x2 = 80 + xOff + (560 - 80) * t;
                const y2 = yBot + (yTop - 100 - yBot) * t;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#ffffff"
                    strokeOpacity="0.18"
                    strokeWidth="1"
                  />
                );
              })}
              {/* Horizontal split */}
              <line
                x1={60 + xOff}
                y1={(yTop + yBot) / 2 - 30}
                x2={540 + xOff}
                y2={(yTop - 110)}
                stroke="#ffffff"
                strokeOpacity="0.18"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Soft cloud-shaped highlight drifting across the whole panel field */}
        <g clipPath="url(#hi-panel-clip)">
          <ellipse
            className="hi-highlight"
            cx="0"
            cy="240"
            rx="140"
            ry="60"
            fill="url(#hi-highlight)"
          />
        </g>
      </svg>

      {/* Right: Moon <-> Sun scene */}
      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="xMaxYMin meet"
        className="hi-sky absolute right-0 top-0 h-[70%] w-[55%] max-w-[520px] md:w-[45%]"
      >
        <defs>
          <radialGradient id="hi-sunglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hi-moonglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hi-sun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="hi-moon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* Stars — twinkle */}
        <g className="hi-stars">
          {[
            [70, 90, 1.6],
            [120, 60, 1.1],
            [180, 110, 1.3],
            [95, 160, 0.9],
            [200, 55, 1],
            [50, 140, 1.1],
          ].map(([cx, cy, r], i) => (
            <circle
              key={i}
              className="hi-star"
              cx={cx}
              cy={cy}
              r={r}
              fill="#fef3c7"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </g>

        {/* Celestial container — crossfades between moon and sun */}
        <g transform="translate(260, 140)">
          {/* Sun glow */}
          <circle className="hi-sun-glow" cx="0" cy="0" r="110" fill="url(#hi-sunglow)" />
          {/* Moon glow */}
          <circle className="hi-moon-glow" cx="0" cy="0" r="80" fill="url(#hi-moonglow)" />

          {/* Sun body with subtle rays */}
          <g className="hi-sun-body">
            <g className="hi-sun-rays">
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i * Math.PI) / 4;
                const x1 = Math.cos(a) * 58;
                const y1 = Math.sin(a) * 58;
                const x2 = Math.cos(a) * 72;
                const y2 = Math.sin(a) * 72;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#fbbf24"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
            <circle cx="0" cy="0" r="46" fill="url(#hi-sun)" />
          </g>

          {/* Moon body (crescent via masked circle) */}
          <g className="hi-moon-body">
            <circle cx="0" cy="0" r="42" fill="url(#hi-moon)" />
            <circle cx="-12" cy="-8" r="38" fill="#1a1a3a" />
          </g>
        </g>

        {/* Drifting cloud (opposite direction of panel highlight) */}
        <g className="hi-cloud">
          <ellipse cx="0" cy="0" rx="34" ry="14" fill="#f8fafc" opacity="0.75" />
          <ellipse cx="-18" cy="-6" rx="18" ry="12" fill="#f8fafc" opacity="0.75" />
          <ellipse cx="18" cy="-4" rx="22" ry="13" fill="#f8fafc" opacity="0.75" />
        </g>
      </svg>
    </div>
  );
}
