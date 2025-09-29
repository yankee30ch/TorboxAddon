import axios from 'axios'
import pRetry from 'p-retry'
import type { TorBoxItem, StreamLink } from './types.js'

const isVideo = (name: string) => /\.(mp4|mkv|mov|webm|avi)$/i.test(name)

export interface TorBoxClient {
  listFolder(folderId: string | number): Promise<TorBoxItem[]>
  getStreamLink(fileId: string): Promise<StreamLink>
  getRootFolderId(): string | number
}

export class MockTorBoxClient implements TorBoxClient {
  private data: TorBoxItem[] = [
    { id: 'root', kind: 'folder', name: 'Mock Root' },
    { id: 'm1', kind: 'file', name: 'Big Buck Bunny (2008).mp4', parentId: 'root', size: 100000000 },
    { id: 'm2', kind: 'file', name: 'Sintel (2010).mp4', parentId: 'root', size: 80000000 }
  ]

  async listFolder(folderId: string | number): Promise<TorBoxItem[]> {
    return this.data.filter(x => (x.parentId ?? 'root') === String(folderId))
  }

  async getStreamLink(fileId: string): Promise<StreamLink> {
    const samples: Record<string, string> = {
      m1: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      m2: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    }
    return { url: samples[fileId] || samples.m1, type: 'mp4' }
  }

  getRootFolderId() { return 'root' }
}

export class RealTorBoxClient implements TorBoxClient {
  private base = process.env.TORBOX_API_BASE || ''
  private token = process.env.TORBOX_API_TOKEN || ''
  private ttl = Number(process.env.TORBOX_STREAM_TTL_SECONDS || 21600)
  private root = process.env.TORBOX_ROOT_FOLDER_ID || '0'

  private http = axios.create({
    baseURL: this.base,
    timeout: 20000,
    headers: { Authorization: `Bearer ${this.token}` }
  })

  getRootFolderId() { return this.root }

  async listFolder(folderId: string | number): Promise<TorBoxItem[]> {
    // TODO: Replace with real TorBox endpoint to list items in a folder
    // const { data } = await this.http.get(`/v1/files`, { params: { parentId: folderId } })
    // return data.items.map((x: any) => ({
    //   id: String(x.id),
    //   kind: x.type === 'folder' ? 'folder' : 'file',
    //   name: x.name,
    //   size: x.size,
    //   mime: x.mime,
    //   ext: x.extension,
    //   parentId: String(folderId)
    // }))
    throw new Error('RealTorBoxClient.listFolder not implemented – fill in TorBox API call')
  }

  async getStreamLink(fileId: string): Promise<StreamLink> {
    // TODO: Replace with real TorBox endpoint to create/resolve a streaming URL
    // const { data } = await this.http.post(`/v1/files/${fileId}/links`, { ttl: this.ttl })
    // return { url: data.url, type: data.kind === 'hls' ? 'hls' : 'url', ttlSeconds: this.ttl }
    throw new Error('RealTorBoxClient.getStreamLink not implemented – fill in TorBox API call')
  }
}

export function getClient(): TorBoxClient {
  if (process.env.TORBOX_ENABLED === 'true') return new RealTorBoxClient()
  return new MockTorBoxClient()
}

export { isVideo }
