import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: 'public_uzSklsoDFlGNoIPGFtTdcYJU32Y=',
  privateKey: 'private_Zgjm0jSmxe2S76y3kkULZ5nzEvo=',
  urlEndpoint: 'https://ik.imagekit.io/avdarinn',
});

async function testFolderNames() {
  const sampleBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const candidates = ['trust_gadget', 'trust-gadget', 'trustgadget', 'trust_gadget/devices', 'trust-gadget/devices'];

  for (const folder of candidates) {
    try {
      console.log(`Trying folder: "${folder}"...`);
      const result = await imagekit.upload({
        file: sampleBase64,
        fileName: `test_${Date.now()}.png`,
        folder: folder,
      });
      console.log(`✓ SUCCESS with folder "${folder}"! URL:`, result.url);
      return folder;
    } catch (err) {
      console.log(`✗ Failed with folder "${folder}":`, err.message);
    }
  }
}

testFolderNames();
