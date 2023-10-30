/**
 * 一定時間遅らせる
 * @param {number} delay - 遅延時間(s)
 * @return {Promise}
 */
export function wait(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay * 1000)
  })
}
