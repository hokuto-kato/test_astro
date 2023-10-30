import Hashids from 'hashids'
import store from './store'

const uniqueIds: Record<string, number> = {}

export function getUniqueNumber(id = 'default') {
  if (!(id in uniqueIds)) {
    uniqueIds[id] = 0
  }
  return uniqueIds[id]++
}

export function getUniqueId(prefix: string) {
  return (prefix || '') + String(getUniqueNumber(prefix))
}

export function getVariableSizeRem(size: number) {
  return `${size / 16}rem`
}

export function getHashId(
  salt: string,
  uniqueNumber: number,
  minLength?: number,
) {
  return new Hashids(salt, minLength).encode(uniqueNumber)
}

export function getDataset(props: Astro.props) {
  const dataset: Record<string, string> = {}
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('data-')) {
      dataset[key] = value
    }
  })
  return dataset
}

export function getVueAttr(props: Astro.props) {
  const attr: Record<string, string> = {}
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('v-')) {
      attr[key] = value
    }
  })
  return attr
}

/**
 * キャメルケースへ変換 sampleString
 * @param {string}
 * @return {string}
 */
export function camelCase(str: string) {
  str = str.charAt(0).toLowerCase() + str.slice(1)
  return str
    .replace(/[-_ ](.)/g, function (match, group1) {
      return group1.toUpperCase()
    })
    .trim()
}

/**
 * ゼロパディング
 * @param {number} number - 数値
 * @param {number} digits - 桁数
 * @return {string} ゼロパディングした文字列
 */
export function pad(number, digits) {
  return String(number).padStart(digits, '0')
}

/**
 * 2桁のゼロパディング
 * @param {number} number - 数値
 * @return {string} ゼロパディングした文字列
 */
export function pad2(number) {
  return pad(number, 2)
}

/**
 * Twitterシェアボタン用URLを取得
 * @param {string} url - シェアするURL
 * @param {string} [text] - シェアするテキスト
 * @return {string}
 */
export function getTwitterShareUrl(text?: string) {
  return `https://twitter.com/share?url=${encodeURIComponent(
    store.canonicalURL,
  )}${text ? `&text=${encodeURIComponent(text)}` : ''}`
}

/**
 * Facebookシェアボタン用URLを取得
 * @param {string} url - シェアするURL
 * @param {string} [text] - シェアするテキスト
 * @return {string}
 */
export function getFacebookShareUrl(text?: string) {
  return `https://www.facebook.com/sharer.php?src=bm&u=${encodeURIComponent(
    store.canonicalURL,
  )}${text ? `&t=${encodeURIComponent(text)}` : ''}`
}

export const mediaPc = `(min-width: ${_ENV_.breakpoint}px)`
export const mediaSp = `(max-width: ${_ENV_.breakpoint - 0.01}px)`
