module.exports = function(grunt){

	// used by express server
	var path = require('path');
	
 	// Load Grunt tasks declared in the package.json file
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// Project configurations.
	grunt.initConfig({

		//uglify is used to minify .js files from source/ to min/ directories
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				drop_console: true,
			},
			all: {
				files: [{
					expand: true,
					cwd: 'source',
					src: '*.js',
					dest: 'min',
					ext: '-min.js'
				}]
			}
		},
		
		//yuidoc generates documentation from comments in the .js source files
		yuidoc: {
			all: {
				name: '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version: '<%= pkg.version %>',
				url: '<%= pkg.homepage %>',
				options: {
					paths: 'source/',
					outdir: 'docs/'
				}
			}
		},

		//jshint - using default settings to test all .js files in the source directory
		jshint: {
			all: {
				src: ['source/*.js', "demos/js/*.js"]
			}
		},

		//jsbeautifier - enforces a set of standard coding conventions on the source .js files
		jsbeautifier: {
			options: {
				html: {
					indentSize: 2,
				},
				js: {
					braceStyle: "end-expand",
					indentWithTabs: true,
					keepArrayIndentation: true,
					keepFunctionIndentation: true,
					spaceBeforeConditional: true,
					spaceInParen: false,
				}
			},
			htmlfiles: {
				src: ["demos/*.html"]
			},
			jsfiles: {
				src: ["source/*.js", "demos/js/*.js"]
			}
		},

		// Demo testing - Grunt express
		express: {
			all: {
				options: {
					bases : [path.resolve('.')], 
					port: 8080,
					hostname: '0.0.0.0',
					livereload: true
				}
			}
		},

		// Demo testing - grunt-watch
		watch: {
			htmlfiles: {
				files: ['demos/*.html'],
				tasks: ['newer:jsbeautifier:htmlfiles']
			},
			jsfiles: {
				files: ['demos/js/*.js', 'source/*.js'],
				tasks: ['newer:jsbeautifier:jsfiles', 'newer:jshint:all'],
				options: {
					livereload: true,
				}
			}
		},

		// Demo testing - grunt-open
		open: {
			all: {
				path: 'http://localhost:8080/demos/index.html'
			}
		}
	});

	// Default task(s).
	grunt.registerTask('release', ['jsbeautifier', 'jshint', 'uglify', 'yuidoc']);
	grunt.registerTask('minify', ['uglify']);
	grunt.registerTask('docs', ['yuidoc']);
	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('beautify', ['jsbeautifier']);
	grunt.registerTask('server', ['express', 'open', 'watch']);
	grunt.registerTask('default', ['jsbeautifier', 'jshint']);
};
	