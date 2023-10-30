vec3 vignette(vec3 color, vec2 uv, float size) {
  return color * min(size - length(uv), 1.);
}
