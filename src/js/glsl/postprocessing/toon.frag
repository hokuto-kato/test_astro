precision highp float;

uniform sampler2D texture;

varying vec2 vUv;

#pragma glslify: random = require(glsl-random)

const float dx = 0.001953125;
const float dy = 0.001953125;
const float binalizationThreshold = 0.5;
const float minColor = 0.5;

float peek (const in float x, const in float y) {
  return texture2D(texture, vec2(x, y)).r;
}

void main () {
  float noise = (random(vec2(vUv)) * 2. - 1.) * 0.001;
  vec2 uv = vUv + noise;

  vec4 color = texture2D(texture, uv);

  float x = uv.x;
  float y = uv.y;
  mat3 m = mat3(
    peek(x - dx, y - dy), peek(x, y - dy), peek(x + dx, y - dy),
    peek(x - dx, y     ), peek(x, y     ), peek(x + dx, y     ),
    peek(x - dx, y + dy), peek(x, y + dy), peek(x + dx, y + dy)
  );
  vec2 h = vec2(
    m[0][0] - m[0][2] + (m[1][0] - m[1][2]) * 2.0 + m[2][0] - m[2][2],
    m[0][0] - m[2][0] + (m[0][1] - m[2][1]) * 2.0 + m[0][2] - m[2][2]
  );
  float d = 1.0 - length(h);
  d = step(binalizationThreshold, d); // binalization

  gl_FragColor = mix(vec4(minColor), vec4(1.), color) * vec4(vec3(d), 1.0);
}
