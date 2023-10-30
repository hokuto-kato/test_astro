float normalizeNoise(float noise) {
  return noise * 0.5 + 0.5;
}

#pragma glslify: export(normalizeNoise)
