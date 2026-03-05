// ===== Firebase共通読み込み =====
import { auth, db } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// ===== ログイン済みならchatへ =====
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "chat.html";
  }
});


// ===== Googleログイン =====
document.getElementById("googleLoginBtn")?.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await ensureUserDoc(result.user);
  } catch (error) {
    alert("Googleログイン失敗: " + error.message);
  }
});


// ===== メールログイン =====
document.getElementById("emailLoginBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("メールとパスワードを入力してください");
    return;
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDoc(result.user);
  } catch (error) {

    // 未登録なら自動作成（Morukoの優しさ）
    if (error.code === "auth/user-not-found") {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await ensureUserDoc(result.user);
      } catch (err) {
        alert("登録失敗: " + err.message);
      }
    } else {
      alert("ログイン失敗: " + error.message);
    }
  }
});


// ===== 匿名ログイン =====
document.getElementById("guestLoginBtn")?.addEventListener("click", async () => {
  try {
    const result = await signInAnonymously(auth);
    await ensureUserDoc(result.user, true);
  } catch (error) {
    alert("ゲストログイン失敗: " + error.message);
  }
});


// ===== Firestoreユーザー作成 =====
async function ensureUserDoc(user, isGuest = false) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || "Guest",
      email: user.email || null,
      isGuest: isGuest || user.isAnonymous,
      createdAt: serverTimestamp()
    });
  }
}