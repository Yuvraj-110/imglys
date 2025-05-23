document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const gallery = document.getElementById("collectionGallery");
  const emptyMessage = document.getElementById("emptyMessage");

  if (!token) {
    gallery.innerHTML = "<p>Please login to view your collections.</p>";
    return;
  }

  try {
    const res = await fetch("/api/collections", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok || !data.success || !Array.isArray(data.collections) || data.collections.length === 0) {
      gallery.classList.add("hidden");
      emptyMessage.classList.remove("hidden");
      return;
    }

    emptyMessage.classList.add("hidden");
    renderCollections(data.collections);
  } catch (err) {
    console.error("Error loading collections:", err);
    gallery.innerHTML = "<p>⚠️ Failed to load your collections. Please try again.</p>";
  }
});

function renderCollections(collections) {
  const gallery = document.getElementById("collectionGallery");
  gallery.innerHTML = "";

  collections.forEach((collection) => {
    const container = document.createElement("div");
    container.classList.add("collection-box");

    // Editable Title
    const titleWrapper = document.createElement("div");
    titleWrapper.classList.add("collection-title-editable");

    const title = document.createElement("h2");
    title.contentEditable = true;
    title.spellcheck = false;
    title.classList.add("editable-title");
    title.textContent = collection.title;

    title.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        title.blur();
      }
    });

    title.addEventListener("blur", async () => {
      const newTitle = title.textContent.trim();
      if (newTitle && newTitle !== collection.title) {
        const success = await renameCollection(collection._id, newTitle);
        if (success) {
          Toastify({ text: "✅ Renamed", duration: 2000 }).showToast();
        } else {
          Toastify({ text: "❌ Rename failed", duration: 2000 }).showToast();
          title.textContent = collection.title; // rollback if fail
        }
      } else {
        title.textContent = collection.title; // reset if no change
      }
    });

    titleWrapper.appendChild(title);
    container.appendChild(titleWrapper);

    // Action Buttons
    const actions = document.createElement("div");
    actions.classList.add("collection-actions");

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Delete`;
    deleteBtn.addEventListener("click", () => deleteCollection(collection._id));
    actions.appendChild(deleteBtn);

    const downloadBtn = document.createElement("button");
    downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> Download`;
    downloadBtn.addEventListener("click", () => downloadCollectionAsZip(collection));
    actions.appendChild(downloadBtn);

    container.appendChild(actions);

    // Media Grid
    const mediaGrid = document.createElement("div");
    mediaGrid.classList.add("media-items");

    (collection.items || []).forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("media-item");

      if (item.type === "image" || item.type === "gif") {
        const img = document.createElement("img");
        img.src = item.url;
        img.alt = "media";
        itemDiv.appendChild(img);
      } else if (item.type === "video") {
        const video = document.createElement("video");
        video.src = item.url;
        video.controls = true;
        video.muted = true;
        itemDiv.appendChild(video);
      }

      const delItemBtn = document.createElement("button");
      delItemBtn.classList.add("item-delete-btn");
      delItemBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
      delItemBtn.addEventListener("click", () =>
        deleteItemFromCollection(collection._id, item._id)
      );
      itemDiv.appendChild(delItemBtn);

      mediaGrid.appendChild(itemDiv);
    });

    container.appendChild(mediaGrid);
    gallery.appendChild(container);
  });
}

async function renameCollection(collectionId, newTitle) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/api/collections/${collectionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTitle }),
    });

    const data = await res.json();
    return res.ok && data.success;
  } catch (err) {
    console.error("Rename failed:", err);
    return false;
  }
}

async function deleteCollection(collectionId) {
  if (!confirm("Delete this collection?")) return;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`/api/collections/${collectionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (data.success) {
      Toastify({ text: "Collection deleted", duration: 2000 }).showToast();
      setTimeout(() => location.reload(), 1500);
    } else throw new Error(data.message);
  } catch (err) {
    Toastify({ text: "Delete failed", duration: 3000 }).showToast();
  }
}

async function deleteItemFromCollection(collectionId, itemId) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/api/collections/${collectionId}/item/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (data.success) {
      Toastify({ text: "🗑️ Item deleted", duration: 2000 }).showToast();
      setTimeout(() => location.reload(), 1000);
    } else {
      Toastify({ text: data.message || "Failed to delete", duration: 3000 }).showToast();
    }
  } catch (err) {
    console.error("Delete error:", err);
    Toastify({ text: "Failed to delete item", duration: 3000 }).showToast();
  }
}

async function downloadCollectionAsZip(collection) {
  try {
    const zip = new JSZip();
    const folder = zip.folder(collection.title || "MyCollection");

    for (let item of collection.items) {
      const res = await fetch(item.url);
      const blob = await res.blob();
      const ext = item.type === "video" ? ".mp4" : item.type === "gif" ? ".gif" : ".jpg";
      folder.file(`${Date.now()}${ext}`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `${collection.title}.zip`;
    a.click();
  } catch (err) {
    Toastify({ text: "ZIP download failed", duration: 3000 }).showToast();
  }
}
