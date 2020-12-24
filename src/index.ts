import dotenv from 'dotenv';

// Read .env file
dotenv.config();

import * as config from './config';

import { login } from './discord';

import { simc } from './simc';

enum ESimStatus {
  QUEUED,
  STARTED,
  ENDED,
  ERROR,
}

interface ISimRun {
  ts_start: number;
  ts_end: number;
  script: string;
  status: ESimStatus;
  id: string;
}

function parseCodeblocks(content: string): string[] {
  const blocks: string[] = [];
  const mReg = /```(\w\w)?\n?/g;
  let match: RegExpExecArray | null = mReg.exec(content);
  while (match != null) {
    const s_off: number = match.index;
    const language: string = match[1];
    const e_off: number = content.indexOf('```', s_off + match[0].length);
    if (e_off != -1) {
      const source: string = content.substring(s_off + match[0].length, e_off);
      blocks.push(source);
    }
    match = mReg.exec(content);
  }
  return blocks;
}

const queue_map: Map<string, ISimRun> = new Map();
const queue: string[] = [];

let isRunning: boolean = false;

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
        const id = message.author.id;
        const srun = queue_map.get(id);
        if (srun != undefined) {
          message.reply('You currently have a simulation run queued. Please wait until it is complete.');
        } else {
          const blocks = parseCodeblocks(content);
          if (blocks.length == 0) {
            message.reply('No SIMC TCI codeblock detected.');
          } else {
            let sim: ISimRun = {
              ts_start: -1,
              ts_end: -1,
              status: ESimStatus.QUEUED,
              script: blocks[0],
              id,
            };
            queue_map.set(id, sim);
            queue.push(id);
            message.reply('Your simulation has been queued. You will be notified when it begins.');
          }
        }
      }
    });
    setInterval(() => {
      if (!isRunning && queue.length > 0) {
        isRunning = true;
        const id = queue.shift();
        if (id != undefined) {
          const sim = queue_map.get(id);
          if (sim != undefined) {
            client.users
              .fetch(sim.id)
              .then((usr) => {
                sim.status = ESimStatus.STARTED;
                sim.ts_start = Date.now();
                simc(sim.script)
                  .then((url) => {
                    sim.ts_end = Date.now();
                    usr.send(`Simulation complete.\nSummary: https://mplusllc.envis10n.dev/simc/${url}`);
                  })
                  .catch((err) => {
                    usr.send(`An error occured during simulation.\n\`\`\`\n${err.message}\n\`\`\``);
                  })
                  .finally(() => {
                    queue_map.delete(id);
                    isRunning = false;
                  });
                usr.send('Your queued simulation has started. You will be notified when it is complete.');
              })
              .catch((err) => {
                console.error('Invalid user ID in cached sim run.');
                queue_map.delete(id);
                isRunning = false;
              });
          } else {
            isRunning = false;
          }
        } else {
          isRunning = false;
        }
      }
    }, 500);
  })
  .catch((e) => {
    throw e;
  });
