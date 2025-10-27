import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ErrorType, createErrorResponse } from '../types/errors';

// Middleware de validation
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    res.status(400).json(createErrorResponse(ErrorType.VALIDATION_ERROR, errorMessages.join(', ')));
    return;
  }
  
  next();
};