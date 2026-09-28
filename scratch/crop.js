const Jimp = require('jimp');
async function crop() {
  try {
    const img = await Jimp.read('../public/dremoy.png');
    const h = img.bitmap.height;
    // Crop a square from the left side (width = height)
    img.crop(0, 0, h, h).write('../public/favicon.png');
    console.log('Cropped successfully!');
  } catch (err) {
    console.error('Error cropping:', err);
  }
}
crop();
