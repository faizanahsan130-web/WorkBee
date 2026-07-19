// ======================================
// WorkBee - Video Meeting
// ======================================

const meetingIdInput = document.getElementById("meetingId");

const createMeetingBtn = document.getElementById("createMeeting");
const joinMeetingBtn = document.getElementById("joinMeeting");

const cameraBtn = document.getElementById("cameraBtn");
const micBtn = document.getElementById("micBtn");
const screenBtn = document.getElementById("screenBtn");
const copyBtn = document.getElementById("copyBtn");
const leaveBtn = document.getElementById("leaveBtn");

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const messageInput = document.getElementById("messageInput");
const sendMessage = document.getElementById("sendMessage");
const chatMessages = document.getElementById("chatMessages");

let localStream = null;
let screenStream = null;

let cameraEnabled = true;
let micEnabled = true;

// ======================================
// Camera + Microphone
// ======================================

async function startCamera() {

    try {

        localStream = await navigator.mediaDevices.getUserMedia({

            video: true,
            audio: true

        });

        localVideo.srcObject = localStream;

    }

    catch (error) {

        console.error(error);

        alert("Camera or microphone permission denied.");

    }

}

startCamera();

// ======================================
// Create Meeting
// ======================================

createMeetingBtn.addEventListener("click", () => {

    const meetingId =
        Math.random().toString(36).substring(2,10).toUpperCase();

    meetingIdInput.value = meetingId;

    alert("Meeting Created!");

});

// ======================================
// Join Meeting
// ======================================

joinMeetingBtn.addEventListener("click", () => {

    if(meetingIdInput.value===""){

        alert("Enter Meeting ID");

        return;

    }

    alert("Joined Meeting: " + meetingIdInput.value);

});

// ======================================
// Camera Toggle
// ======================================

cameraBtn.addEventListener("click",()=>{

    if(!localStream) return;

    cameraEnabled=!cameraEnabled;

    localStream
    .getVideoTracks()
    .forEach(track=>{

        track.enabled=cameraEnabled;

    });

    cameraBtn.innerHTML=
    cameraEnabled ?
    "📹 Camera ON":
    "🚫 Camera OFF";

});

// ======================================
// Microphone Toggle
// ======================================

micBtn.addEventListener("click",()=>{

    if(!localStream) return;

    micEnabled=!micEnabled;

    localStream
    .getAudioTracks()
    .forEach(track=>{

        track.enabled=micEnabled;

    });

    micBtn.innerHTML=
    micEnabled ?
    "🎤 Mic ON":
    "🔇 Mic OFF";

});

// ======================================
// Screen Share
// ======================================

screenBtn.addEventListener("click",async()=>{

    try{

        screenStream=
        await navigator.mediaDevices.getDisplayMedia({

            video:true

        });

        localVideo.srcObject=screenStream;

        screenStream
        .getVideoTracks()[0]
        .onended=()=>{

            localVideo.srcObject=localStream;

        };

    }

    catch(error){

        console.error(error);

    }

});

// ======================================
// Copy Meeting Link
// ======================================

copyBtn.addEventListener("click",()=>{

    if(meetingIdInput.value===""){

        alert("Create a meeting first.");

        return;

    }

    const url=

    window.location.origin+

    window.location.pathname+

    "?meeting="+

    meetingIdInput.value;

    navigator.clipboard.writeText(url);

    alert("Meeting Link Copied!");

});

// ======================================
// Leave Meeting
// ======================================

leaveBtn.addEventListener("click",()=>{

    if(localStream){

        localStream.getTracks().forEach(track=>{

            track.stop();

        });

    }

    localVideo.srcObject=null;

    remoteVideo.srcObject=null;

    meetingIdInput.value="";

    chatMessages.innerHTML="<p>No messages yet...</p>";

    alert("Meeting Ended.");

});

// ======================================
// Chat
// ======================================

sendMessage.addEventListener("click",sendChat);

messageInput.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        sendChat();

    }

});

function sendChat(){

    const text=messageInput.value.trim();

    if(text==="") return;

    const div=document.createElement("div");

    div.className="message";

    div.innerHTML="<strong>You:</strong> "+text;

    chatMessages.appendChild(div);

    chatMessages.scrollTop=chatMessages.scrollHeight;

    messageInput.value="";

}