/**
 * URLオブジェクトを取得
 * @return {URL}
 */
export function getUrl() {
  return new URL(document.location)
}

/**
 * 指定したURLパラメーターのキー名の値を取得
 * @param {URL} url - URLオブジェクト
 * @param {string} name - URLパラメーターのキー名
 * @return {string}
 */
export function getUrlParam(url, name) {
  return url.searchParams.get(name)
}

/**
 * URLパラメーターを設定
 * @param {URL} url - URLオブジェクト
 * @param {string} name - URLパラメーターのキー名
 * @param {string} value - URLパラメーターの値
 */
export function setUrlParam(url, name, value) {
  url.searchParams.set(name, value)
}

/**
 * URLパラメーターを設定
 * @param {URL} url - URLオブジェクト
 * @param {string} name - URLパラメーターのキー名
 */
export function deleteUrlParam(url, name) {
  url.searchParams.delete(name)
}

/**
 * 指定したURLオブジェクトでpushStateする
 * @param {URL} url - URLオブジェクト
 */
export function pushUrl(url) {
  window.history.pushState(null, '', url)
}
