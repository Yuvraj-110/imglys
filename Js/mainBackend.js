document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const res = await fetch("http://localhost:5000/api/profile/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log(data); 


    if (res.ok) {
      // Set username
      document.getElementById("navbar-username").textContent = data.name;

      // Set profile picture
      if (data.profilePicture) {
        document.getElementById("navbar-profile-pic").src = data.profilePicture;
      }

      // Update subscription status text and upgrade button visibility
      const currentPlan = data.plan || "Free";
const formattedPlan = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1).toLowerCase();
subStatusText.textContent = formattedPlan;

const plansToShowUpgrade = ["free", "pro"];
if (plansToShowUpgrade.includes(currentPlan.toLowerCase())) {
  upgradeMenuItem.style.display = "block";
} else {
  upgradeMenuItem.style.display = "none";
}

    }
  } catch (err) {
    console.error("Profile fetch failed", err);
  }
});

// document.addEventListener("DOMContentLoaded", () => {
//   const logoutBtn = document.getElementById("logoutBtn");

//   if (logoutBtn) {
//     logoutBtn.addEventListener("click", (e) => {
//       e.preventDefault();
//       showFeedbackModal(); // Do NOT remove token yet!
//     });
//   }
// });


document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userDropdown = document.querySelector(".user-dropdown");
  const loginMenuItem = document.getElementById("loginMenuItem");

  if (token) {
    // Logged in: show profile menu, hide login
    if (userDropdown) userDropdown.style.display = "block";
    if (loginMenuItem) loginMenuItem.style.display = "none";
  } else {
    // Not logged in: hide profile menu, show login
    if (userDropdown) userDropdown.style.display = "none";
    if (loginMenuItem) loginMenuItem.style.display = "block";
  }
});
