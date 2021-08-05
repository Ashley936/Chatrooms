const socket = io()

// Elements
const $msgform = document.querySelector('#msg-form')
const $msgformInput = document.querySelector('input')
const $msgformBtn = document.querySelector('#submit-btn')
const locationBtn = document.querySelector('#location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//templates
const msgTemplates = document.querySelector('#message-template').innerHTML
const locationTemp = document.querySelector('#location-template').innerHTML
const sidebarTemp = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt( newMessageStyles.marginBottom )
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.clientHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have we scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
   
}


socket.on('message', ({ message,createdAt,username }) => {
    const html = Mustache.render(msgTemplates,{ message,time:moment(createdAt).format('h:mm a'),username })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationmsg', ({url,createdAt, username}) => {
    const html = Mustache.render(locationTemp,{url, time: moment(createdAt).format('h:mm a'),username})
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemp, { room, users })
    
    $sidebar.innerHTML = html;
})
$msgform.addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.chatInput.value

    $msgformBtn.setAttribute('disabled','disabled')

    socket.emit("sendMessage", message, (callbackArg) => {
        $msgformBtn.removeAttribute('disabled')
        $msgformInput.value = ""
        $msgformInput.focus()

        if (callbackArg) {
            console.log("Error: ", callbackArg)
        }
    } )
})


locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    if (!navigator.onLine) {
        alert('no internet connection')
        return;
    }
    locationBtn.setAttribute('disabled', 'disabled')
    
    setTimeout(() => {
        if (locationBtn.disabled)
        locationBtn.removeAttribute('disabled')
    }, 3000)
   
    navigator.geolocation.getCurrentPosition((position) => {
        
        
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (message) => {
            console.log(message)
            locationBtn.removeAttribute('disabled')
        })
        
    })
})

socket.emit('join', { username, room }, (message) => {
    alert(message)
    location.href = '/'
})