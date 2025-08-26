import { createClient } from '@sanity/client'

export default  createClient ({
    projectId: 'x053pg4s',
    dataset: 'production',
useCdn: true,
apiVersion: "2024-08-24"
})