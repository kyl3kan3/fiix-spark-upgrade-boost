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

const display = loadDisplay("normal", { weights: ["600", "700"], subsets: ["latin"] });
const body = loadBody("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });

const NAVY = "#0a1f44";
const CREAM = "#f5f3ec";
const TEAL = "#14b8a6";

const ci = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Shot: React.FC<{
  src: string;
  caption: string;
  kicker: string;
  fx?: number;
  fy?: number;
  zoom?: number;
}> = ({ src, caption, kicker, fx = 0.5, fy = 0.45, zoom = 1.05 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const ease = spring({ frame, fps, config: { damping: 200, stiffness: 50, mass: 1 } });
  const scale = interpolate(ease, [0, 1], [zoom * 1.03, zoom]);
  const enter = ci(frame, [0, 14], [0, 1]);
  const exit = ci(frame, [durationInFrames - 14, durationInFrames - 1], [1, 0]);
  const opacity = enter * exit;

  const capIn = spring({ frame: frame - 10, fps, config: { damping: 200, stiffness: 80 } });
  const capOut = ci(frame, [durationInFrames - 16, durationInFrames - 4], [1, 0]);
  const capOp = capIn * capOut;
  const capY = interpolate(capIn, [0, 1], [16, 0]);
  const kickW = ci(frame, [8, 24], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#04081a", opacity }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
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
            "linear-gradient(to top, rgba(4,8,26,0.88) 0%, rgba(4,8,26,0.15) 45%, rgba(4,8,26,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 70,
          top: 56,
          color: CREAM,
          fontFamily: display.fontFamily,
          fontSize: 22,
          fontWeight: 600,
          opacity: 0.85,
        }}
      >
        MaintenEase
      </div>

      <div
        style={{
          position: "absolute",
          left: 70,
          bottom: 80,
          maxWidth: 1300,
          opacity: capOp,
          transform: `translateY(${capY}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{ width: kickW * 48, height: 2, background: TEAL, borderRadius: 2 }} />
          <div
            style={{
              fontFamily: body.fontFamily,
              color: TEAL,
              fontWeight: 600,
              letterSpacing: 3,
              fontSize: 15,
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
            fontSize: 56,
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: -1,
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
  | { kind: "shot"; dur: number; props: React.ComponentProps<typeof Shot> };

const BLOCKS: Block[] = [
  { kind: "title", dur: 90, props: { eyebrow: "MaintenEase", title: "A quick tour.", subtitle: "Inside the app — built for facilities teams.", variant: "intro" } },

  { kind: "title", dur: 55, props: { eyebrow: "01", title: "Your morning.", variant: "chapter" } },
  { kind: "shot", dur: 110, props: { src: "shots/v2/01-dashboard.png", kicker: "Dashboard", caption: "Today, at a glance.", fx: 0.5, fy: 0.35, zoom: 1.04 } },
  { kind: "shot", dur: 95, props: { src: "shots/v2/01-dashboard.png", kicker: "Completion", caption: "Every job, tracked.", fx: 0.32, fy: 0.32, zoom: 1.2 } },
  { kind: "shot", dur: 95, props: { src: "shots/v2/01-dashboard.png", kicker: "Quick actions", caption: "One tap to work.", fx: 0.5, fy: 0.58, zoom: 1.12 } },

  { kind: "title", dur: 55, props: { eyebrow: "02", title: "Requests to work.", variant: "chapter" } },
  { kind: "shot", dur: 110, props: { src: "shots/v2/02-inbox.png", kicker: "Inbox", caption: "Requests land here.", fx: 0.45, fy: 0.32, zoom: 1.04 } },
  { kind: "shot", dur: 95, props: { src: "shots/v2/03-workorders.png", kicker: "Pipeline", caption: "Right away · Up next · Done.", fx: 0.5, fy: 0.35, zoom: 1.04 } },
  { kind: "shot", dur: 110, props: { src: "shots/v2/04-wo-detail.png", kicker: "Work order", caption: "Everything in one place.", fx: 0.45, fy: 0.35, zoom: 1.04 } },

  { kind: "title", dur: 55, props: { eyebrow: "03", title: "Ahead of breakdowns.", variant: "chapter" } },
  { kind: "shot", dur: 110, props: { src: "shots/v2/05-calendar.png", kicker: "PM scheduler", caption: "A month, planned.", fx: 0.55, fy: 0.45, zoom: 1.04 } },
  { kind: "shot", dur: 100, props: { src: "shots/v2/06-checkups.png", kicker: "Compliance", caption: "Audits, handled.", fx: 0.5, fy: 0.32, zoom: 1.04 } },

  { kind: "title", dur: 55, props: { eyebrow: "04", title: "Know every asset.", variant: "chapter" } },
  { kind: "shot", dur: 100, props: { src: "shots/v2/07-equipment.png", kicker: "Registry", caption: "Your full inventory.", fx: 0.5, fy: 0.35, zoom: 1.04 } },
  { kind: "shot", dur: 95, props: { src: "shots/v2/08-asset-detail.png", kicker: "Asset detail", caption: "Specs, photos, QR.", fx: 0.5, fy: 0.45, zoom: 1.04 } },
  { kind: "shot", dur: 90, props: { src: "shots/v2/09-places.png", kicker: "Places", caption: "Sites, organized.", fx: 0.5, fy: 0.32, zoom: 1.04 } },
  { kind: "shot", dur: 90, props: { src: "shots/v2/10-vendors.png", kicker: "Vendors", caption: "Contractors on tap.", fx: 0.4, fy: 0.4, zoom: 1.04 } },

  { kind: "title", dur: 55, props: { eyebrow: "05", title: "The whole picture.", variant: "chapter" } },
  { kind: "shot", dur: 110, props: { src: "shots/v2/11-analytics.png", kicker: "Analytics", caption: "Six months of trends.", fx: 0.5, fy: 0.35, zoom: 1.04 } },
  { kind: "shot", dur: 100, props: { src: "shots/v2/12-reports.png", kicker: "Reports", caption: "Custom, on demand.", fx: 0.5, fy: 0.45, zoom: 1.04 } },

  { kind: "title", dur: 140, props: { eyebrow: "Start free", title: "maintenease.com", subtitle: "Seven days, full access — no card.", variant: "outro" } },
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
              <Shot {...(b.props as any)} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
