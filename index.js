var client = new WebSocket("ws://localhost:8083")
const messages = document.querySelector(".messages")

let user = ""
const users = []

client.onopen = (e) => {
    console.log("connection opened")
    localStorage.getItem("messages") && messages.insertAdjacentHTML("beforeend", localStorage.getItem("messages"))
}

document.querySelector(".btn").addEventListener('click', () => {
    document.querySelector(".login").style.display = "none"
    document.querySelector(".login").style.width = "0"
    document.querySelector(".login").style.height = "0"
    document.querySelector(".chatWrapper").style.display = "flex"

    client.send(JSON.stringify({
        event: "USER_LOGIN",
        data: {
            name: document.querySelector(".name").value
        }
    }))
    user = document.querySelector(".name").value
    users.push(user)
    populateConnectedClients(users)
})

document.querySelector(".send").addEventListener('click', () => {
    const message = document.querySelector(".message").value
    document.querySelector(".message").value = ""
    if (message.includes("/private ")) {
        let splittedMessage = message.split(" ")
        const receiver = splittedMessage[1].toLowerCase()
        splittedMessage.shift()
        splittedMessage.shift()
        const sendMessage = splittedMessage.toString().replace(",", " ")
        client.send(JSON.stringify({
            event: "PRIVATE_MESSAGE",
            data: {
                sender: user,
                receiver: receiver,
                message: sendMessage
            }
        }))
    } else {
        client.send(JSON.stringify({
            event: "USER_MESSAGE",
            data: {
                name: user,
                message: message
            }
        }))
    }
})

client.onmessage = (c) => {
    var json = JSON.parse(c.data)
    if (json.event == "USER_LOGIN") {
        const message = `<p>${json.data.name} se conectou!</p>`
        messages.insertAdjacentHTML("beforeend", message)
        populateConnectedClients(json.data.users)
        localStorage.setItem("messages", localStorage.getItem("messages") + message)
    }

    if (json.event == "USER_MESSAGE") {
        const message = `<p>${json.data.name}: ${json.data.message}</p>`
        messages.insertAdjacentHTML('beforeend', message)
        
        localStorage.setItem("messages", localStorage.getItem("messages") + message)
    }

    if (json.event == "PRIVATE_MESSAGE") {
        console.log(json.event)
        if (json.data.receiver.toLowerCase() == user.toLowerCase()) {
            const message = `<p><span style="color: blue; font-weight: bold">Mensagem privada de ${json.data.sender}</span>: ${json.data.message}</p>`
            messages.insertAdjacentHTML('beforeend', message)
        }
        // localStorage.setItem("messages", localStorage.getItem("messages") + message) //TODO: fazer com que mensagens privadas não aparecam para todo mundo
    }

    if (json.event == "USER_DISCONNECTED") {
        users.splice(users.indexOf(json.data.name), 1)
        populateConnectedClients(users)
    }
} 

const populateConnectedClients = (clients) => {
    console.log(clients)
    clients.forEach(client => {
        document.querySelector(".online-users").textContent = ""
        document.querySelector(".online-users").insertAdjacentHTML("beforeend", `<li>${client}</li>`)
    })
}