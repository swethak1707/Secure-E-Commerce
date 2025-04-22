// src/components/admin/ProductManagement.jsx
import React, { useEffect, useState } from 'react';
import { useShop } from '../../contexts/ShopContext';
import { PencilIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../LoadingSpinner';

const ProductManagement = () => {
  const { products, loading, getProducts, increaseProductStock, decreaseProductStock, deleteProduct } = useShop();
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    getProducts();
  }, []);

  const handleDelete = (productId) => {
    if (confirmDelete === productId) {
      deleteProduct(productId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(productId);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Product Management
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt={product.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {product.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{product.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">${product.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => decreaseProductStock(product.id)}
                      disabled={product.stock <= 0}
                      className={`p-1 rounded ${
                        product.stock <= 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900'
                      }`}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    
                    <span className={`text-sm font-medium ${
                      product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {product.stock}
                    </span>
                    
                    <button
                      onClick={() => increaseProductStock(product.id)}
                      className="p-1 rounded text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 rounded text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(product.id)}
                      className={`p-1 rounded ${
                        confirmDelete === product.id 
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' 
                          : 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900'
                      }`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;