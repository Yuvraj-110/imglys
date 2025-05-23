// controllers/collectionController.js

const Collection = require('../models/Collection');

// Get all collections of a user
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user.id });
    res.json({ success: true, collections });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching collections' });
  }
};

// Add media to a collection (create if doesn't exist)
exports.addToCollection = async (req, res) => {
  const { title, url, type } = req.body;

  if (!title || !url || !type) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    let collection = await Collection.findOne({ user: req.user.id, title });

    if (!collection) {
      // Create new collection
      collection = new Collection({
        user: req.user.id,
        title,
        items: [{ url, type }]
      });
    } else {
      // Check if media already exists (prevent duplicate)
      const alreadyExists = collection.items.some(item => item.url === url);
      if (alreadyExists) {
        return res.status(409).json({ success: false, message: "Media already in collection" });
      }

      collection.items.push({ url, type });
    }

    await collection.save();
    res.status(200).json({ success: true, message: "Media added to collection", collection });

  } catch (err) {
    console.error("Add to collection error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// controllers/collectionController.js
// Delete media item from a collection
exports.deleteFromCollection = async (req, res) => {
  const { collectionId, itemId } = req.params;

  try {
    const collection = await Collection.findOne({ _id: collectionId, user: req.user.id });

    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }

    const itemIndex = collection.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in collection" });
    }

    collection.items.splice(itemIndex, 1);
    await collection.save();

    res.status(200).json({ success: true, message: "Item removed from collection" });

  } catch (err) {
    console.error("Delete item error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Rename a collection
exports.renameCollection = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });

    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.collectionId, user: req.user.id },
      { title },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }

    res.json({ success: true, message: "Collection renamed", collection });
  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Delete entire collection
exports.deleteCollection = async (req, res) => {
  const { collectionId } = req.params;

  try {
    await Collection.deleteOne({ _id: collectionId, user: req.user.id });
    res.status(200).json({ success: true, message: "Collection deleted" });

  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete collection" });
  }
};
