const {readdirSync, readFileSync, writeFileSync} = require('fs')
const {JSDOM} = require('jsdom')
const {parse, toScrapbox} = require('@jigsaw/html2sb-compiler')
const moment = require('moment')

const posts = readdirSync('./tmp/posts/html')
const pages = posts.map(post => {
  const file = readFileSync(`./tmp/posts/html/${post}`).toString()
  const dom = new JSDOM(file)
  const parsed = parse(dom.window.document.body.innerHTML.replace(/<p>/g, '<div>').replace(/<\/p>/g, '</div>'))
  const title = dom.window.document.querySelector('h1').innerHTML
  parsed[0].title = title
  const candidate = toScrapbox(parsed[0])
  candidate.lines = candidate.lines.slice(2)
  candidate.lines = [title].concat(candidate.lines)
  const mom = moment(candidate.lines.slice(-1)[0], 'MMMM Do, YYYY h:ma')
  const timestamp = mom.unix()
  candidate.lines.push(`[* original: http://diary.jgs.me/post/${post.split('.')[0]}]`)
  candidate.lines.push(`#${mom.format('MMDD')}`)
  candidate.created = timestamp
  candidate.updated = timestamp
  return candidate
})
writeFileSync('./tmp/tmp.json', JSON.stringify({ pages }))
