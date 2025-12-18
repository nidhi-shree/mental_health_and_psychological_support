# chatbot.py

"""
Embrace AI - Full Mental Health Companion
-----------------------------------------
This module implements Embrace AI, an advanced mental health chatbot
that provides empathetic conversations, emotional memory, crisis detection,
and wellness tools using Google Gemini API.
"""

from collections import deque
from google import genai

#Importing resources module so that the chatbot can recommend resources when needed
from models.Resource import Resource  
import random 
import os
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ======================================================
# API KEY ROTATION SYSTEM
# ======================================================
# Fetch keys from environment variables
API_KEYS = [
    key for key in [
        os.getenv("GEMINI_API_KEY_1"),
        os.getenv("GEMINI_API_KEY_2"),
        os.getenv("GEMINI_API_KEY_3")
    ] if key # Only add keys that exist
]

# Fallback if no keys in .env (Not recommended for production, but good for local dev if .env missing)
if not API_KEYS:
    print("⚠️ No API Keys found in .env. Using fallback hardcoded key (UNSAFE).")
   

# Current active key index
current_key_index = 0

def get_client():
    """Returns a client with the current active key"""
    global current_key_index
    return genai.Client(api_key=API_KEYS[current_key_index])

def switch_key():
    """Switches to the next API key in the list"""
    global current_key_index
    current_key_index = (current_key_index + 1) % len(API_KEYS)
    print(f"🔄 Switching to API Key #{current_key_index + 1}")

MODEL_NAME = "gemini-2.5-flash"


class EmbraceAI:
    def __init__(self):
        pass

# If the AI API fails, the bot will use these pre-written responses based on keywords.
OFFLINE_RESPONSES = {
    "anxi": [ # Matches anxiety, anxious
        "I hear that you're feeling anxious. Take a gentle breath with me. I'm here to support you through this.",
        "Anxiety can be overwhelming, but it doesn't define you. I'm listening. What's on your mind?",
        "It's okay to feel anxious. You are safe here. Want to try a quick grounding exercise?"
    ],
    "sleep": [ # Matches sleep, insomnia, tired
        "Sleep struggles are so exhausting. I'm sorry you're going through this.",
        "It sounds like rest has been difficult lately. I'm here to keep you company.",
        "Racing thoughts at night are common. Would you like to try a relaxation technique?"
    ],
    "sad": [ # Matches sad, depressed, cry
        "I'm really sorry you're feeling down. It takes courage to sit with these feelings.",
        "It's okay not to be okay. I'm here to listen to whatever you want to share.",
        "Sadness is a heavy weight. You don't have to carry it alone right now."
    ],
    "stress": [ # Matches stress, overwhelmed, busy
        "It sounds like you're carrying a heavy load. Remember to be gentle with yourself.",
        "That sounds incredibly overwhelming. Let's take this one moment at a time.",
        "Stress is a valid response to what you're facing. I'm here for you."
    ],
    "hello": [
        "Hello! I'm Embrace. I'm here to listen and support you. How are you feeling right now?",
        "Hi there. This is a safe space. How can I support you today?"
    ],
    "default": [
        "I'm listening. Please tell me more about that.",
        "I hear you. Thank you for sharing that with me.",
        "I'm here with you. How does that make you feel?",
        "That sounds important. I'm listening."
    ]
}
def get_fallback_response(message):
    """Returns a scripted response if the AI API fails"""
    msg = message.lower()
    
    # Check for keywords
    for key in OFFLINE_RESPONSES:
        if key in msg and key != "default":
            return random.choice(OFFLINE_RESPONSES[key])
            
    # Default fallback
    return random.choice(OFFLINE_RESPONSES["default"])


# ======================================================
# MEMORY (A+B)
# ======================================================
conversation_memory = deque(maxlen=6)

def add_to_memory(role, text, sentiment=None, theme=None):
    conversation_memory.append({
        "role": role,
        "text": text,
        "sentiment": sentiment,
        "theme": theme,
    })

def generate_with_retry(prompt, retries=3):
    """
    Tries to generate content. If 429 (Rate Limit) occurs, 
    switches to the next API key and retries immediately.
    """
    for attempt in range(retries):
        try:
            # DYNAMIC CLIENT CREATION (Replaces the global client)
            client = get_client() 
            if not client: return None

            return client.models.generate_content(
                model=MODEL_NAME, 
                contents=prompt
            )
        except Exception as e:
            error_msg = str(e).lower()
            print(f"⚠️ API attempt {attempt+1} failed: {e}")
            
            # If Rate Limited (429) or Overloaded (503) -> Switch Key
            if "429" in error_msg or "quota" in error_msg or "503" in error_msg:
                switch_key()
                # If we have multiple keys, try again immediately.
                if len(API_KEYS) > 1:
                    time.sleep(1) 
                    continue
                else:
                    return None # No backups, trigger offline fallback
            
            time.sleep(1)
            
    return None # Trigger offline fallback if all retries fail

# ======================================================
# SENTIMENT + THEME DETECTION (B)
# ======================================================
def analyze_sentiment(message: str):
    m = message.lower()
    # Offline Keyword Check (Crucial for fallback)
    if "depress" in m or "sad" in m: return "depressed"
    if "anx" in m or "worry" in m: return "anxious"
    if "stress" in m or "overwhelm" in m: return "stressed"
    if "happy" in m or "good" in m: return "positive"
    
    try:
        prompt = f"Classify sentiment: [positive, neutral, stressed, anxious, depressed]. Msg: '{message}'. Label only."
        res = generate_with_retry(prompt)
        if res: return res.text.lower().strip()
    except:
        pass
    return "neutral"

def detect_theme(message: str):
    m = message.lower()
    # Offline Keyword Check (Crucial for fallback)
    if "sleep" in m or "tired" in m or "insomnia" in m: return "sleep"
    if "lonely" in m or "alone" in m: return "loneliness"
    if "work" in m or "study" in m or "exam" in m: return "stress"
    if "burnout" in m: return "burnout"
    if "anxi" in m: return "anxiety"
    if "sad" in m or "cry" in m or "depress" in m: return "sadness"
    if "resource" in m or "recommend" in m: return "resources" # Special trigger
    
    try:
        prompt = f"Classify theme: [stress, sleep, loneliness, motivation, sadness, fear, anger, none]. Msg: '{message}'. Label only."
        res = generate_with_retry(prompt)
        if res: return res.text.lower().strip()
    except:
        pass
    return "none"

# ======================================================
# RESOURCE RECOMMENDATION 
# ======================================================
def get_recommended_resource(theme, sentiment, message_text=""):
    search_tags = []
    
    # Explicit override for "recommend more" requests
    if "recommend" in message_text.lower() or "resource" in message_text.lower():
        # If user asks for resources explicitly but no specific theme is detected,
        # try to infer from previous context or just give a general helpful one.
        if theme == "resources" or theme == "none":
             # Default fallback tags if context is missing
             search_tags = ["calm", "stress", "meditation"]
    
    theme_map = {
        "stress": ["stress", "anxiety", "calm"],
        "anxiety": ["anxiety", "panic", "worry"],
        "sleep": ["sleep", "insomnia", "rest"],
        "sadness": ["depression", "sadness", "mood"],
        "loneliness": ["connection", "loneliness"],
        "motivation": ["motivation", "productivity"],
        "fear": ["fear", "courage"],
    }

    if theme in theme_map: search_tags.extend(theme_map[theme])
    
    if not search_tags:
        if sentiment in ["stressed", "anxious"]: search_tags = ["anxiety", "stress"]
        elif sentiment == "depressed": search_tags = ["depression", "mood"]

    if not search_tags: return None

    try:
        resources = Resource.objects(tags__in=search_tags)
        resource_list = list(resources)
        if len(resource_list) > 0:
            r = random.choice(resource_list)
            return { "title": r.title, "type": r.type, "url": r.url }
    except:
        return None
    return None

# ======================================================
# CRISIS SYSTEM (C)
# ======================================================
CRISIS_WORDS = [
    "suicide", "kill myself", "end my life",
    "self harm", "cut myself", "hurt myself",
]

def crisis_score(msg: str):
    m = msg.lower()
    score = 0
    if any(w in m for w in CRISIS_WORDS):
        score += 2
    if any(w in m for w in ["can't go on", "pointless", "nothing matters"]):
        score += 1
    if analyze_sentiment(msg) == "urgent":
        score += 1
    return min(score, 3)


def crisis_reply():
    return (
        "I'm really sorry you're feeling this way 💛\n\n"
        "You deserve help and care. Here are people who can support you:\n"
        "• A close friend/family member\n"
        "• Aasra Suicide Hotline (India): **9152987821**\n"
        "• Emergency services if you're in danger\n\n"
        "Please stay with me. You matter and you're not alone."
    )


# ======================================================
# D — ADVANCED WELLNESS FEATURES
# ======================================================

# -------------------------
# 1. Breathing Exercises
# -------------------------

BREATHING_EXERCISES = {
    "calm": "Let's try 4-7-8 breathing:\nInhale 4s → Hold 7s → Exhale 8s. Repeat 4 times.",
    "panic": "Try box breathing:\n4s inhale → 4s hold → 4s exhale → 4s hold — repeat slowly.",
    "sleep": "Slow breathing for sleep:\nInhale 5s → Exhale 7s. Continue for 1 minute.",
}

# -------------------------
# 2. Grounding Techniques
# -------------------------

GROUNDING_TECHNIQUES = {
    "basic": "5-4-3-2-1 grounding:\n5 things you see\n4 you can touch\n3 you hear\n2 you smell\n1 you taste.",
    "overthinking": "Name 3 neutral facts around you. This helps break overthinking loops.",
    "anxiety": "Put both feet on the floor, take one deep breath, and describe one object near you.",
}

# -------------------------
# 3. Journal Prompts
# -------------------------

JOURNAL_PROMPTS = {
    "stress": "→ What is one thing causing pressure today? What part of it is in your control?",
    "anxiety": "→ What fear is standing out right now? What evidence do you have against it?",
    "motivation": "→ What is one small win you had recently, even if tiny?",
    "sadness": "→ What is something you wish someone understood about you?",
}

# -------------------------
# 4. Motivation Engine
# -------------------------

MOTIVATION_MESSAGES = {
    "burnout": "You're carrying a lot. Rest is not failure — it's fuel.",
    "study": "Small steps count. 10 minutes of focus is progress.",
    "self-esteem": "You are doing better than you think. Please be kind to yourself.",
    "general": "One difficult moment doesn’t define you. You’re stronger than you realize."
}

# -------------------------
# 5. Sleep Assistance
# -------------------------

SLEEP_TIPS = {
    "racing thoughts": "Try writing down all thoughts in a list — a 'brain dump'. It reduces mental load.",
    "rest": "Dim the lights, avoid screens, and try breathing: In 4s, out 6s.",
    "comfort": "Imagine a safe place. Describe it: colors, sounds, temperature.",
}

# -------------------------
# 6. Automatic Recommendation System
# -------------------------

def choose_tool(sentiment, theme):
    if sentiment in ["stressed", "anxious"]:
        return BREATHING_EXERCISES["calm"]
    if theme == "sleep":
        return SLEEP_TIPS["rest"]
    if theme == "loneliness":
        return JOURNAL_PROMPTS["sadness"]
    if theme == "burnout":
        return MOTIVATION_MESSAGES["burnout"]
    if sentiment == "depressed":
        return GROUNDING_TECHNIQUES["basic"]
    if theme == "motivation":
        return MOTIVATION_MESSAGES["study"]
    return "If you'd like, I can guide breathing, grounding, journaling, or motivation."


# ======================================================
# 6. MAIN CHAT LOGIC
# ======================================================
def chat_with_embrace_ai(message: str):
    # 1. Quick Crisis Check (Rule-based is faster/safer)
    if any(w in message.lower() for w in CRISIS_WORDS):
        reply = crisis_reply()
        return {
            "reply": reply,
            "sentiment": "urgent",
            "crisis_level": "high",
            "immediate_action": True
        }

    # 2. Analyze (Try AI, fallback to defaults)
    sentiment = analyze_sentiment(message)
    theme = detect_theme(message)

    add_to_memory("user", message, sentiment, theme)

    # 3. Generate Reply
    reply = ""
    used_fallback = False

    memory_text = "\n".join(f"{m['role']}: {m['text']}" for m in conversation_memory)
    
    # --- YOUR DETAILED PROMPT ---
    prompt = f"""
You are Embrace AI — a warm, empathetic mental wellness companion.

RULES:
• Be supportive, non-clinical, and gentle.
• Keep responses short (3–6 lines max).
• Consider emotional memory.
• Offer tools when helpful (breathing, grounding, journaling, motivation).
• Avoid medical advice.
• NEVER suggest harmful actions.

MEMORY:
{memory_text}

User message: "{message}"
Sentiment: {sentiment}
Theme: {theme}

Respond with empathy and clarity, and offer help if appropriate.
"""

    try:
        # Attempt AI Generation with Retry
        result = generate_with_retry(prompt)
        
        if result and result.text:
            reply = result.text.strip()
        else:
            # AI Failed -> Trigger Fallback
            raise Exception("Empty response from AI")

    except Exception as e:
        # FAILSAFE: Use pre-written response
        print(f"⚠️ AI Failed/Overloaded. Using Fallback. Error: {e}")
        reply = get_fallback_response(message)
        used_fallback = True

    # 4. Append Resources (Works even in fallback mode!)
    try:
        resource_rec = get_recommended_resource(theme, sentiment, message)
        if resource_rec:
            type_icon = "📺" if resource_rec['type'] in ['videos', 'meditations'] else "📖"
            reply += f"\n\nI also found a resource for you: {type_icon} {resource_rec['title']}\n{resource_rec['url']}"
    except:
        pass # Don't crash if DB fails

    add_to_memory("assistant", reply)

    # 5. Auto suggestion for tools
    tool = choose_tool(sentiment, theme)

    return {
        "reply": reply,
        "sentiment": sentiment,
        "theme": theme,
        "crisis_level": "normal",
        "recommended_tool": tool,
        "needs_followup": sentiment in ["stressed", "anxious", "depressed"],
        "success": True,
        "using_fallback": used_fallback
    }
