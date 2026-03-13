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
import gameLibrary, {curatedRow, curatedRowGame, featureBanner} from './gameLibrary'

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
  // Game Library (singleton)
  gameLibrary,
  curatedRow,
  curatedRowGame,
  featureBanner,
  // Content types
  blockContent,
  // Homepage (document + section objects)
  ...homePageSchemas,
]
