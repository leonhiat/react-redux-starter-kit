const fs     = require('fs'),
      koa    = require('koa'),
      config = require('../config'),
      router = require('../dist/server'),
      React  = require('react'),
      serve  = require('koa-static');

const app = koa();

// ------------------------------------
// Response Time Header and Logging
// ------------------------------------
app.use(require('./middleware/response-time'));
app.use(require('./middleware/logger'));

// ------------------------------------
// View Rendering
// ------------------------------------
// TODO: this is... not awesome. Figure out a better way without having to
// insert dummy placeholders in the template.
const template = fs.readFileSync(config.inDist('client/index.html'), 'utf-8')
  .replace('<div id="mount"></div>', '<div id="mount">${render}</div>')

function renderMarkupInTemplate (markup) {
  return template.replace('${render}', markup);
}

// TODO: shouldn't have to do this favicon check
// TODO: gzipping
// TODO: caching
app.use(function *reactRenderer (next) {
  if (!/.(js|css|ico)/.test(this.request.url)) {
    router(this.request, function (rendered) {
      this.body = renderMarkupInTemplate(rendered);
    }.bind(this));
  }
  yield next;
});

// ------------------------------------
// Static File Middleware
// ------------------------------------
app.use(serve(config.inDist('client')));

module.exports = app;
