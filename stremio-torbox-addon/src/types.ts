export type FileKind = 'file' | 'folder'

export interface TorBoxItem {
  id: string
  kind: FileKind
  name: string
  size?: number
  mime?: string
  ext?: string
  parentId?: string
  // optional video metadata
  season?: number
  episode?: number
}

export interface StreamLink {
  url: string
  type?: 'url' | 'hls' | 'mp4'
  ttlSeconds?: number
}
