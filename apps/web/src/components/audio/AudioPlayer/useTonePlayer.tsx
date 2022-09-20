import { useState, useRef, useEffect } from "react";
import * as Tone from "tone";

type TonePlayerOpts = {
  onPlay?: (player: Tone.Player, value: number) => void;
  onPause?: () => void;
  onStop?: () => void;
};

export function useTonePlayer(audioPath: string, opts?: TonePlayerOpts) {
  const { onPlay, onStop } = { ...opts };

  const [isLoaded, setLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveform, setWaveform] = useState<Float32Array | null>(null);
  const playerRef = useRef<Tone.Player | null>(null);

  useEffect(() => {
    const player = new Tone.Player(audioPath, () => {
      setLoaded(true);
      setWaveform(player.buffer?.getChannelData(0));
    }).toDestination();

    playerRef.current = player;
  }, [audioPath]);

  const play = () => {
    if (playerRef.current) {
      playerRef.current.start();
      setIsPlaying(true);
      onPlay?.(playerRef.current, 0);
    }
  };

  const playAt = (value: number) => {
    if (playerRef.current) {
      playerRef.current.start();
      playerRef.current.seek(value * playerRef.current.buffer.duration);
      setIsPlaying(true);
      onPlay?.(playerRef.current, value);
    }
  };

  const stop = () => {
    if (playerRef.current) {
      playerRef.current.stop();
      setIsPlaying(false);
      onStop?.();
    }
  };

  return {
    isLoaded,
    isPlaying,
    play,
    playAt,
    stop,
    waveform,
    get() {
      return playerRef.current;
    },
  };
}
