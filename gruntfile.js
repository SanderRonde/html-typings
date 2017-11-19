module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			monaco: {
				files: [{
					expand: true,
					cwd: 'node_modules/monaco-editor/min',
					src: [
						'**/**',
						'!basic-languages/src/**',
						'basic-languages/src/html.js'
					],
					dest: 'docs/assets/monaco-editor/src/min/'
				}]
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

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadTasks('tasks');


	// Generates HTML Typings for the docs HTML files
	grunt.registerTask('genDefs', ['htmlTypings:docs']);

	// Copies monaco to the /docs folder so it can be bundled
	grunt.registerTask('copyMonaco', ['copy:monaco']);
}