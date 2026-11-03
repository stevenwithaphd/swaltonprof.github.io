"""
local_api_test.py
Automated latency and throughput benchmarking tool for local OpenAI-compatible endpoints.
Compatible with both Ollama (port 11434) and LM Studio (port 1234).
"""

import argparse
import sys
import time

try:
    from openai import OpenAI
except ImportError:
    print("[ERROR] Missing required library 'openai'. Install via: pip install openai")
    sys.exit(1)


def run_benchmark(base_url: str, model_name: str, stream: bool = False):
    print("\n=======================================================")
    print(f" TARGET ENDPOINT : {base_url}")
    print(f" TARGET MODEL    : {model_name}")
    print(f" STREAMING MODE  : {stream}")
    print("=======================================================\n")

    client = OpenAI(base_url=base_url, api_key="local-tinkerer")

    prompt = (
        "Explain the mechanical difference between an automotive supercharger "
        "and a turbocharger, focusing on where each draws its driving energy."
    )

    print(f"[*] Dispatching test prompt: '{prompt}'\n")

    try:
        if not stream:
            # Non-streaming benchmark
            start_time = time.time()
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are a concise Mechanical Engineer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1024
            )
            total_time = time.time() - start_time

            reply = response.choices[0].message.content or ""
            reasoning = getattr(response.choices[0].message, "reasoning_content", None) or getattr(response.choices[0].message, "reasoning", None) or ""
            completion_tokens = response.usage.completion_tokens if response.usage else len(reply.split())

            if reasoning and not reply.strip():
                print("--- Thinking / Reasoning Trace (Model spent token budget in reasoning) ---")
                print(reasoning.strip())
                print("--------------------------------------------------------------------------\n")
            else:
                print("--- Response Content ---")
                print(reply.strip())
                print("------------------------\n")

            tok_sec = completion_tokens / total_time if total_time > 0 else 0
            print(f"[+] Total Duration         : {total_time:.2f} seconds")
            print(f"[+] Completion Tokens      : {completion_tokens}")
            print(f"[+] Generation Throughput  : {tok_sec:.2f} tokens/second")

        else:
            # Streaming benchmark (Measures Time to First Token)
            start_time = time.time()
            first_token_time = None
            token_count = 0
            collected_chunks = []

            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are a concise Mechanical Engineer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1024,
                stream=True
            )

            print("--- Live Streaming Output ---")
            for chunk in response:
                delta_obj = chunk.choices[0].delta if chunk.choices else None
                delta = (delta_obj.content if delta_obj and delta_obj.content else None) or getattr(delta_obj, "reasoning_content", None) or getattr(delta_obj, "reasoning", None)
                if delta:
                    if first_token_time is None:
                        first_token_time = time.time()
                    sys.stdout.write(delta)
                    sys.stdout.flush()
                    collected_chunks.append(delta)
                    token_count += 1
            print("\n-----------------------------\n")

            end_time = time.time()
            total_time = end_time - start_time
            ttft = (first_token_time - start_time) if first_token_time else total_time
            decode_time = (end_time - first_token_time) if first_token_time else total_time
            tok_sec = token_count / decode_time if decode_time > 0 else 0

            print(f"[+] Time to First Token (TTFT) : {ttft:.3f} seconds (Prefill Latency)")
            print(f"[+] Active Decode Duration     : {decode_time:.2f} seconds")
            print(f"[+] Chunks Received            : {token_count}")
            print(f"[+] Streaming Throughput       : {tok_sec:.2f} chunks/second")

    except Exception as exc:
        print(f"\n[FAIL] Error communicating with endpoint {base_url}: {exc}")
        print("[TIP] Ensure the server is actively listening and the model name matches an installed model.")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Benchmark local OpenAI-compatible inference endpoints.")
    parser.add_argument(
        "--endpoint",
        default="http://localhost:11434/v1",
        help="Base URL of the local REST server (default: http://localhost:11434/v1 for Ollama, http://localhost:1234/v1 for LM Studio)"
    )
    parser.add_argument(
        "--model",
        default="gemma4:e4b",
        help="Model tag or identifier to test (default: gemma4:e4b)"
    )
    parser.add_argument(
        "--stream",
        action="store_true",
        help="Enable streaming mode to measure Time to First Token (TTFT)"
    )
    args = parser.parse_args()

    run_benchmark(base_url=args.endpoint, model_name=args.model, stream=args.stream)


if __name__ == "__main__":
    main()
