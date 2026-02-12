let rooms = JSON.parse(localStorage.getItem("rooms")) || {};
let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

function renderPending() {
  let list = document.getElementById("pendingList");
  list.innerHTML = "";

  let pendingBookings = bookings.filter(b => b.status === "pending");

  if (pendingBookings.length === 0) {
    list.innerHTML = `<p class="empty-text">ไม่มีรายการที่รออนุมัติ 🎉</p>`;
    return;
  }

  pendingBookings.forEach((b, index) => {
    let div = document.createElement("div");

    div.className = "admin-card";

    div.innerHTML = `
      <h2>🏫 ห้อง: ${b.room}</h2>
      <p>📅 วันที่: <b>${b.date}</b></p>
      <p>👨‍🏫 อาจารย์: <b>${b.teacher}</b></p>
      <p>🙍 ผู้จอง: <b>${b.user}</b></p>

      <button class="approve-btn" onclick="approve(${index})">
        ✅ อนุมัติ
      </button>
    `;

    list.appendChild(div);
  });
}

function approve(index) {
  bookings[index].status = "approved";
  rooms[bookings[index].room] = "booked";

  localStorage.setItem("rooms", JSON.stringify(rooms));
  localStorage.setItem("bookings", JSON.stringify(bookings));

  alert("อนุมัติแล้ว!");
  renderPending();
}

window.onload = renderPending;
