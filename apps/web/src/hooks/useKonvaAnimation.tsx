import Konva from "konva";
import { IFrame } from "konva/lib/types";
import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export type AnimateFunc = (frame: IFrame) => boolean | void;

export type KonvaAnimationOptions = {
  disabled?: boolean;
  layer?: Konva.Layer;
};

export function useKonvaAnimation(
  animateFunc: AnimateFunc,
  options?: KonvaAnimationOptions
) {
  const disabled = options?.disabled;
  const layer = options?.layer;

  const savedAnimateFunc = useRef(animateFunc);

  useIsomorphicLayoutEffect(() => {
    savedAnimateFunc.current = animateFunc;
  }, [animateFunc]);

  useEffect(() => {
    if (disabled) return;

    const animation = new Konva.Animation((frame) => {
      if (!frame) return;
      return savedAnimateFunc.current(frame);
    }, layer);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [disabled, layer]);
}
