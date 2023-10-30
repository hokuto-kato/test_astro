import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { detectStartLoading } from '~js/events/load'
import store from '~js/managers/store'
import { mix } from './math'

type threeUniformsValue = any
type UniformObject = Record<string, { value: threeUniformsValue }>
export type UniformObjectWithoutValue = Record<string, threeUniformsValue>
type onLoadTexture = (texture: THREE.Texture) => void
type onProgressTexture = (event: ProgressEvent) => void
type onErrorTexture = (event: ErrorEvent) => void
type onLoadGLTF = (gltf: GLTF) => void
type onProgressGLTF = (event: ProgressEvent<EventTarget>) => void
type onErrorGLTF = (event: ErrorEvent) => void

// デフォルトでキャッシュを有効にする
THREE.Cache.enabled = true

let textureLoader: THREE.TextureLoader
let objectLoader: THREE.ObjectLoader

export function loadTexture(
  url: string,
  {
    onLoad,
    onProgress,
    onError,
    isAddToLoadingWait,
  }: {
    onLoad?: onLoadTexture
    onProgress?: onProgressTexture
    onError?: onErrorTexture
    isAddToLoadingWait?: boolean
  } = {},
) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  const texture = url
    ? textureLoader.load(
        url,
        (texture) => {
          if (onLoad) onLoad(texture)
        },
        onProgress,
        onError,
      )
    : null

  if (isAddToLoadingWait && texture) {
    store.loadingCountList[store.pageId].push(
      new Promise(async (resolve) => {
        resolve(await texture)
      }),
    )
    detectStartLoading()
  }

  return texture
}

export function loadTextureImageSize(
  { src }: { src: string },
  {
    onLoad,
    onProgress,
    onError,
    isAddToLoadingWait,
  }: {
    onLoad?: onLoadTexture
    onProgress?: onProgressTexture
    onError?: onErrorTexture
    isAddToLoadingWait?: boolean
  } = {},
) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  const texture = src
    ? textureLoader.load(
        src,
        (texture) => {
          if (onLoad) onLoad(texture)
        },
        onProgress,
        onError,
      )
    : null

  if (isAddToLoadingWait && texture) {
    store.loadingCountList[store.pageId].push(
      new Promise(async (resolve) => {
        resolve(await texture)
      }),
    )
    detectStartLoading()
  }

  return texture
}

export function loadOptimizedTexture(
  url: string,
  options: { onLoad?: onLoadTexture; isAddToLoadingWait?: boolean } = {},
) {
  return /\.png$/.test(url)
    ? loadOptimizedTexturePng(url, options)
    : /\.jpe?g$/.test(url)
    ? loadOptimizedTextureJpg(url, options)
    : null
}

export function loadOptimizedTextureUsingImageSize(
  { src, format }: { src: string; format: string },
  options: {
    onLoad?: onLoadTexture
    onProgress?: onProgressTexture
    onError?: onErrorTexture
    isAddToLoadingWait?: boolean
  } = {},
) {
  return format === 'png'
    ? loadOptimizedTexturePng(src, options)
    : /^jpe?g$/.test(format)
    ? loadOptimizedTextureJpg(src, options)
    : null
}

export function loadOptimizedTexturePng(
  url: string,
  {
    onLoad,
    onProgress,
    onError,
    isAddToLoadingWait,
  }: {
    onLoad?: onLoadTexture
    onProgress?: onProgressTexture
    onError?: onErrorTexture
    isAddToLoadingWait?: boolean
  } = {},
) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  let _resolve: (value: THREE.Texture | PromiseLike<THREE.Texture>) => void

  if (isAddToLoadingWait) {
    const promise = new Promise<THREE.Texture>((resolve) => {
      _resolve = resolve
    })
    store.loadingCountList[store.pageId].push(promise)
  }

  const texture = url
    ? textureLoader.load(
        url,
        (texture) => {
          optimizePngJaggy(texture)
          if (onLoad) onLoad(texture)
          if (isAddToLoadingWait) {
            _resolve(texture)
            detectStartLoading()
          }
        },
        onProgress,
        onError,
      )
    : null

  return texture
}

export function loadOptimizedTextureJpg(
  url: string,
  {
    onLoad,
    onProgress,
    onError,
    isAddToLoadingWait,
  }: {
    onLoad?: onLoadTexture
    onProgress?: onProgressTexture
    onError?: onErrorTexture
    isAddToLoadingWait?: boolean
  } = {},
) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  let _resolve: (value: THREE.Texture | PromiseLike<THREE.Texture>) => void

  if (isAddToLoadingWait) {
    const promise = new Promise<THREE.Texture>((resolve) => {
      _resolve = resolve
    })
    store.loadingCountList[store.pageId].push(promise)
  }

  const texture = url
    ? textureLoader.load(
        url,
        (texture) => {
          optimizeJpg(texture)
          if (onLoad) onLoad(texture)
          if (isAddToLoadingWait) {
            _resolve(texture)
            detectStartLoading()
          }
        },
        onProgress,
        onError,
      )
    : null

  return texture
}

export function loadTextureSync(url: string) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  return url
    ? new Promise((resolve) => {
        textureLoader.load(url, resolve)
      })
    : Promise.resolve(null)
}

export function loadOptimizedTextureSync(url: string) {
  return /\.png$/.test(url)
    ? loadOptimizedTexturePngSync(url)
    : /\.jpe?g$/.test(url)
    ? loadOptimizedTextureJpgSync(url)
    : Promise.resolve(null)
}

export function loadOptimizedTexturePngSync(
  url: string,
  {
    onLoad,
    onProgress,
    onError,
    isAddToLoadingWait,
  }: {
    onLoad?: onLoadTexture
    onProgress?: onProgressTexture
    onError?: onErrorTexture
    isAddToLoadingWait?: boolean
  } = {},
) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  const promise = url
    ? new Promise<THREE.Texture>((resolve) => {
        textureLoader.load(
          url,
          (texture) => {
            optimizePngJaggy(texture)
            if (onLoad) onLoad(texture)
            resolve(texture)
          },
          onProgress,
          onError,
        )
      })
    : Promise.resolve(null)

  if (isAddToLoadingWait) {
    store.loadingCountList[store.pageId].push(promise)
    detectStartLoading()
  }

  return promise
}

export function loadOptimizedTextureJpgSync(
  url: string,
  {
    onLoad,
    onProgress,
    onError,
    isAddToLoadingWait,
  }: {
    onLoad?: onLoadTexture
    onProgress?: onProgressTexture
    onError?: onErrorTexture
    isAddToLoadingWait?: boolean
  } = {},
) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  const promise = url
    ? new Promise<THREE.Texture>((resolve) => {
        textureLoader.load(
          url,
          (texture) => {
            optimizeJpg(texture)
            if (onLoad) onLoad(texture)
            resolve(texture)
          },
          onProgress,
          onError,
        )
      })
    : Promise.resolve(null)

  if (isAddToLoadingWait) {
    store.loadingCountList[store.pageId].push(promise)
    detectStartLoading()
  }

  return promise
}

export function loadJSONSync(url: string) {
  objectLoader = objectLoader || new THREE.ObjectLoader()

  return url
    ? new Promise((resolve) => {
        objectLoader.load(url, resolve)
      })
    : Promise.resolve(null)
}

/**
 * Texture(透過PNG)の境界線のジャギを消す
 * @param {Texture} texture
 */
export function optimizePngJaggy(
  texture: THREE.Texture,
  filter = THREE.LinearFilter,
) {
  texture.anisotropy = 0
  texture.magFilter = texture.minFilter = filter
}

/**
 * Texture(JPEG)の最適化
 * @param {Texture} texture
 */
export function optimizeJpg(
  texture: THREE.Texture,
  filter = THREE.LinearFilter,
) {
  texture.magFilter = texture.minFilter = filter
}

export function loadGLTF(
  url: string,
  {
    onLoad,
    onProgress,
    onError,
    isAddToLoadingWait,
  }: {
    onLoad?: onLoadGLTF
    onProgress?: onProgressGLTF
    onError?: onErrorGLTF
    isAddToLoadingWait?: boolean
  } = {},
) {
  store.gltfLoader =
    store.gltfLoader ||
    (() => {
      const loader = new GLTFLoader()
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/gl/draco/')
      loader.setDRACOLoader(dracoLoader)
      return loader
    })()

  let _resolve: (gltf: GLTF) => void

  if (isAddToLoadingWait) {
    const promise = new Promise<GLTF>((resolve) => {
      _resolve = resolve
    })
    store.loadingCountList[store.pageId].push(promise)
  }

  const texture = url
    ? store.gltfLoader.load(
        url,
        (gltf) => {
          if (onLoad) onLoad(gltf)
          if (isAddToLoadingWait) {
            _resolve(gltf)
            detectStartLoading()
          }
        },
        onProgress,
        onError,
      )
    : null

  return texture
}

/**
 * value キーのある three.js 用の uniforms オブジェクトに変換（そのオブジェクトの値を更新すると元のオブジェクトの同キーの value キーの値が更新される）
 * @param {Object} uniforms value キーなしの uniforms オブジェクト
 * @return {Object} value キーのある three.js 用の uniforms オブジェクト
 */
export function convertObjectToThreeUniforms(uniforms: UniformObject) {
  const newUniforms: UniformObjectWithoutValue = {}
  Object.keys(uniforms).forEach((key) => {
    newUniforms[key] = { value: uniforms[key] }
  })
  return newUniforms
}

/**
 * value キーのない uniforms オブジェクトに変換（そのオブジェクトの値を更新すると元のオブジェクトの同キーの value キーの値が更新される）
 * @param {Object} uniforms three.js 用の value キーありの uniforms オブジェクト
 * @return {Object} value キーのない更新用 uniforms オブジェクト
 */
export function convertUniformsWithoutValue(
  uniforms: UniformObjectWithoutValue,
) {
  const newUniforms: UniformObject = {}
  Object.keys(uniforms).forEach((key) => {
    Object.defineProperty(newUniforms, key, {
      get() {
        return uniforms[key].value
      },
      set(value) {
        uniforms[key].value = value
      },
    })
  })
  return newUniforms
}

/**
 * Vector3のそれぞれの値を線形補間
 */
export function mixVec3(
  x: THREE.Vector3 | THREE.Euler,
  y: THREE.Vector3 | THREE.Euler,
  a: number,
): [number, number, number] {
  return [mix(x.x, y.x, a), mix(x.y, y.y, a), mix(x.z, y.z, a)]
}

/**
 * Colorのそれぞれの値を線形補間
 */
export function mixColor(
  x: THREE.Color,
  y: THREE.Color,
  a: number,
): [number, number, number] {
  return [mix(x.r, y.r, a), mix(x.g, y.g, a), mix(x.b, y.b, a)]
}
