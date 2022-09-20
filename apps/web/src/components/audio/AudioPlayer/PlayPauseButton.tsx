import Konva from "konva";
import { RefObject, useRef } from "react";
import { Rect, RegularPolygon } from "react-konva";
import { useAudioPlayerSizes } from "./useAudioPlayerSizes";
import { useTonePlayer } from "./useTonePlayer";

type PlayPauseButtonProps = {
  player: ReturnType<typeof useTonePlayer>;
  playerSize: { width: number; height: number };
};

export function PlayPauseButton(props: PlayPauseButtonProps) {
  const { player, playerSize } = props;
  const buttonRef: RefObject<Konva.Rect> = useRef<Konva.Rect>(null);
  const { iconMargin, iconSize, waveformRect } = useAudioPlayerSizes();

  const playIcon = (
    <RegularPolygon
      fill="black"
      sides={3}
      radius={playerSize.height * 0.25}
      rotation={90}
      x={23}
      y={playerSize.height / 2}
      listening={false}
    />
  );

  const stopIcon = (
    <Rect
      fill="black"
      cornerRadius={3}
      x={iconMargin * 2}
      y={iconMargin * 2}
      width={playerSize.height - iconMargin * 4}
      height={playerSize.height - iconMargin * 4}
      listening={false}
    />
  );

  return (
    <>
      <Rect
        ref={buttonRef}
        width={iconSize}
        height={iconSize}
        fill="#ddd"
        x={iconMargin}
        y={iconMargin}
        cornerRadius={5}
        onMouseEnter={() => {
          buttonRef.current?.fill("#ccc");
          const container = buttonRef.current?.getStage()?.container();

          if (container) {
            container.style.cursor = "pointer";
          }
        }}
        onMouseLeave={() => {
          buttonRef.current?.fill("#ddd");
          const container = buttonRef.current?.getStage()?.container();

          if (container) {
            container.style.cursor = "default";
          }
        }}
        onClick={() => {
          if (player.isPlaying) {
            player.stop();
          } else {
            player.play();
          }
        }}
      />
      {player.isPlaying ? stopIcon : playIcon}
    </>
  );

  // return <Rect width={10} height={10} fill="black" cornerRadius={8} />;
}
