import * as path from 'path';
import * as Mocha from 'mocha';
import * as fs from 'fs';

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((c, e) => {
		try {
			// Recursively find all .test.js files
			const findTestFiles = (dir: string): string[] => {
				const files: string[] = [];
				const items = fs.readdirSync(dir);
				
				for (const item of items) {
					const fullPath = path.join(dir, item);
					const stat = fs.statSync(fullPath);
					
					if (stat.isDirectory()) {
						files.push(...findTestFiles(fullPath));
					} else if (item.endsWith('.test.js')) {
						files.push(fullPath);
					}
				}
				
				return files;
			};

			const testFiles = findTestFiles(testsRoot);

			// Add files to the test suite
			testFiles.forEach((file: string) => mocha.addFile(file));

			// Run the mocha test
			mocha.run(failures => {
				if (failures > 0) {
					e(new Error(`${failures} tests failed.`));
				} else {
					c();
				}
			});
		} catch (err) {
			console.error(err);
			e(err);
		}
	});
} 