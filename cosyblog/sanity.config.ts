import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {codeInput} from '@sanity/code-input'

export default defineConfig({
  name: 'default',
  title: 'Idle Hours',

  projectId: 'ijj3h2lj',
  dataset: 'production',

  basePath: '/studio',

  plugins: [
    structureTool(),
    visionTool(),
    codeInput(),
  ],

  schema: {
    types: schemaTypes,
  },
})
