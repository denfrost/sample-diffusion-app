export function useAudioPlayerSizes() {
  const playerSize = { width: 300, height: 50 };
  const iconMargin = 7;
  const iconSize = playerSize.height - iconMargin * 2;
  const waveformRect = {
    x: iconMargin * 2 + iconSize,
    y: iconMargin,
    width: playerSize.width - (iconMargin * 3 + iconSize),
    height: iconSize,
    fill: "#ddd",
    cornerRadius: 5,
  };

  return {
    playerSize,
    iconMargin,
    iconSize,
    waveformRect,
  };
}
