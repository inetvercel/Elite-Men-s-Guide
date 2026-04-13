import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'wpId',
      title: 'WordPress ID',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'permalink',
      title: 'Exact WordPress Permalink',
      type: 'string',
      description: 'Full permalink path from WordPress (e.g. /my-post-slug/)',
      readOnly: true,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'modifiedAt',
      title: 'Last Modified',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Published', value: 'publish' },
          { title: 'Draft', value: 'draft' },
          { title: 'Private', value: 'private' },
        ],
      },
      initialValue: 'publish',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
        }),
        defineField({
          name: 'wpUrl',
          title: 'Original WordPress URL',
          type: 'url',
        }),
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Body Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'H5', value: 'h5' },
            { title: 'H6', value: 'h6' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Number', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike', value: 'strike-through' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'string',
                    title: 'URL',
                  },
                  {
                    name: 'blank',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: false,
                  },
                  {
                    name: 'isInternal',
                    type: 'boolean',
                    title: 'Is internal link',
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
            {
              name: 'wpUrl',
              type: 'url',
              title: 'Original WordPress URL',
            },
          ],
        },
        {
          type: 'object',
          name: 'embedBlock',
          title: 'Embed Block',
          fields: [
            {
              name: 'html',
              type: 'text',
              title: 'Raw HTML',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'rawHtml',
      title: 'Raw HTML Content (fallback)',
      type: 'text',
      description: 'Original WordPress HTML — kept as backup reference',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoFields',
    }),
    defineField({
      name: 'invisible',
      title: 'Invisible',
      type: 'boolean',
      description: 'Hide from homepage, category pages and search listings — but the post URL remains accessible for indexing.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'featuredImage',
      date: 'publishedAt',
      invisible: 'invisible',
    },
    prepare({ title, media, date, invisible }) {
      return {
        title: invisible ? `[INVISIBLE] ${title}` : title,
        media,
        subtitle: date ? new Date(date).toLocaleDateString() : '',
      }
    },
  },
})
