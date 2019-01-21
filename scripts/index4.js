const { readdirSync, readFileSync, writeFileSync } = require('fs')
const md2sb = require('md2sb').default
const moment = require('moment')

const re = /\[\*\*\*\*\s\[(.*)/

const main = async () => {
  const ys = readdirSync('./tmp/posts2')
  const ms = ys.map(y => [y, readdirSync(`./tmp/posts2/${y}`)])
  const ds = ms.map(([y, ms]) => [y, ms.map(m => [m, readdirSync(`./tmp/posts2/${y}/${m}`)])])
  const ps = ds.map(
    ([y, ms]) => [
      y, ms.map(
        ([m, ds]) => [
          m, ds.map(
            d => [
              d, readdirSync(`./tmp/posts2/${y}/${m}/${d}`)
            ])])])
  let posts = []
  ps.map(
    ([y, ms]) =>
      ms.map(
        ([m, ds]) =>
          ds.map(
            ([d, ps]) =>
              ps.map(
                p => posts.push([new Date(`${y}/${m}/${d}`), readFileSync(`./tmp/posts2/${y}/${m}/${d}/${p}`).toString(), `${y}/${m}/${d}/${p}`])
              )
          )
      )
  )
  posts = await Promise.all(posts.map(async ([dat, content, path]) => {
    const sb = await md2sb(content)
    const d = moment(dat)
    const lines = sb.split('\n')
    const title = `${re.exec(lines[0].split(' /')[0])[1]} - dev.jgs.me`
    return {
      title,
      created: d.unix(),
      updated: d.unix(),
      lines: [title].concat(lines.slice(1)).concat([
        `[* original: http://dev.jgs.me/${path.replace('.md', '')}]`,
        `#${d.format('MMDD')}`
      ])
    }
  }))
  writeFileSync('./tmp/tmp.json', JSON.stringify({pages: posts}))
}

main()
