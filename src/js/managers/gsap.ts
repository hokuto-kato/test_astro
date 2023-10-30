import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import store from './store'

if (!window.gsap) {
  window.gsap = gsap

  //
  // config
  //

  gsap.config({
    force3D: true,
  })

  //
  // パラメーター
  //

  const param = {
    ease: {
      // default: '.2,0,0,1',
      // ease: '.25,.1,.25,1',
      medium: '.4,0,.2,1',
      // fast: '0,1,.4,1',
      // slide: '.47,.0,.1,1',
      // page: '.37,0,.3,1',
      move: '.24,.1,.2,1',
    },
  }

  //
  // main
  //

  gsap.registerPlugin(CustomEase)

  const keysEase = Object.keys(param.ease)
  if (keysEase.length > 0) {
    keysEase.forEach((name) => {
      CustomEase.create(name, param.ease[name])
    })
  }

  /* デバッグモードでは、ウィンドウにフォーカスが当たってるときだけonTickを実行する */
  if (store.isDebug) {
    window.addEventListener('blur', () => {
      gsap.ticker.sleep()
    })
    window.addEventListener('focus', () => {
      gsap.ticker.wake()
    })
  }
}
