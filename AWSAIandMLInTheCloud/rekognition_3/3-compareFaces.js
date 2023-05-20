import { RekognitionClient, SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";
import fs from "fs";

// Set the AWS Region
const REGION = "us-east-1"; // Replace with your desired region

// Create a new Rekognition client object
const rekognitionClient = new RekognitionClient({ region: REGION });

// Read the local image data from a file
const image = fs.readFileSync("face1.jpg");

// search and compare local image with faces stored in the collection
const searchFacesByImage = async () => {
  try {
    const params = {
      CollectionId: "faces",
      FaceMatchThreshold: 80,
      MaxFaces: 1,
      Image: { Bytes: image },
    };

    const searchFacesCommand = new SearchFacesByImageCommand(params);
    const response = await rekognitionClient.send(searchFacesCommand);
    console.log("Faces compared:", response);

    // Check if there's a match
    if (response.FaceMatches.length > 0) {
      const face = response.FaceMatches[0].Face;
      console.log("Face matched with ID:", face.FaceId);
      if (face.FaceId === "82c7fc89-5798-4575-a5d4-446ec67acd44") {
        console.log("Face matches the stored face.");
      } else {
        console.log("Face does not match the stored face.");
      }
    } else {
      console.log("No matching face found.");
    }
  } catch (error) {
    console.log("Error comparing faces:", error);
  }
};

searchFacesByImage();
