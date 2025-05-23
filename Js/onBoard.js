document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    // Redirect or show message if no token found
    window.location.href = "index.html?message=login_required";
    return;
  }

  const modal = document.getElementById("onboardingModal");
  const form = document.getElementById("onboardingForm");
  const agree = document.getElementById("agreeTOS");
  const submitBtn = document.getElementById("onboardingSubmit");
  const preview = document.getElementById("previewImage");

  // Disable submit initially if not agreed
  submitBtn.disabled = !agree.checked;

  agree.addEventListener("change", () => {
    submitBtn.disabled = !agree.checked;
  });

  // Fetch user data
  try {
    const res = await fetch("http://localhost:5000/api/profile/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
console.log("User profile data:", data);
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch profile data");
    }

    if (!data.onboarded) {
      modal.classList.remove("hidden");
      modal.classList.add("show");

      document.getElementById("onboardingName").value = data.name || "";
      document.getElementById("onboardingEmail").value = data.email || "";
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch("http://localhost:5000/api/profile/onboarding", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        modal.classList.remove("show");
        modal.classList.add("hidden");
        // Optionally mark onboarded in localStorage here if needed
      } else {
        alert(result.message || "Failed to save your info.");
      }
    } catch (error) {
      alert("Network or server error, please try again.");
      console.error("Onboarding submission error:", error);
    }
  });

  // Profile picture preview handler
  document.getElementById("profilePicture").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // Button group selection handler
  document.querySelectorAll(".button-group").forEach((group) => {
    const hiddenInput = group.nextElementSibling;
    group.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll("button").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        hiddenInput.value = btn.getAttribute("data-value");
      });
    });
  });
});
