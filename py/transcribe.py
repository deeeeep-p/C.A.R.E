# Add these imports at the top of the file
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from groq import Groq
from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__)
load_dotenv()

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize Groq client
groq = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        print('Received request to transcribe audio')
        if 'file' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Save the uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Create transcription using Groq API
        with open(filepath, 'rb') as audio_file:
            transcription = groq.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3",
                response_format="verbose_json"
            )

        # Clean up the temporary file
        os.remove(filepath)

        # Return just the transcribed text
        return jsonify({'text': transcription.text})

    except Exception as error:
        print('Transcription error:', str(error))
        return jsonify({'error': str(error)}), 500

# Add this at the bottom of your file
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)