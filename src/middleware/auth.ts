import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { JWTPayload } from '../types';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authMiddleware: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        
        if (!request.headers.authorization) {
          return reply.status(401).send({
            error: 'No token provided',
            code: 'NO_TOKEN',
          });
        }

        const decoded = await request.jwtVerify<JWTPayload>();
        request.user = decoded;

      } catch (error) {
        fastify.log?.debug?.(error);
        return reply.status(401).send({
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN',
        });
      }
    }
  );
};

export default fp(authMiddleware, { name: 'auth-middleware' });
