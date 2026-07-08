def serialize(doc):
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc
