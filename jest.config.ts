import type { Config } from '@jest/types';

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

const config: Config.InitialOptions = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  preset: 'ts-jest',
  roots: ['<rootDir>/tests'],
  testEnvironment: 'node',
  verbose: true,
};

export default config;