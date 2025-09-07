/**
 * =============================================================================
 *                      PANDUAN MODUL PEMBELAJARAN INTERAKTIF
 * =============================================================================
 * Deskripsi:
 * Script ini mengelola semua fungsionalitas untuk halaman panduan modul.
 *
 * Patch v6.0 (Solusi Sinkronisasi Transisi):
 * - Logika scroll sekarang disinkronkan dengan event 'transitionend'.
 * - Script akan MENUNGGU animasi penutupan modul lain SELESAI, baru kemudian
 *   menjalankan scroll ke modul yang baru dibuka.
 * - Ini memastikan posisi scroll 100% akurat dan secara definitif
 *   menyelesaikan masalah "user masih harus scroll ke atas".
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
     * Mengelola logika buka/tutup accordion dengan scroll yang akurat
     * dan tersinkronisasi dengan animasi CSS.
     * @param {HTMLElement} card - Elemen kartu modul yang diklik.
     */
    toggleAccordion(card) {
      const moduleBody = card.querySelector(".module-body");
      const isActive = card.classList.contains("active");

      // Kasus 1: Mengklik kartu yang sudah aktif untuk menutupnya.
      // Cukup tutup saja, tidak perlu scroll.
      if (isActive) {
        moduleBody.style.maxHeight = null;
        card.classList.remove("active");
        return;
      }

      // Kasus 2: Mengklik kartu baru untuk membukanya.

      let anotherCardWasOpen = false;

      // Langkah A: Cari dan tutup kartu lain yang sedang terbuka.
      this.moduleCards.forEach((otherCard) => {
        if (otherCard.classList.contains("active")) {
          anotherCardWasOpen = true;
          const otherBody = otherCard.querySelector(".module-body");

          // INI KUNCINYA: Tambahkan event listener yang hanya berjalan sekali.
          // Event ini akan aktif KETIKA animasi transisi penutupan SELESAI.
          otherBody.addEventListener(
            "transitionend",
            () => {
              card.scrollIntoView({ behavior: "smooth", block: "start" });
            },
            { once: true }
          ); // Opsi 'once: true' akan otomatis menghapus listener ini.

          // Mulai proses penutupan kartu lain.
          otherCard.classList.remove("active");
          otherBody.style.maxHeight = null;
        }
      });

      // Langkah B: Buka kartu yang baru diklik.
      card.classList.add("active");
      moduleBody.style.maxHeight = moduleBody.scrollHeight + "px";

      // Langkah C: Jika tidak ada kartu lain yang terbuka sebelumnya,
      // kita tidak perlu menunggu transisi. Lakukan scroll langsung.
      if (!anotherCardWasOpen) {
        // Jeda singkat tetap diperlukan agar animasi BUKA sempat dimulai,
        // sehingga efek scroll terasa lebih alami.
        setTimeout(() => {
          card.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
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
