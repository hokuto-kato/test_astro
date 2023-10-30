float map(float num, float fromMin, float fromMax, float toMin, float toMax) {
  return toMin + (num - fromMin) * (toMax - toMin) / (fromMax - fromMin);
}
