import chromadb
from sentence_transformers import SentenceTransformer

c = chromadb.Client()
col = c.get_or_create_collection("docs")

m = SentenceTransformer("all-MiniLM-L6-v2")

def add_doc(txt):

    ps = []

    for i in range(0, len(txt), 500):
        ps.append(txt[i:i+500])

    for i, p in enumerate(ps):
        e = m.encode(p).tolist()

        col.add(
            ids=[str(i)],
            embeddings=[e],
            documents=[p]
        )

def search(q):

    e = m.encode(q).tolist()

    r = col.query(
        query_embeddings=[e],
        n_results=3
    )

    return r["documents"][0]