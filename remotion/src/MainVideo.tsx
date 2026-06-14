import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const display = loadDisplay("normal", { weights: ["600", "700"], subsets: ["latin"] });
const body = loadBody("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });

const NAVY = "#0a1f44";
const CREAM = "#f5f3ec";
const TEAL = "#14b8a6";

const ci = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Clip: React.FC<{
  src: string;
  caption: string;
  kicker: string;
}> = ({ src, caption, kicker }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const enter = ci(frame, [0, 10], [0, 1]);
  const exit = ci(frame, [durationInFrames - 10, durationInFrames - 1], [1, 0]);
  const opacity = enter * exit;

  const capIn = spring({ frame: frame - 8, fps, config: { damping: 200, stiffness: 80 } });
  const capOut = ci(frame, [durationInFrames - 22, durationInFrames - 8], [1, 0]);
  const capOp = capIn * capOut;
  const capY = interpolate(capIn, [0, 1], [14, 0]);
  const kickW = ci(frame, [6, 22], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#04081a", opacity }}>
      <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(4,8,26,0.85) 0%, rgba(4,8,26,0.1) 38%, rgba(4,8,26,0) 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 60,
          bottom: 56,
          maxWidth: 1300,
          opacity: capOp,
          transform: `translateY(${capY}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: kickW * 40, height: 2, background: TEAL, borderRadius: 2 }} />
          <div
            style={{
              fontFamily: body.fontFamily,
              color: TEAL,
              fontWeight: 600,
              letterSpacing: 3,
              fontSize: 13,
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
            fontSize: 44,
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: -0.5,
            textShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
        >
          {caption}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TitleCard: React.FC<{
  eyebrow: string;
  title: string;
  subtitle?: string;
  variant?: "intro" | "chapter" | "outro";
}> = ({ eyebrow, title, subtitle, variant = "chapter" }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200, stiffness: 70 } });
  const exit = ci(frame, [durationInFrames - 14, durationInFrames - 1], [1, 0]);
  const op = enter * exit;
  const y = interpolate(enter, [0, 1], [18, 0]);

  const bg =
    variant === "intro"
      ? `radial-gradient(circle at 30% 20%, rgba(20,184,166,0.14), transparent 55%), linear-gradient(135deg, ${NAVY} 0%, #04081a 100%)`
      : variant === "outro"
      ? `radial-gradient(circle at 70% 80%, rgba(20,184,166,0.12), transparent 60%), linear-gradient(135deg, #04081a 0%, ${NAVY} 100%)`
      : `linear-gradient(135deg, ${NAVY} 0%, #04081a 100%)`;

  const lineW = interpolate(enter, [0, 1], [0, 140]);

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
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: 5,
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ width: lineW, height: 2, background: TEAL, marginBottom: 28, borderRadius: 2, opacity: 0.7 }} />
        <div
          style={{
            fontFamily: display.fontFamily,
            color: "#ffffff",
            fontSize: variant === "intro" ? 104 : 88,
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: -2,
            maxWidth: 1600,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              marginTop: 28,
              fontFamily: body.fontFamily,
              color: "rgba(255,255,255,0.7)",
              fontSize: 24,
              lineHeight: 1.4,
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
  | { kind: "clip"; dur: number; props: React.ComponentProps<typeof Clip> };

const BLOCKS: Block[] = [
  { kind: "title", dur: 75, props: { eyebrow: "MaintenEase", title: "A quick tour.", subtitle: "Live inside the app — every click is real.", variant: "intro" } },

  { kind: "title", dur: 45, props: { eyebrow: "01", title: "Your morning.", variant: "chapter" } },
  { kind: "clip", dur: 289, props: { src: "clips/01-overview.mp4", kicker: "Dashboard", caption: "Today, at a glance." } },

  { kind: "title", dur: 45, props: { eyebrow: "02", title: "Requests to work.", variant: "chapter" } },
  { kind: "clip", dur: 574, props: { src: "clips/02-triage.mp4", kicker: "Triage", caption: "Inbox → work order → done." } },

  { kind: "title", dur: 45, props: { eyebrow: "03", title: "Ahead of breakdowns.", variant: "chapter" } },
  { kind: "clip", dur: 295, props: { src: "clips/03-pm.mp4", kicker: "PM & compliance", caption: "A month, planned." } },

  { kind: "title", dur: 45, props: { eyebrow: "04", title: "Know every asset.", variant: "chapter" } },
  { kind: "clip", dur: 535, props: { src: "clips/04-registry.mp4", kicker: "Registry", caption: "Equipment · places · vendors." } },

  { kind: "title", dur: 45, props: { eyebrow: "05", title: "The whole picture.", variant: "chapter" } },
  { kind: "clip", dur: 430, props: { src: "clips/05-analytics.mp4", kicker: "Analytics", caption: "Trends and custom reports." } },

  { kind: "title", dur: 120, props: { eyebrow: "Start free", title: "maintenease.com", subtitle: "Seven days, full access — no card.", variant: "outro" } },
];

export const TOTAL_FRAMES = BLOCKS.reduce((a, b) => a + b.dur, 0);

export const MainVideo: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      {BLOCKS.map((b, i) => {
        const from = cursor;
        cursor += b.dur;
        return (
          <Sequence key={i} from={from} durationInFrames={b.dur}>
            {b.kind === "title" ? (
              <TitleCard {...(b.props as any)} />
            ) : (
              <Clip {...(b.props as any)} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
