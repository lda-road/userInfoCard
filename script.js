// Card colors for the listed favorite colors
const COLOR_MAP = {
  Red: "#a9483b",
  Blue: "#3f6e8c",
  Green: "#4f7a4d",
  Purple: "#76597f",
  Orange: "#bf7a3a",
  Teal: "#3a7a78",
};
const DEFAULT_COLOR = "#66827c";
const TOTAL_FIELDS = 13; // name, picture, age, birthday, gender, phone, email, education, country, address, bio, color, hobbies

// DOM selection method 1: getElementById
const form = document.getElementById("infoForm");
const card = document.getElementById("card");
const cardBody = document.getElementById("cardBody");
const showBtn = document.getElementById("showBtn");
const clearBtn = document.getElementById("clearBtn");
const confirmBox = document.getElementById("confirm");
const confirmError = document.getElementById("confirmError");

let photoUrl = null; // object URL of the uploaded picture

function readValue(id) {
  return document.getElementById(id).value.trim();
}

function formatDate(value) {
  if (!value) return "";
  const p = value.split("-").map(Number);
  return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Show the "Other" text boxes only when "Other" is chosen
function toggleOthers() {
  document.getElementById("colorOtherBox").hidden =
    !document.getElementById("colorOtherRadio").checked;
  document.getElementById("hobbyOtherBox").hidden =
    !document.getElementById("hobbyOtherCheck").checked;
}

// Show the chosen file name next to the upload button
function updateFileName() {
  const file = document.getElementById("photo").files[0];
  const label = document.getElementById("fileName");
  label.textContent = file ? file.name : "No picture chosen";
  label.classList.toggle("has-file", Boolean(file));
}

// Age in whole years from a yyyy-mm-dd birthday
function calcAge(value) {
  const p = value.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - p[0];
  const hadBirthday =
    today.getMonth() + 1 > p[1] ||
    (today.getMonth() + 1 === p[1] && today.getDate() >= p[2]);
  if (!hadBirthday) age -= 1;
  return age;
}

// Fill the age box from the birthday (the age box stays editable)
function autoFillAge() {
  const birthday = document.getElementById("birthday").value;
  if (!birthday) return;
  const age = calcAge(birthday);
  if (age >= 0 && age <= 120) document.getElementById("age").value = age;
}

// Build one titled section of the card; rows is a list of [label, value] pairs
function makeSection(title, rows) {
  const section = document.createElement("section");
  section.className = "card-section";
  const heading = document.createElement("h3");
  heading.textContent = title;
  section.appendChild(heading);
  if (rows) {
    const dl = document.createElement("dl");
    rows.forEach(function (row) {
      const wrap = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = row[0];
      dd.textContent = row[1]; // textContent keeps typed text as plain text
      wrap.className = "card-row";
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      dl.appendChild(wrap);
    });
    section.appendChild(dl);
  }
  return section;
}

function showInfo() {
  // The card only shows once the person confirms the information is correct
  if (!confirmBox.checked) {
    confirmError.hidden = false;
    confirmBox.focus();
    return;
  }
  confirmError.hidden = true;

  // DOM selection method 2: querySelector and querySelectorAll
  const genderInput = document.querySelector('input[name="gender"]:checked');
  const colorInput = document.querySelector('input[name="color"]:checked');
  const hobbyBoxes = document.querySelectorAll('input[name="hobby"]:checked');

  const name = readValue("fullName");
  const gender = genderInput ? genderInput.value : "";

  // Favorite color: a listed color, or the name the person typed for "Other"
  let colorText = colorInput ? colorInput.value : "";
  let accent = COLOR_MAP[colorText] || DEFAULT_COLOR;
  if (colorText === "Other") {
    colorText = readValue("customColorName");
    accent = DEFAULT_COLOR;
  }

  // Hobbies, with "Other" replaced by whatever was typed
  const hobbies = [];
  hobbyBoxes.forEach(function (box) {
    if (box.value === "Other") {
      const custom = readValue("hobbyOther");
      if (custom) hobbies.push(custom);
    } else {
      hobbies.push(box.value);
    }
  });

  const bio = readValue("bio");

  // Personal info and "more about you" rows; empty fields are left out
  const personalRows = [
    ["Age", readValue("age")],
    ["Birthday", formatDate(document.getElementById("birthday").value)],
    ["Gender", gender],
    ["Phone", readValue("phone")],
    ["Email", readValue("email")],
    ["Education", readValue("education")],
    ["Country", readValue("country")],
    ["Address", readValue("address")],
  ].filter(function (row) {
    return row[1] !== "";
  });

  const moreRows = [
    ["Favorite color", colorText],
    ["Hobbies", hobbies.join(", ")],
  ].filter(function (row) {
    return row[1] !== "";
  });

  const photoFile = document.getElementById("photo").files[0];
  const shown =
    personalRows.length +
    moreRows.length +
    (bio ? 1 : 0) +
    (name ? 1 : 0) +
    (photoFile ? 1 : 0);

  // Picture: uploaded image if there is one, otherwise the profile icon on a tinted tile
  card.style.setProperty("--card-color", accent);
  const img = card.getElementsByTagName("img")[0]; // DOM selection method 3: getElementsByTagName
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  if (photoFile) {
    photoUrl = URL.createObjectURL(photoFile);
    img.src = photoUrl;
    img.hidden = false;
  } else {
    photoUrl = null;
    img.hidden = true;
    img.removeAttribute("src");
  }

  // Caption
  const nameEl = document.getElementById("cardName");
  const subEl = document.getElementById("cardSub");
  if (shown === 0) {
    nameEl.hidden = false;
    nameEl.textContent = "Nothing to show yet";
    subEl.hidden = false;
    subEl.textContent = "Fill in at least one field.";
  } else {
    nameEl.hidden = !name;
    nameEl.textContent = name;
    subEl.hidden = true;
  }

  // Details: bio first, then personal info, then more about you
  cardBody.innerHTML = "";
  if (bio) {
    const section = makeSection("Bio");
    section.classList.add("bio-section");
    const p = document.createElement("p");
    p.className = "card-bio";
    p.textContent = bio;
    section.appendChild(p);
    cardBody.appendChild(section);
  }
  if (personalRows.length)
    cardBody.appendChild(makeSection("Personal info", personalRows));
  if (moreRows.length)
    cardBody.appendChild(makeSection("More about you", moreRows));

  // DOM selection method 4: getElementsByClassName
  const sectionCount = document.getElementsByClassName("card-section").length;
  document.getElementById("status").textContent =
    "Showing " +
    shown +
    " of " +
    TOTAL_FIELDS +
    " fields in " +
    sectionCount +
    " sections. Empty fields are left out.";
}

function clearAll() {
  form.reset();
  toggleOthers();
  updateFileName();
  confirmError.hidden = true;
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = null;
  const img = card.getElementsByTagName("img")[0];
  img.hidden = true;
  img.removeAttribute("src");
  card.style.setProperty("--card-color", DEFAULT_COLOR);
  const nameEl = document.getElementById("cardName");
  nameEl.hidden = false;
  nameEl.textContent = "Your card";
  const subEl = document.getElementById("cardSub");
  subEl.hidden = false;
  subEl.textContent = "Fill in the form, then press Show My Info.";
  cardBody.innerHTML = "";
  document.getElementById("status").textContent = "";
}

// Birthdays can't be in the future
const birthdayInput = document.getElementById("birthday");
const now = new Date();
birthdayInput.max =
  now.getFullYear() +
  "-" +
  String(now.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(now.getDate()).padStart(2, "0");
birthdayInput.addEventListener("input", autoFillAge);

document.getElementById("photo").addEventListener("change", updateFileName);
confirmBox.addEventListener("change", function () {
  if (confirmBox.checked) confirmError.hidden = true;
});
form.addEventListener("change", toggleOthers);
showBtn.addEventListener("click", showInfo);
clearBtn.addEventListener("click", clearAll);

// Pressing Enter in a field runs the same check instead of reloading the page
form.addEventListener("submit", function (event) {
  event.preventDefault();
  showInfo();
});
