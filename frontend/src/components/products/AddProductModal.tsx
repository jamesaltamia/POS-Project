import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Typography
} from '@mui/material';

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: { name: string; description: string; price: number; stock: number }) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              required
              margin="normal"
              inputProps={{ min: 0, step: '1' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="contained">
            Save Product
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddProductModal;