# 文章图片引用规范

本文档记录当前 Next.js 版本中，博客文章引用图片的标准方式。

## 1. 总原则

图片由资源目录维护，文章只引用路径对象；展示样式由 `Image` / `BlogImage` 组件负责。

- 图片文件放在 `public/Image/` 下。
- 文章中不直接硬编码 `/Image/...` 或 `/Imgs/...` 路径。
- 新文章优先使用 `<Image {...imageConfig} />`。
- 普通 Markdown 图片 `![]()` 可继续渲染，但不作为需要脚注、对齐、环绕时的标准写法。
- 禁止新增 VitePress 写法：`<script setup>`、`Image.vue` 导入、`<Image v-bind="xxx" />`。
- 图文环绕、并列图片和共同图注使用 [`CONTENT_USAGE.md`](./CONTENT_USAGE.md) 中的 `flow` 与 `image-group`。

## 2. 资源处理流程

1. 将图片放入 `public/Image/<分类目录>/`，优先使用 `.webp`。
2. 原图为 `png`、`jpg`、`jpeg` 时，先在原图目录运行 `../convert.sh` 转为 WebP。
3. 在正式分类目录运行 `../init.sh`，重新生成该目录的 `path.ts` 与 `path.json`。
4. 在文章的 ```` ```ts image-setup ```` 代码块中导入对应 `path.ts`。
5. 定义图片配置对象，在正文中使用 `<Image {...xxx} />`。

常用命令：

```bash
cd public/Image/Miscellaneous
../init.sh
```

## 3. 标准写法

````md
```ts image-setup
import {path as miscellaneousImagePath} from '@public/Image/Miscellaneous/path'

const demoImage = {
  src: miscellaneousImagePath['图片Key'],
  alt: '图片替代文本',
  align: 'right',
  wrap: true,
  maxHeight: '24rem',
  caption: '图片说明',
} as const
```

正文内容……

<Image {...demoImage} />
````

### 3.1 `image-setup` 的语法边界

`image-setup` 是供构建脚本和页面渲染器读取的受限声明块，不会作为任意 TypeScript 在页面中执行。为保证两端解析结果一致，只使用以下形式：

- `import {path as 别名} from '@public/Image/<目录>/path'` 导入路径表；
- 以 `const 名称 = { ... } as const` 声明图片对象；
- 每个字段单独占一行，值使用字符串、布尔值、数字或直接的 `path.xxx` / `path['xxx']` 查询。

当前解析器会在半角逗号 `,` 处截断字段值，因此字符串字面量中不要包含半角逗号；需要逗号标点时使用全角中文逗号 `，`。

不要在图片对象中使用对象展开、模板字符串、函数调用、条件表达式、变量转存或其他动态计算。`check:post-images` 会把声明块作为 TypeScript 做类型检查，但通过类型检查不表示页面渲染器支持任意 TypeScript 语法。

## 4. 配置字段

| 字段 | 类型 | 说明 |
|-----|------|-----|
| `src` | `string` | 图片路径，必须来自 `path.ts` |
| `alt` | `string` | 图片替代文本，建议必填 |
| `align` | `'left' \| 'right' \| 'center'` | 图片对齐方式，默认 `center` |
| `wrap` | `boolean` | 是否允许正文环绕图片 |
| `caption` | `string` | 图片下方说明 |
| `captionLink` | `string` | 图片说明链接 |
| `maxHeight` | `number \| string` | 最大高度；数字按 `px` 处理，也可以写 `'24rem'` |

## 5. 目录和命名

- 新增文章配图优先放入 `public/Image/Miscellaneous/<文章或主题名>/`。
- 文件名会成为 `path.ts` 的 key；含空格、中文、连字符或括号时，使用 `path['key']` 访问。
- 多篇文章共用的图片可以放在已有公共分类中，例如 `GroupPhoto`、`Background`、`Avatar`。
- 原始大图、未压缩图和未转换图放入 `public/Image/*(Raw)/` 时会被 `.gitignore` 忽略，不参与正式引用。

## 6. 展示约定

- 右侧环绕图：`align: 'right'` + `wrap: true`。
- 左侧环绕图：`align: 'left'` + `wrap: true`。
- 独占居中图：`align: 'center'` + `wrap: false`。
- 长图或截图设置 `maxHeight`，避免正文区域被图片撑开。
- `caption` 只写图片说明，不写正文补充段落。
- 图片默认可点击打开全屏预览；预览中可按 `Esc`、点击关闭按钮或背景退出。打印时仅输出正文图片，不输出预览层。

## 7. 构建检查

图片引用检查由 `scripts/check-post-images.mjs` 执行：

```bash
pnpm check:post-images
pnpm typecheck
pnpm build
```

检查内容：

- `<Image {...xxx} />` 必须能在 `image-setup` 中找到同名 `const`。
- 图片配置对象必须包含 `src` 字段。
- `image-setup` 中导入的 `path.ts` 会被 TypeScript 检查，错误 key 会失败。
- 页面渲染器仍按第 3.1 节的受限语法读取字段；动态表达式即使能通过 TypeScript，也不会得到正确的图片配置。
- `<Image v-bind="xxx" />` 会直接失败，提示改成 React spread 写法。

## 8. 常见错误

错误：使用旧 Vue 写法。

```md
<Image v-bind="demoImage" />
```

正确：

```md
<Image {...demoImage} />
```

错误：正文直接写路径。

```md
<img src="/Image/Miscellaneous/foo/bar.webp" />
```

正确：

````md
```ts image-setup
import {path as miscellaneousImagePath} from '@public/Image/Miscellaneous/path'

const barImage = {
  src: miscellaneousImagePath.bar,
  alt: 'bar',
} as const
```

<Image {...barImage} />
````

## 9. 复合布局

单图仍使用本页定义的 `<Image>` 配置。需要让图像或表格与一段正文绑定时，使用 `flow`；需要多图同排时，使用 `image-group`。完整语法见 [`CONTENT_USAGE.md`](./CONTENT_USAGE.md)。
