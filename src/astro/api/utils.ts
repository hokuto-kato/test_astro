import {
  addHours,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from 'date-fns'

export function convertWysiwygHtml(content: string, isTableOfContents = false) {
  /* 目次生成 */
  let tableOfContentsList
  if (isTableOfContents && content) {
    tableOfContentsList = Array.from(
      content.matchAll(/<h2(.*?)>(.+?)<\/h2>/g)
    )?.map(([, attrs, heading]) => {
      const matchId = attrs.match(/id="(.+?)"/)
      return {
        id: matchId ? matchId[1] : heading,
        heading,
      }
    })
    if (tableOfContentsList) {
      content = content.replaceAll(
        /<h2(.*?)>(.+?)<\/h2>/g,
        (_, p1, p2) => `<h2${p1} id="${p2}">${p2}</h2>`
      )
    }
  }

  /* WYSIWYG内の外部リンクを別タブに変換する */
  if (content) {
    content = content.replaceAll(
      /href="(http[s]?:)?\/\/.+?"/g,
      '$& target="_blank"'
    )
  }

  return {
    content,
    tableOfContentsList,
  }
}

export function resetTime(date: number | Date) {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, 0), 0), 0), 0)
}

export function changeTimeZoneJapan(date: number | Date) {
  return setMilliseconds(
    setSeconds(setMinutes(setHours(addHours(date, 9), 23), 59), 59),
    999
  )
}

export const dateFormat = new Date()
