"""Configuration constants"""

COMPLAINT_STATUSES = ['new', 'processing', 'completed', 'escalated']
PRIORITY_LEVELS = ['low', 'medium', 'high', 'critical']

API_TIMEOUT = 30

ERRORS = {
    'INVALID_INPUT': 'Invalid input provided',
    'PROCESSING_ERROR': 'Error processing complaint',
    'DATABASE_ERROR': 'Database operation failed',
}
