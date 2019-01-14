const {readFileSync, writeFileSync} = require('fs')
const {xml2json} = require('xml-js')
const {parse, toScrapbox} = require('@jigsaw/html2sb-compiler')
const moment = require('moment')

const xml = readFileSync('./tmp/blog-01-03-2019.xml').toString()
const x = JSON.parse(xml2json(xml))
const pages = x.elements[1].elements.filter(el => el.name === 'entry').slice(58).map(entry => {
  if (entry.elements.filter(el => el.name === 'author')[0].elements.filter(el => el.name === 'name')[0].elements[0].text !== 'Takaya Kobayashi') {
    return null
  }
  if (entry.elements.filter(el => el.name === 'content')[0].elements === undefined) {
    return null
  }
  const parsed = parse(entry.elements.filter(el => el.name === 'content')[0].elements[0].text)
  if (parsed.length === 0) {
    return null
  }
  const title = `${entry.elements.filter(el => el.name === 'title')[0].elements[0].text} - e-jigsaw.blogspot.com`
  parsed[0].title = title
  const candidate = toScrapbox(parsed[0])
  candidate.lines = [title].concat(candidate.lines)
  const published = moment(entry.elements.filter(el => el.name === 'published')[0].elements[0].text)
  const updated = moment(entry.elements.filter(el => el.name === 'updated')[0].elements[0].text)
  if (entry.elements.filter(el => el.name === 'link')[2] === undefined) {
    return null
  }
  const url = entry.elements.filter(el => el.name === 'link')[2].attributes.href
  candidate.lines.push(`[* original: ${url}]`)
  candidate.lines.push(`#${published.format('MMDD')}`)
  candidate.created = published.unix()
  candidate.updated = updated.unix()
  return candidate
})

writeFileSync('./tmp/tmp.json', JSON.stringify({ pages: pages.filter(page => page !== null) }))
