//
// 配列操作
//

/**
 * 配列の最後の要素を取得する
 * @param {array} array - 配列
 * @return {*} 最後の要素
 */
export function getLast(array) {
  return array[array.length - 1]
}

/**
 * 配列をシャッフルする
 * @param {array} array - 配列
 * @return {array} シャッフルされた配列
 */
export function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1))
    const tmp = newArray[i]
    newArray[i] = newArray[r]
    newArray[r] = tmp
  }
  return newArray
}

/**
 * map関数を使用可能な指定要素数の配列を生成
 * @param {number} length - 配列の長さ
 * @return {array} 配列
 */
export function getArray(length) {
  return [...Array(length)]
}

/**
 * 0から始まる連番の配列を生成
 * @param {number} length - 配列の長さ
 * @return {array} 連番の配列
 */
export function getSerialNumbersArray(length) {
  return [...Array(length)].map((_, i) => i)
}

export function sliceByNumber(array, number) {
  const length = Math.ceil(array.length / number)
  return new Array(length)
    .fill()
    .map((_, i) => array.slice(i * number, (i + 1) * number))
}
