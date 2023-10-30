import Component from '~/js/parentClass/Component'

//
// main
//

export default class Lazy extends Component {
  static selectorRoot = '[data-src]'

  onInit() {
    const { isManual = false } = this.option
    this.isManual = isManual

    if (!this.isManual) {
      this.observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          this.load(entry.target)
          this.observer.unobserve(this.el)
        })
      })

      this.observer.observe(this.el)
    }
  }

  load(target = this.el) {
    if (target.children.length > 0) {
      for (const key in target.children) {
        const child = target.children[key]
        if (child.tagName === 'SOURCE') {
          child.src = child.dataset.src
          delete child.dataset.src
        }
      }
    } else {
      switch (target.tagName) {
        case 'IMG':
        case 'VIDEO':
        case 'SOURCE':
          target.src = target.dataset.src
          delete target.dataset.src
          break
      }
    }
  }

  onDestroy() {
    if (!this.isManual) {
      this.observer.unobserve(this.el)
    }
  }
}
