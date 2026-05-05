#.  Đây là nơi thiết lập cơ chế Recursive Retrieval. AI sẽ tìm kiếm trên bản tóm tắt trước, sau đó mới "truy quét" xuống dữ liệu chi tiết bên dưới
# from llama_index.core.node_parser import MarkdownElementNodeParser
# from llama_index.llms.openai import OpenAI

# def get_nodes_from_markdown(file_path):
#     # Sử dụng GPT-4o-mini để tạo tóm tắt cho các Table/Section (rất rẻ và chuẩn)
#     llm = OpenAI(model="gpt-4o-mini")
    
#     node_parser = MarkdownElementNodeParser(llm=llm, num_workers=4)
    
#     # Đọc file và parse thành các nút có phân cấp
#     from llama_index.core import SimpleDirectoryReader
#     documents = SimpleDirectoryReader(input_files=[file_path]).load_data()
    
#     # Trả về các nodes bao gồm cả 'base_nodes' và 'recursive_nodes' (chứa tóm tắt)
#     nodes = node_parser.get_nodes_from_documents(documents)
#     base_nodes, objects = node_parser.get_nodes_and_objects(nodes)
#     return base_nodes, objects


from llama_index.core import VectorStoreIndex


def build_agentic_engine (base_nodes , objects):
    # luu trữ các node vào Index (thường là VectorIndex nhưng chỉ dùng để lấy mốc)
    index = VectorStoreIndex(base_nodes)
    
    # tạo agentic engine
    # Thiết lập Retriever đệ quy
    # Nó sẽ nhìn vào 'objects' (tóm tắt) để định hướng trước khi truy cập 'base_nodes'