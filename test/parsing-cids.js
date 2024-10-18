
import { equal, throws } from 'node:assert';
import { readFile } from 'node:fs/promises';
import makeRel from './rel.js';
import { parseCID, hash, CODECS } from "catboat";

const rel = makeRel(import.meta.url);

let wtfData, wtfHash;
const wtf = 'k2cx9is2yavhu7l74wtw7enigx8xyikvkyhnqjz8xgk5reer38v91jul';
// base36 - cidv1 - raw - (blake3 : 256 : 62C6F749C80A27813A84066B92A6FDC37FD83779BF9D64F1F1A3692CF3A7DFBD)

before(async () => {
  wtfData = await readFile(rel('fixtures/wtf.jpg'));
  wtfHash = await hash(wtfData);
});
describe('CID parsing', () => {
  it('parses a valid CID', () => {
    const { version, codec, hash, hashType } = parseCID(wtf);
    equal(version, 1, 'version must be 1');
    equal(codec, CODECS.raw, 'codec must be raw');
    equal(hashType, 'blake3', 'hash type must be blake3');
    equal(hash, wtfHash, 'hash must be the right one');
  });
  it('refuses to parse invalid LUCIDs', () => {
    throws(() => parseCID('QmNprJ78ovcUuGMoMFiihK7GBpCmH578JU8hm43uxYQtBw'), /CIDv0 is not supported/, 'no v0');
    throws(() => parseCID('zb2rhe5P4gXftAwvA4eXQ5HJwsER2owDyS9sKaQRRVQPn93bA'), /Only base36 lowercase is supported/, 'only b36');
    throws(() => parseCID('k'), /Empty CID/, 'no empty');
    throws(() => parseCID('k4cx9is2yavhu7l74wtw7enigx8xyikvkyhnqjz8xgk5reer38v91jul'), /Only version 1 is supported/, 'no v2');
    throws(() => parseCID('k2jn92crxvj3lh7ekv0mwv4gul75xzm141qiz5dhx9clipbs3eusi3vg'), /Unsupported CID codec/, 'limited codecs');
    throws(() => parseCID('k2cwuedmosc65hhh0bee97q5jx3fe55tiyqzep8vgds83agps9dof3da'), /The only supported hash type is Blake3/, 'only blake3');
    // XXX Not testing the below yet
    // throws(() => parseCID('bafkr4ejfguvoa2fvjkj66yeufqef3ir2ginh66mfde4raiq42t7775p7wy'), /Wrong size for Blake3 hash/, 'wrong blake3');
  });
});

// describe('CID minting', () => {
//   it('mints a valid CID for bytes', async () => {
//     const cid = await fromRaw(wtfData);
//     equal(cid, wtf, 'CID is correct');
//   });
// });
