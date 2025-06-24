// Data mobil
const cars = [
  {
    id: 1,
    name: "Toyota Avanza",
    price: 500000,
    image: "../Asset/CRV.jpg",
  },
  {
    id: 2,
    name: "Toyota Kijang Innova",
    price: 700000,
    image: "../Asset/Kijang.jpg",
  },
  {
    id: 3,
    name: "Honda HRV",
    price: 600000,
    image: "../Asset/HRV.jpg",
  },
  {
    id: 4,
    name: "Daihatsu Sigra",
    price: 450000,
    image: "../Asset/Sigra.avif",
  },
]

// State aplikasi
let selectedCars = []
let orders = JSON.parse(localStorage.getItem("carRentalOrders")) || []

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format date
function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
  return new Date(dateString).toLocaleDateString("id-ID", options)
}

// Render daftar mobil
function renderCars() {
  const carGrid = document.getElementById("carGrid")
  carGrid.innerHTML = ""

  cars.forEach((car) => {
    const carCard = document.createElement("div")
    carCard.className = "car-card"
    carCard.innerHTML = `
            <img src="${car.image}" alt="${car.name}" class="car-image">
            <div class="car-info">
                <h3>${car.name}</h3>
                <div class="car-price">${formatCurrency(car.price)} / hari</div>
                <div class="checkbox-container">
                    <input type="checkbox" id="car-${car.id}" onchange="toggleCarSelection(${car.id})">
                    <label for="car-${car.id}">Pilih mobil ini</label>
                </div>
                <div class="car-selection-area" id="selection-${car.id}">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="startDate-${car.id}">Tanggal Mulai Sewa:</label>
                            <input type="date" id="startDate-${car.id}" min="${new Date().toISOString().split("T")[0]}">
                        </div>
                        <div class="form-group">
                            <label for="duration-${car.id}">Durasi Sewa (hari):</label>
                            <input type="number" id="duration-${car.id}" min="1" value="1">
                        </div>
                    </div>
                </div>
            </div>
        `
    carGrid.appendChild(carCard)
  })
}

// Toggle pemilihan mobil
function toggleCarSelection(carId) {
  const checkbox = document.getElementById(`car-${carId}`)
  const selectionArea = document.getElementById(`selection-${carId}`)
  const carCard = checkbox.closest(".car-card")

  if (checkbox.checked) {
    selectionArea.classList.add("show")
    carCard.classList.add("selected")
    if (!selectedCars.includes(carId)) {
      selectedCars.push(carId)
    }
  } else {
    selectionArea.classList.remove("show")
    carCard.classList.remove("selected")
    selectedCars = selectedCars.filter((id) => id !== carId)
  }

  // Reset summary jika ada perubahan
  document.getElementById("orderSummary").style.display = "none"
}

// Hitung total harga
function calculateTotal() {
  const customerName = document.getElementById("customerName").value.trim()

  if (!customerName) {
    alert("Mohon masukkan nama pelanggan!")
    return
  }

  if (selectedCars.length === 0) {
    alert("Mohon pilih minimal satu mobil!")
    return
  }

  let totalPrice = 0
  let summaryHTML = ""
  let isValid = true

  selectedCars.forEach((carId) => {
    const car = cars.find((c) => c.id === carId)
    const startDate = document.getElementById(`startDate-${carId}`).value
    const duration = Number.parseInt(document.getElementById(`duration-${carId}`).value)

    if (!startDate || !duration || duration < 1) {
      alert(`Mohon lengkapi data sewa untuk ${car.name}!`)
      isValid = false
      return
    }

    const subtotal = car.price * duration
    totalPrice += subtotal

    summaryHTML += `
            <div class="summary-item">
                <div class="summary-item-info">
                    <h4>${car.name}</h4>
                    <p>Tanggal: ${new Date(startDate).toLocaleDateString("id-ID")} | Durasi: ${duration} hari</p>
                    <p>${formatCurrency(car.price)} × ${duration} hari</p>
                </div>
                <div class="summary-item-price">${formatCurrency(subtotal)}</div>
            </div>
        `
  })

  if (!isValid) return

  document.getElementById("summaryContent").innerHTML = summaryHTML
  document.getElementById("grandTotal").textContent = formatCurrency(totalPrice)
  document.getElementById("orderSummary").style.display = "block"

  // Scroll ke ringkasan
  document.getElementById("orderSummary").scrollIntoView({ behavior: "smooth" })
}

// Simpan pemesanan
function saveOrder() {
  const customerName = document.getElementById("customerName").value.trim()

  if (!customerName) {
    alert("Mohon masukkan nama pelanggan!")
    return
  }

  if (selectedCars.length === 0) {
    alert("Mohon pilih minimal satu mobil!")
    return
  }

  const orderCars = []
  let totalPrice = 0

  selectedCars.forEach((carId) => {
    const car = cars.find((c) => c.id === carId)
    const startDate = document.getElementById(`startDate-${carId}`).value
    const duration = Number.parseInt(document.getElementById(`duration-${carId}`).value)

    if (!startDate || !duration || duration < 1) {
      alert(`Mohon lengkapi data sewa untuk ${car.name}!`)
      return
    }

    const subtotal = car.price * duration

    orderCars.push({
      name: car.name,
      price: car.price,
      startDate: startDate,
      duration: duration,
      subtotal: subtotal,
    })

    totalPrice += subtotal
  })

  const order = {
    id: Date.now(),
    customerName: customerName,
    cars: orderCars,
    totalPrice: totalPrice,
    timestamp: new Date().toISOString(),
  }

  // Simpan ke localStorage
  orders.unshift(order)
  localStorage.setItem("carRentalOrders", JSON.stringify(orders))

  // Debug: cek apakah data tersimpan
  console.log("Data tersimpan ke localStorage:", orders)
  console.log("localStorage content:", localStorage.getItem("carRentalOrders"))

  alert("Pemesanan berhasil disimpan!")

  // Reset form
  resetForm()
  renderOrderHistory()
}

// Reset form
function resetForm() {
  document.getElementById("customerName").value = ""
  selectedCars = []

  // Reset semua checkbox dan input
  cars.forEach((car) => {
    const checkbox = document.getElementById(`car-${car.id}`)
    const selectionArea = document.getElementById(`selection-${car.id}`)
    const carCard = checkbox.closest(".car-card")

    checkbox.checked = false
    selectionArea.classList.remove("show")
    carCard.classList.remove("selected")

    document.getElementById(`startDate-${car.id}`).value = ""
    document.getElementById(`duration-${car.id}`).value = "1"
  })

  document.getElementById("orderSummary").style.display = "none"
}

// Render riwayat pemesanan
function renderOrderHistory() {
  const orderHistory = document.getElementById("orderHistory")

  if (orders.length === 0) {
    orderHistory.innerHTML = '<p class="no-orders">Belum ada pemesanan</p>'
    return
  }

  let historyHTML = ""
  orders.forEach((order) => {
    let carsHTML = ""
    order.cars.forEach((car) => {
      carsHTML += `
                <div class="order-car-item">
                    <span>${car.name} (${car.duration} hari)</span>
                    <span>${formatCurrency(car.subtotal)}</span>
                </div>
            `
    })

    historyHTML += `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Pemesanan #${order.id}</h4>
                        <div class="order-timestamp">${formatDate(order.timestamp)}</div>
                        <p><strong>Pelanggan:</strong> ${order.customerName}</p>
                    </div>
                    <button class="btn btn-danger" onclick="deleteOrder(${order.id})">Hapus</button>
                </div>
                <div class="order-cars">
                    ${carsHTML}
                </div>
                <div class="order-total">
                    Total: ${formatCurrency(order.totalPrice)}
                </div>
            </div>
        `
  })

  orderHistory.innerHTML = historyHTML
}

// Hapus pemesanan
function deleteOrder(orderId) {
  if (confirm("Apakah Anda yakin ingin menghapus pemesanan ini?")) {
    orders = orders.filter((order) => order.id !== orderId)

    // Update localStorage
    localStorage.setItem("carRentalOrders", JSON.stringify(orders))

    // Debug: cek apakah data terhapus
    console.log("Data setelah dihapus:", orders)
    console.log("localStorage setelah hapus:", localStorage.getItem("carRentalOrders"))

    renderOrderHistory()
    alert("Pemesanan berhasil dihapus!")
  }
}

// Fungsi untuk memuat data dari localStorage
function loadOrdersFromStorage() {
  try {
    const savedOrders = localStorage.getItem("carRentalOrders")
    if (savedOrders) {
      orders = JSON.parse(savedOrders)
      console.log("Data dimuat dari localStorage:", orders)
    } else {
      orders = []
      console.log("Tidak ada data di localStorage")
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error)
    orders = []
  }
}

// Fungsi untuk clear semua data localStorage (untuk testing)
function clearAllOrders() {
  if (confirm("Apakah Anda yakin ingin menghapus SEMUA pemesanan?")) {
    localStorage.removeItem("carRentalOrders")
    orders = []
    renderOrderHistory()
    alert("Semua pemesanan berhasil dihapus!")
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Muat data dari localStorage terlebih dahulu
  loadOrdersFromStorage()

  renderCars()
  renderOrderHistory()

  document.getElementById("calculateBtn").addEventListener("click", calculateTotal)
  document.getElementById("saveOrderBtn").addEventListener("click", saveOrder)
})
