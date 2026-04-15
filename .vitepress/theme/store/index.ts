import { reactive } from 'vue'
import { PostData } from '../utils/posts.data'
import { createEmptyPost } from './defaults'

interface StoreState {
  selectedPosts: PostData[]
  currTag: string
  currPost: PostData
  currPage: number
  searchDialog: boolean
  splashLoading: boolean
  fireworksEnabled: boolean
  spinePlayerEnabled: boolean
  showDropdownMenu: boolean
  darkMode: 'light' | 'dark' | 'system'
}

const state: StoreState = reactive({
  selectedPosts: [],
  currTag: '',
  currPost: createEmptyPost(),
  currPage: 1,
  searchDialog: false,
  splashLoading: true,
  fireworksEnabled: false,
  spinePlayerEnabled: true,
  showDropdownMenu: false,
  darkMode: 'system',
})

export function useStore() {
  return { state }
}
