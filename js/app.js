const API_KEY = "e4dcc7c5352f4e70a65b343d7bbeab5a";

const API_URL =
`https://newsapi.org/v2/everything?q=electric vehicle&language=en&pageSize=10&apiKey=${API_KEY}`;
let allArticles = [];
const newsData = [

    {
        title:"Tesla launches next-gen EV battery",
        category:"Technology",
        date:"May 2026",
         image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89",
         description:"Tesla introduces a powerful new EV battery with faster charging and improved efficiency."
    },

    {
        title:"India expands EV charging network",
        category:"Infrastructure",
        date:"May 2026",
         image:"https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop",
         description:"Tesla introduces a powerful new EV battery with faster charging and improved efficiency."
    },

    {
        title:"New AI system improves EV efficiency",
        category:"AI",
        date:"May 2026",
        image:"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
        description:"Tesla introduces a powerful new EV battery with faster charging and improved efficiency."
    }

];
async function fetchNews(){

    try{

        const response =
        await fetch(API_URL);

        const data =
        await response.json();

        allArticles = data.articles;

        displayNews(data.articles);

    }

  catch(error){

    console.log(error);

    const newsContainer =
    document.querySelector(".news-container");

    newsContainer.innerHTML = `
        <h2 class="no-news">
            Unable to load EV News 😔
        </h2>
    `;
}
}
function displayNews(articles){
    
    loader.style.display = "none";
    const newsContainer =
    document.querySelector(".news-container");

    newsContainer.innerHTML = "";
    if(articles.length === 0){

    newsContainer.innerHTML = `
        <h2 class="no-news">
            No News Found 😔
        </h2>
    `;

    return;
}

    articles.forEach((news)=>{

        const formattedDate =
        new Date(news.publishedAt)
        .toLocaleDateString();

        newsContainer.innerHTML += `

            <div class="news-card">

                <img
                   src="${news.urlToImage || 'https://via.placeholder.com/400x250'}"
                    alt="EV News"
                >

                <div class="news-content">

                    <h3>
                        ${news.title}
                    </h3>

                    <p class="news-category">
                        EV News
                    </p>

                    <span class="news-date">
                        ${formattedDate}
                    </span>

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
// const newsContainer = document.querySelector(".news-container");

// newsData.forEach((news,index)=>{
    
//     newsContainer.innerHTML += `

//         <div class="news-card ${index > 1 ? 'hidden-card' : ''}">

//             <img src="${news.image}" alt="EV News">

//           <div class="news-content">

//     <h3>${news.title}</h3>

//     <p class="news-category">
//         ${news.category}
//     </p>

//     <span class="news-date">
//         ${news.date}
//     </span>

//  <button 
//     class="read-more-btn"
//     data-title="${news.title}"
//     data-description="${news.description}"
//     data-image="${news.image}"
// >
//     Read More
// </button>

// </div>

//         </div>

//     `;
// });

const loader =
document.querySelector(".loader");

const searchInput =
document.querySelector(".search-input");

searchInput.addEventListener("keyup",()=>{

    const searchText =
    searchInput.value.toLowerCase();

    const filteredArticles =
    allArticles.filter((news)=>{

       return news.title &&
          news.title
          .toLowerCase()
          .includes(searchText);

    });

    displayNews(filteredArticles);

});
const refreshBtn =
document.querySelector(".refresh-btn");
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button)=>{

    button.addEventListener("click", ()=>{

        document
        .querySelector(".filter-btn.active")
        .classList.remove("active");

        button.classList.add("active");

        const category = button.innerText;

        const newsCards = document.querySelectorAll(".news-card");

        newsCards.forEach((card)=>{

            const cardCategory = card
            .querySelector(".news-category")
            .innerText;

            if(category === "All" || cardCategory === category){

                card.style.display = "block";
            }

            else{

                card.style.display = "none";
            }

        });

    });

});

// const loadMoreBtn = document.querySelector(".load-more-btn");

// loadMoreBtn.addEventListener("click", ()=>{

//     const hiddenCards = document.querySelectorAll(".hidden-card");

//     hiddenCards.forEach((card)=>{

//         card.style.display = "block";
//     });

//     loadMoreBtn.style.display = "none";

// });

// const modal = document.querySelector(".modal");

// const modalTitle = document.querySelector(".modal-title");

// const modalDescription = document.querySelector(".modal-description");

// const modalImage = document.querySelector(".modal-image");

// const closeModal = document.querySelector(".close-modal");

// document.addEventListener("click",(e)=>{

//     if(e.target.classList.contains("read-more-btn")){

//         modal.style.display = "flex";

//         modalTitle.innerText =
//         e.target.dataset.title;

//         modalDescription.innerText =
//         e.target.dataset.description;

//         modalImage.src =
//         e.target.dataset.image;
//     }
// });

// closeModal.addEventListener("click",()=>{

//     modal.style.display = "none";
// });

const accountBtn =
document.querySelector("#account-btn");

const loggedInUser =
localStorage.getItem("loggedInUser");

const welcomeUser =
document.querySelector(".welcome-user");

if(welcomeUser && loggedInUser){

    welcomeUser.innerText =
    `Welcome Back, ${loggedInUser} 👋`;

}

if(!loggedInUser){

    window.location.href =
    "./pages/login.html";

}
else{

    accountBtn.innerHTML = `
        <span class="user-icon">👤</span>
        ${loggedInUser} | Logout
    `;

    accountBtn.addEventListener("click",(e)=>{

        e.preventDefault();

        localStorage.removeItem("loggedInUser");

        window.location.reload();

    });

}
if(refreshBtn){

    refreshBtn.addEventListener("click",()=>{

        loader.style.display = "block";

        fetchNews();

    });

}

fetchNews();