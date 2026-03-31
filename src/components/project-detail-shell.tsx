"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties
} from "react";
import { gsap } from "gsap";
import type { Route } from "next";
import { useRouter } from "next/navigation";

import { ProjectGalleryImage } from "@/components/project-gallery-image";
import { useRouteTransition } from "@/components/route-transition-provider";
import type { ProjectItem } from "@/data/portfolio";

type ProjectDetailShellProps = {
  project: ProjectItem;
  previousProject: ProjectItem;
  nextProject: ProjectItem;
};

type ProjectNavigationDirection = "prev" | "next";

const PROJECT_NAVIGATION_DIRECTION_KEY = "portfolio-project-navigation-direction";

function getEntryOffset(direction: ProjectNavigationDirection | null) {
  if (direction === "next") {
    return 84;
  }

  if (direction === "prev") {
    return -84;
  }

  return 0;
}

export function ProjectDetailShell({
  project,
  previousProject,
  nextProject
}: ProjectDetailShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const exitTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isDirectionalTransitioning, setIsDirectionalTransitioning] = useState(false);
  const router = useRouter();
  const { isTransitioning, navigateTo } = useRouteTransition();
  const isNavigationLocked = isTransitioning || isDirectionalTransitioning;

  useEffect(() => {
    router.prefetch(`/project/${previousProject.slug}` as Route);
    router.prefetch(`/project/${nextProject.slug}` as Route);
  }, [nextProject.slug, previousProject.slug, router]);

  useEffect(() => {
    return () => {
      exitTimelineRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    exitTimelineRef.current?.kill();
    exitTimelineRef.current = null;
    setIsDirectionalTransitioning(false);
  }, [project.slug]);

  const navigateBetweenProjects = useCallback(
    (direction: ProjectNavigationDirection, href: string) => {
      if (!rootRef.current || !galleryRef.current || isNavigationLocked) {
        return;
      }

      const title = rootRef.current.querySelector<HTMLElement>("[data-project-title]");
      const revealItems =
        rootRef.current.querySelectorAll<HTMLElement>("[data-project-reveal]");
      const secondaryItems = Array.from(revealItems).filter((item) => item !== title);
      const exitOffset = direction === "next" ? -72 : 72;

      exitTimelineRef.current?.kill();
      setIsDirectionalTransitioning(true);

      const timeline = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          window.sessionStorage.setItem(PROJECT_NAVIGATION_DIRECTION_KEY, direction);
          startTransition(() => {
            router.push(href as Route, { scroll: false });
          });
        }
      });

      exitTimelineRef.current = timeline;

      if (title) {
        timeline.to(
          title,
          {
            x: exitOffset,
            autoAlpha: 0.22,
            filter: "brightness(0.34) blur(8px)",
            duration: 0.42
          },
          0
        );
      }

      if (secondaryItems.length) {
        timeline.to(
          secondaryItems,
          {
            x: exitOffset * 0.72,
            autoAlpha: 0,
            duration: 0.34,
            stagger: 0.035
          },
          0.03
        );
      }

      timeline.to(
        galleryRef.current,
        {
          x: exitOffset * 0.42,
          autoAlpha: 0.42,
          scale: 0.985,
          duration: 0.42
        },
        0
      );
    },
    [isNavigationLocked, router]
  );

  useLayoutEffect(() => {
    if (!rootRef.current || !galleryRef.current) {
      return;
    }

    const context = gsap.context(() => {
      const title = rootRef.current?.querySelector<HTMLElement>("[data-project-title]") ?? null;
      const items = rootRef.current?.querySelectorAll<HTMLElement>("[data-project-reveal]") ?? [];
      const secondaryItems = Array.from(items).filter((item) => item !== title);
      const cards = rootRef.current?.querySelectorAll<HTMLElement>("[data-gallery-card]") ?? [];
      const storedDirection = window.sessionStorage.getItem(PROJECT_NAVIGATION_DIRECTION_KEY);
      const navigationDirection =
        storedDirection === "prev" || storedDirection === "next"
          ? storedDirection
          : null;
      const entryOffset = getEntryOffset(navigationDirection);
      const galleryEntryOffset =
        navigationDirection === null ? 0 : Math.round(entryOffset * 0.42);

      if (storedDirection) {
        window.sessionStorage.removeItem(PROJECT_NAVIGATION_DIRECTION_KEY);
      }

      const introTimeline = gsap.timeline();

      if (title) {
        introTimeline.fromTo(
          title,
          {
            autoAlpha: 0,
            x: entryOffset,
            y: navigationDirection ? 0 : 26,
            filter: "brightness(0.34) blur(8px)"
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            filter: "brightness(1) blur(0px)",
            duration: 0.82,
            ease: "power4.out"
          }
        );
      }

      if (secondaryItems.length) {
        introTimeline.fromTo(
          secondaryItems,
          {
            autoAlpha: 0,
            x: entryOffset * 0.58,
            y: navigationDirection ? 12 : 26
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            duration: 0.7,
            stagger: 0.07,
            ease: "power3.out"
          },
          title ? 0.08 : 0
        );
      }

      introTimeline.fromTo(
        galleryRef.current,
        {
          autoAlpha: navigationDirection ? 0.38 : 0,
          x: galleryEntryOffset,
          scale: navigationDirection ? 0.986 : 1
        },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          duration: 0.78,
          ease: "power3.out"
        },
        title ? 0.14 : 0.06
      );

      const maxHighlightCards = 2;
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const card = entry.target as HTMLElement;
            const index = Number(card.dataset.cardIndex ?? "0");
            card.classList.remove("is-pre-reveal");
            card.classList.add("is-revealed");

            if (index < maxHighlightCards) {
              card.classList.add("is-highlight-revealed");
            }

            observer.unobserve(card);
          });
        },
        {
          root: galleryRef.current,
          threshold: 0.22,
          rootMargin: "0px 0px -8% 0px"
        }
      );

      cards.forEach((card, index) => {
        card.dataset.cardIndex = String(index);
        card.classList.remove("is-revealed", "is-highlight-revealed");
        card.classList.add("is-pre-reveal");
        revealObserver.observe(card);
      });

      return () => {
        revealObserver.disconnect();
      };
    }, rootRef);

    return () => context.revert();
  }, [project.slug]);

  return (
    <main ref={rootRef} className="project-page">
      <div className="portfolio-shell__background" />
      <div className="portfolio-shell__rail" />

      <div className="project-page__layout">
        <section className="project-page__info">
          <nav data-project-reveal className="project-page__nav" aria-label="Project navigation">
            <button
              type="button"
              className="project-page__nav-button"
              disabled={isNavigationLocked}
              onClick={() => {
                void navigateTo("/#projects");
              }}
            >
              close
            </button>
            <div className="project-page__nav-group">
              <button
                type="button"
                className="project-page__nav-button"
                disabled={isNavigationLocked}
                onClick={() => {
                  navigateBetweenProjects("prev", `/project/${previousProject.slug}`);
                }}
              >
                prev
              </button>
              <button
                type="button"
                className="project-page__nav-button"
                disabled={isNavigationLocked}
                onClick={() => {
                  navigateBetweenProjects("next", `/project/${nextProject.slug}`);
                }}
              >
                next
              </button>
            </div>
          </nav>

          <div className="project-page__meta">
            <span data-project-reveal className="project-page__date">
              {project.year}
            </span>
            <span data-project-reveal className="project-page__agency">
              {project.agency}
            </span>
          </div>

          <header className="project-page__header">
            <p data-project-reveal className="section-kicker">
              {project.client}
            </p>
            <h1 data-project-reveal data-project-title className="display-title display-title--compact">
              {project.title}
            </h1>
          </header>

          <div className="project-page__copy">
            <p data-project-reveal className="body-copy">
              {project.description}
            </p>
            <p data-project-reveal className="project-page__stack">
              <span>STACK</span> {project.stack}
            </p>
          </div>

          <div data-project-reveal className="project-page__actions">
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="project-page__live-link">
              see it live
            </a>
            <p className="project-page__summary">{project.summary}</p>
          </div>
        </section>

        <section ref={galleryRef} className="project-page__gallery">
          {project.gallery.map((item, index) => (
            <article
              key={item.label}
              data-gallery-card
              className="project-page__card is-pre-reveal"
              data-layout={item.layout}
              data-rhythm={item.rhythm}
              data-tone={item.tone}
              data-copy-align={item.copyAlign}
              style={
                {
                  "--project-card-min-height": `${item.height}px`,
                  "--project-media-aspect-ratio": item.aspectRatio
                } as CSSProperties
              }
            >
              <div className="project-page__card-material" data-gallery-material aria-hidden="true">
                <div className="project-page__card-grid" />
                <div className="project-page__card-grain" />
                <div
                  className="project-page__card-sheen"
                  data-gallery-material-sheen
                />
              </div>
              <div data-gallery-media className="project-page__media-shell">
                <div className="project-page__image-frame">
                  <div className="project-page__image-backplate" aria-hidden="true" />
                  <ProjectGalleryImage
                    realSrc={item.realSrc}
                    fallbackSrc={item.fallbackSrc}
                    alt={item.imageAlt}
                    priority={index === 0}
                    sizes="(max-width: 900px) 100vw, 56vw"
                    objectPosition={item.crop.detailPosition}
                    mobileObjectPosition={item.crop.mobilePosition}
                    scale={item.crop.detailScale ?? 1}
                  />
                  <div className="project-page__image-grain" aria-hidden="true" />
                  <div className="project-page__image-scan" data-gallery-scan aria-hidden="true" />
                  <div className="project-page__image-shutter" data-gallery-shutter aria-hidden="true" />
                  <div className="project-page__image-outline" data-gallery-outline aria-hidden="true" />
                </div>
              </div>
              <div data-gallery-copy className="project-page__card-copy">
                <div className="project-page__card-copy-top">
                  <span>{item.label}</span>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                </div>
                <p>{item.caption}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
