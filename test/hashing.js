
import { equal } from 'node:assert';
import { readFile } from 'node:fs/promises';
import makeRel from './rel.js';
import { hash } from "catboat";

const rel = makeRel(import.meta.url);

let wtfData, wtfHash;
before(async () => {
  wtfData = await readFile(rel('fixtures/wtf.jpg'));
  wtfHash = await hash(wtfData);
});
describe('Blake3 Hashing', () => {
  it('hashes correctly', () => {
    equal('62c6f749c80a27813a84066b92a6fdc37fd83779bf9d64f1f1a3692cf3a7dfbd', wtfHash, 'hash matches');
  });
});
