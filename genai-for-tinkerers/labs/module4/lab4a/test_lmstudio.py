"""
test_lmstudio.py
Verifies connectivity and chat completions against a local LM Studio REST server.
Compatible with the standard openai-python SDK.
"""

import sys
import time

try:
    from openai import OpenAI
except ImportError:
    print("[ERROR] The openai library is required. Install via: pip install openai")
    sys.exit(1)


def main():
    # LM Studio default endpoint: http://127.0.0.1:1234/v1
    base_url = "http://127.0.0.1:1234/v1"
    # Local servers do not enforce API keys, but the SDK requires a non-empty string
    api_key = "lm-studio"

    print(f"[*] Initializing connection to local LM Studio endpoint: {base_url}")
    client = OpenAI(base_url=base_url, api_key=api_key)

    try:
        # Step 1: Query loaded models
        print("[*] Fetching available loaded models...")
        models = client.models.list()
        if not models.data:
            print("[WARN] No active model loaded in LM Studio. Please load a model in the UI.")
            return

        active_model = models.data[0].id
        print(f"[+] Connected successfully! Active model: {active_model}")

        # Step 2: Execute test chat completion
        prompt = "Explain in two sentences why memory bandwidth governs LLM generation speed."
        print(f"[*] Sending prompt: '{prompt}'")

        start_time = time.time()
        response = client.chat.completions.create(
            model=active_model,
            messages=[
                {"role": "system", "content": "You are an expert systems engineer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1024
        )
        elapsed = time.time() - start_time

        reply = response.choices[0].message.content or ""
        reasoning = getattr(response.choices[0].message, "reasoning_content", None) or getattr(response.choices[0].message, "reasoning", None) or ""
        tokens = response.usage.completion_tokens if response.usage else 0

        print("\n=== Model Response ===")
        print((reply.strip() or reasoning.strip()))
        print("======================\n")
        print(f"[+] Total round-trip latency: {elapsed:.2f}s")
        if tokens > 0 and elapsed > 0:
            print(f"[+] Generated {tokens} tokens (~{tokens / elapsed:.1f} tokens/sec)")

    except Exception as exc:
        print(f"\n[FAIL] Failed to communicate with LM Studio: {exc}")
        print("[TIP] Ensure LM Studio is open, a model is loaded, and the local server is started on port 1234.")
        sys.exit(1)


if __name__ == "__main__":
    main()
