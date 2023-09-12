export enum AuthExceptionCode {
    UserNotFound = 404,
    UserAlreadyExist = 403,
    PasswordWrong = 401,
    OverRetry = 429,
}

export enum WebtoonExceptionCode {
    WebtoonNotFound = 404,
    WebtoonAlreadyExist = 403,
    CategoryNotFound = 404,
    WebtoonPropertyWrong = 400,
}