import { toast } from '@/hooks/use-toast';

export class SEOError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'SEOError';
  }
}

export class NetworkError extends SEOError {
  constructor(message: string = 'Network connection failed', context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

export class AuthError extends SEOError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message, 'AUTH_ERROR', context);
    this.name = 'AuthError';
  }
}

export class RateLimitError extends SEOError {
  constructor(message: string = 'Rate limit exceeded', context?: Record<string, any>) {
    super(message, 'RATE_LIMIT_ERROR', context);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends SEOError {
  constructor(message: string = 'Validation failed', context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

interface ErrorLogEntry {
  id: string;
  error: Error;
  timestamp: Date;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
  userId?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorLogEntry[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handle(error: unknown, context?: Record<string, any>): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Log error
    this.logError(errorObj, context);
    
    // Show user-friendly message
    this.showUserMessage(errorObj);
    
    // Report to monitoring service
    this.reportError(errorObj, context);
  }

  private logError(error: Error, context?: Record<string, any>): void {
    const logEntry: ErrorLogEntry = {
      id: crypto.randomUUID(),
      error,
      timestamp: new Date(),
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    this.errorLog.push(logEntry);

    // Keep only last maxLogSize errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    console.error('SEO Error:', error, context);
  }

  private showUserMessage(error: Error): void {
    let message = 'An unexpected error occurred';
    let variant: 'default' | 'destructive' = 'destructive';
    let duration = 5000;

    if (error instanceof SEOError) {
      message = error.message;
      
      switch (error.constructor) {
        case NetworkError:
          message = 'Network error. Please check your connection and try again.';
          variant = 'destructive';
          break;
        case AuthError:
          message = 'Authentication error. Please log in again.';
          variant = 'destructive';
          break;
        case RateLimitError:
          message = 'Rate limit exceeded. Please wait a moment before trying again.';
          variant = 'default';
          duration = 3000;
          break;
        case ValidationError:
          message = `Validation error: ${error.message}`;
          variant = 'destructive';
          break;
      }
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      message = 'Network error. Please check your connection.';
    } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      message = 'Authentication error. Please log in again.';
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      message = 'Rate limit exceeded. Please try again later.';
      variant = 'default';
      duration = 3000;
    } else if (error.message.includes('timeout')) {
      message = 'Request timeout. Please try again.';
      variant = 'default';
    }

    toast({
      title: 'Error',
      description: message,
      variant,
      duration,
    });
  }

  private reportError(error: Error, context?: Record<string, any>): void {
    // Send to monitoring service (e.g., Sentry, LogRocket)
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: false,
          custom_map: context,
        });
      }

      // Custom error reporting endpoint
      this.sendToErrorService(error, context).catch(console.error);
    }
  }

  private async sendToErrorService(error: Error, context?: Record<string, any>): Promise<void> {
    try {
      // This would typically send to your error monitoring service
      const errorReport = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        context,
        timestamp: new Date().toISOString(),
        userAgent: window.navigator.userAgent,
        url: window.location.href,
      };

      // Example: Send to custom error endpoint
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  // Public methods for error management
  getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    recent: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recent = this.errorLog.filter(entry => 
      entry.timestamp > oneHourAgo
    ).length;

    const byType = this.errorLog.reduce((acc, entry) => {
      const type = entry.error.name || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errorLog.length,
      byType,
      recent,
    };
  }

  // Utility method for wrapping async functions
  wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: Record<string, any>
  ) {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error, { ...context, args });
        throw error;
      }
    };
  }

  // Utility method for wrapping sync functions
  wrapSync<T extends any[], R>(
    fn: (...args: T) => R,
    context?: Record<string, any>
  ) {
    return (...args: T): R => {
      try {
        return fn(...args);
      } catch (error) {
        this.handle(error, { ...context, args });
        throw error;
      }
    };
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: unknown, context?: Record<string, any>) => {
  errorHandler.handle(error, context);
};

export const wrapAsync = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, any>
) => {
  return errorHandler.wrapAsync(fn, context);
};

export const wrapSync = <T extends any[], R>(
  fn: (...args: T) => R,
  context?: Record<string, any>
) => {
  return errorHandler.wrapSync(fn, context);
};
