# Romanjeanelie 对比与任务表

更新日期：2026-03-18

适用前提：
- 本文基于当前本地项目实现进行对照。
- 对比范围限定为“不上传真实图片”的前提下，可见的结构、文案、版式、交互、转场和详情页节奏差异。
- 参考依据来自公开页面，不包含对对方站点私有素材或源码的复制。

## 对比表格

| 模块 | 参考网站现状 | 当前项目现状 | 差距判断 | 当前代码位置 |
|---|---|---|---|---|
| 入口设备提示 | 首页包含 `Please adjust your window`、`Please Rotate your device`、`For a better experience, please use a desktop` 这类体验提示 | 当前项目直接进入首页，没有设备限制提示层 | 明显缺失 | [portfolio-shell.tsx](/c:/Users/12686/Desktop/艺术家/src/components/portfolio-shell.tsx) |
| 首页身份信息 | 以 `CREATIVE DEVELOPER` + `ROMAN JEAN-ELIE` 作为明确个人识别入口 | 当前仍为 `ARTIST NAME` 和通用说明文案 | 明显缺失 | [portfolio-shell.tsx](/c:/Users/12686/Desktop/艺术家/src/components/portfolio-shell.tsx#L162) |
| HOME 首屏压迫感 | 参考站首页更依赖超大标题、极简文本和极强留白 | 当前首页已有大标题和红色系统，但信息密度和留白比例仍偏模板 | 部分完成 | [globals.css](/c:/Users/12686/Desktop/艺术家/src/app/globals.css) |
| ABOUT 时间线结构 | 有 `CINEMA / THEATER / CODE`，并且与 `WHO` 内容叙事强绑定 | 当前已具备 timeline 结构和 hover 联动 | 基本到位，但内容层未完成 | [portfolio.ts](/c:/Users/12686/Desktop/艺术家/src/data/portfolio.ts#L97), [portfolio-shell.tsx](/c:/Users/12686/Desktop/艺术家/src/components/portfolio-shell.tsx#L221) |
| ABOUT 文案内容 | 参考站使用真实 biography 和职业路径叙述 | 当前为重建阶段说明和简化版内容 | 明显缺失 | [portfolio-shell.tsx](/c:/Users/12686/Desktop/艺术家/src/components/portfolio-shell.tsx#L210) |
| WHO 视觉效果 | 参考站的 `WHO` 更像品牌化的核心动效，不只是一个标题 | 当前已有 canvas 版本，包含扫光、切缝、hover 和 exit 残影 | 部分完成 | [who-morph-canvas.tsx](/c:/Users/12686/Desktop/艺术家/src/components/who-morph-canvas.tsx) |
| WORK 列表密度 | 公开列表可见 `Dior / Renault / Biotherm / Diptyque / Chanel / Molyxa / Van Cleef / Beau band / OJL` 等多个项目 | 当前仅有 `axis / pulse / forma / noir` 四个占位项目 | 明显缺失 | [portfolio.ts](/c:/Users/12686/Desktop/艺术家/src/data/portfolio.ts#L127) |
| 项目 hover 预览 | 参考站的 work 列表和预览绑定更紧，作品感更强 | 当前已支持 hover 预览、裁切元数据和标题 shader，但仍是模板化 preview card | 部分完成 | [projects-panel.tsx](/c:/Users/12686/Desktop/艺术家/src/components/projects-panel.tsx), [project-title-gl.tsx](/c:/Users/12686/Desktop/艺术家/src/components/project-title-gl.tsx) |
| 红色系统一体化 | 红色元素从首页到详情页都像同一套视觉机制 | 当前已有全局红块、WHO 红块、标题红色 shader、详情页红色节奏条 | 部分完成 | [red-square-layer.tsx](/c:/Users/12686/Desktop/艺术家/src/components/red-square-layer.tsx), [globals.css](/c:/Users/12686/Desktop/艺术家/src/app/globals.css) |
| 页面转场 | section 切换和项目页切换在参考站中更细，更像统一导演式语言 | 当前已统一 overlay 转场，但节奏、停顿、文字联动层次仍偏简化 | 部分完成 | [route-transition-provider.tsx](/c:/Users/12686/Desktop/艺术家/src/components/route-transition-provider.tsx) |
| 详情页基础结构 | 参考站详情页包含 `close / prev / next / year / copy / stack / live / 多张图` | 当前这些结构均已具备 | 基本到位 | [project-detail-shell.tsx](/c:/Users/12686/Desktop/艺术家/src/components/project-detail-shell.tsx) |
| 详情页图廊节奏 | 参考站图廊更像编辑排版，单张图片之间的停顿与气口更自然 | 当前已支持 `layout / rhythm / tone / crop`，但仍是模板驱动，未到最终精度 | 部分完成 | [project-detail-shell.tsx](/c:/Users/12686/Desktop/艺术家/src/components/project-detail-shell.tsx#L222), [portfolio.ts](/c:/Users/12686/Desktop/艺术家/src/data/portfolio.ts#L145) |
| 图片完成度 | 参考站使用真实项目图片 | 当前未上传真实图片，仍是本地 SVG fallback 或等待本地图像命名替换 | 明显缺失 | [project-gallery-image.tsx](/c:/Users/12686/Desktop/艺术家/src/components/project-gallery-image.tsx), [public/project-gallery-real](/c:/Users/12686/Desktop/艺术家/public/project-gallery-real) |
| 项目详情个性化 | 每个参考项目有自己的真实文案、命名、图像与叙事 | 当前详情页主要是通用壳 + 占位数据 | 明显缺失 | [portfolio.ts](/c:/Users/12686/Desktop/艺术家/src/data/portfolio.ts) |
| 联系区 | 参考站 `MEET ME` 与外链结构简单直接 | 当前已有 `MEET ME` + 外链结构 | 基本到位 | [portfolio-shell.tsx](/c:/Users/12686/Desktop/艺术家/src/components/portfolio-shell.tsx#L275) |

## 差距总结

按当前完成度看，项目已经拥有以下内容：
- 首页 / About / Work / Contact 的整体结构。
- 统一的 section 与 route 转场系统。
- 首页 work hover 预览。
- `/project/[slug]` 详情页模板。
- `WHO` canvas 动效。
- 项目标题 shader 版本。
- 图像裁切、比例、节奏、布局的元数据系统。

与参考网站的核心差距主要剩下四类：
- 内容差距：真实身份文案、真实项目列表、真实详情页内容尚未替换。
- 视觉精度差距：字体、字距、留白、块体比例、滚动气口还未压到目标站级别。
- 交互精度差距：转场、hover、标题 shader、`WHO` 动效还可以继续细调。
- 素材差距：未接入真实图片，导致当前图廊与 hover 预览只能做到结构级接近。

## 任务表

| 优先级 | 任务 | 目标 | 预期产出 | 依赖 |
|---|---|---|---|---|
| P0 | 增加设备提示层 | 补齐 desktop-only / rotate / resize 提示 | 首页增加设备限制提示层 | 无 |
| P0 | 替换首页身份文案 | 将 `ARTIST NAME` 改为最终品牌/姓名体系 | HOME 首屏正式文案版本 | 需要最终文案 |
| P0 | 替换 ABOUT 正式文案 | 将当前说明文案改为完整 biography | ABOUT 正式内容版 | 需要最终文案 |
| P0 | 扩充项目数量 | 让 WORK 信息密度更接近参考站 | 至少 8 个项目条目 | 需要项目清单 |
| P0 | 为每个项目写独立详情文案 | 摆脱当前通用模板语气 | 每个项目独立 description / summary / stack / live | 需要项目资料 |
| P1 | 精修首页 typography | 调整标题尺寸、字距、块体比例、留白关系 | HOME / ABOUT / WORK 版式精修版 | 无 |
| P1 | 精修 hover 预览联动 | 让标题 shader、右侧预览、meta 出场时机更统一 | 首页 hover 精修版 | 无 |
| P1 | 精修 route 与 section 转场 | 增加停顿、残影、文字联动、层次切换 | 更接近参考站的整体切页语言 | 无 |
| P1 | 精修详情页图廊节奏 | 继续调 `layout / rhythm / crop / copyAlign` | 详情页编辑化节奏版 | 无真实图也可先调结构 |
| P1 | 继续校准 `WHO` 动效 | 调整切缝形态、扫光速度、hover linger | `WHO` 精修版 | 无 |
| P1 | 继续校准标题 shader | 调整扫描头、填充速度、退出 ghost、噪点密度 | 标题精修版 | 无 |
| P2 | 接入真实图片 | 用本地授权素材替换 fallback 图 | 首页 preview 与详情页图廊最终版 | 需要真实图片 |
| P2 | 按真实图二次裁切 | 基于实际画面重新调 object-position 和 scale | 各项目最终构图版 | 依赖真实图片 |
| P2 | 多分辨率 QA | 检查 1440p、1920p、超宽屏、平板横屏 | 响应式收尾 | 无 |
| P2 | 内容一致性收尾 | 菜单、项目标题、详情页标题和元信息统一 | 发布前收尾版 | 依赖前序任务 |

## 建议执行顺序

1. 先补设备提示层、首页身份信息、ABOUT 正式文案。
2. 再把 WORK 列表扩到接近参考站的项目密度。
3. 接着精修首页 typography、hover 联动和全局转场。
4. 然后精修详情页图廊节奏、`WHO` 和标题 shader。
5. 最后在拿到真实图片后做裁切微调和多分辨率 QA。

## 备注

- 如果目标是“高度相似的结构与体验”，当前项目已经进入精修阶段。
- 如果目标是“内容层面也接近参考站”，必须补正式文案、真实项目条目和真实素材。
- 若要直接复制参考站的原始文字、品牌内容或图片，应先确认你拥有明确授权。

## 参考来源

- 主页：https://www.romanjeanelie.com/
- 项目详情示例：https://www.romanjeanelie.com/project/ou-est-jean-luc
