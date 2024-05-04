export const fetchPortraitImageSource = async (bucket: R2Bucket, key: string | null) => {
  if (!key) return null;

  const r2Object = await bucket.get(`portraits/${key}`);
  if (!r2Object) return null;

  const buffer = await r2Object.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  const binaryString = uint8Array.reduce(
    (binaryString, uint8) => binaryString + String.fromCharCode(uint8),
    ''
  );
  const base64 = btoa(binaryString);

  return `data:image/jpg;base64,${base64}`;
};
