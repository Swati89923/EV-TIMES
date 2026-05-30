const signupBtn = document.querySelector("#signup-btn");

if(signupBtn){

    signupBtn.addEventListener("click",()=>{

        const password =
        document.querySelector("#signup-password").value;

        const confirmPassword =
        document.querySelector("#confirm-password").value;

        if(password !== confirmPassword){

            alert("Passwords do not match!");

            return;
        }

        const name =
        document.querySelector("#signup-name").value;

        const email =
        document.querySelector("#signup-email").value;

        const userData = {

            name:name,

            email:email,

            password:password
        };

        localStorage.setItem(
            "evUser",
            JSON.stringify(userData)
        );

        localStorage.setItem(
            "loggedInUser",
            name
        );

        alert("Account Created Successfully!");

    });

}

const loginBtn = document.querySelector("#login-btn");

if(loginBtn){

    loginBtn.addEventListener("click",()=>{

        const email =
        document.querySelector("#login-email").value;

        const password =
        document.querySelector("#login-password").value;

        const savedUser =
        JSON.parse(localStorage.getItem("evUser"));

        if(!savedUser){

            alert("No account found!");

            return;
        }

        if(
            email === savedUser.email &&
            password === savedUser.password
        ){

            localStorage.setItem(
                "loggedInUser",
                savedUser.name
            );

            alert("Login Successful!");

            window.location.href = "../index.html";

        }
        else{

            alert("Invalid Email or Password!");
        }

    });

}