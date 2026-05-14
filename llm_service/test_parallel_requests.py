#!/usr/bin/env python
"""
Test script to verify parallel request handling in FastAPI with thread pool.
This script sends 4 concurrent requests to /summary endpoint and measures time.
"""

import asyncio
import aiohttp
import time
import sys

# Test content samples
SAMPLE_CONTENTS = [
    """
    Machine learning là một lĩnh vực của trí tuệ nhân tạo (AI) tập trung vào việc phát triển các thuật toán 
    và mô hình có thể học từ dữ liệu. Thay vì được lập trình rõ ràng để thực hiện một tác vụ cụ thể, 
    các hệ thống machine learning tự động cải thiện hiệu suất của chúng thông qua kinh nghiệm. 
    Có ba loại chính: học có giám sát, học không giám sát, và học tăng cường.
    """,
    """
    Deep learning là một tập con của machine learning sử dụng các mạng nơ-ron nhân tạo (neural networks) 
    với nhiều lớp (do đó "deep"). Những mạng nơ-ron này được lấy cảm hứng từ hoạt động của não con người 
    và có khả năng xử lý dữ liệu phức tạp. Deep learning đã tạo ra những đột phá trong xử lý hình ảnh, 
    nhận dạng giọng nói, và xử lý ngôn ngữ tự nhiên.
    """,
    """
    Mô hình transformer là kiến trúc neural network được giới thiệu năm 2017 với paper "Attention Is All You Need". 
    Đây là nền tảng của các mô hình ngôn ngữ lớn (LLM) hiện đại như GPT và BERT. 
    Transformer sử dụng cơ chế attention để xử lý các chuỗi dữ liệu song song, 
    giúp nó vượt trội hơn các kiến trúc RNN truyền thống.
    """,
    """
    RAG (Retrieval-Augmented Generation) là một kỹ thuật kết hợp tìm kiếm thông tin (retrieval) 
    với sinh text (generation). Thay vì chỉ dùng kiến thức từ training data, 
    RAG hệ thống tìm kiếm tài liệu liên quan từ một kho dữ liệu ngoại và sử dụng chúng để tạo ra câu trả lời chính xác hơn. 
    Điều này đặc biệt hữu ích cho các câu hỏi yêu cầu kiến thức cập nhật hoặc đặc thù của miền.
    """
]

async def send_request(session, url, content, request_id):
    """Send a single request to the /summary endpoint and measure time."""
    start_time = time.time()
    try:
        async with session.post(
            url,
            json={
                "content": content,
                "max_new_tokens": 100
            },
            timeout=aiohttp.ClientTimeout(total=120)
        ) as resp:
            result = await resp.json()
            elapsed = time.time() - start_time
            
            status = "✅" if resp.status == 200 else "❌"
            print(f"{status} Request {request_id}: {elapsed:.2f}s - Status: {resp.status}")
            
            if resp.status != 200:
                print(f"   Error: {result}")
                return elapsed, False
            
            summary = result.get("summary", "")[:100] + "..."
            print(f"   Summary preview: {summary}")
            return elapsed, True
            
    except asyncio.TimeoutError:
        elapsed = time.time() - start_time
        print(f"❌ Request {request_id}: TIMEOUT after {elapsed:.2f}s")
        return elapsed, False
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ Request {request_id}: Error - {str(e)}")
        return elapsed, False

async def run_parallel_test(base_url="http://localhost:5000", num_requests=4):
    """Run parallel requests to test concurrent handling."""
    print("\n" + "="*70)
    print(f"🚀 Testing {num_requests} parallel requests to {base_url}/summary")
    print("="*70 + "\n")
    
    async with aiohttp.ClientSession() as session:
        # Send all requests concurrently
        print(f"📤 Sending {num_requests} requests concurrently...\n")
        overall_start = time.time()
        
        tasks = [
            send_request(session, f"{base_url}/summary", SAMPLE_CONTENTS[i % len(SAMPLE_CONTENTS)], i+1)
            for i in range(num_requests)
        ]
        
        results = await asyncio.gather(*tasks)
        overall_time = time.time() - overall_start
        
    # Calculate statistics
    times = [t for t, _ in results]
    successes = [s for _, s in results]
    
    print("\n" + "="*70)
    print("📊 Test Results:")
    print("="*70)
    print(f"Total time: {overall_time:.2f}s")
    print(f"Average time per request: {sum(times)/len(times):.2f}s")
    print(f"Max time: {max(times):.2f}s")
    print(f"Min time: {min(times):.2f}s")
    print(f"Success rate: {sum(successes)}/{len(successes)}")
    
    # Analysis
    print("\n📈 Analysis:")
    print("-" * 70)
    if overall_time < max(times) * 1.5:
        print(f"✅ PARALLEL EXECUTION DETECTED!")
        print(f"   - Requests were processed concurrently")
        print(f"   - Total time ({overall_time:.2f}s) is much less than max time ({max(times):.2f}s)")
        speedup = max(times) * len(times) / overall_time
        print(f"   - Speedup factor: {speedup:.2f}x")
    else:
        print(f"⚠️  SEQUENTIAL-LIKE EXECUTION")
        print(f"   - Requests may have been processed sequentially")
        print(f"   - Total time ({overall_time:.2f}s) is close to max time ({max(times):.2f}s)")
    
    print("="*70 + "\n")

async def main():
    # Parse command line arguments
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    num_requests = int(sys.argv[2]) if len(sys.argv) > 2 else 4
    
    try:
        await run_parallel_test(base_url, num_requests)
    except ConnectionError as e:
        print(f"\n❌ Connection error: {e}")
        print(f"   Make sure the server is running at {base_url}")
        sys.exit(1)

if __name__ == "__main__":
    print("🔄 Installing aiohttp if needed...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "aiohttp", "-q"], check=False)
    
    asyncio.run(main())
