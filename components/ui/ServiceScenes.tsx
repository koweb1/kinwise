type SceneProps = { className?: string };

// Shared markers the Services section animates with GSAP
const DRAW = { "data-draw": "", pathLength: 1, strokeDasharray: "1 2" };
const POP = { "data-pop": "" };

const TICKS = Array.from({ length: 11 }, (_, i) => `M${40 + i * 40} 54V64`).join("");

/* Graphic design: a pen-tool curve with anchors and handles */
export function GraphicScene({ className }: SceneProps) {
  return (
    <svg viewBox="0 0 480 320" fill="none" aria-hidden="true" className={className}>
      <g className="stroke-white/30" strokeWidth="1.5" strokeLinecap="round">
        <path {...DRAW} d="M60 240 L110 70" />
        <path {...DRAW} d="M230 70 L260 165 L290 260" />
        <path {...DRAW} d="M380 280 L430 100" />
      </g>

      <path
        {...DRAW}
        d="M60 240 C110 70 230 70 260 165 S380 280 430 100"
        className="stroke-volt"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <g className="fill-ink stroke-white/70" strokeWidth="1.5">
        <circle {...POP} cx="110" cy="70" r="5" />
        <circle {...POP} cx="230" cy="70" r="5" />
        <circle {...POP} cx="290" cy="260" r="5" />
        <circle {...POP} cx="380" cy="280" r="5" />
      </g>

      <g className="fill-volt">
        <rect {...POP} x="54" y="234" width="12" height="12" rx="2" />
        <rect {...POP} x="254" y="159" width="12" height="12" rx="2" />
        <rect {...POP} x="424" y="94" width="12" height="12" rx="2" />
      </g>

      <circle
        {...POP}
        data-float=""
        cx="60"
        cy="60"
        r="22"
        className="stroke-white/35"
        strokeWidth="1.5"
      />
      <path
        {...POP}
        data-float=""
        d="M410 245 L430 265 L410 285 L390 265 Z"
        className="fill-volt/15 stroke-volt/60"
        strokeWidth="1.5"
      />
      <rect
        {...POP}
        data-float=""
        x="330"
        y="24"
        width="40"
        height="40"
        rx="10"
        className="stroke-white/30"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* Motion design: an easing curve, keyframes and a ball on a track */
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

/* Video editing: a timeline with clips and a moving playhead */
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