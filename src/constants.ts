export const JSON_RPC_VERSION = '2.0'


/*
    The error codes are the same as JSON-RPC 2.0 specification
    https://www.jsonrpc.org/specification#overview
*/
export const ERROR_CODES = {
    parseError: -32700,
    invalidRequests: -32600,
    methodNotFound: -32601,
    invalidParams: -32602,
    internalError: -32603,
    serverError: -32000
}