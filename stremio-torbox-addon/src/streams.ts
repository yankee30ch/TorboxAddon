import { getAllClients } from './providers.js'

const registry = (() => {
  const map = new Map<string, ReturnType<typeof getAllClients>[number]>()
  for (const c of getAllClients()) map.set(c.prefix, c)
  return map
})()

export async function resolveStream(id: string) {
  const [prefix, fileId] = id.split(':')
  const client = registry.get(prefix)
  if (!client) throw new Error('Unknown provider in id: ' + prefix)

  const link = await client.getStreamLink(fileId)

  return [{
    name: process.env.ADDON_NAME || (prefix === 'pmz' ? 'Premiumize' : 'TorBox'),
    description: prefix === 'pmz' ? 'From your Premiumize cloud' : 'From your TorBox cloud',
    url: link.url,
    behaviorHints: { notWebReady: false }
  }]
}
