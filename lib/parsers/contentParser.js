/**
 * Module dependencies.
 */

var util = require('util');
var xml2js = require('xml2js');
var jsonpath = require('JSONPath').eval;
/**
 * XmlParser constructor
 *
 * @api   public
 */

function ContentParser() {}


/**
 * value callback
 *
 * @api   public
 */
ContentParser.prototype.getXmlValue = function(xml, path, callback) {

		var parser = new xml2js.Parser();
		parser.parseString(xml, function(err, result) {
			if (err) {
				log.error(util.format('%s \r\n of xml: \r\n %s', err, xml));
				callback(err);
				return;
			}
			path = path || "$.status.build";
			var version = jsonpath(result, path);
			callback(undefined, version);
		});
	};


module.exports = ContentParser;