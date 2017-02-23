(function(System){
  "use strict";

  // map tells the System loader where to look for things
  const map = {
    'app':                        '/', // 'dist',
    '@angular':                   './node_modules/@angular',
    'rxjs':                       './node_modules/rxjs',
    'ng2-translate':              './node_modules/ng2-translate/bundles',
    'ng2-file-upload':              './node_modules/ng2-file-upload/bundles',
  };
  // packages tells the System loader how to load when no filename and/or no extension
  const packages = {
    'app':                        { main: 'main.js',  defaultExtension: 'js' },
    'rxjs':                       { main: 'bundles/Rx.js', defaultExtension: 'js' },
    'ng2-translate':              { main: 'index.js', defaultExtension: 'js' },
    'ng2-file-upload':            { main: 'ng2-file-upload.umd.js', defaultExtension: 'js' }
  };
  const ngPackageNames = [
    'common',
    'compiler',
    'core',
    'forms',
    'http',
    'platform-browser',
    'platform-browser-dynamic',
    'router',
  ];
  // Individual files (~300 requests):
  function packIndex(pkgName) {
    packages['@angular/'+pkgName] = { main: 'index.js', defaultExtension: 'js' };
  }
  // Bundled (~40 requests):
  function packUmd(pkgName) {
    packages['@angular/'+pkgName] = { main: 'bundles/' + pkgName + '.umd.min.js', defaultExtension: 'js' };
  }
  // Most environments should use UMD; some (Karma) need the individual index files
  const setPackageConfig = System.packageWithIndex ? packIndex : packUmd;
  // Add package entries for angular packages
  ngPackageNames.forEach(setPackageConfig);
  const config = {
    map: map,
    packages: packages
  };
  System.config(config);
})(System);