import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/core-simulation/**/*.graphql', './src/common/**/*.graphql'],
  path: join(process.cwd(), './src/core-simulation/graphql.schema.ts'),
  outputAs: 'interface',
});
