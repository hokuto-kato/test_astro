let bodyStyle

export function drawTextToCanvas(option = {}) {
  const {
    text,
    color = getBodyStyle().color,
    fontSize = parseFloat(getBodyStyle().fontSize),
    fontFamily = getBodyStyle().fontFamily,
    fontWeight,
    lineHeight = parseFloat(getBodyStyle().lineHeight) /
      parseFloat(getBodyStyle().fontSize),
    textAlign = 'center',
    verticalAlign = 'middle',
    offsetY = 0,
    isTrim = false,
  } = option

  // \n で改行して複数行にする
  const textLines = text.split('\n')

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const width = (canvas.width = option.width || Math.ceil(getTextRect().width))
  const height = (canvas.height =
    option.height || Math.ceil(getTextRect().height))

  Object.assign(ctx, {
    font: `${
      fontWeight ? fontWeight + ' ' : ''
    }${fontSize}px/${lineHeight} ${fontFamily}`,
    fillStyle: color,
    textAlign,
    textBaseline: verticalAlign,
  })

  textLines.forEach((text, i) => {
    const x = width / 2
    const y =
      height / 2 +
      fontSize * lineHeight * (i - (1 / 2) * (textLines.length - 1)) +
      offsetY
    text = text.replace('&nbsp;', ' ')
    ctx.fillText(isTrim ? text.trim() : text, x, y)
  })

  function getBodyStyle() {
    if (bodyStyle) return bodyStyle
    return (bodyStyle = window.getComputedStyle(document.body))
  }

  let rectText
  function getTextRect() {
    if (rectText) return rectText
    const div = document.createElement('div')
    div.innerHTML = text.replace(/\n/g, '<br>')
    Object.assign(div.style, {
      visibility: 'hidden',
      position: 'absolute',
      bottom: 0,
      right: 0,
      color,
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      lineHeight,
      textAlign,
      verticalAlign,
      whiteSpace: 'nowrap',
    })
    document.body.appendChild(div)
    rectText = div.getBoundingClientRect()
    div.remove()
    return rectText
  }

  return { canvas, ctx, width, height }
}

/**
 * テキストの色の付いている座標を取得
 * http://tkengo.github.io/blog/2015/07/15/webgl-particle-effect-we-are-xseeds/
 */
export function getTextCoordinate(option) {
  const { callback } = option
  const { ctx, width, height } = drawTextToCanvas(option)

  // 2. canvasから画像データをRGBAの配列として取り出す
  const data = ctx.getImageData(0, 0, width, height).data

  // 3. 配列を1ピクセル分ずつ走査していって色があればその座標にパーティクルを生成する
  for (let x = 0, l = width; x < l; x++) {
    for (let y = 0, l = height; y < l; y++) {
      if (data[(x + y * width) * 4 + 3] === 0) continue

      callback({ x, y })
    }
  }
}

/**
 * 画像の色の付いている座標を取得
 */
export function getImageCoordinate(option) {
  // 1. canvasを用意してそこに描画したいテキストを描く
  const textCanvas = document.createElement('canvas')
  textCanvas.width = option.width
  textCanvas.height = option.height

  const ctx = textCanvas.getContext('2d')
  const img = new Image()
  img.src = option.src

  if (option.preload) {
    drawImageCoordinate()
  } else {
    return new Promise((resolve) => {
      img.onload = () => {
        drawImageCoordinate()
        resolve()
      }
    })
  }

  function drawImageCoordinate() {
    const canvasAspect = option.width / option.height
    const imgAspect = img.width / img.height
    let left, top, width, height

    if (imgAspect >= canvasAspect) {
      // 画像が横長
      left = 0
      width = option.width
      height = option.width / imgAspect
      top = (option.height - height) / 2
    } else {
      // 画像が縦長
      top = 0
      height = option.height
      width = option.height * imgAspect
      left = (option.width - width) / 2
    }
    ctx.drawImage(img, 0, 0, img.width, img.height, left, top, width, height)

    // 2. canvasから画像データをRGBAの配列として取り出す
    const data = ctx.getImageData(0, 0, option.width, option.height).data

    // 3. 配列を1ピクセル分ずつ走査していって色があればその座標にパーティクルを生成する
    for (let x = 0, l = option.width; x < l; x++) {
      for (let y = 0, l = option.height; y < l; y++) {
        const xPixel = (x + y * option.width) * 4
        if (
          data[xPixel + 3] === 0 ||
          (data[xPixel] === 255 &&
            data[xPixel + 1] === 255 &&
            data[xPixel + 2] === 255)
        )
          continue

        option.callback({ x, y })
      }
    }
  }
}

function subVector(a, b) {
  const ret = {}
  ret.x = a.x - b.x
  ret.y = a.y - b.y
  return ret
}

export function hittestPointPolygon2d(P, A, B, C) {
  // 線上は外とみなします。
  // ABCが三角形かどうかのチェックは省略...

  const AB = subVector(B, A)
  const BP = subVector(P, B)

  const BC = subVector(C, B)
  const CP = subVector(P, C)

  const CA = subVector(A, C)
  const AP = subVector(P, A)

  // 外積    Z成分だけ計算すればよいです
  const c1 = AB.x * BP.y - AB.y * BP.x
  const c2 = BC.x * CP.y - BC.y * CP.x
  const c3 = CA.x * AP.y - CA.y * AP.x

  if ((c1 > 0 && c2 > 0 && c3 > 0) || (c1 < 0 && c2 < 0 && c3 < 0)) {
    // 三角形の内側に点がある
    return true
  }

  // 三角形の外側に点がある
  return false
}
