import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { schemaTypes } from './src/sanity/schemas'

export default defineConfig({
  name: 'elitemensguide',
  title: 'Elite Mens Guide',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'wkcec09a',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',

  plugins: [structureTool(), visionTool(), media()],

  schema: {
    types: schemaTypes,
  },
})
