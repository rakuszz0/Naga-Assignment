import { FastifyRequest, FastifyReply } from 'fastify';
import { UserModel } from '../models/User';
import {
  AuthResponse,
  RegisterRoute,
  LoginRoute,
  ProfileRoute,
} from '../types';


export class AuthController {
  
  private static generateToken(jwt: any, userId: number): string {
    return jwt.sign({ userId }, { expiresIn: '7d' });
  }


  static register = {
    schema: {
      description: 'Register a new user',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
    },

    handler: async (request: FastifyRequest<RegisterRoute>, reply: FastifyReply) => {
      try {
        const { name, email, password } = request.body;

        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
          return reply.status(400).send({
            error: 'User already exists',
            code: 'USER_EXISTS',
          });
        }

        const userId = await UserModel.create({ name, email, password });
        const user = await UserModel.findById(userId);

        if (!user) {
          return reply.status(500).send({
            error: 'Failed to create user',
            code: 'USER_CREATION_FAILED',
          });
        }

        const token = AuthController.generateToken(request.server.jwt, userId);

        const response: AuthResponse = {
          message: 'User registered successfully',
          token,
          user,
        };

        return reply.status(201).send(response);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
        });
      }
    },
  };

  static login = {
    schema: {
      description: 'Login user',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
    },

    handler: async (request: FastifyRequest<LoginRoute>, reply: FastifyReply) => {
      try {
        const { email, password } = request.body;

        const user = await UserModel.findByEmail(email);
        if (!user) {
          return reply.status(400).send({
            error: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS',
          });
        }

        const isPasswordValid = await UserModel.verifyPassword(password, user.password);
        if (!isPasswordValid) {
          return reply.status(400).send({
            error: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS',
          });
        }

        const token = AuthController.generateToken(request.server.jwt, user.id);

        const response: AuthResponse = {
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        };

        return reply.send(response);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
        });
      }
    },
  };

  
  static getProfile = {
    schema: {
      description: 'Get current user profile',
      tags: ['auth'],
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' },
        },
        required: ['authorization'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
    },

    handler: async (request: FastifyRequest<ProfileRoute>, reply: FastifyReply) => {
      try {
        const userId = request.user?.userId;

        if (!userId) {
          return reply.status(401).send({
            error: 'Unauthorized',
            code: 'NO_USER_ID',
          });
        }

        const user = await UserModel.findById(userId);

        if (!user) {
          return reply.status(404).send({
            error: 'User not found',
            code: 'USER_NOT_FOUND',
          });
        }

        return reply.send({ user });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
        });
      }
    },
  };
}
