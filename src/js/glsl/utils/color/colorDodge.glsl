vec3 colorDodge(vec3 colorSrc, vec3 colorDist) {
  return vec3(
    (colorSrc.r == 1.) ? 1. : min(1., colorDist.r / (1. - colorSrc.r)),
    (colorSrc.g == 1.) ? 1. : min(1., colorDist.g / (1. - colorSrc.g)),
    (colorSrc.b == 1.) ? 1. : min(1., colorDist.b / (1. - colorSrc.b))
  );
}
