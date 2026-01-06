#!/usr/bin/env node

const inquirer = require('inquirer').default;
const { spawn } = require('node:child_process');

const RED_COLOR_TEXT = '\x1b[31m%s\x1b[0m';
const GREEN_COLOR_TEXT = '\x1b[36m%s\x1b[0m';
const VIOLET_COLOR_TEXT = '\x1b[35m%s\x1b[0m';
const ORANGE_COLOR_TEXT = '\x1b[33m%s\x1b[0m';

const appConfig = require('../app.json');
const easConfig = require('../eas.json').build;
const buildProfiles = Object.keys(easConfig);

async function main() {
  console.log(GREEN_COLOR_TEXT, '-'.repeat(50));
  console.log(VIOLET_COLOR_TEXT, `--- APP BUILD: ${appConfig.expo.slug}  ---`);
  console.log(GREEN_COLOR_TEXT, '-'.repeat(50));

  const { platform, buildProfile, service } = await inquirer.prompt([
    {
      name: 'platform',
      type: 'list',
      message: 'Select platform:',
      choices: ['android', 'ios'],
      default: 'android',
    },
    {
      name: 'buildProfile',
      type: 'list',
      message: 'Select build profile:',
      choices: buildProfiles,
      default: 'development',
    },
    {
      name: 'service',
      type: 'list',
      message: 'Select build location:',
      choices: ['local', 'eas'],
      default: 'local',
    },
  ]);

  const command = [
    'eas build',
    `--platform ${platform}`,
    `--profile ${buildProfile}`,
    service === 'local' ? '--local' : null,
    service === 'local' ? `--output ${createBuildName({ platform, profile: buildProfile })}` : null,
  ]
    .filter((a) => a)
    .join(' ');

  console.log(ORANGE_COLOR_TEXT, `Running command: ${command}`);

  const { confirm } = await inquirer.prompt({
    name: 'confirm',
    type: 'confirm',
    message: 'Do you want to proceed with the build?',
    default: true,
  });

  if (!confirm) {
    console.log(RED_COLOR_TEXT, 'Build cancelled.');
    return;
  }

  const [cmd, ...args] = command.split(' ');
  const child = spawn(cmd, args, { stdio: 'inherit', shell: true });
  await new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

main().catch((error) => {
  console.error(RED_COLOR_TEXT, 'Error:', error);
  process.exit(1);
});

function createBuildName({ platform, profile }) {
  let extension = platform === 'ios' ? 'ipa' : 'apk';

  if (profile === 'ios-simulator' && platform === 'ios') {
    extension = 'tar.gz'; // iOS Simulator builds are packaged as tar.gz
  }

  return `./builds/${profile}-${appConfig.expo.slug}.${extension}`;
}
