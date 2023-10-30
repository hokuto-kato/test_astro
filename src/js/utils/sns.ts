/**
 * Twitterシェアボタン用URLを取得
 * @param {string} url - シェアするURL
 * @param {string} [text] - シェアするテキスト
 * @return {string}
 */
export function getTwitterShareUrl(url: string, text?: string) {
  return `https://twitter.com/share?url=${encodeURIComponent(url)}${
    text ? `&text=${encodeURIComponent(text)}` : ''
  }`
}

/**
 * Facebookシェアボタン用URLを取得
 * @param {string} url - シェアするURL
 * @param {string} [text] - シェアするテキスト
 * @return {string}
 */
export function getFacebookShareUrl(url: string, text?: string) {
  return `https://www.facebook.com/sharer.php?src=bm&u=${encodeURIComponent(
    url,
  )}${text ? `&t=${encodeURIComponent(text)}` : ''}`
}
