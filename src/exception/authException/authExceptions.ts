import { AuthExceptionCode } from "../error.constants";
import { ErrorCode } from "../errorCode";
import { AuthException } from "./authException";

function createAuthException(statusCode: number, defaultMessage: string) {
    return function (message?: string) {
        const errorCode = new ErrorCode(statusCode, defaultMessage);
        return new AuthException(errorCode, message);
    }
}

export const UserNotFoundException = createAuthException(
    AuthExceptionCode.UserNotFound,
    "user is not exist"
)

export const UserAlreadyExistException = createAuthException(
    AuthExceptionCode.UserAlreadyExist,
    "user is already exist"
)

export const PasswordWrongException = createAuthException(
    AuthExceptionCode.PasswordWrong,
    "password is wrong"
)

export const OverRetryException = createAuthException(
    AuthExceptionCode.OverRetry,
    "too many retry"
)


// export const UserNotFoundException = (message?: string) => {
//     const statusCode: number = AuthExceptionCode.UserNotFound;
//     const errorCode = new ErrorCode(statusCode, "user is not exist");
//     return new AuthException(errorCode, message);
// }

// export const UserAlreadyExistException = (message?: string) => {
//     const statusCode: number = AuthExceptionCode.UserAlreadyExist;
//     const errorCode = new ErrorCode(statusCode, "user is already exist");
//     return new AuthException(errorCode, message);
// }

// export const PasswordWrongException = (message?: string) => {
//     const statusCode: number = AuthExceptionCode.PasswordWrong;
//     const errorCode = new ErrorCode(statusCode, "password is wrong");
//     return new AuthException(errorCode, message);
// }

// export const OverRetryException = (message?: string) => {
//     const statusCode: number = AuthExceptionCode.OverRetry;
//     const errorCode = new ErrorCode(statusCode, "too many retry");
//     return new AuthException(errorCode, message);
// }