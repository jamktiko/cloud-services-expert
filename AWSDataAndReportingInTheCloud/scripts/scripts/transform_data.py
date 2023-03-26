import os
import pandas as pd

# set input and output directories
input_directory = '../csv_format'
output_directory = '../transformed_data'

# if output directory does not exist, create it
if not os.path.exists(output_directory):
    os.makedirs(output_directory)
    
for filename in os.listdir(input_directory):
    if filename.endswith('.csv'):
        # read the CSV file into a Pandas DataFrame object
        input_filepath = os.path.join(input_directory, filename)
        df = pd.read_csv(input_filepath)
        
        # create a new column by selecting the first three characters of the 'name' column
        df["Gasoline 95 (€) only"] = df["Gasoline 95"].str[:6].str[2:]
        df["Diesel (€) only"] = df["Diesel"].str[:6].str[2:]
        df["LPG (€) only"] = df["LPG"].str[:6].str[2:]

        # save the resulting DataFrame to a new CSV file with a similar name
        output_filepath = os.path.join(output_directory, f"t_{filename}")
        df.to_csv(output_filepath, index=False)