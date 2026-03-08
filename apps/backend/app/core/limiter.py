from slowapi import Limiter
from slowapi.util import get_remote_address

# Single shared limiter instance — imported by main.py (app.state.limiter)
# and used by endpoint decorators directly.
limiter = Limiter(key_func=get_remote_address)
