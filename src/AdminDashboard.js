import { useState } from "react";
import axios from "axios";

const AdminDashboard = ({ setProducts }) => {
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: 0,
    image: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.price || !newProduct.image) {
      alert("All fields are required!");
      return;
    }

    try {
      // POST request without 'page' field
      const response = await axios.post("https://f385-197-42-61-182.ngrok-free.app/api/products", newProduct);

      if (response.status === 201) {
        // Adding the new product to the products list
        setProducts((prev) => [...prev, response.data]);
        // Reset the form after adding the product
        setNewProduct({ title: "", price: 0, image: "" });
      } else {
        alert("Failed to add product.");
      }
    } catch (err) {
      console.error("Error adding product:", err);
      alert("An error occurred while adding the product.");
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <h3>Add Product</h3>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={newProduct.title}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={newProduct.price}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="image"
        placeholder="Image URL"
        value={newProduct.image}
        onChange={handleInputChange}
      />
      <button onClick={handleAddProduct}>Add Product</button>
    </div>
  );
};

export default AdminDashboard;
