export function shouldTextBeBlack(backgroundcolor) {
  return computeLuminence(backgroundcolor) > 0.22
}

export function computeLuminence(backgroundcolor) {
  var colors = hexToRgb(backgroundcolor)

  var components = ['r', 'g', 'b']
  for (var i in components) {
    var c = components[i]

    colors[c] = colors[c] / 255.0

    if (colors[c] <= 0.03928) {
      colors[c] = colors[c] / 12.92
    } else {
      colors[c] = Math.pow((colors[c] + 0.055) / 1.055, 2.4)
    }
  }

  var luminence = 0.2126 * colors.r + 0.7152 * colors.g + 0.0722 * colors.b

  return luminence
}

export function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * カラーコードのHEXをRGBに変換する
 * https://lab.syncer.jp/Web/JavaScript/Snippet/61/
 */
// export function hexToRgb(hex) {
//   if (hex.slice(0, 1) === '#') hex = hex.slice(1)
//   if (hex.length === 3)
//     hex =
//       hex.slice(0, 1) +
//       hex.slice(0, 1) +
//       hex.slice(1, 2) +
//       hex.slice(1, 2) +
//       hex.slice(2, 3) +
//       hex.slice(2, 3)

//   return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map((str) => {
//     return parseInt(str, 16)
//   })
// }
