import { WebtoonExceptionCode } from "../error.constants";
import { ErrorCode } from "../errorCode"
import { WebtoonException } from "./webtoonException";

function createWebtoonException(statusCode: number, defaultMessage: string) {
    return function(message?: string) {
        const errorCode = new ErrorCode(statusCode, defaultMessage);
        return new WebtoonException(errorCode, message);
    }
}

export const WebtoonNotFoundException = createWebtoonException(
    WebtoonExceptionCode.WebtoonNotFound,
    "webtoon not found",
);

export const WebtoonAlreadyExistException = createWebtoonException(
    WebtoonExceptionCode.WebtoonAlreadyExist,
    "webtoon already exist",
);

export const CategoryNotFoundException = createWebtoonException(
    WebtoonExceptionCode.CategoryNotFound,
    "category not found",
);

export const WebtoonPropertyWrongException = createWebtoonException(
    WebtoonExceptionCode.WebtoonPropertyWrong,
    "webtoon property is wrong",
);