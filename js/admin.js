const addNewsBtn =
document.querySelector("#add-news-btn");

const newsContainer =
document.querySelector(".admin-news-container");

let adminNews =
JSON.parse(
    localStorage.getItem("adminNews")
) || [];

renderNews();

addNewsBtn.addEventListener("click",()=>{

    const title =
    document.querySelector("#title").value;

    const category =
    document.querySelector("#category").value;

    const image =
    document.querySelector("#image").value;

    const description =
    document.querySelector("#description").value;

    if(
        !title ||
        !category ||
        !image ||
        !description
    ){
        alert("Please fill all fields");
        return;
    }

    const news = {

        id: Date.now(),

        title,
        category,
        image,
        description,

        status:"pending"
    };

    adminNews.push(news);

    localStorage.setItem(
        "adminNews",
        JSON.stringify(adminNews)
    );

    renderNews();

    document.querySelector("#title").value = "";
    document.querySelector("#category").value = "";
    document.querySelector("#image").value = "";
    document.querySelector("#description").value = "";

});

function renderNews(){

    newsContainer.innerHTML = "";

    adminNews.forEach((news)=>{

        newsContainer.innerHTML += `

            <div class="news-card">

                <img
                    src="${news.image}"
                    alt="News"
                >

                <div class="news-content">

                    <h3>
                        ${news.title}
                    </h3>

                    <p>
                        ${news.category}
                    </p>

                    <p class="status-tag">
                        ${news.status}
                    </p>

                    ${
                        news.status === "pending"
                        ?
                        `
                        <button
                            class="approve-btn"
                            data-id="${news.id}"
                        >
                            Approve
                        </button>
                        `
                        :
                        ""
                    }

                    <button
                        class="remove-btn"
                        data-id="${news.id}"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `;

    });

}

document.addEventListener("click",(e)=>{

    if(
        e.target.classList.contains(
            "approve-btn"
        )
    ){

        const id =
        Number(
            e.target.dataset.id
        );

        const news =
        adminNews.find(
            item => item.id === id
        );

        if(news){

            news.status =
            "approved";

            localStorage.setItem(
                "adminNews",
                JSON.stringify(adminNews)
            );

            renderNews();

        }

    }

    if(
        e.target.classList.contains(
            "remove-btn"
        )
    ){

        const id =
        Number(
            e.target.dataset.id
        );

        adminNews =
        adminNews.filter(
            (news)=> news.id !== id
        );

        localStorage.setItem(
            "adminNews",
            JSON.stringify(adminNews)
        );

        renderNews();

    }

});