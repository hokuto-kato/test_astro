import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import Component from '~/js/parentClass/Component'
import {
  getSafeWindowHeight,
  getSafeWindowWidth,
  getVariableSize,
} from '~/js/utils/dom'
import ThreeRootScene from './ThreeRootScene'

export default class ThreeRenderer extends Component {
  renderer: THREE.WebGLRenderer
  scene: ThreeRootScene
  camera: THREE.PerspectiveCamera
  _composer: EffectComposer
  _count = 0
  _isInit = false
  isLooseContext = false
  _isDestroy = false

  onInit(option = this.option) {
    const {
      canvas = this.el,
      isFullSize = false,
      width = isFullSize ? window.innerWidth : this.el.clientWidth,
      height = isFullSize
        ? Math.max(window.innerHeight, this.el.clientHeight)
        : this.el.clientHeight,
      fps = 60,
      pixelRatio,
      pixelRatioMax = Infinity,
      pixelRatioAbsolute,
      alpha = false,
      antialias = false,
      stencil = false,
      powerPreference = 'low-power',
      logarithmicDepthBuffer = true,
      autoClear,
      clearColor = 0x000000,
      clearAlpha = 0,
      camera: { extraFar = 1 } = {},
      isManual = false,
    } = option
    this.optionSelf = option

    this.canvas = canvas
    this.isFullSize = isFullSize
    this.width = this._initialWidth = width
    this.height = this._initialHeight = height
    this._isSpecifiedWidth = 'width' in option && width !== this.el.clientWidth
    this._isSpecifiedHeight =
      'height' in option && height !== this.el.clientHeight
    this.framerate = 60 / fps
    this.alpha = alpha
    this.antialias = antialias
    this.stencil = stencil
    this.powerPreference = powerPreference
    this.logarithmicDepthBuffer = logarithmicDepthBuffer
    this.pixelRatioFixed = pixelRatio || pixelRatioAbsolute
    this.pixelRatioMax = pixelRatioMax
    this._isFixedPixelRatio = 'pixelRatio' in option
    this._isFixedPixelRatioAbsolute = 'pixelRatioAbsolute' in option
    this.clearColor = clearColor
    this.clearAlpha = clearAlpha
    this.extraFar = extraFar

    this.onWebglcontextlost = this.onWebglcontextlost.bind(this)

    if (!isManual) {
      this.init()
    }
  }

  init() {
    if (this._isInit) return
    this._isInit = true

    this.initRenderer()

    this.scene = new ThreeRootScene()

    const { fov, aspect, near, far } = this.optionSelf.camera || {}
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  }

  initPostProcessing(passes) {
    if (!(passes.length > 0)) {
      passes = [passes]
    }

    const { renderer, scene, camera } = this

    const size = renderer.getSize(new THREE.Vector2())
    const pixelRatio = renderer.getPixelRatio()
    size.width *= pixelRatio
    size.height *= pixelRatio

    const composer = (this._composer = new EffectComposer(
      renderer,
      new THREE.WebGLRenderTarget(size.width, size.height, {
        depthBuffer: false,
        stencilBuffer: false,
      }),
    ))

    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    for (let i = 0; i < passes.length; i++) {
      const pass = passes[i]
      pass.renderToScreen = i === passes.length - 1
      composer.addPass(pass)
    }

    renderer.autoClear = false
  }

  render() {
    if (this._isDestroy) return

    if (this._composer) {
      this._composer.render()
    } else if (this.renderer) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  // onTick() {
  //   if (this._count++ % this.framerate !== 0) return

  //   this.render()
  // }

  onResize() {
    if (!this._isInit || this._isDestroy) return

    const windowWidth = getSafeWindowWidth()

    const { el, renderer, scene, camera } = this
    const pixelRatio = (this.pixelRatio = this._isFixedPixelRatioAbsolute
      ? this.pixelRatioFixed
      : this._isFixedPixelRatio
      ? Math.min(this.pixelRatioFixed, window.devicePixelRatio)
      : Math.min(window.devicePixelRatio, this.pixelRatioMax))

    el.removeAttribute('width')
    el.removeAttribute('height')
    el.style.width = ''
    el.style.height = ''
    const width = (this.width = this.isFullSize
      ? windowWidth
      : this._isSpecifiedWidth
      ? getVariableSize(this._initialWidth)
      : el.clientWidth)
    const height = (this.height = this.isFullSize
      ? Math.max(getSafeWindowHeight(), el.clientHeight)
      : this._isSpecifiedHeight
      ? getVariableSize(this._initialHeight)
      : el.clientHeight)

    scene.resize(width, height)

    camera.aspect = width / height
    camera.position.z =
      Math.min(width, height) / 2 / Math.tan((camera.fov / 2) * (Math.PI / 180))
    camera.far = camera.position.z + this.extraFar
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(pixelRatio)

    // el.style.margin = `0 ${-(this.width - windowWidth) / 2}px`

    if (this._composer) {
      this._composer.setSize(width, height)
    }

    this.render()
  }

  onWebglcontextlost() {
    this.isLooseContext = true
    this.disposeRenderer()
  }

  initRenderer() {
    if (this.renderer) return
    this.isLooseContext = false

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: this.alpha,
      antialias: this.antialias,
      stencil: this.stencil,
      powerPreference: this.powerPreference,
      logarithmicDepthBuffer: this.logarithmicDepthBuffer,
    })
    if ('autoClear' in this.optionSelf) {
      this.renderer.autoClear = this.optionSelf.autoClear
    }
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, this.pixelRatioMax),
    )
    this.renderer.setClearColor(this.clearColor, this.clearAlpha)

    this.renderer.useLegacyLights = false
    this.renderer.outputEncoding = THREE.sRGBEncoding
    // this.renderer.toneMapping = THREE.LinearToneMapping
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    // this.renderer.toneMappingExposure = Math.pow(2, 2)

    this.domElement = this.renderer.domElement
    if (!this.canvas) {
      this.el.appendChild(this.domElement)
    }

    // ページ遷移し続けてcontextが失われたら、再度contextを生成しなおす
    this.domElement.addEventListener(
      'webglcontextlost',
      this.onWebglcontextlost,
    )
  }

  disposeRenderer() {
    this.domElement.removeEventListener(
      'webglcontextlost',
      this.onWebglcontextlost,
    )

    if (this.renderer) {
      const gl = this.renderer.getContext()
      if (gl.getExtension('WEBGL_lose_context')) {
        this.renderer.forceContextLoss()
      }

      this.renderer.dispose()
      if (!this.canvas) {
        this.el.removeChild(this.domElement)
      }
    }
  }

  disposeGeometry(geometry) {
    if (geometry) {
      geometry.dispose()
      geometry = null
    }
  }

  disposeMaterial(material) {
    if (material && Array.isArray(material)) {
      material.forEach((material) => this.disposeMaterialSingle(material))
    } else if (material) {
      this.disposeMaterialSingle(material)
    }
  }

  disposeMaterialSingle(material) {
    if (material.map) {
      material.map.dispose()
      material.map = null
    }
    material.dispose()
    material = null
  }

  setGroupOpacity(obj, opacity) {
    if (obj.material) {
      obj.material.opacity = opacity
    } else {
      obj.children.forEach((child) => {
        this.setGroupOpacity(child, opacity)
      })
    }
  }

  onDestroy() {
    this._isDestroy = true

    if (this._isInit) {
      this.disposeRenderer()
    }
  }
}
