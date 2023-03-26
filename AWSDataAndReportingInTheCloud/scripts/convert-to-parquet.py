import os
import pandas as pd

# set input and output directories
input_directory = '../transformed_data'
output_directory = '../parquet_format'

if not os.path.exists(output_directory):
    os.makedirs(output_directory)

# get the list of CSV files in the current directory
csv_files = [f for f in os.listdir(input_directory) if f.endswith('.csv')]

# loop through each file and convert it to Parquet format
for csv_file in csv_files:
    input_filepath = os.path.join(input_directory, csv_file)
    # read the CSV file into a pandas DataFrame
    df = pd.read_csv(input_filepath)
    
    # create the output file path for the Parquet file
    parquet_file = os.path.join(output_directory, f"p_{os.path.splitext(csv_file)[0]}.parquet")
    print(parquet_file)
    
    # write the DataFrame to the Parquet file
    df.to_parquet(parquet_file)
