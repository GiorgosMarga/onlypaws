/** @jest-config-loader ts-node */
import type {Config} from 'jest';

const config: Config = {
  verbose: true,
  transform: {
    "^.+\\.jsx?$": "babel-jest", // Adding this line solved the issue
    "^.+\\.tsx?$": "ts-jest"
  }
};

export default config;