import React from "react";
import Card from "./Components/Card/Card"; // Assuming you have a Card component for individual product view

const Products = ({ products, onAdd, onRemove }) => {
  return (
    <div>
      <h1>All Products</h1>
      <div className="cards__container">
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map((product) => (
            <Card key={product.id} food={product} onAdd={onAdd} onRemove={onRemove} />
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
