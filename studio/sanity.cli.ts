import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'ijj3h2lj',
    dataset: 'production'
  },
  deployment: {
    /**
     * Disable auto-updates to avoid appId warning.
     * To enable version-controlled updates, add an appId from:
     * https://www.sanity.io/manage/project/ijj3h2lj/studios
     */
    appId: 'tsb3bjdq1gp4n843g7hn7t26',
    autoUpdates: false,
  }
})
