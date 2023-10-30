vec4 postprocessGammaVec3(vec3 value) {
  return pow(value, vec3(1.0 / 2.2));
}
