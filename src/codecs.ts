
const enum CIDCodec {
  raw = 0x55,
  dagCBOR = 0x71,
};
const CODECS = {
  raw: CIDCodec.raw,
  dagCBOR: CIDCodec.dagCBOR,
};

export { CODECS, CIDCodec };
