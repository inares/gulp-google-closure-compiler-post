// Gulp plugin
// Use the online compiler of Google closure, so you don't need to install it.
'use strict';

const PluginError = require('gulp-util').PluginError;
const Transform   = require('readable-stream/transform');
const request     = require('request');

const PLUGIN_NAME = 'gulp-google-closure-compiler-post';

// http://closure-compiler.appspot.com/home

module.exports = function( opt ) {
  var transformStream = new Transform( {objectMode: true} );

  /**
   * @param {Buffer|string} filer
   * @param {string=} encoding - ignored if file contains a Buffer
   * @param {function(Error, object)} callback - Call this function (optionally with an
   *          error argument and data) when you are done processing the supplied chunk.
   */
  transformStream._transform = function( file, encoding, callback ) {
    if( file.isNull() ) {
      // Nothing to do
      return callback( null, file );
    }

    if( file.isStream() ) {
      // file.contents is a Stream
      return callback( new PluginError(PLUGIN_NAME, 'Streaming not supported') );
    }

    var optType    = typeof opt;
    var jsExterns  = '';
    // New file path if needed
    var newFileName = null;

    // Handle options
    if( opt !== undefined && opt !== null ) {
      if( optType === 'string' && opt !== '' ) {
        newFileName = opt;
      } else if (optType === 'object') {
        if( opt.path !== undefined && opt.path !== null && typeof opt.path === 'string' && opt.path !== '' ) {
          newFileName = opt.path;
        }
        if( opt.jsExterns !== undefined && opt.jsExterns !== null && typeof opt.jsExterns === 'string' && opt.jsExterns !== '' ) {
          jsExterns = opt.jsExterns;
        }
      }
    }

    // post_options ==> this is the body of the POST request
    var postOptions = {
      form: {
        output_format: 'json',
        output_info: ['warnings', 'errors', 'statistics', 'compiled_code'],
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        warning_level: 'verbose',
        js_externs: jsExterns,
        // the Javascript content
        js_code: String( file.contents )
      },
      qsStringifyOptions: {arrayFormat: 'repeat'}
    };

    // Sending Javascript to Google closure compiler
    request.post( 'https://closure-compiler.appspot.com/compile', postOptions,
      function( err, res, body ) {
        if( err ) {
          console.log( PLUGIN_NAME + ': [ERROR] There was an error while connecting to Google closure compiler.' );
          process.stdout.write( err );
          return callback( err );
        }
        if( res.statusCode === 200 ) {
          var myJSON = JSON.parse(body);

          // Does Google closure compiler returned an error?
          if( myJSON.hasOwnProperty('serverErrors') ) {
            console.log( PLUGIN_NAME + ': [ERROR] Google closure compiler returned an error.' );
            console.log( myJSON.serverErrors );
            return callback( myJSON.serverError );
          } else {
            console.log( myJSON.statistics );
            var newFile = file.clone( {contents: false} );
            newFile.contents = new Buffer( myJSON.compiledCode );
            if( newFileName !== null ) {
              newFile.path = newFileName;
            }
            return callback( null, newFile );
          }
        }
      });
  };

  return transformStream;
};
