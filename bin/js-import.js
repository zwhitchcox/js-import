#!/usr/bin/env node
const minimist = require('minimist')
const fs = require('fs-extra')
const jsImport = require('..').default
const defaultOpts = require('../defaultOpts')
const findRoot = require('find-root')
const booleanopts = [
  's', 'space',
  'help', 'h',
  'trailing', 't',
]
const argv = minimist(process.argv.slice(2), {
  string: [
    'remove', 'Remove',
    'options-file',
    'combine-options-file',
    'imports',
    'Imports',
    'quote',
    'dec',
  ],
  alias: {
    o: 'options-file',
    r: 'remove',
    R: 'Remove',
    i: 'imports',
    I: 'Imports',
    q: 'quote',
    c: 'common',
    h: 'help',
    t: 'trailing',
    d: 'dec',
  },
  boolean: [
    's',
    'h',
    't',
    'c',
  ],
})
const npmmodule = argv._[0]
const file = argv._[1]

if(argv._.length !== 2) usage('Must only have module and file')
const argimports = [].concat(argv.I || [], argv.i || [])
  .reduce((imports, import$)=> {
    if (import$.includes(':')) {
      const [name, nameas] = import$.split(':')
      imports[name] = nameas
    } else imports[import$] = true
    return imports
  }, {})

if(argv.I && argv.i)
  usage('Cannot have both --imports and --Imports, as they are conflicting options')
if (argv.R && argv.r)
  usage('Cannot have both --remove and --Remove, as they are conflicting options')
if (argv.o && argv.O)
  usage('Cannot have both --options-file and --Options-file, as they are conflicting options')


function usage(error) {
  if (error) console.error(error)
  console.log(
`
Usage: js-import module file [options] 

Example: import-js react $PWD/mycomponent.js -I default -I Component
  => js-import 

Options:

    -I --Imports               exported functions from module to import
    -i --imports               same as --Imports, except just adds to defaults

    -R --Remove                string to remove from module name,
                               e.g. -R '-loader', css-loader => css
    -r --remove                same as --remove, but combines with
                               defaults (['-loader', 'rollup-plugin-'])

    -y, --yarn                 use yarn, defaults to true

    -O --Options-file          options file to use, see readme
    -o --options-file          same as --Options-file, but combines with
                               default options file see readme

    -c --common                import with commonjs format instead of import
                               from,  defaults to false (like require('module')

    -s --space                 remove space before and after imported modules

    --semi                     include semicolon after lines (defaults to false)

    -q --quote                 \' or \" quotes, defaults to \'

    -d --dec                   for commonjs, use declaration variable to use
                               defaults to var

    -h --help                  show this screen


`)
  if (error) process.exit(1)
}

if (argv.h || argv.help) return usage()

let importoptions;
if (argv.o || argv['options-file'])
  importoptions = require(argv.o || argv['options-file'])

if (argv.o || argv['combine-options-file'])
  importoptions = Object.assign(require(argv.o, defaultOpts))

if(!importoptions) importoptions = defaultOpts
importoptions = Object.assign({}, importoptions, {
  $remove: argv.R || (importoptions.$remove || []).concat(argv.r || []),
  $space: argv.s || importoptions.$space,
  $trailing: argv.t || importoptions.$trailing,
  $common: argv.c || importoptions.$common,
  $quote: argv.q || argv.quote ||importoptions.$quote || "'",
  $semi: argv.semi || importoptions.$semi ? ';' : '',
  $dec: argv.d || importoptions.$dec || 'var',
  [npmmodule]: Object.assign(argv.i ? importoptions[npmmodule] || {} : {}, argimports)
})

jsImport({npmmodule, file, root: findRoot(file),  ...importoptions})
.catch(console.error)
