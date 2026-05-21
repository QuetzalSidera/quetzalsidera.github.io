<script setup lang="ts">
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
import FontAwesomeIcon from '../FontAwesomeIcon.vue'
import { ref } from 'vue'

const isGenerating = ref(false)

const waitForImages = async (root: ParentNode) => {
  const images = Array.from(root.querySelectorAll('img'))

  await Promise.all(images.map((img) => new Promise<void>((resolve) => {
    if (img.complete) {
      resolve()
      return
    }

    const done = () => resolve()
    img.addEventListener('load', done, { once: true })
    img.addEventListener('error', done, { once: true })
  })))
}

const nextFrame = () => new Promise<void>((resolve) => {
  window.requestAnimationFrame(() => resolve())
})

const buildExportNode = (title: string, content: HTMLElement) => {
  const shell = document.createElement('div')
  shell.className = 'pdf-export-shell'
  shell.innerHTML = `
    <main class="pdf-export-main">
      <h1 class="pdf-export-title"></h1>
      <p class="pdf-export-meta"></p>
      <article class="pdf-export-content"></article>
    </main>
  `

  const titleNode = shell.querySelector('.pdf-export-title')
  const metaNode = shell.querySelector('.pdf-export-meta')
  const articleNode = shell.querySelector('.pdf-export-content')

  if (titleNode) {
    titleNode.textContent = title
  }

  if (metaNode) {
    metaNode.innerHTML = `导出时间：${new Date().toLocaleString('zh-CN')}<br />来源：${window.location.href}`
  }

  if (articleNode) {
    articleNode.appendChild(content)
  }

  return shell
}

const applyExportStyles = (root: HTMLElement) => {
  root.style.position = 'absolute'
  root.style.left = '-100000px'
  root.style.top = '0'
  root.style.zIndex = '1'
  root.style.width = '860px'
  root.style.maxWidth = '860px'
  root.style.padding = '32px'
  root.style.background = '#ffffff'
  root.style.color = '#2f3a46'
  root.style.fontFamily = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
  root.style.lineHeight = '1.75'
  root.style.pointerEvents = 'none'
  root.style.overflow = 'visible'
  root.style.transform = 'translateY(0)'

  const main = root.querySelector('.pdf-export-main') as HTMLElement | null
  const title = root.querySelector('.pdf-export-title') as HTMLElement | null
  const meta = root.querySelector('.pdf-export-meta') as HTMLElement | null
  const article = root.querySelector('.pdf-export-content') as HTMLElement | null

  if (main) {
    main.style.maxWidth = '860px'
    main.style.margin = '0 auto'
  }

  if (title) {
    title.style.margin = '0 0 8px'
    title.style.fontSize = '32px'
    title.style.lineHeight = '1.25'
  }

  if (meta) {
    meta.style.margin = '0 0 24px'
    meta.style.fontSize = '13px'
    meta.style.color = '#627181'
  }

  if (!article) {
    return
  }

  article.style.fontSize = '16px'
  article.style.width = '100%'

  article.querySelectorAll('.header-anchor, .outline, .post-side-list, .to-top-button, .download-pdf-button, button.copy')
    .forEach((node) => node.remove())

  article.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((node) => {
    const heading = node as HTMLElement
    heading.style.color = '#2f3a46'
    heading.style.breakAfter = 'avoid'
  })

  article.querySelectorAll('h1').forEach((node) => {
    const heading = node as HTMLElement
    heading.style.fontSize = '30px'
    heading.style.margin = '40px 0 14px'
  })

  article.querySelectorAll('h2').forEach((node) => {
    const heading = node as HTMLElement
    heading.style.fontSize = '24px'
    heading.style.margin = '34px 0 14px'
    heading.style.paddingTop = '18px'
    heading.style.borderTop = '2px dashed #d7dee6'
  })

  article.querySelectorAll('h3').forEach((node) => {
    const heading = node as HTMLElement
    heading.style.fontSize = '20px'
    heading.style.margin = '28px 0 12px'
  })

  article.querySelectorAll('p, ul, ol, blockquote, figure, table, pre').forEach((node) => {
    ;(node as HTMLElement).style.breakInside = 'avoid'
  })

  article.querySelectorAll('a').forEach((node) => {
    const link = node as HTMLElement
    link.style.color = '#128afa'
    link.style.textDecoration = 'underline'
  })

  article.querySelectorAll('hr').forEach((node) => {
    const hr = node as HTMLElement
    hr.style.border = '0'
    hr.style.borderTop = '2px solid #d7dee6'
    hr.style.margin = '28px 0'
  })

  article.querySelectorAll('img, svg, video, iframe').forEach((node) => {
    const media = node as HTMLElement
    media.style.maxWidth = '100%'
    media.style.height = 'auto'
  })

  article.querySelectorAll('mjx-container').forEach((node) => {
    const math = node as HTMLElement
    math.style.lineHeight = '1.2'
    math.style.whiteSpace = 'normal'
    math.style.wordBreak = 'normal'

    if (math.getAttribute('display') === 'true') {
      math.style.display = 'block'
      math.style.margin = '1em 0'
      math.style.textAlign = 'center'
      math.style.overflowX = 'auto'
      math.style.overflowY = 'hidden'
    } else {
      math.style.display = 'inline-block'
      math.style.verticalAlign = 'middle'
    }
  })

  article.querySelectorAll('mjx-container svg').forEach((node) => {
    const svg = node as HTMLElement
    svg.style.maxWidth = 'none'
    svg.style.width = 'auto'
    svg.style.height = 'auto'
    svg.style.display = 'inline-block'
    svg.style.overflow = 'visible'
  })

  article.querySelectorAll('mjx-assistive-mml').forEach((node) => {
    ;(node as HTMLElement).style.display = 'none'
  })

  article.querySelectorAll('figure').forEach((node) => {
    const figure = node as HTMLElement
    figure.style.margin = '20px auto'
  })

  article.querySelectorAll('figcaption').forEach((node) => {
    const caption = node as HTMLElement
    caption.style.marginTop = '8px'
    caption.style.color = '#627181'
    caption.style.fontSize = '14px'
    caption.style.textAlign = 'center'
  })

  article.querySelectorAll('blockquote').forEach((node) => {
    const blockquote = node as HTMLElement
    blockquote.style.margin = '16px 0'
    blockquote.style.padding = '4px 0 4px 16px'
    blockquote.style.borderLeft = '3px solid #5cd3ff'
    blockquote.style.background = '#f2fbff'
    blockquote.style.borderRadius = '8px'
  })

  article.querySelectorAll('pre, code').forEach((node) => {
    const code = node as HTMLElement
    code.style.fontFamily = '"JetBrains Mono", "SFMono-Regular", Consolas, monospace'
  })

  article.querySelectorAll('pre').forEach((node) => {
    const pre = node as HTMLElement
    pre.style.whiteSpace = 'pre-wrap'
    pre.style.wordBreak = 'break-word'
    pre.style.padding = '16px'
    pre.style.border = '1px solid #d7dee6'
    pre.style.borderRadius = '12px'
    pre.style.overflow = 'hidden'
  })

  article.querySelectorAll('table').forEach((node) => {
    const table = node as HTMLElement
    table.style.width = '100%'
    table.style.borderCollapse = 'collapse'
  })

  article.querySelectorAll('th, td').forEach((node) => {
    const cell = node as HTMLElement
    cell.style.border = '1px solid #d7dee6'
    cell.style.padding = '8px 10px'
    cell.style.textAlign = 'left'
  })
}

const downloadPdf = async () => {
  if (isGenerating.value) {
    return
  }

  const content = document.querySelector('.post-viewer .content')

  if (!(content instanceof HTMLElement)) {
    return
  }

  const clonedContent = content.cloneNode(true)

  const title = document.title.replace(/\s*[|-].*$/, '').trim() || 'post'
  const exportNode = buildExportNode(title, clonedContent as HTMLElement)
  applyExportStyles(exportNode)
  document.body.appendChild(exportNode)

  isGenerating.value = true

  try {
    await waitForImages(exportNode)
    await nextFrame()

    const html2canvasModule = await import('html2canvas')
    const jspdfModule = await import('jspdf')
    const html2canvas = html2canvasModule.default
    const { jsPDF } = jspdfModule
    const filename = `${title}.pdf`
    const canvas = await html2canvas(exportNode, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: exportNode.scrollWidth,
      windowHeight: exportNode.scrollHeight,
    })

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('PDF canvas render failed')
    }

    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    })

    const marginTop = 12
    const marginRight = 10
    const marginBottom = 14
    const marginLeft = 10
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const contentWidth = pageWidth - marginLeft - marginRight
    const contentHeight = pageHeight - marginTop - marginBottom
    const mmPerPx = contentWidth / canvas.width
    const pageSliceHeightPx = Math.max(1, Math.floor(contentHeight / mmPerPx))

    let renderedPages = 0

    for (let offsetY = 0; offsetY < canvas.height; offsetY += pageSliceHeightPx) {
      const sliceHeight = Math.min(pageSliceHeightPx, canvas.height - offsetY)
      const pageCanvas = document.createElement('canvas')
      const pageContext = pageCanvas.getContext('2d')

      if (!pageContext) {
        throw new Error('PDF page context init failed')
      }

      pageCanvas.width = canvas.width
      pageCanvas.height = sliceHeight
      pageContext.fillStyle = '#ffffff'
      pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      pageContext.drawImage(
        canvas,
        0,
        offsetY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      )

      if (renderedPages > 0) {
        pdf.addPage()
      }

      const pageImage = pageCanvas.toDataURL('image/jpeg', 0.98)
      const renderedHeight = sliceHeight * mmPerPx

      pdf.addImage(
        pageImage,
        'JPEG',
        marginLeft,
        marginTop,
        contentWidth,
        renderedHeight,
      )

      renderedPages += 1
    }

    const pdfBlob = pdf.output('blob')
    const downloadUrl = URL.createObjectURL(pdfBlob)
    const downloadLink = document.createElement('a')
    downloadLink.href = downloadUrl
    downloadLink.download = filename
    downloadLink.rel = 'noopener'
    document.body.appendChild(downloadLink)
    downloadLink.click()
    downloadLink.remove()
    URL.revokeObjectURL(downloadUrl)
  } finally {
    isGenerating.value = false
    exportNode.remove()
  }
}
</script>

<template>
  <button
    class="download-pdf-button"
    :disabled="isGenerating"
    :title="isGenerating ? '正在生成PDF' : '下载PDF'"
    @click="downloadPdf"
  >
    <FontAwesomeIcon :icon="faFilePdf"></FontAwesomeIcon>
  </button>
</template>

<style scoped lang="less">
.download-pdf-button {
  //样式来自于SideList
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--sidelist-button-width);
  height: var(--sidelist-button-height);
  color: var(--sidelist-button-color);
  font-size: var(--sidelist-button-font-size);
  border-radius: var(--sidelist-button-border-radius);
  border: var(--sidelist-button-border);
  background: var(--sidelist-button-background);
  box-shadow: var(--sidelist-button-box-shadow);
  backdrop-filter: var(--sidelist-button-backdrop-filter);
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: progress;
  }
}
</style>
