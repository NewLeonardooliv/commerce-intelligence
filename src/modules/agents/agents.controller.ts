import { Elysia } from 'elysia';
import { agentsService } from './agents.service';
import { successResponse } from '@shared/utils/response.util';
import {
  createAgentSchema,
  createTaskSchema,
  agentParamsSchema,
  taskParamsSchema,
} from './agents.schema';

export const agentsController = new Elysia({ prefix: '/agents' })
  .post(
    '/',
    async ({ body }) => {
      const agent = await agentsService.createAgent(body);
      return successResponse(agent, 'Agent created successfully');
    },
    {
      body: createAgentSchema,
      detail: {
        summary: 'Create agent',
        description: 'Create a new AI agent with specified capabilities',
        tags: ['Agents'],
      },
    }
  )
  .get(
    '/',
    async () => {
      const agents = await agentsService.listAgents();
      return successResponse(agents);
    },
    {
      detail: {
        summary: 'List agents',
        description: 'Get all AI agents',
        tags: ['Agents'],
      },
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      const agent = await agentsService.getAgent(params.id);
      return successResponse(agent);
    },
    {
      params: agentParamsSchema,
      detail: {
        summary: 'Get agent',
        description: 'Get agent by ID',
        tags: ['Agents'],
      },
    }
  )
  .delete(
    '/:id',
    async ({ params }) => {
      await agentsService.deleteAgent(params.id);
      return successResponse(null, 'Agent deleted successfully');
    },
    {
      params: agentParamsSchema,
      detail: {
        summary: 'Delete agent',
        description: 'Delete agent by ID',
        tags: ['Agents'],
      },
    }
  )
  .post(
    '/tasks',
    async ({ body }) => {
      const task = await agentsService.createTask(body);
      return successResponse(task, 'Task created successfully');
    },
    {
      body: createTaskSchema,
      detail: {
        summary: 'Create task',
        description: 'Create a new task for an agent',
        tags: ['Agents'],
      },
    }
  )
  .get(
    '/tasks/:taskId',
    async ({ params }) => {
      const task = await agentsService.getTask(params.taskId);
      return successResponse(task);
    },
    {
      params: taskParamsSchema,
      detail: {
        summary: 'Get task',
        description: 'Get task by ID',
        tags: ['Agents'],
      },
    }
  )
  .get(
    '/:id/tasks',
    async ({ params }) => {
      const tasks = await agentsService.listTasks(params.id);
      return successResponse(tasks);
    },
    {
      params: agentParamsSchema,
      detail: {
        summary: 'List agent tasks',
        description: 'Get all tasks for a specific agent',
        tags: ['Agents'],
      },
    }
  );
