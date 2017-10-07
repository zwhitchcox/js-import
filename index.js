#!/usr/bin/env node
const fs = require('fs-extra')

module.exports = 
  {
  default: jsImport,
  buildImportLine,
  buildCommonLine,
}


async function jsImport(opts) {
  await fs.readFile(opts.file, 'utf8', function (err,data) {
    if (err) return console.log(err)
    const lines = data.split('\n')
    const idx = lines.findIndex(line => !/^('use strict'|import)/.test(line))
    const newline = opts.$common ? buildCommonLine(opts.npmmodule, opts) :
      buildImportLine(opts.npmmodule, opts)
    lines.splice(idx, 0, newline)
    if (/\s*/.test(lines[idx+1])) lines.splice(idx+1, 0, '')
    console.log(lines.join('\n'))
  })
}

function buildImportLine(name, opts) {
  const { keys }= Object
  const imports = opts[name] || { default: true }
  if (typeof imports === 'string') return imports
  let importLine = 'import '
  if (imports.default) {
    if (typeof imports.default === 'string') importLine += imports.default
    else importLine += normalizeName(name, opts.$remove)

    if (keys(imports).length !== 1) importLine += ','
    importLine += ' '
  }
  if (imports['*']) {
    importLine += '* as '
    if (typeof imports['*'] === 'string') importLine += imports['*']
    else importLine += normalizeName(name, opts.$remove)

    if (keys(imports).length !== 1) importLine += ', '
    importLine += ' '
  }
  const namedimports = Object.keys(imports).filter(key => !/^(\*|default)$/.test(key))
  const space = opts.$space ? '' : ' '
  if (namedimports.length) importLine += `{${space}`
  let idx = 0
  namedimports.forEach(namedimport => {
    if (typeof imports[namedimport] === 'string') {
      importLine += `${namedimport} as ${imports[namedimport]}`
    } else {
      importLine += namedimport
    }
    const isLast = ++idx === namedimports.length
    if (opts.$trailing || !isLast) importLine += ','
    if (!isLast) importLine+= ' '
  })
  if (namedimports.length) importLine += `${space}} `
  importLine += `from ${opts.$quote}${name}${opts.$quote}${opts.$semi}`
  return importLine
}

function buildCommonLine(name, opts) {
  const { keys }= Object
  const imports = opts[name] || { default: true }
  if (typeof imports === 'string') return imports
  let importLine = `${opts.$dec} `
  const varname = (typeof imports.default === 'string') ?
    imports.default : normalizeName(name, opts.$remove)
  importLine += `${varname} = require('${name})'${opts.$semi}\n`
  const space = opts.$space ? '' : ' '
  const namedimports = Object.keys(imports).filter(key => !/^(\*|default)$/.test(key))
  namedimports.forEach(namedimport =>
    console.log('named', namedimport) || 
    (importLine +=
    typeof imports[namedimport] === 'string' ?
    `${opts.$dec} ${imports[namedimport]} = ${varname}.${namedimport}${opts.$semi}\n` :
    `${opts.$dec} ${namedimport} = ${varname}.${namedimport}${opts.$semi}\n`)
  )
  return importLine
}

function normalizeName(name, remove) {
  const removed = remove.reduce((curName, toRemove) => curName.replace(toRemove), name)
  return snakeToCamel(removed)
}

function snakeToCamel(s){
  return s.replace(/(\-\w)/g, m => m[1].toUpperCase())
}


