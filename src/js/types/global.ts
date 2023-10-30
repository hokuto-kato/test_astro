import type Component from '~js/parentClass/Component'
import type Local from '~js/parentClass/Local'
import type Page from '~js/parentClass/Page'
import type Permanent from '~js/parentClass/Permanent'
import type ThreeRenderer from '~js/parentClass/ThreeRenderer'

export type ComponentClass =
  | Component
  | Local
  | Permanent
  | Page
  | ThreeRenderer
