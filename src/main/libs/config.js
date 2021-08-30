import isDev from 'electron-is-dev';
import fullConfig from '../../../config/config.json';
import os from 'os';
import fs from 'fs';

const configPath = '../../../config';
const hostname = os.hostname();
const possibleConfigs = [];
if (isDev) {
  possibleConfigs.push(`${__dirname}/${configPath}/config.${hostname}.dev.json`);
  possibleConfigs.push(`${__dirname}/${configPath}/config.dev.json`);
} else {
  possibleConfigs.push(`${__dirname}/${configPath}/config.${hostname}.json`);
  possibleConfigs.push(`${__dirname}/${configPath}/config.json`);
}

const configuration = possibleConfigs.reduce((prev, curr) => {
  if (prev) return prev;
  if (fs.existsSync(curr)) {
    const rawdata = fs.readFileSync(curr);
    return JSON.parse(rawdata);
  }
  return prev;
}, null) || fullConfig;

export default configuration;