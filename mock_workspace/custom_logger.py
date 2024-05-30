import logging
from enum import Enum


class RadahLogger:
    
    class LogLevel(Enum):
        DEBUG = logging.DEBUG
        INFO = logging.INFO
        WARNING = logging.WARNING
        ERROR = logging.ERROR
        CRITICAL = logging.CRITICAL
        
    class CustomFormatter(logging.Formatter):
        use_ansi_colors = False
    
        def format(self, record):
            ANSI_LEVEL_MAP = {
                'DEBUG': '\033[94mDEBUG\033[0m' if self.use_ansi_colors else 'DEBUG',
                'INFO': '\033[92mINFO\033[0m' if self.use_ansi_colors else 'INFO',
                'WARNING': '\033[93mWARNING\033[0m' if self.use_ansi_colors else 'WARNING',
                'ERROR': '\033[91mERROR\033[0m' if self.use_ansi_colors else 'ERROR',
                'CRITICAL': '\033[91mCRITICAL\033[0m' if self.use_ansi_colors else 'CRITICAL'
            }
            
            loglevel = record.levelname
            record.levelname = ANSI_LEVEL_MAP.get(loglevel, loglevel)
            return super().format(record)
    
    
    def __init__(self, log_level: LogLevel = LogLevel.INFO, use_ansi_colors: bool = True):
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(log_level.value)
        self.handler = logging.StreamHandler()
        self.logger.addHandler(self.handler)
        self.formatter = self.CustomFormatter('[ %(filename)s:%(lineno)s | %(funcName)s() %(levelname)s ] %(message)s')
        self.CustomFormatter.use_ansi_colors = use_ansi_colors
        self.handler.setFormatter(self.formatter)
        
    def get_logger(self):
        return self.logger




