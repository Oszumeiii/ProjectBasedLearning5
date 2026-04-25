from utils.client_llm import client
async def summarize_text(text, model="gemini-3-flash-preview"):
    if not text.strip():
        return ""

    prompt = f"""
You are a helpful assistant.

Summarize the following section in 2-4 concise sentences.
Keep key ideas, remove redundancy.

TEXT:
{text}
"""

    response = await client(model=model, prompt=prompt)
    return response.strip()


import asyncio

async def generate_summaries_for_tree(root, model="gemini-3-flash-preview"):
    nodes = []

    def collect_nodes(node):
        if node.level > 0:
            nodes.append(node)
        for c in node.children:
            collect_nodes(c)

    collect_nodes(root)

    tasks = []
    for node in nodes:
        content = "\n".join(node.content).strip()
        tasks.append(summarize_text(content, model=model))

    summaries = await asyncio.gather(*tasks)

    for node, summary in zip(nodes, summaries):
        node.summary = summary

        
def doc_summary(sections):

    prompt_template = """
You are an expert document summarization system.

Task:
Summarize EACH section independently.

--------------------------------
RULES
--------------------------------
- Keep summary concise (3–5 sentences)
- Preserve key meaning
- Do NOT merge sections
- Do NOT hallucinate
- Output must match JSON format

--------------------------------
OUTPUT FORMAT
--------------------------------
{
  "sections": [
    {
      "title": "...",
      "summary": "..."
    }
  ]
}

--------------------------------
INPUT
--------------------------------
"""

    input_text = ""

    for sec in sections:
        input_text += f"\n[SECTION]\nTitle: {sec.get('title')}\nContent:\n{sec.get('content')}\n"

    prompt = prompt_template + input_text

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )

    return response.text