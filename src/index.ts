import { Hono } from 'hono'
import { Bindings } from './types/Bindings'
import RpcController from './RpcController'
import StorageController from './StorageController'
import { errorHandler } from './middlewares'
import { ContractStatus } from './types/Storage'

export class DurableRPC extends RpcController implements DurableObject {

    app = new Hono<{ Bindings: Bindings }>()
    storage: StorageController
    state: DurableObjectState

    constructor(state: DurableObjectState, env: Bindings) {

        const storage = new StorageController(env.DB)

        super({
            networkId: Number(env.NETWORK_ID),
            rpcUrl: env.RPC_URL,
            storage
        })

        this.state = state
        this.app.onError(errorHandler)
        this.storage = storage

        const init = async () => {
            const contracts = await this.storage.getAllContracts()
            return this.state.storage.put('contracts', contracts)
        }

        this.state.waitUntil(init())

        this.app.post('/', async (c) => {
            const reqBody = await c.req.json()

            // TODO: Check if RPC is valid, otherwise reject

            const result = await this.conciliate(reqBody)
            return c.json(result)
        })

        // TODO: require admin authentication
        this.app.post('/contracts', async (c) => {
            const data = await c.req.json()

            if (!data.address) {
                return c.json({ error: 'Missing contract address' })
            }

            if (isNaN(data.initialBlock)) {
                return c.json({ error: 'Missing initial block' })
            }

            const result = await this.storage.putContract(data.address, data.initialBlock)

            return c.json(result)
        })

        // TODO: require admin authentication
        this.app.get('/contracts', async (c) => {
            const result = await this.state.storage.get<ContractStatus[]>('contracts')
            return c.json(result)
        })

    }

    fetch(request: Request) {
        return this.app.fetch(request)
    }
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', async (c) => {

    const id = c.env.DURABLE_OBJECT.idFromName('eth-rpc-gateway-000')
    const obj = c.env.DURABLE_OBJECT.get(id)

    return await obj.fetch(c.req.url, {
        method: c.req.method,
        headers: c.req.headers,
        body: c.req.body,
        signal:  c.req.signal,
        integrity: c.req.integrity,
    })
})

export default {
    fetch: app.fetch
}