import type { Store } from '~/js/managers/store'

import type { EventBus } from '~/js/events/eventBus'
import type {
  ListenerOrientationchange,
  ListenerResize,
} from '~/js/events/window'
import type { ListenerScroll } from '~/js/events/scroll'
import type { ListenerMouse } from '~/js/events/mouse'
import type { ListenerTick } from '~/js/events/tick'
import type { ListenerLoadDone, ListenerLoadProgress } from '~/js/events/load'

/* windowオブジェクトに追加する独自プロパティの型定義 */
declare global {
  interface Window {
    _GLOBAL_: {
      listenersLoadProgress: ListenerLoadProgress[]
      listenersLoadDone: ListenerLoadDone[]
      listenersTick: ListenerTick[]
      listenersResize: ListenerResize[]
      listenersResizeAlways: ListenerResize[]
      listenersResetSize: ListenerResize[]
      listenersOrientationchange: ListenerOrientationchange[]
      listenersScroll: ListenerScroll[]
      listenersMousedown: ListenerMouse[]
      listenersMousemove: ListenerMouse[]
      listenersMouseup: ListenerMouse[]
      listenersLeave: ((pageId: string) => void)[]
      listenersLeaveCompleted: ((pageId: string, pageIdPrev: string) => void)[]
      listenersEnter: ((pageId: string, pageIdPrev: string) => void)[]
      listenersEnterReady: ((pageId: string, pageIdPrev: string) => void)[]
      listenersEnterShow: ((pageId: string, pageIdPrev: string) => void)[]
      listenersEnterCompleted: ((pageId: string, pageIdPrev: string) => void)[]
      listenersLeaveCancelled: ((pageId: string, pageIdPrev: string) => void)[]
      listenersEnterCancelled: ((pageId: string) => void)[]
      eventBus: EventBus
      store: Store
      datGUI: any
      cacheLoadImage: Record<string, HTMLImageElement>
      cacheTimeline: Record<string, gsap.core.Timeline>
      media: {
        isSp: boolean
        isTb: boolean
        isTbPortrait: boolean
        isPortrait: boolean
      }
      uniqueId: number
      pageComponents: Record<string, any> // any: Anonymous class extends Page
    }
  }
}
