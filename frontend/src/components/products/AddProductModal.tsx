import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import api from '../../api/axios';

interface Category {
  id: number;
  name: string;
}

export interface ProductData {
  name: string; 
  description: string; 
  price: number; 
  category_id: number;
  stock_quantity: number;  // Changed from 'stock' to 'stock_quantity' to match backend
  stock?: number;         // Keep for backward compatibility
  low_stock_threshold: number;
  barcode?: string | null;
}

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (product: ProductData) => Promise<{ success: boolean; error?: string }> | void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ open, onClose, onSave }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    stock_quantity: 0,  // Changed from 'stock' to 'stock_quantity'
    low_stock_threshold: 5,
    barcode: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const response = await api.get('/categories');
        console.log('Categories response:', response.data);
        const categoriesData = response.data.data || response.data;
        if (!Array.isArray(categoriesData)) {
          console.error('Unexpected categories format:', response.data);
          throw new Error('Invalid categories data format');
        }
        setCategories(categoriesData);
        console.log('Categories loaded:', categoriesData);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load categories';
        console.error('Error fetching categories:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      console.log('Modal opened, fetching categories...');
      fetchCategories();
    } else {
      console.log('Modal closed, resetting categories');
      setCategories([]);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }> | { target: { name?: string; value: unknown } }) => {
    const { name, value } = e.target || {};
    const fieldName = name || '';
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: 
        fieldName === 'price' || 
        fieldName === 'low_stock_threshold' ||
        fieldName === 'category_id' 
          ? Number(value) || 0 
          : value
    }));
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      stock_quantity: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    
    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    
    if (formData.stock_quantity < 0) {
      setError('Stock cannot be negative');
      return;
    }
    
    if (!formData.category_id) {
      setError('Please select a category');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Prepare the product data with correct field names
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category_id: Number(formData.category_id),
        stock_quantity: Number(formData.stock_quantity),  
        low_stock_threshold: Number(formData.low_stock_threshold) || 5,
        barcode: formData.barcode.trim() || null
      };
      
      console.log('Submitting product:', productData);
      
      if (onSave) {
        const result = await onSave(productData);
        if (result?.success) {
          onClose();
        } else if (result?.error) {
          setError(result.error);
        }
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Product</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
            />
          </Box>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Barcode (Optional)"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              margin="normal"
            />
          </Box>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              margin="normal"
            />
          </Box>
          <Box display="flex" gap={2} mb={2}>
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
              margin="normal"
              inputProps={{ min: 0, step: '0.01' }}
            />
            <TextField
              fullWidth
              label="Stock"
              name="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={handleStockChange}
              required
              margin="normal"
              inputProps={{ min: 0, step: '1' }}
            />
          </Box>
          <Box display="flex" gap={2} mb={2}>
            <TextField
              fullWidth
              label="Low Stock Threshold"
              name="low_stock_threshold"
              type="number"
              value={formData.low_stock_threshold}
              onChange={handleChange}
              required
              margin="normal"
              inputProps={{ min: 0, step: '1' }}
            />
            <FormControl fullWidth margin="normal" error={!formData.category_id}>
              <InputLabel id="category-label">Category *</InputLabel>
              <Select
                labelId="category-label"
                name="category_id"
                value={formData.category_id || ''}
                onChange={(e) => {
                  console.log('Category selected:', e.target.value);
                  handleChange({ 
                    target: { 
                      name: 'category_id', 
                      value: e.target.value 
                    } 
                  });
                }}
                required
                label="Category *"
                disabled={loading}
              >
                <MenuItem value="" disabled>
                  <em>Select a category</em>
                </MenuItem>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {loading ? 'Loading categories...' : 'No categories available'}
                  </MenuItem>
                )}
              </Select>
              <FormHelperText>
                {!formData.category_id ? 'Please select a category' : ''}
                {error && <span style={{ color: 'red' }}>{error}</span>}
              </FormHelperText>
            </FormControl>
          </Box>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            color="primary" 
            variant="contained"
            disabled={loading || formData.category_id === 0}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddProductModal;