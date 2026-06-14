import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const display = loadDisplay("normal", { weights: ["700", "900"], subsets: ["latin"] });
const body = loadBody("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const NAVY = "#0a1f44";
const CREAM = "#f5f3ec";
const TEAL = "#14b8a6";
const HOT = "#f97316";
const INK = "#0b1220";

const ci = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// --- Punch shot: rapid zoom + cursor click on a focus point ---
const Punch: React.FC<{
  src: string;
  caption: string;
  kicker: string;
  fx?: number;
  fy?: number;
  zoom?: number;
  accent?: string;
}> = ({ src, caption, kicker, fx = 0.5, fy = 0.45, zoom = 1.3, accent = TEAL }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const punch = spring({ frame, fps, config: { damping: 18, stiffness: 140, mass: 0.9 } });
  const startScale = zoom * 1.18;
  const scale = interpolate(punch, [0, 1], [startScale, zoom]);
  const drift = ci(frame, [10, durationInFrames], [0, 1]);
  const shake = ci(frame, [0, 5, 10], [18, -5, 0]);

  const exit = ci(frame, [durationInFrames - 5, durationInFrames - 1], [1, 0]);
  const enter = ci(frame, [0, 3], [0, 1]);
  const opacity = enter * exit;

  const cx = ci(frame, [0, 16], [960 + (fx - 0.5) * 700, 1920 * fx]);
  const cy = ci(frame, [0, 16], [540 + (fy - 0.5) * 500, 1080 * fy]);
  const click = ci(frame, [18, 24], [0, 1]) * ci(frame, [24, 42], [1, 0]);

  const capIn = spring({ frame: frame - 6, fps, config: { damping: 16, stiffness: 180 } });
  const capOut = ci(frame, [durationInFrames - 12, durationInFrames - 3], [1, 0]);
  const capOp = capIn * capOut;
  const capX = interpolate(capIn, [0, 1], [-90, 0]);
  const kickW = ci(frame, [4, 16], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#04081a", opacity }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${shake + drift * 12}px, ${drift * -6}px)`,
          transformOrigin: `${fx * 100}% ${fy * 100}%`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(4,8,26,0.78) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Focus ring */}
      <div
        style={{
          position: "absolute",
          left: cx - 70,
          top: cy - 70,
          width: 140,
          height: 140,
          borderRadius: 999,
          border: `3px solid ${accent}`,
          opacity: 0.35 + click * 0.55,
          transform: `scale(${1 + click * 0.5})`,
          boxShadow: `0 0 50px ${accent}`,
        }}
      />
      {click > 0 && (
        <div
          style={{
            position: "absolute",
            left: cx - 90,
            top: cy - 90,
            width: 180,
            height: 180,
            borderRadius: 999,
            border: `4px solid ${accent}`,
            opacity: (1 - click) * 0.9,
            transform: `scale(${0.5 + click * 1.6})`,
          }}
        />
      )}

      {/* Cursor */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          width: 34,
          height: 34,
          filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.7))",
        }}
      >
        <svg viewBox="0 0 24 24" width="34" height="34">
          <path
            d="M3 2 L3 22 L8 17 L11 23 L14 22 L11 16 L18 16 Z"
            fill="#ffffff"
            stroke="#0a1f44"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Diagonal accent bar */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: -100,
          width: 380 * ci(frame, [2, 12], [0, 1]),
          height: 8,
          background: accent,
          transform: "rotate(-12deg)",
          transformOrigin: "right",
          boxShadow: `0 0 24px ${accent}`,
        }}
      />

      {/* Brand */}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 60,
          color: CREAM,
          fontFamily: display.fontFamily,
          fontSize: 28,
          fontWeight: 700,
          textShadow: "0 2px 12px rgba(0,0,0,0.6)",
        }}
      >
        MaintenEase
      </div>

      {/* Caption */}
      <div
        style={{
          position: "absolute",
          left: 70,
          bottom: 70,
          maxWidth: 1300,
          opacity: capOp,
          transform: `translateX(${capX}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: kickW * 80, height: 4, background: accent, borderRadius: 2 }} />
          <div
            style={{
              fontFamily: body.fontFamily,
              color: accent,
              fontWeight: 700,
              letterSpacing: 4,
              fontSize: 18,
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </div>
        </div>
        <div
          style={{
            fontFamily: display.fontFamily,
            color: "#ffffff",
            fontSize: 88,
            lineHeight: 1.0,
            fontWeight: 900,
            textShadow: "0 6px 30px rgba(0,0,0,0.75)",
            letterSpacing: -2,
          }}
        >
          {caption}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Strobe flash ---
const Flash: React.FC<{ color?: string }> = ({ color = "#ffffff" }) => {
  const frame = useCurrentFrame();
  const op = ci(frame, [0, 1, 5], [1, 1, 0]);
  return <AbsoluteFill style={{ backgroundColor: color, opacity: op }} />;
};

// --- Stat slam ---
const StatSlam: React.FC<{ stat: string; label: string; sub: string; color?: string }> = ({
  stat,
  label,
  sub,
  color = TEAL,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const slam = spring({ frame, fps, config: { damping: 11, stiffness: 200 } });
  const exit = ci(frame, [durationInFrames - 6, durationInFrames - 1], [1, 0]);
  const labelIn = spring({ frame: frame - 8, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, ${color}33, transparent 60%), #04081a`,
        opacity: exit,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: display.fontFamily,
            fontSize: 380,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: -10,
            lineHeight: 0.9,
            transform: `scale(${interpolate(slam, [0, 1], [0.35, 1])})`,
            opacity: slam,
            textShadow: `0 0 80px ${color}`,
          }}
        >
          {stat}
        </div>
        <div
          style={{
            marginTop: 24,
            fontFamily: body.fontFamily,
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: 8,
            textTransform: "uppercase",
            color,
            opacity: labelIn,
            transform: `translateY(${interpolate(labelIn, [0, 1], [30, 0])}px)`,
          }}
        >
          {label}
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: body.fontFamily,
            fontSize: 26,
            color: "rgba(255,255,255,0.7)",
            opacity: labelIn,
          }}
        >
          {sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Title / Chapter card ---
const TitleCard: React.FC<{
  eyebrow: string;
  title: string;
  subtitle?: string;
  variant?: "intro" | "chapter" | "outro";
}> = ({ eyebrow, title, subtitle, variant = "chapter" }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  const exit = ci(frame, [durationInFrames - 6, durationInFrames - 1], [1, 0]);
  const op = enter * exit;
  const y = interpolate(enter, [0, 1], [60, 0]);
  const titleScale = interpolate(enter, [0, 1], [1.25, 1]);

  const bg =
    variant === "intro"
      ? `radial-gradient(circle at 30% 20%, rgba(20,184,166,0.25), transparent 55%), linear-gradient(135deg, ${NAVY} 0%, #04081a 100%)`
      : variant === "outro"
      ? `radial-gradient(circle at 70% 80%, rgba(249,115,22,0.22), transparent 60%), linear-gradient(135deg, #04081a 0%, ${NAVY} 100%)`
      : `linear-gradient(135deg, ${NAVY} 0%, #04081a 100%)`;

  const lineW = interpolate(enter, [0, 1], [0, 260]);

  return (
    <AbsoluteFill style={{ background: bg, opacity: op }}>
      <AbsoluteFill
        style={{
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 160px",
          transform: `translateY(${y}px)`,
        }}
      >
        <div
          style={{
            fontFamily: body.fontFamily,
            color: TEAL,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 8,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ width: lineW, height: 5, background: TEAL, marginBottom: 32, borderRadius: 2 }} />
        <div
          style={{
            fontFamily: display.fontFamily,
            color: "#ffffff",
            fontSize: variant === "intro" ? 180 : 140,
            lineHeight: 0.96,
            fontWeight: 900,
            letterSpacing: -4,
            maxWidth: 1600,
            transform: `scale(${titleScale})`,
            transformOrigin: "left center",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              marginTop: 36,
              fontFamily: body.fontFamily,
              color: "rgba(255,255,255,0.82)",
              fontSize: 34,
              lineHeight: 1.3,
              maxWidth: 1200,
            }}
          >
            {subtitle}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type Block =
  | { kind: "title"; dur: number; props: React.ComponentProps<typeof TitleCard> }
  | { kind: "shot"; dur: number; props: React.ComponentProps<typeof Punch> }
  | { kind: "flash"; dur: number; props: React.ComponentProps<typeof Flash> }
  | { kind: "stat"; dur: number; props: React.ComponentProps<typeof StatSlam> };

const BLOCKS: Block[] = [
  // COLD OPEN
  { kind: "title", dur: 65, props: { eyebrow: "Maintenance · Re-engineered", title: "Stop chasing.", subtitle: "Start shipping work.", variant: "intro" } },
  { kind: "flash", dur: 4, props: { color: TEAL } },
  { kind: "title", dur: 50, props: { eyebrow: "MaintenEase", title: "Inside the app.", variant: "intro" } },
  { kind: "flash", dur: 3, props: {} },

  // CH 1 — DASHBOARD PUNCHES
  { kind: "title", dur: 40, props: { eyebrow: "01", title: "Your morning.", variant: "chapter" } },
  { kind: "shot", dur: 75, props: { src: "shots/dashboard-1.png", kicker: "Open", caption: "Today, at a glance.", fx: 0.5, fy: 0.3, zoom: 1.2 } },
  { kind: "shot", dur: 65, props: { src: "shots/dashboard-1.png", kicker: "Completion", caption: "Track every job.", fx: 0.22, fy: 0.45, zoom: 1.7, accent: HOT } },
  { kind: "shot", dur: 65, props: { src: "shots/dashboard-1.png", kicker: "Pending", caption: "What needs you now.", fx: 0.55, fy: 0.45, zoom: 1.7 } },
  { kind: "shot", dur: 65, props: { src: "shots/dashboard-1.png", kicker: "Active techs", caption: "Who's on it.", fx: 0.82, fy: 0.45, zoom: 1.7, accent: HOT } },
  { kind: "flash", dur: 3, props: {} },
  { kind: "stat", dur: 65, props: { stat: "47%", label: "Faster triage", sub: "Across pilot teams", color: HOT } },
  { kind: "flash", dur: 3, props: { color: HOT } },

  // CH 2 — REQUESTS → WORK
  { kind: "title", dur: 40, props: { eyebrow: "02", title: "Triage in seconds.", variant: "chapter" } },
  { kind: "shot", dur: 75, props: { src: "shots/requests-1.png", kicker: "Inbox", caption: "Requests land here.", fx: 0.45, fy: 0.35, zoom: 1.22 } },
  { kind: "shot", dur: 65, props: { src: "shots/requests-1.png", kicker: "One click", caption: "→ work order.", fx: 0.75, fy: 0.55, zoom: 1.75, accent: HOT } },
  { kind: "flash", dur: 3, props: {} },
  { kind: "shot", dur: 75, props: { src: "shots/workorders-1.png", kicker: "Pipeline", caption: "Right away · Up next · Done.", fx: 0.5, fy: 0.4, zoom: 1.2 } },
  { kind: "shot", dur: 60, props: { src: "shots/workorders-1.png", kicker: "Urgent", caption: "Surfaced first.", fx: 0.22, fy: 0.5, zoom: 1.75, accent: HOT } },
  { kind: "shot", dur: 60, props: { src: "shots/workorders-1.png", kicker: "Assigned", caption: "Routed to the right tech.", fx: 0.72, fy: 0.55, zoom: 1.75 } },
  { kind: "flash", dur: 3, props: {} },

  // CH 3 — PM + INSPECTIONS
  { kind: "title", dur: 40, props: { eyebrow: "03", title: "Get ahead of breakdowns.", variant: "chapter" } },
  { kind: "shot", dur: 75, props: { src: "shots/calendar-1.png", kicker: "PM scheduler", caption: "A month, planned.", fx: 0.5, fy: 0.5, zoom: 1.15 } },
  { kind: "shot", dur: 60, props: { src: "shots/calendar-1.png", kicker: "Weekly", caption: "Every PM, on time.", fx: 0.4, fy: 0.55, zoom: 1.7, accent: HOT } },
  { kind: "shot", dur: 70, props: { src: "shots/inspections-1.png", kicker: "Check-ups", caption: "Compliance, handled.", fx: 0.5, fy: 0.45, zoom: 1.2 } },
  { kind: "flash", dur: 3, props: {} },
  { kind: "stat", dur: 65, props: { stat: "100%", label: "Audit ready", sub: "Every inspection logged" } },
  { kind: "flash", dur: 3, props: {} },

  // CH 4 — FACILITY
  { kind: "title", dur: 40, props: { eyebrow: "04", title: "Know every asset.", variant: "chapter" } },
  { kind: "shot", dur: 65, props: { src: "shots/assets-1.png", kicker: "Registry", caption: "24 assets · live status.", fx: 0.5, fy: 0.45, zoom: 1.2 } },
  { kind: "shot", dur: 55, props: { src: "shots/assets-2.png", kicker: "Equipment", caption: "Every machine tracked.", fx: 0.5, fy: 0.4, zoom: 1.25, accent: HOT } },
  { kind: "shot", dur: 55, props: { src: "shots/locations-1.png", kicker: "Places", caption: "Sites, organized.", fx: 0.5, fy: 0.4, zoom: 1.2 } },
  { kind: "shot", dur: 55, props: { src: "shots/vendors-1.png", kicker: "Vendors", caption: "All in one directory.", fx: 0.5, fy: 0.4, zoom: 1.2, accent: HOT } },
  { kind: "flash", dur: 3, props: {} },

  // CH 5 — ANALYTICS
  { kind: "title", dur: 40, props: { eyebrow: "05", title: "See the whole picture.", variant: "chapter" } },
  { kind: "shot", dur: 75, props: { src: "shots/reports-1.png", kicker: "Analytics", caption: "Six months of trends.", fx: 0.5, fy: 0.4, zoom: 1.15 } },
  { kind: "shot", dur: 60, props: { src: "shots/reports-1.png", kicker: "Status mix", caption: "Open vs. done.", fx: 0.3, fy: 0.55, zoom: 1.7 } },
  { kind: "shot", dur: 60, props: { src: "shots/reports-1.png", kicker: "Trend", caption: "Up and to the right.", fx: 0.75, fy: 0.55, zoom: 1.7, accent: HOT } },
  { kind: "flash", dur: 4, props: { color: HOT } },

  // OUTRO
  { kind: "stat", dur: 75, props: { stat: "7", label: "Days free", sub: "Full access. No card.", color: TEAL } },
  { kind: "flash", dur: 3, props: {} },
  { kind: "title", dur: 130, props: { eyebrow: "Start now", title: "maintenease.com", subtitle: "We onboard you in under an hour.", variant: "outro" } },
];

export const TOTAL_FRAMES = BLOCKS.reduce((a, b) => a + b.dur, 0);

const BackdropPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const hue = interpolate(t, [0, 1], [220, 200]);
  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 8%) 0%, #04081a 100%)` }}
    />
  );
};

export const MainVideo: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <BackdropPulse />
      {BLOCKS.map((b, i) => {
        const from = cursor;
        cursor += b.dur;
        return (
          <Sequence key={i} from={from} durationInFrames={b.dur}>
            {b.kind === "title" ? (
              <TitleCard {...(b.props as any)} />
            ) : b.kind === "shot" ? (
              <Punch {...(b.props as any)} />
            ) : b.kind === "stat" ? (
              <StatSlam {...(b.props as any)} />
            ) : (
              <Flash {...(b.props as any)} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};