float mapClamp(float num, float fromMin, float fromMax, float toMin, float toMax) {
  return
    num <= fromMin ? toMin
    : num >= fromMax ? toMax
    : toMin + (num - fromMin) * (toMax - toMin) / (fromMax - fromMin);
}
