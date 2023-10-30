vec2 fitHeight(vec2 coord, vec2 inputResolution, vec2 outputResolution) {
  coord.x = coord.x / outputResolution.y * inputResolution.y;
  return coord;
}

#pragma glslify: export(fitHeight)
