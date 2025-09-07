/**
 * Class ModuleGuide mengelola semua interaktivitas untuk panduan modul pembelajaran.
 * Ini mencakup penanganan accordion, pelacakan progres, penyimpanan ke localStorage,
 * dan kontrol UI seperti tombol kembali ke atas.
 */
class ModuleGuide {
  /**
   * @param {string} containerSelector - Selector CSS untuk elemen yang berisi semua kartu modul.
   */
  constructor(containerSelector) {
    // Mengambil elemen-elemen DOM utama
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.error(
        `Container with selector "${containerSelector}" not found.`
      );
      return;
    }

    this.moduleCards = this.container.querySelectorAll(".module-card");
    this.progressBar = document.getElementById("progressBar");
    this.closingStatement = document.querySelector(".closing-statement");
    this.backToTopBtn = document.getElementById("backToTopBtn");

    // Inisialisasi properti state
    this.totalModules = this.moduleCards.length;
    this.completedModules = new Set();
  }

  /**
   * Memuat status modul yang selesai dari localStorage.
   */
  loadState() {
    const savedState =
      JSON.parse(localStorage.getItem("completedModules")) || [];
    this.completedModules = new Set(savedState);

    // Terapkan status 'completed' ke elemen kartu yang sesuai
    this.moduleCards.forEach((card) => {
      const moduleId = card.dataset.moduleId;
      if (this.completedModules.has(moduleId)) {
        card.classList.add("completed");
      }
    });
  }

  /**
   * Menyimpan status modul yang selesai saat ini ke localStorage.
   */
  saveState() {
    localStorage.setItem(
      "completedModules",
      JSON.stringify(Array.from(this.completedModules))
    );
  }

  /**
   * Memperbarui progress bar dan menampilkan/menyembunyikan pesan penutup.
   */
  updateProgress() {
    const progressPercentage =
      (this.completedModules.size / this.totalModules) * 100;
    this.progressBar.style.width = `${progressPercentage}%`;
    this.progressBar.textContent = `${Math.round(progressPercentage)}% Selesai`;

    if (this.completedModules.size === this.totalModules) {
      this.closingStatement.classList.add("visible");
    } else {
      this.closingStatement.classList.remove("visible");
    }
  }

  /**
   * Menangani klik pada header modul untuk membuka/menutup accordion.
   * @param {HTMLElement} card - Elemen kartu modul yang diklik.
   */
  toggleAccordion(card) {
    const isActive = card.classList.contains("active");

    // Tutup semua kartu lain sebelum membuka yang baru
    if (!isActive) {
      this.moduleCards.forEach((otherCard) =>
        otherCard.classList.remove("active")
      );
    }

    card.classList.toggle("active");
  }

  /**
   * Menangani klik pada tombol 'complete'.
   * @param {Event} e - Objek event klik.
   * @param {HTMLElement} card - Elemen kartu modul terkait.
   */
  toggleCompletion(e, card) {
    e.stopPropagation(); // Mencegah event klik menyebar ke header

    const moduleId = card.dataset.moduleId;
    card.classList.toggle("completed");

    if (card.classList.contains("completed")) {
      this.completedModules.add(moduleId);
    } else {
      this.completedModules.delete(moduleId);
    }

    this.saveState();
    this.updateProgress();
  }

  /**
   * Mengatur visibilitas tombol "back to top" berdasarkan posisi scroll.
   */
  handleScroll() {
    if (window.scrollY > 300) {
      this.backToTopBtn.classList.add("visible");
    } else {
      this.backToTopBtn.classList.remove("visible");
    }
  }

  /**
   * Menggulir halaman kembali ke atas.
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Menginisialisasi semua event listener yang diperlukan.
   */
  initEventListeners() {
    this.moduleCards.forEach((card) => {
      const header = card.querySelector(".module-header");
      const completeBtn = card.querySelector(".complete-btn");

      header.addEventListener("click", () => this.toggleAccordion(card));
      completeBtn.addEventListener("click", (e) =>
        this.toggleCompletion(e, card)
      );
    });

    window.addEventListener("scroll", () => this.handleScroll());
    this.backToTopBtn.addEventListener("click", () => this.scrollToTop());
  }

  /**
   * Metode utama untuk memulai aplikasi.
   */
  init() {
    if (!this.container) return; // Hentikan jika container tidak ada
    this.loadState();
    this.updateProgress();
    this.initEventListeners();
  }
}

// Tunggu hingga seluruh konten halaman dimuat, lalu inisialisasi panduan.
document.addEventListener("DOMContentLoaded", () => {
  const guide = new ModuleGuide(".accordion-container");
  guide.init();
});
