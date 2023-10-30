precision highp float;

uniform sampler2D uTex;
uniform vec2 uResolutionCanvas;
uniform vec2 uResolutionImage;

varying vec2 vUv;

#pragma glslify: fitCover = require(./utils/fitCover)

void main() {
  vec2 uv = fitCover(vUv, uResolutionImage, uResolutionCanvas);

  vec4 color = texture2D(uTex, uv);

  gl_FragColor = color;
}
