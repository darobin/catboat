
// Code heavily inspired by js-multiformats, which vendors the following:
// base-x encoding / decoding
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Distributed under the MIT software license, see
// http://www.opensource.org/licenses/mit-license.php.

// XXX TODO
// - [ ] TS
// - [ ] test
// - [ ] check that the CJS gen works

const B36_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

const BASE = 36;
const LEADER = '0';
const FACTOR = Math.log(BASE) / Math.log(256);

const BASE_MAP = new Uint8Array(256);
for (let i = 0; i < BASE_MAP.length; i++) BASE_MAP[i] = 255;
for (let i = 0; i < B36_ALPHABET.length; i++) {
  BASE_MAP[B36_ALPHABET.charAt(i).charCodeAt(0)] = i;
}

const CODECS = {
  raw: 0x55,
  dagCBOR: 0x71,
};
const SUPPORTED_CODECS = new Set(Object.values(CODECS));

const BLAKE3_CODE = 0x1e;
const BLAKE3_SIZE = 32;

// Gets a CID as string or Uint8Array.
// Returns a structure with all components.
// Throws if we don't support it.
export default function parse (cid) {
  let uarr;
  if (typeof cid === 'string') {
    if (cid.length === 46 && /^Qm/.test(cid)) throw new Error('CIDv0 is not supported.');
    if (cid[0] !== 'k') throw new Error('Only base36 lowercase is supported.');
    cid = cid.substring(1);
    if (cid.length === 0) return new Uint8Array();
    let psz = 0;
    let zeroes = 0;
    let length = 0;
    while (cid[psz] === LEADER) {
      zeroes++;
      psz++;
    }
    const size = (((cid.length - psz) * FACTOR) + 1) >>> 0;
    const b256 = new Uint8Array(size);
    while (cid[psz]) {
      let carry = BASE_MAP[cid.charCodeAt(psz)];
      if (carry === 255) return;
      let i = 0;
      for (let it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
        carry += (BASE * b256[it3]) >>> 0;
        b256[it3] = (carry % 256) >>> 0;
        carry = (carry / 256) >>> 0;
      }
      if (carry !== 0) throw new Error('Non-zero carry');
      length = i;
      psz++;
    }
    let it4 = size - length;
    while (it4 !== size && b256[it4] === 0) it4++;
    const vch = new Uint8Array(zeroes + (size - it4));
    let j = zeroes;
    while (it4 !== size) vch[j++] = b256[it4++];
    uarr = vch;
  }
  else {
    uarr = cid;
  }
  // IMPORTANT: we don't process varints because for now we don't need to. See details on makeCID().
  const version = uarr[0];
  if (version !== 1) throw new Error(`Only version 1 is supported, got ${version}.`);
  const codec = uarr[1];
  if (!SUPPORTED_CODECS.has(codec)) throw new Error(`Unsupported CID codec ${codec}`);
  const multihashBytes = uarr.slice(2);
  if (multihashBytes[0] !== BLAKE3_CODE) throw new Error(`The only supported hash type is Blake3, got "${multihashBytes[0]}".`);
  if (multihashBytes[1] !== BLAKE3_SIZE) throw new Error('Wrong size for Blake3 hash.');
  const hash = multihashBytes.slice(2).reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '');
  return { version, codec, codecType: (codec === CODECS.raw) ? 'raw-bytes' : 'dag-cbor', hash, hashType: 'blake3' };
}
