// ===== Firebase Setup (ต้องอยู่ในไฟล์นี้เลย) =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "AIzaSyAp0UX1vGtoKOvDhX07H7e14nMyJkDtrzM",
  authDomain: "src-roombooking.firebaseapp.com",
  projectId: "src-roombooking",
  storageBucket: "src-roombooking.firebasestorage.app",
  messagingSenderId: "977451751508",
  appId: "1:977451751508:web:23a0ba2ce6f41f6222b5c1",
  measurementId: "G-5PJ6D4HMGV"
};

// ✅ Firebase พร้อมแน่นอนทุกเครื่อง
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== GLOBAL =====
let currentUser = localStorage.getItem("currentUser");
let selectedRoom = null;
let bookings = [];

// ===== ROOM STATUS เดิมของเธอ =====
let rooms = {
  "สุพรรณิกา": "free",
  "ปาริชาต": "free",
  "พุทธรักษา": "free",
  "ศูนย์ภาษา": "free",
  "ลีลาวดี": "free",
  "คลินิกเสมารักษ์": "disabled"
};

// ===== DOM =====
const roomElements = document.querySelectorAll(".building");

// ===== LOAD BOOKINGS FROM FIREBASE =====
async function loadBookings() {
  bookings = [];

  const snapshot = await getDocs(collection(db, "bookings"));

  snapshot.forEach((docSnap) => {
    bookings.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderRooms();
}

// ===== HIGHLIGHT BUILDING =====
function highlightRoom(room) {
  document.querySelectorAll(".building").forEach(b => {
    b.classList.remove("selected");
  });

  let el = document.getElementById("room" + room);
  if (el) el.classList.add("selected");
}

// ===== OPEN POPUP =====
function bookRoom(room) {

  if (!currentUser) {
    alert("ต้อง Login ก่อนถึงจะจองได้");
    return;
  }

  if (rooms[room] === "disabled") {
    alert("ห้องนี้จองไม่ได้");
    return;
  }

  selectedRoom = room;
  highlightRoom(room);

  document.getElementById("popupRoomName").innerText =
    "จองห้อง: " + room;

  document.getElementById("bookingDate").value = "";
  document.getElementById("teacherName").value = "";
  document.getElementById("bookingSummary").innerHTML = "";

  document.getElementById("bookingPopup").style.display = "block";
}

function closePopup() {
  document.getElementById("bookingPopup").style.display = "none";
}

// ===== LIVE SUMMARY เดิม =====
document.addEventListener("input", () => {
  let date = document.getElementById("bookingDate").value;
  let teacher = document.getElementById("teacherName").value;

  if (date && teacher) {
    document.getElementById("bookingSummary").innerHTML =
      `📌 ห้อง: ${selectedRoom}<br>
       📅 วันที่: ${date}<br>
       👨‍🏫 อาจารย์: ${teacher}`;
  }
});

// ===== CONFIRM BOOKING =====
async function confirmBooking() {

  let date = document.getElementById("bookingDate").value;
  let teacher = document.getElementById("teacherName").value;

  if (!date) {
    alert("กรุณาเลือกวันที่ก่อน");
    return;
  }

  if (!teacher) {
    alert("กรุณากรอกชื่ออาจารย์ก่อน");
    return;
  }

  if (!confirm(
    `ยืนยันการจอง?\n\nห้อง: ${selectedRoom}\nวันที่: ${date}\nอาจารย์: ${teacher}`
  )) return;

  try {
    await addDoc(collection(db, "bookings"), {
      room: selectedRoom,
      user: currentUser,
      date,
      teacher,
      status: "pending"
    });

    alert("ส่งคำขอจองแล้ว! (รอดำเนินการ)");

    closePopup();
    loadBookings();

  } catch (err) {
    alert("ส่งไม่สำเร็จ: " + err.message);
    console.log(err);
  }
}

// ===== RENDER ROOM COLORS =====
function renderRooms() {

  Object.keys(rooms).forEach(room => {

    let el = document.getElementById("room" + room);
    if (!el) return;

    // disabled
    if (rooms[room] === "disabled") {
      el.style.background = "gray";
      return;
    }

    // default free
    el.style.background = "green";

    // check bookings in Firebase
    bookings.forEach((b) => {

      if (b.room === room && b.status === "pending") {
        el.style.background = "gold";
      }

      if (b.room === room && b.status === "approved") {
        el.style.background = "red";
      }

      // ✅ สีฟ้า = คุณจอง
      if (b.room === room && b.user === currentUser) {
        el.style.background = "dodgerblue";
      }

    });

    el.onclick = () => bookRoom(room);
  });
}

// ===== LOGIN SYSTEM =====
function login() {

  let email = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if (email === "" || password === "") {
    alert("กรอก email และ password ก่อน");
    return;
  }

  // USER LOGIN
  if (email === "user@sriracha.ac.th" && password === "1234") {
    currentUser = email;
    alert("Login สำเร็จ (ผู้ใช้ทั่วไป)");

    document.getElementById("adminLink").style.display = "none";
    localStorage.setItem("currentUser", currentUser);

    loadBookings();
    return;
  }

  // ADMIN LOGIN
  if (email === "admin@sriracha.ac.th" && password === "123") {
    currentUser = email;
    alert("Login สำเร็จ (แอดมิน)");

    document.getElementById("adminLink").style.display = "inline";
    localStorage.setItem("currentUser", currentUser);

    loadBookings();
    return;
  }

  alert("Email หรือ Password ไม่ถูกต้อง");
}

function logout() {
  currentUser = null;
  alert("Logout แล้ว");

  document.getElementById("adminLink").style.display = "none";
  localStorage.removeItem("currentUser");

  loadBookings();
}

// ===== RESET =====
async function resetAll() {

  if (!confirm("แน่ใจนะว่าจะลบข้อมูลการจองทั้งหมด?")) return;

  const snapshot = await getDocs(collection(db, "bookings"));

  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, "bookings", d.id));
  }

  alert("รีเซ็ตข้อมูลทั้งหมดแล้ว!");

  loadBookings();
}

// ===== START =====
loadBookings();

// ===== EXPORT FOR HTML =====
window.login = login;
window.logout = logout;
window.bookRoom = bookRoom;
window.confirmBooking = confirmBooking;
window.closePopup = closePopup;
window.resetAll = resetAll;
