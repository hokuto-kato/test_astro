import { fetchAPI } from './core'
import { convertWysiwygHtml } from './utils'
import { format } from 'date-fns'

export type News = {
  slug: string
  title: string
  date: string
  category: string
  image: string
  link: string
}

export type NewsDetail = News & {
  content: string
}

const fragmentNews = `
fragment NewsFields on News {
  slug
  title
  date
  newsCategories {
    edges {
      node {
        slug
        name
      }
    }
  }
  featuredImage {
    node {
      sourceUrl
    }
  }
}
`

// acfNews {
//   newsCategory {
//     name
//     slug
//   }
// }

export async function getPreviewNews(id: string, idType = 'DATABASE_ID') {
  const data = await fetchAPI(
    `
    query PreviewNews($id: ID!, $idType: NewsIdType!) {
      news(id: $id, idType: $idType) {
        databaseId
        slug
        status
      }
    }`,
    {
      variables: { id, idType },
    }
  )
  return data.blog
}

export async function getAllNews() {
  const data = await fetchAPI(
    `
    ${fragmentNews}
    query AllNews {
      newsPieces(first: 10000, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            ...NewsFields
          }
        }
      }
    }
  `
  )

  return data?.newsPieces.edges.map(({ node }) => convertArticle(node))
}

export async function getTopNews() {
  const data = await fetchAPI(
    `
    ${fragmentNews}
    query {
      page(id: "cG9zdDoy") {
        acfTop {
          topNews {
            ...NewsFields
          }
        }
      }
    }
  `
  )

  return data?.page.acfTop.topNews.map((news) => convertArticle(news))
}

export async function getCategories() {
  const dataCategories = await fetchAPI(
    `
    query AllCategories {
      newsCategories(where: {orderby: DESCRIPTION}) {
        edges {
          node {
            slug
            name
          }
        }
      }
    }
  `
  )

  return dataCategories.newsCategories.edges.map(({ node }) => node)
}

export async function getNewsByCategory(categoryName) {
  return (await getAllNews()).filter(
    ({ category }) => category === categoryName
  )
}

export function getNewsWithSpecificCategory(categoryData, categoryId) {
  return categoryData.find(([id]) => id === categoryId)[1].newsPieces
}

export async function getNewsDetail(slug, preview = false, previewData?: News) {
  const newsPreview = preview && previewData?.news
  // The slug may be the id of an unpublished news
  const isId = Number.isInteger(Number(slug))
  const isSameNews = isId
    ? Number(slug) === newsPreview.id
    : slug === newsPreview.slug
  const isDraft = isSameNews && newsPreview?.status === 'draft'
  const isRevision = isSameNews && newsPreview?.status === 'publish'
  const { news: data } = (await fetchAPI(
    `
    ${fragmentNews}
    fragment NewsDetailFields on News {
      ...NewsFields
      content
    }
    query NewsBySlug($id: ID!, $idType: NewsIdType!) {
      news(id: $id, idType: $idType) {
        ...NewsDetailFields
        ${
          // Only some of the fields of a revision are considered as there are some inconsistencies
          isRevision || isDraft
            ? `
        revisions(first: 1, where: { orderby: { field: MODIFIED, order: DESC } }) {
          edges {
            node {
              ...NewsDetailFields
            }
          }
        }
        `
            : ''
        }
      }
    }
    `,
    {
      variables: {
        id: isDraft ? newsPreview.id : `/news/${decodeURIComponent(slug)}/`,
        idType: isDraft ? 'DATABASE_ID' : 'URI',
      },
    }
  )) as { news: NewsDetail }
  if (!data) return

  // Draft news may not have an slug
  if (isDraft) data.slug = newsPreview.id
  // Apply a revision (changes in a published news)
  if ((isRevision || isDraft) && data.revisions) {
    const revision = data.revisions.edges[0]?.node

    if (revision) Object.assign(data, revision)
    delete data.revisions
  }

  if (data.date) {
    data.date = format(new Date(data.date), 'yyyy MM.dd')
  }

  data.image = getImageUrl(data)
  data.link = getLinkUrl(data)
  data.category = getCategoryName(data)

  /* WYSIWYG内の外部リンクを別タブに変換する */
  if (data.content) {
    const html = convertWysiwygHtml(data.content)
    data.content = html.content
  }

  return data
}

export function convertArticle(article) {
  return {
    slug: article.slug,
    link: getLinkUrl(article),
    category: getCategoryName(article),
    date: format(new Date(article.date), 'yyyy.MM.dd'),
    year: format(new Date(article.date), 'yyyy'),
    title: article.title.replace('<br>', ' '),
    image: getImageUrl(article),
  }
}

export async function getSpecificSlugNews(news: string[]) {
  return Promise.all(
    news.map(async (slug) => {
      const data = await getNewsDetail(slug)
      return convertArticle(data)
    })
  )
}

export function getImageUrl(article) {
  if (article.featuredImage) {
    return article.featuredImage.node.sourceUrl
  }
  else {
    return '/assets/images/news/blank.jpg'
  }
}

export function getLinkUrl(article) {
  if (article.slug) {
    return `/news/${article.slug}/`
  }
  else {
    return null
  }
}

export function getCategoryName(article) {
  return article.newsCategories.edges[0]?.node.name
  // return article.acfNews.newsCategory.name
}




