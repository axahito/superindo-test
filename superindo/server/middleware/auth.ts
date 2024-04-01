import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Middleware function to verify JWT token
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Get the token from the request headers
  const token = req.headers['authorization'];

  // Check if token is present
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, 'secret_key');
    // Attach user information to the request object
    req['user'] = decoded;
    // Proceed to the next middleware
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Failed to authenticate token' });
  }
};

// Middleware function to authorize based on role
export const authorizeRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // Check if user has the required role
      const userRole = req['user']?.role;
      if (userRole !== role) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      // Proceed to the next middleware
      next();
    };
  };
