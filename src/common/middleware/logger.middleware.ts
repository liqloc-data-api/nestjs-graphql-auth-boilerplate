import { AppLogger } from '../logger/logger.service';

export function LoggerMiddleware(
  req: { method: any; originalUrl: any },
  res: any,
  next: () => void,
) {
  const Logger = new AppLogger();
  Logger.setContext("LoggerMiddleware")
  Logger.debug(`Request... ${req.method} ${req.originalUrl}`, req);
  next();
}
