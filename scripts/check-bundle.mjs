import { readdir, stat } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url))
const MAX_CHUNK_BYTES = 900 * 1024
const MAX_TOTAL_BYTES = 5 * 1024 * 1024
const measuredExtensions = new Set(['.js', '.mjs', '.css'])

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? collectFiles(path) : Promise.resolve([path])
    }),
  )
  return files.flat()
}

function isLazyWorkerAsset(file) {
  // Web Workers / PDF.js workers are fetched on demand, not in the critical path.
  return file.includes('.worker') || file.includes('pdf.worker')
}

const files = (await collectFiles(DIST_DIR)).filter((file) => measuredExtensions.has(extname(file)))
const assets = await Promise.all(
  files.map(async (file) => ({ file, bytes: (await stat(file)).size })),
)
const criticalAssets = assets.filter(({ file }) => !isLazyWorkerAsset(file))
const oversized = criticalAssets.filter(({ bytes }) => bytes > MAX_CHUNK_BYTES)
const totalBytes = criticalAssets.reduce((sum, asset) => sum + asset.bytes, 0)

if (oversized.length || totalBytes > MAX_TOTAL_BYTES) {
  for (const asset of oversized) {
    console.error(
      `Bundle budget exceeded: ${relative(DIST_DIR, asset.file)} is ${(asset.bytes / 1024).toFixed(1)} KiB`,
    )
  }
  if (totalBytes > MAX_TOTAL_BYTES) {
    console.error(
      `Bundle budget exceeded: total assets are ${(totalBytes / 1024 / 1024).toFixed(2)} MiB`,
    )
  }
  process.exitCode = 1
} else {
  console.log(`Bundle budgets passed (${(totalBytes / 1024 / 1024).toFixed(2)} MiB total).`)
}
