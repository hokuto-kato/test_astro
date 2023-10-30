#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: normalizeNoise = require(./normalizeNoise.glsl)

float normalizedSnoise2(vec2 v) {
  return normalizeNoise(snoise2(v));
}

#pragma glslify: export(normalizedSnoise2)
