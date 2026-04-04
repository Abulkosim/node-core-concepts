class MonitorQueryBuilder {
  private conditions: string[] = [];
  private params: any[] = [];
  private orderClause: string | null = null;

  status(s: 'up' | 'down' | 'paused'): this {
    this.params.push(s);
    this.conditions.push(`status = $${this.params.length}`);
    return this;
  }

  tag(t: string): this {
    this.params.push(t);
    this.conditions.push(`tag = $${this.params.length}`);
    return this;
  }

  search(term: string): this {
    this.params.push(`%${term}%`);
    this.conditions.push(`name ILIKE $${this.params.length}`);
    return this;
  }

  createdAfter(date: Date): this {
    this.params.push(date.toISOString());
    this.conditions.push(`created_at >= $${this.params.length}`);
    return this;
  }

  createdBefore(date: Date): this {
    this.params.push(date.toISOString());
    this.conditions.push(`created_at <= $${this.params.length}`);
    return this;
  }

  sortBy(field: 'name' | 'last_ping' | 'status', direction: 'asc' | 'desc' = 'asc'): this {
    this.orderClause = `ORDER BY ${field} ${direction.toUpperCase()}`;
    return this;
  }

  build(): { sql: string; params: any[] } {
    let sql = 'SELECT * FROM monitors';

    if (this.conditions.length > 0) {
      sql += ' WHERE ' + this.conditions.join(' AND ');
    }

    if (this.orderClause) {
      sql += ' ' + this.orderClause;
    }

    return { sql, params: this.params };
  }
}

const q1 = new MonitorQueryBuilder()
  .status('down')
  .build();

const q2 = new MonitorQueryBuilder()
  .status('up')
  .search('payment')
  .createdAfter(new Date('2026-01-01'))
  .sortBy('last_ping', 'desc')
  .build();

  const q3 = new MonitorQueryBuilder().build();