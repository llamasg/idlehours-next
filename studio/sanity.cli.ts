import {defineCliConfig} from 'sanity/cli'
import {readFileSync} from 'fs'
import {resolve} from 'path'

/** Read VITE_ vars from .env and .env.local in the studio directory. */
function loadStudioEnv(): Record<string, string> {
  const env: Record<string, string> = {}
  for (const file of ['.env', '.env.local']) {
    try {
      const content = readFileSync(resolve(__dirname, file), 'utf8')
      for (const line of content.split('\n')) {
        const match = line.match(/^(VITE_\w+)=(.*)$/)
        if (match) env[match[1]] = match[2].trim()
      }
    } catch {
      // file doesn't exist — skip
    }
  }
  return env
}

export default defineCliConfig({
  api: {
    projectId: 'ijj3h2lj',
    dataset: 'production'
  },
  deployment: {
    appId: 'tsb3bjdq1gp4n843g7hn7t26',
    autoUpdates: false,
  },
  vite: (config) => {
    const env = loadStudioEnv()
    return {
      ...config,
      define: {
        ...config.define,
        'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(env.VITE_ANTHROPIC_API_KEY || ''),
        'import.meta.env.VITE_IGDB_PROXY_URL': JSON.stringify(env.VITE_IGDB_PROXY_URL || ''),
      },
    }
  },
})
