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
const body = loadBody("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });

const NAVY = "#0a1f44";
const CREAM = "#f5f3ec";
const TEAL = "#14b8a6";
const PAPER = "#fafaf7";
const INK = "#0b1220";

// --- Shot with Ken Burns ---
const Shot: React.FC<{
  src: string;
  caption: string;
  kicker: string;
  direction?: "in" | "out" | "left" | "right";
}> = ({ src, caption, kicker, direction = "in" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const t = frame / durationInFrames;
  let scale = 1;
  let tx = 0;
  let ty = 0;
  if (direction === "in") scale = 1.04 + t * 0.08;
  if (direction === "out") scale = 1.16 - t * 0.08;
  if (direction === "left") {
    scale = 1.12;
    tx = interpolate(t, [0, 1], [40, -40]);
  }
  if (direction === "right") {
    scale = 1.12;
    tx = interpolate(t, [0, 1], [-40, 40]);
    ty = interpolate(t, [0, 1], [-15, 15]);
  }

  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });
  const exit = interpolate(frame, [durationInFrames - 18, durationInFrames - 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;

  const captionEnter = spring({ frame: frame - 12, fps, config: { damping: 18, stiffness: 120 } });
  const captionExit = interpolate(frame, [durationInFrames - 25, durationInFrames - 8], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cOp = captionEnter * captionExit;
  const cY = interpolate(captionEnter, [0, 1], [30, 0]);

  // Cursor drift
  const cx = interpolate(t, [0, 1], [620, 1380]);
  const cy = interpolate(t, [0, 0.5, 1], [420, 380, 540]);

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY, opacity }}>
      {/* Image with Ken Burns */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
          }}
        />
      </AbsoluteFill>

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(10,31,68,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Cursor */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          width: 28,
          height: 28,
          transform: "translate(-4px, -2px)",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.45))",
        }}
      >
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path
            d="M3 2 L3 22 L8 17 L11 23 L14 22 L11 16 L18 16 Z"
            fill="#ffffff"
            stroke="#0a1f44"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Caption bar */}
      <div
        style={{
          position: "absolute",
          left: 80,
          bottom: 80,
          maxWidth: 980,
          opacity: cOp,
          transform: `translateY(${cY}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: TEAL,
            color: "#ffffff",
            fontFamily: body.fontFamily,
            fontWeight: 600,
            letterSpacing: 2,
            fontSize: 16,
            padding: "8px 14px",
            borderRadius: 999,
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontFamily: display.fontFamily,
            color: "#ffffff",
            fontSize: 78,
            lineHeight: 1.04,
            fontWeight: 700,
            textShadow: "0 4px 30px rgba(0,0,0,0.6)",
            letterSpacing: -1,
          }}
        >
          {caption}
        </div>
      </div>

      {/* Brand chip */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 70,
          color: CREAM,
          fontFamily: display.fontFamily,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 0.5,
          textShadow: "0 2px 12px rgba(0,0,0,0.5)",
        }}
      >
        MaintenEase
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
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 110 } });
  const exit = interpolate(frame, [durationInFrames - 14, durationInFrames - 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const op = enter * exit;
  const y = interpolate(enter, [0, 1], [40, 0]);

  const bg =
    variant === "intro"
      ? `radial-gradient(circle at 30% 20%, rgba(20,184,166,0.18), transparent 55%), linear-gradient(135deg, ${NAVY} 0%, #061230 100%)`
      : variant === "outro"
      ? `radial-gradient(circle at 70% 80%, rgba(20,184,166,0.22), transparent 60%), linear-gradient(135deg, #061230 0%, ${NAVY} 100%)`
      : PAPER;

  const textColor = variant === "chapter" ? INK : "#ffffff";
  const eyebrowColor = variant === "chapter" ? TEAL : TEAL;

  // Soft animated accent line
  const lineW = interpolate(enter, [0, 1], [0, 220]);

  return (
    <AbsoluteFill
      style={{
        background: bg,
        opacity: op,
      }}
    >
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
            color: eyebrowColor,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            width: lineW,
            height: 4,
            background: TEAL,
            marginBottom: 36,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontFamily: display.fontFamily,
            color: textColor,
            fontSize: variant === "intro" ? 168 : 132,
            lineHeight: 0.98,
            fontWeight: 900,
            letterSpacing: -3,
            maxWidth: 1500,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              marginTop: 40,
              fontFamily: body.fontFamily,
              color: variant === "chapter" ? "#3b4252" : "rgba(255,255,255,0.78)",
              fontSize: 32,
              lineHeight: 1.35,
              maxWidth: 1100,
              fontWeight: 400,
            }}
          >
            {subtitle}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- Timeline ---
type Block =
  | { kind: "title"; dur: number; props: React.ComponentProps<typeof TitleCard> }
  | { kind: "shot"; dur: number; props: React.ComponentProps<typeof Shot> };

const BLOCKS: Block[] = [
  {
    kind: "title",
    dur: 110,
    props: {
      eyebrow: "MaintenEase · Product Tour",
      title: "Inside MaintenEase.",
      subtitle:
        "A walk through the actual app your team uses every day.",
      variant: "intro",
    },
  },
  {
    kind: "title",
    dur: 60,
    props: {
      eyebrow: "Chapter 01",
      title: "Your morning.",
      subtitle: "Open the app — see exactly what needs you today.",
      variant: "chapter",
    },
  },
  { kind: "shot", dur: 280, props: { src: "shots/dashboard-1.png", kicker: "01 · Daily snapshot", caption: "Completion, pending jobs, active techs — at a glance.", direction: "in" } },
  { kind: "shot", dur: 260, props: { src: "shots/requests-1.png", kicker: "02 · Request inbox", caption: "Public submissions land here. One click → work order.", direction: "left" } },
  {
    kind: "title",
    dur: 60,
    props: {
      eyebrow: "Chapter 02",
      title: "Run the work.",
      subtitle: "Triage, assign, and close jobs without the spreadsheet sprawl.",
      variant: "chapter",
    },
  },
  { kind: "shot", dur: 290, props: { src: "shots/workorders-1.png", kicker: "03 · Work orders", caption: "Right away · Up next · Being worked on · Done.", direction: "left" } },
  { kind: "shot", dur: 270, props: { src: "shots/calendar-1.png", kicker: "04 · PM scheduler", caption: "Plan preventive maintenance across the month.", direction: "in" } },
  { kind: "shot", dur: 270, props: { src: "shots/inspections-1.png", kicker: "05 · Check-ups", caption: "Compliance audits — scheduled, ongoing, historical.", direction: "out" } },
  {
    kind: "title",
    dur: 60,
    props: {
      eyebrow: "Chapter 03",
      title: "Know your facility.",
      subtitle: "Every asset, every site, every vendor — in one place.",
      variant: "chapter",
    },
  },
  { kind: "shot", dur: 270, props: { src: "shots/assets-1.png", kicker: "06 · Asset registry", caption: "24 assets · 100% uptime · live status.", direction: "in" } },
  { kind: "shot", dur: 260, props: { src: "shots/assets-2.png", kicker: "07 · Equipment", caption: "Every machine — searchable, filterable, tracked.", direction: "left" } },
  { kind: "shot", dur: 250, props: { src: "shots/locations-1.png", kicker: "08 · Places", caption: "Site hierarchy. Network health. All facilities.", direction: "right" } },
  { kind: "shot", dur: 250, props: { src: "shots/vendors-1.png", kicker: "09 · Vendors", caption: "Contractors and service providers in one directory.", direction: "out" } },
  { kind: "shot", dur: 280, props: { src: "shots/reports-1.png", kicker: "10 · Analytics", caption: "Six months of work orders, status, and trends.", direction: "in" } },
  {
    kind: "title",
    dur: 180,
    props: {
      eyebrow: "Start your free trial",
      title: "maintenease.com",
      subtitle: "No credit card. Seven days of full access. We onboard you.",
      variant: "outro",
    },
  },
];

export const TOTAL_FRAMES = BLOCKS.reduce((a, b) => a + b.dur, 0);

// Persistent subtle background grain / gradient between cuts
const BackdropPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const hue = interpolate(t, [0, 1], [220, 200]);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 65% 8%) 0%, #04081a 100%)`,
      }}
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
              <TitleCard {...b.props} />
            ) : (
              <Shot {...b.props} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};