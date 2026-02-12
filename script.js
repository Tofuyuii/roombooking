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

let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

/* ---------- LOGIN SYSTEM ---------- */
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

    renderRooms();
    return;
  }

  // ADMIN LOGIN
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

  if (rooms[room] === "booked") {
    alert("ห้องนี้ถูกจองแล้ว");
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
function confirmBooking() {
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

  if (!confirm(`ยืนยันการจอง?\n\nห้อง: ${selectedRoom}\nวันที่: ${date}\nอาจารย์: ${teacher}`)) {
    return;
  }

  bookings.push({
    room: selectedRoom,
    user: currentUser,
    date: date,
    teacher: teacher,
    status: "pending"
  });

  rooms[selectedRoom] = "pending";

  alert("ส่งคำขอจองแล้ว! (รอดำเนินการ)");

  closePopup();
  saveData();
  renderRooms();
}

/* ---------- RENDER ROOM COLORS ---------- */
function renderRooms() {
  Object.keys(rooms).forEach(room => {
    let el = document.getElementById("room" + room);
    if (!el) return;

    let status = rooms[room];

    if (status === "free") el.style.background = "green";
    if (status === "pending") el.style.background = "gold";
    if (status === "booked") el.style.background = "red";
    if (status === "disabled") el.style.background = "gray";

    bookings.forEach(b => {
      if (b.room === room && b.user === currentUser) {
        el.style.background = "dodgerblue";
      }
    });

    el.onclick = () => bookRoom(room);
  });

  saveData();
}

/* ---------- SAVE ---------- */
function saveData() {
  localStorage.setItem("rooms", JSON.stringify(rooms));
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

/* ---------- RESET ---------- */
function resetAll() {
  localStorage.clear();
  alert("รีเซ็ตข้อมูลแล้ว");
  location.reload();
}

/* ---------- START ---------- */
renderRooms();
