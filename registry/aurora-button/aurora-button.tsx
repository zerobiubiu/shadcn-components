import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Aurora, initAurora, VAR_SIZE, type AuroraSizeOverrides } from "@/lib/aurora"
import "./aurora-glow.css"

/* ─────────────────────────── 光晕 hook ───────────────────────────
   原 DOM 用 jsname 定位节点；光晕引擎角度逐帧变化，刻意不走 React 渲染，
   全部通过 ref + setProperty + rAF 驱动（与原站一致）。 */

interface GlowNodes {
  glowRef: React.RefObject<HTMLDivElement | null>
  varLayerRef: React.RefObject<HTMLDivElement | null>
  innerBlurRef: React.RefObject<HTMLDivElement | null>
}

function useAuroraGlow({ glowRef, varLayerRef, innerBlurRef }: GlowNodes) {
  const rootRef = React.useRef<HTMLButtonElement>(null)
  const auroraRef = React.useRef<Aurora | null>(null)

  React.useEffect(() => {
    const container = glowRef.current
    const varLayer = varLayerRef.current
    const blurLayer = innerBlurRef.current
    if (!container || !varLayer || !blurLayer) return

    /* 光晕圆角跟随按钮实际圆角（sizeVariant 写的 --aurora-button-radius） */
    const radius = getComputedStyle(container).getPropertyValue("--aurora-button-radius").trim()
    const sizeOverrides: AuroraSizeOverrides | undefined = radius
      ? { [VAR_SIZE.radius]: radius }
      : undefined

    const instance = initAurora({ container, varLayer, blurLayer, buttonContext: true }, sizeOverrides)
    if (!instance) return // 初始化失败时已把原因写进 data-aurora-error

    auroraRef.current = instance.aurora
    return () => {
      instance.dispose()
      delete container.dataset.auroraReady
      delete container.dataset.auroraError
      auroraRef.current = null
    }
  }, [glowRef, varLayerRef, innerBlurRef])

  /* hover/focus 进入：开始跟随（4/1.5 即原站 --aurora-scale-x / --aurora-scale-y） */
  const startFollow = React.useCallback(() => {
    const root = rootRef.current
    if (root) auroraRef.current?.startFollow(root, 4, 1.5)
  }, [])

  /* hover/focus 离开：淡出并停止 */
  const stopFollow = React.useCallback(() => {
    auroraRef.current?.stopFollow()
  }, [])

  return { rootRef, startFollow, stopFollow }
}

/* ─────────────────────────── variants ─────────────────────────── */

const auroraButtonVariants = cva(
  // 基础：原 .plR5qb 的定位与字形（底色/圆角由 glow 容器层渲染，见 aurora-glow.css）
  [
    "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center",
    "border-0 bg-transparent p-0 text-[14px] leading-none font-normal outline-none",
    "[border-radius:var(--aurora-button-radius,100px)]",
    "[margin-inline-start:var(--aurora-button-margin-inline-start,0px)]",
    "focus-visible:[&_.aurora-surface]:outline focus-visible:[&_.aurora-surface]:outline-2",
    "focus-visible:[&_.aurora-surface]:outline-offset-2 focus-visible:[&_.aurora-surface]:outline-[#1a73e8]",
  ],
  {
    variants: {
      /** 视觉主题 */
      variant: {
        /** 默认：浅灰底（原 .bvUkz 默认态） */
        default: "[--aurora-surface:#f0f4f9] [--aurora-text:#1f1f1f]",
        /** 强调态：蓝色调（原 .VzUPFe） */
        highlighted: "[--aurora-surface:#d3e3fd] [--aurora-text:#0b57d0]",
        /** 无底色虚化（原 .PHjFye）：hover 不模糊 */
        plain: "[--aurora-surface:#f0f4f9] [--aurora-text:#1f1f1f] hover:[&_.aurora-surface]:blur-none",
        /** 透明底：只留光晕 */
        ghost: "[--aurora-surface:transparent] [--aurora-text:inherit]",
      },
      /** 尺寸（高度 + 水平内边距） */
      size: {
        /** 原站默认 36px */
        default: "[--aurora-button-height:36px] [--aurora-button-padding-x:8px]",
        /** 原站收起态 24px */
        sm: "[--aurora-button-height:24px] [--aurora-button-padding-x:6px]",
        /** 大号 */
        lg: "[--aurora-button-height:48px] [--aurora-button-padding-x:16px]",
        /** 图标按钮：正方形 */
        icon: "[--aurora-button-height:36px] [--aurora-button-padding-x:0px] w-9",
      },
      /** 圆角（光晕自动跟随） */
      radius: {
        pill: "[--aurora-button-radius:100px]",
        rounded: "[--aurora-button-radius:8px]",
        square: "[--aurora-button-radius:0px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "pill",
    },
  },
)

/* ─────────────────────────── 组件 ─────────────────────────── */

export interface AuroraButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof auroraButtonVariants> {
  /** 是否禁用 hover 底色虚化（原 .PHjFye）；variant="plain" 时已隐含 */
  noBlur?: boolean
}

/** 图标占位宽度：原站图标 20×20，文字 margin-inline-start 20px 预留图标位 */
const AuroraButton = React.forwardRef<HTMLButtonElement, AuroraButtonProps>(function AuroraButton(
  { className, variant, size, radius, noBlur, children, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props },
  ref,
) {
  const glowRef = React.useRef<HTMLDivElement>(null)
  const varLayerRef = React.useRef<HTMLDivElement>(null)
  const innerBlurRef = React.useRef<HTMLDivElement>(null)
  const { rootRef, startFollow, stopFollow } = useAuroraGlow({ glowRef, varLayerRef, innerBlurRef })

  /* 合并外部 ref（React 19 之前 forwardRef 只能给一个，手动串接） */
  const setRefs = React.useCallback(
    (node: HTMLButtonElement | null) => {
      rootRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
    },
    [ref],
  )

  /* hover/focus 跟随光晕，同时把调用方自己的同名事件接在后面 */
  const handleEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    startFollow()
    onMouseEnter?.(event)
  }
  const handleLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    stopFollow()
    onMouseLeave?.(event)
  }
  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    startFollow()
    onFocus?.(event)
  }
  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    stopFollow()
    onBlur?.(event)
  }

  const hideBlur = noBlur || variant === "plain"

  return (
    <button
      ref={setRefs}
      type="button"
      className={cn(        "aurora-button",        auroraButtonVariants({ variant, size, radius }),        hideBlur && "aurora-plain",        className,      )}
      style={{ height: "var(--aurora-button-height, 36px)", padding: "0 var(--aurora-button-padding-x, 8px)" }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {/* 光晕层结构逐层对应原 DOM：CcxW7b > BznTFe > fZhNMe > WkMYIb > (eruMcc > Tdahud > tgPjse) × 2 */}
      <span className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
        <span ref={glowRef} className="aurora-glow absolute inset-0 overflow-visible">
          <span ref={varLayerRef} className="aurora-var-layer absolute inset-0">
            {/* 对应原 .WkMYIb：border-radius 必须逐层继承，否则模糊层矩形裁剪漏出色块 */}
            <span className="absolute inset-0 [border-radius:inherit]">
              <span ref={innerBlurRef} className="aurora-blur">
                <span className="aurora-mask">
                  <span className="aurora-disc" />
                </span>
              </span>
              <span className="aurora-blur aurora-blur-inner">
                <span className="aurora-mask">
                  <span className="aurora-disc" />
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>

      {/* 按钮底色层（原 .bvUkz）：颜色由 variant 注入的 CSS 变量决定 */}
      <span
        className="aurora-surface pointer-events-none absolute inset-[1px] [clip-path:inset(0_round_var(--aurora-button-radius,100px))]"
        style={{
          borderRadius: "var(--aurora-button-radius, 100px)",
          background: "var(--aurora-surface, #f0f4f9)",
        }}
      />

      {/* 内容区 */}
      <span className="relative z-[1] flex items-center justify-center gap-1.5 text-[color:var(--aurora-text,#1f1f1f)]">
        {children}
      </span>
    </button>
  )
})

export { AuroraButton, auroraButtonVariants }
