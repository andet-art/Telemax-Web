import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: 'sig43rnu', // e.g. "x7y8z9"
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-01-01',
});
