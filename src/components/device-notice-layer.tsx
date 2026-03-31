"use client";

import { useEffect, useState } from "react";

import { deviceNoticeContent, type DeviceNoticeVariant } from "@/data/portfolio";

type DeviceNoticeState = {
  variant: DeviceNoticeVariant | null;
  width: number;
  height: number;
};

function getDeviceNoticeState(): DeviceNoticeState {
  if (typeof window === "undefined") {
    return { variant: null, width: 0, height: 0 };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isPortrait = height > width;
  const prefersCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isCompactWindow = width < 1100 || height < 720;
  const shouldUseDesktop = prefersCoarsePointer && width < 1366;

  if (isPortrait && width < 1180) {
    return { variant: "portrait", width, height };
  }

  if (shouldUseDesktop) {
    return { variant: "desktop", width, height };
  }

  if (isCompactWindow) {
    return { variant: "compact", width, height };
  }

  return { variant: null, width, height };
}

export function DeviceNoticeLayer() {
  const [state, setState] = useState<DeviceNoticeState>({ variant: null, width: 0, height: 0 });

  useEffect(() => {
    const updateState = () => {
      setState(getDeviceNoticeState());
    };

    updateState();
    window.addEventListener("resize", updateState);
    window.addEventListener("orientationchange", updateState);

    return () => {
      window.removeEventListener("resize", updateState);
      window.removeEventListener("orientationchange", updateState);
    };
  }, []);

  if (!state.variant) {
    return null;
  }

  const content = deviceNoticeContent[state.variant];

  return (
    <div className="device-notice-layer" role="alert" aria-live="polite">
      <div className="device-notice-layer__panel">
        <span className="device-notice-layer__flag" />
        <p className="device-notice-layer__kicker">Viewport notice</p>
        <h2 className="device-notice-layer__title">{content.title}</h2>
        <p className="device-notice-layer__body">{content.body}</p>
        <div className="device-notice-layer__meta">
          <span>
            {state.width} x {state.height}
          </span>
          <span>{content.note}</span>
        </div>
      </div>
    </div>
  );
}
