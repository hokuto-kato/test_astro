#pragma glslify: fitCover = require(./fitCover.glsl)
#pragma glslify: fitContain = require(./fitContain.glsl)

vec2 fitWidth(vec2 coord, vec2 inputResolution, vec2 outputResolution) {
  return (inputResolution.x / inputResolution.y < outputResolution.x / outputResolution.y)
    ? fitCover(coord, inputResolution, outputResolution)
    : fitContain(coord, inputResolution, outputResolution);
}

#pragma glslify: export(fitWidth)
