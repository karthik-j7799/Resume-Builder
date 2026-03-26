let eduCount = 1;
let expCount = 1;
let projCount = 1;

// Add Education
function addEducation() {
  const list = document.getElementById("educationList");
  const div = document.createElement("div");
  div.className = "entry";
  div.id = `edu_${eduCount}`;
  div.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">✕ Remove</button>
        <div class="grid-2">
            <input type="text" placeholder="Institution Name" class="edu_institution">
            <input type="text" placeholder="Location (e.g. Kollam, Kerala)" class="edu_location">
            <input type="text" placeholder="Degree" class="edu_degree">
            <input type="text" placeholder="Start Date (e.g. Aug. 2021)" class="edu_start">
            <input type="text" placeholder="End Date (e.g. Sept 2023)" class="edu_end">
        </div>`;
  list.appendChild(div);
  eduCount++;
}

// Add Experience
function addExperience() {
  const list = document.getElementById("experienceList");
  const div = document.createElement("div");
  div.className = "entry";
  div.id = `exp_${expCount}`;
  div.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">✕ Remove</button>
        <div class="grid-2">
            <input type="text" placeholder="Job Title" class="exp_title">
            <input type="text" placeholder="Company Name" class="exp_company">
            <input type="text" placeholder="Location" class="exp_location">
            <input type="text" placeholder="Start Date (e.g. June 2024)" class="exp_start">
            <input type="text" placeholder="End Date (e.g. Present)" class="exp_end">
        </div>
        <textarea placeholder="Bullet points (one per line)" class="exp_bullets" rows="4"></textarea>`;
  list.appendChild(div);
  expCount++;
}

// Add Project
function addProject() {
  const list = document.getElementById("projectsList");
  const div = document.createElement("div");
  div.className = "entry";
  div.id = `proj_${projCount}`;
  div.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">✕ Remove</button>
        <div class="grid-2">
            <input type="text" placeholder="Project Name" class="proj_name">
            <input type="text" placeholder="Tech Stack (e.g. React, Node.js, MongoDB)" class="proj_tech">
            <input type="text" placeholder="Date (e.g. Jan 2024 -- Present)" class="proj_date">
        </div>
        <textarea placeholder="Bullet points (one per line)" class="proj_bullets" rows="4"></textarea>`;
  list.appendChild(div);
  projCount++;
}

// Collect all form data
function collectFormData() {
  // Personal info
  const data = {
    full_name: document.getElementById("full_name").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    linkedin: document.getElementById("linkedin").value,
    github: document.getElementById("github").value,
    education: [],
    experience: [],
    projects: [],
    skills: {
      languages: document.getElementById("languages").value,
      frameworks: document.getElementById("frameworks").value,
      tools: document.getElementById("tools").value,
      libraries: document.getElementById("libraries").value,
    },
  };

  // Education
  document.querySelectorAll("#educationList .entry").forEach((entry) => {
    data.education.push({
      institution: entry.querySelector(".edu_institution").value,
      location: entry.querySelector(".edu_location").value,
      degree: entry.querySelector(".edu_degree").value,
      start_date: entry.querySelector(".edu_start").value,
      end_date: entry.querySelector(".edu_end").value,
    });
  });

  // Experience
  document.querySelectorAll("#experienceList .entry").forEach((entry) => {
    const bullets = entry
      .querySelector(".exp_bullets")
      .value.split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);
    data.experience.push({
      title: entry.querySelector(".exp_title").value,
      company: entry.querySelector(".exp_company").value,
      location: entry.querySelector(".exp_location").value,
      start_date: entry.querySelector(".exp_start").value,
      end_date: entry.querySelector(".exp_end").value,
      bullets: bullets,
    });
  });

  // Projects
  document.querySelectorAll("#projectsList .entry").forEach((entry) => {
    const bullets = entry
      .querySelector(".proj_bullets")
      .value.split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);
    data.projects.push({
      name: entry.querySelector(".proj_name").value,
      tech_stack: entry.querySelector(".proj_tech").value,
      date: entry.querySelector(".proj_date").value,
      bullets: bullets,
    });
  });

  return data;
}

// Form submit
document
  .getElementById("resumeForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const status = document.getElementById("status");
    status.className = "status loading";
    status.textContent = "Generating your resume...";
    status.classList.remove("hidden");

    const data = collectFormData();

    try {
      const response = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume.pdf";
        a.click();
        window.URL.revokeObjectURL(url);

        status.className = "status success";
        status.textContent = "✅ Resume downloaded successfully!";
      } else {
        const err = await response.json();
        status.className = "status error";
        status.textContent =
          "❌ Error: " + (err.error || "Something went wrong");
      }
    } catch (err) {
      status.className = "status error";
      status.textContent = "❌ Failed to connect to server.";
    }
  });
