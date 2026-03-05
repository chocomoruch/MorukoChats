import { auth, db } from "../firebase.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const avatarPreview = document.getElementById("avatarPreview");
const avatarUpload = document.getElementById("avatarUpload");

const displayNameInput = document.getElementById("displayNameInput");
const saveBtn = document.getElementById("saveSettingsBtn");

const backBtn = document.getElementById("backBtn");

let currentUser;





// 戻るボタン
backBtn.onclick = () => {

  location.href = "chat.html";

};






// ユーザー読み込み
onAuthStateChanged(auth, async (user) => {

  if (!user) {

    location.href = "login.html";
    return;

  }

  currentUser = user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {

    const data = userSnap.data();

    displayNameInput.value = data.displayName || "";

    if (data.avatar) {

      avatarPreview.src = data.avatar;

    } else {

      avatarPreview.src =
        `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`;

    }

  }

});






// アバタープレビュー
avatarUpload.addEventListener("change", () => {

  const file = avatarUpload.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {

    avatarPreview.src = reader.result;

  };

  reader.readAsDataURL(file);

});






// 保存
saveBtn.onclick = async () => {

  const newName = displayNameInput.value.trim();

  if (!newName) {

    alert("名前を入力してください");
    return;

  }

  const userRef = doc(db, "users", currentUser.uid);

  await updateDoc(userRef, {

    displayName: newName,
    avatar: avatarPreview.src

  });

  alert("保存しました！");

};