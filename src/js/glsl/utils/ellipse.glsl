#pragma glslify: fitCover = require(./fitCover)

float ellipse(float size, vec2 prop, float antialias, vec2 uv, vec2 offset, vec2 resolution) {
  vec2 v = uv - offset;
  v = fitCover(v, vec2(1.), resolution);
  float ellipse = 1. - min(max(length(v / prop), 0.), 1.);
  size = 1. - size;
  ellipse = smoothstep((1. - antialias) * size, 1. * size, ellipse);

  return ellipse;
}

#pragma glslify: export(ellipse)
