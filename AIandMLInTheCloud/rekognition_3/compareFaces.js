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

// Read the local image data from a file
const image = fs.readFileSync('image.jpeg');

// Compare the local image with the stored face
rekognition.searchFacesByImage({
  CollectionId: 'faces',
  FaceMatchThreshold: 80,
  MaxFaces: 1,
  Image: { Bytes: image }
}, (err, data) => {
  if (err) {
    console.log('Error comparing faces:', err);
  } else {
    console.log('Faces compared:', data);

    // Check if there's a match
    if (data.FaceMatches.length > 0) {
      const face = data.FaceMatches[0].Face;
      console.log('Face matched with ID:', face.FaceId);
      if (face.FaceId === 'c20cdd6f-4028-4293-a326-98c26faf59e8') {
        console.log('Face matches the stored face.');
      } else {
        console.log('Face does not match the stored face.');
      }
    } else {
      console.log('No matching face found.');
    }
  }
});
