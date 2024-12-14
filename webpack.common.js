const path = require('path');

module.exports = {
  entry: {
    app: './js/app.js',
    login: './js/login.js',
    events: './js/events.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/[name].js',
  },
};
