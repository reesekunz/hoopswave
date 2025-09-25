export default {
    name: 'team',
    title: 'Arizona Sports Team',
    type: 'document',
    fields: [
      {
        name: 'name',
        title: 'Team Name',
        type: 'string',
        validation: Rule => Rule.required()
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: {
          source: 'name',
          maxLength: 96,
        },
        validation: Rule => Rule.required()
      },
      {
        name: 'city',
        title: 'City',
        type: 'string',
        validation: Rule => Rule.required()
      },
      {
        name: 'abbreviation',
        title: 'Team Abbreviation',
        type: 'string',
        description: 'e.g., SUNS, DBACKS, CARDS',
        validation: Rule => Rule.required().max(6)
      },
      {
        name: 'league',
        title: 'League/Sport',
        type: 'string',
        description: 'NBA, MLB, NFL, WNBA, College',
        validation: Rule => Rule.required()
      },
      {
        name: 'primaryColor',
        title: 'Primary Team Color',
        type: 'string',
        description: 'Hex color code for team branding'
      },
      {
        name: 'logo',
        title: 'Team Logo',
        type: 'image',
        options: {
          hotspot: true,
        }
      }
    ]
  }