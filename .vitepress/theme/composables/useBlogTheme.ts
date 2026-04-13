import { useData } from 'vitepress'
import type { BlogThemeConfig } from '../types/theme'

export function useBlogTheme() {
  return useData().theme.value as BlogThemeConfig
}
