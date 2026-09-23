---
name: shadcn-components
description: 白纸上被精确标注的极光标本 —— 克制的容器，光是唯一的修辞
colors:
  mist-surface: "#f0f4f9"
  ink: "#1f1f1f"
  azure-surface: "#d3e3fd"
  deep-sea-blue: "#0b57d0"
  focus-ring: "#1a73e8"
  aurora-blue: "#3186ff"
  aurora-violet: "#9378ff"
  aurora-magenta: "#f96bd6"
  aurora-red: "#fc413d"
  aurora-orange: "#ff6b2b"
  aurora-amber: "#fec700"
  aurora-yellow: "#ffdb0f"
  aurora-lime: "#88de42"
  aurora-green: "#0ebc5f"
  aurora-teal: "#2eaab2"
  aurora-cyan: "#00a9bb"
  scaffold-page: "#ffffff"
  scaffold-title: "#171717"
  scaffold-body: "#404040"
  scaffold-muted: "#a3a3a3"
  brand-violet: "#863bff"
  brand-violet-deep: "#7e14ff"
  brand-lavender: "#ede6ff"
  brand-sky: "#47bfff"
typography:
  title:
    fontFamily: "var(--font-sans)"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: "1.75rem"
  specimen-label:
    fontFamily: "var(--font-sans)"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
  footnote:
    fontFamily: "var(--font-sans)"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1.625"
  button-label:
    fontFamily: "var(--font-sans)"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "1"
rounded:
  pill: "100px"
  rounded: "8px"
  square: "0px"
  disc: "50%"
spacing:
  button-icon-gap: "6px"
  button-pad-sm: "6px"
  button-pad-default: "8px"
  button-pad-lg: "16px"
  scaffold-gap-specimen: "12px"
  scaffold-gap-group: "16px"
  scaffold-gap-section: "32px"
  scaffold-page-y: "64px"
components:
  button-aurora-default:
    backgroundColor: "{colors.mist-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button-label}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "36px"
  button-aurora-highlighted:
    backgroundColor: "{colors.azure-surface}"
    textColor: "{colors.deep-sea-blue}"
    typography: "{typography.button-label}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "36px"
  button-aurora-ghost:
    backgroundColor: "transparent"
    textColor: "inherit"
    typography: "{typography.button-label}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "36px"
  button-aurora-sm:
    backgroundColor: "{colors.mist-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button-label}"
    rounded: "{rounded.pill}"
    padding: "0 6px"
    height: "24px"
  button-aurora-lg:
    backgroundColor: "{colors.mist-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button-label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "48px"
  button-aurora-icon:
    backgroundColor: "{colors.mist-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0"
    height: "36px"
    width: "36px"
  button-aurora-rounded:
    backgroundColor: "{colors.mist-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button-label}"
    rounded: "{rounded.rounded}"
    padding: "0 8px"
    height: "36px"
---

# Design System: shadcn-components

## Overview

**Creative North Star: "极光标本册 / The Aurora Specimen Sheet"**

这是一册摊开的标本纸。页面是纯白的，没有装饰、没有分区线、没有卡片、没有阴影；每一枚组件被单独居中陈列，上方一行 12px 的中性灰标签写着它的属性名（`variant` / `size` / `radius`）。标签的职责是让位——它必须小到不与标本争夺注意力。整册纸面上唯一有彩度的东西，是极光光谱本身。

气质是**克制的魔法**。容器一侧是仪器级的冷静：系统字体、中性灰、零装饰、精确到 1px 的内缩；光的一侧是完全相反的放纵：15 段色标的圆锥渐变被两层模糊揉开，再用双圆锥遮罩切出一段朝向鼠标的弧，逐帧由 rAF 写入 CSS 变量。两者并置正是这个体系的识别点——如果容器也变得花哨，光就不再是主角。

深度不用投影表达（全项目 `box-shadow` 出现 0 次），而是靠三件事：模糊的光盘、底色层 1px 的内缩（让光在边缘露出一圈常驻光边）、以及 hover 时底色层自身被 `blur(2px)` 推到光后面。

**需要明确区分两层规范地位**（2026-09-23 与用户确认）：**组件体系是规范**——`--aurora-*` 变量、色彩、圆角、字号、运动时序都以 `registry/` 内的实现为准；**展示页外壳是临时脚手架**——白底、居中的单列堆叠、12px 灰标签只是当前调试用的壳，已确认展示站要成为公开落地页，因此外壳可以被推翻，不要把它当作页面语言照抄。

**Key Characteristics:**

- 白纸陈列：标本居中，标签最小化，界面本身不承担表现欲
- 零 `box-shadow`：深度只来自模糊、光晕与 1px 光边
- 彩度专属极光光谱：界面其余部分保持无彩中性，静态强调蓝是唯一例外
- 零 webfont：全部文字落在系统栈，分发组件不给宿主增加网络成本
- 圆角是唯一形状变量，且光晕逐层继承它
- 运动是逐帧的：`ref` + `setProperty` + `requestAnimationFrame`，不经过 React 渲染
- 组件规范 vs 页面脚手架两层地位分明，后者可被推翻

*本文件由源码静态提取生成（scan mode）。值来自 `registry/aurora-button/*` 与 `src/App.tsx`；Tailwind 侧的 `--font-sans` 与 `neutral` 刻度已对照 `node_modules/tailwindcss/theme.css` 核实（依赖在本轮中途由用户安装）。仍**没有**实测 computed style——本 harness 无浏览器工具、`dist/` 不存在，因此渲染后的真实层叠与模糊效果未经像素级验证。*

## Colors

一套几乎无彩的界面，承载一条高彩度的光谱。

### Primary

- **深海蓝**（`#0b57d0`）：`highlighted` 变体的文字色，也是整个体系里唯一的静态品牌化颜色。它只出现在这一个位置，稀缺性是刻意的。
- **信号蓝**（`#1a73e8`）：`focus-visible` 描边色，2px，offset 2px。只服务键盘焦点，不用于任何装饰。

### Secondary

- **天青面**（`#d3e3fd`）：`highlighted` 变体的底色，与深海蓝构成一对（Material 风格的浅底深字）。

### Tertiary

极光光谱：一条 `conic-gradient` 上的 15 段色标，从蓝出发绕一圈回到蓝。它是本体系唯一的彩度来源，只在 `.aurora-disc` 上出现一次，经两层模糊与遮罩后才被人眼看到——**几乎没有任何一像素是以原色被看见的**。

- **极光蓝**（`#3186ff`）：光谱起点与终点，占比最大（34%→100% 区间反复回到它）
- **极光紫**（`#9378ff`）→ **极光洋红**（`#f96bd6`）→ **极光红**（`#fc413d`）→ **极光橙**（`#ff6b2b`）
- **极光琥珀**（`#fec700`）→ **极光黄**（`#ffdb0f`）→ **极光青柠**（`#88de42`）→ **极光绿**（`#0ebc5f`）
- **极光蓝绿**（`#2eaab2`）→ **极光青**（`#00a9bb`）→ 回到极光蓝

### Neutral

规范层（组件）：

- **晨雾面**（`#f0f4f9`）：`default` / `plain` 变体的底色。极冷的近白灰，饱和度低到几乎无彩（OKLCH chroma 0.008），是"白纸上的标本托"。
- **墨黑**（`#1f1f1f`）：`default` / `plain` 变体的文字色。不用纯黑，留一点温度。

脚手架层（展示页，临时）：

- **纸白**（`#ffffff`）：页面底色
- **标题墨**（`#171717`）／**正文灰**（`#404040`）／**标签灰**（`#a3a3a3`）：Tailwind v4 默认 `neutral` 刻度的 900 / 700 / 400。已核实其源值以 oklch 定义——`oklch(20.5% 0 none)` / `oklch(37.1% 0 none)` / `oklch(70.8% 0 none)`（出自 `node_modules/tailwindcss/theme.css`）。frontmatter 里写 hex 是为可移植性，sidecar 的 `canonical` 记的才是 oklch 源值。

品牌标记（仅存在于 `public/favicon.svg`）：

- **品牌紫罗兰**（`#863bff`）、**品牌深紫**（`#7e14ff`）、**品牌薰衣草白**（`#ede6ff`）、**品牌天空青**（`#47bfff`）——favicon 还带 `color(display-p3 …)` 宽色域声明。**这套紫色目前没有进入任何界面**，与组件的 Material 浅蓝系互不相干。这是一处待调和的张力，不是既成规范。

### Named Rules

**The One Light Rule（唯一光源规则）。** 一屏之内，有彩度的像素只允许来自极光光谱。界面本身保持无彩中性；`#0b57d0` 与 `#1a73e8` 是仅有的两个静态例外，且各自被锁死在 `highlighted` 文字与 focus ring 上，不得挪作装饰用。

**The Untouched Violet（未启用的紫）。** favicon 的紫色系尚未与界面调和。在用户明确决定之前，不要把它当主色使用，也不要"顺手"把它铺到页面上——那会同时破坏 One Light Rule 与现有的浅蓝体系。

## Typography

**Display Font:** 无（体系内不存在 display 级字体）
**Body Font:** 无独立字体族——落在 `var(--font-sans)`，即 Tailwind v4 `@theme default` 的系统栈：`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`（已核实自 `node_modules/tailwindcss/theme.css`）
**Label/Mono Font:** 无

**Character:** 单一系统无衬线，字形随操作系统变化。这不是疏漏而是分发组件的有意选择：一个被 `shadcn add` 装进别人项目的组件，不该给宿主带来网络请求、FOUT 或字体许可问题。全项目零 `@font-face`、零字体引入。

### Hierarchy

- **Title**（500，1.125rem / 1.75rem）：展示页唯一标题（`Aurora 按钮 · shadcn/ui 风格`）。这是当前实现里最大的文字。
- **Specimen Label**（400，0.75rem / 1rem，标签灰）：每组标本上方的属性名。永远比标本小、永远无彩。
- **Button Label**（400，14px / line-height 1）：按钮内文字。`line-height: 1` 是硬性的。
- **Footnote**（400，0.75rem / 1.625，最大宽度 28rem）：页脚说明，居中对齐。
- **不存在** Display / Headline 级别：实现中没有任何大于 18px 的文字。不要凭空补一档。

### Named Rules

**The 14px/1 Rule。** 按钮文字永远是 14px + `line-height: 1` + `font-weight: 400`。按钮高度由 `--aurora-button-height` 单独决定（24 / 36 / 48px），一旦行高参与撑高，三档高度的垂直居中就会同时失真。

**The No Webfont Rule。** 分发的组件不得引入 webfont。展示站若将来要用自定义字体，那是页面外壳的决定（脚手架层），不能渗进 `registry/` 里的组件单元。

## Layout

**组件内部（规范）**：`inline-flex` + `items-center` + `justify-center`；图标与文字间距 6px；水平内边距按尺寸 6px（sm）/ 8px（default）/ 16px（lg）/ 0（icon）；高度由 `--aurora-button-height` 驱动；icon 变体额外固定宽度 36px。层叠关系是：光晕层 `z-index: 0` 且 `pointer-events: none`，底色层 `absolute inset: 1px`，内容层 `z-index: 1`。另有 `--aurora-button-margin-inline-start`（默认 0）用于预留 20px 图标位的机制。

**页面外壳（脚手架，可推翻）**：`min-h-screen`，纵向 flex 居中；上下留白 64px；组间 32px；组内（标签与标本行之间）16px；标本之间 12px。

**响应式**：**当前不存在任何断点。** 全项目唯一的 `@media` 是 `prefers-reduced-motion`。单列居中堆叠在所有宽度下行为一致，窄屏时标本行会溢出而不是换行（`flex` 未设 `wrap`）。这是落地页工作必须补的空白，不是既定设计。

## Elevation & Depth

这套体系完全不用阴影——`box-shadow` 在全项目出现 0 次。深度由三层机制构成：① 一张被模糊的圆锥渐变圆盘（运行时 `blur(4px)`，内层再叠 `blur(1px)`）衬在底色层之后；② 底色层 `inset: 1px`，让光晕在边缘露出一圈 1px 的常驻光边；③ hover 时底色层自身 `filter: blur(2px)`，把文字和底色一起"推到光后面"，制造出光从底下透出来的错觉。光晕外层的 `opacity: 0.6` 是整体强度的总闸。

### Named Rules

**The No-Shadow Rule（无阴影规则）。** 不用 `box-shadow` 表达深度或层级。需要"抬起"一个元素时，用光晕、模糊或 1px 光边；引入投影等于换掉这套体系的物质观。

**The 1px Rim Rule（1px 光边规则）。** 底色层永远 `inset: 1px`。这 1px 是静止态下光晕唯一可见的通道；改成 `inset: 0` 会让光在默认态被完全遮住，组件看起来就是一个纯色按钮。

## Shapes

圆角是这套体系唯一的形状变量，且只有单一入口：`--aurora-button-radius`，三档取值——**药丸**（100px，默认）、**圆角**（8px）、**直角**（0px）。

光晕跟随形状：运行时把 `--aurora-button-radius` 的实际值读出并写进 `--aurora-radius`，所以改变圆角时，光的裁剪自动跟随，不需要第二处配置。

逐层继承是硬约束：模糊层与遮罩层一律 `border-radius: inherit`；底色层同时使用 `border-radius` 与 `clip-path: inset(0 round var(--aurora-button-radius))`。源码注释写明了后果——漏掉逐层继承，模糊层会按矩形裁剪并漏出色块。

圆盘本身是正圆（`border-radius: 50%` + `aspect-ratio: 1/1`），再被 `scale(var(--aurora-scale-x), var(--aurora-scale-y))` 拉成椭圆光带：圆形的几何 + 非均匀的缩放。

**没有边框语言**：全项目 `border: 0`，不存在 1px 描边。

### Named Rules

**The Inherited Corner Rule（圆角逐层继承规则）。** 任何新增的光晕/遮罩层必须 `border-radius: inherit`，不得写死数值。写死的那一层会在圆角变化时露出矩形角。

**The Single Radius Entry Rule（圆角单一入口规则）。** 改形状只改 `--aurora-button-radius`。直接去改 `.aurora-glow` 的 `--aurora-radius` 会在下一次运行时被引擎覆盖。

## Components

当前实现里**只有按钮**。没有 card、input、nav、chip、tooltip——不在此凭空补造。

### Buttons

- **Shape:** 药丸形（100px），可切 8px 圆角或 0px 直角；无边框；底色层内缩 1px 形成光边
- **Default（`variant="default"`）:** 晨雾面底（`#f0f4f9`）+ 墨黑字（`#1f1f1f`）；高 36px，水平内边距 8px
- **Highlighted（`variant="highlighted"`）:** 天青面底（`#d3e3fd`）+ 深海蓝字（`#0b57d0`）——体系内唯一的静态彩色组合
- **Plain（`variant="plain"`）:** 与 default 同色，差别只在 hover 不虚化底色（等价于 `noBlur`）
- **Ghost（`variant="ghost"`）:** 底色 `transparent`、文字 `inherit`，只留光晕
- **Sizes:** sm 24px / 内边距 6px；default 36px / 8px；lg 48px / 16px；icon 36×36px / 内边距 0
- **Hover:** 光晕开始跟随指针（`startFollow`，缩放 4 / 1.5），同时底色层 `filter: blur(2px)`，过渡 150ms；`plain` 与 `noBlur` 取消虚化
- **Focus:** `focus-visible` 在底色层上画 2px 信号蓝描边，offset 2px；焦点进入同样触发光晕跟随
- **离开:** 淡出 350ms 并停止跟随
- **Disabled:** ⚠ **组件没有内建 disabled 视觉。** 展示页是用 `className="opacity-50"` 手动补的。这是一个真实缺口，落地页工作应补齐而不是继续手动打补丁。

### Aurora Glow（Signature Component）

这是整个体系的核心，也是唯一无法用静态 CSS 完整表达的部分。

**层叠结构**（逐层对应原 DOM）：
`aurora-glow` → `aurora-var-layer` → `aurora-blur` ×2（外层 + 内层 `blur(1px)`）→ 每层内 `aurora-mask` → `aurora-disc`

**两个角度变量**：`--aurora-gradient-angle` 与 `--aurora-mask-angle`，在组件自带 CSS 顶部用 `@property` 注册为 `<angle>`（这是角度可插值的前提，也是"安装方无需改全局 CSS"的技术原因）。

**遮罩**：两层 `conic-gradient` + `mask-composite: intersect`，从整张圆盘里切出"朝向鼠标的一段弧"。内层模糊用的是另一组色标位置（62% / 82% / 89%），与外层（50% / 68% / 75% / 89%）不同。

**指针跟随**：`computeTargetAngle` 用 `atan2(dy / scaleY, dx / scaleX)` 求方位角（先缩放到圆盘空间再求角，与 CSS 的 `scale()` 同源）；`lerpShortest` 把角差折进 (-180°, 180°] 走最短路径；rAF 每帧把结果写进 CSS 变量。

**运动时序**（精确值）：入场 1000ms（按钮语境）／`animate()` 默认 650ms；显隐淡入淡出 350ms；`height` 与 `filter` 过渡各 150ms；缓动 `cubic-bezier(0, 0, 0, 1)`（进）与 `cubic-bezier(0.30, 0.00, 0.80, 0.15)`（出）；角度扫掠 gradient `170deg → 225deg`、mask `-90deg → 200deg`。

**弹簧参数**：角速度每帧增量系数 0.05；低通增益在角差 ≥ 90° 时取满；增益曲线三次方；写入偏移 mask `-167°` / gradient `-142°`。

**⚠ 两套尺寸值并存**：CSS 回退值是 `radius 24px / blur 5px / inset 0 / scale-x 7 / scale-y 1.5`，而运行时 `SIZE_VALUES` 写入的是 `radius 100px / blur 4px / inset -1px / scale-x 4 / scale-y 1.5`。运行时值为准，但在引擎初始化完成之前，页面渲染的是回退值——光晕会短暂地更模糊、更宽。这是原实现自带的状态（源码注释已说明"CSS 回退值取自原文"），不是本项目的笔误。

**减弱动态**：`prefersReducedMotion()` 在 `animate()` 入口直接 return；CSS 侧同时关掉 `transition` 与 hover 虚化。两侧都要保留。

**数值可调**：以上全部魔数均**不具保真约束**（PRODUCT.md 已确认）——它们记录的是当前实现与来源，不是不许碰的戒律。

## Do's and Don'ts

### Do:

- **Do** 只用 `--aurora-button-radius` 这一个入口改形状；光晕会自动跟随。
- **Do** 让每一层新增的光晕/遮罩 `border-radius: inherit`。
- **Do** 保持按钮文字 14px / `line-height: 1` / `font-weight: 400`（The 14px/1 Rule）。
- **Do** 保持零 `box-shadow`；需要深度时用模糊、光晕或 1px 光边（The No-Shadow Rule）。
- **Do** 保持底色层 `inset: 1px`（The 1px Rim Rule）。
- **Do** 在任何新增动画上同时处理 `prefers-reduced-motion`——引擎侧 return + CSS 侧 `transition: none`。
- **Do** 让彩度只出现在极光光谱里，界面其余部分保持无彩中性（The One Light Rule）。
- **Do** 把标签字号压在 12px、颜色压在标签灰，让它让位于标本。

### Don't:

- **Don't** 把角度更新塞进 React 渲染；必须 `ref` + `setProperty` + `requestAnimationFrame`。
- **Don't** 要求安装方修改全局 CSS——`@property` 注册随组件走，这是分发的硬约束。
- **Don't** 给组件加 `box-shadow` 或 1px 描边；当前体系两者都没有。
- **Don't** 假设 `disabled` 有内建视觉——现在没有，展示页是手动加 `opacity-50` 补的。
- **Don't** 把展示页外壳（白底 + 12px 灰标签 + 居中单列堆叠）当作规范照抄；它是临时脚手架，落地页可以推翻（2026-09-23 用户决定）。
- **Don't** 引入 webfont 到 `registry/` 内的组件单元（The No Webfont Rule）。
- **Don't** 把 favicon 的紫色系当界面主色——它目前只活在 favicon 里，尚未与组件调色板调和（The Untouched Violet）。
- **Don't** 假定存在响应式断点——当前一个都没有，窄屏下标本行会溢出而非换行。
