import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeKatex from 'rehype-katex'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { BlogCodeBlock } from '@/components/BlogCodeBlock'
import { BlogImage } from '@/components/BlogImage'
import {
  Exercise,
  ExerciseAnswer,
  ExerciseChoices,
  ExerciseGroup,
  ExerciseHint,
  ExerciseParts,
  ExerciseSet,
  ExerciseSolution,
  ExerciseStem,
} from '@/components/content/Exercise'
import { ContentFlow, FlowBody, FlowMedia } from '@/components/content/Flow'
import { GroupCaption, ImageGroup } from '@/components/content/ImageGroup'
import { MindMap } from '@/components/content/MindMap'
import { PostViewer } from '@/components/posts/PostViewer'
import { toMdxSource, remarkLegacyImages } from '@/lib/mdx'
import { rehypeShiki } from '@/lib/rehype-shiki'
import { remarkContentDirectives } from '@/lib/remark-content-directives'
import type { DocumentKind, Post } from '@/lib/types'
import styles from './fixture.module.css'

const fixtureMarkdown = String.raw`
## 图像环绕

::::flow{mode="float" side="right" media-width="38%" min-text-width="24rem" print="block"}
:::media
<Image src="/Image/Miscellaneous/computer-network/03-application-layer/迭代查询与递归查询.webp" alt="DNS 迭代查询与递归查询" caption="图 1　DNS 查询路径" />
:::
:::body
浮动模式用于短图与连续正文。容器负责清除浮动；后续标题不依赖空标题或额外标记。正文剩余宽度不足时，媒体会自动改为上下排列。

网络应用通常由多个自治实体协作完成。描述交互时，应先给出参与实体与依赖关系，再讨论请求、响应和传输时延。此处增加第二段文字，用于验证正文在图片旁能够保持稳定且可读的行宽。

第三段继续验证环绕结束位置。媒体说明与图片保持同宽，并且不会侵入容器之后的标题。
:::
::::

### 环绕边界

本标题必须位于前一组图文之后，不得被浮动图片覆盖。

## 图像组

::::image-group{columns="2" mobile-columns="1" print-columns="2"}
<Image src="/Image/Miscellaneous/computer-network/03-application-layer/C:S模型.webp" alt="客户服务器模型" caption="(a) 客户—服务器模型" />
<Image src="/Image/Miscellaneous/computer-network/03-application-layer/P2P模型.webp" alt="P2P 模型" caption="(b) P2P 模型" />
:::caption
图 2　两类网络应用体系结构
:::
::::

## 表格环绕

::::flow{mode="split" side="left" media-width="44%" min-text-width="22rem" print="block"}
:::media
| 字段 | 含义 | 示例 |
| --- | --- | --- |
| TTL | 缓存有效期 | 600 |
| TYPE | 资源记录类型 | MX |
| RDATA | 资源数据 | mail.example.com |
:::
:::body
短表适合与解释文字并排，宽表或窄屏自动恢复上下布局。普通 Markdown 表格仍保持独占，不受此组件影响。

打印时默认取消并排布局，使表格恢复完整纸面宽度；跨页表格重复表头，并允许在行与行之间分页。
:::
::::

## 思维导图

:::mindmap{title="应用层知识结构" height="26rem" print-height="78mm" interactive="true"}
- 应用层
  - 网络应用体系结构
    - 客户—服务器
    - P2P
  - DNS
    - 名称解析
    - 资源记录
  - HTTP
    - 连接管理
    - 缓存
:::

## 习题排版

::::::exercise-set
:::::exercise-group{title="一、单项选择题" start="19"}
::::exercise{type="single" source="2027 计算机网络复习指导"}
:::stem
TCP 三次握手过程中，第二次握手报文中置为 1 的标志位是（　）。
:::
:::choices{choice-columns="4"}
- SYN
- ACK
- RST
- SYN 和 ACK
:::
:::answer
D
:::
:::solution
第二次握手同时确认客户端的 SYN，并发送服务器自己的 SYN。
:::
::::

::::exercise{type="single"}
:::stem
TCP 采用三报文握手建立连接，其中第三个报文是（　）。
:::
:::choices{choice-columns="2"}
- TCP 连接请求
- 对 TCP 连接请求的确认
- 对 TCP 连接请求确认的确认
- TCP 普通数据
:::
:::answer
C
:::
:::solution
第三个报文确认服务器发出的 SYN。
:::
::::

::::exercise{type="single" keep-together="false"}
:::stem
通信一方发送带有 FIN 标志的数据段后，表示（　）。
:::
:::choices{choice-columns="auto"}
- 将断开通信双方的 TCP 连接
- 单方面释放连接，本方已经无数据发送，但仍可接收对方的数据
- 中止数据发送，双方都不能继续发送数据
- 连接被重新建立
:::
:::answer
B
:::
:::solution
FIN 只表示发送方不再发送数据，因此 TCP 连接需要分别关闭两个方向。
:::
::::

::::exercise{type="multiple"}
:::stem
分别判断下列两组报文中的控制位组合。
:::
:::parts{choice-columns="auto"}
1. 建立连接时服务器的响应
   - SYN
   - ACK
   - SYN 和 ACK
   - FIN
2. 主动关闭方发送 FIN 后仍可执行的操作
   - 继续接收对端尚未发送完的数据
   - 立即丢弃所有到达的报文
   - 无条件同时关闭两个传输方向
   - 重新使用相同序号建立另一条连接
:::
:::answer
(1) C；(2) A。
:::
:::hint
TCP 是全双工协议，两个方向分别关闭。
:::
:::solution
服务器的第二次握手同时携带 SYN 与 ACK；收到 FIN 只代表对方关闭发送方向。
:::
::::

:::::
::::::

::::::exercise-set{font="song"}
:::::exercise-group{title="二、计算题"}
::::exercise{type="calculation" answer-lines="8" keep-together="false"}
:::stem
主机 A 经两段速率均为 $100\,\mathrm{Mb/s}$ 的链路向主机 B 发送 $1\,\mathrm{MB}$ 文件。分组长度为 $1000\,\mathrm{B}$，忽略处理与排队时延，写出存储转发条件下的时延计算过程。
:::
:::parts
1. 计算分组数量。
2. 计算单个分组的传输时延。
3. 给出流水发送全部分组的完成时间。
:::
:::answer
$N=1000$，单链路传输时延为 $80\,\mu s$。
:::
:::solution
两段链路采用存储转发，首个分组需要两个传输时延，之后每隔一个传输时延到达一个分组，因此总时延为 $(N+1)L/R$。
:::
::::
:::::
::::::

## 长内容分页

| 层次 | 数据单元 | 主要功能 | 典型协议 |
| --- | --- | --- | --- |
| 应用层 | 报文 | 直接服务网络应用 | HTTP、DNS、SMTP |
| 传输层 | 报文段或用户数据报 | 端到端传输 | TCP、UDP |
| 网络层 | 数据报 | 路由与转发 | IP |
| 数据链路层 | 帧 | 相邻节点传输 | Ethernet |
| 物理层 | 比特 | 信号传输 | 1000BASE-T |

~~~c
#include <stdio.h>

int main(void) {
    for (int sequence = 0; sequence < 24; ++sequence) {
        printf("packet %d\\n", sequence);
    }
    return 0;
}
~~~
`

type FixturePageProps = {
  searchParams: Promise<{ kind?: string }>
}

export default async function ContentLayoutFixture({ searchParams }: FixturePageProps) {
  const requestedKind = (await searchParams).kind
  const kind: DocumentKind = requestedKind === 'note' ? 'note' : 'exercise'
  const timestamp = Date.UTC(2026, 7, 19)
  const post: Post = {
    slug: 'content-layout-fixture',
    title: '内容排版综合验收页',
    outline: [{ level: 0, title: '图像环绕', slug: '图像环绕' }],
    content: fixtureMarkdown,
    href: '/content-layout-fixture/',
    create: timestamp,
    update: timestamp,
    wordCount: 0,
    kind,
    exerciseFont: 'kai',
  }

  return (
    <main className={styles.main}>
      <PostViewer post={post} comments={false}>
        <MDXRemote
          source={toMdxSource(fixtureMarkdown)}
          components={{
            Image: BlogImage,
            ContentFlow,
            FlowMedia,
            FlowBody,
            ImageGroup,
            GroupCaption,
            MindMap,
            ExerciseSet,
            ExerciseGroup,
            Exercise,
            ExerciseStem,
            ExerciseParts,
            ExerciseChoices,
            ExerciseAnswer,
            ExerciseSolution,
            ExerciseHint,
            pre: BlogCodeBlock,
          }}
          options={{
            mdxOptions: {
              format: 'md',
              remarkPlugins: [
                remarkDirective,
                remarkLegacyImages,
                remarkContentDirectives,
                remarkGfm,
                remarkMath,
              ],
              rehypePlugins: [
                rehypeShiki,
                [rehypeKatex, { strict: false, throwOnError: false }],
              ],
            },
          }}
        />
      </PostViewer>
    </main>
  )
}
