import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SnackbarAlert from '../components/SnackbarAlert';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface Product {
  id: number;
  name: string;
}

interface InventoryLog {
  id: number;
  product_id: number;
  user_id: number;
  change_type: string;
  quantity: number;
  reason: string;
  created_at: string;
  product?: Product;
}

const InventoryLogs: React.FC = () => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    product_id: '',
    change_type: 'add',
    quantity: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchLogs();
    fetchProducts();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await axios.get("/api/inventory-logs");
    setLogs(res.data);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const res = await axios.get('/api/products');
    setProducts(res.data);
  };

  const handleOpenDialog = () => {
    setForm({ product_id: '', change_type: 'add', quantity: '', reason: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name as string]: value }));
  };


  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post('/api/inventory-logs', {
        product_id: parseInt(form.product_id),
        change_type: form.change_type,
        quantity: parseInt(form.quantity),
        reason: form.reason,
      });
      setSnackbar({ open: true, message: 'Inventory adjustment saved!', severity: 'success' });
      setOpenDialog(false);
      fetchLogs();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save adjustment.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ color: 'mochaBrown.main' }}>
          Inventory Adjustment Logs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2, backgroundColor: 'mintGreen.main', '&:hover': { backgroundColor: 'mintGreen.dark' } }}
          onClick={handleOpenDialog}
        >
          New Adjustment
        </Button>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Change Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{log.product ? log.product.name : log.product_id}</TableCell>
                    <TableCell>{log.change_type}</TableCell>
                    <TableCell>{log.quantity}</TableCell>
                    <TableCell>{log.reason}</TableCell>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>New Inventory Adjustment</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel id="product-label">Product</InputLabel>
              <Select
                labelId="product-label"
                name="product_id"
                value={form.product_id}
                label="Product"
                onChange={handleSelectChange}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel id="change-type-label">Change Type</InputLabel>
              <Select
                labelId="change-type-label"
                name="change_type"
                value={form.change_type}
                label="Change Type"
                onChange={handleSelectChange}
              >
                <MenuItem value="add">Add</MenuItem>
                <MenuItem value="subtract">Subtract</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="quantity"
              label="Quantity"
              type="number"
              fullWidth
              variant="outlined"
              value={form.quantity}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="reason"
              label="Reason"
              type="text"
              fullWidth
              variant="outlined"
              value={form.reason}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </>
  );
};

export default InventoryLogs;
