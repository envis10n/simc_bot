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
      const arm = armory_from_string(inp);
      const url = `us_${arm.realm}_${arm.name}.html`;
      const filename = _p.resolve(SIMC_SAVE_PATH, url);
      execFile(SIMC_PATH, [`armory=${string_from_armory(arm)}`, `html=${filename}`], null, (err, stdout, stderr) => {
        if (err != undefined) reject(err);
        else {
          if (stderr instanceof Buffer) stderr = stderr.toString();
          if (stderr.length != 0) reject(new Error(stderr));
          else resolve(url);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}
