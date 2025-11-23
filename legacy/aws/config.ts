import AWS from "aws-sdk";
import S3 from "aws-sdk/clients/s3";

export const UpdateAWS = () => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
  });
};

export const s3 = new S3({
  region: process.env.AWS_REGION,
  apiVersion: "2012-10-17",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  signatureVersion: "v4",
});