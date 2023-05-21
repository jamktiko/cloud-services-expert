// Import required AWS SDK clients and commands for Node.js
import { DetectLabelsCommand, RekognitionClient } from "@aws-sdk/client-rekognition";

// Set the AWS Region
const REGION = "us-east-1"; // update to your region

// Create a new Rekognition client object and configure it
const rekogClient = new RekognitionClient({
  region: REGION,
});

const bucket = "rekog-b-st"; // update to your own bucket
const photo = "mum.jpeg"; // fix this

// Set params
const params = {
  Image: {
    S3Object: {
      Bucket: bucket,
      Name: photo,
    },
  },
};

async function detect_labels() {
  try {
    const response = await rekogClient.send(new DetectLabelsCommand(params));
    console.log(response.Labels);
    response.Labels.forEach((label) => {
      console.log(`Confidence: ${label.Confidence}`);
      console.log(`Name: ${label.Name}`);
      console.log("Instances:");
      label.Instances.forEach((instance) => {
        console.log(instance);
      });
      console.log("Parents:");
      label.Parents.forEach((name) => {
        console.log(name);
      });
      console.log("-------");
    });
    return response;
  } catch (err) {
    console.log("Error", err);
  }
}

detect_labels();
