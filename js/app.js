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

const newsContainer = document.querySelector(".news-container");

newsData.forEach((news,index)=>{
    
    newsContainer.innerHTML += `

        <div class="news-card ${index > 1 ? 'hidden-card' : ''}">

            <img src="${news.image}" alt="EV News">

          <div class="news-content">

    <h3>${news.title}</h3>

    <p class="news-category">
        ${news.category}
    </p>

    <span class="news-date">
        ${news.date}
    </span>

    <button class="read-more-btn">
        Read More
    </button>

</div>

        </div>

    `;
});

const searchInput = document.querySelector(".search-input");

searchInput.addEventListener("keyup", ()=>{

    const searchText = searchInput.value.toLowerCase();

    const newsCards = document.querySelectorAll(".news-card");

    newsCards.forEach((card)=>{

        const title = card.querySelector("h3").innerText.toLowerCase();

        if(title.includes(searchText)){

            card.style.display = "block";
        }

        else{

            card.style.display = "none";
        }

    });

});

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

const loadMoreBtn = document.querySelector(".load-more-btn");

loadMoreBtn.addEventListener("click", ()=>{

    const hiddenCards = document.querySelectorAll(".hidden-card");

    hiddenCards.forEach((card)=>{

        card.style.display = "block";
    });

    loadMoreBtn.style.display = "none";

});