import axios from 'axios'
import type { TorBoxItem as CloudItem, StreamLink } from './types.js'

const isVideo = (name: string) => /\.(mp4|mkv|mov|webm|avi)$/i.test(name)

export interface PremiumizeClient {
  listFolder(folderId: string | number): Promise<CloudItem[]>
  getStreamLink(fileId: string): Promise<StreamLink>
  getRootFolderId(): string | number
}

export class MockPremiumizeClient implements PremiumizeClient {
  private data: CloudItem[] = [
    { id: 'pmzroot', kind: 'folder', name: 'PMZ Root' },
    { id: 'p1', kind: 'file', name: 'Tears of Steel (2012).mp4', parentId: 'pmzroot', size: 120000000 }
  ]

  async listFolder(folderId: string | number): Promise<CloudItem[]> {
    return this.data.filter(x => (x.parentId ?? 'pmzroot') === String(folderId))
  }

  async getStreamLink(fileId: string): Promise<StreamLink> {
    const samples: Record<string, string> = {
      p1: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    }
    return { url: samples[fileId] || samples.p1, type: 'mp4' }
  }

  getRootFolderId() { return 'pmzroot' }
}

export class RealPremiumizeClient implements PremiumizeClient {
  private base = process.env.PREMIUMIZE_API_BASE || 'https://www.premiumize.me/api'
  private token = process.env.PREMIUMIZE_API_TOKEN || ''
  private http = axios.create({
    baseURL: this.base,
    timeout: 20000,
    params: { apikey: this.token }
  })
  private root = process.env.PREMIUMIZE_ROOT_FOLDER_ID || 'root'

  getRootFolderId() { return this.root }

  async listFolder(folderId: string | number): Promise<CloudItem[]> {
    // TODO: Replace with real Premiumize endpoint to list items in a folder
    // const { data } = await this.http.get('/folder/list', { params: { id: folderId } })
    // return data.content.map((x: any) => ({
    //   id: String(x.id),
    //   kind: x.type === 'folder' ? 'folder' : 'file',
    //   name: x.name,
    //   size: x.size,
    //   parentId: String(folderId)
    // }))
    throw new Error('RealPremiumizeClient.listFolder not implemented – fill in Premiumize API call')
  }

  async getStreamLink(fileId: string): Promise<StreamLink> {
    // TODO: Replace with real Premiumize endpoint to obtain a direct/signed stream URL
    // const { data } = await this.http.get('/item/details', { params: { id: fileId } })
    // return { url: data.stream_link, type: 'url' }
    throw new Error('RealPremiumizeClient.getStreamLink not implemented – fill in Premiumize API call')
  }
}

export function getClient(): PremiumizeClient {
  if (process.env.PREMIUMIZE_ENABLED === 'true') return new RealPremiumizeClient()
  return new MockPremiumizeClient()
}
