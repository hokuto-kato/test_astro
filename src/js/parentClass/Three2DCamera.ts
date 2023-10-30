import * as THREE from 'three'

export default class Three2DCamera extends THREE.OrthographicCamera {
  constructor({
    width = 2,
    height = 2,
    near = 0.1,
    far = 2,
  }: {
    width?: number
    height?: number
    near?: number
    far?: number
  } = {}) {
    // console.trace('width, height, near, far', width, height, near, far)
    super(width / -2, width / 2, height / 2, height / -2, near, far)
    this.position.z = 1
  }

  resize(width: number, height: number) {
    this.left = width / -2
    this.right = width / 2
    this.top = height / 2
    this.bottom = height / -2
    this.updateProjectionMatrix()
  }
}
