import { GetLogParams, Log, Storage } from "./types/Storage";
import { hexlify } from "./utils";

export default class LogsStorageController implements Storage {

    private db: D1Database

    constructor(db: D1Database) {
        this.db = db
    }

    async getLogs(params: GetLogParams): Promise<Log[]> {

        const topicsConditions = params.topics.map(topic => `topics LIKE '%${topic}%'`);
        const topicsConditionString = topicsConditions.join(' AND ');

        const { results } = await this.db.prepare(
            `SELECT * FROM logs WHERE block_number >= ? AND block_number <= ? AND address = ? ${topicsConditions.length ? `AND ${topicsConditionString}` : ''}`
        ).bind(
            Number(params.fromBlock),
            Number(params.toBlock),
            params.address,
        ).all()

        return results.map((log) => ({
            address: log.address as string,
            blockHash: log.block_hash as string,
            transactionHash: log.transaction_hash as string,
            data: log.data as string,
            topics: (log.topics as string).split(','),
            blockNumber: hexlify(log.block_number as number),
            transactionIndex: hexlify(log.transaction_index as number),
            logIndex: hexlify(log.log_index as number),
            removed: log.removed ? true : false
        }))
    }

    async putLogs(logs: Log[]): Promise<any> {

        const statements = logs.map((log) => this.db.prepare(
            `INSERT OR REPLACE INTO logs (
                transaction_hash,
                address,
                topics,
                data,
                block_number,
                transaction_index,
                block_hash,
                log_index,
                removed
            ) VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
            )`
        ).bind(
            log.transactionHash,
            log.address,
            log.topics.join(','),
            log.data,
            Number(log.blockNumber),
            Number(log.transactionIndex),
            log.blockHash,
            Number(log.logIndex),
            log.removed ? 1 : 0
        ))

        return await this.db.batch(statements);
    }

    async putContract(address: string, initialBlock: number): Promise<any> {
        const { results } = await this.db.prepare(
            `INSERT OR REPLACE INTO contracts (
                address,
                initial_block
            ) VALUES (
                ?,
                ?
            )`
        ).bind(
            address,
            initialBlock
        ).run()

        return results
    }

    async getContract(address: string): Promise<any> {
        const { results } = await this.db.prepare(
            `SELECT * FROM contracts WHERE address = ?`
        ).bind(
            address
        ).run()

        return results
    }
}