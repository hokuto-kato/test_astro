/* ----------------------------------------
  文字列
---------------------------------------- */

/**
 * ユニークな文字列を取得
 * @param {string} [prefix=''] - プレフィックス文字列
 * @return {string}
 */
export function getUniqueId(prefix = '') {
  window._GLOBAL_.uniqueId =
    window._GLOBAL_.uniqueId > 0 ? window._GLOBAL_.uniqueId : 0
  return prefix + String(window._GLOBAL_.uniqueId++)
}

/**
 * ゼロパディング
 * @param {number} number - 数値
 * @param {number} digits - 桁数
 * @return {string} ゼロパディングした文字列
 */
export function pad(number: number, digits: number) {
  return String(number).padStart(digits, '0')
}

/**
 * 2桁のゼロパディング
 * @param {number} number - 数値
 * @return {string} ゼロパディングした文字列
 */
export function pad2(number: number) {
  return pad(number, 2)
}

/**
 * 半角スペースを br タグに変換
 * @param {string} text - テキスト
 * @return {string} 変換後のテキスト
 */
export function space2br(text: string) {
  return text.replace(/ /g, '<br>')
}

/**
 * キャメルケースへ変換 sampleString
 * @param {string}
 * @return {string}
 */
export function camelCase(str: string) {
  return str
    .replace(/^[A-Z]/, (match) => match.toLowerCase())
    .replace(/[-_ ](.)/g, (match, group) => group.toUpperCase())
}

/**
 * スネークケースへ変換 sample_string
 * @param {string}
 * @return {string}
 */
export function snakeCase(str: string) {
  const camel = camelCase(str)
  return camel.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
}

/**
 * ケバブケースへ変換 sample-string
 * @param {string}
 * @return {string}
 */
export function kebabCase(str: string) {
  const camel = camelCase(str)
  return camel.replace(/[A-Z]/g, function (s) {
    return '-' + s.charAt(0).toLowerCase()
  })
}

/**
 * パスカルケースへ変換 SampleString
 * @param {string}
 * @return {string}
 */
export function pascalCase(str: string) {
  const camel = camelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/**
 * 定数名へ変換 SAMPLE_STRING
 * @param {string}
 * @return {string}
 */
export function constantCase(str: string) {
  const snake = snakeCase(str)
  return snake.toUpperCase()
}
