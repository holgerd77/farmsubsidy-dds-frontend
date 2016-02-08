/*import 'zone.js/lib/browser/zone-microtask';
import 'reflect-metadata';
import 'babel-polyfill';

import {provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';

import {FarmsubsidyDDSFrontendApp} from './app';

bootstrap(FarmsubsidyDDSFrontendApp, [
  ROUTER_PROVIDERS,
  provide(LocationStrategy, { useClass: HashLocationStrategy })
]);*/

require("file?name=dist/index.html!./index.html");

require("!style!css!sass!./../bower_components/bootstrap/scss/bootstrap.scss");
require("!style!css!sass!./../sass/content.scss");

require("!script!./../bower_components/bootstrap/dist/js/bootstrap.min.js");

import {API} from './api';

