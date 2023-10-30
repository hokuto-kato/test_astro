import * as THREE from 'three'
import media from '~js/utils/media'

export default class ThreeRootScene extends THREE.Scene {
  rootSceneScale = 1

  resize(width: number, height: number) {
    /* SPのような縦長ディスプレイでMeshサイズが大きくなってしまうため、適切なサイズに変換 */
    this.scale.setScalar(height > width ? width / height : 1)
  }

  resizeLandscape(width: number, height: number) {
    /* SPでもcanvas比率を横長にしている場合 */
    this.rootSceneScale = media.isPortrait ? height / width : 1
    this.scale.setScalar(this.rootSceneScale)
  }
}
