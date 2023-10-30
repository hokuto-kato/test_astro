vec4 overlayTransparentImages(vec4 colorBack, vec4 colorFront) {
  return mix(colorBack, colorFront, colorFront.a);
}

#pragma glslify: export(overlayTransparentImages)
