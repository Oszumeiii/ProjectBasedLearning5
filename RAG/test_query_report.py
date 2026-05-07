#!/usr/bin/env python3
"""
Test script cho hàm query_report trong SupabaseRepository
"""

from database.supabase_client import SupabaseRepository

def test_query_report():
    """Test hàm query_report với post_id = 24"""

    # Khởi tạo repository
    repo = SupabaseRepository()

    # Test case 1: Câu hỏi về phương pháp nghiên cứu
    user_query_1 = "Phương pháp nghiên cứu trong báo cáo này là gì?"

    print("🧪 Test 1: Query về phương pháp nghiên cứu")
    print(f"Query: {user_query_1}")
    print("-" * 50)

    result_1 = repo.query_report(post_id=24, user_query=user_query_1)

    if "error" in result_1:
        print(f"❌ Lỗi: {result_1['error']}")
    else:
        print("✅ Thành công!")
        print(f"Node được chọn: {result_1['selected_node']['title']}")
        print(f"Đường dẫn: {result_1['selected_node']['path']}")
        print(f"Tóm tắt: {result_1['selected_node']['summary'][:200]}...")
        print(f"Nội dung (đầu 500 ký tự): {result_1['selected_node']['content'][:500]}...")
        print(f"LLM reasoning: {result_1['llm_reasoning']}")

    print("\n" + "="*80 + "\n")

    # Test case 2: Câu hỏi về kết quả
    user_query_2 = "Kết quả chính của báo cáo này là gì?"

    print("🧪 Test 2: Query về kết quả chính")
    print(f"Query: {user_query_2}")
    print("-" * 50)

    result_2 = repo.query_report(post_id=24, user_query=user_query_2)

    if "error" in result_2:
        print(f"❌ Lỗi: {result_2['error']}")
    else:
        print("✅ Thành công!")
        print(f"Node được chọn: {result_2['selected_node']['title']}")
        print(f"Đường dẫn: {result_2['selected_node']['path']}")
        print(f"Tóm tắt: {result_2['selected_node']['summary'][:200]}...")
        print(f"Nội dung (đầu 500 ký tự): {result_2['selected_node']['content'][:500]}...")
        print(f"LLM reasoning: {result_2['llm_reasoning']}")

    print("\n" + "="*80 + "\n")

    # Test case 3: Câu hỏi không liên quan
    user_query_3 = "Thời tiết hôm nay như thế nào?"

    print("🧪 Test 3: Query không liên quan")
    print(f"Query: {user_query_3}")
    print("-" * 50)

    result_3 = repo.query_report(post_id=24, user_query=user_query_3)

    if "error" in result_3:
        print(f"❌ Lỗi: {result_3['error']}")
    else:
        print("✅ Thành công!")
        print(f"Node được chọn: {result_3['selected_node']['title']}")
        print(f"Đường dẫn: {result_3['selected_node']['path']}")
        print(f"Tóm tắt: {result_3['selected_node']['summary'][:200]}...")
        print(f"Nội dung (đầu 500 ký tự): {result_3['selected_node']['content'][:500]}...")
        print(f"LLM reasoning: {result_3['llm_reasoning']}")

def test_get_nodes_by_post():
    """Test hàm get_nodes_by_post với post_id = 24"""

    print("🧪 Test get_nodes_by_post với post_id = 24")
    print("-" * 50)

    repo = SupabaseRepository()
    result = repo.get_nodes_by_post(24)

    if result and result.data:
        print(f"✅ Thành công! Tìm thấy {len(result.data)} nodes")
        print("\nDanh sách nodes:")
        for i, node in enumerate(result.data[:5]):  # Hiển thị 5 nodes đầu
            print(f"{i+1}. {node['title']} (Level: {node['level']})")
            print(f"   Path: {node['path']}")
            print(f"   Summary: {node['summary'][:100]}..." if node['summary'] else "   Summary: None")
            print()
    else:
        print("❌ Không tìm thấy nodes hoặc có lỗi")

if __name__ == "__main__":
    print("🚀 Bắt đầu test SupabaseRepository")
    print("="*80)

    # Test get_nodes_by_post trước
    test_get_nodes_by_post()

    print("\n" + "="*80 + "\n")

    # Test query_report
    test_query_report()

    print("\n🎉 Hoàn thành test!")