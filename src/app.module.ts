import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { Module } from '@nestjs/common';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { AuthzModule } from './authz/authz.module';
import { DatabaseService } from './common/database/database.service';
import { DatabaseModule } from './common/database/database.module';
import { join } from 'path';
import { FrontendModule } from './frontend/frontend.module';
import { CommonModule } from './common/common.module';
import { AppLogger } from './common/logger/logger.service';
import {
  DV01Scalar,
  DateYYYYMMDDScalar,
} from 'common/custom-scalars/custom.scalar';
import { DatabaseEnvE } from 'common/database/database.constants-enums';
import { NODE_ENV } from 'environments';
import { AppController } from 'app.controller';
import { AppService } from 'app.service';

@Module({
  imports: [
    DatabaseModule.register(DatabaseEnvE.PROD),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      context: ({ req, res }) => ({ req, res }),
      playground: false,
      typePaths: ['./src/frontend/**/*.graphql', './src/common/**/*.graphql'],
      ...(true && {
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
      }),
      definitions: {
        path: join(process.cwd(), './src/frontend/graphql.schema.ts'),
      },
      include: [FrontendModule, CommonModule],
      path: '/graphql/frontend',
      // formatError: (error: any) => {
      //   const graphQLFormattedError = {
      //     message: error.message,
      //     statusCode: error.extensions?.exception?.status || 500,
      //     // include other fields if necessary
      //   };
      //   return graphQLFormattedError;
      // },
    }),
    AuthzModule,
    CommonModule,
    FrontendModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseService,
    CommonModule,
    AppLogger,
    DV01Scalar,
    DateYYYYMMDDScalar,
  ],
})
export class AppModule {}
