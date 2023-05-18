import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AWS = require('aws-sdk');
const fs = require('fs');

// Set up AWS credentials
AWS.config.update({
  accessKeyId: 'ASIAZEBZWQIDSHIAIV2X',
  secretAccessKey: 'H5euJJShvX6c2iPCj3A5Fmv4d/2XHHqqRtKFdxyW',
  sessionToken: 'FwoGZXIvYXdzEPj//////////wEaDJKW2qWHIKqRkqNdBiLPAf/swXd/PRQQga6PRZbHYCZ1izxwrizAvse5ZLuDiwzP3zmqnpZJ88BtOgfw52iZbIpw0BR7wbRbgPebSXfoDCjMTEM1hX3V0f8gpyjYCByeBwYZrfHX9Ql9wFsQXpe5wvgaj9MAxLq0uiC9DQubzlFY68Y73YmzQPP8mIDNCVEJV6jP+XepGST+9zAFEuyTgrZqPk0ZbJEcXhQkUmS36v5K9q7JoJcXMc4HnGMl3KCYWIU0TVPpOwKn7ejZg+7zUKzTv7wx2LxJfezW//4pxSjDzN6hBjItUWxY52mS/TLHu7zBL+Olks8CRXHeLjQGVbux9lncrKP3E42LIT99haGlL7Iy',
  region: 'us-east-1'
});

// Create a new Rekognition client object
const rekognition = new AWS.Rekognition();

// Specify the name of the collection
const collectionName = 'faces';

// Read the image data from a file
const image = fs.readFileSync('image.jpeg');

// Create the Rekognition collection
rekognition.createCollection({ CollectionId: collectionName }, (err, data) => {
  if (err) {
    console.log('Error creating collection:', err);
  } else {
    console.log('Collection created:', data);
  
    // Add the image to the collection
    rekognition.indexFaces({
      CollectionId: collectionName,
      Image: { Bytes: image },
      ExternalImageId: 'image.jpg'
    }, (err, data) => {
      if (err) {
        console.log('Error indexing face:', err);
      } else {
        console.log('Face indexed:', data);
      }
    });
  }
});
