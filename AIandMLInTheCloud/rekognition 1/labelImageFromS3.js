// Import required AWS SDK clients and commands for Node.js
import { DetectLabelsCommand } from "@aws-sdk/client-rekognition";
import { RekognitionClient } from "@aws-sdk/client-rekognition";
import { fromIni } from '@aws-sdk/credential-providers';

//Set the AWS Region
const REGION = "us-east-1"; //e.g. "us-east-1"

//Create SNS service object.
const rekogClient = new RekognitionClient({
  region: REGION,
  credentials: fromIni({
    profile: 'default',
  }),
});

const bucket = 'rekog-image-jt'
const photo = 'mum.jpeg'

// Set params
const params = {
  Image: {
    S3Object: {
      Bucket: bucket,
      Name: photo
    },
  },
}

async function detect_labels() {
  try {
    const response = await rekogClient.send(new DetectLabelsCommand(params));
    console.log(response.Labels);
    response.Labels.forEach(label => {
      console.log(`Confidence: ${label.Confidence}`);
      console.log(`Name: ${label.Name}`);
      console.log('Instances:');
      label.Instances.forEach(instance => {
        console.log(instance);
      });
      console.log('Parents:');
      label.Parents.forEach(name => {
        console.log(name);
      });
      console.log("-------");
    });
    return response; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
}

detect_labels();
