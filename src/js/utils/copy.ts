/**
 * 現在のURLをクリップボードにコピーする
 */
export function copyUrl() {
  const element = document.createElement('input')
  element.value = location.href
  document.body.appendChild(element)
  element.select()
  document.execCommand('copy')
  document.body.removeChild(element)
}
