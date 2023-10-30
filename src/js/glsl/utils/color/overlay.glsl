vec3 overlay(vec3 colorSrc, vec3 colorDist) {
  return vec3(
    (colorDist.r <= 0.5) ? (2. * colorSrc.r * colorDist.r) : (1. - 2. * (1. - colorDist.r) * (1. - colorSrc.r)),
    (colorDist.g <= 0.5) ? (2. * colorSrc.g * colorDist.g) : (1. - 2. * (1. - colorDist.g) * (1. - colorSrc.g)),
    (colorDist.b <= 0.5) ? (2. * colorSrc.b * colorDist.b) : (1. - 2. * (1. - colorDist.b) * (1. - colorSrc.b))
  );
}
