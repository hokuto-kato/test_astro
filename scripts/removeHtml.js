import { rm } from 'fs'

/* Ph1サイレントリリース時に公開しないページを削除する */
// TODO: 完全版公開時は無効にする
const removeFiles = () => {
  ;[
    'dist/careers',
    'dist/privacy',
    'dist/smb-service',
    'dist/white-label',
    'dist/why-use',
    'dist/404.html',
  ].forEach((path) => {
    rm(path, { recursive: true }, (err) => {
      if (err) throw err
      console.log(`${path} was deleted`)
    })
  })
}

removeFiles()
