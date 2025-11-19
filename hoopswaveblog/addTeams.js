/**
 * Script to add Arizona Wildcats and Arizona State Sun Devils teams to Sanity CMS
 *
 * Usage:
 * 1. cd hoopswaveblog
 * 2. node addTeams.js
 */

const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'x053pg4s',
  dataset: 'production',
  useCdn: false, // `false` if you want to ensure fresh data
  apiVersion: '2024-01-01', // use current UTC date - YYYY-MM-DD
  token: process.env.SANITY_TOKEN, // or leave blank for unauthenticated usage
})

const teamsToAdd = [
  {
    _type: 'team',
    name: 'Wildcats',
    slug: {
      _type: 'slug',
      current: 'wildcats'
    },
    city: 'Arizona',
    abbreviation: 'CATS',
    league: 'College',
    primaryColor: '#003366' // U of A Navy
  },
  {
    _type: 'team',
    name: 'Sun Devils',
    slug: {
      _type: 'slug',
      current: 'sun-devils'
    },
    city: 'Arizona State',
    abbreviation: 'ASU',
    league: 'College',
    primaryColor: '#8C1D40' // ASU Maroon
  }
]

async function addTeams() {
  try {
    console.log('Adding teams to Sanity CMS...')

    // Check if teams already exist
    for (const team of teamsToAdd) {
      const existing = await client.fetch(
        `*[_type == "team" && slug.current == $slug][0]`,
        { slug: team.slug.current }
      )

      if (existing) {
        console.log(`Team ${team.name} already exists, skipping...`)
        continue
      }

      const result = await client.create(team)
      console.log(`✅ Added ${team.name}:`, result._id)
    }

    console.log('✅ All teams processed successfully!')

  } catch (error) {
    console.error('❌ Error adding teams:', error)
  }
}

addTeams()