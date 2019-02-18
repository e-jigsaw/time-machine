const {writeFileSync, readdirSync, readFileSync} = require('fs')
const moment = require('moment')

const prefix = '../../e-jigsaw/web/data'
const flat = arr => arr.reduce((prv, cur) => prv.concat(cur), [])

const years = readdirSync(prefix)
const months = years.map(year => [year, readdirSync(`${prefix}/${year}`)])
const articles = flat(flat(
  months.map(([year, months]) => months.map(month => JSON.parse(readFileSync(`${prefix}/${year}/${month}/index.json`).toString())))
))

const pages = articles.map(article => {
  const {url, description, label, createdAt} = article
  const created = moment(createdAt)
  const updated = moment(createdAt)
  const title = `${article.title.slice(0, 100)} - github.com/e-jigsaw/web`
  return {
    title,
    created: created.unix(),
    updated: updated.unix(),
    lines: [
      title,
      `[${article.title} ${url}]`,
      `${description}`,
      '',
      label.split(',').map(l => `[${l}]`).join(' '),
      '',
      `#${created.format('YYYYMMDD')} #${created.format('MMDD')}`
    ]
  }
})

writeFileSync('./tmp/tmp.json', JSON.stringify({ pages }))
