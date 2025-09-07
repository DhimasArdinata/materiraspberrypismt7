/**
 * =============================================================================
 *                      PANDUAN MODUL PEMBELAJARAN INTERAKTIF
 * =============================================================================
 * Deskripsi:
 * Script ini mengelola semua fungsionalitas untuk halaman panduan modul.
 * Ditulis menggunakan pendekatan Object-Oriented Programming (OOP) dengan sebuah
 * class bernama `ModuleGuide` untuk menjaga kode tetap terorganisir dan modular.
 *
 * Patch Terintegrasi v3.0 (Definitif):
 * - Mencegah "lompatan" atau auto-scroll saat membuka/menutup accordion.
 * - Logika ini secara cerdas menonaktifkan transisi CSS sementara,
 *   memaksa layout berubah secara instan untuk perhitungan yang akurat,
 *   melakukan kompensasi scroll, lalu mengaktifkan kembali transisi.
 *   Ini adalah solusi paling robust untuk masalah sinkronisasi JS/CSS.
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
      const isActive = card.classList.contains("active");

      // Langkah 1: Ukur posisi elemen yang diklik SEBELUM ada perubahan apapun.
      const topBefore = card.getBoundingClientRect().top;

      // Langkah 2: Nonaktifkan 'scroll-behavior: smooth' untuk penyesuaian instan.
      const prevBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";

      // Langkah 3: Nonaktifkan sementara transisi CSS pada SEMUA kartu.
      // Ini adalah langkah kunci agar perubahan layout terjadi seketika.
      this.moduleCards.forEach((c) => {
        c.querySelector(".module-body").style.transition = "none";
      });

      // Langkah 4: Terapkan perubahan layout (tutup yang lain, buka/tutup yang ini).
      if (!isActive) {
        this.moduleCards.forEach((otherCard) => {
          if (otherCard !== card) {
            otherCard.classList.remove("active");
          }
        });
      }
      card.classList.toggle("active");

      // Langkah 5: Ukur posisi elemen SETELAH layout berubah secara instan.
      const topAfter = card.getBoundingClientRect().top;

      // Langkah 6: Hitung pergeseran visual dan kompensasi dengan scroll.
      const visualShift = topAfter - topBefore;
      window.scrollBy(0, visualShift);

      // Langkah 7: Kembalikan transisi CSS.
      // Menggunakan requestAnimationFrame memastikan ini terjadi setelah
      // browser selesai dengan penyesuaian scroll.
      requestAnimationFrame(() => {
        this.moduleCards.forEach((c) => {
          // Menghapus style inline akan mengembalikan properti ke nilai di stylesheet.
          c.querySelector(".module-body").style.transition = "";
        });
      });

      // Langkah 8: Kembalikan 'scroll-behavior'.
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
