"use client";

import type { IconType } from "react-icons";
import {
  SiGithub,
  SiGreensock,
  SiJavascript,
  SiNextdotjs,
  SiReact,
  SiThreedotjs,
  SiTypescript,
  SiVercel
} from "react-icons/si";

import { LogoLoop, type LogoLoopItem } from "@/components/logo-loop";

type HomeLogoBadgeProps = {
  icon: IconType;
  label: string;
};

function HomeLogoBadge({ icon: Icon, label }: HomeLogoBadgeProps) {
  return (
    <span className="home-logo-badge">
      <span className="home-logo-badge__mark">
        <Icon />
      </span>
      <span className="home-logo-badge__label">{label}</span>
    </span>
  );
}

const homeTechLogos: LogoLoopItem[] = [
  {
    node: <HomeLogoBadge icon={SiNextdotjs} label="Next.js" />,
    title: "Next.js",
    href: "https://nextjs.org"
  },
  {
    node: <HomeLogoBadge icon={SiReact} label="React" />,
    title: "React",
    href: "https://react.dev"
  },
  {
    node: <HomeLogoBadge icon={SiTypescript} label="TypeScript" />,
    title: "TypeScript",
    href: "https://www.typescriptlang.org"
  },
  {
    node: <HomeLogoBadge icon={SiJavascript} label="JavaScript" />,
    title: "JavaScript",
    href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
  },
  {
    node: <HomeLogoBadge icon={SiGreensock} label="GSAP" />,
    title: "GSAP",
    href: "https://gsap.com"
  },
  {
    node: <HomeLogoBadge icon={SiThreedotjs} label="Three.js" />,
    title: "Three.js",
    href: "https://threejs.org"
  },
  {
    node: <HomeLogoBadge icon={SiGithub} label="GitHub" />,
    title: "GitHub",
    href: "https://github.com/SunLe-01"
  },
  {
    node: <HomeLogoBadge icon={SiVercel} label="Vercel" />,
    title: "Vercel",
    href: "https://vercel.com"
  }
];

export function HomeLogoLoop() {
  return (
    <LogoLoop
      logos={homeTechLogos}
      speed={64}
      direction="left"
      logoHeight={36}
      gap={18}
      hoverSpeed={18}
      scaleOnHover
      fadeOut
      fadeOutColor="#050505"
      ariaLabel="Technology stack logo loop"
      className="home-logo-loop__marquee"
    />
  );
}
