import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export function validateDto(dtoClass: any) {
  return function (req: Request, res: Response, next: NextFunction) {
    const dtoObject = plainToInstance(dtoClass, req.body);
    
    validate(dtoObject, { 
      whitelist: true, 
      forbidNonWhitelisted: true 
    }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const errorMessages = errors.map((error) => ({
          field: error.property,
          message: error.constraints ? Object.values(error.constraints).join(', ') : 'Validation failed'
        }));
        
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errorMessages
        });
      }
      
      // Override body with the validated object (which has extra fields stripped)
      req.body = dtoObject;
      next();
    });
  };
}
