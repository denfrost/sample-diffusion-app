import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useRef } from "react";
import { Layer, Line, Rect, Stage } from "react-konva";
import * as Tone from "tone";
import { useKonvaAnimation } from "../../../hooks/useKonvaAnimation";
import { PlayPauseButton } from "./PlayPauseButton";
import { useAudioPlayerSizes } from "./useAudioPlayerSizes";
import { useTonePlayer } from "./useTonePlayer";
import { useWaveformImage } from "./useWaveformImage";

export interface AudioPlayerProps {
  audioPath: string;
}

export default function AudioPlayer(props: AudioPlayerProps) {
  const { audioPath } = props;

  const cursorRef = useRef<Konva.Rect>(null);
  const positionRef = useRef(0);
  const startTimeRef = useRef(0);

  const { playerSize, waveformRect } = useAudioPlayerSizes();

  const tonePlayer = useTonePlayer(audioPath, {
    onPlay: (player, value) => {
      positionRef.current = 0;
      startTimeRef.current =
        Tone.Transport.now() - value * player.buffer.duration;
      cursorRef.current?.visible(true);
      cursorRef.current?.x(waveformRect.x + value * waveformRect.width);
    },
    onStop: () => {
      positionRef.current = 0;
      cursorRef.current?.visible(false);
    },
  });

  const waveformLines = useWaveformImage(
    tonePlayer.waveform,
    waveformRect.width,
    waveformRect.height
  );

  useKonvaAnimation(
    (frame) => {
      if (!frame) return;
      const player = tonePlayer.get();
      if (!player) return;
      const buffer = player.buffer;
      if (!buffer) return;
      const cursor = cursorRef.current;
      if (!cursor) return;

      const position =
        (Tone.Transport.now() - startTimeRef.current) / player.buffer.duration;

      const x = waveformRect.x + position * waveformRect.width;
      cursor.x(x);

      if (position > 1 || x + 3 > waveformRect.x + waveformRect.width) {
        cursor.visible(false);
        tonePlayer.stop();
      }
    },
    {
      disabled: !tonePlayer.isPlaying,
    }
  );

  return (
    <div style={{ margin: "8px" }}>
      <Stage width={playerSize.width} height={playerSize.height}>
        <Layer>
          <Rect
            width={playerSize.width}
            height={playerSize.height}
            fill="white"
            cornerRadius={8}
          />
          <PlayPauseButton player={tonePlayer} playerSize={playerSize} />
          <Rect
            {...waveformRect}
            onClick={(evt: KonvaEventObject<MouseEvent>) => {
              const pointerPosition = evt.target
                .getStage()
                ?.getPointerPosition();

              if (pointerPosition) {
                const x =
                  (pointerPosition.x - evt.target.x()) / evt.target.width();
                tonePlayer.playAt(x);
              }
            }}
          />
          {waveformLines.map((points, index) => {
            if (index % 3 == 0) {
              return (
                <Line
                  key={index}
                  x={waveformRect.x}
                  y={waveformRect.y}
                  points={points}
                  stroke="black"
                  strokeWidth={2.15}
                  lineCap="round"
                  listening={false}
                />
              );
            } else {
              return undefined;
            }
          })}
          <Rect
            ref={cursorRef}
            x={waveformRect.x}
            y={waveformRect.y}
            width={3}
            height={waveformRect.height}
            fill="cornflowerblue"
            visible={false}
            cornerRadius={2}
          />
        </Layer>
      </Stage>
    </div>
  );
}
