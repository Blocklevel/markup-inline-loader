var PATTERN = /<(svg|img|math)\s+(.*?)src="(.*?)"(.*?)\/?>/gi;
var uniqueSVGTagId = require('./unique-tag-id')
var fs = require('fs');
var path = require('path');
var SVGO = require('svgo');

var svgo = new SVGO({
  plugins: [
    {
      removeTitle: true
    }
  ]
});

var parseAlias = function (fileName, mapping, prefix) {
  var result;

  Object.keys(mapping).forEach(function(key) {
    var needle = '~' + key + '/';
    var alias = mapping[key];
    var found = fileName.indexOf(needle) >= 0;

    if (found && alias) {
      result = fileName.replace(needle, alias + '/');
    }

  });

  if (!result) {
    result = path.join(prefix, fileName);
  }

  return result;
};

module.exports = function (content) {
  this.cacheable && this.cacheable();
  var loader = this;
  var alias = this.options.resolve.alias;

  content = content.replace(PATTERN, function (match, element, preAttributes, fileName, postAttributes) {
    var isSvgFile = path.extname(fileName).toLowerCase() === '.svg';
    var isImg = element.toLowerCase() === 'img';

    if (!isSvgFile && isImg) {
      return match;
    }

    var filePath = parseAlias(fileName, alias, loader.context);

    loader.addDependency(filePath);
    var fileContent = fs.readFileSync(filePath, {encoding: 'utf-8'});
    fileContent = uniqueSVGTagId(fileContent, 'radialGradient', 'linearGradient', 'mask', 'clipPath')
    return fileContent.replace(/^<svg/, '<svg ' + preAttributes + postAttributes + ' ');
  });
  return content;
};
