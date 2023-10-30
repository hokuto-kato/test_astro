vec2 fishEyeLens(vec2 uv, float size, vec2 origin) {
  uv -= 0.5;
  vec2 center = uv;
  center += origin;
  uv *= size == 0. ? 1. : (1. + min(length(center) * size, 1.)) * mix(1., 0.5, min(size, 1.));
  uv += 0.5;
  return uv;
}

#pragma glslify: export(fishEyeLens)
