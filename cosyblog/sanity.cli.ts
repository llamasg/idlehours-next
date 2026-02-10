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
    autoUpdates: false,
  }
})
