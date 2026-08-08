"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const FALLBACK_LINE_HEIGHT = 16;

function normalizeWheelDelta(
  element: HTMLDivElement,
  delta: number,
  deltaMode: number,
) {
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
    const lineHeight = Number.parseFloat(
      window.getComputedStyle(element).lineHeight,
    );

    return delta * (Number.isFinite(lineHeight) ? lineHeight : FALLBACK_LINE_HEIGHT);
  }

  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return delta * window.innerHeight;
  }

  return delta;
}

export function HorizontalScrollArea({
  className,
  onWheel,
  ...props
}: React.ComponentProps<"div">) {
  const handleWheel = React.useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      onWheel?.(event);

      if (event.defaultPrevented) {
        return;
      }

      const element = event.currentTarget;

      if (element.scrollWidth <= element.clientWidth + 1 || event.shiftKey) {
        return;
      }

      const deltaX = normalizeWheelDelta(element, event.deltaX, event.deltaMode);
      const deltaY = normalizeWheelDelta(element, event.deltaY, event.deltaMode);

      if (deltaY === 0 || Math.abs(deltaY) <= Math.abs(deltaX)) {
        return;
      }

      event.preventDefault();
      window.scrollBy({
        top: deltaY,
        left: 0,
        behavior: "auto",
      });
    },
    [onWheel],
  );

  return (
    <div
      className={cn("overflow-x-auto", className)}
      onWheel={handleWheel}
      {...props}
    />
  );
}
