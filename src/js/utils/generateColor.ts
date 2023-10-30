/* Remove '#' in color hex string */
function trim (s) { return (s.charAt(0) == '#') ? s.substring(1, 7) : s }

/* Convert a hex string to an RGB triplet */
function convertToRGB (hex) {
  var color = [];
  color[0] = parseInt ((trim(hex)).substring (0, 2), 16);
  color[1] = parseInt ((trim(hex)).substring (2, 4), 16);
  color[2] = parseInt ((trim(hex)).substring (4, 6), 16);
  return color;
}

export function generateColor(colorStart,colorEnd,colorCount) {
	// The beginning of your gradient
	const start = convertToRGB (colorStart)
	// The end of your gradient
	const end   = convertToRGB (colorEnd)
	// The number of colors to compute
	const len = colorCount

	//Alpha blending amount
	let alpha = 0.0;

	const colorArray = [];

	for (let i = 0; i < len; i++) {
		const c = [];
		alpha += (1.0/len);

		c[0] = start[0] * alpha + (1 - alpha) * end[0];
		c[1] = start[1] * alpha + (1 - alpha) * end[1];
		c[2] = start[2] * alpha + (1 - alpha) * end[2];

		colorArray.push(c);
	}
	return colorArray;
}
