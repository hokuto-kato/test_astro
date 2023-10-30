/**
 * GLSL の mix と同じ線形補間
 *
 * @export
 * @param {number} x
 * @param {number} y
 * @param {number} a
 * @returns {number}
 */
export function mix(x, y, a) {
  return x * (1 - a) + y * a
}

/**
 * mix と同じ
 *
 * @export
 * @param {number} x
 * @param {number} y
 * @param {number} a
 * @returns {number}
 */
export const lerp = mix

/**
 * GLSL の clamp と同じ
 *
 * @export
 * @param {number} x
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function clamp(x, a, b) {
  return Math.min(Math.max(x, a), b)
}

/**
 * 値のマッピング
 *
 * @export
 * @param {number} num
 * @param {number} fromMin
 * @param {number} fromMax
 * @param {number} toMin
 * @param {number} toMax
 * @param {boolean} [isClamp=true] clampするかどうか
 * @returns {number}
 */
export function map(num, fromMin, fromMax, toMin, toMax, isClamp = true) {
  if (isClamp) {
    if (num <= fromMin) {
      return toMin
    }
    if (num >= fromMax) {
      return toMax
    }
  }
  return ((num - fromMin) * (toMax - toMin)) / (fromMax - fromMin) + toMin
}

/**
 * GLSLの smoothstep と同じ
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @param {number} value
 * @returns {number}
 */
export function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return x * x * (3 - 2 * x)
}

/**
 * 指定した位に小数を丸める
 *
 * @export
 * @param {number} num 丸める小数
 * @param {number} place 丸める位
 * @returns {number} 丸めた小数
 */
export function roundDecimal(num, place) {
  const exponentiation = 10 ** place
  return Math.round(num * exponentiation) / exponentiation
}

/**
 * 小数第 2 位に丸める
 *
 * @export
 * @param {number} num 丸める小数
 * @returns {number} 丸めた小数
 */
export function round2(num) {
  return Math.round(num * 100) / 100
}

/**
 * スライダーのインデックスのようなループする数値を取得
 *
 * @export
 * @param {number} number 増え続ける数値
 * @param {number} max 上限値
 * @returns {number} ループした後の数値（0〜上限値）
 */
export function getLoopedNumber(number, max) {
  return (number + max) % max
}

/**
 * 乱数取得
 *
 * @export
 * @param {number} [min=0] 最小値
 * @param {number} [max=1] 最大値
 * @returns {number}
 */
export function getRandom(min = 0, max = 1) {
  return Math.random() * (max - min) + min
}

/**
 * @export
 * @param {number} [min=0] 最小値
 * @param {number} [max=1] 最大値
 * @returns {number}
 */
export function getProgressInOut(
  progress,
  maxPosition,
  exponentIn = 1,
  exponentOut = 1,
) {
  return progress < maxPosition
    ? (progress / maxPosition) ** exponentIn
    : 1 - ((progress - maxPosition) / (1 - maxPosition)) ** exponentOut
}

/**
 * 0 〜 1 の範囲に正規化
 */
export function normalize(value, max, min = 0) {
  return (value - min) / (max - min)
}

/**
 * 0 〜 1 の値から最大値を max 、最小値を min にする正規化
 */
export function normalizeMaxMin(rate, max, min = 0) {
  return (max - min) * rate + min
}

/**
 * 最大値と最小値の間の乱数
 */
export function randomMaxMin(max, min = 0) {
  return normalizeMaxMin(Math.random(), max, min)
}

/**
 * 正規乱数
 * https://ics.media/entry/11292/
 */
export function normalRandom() {
  const r1 = Math.random()
  const r2 = Math.random()
  let value = Math.sqrt(-2.0 * Math.log(r1)) * Math.sin(2.0 * Math.PI * r2)
  // 値を0以上1未満になるよう正規化する
  value = (value + 3) / 6
  return value
}

/**
 * 中央に偏らせる乱数
 * https://ics.media/entry/11292/
 */
export function randomCenter() {
  return (Math.random() + Math.random()) / 2
}

/**
 * 最大値と最小値の間の正規乱数
 */
export function normalRandomMaxMin(max, min = 0) {
  return normalizeMaxMin(normalRandom(), max, min)
}

/**
 * 乱数の平方根
 * https://ics.media/entry/11292/
 */
export function squareRootRandom() {
  return Math.sqrt(Math.random())
}

/**
 * 最大値と最小値の間の乱数の平方根
 */
export function squareRootRandomMaxMin(max, min = 0) {
  return normalizeMaxMin(squareRootRandom(), max, min)
}

/**
 * 度数をラジアンに変換
 *
 * @export
 * @param {number} degree
 * @returns {number} ラジアン
 */
export function degreeToRadian(degree) {
  return (degree / 180) * Math.PI
}

/**
 * ラジアンを度数に変換
 *
 * @export
 * @param {number} radian
 * @returns {number} ラジアン
 */
export function radianToDegree(radian) {
  return (radian / Math.PI) * 180
}
