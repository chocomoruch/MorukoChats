import { auth, db, rtdb } from "./firebase.js";

import {
 ref,
 set,
 remove,
 onValue,
 onDisconnect
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const logoutBtn = document.getElementById("logoutBtn");

const nameModal = document.getElementById("nameModal");
const saveNameBtn = document.getElementById("saveNameBtn");
const nameInput = document.getElementById("nameInput");

const themeSelector = document.getElementById("themeSelector");

let currentUserData = null;
let isInitialLoad = true;

const typingIndicator = document.getElementById("typingIndicator");


// =====================
// 認証チェック
// =====================

onAuthStateChanged(auth, async (user) => {
const myTypingRef = ref(rtdb,"typing/"+roomId+"/"+auth.currentUser.uid);
onDisconnect(myTypingRef).remove();
 if (!user) {
  window.location.href = "login.html";
  return;
 }

 const userRef = doc(db, "users", user.uid);
 let snap = await getDoc(userRef);

 if (!snap.exists()) {

  await setDoc(userRef,{
   uid:user.uid,
   displayName:"Guest",
   theme:"calm",
   createdAt:serverTimestamp()
  });

  snap = await getDoc(userRef);

 }

 currentUserData = snap.data();

 const theme = currentUserData.theme || "calm";
 document.body.setAttribute("data-theme", theme);

 if (themeSelector) themeSelector.value = theme;

 if (!currentUserData.displayName || currentUserData.displayName === "Guest") {
  nameModal.classList.remove("hidden");
 }

 loadMessages();
 setupTyping();

});


// =====================
// メッセージ送信
// =====================

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress",(e)=>{
 if(e.key==="Enter") sendMessage();
});

async function sendMessage(){

 const text = messageInput.value.trim();
 if(!text) return;

 await addDoc(collection(db,"rooms",roomId,"messages"),{

  text:text,
  uid:auth.currentUser.uid,
  displayName:currentUserData.displayName,
  avatar:currentUserData.avatar || null,
  createdAt:serverTimestamp()

 });

 messageInput.value="";

}

// =====================
// Typing送信
// =====================

const typingRef = ref(rtdb, "typing/" + roomId + "/" + auth.currentUser?.uid);

let typingTimeout;

messageInput.addEventListener("input", () => {

 if(!auth.currentUser) return;

 const userTypingRef = ref(rtdb,"typing/"+roomId+"/"+auth.currentUser.uid);

 set(userTypingRef,{
  uid:auth.currentUser.uid,
  name:currentUserData.displayName
 });

 clearTimeout(typingTimeout);

 typingTimeout=setTimeout(()=>{
  remove(userTypingRef);
 },5000);

});

// =====================
// メッセージ読み込み
// =====================

function loadMessages(){

 const q = query(
  collection(db,"rooms",roomId,"messages"),
  orderBy("createdAt")
 );

 onSnapshot(q,(snapshot)=>{

  snapshot.docChanges().forEach((change)=>{

   const data = change.doc.data();

   if(change.type==="added"){

    const msgDiv=document.createElement("div");
    msgDiv.classList.add("message","new-message");

    if(data.uid===auth.currentUser.uid){
     msgDiv.classList.add("my-message");
    }

    msgDiv.innerHTML=`
      ${createAvatar(data.displayName,data.uid)}

      <div class="message-content">
       <div class="message-name">${data.displayName}</div>
       <div class="message-text">${data.text}</div>
      </div>
    `;

    messagesDiv.appendChild(msgDiv);

   }

  });

  messagesDiv.scrollTop=messagesDiv.scrollHeight;

  isInitialLoad=false;

 });

}

// =====================
// ログアウト
// =====================

logoutBtn.addEventListener("click",async()=>{

 await signOut(auth);
 window.location.href="index.html";

});


// =====================
// 名前保存
// =====================

saveNameBtn.addEventListener("click",async()=>{

 const newName=nameInput.value.trim();

 if(newName.length<2){
  alert("名前は2文字以上にしてください");
  return;
 }

 const userRef=doc(db,"users",auth.currentUser.uid);

 await setDoc(userRef,{
  displayName:newName
 },{merge:true});

 currentUserData.displayName=newName;
 nameModal.classList.add("hidden");

});


// =====================
// アバター生成
// =====================

function createAvatar(displayName,uid){

 const letter=displayName.charAt(0).toUpperCase();

 const colors=[
  "#6BA8FF",
  "#FF8AAE",
  "#7ED7A6",
  "#FFB86B",
  "#C79CFF",
  "#8FD3FF"
 ];

 let hash=0;

 for(let i=0;i<uid.length;i++){
  hash=uid.charCodeAt(i)+((hash<<5)-hash);
 }

 const color=colors[Math.abs(hash)%colors.length];

 return `
  <div class="avatar-letter" style="background:${color}">
   ${letter}
  </div>
 `;

}

// =====================
// Typing表示
// =====================

function setupTyping(){

 const typingRoomRef = ref(rtdb,"typing/"+roomId);

 onValue(typingRoomRef,(snapshot)=>{

  const data = snapshot.val();

  const avatarsDiv = document.getElementById("typingAvatars");

  if(!data){

   typingIndicator.classList.add("hidden");
   avatarsDiv.innerHTML="";
   return;

  }

  const users = Object.values(data)
   .filter(user=>user.uid!==auth.currentUser.uid);

  if(users.length===0){

   typingIndicator.classList.add("hidden");
   avatarsDiv.innerHTML="";
   return;

  }

  typingIndicator.classList.remove("hidden");
  avatarsDiv.innerHTML="";

  users.slice(0,3).forEach(user=>{

   const avatar=document.createElement("div");
   avatar.className="avatar";

   avatar.innerHTML=createAvatar(user.name,user.uid);

   avatarsDiv.appendChild(avatar);

  });

  if(users.length>3){

   const more=document.createElement("div");
   more.className="avatar-more";
   more.textContent="+"+(users.length-3);

   avatarsDiv.appendChild(more);

  }

  messagesDiv.appendChild(typingIndicator);
  messagesDiv.scrollTop=messagesDiv.scrollHeight;

 });

}