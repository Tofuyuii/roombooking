// ===== Firebase Firestore Import =====
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const db = window.db;

let currentUser = null;
let selectedRoom = null;

/* ---------- ROOM STATUS ---------- */
let rooms = JSON.parse(localStorage.getItem("rooms")) || {
  "สุพรรณิกา": "free",
  "ปาริชาต": "free",
  "พุทธรักษา": "free",
  "ศูนย์ภาษา": "free",
  "ลีลาวดี": "free",
  "คลินิกเสมารักษ์": "disabled"
};

let bookings = [];

/* ---------- LOAD BOOKINGS FROM FIREBASE ---------- */
async function loadBookings() {
  bookings = [];

  const querySnapshot = await getDocs(collection(db, "bookings"));

  querySnapshot.forEach((docSnap) => {
    bookings.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderRooms();
}

/* ---------- LOGIN SYSTEM ---------- */
function login() {
  let email = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if (email === "" || password === "") {
    alert("กรอก email และ password ก่อน");
    return;
  }

  if (email === "user@sriracha.ac.th" && password === "1234") {
    currentUser = email;
    alert("Login สำเร็จ (ผู้ใช้ทั่วไป)");

    document.getElementById("adminLink").style.display = "none";
    localStorage.setItem("currentUser", currentUser);

    renderRooms();
    return;
  }

  if (email === "admin@sriracha.ac.th" && password === "123") {
    currentUser = email;
    alert("Login สำเร็จ (แอดมิน)");

    document.getElementById("adminLink").style.display = "inline";
    localStorage.setItem("currentUser", currentUser);

    renderRooms();
    return;
  }

  alert("Email หรือ Password ไม่ถูกต้อง");
}

function logout() {
  currentUser = null;
  alert("Logout แล้ว");

  document.getElementById("adminLink").style.display = "none";
  localStorage.removeItem("currentUser");

  renderRooms();
}

/* ---------- HIGHLIGHT BUILDING ---------- */
function highlightRoom(room) {
  document.querySelectorAll(".building").forEach(b => {
    b.classList.remove("selected");
  });

  let el = document.getElementById("room" + room);
  if (el) el.classList.add("selected");
}

/* ---------- OPEN POPUP ---------- */
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

/* ---------- LIVE SUMMARY ---------- */
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

/* ---------- CONFIRM BOOKING ---------- */
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

  await addDoc(collection(db, "bookings"), {
    room: selectedRoom,
    user: currentUser,
    date: date,
    teacher: teacher,
    status: "pending"
  });

  alert("ส่งคำขอจองแล้ว!");

  closePopup();
  loadBookings();
}

/* ---------- RENDER ROOM COLORS ---------- */
function renderRooms() {
  Object.keys(rooms).forEach(room => {
    let el = document.getElementById("room" + room);
    if (!el) return;

    el.style.background = "green";

    bookings.forEach(b => {
      if (b.room === room) {
        if (b.status === "pending") el.style.background = "gold";
        if (b.status === "approved") el.style.background = "red";
      }

      if (b.room === room && b.user === currentUser) {
        el.style.background = "dodgerblue";
      }
    });

    el.onclick = () => bookRoom(room);
  });
}

/* ---------- RESET ---------- */
async function resetAll() {

  if (!confirm("แน่ใจนะว่าจะลบข้อมูลการจองทั้งหมด?")) return;

  // 🔥 ลบ bookings ใน Firestore
  const querySnapshot = await getDocs(collection(db, "bookings"));

  for (const d of querySnapshot.docs) {
    await deleteDoc(doc(db, "bookings", d.id));
  }

  // ✅ รีเซ็ต rooms กลับเป็น free
  rooms = {
    "สุพรรณิกา": "free",
    "ปาริชาต": "free",
    "พุทธรักษา": "free",
    "ศูนย์ภาษา": "free",
    "ลีลาวดี": "free",
    "คลินิกเสมารักษ์": "disabled"
  };

  // เซฟ rooms ใหม่ลง localStorage
  localStorage.setItem("rooms", JSON.stringify(rooms));

  alert("รีเซ็ตข้อมูลทั้งหมดแล้ว!");

  // โหลด bookings ใหม่ (จะว่าง)
  loadBookings();
}



/* ---------- START ---------- */
loadBookings();

// ===== FIX: Export functions to HTML onclick =====
window.login = login;
window.logout = logout;
window.bookRoom = bookRoom;
window.confirmBooking = confirmBooking;
window.closePopup = closePopup;
window.resetAll = resetAll;
