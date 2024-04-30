// eslint-disable-next-line @typescript-eslint/no-var-requires
// require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import { NODE_ENV, PAYLOAD_LIMIT, PORT, RATE_LIMIT_MAX } from 'environments';
import { AppLogger } from 'common/logger/logger.service';
import { LocalAuthGuard } from 'authz/local.strategy';
import { GqlAuthGuard } from 'authz/gqlAuth.guard';
import { TimeoutInterceptor } from 'common/interceptors/timeout.interceptor';
import { LoggingInterceptor } from 'common/interceptors/logging.interceptor';
import { ErrorsInterceptor } from 'common/interceptors/exception.interceptor';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

declare const module: any;
const Logger = new AppLogger();
Logger.setContext('Main');

async function bootstrap() {
  const { HOST } = process.env;
  Logger.log(`Starting server: ${NODE_ENV}...`);

  const app = await NestFactory.create(AppModule);

  NODE_ENV === 'production'
    ? app.useGlobalGuards(new GqlAuthGuard())
    : app.useGlobalGuards(app.get(LocalAuthGuard));

  app.enableCors();

  // NOTE: compression
  app.use(compression());

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );

  // NOTE: body parser
  app.use(bodyParser.json({ limit: PAYLOAD_LIMIT }));

  NOTE: rateLimit;
  app.use(
    rateLimit({
      windowMs: 1000 * 60 * 1, // 1 minutes
      max: RATE_LIMIT_MAX, // limit each IP to 100 requests per windowMs
      message:
        '⚠️  Too many request created from this IP, please try again after an minute',
    }),
  );

  // NOTE: interceptors;
  app.useGlobalInterceptors(new ErrorsInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor(Logger));
  app.useGlobalInterceptors(new TimeoutInterceptor());

  await app.listen(PORT, HOST);

  // if (module.hot) {
  //   module.hot.accept();
  //   module.hot.dispose(() => app.close());
  // }

  Logger.log(`Server listening on http://${HOST}:${PORT}`);
}

bootstrap();
