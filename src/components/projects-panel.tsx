"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type UIEvent,
  type WheelEvent
} from "react";
import { gsap } from "gsap";
import type { Route } from "next";
import { useRouter } from "next/navigation";

import { ProjectTitleGL } from "@/components/project-title-gl";
import { useRouteTransition } from "@/components/route-transition-provider";
import { WorkPreviewCard } from "@/components/work-preview-card";
import type { ProjectItem } from "@/data/portfolio";

type ProjectsPanelProps = {
  isActive: boolean;
  projects: ProjectItem[];
};

function buildLoopedProjects(projects: ProjectItem[]) {
  if (projects.length <= 1) {
    return projects;
  }

  return [...projects, ...projects, ...projects];
}

export function ProjectsPanel({ isActive, projects }: ProjectsPanelProps) {
  const defaultSlug = projects[0]?.slug ?? null;
  const loopedProjects = useMemo(() => buildLoopedProjects(projects), [projects]);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(defaultSlug);
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const stretchResetTweenRef = useRef<gsap.core.Tween | null>(null);
  const loopSegmentHeightRef = useRef(0);
  const isNormalizingLoopRef = useRef(false);
  const initialLoopPositionPendingRef = useRef(true);
  const router = useRouter();
  const { isTransitioning, navigateTo } = useRouteTransition();

  const activeProject = useMemo(
    () => projects.find((project) => project.slug === hoveredSlug) ?? projects[0],
    [hoveredSlug, projects]
  );

  const previewMedia = useMemo(() => {
    if (!activeProject) {
      return null;
    }

    return activeProject.gallery[activeProject.preview.mediaIndex] ?? activeProject.gallery[0] ?? null;
  }, [activeProject]);

  const resetHoveredProject = () => {
    setHoveredSlug(defaultSlug);
  };

  const handleProjectBlur = (event: FocusEvent<HTMLButtonElement>) => {
    const nextFocused = event.relatedTarget;
    if (nextFocused instanceof HTMLElement && listRef.current?.contains(nextFocused)) {
      return;
    }

    resetHoveredProject();
  };

  const getListGap = (list: HTMLDivElement) => {
    const computedStyle = window.getComputedStyle(list);
    return Number.parseFloat(computedStyle.rowGap || computedStyle.gap || "0") || 0;
  };

  const getItemSpan = (list: HTMLDivElement) => {
    const firstItem = list.firstElementChild as HTMLElement | null;
    if (!firstItem) {
      return 0;
    }

    return firstItem.offsetHeight + getListGap(list);
  };

  const computeLoopSegmentHeight = (list: HTMLDivElement) => {
    const itemSpan = getItemSpan(list);
    if (itemSpan <= 0 || projects.length <= 1) {
      return 0;
    }

    return itemSpan * projects.length;
  };

  const getVisibleTitles = (list: HTMLDivElement) => {
    const listRect = list.getBoundingClientRect();
    const titles = list.querySelectorAll<HTMLElement>(".project-title-gl");

    return Array.from(titles).filter((title) => {
      const rect = title.getBoundingClientRect();
      return rect.bottom >= listRect.top - 80 && rect.top <= listRect.bottom + 80;
    });
  };

  const handleListWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!isActive) {
      return;
    }

    const titles = getVisibleTitles(event.currentTarget);
    if (!titles.length) {
      return;
    }

    const stretchAmount = Math.min(Math.abs(event.deltaY) / 1200, 0.05);
    const scaleX = 1 + stretchAmount;
    const scaleY = 1 - stretchAmount * 0.26;

    gsap.to(titles, {
      scaleX,
      scaleY,
      duration: 0.12,
      ease: "power1.out",
      overwrite: "auto"
    });

    if (stretchResetTweenRef.current) {
      stretchResetTweenRef.current.kill();
      stretchResetTweenRef.current = null;
    }

    stretchResetTweenRef.current = gsap.to(titles, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.38,
      delay: 0.03,
      ease: "power2.out",
      overwrite: "auto",
      onComplete: () => {
        stretchResetTweenRef.current = null;
      }
    });
  };

  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    if (projects.length <= 1 || isNormalizingLoopRef.current) {
      return;
    }

    const list = event.currentTarget;
    const segmentHeight = loopSegmentHeightRef.current || computeLoopSegmentHeight(list);
    if (segmentHeight <= 0) {
      return;
    }

    loopSegmentHeightRef.current = segmentHeight;

    const minTop = segmentHeight * 0.5;
    const maxTop = segmentHeight * 1.5;

    let nextTop = list.scrollTop;
    if (list.scrollTop < minTop) {
      nextTop = list.scrollTop + segmentHeight;
    } else if (list.scrollTop > maxTop) {
      nextTop = list.scrollTop - segmentHeight;
    }

    if (nextTop === list.scrollTop) {
      return;
    }

    isNormalizingLoopRef.current = true;
    list.scrollTop = nextTop;
    window.requestAnimationFrame(() => {
      isNormalizingLoopRef.current = false;
    });
  };

  useEffect(() => {
    setHoveredSlug(defaultSlug);
    loopSegmentHeightRef.current = 0;
    initialLoopPositionPendingRef.current = true;
  }, [defaultSlug, projects]);

  useLayoutEffect(() => {
    if (!listRef.current || projects.length <= 1) {
      initialLoopPositionPendingRef.current = false;
      return;
    }

    if (!initialLoopPositionPendingRef.current) {
      return;
    }

    const list = listRef.current;

    const syncInitialScrollPosition = () => {
      const segmentHeight = computeLoopSegmentHeight(list);
      if (segmentHeight <= 0) {
        window.requestAnimationFrame(syncInitialScrollPosition);
        return;
      }

      loopSegmentHeightRef.current = segmentHeight;
      isNormalizingLoopRef.current = true;
      list.scrollTop = segmentHeight;
      initialLoopPositionPendingRef.current = false;
      window.requestAnimationFrame(() => {
        isNormalizingLoopRef.current = false;
      });
    };

    syncInitialScrollPosition();
  }, [loopedProjects, projects.length]);

  useEffect(() => {
    return () => {
      if (stretchResetTweenRef.current) {
        stretchResetTweenRef.current.kill();
        stretchResetTweenRef.current = null;
      }
      isNormalizingLoopRef.current = false;
      loopSegmentHeightRef.current = 0;
    };
  }, []);

  useEffect(() => {
    if (!listRef.current || !isActive) {
      return;
    }

    const items = listRef.current.querySelectorAll<HTMLElement>("[data-project-item]");
    gsap.fromTo(
      items,
      { autoAlpha: 0, x: -36 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.72,
        stagger: 0.08,
        ease: "power3.out"
      }
    );
  }, [isActive]);

  useEffect(() => {
    if (!previewRef.current || !activeProject) {
      return;
    }

    const parts = previewRef.current.querySelectorAll<HTMLElement>("[data-preview-part]");
    const media = previewRef.current.querySelector<HTMLElement>("[data-preview-media]");
    const timeline = gsap.timeline();

    timeline.fromTo(
      previewRef.current,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.54,
        ease: "power3.out"
      }
    );

    if (media) {
      timeline.fromTo(
        media,
        { scale: 1.08, yPercent: 4 },
        {
          scale: 1,
          yPercent: 0,
          duration: 0.86,
          ease: "power3.out"
        },
        0
      );
    }

    timeline.fromTo(
      parts,
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.46,
        stagger: 0.06,
        ease: "power3.out"
      },
      0.1
    );

    return () => {
      timeline.kill();
    };
  }, [activeProject]);

  if (!activeProject || !previewMedia) {
    return null;
  }

  return (
    <div className="projects-shell" onMouseLeave={resetHoveredProject}>
      <div ref={listRef} className="projects-shell__list" onScroll={handleListScroll} onWheel={handleListWheel}>
        {loopedProjects.map((project, index) => (
          <button
            key={`${project.slug}-${index}`}
            type="button"
            data-project-item
            data-loop-segment={projects.length > 0 ? Math.floor(index / projects.length) : 0}
            className="projects-shell__item"
            data-active={project.slug === activeProject.slug}
            disabled={isTransitioning}
            onMouseEnter={() => {
              setHoveredSlug(project.slug);
              router.prefetch(`/project/${project.slug}` as Route);
            }}
            onFocus={() => {
              setHoveredSlug(project.slug);
              router.prefetch(`/project/${project.slug}` as Route);
            }}
            onBlur={handleProjectBlur}
            onClick={() => {
              void navigateTo(`/project/${project.slug}`);
            }}
          >
            <ProjectTitleGL title={project.title} active={project.slug === activeProject.slug} />
            <span className="projects-shell__meta">
              {project.year} / {project.stack}
            </span>
          </button>
        ))}
      </div>

      <div className="projects-shell__preview-frame">
        <WorkPreviewCard
          key={activeProject.slug}
          ref={previewRef}
          project={activeProject}
          media={previewMedia}
          disabled={isTransitioning}
          onActivate={() => {
            void navigateTo(`/project/${activeProject.slug}`);
          }}
        />
      </div>
    </div>
  );
}
