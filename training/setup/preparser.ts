import { definePreparserSetup } from '@slidev/types'

export default definePreparserSetup(() => {
  return [
    {
      transformRawLines(lines) {
        let i = 0
        while (i < lines.length) {
          const l = lines[i]
          if (l.match(/^@cover/i)) {
            lines.splice(i, 1,
              '---',
              'layout: cover',
              '---',
              '')
            continue
          }
          i++
        }
      },
    }
  ]
})