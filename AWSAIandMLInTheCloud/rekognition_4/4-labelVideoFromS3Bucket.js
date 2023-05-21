import {
  CreateQueueCommand,
  GetQueueAttributesCommand,
  GetQueueUrlCommand,
  SetQueueAttributesCommand,
  DeleteQueueCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { CreateTopicCommand, SubscribeCommand, DeleteTopicCommand } from "@aws-sdk/client-sns";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SNSClient } from "@aws-sdk/client-sns";
import { RekognitionClient, StartLabelDetectionCommand, GetLabelDetectionCommand } from "@aws-sdk/client-rekognition";
import { stdout } from "process";
import { fromIni } from "@aws-sdk/credential-providers";

// Set the AWS Region.
const REGION = "us-east-1"; // update to your region
const profileName = "default";

// Create SNS service object.
const sqsClient = new SQSClient({
  region: REGION,
  credentials: fromIni({ profile: profileName }),
});
const snsClient = new SNSClient({
  region: REGION,
  credentials: fromIni({ profile: profileName }),
});
const rekClient = new RekognitionClient({
  region: REGION,
  credentials: fromIni({ profile: profileName }),
});

// Set bucket and video variables
const bucket = "some-b-1234976";
const videoName = "sample_scaled.mov";
const roleArn = "arn:aws:iam::167942655649:role/LabRole";
let startJobId = "";

let ts = Date.now();
const snsTopicName = "AmazonRekognitionExample" + ts;
const snsTopicParams = { Name: snsTopicName };
const sqsQueueName = "AmazonRekognitionQueue-" + ts;

// Set the parameters
const sqsParams = {
  QueueName: sqsQueueName, //SQS_QUEUE_URL
  Attributes: {
    DelaySeconds: "60", // Number of seconds delay.
    MessageRetentionPeriod: "86400", // Number of seconds delay.
  },
};

const createTopicandQueue = async () => {
  try {
    // Create SNS topic
    const topicResponse = await snsClient.send(new CreateTopicCommand(snsTopicParams));
    const topicArn = topicResponse.TopicArn;
    console.log("Success", topicResponse);
    // Create SQS Queue
    const sqsResponse = await sqsClient.send(new CreateQueueCommand(sqsParams));
    console.log("Success", sqsResponse);
    const sqsQueueCommand = await sqsClient.send(new GetQueueUrlCommand({ QueueName: sqsQueueName }));
    const sqsQueueUrl = sqsQueueCommand.QueueUrl;
    const attribsResponse = await sqsClient.send(
      new GetQueueAttributesCommand({ QueueUrl: sqsQueueUrl, AttributeNames: ["QueueArn"] })
    );
    const attribs = attribsResponse.Attributes;
    console.log(attribs);
    const queueArn = attribs.QueueArn;
    // subscribe SQS queue to SNS topic
    const subscribed = await snsClient.send(
      new SubscribeCommand({ TopicArn: topicArn, Protocol: "sqs", Endpoint: queueArn })
    );
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "MyPolicy",
          Effect: "Allow",
          Principal: { AWS: "*" },
          Action: "SQS:SendMessage",
          Resource: queueArn,
          Condition: {
            ArnEquals: {
              "aws:SourceArn": topicArn,
            },
          },
        },
      ],
    };

    const response = sqsClient.send(
      new SetQueueAttributesCommand({ QueueUrl: sqsQueueUrl, Attributes: { Policy: JSON.stringify(policy) } })
    );
    console.log(response);
    console.log(sqsQueueUrl, topicArn);
    return [sqsQueueUrl, topicArn];
  } catch (err) {
    console.log("Error", err);
  }
};

const startLabelDetection = async (roleArn, snsTopicArn) => {
  try {
    //Initiate label detection and update value of startJobId with returned Job ID
    const labelDetectionResponse = await rekClient.send(
      new StartLabelDetectionCommand({
        Video: { S3Object: { Bucket: bucket, Name: videoName } },
        NotificationChannel: { RoleArn: roleArn, SNSTopicArn: snsTopicArn },
      })
    );
    startJobId = labelDetectionResponse.JobId;
    console.log(`JobID: ${startJobId}`);
    return startJobId;
  } catch (err) {
    console.log("Error", err);
  }
};

const getLabelDetectionResults = async (startJobId) => {
  console.log("Retrieving Label Detection results");
  // Set max results, paginationToken and finished will be updated depending on response values
  let maxResults = 10;
  let paginationToken = "";
  let finished = false;

  // Begin retrieving label detection results
  while (finished == false) {
    let response = await rekClient.send(
      new GetLabelDetectionCommand({
        JobId: startJobId,
        MaxResults: maxResults,
        NextToken: paginationToken,
        SortBy: "TIMESTAMP",
      })
    );
    // Log metadata
    console.log(`Codec: ${response.VideoMetadata.Codec}`);
    console.log(`Duration: ${response.VideoMetadata.DurationMillis}`);
    console.log(`Format: ${response.VideoMetadata.Format}`);
    console.log(`Frame Rate: ${response.VideoMetadata.FrameRate}`);
    console.log();
    // For every detected label, log label, confidence, bounding box, and timestamp
    response.Labels.forEach((labelDetection) => {
      let label = labelDetection.Label;
      console.log(`Timestamp: ${labelDetection.Timestamp}`);
      console.log(`Label: ${label.Name}`);
      console.log(`Confidence: ${label.Confidence}`);
      console.log("Instances:");
      label.Instances.forEach((instance) => {
        console.log(`Confidence: ${instance.Confidence}`);
        console.log("Bounding Box:");
        console.log(`Top: ${instance.Confidence}`);
        console.log(`Left: ${instance.Confidence}`);
        console.log(`Width: ${instance.Confidence}`);
        console.log(`Height: ${instance.Confidence}`);
        console.log();
      });
      console.log();
      // Log parent if found
      console.log("   Parents:");
      label.Parents.forEach((parent) => {
        console.log(`    ${parent.Name}`);
      });
      console.log();
      // Searh for pagination token, if found, set variable to next token
      if (String(response).includes("NextToken")) {
        paginationToken = response.NextToken;
      } else {
        finished = true;
      }
    });
  }
};

// Checks for status of job completion
const getSQSMessageSuccess = async (sqsQueueUrl, startJobId) => {
  try {
    // Set job found and success status to false initially
    let jobFound = false;
    let succeeded = false;
    let dotLine = 0;
    // while not found, continue to poll for response
    while (jobFound == false) {
      let sqsReceivedResponse = await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: sqsQueueUrl,
          MaxNumberOfMessages: "ALL",
          MaxNumberOfMessages: 10,
        })
      );
      if (sqsReceivedResponse) {
        let responseString = JSON.stringify(sqsReceivedResponse);
        if (!responseString.includes("Body")) {
          if (dotLine < 40) {
            console.log(".");
            dotLine = dotLine + 1;
          } else {
            console.log("");
            dotLine = 0;
          }
          stdout.write("", () => {
            console.log("");
          });
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }
      }

      // Once job found, log Job ID and return true if status is succeeded
      for (let message of sqsReceivedResponse.Messages) {
        console.log("Retrieved messages:");
        let notification = JSON.parse(message.Body);
        let rekMessage = JSON.parse(notification.Message);
        let messageJobId = rekMessage.JobId;
        if (String(rekMessage.JobId).includes(String(startJobId))) {
          console.log("Matching job found:");
          console.log(rekMessage.JobId);
          jobFound = true;
          console.log(rekMessage.Status);
          if (String(rekMessage.Status).includes(String("SUCCEEDED"))) {
            succeeded = true;
            console.log("Job processing succeeded.");
            let sqsDeleteMessage = await sqsClient.send(
              new DeleteMessageCommand({ QueueUrl: sqsQueueUrl, ReceiptHandle: message.ReceiptHandle })
            );
          }
        } else {
          console.log("Provided Job ID did not match returned ID.");
          let sqsDeleteMessage = await sqsClient.send(
            new DeleteMessageCommand({ QueueUrl: sqsQueueUrl, ReceiptHandle: message.ReceiptHandle })
          );
        }
      }
    }
    return succeeded;
  } catch (err) {
    console.log("Error", err);
  }
};

// Start label detection job, sent status notification, check for success status
// Retrieve results if status is "SUCEEDED", delete notification queue and topic
const runLabelDetectionAndGetResults = async () => {
  try {
    const sqsAndTopic = await createTopicandQueue();
    const startLabelDetectionRes = await startLabelDetection(roleArn, sqsAndTopic[1]);
    const getSQSMessageStatus = await getSQSMessageSuccess(sqsAndTopic[0], startLabelDetectionRes);
    console.log(getSQSMessageSuccess);
    if (getSQSMessageSuccess) {
      console.log("Retrieving results:");
      const results = await getLabelDetectionResults(startLabelDetectionRes);
    }
    const deleteQueue = await sqsClient.send(new DeleteQueueCommand({ QueueUrl: sqsAndTopic[0] }));
    const deleteTopic = await snsClient.send(new DeleteTopicCommand({ TopicArn: sqsAndTopic[1] }));
    console.log("Successfully deleted.");
  } catch (err) {
    console.log("Error", err);
  }
};

runLabelDetectionAndGetResults();
