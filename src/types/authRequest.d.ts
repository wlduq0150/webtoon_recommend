export interface authReq extends Request {}
export type authRequest = authReq & { 
    headers: {
        authorization: string,
        refresh: string, 
    } 
};