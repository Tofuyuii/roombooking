// ===============================
// ✅ Firebase ใช้จาก index.html เท่านั้น
// (ห้าม initialize ซ้ำ)
// ===============================

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ ใช้ db ที่ประกาศไว้ใน index.html
const db = window.db;

// ===============================
// ===== GLOBAL =====
// ===============================
let currentUser = localStorage.getItem("currentUser");
let selectedRoom = null;
let bookings = [];

// ===============================
// ===== DOM =====
// ===============================
const roomElements = document.querySelectorAll(".building");

// ===============================
// ===== LOAD BOOKINGS FROM FIREBASE =====
// ===============================
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

// ===============================
// ===== RENDER ROOM COLORS =====
// ===============================
function renderRooms() {
  roomElements.forEach((el) => {
    let roomName = el.innerText.trim();

    // ค่าเริ่มต้น = ห้องว่าง
    el.style.background = "green";

    bookings.forEach((b) => {
      // รออนุมัติ
      if (b.room === roomName && b.status === "pending") {
        el.style.background = "yellow";
      }

      // ถูกอนุมัติแล้ว
      if (b.room === roomName && b.status === "approved") {
        el.style.background = "red";
      }

      // คุณจองเอง (pending)
      if (
        b.room === roomName &&
        b.user === currentUser &&
        b.status === "pending"
      ) {
        el.style.background = "dodgerblue";
      }
    });
  });
}

// ===============================
// ===== LOGIN =====
// ===============================
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
    localStorage.setItem("currentUser", currentUser);
    document.getElementById("adminLink").style.display = "none";
    loadBookings();
    return;
  }

  if (email === "admin@sriracha.ac.th" && password === "123") {
    currentUser = email;
    alert("Login สำเร็จ (แอดมิน)");
    localStorage.setItem("currentUser", currentUser);
    document.getElementById("adminLink").style.display = "inline";
    loadBookings();
    return;
  }

  alert("Email หรือ Password ไม่ถูกต้อง");
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  alert("Logout แล้ว");
  document.getElementById("adminLink").style.display = "none";
  loadBookings();
}

// ===============================
// ===== BOOK ROOM =====
// ===============================
function bookRoom(room) {
  if (!currentUser) {
    alert("ต้อง Login ก่อนถึงจะจองได้");
    return;
  }

  selectedRoom = room;

  document.getElementById("popupRoomName").innerText =
    "จองห้อง: " + room;

  document.getElementById("bookingPopup").style.display = "block";
}

function closePopup() {
  document.getElementById("bookingPopup").style.display = "none";
}

// ===============================
// ===== CONFIRM BOOKING =====
// ===============================
async function confirmBooking() {
  let date = document.getElementById("bookingDate").value;
  let teacher = document.getElementById("teacherName").value;

  if (!date || !teacher) {
    alert("กรอกข้อมูลให้ครบก่อน");
    return;
  }

  try {
    await addDoc(collection(db, "bookings"), {
      room: selectedRoom,
      user: currentUser,
      date: date,
      teacher: teacher,
      status: "pending"
    });

    alert("✅ ส่งคำขอจองแล้ว! รอแอดมินอนุมัติ");

    closePopup();
    loadBookings();
  } catch (err) {
    alert("❌ ส่งไม่สำเร็จ: " + err.message);
    console.log(err);
  }
}

// ===============================
// ===== RESET =====
// ===============================
async function resetAll() {
  if (!confirm("แน่ใจนะว่าจะลบข้อมูลการจองทั้งหมด?")) return;

  const snapshot = await getDocs(collection(db, "bookings"));

  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, "bookings", d.id));
  }

  alert("รีเซ็ตข้อมูลทั้งหมดแล้ว!");
  loadBookings();
}

// ===============================
// ===== START =====
// ===============================
loadBookings();

// ===============================
// ===== EXPORT FOR HTML =====
// ===============================
window.login = login;
window.logout = logout;
window.bookRoom = bookRoom;
window.confirmBooking = confirmBooking;
window.closePopup = closePopup;
window.resetAll = resetAll;
