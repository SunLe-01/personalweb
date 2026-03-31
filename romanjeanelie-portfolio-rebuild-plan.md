# RomanJeanElie 作品集站复刻方案

## 1. 目标定义

目标是做出一个在视觉、交互、页面结构和动态节奏上高度接近 `https://www.romanjeanelie.com/` 的作品集网站，覆盖：

- 首页 `home`
- About 时间线页
- Work/Projects 项目总览页
- Contact 页
- 项目详情页 `/project/[slug]`
- 全站贯穿的红色视觉元素、转场遮罩、hover 预览、文本揭示、项目页切换

## 2. 先说清楚的边界

### 2.1 技术上可以复刻

从公开页面结构、CSS 和前端脚本来看，这个站点的实现并不神秘，核心是：

- `Next.js`
- `GSAP`
- `React`
- `Three.js / React Three Fiber / Troika Text` 一类的 WebGL 文本渲染
- 自定义状态管理控制 section 切换、overlay、red square 动画
- `Next/Image`
- 内容数据直接从页面 `__NEXT_DATA__` 注入，图片源来自 `Sanity CDN`

### 2.2 但“完全复刻所有文字和图片”默认不建议直接做

如果你不是原站权利人，或者没有明确授权，直接复制以下内容有明显风险：

- 原站所有文案
- 原站所有项目截图
- 原站的个人姓名、履历、合作品牌列表
- 原站 favicon、社交分享图、外链项目素材
- 原站的版式识别度和整体视觉表达

所以这个方案分两种执行模式：

1. `授权复刻模式`
   前提是你拥有原站文字、图片、品牌展示和字体等素材的合法使用权。
2. `合规高相似模式`
   复刻信息架构、交互逻辑、动画语言和视觉系统，但替换为你自己的文案、图片、项目和品牌信息。

下面的技术方案对两种模式都成立；如果没有授权，内容层必须换成你自己的。

## 3. 对目标站的拆解结果

基于公开页面和静态资源，目标站可以拆成以下模块。

### 3.1 全局层

- 黑色背景
- 全站主色 `#ff0000`
- 左侧固定黑色边栏
- 左侧旋转 90 度的导航菜单，桌面端固定，移动端改到底部
- 15 列左右的全屏 overlay columns，用于页面切换遮罩
- 全站 section 都是绝对定位的全屏层，不是普通长页面滚动
- 通过 hash 和路由状态切换 `#home / #about / #projects / #contact / /project/[slug]`

### 3.2 首页 Home

- 右下对齐的大字号标题
- 小标题 `CREATIVE DEVELOPER`
- 巨型人名标题
- 旁边常驻红色块 `redSquare`
- 桌面优先，移动端直接提示“更适合桌面查看”

### 3.3 About

- 底部横向时间线
- 三个 hover 区段：`CINEMA / THEATER / CODE`
- 时间节点：`2008 / 2013 / 2020`
- 左侧合作方列表
- 中间 `WHO` 标题不是普通文字，而是 SVG/Canvas 形态变化动画
- 右侧/下方三段描述文字，随着 hover 高亮对应内容

### 3.4 Projects

- 项目名称纵向排列，占满视口
- 项目名称 hover 时右侧出现图片预览
- 预览角上带小红方块
- 项目标题本身不是单纯 DOM 文本，带 WebGL shader 扭曲和条纹显隐
- 列表滚动不是浏览器原生滚动，而是自定义 wheel/touch 速度和惯性
- 项目项看起来像无尽循环列表

### 3.5 Contact

- 超大号 `MEET ME`
- 字符显隐带红色底块揭示
- 下方是 `MAIL / LNKD / INSTA`
- hover 变红

### 3.6 项目详情页

- 左栏：`close / prev / next`
- 左栏：年份、agency、标题、描述、技术栈、`SEE IT LIVE`
- 右栏：纵向图廊
- 图廊图片使用 `Next/Image`
- 切到详情页时全局 overlay 参与转场

## 4. 推荐实现路线

### 4.1 推荐技术栈

优先推荐：

- `Next.js`
- `TypeScript`
- `GSAP`
- `@react-three/fiber`
- `@react-three/drei`
- `three`
- `zustand`
- `next/image`
- `split-type` 或自写 splitter
- `Lenis` 可选，但这个站的项目列表更像自写滚轮控制

有两个关键点：

1. 原站里 `WHO` 标题的变形明显用了 SVG/path morph 方案。
2. 原站脚本里出现了 `morphSVG` 调用，这通常意味着 `GSAP MorphSVGPlugin`。

这会带来一个现实问题：

- `MorphSVGPlugin` 不是免费插件，商用或正式项目要考虑授权。

如果不想依赖它，可以用替代方案：

- `flubber`
- 手动插值 SVG path
- `clip-path + canvas mask`
- 直接重做成看起来接近的 reveal，而不是 1:1 path morph

### 4.2 推荐架构

如果目标是“尽量像”，建议做成：

- 单独一个首页壳层，管理 `home/about/projects/contact`
- 单独一个项目详情动态路由 `/project/[slug]`
- 所有页面切换都由一个全局 transition store 控制
- 内容先用本地 JSON 跑通，再决定是否接 CMS

我不建议一开始就接 CMS。先把交互壳做完，否则你会同时被动画、路由、数据建模三件事卡住。

## 5. 建议目录结构

```txt
src/
  app/
    page.tsx
    project/
      [slug]/
        page.tsx
    layout.tsx

  components/
    layout/
      RotatedMenu.tsx
      OverlayColumns.tsx
      ViewportMessage.tsx
      SectionShell.tsx
    shared/
      RedSquare.tsx
      AnimatedImage.tsx
    home/
      HomeSection.tsx
    about/
      AboutSection.tsx
      AboutTimeline.tsx
      WhoMaskTitle.tsx
    projects/
      ProjectsSection.tsx
      ProjectLoop.tsx
      ProjectTitleGL.tsx
      ProjectPreview.tsx
    contact/
      ContactSection.tsx
    project/
      ProjectDetailPage.tsx
      ProjectGallery.tsx

  lib/
    content.ts
    router-state.ts
    transitions.ts
    geometry.ts
    wheel-controller.ts
    red-square-store.ts
    overlay-store.ts

  data/
    site.json
    projects.json

  styles/
    globals.css
```

## 6. 数据模型

最少需要两份数据：

1. `site.json`
2. `projects.json`

建议结构：

```ts
type SiteContent = {
  hero: {
    role: string
    name: string
    mobileMessage: string
  }
  about: {
    collaborationsTitle: string
    collaborations: string[]
    timeline: Array<{
      id: 'cinema' | 'theater' | 'code'
      label: string
      start: number
      end: number
    }>
    descriptionSteps: string[]
  }
  contact: {
    title: string
    items: Array<{ label: string; href: string }>
  }
}

type ProjectItem = {
  slug: string
  client: string
  agency?: string
  date: string
  name: string
  description: string
  stack: string
  link?: string
  coverImage: string
  images: string[]
}
```

如果你有授权并想迁移原站内容，最稳的方式不是手抄，而是一次性把目标站公开输出的数据整理成你的本地 JSON，再手工核对。

## 7. 关键动画模块怎么做

### 7.1 全局红色元素

原站不是简单“每页放一个红块”，而是把红色当成跨页面的运动主体。

建议做法：

- 维护一个全局固定定位的 `RedSquareOverlay`
- 每个 section 注册自己的目标矩形位置
- 进入 section 时把红块 tween 到该 section 的目标位置和尺寸
- 同步控制透明度、scale 和 z-index

这样能还原“从始至终都有的红色元素”这个感觉，而不是零散装饰。

### 7.2 菜单与 overlay 转场

- 菜单固定在全局 layout
- 当前激活项闪烁红底
- 页面切换时让 15 个黑色 column 依次 `scaleX(0 -> 1 -> 0)`
- section 本体在 overlay 之后切入

这部分用 `GSAP timeline` 最直接。

### 7.3 Home 标题入场

- 小标题字符级 reveal
- 大标题按字/词旋转或横向推进
- 红块先出现，再带出标题
- 桌面端使用大字号绝对对齐，移动端直接简化

### 7.4 About 的 WHO 标题

这里是复刻难点之一。

推荐两条路线：

1. `接近原站的路线`
   - 用字体转 SVG path
   - 做一个矩形 path 和文字 path 的 morph
   - 用 canvas 实时绘制 mask
   - 通过 GSAP 控制形变进度
2. `更省事但视觉接近的路线`
   - 不做真正的 path morph
   - 用红色矩形遮罩 + 文字裁切 + scale reveal
   - 最终视觉上仍然能得到“红块裂开露出 WHO”的效果

如果你不是在做研究级 1:1 拆解，我建议走第 2 条，成本低很多。

### 7.5 About 时间线 hover

- hover `CINEMA/THEATER/CODE` 时，对应区段加红并闪烁
- 对应描述段落和年份突出显示
- 其他描述项降低透明度
- 鼠标移出后恢复默认

### 7.6 Projects 项目列表

建议实现为：

- 容器固定全屏
- 每个项目标题绝对定位
- 记录每一项高度
- `wheel` 和 `touchmove` 自己维护 `currentPosition / velocity / lerpedPosition`
- 每一帧把每个项目的 `translateY` 重新计算
- 超出视口后做循环回绕，实现无限滚动观感

这一段不要交给浏览器原生滚动，否则质感会差很多。

### 7.7 Project title 的 WebGL 效果

原站项目标题 hover 时，明显不是普通 CSS。

可复刻方案：

- 用 `@react-three/fiber`
- 用 Troika Text 或 Drei Text 渲染标题
- Shader 中加：
  - 横向条纹 mask
  - 根据滚动速度的轻微弯曲
  - hover 时红色混合

如果项目周期紧，也可以先做一个“DOM 文本 + CSS mask + GSAP distort”的替代版，最后再换 WebGL。

### 7.8 项目 hover 预览

- 每个项目项 hover 时，右侧出现预览图
- 预览图外角放一个小红方块
- 图像从裁切容器中推出
- hover 结束后收回

### 7.9 Contact 字符揭示

- 先把标题拆成字符
- 每个字符下方放红色 block
- block 先盖住，再缩回
- 字符同时从横向压缩状态恢复到正常宽度

## 8. 项目详情页怎么做

详情页不复杂，重点是保持和首页同一套气质。

结构建议：

- 左栏固定
  - `close`
  - `prev / next`
  - 年份
  - agency
  - 标题
  - 描述
  - stack
  - 外链按钮
- 右栏为图片列
  - 桌面端纵向滚动图廊
  - 移动端改成横向或普通堆叠

要注意两点：

1. 详情页切入时也要走全局 overlay transition。
2. `prev / next` 的切换不能是默认突变，应该沿用首页同一种遮罩切页。

## 9. 字体、颜色和样式系统

从公开资源看，原站主要是：

- `Anton-Regular`
- `Inter Bold / SemiBold / ExtraBold`
- 黑底白字红强调

建议直接建立设计 token：

```css
:root {
  --color-bg: #000;
  --color-fg: #fff;
  --color-accent: #f00;
  --font-display: "Anton", sans-serif;
  --font-ui: "Inter", sans-serif;
}
```

同时保留这些视觉规则：

- 大标题全大写
- 白色正文
- 红色只用在“状态变化、强调、遮罩、hover、active”
- 绝对不要把红色铺满全站，否则会失去原站那种“黑底里突然被红切开”的感觉

## 10. 内容迁移方式

### 10.1 如果是授权复刻

建议流程：

1. 提取首页文案、关于页文案、联系方式
2. 提取项目列表字段
3. 下载并重新托管图片素材
4. 统一命名和压缩
5. 配置社交分享图、favicon、SEO

不要直接长期热链第三方 CDN 图。

### 10.2 如果是合规高相似模式

保留这些：

- 页面架构
- 动画方式
- 红色系统
- 排版节奏
- 菜单与 overlay
- 时间线逻辑
- 项目 hover 预览逻辑

替换这些：

- 人名
- 履历文字
- 合作方
- 项目图
- 品牌名
- 详情页描述
- 外链地址

## 11. 实施阶段建议

### Phase 1. 骨架和状态机

- 初始化 Next.js 项目
- 建立全局 layout
- 做黑底、左侧旋转菜单、overlay columns
- 做 hash section 切换状态
- 做全局 red square store

### Phase 2. 首页和 About

- 完成 Home
- 完成 About 时间线
- 先用简化版 WHO reveal 跑通
- 完成基础入场/退场动画

### Phase 3. Projects

- 完成项目列表布局
- 完成 wheel/touch 自定义滚动
- 完成 hover 预览
- 完成 WebGL 标题或其替代版

### Phase 4. Contact 和详情页

- 完成 Contact reveal
- 完成项目详情页模板
- 接入 `prev / next / close`
- 完成首页与详情页的 overlay 转场

### Phase 5. 内容、性能、部署

- 接入真实内容
- 图片压缩和 placeholder
- 检查 1440p、1920p、超宽屏和移动端退化
- SEO、OG、favicon、部署

## 12. 预估工期

如果由 1 名前端工程师执行：

- `基础高相似版本`: 5 到 8 个工作日
- `接近原站的精修版本`: 8 到 12 个工作日
- `包含 CMS、全部细节调优、移动端退化优化`: 10 到 15 个工作日

影响工期的主要变量：

- 是否坚持 1:1 还原 `WHO` 的 path morph
- 是否必须做 WebGL 项目标题
- 是否要接 CMS
- 是否要完全重做原站所有 detail page 内容

## 13. 主要风险

### 风险 1. MorphSVG 授权

如果要走和原站最接近的路径变形，可能需要 `GSAP MorphSVGPlugin` 授权。

### 风险 2. WebGL 文本适配

不同分辨率下，Three.js 文本和 DOM 文本对位很容易偏。

### 风险 3. 移动端体验

原站本质是桌面优先站点。移动端如果也要“同等体验”，工作量会增加不少。

### 风险 4. 内容版权

这不是技术风险，是交付风险。没有内容授权，不能上线“完全复制版”。

## 14. 我建议的实际落地策略

最稳的做法不是一上来追求“百分百原样克隆”，而是：

1. 先做一个 `结构 + 转场 + 红色系统 + 项目 hover` 全部跑通的壳。
2. 再补 `About` 的高级 reveal。
3. 最后决定是否上 WebGL 标题和 1:1 path morph。

因为真正决定这个站质感的，不是文案本身，而是以下 4 个东西：

- 全屏 section 状态机
- 红色元素的跨页面运动
- 项目列表的滚动和 hover 预览
- 统一的遮罩式转场

这 4 件做对了，站点就已经很像了。

## 15. 验收标准

做到下面这些，就算完成度已经很高：

- 桌面端首页、About、Projects、Contact 四页能无卡顿切换
- 左侧旋转菜单与当前状态同步
- 红色元素在 section 间连续运动，不是各页各自为战
- 项目列表 hover 能显示对应预览图
- 项目列表滚动具有惯性和循环感
- 项目详情页有 `close / prev / next`
- 全站黑白红视觉一致
- 移动端至少能稳定展示简化版

## 16. 建议下一步

如果你要继续往下做，最合理的顺序是：

1. 先搭一个新的 `Next.js + GSAP + Zustand` 项目壳
2. 先做 `layout + overlay + red square + home`
3. 然后做 `about`
4. 再做 `projects`
5. 最后做 `project detail`

如果你愿意，我下一步可以直接继续帮你把这个方案落成一个实际可运行的前端项目骨架。

## 17. 参考来源

- 首页：`https://www.romanjeanelie.com/`
- 详情页示例：`https://www.romanjeanelie.com/project/gris-dior`
- 首页 CSS：`https://www.romanjeanelie.com/_next/static/css/5a60d8c96b951891.css`
- 首页脚本：`https://www.romanjeanelie.com/_next/static/chunks/pages/index-19d2c3bd9a0ab1bf.js`
