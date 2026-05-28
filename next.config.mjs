/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 走静态导出
  output: 'export',

  // 静态导出不支持 next/image 优化
  images: {
    unoptimized: true,
  },

  // 兼容旧 .html 链接：URL 以斜杠结尾，外部 _redirects 再做 .html → / 的 301
  trailingSlash: true,

  // posts/ 等内容目录是历史结构，不走 src/，保持当前根目录布局
  reactStrictMode: true,

  // 迁移期容忍：列表与文章页用到的图片别名暂时保持与 VitePress 一致
  // 实际渲染走 lib/posts.ts 的路径归一化，这里只是给 IDE 的提示
}

export default nextConfig
