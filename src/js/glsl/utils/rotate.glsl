vec2 rotate(vec2 uv, float rad, vec2 offset) {
  uv += offset;
  uv -= 0.5;
  uv *= mat2(cos(rad),sin(rad),-sin(rad),cos(rad));
  uv += 0.5;
  uv -= offset;
  return uv;
}
