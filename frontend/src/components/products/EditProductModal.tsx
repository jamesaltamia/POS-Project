import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Box,
  Typography
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
  stock: number;
  low_stock_threshold: number;
  barcode?: string;
}

interface Product extends ProductData {
  id: number;
  created_at?: string;
  updated_at?: string;
  category?: { id: number; name: string };
}

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (productData: ProductData) => Promise<{ success: boolean; error?: string }> | void;
  product: Product | null;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ 
  open, 
  onClose, 
  onSave,
  product 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: number;
    category_id: number;
    stock: number;
    low_stock_threshold: number;
    barcode: string;
  }>({
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    stock: 0,
    low_stock_threshold: 0,
    barcode: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category_id: product.category_id || 0,
        stock: product.stock,
        low_stock_threshold: product.low_stock_threshold || 0,
        barcode: product.barcode || ''
      });
    }
  }, [product]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: 
          name === 'price' || 
          name === 'stock' || 
          name === 'low_stock_threshold' || 
          name === 'category_id' 
            ? Number(value) || 0 
            : String(value || '')
      }));
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!product) return;
      
      // Ensure all required fields are present
      const productData: ProductData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price) || 0,
        category_id: Number(formData.category_id) || 0,
        stock: Number(formData.stock) || 0,
        low_stock_threshold: Number(formData.low_stock_threshold) || 5,
        barcode: formData.barcode.trim() || undefined
      };
      
      // Validate required fields
      if (!productData.name) {
        throw new Error('Product name is required');
      }
      if (productData.price <= 0) {
        throw new Error('Price must be greater than 0');
      }
      if (productData.category_id <= 0) {
        throw new Error('Please select a category');
      }
      
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
      <DialogTitle>Edit Product</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={3}
            id="description"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              margin="normal"
              required
              type="number"
              fullWidth
              id="price"
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              inputProps={{ min: 0, step: '0.01' }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category_id"
                name="category_id"
                value={formData.category_id || ''}
                label="Category"
                onChange={handleSelectChange}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              margin="normal"
              required
              type="number"
              fullWidth
              id="stock"
              label="Stock Quantity"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
            
            <TextField
              margin="normal"
              type="number"
              fullWidth
              id="low_stock_threshold"
              label="Low Stock Threshold"
              name="low_stock_threshold"
              value={formData.low_stock_threshold}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              helperText="Alert when stock is at or below this level"
            />
          </Box>
          
          <TextField
            margin="normal"
            fullWidth
            id="barcode"
            label="Barcode (Optional)"
            name="barcode"
            value={formData.barcode || ''}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProductModal;
