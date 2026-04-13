import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

const cats = await client.fetch('*[_type=="category"]|order(name asc){name,"slug":slug.current}')
console.log(JSON.stringify(cats, null, 2))
