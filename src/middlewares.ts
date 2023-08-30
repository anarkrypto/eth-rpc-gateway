import { Context } from 'hono'
import { ERROR_CODES, JSON_RPC_VERSION } from './constants'

/*
    For JSON-RPC is a good practice that server should always return an
    HTTP status code of 200 (OK) for bothsuccessful responses and error responses.
    The success or failure of a JSON-RPC call is indicated within the response body,
    not through the HTTP status code.
*/
export const errorHandler = (err: Error, c: Context) => {
    if (err instanceof Error) {
        return c.json({ jsonrpc: JSON_RPC_VERSION, code: ERROR_CODES.internalError, error: err.message })
    }
    return c.json({ error: 'Unknown error', code: ERROR_CODES.internalError, })
}