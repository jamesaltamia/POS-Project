import React, { useEffect, useState } from 'react';
import api from '../api/axios'; // Assuming your axios instance is here
import { Box, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Alert, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddProductModal from '../components/products/AddProductModal';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  // Add other relevant product fields here, e.g., category, stock_quantity, supplier_id etc.
  // For now, keeping it simple.
  category?: { name: string }; // Example of a nested object
  stock?: number; // Changed from stock_quantity
  low_stock_threshold?: number;
}

const ManagerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products');
      // Adjusted to handle potential nested data structures or direct arrays
      const productsData = Array.isArray(response.data.data) 
        ? response.data.data 
        : Array.isArray(response.data) 
          ? response.data 
          : [];
      setProducts(productsData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load products.');
      setProducts([]); // Clear products on error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductAdded = () => {
    fetchProducts(); // Re-fetch products to update the list
  };



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading products...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="div">
          Product Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Product
        </Button>
      </Box>
      {products.length === 0 ? (
        <Typography>No products found.</Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }} aria-label="simple products table">
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }} align="right">Price</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }} align="right">Stock</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }} align="center">Status</TableCell>
                {/* Add more headers as needed */}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell component="th" scope="row">
                    {product.id}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell align="right">{product.price ? `$${Number(product.price).toFixed(2)}` : 'N/A'}</TableCell>
                  <TableCell>{product.category?.name || 'N/A'}</TableCell>
                  <TableCell align="right">{product.stock ?? 'N/A'}</TableCell>
                  <TableCell align="center">
                    {typeof product.stock === 'number' && typeof product.low_stock_threshold === 'number' ? (
                      product.stock <= product.low_stock_threshold ? (
                        <Chip label="Low Stock" color="error" size="small" />
                      ) : (
                        <Chip label="In Stock" color="success" size="small" />
                      )
                    ) : (
                      <Chip label="N/A" size="small" />
                    )}
                  </TableCell>
                  {/* Add more cells for other product data */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* TODO: Add buttons for Edit, Delete actions */}
      <AddProductModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleProductAdded} 
      />
    </Box>
  );
};

export default ManagerProducts;
