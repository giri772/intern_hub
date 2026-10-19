
"use strict";

/*
 * INTERNHUB FRONT-END DEMO
 *
 * This is not production authentication.
 * No passwords are stored or verified by a server.
 * Use a real authentication provider and backend for real accounts.
 */

const internships = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "PixelCraft Technologies",
    domain: "Web Development",
    location: "Remote",
    duration: "3 months",
    durationMonths: 3,
    stipend: 8000,
    description: "Build responsive interfaces using HTML, CSS and JavaScript.",
    skills: ["HTML", "CSS", "JavaScript"]
  },
  {
    id: 2,
    title: "React Developer Intern",
    company: "WebNest Solutions",
    domain: "Web Development",
    location: "Pune, India",
    duration: "6 months",
    durationMonths: 6,
    stipend: 12000,
    description: "Develop reusable components and interactive web applications.",
    skills: ["JavaScript", "React", "Git"]
  },
  {
    id: 3,
    title: "Machine Learning Intern",
    company: "NeuralWorks",
    domain: "AI/ML",
    location: "Remote",
    duration: "3 months",
    durationMonths: 3,
    stipend: 10000,
    description: "Experiment with machine learning models and datasets.",
    skills: ["Python", "Machine Learning", "Data"]
  },
  {
    id: 4,
    title: "AI Research Intern",
    company: "FutureMind Labs",
    domain: "AI/ML",
    location: "Bengaluru, India",
    duration: "6 months",
    durationMonths: 6,
    stipend: 15000,
    description: "Support experiments in applied AI and model evaluation.",
    skills: ["Python", "AI", "Research"]
  },
  {
    id: 5,
    title: "Embedded Systems Intern",
    company: "CircuitEdge Innovations",
    domain: "Electronics",
    location: "Mumbai, India",
    duration: "3 months",
    durationMonths: 3,
    stipend: 9000,
    description: "Work with microcontrollers, sensors and embedded C.",
    skills: ["C", "Microcontrollers", "Embedded Systems"]
  },
  {
    id: 6,
    title: "IoT Engineering Intern",
    company: "SmartCircuit Labs",
    domain: "Electronics",
    location: "Pune, India",
    duration: "4 months",
    durationMonths: 4,
    stipend: 10000,
    description: "Prototype IoT devices and test sensor integrations.",
    skills: ["ESP32", "Sensors", "IoT"]
  },
  {
    id: 7,
    title: "Data Analyst Intern",
    company: "InsightBridge",
    domain: "Data Science",
    location: "Remote",
    duration: "3 months",
    durationMonths: 3,
    stipend: 8000,
    description: "Clean datasets and communicate insights using charts.",
    skills: ["SQL", "Python", "Data Analysis"]
  },
  {
    id: 8,
    title: "Security Analyst Intern",
    company: "SecurePath",
    domain: "Cybersecurity",
    location: "Hyderabad, India",
    duration: "3 months",
    durationMonths: 3,
    stipend: 11000,
    description: "Learn security monitoring and basic vulnerability analysis.",
    skills: ["Networking", "Security", "Linux"]
  },
  {
    id: 9,
    title: "UI/UX Design Intern",
    company: "DesignSpring",
    domain: "UI/UX Design",
    location: "Remote",
    duration: "3 months",
    durationMonths: 3,
    stipend: 7000,
    description: "Create wireframes and improve user experience.",
    skills: ["Figma", "Wireframing", "Prototyping"]
  }
];

// DOM elements
const $ = (selector) => document.querySelector(selector);

const searchInput = $("#search-input");
const domainFilter = $("#domain-filter");
const sortFilter = $("#sort-filter");
const internshipGrid = $("#internship-grid");
const resultCount = $("#result-count");
const statusMessage = $("#status-message");
const statusTitle = $("#status-title");
const statusDescription = $("#status-description");
const listingHeading = $("#listing-heading");

const authDialog = $("#auth-dialog");
const authForm = $("#auth-form");
const authTitle = $("#auth-title");
const authStatus = $("#auth-status");
const authName = $("#auth-name");
const authEmail = $("#auth-email");
const authPassword = $("#auth-password");
const confirmPassword = $("#confirm-password");
const signupFields = $("#signup-fields");
const confirmField = $("#confirm-field");
const loginButton = $("#login-button");
const userMenu = $("#user-menu");
const profileButton = $("#profile-button");

const detailDialog = $("#detail-dialog");
const detailTitle = $("#detail-title");
const detailContent = $("#detail-content");
const applicationForm = $("#application-form");

let authMode = "login";
let currentInternship = null;
let savedOnly = false;
let currentUser = null;
let toastTimer = null;

// Safe storage helpers. The app still works if browser storage is unavailable.
function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.warn("Could not read local storage:", error);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("Could not save local storage:", error);
    showToast("Browser storage is unavailable. Your changes may not persist.");
    return false;
  }
}

let savedIds = readStorage("internhub-saved", []);
if (!Array.isArray(savedIds)) savedIds = [];

function restoreDemoSession() {
  try {
    const raw = sessionStorage.getItem("internhub-demo-session");
    if (!raw) return null;

    const session = JSON.parse(raw);

    if (
      session &&
      typeof session.name === "string" &&
      typeof session.email === "string"
    ) {
      return session;
    }
  } catch (error) {
    console.warn("Could not restore demo session:", error);
  }

  return null;
}

currentUser = restoreDemoSession();

// Create elements using textContent to avoid interpreting user text as HTML.
function makeElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;

  return element;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 3000);
}

// Login / registration interface
function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === "signup";

  authTitle.textContent = isSignup ? "Create your account" : "Welcome back";
  $("#tab-login").classList.toggle("active", !isSignup);
  $("#tab-signup").classList.toggle("active", isSignup);

  signupFields.hidden = !isSignup;
  confirmField.hidden = !isSignup;
  authName.required = isSignup;
  confirmPassword.required = isSignup;

  authPassword.autocomplete = isSignup ? "new-password" : "current-password";
  $("#auth-submit").textContent = isSignup ? "Create account" : "Login";
  $("#forgot-password").hidden = isSignup;
  authStatus.textContent = "";
}

function openAuth(mode = "login") {
  setAuthMode(mode);
  authForm.reset();
  authPassword.type = "password";
  $("#toggle-password").textContent = "Show";

  if (currentUser) {
    showToast("You are already signed in to this demo.");
    return;
  }

  if (!authDialog.open) authDialog.showModal();
  authEmail.focus();
}

function updateAuthUI() {
  loginButton.hidden = Boolean(currentUser);
  userMenu.hidden = !currentUser;

  if (currentUser) {
    profileButton.textContent = "Hi, " + currentUser.name;
    profileButton.setAttribute("aria-label", "Signed in as " + currentUser.name);
  }

  renderInternships();
}

$("#tab-login").addEventListener("click", () => setAuthMode("login"));
$("#tab-signup").addEventListener("click", () => setAuthMode("signup"));

loginButton.addEventListener("click", () => openAuth("login"));
$("#cta-signup").addEventListener("click", () => openAuth("signup"));

$("#toggle-password").addEventListener("click", () => {
  const isPassword = authPassword.type === "password";
  authPassword.type = isPassword ? "text" : "password";
  $("#toggle-password").textContent = isPassword ? "Hide" : "Show";
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  authStatus.textContent = "";

  const email = authEmail.value.trim().toLowerCase();
  const password = authPassword.value;
  const name = authName.value.trim();

  if (!authForm.reportValidity()) return;

  if (password.length < 8) {
    authStatus.textContent = "Use a password with at least 8 characters.";
    return;
  }

  if (authMode === "signup") {
    if (name.length < 2) {
      authStatus.textContent = "Please enter your full name.";
      return;
    }

    if (password !== confirmPassword.value) {
      authStatus.textContent = "The passwords do not match.";
      return;
    }
  }

  /*
   * DEMO ONLY:
   * This does not create or authenticate a real account.
   * The password is used only for client-side validation and is not saved.
   */
  currentUser = {
    name: authMode === "signup"
      ? name
      : (email.split("@")[0] || "Student"),
    email
  };

  try {
    sessionStorage.setItem(
      "internhub-demo-session",
      JSON.stringify(currentUser)
    );
  } catch (error) {
    console.warn("Could not save demo session:", error);
  }

  authForm.reset();
  authDialog.close();
  updateAuthUI();

  showToast(
    authMode === "signup"
      ? "Demo profile created for this session."
      : "Demo login successful."
  );
});

$("#forgot-password").addEventListener("click", () => {
  authStatus.textContent =
    "Password reset is not connected. A real version needs an authentication service.";
});

$("#logout-button").addEventListener("click", () => {
  try {
    sessionStorage.removeItem("internhub-demo-session");
  } catch (error) {
    console.warn("Could not clear demo session:", error);
  }

  currentUser = null;
  updateAuthUI();
  showToast("You have logged out of the demo.");
});

// Saved internships
function updateSavedCount() {
  $("#saved-count").textContent = String(savedIds.length);
}

function toggleSaved(id) {
  if (savedIds.includes(id)) {
    savedIds = savedIds.filter((savedId) => savedId !== id);
    showToast("Internship removed from saved items.");
  } else {
    savedIds.push(id);
    showToast("Internship saved successfully.");
  }

  writeStorage("internhub-saved", savedIds);
  updateSavedCount();
  renderInternships();
}

$("#saved-toggle").addEventListener("click", () => {
  savedOnly = !savedOnly;

  $("#saved-toggle").setAttribute("aria-pressed", String(savedOnly));
  listingHeading.textContent = savedOnly
    ? "Your Saved Internships"
    : "Featured Internships";

  $("#saved-toggle").firstChild.textContent = savedOnly ? "All " : "Saved ";

  $("#internship-list").scrollIntoView({ behavior: "smooth" });
  renderInternships();
});

// Internship cards and filtering
function formatMoney(amount) {
  return "₹" + amount.toLocaleString("en-IN") + "/month";
}

function createInternshipCard(item) {
  const card = makeElement("article", "internship-card");
  const top = makeElement("div", "card-top");

  const mark = makeElement(
    "div",
    "company-mark",
    item.company.charAt(0).toUpperCase()
  );
  mark.setAttribute("aria-hidden", "true");

  const domain = makeElement("span", "domain-tag", item.domain);
  top.append(mark, domain);

  const title = makeElement("h3", "", item.title);
  const company = makeElement("p", "company-name", item.company);
  const description = makeElement("p", "card-description", item.description);
  const details = makeElement("div", "card-details");

  details.append(
    makeElement("span", "", "📍 " + item.location),
    makeElement("span", "", "◷ " + item.duration),
    makeElement("span", "", formatMoney(item.stipend))
  );

  const buttons = makeElement("div", "card-buttons");

  const saveButton = makeElement(
    "button",
    "save-button" + (savedIds.includes(item.id) ? " saved" : ""),
    savedIds.includes(item.id) ? "♥ Saved" : "♡ Save"
  );

  saveButton.type = "button";
  saveButton.setAttribute(
    "aria-pressed",
    String(savedIds.includes(item.id))
  );
  saveButton.setAttribute(
    "aria-label",
    (savedIds.includes(item.id) ? "Remove saved " : "Save ") + item.title
  );

  saveButton.addEventListener("click", () => toggleSaved(item.id));

  const viewButton = makeElement("button", "primary-button", "View Details");
  viewButton.type = "button";
  viewButton.addEventListener("click", () => openDetails(item));

  buttons.append(saveButton, viewButton);
  card.append(top, title, company, description, details, buttons);

  return card;
}

function getFilteredInternships() {
  const keyword = searchInput.value.trim().toLowerCase();
  const domain = domainFilter.value;
  const sort = sortFilter.value;

  let results = internships.filter((item) => {
    const text = [
      item.title,
      item.company,
      item.domain,
      item.location,
      item.description,
      ...item.skills
    ].join(" ").toLowerCase();

    const matchesSearch = text.includes(keyword);
    const matchesDomain = domain === "all" || item.domain === domain;
    const matchesSaved = !savedOnly || savedIds.includes(item.id);

    return matchesSearch && matchesDomain && matchesSaved;
  });

  if (sort === "stipend-high") {
    results.sort((a, b) => b.stipend - a.stipend);
  } else if (sort === "stipend-low") {
    results.sort((a, b) => a.stipend - b.stipend);
  } else if (sort === "duration-short") {
    results.sort((a, b) => a.durationMonths - b.durationMonths);
  }

  return results;
}

function renderInternships() {
  if (!internshipGrid) return;

  try {
    const results = getFilteredInternships();
    const fragment = document.createDocumentFragment();

    results.forEach((item) => {
      fragment.appendChild(createInternshipCard(item));
    });

    internshipGrid.replaceChildren(fragment);

    resultCount.textContent =
      results.length + (results.length === 1
        ? " internship found"
        : " internships found");

    statusMessage.hidden = results.length !== 0;

    if (results.length === 0) {
      statusTitle.textContent = savedOnly
        ? "No saved internships yet"
        : "No internships found";

      statusDescription.textContent = savedOnly
        ? "Save an internship using the Save button to see it here."
        : "Try another keyword or domain, or clear your filters.";
    }
  } catch (error) {
    console.error("Could not render internships:", error);
    internshipGrid.replaceChildren();
    resultCount.textContent = "Unable to load internships";
    statusTitle.textContent = "Something went wrong";
    statusDescription.textContent = "Refresh the page and try again.";
    statusMessage.hidden = false;
  }
}

searchInput.addEventListener("input", renderInternships);
domainFilter.addEventListener("change", renderInternships);
sortFilter.addEventListener("change", renderInternships);

function clearFilters() {
  searchInput.value = "";
  domainFilter.value = "all";
  sortFilter.value = "recommended";
  savedOnly = false;

  $("#saved-toggle").setAttribute("aria-pressed", "false");
  $("#saved-toggle").firstChild.textContent = "Saved ";
  listingHeading.textContent = "Featured Internships";

  renderInternships();
}

$("#clear-filters").addEventListener("click", clearFilters);
$("#status-reset").addEventListener("click", clearFilters);

// Internship details and demo application
function openDetails(item) {
  currentInternship = item;

  detailTitle.textContent = item.title;
  detailContent.replaceChildren();

  detailContent.append(
    makeElement("p", "company-name", item.company),
    makeElement("p", "", item.description),
    makeElement("p", "", "Domain: " + item.domain),
    makeElement("p", "", "Location: " + item.location),
    makeElement("p", "", "Duration: " + item.duration),
    makeElement("p", "", "Stipend: " + formatMoney(item.stipend)),
    makeElement("h3", "", "Skills"),
    makeElement("p", "", item.skills.join(" • "))
  );

  const applyButton = makeElement(
    "button",
    "primary-button full-button",
    "Apply for this internship"
  );

  applyButton.type = "button";
  applyButton.addEventListener("click", () => {
    applicationForm.hidden = false;
    $("#applicant-name").value = currentUser?.name || "";
    $("#applicant-email").value = currentUser?.email || "";
    $("#applicant-name").focus();
  });

  detailContent.appendChild(applyButton);
  applicationForm.reset();
  applicationForm.hidden = true;
  $("#application-status").textContent = "";

  detailDialog.showModal();
}

applicationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!applicationForm.reportValidity()) return;

  $("#application-status").textContent =
    "Demo application validated for " + currentInternship.title +
    ". No application was sent to an employer.";

  showToast("Demo application completed. Nothing was sent externally.");
});

// Contact form demonstration
$("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  $("#contact-status").textContent =
    "Thank you! Your form is valid, but this demo does not send messages.";

  form.reset();
});

// Close buttons and Escape handling
document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.close);
    if (dialog?.open) dialog.close();
  });
});

[authDialog, detailDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

// Initial page setup
updateSavedCount();
updateAuthUI();
renderInternships();
