module.exports = function(grunt){

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

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
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jsbeautifier');	
	// Default task(s).
	grunt.registerTask('default', ['uglify']);
	grunt.registerTask('docs', ['yuidoc']);
	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('beautify', ['jsbeautifier']);
};
	