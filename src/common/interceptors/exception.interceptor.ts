import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
 
@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // Log the error internally
        Logger.error(err.message, err.stack);
 
        // Determine the response status code
        const status = err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
 
        // Create a user-friendly error response
        const userFriendlyError = {
          statusCode: status,
          message: 'An unexpected error occurred. Please try again later.', // Generic error message
          // You can include more details here if you want, but avoid sensitive data or implementation details
        };
 
        // Return the user-friendly error as an observable
        return throwError(() => new HttpException(userFriendlyError, status));
      }),
    );
  }
}
