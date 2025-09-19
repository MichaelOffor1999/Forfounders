from pymongo.collection import Collection
from datetime import datetime, timedelta

def touch_last_active(users: Collection, user_id, minimum_interval_seconds: int = 300):
    now = datetime.utcnow()
    cutoff = now - timedelta(seconds=minimum_interval_seconds)
    users.update_one({
                        "_id": user_id, 
                        "$or": [
                            {"last_active_at": {"$exists": False}},
                            {"last_active_at": {"$lt": cutoff}}
                            ],
                    },
                   {"$set": {"last_active_at": now}},
                   )