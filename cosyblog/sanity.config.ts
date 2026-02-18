import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {codeInput} from '@sanity/code-input'

// Singleton document types — appear as single items in the nav, not lists
const singletons = new Set(['siteSettings', 'pip_dashboard'])

export default defineConfig({
  name: 'default',
  title: 'Idle Hours',

  projectId: 'ijj3h2lj',
  dataset: 'production',

  basePath: '/studio',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Singletons pinned to the top
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.listItem()
              .title('Pip Dashboard')
              .id('pip_dashboard')
              .child(
                S.document()
                  .schemaType('pip_dashboard')
                  .documentId('pip-dashboard-singleton')
              ),
            S.divider(),
            // All other document types
            ...S.documentTypeListItems().filter(
              (item) => !singletons.has(item.getId() ?? '')
            ),
          ]),
    }),
    visionTool(),
    codeInput(),
  ],

  schema: {
    types: schemaTypes,
  },
})
