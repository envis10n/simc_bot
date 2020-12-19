import * as Discord from 'discord.js';
import { bot_token } from './config';

export const client = new Discord.Client();

export async function login(): Promise<Discord.Client> {
  await client.login(bot_token);
  return client;
}
