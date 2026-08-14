import { cpSync, existsSync, mkdirSync } from 'fs'

for (const dir of ['js', 'data', 'img']) {
  if (!existsSync(dir)) {
    console.warn('skip missing', dir)
    continue
  }
  cpSync(dir, `dist/${dir}`, { recursive: true })
  console.log('copied', dir, '-> dist/' + dir)
}
