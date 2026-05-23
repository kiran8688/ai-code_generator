import json
import re
import hashlib
import time
import os
import sys
from pathlib import Path
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import openai
from dotenv import load_dotenv

# ================= CONFIG =================
# Get the parent directory (backend folder) path
current_file = Path(__file__).resolve()  # /path/to/backend/app/app.py
backend_dir = current_file.parent.parent  # /path/to/backend
env_path = backend_dir / '.env'  # /path/to/backend/.env

print(f"📁 Current file location: {current_file}")
print(f"📁 Backend directory: {backend_dir}")
print(f"📄 Looking for .env at: {env_path}")
print(f"📄 .env file exists: {env_path.exists()}")

# Load environment variables from .env file in backend folder
load_dotenv(dotenv_path=env_path)

# Get API key from environment variable
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Debug: Check if API key is loaded
print(f"🔑 OPENAI_API_KEY loaded: {'✅ Yes' if OPENAI_API_KEY else '❌ No'}")
if OPENAI_API_KEY:
    print(f"   Key starts with 'sk-': {'✅ Yes' if OPENAI_API_KEY.startswith('sk-') else '❌ No'}")
    print(f"   Key length: {len(OPENAI_API_KEY)}")
    # Show masked version for security
    if len(OPENAI_API_KEY) > 14:
        masked_key = OPENAI_API_KEY[:10] + "..." + OPENAI_API_KEY[-4:]
        print(f"   Key (masked): {masked_key}")

# Initialize OpenAI - Using 0.28.1 API style
client_initialized = False
if OPENAI_API_KEY and OPENAI_API_KEY.startswith("sk-"):
    try:
        # Set the API key (0.28.1 style)
        openai.api_key = OPENAI_API_KEY
        client_initialized = True
        print("✅ OpenAI API key configured successfully")
    except Exception as e:
        print(f"❌ Error configuring OpenAI: {e}")
        client_initialized = False
else:
    print("⚠️ Warning: OpenAI API key not configured or invalid")

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "secret-key-for-development")
CORS(app)  # Enable CORS for React frontend

# ================= BACKEND LOGIC =================
class StreamingCodeGenerator:
    def __init__(self):
        self.response_cache = {}

    def generate_streaming_code(self, language, dev_type, prompt, complexity):
        # Unique cache key
        cache_key = hashlib.md5(f"{language}_{dev_type}_{prompt}_{complexity}".encode()).hexdigest()

        # Check cache first
        if cache_key in self.response_cache:
            code = self.response_cache[cache_key]
            chunk_size = 5
            for i in range(0, len(code), chunk_size):
                chunk = code[i:i+chunk_size]
                yield self.sse({
                    "type": "token",
                    "token": chunk,
                    "progress": min(99, (i / len(code)) * 100)
                })
                time.sleep(0.02)  # Small delay to simulate streaming
            yield self.sse({"type": "complete", "message": "Cached"})
            return

        # Check if OpenAI client is initialized
        if not client_initialized:
            yield self.sse({"type": "error", "message": "OpenAI API key not configured"})
            return

        # Call OpenAI Stream - Using 0.28.1 API
        try:
            # Create streaming completion
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"You are a specific {language} coding assistant. Write clean, efficient code."},
                    {"role": "user", "content": f"Write a {complexity} {language} {dev_type} for: {prompt}. Only output the code, no markdown backticks."}
                ],
                temperature=0.3,
                max_tokens=1500,
                stream=True
            )

            full_code = ""
            for chunk in response:
                # Handle streaming response for 0.28.1
                if hasattr(chunk, 'choices') and chunk.choices:
                    choice = chunk.choices[0]
                    if hasattr(choice, 'delta') and hasattr(choice.delta, 'content'):
                        token = choice.delta.content
                        if token:
                            full_code += token
                            yield self.sse({
                                "type": "token",
                                "token": token,
                                "progress": 50
                            })

            # Clean and Cache
            full_code = self.clean_code(full_code)
            self.response_cache[cache_key] = full_code
            yield self.sse({"type": "complete", "message": "Done"})

        except Exception as e:
            yield self.sse({"type": "error", "message": str(e)})

    def clean_code(self, code):
        # Remove markdown fences if present
        code = re.sub(r"^```[a-z]*\n", "", code)
        code = re.sub(r"\n```$", "", code)
        return code.strip()

    def sse(self, data):
        return f"data: {json.dumps(data)}\n\n"

generator = StreamingCodeGenerator()

@app.route("/")
def index():
    return jsonify({
        "message": "AI Code Generator API",
        "endpoints": {
            "health": "/api/health",
            "generate": "/api/stream-generate",
            "analyze": "/api/analyze-code"
        },
        "python_version": sys.version,
        "openai_version": getattr(openai, '__version__', 'unknown')
    })

@app.route("/api/health")
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "api_key_configured": client_initialized,
        "openai_initialized": client_initialized,
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}"
    })

@app.route("/api/stream-generate")
def stream_generate():
    """Streaming code generation endpoint"""
    language = request.args.get("language", "python")
    dev_type = request.args.get("devType", "function")
    prompt = request.args.get("prompt", "")
    complexity = request.args.get("complexity", "medium")

    if not prompt:
        return Response("data: {\"type\":\"error\",\"message\":\"Prompt required\"}\n\n", mimetype="text/event-stream")

    return Response(
        stream_with_context(generator.generate_streaming_code(language, dev_type, prompt, complexity)),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*"
        }
    )

@app.route("/api/analyze-code", methods=["POST"])
def analyze_code():
    """Code analysis endpoint"""
    # Check if OpenAI client is initialized
    if not client_initialized:
        return jsonify(success=False, error="OpenAI API key not configured")
    
    data = request.json
    code = data.get("code", "")
    prompt = data.get("prompt", "")
    test_input = data.get("testInput", "N/A")
    expected = data.get("expectedOutput", "N/A")

    if not code:
        return jsonify(success=False, error="No code provided")

    # Construct Analysis Prompt
    analysis_prompt = f"""
    Analyze this code generated for the prompt: "{prompt}".
    
    Code:
    {code}
    
    Test Input: {test_input}
    Expected Output: {expected}
    
    Provide a JSON response with exactly these keys:
    - accuracy (0-100 integer)
    - coverage (string percentage)
    - completeness (string percentage)
    - efficiency (0-10 integer)
    - issues (list of strings, max 3)
    - suggestions (list of strings, max 3)
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are a code QA bot. Output strict JSON."},
                      {"role": "user", "content": analysis_prompt}],
            temperature=0.2
        )
        
        content = response.choices[0].message.content
        
        # Try to parse JSON, with fallback
        try:
            metrics = json.loads(content)
        except json.JSONDecodeError:
            # If not valid JSON, extract JSON from response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                metrics = json.loads(json_match.group())
            else:
                # Return default metrics
                metrics = {
                    "accuracy": 75,
                    "coverage": "75%",
                    "completeness": "80%",
                    "efficiency": 7,
                    "issues": ["Could not parse full analysis"],
                    "suggestions": ["Check code manually for best results"]
                }
        
        return jsonify(success=True, metrics=metrics)
    
    except Exception as e:
        return jsonify(success=False, error=str(e))

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 Starting AI Code Generator Backend")
    print("="*50)
    print(f"🐍 Python version: {sys.version}")
    print(f"🤖 OpenAI version: {getattr(openai, '__version__', 'unknown')}")
    print("📁 App location: backend/app/")
    print("📁 .env location: backend/.env")
    print("🌐 Server will run at: http://localhost:5000")
    print("📊 API health: http://localhost:5000/api/health")
    print("="*50 + "\n")
    
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)