import { WebtoonInfo } from "src/webtoons/types";
import { ErrorCode } from "../errorCode";

export class WebtoonException extends Error {
    constructor(public errorCode: ErrorCode, message?: string, public data?: WebtoonInfo) {
        if (!message) message = errorCode.message;
        super(message);
    }
}