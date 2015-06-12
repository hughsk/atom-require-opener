var messages

exports.activate = activate

function activate() {
  const Messages = require('atom-message-panel').MessagePanelView

  messages = messages || new Messages({
    title: 'Require Opener'
  })

  atom.commands.add('atom-text-editor', 'require-opener:open-selections-on-npm', open('npm'))
  atom.commands.add('atom-text-editor', 'require-opener:open-selections-on-github', open('github'))
  atom.commands.add('atom-text-editor', 'require-opener:open-selections-in-atom', open('file'))
  atom.commands.add('atom-text-editor', 'require-opener:open-selections-readmes', open('readme'))
}

function open(mode) {
  return function() {
    const editor   = atom.workspace.getActiveTextEditor()
    const filename = editor.getPath()

    const Selected = require('atom-selected-requires')
    const relative = require('relative-require-regex')
    const core     = require('resolve/lib/core.json')
    const resolve  = require('resolve')
    const opener   = require('opener')
    const path     = require('path')
    const glob     = require('glob')
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
    // Locate and open package READMEs
    //
    if (mode === 'readme') {
      return remote.forEach(function(name) {
        var dirname = path.dirname(filename)
        var pkgFile = base(name) + '/package.json'

        resolve(pkgFile, { basedir: dirname }, function(err, pkgFile) {
          if (err) return error(err)

          var pkgRoot = path.dirname(pkgFile)

          // TODO: extract this into a module that's consistent
          // with npm's own readme identification, so that npm
          // can use it too:
          // https://github.com/npm/read-package-json/blob/master/read-json.js#L193-L208
          glob('{README,README.*}', {
            cwd: pkgRoot,
            nocase: true,
            mark: true
          }, function(err, readmes) {
            if (err) return error(err)
            if (!readmes.length) return error(
              new Error('No READMEs found for ' + JSON.stringify(name))
            )

            var readme = readmes.sort(function(a, b) {
              if (path.basename(a) === '.md') return +1
              if (path.basename(b) === '.md') return -1
              if (path.basename(a) === '.markdown') return +1
              if (path.basename(b) === '.markdown') return -1
              return 0
            }).shift()


            readme = path.join(pkgRoot, readme)

            var options = {
              searchAllPlanes: true,
              split: atom.config.get('markdown-preview.openPreviewInSplitPane')
                ? 'right'
                : null
            }

            atom.workspace.open('markdown-preview://' + readme, options)
          })
        })
      })
    }

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
  return dir[0] === '@'
    ? dir.split('/').slice(0, 2).join('/')
    : dir.split('/')[0]
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
