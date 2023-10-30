vec2 repeatUvReverse(vec2 uv) {
  return vec2(
    mod(uv.x, 2.) < 1. ? fract(uv.x) : 1. - fract(uv.x),
    mod(uv.y, 2.) < 1. ? fract(uv.y) : 1. - fract(uv.y)
  );
}

#pragma glslify: export(repeatUvReverse)
