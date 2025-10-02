import { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  errorCount: number;
  lastUpdated: Date;
}

interface PerformanceMonitoringOptions {
  enabled?: boolean;
  sampleRate?: number;
  reportInterval?: number;
}

export function usePerformanceMonitoring(
  componentName: string,
  options: PerformanceMonitoringOptions = {}
) {
  const {
    enabled = true,
    sampleRate = 0.1, // 10% sampling rate
    reportInterval = 30000, // 30 seconds
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    errorCount: 0,
    lastUpdated: new Date(),
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  const measureRenderTime = useCallback(() => {
    if (!enabled || Math.random() > sampleRate) return;

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        lastUpdated: new Date(),
      }));
    };
  }, [enabled, sampleRate]);

  const measureNetworkLatency = useCallback(async (url: string) => {
    if (!enabled || Math.random() > sampleRate) return 0;

    const startTime = performance.now();
    
    try {
      await fetch(url, { method: 'HEAD' });
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        networkLatency: latency,
        lastUpdated: new Date(),
      }));
      
      return latency;
    } catch (error) {
      console.error('Network latency measurement failed:', error);
      return 0;
    }
  }, [enabled, sampleRate]);

  const measureMemoryUsage = useCallback(() => {
    if (!enabled || !('memory' in performance)) return;

    const memoryInfo = (performance as any).memory;
    const memoryUsage = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;
    
    setMetrics(prev => ({
      ...prev,
      memoryUsage,
      lastUpdated: new Date(),
    }));
  }, [enabled]);

  const recordError = useCallback((error: Error) => {
    setMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1,
      lastUpdated: new Date(),
    }));
  }, []);

  const startMonitoring = useCallback(() => {
    if (!enabled) return;

    setIsMonitoring(true);
    
    // Measure initial load time
    const loadTime = performance.now();
    setMetrics(prev => ({
      ...prev,
      loadTime,
      lastUpdated: new Date(),
    }));

    // Set up periodic measurements
    const interval = setInterval(() => {
      measureMemoryUsage();
    }, reportInterval);

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [enabled, reportInterval, measureMemoryUsage]);

  const reportMetrics = useCallback(() => {
    if (!enabled) return;

    // Send metrics to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metrics', {
        component_name: componentName,
        load_time: metrics.loadTime,
        render_time: metrics.renderTime,
        memory_usage: metrics.memoryUsage,
        network_latency: metrics.networkLatency,
        error_count: metrics.errorCount,
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metrics for ${componentName}:`, metrics);
    }
  }, [enabled, componentName, metrics]);

  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  // Report metrics periodically
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(reportMetrics, reportInterval);
    return () => clearInterval(interval);
  }, [enabled, reportMetrics, reportInterval]);

  return {
    metrics,
    isMonitoring,
    measureRenderTime,
    measureNetworkLatency,
    measureMemoryUsage,
    recordError,
    reportMetrics,
  };
}

// Hook for measuring component performance
export function useComponentPerformance(componentName: string) {
  const { measureRenderTime, recordError } = usePerformanceMonitoring(componentName);

  useEffect(() => {
    const endMeasurement = measureRenderTime();
    return endMeasurement;
  }, [measureRenderTime]);

  const handleError = useCallback((error: Error) => {
    recordError(error);
    throw error;
  }, [recordError]);

  return { handleError };
}

// Hook for measuring API performance
export function useAPIPerformance() {
  const { measureNetworkLatency } = usePerformanceMonitoring('api-calls');

  const measureAPICall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const latency = await measureNetworkLatency(endpoint);
    
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      throw error;
    }
  }, [measureNetworkLatency]);

  return { measureAPICall };
}
