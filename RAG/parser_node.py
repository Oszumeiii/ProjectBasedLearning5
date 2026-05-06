#Sử dụng MarkdownElementNodeParser. Đây là "linh hồn" của Vectorless RAG, nó tự nhận diện Header và Table để tạo ra các bản tóm tắt (summaries) cho từng vùng dữ liệu.
from utils.client_llm import API_KEY
from llama_index.core.node_parser import MarkdownElementNodeParser, MarkdownNodeParser
from llama_index.llms.gemini import Gemini

def get_nodes_from_markdown(file_path="Output.md"):
    llm = Gemini(
        model_name="gemini-3-flash-preview",
        api_key=API_KEY
    )

    parser = MarkdownElementNodeParser(
        llm=llm,
        num_workers=1
    )

    from llama_index.core import SimpleDirectoryReader
    documents = SimpleDirectoryReader(
        input_files=[file_path]
    ).load_data()

    nodes = parser.get_nodes_from_documents(documents)
    base_nodes, objects = parser.get_nodes_and_objects(nodes)

    node = base_nodes[2]
    print(node)
    # # 🔥 In base nodes
    # for i, node in enumerate(base_nodes[:5]):
    #     print(f"\n[Base Node {i+1}]")
    #     print(node)

    # # 🔥 In summary nodes
    # for i, obj in enumerate(objects[:5]):
    #     print(f"\n[Summary Node {i+1}]")
    #     print(obj.get_text())

    return base_nodes, objects