# backend/utils/profile.py
def score_profile(u: dict) -> tuple[int, list[str]]:
    """
    Founder-focused completeness score (0–100) + checklist of missing core bits.
    No company required; suitable for idea/MVP stage founders.
    """
    score = 0
    missing = []

    def has_str(x): return bool((x or "").strip())
    def has_list(x, n=1): 
        return isinstance(x, list) and len([i for i in x if str(i).strip()]) >= n

    # Identity / context
    if has_str(u.get("name")): score += 10
    else: missing.append("name")

    if has_str(u.get("role")): score += 10      # e.g., Founder / Solo builder
    else: missing.append("role")

    if has_str(u.get("stage")): score += 10     # idea / exploring / MVP / prelaunch
    else: missing.append("stage")

    # What they work on / can do / need
    if has_list(u.get("industries"), 1): score += 12   # at least 1 focus/industry
    else: missing.append("industries>=1")

    if has_list(u.get("skills"), 3): score += 12       # ≥3 skills
    else: missing.append("skills>=3")

    if has_list(u.get("offers"), 1): score += 12       # what I can contribute
    else: missing.append("offers>=1")

    if has_list(u.get("needs"), 1): score += 12        # what I’m looking for
    else: missing.append("needs>=1")

    # Basic profile polish
    bio = (u.get("bio") or "").strip()
    if len(bio) >= 30: score += 6
    else: missing.append("bio>=30")

    if has_str(u.get("profile_picture")): score += 5
    else: missing.append("profile_picture")

    if has_str(u.get("location")): score += 5
    else: missing.append("location")

    # Commitment / availability (helpful signal)
    if has_str(u.get("commitment_level")):  # e.g., nights/weekends, part-time, full-time
        score += 6
    else:
        missing.append("commitment_level")

    return min(score, 100), missing
