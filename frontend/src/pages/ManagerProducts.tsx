import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  Alert, 
  Chip, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import AddProductModal, { type ProductData } from '../components/products/AddProductModal';
import EditProductModal from '../components/products/EditProductModal';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category?: { id: number; name: string };
  stock: number;
  low_stock_threshold: number;
  barcode?: string;
  created_at?: string;
  updated_at?: string;
}

const ManagerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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

    const handleProductAdded = async (productData: ProductData) => {
    try {
      await api.post('/products', productData);
      fetchProducts(); // Re-fetch products to update the list
      return { success: true };
    } catch (error: any) {
      console.error('Error adding product:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add product' 
      };
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      setIsDeleting(true);
      setDeleteError('');
      
      await api.delete(`/products/${productToDelete}`);
      
      // Update the products list by removing the deleted product
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productToDelete)
      );
      
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
    setDeleteError('');
  };

  const handleEditSave = async (productData: any) => {
    if (!editingProduct) return { success: false, error: 'No product selected' };
    
    try {
      await api.put(`/products/${editingProduct.id}`, productData);
      fetchProducts(); // Refresh the products list
      setEditingProduct(null);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating product:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update product' 
      };
    }
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
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }} align="right">Actions</TableCell>
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
                    {typeof product.stock === 'number' ? (
                      product.stock < 20 ? (
                        <Chip label="Low Stock" color="error" size="small" />
                      ) : (
                        <Chip label="In Stock" color="success" size="small" />
                      )
                    ) : (
                      <Chip label="N/A" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(product);
                        }}
                        aria-label="edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(product.id);
                        }}
                        aria-label="delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
<AddProductModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={async (productData: ProductData) => {
          const result = await handleProductAdded(productData);
          if (result.success) {
            setIsAddModalOpen(false);
          }
          return result;
        }}
      />
      
{editingProduct && (
        <EditProductModal
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={async (productData) => {
            const result = await handleEditSave(productData);
            if (result?.success) {
              setEditingProduct(null);
            }
            return result;
          }}
          product={editingProduct as any} // Type assertion to handle the category_id difference
        />
      )}
      
      <Dialog
        open={deleteDialogOpen}
        onClose={isDeleting ? undefined : handleDeleteCancel}
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>
          )}
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={isDeleting}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerProducts;
