import { RekognitionClient, IndexFacesCommand } from "@aws-sdk/client-rekognition";
import fs from "fs";

// Set the AWS Region
const REGION = "us-east-1"; // update to your region

// Create a new Rekognition client object and configure it
const rekogClient = new RekognitionClient({ region: REGION });

// Read the local image data
const image = fs.readFileSync("face1.jpeg");

// Add a face to the Rekognition collection
const addFace = async () => {
  try {
    const indexFacesCommand = new IndexFacesCommand({
      CollectionId: "faces",
      DetectionAttributes: ["DEFAULT"],
      ExternalImageId: "face1.jpg",
      Image: { Bytes: image },
    });
    const indexFacesResponse = await rekogClient.send(indexFacesCommand);
    console.log("Face indexed:", indexFacesResponse);
  } catch (error) {
    console.log("Error adding face:", error);
  }
};

addFace();
