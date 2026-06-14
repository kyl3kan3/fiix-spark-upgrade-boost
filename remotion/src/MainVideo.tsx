import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/InterTight";

const display = loadDisplay("normal", { weights: ["300", "400", "600"], subsets: ["latin"] });
const displayIt = loadDisplay("italic", { weights: ["300", "400"], subsets: ["latin"] });
const body = loadBody("normal", { weights: ["400", "500"], subsets: ["latin"] });

const BG = "#0b0c0e";
const BONE = "#eae7df";
const COPPER = "#b9744a";
const GRAPHITE = "#5b6168";

const ci = (f: number, a: number[], b: number[]) =>
  interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const useFade = () => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  return ci(f, [0, 18], [0, 1]) * ci(f, [d - 18, d - 1], [1, 0]);
};

const Rise: React.FC<{ delay?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0,
  y = 12,
  children,
  style,
}) => {
  const f = useCurrentFrame() - delay;
  const o = ci(f, [0, 18], [0, 1]);
  const ty = interpolate(o, [0, 1], [y, 0]);
  return <div style={{ opacity: o, transform: `translateY(${ty}px)`, ...style }}>{children}</div>;
};

const TitleCard: React.FC<{
  eyebrow: string;
  title: string;
  italicWord?: string;
  subtitle?: string;
  align?: "left" | "center";
  size?: number;
}> = ({ eyebrow, title, italicWord, subtitle, align = "left", size = 124 }) => {
  const frame = useCurrentFrame();
  const op = useFade();
  const lineW = ci(frame, [10, 40], [0, 120]);

  return (
    <AbsoluteFill style={{ background: BG, opacity: op }}>
      {/* Subtle vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: align === "center" ? "center" : "flex-start",
          justifyContent: "center",
          padding: align === "center" ? "0 200px" : "0 180px",
          textAlign: align,
        }}
      >
        <Rise delay={4}>
          <div
            style={{
              fontFamily: body.fontFamily,
              color: COPPER,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: 6,
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            {eyebrow}
          </div>
        </Rise>
        <div style={{ width: lineW, height: 1, background: COPPER, marginBottom: 36, opacity: 0.8 }} />
        <Rise delay={12}>
          <div
            style={{
              fontFamily: display.fontFamily,
              color: BONE,
              fontSize: size,
              lineHeight: 1.02,
              fontWeight: 400,
              letterSpacing: -2.4,
              maxWidth: 1500,
            }}
          >
            {italicWord ? (
              <>
                {title.split(italicWord)[0]}
                <span style={{ fontFamily: displayIt.fontFamily, fontStyle: "italic", color: COPPER }}>
                  {italicWord}
                </span>
                {title.split(italicWord)[1]}
              </>
            ) : (
              title
            )}
          </div>
        </Rise>
        {subtitle && (
          <Rise delay={26} style={{ marginTop: 32 }}>
            <div
              style={{
                fontFamily: body.fontFamily,
                color: GRAPHITE,
                fontSize: 22,
                lineHeight: 1.5,
                fontWeight: 400,
                maxWidth: 720,
                letterSpacing: 0.2,
              }}
            >
              {subtitle}
            </div>
          </Rise>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Clip: React.FC<{ src: string; kicker: string; caption: string }> = ({ src, kicker, caption }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const op = useFade();
  const capOut = ci(frame, [durationInFrames - 30, durationInFrames - 14], [1, 0]);

  return (
    <AbsoluteFill style={{ background: BG, opacity: op }}>
      {/* Inset frame */}
      <AbsoluteFill style={{ padding: "80px 100px 220px 100px" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: "0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(234,231,223,0.06)",
          }}
        >
          <OffthreadVideo
            src={staticFile(src)}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Soft top vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(11,12,14,0.25) 0%, rgba(11,12,14,0) 18%, rgba(11,12,14,0) 80%, rgba(11,12,14,0.35) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Lower-third caption */}
      <div
        style={{
          position: "absolute",
          left: 100,
          right: 100,
          bottom: 70,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 60,
          opacity: capOut,
        }}
      >
        <Rise delay={14}>
          <div
            style={{
              fontFamily: display.fontFamily,
              fontStyle: "italic",
              color: BONE,
              fontSize: 40,
              fontWeight: 300,
              letterSpacing: -0.4,
              lineHeight: 1.15,
              maxWidth: 1100,
            }}
          >
            {caption}
          </div>
        </Rise>
        <Rise delay={20} style={{ paddingBottom: 8 }}>
          <div
            style={{
              fontFamily: body.fontFamily,
              color: COPPER,
              fontSize: 12,
              letterSpacing: 5,
              textTransform: "uppercase",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {kicker}
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

type Block =
  | { kind: "title"; dur: number; props: React.ComponentProps<typeof TitleCard> }
  | { kind: "clip"; dur: number; props: React.ComponentProps<typeof Clip> };

// 30fps. Clip durations match trimmed source footage (loading screens removed).
const BLOCKS: Block[] = [
  { kind: "title", dur: 180, props: { eyebrow: "MaintenEase", title: "A quieter way to run maintenance.", italicWord: "quieter", subtitle: "Sixty seconds. Real product. No theatrics." } },

  { kind: "clip", dur: 192, props: { src: "clips/trimmed/01-overview.mp4", kicker: "I · Overview", caption: "The morning, on one page." } },
  { kind: "title", dur: 90, props: { eyebrow: "Chapter II", title: "From request to work.", italicWord: "work", size: 104 } },

  { kind: "clip", dur: 504, props: { src: "clips/trimmed/02-triage.mp4", kicker: "II · Triage", caption: "Inbox becomes a work order, without ceremony." } },
  { kind: "title", dur: 90, props: { eyebrow: "Chapter III", title: "Ahead of the breakdown.", italicWord: "Ahead", size: 104 } },

  { kind: "clip", dur: 222, props: { src: "clips/trimmed/03-pm.mp4", kicker: "III · Preventive", caption: "A month, planned in minutes." } },
  { kind: "title", dur: 90, props: { eyebrow: "Chapter IV", title: "Every asset, accounted for.", italicWord: "accounted", size: 104 } },

  { kind: "clip", dur: 102, props: { src: "clips/trimmed/04-registry.mp4", kicker: "IV · Registry", caption: "Equipment, places, and the people who own them." } },
  { kind: "title", dur: 90, props: { eyebrow: "Chapter V", title: "The whole picture.", italicWord: "whole", size: 104 } },

  { kind: "clip", dur: 96, props: { src: "clips/trimmed/05-analytics.mp4", kicker: "V · Analytics", caption: "Trends, costs, and the questions you haven't asked yet." } },

  { kind: "title", dur: 120, props: { eyebrow: "Begin", title: "maintenease.com", subtitle: "Seven days, full access. No card required.", align: "center", size: 96 } },
];

export const TOTAL_FRAMES = BLOCKS.reduce((a, b) => a + b.dur, 0);

const TITLE_BLOCKS = BLOCKS.filter((b) => b.kind === "title") as Extract<Block, { kind: "title" }>[];
export const TITLE_DURS = TITLE_BLOCKS.map((b) => b.dur);
export const TITLES_FRAMES = TITLE_DURS.reduce((a, b) => a + b, 0);

export const TitlesOnly: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(185,116,74,0.05), transparent 55%), radial-gradient(circle at 80% 90%, rgba(185,116,74,0.04), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      {TITLE_BLOCKS.map((b, i) => {
        const from = cursor;
        cursor += b.dur;
        return (
          <Sequence key={i} from={from} durationInFrames={b.dur}>
            <TitleCard {...b.props} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Persistent grain */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(185,116,74,0.05), transparent 55%), radial-gradient(circle at 80% 90%, rgba(185,116,74,0.04), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      {BLOCKS.map((b, i) => {
        const from = cursor;
        cursor += b.dur;
        return (
          <Sequence key={i} from={from} durationInFrames={b.dur}>
            {b.kind === "title" ? <TitleCard {...(b.props as any)} /> : <Clip {...(b.props as any)} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
