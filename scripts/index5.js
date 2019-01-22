const {writeFileSync} = require('fs')
const moment = require('moment')
const {parse, toScrapbox} = require('@jigsaw/html2sb-compiler')
const articles = require('../tmp/articles.json')

const pages = articles.map(article => {
  const {created_at, published_at, processed_html, path, cached_tag_list} = article
  const created = moment(created_at)
  const updated = moment(published_at)
  const title = `${article.title} - dev.to/jgs`
  const parsed = parse(processed_html.replace(/\<p\>/ig, '<div>').replace(/\<\/p\>/ig, '</div>'))
  const candidate = toScrapbox(parsed[0])
  return {
    title,
    created: created.unix(),
    updated: updated.unix(),
    lines: [title].concat(candidate.lines).concat([`[* original: https://dev.to${path}]`, `#${updated.format('MMDD')}`]).concat(cached_tag_list.split(', ').map(tag => `#${tag}`))
  }
})

writeFileSync('./tmp/tmp.json', JSON.stringify({ pages }))
