import type { SectionId } from "@/lib/section-types";

export type RedTarget = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  radius: number;
  opacity: number;
};

type ResponsiveRedTarget = {
  desktop: RedTarget;
  mobile: RedTarget;
};

export type ProjectPreviewLayout = "portrait" | "window";
export type ProjectGalleryLayout = "full" | "offset-left" | "offset-right" | "window";
export type ProjectGalleryRhythm = "tight" | "steady" | "pause";
export type ProjectImageTone = "deep" | "soft";
export type ProjectCopyAlign = "start" | "end";
export type DeviceNoticeVariant = "portrait" | "compact" | "desktop";

export type ProjectPreview = {
  eyebrow: string;
  heading: string;
  details: string[];
  background: string;
  surface: string;
  mediaIndex: number;
  aspectRatio: string;
  layout: ProjectPreviewLayout;
  copyAlign: ProjectCopyAlign;
};

export type ProjectGalleryItem = {
  label: string;
  caption: string;
  realSrc: string;
  fallbackSrc: string;
  imageAlt: string;
  height: number;
  aspectRatio: string;
  layout: ProjectGalleryLayout;
  rhythm: ProjectGalleryRhythm;
  tone: ProjectImageTone;
  copyAlign: ProjectCopyAlign;
  crop: {
    detailPosition: string;
    mobilePosition?: string;
    previewPosition?: string;
    detailScale?: number;
    previewScale?: number;
  };
};

export type ProjectItem = {
  slug: string;
  title: string;
  client: string;
  agency: string;
  year: string;
  stack: string;
  summary: string;
  description: string;
  liveUrl: string;
  preview: ProjectPreview;
  gallery: ProjectGalleryItem[];
};

export type SiteIdentity = {
  role: string;
  name: [string, string];
  eyebrow: string;
  summary: string;
  details: string[];
};

export type AboutCopy = {
  collaborationsLabel: string;
  timelinePrompt: string;
  paragraphs: string[];
};

export const menuItems: Array<{ id: SectionId; label: string }> = [
  { id: "home", label: "HOME" },
  { id: "projects", label: "WORK" },
  { id: "about", label: "ABOUT" },
  { id: "contact", label: "CONTACT" }
];

export const siteIdentity: SiteIdentity = {
  role: "CREATIVE TECHNOLOGIST",
  name: ["SUNLE", ""],
  eyebrow: "PORTFOLIO / MOTION / INTERACTION",
  summary:
    "I design and build presentation-led websites where typography, contrast, and motion work as one system. This shell is now structured for commissioned work, experimental pieces, and longer-form case studies.",
  details: ["Based in Shanghai", "Available for commissions"]
};

export const aboutCopy: AboutCopy = {
  collaborationsLabel: "SELECTED COLLABORATIONS",
  timelinePrompt: "Hover the steps",
  paragraphs: [
    "Before I wrote production code, I learned to think in framing, pacing, and performance. That background still shapes the way I approach digital work: every screen needs a point of view, every transition needs a reason, and every interaction should move the story forward.",
    "Today I work across art direction, front-end development, and motion systems, building portfolio websites, campaign microsites, and interactive presentations that stay visually sharp while remaining maintainable in code."
  ]
};

export const deviceNoticeContent: Record<
  DeviceNoticeVariant,
  { title: string; body: string; note: string }
> = {
  portrait: {
    title: "Rotate for the intended layout",
    body:
      "This portfolio is composed for a wide canvas. Turn your device to landscape or move to a desktop screen to see the structure, red system, and transitions properly.",
    note: "Wide layouts unlock the full motion system."
  },
  compact: {
    title: "Use a wider browser window",
    body:
      "The composition, menu rail, and full-screen pacing are tuned for a broader viewport. Expand the browser window to recover the intended layout and spacing.",
    note: "A width above 1100px is recommended."
  },
  desktop: {
    title: "Best experienced on desktop",
    body:
      "This build relies on oversized typography, shader titles, and full-screen transitions that were designed primarily for desktop viewing.",
    note: "A large landscape display is recommended."
  }
};

export const redTargets: Record<SectionId, ResponsiveRedTarget> = {
  home: {
    desktop: { x: 42, y: 24, width: 14, height: 12, rotation: 0, radius: 6, opacity: 0.2 },
    mobile: { x: 44, y: 16, width: 26, height: 10, rotation: 0, radius: 8, opacity: 0.18 }
  },
  about: {
    desktop: { x: 62, y: 70, width: 28, height: 12, rotation: -2, radius: 8, opacity: 0.95 },
    mobile: { x: 12, y: 72, width: 60, height: 10, rotation: 0, radius: 8, opacity: 0.92 }
  },
  projects: {
    desktop: { x: 72, y: 12, width: 18, height: 72, rotation: 0, radius: 10, opacity: 1 },
    mobile: { x: 12, y: 62, width: 76, height: 18, rotation: 0, radius: 12, opacity: 0.95 }
  },
  contact: {
    desktop: { x: 38, y: 20, width: 22, height: 46, rotation: -4, radius: 10, opacity: 0.96 },
    mobile: { x: 20, y: 18, width: 56, height: 24, rotation: 0, radius: 12, opacity: 0.94 }
  }
};

export const aboutTracks = [
  {
    id: "cinema",
    label: "CINEMA",
    years: "2008 / 2012",
    summary:
      "Cinema taught me how to build tension through framing, light, duration, and the discipline of holding attention inside a single composition."
  },
  {
    id: "theater",
    label: "THEATER",
    years: "2013 / 2019",
    summary:
      "Theater sharpened my sense of presence, timing, and how movement guides the eye across a space without losing emotional clarity."
  },
  {
    id: "code",
    label: "CODE",
    years: "2020 / NOW",
    summary:
      "Code gave me the tools to turn those instincts into living interfaces, motion systems, and front-end structures that stay precise and maintainable."
  }
] as const;

export const collaborations = [
  "IMMERSIVE GARDEN",
  "AC3 STUDIO",
  "MAZARINE",
  "IMPOSSIBLE BUREAU"
];

export const projects: ProjectItem[] = [
  {
    slug: "axis",
    title: "AXIS",
    client: "Axis",
    agency: "Mazarine",
    year: "2025",
    stack: "Next.js / GSAP",
    summary: "沉浸式首页与滚动叙事，用高对比版式和转场串起完整作品介绍。",
    description:
      "一个偏发布型的视觉叙事项目，重点是超大字号、切页遮罩、红色状态元素和完整的内容节奏控制。这个模板会承接后续真实案例图、角色说明和 live link。",
    liveUrl: "https://example.com/axis",
    preview: {
      eyebrow: "Launch System",
      heading: "Axis Motion Story",
      details: ["Scroll layers", "Art direction", "Interactive reveal"],
      background:
        "radial-gradient(circle at 22% 18%, rgba(255,255,255,0.2), transparent 36%), linear-gradient(145deg, #1d1d1d 0%, #050505 42%, #450000 100%)",
      surface:
        "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02)), linear-gradient(120deg, rgba(255,0,0,0.55), rgba(0,0,0,0) 55%)",
      mediaIndex: 0,
      aspectRatio: "4 / 5",
      layout: "portrait",
      copyAlign: "end"
    },
    gallery: [
      {
        label: "Hero Layout",
        caption: "首页壳体聚焦在红色块、超大标题和上下文信息的对比关系。",
        realSrc: "/project-gallery-real/axis-hero.jpg",
        fallbackSrc: "/project-gallery/axis-hero.svg",
        imageAlt: "Axis hero layout preview",
        height: 560,
        aspectRatio: "4 / 5",
        layout: "offset-left",
        rhythm: "tight",
        tone: "deep",
        copyAlign: "end",
        crop: {
          detailPosition: "44% 20%",
          mobilePosition: "50% 24%",
          previewPosition: "44% 18%",
          detailScale: 1.04,
          previewScale: 1.08
        }
      },
      {
        label: "Transition Frame",
        caption: "详情页延续全站的遮罩切页语言，避免首页和案例页像两套产品。",
        realSrc: "/project-gallery-real/axis-transition.jpg",
        fallbackSrc: "/project-gallery/axis-transition.svg",
        imageAlt: "Axis transition composition preview",
        height: 680,
        aspectRatio: "21 / 12",
        layout: "full",
        rhythm: "pause",
        tone: "deep",
        copyAlign: "start",
        crop: {
          detailPosition: "52% 46%",
          mobilePosition: "52% 52%",
          previewPosition: "50% 46%",
          detailScale: 1.02,
          previewScale: 1.04
        }
      },
      {
        label: "Case Detail",
        caption: "左栏信息和右栏图廊的拆分，适合继续承接更完整的案例内容。",
        realSrc: "/project-gallery-real/axis-detail.jpg",
        fallbackSrc: "/project-gallery/axis-detail.svg",
        imageAlt: "Axis detail layout preview",
        height: 620,
        aspectRatio: "16 / 10",
        layout: "window",
        rhythm: "steady",
        tone: "soft",
        copyAlign: "end",
        crop: {
          detailPosition: "56% 50%",
          mobilePosition: "50% 50%",
          previewPosition: "54% 48%",
          detailScale: 1.01,
          previewScale: 1.04
        }
      }
    ]
  },
  {
    slug: "pulse",
    title: "PULSE",
    client: "Pulse",
    agency: "AC3 Studio",
    year: "2024",
    stack: "React / Motion",
    summary: "活动展示系统，强调快速切页、悬停反馈和大字标题的视觉冲击。",
    description:
      "更偏向活动与空间交互的界面系统，要求导航逻辑简单直接，同时保留足够强的视觉识别和悬停反馈。",
    liveUrl: "https://example.com/pulse",
    preview: {
      eyebrow: "Event Shell",
      heading: "Pulse Interface",
      details: ["Fast transitions", "Kiosk layout", "Touch-friendly UI"],
      background:
        "radial-gradient(circle at 76% 24%, rgba(255,255,255,0.18), transparent 28%), linear-gradient(160deg, #260000 0%, #050505 48%, #101010 100%)",
      surface:
        "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02)), linear-gradient(330deg, rgba(255,0,0,0.6), rgba(0,0,0,0) 58%)",
      mediaIndex: 1,
      aspectRatio: "10 / 13",
      layout: "window",
      copyAlign: "start"
    },
    gallery: [
      {
        label: "Interaction Grid",
        caption: "信息密度更高时，排版和动画都需要更强的秩序感。",
        realSrc: "/project-gallery-real/pulse-grid.jpg",
        fallbackSrc: "/project-gallery/pulse-grid.svg",
        imageAlt: "Pulse interaction grid preview",
        height: 540,
        aspectRatio: "16 / 10",
        layout: "full",
        rhythm: "tight",
        tone: "deep",
        copyAlign: "start",
        crop: {
          detailPosition: "48% 36%",
          mobilePosition: "50% 40%",
          previewPosition: "50% 34%",
          detailScale: 1.03,
          previewScale: 1.05
        }
      },
      {
        label: "Hover Layer",
        caption: "项目 hover 预览是从首页壳延续到具体案例页的关键桥梁。",
        realSrc: "/project-gallery-real/pulse-hover.jpg",
        fallbackSrc: "/project-gallery/pulse-hover.svg",
        imageAlt: "Pulse hover state preview",
        height: 700,
        aspectRatio: "10 / 13",
        layout: "offset-right",
        rhythm: "pause",
        tone: "deep",
        copyAlign: "start",
        crop: {
          detailPosition: "64% 30%",
          mobilePosition: "54% 36%",
          previewPosition: "60% 24%",
          detailScale: 1.06,
          previewScale: 1.08
        }
      },
      {
        label: "Live System",
        caption: "模板支持后续替换真实视觉稿、设备图和部署地址。",
        realSrc: "/project-gallery-real/pulse-live.jpg",
        fallbackSrc: "/project-gallery/pulse-live.svg",
        imageAlt: "Pulse live system preview",
        height: 600,
        aspectRatio: "5 / 4",
        layout: "window",
        rhythm: "steady",
        tone: "soft",
        copyAlign: "end",
        crop: {
          detailPosition: "48% 46%",
          mobilePosition: "50% 50%",
          previewPosition: "50% 42%",
          detailScale: 1.02,
          previewScale: 1.04
        }
      }
    ]
  },
  {
    slug: "forma",
    title: "FORMA",
    client: "Forma",
    agency: "Impossible Bureau",
    year: "2023",
    stack: "Three.js / GLSL",
    summary: "偏实验的品牌体验，重点是材质变化、标题扭曲和沉浸式预览反馈。",
    description:
      "这一类项目更适合在详情页里展示视觉实验、材质测试和不同状态下的画面表现，而不只是静态截图。",
    liveUrl: "https://example.com/forma",
    preview: {
      eyebrow: "Visual Lab",
      heading: "Forma Playground",
      details: ["Shader text", "Preview hover", "Gallery system"],
      background:
        "radial-gradient(circle at 18% 70%, rgba(255,255,255,0.16), transparent 30%), linear-gradient(140deg, #0a0a0a 0%, #1e0000 54%, #090909 100%)",
      surface:
        "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02)), linear-gradient(210deg, rgba(255,0,0,0.45), rgba(0,0,0,0) 55%)",
      mediaIndex: 0,
      aspectRatio: "11 / 14",
      layout: "portrait",
      copyAlign: "end"
    },
    gallery: [
      {
        label: "Material Study",
        caption: "把纯平图片占位先做成有材质层次的视觉块，后续替换真实渲染也不会破结构。",
        realSrc: "/project-gallery-real/forma-material.jpg",
        fallbackSrc: "/project-gallery/forma-material.svg",
        imageAlt: "Forma material study preview",
        height: 610,
        aspectRatio: "11 / 14",
        layout: "offset-left",
        rhythm: "tight",
        tone: "deep",
        copyAlign: "end",
        crop: {
          detailPosition: "42% 40%",
          mobilePosition: "50% 40%",
          previewPosition: "42% 34%",
          detailScale: 1.05,
          previewScale: 1.08
        }
      },
      {
        label: "Shader Mood",
        caption: "详情页的卡片可以承担动态图像、短视频或序列帧占位。",
        realSrc: "/project-gallery-real/forma-shader.jpg",
        fallbackSrc: "/project-gallery/forma-shader.svg",
        imageAlt: "Forma shader mood preview",
        height: 720,
        aspectRatio: "16 / 9",
        layout: "full",
        rhythm: "pause",
        tone: "deep",
        copyAlign: "start",
        crop: {
          detailPosition: "50% 42%",
          mobilePosition: "50% 48%",
          previewPosition: "50% 40%",
          detailScale: 1.03,
          previewScale: 1.05
        }
      },
      {
        label: "Presentation Deck",
        caption: "案例模板既能承接作品细节，也能承接更编辑化的项目叙述。",
        realSrc: "/project-gallery-real/forma-deck.jpg",
        fallbackSrc: "/project-gallery/forma-deck.svg",
        imageAlt: "Forma presentation deck preview",
        height: 580,
        aspectRatio: "16 / 10",
        layout: "window",
        rhythm: "steady",
        tone: "soft",
        copyAlign: "end",
        crop: {
          detailPosition: "54% 50%",
          mobilePosition: "50% 50%",
          previewPosition: "54% 48%",
          detailScale: 1.01,
          previewScale: 1.03
        }
      }
    ]
  },
  {
    slug: "noir",
    title: "NOIR",
    client: "Noir",
    agency: "Independent",
    year: "2022",
    stack: "Content / UI",
    summary: "面向内容型项目的作品页模板，适合挂载更完整的图文和案例细节。",
    description:
      "这个案例用来承载偏编辑、偏内容的项目模板，方便后续继续补更长的说明、案例结构和图文混排。",
    liveUrl: "https://example.com/noir",
    preview: {
      eyebrow: "Editorial Case",
      heading: "Noir Narrative",
      details: ["Project detail", "Split layout", "Editorial type"],
      background:
        "radial-gradient(circle at 82% 72%, rgba(255,255,255,0.18), transparent 34%), linear-gradient(150deg, #080808 0%, #111111 46%, #5e0000 100%)",
      surface:
        "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02)), linear-gradient(120deg, rgba(255,0,0,0.48), rgba(0,0,0,0) 60%)",
      mediaIndex: 2,
      aspectRatio: "6 / 7",
      layout: "window",
      copyAlign: "start"
    },
    gallery: [
      {
        label: "Editorial Split",
        caption: "左文右图的版式更适合长叙述，也容易和首页形成清晰分工。",
        realSrc: "/project-gallery-real/noir-split.jpg",
        fallbackSrc: "/project-gallery/noir-split.svg",
        imageAlt: "Noir editorial split preview",
        height: 570,
        aspectRatio: "5 / 4",
        layout: "offset-right",
        rhythm: "tight",
        tone: "deep",
        copyAlign: "start",
        crop: {
          detailPosition: "62% 50%",
          mobilePosition: "54% 50%",
          previewPosition: "58% 48%",
          detailScale: 1.03,
          previewScale: 1.06
        }
      },
      {
        label: "Reading Rhythm",
        caption: "通过间距、段落和图廊间断，让案例阅读节奏不会过于单调。",
        realSrc: "/project-gallery-real/noir-rhythm.jpg",
        fallbackSrc: "/project-gallery/noir-rhythm.svg",
        imageAlt: "Noir reading rhythm preview",
        height: 690,
        aspectRatio: "16 / 9",
        layout: "full",
        rhythm: "pause",
        tone: "deep",
        copyAlign: "end",
        crop: {
          detailPosition: "50% 34%",
          mobilePosition: "50% 38%",
          previewPosition: "50% 34%",
          detailScale: 1.02,
          previewScale: 1.04
        }
      },
      {
        label: "Content Frame",
        caption: "这套详情页壳现在已经能承接真实封面、截图和 live 链接。",
        realSrc: "/project-gallery-real/noir-frame.jpg",
        fallbackSrc: "/project-gallery/noir-frame.svg",
        imageAlt: "Noir content frame preview",
        height: 610,
        aspectRatio: "6 / 7",
        layout: "window",
        rhythm: "steady",
        tone: "soft",
        copyAlign: "start",
        crop: {
          detailPosition: "50% 46%",
          mobilePosition: "50% 50%",
          previewPosition: "50% 44%",
          detailScale: 1.02,
          previewScale: 1.05
        }
      }
    ]
  },
  {
    slug: "vanta",
    title: "VANTA",
    client: "Vanta",
    agency: "Studio Null",
    year: "2021",
    stack: "Campaign / Motion",
    summary: "发布预热型活动页面，用单色场、序列转场和强标题建立持续推进的观看节奏。",
    description:
      "这个自定义项目偏向活动预热与品牌发布，页面结构强调信息层级、时间推进和大面积色场对情绪的控制，适合承接倒计时、亮点介绍和报名入口。",
    liveUrl: "https://example.com/vanta",
    preview: {
      eyebrow: "Campaign Frame",
      heading: "Vanta Signal",
      details: ["Landing page", "Timed reveals", "Monumental type"],
      background:
        "radial-gradient(circle at 24% 20%, rgba(255,255,255,0.18), transparent 32%), linear-gradient(150deg, #120707 0%, #050505 44%, #5a0000 100%)",
      surface:
        "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02)), linear-gradient(110deg, rgba(255,36,36,0.5), rgba(0,0,0,0) 58%)",
      mediaIndex: 1,
      aspectRatio: "7 / 8",
      layout: "portrait",
      copyAlign: "end"
    },
    gallery: [
      {
        label: "Hero Stage",
        caption: "大面积色场和单一强标题适合承担活动预热的第一印象。",
        realSrc: "/project-gallery/vanta-stage.svg",
        fallbackSrc: "/project-gallery/vanta-stage.svg",
        imageAlt: "Vanta hero stage preview",
        height: 620,
        aspectRatio: "7 / 8",
        layout: "offset-left",
        rhythm: "tight",
        tone: "deep",
        copyAlign: "end",
        crop: {
          detailPosition: "48% 44%",
          mobilePosition: "50% 46%",
          previewPosition: "50% 38%",
          detailScale: 1.02,
          previewScale: 1.06
        }
      },
      {
        label: "Signal Panel",
        caption: "卡片化信息区承接亮点和发布时间，方便后续继续扩写内容。",
        realSrc: "/project-gallery/vanta-stage.svg",
        fallbackSrc: "/project-gallery/vanta-stage.svg",
        imageAlt: "Vanta signal panel preview",
        height: 700,
        aspectRatio: "16 / 10",
        layout: "full",
        rhythm: "pause",
        tone: "deep",
        copyAlign: "start",
        crop: {
          detailPosition: "52% 52%",
          mobilePosition: "50% 50%",
          previewPosition: "52% 50%",
          detailScale: 1.03,
          previewScale: 1.05
        }
      },
      {
        label: "Closing Frame",
        caption: "底部信息带和留白可以自然转入 live 链接、表单或品牌说明。",
        realSrc: "/project-gallery/vanta-stage.svg",
        fallbackSrc: "/project-gallery/vanta-stage.svg",
        imageAlt: "Vanta closing frame preview",
        height: 600,
        aspectRatio: "6 / 7",
        layout: "window",
        rhythm: "steady",
        tone: "soft",
        copyAlign: "end",
        crop: {
          detailPosition: "50% 46%",
          mobilePosition: "50% 48%",
          previewPosition: "48% 42%",
          detailScale: 1.01,
          previewScale: 1.04
        }
      }
    ]
  },
  {
    slug: "aurel",
    title: "AUREL",
    client: "Aurel",
    agency: "Parallel Form",
    year: "2020",
    stack: "Editorial / Commerce",
    summary: "偏编辑的商业展示页，用分栏、窗框和产品叙述维持内容密度与阅读秩序。",
    description:
      "这个项目更像一个兼具品牌叙述和商业信息的长页壳体，通过分栏窗框、局部放大和细节标签，让图文密度提高后仍然保持可读性。",
    liveUrl: "https://example.com/aurel",
    preview: {
      eyebrow: "Commerce Story",
      heading: "Aurel Index",
      details: ["Window layout", "Editorial pacing", "Detail system"],
      background:
        "radial-gradient(circle at 78% 18%, rgba(255,255,255,0.14), transparent 30%), linear-gradient(160deg, #120909 0%, #111111 46%, #6b1f00 100%)",
      surface:
        "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)), linear-gradient(320deg, rgba(255,140,60,0.24), rgba(0,0,0,0) 60%)",
      mediaIndex: 0,
      aspectRatio: "10 / 13",
      layout: "window",
      copyAlign: "start"
    },
    gallery: [
      {
        label: "Window Story",
        caption: "窗框式裁切适合把产品、标题和摘要同时放进一个稳定构图里。",
        realSrc: "/project-gallery/aurel-index.svg",
        fallbackSrc: "/project-gallery/aurel-index.svg",
        imageAlt: "Aurel window story preview",
        height: 610,
        aspectRatio: "10 / 13",
        layout: "window",
        rhythm: "tight",
        tone: "deep",
        copyAlign: "start",
        crop: {
          detailPosition: "50% 40%",
          mobilePosition: "50% 42%",
          previewPosition: "52% 34%",
          detailScale: 1.04,
          previewScale: 1.08
        }
      },
      {
        label: "Editorial Spread",
        caption: "图文分栏可以承接更长的品牌语气和产品说明，而不会显得拥挤。",
        realSrc: "/project-gallery/aurel-index.svg",
        fallbackSrc: "/project-gallery/aurel-index.svg",
        imageAlt: "Aurel editorial spread preview",
        height: 700,
        aspectRatio: "16 / 9",
        layout: "full",
        rhythm: "pause",
        tone: "soft",
        copyAlign: "end",
        crop: {
          detailPosition: "50% 48%",
          mobilePosition: "50% 50%",
          previewPosition: "50% 44%",
          detailScale: 1.02,
          previewScale: 1.04
        }
      },
      {
        label: "Product Frame",
        caption: "局部高光和窄栏信息适合挂价格、材质和规格等商业信息。",
        realSrc: "/project-gallery/aurel-index.svg",
        fallbackSrc: "/project-gallery/aurel-index.svg",
        imageAlt: "Aurel product frame preview",
        height: 580,
        aspectRatio: "5 / 4",
        layout: "offset-right",
        rhythm: "steady",
        tone: "deep",
        copyAlign: "start",
        crop: {
          detailPosition: "58% 50%",
          mobilePosition: "54% 52%",
          previewPosition: "60% 46%",
          detailScale: 1.03,
          previewScale: 1.05
        }
      }
    ]
  },
  {
    slug: "selene",
    title: "SELENE",
    client: "Selene",
    agency: "Independent",
    year: "2019",
    stack: "Brand / Experience",
    summary: "偏氛围化的品牌体验页，用深色底、发光层和缓慢节奏维持沉浸感。",
    description:
      "这个概念项目强调品牌情绪和观看停顿，适合承接更少但更重的视觉信息，通过留白和光感把页面导向更沉浸的观看体验。",
    liveUrl: "https://example.com/selene",
    preview: {
      eyebrow: "Atmosphere Shell",
      heading: "Selene Atlas",
      details: ["Mood system", "Ambient glow", "Narrative pacing"],
      background:
        "radial-gradient(circle at 16% 24%, rgba(255,255,255,0.16), transparent 26%), linear-gradient(145deg, #06060a 0%, #140612 50%, #4c0016 100%)",
      surface:
        "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)), linear-gradient(210deg, rgba(255,74,124,0.22), rgba(0,0,0,0) 54%)",
      mediaIndex: 2,
      aspectRatio: "6 / 7",
      layout: "portrait",
      copyAlign: "end"
    },
    gallery: [
      {
        label: "Ambient Cover",
        caption: "更少的信息量配合更强的光感控制，能把情绪建立得更完整。",
        realSrc: "/project-gallery/selene-atlas.svg",
        fallbackSrc: "/project-gallery/selene-atlas.svg",
        imageAlt: "Selene ambient cover preview",
        height: 620,
        aspectRatio: "6 / 7",
        layout: "offset-left",
        rhythm: "tight",
        tone: "deep",
        copyAlign: "end",
        crop: {
          detailPosition: "46% 44%",
          mobilePosition: "50% 44%",
          previewPosition: "48% 40%",
          detailScale: 1.04,
          previewScale: 1.07
        }
      },
      {
        label: "Light Passage",
        caption: "缓慢推进的图像与光柱适合承接视频、序列帧或更电影化的素材。",
        realSrc: "/project-gallery/selene-atlas.svg",
        fallbackSrc: "/project-gallery/selene-atlas.svg",
        imageAlt: "Selene light passage preview",
        height: 710,
        aspectRatio: "16 / 9",
        layout: "full",
        rhythm: "pause",
        tone: "soft",
        copyAlign: "start",
        crop: {
          detailPosition: "52% 46%",
          mobilePosition: "50% 50%",
          previewPosition: "50% 42%",
          detailScale: 1.02,
          previewScale: 1.04
        }
      },
      {
        label: "Atlas Card",
        caption: "局部说明卡和底部留白可以承接项目信息、credits 和 live link。",
        realSrc: "/project-gallery/selene-atlas.svg",
        fallbackSrc: "/project-gallery/selene-atlas.svg",
        imageAlt: "Selene atlas card preview",
        height: 600,
        aspectRatio: "5 / 4",
        layout: "window",
        rhythm: "steady",
        tone: "deep",
        copyAlign: "end",
        crop: {
          detailPosition: "50% 48%",
          mobilePosition: "50% 50%",
          previewPosition: "52% 46%",
          detailScale: 1.02,
          previewScale: 1.05
        }
      }
    ]
  },
  {
    slug: "orbit",
    title: "ORBIT",
    client: "Orbit",
    agency: "North State",
    year: "2018",
    stack: "Identity / Motion",
    summary: "偏品牌发布的识别系统页面，用环形构图、节奏切换和强状态色维持视觉抓力。",
    description:
      "这个自定义项目围绕品牌识别与动态发布搭建，通过中心图形、信息断点和大标题排布，让单页展示也能保持持续的推进感。",
    liveUrl: "https://example.com/orbit",
    preview: {
      eyebrow: "Identity Drop",
      heading: "Orbit Launch",
      details: ["Brand frame", "Pulse graphics", "Reveal timing"],
      background:
        "radial-gradient(circle at 76% 18%, rgba(255,255,255,0.14), transparent 26%), linear-gradient(150deg, #110707 0%, #090909 48%, #5c0a0a 100%)",
      surface:
        "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02)), linear-gradient(120deg, rgba(255,66,66,0.36), rgba(0,0,0,0) 58%)",
      mediaIndex: 0,
      aspectRatio: "7 / 8",
      layout: "portrait",
      copyAlign: "end"
    },
    gallery: [
      {
        label: "Pulse Mark",
        caption: "中心识别与发光边缘能在很少的信息里快速建立品牌氛围。",
        realSrc: "/project-gallery/orbit-launch.svg",
        fallbackSrc: "/project-gallery/orbit-launch.svg",
        imageAlt: "Orbit pulse mark preview",
        height: 620,
        aspectRatio: "7 / 8",
        layout: "offset-left",
        rhythm: "tight",
        tone: "deep",
        copyAlign: "end",
        crop: {
          detailPosition: "50% 44%",
          mobilePosition: "50% 46%",
          previewPosition: "50% 40%",
          detailScale: 1.03,
          previewScale: 1.07
        }
      },
      {
        label: "Signal Sequence",
        caption: "条状信息与中心图形适合承接节奏更明确的发布内容。",
        realSrc: "/project-gallery/orbit-launch.svg",
        fallbackSrc: "/project-gallery/orbit-launch.svg",
        imageAlt: "Orbit signal sequence preview",
        height: 700,
        aspectRatio: "16 / 9",
        layout: "full",
        rhythm: "pause",
        tone: "soft",
        copyAlign: "start",
        crop: {
          detailPosition: "52% 48%",
          mobilePosition: "50% 50%",
          previewPosition: "50% 42%",
          detailScale: 1.02,
          previewScale: 1.05
        }
      },
      {
        label: "Closing Card",
        caption: "底部卡片与状态标签让发布页可以自然延展到更多说明模块。",
        realSrc: "/project-gallery/orbit-launch.svg",
        fallbackSrc: "/project-gallery/orbit-launch.svg",
        imageAlt: "Orbit closing card preview",
        height: 590,
        aspectRatio: "6 / 7",
        layout: "window",
        rhythm: "steady",
        tone: "deep",
        copyAlign: "end",
        crop: {
          detailPosition: "50% 48%",
          mobilePosition: "50% 50%",
          previewPosition: "52% 46%",
          detailScale: 1.02,
          previewScale: 1.04
        }
      }
    ]
  },
  {
    slug: "mirage",
    title: "MIRAGE",
    client: "Mirage",
    agency: "Surface Unit",
    year: "2017",
    stack: "Editorial / Brand",
    summary: "偏编辑化的品牌故事页，用长图窗框、局部文字和柔和光层维持阅读秩序。",
    description:
      "这个页面壳体更偏向品牌故事与视觉叙述，通过拉长的图像窗口和更安静的内容卡，使得长段文案和产品叙述不会显得杂乱。",
    liveUrl: "https://example.com/mirage",
    preview: {
      eyebrow: "Story Frame",
      heading: "Mirage Notes",
      details: ["Editorial grid", "Soft glare", "Reading tempo"],
      background:
        "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.14), transparent 28%), linear-gradient(145deg, #100b0a 0%, #121010 52%, #5e2608 100%)",
      surface:
        "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)), linear-gradient(210deg, rgba(255,180,120,0.18), rgba(0,0,0,0) 56%)",
      mediaIndex: 1,
      aspectRatio: "10 / 13",
      layout: "window",
      copyAlign: "start"
    },
    gallery: [
      {
        label: "Reading Window",
        caption: "更窄的图像窗口适合承接长标题、摘要和品牌故事。",
        realSrc: "/project-gallery/mirage-notes.svg",
        fallbackSrc: "/project-gallery/mirage-notes.svg",
        imageAlt: "Mirage reading window preview",
        height: 620,
        aspectRatio: "10 / 13",
        layout: "window",
        rhythm: "tight",
        tone: "deep",
        copyAlign: "start",
        crop: {
          detailPosition: "50% 42%",
          mobilePosition: "50% 44%",
          previewPosition: "52% 36%",
          detailScale: 1.04,
          previewScale: 1.07
        }
      },
      {
        label: "Editorial Spread",
        caption: "横向版面适合把图片、摘要和节选文案放进同一阅读节奏。",
        realSrc: "/project-gallery/mirage-notes.svg",
        fallbackSrc: "/project-gallery/mirage-notes.svg",
        imageAlt: "Mirage editorial spread preview",
        height: 700,
        aspectRatio: "16 / 9",
        layout: "full",
        rhythm: "pause",
        tone: "soft",
        copyAlign: "end",
        crop: {
          detailPosition: "50% 48%",
          mobilePosition: "50% 50%",
          previewPosition: "50% 44%",
          detailScale: 1.02,
          previewScale: 1.04
        }
      },
      {
        label: "Detail Ledger",
        caption: "窄栏细节区可以继续挂产品说明、章节索引和项目背景。",
        realSrc: "/project-gallery/mirage-notes.svg",
        fallbackSrc: "/project-gallery/mirage-notes.svg",
        imageAlt: "Mirage detail ledger preview",
        height: 580,
        aspectRatio: "5 / 4",
        layout: "offset-right",
        rhythm: "steady",
        tone: "deep",
        copyAlign: "start",
        crop: {
          detailPosition: "58% 50%",
          mobilePosition: "54% 52%",
          previewPosition: "60% 48%",
          detailScale: 1.02,
          previewScale: 1.05
        }
      }
    ]
  },
  {
    slug: "cinder",
    title: "CINDER",
    client: "Cinder",
    agency: "Independent",
    year: "2016",
    stack: "UI / Narrative",
    summary: "用更规整的栅格、编号和局部高亮做一个偏系统化的叙事型展示页。",
    description:
      "这个自定义项目把叙事页面往更系统化的 UI 方向推进，适合挂载章节编号、关键帧截图和更明确的导航提示。",
    liveUrl: "https://example.com/cinder",
    preview: {
      eyebrow: "Narrative Grid",
      heading: "Cinder System",
      details: ["Structured cards", "Index rhythm", "UI narrative"],
      background:
        "radial-gradient(circle at 82% 18%, rgba(255,255,255,0.14), transparent 24%), linear-gradient(160deg, #0c0808 0%, #0d0d0d 48%, #4a1408 100%)",
      surface:
        "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)), linear-gradient(320deg, rgba(255,130,80,0.2), rgba(0,0,0,0) 58%)",
      mediaIndex: 2,
      aspectRatio: "6 / 7",
      layout: "portrait",
      copyAlign: "end"
    },
    gallery: [
      {
        label: "Index Grid",
        caption: "编号与横向分割让叙事页面具备更清晰的导航感。",
        realSrc: "/project-gallery/cinder-system.svg",
        fallbackSrc: "/project-gallery/cinder-system.svg",
        imageAlt: "Cinder index grid preview",
        height: 620,
        aspectRatio: "6 / 7",
        layout: "offset-left",
        rhythm: "tight",
        tone: "deep",
        copyAlign: "end",
        crop: {
          detailPosition: "46% 46%",
          mobilePosition: "50% 46%",
          previewPosition: "48% 42%",
          detailScale: 1.03,
          previewScale: 1.06
        }
      },
      {
        label: "Frame Sequence",
        caption: "横向图廊更适合把关键帧和章节说明放进同一个系统里。",
        realSrc: "/project-gallery/cinder-system.svg",
        fallbackSrc: "/project-gallery/cinder-system.svg",
        imageAlt: "Cinder frame sequence preview",
        height: 700,
        aspectRatio: "16 / 9",
        layout: "full",
        rhythm: "pause",
        tone: "soft",
        copyAlign: "start",
        crop: {
          detailPosition: "52% 48%",
          mobilePosition: "50% 50%",
          previewPosition: "50% 44%",
          detailScale: 1.02,
          previewScale: 1.04
        }
      },
      {
        label: "System Card",
        caption: "底部说明卡保留项目摘要、标签和 live 链接的承接空间。",
        realSrc: "/project-gallery/cinder-system.svg",
        fallbackSrc: "/project-gallery/cinder-system.svg",
        imageAlt: "Cinder system card preview",
        height: 600,
        aspectRatio: "5 / 4",
        layout: "window",
        rhythm: "steady",
        tone: "deep",
        copyAlign: "end",
        crop: {
          detailPosition: "50% 48%",
          mobilePosition: "50% 50%",
          previewPosition: "52% 46%",
          detailScale: 1.02,
          previewScale: 1.05
        }
      }
    ]
  }
];

export const contactLinks = [
  { label: "MAIL", href: "mailto:hello@example.com" },
  { label: "LNKD", href: "https://www.linkedin.com" },
  { label: "INSTA", href: "https://www.instagram.com" }
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getAdjacentProjects(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return { previous, next };
}
