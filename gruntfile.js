module.exports = function(grunt){

	// Load Grunt tasks declared in the package.json file
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// Project configurations.
	grunt.initConfig({
		//pkg: grunt.file.readJSON('package.json'),

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

		//For testing the demos - starts the web server
		connect: {
			all: {
				options:{
					port: 9000,
					hostname: "0.0.0.0",
					middleware: function(connect, options) {
						return [
							require('grunt-contrib-livereload/lib/utils').livereloadSnippet,
							connect.static(options.base)
						];
					}
				}
			}
		},

		//For testing the demos - loads the index page
		open: {
			all: {
				//the index page which will be opened
				path: 'http://localhost:<%= connect.all.options.port%>'
			}
		},

		//For testing the demos - keeps an eye on files and reloads when they are updated
		regarde: {
			all: {
				//change this line to cover which files will be watched and live-reloaded
				files:['docs/*.html', 'source/*.js'],
				tasks: ['lint', 'beautify', 'livereload']
			}
		}

	});

	// Load the plugin that provides the "uglify" task.
	//grunt.loadNpmTasks('grunt-contrib-uglify');
	//grunt.loadNpmTasks('grunt-contrib-yuidoc');
	//grunt.loadNpmTasks('grunt-contrib-jshint');
	//grunt.loadNpmTasks('grunt-jsbeautifier');

	// Default task(s).
	grunt.registerTask('default', ['jsbeautifier', 'jshint']);
	grunt.registerTask('release', ['jsbeautifier', 'jshint', 'uglify', 'yuidoc']);
	grunt.registerTask('minify', ['uglify']);
	grunt.registerTask('docs', ['yuidoc']);
	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('beautify', ['jsbeautifier']);
	grunt.registerTask('server', ['livereload-start', 'connect', 'open', 'regarde']);
};
	