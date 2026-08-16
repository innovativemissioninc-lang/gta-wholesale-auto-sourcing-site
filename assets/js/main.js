/* =====================================================================
   GTA WHOLESALE AUTO SOURCING — Shared Site Behaviour
   Mobile nav, FAQ accordion, and the Open-Book Transparency Calculator.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------------- Mobile Navigation ---------------- */
  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      var isOpen = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    document.querySelectorAll(".mobile-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- FAQ Accordion ---------------- */
  function initFaqAccordion() {
    var items = document.querySelectorAll(".faq-item");
    items.forEach(function (item) {
      var btn = item.querySelector(".faq-question");
      var answer = item.querySelector(".faq-answer");
      if (!btn || !answer) return;
      btn.addEventListener("click", function () {
        var isOpen = item.getAttribute("data-open") === "true";
        // Close siblings within the same list for a clean single-open accordion
        var list = item.closest(".faq-list");
        if (list) {
          list.querySelectorAll('.faq-item[data-open="true"]').forEach(function (openItem) {
            if (openItem !== item) {
              openItem.setAttribute("data-open", "false");
              openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
              openItem.querySelector(".faq-answer").style.maxHeight = null;
            }
          });
        }
        item.setAttribute("data-open", isOpen ? "false" : "true");
        btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
        answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 24 + "px";
      });
    });
  }

  /* ---------------- Transparency Savings Calculator ---------------- */
  /**
   * Mathematical engine for real-time comparison between a traditional
   * GTA retail dealer lot and GTA Wholesale Auto Sourcing proxy pricing.
   * @param {number} hammerPrice - The live auction hammer price (CAD).
   * @param {boolean} isFinanced - Whether the buyer is financing (60 mo).
   * @param {boolean} hasWarranty - Whether a 2-year extended warranty is added.
   */
  function calculateComparison(hammerPrice, isFinanced, hasWarranty) {
    // Traditional Retail Dealer Math
    var dealBase = Math.round(hammerPrice * 1.257);
    var dealAddons = 799 + 899 + 499; // Admin + Safety + Etch
    var dealFinanceFee = isFinanced ? 895 : 0;
    var dealWarranty = hasWarranty ? 2850 : 0;
    var dealPPSA = isFinanced ? 84.25 : 0;
    var dealTaxable = dealBase + dealAddons + dealFinanceFee + dealWarranty;
    var dealTax = dealTaxable * 0.13 + 59.0 + dealPPSA;
    var dealTotal = dealTaxable + dealTax;

    // GTA Wholesale Proxy Sourcing Math
    var proxyPassThrough = 485 + 175 + 300 + 560; // Buyer fee + PSI + Tow + DriveON Safety/Parts
    var proxyFee = 1500;
    var proxyWarranty = hasWarranty ? 1250 : 0;
    var proxyPPSA = isFinanced ? 84.25 : 0;
    var proxyTaxable = hammerPrice + proxyPassThrough + proxyFee + proxyWarranty;
    var proxyTax = proxyTaxable * 0.13 + 59.0 + proxyPPSA;
    var proxyTotal = proxyTaxable + proxyTax;

    // 60-Month Payment Math
    function calcPMT(p, apr) {
      var r = apr / 100 / 12;
      return (p * (r * Math.pow(1 + r, 60))) / (Math.pow(1 + r, 60) - 1);
    }

    var dealMonthly = isFinanced ? calcPMT(dealTotal, 9.2) : 0;
    var proxyMonthly = isFinanced ? calcPMT(proxyTotal, 7.2) : 0;
    var totalSavings = isFinanced ? dealMonthly * 60 - proxyMonthly * 60 : dealTotal - proxyTotal;

    return {
      dealBase: dealBase,
      dealTotal: dealTotal,
      proxyTotal: proxyTotal,
      dealMonthly: dealMonthly,
      proxyMonthly: proxyMonthly,
      totalSavings: totalSavings,
    };
  }

  function formatCAD(n) {
    return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
  }
  function formatCADCents(n) {
    return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 });
  }

  function initCalculator() {
    var calc = document.querySelector("[data-calculator]");
    if (!calc) return;

    var priceInput = calc.querySelector("[data-price-input]");
    var priceOutput = calc.querySelector("[data-price-output]");
    var financeToggle = calc.querySelector("[data-finance-toggle]");
    var warrantyToggle = calc.querySelector("[data-warranty-toggle]");

    var dealTotalEl = calc.querySelector("[data-deal-total]");
    var proxyTotalEl = calc.querySelector("[data-proxy-total]");
    var savingsEl = calc.querySelector("[data-savings]");
    var savingsSubEl = calc.querySelector("[data-savings-sub]");
    var dealMonthlyRow = calc.querySelector("[data-deal-monthly-row]");
    var proxyMonthlyRow = calc.querySelector("[data-proxy-monthly-row]");
    var dealMonthlyEl = calc.querySelector("[data-deal-monthly]");
    var proxyMonthlyEl = calc.querySelector("[data-proxy-monthly]");
    var heroSavingsEl = document.querySelector("[data-hero-savings]");

    function render() {
      var price = parseInt(priceInput.value, 10) || 0;
      var isFinanced = financeToggle ? financeToggle.checked : false;
      var hasWarranty = warrantyToggle ? warrantyToggle.checked : false;

      if (priceOutput) priceOutput.textContent = formatCAD(price);

      var r = calculateComparison(price, isFinanced, hasWarranty);

      if (dealTotalEl) dealTotalEl.textContent = formatCAD(r.dealTotal);
      if (proxyTotalEl) proxyTotalEl.textContent = formatCAD(r.proxyTotal);
      if (savingsEl) savingsEl.textContent = formatCAD(Math.max(r.totalSavings, 0));
      if (heroSavingsEl) heroSavingsEl.textContent = formatCAD(Math.max(r.totalSavings, 0));

      if (isFinanced) {
        if (dealMonthlyRow) dealMonthlyRow.hidden = false;
        if (proxyMonthlyRow) proxyMonthlyRow.hidden = false;
        if (dealMonthlyEl) dealMonthlyEl.textContent = formatCADCents(r.dealMonthly) + "/mo";
        if (proxyMonthlyEl) proxyMonthlyEl.textContent = formatCADCents(r.proxyMonthly) + "/mo";
        if (savingsSubEl) savingsSubEl.textContent = "Over 60 monthly payments (7.20% vs. 9.20% dealer-marked rate)";
      } else {
        if (dealMonthlyRow) dealMonthlyRow.hidden = true;
        if (proxyMonthlyRow) proxyMonthlyRow.hidden = true;
        if (savingsSubEl) savingsSubEl.textContent = "Cash out-the-door price difference";
      }
    }

    [priceInput, financeToggle, warrantyToggle].forEach(function (el) {
      if (el) el.addEventListener("input", render);
    });

    render();
  }

  /* ---------------- Current year in footer ---------------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initFaqAccordion();
    initCalculator();
    initYear();
  });

  // Expose for reuse/testing
  window.GTAWAS = { calculateComparison: calculateComparison };
})();
