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
			all: ['source/*.js']
		},

		//jsbeautifier - enforces a set of standard coding conventions on the source .js files
		jsbeautifier: {
			files: ["source/*.js"],
			options: {
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
	            files: ['demos/*.html', 'source/*.js'],
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
	grunt.registerTask('default', ['jsbeautifier', 'jshint']);
	grunt.registerTask('release', ['jsbeautifier', 'jshint', 'uglify', 'yuidoc']);
	grunt.registerTask('minify', ['uglify']);
	grunt.registerTask('docs', ['yuidoc']);
	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('beautify', ['jsbeautifier']);
	grunt.registerTask('server', ['express', 'open', 'watch']);
};
	