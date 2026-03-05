import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", async () => {

  const displayName = document.getElementById("displayName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!displayName || !email || !password) {
    alert("すべて入力してください");
    return;
  }

  try {
    // ① Auth作成
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ② Firestore users作成（絶対やる）
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: displayName,
      email: email,
      isGuest: false,
      theme: "calm", // 初期テーマ
      createdAt: serverTimestamp()
    });

    // ③ chatへ
    window.location.href = "chat.html";

  } catch (error) {
    alert("登録エラー: " + error.message);
  }

});