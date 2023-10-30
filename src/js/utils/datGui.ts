import * as dat from 'dat.gui'
import * as THREE from 'three'
import { easeAllList } from '~/js/utils/gsap'
import media from '~/js/utils/media'

//
// main
//

/**
 * dat.GUI
 *
 * @class DatGUI
 */
class DatGUI {
  folders = {}

  /**
   * コンストラクター
   */
  constructor() {
    this.gui = new dat.GUI()
    this.gui.closed = !_ENV_.isOpenDatGui || media.isSp

    if (_ENV_.isShowDatGui) {
      // GUI 上でホイールスクロールするときに、ページにイベントが伝わらないようにする
      this.gui.domElement.parentElement.style.zIndex = 9999
      this.gui.domElement.addEventListener('wheel', (e) => {
        e.stopPropagation()
      })
    } else {
      // GUI を画面上からなくす
      if (import.meta.env.PROD) {
        // 完全に削除する
        const el = document.querySelector('body > .dg.ac')
        if (el) document.body.removeChild(el)
      } else {
        // URLパラメーターがあるときは GUI 表示
        this.gui.domElement.parentElement.style.visibility = 'hidden'
        if (new URL(document.location).searchParams.get('control') === 'show') {
          this.gui.domElement.parentElement.style.visibility = 'visible'
        }
      }
    }
  }

  /**
   *
   *
   * @param {Object} data
   * @param {string} data.key
   * @param {*} data.value
   * @param {string} [data.name=key]
   * @param {number[]} [data.range]
   * @param {boolean} [data.isListen]
   * @param {Object} [options={}]
   * @param {dat.gui.GUI} [options.folder=this.gui]
   * @returns {Object}
   */
  addParameter(data, options = {}) {
    const { key, name = key, range, isListen, _setValue } = data
    let { value } = data
    const { folder = this.gui } = options

    let controller
    let datData

    if (this._isColor(value) || this._isThreeColor(value)) {
      if (this._isThreeColor(value)) {
        value = `#${value.getHexString()}`
      }

      datData = { name, [name]: value }
      controller = folder.addColor({ name, [name]: value }, name)
    } else {
      let datRange = []
      if (range) {
        datRange = range
      } else if (this._isEase(value)) {
        datRange.push(easeAllList)
      } else if (typeof value === 'number') {
        if (value < 1 && value >= 0) {
          datRange = [0, 1]
        } else {
          const diff = 10 ** (String(Math.floor(value)).length - 1) * 2
          datRange = [value - diff, value + diff]
        }
      }

      datData = { name, [name]: value }
      controller = folder.add({ name, [name]: value }, name, ...datRange)
    }

    if (_setValue) {
      _setValue(value)
      controller.onChange(_setValue)
    }

    if (isListen) {
      controller.listen()
    }

    // リセットスタイルの影響を無効にするスタイルを上書きする
    Array.prototype.forEach.call(
      controller.domElement.getElementsByTagName('select'),
      (el, i) => {
        el.style.webkitAppearance = 'menulist'
        el.style.backgroundColor = 'rgb(248, 248, 248)'
        el.style.color = 'black'
      },
    )

    return datData
  }

  /**
   *
   *
   * @param {*} data
   * @param {Object} object
   * @param {Object} [options={}]
   * @param {dat.gui.GUI} [options.folder=this.gui]
   */
  addParameterObject(data, object, option = {}) {
    const { key, value, onChange } = data
    let { convertValue = (value) => value } = data
    const { folder, _isUniform } = option

    if (this._isColor(value) || this._isThreeColor(value)) {
      convertValue = (value) => new THREE.Color(value)
    }

    data._setValue = (value) => {
      if (_isUniform) {
        if (
          typeof object[key] !== 'undefined' &&
          Object.prototype.hasOwnProperty.call(object[key], 'value')
        ) {
          object[key].value = convertValue(value)
        } else {
          object[key] = { value: convertValue(value) }
        }
      } else {
        object[key] = convertValue(value)
      }

      if (onChange) {
        onChange(value)
      }
    }

    this.addParameter(data, {
      folder,
    })
  }

  /**
   *
   *
   * @param {string} name
   * @param {Object} [option={}]
   * @param {function} [option.parent=this.gui]
   * @param {boolean} [option.isClose=false]
   * @returns {dat.gui.GUI}
   */
  addFolder(name, option = {}) {
    if (this.folders[name]) {
      return this.folders[name]
    } else {
      const { parent = this.gui, isClose = false } = option
      const folder = (this.folders[name] = parent.addFolder(name))
      if (!isClose) folder.open()
      return folder
    }
  }

  iterateParameters(parameters, option = {}) {
    const { folder, object = {}, _isUniform } = option
    parameters.forEach((parameter) => {
      this.addParameterObject(parameter, object, {
        folder,
        _isUniform,
      })
    })
  }

  iterateFolder(folders, option = {}) {
    const { parent, object, _isUniform } = option
    folders.forEach((folder) => {
      const datFolder = this.addFolder(folder.name, {
        parent,
        isClose: folder.isClose,
      })
      if (folder.parameters) {
        this.iterateParameters(folder.parameters, {
          folder: datFolder,
          object,
          _isUniform,
        })
      }
      if (folder.folders) {
        this.iterateFolder(folder.folders, {
          parent: datFolder,
          object,
          _isUniform,
        })
      }
    })
  }

  /**
   * パラメーターオブジェクトから dat.GUI での変更が反映されるオブジェクトに変換する
   *
   * @param {Object} dataset パラメーターを定義したオブジェクト
   * @returns {Object} dat.GUI での変更が反映されるオブジェクト
   */
  convertDataset(dataset, _isUniform) {
    const object = {}
    if (Array.isArray(dataset)) {
      this.iterateParameters(dataset, { object, _isUniform })
    } else {
      Object.keys(dataset).forEach((key) => {
        if (key === 'folders') {
          this.iterateFolder(dataset[key], { object, _isUniform })
        } else if (key === 'parameters') {
          this.iterateParameters(dataset[key], { object, _isUniform })
        }
      })
    }
    return object
  }

  /**
   * パラメーターオブジェクトから dat.GUI での変更が反映される three.js 用 uniform オブジェクトに変換する
   *
   * @param {Object} dataset パラメーターを定義したオブジェクト
   * @returns {Object} dat.GUI での変更が反映される three.js 用 uniform オブジェクト
   */
  convertDatasetUniform(dataset) {
    return this.convertDataset(dataset, true)
  }

  _isColor(value) {
    return typeof value === 'string' && value.startsWith('#')
  }

  /**
   * THREE.Color かどうか
   *
   * @private
   * @param {*} value
   * @returns {boolean}
   */
  _isThreeColor(value) {
    return value?.isColor
  }

  _isEase(value) {
    return easeAllList.includes(value)
  }
}

const datGUI = (window._GLOBAL_.datGUI = window._GLOBAL_.datGUI || new DatGUI())
export default datGUI
