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
const image = fs.readFileSync('face1.jpg');

// Add the face to the Rekognition collection
rekognition.indexFaces({
    CollectionId: 'faces',
    DetectionAttributes: ['DEFAULT'],
    ExternalImageId: 'face1',
    Image: { Bytes: image }
}, (err, data) => {
    if (err) {
        console.log('Error adding face:', err);
    } else {
        console.log('Face added to collection:', data.FaceRecords[0].Face);
    }
});
