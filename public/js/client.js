const socket = io()

const $sendBtn = document.querySelector('#send-loc')
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#input')
const $messageFormBtn = document.querySelector('#button')
const $messages = document.querySelector('#messages')

const $messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//

const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(msg)=>{
    console.log(msg)
    const html = Mustache.render($messageTemplate,{
        username :  msg.username,
        msg : msg.text,
        createdAt : moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})



socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage', (msg) => {
    console.log(msg)
    const html = Mustache.render(locationMessageTemplate, {
        username : msg.username,
        url : msg.url,
        createdAt : moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{


    $messageFormBtn.setAttribute('disabled','disabled')

    e.preventDefault()
    const message = e.target.elements.message.value
    socket.emit('receive',message,(error)=>{

        $messageFormBtn.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message Delivered')
    })
})





$sendBtn.addEventListener('click',()=>{
    if(!navigator.geolocation){
        console.log('Your browser does not support location')
    }

    $sendBtn.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((location)=>{
        const longitude = location.coords.longitude
        const latitude = location.coords.latitude
        socket.emit('sendLocation',{longitude,latitude},
            
        ()=>{
            $sendBtn.removeAttribute('disabled')
            console.log('Location shared succesfuly!')
        })
    })
})



socket.emit('join',{username, room },(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})


