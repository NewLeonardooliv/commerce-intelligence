import { env } from './env';

export const swaggerConfig = {
  documentation: {
    info: {
      title: 'Commerce Intelligence API',
      version: '1.0.0',
      description: 'Intelligent data analysis service powered by AI agents',
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Analytics', description: 'Data analytics endpoints' },
      { name: 'Chat', description: 'AI-powered chat with intelligent agents' },
    ],
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: 'Development server',
      },
    ],
  },
};
