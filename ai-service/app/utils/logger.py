import logging
from datetime import datetime
import os

# Setup logging
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'{log_dir}/app.log'),
        logging.StreamHandler(),
    ]
)

logger = logging.getLogger(__name__)


def log_info(message: str, extra: dict = None):
    """Log info level message"""
    logger.info(message, extra=extra or {})


def log_error(message: str, error: Exception = None):
    """Log error level message"""
    logger.error(message, exc_info=error)


def log_debug(message: str):
    """Log debug level message"""
    logger.debug(message)
