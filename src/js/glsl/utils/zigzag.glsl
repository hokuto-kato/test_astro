float zigzag(float x) {
  return fract(x*(step(mod(x,2.),1.)*2.-1.));
}
