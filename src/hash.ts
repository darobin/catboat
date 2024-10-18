
import { blake3 } from 'hash-wasm';

export default async function hash (arr: Uint8Array): Promise<string> {
  return await blake3(arr);
}
