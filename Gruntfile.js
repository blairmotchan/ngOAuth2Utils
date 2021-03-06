'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dirs: {
            src: 'src',
            dest: grunt.file.readJSON('package.json')
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: '<%= pkg.name %>.js',
                dest: '<%= pkg.name %>.min.js'
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    //'Gruntfile.js',
                    'src/**/*.js',
                    '!src/oauth2Templates/**/*.js'
                ]
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*//*}*.js']
            }
        },
        concat: {
            dist: {
                options: {
                    banner: "'use strict';\r\n\r\n (function(){\r\n\r\n", // jshint ignore:line                     
                    footer: "\r\n})();", // jshint ignore:line                     

                    process: function (src, filepath) {
                        return '// Source: ' + filepath + '\n' +
                            src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                    }
                },
                src: ['src/**/*.js'],
                dest: '<%= pkg.name %>.js'
            }
        },
        ngtemplates: {
            ngOAuth2Utils: {
                cwd: 'src',
                src: 'oauth2Templates/**.html',
                dest: 'src/oauth2Templates/templates.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'test', 'ngtemplates', 'concat', 'uglify']);

    grunt.registerTask('test', [
        'karma'
    ]);

};