# shadcn-components

一个 shadcn Registry —— 既分发 **Aurora Button** 组件，也自带一个展示站。

仓库里有两条互不干扰的线：

| 线 | 职责 | 入口 | 产物 |
| --- | --- | --- | --- |
| **分发线** | 声明并打包可安装的组件 | `registry.json` + `registry/` | `public/r/*.json`（静态注册表） |
| **展示线** | 预览与调试组件 | `index.html` + `src/` | `dist/`（展示站） |

两条线共享 `registry/` 这一份组件源码：展示站直接 import 它渲染预览，不做副本，
因此预览所见即为安装所得。

## 目录结构

```
.
├── registry.json                     # 分发线入口：声明可安装的 item
├── registry/                         # 分发的组件源码（唯一真实来源）
│   └── aurora-button/
│       ├── aurora-button.tsx         # → 安装到 @/components/ui/aurora-button.tsx
│       ├── aurora-glow.css           # → 安装到 @/components/ui/aurora-glow.css
│       └── lib/
│           └── aurora.ts             # → 安装到 @/lib/aurora.ts（光晕引擎）
├── public/r/                         # 分发线产物（由 `shadcn build` 生成，需提交）
├── index.html
├── src/                              # 展示线（展示站自身代码）
│   ├── App.tsx                       # 首页：从 registry/ 取组件渲染预览
│   ├── index.css                     # 仅 Tailwind 入口
│   └── lib/utils.ts                  # 展示站自己的 cn()
└── scripts/shot-demo.mjs             # 展示线端到端检查（截图 + 光晕初始化断言）
```

组件单元的边界：`aurora-button.tsx` 只依赖 `@/lib/utils`（shadcn 项目的标准 `cn()`）、
`@/lib/aurora`（随包分发）与同目录的 `aurora-glow.css`。`@property` 角度注册内聚在该 CSS 里，
因此**安装方无需改任何全局 CSS**。

## 分发线

### 构建与校验

```bash
npx shadcn@latest registry validate ./registry.json   # 校验 registry.json 与文件路径
npx shadcn@latest build                               # 产出 public/r/*.json
```

`build` 的产物必须提交：GitHub 形式的安装会读取仓库内容，站点形式的安装读取 `public/r/`。

### 安装到其他项目

```bash
# GitHub 形式（需先把本仓库推送到公开仓库）
npx shadcn@latest add zerobiubiu/shadcn-components/aurora-button

# URL 形式（任意托管了 public/r/ 的地址，含本展示站）
npx shadcn@latest add https://<你的域名>/r/aurora-button.json

# 本地预览构建产物
npx shadcn@latest build && npx serve public
npx shadcn@latest add http://localhost:3000/r/aurora-button.json
```

安装会写入三个文件，并自动装齐 npm 依赖：

```
@/components/ui/aurora-button.tsx
@/components/ui/aurora-glow.css
@/lib/aurora.ts
+ class-variance-authority, clsx, tailwind-merge
```

### 消费方前提

- React 19+
- Tailwind CSS v4
- 已执行过 `shadcn init`（即存在 `@/lib/utils` 的 `cn()` 与 `@/*` 路径别名）

### 新增组件

1. 在 `registry/` 下建组件目录，放入源码；
2. 在 `registry.json` 的 `items` 里加一条，`files[].path` 相对**仓库根目录**且必须真实存在；
3. `registry validate` → `build` → 提交 `registry.json`、`registry/`、`public/r/`。

## 展示线

```bash
npm run dev            # 本地开发
npm run build          # tsc -b && vite build
npm run preview        # 预览构建产物（同时托管 /r/*.json）
npm run lint           # oxlint
node scripts/shot-demo.mjs   # 端到端：无头 Chrome 截图 + 13 个按钮的光晕初始化断言
```

展示站只做预览，不承载分发逻辑；分发所需的文件全部来自 `registry/` 与 `registry.json`。

## 组件 API

```tsx
import { AuroraButton } from "@/components/ui/aurora-button"

<AuroraButton>Default</AuroraButton>
<AuroraButton variant="highlighted" size="lg" radius="rounded">AI 模式</AuroraButton>
<AuroraButton variant="plain" size="sm" noBlur onClick={fn}>Plain</AuroraButton>
```

| prop | 取值 | 默认 |
| --- | --- | --- |
| `variant` | `default` \| `highlighted` \| `plain` \| `ghost` | `default` |
| `size` | `default`(36px) \| `sm`(24px) \| `lg`(48px) \| `icon` | `default` |
| `radius` | `pill` \| `rounded` \| `square` | `pill` |
| `noBlur` | 禁用 hover 底色虚化 | `false` |

光晕角度由 `ref` + CSS 自定义属性 + `requestAnimationFrame` 直接驱动，不经过 React 渲染。

## 光晕引擎与原始实现

`registry/aurora-button/lib/aurora.ts` 是原始实现的 TS 搬运，算法逐字节保真，
标识符已按语义重命名。原混淆名 ↔ 新名的对照表写在两个文件头部：

- `registry/aurora-button/lib/aurora.ts`（函数、类、实例字段、方法、CSS 变量）
- `registry/aurora-button/aurora-glow.css`（类名、CSS 变量）

## 发布状态

仓库：<https://github.com/zerobiubiu/shadcn-components>（PUBLIC，MIT）

```bash
# GitHub 形式
npx shadcn@latest add zerobiubiu/shadcn-components/aurora-button
```

## 本机网络环境限制

本机的 shadcn CLI 自身 HTTP 拓取会失败（`ui.shadcn.com` 与 `raw.githubusercontent.com`
均报 “other side closed” / “could not fetch”）。已用对照实验判定为本地环境问题：

| 对照组 | 结果 |
| --- | --- |
| 官方 registry 的 `button` | 以完全相同方式失败 → 与本仓库无关 |
| `node -e fetch(...)` 直连 raw.githubusercontent.com | 200（隐藏代理变量时） |
| `nu http get` 同一 URL | 正常返回 |
| shadcn CLI 拓取同一 URL | 失败 |

因此 `add` / `registry validate <owner>/<repo>` 这两种需要 CLI 自行联网的形式在本机跑不通；
与本仓库内容和结构无关（已另行验证，见下）。

已验证通过的等价链路：

```bash
npx shadcn@latest registry validate ./registry.json   # ✔ Registry is valid
npx shadcn@latest build                               # ✔ 产出 public/r/

# 完整安装（本地 HTTP，不依赖 CLI 的外部拓取）
npx serve public
npx shadcn@latest add http://localhost:3000/r/aurora-button.json
# → Created 3 files + 3 deps，消费方 tsc --noEmit 通过
```

已发布内容的核验（绕过 CLI 的 HTTP 层，直读 raw）：`registry.json` 的 `name`、`homepage`
正确，1 个 item，3 个 `files[].path` 均在已发布文件树中真实存在。