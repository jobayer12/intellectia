import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

// Constants class
export class Constants {
    public static JWT_SECRET = process.env.JWT_SECRET;
    public static PORT = process.env.PORT;
    public static DATABASE_URL = process.env.DATABASE_URL;
    public static TOKEN_EXPIRATION_TIME = process.env.TOKEN_EXPIRATION_TIME; // in hours
    public static CLIENT_HOST = process.env.CLIENT_HOST;
    public static MAGIC_LINK_TOKEN_EXPIRATION_TIME = process.env.MAGIC_LINK_TOKEN_EXPIRATION_TIME; // in minutes
}

/** Verify the JSON WEB TOKEN */
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        res.status(500).json({ error: 'Internal server error' });
        return;
    }

    const jwt = require('jsonwebtoken');
    // Get the authentication token from the request headers, query parameters, or cookies
    // Example: Bearer <token>
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : req.query.token;

    // Verify and decode the token
    try {
        // Verify the token using your secret key or public key
        const decodedToken = jwt.verify(token, JWT_SECRET);

        // Set the userId and email in the request object
        res.locals.userId = decodedToken.userId;
        res.locals.email = decodedToken.email;
        res.locals.isAdmin = decodedToken.isAdmin;
        // Move to the next middleware
        next();
    } catch (error) {
        // Token verification failed
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
};

/**
 *
 * Prisma client singleton
 */
export class PrismaClientSingleton {
    static #instance: PrismaClient;

    static get prisma() {
        if (!PrismaClientSingleton.#instance) {
            PrismaClientSingleton.#instance = new PrismaClient();
        }
        return PrismaClientSingleton.#instance;
    }
}

/**
 *
 * Generate the JWT token given the email , userId, isAdmin
 *
 */
export const generateToken = (email: string, userId: string, isAdmin: boolean) => {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET not set');
    }

    return jwt.sign({ userId, email, isAdmin: isAdmin }, JWT_SECRET, { expiresIn: Constants.TOKEN_EXPIRATION_TIME });
};

export function isMagicTokenValid(creationDate: Date, validityMinutes: number): boolean {
    const now = new Date();
    const tokenCreationTime = new Date(creationDate);

    // Calculate the time difference in milliseconds between the current time and token creation time
    const timeDifferenceInMilliseconds = now.getTime() - tokenCreationTime.getTime();

    // Convert the validity period to milliseconds
    const validityMilliseconds = validityMinutes * 60 * 1000;

    // Check if the token is still valid
    return timeDifferenceInMilliseconds <= validityMilliseconds;
}

export function jwtExpireDate() {
    const jwtExpireHours = Constants.TOKEN_EXPIRATION_TIME || '20h'; // Set your desired expiration time in hours
    const hourInteger = parseInt(jwtExpireHours, 10);
    // add this hours to current time to get the expiration time
    const expirationTime = new Date(Date.now() + hourInteger * 60 * 60 * 1000);
    return expirationTime;
}