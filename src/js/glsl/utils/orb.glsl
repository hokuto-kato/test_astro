#pragma glslify: fitCover = require(./fitCover)

float orb(float light, vec2 uv, vec2 offset, vec2 resolution) {
  vec2 v = uv - offset;
  v = fitCover(v, vec2(1.), resolution);

  return light / length(v);
}

#pragma glslify: export(orb)
