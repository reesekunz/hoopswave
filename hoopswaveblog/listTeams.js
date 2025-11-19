const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'x053pg4s',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01'
})

async function listTeams() {
  try {
    console.log('Fetching teams from Sanity CMS...')

    const teams = await client.fetch(`*[_type == "team"] {
      name,
      slug,
      city,
      abbreviation,
      league
    } | order(name asc)`)

    console.log('Teams in database:')
    teams.forEach(team => {
      console.log(`- ${team.name} (${team.city}) - ${team.abbreviation}`)
    })

  } catch (error) {
    console.error('❌ Error fetching teams:', error.message)
  }
}

listTeams()