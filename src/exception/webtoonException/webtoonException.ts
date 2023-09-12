import { ErrorCode } from "../errorCode";

export class WebtoonException extends Error {
    constructor(private errorCode: ErrorCode, message?: string) {
        if (!message) message = errorCode.message;
        super(message);
    }
}