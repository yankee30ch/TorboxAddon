import type { TorBoxItem as CloudItem } from './types.js'
import { getAllClients } from './providers.js'
import { isVideo } from './torbox.js'
import { getImdbArtForName } from './imdb.js'

export async function buildCatalog() {
  const clients = getAllClients()
  const metas: any[] = []

  for (const c of clients) {
    const root = c.getRootFolderId()
    const items = await c.listFolder(root)

    const files: CloudItem[] = []
    for (const item of items) {
      if (item.kind === 'file' && isVideo(item.name)) files.push(item)
      if (item.kind === 'folder') {
        const sub = await c.listFolder(item.id)
        for (const s of sub) if (s.kind === 'file' && isVideo(s.name)) files.push(s)
      }
    }

    for (const f of files) {
      const meta: any = {
        id: `${c.prefix}:${f.id}`,
        type: 'movie',
        name: f.name.replace(/\.[^.]+$/, ''),
        poster: 'https://i.imgur.com/2J0Z4G9.png',
        posterShape: 'regular',
        background: 'https://i.imgur.com/8bNQb0y.jpeg'
      }

      try {
        const art = await getImdbArtForName(meta.name)
        if (art.poster) meta.poster = art.poster
        if (art.background) meta.background = art.background
      } catch {}

      metas.push(meta)
    }
  }

  return metas
}
