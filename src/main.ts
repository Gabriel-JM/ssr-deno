import { serve } from 'std/http'
import render from 'nano'

const body = await render(`
  <div>
    <h1>{title}</h1>
    <p>{content}</p>
  </div>
`, {
  title: 'Title Test',
  content: '\
    Lorem ipsum dolor sit amet, consectetur adipiscing elit\
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris \
    nisi ut aliquip ex ea commodo consequat.\
  '
})

function handler() {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html'
    }
  })
}

await serve(handler, { port: 3500 })
