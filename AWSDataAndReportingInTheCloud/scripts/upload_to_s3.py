import boto3
import os

# create a Boto3 S3 client
s3_client = boto3.client('s3')

input_directory = '../parquet_format'

# set the S3 bucket name and folder name
bucket_name = 'ds-868398'

# list of local parquet files to upload to S3
parquet_files = [f for f in os.listdir(input_directory) if f.endswith('.parquet')]


# loop through each file and upload it to S3
for file_name in parquet_files:
    # set the S3 key (i.e., the S3 object name) use filename as S3 key
    s3_key =  file_name
    
    # set the input_filepath
    input_filepath = os.path.join(input_directory, file_name)
    
    # upload the file to S3
    s3_client.upload_file(input_filepath, bucket_name, s3_key)
    
    print(f'Uploaded {file_name} to s3://{bucket_name}/{s3_key}')
