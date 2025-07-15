import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatLog(level, message, metadata = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...metadata
        };
        return JSON.stringify(logEntry) + '\n';
    }

    writeLog(level, message, metadata = {}) {
        const logFile = path.join(this.logDir, `${level}.log`);
        const logEntry = this.formatLog(level, message, metadata);
        
        fs.appendFileSync(logFile, logEntry);
        
        // Also write to general log file
        const generalLogFile = path.join(this.logDir, 'app.log');
        fs.appendFileSync(generalLogFile, logEntry);
    }

    info(message, metadata = {}) {
        this.writeLog('info', message, metadata);
    }

    error(message, metadata = {}) {
        this.writeLog('error', message, metadata);
    }

    warn(message, metadata = {}) {
        this.writeLog('warn', message, metadata);
    }

    debug(message, metadata = {}) {
        this.writeLog('debug', message, metadata);
    }
}

const logger = new Logger();

export const loggerMiddleware = (req, res, next) => {
    const start = Date.now();
    
  
    logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });


    const originalJson = res.json;
    res.json = function(data) {
        const duration = Date.now() - start;
        
        logger.info('Response sent', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            responseSize: JSON.stringify(data).length,
            timestamp: new Date().toISOString()
        });

        return originalJson.call(this, data);
    };

 
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        
        if (res.statusCode >= 400) {
            logger.error('Error response', {
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                error: data,
                timestamp: new Date().toISOString()
            });
        }

        return originalSend.call(this, data);
    };

    next();
};

export { logger };