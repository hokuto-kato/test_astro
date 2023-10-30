#pragma glslify: discardOutOfRangeUv = require(./discardOutOfRangeUv)

vec2 getMaskedUv(vec2 uv, float zoom, vec2 origin) {
  discardOutOfRangeUv(uv);
  origin.x = -origin.x;
  uv += origin;
  float scale = 1. / zoom;
  return uv * scale - 0.5 * (scale - 1.);
}

#pragma glslify: export(getMaskedUv)
