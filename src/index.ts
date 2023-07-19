import { Command } from '@commander-js/extra-typings';
import inquirer from 'inquirer';
import { anonymize, erase, fill } from './bin';
import { config, fetchUserInputForConfig, isConfigValid } from './common';
import { RuntimeMode } from './common/options';
import { MissingConfigurationError } from './errors';

async function main() {
  try {
    const cli = new Command<[]>();

    cli.action(async () => {

      const mode = (await inquirer.prompt({
        type: 'list',
        name: 'mode',
        message: 'What do you want to do?',
        choices: Object.values(RuntimeMode),
        default: RuntimeMode.anonymize
      })).mode as RuntimeMode;

      await fetchUserInputForConfig();

      if (!isConfigValid(config)) {
        throw new MissingConfigurationError();
      }

      // Data erasure
      if (mode === RuntimeMode.erase) {
        await erase(config);
      }

      // Data anonymisation
      if (mode === RuntimeMode.anonymize) {
        await anonymize(config);
      }

      // Data fill - mock data to CT
      if (mode === RuntimeMode.fill) {
        await fill();
      }
    });

    await cli.parseAsync(process.argv);
  } catch (error) {
    console.log(error);
  }
};

main();
