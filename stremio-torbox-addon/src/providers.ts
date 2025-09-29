import { getClient as getTorBoxClient } from './torbox.js'
import { getClient as getPremiumizeClient } from './premiumize.js'

export type ProviderKey = 'torbox' | 'pmz'

export interface CloudClient {
  key: ProviderKey
  label: string
  prefix: string
  listFolder: (folderId: string | number) => Promise<any[]>
  getStreamLink: (fileId: string) => Promise<{ url: string, type?: 'url' | 'hls' | 'mp4', ttlSeconds?: number }>
  getRootFolderId: () => string | number
}

export function getAllClients(): CloudClient[] {
  const clients: CloudClient[] = []

  if (process.env.TORBOX_ENABLED === 'true' || process.env.TORBOX_ENABLED === '1' || process.env.NODE_ENV === 'development') {
    const c = getTorBoxClient() as any
    clients.push({
      key: 'torbox',
      label: 'TorBox',
      prefix: 'torbox',
      listFolder: c.listFolder.bind(c),
      getStreamLink: c.getStreamLink.bind(c),
      getRootFolderId: c.getRootFolderId.bind(c)
    })
  }

  if (process.env.PREMIUMIZE_ENABLED === 'true' || process.env.PREMIUMIZE_ENABLED === '1') {
    const c = getPremiumizeClient() as any
    clients.push({
      key: 'pmz',
      label: 'Premiumize',
      prefix: 'pmz',
      listFolder: c.listFolder.bind(c),
      getStreamLink: c.getStreamLink.bind(c),
      getRootFolderId: c.getRootFolderId.bind(c)
    })
  }

  return clients
}
