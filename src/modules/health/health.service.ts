import { env } from '@config/env';

type HealthStatus = {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
};

class HealthService {
  private startTime: number;
  
  constructor() {
    this.startTime = Date.now();
  }
  
  async check(): Promise<HealthStatus> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: env.nodeEnv,
      uptime: this.getUptime(),
    };
  }
  
  async isReady(): Promise<boolean> {
    return true;
  }
  
  private getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
}

export const healthService = new HealthService();
