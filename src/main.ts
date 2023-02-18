import { genJSEvents } from './html-tag-fn.ts'
import { serve } from 'std/http'
import { example } from './example.ts'

const content = await example('My Title 1') + await example('My Title 2')
const jsContent = genJSEvents()

function handler() {
  const htmlText = `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/@picocss/pico@1.*/css/pico.min.css">
        <title>Deno SSR Test</title>
      </head>
      <body>
        ${content}
        <script>
          ${jsContent}
        </script>
      </body>
    </html>
  `
  return new Response(htmlText, {
    status: 200,
    headers: {
      'Content-Type': 'text/html'
    }
  })
}

await serve(handler, { port: 3500 })
