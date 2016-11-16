module.exports = {
  init: init
};

var watch = require( 'gulp-watch' );

function init( gulp, plugins, config, _ ) {

  var watchlist = {
    'src/common/assets/images/**/*' : ['images'],
    'src/common/assets/sass/**/*'   : ['sass'],
    'src/common/assets/vendors/**/*': ['scripts'],
    'src/common/modules/**/*.js'    : ['jshint:common', 'scripts:common'],
    'src/common/modules/**/*.html'  : ['templates'],
    'test/unit/common/**/*.js'      : [],

    'src/components/**/assets/FDN/**/*'    : ['fdn'],
    'src/components/**/assets/images/**/*' : ['images'],
    'src/components/**/assets/sass/**/*'   : ['sass'],
    'src/components/**/assets/vendors/**/*': ['scripts'],
    'src/components/**/modules/**/*.js'    : ['jshint:components', 'scripts:components'],
    'src/components/**/modules/**/*.html'  : ['templates'],
    'test/unit/components/**/*.js'         : [],

    'src/app/assets/FDN/**/*'      : ['FDN'],
    'src/app/assets/i18n/**/*'     : ['i18n'],
    'src/app/assets/images/**/*'   : ['images'],
    'src/app/assets/sass/**/*.scss': ['sass'],
    'src/app/modules/**/*.scss'    : ['sass'],
    'src/app/assets/mockData/**/*' : ['mocks', 'scripts'],
    'src/app/assets/vendors/**/*'  : ['scripts'],
    'src/app/modules/**/*.js'      : ['jshint:app', 'scripts:app'],
    'src/uifw-modules/src/modules/**/*.js'       : ['jshint:app', 'scripts:app'],
    'src/uifw-modules/src/modules/**/*.html'     : ['templates'],
    'src/uifw-modules/src/modules/**/*.scss'     : ['sass'],
    'src/app/modules/**/*.html'    : ['templates'],
    'test/unit/app/**/*.js'        : [],
    'src/index.html'               : ['html']
  };


  gulp.task( 'watch', function() {
    _.forEach( watchlist, watchItem );

    function watchItem( task, srcFiles ) {
      return watch( srcFiles, function() {
        gulp
          .src( srcFiles )
          .pipe( watch( srcFiles ) );
        gulp.start( task );
      } );
    }
  } );

}
