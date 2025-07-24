import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { TodoElastic } from '../interface';
import { SearchIndex } from '../enum/search-index';

@Injectable()
export class TodoSearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async search(text: string, userId: string): Promise<TodoElastic[]> {
    const result = await this.elasticsearchService.search<TodoElastic>({
      index: SearchIndex.TODO_SEARCH,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: text,
                fields: ['title', 'description'],
              },
            },
            {
              match: {
                userId: userId,
              },
            },
          ],
        },
      },
    });

    return result.hits.hits.map((hit) => hit._source as TodoElastic);
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
