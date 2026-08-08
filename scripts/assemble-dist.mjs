#!/usr/bin/env node
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const out = resolve(root, 'dist')
const websiteDist = resolve(root, 'website/dist')
const adminDist = resolve(root, 'admin/dist')

if (!existsSync(websiteDist)) {
  console.error('Missing website/dist — run website build first')
  process.exit(1)
}
if (!existsSync(adminDist)) {
  console.error('Missing admin/dist — run admin build first')
  process.exit(1)
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
cpSync(websiteDist, out, { recursive: true })
mkdirSync(resolve(out, 'admin'), { recursive: true })
cpSync(adminDist, resolve(out, 'admin'), { recursive: true })
console.log('Assembled dist/ (website + admin/)')
