import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // 数组形式：越靠前越优先，精确别名必须排在通配别名之前。
    alias: [
      // 光晕引擎随组件分发，安装到消费项目的 @/lib/aurora.ts；
      // 本仓库直接指向 registry/ 内的同一份源码，避免出现重复副本。
      {
        find: "@/lib/aurora",
        replacement: path.resolve(__dirname, "./registry/aurora-button/lib/aurora.ts"),
      },
      // 展示线引用分发线源码的入口别名
      { find: "@registry", replacement: path.resolve(__dirname, "./registry") },
      // 展示站内部源码（含本仓库自己的 cn()：src/lib/utils.ts）
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
})