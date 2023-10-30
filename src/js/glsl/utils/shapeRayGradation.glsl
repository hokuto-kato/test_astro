// #include /utils/getUvPolar;

float shapeRayGradation(vec2 uv, vec2 center, float rotation, float width, float edge, float rayDistance) {
  uv -= center;
  vec2 uvPolar = getUvPolar(uv);
  uvPolar.y -= rotation;
  float ray = smoothstep(0., edge, uvPolar.y) * smoothstep(edge * 2. + width, edge + width, uvPolar.y);
  ray *= max(1. - uvPolar.x / rayDistance, 0.);
  return ray;
}
