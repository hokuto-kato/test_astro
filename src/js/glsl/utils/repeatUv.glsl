vec2 repeatUv(vec2 uv) {
  return fract(uv);
}

#pragma glslify: export(repeatUv)
