module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			monaco: {
				files: [{
					expand: true,
					cwd: 'node_modules/monaco-editor/',
					src: [
						'min/**/**',
						'!min/basic-languages/src/**',
						'min/basic-languages/src/html.js',
						'monaco.d.ts'
					],
					dest: 'docs/assets/monaco-editor/'
				}]
			},
			htmlTypings: {
				files: [{
					src: [
						'typings/html-typings.d.ts'
					],
					dest: 'docs/assets/html-typings/'
				}]
			}
		},
		browserify: {
			htmlTypings: {
				files: {
					'docs/assets/html-typings/app/index.js': [
						'app/index.js'
					]
				},
				options: {}
			}
		},
		htmlTypings: {
			docs: {
				files: [{
					src: [
						'docs/**/*.html'
					],
					dest: 'docs/assets/js/defs.d.ts'
				}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadTasks('tasks');


	// Generates HTML Typings for the docs HTML files
	grunt.registerTask('genDefs', ['htmlTypings:docs']);

	// Copies required files to the /docs folder so they can be bundled
	grunt.registerTask('copyFiles', ['copy:monaco', 'copy:htmlTypings', 
		'browserify:htmlTypings']);
}