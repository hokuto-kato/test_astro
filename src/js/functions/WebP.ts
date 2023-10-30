import Component from '~/js/parentClass/Component'

//
// main
//

export default class WebP extends Component {
  static selectorRoot = 'picture'

  constructor(option) {
    super(option)

    this.elSource = this.el.querySelector(
      `source[type="image/webp"]${this.isSp ? '[media]' : ':not([media])'}`
    )
    if (!this.elSource) {
      this.elSource = this.el.querySelector(`source[type="image/webp"]`)
    }
    this.elImg = this.el.querySelector('img')

    this.onError = this.onError.bind(this)
    this.elImg.addEventListener('error', this.onError)
  }

  onError() {
    this.elImg.removeEventListener('error', this.onError)
    // WebP画像を読み込めなかったら通常画像を読み込む
    this.srcset = this.srcset.replace('.webp', '')
  }

  onDestroy() {
    this.elImg.removeEventListener('error', this.onError)
  }
}
