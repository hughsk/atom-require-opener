exports.activate = activate

function activate() {
  atom.workspaceView.command('require-opener:open-selections-on-npm', open(true))
  atom.workspaceView.command('require-opener:open-selections-on-github', open(false))
}

function open(npm) {
  return function() {
    const selected = require('atom-selected-requires')().map(base)
    const relative = require('relative-require-regex')
    const core     = require('resolve/lib/core.json')
    const opener   = require('opener')
    const url      = require('url')

    selected.filter(function(name) {
      return core.indexOf(name) !== -1
    }).forEach(function(name) {
      opener(
        url.resolve('https://nodejs.org/api/', name + '.html')
      )
    })

    selected.filter(function(name) {
      return core.indexOf(name) === -1
         && !relative().test(name)
    }).forEach(function(name) {
      opener(npm
        ? url.resolve('https://npmjs.com/package/', name)
        : url.resolve('http://ghub.io/', name)
      )
    })
  }
}

function base(dir) {
  return dir.split('/')[0]
}
