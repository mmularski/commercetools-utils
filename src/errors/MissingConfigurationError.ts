export class MissingConfigurationError extends Error {
  name = 'missing_configuration';

  constructor(message = 'Missing configuration options') {
    super(message);
  }
};
