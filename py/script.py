import pandas as pd
import requests

file_path = '/Users/deeppatel/Desktop/majorProj/py/police_stations.csv'

# Try reading with ISO-8859-1 encoding
df = pd.read_csv(file_path, encoding='ISO-8859-1')

url = 'http://localhost:3000/police'

for _, row in df.iterrows():
    data = {
        'name': row['name'],
        'lat': row['lat'],
        'lng': row['lng']
    }
    try:
        response = requests.post(url, json=data)
        print(f"Sent: {data} | Status: {response.status_code}")
    except Exception as e:
        print(f"Failed to send {data}: {e}")
