import { AuroraButton } from "@registry/aurora-button/aurora-button"

function App() {
  return (
    <main className="min-h-screen bg-white text-neutral-700 flex flex-col items-center justify-center gap-8 py-16">
      <h1 className="text-lg font-medium text-neutral-900">
        Aurora 按钮 · shadcn/ui 风格
      </h1>

      <section className="flex flex-col items-center gap-4">
        <p className="text-xs text-neutral-400">variant</p>
        <div className="flex items-center gap-3">
          <AuroraButton>Default</AuroraButton>
          <AuroraButton variant="highlighted">Highlighted</AuroraButton>
          <AuroraButton variant="ghost">Ghost</AuroraButton>
        </div>
      </section>

      <section className="flex flex-col items-center gap-4">
        <p className="text-xs text-neutral-400">size</p>
        <div className="flex items-center gap-3">
          <AuroraButton size="sm">Small</AuroraButton>
          <AuroraButton>Default</AuroraButton>
          <AuroraButton size="lg">Large</AuroraButton>
          <AuroraButton size="icon" aria-label="AI 模式">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.5 12c0-3.04 2.46-5.5 5.5-5.5-3.04 0-5.5-2.46-5.5-5.5 0 3.04-2.46 5.5-5.5 5.5 3.04 0 5.5 2.46 5.5 5.5z" />
            </svg>
          </AuroraButton>
        </div>
      </section>

      <section className="flex flex-col items-center gap-4">
        <p className="text-xs text-neutral-400">radius（光晕自动跟随）</p>
        <div className="flex items-center gap-3">
          <AuroraButton radius="pill">Pill</AuroraButton>
          <AuroraButton radius="rounded">Rounded</AuroraButton>
          <AuroraButton radius="square">Square</AuroraButton>
        </div>
      </section>

      <section className="flex flex-col items-center gap-4">
        <p className="text-xs text-neutral-400">组合 & 任意内容</p>
        <div className="flex items-center gap-3">
          <AuroraButton variant="highlighted" size="lg" radius="rounded">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.5 12c0-3.04 2.46-5.5 5.5-5.5-3.04 0-5.5-2.46-5.5-5.5 0 3.04-2.46 5.5-5.5 5.5 3.04 0 5.5 2.46 5.5 5.5z" />
            </svg>
            AI 模式
          </AuroraButton>
          <AuroraButton variant="plain" size="sm" onClick={() => alert("clicked")}>
            Plain + onClick
          </AuroraButton>
          <AuroraButton disabled className="opacity-50">
            Disabled
          </AuroraButton>
        </div>
      </section>

      <p className="max-w-md text-center text-xs leading-relaxed text-neutral-400">
        悬停任意按钮：彩虹光晕朝向鼠标，随指针移动。
        引擎与原站一致（ref + setProperty + rAF），不经过 React 渲染。
      </p>
    </main>
  )
}

export default App
