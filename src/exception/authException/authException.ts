import { ErrorCode } from "../errorCode";

export class AuthException extends Error {
    constructor(errorCode: ErrorCode, message?: string) {
        if (!message) message = errorCode.message;
        super(message);
    }
}