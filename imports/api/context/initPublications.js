import { Publications } from '../decorators/definePublications'
import { createPublications } from '../factories/createPublication'
import { rateLimitPublications } from '../factories/rateLimit'

export const initPublications = context => {
  context.publications = context.publications || {}
  context.publications.all = context.publications.all || Publications.defineAllPublication({ name: context.name })

  const publications = Object.values(context.publications)
  createPublications(publications)
  rateLimitPublications(publications)
}
