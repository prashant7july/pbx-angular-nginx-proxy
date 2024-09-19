const express = require('express');
const errorHandler = require('express-json-errors');
const cors = require('cors');
const compression = require('compression');
var path = require('path');
const config = require('./config/app.js');
const routes = require('./routes');
const middlewareErrorParser = require('./middleware/ErrorParser');
const middlewarePathLogger = require('./middleware/PathLogger');
const imageController = require('./controllers/uploader.js');
const promptUpload = require('./controllers/promptsUpload.js');
const importExcelController = require('./controllers/importExcel.js');
const invoice_automate = require('./controllers/invoice_automate.js');
const cronPackage = require('./controllers/cron_package.js');
const profileUpload = require('./controllers/profileUpload');
const helmet = require('helmet');
const app = express();

app.options('*', cors());
app.use(cors({ credentials: true, origin: true }));
app.use(compression());
// app.use(helmet());
// app.use(helmet.frameguard({ action: 'deny' }));
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         "script-src": ["'self'", "https://code.jquery.com/jquery-3.2.1.slim.min.js"],
//       },
//     },
//   })
// );
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.status(405).send('Method Not Allowed');
  } else {
    next();
  }
});

const encodeHtml = (req, res, next) => {
  const encodeString = (str) => {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = encodeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      } else if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map(item => (typeof item === 'string' ? encodeString(item) : item));
      }
    }
  };
  if (req.body) {
    sanitizeObject(req.body);
  }
  if (req.query) {
    sanitizeObject(req.query);
  }
  next();
};
app.use(encodeHtml); // Apply the middleware here
app.use(express.json({ type: "application/json" }));
app.use(express.urlencoded({ extended: false }));
app.use(imageController);
app.use(promptUpload);
app.use(importExcelController);
app.use(invoice_automate);
app.use(cronPackage);
app.use(profileUpload);
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.removeHeader('X-Powered-By')
  next();
});
// only on debug mode
if (config.debug) {
  // path logger
  app.use(middlewarePathLogger);
}
// use routes
app.use('/api', routes);
app.use(middlewareErrorParser);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('view engine', 'ejs');
app.use(express.static('app'));
app.use('/*', express.static('app'));
app.use('/temp', express.static(path.join(__dirname, '../temp')));

// Start server
app.listen(config.port, () => {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});
// Expose app
module.exports = app;