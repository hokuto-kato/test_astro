vec4 innerRangeAntialias(vec4 color, vec2 uv, float antialias) {
  if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) {
    discard;
  }
  color.a *= uv.x < 0. + antialias
    ? smoothstep(0., 0. + antialias, uv.x)
    : uv.x > 1. - antialias
    ? smoothstep(1., 1. - antialias, uv.x)
    : 1.;
  color.a *= uv.y < 0. + antialias
    ? smoothstep(0., 0. + antialias, uv.y)
    : uv.y > 1. - antialias
    ? smoothstep(1., 1. - antialias, uv.y)
    : 1.;
  return color;
}

#pragma glslify: export(innerRangeAntialias)
