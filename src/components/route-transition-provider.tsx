"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

import {
  TransitionOverlay,
  type TransitionOverlayHandle
} from "@/components/transition-overlay";

type RouteTransitionContextValue = {
  isTransitioning: boolean;
  playTransition: (task: () => void) => Promise<void>;
  navigateTo: (href: string) => Promise<void>;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const overlayRef = useRef<TransitionOverlayHandle>(null);
  const transitioningRef = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const playTransition = useCallback(
    async (task: () => void) => {
      if (transitioningRef.current || !overlayRef.current) {
        return;
      }

      transitioningRef.current = true;
      setIsTransitioning(true);
      await overlayRef.current.play(() => {
        task();
      });
      setIsTransitioning(false);
      transitioningRef.current = false;
    },
    []
  );

  const navigateTo = useCallback(
    async (href: string) => {
      await playTransition(() => {
        startTransition(() => {
          router.push(href as Route, { scroll: false });
        });
      });
    },
    [playTransition, router]
  );

  const value = useMemo(
    () => ({
      isTransitioning,
      playTransition,
      navigateTo
    }),
    [isTransitioning, navigateTo, playTransition]
  );

  return (
    <RouteTransitionContext.Provider value={value}>
      {children}
      <TransitionOverlay ref={overlayRef} />
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext);

  if (!context) {
    throw new Error("useRouteTransition must be used inside RouteTransitionProvider.");
  }

  return context;
}
