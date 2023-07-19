import 'dotenv/config';
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import inquirer from 'inquirer';
import { CtApiCredentials } from 'models';

export const MAX_CONCURRENCY = 50;

export const configFile = `${module.path}/../../config.json`;

export type Config = {
  batchSize: number,
  commercetools: CtApiCredentials
};

export const config: Config = {
  batchSize: 0,
  commercetools: {
    authUri: '',
    baseUri: '',
    clientId: '',
    clientSecret: '',
    projectKey: '',
    scopes: []
  }
};

export const fetchUserInputForConfig = async () => {
  if (isConfigFile()) {
    const useConfigFile = await promptForInput('confirm', 'Do you want to use stored values in the config file?');

    if (useConfigFile) {
      loadConfigFromFile();
    }
  }

  const isAnyChange = await getMissingDefaultConfig();

  if (!isAnyChange) {
    return;
  }

  const isSaveDataToFile = await inquirer.prompt({
    type: 'confirm',
    name: 'saveToFile',
    message: 'Save provided data for future use?',
    default: true
  });

  if (isSaveDataToFile.saveToFile) {
    saveConfig(config);
  }
};

export const isConfigValid = (config: Config) => {
  if (!config) {
    return false;
  }

  if (!Number(config.batchSize)) {
    return false;
  }

  for (const configValue of Object.values(config.commercetools ?? {})) {
    if (!configValue) {
      return false;
    }
  }

  return true;
};

const getMissingDefaultConfig = async () => {
  let isAnyChange = false;

  if (!config.commercetools.projectKey) {
    const projectKey = await promptForInput('input', 'Commercetools project key');
    isAnyChange = true;
    config.commercetools.projectKey = projectKey;
  }

  if (!config.commercetools.clientId) {
    const clientId = await promptForInput('input', 'Commercetools API Client ID');
    isAnyChange = true;
    config.commercetools.clientId = clientId;
  }

  if (!config.commercetools.clientSecret) {
    const clientSecret = await promptForInput('password', 'Commercetools API Client Secret');
    isAnyChange = true;
    config.commercetools.clientSecret = clientSecret;
  }

  if (!config.commercetools.baseUri) {
    const apiUrl = await promptForInput('input', 'Commercetools API url', 'https://api.europe-west1.gcp.commercetools.com');
    isAnyChange = true;
    config.commercetools.baseUri = apiUrl;
  }

  if (!config.commercetools.authUri) {
    const authUrl = await promptForInput('input', 'Commercetools API Auth url', 'https://auth.europe-west1.gcp.commercetools.com');
    isAnyChange = true;
    config.commercetools.authUri = authUrl;
  }

  if (!config.commercetools.scopes?.length) {
    const scopes = await promptForInput('input', 'Commercetools API client scopes(separated by space)', `manage_project:${config.commercetools.projectKey}`);
    isAnyChange = true;
    config.commercetools.scopes = scopes.split(' ');
  }

  if (!config.batchSize) {
    const batchSize = await promptForInput('number', 'HTTP Requests batch size', 500);
    isAnyChange = true;
    config.batchSize = batchSize;
  }

  return isAnyChange;
};

const promptForInput = async (type: 'input' | 'number' | 'confirm' | 'password', message: string, defaultValue?: string | boolean | number) => {
  return (await inquirer.prompt({
    type,
    name: 'value',
    message,
    default: defaultValue
  })).value;
};

const isConfigFile = () => {
  const isExists = existsSync(configFile);

  if (!isExists) {
    return false;
  }

  const fileStats = statSync(configFile);

  if (fileStats.size > 0) {
    return true;
  }

  return false;
};

const loadConfigFromFile = () => {
  const fileData = readFileSync(configFile, {
    encoding: 'utf-8'
  });

  const configData = <Config>JSON.parse(fileData) ?? null;

  if (!config) {
    throw Error('There is no config stored in file.');
  }

  config.batchSize = configData.batchSize;
  config.commercetools = {
    authUri: configData.commercetools.authUri,
    baseUri: configData.commercetools.baseUri,
    clientId: configData.commercetools.clientId,
    clientSecret: configData.commercetools.clientSecret,
    projectKey: configData.commercetools.projectKey,
    scopes: configData.commercetools.scopes,
  };
};

const saveConfig = (configData: Config) => {
  writeFileSync(configFile, JSON.stringify(configData, null, 4));

  console.log('Config saved successfully.');
};
