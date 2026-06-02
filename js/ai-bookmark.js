const bookmarks =
JSON.parse(
    localStorage.getItem("aiBookmarks")
) || [];

const container =
document.querySelector(".ai-bookmarks-container");

if(bookmarks.length === 0){

    container.innerHTML = `
        <h2 class="no-news">
            No AI Bookmarks Yet 🤖
        </h2>
    `;

}
else{

    bookmarks.forEach((item,index)=>{

        container.innerHTML += `
            
            <div class="news-card">

                <div class="news-content">

                    <h3>
                        ${item.text}
                    </h3>

                    <p>
                        Saved at: ${item.time}
                    </p>

                    <button
                        class="remove-btn"
                        data-index="${index}"
                    >
                        Remove
                    </button>

                </div>

            </div>

        `;

    });

}

const removeButtons =
document.querySelectorAll(".remove-btn");

removeButtons.forEach((button)=>{

    button.addEventListener("click",()=>{

        const index =
        button.dataset.index;

        bookmarks.splice(index,1);

        localStorage.setItem(
            "aiBookmarks",
            JSON.stringify(bookmarks)
        );

        location.reload();

    });

});