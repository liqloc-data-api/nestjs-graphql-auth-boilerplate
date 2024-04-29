import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/frontend/**/*.graphql', './src/common/**/*.graphql'],
  path: join(process.cwd(), './src/frontend/graphql.schema.ts'),
  outputAs: 'interface',
});
