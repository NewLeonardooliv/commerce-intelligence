export class InMemoryStorage<T extends { id: string }> {
  private store: Map<string, T> = new Map();

  async create(item: T): Promise<T> {
    this.store.set(item.id, item);
    return item;
  }

  async findById(id: string): Promise<T | null> {
    return this.store.get(id) || null;
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.store.values());
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const item = this.store.get(id);

    if (!item) {
      return null;
    }

    const updated = { ...item, ...updates };
    this.store.set(id, updated);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async count(): Promise<number> {
    return this.store.size;
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
