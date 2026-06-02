const bookmarks =
JSON.parse(localStorage.getItem("bookmarks")) || [];

const container =
document.querySelector(".bookmarks-container");

const alreadyExists = bookmarks.some(
    (item) => item.url === news.url
);

if(alreadyExists){
    alert("Already Bookmarked!");
    return;
}

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
                    

                </div>

            </div>

        `;
    });

}