"use client";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import classNames from "classnames";
import { create, ICanvas } from "pinch-zoom-pan";

import css from "./PinchZoomPan.module.css";

interface PinchZoomPanProps {
  min?: number;
  max?: number;
  captureWheel?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export interface PinchZoomPanRef {
  focusElement: (selector: string, zoom?: number) => void;
  reset: () => void;
}

export const PinchZoomPan = React.memo(
  forwardRef<PinchZoomPanRef, PinchZoomPanProps>(function PinchZoomPan(
    { min, max, captureWheel, className, style, children },
    ref
  ) {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Readonly<ICanvas>>();

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const canvas = create({
      element,
      minZoom: min,
      maxZoom: max,
      captureWheel,
    });
    canvasRef.current = canvas;

    return () => {
      canvas.destroy();
      canvasRef.current = undefined;
    };
  }, [min, max, captureWheel]);

  useImperativeHandle(ref, () => ({
    focusElement: (selector: string, zoom = 1.8) => {
      const element = root.current;
      const canvas = canvasRef.current;
      const target = element?.querySelector<HTMLElement>(selector);

      if (!element || !canvas || !target) return;

      const rootRect = element.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;
      const viewportCenterX = rootRect.left + rootRect.width / 2;
      const viewportCenterY = rootRect.top + rootRect.height / 2;

      canvas.update((prev) => {
        const nextZoom = Math.min(Math.max(zoom, min || 0.3), max || 5);
        const localX = (targetCenterX - rootRect.left - prev.x) / prev.z;
        const localY = (targetCenterY - rootRect.top - prev.y) / prev.z;

        return {
          x: viewportCenterX - rootRect.left - localX * nextZoom,
          y: viewportCenterY - rootRect.top - localY * nextZoom,
          z: nextZoom,
        };
      });
    },
    reset: () => canvasRef.current?.reset(),
  }));

  return (
    <div ref={root} className={classNames(className, css.root)} style={style}>
      <div className={css.point}>
        <div className={css.canvas}>
          <div className={css.highResWrapper}>{children}</div>
        </div>
      </div>
    </div>
  );
  })
);
