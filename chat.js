import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const roomId = "global";
const messagesDiv = document.getElementById("messages");
const toastContainer = document.getElementById("toastContainer");
let isInitialLoad = true;
function showToast(name, text) {
  const toast = document.createElement("div");
  toast.classList.add("toast");

  toast.innerHTML = `
    <strong>${name}</strong><br>
    <span>${text}</span>
  `;

  toastContainer.appendChild(toast);

  // 👇 1フレーム遅らせて show を付ける
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  toast.addEventListener("click", () => {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    hideToast(toast);
  });

  setTimeout(() => {
    hideToast(toast);
  }, 4000);
}

function hideToast(toast) {
  if (toast.classList.contains("hide")) return;

  toast.classList.remove("show");
  toast.classList.add("hide");

  setTimeout(() => {
    toast.remove();
  }, 300);
}
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const logoutBtn = document.getElementById("logoutBtn");

const nameModal = document.getElementById("nameModal");
const saveNameBtn = document.getElementById("saveNameBtn");
const nameInput = document.getElementById("nameInput");

const themeSelector = document.getElementById("themeSelector");

let currentUserData = null;

// =====================
// 認証チェック（ここに全部まとめる）
// =====================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  let snap = await getDoc(userRef);

  // usersドキュメントがない場合は作成
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: "Guest",
      theme: "calm",
      createdAt: serverTimestamp()
    });
    snap = await getDoc(userRef);
  }

  currentUserData = snap.data();

  // テーマ適用
  const theme = currentUserData.theme || "calm";
  document.body.setAttribute("data-theme", theme);
  if (themeSelector) themeSelector.value = theme;

  // 名前未設定ならモーダル表示
  if (!currentUserData.displayName || currentUserData.displayName === "Guest") {
    nameModal.classList.remove("hidden");
  }

  loadMessages();
});

// =====================
// メッセージ送信
// =====================
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "rooms", roomId, "messages"), {
    text: text,
    uid: auth.currentUser.uid,
    displayName: currentUserData.displayName,
    avatar: currentUserData.avatar || null,
    createdAt: serverTimestamp()
  });

  messageInput.value = "";
}

// =====================
// メッセージ読み込み
// =====================
function loadMessages() {

  const q = query(
    collection(db, "rooms", roomId, "messages"),
    orderBy("createdAt")
  );

  onSnapshot(q, (snapshot) => {

    snapshot.docChanges().forEach((change) => {

      const data = change.doc.data();

      // =====================
      // 新規メッセージ
      // =====================
      if (change.type === "added") {

        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message", "new-message");
              
        if (data.uid === auth.currentUser.uid) {
          msgDiv.classList.add("my-message");
        }
        
        msgDiv.innerHTML = `
          <img class="message-avatar"
               src="${data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.uid}`}" />
        
          <div class="message-content">
              <div class="message-name">${data.displayName}</div>
              <div class="message-text">${data.text}</div>
          </div>
        `;
        
        messagesDiv.appendChild(msgDiv);

        // 🔔 通知
        if (!isInitialLoad && data.uid !== auth.currentUser.uid) {

          const isAtBottom =
            messagesDiv.scrollHeight - messagesDiv.scrollTop <=
            messagesDiv.clientHeight + 50;

          if (!isAtBottom) {
            showToast(data.displayName, data.text);
          }

        }

      }

    });

    // 自動スクロール
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    isInitialLoad = false;

  });

}

// =====================
// ログアウト
// =====================
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// =====================
// 名前保存
// =====================
saveNameBtn.addEventListener("click", async () => {
  const newName = nameInput.value.trim();

  if (newName.length < 2) {
    alert("名前は2文字以上にしてください");
    return;
  }
  
  if (!newName) {
    alert("名前を入力してください");
    return;
  }

  const userRef = doc(db, "users", auth.currentUser.uid);

  await setDoc(userRef, {
    displayName: newName
  }, { merge: true });

  currentUserData.displayName = newName;
  nameModal.classList.add("hidden");
});
// =====================
// テーマ変更
// =====================
// 初期適用
const savedTheme = localStorage.getItem("morukoTheme") || "calm";
document.body.setAttribute("data-theme", savedTheme);

if (themeSelector) {
  themeSelector.value = savedTheme;

  themeSelector.addEventListener("change", () => {
    const selectedTheme = themeSelector.value;

    // フェードアウト
    document.body.classList.add("theme-fade");

    setTimeout(() => {
      // テーマ変更
      document.body.setAttribute("data-theme", selectedTheme);
      localStorage.setItem("morukoTheme", selectedTheme);

      // フェードイン
      document.body.classList.remove("theme-fade");
    }, 250);
  });
}

// =====================
// タイピング
// =====================
const typingIndicator = document.getElementById("typingIndicator");
let typingTimeout;

messageInput.addEventListener("input", async () => {

  const typingRef = doc(db, "rooms", roomId, "typing", auth.currentUser.uid);

  await setDoc(typingRef, {
    name: currentUserData.displayName,
    typing: true
  });

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(async () => {

    await setDoc(typingRef, {
      name: currentUserData.displayName,
      typing: false
    });

  }, 2000);

});

const typingCollection = collection(db, "rooms", roomId, "typing");

onSnapshot(typingCollection, (snapshot) => {

  let typingUsers = [];

  snapshot.forEach((docSnap) => {

    const data = docSnap.data();

    if (data.typing && docSnap.id !== auth.currentUser.uid) {
      typingUsers.push(data.name);
    }

  });

  if (typingUsers.length > 0) {
    typingIndicator.textContent = typingUsers.join(", ") + " が入力中...";
  } else {
    typingIndicator.textContent = "";
  }

});


// =====================
// アバター
// =====================
function createAvatar(displayName, uid) {

  const letter = displayName.charAt(0).toUpperCase();

  const colors = [
    "#6BA8FF",
    "#FF8AAE",
    "#7ED7A6",
    "#FFB86B",
    "#C79CFF",
    "#8FD3FF"
  ];

  let hash = 0;

  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }

  const color = colors[Math.abs(hash) % colors.length];

  return `
    <div class="avatar-letter" style="background:${color}">
      ${letter}
    </div>
  `;
}