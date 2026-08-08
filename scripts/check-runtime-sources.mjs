import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const roots = ['website/src', 'admin/src', 'backend/api']
const violations = []
const rules = [
  {
    name: 'Supabase runtime dependency',
    pattern: /(?:@supabase|supabase-js|VITE_SUPABASE|createClient\s*\()/i,
  },
  {
    name: 'browser-authoritative operational storage',
    pattern: /\b(?:localStorage|sessionStorage)\s*\./,
  },
  {
    name: 'synthetic operational records',
    pattern: /\b(?:buildSeed|seeded|synthetic|mockData|demoData)\b/i,
  },
  { name: 'generated placeholder identities', pattern: /@example\.org|`Donor \$\{/i },
]

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) await walk(fullPath)
    else if (/\.(?:ts|tsx)$/.test(entry.name) && !/\.test\.(?:ts|tsx)$/.test(entry.name)) {
      const source = await readFile(fullPath, 'utf8')
      for (const rule of rules) {
        const match = rule.pattern.exec(source)
        if (match) {
          const line = source.slice(0, match.index).split('\n').length
          violations.push(`${fullPath}:${line}: ${rule.name}`)
        }
      }
    }
  }
}

for (const root of roots) await walk(root)

if (violations.length) {
  console.error(violations.join('\n'))
  process.exit(1)
}
console.log('Runtime source scan passed: no mock operational stores or Supabase clients found.')
