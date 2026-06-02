console.log("AI JS Loaded");

const chatBox =
document.querySelector(".chat-box");

const sendBtn =
document.querySelector("#send-btn");

const savedChats =
JSON.parse(
    localStorage.getItem("aiChats")
) || [];

/* Load old chats */

savedChats.forEach((chat)=>{

    chatBox.innerHTML += `
        <div class="${chat.type}">
            ${chat.message}
        </div>
    `;

});

function getAIResponse(question){

    question =
    question.toLowerCase();

    if(question.includes("battery")){

        return "EV batteries store electrical energy and power the vehicle. Most modern EVs use Lithium-ion batteries.";

    }

    else if(question.includes("charging")){

        return "Fast charging can charge most EVs from 20% to 80% in around 20–40 minutes.";

    }

    else if(question.includes("range")){

        return "EV range depends on battery size, driving style, speed and weather conditions.";

    }

    else if(question.includes("tesla")){

        return "Tesla is one of the leading EV manufacturers known for long-range electric vehicles and Superchargers.";

    }

    else if(question.includes("india")){

        return "India is rapidly expanding EV adoption through government incentives and charging infrastructure.";

    }

    else if(question.includes("future")){

        return "The future of EVs includes better batteries, faster charging and smarter vehicles.";

    }

    return "AI Insight: EV technology is evolving rapidly with improvements in batteries, charging infrastructure and smart mobility solutions.";

}

sendBtn.addEventListener("click",()=>{

    const input =
    document.querySelector("#user-input");

    const message =
    input.value.trim();

    if(message === ""){
        return;
    }

    /* User Message */

   chatBox.innerHTML += `
    <div class="user-message">
        ${message}
        <div class="message-time">
            ${getCurrentTime()}
        </div>
    </div>
`;
    savedChats.push({
        type:"user-message",
        message:message
    });

    localStorage.setItem(
        "aiChats",
        JSON.stringify(savedChats)
    );

    const typingDiv = document.createElement("div");
typingDiv.className = "ai-message";
typingDiv.innerHTML = "Typing...";
chatBox.appendChild(typingDiv);

chatBox.scrollTop = chatBox.scrollHeight;

setTimeout(()=>{

    const aiReply =
    getAIResponse(message);

   typingDiv.innerHTML = `
    ${aiReply}

    <div class="message-time">
        ${getCurrentTime()}
    </div>

    <button class="bookmark-btn">
        ⭐ Save
    </button>
`;
   const bookmarkBtn =
typingDiv.querySelector(".bookmark-btn");

bookmarkBtn.addEventListener("click",()=>{

    const bookmarks =
    JSON.parse(
        localStorage.getItem("evBookmarks")
    ) || [];

    bookmarks.push({
        text: aiReply,
        time: getCurrentTime()
    });

    localStorage.setItem(
        "aiBookmarks",
        JSON.stringify(bookmarks)
    );

    bookmarkBtn.innerText =
    "✅ Saved";

});
    savedChats.push({
        type:"ai-message",
        message:aiReply
    });

    localStorage.setItem(
        "aiChats",
        JSON.stringify(savedChats)
    );

    chatBox.scrollTop =
    chatBox.scrollHeight;

},1000);

    input.value = "";

});
function getCurrentTime(){

    return new Date().toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
    });

}

document
.querySelector("#user-input")
.addEventListener("keypress",(e)=>{

    if(e.key === "Enter"){

        sendBtn.click();

    }

});

document
.querySelector(".clear-btn")
.addEventListener("click",()=>{

    localStorage.removeItem("aiChats");

    chatBox.innerHTML = "";

});

const quickBtns =
document.querySelectorAll(".quick-btn");

quickBtns.forEach((btn)=>{

    btn.addEventListener("click",()=>{

        document.querySelector("#user-input").value =
        btn.innerText;

        sendBtn.click();

    });

});