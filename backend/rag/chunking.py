from pathlib import Path
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_core.documents import Document

HEADERS_TO_SPLIT = [
    ("#", "Department"),
    ("##", "Section"),
    ("###", "Entry"),
]

def chunk_markdown_file(file_path: Path) -> list[Document]:
    """Chunk a markdown file preserving header structure."""
    content = file_path.read_text(encoding="utf-8")

    # Determine document type from path
    if "contacts" in str(file_path):
        doc_type = "contact"
    elif "events" in str(file_path):
        doc_type = "event"
    else:
        doc_type = "general"

    # Extract title from filename
    title = file_path.stem.replace("-", " ").title()

    # First pass: split by headers
    md_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=HEADERS_TO_SPLIT,
        strip_headers=False
    )
    header_splits = md_splitter.split_text(content)

    # Second pass: enforce size limits
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=512,
        chunk_overlap=50
    )

    final_docs = []
    for doc in header_splits:
        # Build attribution from metadata
        parts = [title]
        if "Section" in doc.metadata:
            parts.append(doc.metadata["Section"])
        if "Entry" in doc.metadata:
            parts.append(doc.metadata["Entry"])
        attribution = " > ".join(parts)

        # Apply size splitting if needed
        if len(doc.page_content) > 512:
            sub_docs = text_splitter.split_documents([doc])
            for i, sub_doc in enumerate(sub_docs):
                sub_doc.metadata.update({
                    "source": str(file_path),
                    "title": title,
                    "attribution": attribution,
                    "type": doc_type,
                    "chunk_index": i
                })
                final_docs.append(sub_doc)
        else:
            doc.metadata.update({
                "source": str(file_path),
                "title": title,
                "attribution": attribution,
                "type": doc_type
            })
            final_docs.append(doc)

    return final_docs

def chunk_all_knowledge(knowledge_dir: Path) -> list[Document]:
    """Chunk all markdown files in knowledge directory."""
    all_docs = []
    for md_file in knowledge_dir.rglob("*.md"):
        docs = chunk_markdown_file(md_file)
        all_docs.extend(docs)
    return all_docs
