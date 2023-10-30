import { loadEnv } from 'vite'

export const IS_CMS =
  (process.env.NODE_CMS ||
    loadEnv(import.meta.env.MODE, process.cwd(), '').NODE_CMS) === 'true'
