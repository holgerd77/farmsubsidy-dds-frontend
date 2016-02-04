# farmsubsidy-dds-frontend

Javascript/Angular2 frontend for ``farmsubsidy-dds`` written in ``HTML5``/``ES6``.

Documentation for this and associated repositories can be found at:

* http://farmsubsidy-dds.readthedocs.org

## Installation

### Requirements

Main runtime library dependencies:

* [Angular 2](https://angular.io/)

Main dev library dependencies:

* [Babel](https://babeljs.io/) (transpile to ``ES5``)
* [Browserify](http://browserify.org/) (all JS stuff in one file)
* [Gulp.js](http://gulpjs.com/) (build automation)

``Babel`` specific notes:

- Uses Babel instead of [TypeScript](http://www.typescriptlang.org/)/[Traceur](https://github.com/google/traceur-compiler).
- Supports class/parameter decorators and parameter type annotations with [Babel](https://github.com/babel/babel), [babel-plugin-transform-decorators-legacy](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy) and [babel-plugin-angular2-annotations](https://github.com/shuhei/babel-plugin-angular2-annotations).
  - **Parameter decorator is not supported because the syntax is not supported by Babel's parser.**

Stub/skeleton for app layout taken from:

* https://github.com/shuhei/babel-angular2-app

### Installation/Build/Preview

Installation with:

```
npm install
```

Build once:

```
npm run build
```

Watch files and rebuild (uses ``http-server`` package):

```
http-server public
gulp watch     #Browserify JS files
gulp watch-src #Static files/SASS

```

## Testing

Unit and e2e tests:

```
npm test
```

Unit tests:

```
npm run unit
```

e2e tests:

```
npm run e2e
```

