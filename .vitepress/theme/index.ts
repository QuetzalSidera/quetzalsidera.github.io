// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import type { Theme } from 'vitepress'
import 'normalize.css'
import '@fontsource/jetbrains-mono'
import './assets/icon/iconfont.css'
import './styles/fontawesome.css'
import './styles/index.less'
import './components/spine/spine-player.css'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  },
} satisfies Theme
