import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: [
    './src/reporting-internal/**/*.graphql',
    './src/common/**/*.graphql',
  ],
  path: join(process.cwd(), './src/reporting-internal/graphql.schema.ts'),
  outputAs: 'interface',
});
