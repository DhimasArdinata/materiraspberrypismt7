/**
 * =============================================================================
 *                      PANDUAN MODUL PEMBELAJARAN INTERAKTIF
 * =============================================================================
 * Deskripsi:
 * Script ini mengelola semua fungsionalitas untuk halaman panduan modul.
 * Ditulis menggunakan pendekatan Object-Oriented Programming (OOP) dengan sebuah
 * class bernama `ModuleGuide` untuk menjaga kode tetap terorganisir dan modular.
 *
 * Patch Terintegrasi v2.0:
 * - Mencegah "lompatan" atau auto-scroll saat membuka/menutup accordion.
 * - Logika baru ini bekerja dengan mengukur posisi elemen yang diklik
 *   sebelum dan sesudah layout berubah, lalu mengkompensasi pergeseran
 *   visual tersebut dengan scroll. Ini jauh lebih akurat daripada menyimpan
 *   posisi scroll absolut, terutama saat elemen di atas viewport berubah ukuran.
 * =============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  class ModuleGuide {
    constructor(containerSelector) {
      this.container = document.querySelector(containerSelector);
      if (!this.container) {
        console.error(
          `Error: Container utama dengan selector "${containerSelector}" tidak ditemukan.`
        );
        return;
      }

      this.moduleCards = this.container.querySelectorAll(".module-card");
      this.progressBar = document.getElementById("progressBar");
      this.closingStatement = document.querySelector(".closing-statement");
      this.backToTopBtn = document.getElementById("backToTopBtn");

      this.totalModules = this.moduleCards.length;
      this.completedModules = new Set();
    }

    loadState() {
      const savedState =
        JSON.parse(localStorage.getItem("completedModules")) || [];
      this.completedModules = new Set(savedState);
      this.moduleCards.forEach((card) => {
        if (this.completedModules.has(card.dataset.moduleId)) {
          card.classList.add("completed");
        }
      });
    }

    saveState() {
      localStorage.setItem(
        "completedModules",
        JSON.stringify(Array.from(this.completedModules))
      );
    }

    updateProgress() {
      const progressPercentage =
        (this.completedModules.size / this.totalModules) * 100;
      this.progressBar.style.width = `${progressPercentage}%`;
      this.progressBar.textContent = `${Math.round(
        progressPercentage
      )}% Selesai`;
      this.closingStatement.classList.toggle(
        "visible",
        this.completedModules.size === this.totalModules
      );
    }

    /**
     * Mengelola logika buka/tutup accordion TANPA menyebabkan lompatan scroll.
     * @param {HTMLElement} card - Elemen kartu modul yang diklik.
     */
    toggleAccordion(card) {
      // Langkah 1: Ukur posisi card relatif terhadap viewport SEBELUM layout berubah.
      const topBefore = card.getBoundingClientRect().top;

      // Nonaktifkan sementara 'scroll-behavior: smooth' agar kompensasi scroll
      // terjadi instan, bukan animasi.
      const prevBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";

      const isActive = card.classList.contains("active");

      // Tutup semua modul lain jika modul yang diklik akan dibuka.
      if (!isActive) {
        this.moduleCards.forEach((otherCard) => {
          if (otherCard !== card) { // Hanya tutup kartu lain
            otherCard.classList.remove("active");
          }
        });
      }

      // Langkah 2: Lakukan perubahan layout (buka/tutup modul).
      card.classList.toggle("active");

      // Langkah 3: Ukur posisi BARU card relatif terhadap viewport.
      // Browser akan secara otomatis melakukan reflow/re-layout di sini.
      const topAfter = card.getBoundingClientRect().top;

      // Langkah 4: Hitung pergeseran visual card di layar.
      // Jika card bergeser ke atas (karena modul di atasnya terlipat),
      // nilainya akan negatif. Jika bergeser ke bawah, positif.
      const visualShift = topAfter - topBefore;

      // Langkah 5: Kompensasi pergeseran tersebut dengan melakukan scroll.
      // window.scrollBy() akan scroll relatif dari posisi saat ini.
      // Ini secara efektif "menetralkan" pergeseran visual tadi.
      window.scrollBy(0, visualShift);

      // Langkah 6: Kembalikan pengaturan scroll-behavior seperti semula.
      document.documentElement.style.scrollBehavior = prevBehavior;
    }


    toggleCompletion(e, card) {
      e.stopPropagation();
      const moduleId = card.dataset.moduleId;
      card.classList.toggle("completed");
      if (card.classList.contains("completed"))
        this.completedModules.add(moduleId);
      else this.completedModules.delete(moduleId);
      this.saveState();
      this.updateProgress();
    }

    handleScroll() {
      if (this.backToTopBtn) {
        this.backToTopBtn.classList.toggle("visible", window.scrollY > 300);
      }
    }

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    initEventListeners() {
      this.moduleCards.forEach((card) => {
        const header = card.querySelector(".module-header");
        const completeBtn = card.querySelector(".complete-btn");

        header.addEventListener("click", (e) => {
          if (e.target.closest(".complete-btn")) return;
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

    init() {
      if (!this.container) return;
      this.loadState();
      this.updateProgress();
      this.initEventListeners();
    }
  }

  const guide = new ModuleGuide(".accordion-container");
  guide.init();
});