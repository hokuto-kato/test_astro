import Component from '~/js/parentClass/Component'

export default class Opacity_IO extends Component {
  static selectorRoot = '[data-opacity-io]'

  onInit() {
    const { el } = this
    this.addIntersectionObserver({
      el: el,
      callback: ({ isIntersecting }, direction) => {
        if (isIntersecting) {
          el.classList.add('isIntersect_opacity')
        }
      },
      param: {
        rootMargin: '0% 0% -20% 0%',
      },
      once: true,
    })
  }
}
