
import React, { useRef, useImperativeHandle, forwardRef } from "react";

export type NotificationSoundHandle = {
  play: () => void;
};

const NotificationSound = forwardRef<NotificationSoundHandle>((_, ref) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useImperativeHandle(ref, () => ({
    play: () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    },
  }));

  return (
    <audio ref={audioRef} preload="auto">
      {/* Replace this with your custom sound if you wish */}
      <source src="https://cdn.jsdelivr.net/gh/sindresorhus/notify-sound-files@main/sounds/audio_notification.mp3" type="audio/mpeg" />
      {/* fallback */}
      <source src="https://cdn.jsdelivr.net/gh/sindresorhus/notify-sound-files@main/sounds/audio_notification.ogg" type="audio/ogg" />
    </audio>
  );
});

export default NotificationSound;
