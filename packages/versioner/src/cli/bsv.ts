import { oneline } from '@bscotch/utility';
import { Command } from 'commander';
import { writeJsonFileSync } from '@bscotch/utility';
import { configSchema } from '../config/project.js';
import '../config/validation.js';

const program = new Command('Bscotch Versioner');

program
  .command('write-schema [filename]')
  .description(
    oneline`
    Write the configuration schema to a file.
    This is useful for tools that can use JSON Schemas
    for intellisense and validation.
  `,
  )
  .action((filename = 'bsv-config-schema.json') => {
    filename = filename.endsWith('.json') ? filename : `${filename}.json`;

    writeJsonFileSync(filename, configSchema);
  });

program.parse();
