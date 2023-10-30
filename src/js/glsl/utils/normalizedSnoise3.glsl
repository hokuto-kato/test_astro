#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#pragma glslify: normalizeNoise = require(./normalizeNoise.glsl)

float normalizedSnoise3(vec3 v) {
  return normalizeNoise(snoise3(v));
}

#pragma glslify: export(normalizedSnoise3)
