import blockContent from './blockContent'
import category from './category'
import post from './post'
import author from './author'
import product from './product'
import quiz from './quiz'
import promoBanner from './promoBanner'
import game from './game'
import siteSettings from './siteSettings'
import {homePageSchemas} from './homePage'
import pipDashboard from './pipDashboard'

export const schemaTypes = [
  // Documents
  post,
  author,
  category,
  product,
  game,
  quiz,
  siteSettings,
  promoBanner,
  // Pip — nightly job results (singleton, written by backend)
  pipDashboard,
  // Content types
  blockContent,
  // Homepage (document + section objects)
  ...homePageSchemas,
]
