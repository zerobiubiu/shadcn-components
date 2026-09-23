# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

中文技术社区中使用 shadcn/ui 的 React 开发者（React 19 + Tailwind CSS v4 项目）。他们正在构建自己的产品界面，需要视觉上有辨识度、装进去就能用的现成交互组件。

使用情境：在已完成 `shadcn init` 的项目里执行 `npx shadcn@latest add` 安装组件。他们最在意三件事——装完不需要改动自己的全局 CSS、预览与安装结果一致、npm 依赖自动装齐。

未确认：是否存在非中文读者；是否存在设计/非工程角色的使用者。

## Product Purpose

一个 shadcn Registry：既向外部项目分发可安装的组件，又自带一个展示站用来预览与调试这些组件。两条线共享 `registry/` 这一份源码。

存在的理由：让一个有辨识度的交互组件（今天：Aurora Button 的指针跟随彩虹光晕）以「复制一份源码」的方式进入任意 shadcn 项目，而不引入运行时包、不要求安装方调整全局样式。

成功 = 开发者安装后拿到的东西与展示站预览到的完全一致，且安装过程不要求他修改自己项目里除安装产物以外的任何文件。

## Positioning

两点邻居产品无法照抄的性质：

1. **光晕引擎的实现方式**：光晕角度由 `ref` + CSS 自定义属性 + `requestAnimationFrame` 直接驱动，逐帧不经过 React 渲染；引擎参数与 `@property` 角度注册全部内聚在组件单元内。
2. **预览即安装（单一真实来源）**：`registry/` 是唯一源码，展示站直接 import 它渲染，不做副本，因此预览所见即为安装所得。

## Operating Context

- **分发线**：`registry.json` 声明 item → `npx shadcn@latest build` → `public/r/*.json`（必须提交：GitHub 形式读取仓库内容，站点形式读取 `public/r/`）。消费形式为 `npx shadcn@latest add zerobiubiu/shadcn-components/aurora-button`，或 URL 形式 `add https://<域名>/r/aurora-button.json`。
- **消费方前提**：React 19+、Tailwind CSS v4、已执行 `shadcn init`（即存在 `@/lib/utils` 的 `cn()` 与 `@/*` 路径别名）。
- **展示线**：`npm run dev` / `build` / `preview` / `lint`（oxlint）；`node scripts/shot-demo.mjs` 做端到端检查（无头 Chrome 截图 + 13 个按钮的光晕初始化断言，产物 `_verify/` 不进仓库）。
- **本机已知限制**（README 附完整对照实验）：shadcn CLI 自身的 HTTP 拓取在本机失败（`ui.shadcn.com`、`raw.githubusercontent.com`），因此需要 CLI 自行联网的 `add <owner>/<repo>` 与远程 `registry validate` 在本机跑不通，与本仓库内容无关。经验证等价的本地链路是 `build` → `npx serve public` → `add http://localhost:3000/r/aurora-button.json`。
- 仓库公开于 `github.com/zerobiubiu/shadcn-components`，MIT。

## Capabilities and Constraints

- 当前分发 1 个组件：**Aurora Button**。API 为 `variant`（default｜highlighted｜plain｜ghost）、`size`（default 36px｜sm 24px｜lg 48px｜icon）、`radius`（pill｜rounded｜square）、`noBlur`。`radius` 写入 `--aurora-button-radius`，光晕圆角随之自动跟随。
- 安装产物固定为 3 个文件 + 3 个依赖：`@/components/ui/aurora-button.tsx`、`@/components/ui/aurora-glow.css`、`@/lib/aurora.ts`；依赖 `class-variance-authority`、`clsx`、`tailwind-merge`。
- 新增组件的既有流程：在 `registry/` 下建组件目录 → 在 `registry.json` 的 `items` 加条目（`files[].path` 相对仓库根且必须真实存在）→ validate → build → 提交 `registry.json`、`registry/`、`public/r/`。
- 已确认这是一条**会增长的库**；库的具体组件范围尚未确定。
- 展示站面向用户的内容当前仅中文（README、`registry.json` 的 `title`/`description`、展示站标签），是否提供英文未定。

### 许可与来源

- 仓库以 MIT 发布（`LICENSE`，Copyright (c) 2026 zerobiubiu）。
- `registry/aurora-button/lib/aurora.ts` 在文件头声明自己是第三方 bundle 的逐字节搬运（来源 `./source/ORIGINAL-js.js`，xjs bundle scriptId 737），并附混淆名 → 语义名对照表；`aurora-glow.css` 同样带类名/CSS 变量对照表。
- **重新分发**：用户确认允许扩展与分发（2026-09-23 确认）。**此为用户断言，未经独立核实**——上游许可或授权文件未见于本仓库。若实际权利存疑，本条是必须回头修改的地方。
- **字节保真不具约束力**：与原 bundle 逐字节一致属于**来源记录**（历史事实），不是未来工作必须维持的约束。引擎内的魔数（`0.05`、`90`、三次方增益、偏移 `-167` / `-142`、尺寸 `100px` / `4px` / `-1px` / `4` / `1.5`）可以自由调整。

## Brand Commitments

- 名称：**shadcn-components**；公开身份 `zerobiubiu/shadcn-components`。
- 许可与署名：MIT，Copyright (c) 2026 zerobiubiu。
- 声音（voice）：中文、技术、精确、以证据说话。README 用对照实验与核验结果代替断言；代码注释解释来源、约束与非直观行为，不复述代码。
- 面向用户的文案（`registry.json` 的 `title`/`description`、README、展示站标签）均为中文。

## Evidence on Hand

- 可安装的参考实现：`registry/aurora-button/{aurora-button.tsx, aurora-glow.css, lib/aurora.ts}`。
- 已构建的注册表产物：`public/r/aurora-button.json`、`public/r/registry.json`。
- 端到端验证脚本：`scripts/shot-demo.mjs`（截图 + 13 个按钮的光晕初始化断言）。
- README 记录的已验证安装链路（本地 HTTP 形式）及结果：Created 3 files + 3 deps，消费方 `tsc --noEmit` 通过。
- 资源仅 `public/favicon.svg`；无产品截图、无 Logo 包、无演示动图。
- **不存在的、未来工作不得虚构**：用户评价、使用者数量、下载量、性能基准、价格、客户 Logo、媒体报道、任何第三方背书。

## Product Principles

1. **预览即安装**：`registry/` 是唯一真实来源，展示站直接引用它；任何展示用的副本都会立刻让预览说谎。
2. **组件是自包含单元**：一个组件所需的一切（含样式与 `@property` 注册）随它一起分发；安装方不需要改自己的全局 CSS。
3. **文档写来源与证据，不写断言**：代码来自哪里、验证跑过什么、什么在本机跑不通、为什么，包括失败项。
4. **库靠追加增长**：新组件作为独立的、自包含的 item 加入，而不是把 Aurora Button 撑大；已发布 item 的文件边界与消费路径保持稳定。

## Accessibility & Inclusion

- 引擎与样式都尊重系统「减弱动态效果」：`prefersReducedMotion()` 在动画入口直接返回；CSS 侧 `@media (prefers-reduced-motion: reduce)` 关闭过渡。
- 渲染为真实的 `<button type="button">`；转发 ref、支持 `disabled`、合并调用方自己的 `onMouseEnter/Leave/Focus/Blur`；`focus-visible` 在面层显示描边（`#1a73e8`）；展示站的图标按钮带 `aria-label`。
- 未决：是否符合某个具体的无障碍标准（WCAG 等级未确认）。
- 未决：面向非中文读者时，公开落地页是否需要英文内容。
