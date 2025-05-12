# --- The process_transcript function to be imported ---
# Modified to accept the 'chain' object as an argument
async def process_transcript(chain, transcript_text: str):
    """
    Processes a transcript using the Langchain chain.

    Args:
        chain: The configured Langchain Runnable chain.
        transcript_text: The text content of the transcript.
    Returns:
        A dictionary containing the extracted information.
    """
    try:
        # Now calling the invoke method on the passed-in chain object
        result = await chain.invoke({"transcript": transcript_text})
        return result
    except Exception as e:
        print(f"An error occurred during chain execution: {e}")
        return None
# --- End of your existing Langchain code ---

# Note: The __main__ block from your Langchain file is not needed
# in the file that is imported by the Flask app.
