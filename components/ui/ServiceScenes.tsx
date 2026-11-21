type SceneProps = { className?: string };

// Shared markers the Services section animates with GSAP
const DRAW = { "data-draw": "", pathLength: 1, strokeDasharray: "1 2" };
const POP = { "data-pop": "" };

const TICKS = Array.from({ length: 11 }, (_, i) => `M${40 + i * 40} 54V64`).join("");

/* ---------- Graphic design: a pen tool drawing a K ---------- */

const K_POINTS: [number, number][] = [
  [170, 60],
  [215, 60],
  [215, 140],
  [277, 60],
  [331, 60],
  [254, 164],
  [335, 260],
  [279, 260],
  [215, 190],
  [215, 260],
  [170, 260],
];

const K_PATH = `M${K_POINTS.map(([x, y]) => `${x} ${y}`).join(" L")} Z`;

// Where each anchor sits along the path (0 to 1), so anchors can pop as the pen passes them
const K_SEGMENTS = K_POINTS.map(([x, y], i) => {
  const [nx, ny] = K_POINTS[(i + 1) % K_POINTS.length];
  return Math.hypot(nx - x, ny - y);
});
const K_TOTAL = K_SEGMENTS.reduce((sum, length) => sum + length, 0);
export const K_FRACTIONS = K_POINTS.map(
  (_, i) => K_SEGMENTS.slice(0, i).reduce((sum, length) => sum + length, 0) / K_TOTAL
);

export const NIB_REST = { x: 392, y: 262 };

const SELECT_HANDLES: [number, number][] = [
  [152, 42],
  [252, 42],
  [352, 42],
  [352, 160],
  [352, 278],
  [252, 278],
  [152, 278],
  [152, 160],
];

export function GraphicScene({ className }: SceneProps) {
  return (
    <svg viewBox="0 0 480 320" fill="none" aria-hidden="true" className={className}>
      {/* The K, filled in once the path closes */}
      <path data-k-fill="" d={K_PATH} className="fill-volt" />

      {/* The path the pen draws */}
      <path
        data-k-stroke=""
        pathLength={1}
        strokeDasharray="1 2"
        d={K_PATH}
        className="stroke-volt"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Selection box and handles */}
      <path
        data-select=""
        pathLength={1}
        strokeDasharray="1 2"
        d="M152 42 H352 V278 H152 Z"
        className="stroke-white/60"
        strokeWidth="1.5"
      />
      {SELECT_HANDLES.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          data-handle=""
          x={x - 4.5}
          y={y - 4.5}
          width="9"
          height="9"
          className="fill-white stroke-ink"
          strokeWidth="1"
        />
      ))}

      {/* Anchor points */}
      {K_POINTS.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          data-anchor=""
          x={x - 4}
          y={y - 4}
          width="8"
          height="8"
          className="fill-ink stroke-white"
          strokeWidth="1.5"
        />
      ))}

      {/* Color swatches */}
      <circle data-swatch="" cx="60" cy="288" r="9" className="fill-volt" />
      <circle data-swatch="" cx="86" cy="288" r="9" className="fill-white" />
      <circle
        data-swatch=""
        cx="112"
        cy="288"
        r="9"
        className="stroke-white/40"
        strokeWidth="1.5"
      />

      {/* The pen nib */}
      <g data-nib="" transform={`translate(${NIB_REST.x} ${NIB_REST.y})`}>
        <g data-nib-hover="">
          <g transform="rotate(30) scale(0.9)">
            <rect x="-9" y="-124" width="18" height="52" rx="5" className="fill-white/25" />
            <rect x="-13" y="-78" width="26" height="12" rx="3" className="fill-white/60" />
            <path
              d="M0 0 L-15 -38 C-17 -47 -15 -57 -10 -66 H10 C15 -57 17 -47 15 -38 Z"
              className="fill-white"
            />
            <circle cx="0" cy="-38" r="4" className="fill-ink" />
            <path d="M0 -34 V-4" className="stroke-ink" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </svg>
  );
}

/* ---------- Motion design: an easing curve, keyframes and a ball on a track ---------- */

export function MotionScene({ className }: SceneProps) {
  return (
    <svg viewBox="0 0 480 320" fill="none" aria-hidden="true" className={className}>
      <path
        {...DRAW}
        d="M50 36 V270 H440"
        className="stroke-white/25"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g className="stroke-white/35" strokeWidth="1.5" strokeLinecap="round">
        <path {...DRAW} d="M50 270 H200" />
        <path {...DRAW} d="M440 40 H290" />
      </g>

      <path
        {...DRAW}
        d="M50 270 C200 270 290 40 440 40"
        className="stroke-volt"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <g className="fill-volt">
        <path {...POP} d="M50 258 L62 270 L50 282 L38 270 Z" />
        <path {...POP} d="M440 28 L452 40 L440 52 L428 40 Z" />
      </g>

      <g className="fill-ink stroke-white/70" strokeWidth="1.5">
        <circle {...POP} cx="200" cy="270" r="5" />
        <circle {...POP} cx="290" cy="40" r="5" />
      </g>

      <path
        {...DRAW}
        d="M50 304 H440"
        className="stroke-white/20"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle {...POP} data-ball="" cx="50" cy="304" r="10" className="fill-volt" />
    </svg>
  );
}

/* ---------- Video editing: a timeline with clips and a moving playhead ---------- */

export function VideoScene({ className }: SceneProps) {
  return (
    <svg viewBox="0 0 480 320" fill="none" aria-hidden="true" className={className}>
      <g className="stroke-white/25" strokeWidth="1.5" strokeLinecap="round">
        <path {...DRAW} d="M40 64 H440" />
        <path {...DRAW} d={TICKS} />
      </g>

      <g>
        <rect data-clip="" x="40" y="90" width="120" height="46" rx="10" className="fill-volt" />
        <rect data-clip="" x="172" y="90" width="96" height="46" rx="10" className="fill-white/20" />
        <rect data-clip="" x="280" y="90" width="160" height="46" rx="10" className="fill-white/10" />

        <rect data-clip="" x="80" y="146" width="150" height="46" rx="10" className="fill-white/10" />
        <rect data-clip="" x="242" y="146" width="110" height="46" rx="10" className="fill-volt/50" />
        <rect data-clip="" x="364" y="146" width="76" height="46" rx="10" className="fill-white/20" />

        <rect data-clip="" x="40" y="202" width="200" height="46" rx="10" className="fill-white/20" />
        <rect data-clip="" x="252" y="202" width="188" height="46" rx="10" className="fill-volt" />
      </g>

      <g data-playhead="" transform="translate(0 0)">
        <path d="M40 46 V262" className="stroke-volt" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M32 34 H48 L40 46 Z"
          className="fill-volt stroke-volt"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}