#pragma glslify: fitCover = require(./fitCover)

float circle(float size, float sizeMax, float antialias, vec2 uv, vec2 offset, vec2 resolution) {
  vec2 v = uv;
  v = fitCover(v, vec2(1.), resolution);
  v -= offset;
  float circle = sizeMax - min(max(length(v), 0.), sizeMax);
  size = sizeMax - size;
  circle = smoothstep((1. - antialias) * size, 1. * size, circle);

  return circle;
}

#pragma glslify: export(circle)
