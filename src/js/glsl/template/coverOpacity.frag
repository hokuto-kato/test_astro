precision highp float;

uniform sampler2D uTex;
uniform vec2 uResolutionCanvas;
uniform vec2 uResolutionImage;
uniform float uOpacity;

varying vec2 vUv;

#pragma glslify: fitCover = require(./utils/fitCover)

void main() {
  vec2 uv = fitCover(vUv, uResolutionImage, uResolutionCanvas);

  vec4 color = texture2D(uTex, uv);
  color.a *= uOpacity;

  gl_FragColor = color;
}
