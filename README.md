
# catboat — Content Addressing ToolBox Of Assorted Tools

Catboat is a batteries-included and opinionated yet lightweight toolbox for operating or
interacting with a content addressing system. The approach taken can be summarised as:

1. Optionality increases implementation cost and hurts interoperability. As much as possible
   Catboat only supports one way of doing anything (though extensibility points exist).
2. Flexible power comes from assembling small bricks that do one thing well. Every piece of
   functionality is self-contained but designed to play well with others.
3. It has no DHT and therefore it works. Instead of relying on a global DHT that is hard to
   maintain and has poor latency, Catboat is meant to integrate with existing transports
   such as HTTPS, Iroh, or ATProto.

Both ESM and CJS modules are provided, as well as Typescript types.

## API

### `CID = parseCID(cid)`

```js
import { parseCID } from 'catboat';
// or import parseCID from 'catboat/parse-cid';

const cid = parseCID('k2cx9is2yavhu7l74wtw7enigx8xyikvkyhnqjz8xgk5reer38v91jul');
```

Takes a CID (Content IDentifier) and parses it into its component parts:
- `version`: always `1`.
- `codec`: either `CIDCodec.raw` (`0x55`) or `CIDCodec.dagCBOR` (`0x71`).
- `hash`: a lowercase-hex string representing the hash.
- `hashType`: always `blake3`.

Throws if the CID is invalid.

The CIDs we use are a compatible strict-subset of IPFS CIDs. Most IPFS CIDs will
be rejected but the CIDs that Catboat supports all work with IPFS systems. They are
constrained to being:

1. Only v1, no v0.
2. Only base36 multibase lowercase encoding (the k prefix) for the string, human-readable encoding.
3. Only the raw-binary codec (0x55) and dag-cbor (0x71).
4. Only Blake3 hashes (0x1e).
5. No blocks.
6. This set of options has the added advantage that no varint processing is required.

These are known as "LUCIDs" which stands for "Lightweight Universal CIDs."

### `stringHash = await hash(uint8Arr)`

```js
import { hash } from 'catboat';
// or import hash from 'catboat/hash';

const h = await hash(someBytes);
```

Takes a `Uint8Array` of bytes and returns a promise that resolves to a lowercase-hex representation
of the Blake3 hash.
