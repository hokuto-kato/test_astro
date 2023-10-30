//
// GSAP
//

export const easeList = [
  'back',
  'bounce',
  'circ',
  'cubic',
  'ease',
  'elastic',
  'expo',
  'power1',
  'power2',
  'power3',
  'power4',
  'quad',
  'quart',
  'quint',
  'sine',
  'strong',
]

export const easeTypeList = ['in', 'inOut', 'out']

export const easeAllList = ['none']
easeList.forEach((ease) => {
  return easeTypeList.forEach((type) => {
    easeAllList.push(`${ease}.${type}`)
  })
})
