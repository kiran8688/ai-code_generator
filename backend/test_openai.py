import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env
backend_dir = Path(__file__).parent
env_path = backend_dir / '.env'
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("OPENAI_API_KEY")
print(f"API Key loaded: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"Key starts with 'sk-': {api_key.startswith('sk-')}")
    print(f"Key length: {len(api_key)}")
    
    # Test OpenAI
    from openai import OpenAI
    try:
        client = OpenAI(api_key=api_key)
        print("✅ OpenAI client created successfully")
        
        # Test a simple API call
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Say 'Hello'"}],
            max_tokens=5
        )
        print(f"✅ OpenAI API call successful: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ OpenAI error: {e}")