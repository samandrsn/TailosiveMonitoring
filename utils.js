const path = require('path')
const fetch = require('node-fetch')

const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-adapter-node-websql'))
const itemsDB = new PouchDB('items.db', { adapter: 'websql' })

const dataDir = path.resolve(`${process.cwd()}${path.sep}views`)

const renderTemplate = (res, req, template, data = {}) => {
  const baseData = {
    path: req.path
  }
  res.render(path.resolve(`${dataDir}${path.sep}${template}`), Object.assign(baseData, data))
}

const secured = (req, res, next) => {
  if (req.isAuthenticated()) return next() 
  req.session.returnTo = req.originalUrl || req.url
  return res.redirect('/account/login')
}

const getItems = async () => {
  let result
  const getDB = await itemsDB.get('items').catch(error => {
    if (error.name === 'not_found') return undefined
    return undefined
  })
  if (!getDB || !getDB.nextUpdate || new Date(getDB.nextUpdate) < new Date() || !getDB.data) {
    const fetchItems = await fetch('https://tailosive.innatical.com/items')
      .then(res => res.json())
      .catch(error => {
        result = undefined
        return undefined
      })
    if (getDB && getDB._rev) await itemsDB.put({ _id: 'items', _rev: getDB._rev,  nextUpdate: new Date(Date.now() + 5 * 60000), data: fetchItems }, { force: true })
      .then(() => {
        result = fetchItems
      })
      .catch(error => {
        result = undefined
        return undefined
      })
    else await itemsDB.put({ _id: 'items', nextUpdate: new Date(Date.now() + 5 * 60000), data: fetchItems }, { force: true })
      .then(() => {
        result = fetchItems
      })
      .catch(error => {
        result = undefined
        return undefined
      })
    return result
  } else {
    return getDB.data
  }
}

module.exports = {
  renderTemplate,
  secured,
  getItems
}