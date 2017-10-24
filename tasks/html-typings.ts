import { extractFileTypes } from '../app/index';

interface GruntTask {
	async(): () => void;
	files: {
		src: string[];
		dest: string;
	}[];
}

interface GruntMain {
	renameTask(oldName: string, newName: string): void;
	registerTask(name: string, description: string, task: (this: GruntTask) => void): void;
	registerMultiTask(name: string, description: string, task: (this: GruntTask) => void): void;
	file: {
		read(path: string, options?: {
			encoding?: string;
		}): string;
		write(path: string, content: string, options?: {
			encoding?: string;
		}): void;
		exists(...pathParts: string[]): boolean;
	}
	log: {
		error(msg?: string): void;
		writeln(msg?: string): void;
	}
}

module.exports = function(grunt: GruntMain) {
	grunt.registerMultiTask('htmlTypings', 'Generates typings based on your HTML.', function(this: GruntTask) {
		const done = this.async();

		this.files.forEach(function(f) {
			const srcFiles = f.src.filter(function(filepath) {
				if (!grunt.file.exists(filepath)) {
					grunt.log.error('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			});

			extractFileTypes(srcFiles).then((typings) => {
				grunt.file.write(f.dest, typings);
				
				grunt.log.writeln('File "' + f.dest + '" created.');

				done();
			});
		});
	});
}