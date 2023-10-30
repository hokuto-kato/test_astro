const svgFile = (async function getSvgFile() {
  const svg = await fetch('/assets/img/common/svg-symbols.svg')
  const domWrapper = document.createElement('div')
  domWrapper.innerHTML = await svg.text()
  return domWrapper.children[0]
})()

export async function getSvgSize(nameId) {
  const svg = await svgFile
  const id = `svg-${nameId}`
  const elSymbol = Array.prototype.find.call(
    svg.children,
    (el) => el.getAttribute('id') === id
  )
  return elSymbol.viewBox.baseVal
}
