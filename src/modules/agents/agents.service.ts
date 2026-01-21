import type { 
  Agent, 
  AgentTask, 
  AgentCreateInput, 
  AgentTaskInput 
} from '@shared/types/agent.types';
import { NotFoundError, ValidationError } from '@shared/errors/app-error';
import { InMemoryStorage } from '@infrastructure/storage/in-memory-storage';
import { generateAgentId, generateTaskId } from '@shared/utils/id.util';
import { aiService } from '@infrastructure/ai/ai-service';

class AgentsService {
  private agentsStorage: InMemoryStorage<Agent>;
  private tasksStorage: InMemoryStorage<AgentTask>;
  
  constructor() {
    this.agentsStorage = new InMemoryStorage<Agent>();
    this.tasksStorage = new InMemoryStorage<AgentTask>();
  }
  
  async createAgent(input: AgentCreateInput): Promise<Agent> {
    const agent: Agent = {
      id: generateAgentId(),
      name: input.name,
      description: input.description,
      capabilities: input.capabilities,
      status: 'idle',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return this.agentsStorage.create(agent);
  }
  
  async getAgent(id: string): Promise<Agent> {
    const agent = await this.agentsStorage.findById(id);
    
    if (!agent) {
      throw new NotFoundError('Agent');
    }
    
    return agent;
  }
  
  async listAgents(): Promise<Agent[]> {
    return this.agentsStorage.findAll();
  }
  
  async deleteAgent(id: string): Promise<void> {
    const deleted = await this.agentsStorage.delete(id);
    
    if (!deleted) {
      throw new NotFoundError('Agent');
    }
  }
  
  async createTask(input: AgentTaskInput): Promise<AgentTask> {
    const agent = await this.getAgent(input.agentId);
    
    if (!agent.capabilities.includes(input.type)) {
      throw new ValidationError(
        `Agent does not support capability: ${input.type}`
      );
    }
    
    const task: AgentTask = {
      id: generateTaskId(),
      agentId: input.agentId,
      type: input.type,
      input: input.input,
      status: 'processing',
      startedAt: new Date(),
    };
    
    await this.agentsStorage.update(agent.id, { 
      status: 'processing',
      updatedAt: new Date(),
    });
    
    const createdTask = await this.tasksStorage.create(task);
    
    this.processTask(createdTask).catch(console.error);
    
    return createdTask;
  }
  
  private async processTask(task: AgentTask): Promise<void> {
    try {
      const result = await aiService.processTask(task.type, task.input);
      
      await this.tasksStorage.update(task.id, {
        output: result,
        status: 'completed',
        completedAt: new Date(),
      });
      
      await this.agentsStorage.update(task.agentId, {
        status: 'idle',
        updatedAt: new Date(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.tasksStorage.update(task.id, {
        status: 'failed',
        error: errorMessage,
        completedAt: new Date(),
      });
      
      await this.agentsStorage.update(task.agentId, {
        status: 'idle',
        updatedAt: new Date(),
      });
    }
  }
  
  async getTask(taskId: string): Promise<AgentTask> {
    const task = await this.tasksStorage.findById(taskId);
    
    if (!task) {
      throw new NotFoundError('Task');
    }
    
    return task;
  }
  
  async listTasks(agentId?: string): Promise<AgentTask[]> {
    const tasks = await this.tasksStorage.findAll();
    
    if (agentId) {
      return tasks.filter(task => task.agentId === agentId);
    }
    
    return tasks;
  }
}

export const agentsService = new AgentsService();
