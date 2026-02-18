import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = window.db;
let bookings = [];

async function renderPending() {
  let list = document.getElementById("pendingList");
  list.innerHTML = "";

  bookings = [];

  const querySnapshot = await getDocs(collection(db, "bookings"));

  querySnapshot.forEach((docSnap) => {
    bookings.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  let pendingBookings = bookings.filter(b => b.status === "pending");

  if (pendingBookings.length === 0) {
    list.innerHTML = `<p class="empty-text">ไม่มีรายการที่รออนุมัติ 🎉</p>`;
    return;
  }

  pendingBookings.forEach((b) => {
    let div = document.createElement("div");
    div.className = "admin-card";

    div.innerHTML = `
      <h2>🏫 ห้อง: ${b.room}</h2>
      <p>📅 วันที่: <b>${b.date}</b></p>
      <p>👨‍🏫 อาจารย์: <b>${b.teacher}</b></p>
      <p>🙍 ผู้จอง: <b>${b.user}</b></p>

      <button class="approve-btn" onclick="approve('${b.id}')">
        ✅ อนุมัติ
      </button>
    `;

    list.appendChild(div);
  });
}

async function approve(id) {
  await updateDoc(doc(db, "bookings", id), {
    status: "approved"
  });

  alert("อนุมัติแล้ว!");
  renderPending();
}

window.onload = renderPending;
// ===== FIX: make approve callable from HTML =====
window.approve = approve;
