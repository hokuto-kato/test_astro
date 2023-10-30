import init from '~/js/core'

/* asynchronous transition */
// import Transition from '~js/highway/TransitionImmediate'
// import Transition from '~/js/highway/TransitionDefault'
// import Transition from '~js/highway/WithComponent'

/* scroll */
import Scroll from '~/js/scroll/ScrollLenis'

/*
 * main
 */

init({
  Scroll,
  transitions: {
    // default: Transition,
    // contextual: {
    //   menu: Transition, // メニュー内リンククリック時のアニメーション
    // },
  },
})
