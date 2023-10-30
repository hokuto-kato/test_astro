vec4 postprocessGamma(vec4 value) {
  return vec4(pow(value.xyz, vec3(1.0 / 2.2)), value.w);
}
