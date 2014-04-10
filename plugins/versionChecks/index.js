/**
 * Pattern matcher plugin
 *
 * Adds the ability to HTTP & HTTPS pollers to test the response body against a pattern
 * pattern=  (?<=build\>)([\S\s]*?)(?=\<\/build)
 */
var fs   = require('fs');
var ejs  = require('ejs');

var matchPattern = '^/(.*?)/(g?i?m?y?)$';
var template = fs.readFileSync(__dirname + '/views/_detailsEdit.ejs', 'utf8');
var CheckEvent = require('../../models/checkEvent');
var Check = require('../../models/check');

exports.initWebApp = function(options) {
  registerNewEventsLogger();
  var dashboard = options.dashboard;

  dashboard.on('populateFromDirtyCheck', function(checkDocument, dirtyCheck, type) {
    if (type !== 'http' && type !== 'https') return;
    var match = dirtyCheck.versionMatch;
    if (match) {
      if (match.indexOf('/') !== 0) {
        match = '/' + match + '/';
      }
      var matchParts = match.match(new RegExp(matchPattern));
      try {
        // check that the regexp doesn't crash
        new RegExp(matchParts[1], matchParts[2]);
      } catch (e) {
        throw new Error('Malformed regular expression ' + dirtyCheck.versionMatch);
      }
    }
    checkDocument.setPollerParam('versionMatch', match);
  });

  dashboard.on('checkEdit', function(type, check, partial) {
    if (type !== 'http' && type !== 'https') return;
    partial.push(ejs.render(template, { locals: { check: check } }));
  });

};

exports.initMonitor = function(options) {

  options.monitor.on('pollerPolled', function(check, res, details) {
    if (check.type !== 'http' && check.type !== 'https') return;
    var pattern = check.pollerParams && check.pollerParams.versionMatch;
    var oldVersion = check.pollerParams && check.pollerParams.curVersion;
    if (!pattern) return;
    var matchParts = pattern.match(new RegExp(matchPattern));
    var regexp;
    try {
      // check that the regexp doesn't crash (should only happen if the data was altered in the database)
      regexp = new RegExp(matchParts[1], matchParts[2]);
    } catch (e) {
      throw new Error('Malformed pattern in check configuration: ' + pattern);
    }

    var versionMatches = res.body.match(regexp);
    var newVersion;
    if (!versionMatches) {
      throw new Error('Response body does not match pattern ' + pattern);
    }

    newVersion = versionMatches[1];
    Check.findById(check._id, function (err, check) {
      if(err){
        throw new Error('unable to retrieve check');
      }

      if(newVersion !== oldVersion){
        console.log("sending new event!");
         var event = new CheckEvent({
            timestamp: new Date(),
            check: check,
            tags: check.tags,
            message: 'version',
            details: newVersion
          });
          event.save();
      }

      check.setPollerParam('curVersion',newVersion);
      check.save();
    });
    //TODO: get this into /dashboard/checks column
    // possibly just in the .ejs file looping over poller Params 
    // and driven by configuration
    return;
  });
};


var registerNewEventsLogger = function() {
  CheckEvent.on('afterInsert', function(checkEvent) {
    checkEvent.findCheck(function(err, check) {
      var messageColor;
      var message = check.name + ' ';
      switch (checkEvent.message) {
        case 'version':
          message += 'new version found: ' + checkEvent.details;
          messageColor = 'magenta+italic+bold';
          break;
        default:
          // let the console plugin take care of it?
      }

    });
  });
};