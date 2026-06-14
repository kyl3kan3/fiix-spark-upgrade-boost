import React from "react";
import { Composition } from "remotion";
import { MainVideo, TOTAL_FRAMES, TitlesOnly, TITLES_FRAMES, TITLE_DURS } from "./MainVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="titles"
      component={TitlesOnly}
      durationInFrames={TITLES_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    </>
  );
};