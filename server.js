import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port: 8083
})

wss.on('connection', (ws) => {
    // console.log("client connected")

    ws.on("message", (e) => {
        const obj = JSON.parse(e)
        console.log(obj)
        if (obj.event == "USER_LOGIN") {
            wss.clients.forEach(client => {
                let connectedUsers = []
                wss.clients.forEach(client => (connectedUsers.push(ws.user)))
                console.log(connectedUsers)
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify({
                        event: "USER_LOGIN",
                        data: {
                            name: obj.data.name,
                            users: connectedUsers
                        }
                    }))
                }
            })
            ws.user = obj.data.name
        }
        if (obj.event == "USER_MESSAGE") {
                wss.clients.forEach(client => {
                    if (client.readyState == client.OPEN) {
                        client.send(JSON.stringify({
                            event: "USER_MESSAGE",
                            data: {
                                name: obj.data.name,
                                message: obj.data.message
                            }
                        }))
                    }
                })
        }
        if (obj.event == "PRIVATE_MESSAGE") {
            wss.clients.forEach(client => {
                if (client.readyState == client.OPEN) {
                    client.send(JSON.stringify({
                        event: "PRIVATE_MESSAGE",
                        data: {
                            sender: obj.data.sender,
                            receiver: obj.data.receiver,
                            message: obj.data.message
                        }
                    }))
                }
            })
        }
    })

    ws.on('close', () => {
        // console.log(`${ws.user} disconnected`);

        wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                console.log(ws.user, "desconectou")
                client.send(JSON.stringify({
                    event: "USER_DISCONNECTED",
                    data: {
                        name: ws.user
                    }
                }));
            }
        });
    });
})

