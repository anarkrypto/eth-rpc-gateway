// http://man.hubwiz.com/docset/Ethereum.docset/Contents/Resources/Documents/eth_getLogs.html
// https://ethereum.github.io/execution-apis/api-documentation/

import { JSON_RPC_VERSION } from "./constants"
import { Log, Storage } from "./types/Storage"

interface RpcGatewayConfig {
    networkId: number
    rpcUrl: string
    storage: Storage
}

interface CallRequestOptions {
    headers: Record<string, string>,
    signal: AbortSignal
}

export type RpcObject = Record<string, any> | Record<string, any>[]

interface PendingRpcObject {
    pendingCall: boolean
    id: number
}

export default class RpcController {

    jsonrpc = JSON_RPC_VERSION
    networkId: number
    rpcUrl: string
    storage: Storage

    constructor(config: RpcGatewayConfig) {
        this.rpcUrl = config.rpcUrl
        this.networkId = config.networkId
        this.storage = config.storage
    }

    async request(data: RpcObject, { headers, ...options }: CallRequestOptions = {} as CallRequestOptions) {
        const response = await fetch(this.rpcUrl, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            ...options
        })
        return response.json()
    }

    async conciliate(data: RpcObject) {

        const callIsArray = data instanceof Array
        const calls = callIsArray ? [...data] : [{ ...data }]

        const cachedResponse: Array<RpcObject | PendingRpcObject> = []
        const remoteCalls = []

        for (const call of calls) {
            if (call.method === 'eth_chainId' && this.networkId) {
                cachedResponse.push({
                    "jsonrpc": this.jsonrpc,
                    "id": call.id,
                    "result": `0x${this.networkId.toString(16)}`
                })
            } else if (call.method === 'eth_getLogs') {

                if (!(call.params instanceof Array)) {
                    return ({
                        "jsonrpc": this.jsonrpc,
                        "id": call.id,
                        "error": {
                            "code": -32602,
                            "message": "non-array args"
                        }
                    })
                }

                if (call.params.length > 1) {
                    return ({
                        "jsonrpc": this.jsonrpc,
                        "id": call.id,
                        "error": {
                            "code": -32602,
                            "message": "too many arguments, want at most 1"
                        }
                    })
                }

                const param = call.params[0]

                const logs = await this.storage.getLogs({
                    fromBlock: Number(param.fromBlock),
                    toBlock: Number(param.toBlock),
                    address: param.address,
                    topics: param.topics
                })

                cachedResponse.push({
                    "jsonrpc": this.jsonrpc,
                    "id": call.id,
                    "result": logs
                })
            } else {
                cachedResponse.push({
                    pendingCall: true,
                    id: call.id
                })
                remoteCalls.push(call)
            }
        }

        if (remoteCalls.length === 0) {
            return callIsArray ? cachedResponse : cachedResponse[0]
        }

        const resBody = await this.request(remoteCalls)

        const resBodyArray = resBody instanceof Array ? resBody : [resBody]

        const concilatedResponse =
            cachedResponse.map(c => (c as PendingRpcObject).pendingCall ? resBodyArray.shift() : c)

        return callIsArray ? concilatedResponse : concilatedResponse[0]
    }

    async syncContractLogs(logs: Log[]) {
        return await this.storage.putLogs(logs)
    }
}