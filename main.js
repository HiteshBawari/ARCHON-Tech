(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ============ NAVBAR SCROLL STATE ============ */
  const navbar = document.getElementById("navbar");
  function onScroll() {
    navbar.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ============ MOBILE MENU ============ */
  const burgerBtn = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    mobileMenu.classList.remove("is-open");
    burgerBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  function openMenu() {
    mobileMenu.classList.add("is-open");
    burgerBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  burgerBtn.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });
  // Services + every other in-page link: smooth scroll is handled natively via
  // html { scroll-behavior: smooth } + href="#section-id". Close the mobile
  // menu on any link tap (including Services) so it never blocks the target section.
  mobileMenu.querySelectorAll(".mobile-link, .mobile-menu__cta").forEach((el) => {
    el.addEventListener("click", closeMenu);
  });

  /* ============ HERO LOAD SEQUENCE ============ */
  if (window.gsap) {
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      delay: 0.15,
    });

    tl.to(".navbar", { opacity: 1, duration: 0.01 })
      .from(".navbar__inner", { y: -24, opacity: 0, duration: 0.6 }, 0)
      .to('[data-anim="badge"]', { opacity: 1, y: 0, duration: 0.5 }, 0.15)
      .from('[data-anim="badge"]', { y: -12 }, 0.15)
      .to(".hero__headline .line", {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.12,
      }, 0.28)
      .from(".hero__headline .line", { yPercent: 100 }, 0.28)
      .to('[data-anim="price"]', { opacity: 1, y: 0, duration: 0.6 }, 0.62)
      .from('[data-anim="price"]', { y: 16 }, 0.62)
      .to('[data-anim="sub"]', { opacity: 1, y: 0, duration: 0.6 }, 0.74)
      .from('[data-anim="sub"]', { y: 14 }, 0.74)
      .to('[data-anim="cta"]', { opacity: 1, y: 0, duration: 0.6 }, 0.85)
      .from('[data-anim="cta"] .btn', { y: 14, stagger: 0.1 }, 0.85)
      .to('[data-anim="scene"]', { opacity: 1, scale: 1, duration: 0.9 }, 0.45)
      .from('[data-anim="scene"]', { scale: 0.94 }, 0.45);

    gsap.set(".navbar", { opacity: 0 });
    gsap.set('[data-anim="scene"]', { scale: 0.94 });
  }

  /* ============ SCROLL REVEALS ============ */
  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    // Simple, purposeful per-section reveal (grid-aware stagger)
    document.querySelectorAll(".value__grid, .projects__grid, .services__grid").forEach((grid) => {
      const items = grid.querySelectorAll(":scope > *");
      gsap.set(items, { opacity: 0, y: 28 });
      ScrollTrigger.create({
        trigger: grid,
        start: "top 82%",
        once: true,
        onEnter: () =>
          gsap.to(items, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }),
      });
    });

    // Section titles / eyebrows fade up
    document.querySelectorAll(".about__copy, .contact__intro, .faq__intro").forEach((block) => {
      gsap.set(block, { opacity: 0, y: 26 });
      ScrollTrigger.create({
        trigger: block,
        start: "top 85%",
        once: true,
        onEnter: () => gsap.to(block, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }),
      });
    });

    gsap.set(".about__tags .tag", { opacity: 0, x: 24 });
    ScrollTrigger.create({
      trigger: ".about__tags",
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(".about__tags .tag", { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }),
    });

    gsap.set(".contact__form", { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: ".contact__form",
      start: "top 85%",
      once: true,
      onEnter: () => gsap.to(".contact__form", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }),
    });

    /* ---- Animated stat counters ---- */
    document.querySelectorAll(".stat__num").forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => (el.textContent = Math.round(obj.val)),
          });
        },
      });
    });
  } else {
    // Reduced motion fallback: show everything immediately
    document.querySelectorAll(
      '.value-card, .project-card, .service-card, .faq-item, .about__copy, .contact__intro, .faq__intro, .about__tags .tag, .contact__form'
    ).forEach((el) => { el.style.opacity = 1; });
  }

  /* ============================================================
     PROCESS SECTION — "Structure Before Style"
     Rebuilt from scratch: a single GSAP-driven crossfade timeline
     controls all 4 stages. Only one animation system ever touches
     these elements (no CSS class + inline-style fighting, which
     was the root cause of the old overlapping-text bug).
     Desktop: pinned, scroll-scrubbed crossfade sequence.
     Mobile/tablet: simple stacked scroll-reveal, no pin.
  ============================================================ */
  const processSection = document.querySelector(".process");

  if (processSection && window.gsap && window.ScrollTrigger) {
    const stages = gsap.utils.toArray(".process__stage", processSection);
    const progressFill = processSection.querySelector(".process__progress-fill");
    const labels = gsap.utils.toArray(".process__labels span", processSection);

    function setActiveLabel(index) {
      labels.forEach((label, i) => label.classList.toggle("is-active", i === index));
    }

    ScrollTrigger.matchMedia({

      /* ---- Desktop / tablet-landscape: pinned crossfade ---- */
      "(min-width: 861px)": function () {
        // gsap.context ensures every tween/ScrollTrigger created here is
        // cleanly reverted if the viewport crosses back below 861px.
        const ctx = gsap.context(() => {
          gsap.set(stages, { opacity: 0, y: 18 });
          gsap.set(stages[0], { opacity: 1, y: 0 });
          setActiveLabel(0);
          if (progressFill) progressFill.style.width = "0%";

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: processSection,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              pin: ".process__pin",
              anticipatePin: 1,
              onUpdate: (self) => {
                if (progressFill) progressFill.style.width = `${self.progress * 100}%`;
              },
            },
          });

          // Opening hold so stage 1 is readable before the first transition.
          tl.to({}, { duration: 0.6 });

          stages.forEach((stage, i) => {
            if (i === 0) return;
            tl.to(stages[i - 1], { opacity: 0, y: -18, duration: 0.5, ease: "power1.inOut" })
              .to(stage, { opacity: 1, y: 0, duration: 0.5, ease: "power1.inOut" }, "<")
              .call(() => setActiveLabel(i))
              .to({}, { duration: 0.9 }); // hold so the stage is readable
          });

          return () => {
            gsap.set(stages, { clearProps: "opacity,transform" });
          };
        }, processSection);

        return () => ctx.revert();
      },

      /* ---- Mobile / small tablet: simple stacked reveal, no pin ---- */
      "(max-width: 860px)": function () {
        const ctx = gsap.context(() => {
          gsap.set(stages, { clearProps: "opacity,transform" });
          const triggers = stages.map((stage) =>
            ScrollTrigger.create({
              trigger: stage,
              start: "top 82%",
              once: true,
              onEnter: () => stage.classList.add("is-visible"),
            })
          );

          return () => triggers.forEach((t) => t.kill());
        }, processSection);

        return () => ctx.revert();
      },
    });
  } else if (processSection) {
    // No GSAP available: show every stage plainly, no animation.
    processSection.querySelectorAll(".process__stage").forEach((stage) => {
      stage.style.opacity = 1;
      stage.classList.add("is-visible");
    });
  }

  /* ============ PROJECT CARD TILT (desktop only) ============ */
  const isTouch = matchMedia("(hover: none)").matches;
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ============ FAQ ACCORDION ============ */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-item__q");
    const panel = item.querySelector(".faq-item__a");

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // close all others
      document.querySelectorAll(".faq-item__q").forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute("aria-expanded", "false");
          const otherPanel = otherBtn.closest(".faq-item").querySelector(".faq-item__a");
          if (window.gsap) {
            gsap.to(otherPanel, { height: 0, duration: 0.35, ease: "power2.inOut" });
          } else {
            otherPanel.style.height = "0px";
          }
        }
      });

      btn.setAttribute("aria-expanded", String(!isOpen));

      if (!isOpen) {
        const target = panel.scrollHeight;
        if (window.gsap) {
          gsap.to(panel, { height: target, duration: 0.4, ease: "power2.inOut" });
        } else {
          panel.style.height = target + "px";
        }
      } else {
        if (window.gsap) {
          gsap.to(panel, { height: 0, duration: 0.35, ease: "power2.inOut" });
        } else {
          panel.style.height = "0px";
        }
      }
    });
  });

  /* ============ CONTACT FORM (Web3Forms) ============ */
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");
  const submitBtn = form.querySelector(".contact__submit");

  function setFieldError(field, message) {
    const errorEl = form.querySelector(`[data-error-for="${field}"]`);
    if (errorEl) errorEl.textContent = message || "";
  }

  function validate() {
    let valid = true;

    const name = form.name.value.trim();
    if (!name) { setFieldError("fullName", "Please enter your name."); valid = false; }
    else setFieldError("fullName", "");

    const email = form.email.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { setFieldError("email", "Please enter your email."); valid = false; }
    else if (!emailRe.test(email)) { setFieldError("email", "Please enter a valid email address."); valid = false; }
    else setFieldError("email", "");

    const message = form.message.value.trim();
    if (!message) { setFieldError("message", "Please enter a short message."); valid = false; }
    else setFieldError("message", "");

    return valid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "form-status";

    if (!validate()) {
      statusEl.textContent = "Please fix the highlighted fields.";
      statusEl.classList.add("is-error");
      return;
    }

    const accessKey = form.access_key.value;
    if (!accessKey || accessKey === "d15af9391a684a4b8bf2fed43c88d00a") {
      statusEl.textContent = "Form isn't connected yet — add your Web3Forms access key in the code.";
      statusEl.classList.add("is-error");
      return;
    }

    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;

    try {
      const formData = new FormData(form);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        statusEl.textContent = "Message sent — we'll be in touch shortly.";
        statusEl.classList.add("is-success");
        form.reset();
      } else {
        statusEl.textContent = result.message || "Something went wrong. Please try again.";
        statusEl.classList.add("is-error");
      }
    } catch (err) {
      statusEl.textContent = "Network error — please try again in a moment.";
      statusEl.classList.add("is-error");
    } finally {
      submitBtn.classList.remove("is-loading");
      submitBtn.disabled = false;
    }
  });
})();