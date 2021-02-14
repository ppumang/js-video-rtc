alert(navigator)
const roomId = location.pathname.split('/')[1];
const socket = io('/');
const myPeer = new Peer(undefined, {
    host:'/',
    port: '3001'
});
socket.on('user-disconnected', userId => {
    console.log('disconnected', userId)
    if (peers[userId]) {peers[userId].close()};
})
myPeer.on('open', id => {
    socket.emit('join-room', roomId, id);
})
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted=true;
const peers = {};

navigator.mediaDevices.getUserMedia({
    video: {facingMode: "user"},
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);
    
    myPeer.on('call', (call) => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', peerVideoStream => {
            addVideoStream(video, peerVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        setTimeout(() => {
            connectToNewUser(userId, stream)
        }, 1000)
    })
});


function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    peers[userId] = call;
    const peerVideo = document.createElement('video');
    call.on('stream', peerVideoStream => {
        addVideoStream(peerVideo, peerVideoStream)
    });
    call.on('close', () => {
        console.log('call closed');
        peerVideo.remove();
    })
}