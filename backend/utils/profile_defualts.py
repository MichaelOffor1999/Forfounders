from datetime import datetime
from pymongo.collection import Collection
import copy

# Dynamic defaults: callables are evaluated at call time
DEFAULTS = {
    "headline": "",
    "photo": "",
    "roles_offered": [],
    "interest_tags": [],
    "want_to_build": {
        "tags": [],
        "blurb": "",
        "roles_needed": []
    },
    "availability": {},
    "links": {},
    "collab_prefs": {},
    "work_count": 0,
    "visibility": "public",
    "last_active_at": lambda: datetime.utcnow(),   # <-- callable, not fixed at import
}

def _realize(dv):
    """Turn a default into a concrete value (eval callables, deep-copy lists/dicts)."""
    v = dv() if callable(dv) else dv
    return copy.deepcopy(v) if isinstance(v, (dict, list)) else v

def _assign_path(doc: dict, path: str, value):
    """
    Safely set a nested key like 'want_to_build.roles_needed' on a Python dict.
    Creates intermediate dicts if missing.
    """
    parts = path.split(".")
    ref = doc
    for p in parts[:-1]:
        if not isinstance(ref.get(p), dict):
            ref[p] = {}
        ref = ref[p]
    ref[parts[-1]] = value

def _build_patch(doc: dict, defaults: dict, base: str = "") -> dict:
    """
    Recursively compute a $set patch (dot-notation) for fields that are
    missing or None in 'doc'. Never overwrites existing values.
    """
    patch = {}
    for k, dv in defaults.items():
        keypath = f"{base}.{k}" if base else k
        if k not in doc or doc[k] is None:
            patch[keypath] = _realize(dv)
        else:
            # Dive into nested dicts without clobbering existing objects
            if isinstance(dv, dict) and isinstance(doc[k], dict):
                patch.update(_build_patch(doc[k], dv, keypath))
    return patch

def ensure_profile_fields(u: dict, users: Collection) -> dict:
    """
    Fill only missing/None fields on the user document:
      - Builds a minimal $set patch using dot-notation
      - Writes once to Mongo via 'users' collection
      - Mirrors changes into in-memory 'u'
    Returns the updated in-memory user dict.
    """
    if "_id" not in u:
        raise ValueError("User dict must include _id")

    patch = _build_patch(u, DEFAULTS)
    if patch:
        users.update_one({"_id": u["_id"]}, {"$set": patch})
        for path, val in patch.items():
            _assign_path(u, path, val)
    return u
