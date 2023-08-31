import { Hono } from 'hono'
import { Bindings } from './types/Bindings'
import RpcController from './RpcController'
import StorageController from './StorageController'
import { errorHandler } from './middlewares'

const app = new Hono<{ Bindings: Bindings }>()
app.onError(errorHandler)

app.post('/', async (c) => {
    const reqBody = await c.req.json()

    // TODO: Check if RPC is valid, otherwise reject

    const storage = new StorageController(c.env.DB)

    const rpc = new RpcController({
        networkId: Number(c.env.NETWORK_ID),
        rpcUrl: c.env.RPC_URL,
        storage
    })

    const response = await rpc.conciliate(reqBody)

    return c.json(response)
})

app.post('/contracts', async (c) => {
    const storage = new StorageController(c.env.DB)

    const data = await c.req.json()

    if (!data.address) {
        return c.json({ error: 'Missing contract address' })
    }

    if (!data.initialBlock) {
        return c.json({ error: 'Missing initial block' })
    }

    const response = await storage.putContract(data.address, data.initialBlock)

    return c.json(response)
})

export default app
