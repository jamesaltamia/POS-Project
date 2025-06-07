// Third-party imports
import React, { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';

// Material-UI components
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl, 
  Grid,
  IconButton,
  InputLabel, 
  MenuItem, 
  Paper,
  Select, 
  Stack,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TablePagination,
  TableRow, 
  TextField, 
  Typography
} from '@mui/material';
import { Search, PictureAsPdf, FileDownload, Visibility as VisibilityIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Utils and API
import { formatCurrency } from '../utils/formatters';
import API from '../api/axios';

// Types
interface TransactionItem {
  id?: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  product_id?: number;
  created_at?: string;
  updated_at?: string;
}

interface Transaction {
  id: number;
  date: string;
  customer_name: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  status: 'completed' | 'refunded' | 'pending' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id?: number;
  receipt_number?: string;
}

interface Pagination {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

const ManagerTransactions: React.FC = () => {
  // State management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0
  });
  
  // UI State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Filters
  const [dateRange, setDateRange] = useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({ 
    start: subDays(new Date(), 7),
    end: new Date() 
  });

  // Handle date change for DatePicker
  const handleStartDateChange = (date: Date | null) => {
    setDateRange(prev => ({
      ...prev,
      start: date || undefined
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setDateRange(prev => ({
      ...prev,
      end: date || undefined
    }));
  };
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        per_page: pagination.perPage.toString(),
        ...(dateRange.start && { start_date: format(dateRange.start, 'yyyy-MM-dd') }),
        ...(dateRange.end && { end_date: format(dateRange.end, 'yyyy-MM-dd') }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentMethodFilter !== 'all' && { payment_method: paymentMethodFilter }),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await API.get(`/transactions?${params.toString()}`);
      
      setTransactions(response.data.data);
      setPagination({
        currentPage: response.data.current_page || 1,
        lastPage: response.data.last_page || 1,
        perPage: response.data.per_page || 10,
        total: response.data.total || 0,
      });
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, dateRange.start, dateRange.end, statusFilter, paymentMethodFilter, searchTerm]);

  // Handle view transaction details
  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  // Handle export to different formats
  const handleExport = async (exportFormat: 'pdf' | 'csv') => {
    try {
      const params = new URLSearchParams();
      
      if (dateRange.start) {
        params.append('start_date', format(dateRange.start, 'yyyy-MM-dd'));
      }
      if (dateRange.end) {
        params.append('end_date', format(dateRange.end, 'yyyy-MM-dd'));
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (paymentMethodFilter !== 'all') {
        params.append('payment_method', paymentMethodFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await API.get(`/transactions/export/${exportFormat}?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${format(new Date(), 'yyyyMMdd')}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Error exporting to ${exportFormat.toUpperCase()}:`, error);
      setError(`Failed to export to ${exportFormat.toUpperCase()}. Please try again.`);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  // Handle page change
  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage + 1 // Material-UI uses 0-based index
    }));
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination({
      ...pagination,
      perPage: parseInt(event.target.value, 10),
      currentPage: 1 // Reset to first page
    });
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchTransactions();
  }, [pagination.currentPage, pagination.perPage, searchTerm, statusFilter, paymentMethodFilter, dateRange]);

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Payment method options for filter
  const paymentMethodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'online', label: 'Online Payment' }
  ];

  // Handle search input change with debounce
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  // Handle payment method filter change
  const handlePaymentMethodChange = (event: any) => {
    setPaymentMethodFilter(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Transaction History</Typography>
      
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethodFilter}
                  onChange={handlePaymentMethodChange}
                  label="Payment Method"
                >
                  {paymentMethodOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={handleStartDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={dateRange.end}
                  onChange={handleEndDateChange}
                  minDate={dateRange.start}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdf />}
          onClick={() => handleExport('pdf')}
        >
          Export PDF
        </Button>
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={() => handleExport('csv')}
        >
          Export CSV
        </Button>
      </Box>

      {/* Transactions Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="error">{error}</Typography>
                    <Button onClick={fetchTransactions} sx={{ mt: 1 }}>Retry</Button>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.customer_name || 'Walk-in Customer'}</TableCell>
                    <TableCell>{transaction.items.length} items</TableCell>
                    <TableCell>{formatCurrency(transaction.total)}</TableCell>
                    <TableCell>{transaction.payment_method}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status} 
                        color={
                          transaction.status === 'completed' ? 'success' :
                          transaction.status === 'pending' ? 'warning' :
                          transaction.status === 'cancelled' ? 'error' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewDetails(transaction)}
                        title="View Details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.currentPage - 1}
          onPageChange={(e, newPage) => handlePageChange(e, newPage)}
          rowsPerPage={pagination.perPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Transaction Details Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth>
        {selectedTransaction && (
          <>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Transaction ID</Typography>
                    <Typography>{selectedTransaction.id}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Date</Typography>
                    <Typography>{formatDate(selectedTransaction.date)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Customer: {selectedTransaction.customer_name || 'Walk-in Customer'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Status</Typography>
                    <Chip 
                      label={selectedTransaction.status} 
                      color={
                        selectedTransaction.status === 'completed' ? 'success' :
                        selectedTransaction.status === 'pending' ? 'warning' :
                        selectedTransaction.status === 'cancelled' ? 'error' : 'default'
                      }
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mt: 2 }}>Items</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTransaction.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Stack spacing={1} sx={{ width: 300 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>{formatCurrency(selectedTransaction.subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Tax ({selectedTransaction.tax / selectedTransaction.subtotal * 100}%):</Typography>
                      <Typography>{formatCurrency(selectedTransaction.tax)}</Typography>
                    </Box>
                    {selectedTransaction.discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Discount:</Typography>
                        <Typography color="error">-{formatCurrency(selectedTransaction.discount)}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', pt: 1, mt: 1 }}>
                      <Typography variant="subtitle1">Total:</Typography>
                      <Typography variant="subtitle1">{formatCurrency(selectedTransaction.total)}</Typography>
                    </Box>
                  </Stack>
                </Box>

                {selectedTransaction.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Notes:</Typography>
                    <Typography>{selectedTransaction.notes}</Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  // Handle reprint receipt or other actions
                  setIsModalOpen(false);
                }}
              >
                Reprint Receipt
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ManagerTransactions;
