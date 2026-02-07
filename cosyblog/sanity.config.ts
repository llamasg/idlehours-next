import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {codeInput} from '@sanity/code-input' // ← Add this line

export default defineConfig({
  name: 'default',
  title: 'Cosyblog',

  projectId: 'fwup7fag',
  dataset: 'production',

  plugins: [
    structureTool(), 
    visionTool(),
    codeInput(), // ← Add this line
  ],

  schema: {
    types: schemaTypes,
  },
})