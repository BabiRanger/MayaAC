from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    raise ValueError("GEMINI_API_KEY not found. Make sure to set it in a .env file.")

client = genai.Client(api_key=api_key)

#System Instruction
SYSTEM_INSTRUCTION = (
    "Your name is Maya."
    "You are a friendly, helpful, and concise tutor for electrical engineering students. "
    "Your specialty is AC circuit analysis. "
    "Do not answer questions unrelated to electrical engineering, circuits, or physics. "
    "If the user asks an unrelated question, politely decline and steer the "
    "conversation back to AC circuits.\n\n"
)

#Initialize the Flask application
app = Flask(__name__)

#Define route for homepage
@app.route('/')
def home():
    """Renders the main homepage."""
    return render_template('index.html')

@app.route('/assistant')
def ai_page():
    return render_template('assistant.html')

@app.route('/get_content/<path:filename>') 
def get_content(filename):
    try:
        return render_template(f'content/{filename}.html')
    except Exception as e:
        print(f"Error loading file: {e}")
        return "<p class='text-red-500'>Error: Topic content not found.</p>"
    
@app.route('/exercise')
def exercise():
    return render_template('exercise.html')

@app.route('/api/chat', methods=['POST'])
def handle_chat():
    try:
        data = request.json
        history = data.get('history', [])
        
        if not history:
            return jsonify({"error": "No chat history provided"}), 400
            
        user_message = history[-1]['parts'][0]['text']
        
        # 2. Call the AI using the new SDK format
        response = client.models.generate_content(
            model='gemini-2.5-flash', # Your original model will work now!
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
            )
        )
        
        return jsonify({"reply": response.text})
    
    except Exception as e:
        print(f"DEBUG ERROR: {e}") 
        return jsonify({"error": str(e)}), 500

@app.route('/reference')
def reference():
    return render_template('reference.html')

if __name__ == '__main__':
    app.run(debug=True)
