export const PAGE_OVERLAY_ROOT_ID = 'page-overlay-root'

export function getPageOverlayRoot() {
  return document.getElementById(PAGE_OVERLAY_ROOT_ID) ?? document.body
}
