import os
import json
import asyncio # Needed for running async functions from sync context
import pika # RabbitMQ Python client
import threading # Potentially useful if integrating with Flask HTTP later
import datetime # Needed for adding timestamp to results
import sys # To ensure correct import path if needed
import psycopg2 # PostgreSQL client for Python
from psycopg2.extras import RealDictCursor # To get results as dictionaries

# --- Import Langchain components needed to build the chain ---
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables import RunnableSequence
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

# --- Flask Setup (Optional, if you still need Flask endpoints) ---
# from flask import Flask, request, jsonify
# app = Flask(__name__)
# Note: Running a blocking RabbitMQ consumer in the main Flask thread
# will prevent Flask from handling HTTP requests.
# For a proper setup, consider running the consumer in a separate thread/process
# or using an async Flask framework with an async pika client.
# For this example, we focus on the consumer logic as a standalone worker.


# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
# Explicitly set the environment variable for Langchain to pick up
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# --- Database Configuration ---
# Get PostgreSQL connection details from environment variables
DB_NAME = os.getenv("DB_NAME") or 'db123'
DB_USER = os.getenv("DB_USER") or 'user123'
DB_PASSWORD = os.getenv("DB_PASSWORD") or 'password123'
DB_HOST = os.getenv("DB_HOST") or 'localhost'
DB_PORT = os.getenv("DB_PORT") or '5432'


# --- RabbitMQ Configuration ---
# Get RabbitMQ connection URL from environment variables
# Default to localhost if not set (assuming RabbitMQ is running locally)
rabbitmq_url = os.getenv("RABBITMQ_URL") or 'amqp://guest:guest@localhost:5672' # Use your RabbitMQ credentials and host
task_queue_name = 'transcript_processing_queue' # Queue to consume tasks from (Node.js producer sends here)
results_queue_name = 'processing_results_queue' # Queue to publish results to (Node.js consumer listens here)

# --- Build the Langchain Chain (needed by the consumer) ---
# Using the JSON format instructions and chain definition from your previous app.py
json_format_instructions = """
The output should be a JSON object with the following keys:
- depts: A list of strings, where each string is the name of a relevant department or organization the person should contact from the given list("police", "firebrigade", "hospital"). Infer these from the transcript.
- person_name: A string representing the full name of the person speaking or being discussed in the transcript. Extract this directly from the transcript if mentioned. If not explicitly mentioned, state "Unknown".
- summary: A concise string summarizing the main situation or problem described in the transcript.
- key_issues: A list of strings, highlighting the main problems or challenges the person is facing based on the transcript.
- location (optional): A string representing the location mentioned in the transcript, if any. If no specific location is mentioned, omit this key.
- timestamp (optional): A string representing a specific time or date mentioned in the transcript, if any. If no specific time is mentioned, omit this key.
- suggestion(optional):A string representing instructions that the person should follow in their case of emergency (DONOT RECOMMEND CONTACTING emergency services).
"""

prompt = ChatPromptTemplate.from_template(
    """
You are an AI assistant specializing in summarizing transcripts related to personal situations or emergencies.
Your goal is to extract key information from the provided transcript and format it as a JSON object.
{json_format_instructions}
Here is the transcript:
{transcript}
Please provide the output in the specified JSON format.
"""
)

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0)

output_parser = JsonOutputParser()

# The Langchain chain instance
chain = (
    prompt.partial(json_format_instructions=json_format_instructions)
    | llm
    | output_parser
)

# --- PostgreSQL Database Connection Pool (for the worker) ---
# A simple way to manage connections. For high concurrency, consider a proper connection pool library.
def get_db_connection():
    """Establishes and returns a new database connection."""
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        # Optional: Set isolation level if needed
        # conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except psycopg2.OperationalError as e:
        print(f"Database connection failed: {e}")
        # Depending on requirements, you might want to retry or exit
        return None

# --- PostGIS Spatial Lookup Function (Implemented in Python) ---
# This function replaces the Node.js version
# It is now synchronous as it uses a blocking DB client (psycopg2)
def findPlacesWithinRadius(
  centerLat,
  centerLng,
  radiusMeters,
  dept # Assuming dept is the table name (e.g., 'police', 'firebrigade')
):
  print("insidefn")
  """
  Finds places within a given radius from a center point, ordered by distance.
  Uses the specified department name as the table name.
  Returns the closest place found, or None if none found.
  """
  conn = None
  cursor = None
  try:
    conn = get_db_connection()
    if conn is None:
        print("Skipping spatial lookup due to database connection failure.")
        return None

    # Use RealDictCursor to fetch results as dictionaries
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Create a PostGIS GEOGRAPHY point object for the center point.
    # ST_MakePoint expects Longitude, Latitude
    # Use a parameterized query for the point to prevent SQL injection
    centerPoint = "ST_SetSRID(ST_MakePoint(%s, %s), 4326)"

    # Execute the query using ST_DWithin and order by distance
    # ST_DWithin(geometry1, geometry2, distance_in_meters) filters results
    # ST_Distance(geometry1, geometry2) calculates the distance in meters for GEOGRAPHY type
    # Use parameterized queries ($1, $2, $3) for the point coordinates and radius
    # Table name (${dept}) cannot be parameterized directly, so use f-string (be cautious of input validation)
    # Ensure 'dept' is validated against a known list of allowed table names if it comes from external input
    # query = f"""
    #   SELECT
    #     id,
    #     name,
    #     -- Calculate and return the distance in meters
    #     ST_Distance(location, {centerPoint}::geography) AS distance_meters
    #   FROM {dept}
    #   WHERE ST_DWithin(location, {centerPoint}::geography, %s)
    #   ORDER BY
    #     -- Order the results by the calculated distance (closest first)
    #     ST_Distance(location, {centerPoint}::geography)
    #   LIMIT 1; -- Limit to the closest one
    # """
    # query = f"""
    #   SELECT
    #     id,
    #     name,
    #     -- Calculate and return the distance in meters
    #     ST_Distance(location, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography) AS distance_meters
    #   FROM {dept}
    #   WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography, %s)
    #   ORDER BY
    #     -- Order the results by the calculated distance (closest first)
    #     ST_Distance(location, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography)
    #   LIMIT 1; -- Limit to the closest one
    # """
    query = f"""
      SELECT
        id,
        name,
        -- Calculate and return the distance in meters
        ST_Distance(location, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography) AS distance_meters,
        -- Return the latitude and longitude of the location
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lng
      FROM {dept}
      WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography, %s)
      ORDER BY
        -- Order the results by the calculated distance (closest first)
        ST_Distance(location, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography)
      LIMIT 1; -- Limit to the closest one
    """
    # Execute the query with parameters for center point coordinates and radius
    # cursor.execute(query, (centerLng, centerLat, radiusMeters))
    cursor.execute(query, (centerLng, centerLat, centerLng, centerLat, radiusMeters, centerLng, centerLat))

    # Fetch the first row (the closest place)
    closest_place = cursor.fetchone()
    print("cursor",closest_place)

    return closest_place

  except psycopg2.Error as e:
    print(f"Error finding places within radius for dept '{dept}': {e}")
    # Depending on requirements, you might want to raise the exception or return None
    return None
  finally:
    # Ensure cursor and connection are closed
    if cursor:
      cursor.close()
    if conn:
      conn.close()


# --- Asynchronous Langchain Processing Function (adapted from your app.py) ---
# This function needs to be called from a synchronous context (the pika callback)
# We'll use asyncio.run() to execute it.
async def process_transcript_async(transcript_text: str):
    """
    Processes a transcript using the Langchain chain asynchronously.
    Args:
        transcript_text: The text content of the transcript.
    Returns:
        A dictionary containing the extracted information.
    """
    try:
        # The chain.invoke method is asynchronous and should be awaited
        # Assuming chain.invoke is indeed async based on Langchain docs and your previous code structure
        result =  chain.invoke({"transcript": transcript_text})
        return result
    except Exception as e:
        print(f"An error occurred during Langchain chain execution: {e}")
        return None

# --- RabbitMQ Message Processing Callback ---
def on_message_received(ch, method, properties, body):
    """
    Callback function executed when a message is received from the task queue.
    This is where the main processing logic runs.
    """
    print(f" [x] Received message: {body.decode()}")

    try:
        # Parse the message body (assuming it's JSON)
        message_data = json.loads(body)
        transcript = message_data.get('transcript')
        lat = message_data.get('lat')
        lng = message_data.get('lng')
        # Get the unique request ID from the message
        request_id = message_data.get('requestId') # Assuming Node.js adds this
        clientId=message_data.get('clientId')
        # Validate essential message data
        if not all([transcript, lat is not None, lng is not None, request_id]):
            print(" [!] Received invalid message data (missing transcript, lat, lng, or requestId). Skipping and acknowledging.")
            # Acknowledge the message to remove it from the queue,
            # even if invalid, to prevent getting stuck.
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        print(f"Processing request ID: {request_id}")

        # --- Perform the Langchain processing (calling the async function) ---
        # Use asyncio.run() to execute the async Langchain chain from this sync callback
        processed_transcript_data = asyncio.run(process_transcript_async(transcript))

        if processed_transcript_data is None:
            print(f" [!] Transcript processing failed for request ID: {request_id}. Result not published.")
            # Acknowledge the message even if processing failed, to prevent retries on a likely unrecoverable error
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        print(f"Langchain processing complete for request ID: {request_id}")
        # print("Processed Transcript Data:", json.dumps(processed_transcript_data, indent=2))


        # --- Perform the PostGIS spatial lookup ---
        # Extract depts from the processed transcript data. Use the 'depts' key as in your app.py json_format_instructions.
        depts_to_contact = processed_transcript_data.get('depts', [])
        closest_places_results = {} # Store closest place for each dept

        # Perform spatial lookup for the closest place for each relevant department
        radius = 10000 # Define search radius in meters (increased for better chance of finding something)

        # Looping through departments and finding the single closest place for each
        for dept in depts_to_contact:
            try:
                # Call the synchronous findPlacesWithinRadius
                closest_place = findPlacesWithinRadius(lat, lng, radius, dept)
                print("closest_place",closest_place)
                print()

                if closest_place:
                    closest_places_results[dept] = closest_place
                    print(f"Found closest {dept} for request ID: {request_id}")
                else:
                    print(f"No {dept} found within radius for request ID: {request_id}")

            except Exception as e:
                print(f"Error during spatial lookup for {dept} for request ID {request_id}: {e}")
                # Continue to the next department even if one lookup fails


        # --- Prepare the final result message ---
        final_result_payload = {
            "requestId": request_id, # Include the original request ID
            "transcript_analysis": processed_transcript_data, # Data from Langchain
            "closest_nearby_services": closest_places_results, # Closest place for each department
            "status": "completed", # Indicate successful processing
            "timestamp": datetime.datetime.now().isoformat(), # Add timestamp
            "clientId":clientId
        }

        # --- Publish the result message to the results queue ---
        try:
            # It's generally safer to use a separate connection and channel for publishing
            # within a consumer callback to avoid blocking the consuming channel.
            # Re-establishing connection for each publish might be inefficient for high throughput.
            # A more robust approach involves managing a separate publishing connection/channel pool.
            # For simplicity in this example, we open/close for each publish.
            publish_connection = pika.BlockingConnection(pika.URLParameters(rabbitmq_url))
            publish_channel = publish_connection.channel()

            # Declare the results queue. It should be durable.
            # It should also be declared by the Node.js consumer.
            publish_channel.queue_declare(queue=results_queue_name, durable=True)

            publish_channel.basic_publish(
                exchange='', # Using the default exchange
                routing_key=results_queue_name, # Route directly to the results queue
                body=json.dumps(final_result_payload).encode('utf-8'), # Encode JSON to bytes
                properties=pika.BasicProperties(
                    delivery_mode=pika.DeliveryMode.Persistent # Make message durable
                )
            )
            print(f" [x] Published result for request ID: {request_id} to queue '{results_queue_name}'")

            # Close the publish channel and connection
            publish_channel.close()
            publish_connection.close()

        except Exception as e:
            print(f" [!] Error publishing result for request ID {request_id}: {e}")
            # Decide how to handle publish failure: retry? log and move on?
            # For now, we log the error but still acknowledge the task message.

        # --- Acknowledge the message from the task queue ---
        # This tells RabbitMQ that the message has been successfully processed
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f" [x] Acknowledged task message for request ID: {request_id}")

    except Exception as e:
        # Catch any unexpected errors during the message processing callback
        print(f" [!] An unexpected error occurred during message processing for request ID {request_id}: {e}")
        # Decide how to handle these critical errors:
        # - Requeue the message (basic_nack with requeue=True) - might lead to infinite loops if error persists
        # - Send to a dead-letter queue (basic_nack with requeue=False or basic_reject)
        # - Acknowledge and log (as done below) - message is lost but doesn't block the queue
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f" [x] Acknowledged task message after unexpected error for request ID: {request_id}")


# --- RabbitMQ Consumer Setup ---
def start_rabbitmq_consumer():
    """
    Connects to RabbitMQ and starts consuming messages from the task queue.
    This function is blocking and will keep running.
    """
    print(f"Connecting to RabbitMQ at {rabbitmq_url} for consuming...")
    try:
        # Use BlockingConnection for simplicity in a basic worker script
        # For production, consider error handling for connection attempts and retries.
        connection = pika.BlockingConnection(pika.URLParameters(rabbitmq_url))
        channel = connection.channel()

        # Declare the task queue. It should be durable.
        # This queue is where the Node.js producer sends messages.
        channel.queue_declare(queue=task_queue_name, durable=True)
        print(f"Waiting for messages in queue '{task_queue_name}'. To exit press CTRL+C")

        # Set up the consumer
        channel.basic_consume(
            queue=task_queue_name,
            on_message_callback=on_message_received,
            # auto_ack=True # Set to True for automatic acknowledgment (less reliable)
            # Set to False and use ch.basic_ack() manually after processing (more reliable)
            auto_ack=False
        )

        # Start consuming messages (this is a blocking call)
        # This will block the current thread and listen for messages.
        channel.start_consuming()

    except pika.exceptions.AMQPConnectionError as e:
        print(f"Failed to connect to RabbitMQ: {e}")
        print("Retrying connection in 5 seconds...")
        # Retry connection after a delay
        # Using threading.Timer for a simple retry mechanism in a blocking context
        threading.Timer(5.0, start_rabbitmq_consumer).start()
    except KeyboardInterrupt:
        print("\nConsumer stopped by user (CTRL+C).")
        # Attempt to close the connection cleanly
        if 'connection' in locals() and connection.is_open:
            connection.close()
    except Exception as e:
        print(f"An unexpected error occurred in the RabbitMQ consumer setup: {e}")
        # Decide how to handle other errors during setup


# --- Main execution block ---
if __name__ == '__main__':
    print("Python worker starting...")
    # This will start the blocking RabbitMQ consumer loop.
    # This script will now run as a dedicated worker process.
    # If you need to run Flask HTTP endpoints in the same process,
    # you would need a different concurrency model (e.g., running the consumer
    # in a separate thread or process, or using an async framework for Flask
    # and an async RabbitMQ client like aio-pika).
    start_rabbitmq_consumer()

