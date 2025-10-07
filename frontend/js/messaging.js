// messaging.js

// Append a message to chat
function appendMessage(content, sender, isHTML=false) {
  const messagesContainer = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");
  if (isHTML) {
    bubble.innerHTML = content;
  } else {
    bubble.textContent = content;
  }

  messageDiv.appendChild(bubble);
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send text
function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (text === "") return;

  appendMessage(text, window.userType || "customer"); // default = customer
  input.value = "";
}

// Emoji picker toggle
function toggleEmojiPicker() {
  const picker = document.getElementById("emojiPicker");
  picker.style.display = picker.style.display === "none" ? "flex" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const emojiPicker = document.getElementById("emojiPicker");
  if (emojiPicker) {
    emojiPicker.addEventListener("click", function(e) {
      if (e.target.textContent) {
        const input = document.getElementById("messageInput");
        input.value += e.target.textContent;
      }
    });
  }
});

// File attachments
function sendFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type.startsWith("image/")) {
    appendMessage(`<img src="${URL.createObjectURL(file)}" style="max-width:150px;border-radius:8px;">`, window.userType, true);
  } else {
    appendMessage("📎 " + file.name, window.userType);
  }
}

// Voice recording
let mediaRecorder;
let audioChunks = [];

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      appendMessage(`<audio controls src="${audioUrl}"></audio>`, window.userType, true);
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 5000); // auto-stop after 5s
  } catch (err) {
    alert("Microphone access denied!");
  }
}
