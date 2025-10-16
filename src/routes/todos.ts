import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { TodoController } from '../controllers/todoController';

export default async function todoRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.route({
    method: 'GET',
    url: '/',
    schema: TodoController.getTodos.schema,
    handler: TodoController.getTodos.handler
  });

  fastify.route({
    method: 'GET',
    url: '/:id',
    schema: TodoController.getTodo.schema,
    handler: TodoController.getTodo.handler
  });

  fastify.route({
    method: 'POST',
    url: '/',
    schema: TodoController.createTodo.schema,
    handler: TodoController.createTodo.handler
  });

  fastify.route({
    method: 'PUT',
    url: '/:id',
    schema: TodoController.updateTodo.schema,
    handler: TodoController.updateTodo.handler
  });

  fastify.route({
    method: 'DELETE',
    url: '/:id',
    schema: TodoController.deleteTodo.schema,
    handler: TodoController.deleteTodo.handler
  });
}