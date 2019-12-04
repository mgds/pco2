module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    //Compile customized bootstrap stylesheet
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "public/css/bootstrap-custom.css": "less/bootstrap-custom.less" // destination file and source file
        }
      }
    },
    //Minify page logic scripts into single include
    uglify: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
      },
      build: {
        files: {
          'public/scripts/pco2/controls.min.js': [
            "public/scripts/logic/pco2App.js",
            "public/scripts/logic/pco2Controllers.js",
            "public/scripts/logic/navbar.js"
          ]
        }
      }
    },
    //Minify bootstrap and pco2.css into single file
    cssmin: {
        options: {
            banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
        },
        build: {
            files: {
                'public/css/pco2.min.css' : [
                    'public/css/bootstrap-custom.css',
                    'bower_components/angular-toastr/dist/angular-toastr.css',
                    'bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.min.css',
                    'node_modules/lightbox2/dist/css/lightbox.min.css'
                ]
            }
        }
    },
    //Run bower install after npm install to update/install all front-end components
    "bower-install-simple" : {
        options: {
            forceLatest: true
        },
        "prod": {
            options: {
                production: true
            }
        },
        "dev": {
            options: {
                production: false
            }
        }
    },
    copy : {
        main: {
            files: [
                //Copy jQuery to vendor directory
                {expand: true, cwd:'bower_components/jquery/dist/',src: ['jquery.min.js'], dest: 'public/scripts/vendor/'},
                {expand: true, cwd:'node_modules/lightbox2/dist/js/',src: ['lightbox.min.js'], dest: 'public/scripts/vendor/'},
//                {expand: true, cwd:'bower_components/moment/min/',src: ['moment.min.js'], dest: 'public/scripts/vendor/'},
                //Copy bootstrap fonts to vendor directory
                {expand: true, cwd:'bower_components/bootstrap/fonts/',src: ['**'], dest: 'public/fonts/'},
                {expand: true, cwd:'node_modules/lightbox2/dist/images/',src:['**'], dest: 'public/images/'}
                //{expand: true, cwd:'bower_components/bootstrap/dist/js/', src: ['bootstrap.min.js'], dest: 'public/scripts/vendor/'}
            ]
        }
    },
    concat: {
      //Concatenate all angular components into a single include in vendor directory
      angular: {
        files: {
          'public/scripts/vendor/angular-all.min.js': [
              'bower_components/angular/angular.min.js',
              'bower_components/angular-animate/angular-animate.min.js',
              'bower_components/angular-cookies/angular-cookies.min.js',
              'bower_components/angular-loader/angular-loader.min.js',
              'bower_components/angular-messages/angular-messages.min.js',
              'bower_components/angular-resource/angular-resource.min.js',
              'bower_components/angular-route/angular-route.min.js',
              'bower_components/angular-sanitize/angular-sanitize.min.js',
              'bower_components/angular-toastr/dist/angular-toastr.tpls.min.js',
              'bower_components/angular-modal-service/dst/angular-modal-service.min.js'
          ]
        }
      },
      bootstrap: {
        files: {
          'public/scripts/vendor/bootstrap-all.min.js' : [
            'bower_components/bootstrap/dist/js/bootstrap.min.js',
            'bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js'
          ]
        }
      }
    },
    watch: {
      styles: {
        files: ['less/*.less','public/css/*.css'], // which files to watch
        tasks: ['less','cssmin'],
        options: {
          nospawn: true
        }
      },
      scripts: {
        files: ['public/scripts/**/*.js'],
        tasks: ['concat','uglify'],
        options: {
            nospawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("grunt-bower-install-simple");
  
  grunt.registerTask('default', ['bower-install-simple:dev','copy:main','concat','less:development','cssmin']);
  grunt.registerTask('noWatch', ['bower-install-simple:dev','copy:main','concat','less:development','cssmin']);
  grunt.registerTask("myLess", ['less:development']);
  grunt.registerTask("bower-install", [ "bower-install-simple" ]);
};
