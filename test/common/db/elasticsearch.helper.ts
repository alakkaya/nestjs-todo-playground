import { Client } from '@elastic/elasticsearch';
import { SearchIndex } from '../../../src/modules/utils/elastic-search/enum/search-index';

export const esClient = new Client({
  nodes: ['http://localhost:9200'],
});

export const resetElasticSearch = async () => {
  try {
    await esClient.indices.delete({ index: SearchIndex.TODO_SEARCH });
  } catch (error) {
    console.error('Error resetting Elasticsearch:', error);
  }
};
