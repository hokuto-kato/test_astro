vec3 colorBurn(vec3 colorSrc, vec3 colorDist) {
  return vec3(
    (colorSrc.r == 0.) ? 0. : (1. - ((1. - colorDist.r) / colorSrc.r)),
    (colorSrc.g == 0.) ? 0. : (1. - ((1. - colorDist.g) / colorSrc.g)),
    (colorSrc.b == 0.) ? 0. : (1. - ((1. - colorDist.b) / colorSrc.b))
  );
}
