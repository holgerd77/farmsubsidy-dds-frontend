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

import {API} from './api';

$(document).ready(function() {
  let api = new API();
  api.loadData();
});
