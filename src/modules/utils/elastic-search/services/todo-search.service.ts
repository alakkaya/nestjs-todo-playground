import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { TodoElastic } from '../interface';
import { SearchIndex } from '../enum/search-index';

@Injectable()
export class TodoSearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async search(
    query: string,
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ todos: TodoElastic[]; total: number }> {
    const from = (page - 1) * limit;

    const result = await this.elasticsearchService.search<TodoElastic>({
      index: SearchIndex.TODO_SEARCH,
      from,
      size: limit,
      query: {
        bool: {
          must: [
            {
              match: {
                userId: userId,
              },
            },
          ],
          should: [
            {
              wildcard: {
                title: {
                  value: `${query}*`,
                  case_insensitive: true,
                },
              },
            },
            {
              wildcard: {
                description: {
                  value: `${query}*`,
                  case_insensitive: true,
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
    });

    const todos = result.hits.hits.map((hit) => hit._source as TodoElastic);
    const total =
      typeof result.hits.total === 'object'
        ? result.hits.total.value
        : result.hits.total;

    return { todos, total };
  }

  async insert(todo: TodoElastic): Promise<void> {
    await this.elasticsearchService.index<TodoElastic>({
      index: SearchIndex.TODO_SEARCH,
      id: todo.id,
      document: todo,
    });
  }

  async update(todo: TodoElastic): Promise<void> {
    await this.elasticsearchService.update<TodoElastic>({
      index: SearchIndex.TODO_SEARCH,
      id: todo.id,
      doc: todo,
      doc_as_upsert: true, // Update if exists, insert if not
    });
  }

  async delete(todoId: string): Promise<void> {
    await this.elasticsearchService.delete({
      index: SearchIndex.TODO_SEARCH,
      id: todoId,
    });
  }
}
