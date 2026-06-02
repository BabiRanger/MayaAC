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
    "Your name is Lela.\n"
    "You are a friendly, helpful, and highly detailed tutor for electrical engineering students.\n"
    "Your specialty is AC circuit analysis.\n"
    "CRITICAL TUTORING RULE: You MUST explain your reasoning step-by-step. Do not just give the final answer. "
    "Break down the physics and math logically, explaining the 'WHY' behind each step so a beginner can fully understand the concept.\n"
    "Do not answer questions unrelated to electrical engineering, circuits, or physics.\n"
    "If the user asks an unrelated question, politely decline and steer the conversation back to AC circuits.\n\n"
    "IMPORTANT FORMATTING RULE:\n"
    "You must format ALL mathematical equations using standard dollar signs. "
    "Use single $ for inline math and double $$ for display math. "
    "DO NOT EVER use \\( \\) or \\[ \\] for equations."
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

        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=history,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                safety_settings=[
                    types.SafetySetting(
                        category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold=types.HarmBlockThreshold.BLOCK_ONLY_HIGH
                    ),
                ]
            )
        )
        
        return jsonify({"reply": response.text})
    
    except Exception as e:
        print(f"Error calling AI: {e}")
        # Send a specific message if it's a quota issue
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
             return jsonify({"error": "Rate limit exceeded. Please wait 30 seconds."}), 429
        return jsonify({"error": "Failed to get response"}), 500

@app.route('/reference')
def reference():
    return render_template('reference.html')

if __name__ == '__main__':
    app.run(debug=True)
