import dotenv from 'dotenv';

// Read .env file
dotenv.config();

import * as config from './config';

import { login } from './discord';

import { simc } from './simc';

const runs: Map<string, { lock: boolean; timeout: number }> = new Map();

login()
  .then((client) => {
    console.log('Bot connected.');
    client.on('message', (message) => {
      if (message.author.bot) return; // Ignore other bots.
      if (message.channel.type == 'dm') return; // Ignore DMs.
      if (message.mentions.users.find((v) => v.id == client.user?.id)) {
        // Mentioned.
        const content = message.content.replace(/<@(.*?)>/g, '').trim();
        let runTo = runs.get(message.author.id);
        const ts = Date.now();
        if (runTo != undefined && !runTo.lock && ts >= runTo.timeout) runTo = undefined;
        if (runTo == undefined) {
          runs.set(message.author.id, { lock: true, timeout: Date.now() + 60000 });
          message.reply('Simulation started. (This might take a bit)');
          simc(content)
            .then((url) => {
              message.reply(`https://mplusllc.envis10n.dev/simc/${url}`);
              runs.set(message.author.id, { lock: false, timeout: Date.now() + 60000 });
            })
            .catch((e) => {
              message.reply(`Error: ${e.message}`);
              runs.set(message.author.id, { lock: false, timeout: Date.now() + 10000 });
            });
        } else {
          message.reply('Please wait a bit before running another sim.');
        }
      }
    });
  })
  .catch((e) => {
    throw e;
  });
