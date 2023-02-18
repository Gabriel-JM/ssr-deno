import { XMLBuilder, XMLParser } from 'fast-xml-parser'

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  allowBooleanAttributes: true,
  attributeNamePrefix: '_',
  htmlEntities: false
})
const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '_'
})

const eventsMap = new Map()
const eventListenerMap = new Map()
const mountsSet = new Set()

export function html(text: TemplateStringsArray | string[], ...values: unknown[]) {
  const fullText = text.reduce((acc, string, index) => {
    let value = values[index] ?? ''

    if (typeof value === 'function') {
      eventListenerMap.set(`ev-${index}`, value)
      value = `"ev-${index}"`
    }

    return (acc + string + value).trim()
  }, '').trim()

  const xmlTree = getAttributeValues(xmlParser.parse(fullText))

  const fullHTML = xmlBuilder.build(xmlTree)

  return fullHTML
}

type ElementRepresentation = Record<string, Record<string, string> | string>

const eventRegex = /^_on([\w-]+)$/

function getAttributeValues(el: ElementRepresentation) {
  for (const [key, value] of Object.entries(el)) {
    if (typeof value === 'object') {
      getAttributeValues(value)
      continue
    }

    const match = key.match(eventRegex)
    if (match) {
      const eventName = match[1]
      const elHash = getRandomHash()
      Reflect.set(el, `_h`, elHash)
      Reflect.deleteProperty(el, `_on${eventName}`)
      eventsMap.set(elHash, { [eventName]: value })
    }
  }

  return el
}

export function getRandomHash() {
  return crypto.getRandomValues(new Uint8Array(2))
    .reduce((acc, value) => acc + value.toString(16), '')
}

export function genJSEvents() {
  const eventsJS = [...eventsMap.entries()].reduce((acc, value) => {
    const [hash, events] = value

    const eventListeners = Object
      .entries(events)
      .reduce((acc, [event, listenerId]) => {
        const listener = eventListenerMap.get(listenerId)

        return acc + `.addEventListener('${event.toLowerCase()}', ${listener})`
      }, '')
    
    return acc + `
      const $el${hash} = document.querySelector('[h="${hash}"]')
        
      $el${hash}${eventListeners}
      
      $el${hash}.removeAttribute('h')
    `
  }, '').trim()

  const mounts = ([...mountsSet]).reduce((acc, value) => {
    const { effect, params } = value as { effect: Function, params: unknown[] }
    return acc + `;(${effect})(${params.join(',')})`
  }, '') as string

  return eventsJS + mounts
}

export function onMount(effect: Function, ...params: unknown[]) {
  mountsSet.add({ effect, params: params.map(param => JSON.stringify(param)) })
}
