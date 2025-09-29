import 'dotenv/config'
import express from 'express'
import { addonBuilder } from 'stremio-addon-sdk'
import { buildCatalog } from './catalog.js'
import { resolveStream } from './streams.js'

const PORT = Number(process.env.PORT || 7000)
const BASE = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`
const ADDON_NAME = process.env.ADDON_NAME || 'My Cloud (Mock)'
const ADDON_DESCRIPTION = process.env.ADDON_DESCRIPTION || 'Browse your TorBox/Premiumize cloud in Stremio'

const manifest = {
  id: 'org.example.cloud',
  version: '0.2.0',
  name: ADDON_NAME,
  description: ADDON_DESCRIPTION,
  logo: `${BASE}/logo.png`,
  resources: [ 'catalog', 'stream' ],
  types: [ 'movie', 'series' ],
  idPrefixes: [ 'torbox:', 'pmz:' ],
  catalogs: [{
    type: 'movie',
    id: 'cloud.catalog',
    name: ADDON_NAME,
    extra: [{ name: 'search', isRequired: false }]
  }]
}

const builder = new addonBuilder(manifest as any)

builder.defineCatalogHandler(async () => {
  const metas = await buildCatalog()
  return { metas }
})

builder.defineStreamHandler(async ({ id }) => {
  const streams = await resolveStream(id)
  return { streams }
})

const app = express()

app.get('/logo.png', (_req, res) => {
  res.redirect('https://i.imgur.com/9N4f1eQ.png')
})

const { getInterface } = builder
app.use(getInterface())

app.listen(PORT, () => {
  console.log(`\n${ADDON_NAME} listening on :${PORT}`)
  console.log(`Manifest: ${BASE}/manifest.json`)
})
