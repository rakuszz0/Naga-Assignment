import { FastifyRequest, FastifyReply } from 'fastify';
import { TodoModel } from '../models/Todo';
import {
  GetTodosRoute,
  GetTodoRoute,
  CreateTodoRoute,
  UpdateTodoRoute,
  DeleteTodoRoute
} from '../types';

const handleError = (error: any, request: FastifyRequest, reply: FastifyReply) => {
  request.log.error(error);
  reply.status(500).send({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
};

export const TodoController = {
  getTodos: {
    schema: {
      description: 'Get all todos for the authenticated user',
      tags: ['todos'],
      headers: {
        type: 'object',
        properties: {
          authorization: {
            type: 'string',
            description: 'Bearer token',
          }
        },
        required: ['authorization']
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 }
        }
      },
      response: {
        200: {
          description: 'List of todos with pagination',
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  is_done: { type: 'boolean' },
                  user_id: { type: 'number' },
                  user_name: { type: 'string' },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' }
              }
            }
          }
        },
        400: {
        description: 'Bad Request',
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          code: { type: 'string' }
        }
      }
      }
    },
    handler: async (request: FastifyRequest<GetTodosRoute>, reply: FastifyReply) => {
      try {
        console.log('kemna',request)
        const { page = 1, limit = 10 } = request.query || {};

        const pageNum = Number(page);
        const limitNum = Number(limit);
        if (isNaN(pageNum) || pageNum < 1) {
            return reply.status(400).send({
              error: 'Bad Request',
              message: 'Page must be a valid number greater than 0',
              code: 'INVALID_PAGE'
            });
        }
      
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return reply.status(400).send({
              error: 'Bad Request',
              message: 'Limit must be a valid number between 1 and 100',
              code: 'INVALID_LIMIT'
            });
        }

        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized', code: 'NO_USER_ID' });
        }

        const { todos, total } = await TodoModel.findWithPagination(userId, pageNum, limitNum);
        return reply.send({
          data: todos,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        });
      } catch (error) {
        handleError(error, request, reply);
      }
    }
  },

  getTodo: {
    schema: {
      description: 'Get a specific todo by ID',
      tags: ['todos'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        },
        required: ['id']
      },
      headers: {
        type: 'object',
        properties: {
          authorization: {
            type: 'string',
            description: 'Bearer token',
          }
        },
        required: ['authorization']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            is_done: { type: 'boolean' },
            user_id: { type: 'number' },
            user_name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<GetTodoRoute>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized', code: 'NO_USER_ID' });
        }
        const todo = await TodoModel.findByIdAndUserId(id, userId);
        if (!todo) {
          return reply.status(404).send({
            error: 'Todo not found',
            code: 'TODO_NOT_FOUND'
          });
        }
        return reply.send(todo);
      } catch (error) {
        handleError(error, request, reply);
      }
    }
  },

  createTodo: {
    schema: {
      description: 'Create a new todo',
      tags: ['todos'],
      headers: {
        type: 'object',
        properties: {
          authorization: {
            type: 'string',
            description: 'Bearer token',
            
          }
        },
        required: ['authorization']
      },
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string',  minLength: 1, maxLength: 255 },
          description: { type: 'string', maxLength: 1000 }
        }
      },
      response: {
        201: {
          description: 'Todo created successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            is_done: { type: 'boolean' },
            user_id: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<CreateTodoRoute>, reply: FastifyReply) => {
      try {
        if (!request.body) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "Request body is required",
          code: "MISSING_BODY"
        });
      }
        const { title, description } = request.body;
        if (!title || title.trim() === '') {
        return reply.status(400).send({
          error: "Bad Request", 
          message: "Title is required and cannot be empty",
          code: "MISSING_TITLE"
        });
      }
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized', code: 'NO_USER_ID' });
        }
        const todoId = await TodoModel.create({
          title,
          description: description || '',
          user_id: userId
        });
        const todo = await TodoModel.findByIdAndUserId(todoId,userId);
        console.log('Created todo:', todo);
        if (!todo) {
          return reply.status(500).send({
            error: 'Failed to create todo',
            code: 'TODO_CREATION_FAILED'
          });
        }
        return reply.status(201).send(todo);
      } catch (error) {
        handleError(error, request, reply);
      }
    }
  },

  updateTodo: {
    schema: {
      description: 'Update a todo by ID',
      tags: ['todos'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        },
        required: ['id']
      },
      headers: {
        type: 'object',
        properties: {
          authorization: {
            type: 'string',
            description: 'Bearer token',
          }
        },
        required: ['authorization']
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string', maxLength: 1000 },
          is_done: { type: 'boolean' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            is_done: { type: 'boolean' },
            user_id: { type: 'number' },
            user_name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<UpdateTodoRoute>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const { title, description, is_done } = request.body;
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized', code: 'NO_USER_ID' });
        }
        const updated = await TodoModel.update(id, userId, { title, description, is_done });
        if (!updated) {
          return reply.status(404).send({ error: 'Todo not found', code: 'TODO_NOT_FOUND' });
        }
        const todo = await TodoModel.findByIdAndUserId(id, userId);
        return reply.send(todo);
      } catch (error) {
        handleError(error, request, reply);
      }
    }
  },

  deleteTodo: {
    schema: {
      description: 'Delete a todo by ID',
      tags: ['todos'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        },
        required: ['id']
      },
      headers: {
        type: 'object',
        properties: {
          authorization: {
            type: 'string',
            description: 'Bearer token',
          }
        },
        required: ['authorization']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<DeleteTodoRoute>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized', code: 'NO_USER_ID' });
        }
        const deleted = await TodoModel.delete(id, userId);
        if (!deleted) {
          return reply.status(404).send({ error: 'Todo not found', code: 'TODO_NOT_FOUND' });
        }
        return reply.send({ message: 'Todo deleted successfully' });
      } catch (error) {
        handleError(error, request, reply);
      }
    }
  }
};
