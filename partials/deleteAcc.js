document.getElementById("deleteAccountBtn")?.addEventListener("click", async (e) => {
  e.preventDefault();

  const confirmDelete = confirm("⚠️ Are you sure you want to permanently delete your account?");
  if (!confirmDelete) return;

  const token = localStorage.getItem("token");
  if (!token) {
    showToast("You're not logged in.", "error");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/delete-account", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      showToast("✅ Your account has been deleted.", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      showToast(data.message || "❌ Failed to delete account.", "error");
    }

  } catch (err) {
    console.error("Delete error:", err);
    showToast("❌ An error occurred while deleting your account.", "error");
  }
});


function showToast(message, type = "info") {
  const bgColor = {
    success: "linear-gradient(to right, #00b09b, #96c93d)",
    error: "linear-gradient(to right, #e53935, #e35d5b)",
    info: "linear-gradient(to right, #2196f3, #6dd5ed)"
  };

  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: bgColor[type] || bgColor.info,
    stopOnFocus: true,
  }).showToast();
}
