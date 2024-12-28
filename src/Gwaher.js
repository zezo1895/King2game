import React from "react";

const Gwaher = ({ products, onAdd, onRemove }) => {
  return (
    <div>
      <h1>Gwaher Page</h1>
      <div className="cards__container">
        {products.length === 0 ? (
          <p>No products available for Gwaher page</p>
        ) : (
          products.map((product) => (
            <div key={product.id}>
              <img src={product.Image} alt={product.title} width="100" />
              <h4>{product.title}</h4>
              <p>Price: ${product.price}</p>
              <button onClick={() => onAdd(product)}>Add to Cart</button>
              <button onClick={() => onRemove(product)}>Remove from Cart</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Gwaher;
