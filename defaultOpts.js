module.exports = {
  react: {
    default: 'React',
    Component: true,
  },
  'react-dom': {
    render: true,
  },
  'mobx-react': `import { observer } from 'mobx-react'`,
  mobx: {
    observable: true,
  },
  firebase: {
    '*': 'firebase',
  },
  'html-webpack-plugin': 'Html',
  $remove: ['rollup-plugin-', '-loader'],
  $space: false,
  $common: false,
  $yarn: false,
  $trailing: false,
  $dec: 'var',
  $quotes: "'",
}

