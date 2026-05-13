const WHATSAPP_NUMBER = "5491112345678";
const REDIRECT_DELAY_MS = 900;

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const reservationForm = document.querySelector("#reservationForm");
const formSuccess = document.querySelector("#formSuccess");
const deliveryButtons = document.querySelectorAll(".delivery-whatsapp");
const quickWhatsAppLinks = document.querySelectorAll(".whatsapp-link");
const dateInput = document.querySelector("#date");
const toast = document.querySelector("#toast");

const buildWhatsAppUrl = (message) => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const showToast = (message) => {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");
};

const openWhatsAppWithNotice = (message, noticeTarget, noticeText) => {
  if (noticeTarget) {
    noticeTarget.textContent = noticeText;
  }

  showToast(noticeText);

  window.setTimeout(() => {
    window.location.assign(buildWhatsAppUrl(message));
  }, REDIRECT_DELAY_MS);
};

const setFieldError = (field, message) => {
  const row = field.closest(".form-row");
  const error = row.querySelector(".error-message");
  row.classList.toggle("invalid", Boolean(message));
  error.textContent = message;
};

const validateReservationForm = () => {
  const formData = new FormData(reservationForm);
  const name = formData.get("name").trim();
  const date = formData.get("date");
  const time = formData.get("time");
  const people = Number(formData.get("people"));
  let isValid = true;

  const requiredFields = [
    ["name", name, "Ingresá tu nombre."],
    ["date", date, "Seleccioná una fecha."],
    ["time", time, "Seleccioná un horario."],
  ];

  requiredFields.forEach(([fieldName, value, message]) => {
    const field = reservationForm.elements[fieldName];
    const hasError = !value;
    setFieldError(field, hasError ? message : "");
    if (hasError) isValid = false;
  });

  const peopleField = reservationForm.elements.people;
  if (!people || people < 1) {
    setFieldError(peopleField, "Indicá cuántas personas vienen.");
    isValid = false;
  } else if (people > 20) {
    setFieldError(peopleField, "Para más de 20 personas, escribinos directo por WhatsApp.");
    isValid = false;
  } else {
    setFieldError(peopleField, "");
  }

  if (date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(`${date}T00:00:00`);

    if (selectedDate < today) {
      setFieldError(reservationForm.elements.date, "La fecha no puede ser anterior a hoy.");
      isValid = false;
    }
  }

  return isValid;
};

const formatDate = (dateValue) => {
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
};

if (dateInput) {
  dateInput.min = new Date().toISOString().split("T")[0];
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

quickWhatsAppLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openWhatsAppWithNotice(
      "Hola Casa Bruna, quiero hacer una reserva.",
      null,
      "¡Perfecto! Estamos abriendo WhatsApp para iniciar tu reserva."
    );
  });
});

if (reservationForm) {
  reservationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formSuccess.textContent = "";

    if (!validateReservationForm()) {
      formSuccess.textContent = "Revisá los campos marcados para continuar.";
      return;
    }

    const formData = new FormData(reservationForm);
    const comments = formData.get("comments").trim() || "Sin comentarios.";
    const message = [
      "Hola Casa Bruna, quiero hacer una reserva.",
      `Nombre: ${formData.get("name").trim()}`,
      `Fecha: ${formatDate(formData.get("date"))}`,
      `Hora: ${formData.get("time")}`,
      `Personas: ${formData.get("people")}`,
      `Comentarios: ${comments}`,
    ].join("\n");

    openWhatsAppWithNotice(
      message,
      formSuccess,
      "¡Perfecto! Estamos abriendo WhatsApp con tu reserva."
    );
  });
}

deliveryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const originalText = button.textContent;
    button.textContent = "Abriendo WhatsApp...";
    button.disabled = true;

    openWhatsAppWithNotice(button.dataset.message, null, "¡Listo! Estamos abriendo WhatsApp para continuar tu pedido.");

    window.setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, REDIRECT_DELAY_MS + 600);
  });
});
