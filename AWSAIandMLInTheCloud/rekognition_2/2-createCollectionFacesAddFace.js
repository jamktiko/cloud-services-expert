import { RekognitionClient, CreateCollectionCommand, IndexFacesCommand } from "@aws-sdk/client-rekognition";
import fs from "fs";

// Set the AWS Region
const REGION = "us-east-1"; // update to your region

// Create a new Rekognition client object and configure it
const rekogClient = new RekognitionClient({ region: REGION });

// Specify the name of the collection
const collectionName = "faces";

// Read the image data from a file
const image = fs.readFileSync("image.jpeg");

// Create the Rekognition collection
const createCollection = async () => {
  try {
    const createCollectionCommand = new CreateCollectionCommand({ CollectionId: collectionName });
    const response = await rekogClient.send(createCollectionCommand);
    console.log("Collection created:", response);

    // Add the image to the collection
    const indexFacesCommand = new IndexFacesCommand({
      CollectionId: collectionName,
      Image: { Bytes: image },
      ExternalImageId: "image.jpg",
    });
    const indexFacesResponse = await rekogClient.send(indexFacesCommand);
    console.log("Face indexed:", indexFacesResponse);
  } catch (error) {
    console.log("Error creating collection:", error);
  }
};

createCollection();
