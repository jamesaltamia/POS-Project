import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField,
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  CircularProgress, 
  IconButton,
  Button,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { format } from 'date-fns';
import { Search, Print, PictureAsPdf, FileDownload } from '@mui/icons-material';

interface Transaction {
  id: string;
  date: Date;
  customer: string;
  items: number;
  total: number;
  paymentMethod: string;
  status: 'completed' | 'refunded' | 'pending';
}

const ManagerTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ 
    start: new Date(new Date().setDate(new Date().getDate() - 7)),
    end: new Date() 
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Mock data - replace with API call
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockTransactions: Transaction[] = [
          {
            id: 'TXN-1001',
            date: new Date('2023-05-15T14:30:00'),
            customer: 'Walk-in Customer',
            items: 3,
            total: 1250.75,
            paymentMethod: 'Cash',
            status: 'completed'
          },
          {
            id: 'TXN-1002',
            date: new Date('2023-05-15T15:45:00'),
            customer: 'John Smith',
            items: 5,
            total: 2870.50,
            paymentMethod: 'Credit Card',
            status: 'completed'
          },
          {
            id: 'TXN-1003',
            date: new Date('2023-05-16T10:15:00'),
            customer: 'Sarah Johnson',
            items: 2,
            total: 850.00,
            paymentMethod: 'GCash',
            status: 'refunded'
          },
          {
            id: 'TXN-1004',
            date: new Date('2023-05-16T16:20:00'),
            customer: 'Michael Brown',
            items: 1,
            total: 450.00,
            paymentMethod: 'Cash',
            status: 'completed'
          },
          {
            id: 'TXN-1005',
            date: new Date('2023-05-17T11:30:00'),
            customer: 'Walk-in Customer',
            items: 4,
            total: 1620.25,
            paymentMethod: 'Credit Card',
            status: 'pending'
          },
        ];
        
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions based on date range, status, and search term
  const filteredTransactions = transactions.filter(transaction => {
    const matchesDate = (!dateRange.start || transaction.date >= dateRange.start) && 
                       (!dateRange.end || transaction.date <= new Date(dateRange.end.getTime() + 86400000)); // Add 1 day to include end date
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    const matchesSearch = searchTerm === '' || 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesStatus && matchesSearch;
  });

  // Calculate summary
  const totalSales = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, transaction) => sum + transaction.total, 0);
    
  const totalTransactions = filteredTransactions.length;
  const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const handleDateRangeChange = (field: 'start' | 'end', event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setDateRange(prev => ({ ...prev, [field]: value ? new Date(value) : null }));
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting to PDF...');
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    console.log('Exporting to CSV...');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sales & Transactions
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<Print />} 
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PictureAsPdf />} 
            onClick={handleExportPDF}
            sx={{ mr: 1 }}
          >
            PDF
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<FileDownload />} 
            onClick={handleExportCSV}
          >
            CSV
          </Button>
        </Box>
      </Box>


      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sales
              </Typography>
              <Typography variant="h4" component="div">
                ₱{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {dateRange.start && dateRange.end 
                  ? `${format(dateRange.start, 'MMM d, yyyy')} - ${format(dateRange.end, 'MMM d, yyyy')}`
                  : 'All time'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h4" component="div">
                {totalTransactions}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {filteredTransactions.filter(t => t.status === 'completed').length} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Order Value
              </Typography>
              <Typography variant="h4" component="div">
                ₱{averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Per transaction
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={dateRange.start ? format(dateRange.start, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDateRangeChange('start', e)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={dateRange.end ? format(dateRange.end, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDateRangeChange('end', e)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
          </Grid>
        </Grid>
      </Paper>

      {/* Transactions Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }} elevation={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredTransactions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>No transactions found matching your criteria.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="transactions table">
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow hover key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>
                      {format(transaction.date, 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>{transaction.customer}</TableCell>
                    <TableCell align="right">{transaction.items}</TableCell>
                    <TableCell align="right">
                      ₱{transaction.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{transaction.paymentMethod}</TableCell>
                    <TableCell>
                      <Box 
                        component="span" 
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 4,
                          display: 'inline-block',
                          backgroundColor: transaction.status === 'completed' 
                            ? 'success.light' 
                            : transaction.status === 'pending'
                            ? 'warning.light'
                            : 'error.light',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}
                      >
                        {transaction.status}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => console.log('View details', transaction.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default ManagerTransactions;
