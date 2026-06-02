const bookmarks =
JSON.parse(localStorage.getItem("bookmarks")) || [];

const container =
document.querySelector(".bookmarks-container");

if(bookmarks.length === 0){

    container.innerHTML = `
        <h2 class="no-news">
            No Bookmarks Yet 😔
        </h2>
    `;
}

else{

    bookmarks.forEach((news)=>{

        container.innerHTML += `
            
            <div class="news-card">

                <img
                    src="${news.image}"
                    alt="Bookmark"
                >

                <div class="news-content">

                    <h3>
                        ${news.title}
                    </h3>

                    <button
                        class="read-more-btn"
                        onclick="window.open('${news.url}','_blank')"
                    >
                        Read More
                    </button>
                    
                    <button
                      class="remove-btn"
                           data-url="${news.url}"
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

        const url =
        button.dataset.url;

        const updatedBookmarks =
        bookmarks.filter(
            (item)=> item.url !== url
        );

        localStorage.setItem(
            "bookmarks",
            JSON.stringify(updatedBookmarks)
        );

        location.reload();

    });

});