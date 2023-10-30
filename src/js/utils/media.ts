import store from '~/js/managers/store'

const mediaSp = window.matchMedia(
  `screen and (max-width: ${store.breakpoint - 1}px)`,
)

const mediaTb = window.matchMedia(
  `screen and (min-width: ${store.breakpoint}px) and (max-width: ${
    store.baseWidthMinPc - 1
  }px)`,
)

const mediaTbPortrait = window.matchMedia(
  `screen and (min-width: ${store.breakpoint}px) and (orientation: portrait)`,
)

const mediaPortrait = window.matchMedia(`screen and (orientation: portrait)`)

export default window._GLOBAL_.media =
  window._GLOBAL_.media ||
  (() => {
    const media = {}

    Object.defineProperty(media, 'isSp', {
      get: () => mediaSp.matches,
    })

    Object.defineProperty(media, 'isTb', {
      get: () => mediaTb.matches,
    })

    Object.defineProperty(media, 'isTbPortrait', {
      get: () => mediaTbPortrait.matches,
    })

    Object.defineProperty(media, 'isPortrait', {
      get: () => mediaPortrait.matches,
    })

    return media
  })()

export function addMatchesListener(
  mediaKind,
  fnTrue = () => {},
  fnFalse = fnTrue,
) {
  const listener = (e) => {
    if (e.matches) {
      fnTrue(e)
    } else {
      fnFalse(e)
    }
  }
  mediaKind.addListener(listener)
}
export function isSpMatch(fnTrue, fnFalse) {
  addMatchesListener(mediaSp, fnTrue, fnFalse)
}
export function isTbMatch(fnTrue, fnFalse) {
  addMatchesListener(mediaTb, fnTrue, fnFalse)
}
export function isTbPortraitMatch(fnTrue, fnFalse) {
  addMatchesListener(mediaTbPortrait, fnTrue, fnFalse)
}
export function isPortraitMatch(fnTrue, fnFalse) {
  addMatchesListener(mediaPortrait, fnTrue, fnFalse)
}
