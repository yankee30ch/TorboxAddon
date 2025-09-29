import axios from 'axios'
import pRetry from 'p-retry'

export interface ImdbArt { poster?: string; background?: string }

const OMDB = 'https://www.omdbapi.com/'
const KEY = process.env.OMDB_API_KEY || ''
const ENABLED = process.env.IMDB_ENABLED === 'true'
const TTL_MIN = Number(process.env.IMDB_CACHE_MINUTES || 43200)

const cache = new Map<string, { at: number; art: ImdbArt }>()

function nowMin() { return Math.floor(Date.now() / 60000) }
function keyOf(name: string) { return name.toLowerCase().trim() }

function parseTitleYear(raw: string): { title: string; year?: string; imdb?: string } {
  const tt = raw.match(/tt\d{7,9}/i)?.[0]
  if (tt) return { title: raw, imdb: tt.toLowerCase() }

  const cleaned = raw
    .replace(/[._]/g, ' ')
    .replace(/\b(1080p|2160p|720p|x264|x265|hdr|hevc|webrip|bluray|dvdrip|remux|proper|repack)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const m = cleaned.match(/\((\d{4})\)$/)
  const year = m ? m[1] : cleaned.match(/\b(19\d{2}|20\d{2})\b/)?.[1]
  let title = cleaned
  if (m) title = cleaned.replace(/\s*\(\d{4}\)$/, '')
  return { title: title.trim(), year }
}

async function omdb(params: Record<string, any>) {
  if (!KEY) throw new Error('OMDB_API_KEY missing')
  const { data } = await axios.get(OMDB, { params: { apikey: KEY, ...params }, timeout: 10000 })
  if (!data || data.Response === 'False') throw new Error(data?.Error || 'OMDb: not found')
  return data
}

export async function getImdbArtForName(rawName: string) {
  if (!ENABLED || !KEY) return {}
  const ck = keyOf(rawName)
  const hit = cache.get(ck)
  if (hit && nowMin() - hit.at < TTL_MIN) return hit.art

  const { title, year, imdb } = parseTitleYear(rawName)

  const data = await pRetry(async () => {
    if (imdb) return omdb({ i: imdb })
    try { return await omdb({ t: title, y: year }) } catch {}
    return omdb({ t: title })
  }, { retries: 2 })

  const poster = data.Poster && data.Poster != 'N/A' && String(data.Poster) || undefined
  const art = { poster, background: poster }
  cache.set(ck, { at: nowMin(), art })
  return art
}
