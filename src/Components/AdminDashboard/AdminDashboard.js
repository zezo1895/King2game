import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [items, setItems] = useState([]); // To store the products fetched from the API
  const [newItem, setNewItem] = useState({ name: "", price: "", id: "", image: "" });
  const [imagePreview, setImagePreview] = useState("");
  const [editMode, setEditMode] = useState(false);

  // Fetch products on component mount



  axios.defaults.withCredentials = true;

  useEffect(() => {
    const send = async () => {
      try {
        const response = await axios.get("https://4703-197-58-61-40.ngrok-free.app/api/products");

        
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // const fetchProducts = async () => {
    //   try {
    //     const response = await axios.get("https://4703-197-58-61-40.ngrok-free.app/api/products");

    //    console.log(response)


    //   } catch (err) {
    //     console.error("Error fetching products:", err.message);
    //     alert("Error fetching products. Please try again.");
    //   }
    // };

    // fetchProducts();
    send()
  }, []);


  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  // Handle image file changes and upload to Cloudinary
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "default_preset");

      try {
        const response = await axios.post("https://api.cloudinary.com/v1_1/dy4gu2fk7/image/upload", formData);
        const imageUrl = response.data.secure_url;
        setImagePreview(imageUrl);
        setNewItem({ ...newItem, image: imageUrl });
      } catch (err) {
        console.error("Error uploading image:", err);
        alert("Image upload failed. Please try again.");
      }
    }
  };

  // Handle adding a new item
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.image) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    try {
      const response = await axios.post("https://4703-197-58-61-40.ngrok-free.app/api/products", {
        name: newItem.name,
        price: newItem.price,
        image: newItem.image,
      });

      if (response.status === 201) {
        // Add new product to the list and reset form
        setItems((prevItems) => [...prevItems, response.data]);
        setNewItem({ name: "", price: "", id: "", image: "" });
        setImagePreview("");
        alert("Product added successfully!");
      } else {
        console.error("Error adding product:", response.data);
        alert("Error adding product. Please try again.");
      }
    } catch (err) {
      console.error("Error adding product:", err.message);
      alert("Error adding product. Please try again.");
    }
  };

  // Handle editing an existing item
  const handleEditItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.image) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    try {
      const response = await axios.put(`https://4703-197-58-61-40.ngrok-free.app/api/products/${newItem.id}`, {
        name: newItem.name,
        price: newItem.price,
        image: newItem.image,
      });

      if (response.status === 200) {
        const updatedItems = items.map((item) =>
          item.id === newItem.id ? response.data : item
        );
        setItems(updatedItems); // Update the item in the list
        setNewItem({ name: "", price: "", id: "", image: "" });
        setImagePreview("");
        setEditMode(false);
        alert("Product updated successfully!");
      }
    } catch (err) {
      console.error("Error editing product:", err);
      alert("Error editing product. Please try again.");
    }
  };

  // Handle deleting a product
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`https://4703-197-58-61-40.ngrok-free.app/api/products/${id}`);
      if (response.status === 204) {
        setItems(items.filter((item) => item.id !== id)); // Remove deleted product from the list
        alert("Product deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Error deleting product. Please try again.");
    }
  };

  // Handle edit button click (set for editing mode)
  const handleEdit = (item) => {
    setNewItem({ ...item });
    setImagePreview(item.image);
    setEditMode(true);
  };

  return (
    <div className="admin-dashboard">
      <h1>Product Management</h1>
      <div className="form-container">
        <input
          type="text"
          name="name"
          value={newItem.name}
          onChange={handleInputChange}
          placeholder="Product Name"
        />
        <input
          type="number"
          name="price"
          value={newItem.price}
          onChange={handleInputChange}
          placeholder="Product Price"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imagePreview && <img src={imagePreview} alt="Preview" />}
        <button onClick={editMode ? handleEditItem : handleAddItem}>
          {editMode ? "Update Product" : "Add Product"}
        </button>
      </div>

      <div className="product-list">
        {Array.isArray(items) && items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="product-item">
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>Price: ${item.price}</p>
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          ))
        ) : (
          <p>No items found.</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
