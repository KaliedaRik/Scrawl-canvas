module.exports = function(grunt){

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
			mytarget: {
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
			all: ['source/*.js', "demos/js/*.js"]
		},

		//jsbeautifier - enforces a set of standard coding conventions on the source .js files
		jsbeautifier: {
			files: ["source/*.js", "demos/js/*.js", "demos/*.html"],
			options: {
        html: {
          braceStyle: "collapse",
          indentChar: " ",
          indentScripts: "keep",
          indentSize: 2,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          unformatted: ["a", "sub", "sup", "b", "i", "u"],
          wrapLineLength: 0
        },
				js: {
					braceStyle: "end-expand",
					indentWithTabs: true,
					keepArrayIndentation: true,
					keepFunctionIndentation: true,
					spaceBeforeConditional: true,
					spaceInParen: false,
				}
			}
		},

		// Demo testing - Grunt express
		express: {
		    all: {
		        options: {
		            bases : [path.resolve('.')], 
		            port: 8080,
		            hostname: '*',
		            livereload: true
		        }
		    }
		},

		// Demo testing - grunt-watch
		watch: {
		    all: {
	            files: ['demos/*.html', 'demos/js/*.js', 'source/*.js'],
	            options: {
	                livereload: true
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
	grunt.registerTask('lint', ['newer:jshint']);
	grunt.registerTask('beautify', ['newer:jsbeautifier']);
	grunt.registerTask('server', ['express', 'open', 'watch']);
	grunt.registerTask('default', ['beautify', 'lint']);
};
	