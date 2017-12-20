var express = require('express');
var wagner = require('wagner-core');
var cors = require('cors');

require('./models')(wagner);
require('./dependencies')(wagner);

var app = express();

app.set('port', (process.env.PORT || 3000));

app.use(cors());

app.use(require('morgan')());

wagner.invoke(require('./auth'), { app: app });

app.use('/api/v1', require('./api')(wagner));

// Serve up static HTML pages from the file system.
// For instance, '/6-examples/hello-http.html' in
// the browser will show the '../6-examples/hello-http.html'
// file.
app.use(express.static('app', { maxAge: 4 * 60 * 60 * 1000 /* 2hrs */ }));

app.listen(app.get('port'), function() {
  console.log('MEAN STACK Retail app is running on port', app.get('port'));
});