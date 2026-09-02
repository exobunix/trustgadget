async function testUploadApi() {
  console.log('Testing live /api/upload endpoint with ImageKit...');

  // Create multipart payload
  const blob = new Blob(['sample-image-content-test'], { type: 'image/png' });
  const formData = new FormData();
  formData.append('file', blob, 'test_device_model.png');
  formData.append('folder', 'devices');

  const res = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  console.log('Upload API response status:', res.status);
  console.log('Upload response data:', data);

  if (!data.success || !data.url.includes('ik.imagekit.io/avdarinn')) {
    throw new Error('ImageKit upload verification failed!');
  }
  console.log('✓ Successfully verified live ImageKit upload API!');
}

testUploadApi().catch(console.error);
