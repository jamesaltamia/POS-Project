import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent
} from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import * as productApi from '../api/products';

const AddEditProduct: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    sku: '',
    barcode: '',
    cost_price: 0,
    selling_price: 0,
    low_stock_threshold: 10,
  });

  useEffect(() => {
    if (id) {
      // Edit mode - fetch product data
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const product = await productApi.getProduct(id);
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || 0,
            stock: product.stock || 0,
            category: product.category || '',
            sku: product.sku || '',
            barcode: product.barcode || '',
            cost_price: product.cost_price || 0,
            selling_price: product.selling_price || 0,
            low_stock_threshold: product.low_stock_threshold || 10,
          });
        } catch (err) {
          setError('Failed to load product');
          console.error('Error fetching product:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'cost_price' || name === 'selling_price' || name === 'low_stock_threshold'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (id) {
        // Update existing product
        await productApi.updateProduct(id, formData);
        showNotification('Product updated successfully', 'success');
      } else {
        // Create new product
        await productApi.createProduct(formData);
        showNotification('Product created successfully', 'success');
      }
      
      // Redirect back to products list
      navigate('/products');
      
    } catch (err) {
      console.error('Error saving product:', err);
      showNotification('Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {id ? 'Edit Product' : 'Add New Product'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                margin="normal"
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="clothing">Clothing</MenuItem>
                  <MenuItem value="food">Food</MenuItem>
                  <MenuItem value="beverages">Beverages</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </div>
            
            <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                margin="normal"
              />
              
              <TextField
                fullWidth
                type="number"
                label="Cost Price"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                inputProps={{ min: 0, step: '0.01' }}
                margin="normal"
              />
              
              <TextField
                fullWidth
                type="number"
                label="Selling Price"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleChange}
                inputProps={{ min: 0, step: '0.01' }}
                margin="normal"
              />
              
              <TextField
                fullWidth
                type="number"
                label="Initial Stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                inputProps={{ min: 0 }}
                margin="normal"
              />
              
              <TextField
                fullWidth
                type="number"
                label="Low Stock Threshold"
                name="low_stock_threshold"
                value={formData.low_stock_threshold}
                onChange={handleChange}
                inputProps={{ min: 0 }}
                margin="normal"
                helperText="Alert when stock is at or below this number"
              />
            </div>
          </div>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/products')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : (id ? 'Update' : 'Save')} Product
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddEditProduct;
