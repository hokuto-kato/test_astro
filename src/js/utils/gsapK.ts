import { kebabCase } from './string'

const _builtInKeys = [
  'autoCSS',
  'callbackScope',
  'delay',
  'duration',
  'ease',
  'immediateRender',
  'lazy',
  'onComplete',
  'onCompleteParams',
  'onCompleteScope',
  'onStart',
  'onStartParams',
  'onStartScope',
  'onOverwrite',
  'onRepeat',
  'onRepeatParams',
  'onRepeatScope',
  'onReverseComplete',
  'onReverseCompleteParams',
  'onReverseCompleteScope',
  'onUpdate',
  'onUpdateParams',
  'onUpdateScope',
  'overwrite',
  'paused',
  'repeat',
  'repeatDelay',
  'startAt',
  'useFrames',
  'yoyo',
  'yoyoEase',
  'clearProps',
]

function _getVarsKill(vars: gsap.TweenVars) {
  const varsKill: Record<string, boolean> = {}
  Object.keys(vars).forEach((key) => {
    if (_builtInKeys.some((builtInKey) => key === builtInKey)) return
    varsKill[key] = true
  })
  return varsKill
}

function _killTweensOf(targets: gsap.TweenTarget, vars: gsap.TweenVars) {
  const varsKill = _getVarsKill(vars)
  gsap.killTweensOf(targets, varsKill)
  return varsKill
}

const _cacheTimeline = (window._GLOBAL_.cacheTimeline =
  window._GLOBAL_.cacheTimeline || {})

/**
 * kill を自動実行する gsap
 * （使用可能メソッドは to, fromTo, set, timeline）
 */
export const gsapK = {
  /**
   * gsap.to() と同じ
   */
  to(targets: gsap.DOMTarget, vars: gsap.TweenVars | gsap.TweenVars[]) {
    if (
      !targets ||
      (targets as ArrayLike<Element | string | Window | null>).length === 0
    )
      return Promise.resolve()
    if (Array.isArray(vars)) {
      return Promise.all(
        vars.map((vars) => {
          _killTweensOf(targets, vars)
          return gsap.to(targets, vars)
        }),
      )
    } else {
      _killTweensOf(targets, vars)
      return gsap.to(targets, vars)
    }
  },

  /**
   * gsap.from() と同じ
   */
  from(targets: gsap.TweenTarget, vars: gsap.TweenVars | gsap.TweenVars[]) {
    if (
      !targets ||
      (targets as ArrayLike<Element | string | Window | null>).length === 0
    )
      return Promise.resolve()
    if (Array.isArray(vars)) {
      return Promise.all(
        vars.map((vars) => {
          _killTweensOf(targets, vars)
          return gsap.from(targets, vars)
        }),
      )
    } else {
      _killTweensOf(targets, vars)
      return gsap.from(targets, vars)
    }
  },

  /**
   * gsap.fromTo() と同じ
   */
  fromTo(
    targets: gsap.TweenTarget,
    fromVars: gsap.TweenVars | [gsap.TweenVars, gsap.TweenVars][],
    toVars?: gsap.TweenVars,
  ) {
    if (
      !targets ||
      (targets as ArrayLike<Element | string | Window | null>).length === 0
    )
      return Promise.resolve()
    if (Array.isArray(fromVars)) {
      return Promise.all(
        fromVars.map(([fromVars, toVars]) => {
          _killTweensOf(targets, toVars)
          return gsap.fromTo(targets, fromVars, toVars)
        }),
      )
    } else {
      _killTweensOf(targets, toVars)
      return gsap.fromTo(targets, fromVars, toVars)
    }
  },

  /**
   * gsap.set() と同じ
   */
  set(targets: gsap.TweenTarget, vars: gsap.TweenVars) {
    if (
      !targets ||
      (targets as ArrayLike<Element | string | Window | null>).length === 0
    )
      return Promise.resolve()
    _killTweensOf(targets, vars)
    return gsap.set(targets, vars)
  },

  /**
   * gsap.timeline() と同じ
   */
  timeline(vars: gsap.TimelineVars, name: string) {
    if (name && name in _cacheTimeline) {
      _cacheTimeline[name].pause().kill()
    }
    return (_cacheTimeline[name] = gsap.timeline(vars))
  },

  scrub(targets: gsap.TweenTarget, vars: gsap.TweenVars) {
    if (
      !targets ||
      (targets as ArrayLike<Element | string | Window | null>).length === 0
    )
      return Promise.resolve()
    if (!vars.duration) {
      vars.duration = 0.05
    }
    if (!vars.ease) {
      vars.ease = 'expo.out'
    }
    if (!('overwrite' in vars)) {
      vars.overwrite = true
    }
    return gsap.to(targets, vars)
  },

  /**
   * scrubのCSS transitionバージョン
   */
  scrubCss(targets: gsap.TweenTarget, vars: gsap.TweenVars) {
    if (
      !targets ||
      (targets as ArrayLike<Element | string | Window | null>).length === 0
    )
      return Promise.resolve()
    if (!vars.duration) {
      vars.duration = 0.05
    }
    if (!vars.ease) {
      vars.ease = 'expo.out'
    }
    if (!('overwrite' in vars)) {
      vars.overwrite = true
    }
    if (!(targets as HTMLElement).style?.transitionProperty) {
      vars.transitionProperty = Object.keys(_getVarsKill(vars))
        .map((p) => kebabCase(p))
        .join(',')
      vars.transitionDuration = `${vars.duration}s`
      vars.transitionTimingFunction = `cubic-bezier(0.16, 1, 0.3, 1)` // $easeOutExpo
    }
    return gsap.set(targets, vars)
  },

  resetScrub(targets: gsap.TweenTarget, vars: gsap.TweenVars) {
    if (
      !targets ||
      (targets as ArrayLike<Element | string | Window | null>).length === 0
    )
      return Promise.resolve()
    if (!('overwrite' in vars)) {
      vars.overwrite = true
    }
    return gsap.set(targets, vars)
  },

  resetScrubCss(targets: gsap.TweenTarget, vars: gsap.TweenVars) {
    if (
      !targets ||
      (targets as ArrayLike<Element | string | Window | null>).length === 0
    )
      return Promise.resolve()
    const varsKill = _getVarsKill(vars)
    vars.clearProps = Object.keys(varsKill).join(',')
    if (!('overwrite' in vars)) {
      vars.overwrite = true
    }
    return gsap.set(targets, vars)
  },
}

export { gsapK as default }
