import { execFile } from 'child_process';
import { SIMC_SAVE_PATH, SIMC_PATH } from './config';
import _p from 'path';

export interface ISimCArmory {
  realm: string;
  name: string;
}

export function armory_from_string(inp: string): ISimCArmory {
  const i = inp.split(',').map((v) => v.toLowerCase());
  if (i.length != 2) throw new Error('Invalid parameter count. Example: realmname,character');
  const i2 = i[0].replace(/ /g, '-');
  const i3 = i[1];
  return {
    realm: i2,
    name: i3,
  };
}

export function string_from_armory(arm: ISimCArmory): string {
  return `us,${arm.realm},${arm.name}`;
}

export async function simc(inp: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const match = /\barmory=(.*)\b/g.exec(inp);
      if (match != null) {
        const armstr: string = match[1];
        const file: string = `${armstr.replace(/,/g, '_')}.html`;
        const filename = _p.resolve(SIMC_SAVE_PATH, file);
        const script = inp
          .replace(/\bhtml=.*\b/g, `html=${filename}`)
          .replace(/\s/g, ' ')
          .replace(/\bcalculate_scale_factors=1\b/g, '');
        const args = script.trim().split(' ');
        if (!/\bhtml=.*\b/g.test(script)) args.push(`html=${filename}`);
        execFile(SIMC_PATH, args, null, (err, stdout, stderr) => {
          if (err != undefined) reject(err);
          else {
            if (stderr instanceof Buffer) stderr = stderr.toString();
            if (stderr.length != 0) reject(new Error(stderr));
            else resolve(file);
          }
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}
