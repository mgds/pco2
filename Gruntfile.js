module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    //Compile customized bootstrap stylesheet
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2,
          modifyVars: {
            bsroot: '"../../node_modules/bootstrap/less"'
          }
        },
        files: {
          "public/css/bootstrap-custom.css": "assets/less/bootstrap-custom.less" // destination file and source file
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
                    'public/css/bootstrap-custom.css'
                ]
            }
        }
    },
    copy : {
      main: {
        files: [
          {expand: true, cwd:'node_modules/bootstrap/fonts/',src: ['**'], dest: 'public/fonts/'}
        ]
      }
    },
    concat: {
      //Concatenate all angular components into a single include in scripts directory
      angular: {
        files: {
          'public/scripts/angular-all.min.js': [
              'node_modules/angular/angular.min.js',
              'node_modules/angular-animate/angular-animate.min.js',
              'node_modules/angular-cookies/angular-cookies.min.js',
              'node_modules/angular-loader/angular-loader.min.js',
              'node_modules/angular-messages/angular-messages.min.js',
              'node_modules/angular-resource/angular-resource.min.js',
              'node_modules/angular-route/angular-route.min.js',
              'node_modules/angular-sanitize/angular-sanitize.min.js',
              'node_modules/angular-modal-service/dst/angular-modal-service.min.js'
          ]
        }
      },
      pco2_site: {
        files: {
          'public/scripts/pco2.js' : [
            'assets/pco2_site/routes.js',
            'assets/pco2_site/config.js',
            'assets/pco2_site/pco2App.js',
            'assets/pco2_site/pco2Controllers.js',
            'assets/pco2_site/refService.js',
            'assets/pco2_site/navbar.js'
          ]
        }
      },
      plot_logic: {
        files: {
          'public/scripts/ageCO2Plot.js' : [ 'assets/plot/PlotGroup.js','assets/plot/*.js' ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['copy:main','concat','less:development','cssmin']);
  grunt.registerTask('noWatch', ['copy:main','concat','less:development','cssmin']);
  grunt.registerTask("myLess", ['less:development']);
};
