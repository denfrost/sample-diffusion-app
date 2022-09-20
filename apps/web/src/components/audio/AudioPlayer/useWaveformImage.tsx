import { useEffect, useState } from "react";

export function useWaveformImage(
  waveform: Float32Array | null,
  width: number,
  height: number
) {
  const [waveformLines, setWaveformLines] = useState<number[][]>([]);

  useEffect(() => {
    if (!waveform) {
      return;
    }

    const samplesPerPixel = waveform.length / width;

    const lines: number[][] = [];

    for (let x = 0; x < width; x++) {
      let low = 0;
      let high = 0;

      for (let n = 0; n < samplesPerPixel; n++) {
        const sample = waveform[Math.floor(x * samplesPerPixel + n)];
        if (sample < low) {
          low = sample;
        }
        if (sample > high) {
          high = sample;
        }
      }

      const clamp = (v: number) => Math.max(-0.45, Math.min(0.45, v));

      lines.push([
        x + 2,
        clamp(high) * height + height / 2,
        x + 2,
        clamp(-high) * height + height / 2,
      ]);
    }

    setWaveformLines(lines);
  }, [height, waveform, width]);

  return waveformLines;
}
