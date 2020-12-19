import _p from 'path';

if (process.env['SIMC_PATH'] == undefined) throw new Error('SIMC_PATH not provided.');

if (process.env['BOT_TOKEN'] == undefined) throw new Error('Missing discord bot token!');

export const bot_token = process.env['BOT_TOKEN'];

const _simcsavepath = process.env['SIMC_SAVE_PATH'] || _p.resolve(process.cwd(), 'simc');

const _simcpath = process.env['SIMC_PATH'];

/**
 * Path to save SIMC run output.
 */
export const SIMC_SAVE_PATH: string = _p.isAbsolute(_simcsavepath)
  ? _simcsavepath
  : _p.resolve(process.cwd(), _simcsavepath);

/**
 * Path to SIMC executable.
 */
export const SIMC_PATH: string = _p.isAbsolute(_simcpath) ? _simcpath : _p.resolve(process.cwd(), _simcpath);
