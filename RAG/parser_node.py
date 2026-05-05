#Sử dụng MarkdownElementNodeParser. Đây là "linh hồn" của Vectorless RAG, nó tự nhận diện Header và Table để tạo ra các bản tóm tắt (summaries) cho từng vùng dữ liệu.
from utils.client_llm import API_KEY
from llama_index.core.node_parser import MarkdownElementNodeParser, MarkdownNodeParser
from llama_index.llms.gemini import Gemini

def get_nodes_from_markdown (file_path = "Output.md"):
    llm = Gemini(model_name="gemini-3-flash-preview", api_key=API_KEY)

    # node_parser = MarkdownNodeParser(llm=llm)
    # print(node_parser) 
    
    # # doc file va parse thanh cac nut co phan cap 
    
    # from llama_index.core import SimpleDirectoryReader
    # reader = SimpleDirectoryReader(input_files=[file_path])
    # documents = reader.load_data()
    
    # nodes = node_parser.get_nodes_from_documents(documents)
    
    
    node_parser = MarkdownElementNodeParser(llm=llm, num_workers=4)
    
    # Đọc file và parse thành các nút có phân cấp
    from llama_index.core import SimpleDirectoryReader
    documents = SimpleDirectoryReader(input_files=[file_path]).load_data()
    
    # Trả về các nodes bao gồm cả 'base_nodes' và 'recursive_nodes' (chứa tóm tắt)
    nodes = node_parser.get_nodes_from_documents(documents)
    base_nodes, objects = node_parser.get_nodes_and_objects(nodes)
    print(f"Số lượng Base Nodes: {len(base_nodes)}")
    print(f"Số lượng Objects (IndexNodes): {len(objects)}")
    for i, node in enumerate(base_nodes[:10]):  # In ra 5 Base Nodes đầu tiên
        print(f"Base Node {i+1}:")
        print(f"Text: {node.get_text()}")  # In ra 100 ký tự đầu tiên của text
        print("-" * 40)
        
    return base_nodes, objects

    # base_nodes , objects = node_parser.get_nodes_and_objects(nodes)
    
    # print(f"Số lượng Base Nodes: {len(base_nodes)}")
    # print(f"Số lượng Objects (IndexNodes): {len(objects)}")

    for i, node in enumerate(nodes[:10]):  # In ra 5 Base Nodes đầu tiên
        print(f"Base Node {i+1}:")
        print(f"Text: {node.get_text()}")  # In ra 100 ký tự đầu tiên của text
        print("-" * 40)
        

    return nodes , objects
    