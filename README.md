# atom-require-opener
![](http://img.shields.io/badge/stability-stable-green.svg?style=flat)

Atom plugin for selecting one or more require statements and
opening up their documentation on nodejs.org/GitHub/npm or
opening their target files.

![atom-require-opener](http://i.imgur.com/OcKso1Z.gif)

## Usage

Open the Command Palette, and run one of the following commands:

* Require Opener: Open Selection on Npm
* Require Opener: Open Selection on Github
* Require Opener: Open Selection in Atom

Node.js core modules will be opened on nodejs.org's API
documentation for the two former cases, and ignored in
the latter case.

## Keybindings

To add your own keybindings for this package, simply open your
keymap file and include something along the following lines:

``` coffee
'.workspace':
  'cmd-ctrl-shift-alt-g': 'require-opener:open-selections-on-npm'
  'cmd-ctrl-shift-alt-n': 'require-opener:open-selections-on-github'
  'cmd-ctrl-shift-alt-o': 'require-opener:open-selections-in-atom'
```

## License

MIT. See [LICENSE.md](http://github.com/hughsk/atom-require-opener/blob/master/LICENSE.md) for details.
