"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import {
  aboutCopy,
  aboutTracks,
  collaborations,
  contactLinks,
  menuItems,
  projects,
  siteIdentity
} from "@/data/portfolio";
import { DeviceNoticeLayer } from "@/components/device-notice-layer";
import { HomeHeroStage } from "@/components/home-hero-stage";
import { HomeIntroOverlay } from "@/components/home-intro-overlay";
import { ProjectsPanel } from "@/components/projects-panel";
import { RedSquareLayer } from "@/components/red-square-layer";
import { useRouteTransition } from "@/components/route-transition-provider";
import { SectionMenu } from "@/components/section-menu";
import { TextType, VariableProximityText } from "@/components/text-type";
import { Waves } from "@/components/waves";
import { WorkSilk } from "@/components/work-silk";
import { AboutColorBends } from "@/components/about-color-bends";
import { BorderGlow } from "@/components/border-glow";
import { ScrambledText } from "@/components/scrambled-text";
import { WhoMorphCanvas } from "@/components/who-morph-canvas";
import { isSectionId, type SectionId } from "@/lib/section-types";
import { useShellStore } from "@/store/shell-store";

function getSectionFromHash(hash: string): SectionId {
  const normalized = hash.replace("#", "");
  return isSectionId(normalized) ? normalized : "home";
}

const HOME_INTRO_SESSION_KEY = "portfolio-home-intro-seen";

export function PortfolioShell() {
  const [aboutTrack, setAboutTrack] = useState<(typeof aboutTracks)[number]["id"]>(aboutTracks[0].id);
  const [hoveredAboutTrack, setHoveredAboutTrack] = useState<
    ((typeof aboutTracks)[number]["id"]) | null
  >(null);
  const [isHomeIntroActive, setIsHomeIntroActive] = useState(false);
  const [isHomeIntroReady, setIsHomeIntroReady] = useState(false);
  const aboutTrackRefs = useRef<
    Record<(typeof aboutTracks)[number]["id"], HTMLDivElement | null>
  >({
    cinema: null,
    theater: null,
    code: null
  });
  const homeRef = useRef<HTMLDivElement>(null);
  const homeHeadlineRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const { isTransitioning, playTransition } = useRouteTransition();

  const activeSection = useShellStore((state) => state.activeSection);
  const setActiveSection = useShellStore((state) => state.setActiveSection);

  const activeSectionRef = useRef(activeSection);
  const isTransitioningRef = useRef(isTransitioning);
  const isHomeIntroActiveRef = useRef(isHomeIntroActive);
  const hasSeenHomeIntroRef = useRef(false);
  const activeAboutTrackId = hoveredAboutTrack ?? aboutTrack;
  const activeAboutTrackIndex = Math.max(
    0,
    aboutTracks.findIndex((track) => track.id === activeAboutTrackId)
  );
  const activeAboutTrackSummary =
    aboutTracks.find((track) => track.id === activeAboutTrackId)?.summary ?? aboutTracks[0].summary;
  const identityNameParts = siteIdentity.name.filter(Boolean);
  const introTitle = identityNameParts.join("\n");
  const displayName = identityNameParts.join(" ");

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  useEffect(() => {
    isHomeIntroActiveRef.current = isHomeIntroActive;
  }, [isHomeIntroActive]);

  const getSectionRoot = (section: SectionId) => {
    switch (section) {
      case "home":
        return homeRef.current;
      case "about":
        return aboutRef.current;
      case "projects":
        return projectsRef.current;
      case "contact":
        return contactRef.current;
    }
  };

  const animateSectionIn = (section: SectionId) => {
    const root = getSectionRoot(section);
    if (!root) {
      return;
    }

    const reveals = root.querySelectorAll<HTMLElement>("[data-reveal]");
    gsap.killTweensOf(reveals);
    gsap.fromTo(
      reveals,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.78,
        stagger: 0.08,
        ease: "power3.out"
      }
    );
  };

  const animateSectionOut = (section: SectionId) => {
    const root = getSectionRoot(section);
    if (!root) {
      return;
    }

    const reveals = root.querySelectorAll<HTMLElement>("[data-reveal]");
    gsap.killTweensOf(reveals);
    gsap.to(reveals, {
      autoAlpha: 0,
      y: -18,
      duration: 0.22,
      stagger: 0.02,
      ease: "power2.in"
    });
  };

  const transitionTo = async (nextSection: SectionId, pushHash: boolean) => {
    if (
      nextSection === activeSectionRef.current ||
      isTransitioningRef.current ||
      isHomeIntroActiveRef.current
    ) {
      return;
    }

    animateSectionOut(activeSectionRef.current);

    await playTransition(() => {
      setActiveSection(nextSection);

      if (pushHash) {
        window.history.pushState(null, "", `#${nextSection}`);
      }

      requestAnimationFrame(() => animateSectionIn(nextSection));
    });
  };

  useLayoutEffect(() => {
    const initialSection = getSectionFromHash(window.location.hash);
    setActiveSection(initialSection);

    if (window.location.hash !== `#${initialSection}`) {
      window.history.replaceState(null, "", `#${initialSection}`);
    }

    requestAnimationFrame(() => animateSectionIn(initialSection));

    const handleHashChange = () => {
      const nextSection = getSectionFromHash(window.location.hash);
      void transitionTo(nextSection, false);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setActiveSection]);

  useLayoutEffect(() => {
    const seen = window.sessionStorage.getItem(HOME_INTRO_SESSION_KEY) === "1";
    const initialSection = getSectionFromHash(window.location.hash);

    hasSeenHomeIntroRef.current = seen;
    setIsHomeIntroReady(true);

    if (initialSection !== "home" || seen) {
      return;
    }

    hasSeenHomeIntroRef.current = true;
    window.sessionStorage.setItem(HOME_INTRO_SESSION_KEY, "1");
    setIsHomeIntroActive(true);
  }, []);

  useEffect(() => {
    if (!isHomeIntroReady || activeSection !== "home" || isHomeIntroActive || hasSeenHomeIntroRef.current) {
      return;
    }

    hasSeenHomeIntroRef.current = true;
    window.sessionStorage.setItem(HOME_INTRO_SESSION_KEY, "1");
    setIsHomeIntroActive(true);
  }, [activeSection, isHomeIntroActive, isHomeIntroReady]);

  const handleHomeIntroComplete = useCallback(() => {
    setIsHomeIntroActive(false);

    if (activeSectionRef.current === "home") {
      requestAnimationFrame(() => animateSectionIn("home"));
    }
  }, []);

  const activateAboutTrack = (trackId: (typeof aboutTracks)[number]["id"]) => {
    setAboutTrack((current) => (current === trackId ? current : trackId));
    setHoveredAboutTrack((current) => (current === trackId ? current : trackId));
  };

  const clearHoveredAboutTrack = () => {
    setHoveredAboutTrack(null);
  };

  useEffect(() => {
    if (activeSection !== "about") {
      return;
    }

    const updateHoveredTrackFromPointer = (event: PointerEvent) => {
      let nextHoveredTrack: (typeof aboutTracks)[number]["id"] | null = null;

      for (const track of aboutTracks) {
        const node = aboutTrackRefs.current[track.id];
        if (!node) {
          continue;
        }

        const rect = node.getBoundingClientRect();
        const isInsideX = event.clientX >= rect.left && event.clientX <= rect.right;
        const isInsideY = event.clientY >= rect.top && event.clientY <= rect.bottom;

        if (isInsideX && isInsideY) {
          nextHoveredTrack = track.id;
          break;
        }
      }

      if (nextHoveredTrack) {
        activateAboutTrack(nextHoveredTrack);
        return;
      }

      clearHoveredAboutTrack();
    };

    const resetHoveredTrack = () => {
      clearHoveredAboutTrack();
    };

    window.addEventListener("pointermove", updateHoveredTrackFromPointer, { passive: true });
    window.addEventListener("pointerleave", resetHoveredTrack);
    window.addEventListener("blur", resetHoveredTrack);

    return () => {
      window.removeEventListener("pointermove", updateHoveredTrackFromPointer);
      window.removeEventListener("pointerleave", resetHoveredTrack);
      window.removeEventListener("blur", resetHoveredTrack);
    };
  }, [activeSection]);

  return (
    <main className="portfolio-shell">
      <div className="portfolio-shell__background" />
      <div className="portfolio-shell__rail" />
      {!isHomeIntroReady ? <div className="portfolio-shell__intro-prelude" aria-hidden="true" /> : null}
      {activeSection === "home" || activeSection === "projects" ? null : (
        <RedSquareLayer activeSection={activeSection} />
      )}
      <DeviceNoticeLayer />

      <SectionMenu
        items={menuItems}
        activeSection={activeSection}
        disabled={isTransitioning || isHomeIntroActive}
        onNavigate={(section) => {
          void transitionTo(section, true);
        }}
      />

      <HomeIntroOverlay
        active={isHomeIntroActive}
        label="Opening Frame"
        title={introTitle}
        subtitle={siteIdentity.role}
        onComplete={handleHomeIntroComplete}
      />

      <div className="portfolio-shell__viewport">
        <section ref={homeRef} className="section-panel section-home" data-active={activeSection === "home"}>
          <div className="section-panel__content home-shell">
            <div data-reveal className="home-shell__stage">
              <HomeHeroStage active={activeSection === "home"} />
            </div>

            <div ref={homeHeadlineRef} className="home-shell__headline">
              <p data-reveal className="home-shell__role">
                <VariableProximityText
                  label={siteIdentity.role}
                  className="home-shell__role-proximity"
                  containerRef={homeHeadlineRef}
                  radius={120}
                  falloff="gaussian"
                  fromFontVariationSettings="'wght' 560, 'opsz' 18"
                  toFontVariationSettings="'wght' 900, 'opsz' 42"
                />
              </p>
              <h1 data-reveal className="home-shell__title">
                <TextType
                  active={activeSection === "home"}
                  as="span"
                  text={displayName}
                  typingSpeed={72}
                  initialDelay={180}
                  className="home-shell__typed-name"
                  showCursor
                  cursorCharacter="|"
                  cursorClassName="home-shell__typed-cursor"
                  cursorBlinkDuration={0.46}
                  variableProximity
                  proximityContainerRef={homeHeadlineRef}
                  proximityRadius={140}
                  proximityFalloff="gaussian"
                  fromFontVariationSettings="'wght' 620, 'opsz' 24"
                  toFontVariationSettings="'wght' 980, 'opsz' 56"
                />
              </h1>
            </div>
          </div>
        </section>

        <section
          ref={aboutRef}
          className="section-panel section-about"
          data-active={activeSection === "about"}
        >
          <div className="section-panel__content about-shell">
            <div className="section-about__bends" aria-hidden="true">
              <AboutColorBends
                active={activeSection === "about"}
                speed={0.13}
                scale={0.98}
                frequency={0.8}
                warpStrength={0.74}
                mouseInfluence={0.86}
                parallax={0.46}
                noise={0.008}
                rotation={-0.34}
                autoRotate
              />
            </div>
            <div className="about-shell__left">
              <p data-reveal className="section-kicker">
                {aboutCopy.collaborationsLabel}
              </p>
              <ul className="about-shell__collabs">
                {collaborations.map((item) => (
                  <li key={item} data-reveal>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div data-reveal className="about-shell__who">
              <WhoMorphCanvas
                active={activeSection === "about"}
                hovered={Boolean(hoveredAboutTrack)}
                variant={activeAboutTrackIndex}
                triggerKey={`${activeSection}-${aboutTrack}-${hoveredAboutTrack ?? "idle"}`}
              />
            </div>

            <div className="about-shell__center">
              <p data-reveal className="eyebrow about-shell__timeline-label">
                {aboutCopy.timelinePrompt}
              </p>
              {aboutCopy.paragraphs.map((paragraph) => (
                <ScrambledText
                  key={paragraph}
                  as="p"
                  data-reveal
                  radius={96}
                  duration={1.1}
                  speed={0.55}
                  scrambleChars=".:"
                  className="body-copy body-copy--wide"
                >
                  {paragraph}
                </ScrambledText>
              ))}
              <ScrambledText
                as="p"
                data-reveal
                radius={90}
                duration={1}
                speed={0.5}
                scrambleChars=".:"
                className="about-shell__track-summary"
              >
                {activeAboutTrackSummary}
              </ScrambledText>
            </div>

            <div
              data-reveal
              className="about-shell__timeline"
              onMouseLeave={clearHoveredAboutTrack}
              onPointerLeave={clearHoveredAboutTrack}
            >
              {aboutTracks.map((track) => (
                <BorderGlow
                  key={track.id}
                  className="about-shell__timeline-card"
                  innerClassName="about-shell__timeline-card-inner"
                  ref={(node) => {
                    aboutTrackRefs.current[track.id] = node;
                  }}
                  data-active={track.id === activeAboutTrackId}
                  data-hovered={track.id === hoveredAboutTrack}
                >
                  <button
                    type="button"
                    className="about-shell__timeline-item"
                    aria-pressed={track.id === activeAboutTrackId}
                    onMouseEnter={() => activateAboutTrack(track.id)}
                    onMouseMove={() => activateAboutTrack(track.id)}
                    onPointerEnter={() => activateAboutTrack(track.id)}
                    onPointerMove={() => activateAboutTrack(track.id)}
                    onClick={() => {
                      activateAboutTrack(track.id);
                    }}
                    onFocus={() => {
                      activateAboutTrack(track.id);
                    }}
                    onBlur={clearHoveredAboutTrack}
                  >
                    <span>{track.label}</span>
                    <small>{track.years}</small>
                  </button>
                </BorderGlow>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={projectsRef}
          className="section-panel section-projects"
          data-active={activeSection === "projects"}
        >
          <div className="section-panel__content section-projects__content">
            <div className="section-projects__silk" aria-hidden="true">
              <WorkSilk
                active={activeSection === "projects"}
                speed={5}
                scale={1}
                color="#d11017"
                noiseIntensity={1.5}
                rotation={-0.38}
              />
            </div>
            <div data-reveal>
              <ProjectsPanel isActive={activeSection === "projects"} projects={projects} />
            </div>
          </div>
        </section>

        <section
          ref={contactRef}
          className="section-panel section-contact"
          data-active={activeSection === "contact"}
        >
          <div className="section-panel__content contact-shell">
            <div className="contact-shell__waves" aria-hidden="true">
              <Waves
                active={activeSection === "contact"}
                lineColor="rgba(255, 0, 149, 0.42)"
                backgroundColor="transparent"
                waveSpeedX={0}
                waveSpeedY={0.014}
                waveAmpX={40}
                waveAmpY={20}
                friction={0.9}
                tension={0.01}
                maxCursorMove={120}
                xGap={12}
                yGap={36}
              />
            </div>
            <p data-reveal className="section-kicker">
              CONTACT
            </p>
            <h2 data-reveal className="display-title display-title--compact">
              MEET
              <br />
              ME
            </h2>
            <div className="contact-shell__links">
              {contactLinks.map((link) => (
                <a key={link.label} data-reveal href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
