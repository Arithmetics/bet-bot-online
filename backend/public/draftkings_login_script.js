console.log("logging in");

function enterLoginInfo() {
  const email = document.querySelector("#login-username-input");
  email.value = "brock.m.tillotson@gmail.com";
}

function enterBadLoginInfo() {
  const email = document.querySelector("#login-username-input");
  email.value = "poop@gmail.com";
}

function clickLogin() {
  document.querySelector("#login-submit").click();
}

setTimeout(() => {
  // console.log("click once");
  enterBadLoginInfo();
  enterLoginInfo();
  clickLogin();
  enterLoginInfo();
  clickLogin();
}, 2000);

// setTimeout(() => {
//   console.log("click twice");
//   enterLoginInfo();
//   document.querySelector("h1").click();
//   clickLogin();
// }, 8000);

// setTimeout(() => {
//   enterLoginInfo();
//   clickLogin();
// }, 11000);
