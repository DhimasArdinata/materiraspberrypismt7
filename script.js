/**
 * =============================================================================
 *                      PANDUAN MODUL PEMBELAJARAN INTERAKTIF
 * =============================================================================
 * Deskripsi:
 * Script ini mengelola semua fungsionalitas untuk halaman panduan modul.
 *
 * Patch v5.0 (Solusi Final & User-Friendly):
 * - Saat sebuah modul BARU dibuka, halaman akan secara otomatis dan mulus
 *   menggulir (scroll) ke bagian atas modul tersebut.
 * - Ini secara langsung mengatasi masalah "user harus scroll ke atas" dan
 *   menciptakan pengalaman pengguna yang intuitif dan standar.
 * - Logika animasi tetap menggunakan `scrollHeight` untuk transisi yang akurat.
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
      this.progressBar.textContent = `${Math.round(percentage)}% Selesai`;
      this.closingStatement.classList.toggle(
        "visible",
        this.completedModules.size === this.totalModules
      );
    }

    /**
     * Mengelola logika buka/tutup accordion dan secara otomatis scroll
     * ke modul yang baru dibuka.
     * @param {HTMLElement} card - Elemen kartu modul yang diklik.
     */
    toggleAccordion(card) {
      const moduleBody = card.querySelector(".module-body");
      const isActive = card.classList.contains("active");

      // Tutup semua kartu lain terlebih dahulu
      this.moduleCards.forEach((otherCard) => {
        if (otherCard !== card && otherCard.classList.contains("active")) {
          otherCard.classList.remove("active");
          otherCard.querySelector(".module-body").style.maxHeight = null;
        }
      });

      // Buka atau tutup kartu yang diklik
      if (isActive) {
        // Jika kartu sudah aktif, kita hanya menutupnya. Tidak perlu scroll.
        moduleBody.style.maxHeight = null;
        card.classList.remove("active");
      } else {
        // Jika kartu belum aktif, kita membukanya DAN melakukan scroll.
        card.classList.add("active");
        moduleBody.style.maxHeight = moduleBody.scrollHeight + "px";

        // Jeda singkat diperlukan agar browser sempat memulai animasi buka
        // sebelum kita memerintahkan scroll. Ini membuat pengalaman lebih mulus.
        setTimeout(() => {
          card.scrollIntoView({
            behavior: "smooth",
            block: "start", // Opsi ini memastikan bagian atas card sejajar dengan atas layar
          });
        }, 200); // Jeda 200 milidetik sudah cukup.
      }
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
