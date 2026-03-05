import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    location.href = "chat.html";
  } catch (error) {
    alert("ログイン失敗：" + error.message);
  }
});

// すでにログイン済みならchatへ
onAuthStateChanged(auth, user => {
  if (user) {
    location.href = "chat.html";
  }
});