const userName =
localStorage.getItem("loggedInUser");

const userData =
JSON.parse(localStorage.getItem("evUser"));

const bookmarks =
JSON.parse(localStorage.getItem("bookmarks")) || [];

const profileContainer =
document.querySelector(".profile-card");

profileContainer.innerHTML = `

    <h2>
        ${userName || "Guest User"}
    </h2>

    <p>
        ${userData?.email || "No Email"}
    </p>

    <p>
        Saved Bookmarks:
        ${bookmarks.length}
    </p>

`;