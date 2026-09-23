/* ============================================================================
   aurora.ts —— 原始算法的 TS 搬运
   ---------------------------------------------------------------------------
   来源：./source/ORIGINAL-js.js（从 xjs bundle scriptId 737 逐字节切出）
   算法逐字节保真；标识符已按语义重命名，下方对照表仅用于回溯 bundle 原文。

   函数 / 类 对照（bundle 混淆名 → 本项目语义名）：
     zQE    →  computeTargetAngle     由鼠标位置求目标方位角
     AQE    →  lerpShortest           沿最短路径的角度插值
     BQE    →  runFrame               rAF 主循环
     _.CQE  →  class Aurora           Aurora 动画器
     EQE    →  createAurora           组件初始化
     _.u6c  →  prefersReducedMotion   系统「减弱动态效果」检测

   Aurora 实例字段对照：
     Aa  →  glowContainer      ka  →  variableLayer     Wa  →  blurLayer
     yb  →  isButtonContext    Ia  →  runningAnimations nb  →  isPlaying
     Ma  →  gradientAngle      wa  →  maskAngle         mJa →  targetAngle
     Qa  →  isFollowing        Pa  →  fadeAnimation     oa  →  angularVelocity
     Ca  →  rafId              bzb →  hoverElement      nQ  →  pointerScaleX
     oQ  →  pointerScaleY      Ka  →  buttonRect        Ya  →  handleMouseMove

   Aurora 方法对照：
     Sa    →  startFollow（鼠标进入，开始跟随）
     Ha    →  stopFollow （鼠标离开，淡出并停止跟随）

   CSS 变量对照（原站运行时哈希名 → 本项目语义名，即原站 _.Sg 的注册名）：
     --q9niGe  →  --aurora-mask-angle       --cqcjz   →  --aurora-gradient-angle
     --BgHDjb  →  --aurora-radius           --bFlrOb  →  --aurora-blur
     --HM63Tc  →  --aurora-inset            --sjdAce  →  --aurora-scale-x
     --mWus4b  →  --aurora-scale-y
   ============================================================================ */

/* ──────────────────────────── CSS 变量名 ──────────────────────────── */

/** 原 _.Sg("aurora-mask-angle") 运行时映射到的实际变量名 */
export const VAR_MASK_ANGLE = "--aurora-mask-angle";
/** 原 _.Sg("aurora-gradient-angle") 运行时映射到的实际变量名 */
export const VAR_GRADIENT_ANGLE = "--aurora-gradient-angle";

/** 原 _.Sg("aurora-radius" | "aurora-blur" | "aurora-inset" | "aurora-scale-x" | "aurora-scale-y") */
export const VAR_SIZE = {
  radius: "--aurora-radius",
  blur: "--aurora-blur",
  inset: "--aurora-inset",
  scaleX: "--aurora-scale-x",
  scaleY: "--aurora-scale-y",
} as const;

/** EQE 写入的 5 个尺寸值（原文逐字节） */
export const SIZE_VALUES = {
  [VAR_SIZE.radius]: "100px",
  [VAR_SIZE.blur]: "4px",
  [VAR_SIZE.inset]: "-1px",
  [VAR_SIZE.scaleX]: "4",
  [VAR_SIZE.scaleY]: "1.5",
} as const;

/** 写入时的两个偏移常量（原文 `a.wa + -167` / `a.Ma + -142`） */
export const MASK_OFFSET_DEG = -167;
export const GRADIENT_OFFSET_DEG = -142;

/* ──────────────────────── 弹簧-阻尼 / 低通参数 ──────────────────────── */

/** 角速度每帧增量系数（原文 `v += Δ*0.05`） */
const SPRING_ACCEL_FACTOR = 0.05;
/** 低通增益的角差饱和值：角差 ≥ 90° 时增益取满（原文 `min(|Δ|/90, 1)`） */
const GAIN_NORMALIZE_DEG = 90;
/** 低通增益曲线的三次方（原文 `pow(..., 3)`） */
const GAIN_EXPONENT = 3;
/** 显隐淡入淡出时长，对应原文两处 350ms opacity 动画 */
const FADE_DURATION_MS = 350;
/** 入场动画时长：animate(!0, 1E3) 与移除入场 class 的 setTimeout 共用 */
const ENTER_DURATION_MS = 1000;

/** 按钮矩形（原文直接读 DOMRect 的 top/left/width/height） */
export interface ButtonRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/* ────────────────────────────────────────────────────────────────────────────
   原 zQE：由鼠标位置求目标方位角
     zQE=function(a,b,c,d,e=7,f=1.5){
       a.mJa=180/Math.PI*Math.atan2((c-(d.top+d.height/2))/f,(b-(d.left+d.width/2))/e)
     };
   b=clientX  c=clientY  d=rect  e=scaleX  f=scaleY
   除 e/f 即「先缩放到圆盘空间再求角」，与 CSS scale(--aurora-scale-x, --aurora-scale-y) 同源。
   ──────────────────────────────────────────────────────────────────────────── */
export function computeTargetAngle(
  clientX: number,
  clientY: number,
  rect: ButtonRect,
  scaleX = 7,
  scaleY = 1.5,
): number {
  return (180 / Math.PI) * Math.atan2(
    (clientY - (rect.top + rect.height / 2)) / scaleY,
    (clientX - (rect.left + rect.width / 2)) / scaleX,
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   原 AQE：沿最短路径的角度插值
     AQE=function(a,b,c){b=(b-a)%360;return a+(2*b%360-b)*c};
   `2*delta%360-delta` 把任意角差折成 (-180, 180]，避免绕远路。
   ──────────────────────────────────────────────────────────────────────────── */
export function lerpShortest(from: number, to: number, factor: number): number {
  const delta = (to - from) % 360;
  return from + ((2 * delta) % 360 - delta) * factor;
}

/** 最短有向角差，等价于上面的 `(2*delta%360 - delta)` */
function shortestDelta(from: number, to: number): number {
  const delta = (to - from) % 360;
  return (2 * delta) % 360 - delta;
}

/** 原 _.u6c() */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return (
    window.matchMedia("(prefers-reduced-motion)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Aurora 构造参数（对应 _.CQE 构造签名 `(Aa, ka, Wa, Aq, yb)`） */
export interface AuroraTargets {
  /** Aa：光晕容器（aurora-glow）——入场时同步高度，本例仅用于非空判断 */
  container: HTMLElement;
  /** ka：变量层（aurora-var-layer）——两个角度写在它身上 */
  varLayer: HTMLElement;
  /** Wa：内层模糊层（aurora-blur-inner）——入场时做 blur 动画 */
  blurLayer: HTMLElement;
  /** yb：是否按钮语境（决定入场 blur 曲线用 5/3/5 还是 20/5/7） */
  buttonContext?: boolean;
}

/** 一次低通滤波后的两个输出角 */
export interface AuroraAngles {
  maskAngle: number;
  gradientAngle: number;
}

/* ────────────────────────────────────────────────────────────────────────────
   原 _.CQE —— Aurora 动画器
   字段与方法的原名见文件头对照表；实现与原文一一对应。
   ──────────────────────────────────────────────────────────────────────────── */
export class Aurora {
  /** Aa：光晕容器 */
  private glowContainer: HTMLElement;
  /** ka：变量层 */
  private variableLayer: HTMLElement;
  /** Wa：内层模糊层 */
  private blurLayer: HTMLElement;
  /** yb：是否按钮语境 */
  private isButtonContext: boolean;

  /** Ia：进行中的 Web Animations 列表 */
  private runningAnimations: Animation[] = [];
  /** nb：当前 animate 状态（true=播放中），用于幂等判断 */
  private isPlaying = false;
  /** Ma：渐变角（慢通道输出）；wa：遮罩角（快通道输出）；mJa：目标角 */
  private gradientAngle = 0;
  private maskAngle = 0;
  private targetAngle = 0;
  /** Qa：是否正在跟随鼠标 */
  private isFollowing = false;
  /** Pa：显隐动画（startFollow/stopFollow 里的 350ms opacity 动画） */
  private fadeAnimation: Animation | null = null;
  /** oa：角速度；Ca：rAF 句柄 */
  private angularVelocity = 0;
  private rafId = 0;
  /** 摩擦系数（原文写死 .75） */
  private friction = 0.75;
  /** bzb：当前挂 mousemove 的元素 */
  private hoverElement: HTMLElement | null = null;
  /** nQ/oQ：归一化除数（= --aurora-scale-x / --aurora-scale-y） */
  private pointerScaleX = 7;
  private pointerScaleY = 1.5;
  /** Ka：缓存的按钮 rect（避免每帧读取） */
  private buttonRect: ButtonRect | null = null;
  /** Ya：mousemove 处理器 */
  private handleMouseMove = (event: MouseEvent) => {
    if (this.buttonRect) this.setTarget(event.clientX, event.clientY);
  };

  constructor(targets: AuroraTargets) {
    this.glowContainer = targets.container;
    this.variableLayer = targets.varLayer;
    this.blurLayer = targets.blurLayer;
    this.isButtonContext = targets.buttonContext ?? false;
  }

  /* 原 handleMouseMove 内联的 zQE 调用，单独抽出以便可读 */
  private setTarget(clientX: number, clientY: number): void {
    if (!this.buttonRect) return;
    this.targetAngle = computeTargetAngle(
      clientX,
      clientY,
      this.buttonRect,
      this.pointerScaleX,
      this.pointerScaleY,
    );
  }

  /* ── 原 animate(a, b=650)：入场动画 ─────────────────────────────────────
     isVisible=true 播放 / false 取消；durationMs 默认 650ms，按钮语境传 1000ms。
     三条动画并行：容器 opacity、内层 blur、两个角度从固定起点扫到固定终点。 */
  animate(isVisible: boolean, durationMs = 650): void {
    if (!this.glowContainer || prefersReducedMotion()) return;
    const isFreshStart = !this.isPlaying && isVisible;
    this.isPlaying = isVisible;
    if (!isFreshStart) {
      if (!isVisible) this.cancel();
      return;
    }

    this.cancel();
    /* 原文在此处 CSS.registerProperty 两个角度变量；本移植版用 @property（见 index.css 顶部） */

    if (!(this.variableLayer && this.blurLayer && isVisible)) return;

    // ① 容器透明度：0 → 1 → 1 → 0（两端各带缓动）
    const opacityAnimation = this.variableLayer.animate(
      [
        { opacity: 0, easing: "cubic-bezier(0, 0, 0, 1)", offset: 0 },
        { opacity: 1, offset: 0.25 },
        { opacity: 1, easing: "cubic-bezier(0.30, 0.00, 0.80, 0.15)", offset: 0.5 },
        { opacity: 0, offset: 1 },
      ],
      { duration: durationMs, fill: "both" },
    );

    // ② 内层 blur 呼吸。按钮语境用 5/3/5，非按钮语境用 20/5/7
    const blurAnimation = this.blurLayer.animate(
      this.isButtonContext
        ? [
            { filter: "blur(1px)" },
            { filter: "blur(5px)", offset: 0.15 },
            { filter: "blur(3px)", offset: 0.25 },
            { filter: "blur(5px)", offset: 0.45 },
            { filter: "blur(1px)" },
          ]
        : [
            { filter: "blur(1px)" },
            { filter: "blur(20px)", offset: 0.15 },
            { filter: "blur(5px)", offset: 0.25 },
            { filter: "blur(7px)", offset: 0.45 },
            { filter: "blur(1px)" },
          ],
      { duration: durationMs, fill: "both", easing: "linear" },
    );

    // ③ 两个角度从固定起点扫到固定终点（与鼠标位置无关）
    const angleAnimation = this.variableLayer.animate(
      [
        { [VAR_GRADIENT_ANGLE]: "170deg", [VAR_MASK_ANGLE]: "-90deg", easing: "cubic-bezier(0, 0, 0, 1)" },
        { [VAR_GRADIENT_ANGLE]: "225deg", [VAR_MASK_ANGLE]: "200deg" },
      ],
      { duration: durationMs, fill: "both" },
    );

    this.runningAnimations.push(opacityAnimation, blurAnimation, angleAnimation);
    for (const animation of this.runningAnimations) {
      animation.playbackRate = 1;
      animation.play();
    }
  }

  cancel(): void {
    for (const animation of this.runningAnimations) animation.cancel();
    this.runningAnimations.length = 0;
  }

  /* ── 原 Sa(a, b=7, c=1.5)：鼠标进入，开始跟随 ──────────────────────────
     注意：角度不归零，只归零速度；所以再次进入会从上次角度平滑接续。 */
  startFollow(element: HTMLElement, scaleX = 7, scaleY = 1.5): void {
    if (!this.variableLayer) return;
    this.hoverElement = element;
    this.pointerScaleX = scaleX;
    this.pointerScaleY = scaleY;
    this.buttonRect = element.getBoundingClientRect();
    this.isFollowing = true;
    this.angularVelocity = 0;
    this.cancel();
    this.fadeAnimation?.cancel();
    this.fadeAnimation = this.variableLayer.animate([{ opacity: 1 }], {
      duration: FADE_DURATION_MS,
      fill: "forwards",
    });
    element.addEventListener("mousemove", this.handleMouseMove);
    if (!this.rafId) runFrame(this);
  }

  /* ── 原 Ha()：鼠标离开，淡出并停止跟随 ──────────────────────────────────
     isFollowing 置 false 后，rAF 会在下一帧自行结束（不是立刻 cancelAnimationFrame）。 */
  stopFollow(): void {
    if (!this.variableLayer) return;
    this.isFollowing = false;
    this.angularVelocity = 0;
    this.fadeAnimation?.cancel();
    this.fadeAnimation = this.variableLayer.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: FADE_DURATION_MS, fill: "forwards" },
    );
    if (this.hoverElement) {
      this.hoverElement.removeEventListener("mousemove", this.handleMouseMove);
      this.hoverElement = null;
    }
    this.buttonRect = null;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  /** 供 rAF 循环读写（对应原文对实例字段的直接访问） */
  computeAngles(): AuroraAngles | null {
    if (!this.isFollowing) return null;

    /* 原 BQE 前半段：弹簧-阻尼积分器
         v += Δ*0.05;  v *= 0.75;  a += v   （Δ 为最短有向角差） */
    this.angularVelocity += shortestDelta(this.maskAngle, this.targetAngle) * SPRING_ACCEL_FACTOR;
    this.angularVelocity *= this.friction;
    this.maskAngle += this.angularVelocity;

    /* 原 BQE 后半段：三次门控低通
         Ma = AQE(Ma, wa, pow(min(|Δ|/90, 1), 3))
       角差大时增益趋于 1（瞬时跟上），角差小时增益趋近 0（冻结色相）。 */
    const delta = (this.maskAngle - this.gradientAngle) % 360;
    const gain = Math.pow(
      Math.min(Math.abs((2 * delta) % 360 - delta) / GAIN_NORMALIZE_DEG, 1),
      GAIN_EXPONENT,
    );
    this.gradientAngle = lerpShortest(this.gradientAngle, this.maskAngle, gain);

    return { maskAngle: this.maskAngle, gradientAngle: this.gradientAngle };
  }

  scheduleFrame(id: number): void {
    this.rafId = id;
  }

  /** 写变量（对应原 BQE 里两次 setProperty，偏移常量原样） */
  private writeAngles(maskAngle: number, gradientAngle: number): void {
    this.variableLayer.style.setProperty(
      VAR_MASK_ANGLE,
      `${maskAngle + MASK_OFFSET_DEG}deg`,
    );
    this.variableLayer.style.setProperty(
      VAR_GRADIENT_ANGLE,
      `${gradientAngle + GRADIENT_OFFSET_DEG}deg`,
    );
  }

  /* 对外暴露一次的写入入口，避免 computeAngles 直接操作 DOM 破坏封装 */
  writeAnglesOnce(angles: AuroraAngles): void {
    this.writeAngles(angles.maskAngle, angles.gradientAngle);
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   原 BQE —— rAF 主循环
     BQE=function(a){ if(a.Qa){ ...; a.ka&&(setProperty × 2); a.Ca=requestAnimationFrame(()=>BQE(a)) } };
   等价实现：读角度 → 写变量 → 排下一帧。
   ──────────────────────────────────────────────────────────────────────────── */
function runFrame(aurora: Aurora): void {
  const nextAngles = aurora.computeAngles();
  if (!nextAngles) return;
  aurora.writeAnglesOnce(nextAngles);
  aurora.scheduleFrame(requestAnimationFrame(() => runFrame(aurora)));
}

/* ────────────────────────────────────────────────────────────────────────────
   原 EQE —— 组件初始化
     EQE=function(a){
       a.oa=new _.CQE(IVmF1e, HQj0A, JoEfzc, void 0, !0);
       b.style.setProperty(--border-radius,"100px"); ... × 5
       a.oa?.animate(!0, 1E3);
       a.k0.classList.add("aurora-entering"); setTimeout(remove, 1E3);
       a.addOnDisposeCallback(()=>{ clearTimeout(c); a.oa?.Ha() })
     };
   注：原文入场加的 class 是未定义样式的哈希名 "HYcHq"，本项目按语义改名为
   "aurora-entering"（仓库内同样没有对应规则，行为与原文一致：仅加/删 class）。
   ──────────────────────────────────────────────────────────────────────────── */
export function createAurora(
  targets: AuroraTargets,
  sizeOverrides?: AuroraSizeOverrides,
): { aurora: Aurora; dispose: () => void } {
  const aurora = new Aurora(targets);

  // 5 个尺寸变量写在光晕容器上，供下层继承；sizeOverrides 可覆盖任意项
  const sizes: Record<string, string> = { ...SIZE_VALUES, ...sizeOverrides };
  for (const [variableName, value] of Object.entries(sizes)) {
    targets.container.style.setProperty(variableName, value);
  }

  aurora.animate(true, ENTER_DURATION_MS);

  const enterClassTimerId = window.setTimeout(() => {
    targets.container.classList.remove("aurora-entering");
  }, ENTER_DURATION_MS);

  return {
    aurora,
    dispose: () => {
      window.clearTimeout(enterClassTimerId);
      aurora.stopFollow();
      aurora.cancel();
    },
  };
}

/**
 * 尺寸变量覆盖：通用化后允许宿主改写光晕的 5 个尺寸
 * （key 为语义变量名，如 --aurora-radius；value 为 CSS 长度/数值）
 */
export type AuroraSizeOverrides = Partial<Record<(typeof VAR_SIZE)[keyof typeof VAR_SIZE], string>>;

export function initAurora(
  targets: AuroraTargets,
  sizeOverrides?: AuroraSizeOverrides,
): { aurora: Aurora; dispose: () => void } | null {
  try {
    const instance = createAurora(targets, sizeOverrides);
    targets.container.dataset.auroraReady = "1";
    delete targets.container.dataset.auroraError;
    return instance;
  } catch (error) {
    targets.container.dataset.auroraReady = "0";
    targets.container.dataset.auroraError =
      error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    return null;
  }
}
