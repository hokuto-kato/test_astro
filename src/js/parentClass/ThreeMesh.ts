import * as THREE from 'three'

export default class ThreeMesh extends THREE.Mesh {
  disposeGeometry(geometry: THREE.BufferGeometry) {
    if (geometry) {
      geometry.dispose()
    }
  }

  disposeMaterial(material: THREE.Material | THREE.Material[]) {
    if (material && Array.isArray(material)) {
      material.forEach((material) => this.disposeMaterialSingle(material))
    } else if (material) {
      this.disposeMaterialSingle(material)
    }
  }

  disposeMaterialSingle(material: THREE.Material) {
    if (material.map) {
      material.map.dispose()
    }
    material.dispose()
  }

  dispose() {
    this.disposeGeometry(this.geometry)
    this.disposeMaterial(this.material)
  }
}
