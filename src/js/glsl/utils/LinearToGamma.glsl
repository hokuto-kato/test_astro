vec4 LinearToGamma(vec4 value, float gammaFactor) {
  return vec4(pow(value.xyz, vec3(1.0 / gammaFactor)), value.w);
}
