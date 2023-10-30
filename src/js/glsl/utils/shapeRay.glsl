float shapeRay(vec2 uv, vec2 center, float rotation, float width, float edge) {
  float t = atan(uv.y - (center.y + 1.), uv.x - center.x) + rotation;
  return smoothstep(0., edge, t) * smoothstep(edge * 2. + width, edge + width, t);
}
