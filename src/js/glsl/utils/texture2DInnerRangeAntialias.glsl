#pragma glslify: innerRangeAntialias = require(./innerRangeAntialias)

vec4 texture2DInnerRangeAntialias(sampler2D t, vec2 uv, float antialias) {
  vec4 color = texture2D(t, uv);
  return innerRangeAntialias(color, uv, antialias);
}

#pragma glslify: export(texture2DInnerRangeAntialias)
