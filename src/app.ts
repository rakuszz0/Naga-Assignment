import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todos';
import authMiddleware from './middleware/auth';

dotenv.config();

const buildApp = (options: FastifyServerOptions = {}): FastifyInstance => {
  const app = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    },
    ...options
  });

  app.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Todo API Documentation',
      description: 'REST API for Todo App with Fastify, MySQL and JWT Authentication',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  }
});


  app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: true,
      tryItOutEnabled: true
    },
    staticCSP: true,
    transformStaticCSP: (header) => header
  });

  app.register(cors, {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  });

  app.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-12345-change-in-production'
  });

  app.register(authMiddleware);

  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(todoRoutes, { prefix: '/api/todos' });

  app.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['system'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' },
            memory: {
              type: 'object',
              properties: {
                rss: { type: 'number' },
                heapTotal: { type: 'number' },
                heapUsed: { type: 'number' },
                external: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const memoryUsage = process.memoryUsage();
    
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      }
    };
  });

  app.get('/', {
    schema: {
      description: 'API Information',
      tags: ['system'],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            documentation: { type: 'string' },
            endpoints: {
              type: 'object',
              properties: {
                auth: {
                  type: 'object',
                  properties: {
                    register: { type: 'string' },
                    login: { type: 'string' },
                    profile: { type: 'string' }
                  }
                },
                todos: {
                  type: 'object',
                  properties: {
                    getAll: { type: 'string' },
                    getOne: { type: 'string' },
                    create: { type: 'string' },
                    update: { type: 'string' },
                    delete: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    return {
      message: '🚀 Fastify Todo API is running!',
      timestamp: new Date().toISOString(),
      documentation: '/docs',
      endpoints: {
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          profile: 'GET /api/auth/profile'
        },
        todos: {
          getAll: 'GET /api/todos',
          getOne: 'GET /api/todos/:id',
          create: 'POST /api/todos',
          update: 'PUT /api/todos/:id',
          delete: 'DELETE /api/todos/:id'
        }
      }
    };
  });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({ 
      error: 'Route not found', 
      code: 'ROUTE_NOT_FOUND',
      path: request.url,
      method: request.method
    });
  });

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation error',
        details: error.validation,
        code: 'VALIDATION_ERROR'
      });
    }

    if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
      return reply.status(401).send({
        error: 'No authorization header',
        code: 'NO_AUTHORIZATION_HEADER'
      });
    }

    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
      return reply.status(401).send({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
      return reply.status(401).send({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return reply.status(500).send({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  });

  return app;
};

if (require.main === module) {
  const app = buildApp();
  
  const start = async (): Promise<void> => {
    try {
      await testConnection();
      
      const PORT = parseInt(process.env.PORT || '5001');
      const HOST = process.env.HOST || '0.0.0.0';
      
      await app.listen({ port: PORT, host: HOST });
      
      console.log(` Server running on http://${HOST}:${PORT}`);
      console.log(` API Documentation available on http://${HOST}:${PORT}/docs`);
      console.log(` Health check available on http://${HOST}:${PORT}/health`);
      
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  };

  start();
}

export { buildApp };