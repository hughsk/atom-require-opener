var messages

exports.activate = activate

function activate() {
  const Messages = require('atom-message-panel').MessagePanelView

  messages = messages || new Messages({
    title: 'Require Opener'
  })

  atom.workspaceView.command('require-opener:open-selections-on-npm', open('npm'))
  atom.workspaceView.command('require-opener:open-selections-on-github', open('github'))
  atom.workspaceView.command('require-opener:open-selections-in-atom', open('file'))
}

function open(mode) {
  return function() {
    const editor   = atom.workspace.getActiveEditor()
    const filename = editor.getPath()

    messages.clear()

    const Selected = require('atom-selected-requires')
    const relative = require('relative-require-regex')
    const core     = require('resolve/lib/core.json')
    const resolve  = require('resolve')
    const opener   = require('opener')
    const path     = require('path')
    const url      = require('url')

    try {
      var selected = Selected(editor)
    } catch(e) {
      return error(e)
    }

    const cores = selected.filter(function(name) {
      return core.indexOf(name) !== -1
    })

    const local = selected.filter(function(name) {
      return relative().test(name)
    })

    const remote = selected.filter(function(name) {
      return cores.indexOf(name) === -1
          && local.indexOf(name) === -1
    })

    //
    // Opening files in Atom:
    //
    if (mode === 'file') {
      return local.concat(remote).forEach(function(name) {
        var dirname = path.dirname(filename)

        resolve(name, { basedir: dirname }, function(err, result) {
          if (err) return error(err)
          atom.workspace.open(result)
        })
      })
    }

    //
    // Opening files on GitHub/npm/nodejs.org:
    //
    cores.map(base).forEach(function(name) {
      opener(
        url.resolve('https://nodejs.org/api/', name + '.html')
      )
    })

    remote.map(base).forEach(function(name) {
      opener(mode === 'npm'
        ? url.resolve('https://npmjs.com/package/', name)
        : url.resolve('http://ghub.io/', name)
      )
    })
  }
}

function base(dir) {
  return dir.split('/')[0]
}

function error(err) {
  const Message = require('atom-message-panel').PlainMessageView
  const Lined   = require('atom-message-panel').LineMessageView

  messages.attach()

  if (!err.loc) {
    messages.add(new Message({
      message: err.message,
      className: 'require-opener-error'
    }))
  } else {
    messages.add(new Lined({
      message: err.message,
      className: 'require-opener-error',
      line: err.loc.line
    }))
  }
}
