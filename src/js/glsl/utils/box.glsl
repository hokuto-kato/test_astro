float box(vec2 uv, vec2 center, vec2 size, float borderRadius, float antialias) {
  vec2 d = abs(uv - center) - size * 0.5 + borderRadius;
  float l = length(max(d, 0.)) + min(max(d.x, d.y), 0.);
  return smoothstep(max(antialias, 0.001), 0., l - borderRadius);
}

#pragma glslify: export(box)
