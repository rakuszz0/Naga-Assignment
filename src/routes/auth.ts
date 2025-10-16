import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AuthController } from '../controllers/authController';

export default async function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.post('/register', AuthController.register);
  fastify.post('/login', AuthController.login);

  fastify.get('/profile', {
    schema: AuthController.getProfile.schema,
    preHandler: fastify.authenticate,
    handler: AuthController.getProfile.handler
  });
}