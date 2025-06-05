import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { RootState } from '../store';
import {
  setFilters,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../store/slices/productSlice';
import * as productApi from '../api/products';

const categoryOptions = [
  { value: 'food', label: 'Food' },
  { value: 'toys', label: 'Toys' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'electronics', label: 'Electronics' },
];

const Products = () => {
  const dispatch = useDispatch();
  const { products, filters, isLoading } = useSelector(
    (state: RootState) => state.products
  );

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState({
    id: '',
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    image: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSearch = (search: string) => {
    dispatch(setFilters({ search }));
  };

  const handleSort = (sortBy: typeof filters.sortBy) => {
    dispatch(
      setFilters({
        sortBy,
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
      })
    );
  };

  const handleOpenAddModal = () => {
    setForm({ id: '', name: '', price: '', stock: '', category: '', description: '', image: '' });
    setFormError(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleOpenEditModal = (product: any) => {
    setForm({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      description: product.description || '',
      image: product.image || '',
    });
    setFormError(null);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        const newProduct = await productApi.createProduct({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
        });
        dispatch(addProduct(newProduct));
        setShowModal(false);
      } else {
        const updated = await productApi.updateProduct(form.id, {
          name: form.name,
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
          category: form.category,
          description: form.description,
          image: form.image,
        });
        dispatch(updateProduct(updated));
        setShowModal(false);
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await productApi.deleteProduct(deleteId);
      dispatch(deleteProduct(deleteId));
      setDeleteId(null);
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(filters.search.toLowerCase())
    )
    .sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      if (filters.sortBy === 'name') {
        return a.name.localeCompare(b.name) * order;
      }
      if (filters.sortBy === 'price') {
        return (a.price - b.price) * order;
      }
      if (filters.sortBy === 'stock') {
        return (a.stock - b.stock) * order;
      }
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ) * order;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <button
          className="btn"
          onClick={handleOpenAddModal}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Product' : 'Edit Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Product Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                name="price"
                type="number"
                step="0.01"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                name="stock"
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Category</option>
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows={2}
              />
              <input
                name="image"
                type="text"
                placeholder="Image URL (optional)"
                value={form.image}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
                disabled={submitting}
              >
                {submitting ? (modalMode === 'add' ? 'Adding...' : 'Saving...') : (modalMode === 'add' ? 'Add Product' : 'Save Changes')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <h2 className="text-xl font-bold mb-4">Delete Product</h2>
            <p className="mb-4">Are you sure you want to delete this product?</p>
            {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <select
          value={filters.category}
          onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
          className="input"
        >
          <option value="">All Categories</option>
          {categoryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Products table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('price')}
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('stock')}
              >
                Stock
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm ${
                        product.stock > 10
                          ? 'text-green-600'
                          : product.stock > 0
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {product.stock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      onClick={() => handleOpenEditModal(product)}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => setDeleteId(product.id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products; 