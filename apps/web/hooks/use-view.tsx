import { useCallback, useEffect, useMemo, useState } from "react";

export type Size = "desktop" | "tablet" | "mobile";

const TABLET_UPPER_BOUNDARY = 991;
const TABLET_LOWER_BOUNDARY = 768;

const MOBILE_UPPER_BOUNDARY = 479;
const MOBILE_LOWER_BOUNDARY = 320;

const DESKTOP_UPPER_BOUNDARY = 1200;
const DESKTOP_LOWER_BOUNDARY = 992;

const DEFAULT_BOUNDARY_WIDTH = 479;

export const useView = ({
  defaultView = "desktop",
  boundaryRef,
}: {
  defaultView?: Size;
  boundaryRef: React.RefObject<HTMLDivElement | null>;
}) => {
  function getWidth(view: Size, width: number, boundaryWidth: number) {
    switch (view) {
      case "desktop":
        return Math.min(
          Math.min(DESKTOP_UPPER_BOUNDARY, boundaryWidth),
          Math.max(DESKTOP_LOWER_BOUNDARY, width)
        );
      case "tablet":
        return Math.min(
          Math.min(TABLET_UPPER_BOUNDARY, boundaryWidth),
          Math.max(TABLET_LOWER_BOUNDARY, width)
        );
      case "mobile":
        return Math.min(
          Math.min(MOBILE_UPPER_BOUNDARY, boundaryWidth),
          Math.max(MOBILE_LOWER_BOUNDARY, width)
        );
    }
  }

  const getBoundaryWidth = useCallback(
    () => boundaryRef?.current?.offsetWidth ?? DEFAULT_BOUNDARY_WIDTH,
    [boundaryRef.current]
  );

  const [view, setView] = useState<Size>(defaultView);
  const [width, setWidth] = useState(
    getWidth(defaultView, getBoundaryWidth(), getBoundaryWidth())
  );

  useEffect(() => {
    if (!boundaryRef?.current) return;
    setWidth(
      getWidth(view, boundaryRef.current.offsetWidth, getBoundaryWidth())
    );
  }, [boundaryRef.current]);

  return {
    view,
    setView: (view: Size) => {
      setView(view);
      setWidth(
        getWidth(
          view,
          boundaryRef?.current?.offsetWidth ?? DEFAULT_BOUNDARY_WIDTH,
          getBoundaryWidth()
        )
      );
    },
    width,
    setWidth: (width: number) => {
      setWidth(getWidth(view, width, getBoundaryWidth()));
    },
  };
};
