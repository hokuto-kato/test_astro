let isPassive = false
try {
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      isPassive = true
    },
  })
  window.addEventListener('testPassive', null, opts)
  window.removeEventListener('testPassive', null, opts)
} catch (e) {
  isPassive = false
}

/**
 * @return {Object|boolean} addEventListener で指定する options のオブジェクト（passive に対応しているブラウザであれば passive を有効にする options、passive 非対応のブラウザであれば false を返す）
 */
export default isPassive ? { passive: true } : false
