import { reactive } from 'vue'
import { PostData } from '../utils/posts.data'
import { createEmptyPost } from './defaults'

interface StoreState {
  selectedPosts: PostData[]
  currTag: string
  currCollection: string
  currPost: PostData
  currPage: number
  searchDialog: boolean
  splashLoading: boolean
  fireworksEnabled: boolean
  spinePlayerEnabled: boolean
  showDropdownMenu: boolean
  darkMode: 'light' | 'dark' | 'system'
  //是否展示文章导航
  outlineState: 'expanded' | 'expanding' | 'collapsing' | 'collapsed',
}

const state: StoreState = reactive({
  selectedPosts: [],
  currTag: '',
  currCollection: '',
  currPost: createEmptyPost(),
  currPage: 1,
  searchDialog: false,
  splashLoading: true,
  fireworksEnabled: false,
  spinePlayerEnabled: false,
  showDropdownMenu: false,
  darkMode: 'system',
  outlineState: 'expanded',
})

export function useStore() {
  return { state }
}
