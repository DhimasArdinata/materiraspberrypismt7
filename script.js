/**
 * =============================================================================
 *                      PANDUAN MODUL PEMBELAJARAN INTERAKTIF
 * =============================================================================
 * Deskripsi:
 * Script ini mengelola semua fungsionalitas untuk halaman panduan modul.
 * Ditulis menggunakan pendekatan Object-Oriented Programming (OOP) dengan sebuah
 * class bernama `ModuleGuide` untuk menjaga kode tetap terorganisir, modular,
 * dan mudah dikelola.
 *
 * Fitur:
 * - Sistem Accordion: Membuka dan menutup modul, memastikan hanya satu yang
 *   terbuka pada satu waktu.
 * - Pelacakan Progres: Menghitung modul yang selesai dan memperbarui progress bar.
 * - Penyimpanan Lokal: Mengingat modul mana yang sudah selesai bahkan setelah
 *   halaman ditutup dan dibuka kembali, menggunakan localStorage.
 * - Kontrol UI: Mengelola tombol "Kembali ke Atas" dan pesan penutup.
 * - Perbaikan Scroll: Secara otomatis menggulir modul yang dibuka ke tampilan
 *   untuk pengalaman pengguna yang lebih baik.
 * =============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  /**
   * Class ModuleGuide mengelola semua interaktivitas untuk panduan modul.
   */
  class ModuleGuide {
    /**
     * @param {string} containerSelector - Selector CSS untuk elemen yang berisi semua kartu modul.
     */
    constructor(containerSelector) {
      this.container = document.querySelector(containerSelector);
      // Hentikan eksekusi jika elemen utama tidak ditemukan
      if (!this.container) {
        console.error(
          `Error: Container utama dengan selector "${containerSelector}" tidak ditemukan.`
        );
        return;
      }

      // Pemilihan elemen-elemen DOM yang akan dimanipulasi
      this.moduleCards = this.container.querySelectorAll(".module-card");
      this.progressBar = document.getElementById("progressBar");
      this.closingStatement = document.querySelector(".closing-statement");
      this.backToTopBtn = document.getElementById("backToTopBtn");

      // Inisialisasi properti state (data)
      this.totalModules = this.moduleCards.length;
      this.completedModules = new Set();
    }

    /**
     * Memuat status modul yang telah selesai dari localStorage.
     */
    loadState() {
      const savedState =
        JSON.parse(localStorage.getItem("completedModules")) || [];
      this.completedModules = new Set(savedState);

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
     * Memperbarui UI progress bar dan menampilkan/menyembunyikan pesan penutup.
     */
    updateProgress() {
      const progressPercentage =
        (this.completedModules.size / this.totalModules) * 100;
      this.progressBar.style.width = `${progressPercentage}%`;
      this.progressBar.textContent = `${Math.round(
        progressPercentage
      )}% Selesai`;

      // Tampilkan pesan penutup jika semua modul selesai
      this.closingStatement.classList.toggle(
        "visible",
        this.completedModules.size === this.totalModules
      );
    }

    /**
     * Menangani logika buka/tutup accordion.
     * Hanya satu modul yang bisa terbuka pada satu waktu.
     * @param {HTMLElement} card - Elemen kartu modul yang diklik.
     */
    toggleAccordion(card) {
      const wasActive = card.classList.contains("active");

      // Selalu tutup semua modul terlebih dahulu
      this.moduleCards.forEach((otherCard) => {
        otherCard.classList.remove("active");
      });

      // Jika modul yang diklik sebelumnya tertutup, buka modul tersebut.
      if (!wasActive) {
        card.classList.add("active");

        // === PERBAIKAN SCROLL ===
        // Beri jeda sejenak agar transisi CSS untuk membuka modul dimulai.
        // Ini membuat animasi scroll terasa lebih mulus dan terkoordinasi.
        setTimeout(() => {
          card.scrollIntoView({
            behavior: "smooth", // Animasi scroll halus
            block: "start", // Posisikan bagian atas kartu di atas viewport
          });
        }, 250); // Jeda 250 milidetik
      }
    }

    /**
     * Menandai atau menghapus tanda selesai pada sebuah modul.
     * @param {Event} e - Objek event dari klik.
     * @param {HTMLElement} card - Elemen kartu modul terkait.
     */
    toggleCompletion(e, card) {
      e.stopPropagation(); // Mencegah event klik menyebar ke header dan memicu accordion

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
     * Mengatur visibilitas tombol "kembali ke atas" berdasarkan posisi scroll.
     */
    handleScroll() {
      if (this.backToTopBtn) {
        this.backToTopBtn.classList.toggle("visible", window.scrollY > 300);
      }
    }

    /**
     * Menggulir halaman kembali ke atas dengan animasi halus.
     */
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /**
     * Mengikat semua event listener yang diperlukan ke elemen DOM.
     */
    initEventListeners() {
      this.moduleCards.forEach((card) => {
        const header = card.querySelector(".module-header");
        const completeBtn = card.querySelector(".complete-btn");

        header.addEventListener("click", (e) => {
          // Abaikan klik jika berasal dari tombol complete agar accordion tidak terpicu
          if (e.target.closest(".complete-btn")) {
            return;
          }
          this.toggleAccordion(card);
        });

        completeBtn.addEventListener("click", (e) =>
          this.toggleCompletion(e, card)
        );
      });

      window.addEventListener("scroll", () => this.handleScroll());

      if (this.backToTopBtn) {
        this.backToTopBtn.addEventListener("click", () => this.scrollToTop());
      }
    }

    /**
     * Metode utama untuk memulai dan menjalankan semua fungsionalitas.
     */
    init() {
      if (!this.container) return; // Pemeriksaan keamanan
      this.loadState();
      this.updateProgress();
      this.initEventListeners();
    }
  }

  // Buat instance dari class ModuleGuide dan jalankan.
  const guide = new ModuleGuide(".accordion-container");
  guide.init();
});
