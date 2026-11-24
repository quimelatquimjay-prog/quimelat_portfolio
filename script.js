const revealSelectors = [
        "main section h1",
        "main section h2",
        "main section h3",
        "main section h4",
        "main section p",
        "main section a.inline-flex",
        "main section img",
        "main section .grid > *",
        "main section .flex.flex-col.gap-space-lg > div",
      ];

      const revealTargets = Array.from(
        new Set(document.querySelectorAll(revealSelectors.join(", "))),
      )
        .filter((element) => !element.closest("#mobile-menu"))
        .filter(
          (element, _, all) =>
            !all.some((other) => other !== element && other.contains(element)),
        );

      const delayByParent = new Map();
      revealTargets.forEach((element) => {
        const parentKey = element.parentElement || document.body;
        const index = delayByParent.get(parentKey) || 0;
        element.style.setProperty("--reveal-delay", `${Math.min(index * 80, 320)}ms`);
        delayByParent.set(parentKey, index + 1);

        const rect = element.getBoundingClientRect();
        const centered = rect.left > window.innerWidth * 0.55;
        const leftSide = rect.right < window.innerWidth * 0.45;
        if (element.tagName === "IMG") {
          element.classList.add("scroll-reveal", "reveal-scale");
        } else if (leftSide && element.closest(".grid")) {
          element.classList.add("scroll-reveal", "reveal-left");
        } else if (centered && element.closest(".grid")) {
          element.classList.add("scroll-reveal", "reveal-right");
        } else {
          element.classList.add("scroll-reveal");
        }
      });

      const showReveal = (element) => element.classList.add("is-visible");

      if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                requestAnimationFrame(() => showReveal(entry.target));
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
        );

        revealTargets.forEach((element) => revealObserver.observe(element));
      } else {
        revealTargets.forEach(showReveal);
      }

      const menuToggle = document.getElementById("menu-toggle");
      const mobileMenu = document.getElementById("mobile-menu");
      if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", () => {
          const isOpen = !mobileMenu.classList.toggle("hidden");
          menuToggle.setAttribute("aria-expanded", String(isOpen));
          menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation",
          );
          menuToggle.querySelector("span").textContent = isOpen
            ? "close"
            : "menu";
        });
        mobileMenu.querySelectorAll("a").forEach((link) => {
          link.addEventListener("click", () => {
            mobileMenu.classList.add("hidden");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation");
            menuToggle.querySelector("span").textContent = "menu";
          });
        });
      }

      const scrollBehavior = "smooth";

      const scrollToHash = (hash) => {
        if (hash === "#") {
          window.scrollTo({ top: 0, behavior: scrollBehavior });
          return true;
        }

        let id = hash.slice(1);
        try {
          id = decodeURIComponent(id);
        } catch {
          // Keep the raw id if the hash contains an invalid escape sequence.
        }

        const target = document.getElementById(id);
        if (!target) return false;

        target.scrollIntoView({
          behavior: scrollBehavior,
          block: "start",
          inline: "nearest",
        });
        return true;
      };

      document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            (link.target && link.target !== "_self")
          ) {
            return;
          }

          const hash = link.getAttribute("href");
          if (!hash || !scrollToHash(hash)) return;

          event.preventDefault();
          history.pushState(null, "", hash);
        });
      });

      const highlightVideo = document.getElementById("content-planning-video");
      const highlightSource = document.getElementById("content-planning-source");
      if (highlightVideo && highlightSource) {
        const clips = [
          "f0815c5f-2d6c-4d81-aed7-e26778a258ab.mp4",
          "10185294-872c-420d-9f59-0b2a56b50a7c.mp4",
        ];
        let clipIndex = 0;

        highlightVideo.play().catch(() => {});

        highlightVideo.addEventListener("ended", () => {
          clipIndex = (clipIndex + 1) % clips.length;
          highlightSource.src = clips[clipIndex];
          highlightVideo.load();
          highlightVideo.play().catch(() => {});
        });
      }
