/* 一次性诊断：shadcn-components 演示页截图 + 光晕初始化检查 */
import { spawn } from "node:child_process"
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  join(process.env.LOCALAPPDATA ?? "", "Google/Chrome/Application/chrome.exe"),
]
const chromePath = CHROME_CANDIDATES.find((candidate) => candidate && existsSync(candidate))
if (!chromePath) { console.error("找不到 Chrome"); process.exit(2) }

const DEBUG_PORT = 9533
const PREVIEW_PORT = 4174
const userDataDir = join(tmpdir(), `aurora-shadcn-${Date.now()}`)
const viteBin = join(import.meta.dirname, "..", "node_modules", "vite", "bin", "vite.js")
const preview = spawn(process.execPath, [viteBin, "preview", "--port", String(PREVIEW_PORT), "--strictPort"], { stdio: "ignore" })
const chrome = spawn(chromePath, [
  "--headless=new", `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${userDataDir}`,
  "--no-first-run", "--window-size=1280,1200", "about:blank",
], { stdio: "ignore" })

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let socket = null
const cleanup = () => {
  try { socket?.close(); } catch {}
  try { chrome.kill(); } catch {}
  try { preview.kill(); } catch {}
  try { rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  process.exit(0)
}

function connect(webSocketUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(webSocketUrl)
    let nextId = 0
    const pendingRequests = new Map()
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.id !== undefined && pendingRequests.has(message.id)) {
        pendingRequests.get(message.id)(message)
        pendingRequests.delete(message.id)
      }
    }
    ws.onerror = (event) => reject(new Error(String(event?.message ?? event)))
    ws.onopen = () => resolve({
      socket: ws,
      send(method, params = {}) {
        return new Promise((resolveRequest, rejectRequest) => {
          const requestId = ++nextId
          pendingRequests.set(requestId, resolveRequest)
          ws.send(JSON.stringify({ id: requestId, method, params }))
          setTimeout(() => rejectRequest(new Error("timeout " + method)), 45000)
        })
      },
    })
  })
}

async function waitFor(predicate, label) {
  const deadline = Date.now() + 20000
  while (Date.now() < deadline) {
    try { const result = await predicate(); if (result) return result } catch {}
    await sleep(250)
  }
  throw new Error("超时: " + label)
}

await waitFor(async () => (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)).ok, "devtools")
await waitFor(async () => (await fetch(`http://localhost:${PREVIEW_PORT}/`)).ok, "preview")

const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json()
const page = targets.find((target) => target.type === "page")
const connection = await connect(page.webSocketDebuggerUrl)
socket = connection.socket
const send = connection.send
const evalJs = async (expression) => {
  const response = await send("Runtime.evaluate", { expression, returnByValue: true })
  return response.result?.result?.value
}

await send("Page.enable")
await send("Page.navigate", { url: `http://localhost:${PREVIEW_PORT}/?t=` + Date.now() })
await sleep(2500)

/* 悬停第一个按钮：完整鼠标路径（角落 → 中心 → 目标点），与旧项目验证脚本一致 */
const hoverProbe = await evalJs(`(() => {
  const button = document.querySelectorAll('.aurora-button')[0];
  const rect = button.getBoundingClientRect();
  /* 目标点取中心偏右下（药丸形圆角外会吃掉 hit area，不能太贴边） */
  return { centerX: Math.round(rect.left + rect.width / 2), centerY: Math.round(rect.top + rect.height / 2), targetX: Math.round(rect.left + rect.width / 2 + 10), targetY: Math.round(rect.top + rect.height / 2 + 5) };
})()`)
console.log("hover 探针:", JSON.stringify(hoverProbe))
/* 完整鼠标路径：角落 → 中心 → 目标点，每步后读 hover 状态定位断点 */
const mousePath = [
  { x: 3, y: 3 },
  { x: hoverProbe.centerX, y: hoverProbe.centerY },
  { x: hoverProbe.targetX, y: hoverProbe.targetY },
]
let stepIndex = 0
for (const point of mousePath) {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y, buttons: 0 })
  await sleep(300)
  const stepState = await evalJs(`({ step: ${stepIndex}, hover: document.querySelectorAll('.aurora-button')[0].matches(':hover'), element: (() => { const hit = document.elementFromPoint(${point.x}, ${point.y}); return hit ? hit.tagName : 'none' })() })`)
  console.log(`step ${stepIndex}:`, JSON.stringify(stepState))
  stepIndex++
}
await sleep(900)

const hoverState = await evalJs(`({ hover: document.querySelectorAll('.aurora-button')[0].matches(':hover'), opacity: getComputedStyle(document.querySelectorAll('.aurora-var-layer')[0]).opacity })`)
console.log("最终悬停状态:", JSON.stringify(hoverState))

const report = await evalJs(`(() => {
  const buttons = [...document.querySelectorAll('.aurora-button')]
  const glowStates = buttons.map(button => {
    const glow = button.querySelector('.aurora-glow')
    return {
      radius: glow?.style.getPropertyValue('--aurora-radius') || '(unset)',
      ready: glow?.dataset.auroraReady ?? '0',
      error: glow?.dataset.auroraError ?? '',
    }
  })
  return {
    count: buttons.length,
    readyAll: glowStates.every(glow => glow.ready === '1'),
    glowStates,
    sample: buttons[0] ? {
      height: getComputedStyle(buttons[0]).height,
      background: getComputedStyle(buttons[0].querySelector('.aurora-surface')).background.slice(0, 60),
    } : null,
    variantBackgrounds: buttons.map(button => ({
      label: button.textContent.trim().slice(0, 12),
      background: getComputedStyle(button.querySelector('.aurora-surface')).backgroundColor,
    })),
  }
})()`)
console.log(JSON.stringify(report, null, 2))

mkdirSync("_verify", { recursive: true })
const screenshot = await send("Page.captureScreenshot", { format: "png" })
writeFileSync("_verify/shadcn-demo.png", Buffer.from(screenshot.result.data, "base64"))
console.log("截图: _verify/shadcn-demo.png")

cleanup()
