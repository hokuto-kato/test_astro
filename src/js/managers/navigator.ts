import {
  // isSafari,
  // isTablet,
  isMobile,
  // isAndroid,
  // isIos,
  // isWindows,
} from '~/js/utils/navigator'

/* browser */
// if (isSafari) {
//   document.documentElement.classList.add('bSafari')
// }

/* device */
// if (isTablet) {
//   document.documentElement.classList.add('bTablet')
// }

/* OS */
if (isMobile) {
  document.documentElement.classList.add('bMobile')
}
// if (isAndroid) {
//   document.documentElement.classList.add('bAndroid')
// }
// if (isIos) {
//   document.documentElement.classList.add('bIos')
// }
// if (isWindows) {
//   document.documentElement.classList.add('bWindows')
// }
