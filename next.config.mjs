import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER

  return {
    // Cloudflare Pages 走静态导出；dev 下保留 Next server，供本地内容热更新 endpoint 使用
    output: isDev ? undefined : 'export',

    // 静态导出不支持 next/image 优化
    images: {
      unoptimized: true,
    },

    // 兼容旧 .html 链接：URL 以斜杠结尾，外部 _redirects 再做 .html → / 的 301
    trailingSlash: true,

    // dev-only route 使用 route.dev.ts，生产静态导出时完全忽略
    pageExtensions: isDev ? ['dev.ts', 'tsx', 'ts', 'jsx', 'js'] : ['tsx', 'ts', 'jsx', 'js'],

    // posts/ 等内容目录是历史结构，不走 src/，保持当前根目录布局
    reactStrictMode: true,

    // 迁移期容忍：列表与文章页用到的图片别名暂时保持与 VitePress 一致
    // 实际渲染走 lib/posts.ts 的路径归一化，这里只是给 IDE 的提示
  }
}
