import os
import json
from flask import Flask, request, jsonify
import asyncio
from dotenv import load_dotenv


# Langchain imports
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# JSON output format instructions
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

# Langchain chain definition
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

chain = (
    prompt.partial(json_format_instructions=json_format_instructions)
    | llm
    | output_parser
)

# Async function to process the transcript
async def process_transcript(transcript_text: str):
    """
    Processes a transcript using the Langchain chain.
    Args:
        transcript_text: The text content of the transcript.
    Returns:
        A dictionary containing the extracted information.
    """
    try:
        result = chain.invoke({"transcript": transcript_text})
        return result
    except Exception as e:
        print(f"An error occurred during chain execution: {e}")
        return None

# Flask app setup
app = Flask(__name__)

@app.route('/process', methods=['POST'])
def handle_process_request():
    """
    Handles POST requests to process a transcript using the Langchain chain.
    Expects a JSON request body with a 'transcript' key.
    """
    request_data = request.get_json()

    if not request_data or 'transcript' not in request_data:
        return jsonify({"error": "Invalid request body. Expected JSON with 'transcript' key."}), 400

    transcript = request_data.get('transcript')

    if not transcript:
        return jsonify({"error": "Transcript value is empty."}), 400

    try:
        # Run async processing inside sync Flask
        processed_data = asyncio.run(process_transcript(transcript))

        if processed_data is None:
            return jsonify({"error": "Failed to process transcript"}), 500

        return jsonify(processed_data), 200

    except Exception as e:
        print(f"An unexpected error occurred in route handler: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)
