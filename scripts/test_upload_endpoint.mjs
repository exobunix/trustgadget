import { uploadToImageKit } from '../src/lib/imagekit.js';

async function testLib() {
  const sampleBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  console.log('Testing uploadToImageKit helper...');
  const res = await uploadToImageKit(sampleBase64, `sample_${Date.now()}.png`, 'categories');
  console.log('Upload helper result:', res);
  if (!res.success) throw new Error(res.error);
}

testLib().catch(console.error);
