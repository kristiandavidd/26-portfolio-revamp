"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, VolumeX } from "lucide-react";

/**
 * The track lives at the layout level, so it keeps playing across routes.
 *
 * The portfolio starts silent. Personal starts it on load: browsers only allow
 * audible playback after a gesture, so the track begins muted and the first
 * interaction turns the sound on instead of waiting for a click on the button.
 */
export function MusicToggle({
  src,
  autoPlay = false,
}: {
  src: string;
  autoPlay?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  // Autoplay can start before hydration attaches the listeners, so the first
  // render would otherwise show a play icon while the track is already running.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setPlaying(!audio.paused);
    setMuted(audio.muted);
  }, []);

  useEffect(() => {
    if (!autoPlay) return;

    const element = audioRef.current;
    if (!element) return;
    const audio: HTMLAudioElement = element;

    const onFirstGesture = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-music-toggle]")) {
        return;
      }
      release();
    };

    function release() {
      audio.muted = false;
      setMuted(false);
      void audio.play().catch(() => { });
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
    }

    void audio.play().then(
      () => { },
      () => {
        // Blocked as audible: keep the loop running muted so the song is
        // already at the right moment when the sound is allowed.
        audio.muted = true;
        setMuted(true);
        void audio.play().catch(() => { });
        window.addEventListener("pointerdown", onFirstGesture);
        window.addEventListener("keydown", onFirstGesture);
        window.addEventListener("touchstart", onFirstGesture);
      },
    );

    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
    };
  }, [autoPlay]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.muted) {
      audio.muted = false;
      setMuted(false);
      void audio.play().catch(() => { });
      return;
    }

    if (audio.paused) void audio.play().catch(() => { });
    else audio.pause();
  }

  const label = muted
    ? "Turn music sound on"
    : playing
      ? "Pause music"
      : "Play music";

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        autoPlay={autoPlay}
        preload={autoPlay ? "auto" : "none"}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onVolumeChange={() => setMuted(audioRef.current?.muted ?? false)}
      />

      <button
        type="button"
        data-music-toggle
        onClick={toggle}
        aria-label={label}
        aria-pressed={playing && !muted}
        title={label}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white/90 text-black/55 shadow-lg backdrop-blur transition-colors hover:text-orange"
      >
        {muted ? (
          <VolumeX size={16} aria-hidden />
        ) : playing ? (
          <Pause size={16} aria-hidden />
        ) : (
          <Play size={16} aria-hidden />
        )}
      </button>
    </>
  );
}
