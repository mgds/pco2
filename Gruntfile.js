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
            bsroot: '"../../bower_components/bootstrap/less"'
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
          {expand: true, cwd:'bower_components/jquery/dist/',src: ['jquery.min.js'], dest: 'public/scripts/'},
          {expand: true, cwd:'node_modules/d3/dist/',src: ['d3.min.js'], dest: 'public/scripts/'},
          {expand: true, cwd:'bower_components/bootstrap/fonts/',src: ['**'], dest: 'public/fonts/'}
        ]
      }
    },
    concat: {
      //Concatenate all angular components into a single include in scripts directory
      angular: {
        files: {
          'public/scripts/angular-all.min.js': [
              'bower_components/angular/angular.min.js',
              'bower_components/angular-animate/angular-animate.min.js',
              'bower_components/angular-cookies/angular-cookies.min.js',
              'bower_components/angular-loader/angular-loader.min.js',
              'bower_components/angular-messages/angular-messages.min.js',
              'bower_components/angular-resource/angular-resource.min.js',
              'bower_components/angular-route/angular-route.min.js',
              'bower_components/angular-sanitize/angular-sanitize.min.js',
              'bower_components/angular-modal-service/dst/angular-modal-service.min.js'
          ]
        }
      },
      bootstrap: {
        files: {
          'public/scripts/bootstrap-all.min.js' : [
            'bower_components/bootstrap/dist/js/bootstrap.min.js'
          ]
        }
      },
      pco2_site: {
        files: {
          'public/scripts/pco2.js' : [
            'assets/pco2_site/config.js',
            'assets/pco2_site/routes.js',
            'assets/pco2_site/pco2App.js',
            'assets/pco2_site/pco2Controllers.js',
            'assets/pco2_site/refService.js',
            'assets/pco2_site/navbar.js',
          ]
        }
      },
      plot_logic: {
        files: {
          'public/scripts/ageCO2Plot.js' : [
            'assets/plot/PlotUtils.js',
            'assets/plot/Legend.js',
            'assets/plot/DomainControl.js',
            'assets/plot/DynamicPlot.js',
            'assets/plot/ScatterPlot.js',
            'assets/plot/LinePlot.js',
            'assets/plot/TimeLine.js',
            'assets/plot/PCO2Plot.js',
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("grunt-bower-install-simple");

  grunt.registerTask('default', ['bower-install-simple:dev','copy:main','concat','less:development','cssmin']);
  grunt.registerTask('noWatch', ['bower-install-simple:dev','copy:main','concat','less:development','cssmin']);
  grunt.registerTask("myLess", ['less:development']);
  grunt.registerTask("bower-install", [ "bower-install-simple" ]);
};
