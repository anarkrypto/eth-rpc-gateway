export interface Log {
    "address": string,
    "topics": string[],
    "data": string,
    "blockNumber": string,
    "transactionHash": string,
    "transactionIndex": string,
    "blockHash": string,
    "logIndex": string,
    "removed": boolean
}

export interface GetLogParams {
    fromBlock?: number,
    toBlock?: number,
    address: string,
    topics?: string[]
    blockhash?: string
}

export interface ContractStatus {
    address: string,
    initialBlock: number,
}

export declare class Storage {
    // Get filter logs
    getLogs(params: GetLogParams): Promise<Log[]>
    
    // Insert or update filter logs
    putLogs(logs: Log[]): Promise<any>

    // Get contract status
    getContract(address: string): Promise<ContractStatus>

    // Put contract with 
    putContract(address: string, initialBlock: number): Promise<any>
}