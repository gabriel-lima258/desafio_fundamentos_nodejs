export async function json(req, res) {
    // creating an array buffer for request body
    const buffers = []

    for await (const chunk of req) {
        buffers.push(chunk)
    }

    try {
        req.body = JSON.parse(Buffer.concat(buffers).toString())
    } catch {
        req.body = null
    }

    // response of header to a json
    res.setHeader('Content-Type', 'application/json')
}