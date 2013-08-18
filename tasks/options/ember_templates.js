module.exports = {
  compile: {
    options: {
      templateName: function(filename) {
        return filename.replace(/app\/templates\//,'').
          replace(/app\/modules\//, '').
          replace(/templates\//, '').
          replace(/\.(hbs|hjs|handlebars)/,'');
      }
    },
    files: {
      "tmp/public/assets/templates.js": "app/**/templates/**/*.{hbs,hjs,handlebars}"
    }
  }
};
