import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useReactToPrint } from 'react-to-print';
import CircularProgress from '@mui/material/CircularProgress';

import { 
  Add as AddIcon, 
  Remove as RemoveIcon, 
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Discount as DiscountIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatters';
import { getProducts } from '../api/products';
import { createTransaction } from '../api/transactions';

// Types
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

type DiscountType = 'student' | 'senior' | 'pwd' | null;

interface ReceiptData {
  orderNumber: string;
  date: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  change: number;
  customerName: string;
}

const CashierDashboard: React.FC = () => {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>(null);
  const [customDiscount, setCustomDiscount] = useState('');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : data?.data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // If item exists, increase quantity if stock allows
        if (existingItem.quantity < product.stock) {
          return prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prevCart;
      } else {
        // Add new item to cart if stock is available
        if (product.stock > 0) {
          return [...prevCart, { ...product, quantity: 1 }];
        }
        return prevCart;
      }
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const calculateDiscount = () => {
    if (!discountType) return 0;
    
    // Apply standard discount percentages
    const discountPercentages = {
      student: 0.10, // 10%
      senior: 0.20,  // 20%
      pwd: 0.20      // 20%
    };
    
    // Check if custom discount is provided
    if (customDiscount) {
      const customDiscountValue = parseFloat(customDiscount);
      if (!isNaN(customDiscountValue)) {
        // If custom discount is a percentage (0-100)
        if (customDiscountValue <= 100 && customDiscountValue >= 0) {
          return (subtotal * customDiscountValue) / 100;
        }
        // If custom discount is a fixed amount
        return Math.min(customDiscountValue, subtotal);
      }
      return 0;
    }
    
    // Apply standard discount if no custom discount
    return subtotal * discountPercentages[discountType];
  };
  
  const discount = calculateDiscount();
  const total = subtotal - discount;

  // Handle print receipt
  const handlePrint = useReactToPrint({
    onAfterPrint: () => {
      // Reset form after printing
      setCart([]);
      setCustomerName('');
      setCustomerEmail('');
      setDiscountType(null);
      setCustomDiscount('');
      setAmountPaid(0);
      setAmountPaidInput('');
      setShowReceipt(false);
    },
    contentRef: receiptRef,
  });

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    
    const paid = typeof amountPaid === 'string' ? parseFloat(amountPaid) || 0 : amountPaid;
    if (isNaN(amountPaid) || amountPaid <= 0) {
      alert('Amount paid is less than total amount');
      return;
    }

    if (amountPaid < total) {
      alert('Amount paid is less than total amount');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        customer_name: customerName,
        customer_email: customerEmail || null,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        tax: 0, // You might want to add tax calculation
        discount,
        total,
        amount_paid: amountPaid,
        change: Math.max(0, amountPaid - total),
        payment_method: 'cash', // Default to cash, can be made dynamic
        notes: discountType ? `Discount applied: ${discountType}` : '',
      };

      const response = await createTransaction(orderData);
      const newOrderNumber = response.data.id || `ORD-${Date.now()}`;
      
      // Set receipt data
      setReceiptData({
        orderNumber: newOrderNumber.toString(),
        date: new Date().toISOString(),
        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
        })),
        subtotal,
        discount,
        tax: 0,
        total,
        amountPaid: amountPaid,
        change: Math.max(0, amountPaid - total),
        customerName: customerName.trim(),
      });
      
      setOrderNumber(newOrderNumber);
      setShowReceipt(true);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close receipt dialog
  const handleCloseReceipt = () => {
    setShowReceipt(false);
    // Reset form
    setCart([]);
    setCustomerName('');
    setCustomerEmail('');
    setDiscountType(null);
    setCustomDiscount('');
    setAmountPaid(0);
    setAmountPaidInput('');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Loading products...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Point of Sale
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Product Selection */}
        <Box sx={{ flex: 2 }}>
          <Card>
            <CardContent>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                {filteredProducts.map((product) => (
                  <Paper 
                    key={product.id}
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      bgcolor: product.stock === 0 ? 'grey.100' : 'background.paper',
                      opacity: product.stock === 0 ? 0.7 : 1,
                    }}
                    onClick={() => product.stock > 0 && addToCart(product)}
                  >
                    <Box textAlign="center" width="100%">
                      <Typography variant="subtitle1" noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatCurrency(product.price)}
                      </Typography>
                      <Typography variant="caption" color={product.stock > 0 ? 'textSecondary' : 'error'}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        {/* Order Summary */}
        <Box sx={{ flex: 1, minWidth: { md: 350 } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              {/* Customer Info */}
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Customer Information
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Customer Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  margin="dense"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Email (Optional)"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  margin="dense"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              {/* Discounts */}
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Discounts
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['student', 'senior', 'pwd'].map((type) => (
                    <Button
                      key={type}
                      fullWidth
                      variant={discountType === type ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setDiscountType(discountType === type ? null : type as DiscountType)}
                      startIcon={<DiscountIcon />}
                      sx={{ flex: '1 1 calc(33.333% - 8px)', minWidth: '100px' }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </Box>
                
                {discountType && (
                  <TextField
                    fullWidth
                    size="small"
                    label="Custom Discount (amount or %)"
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(e.target.value)}
                    margin="dense"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DiscountIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </Box>
              
              {/* Cart Items */}
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Order Items
                </Typography>
                {cart.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" align="center" py={2}>
                    No items in cart
                  </Typography>
                ) : (
                  <Box>
                    {cart.map((item) => (
                      <Box key={item.id} mb={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2">
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {formatCurrency(item.price)} × {item.quantity}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <IconButton 
                              size="small" 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="body2" mx={1}>
                              {item.quantity}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => removeFromCart(item.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                      </Box>
                    ))}
                  </Box>
                )}
          </Box>
          
          {/* Order Totals */}
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Subtotal:</Typography>
              <Typography>{formatCurrency(subtotal)}</Typography>
            </Box>
            {discount > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Discount:</Typography>
                <Typography color="error">-{formatCurrency(discount)}</Typography>
              </Box>
            )}
            <Box display="flex" justifyContent="space-between" mb={1} borderTop="1px solid #eee" pt={1}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">{formatCurrency(total)}</Typography>
            </Box>

            {/* Amount Paid Input */}
            <TextField
              fullWidth
              label="Amount Paid"
              type="number"
              value={amountPaidInput}
              onChange={(e) => {
                setAmountPaidInput(e.target.value);
                const parsedValue = parseFloat(e.target.value);
                setAmountPaid(isNaN(parsedValue) ? 0 : parsedValue);
              }}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₱</InputAdornment>
                ),
              }}
              inputProps={{
                min: total,
                step: '0.01',
              }}
            />

            {/* Change Display */}
            {amountPaid && (
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>Change:</Typography>
                <Typography variant="subtitle1" color={total > amountPaid ? 'error' : 'textPrimary'}>
                {formatCurrency(Math.max(0, amountPaid - total))}
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmitOrder}
              disabled={cart.length === 0 || isSubmitting || amountPaid <= 0 || amountPaid < total}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <ReceiptIcon />}
            >
              {isSubmitting ? 'Processing...' : 'Complete Order'}
            </Button>
            
            {cart.length > 0 && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="small"
                onClick={() => setCart([])}
                sx={{ mt: 1 }}
              >
                Clear Order
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  </Box>
      
      {/* Receipt Dialog */}
      <Dialog 
        open={showReceipt} 
        onClose={handleCloseReceipt}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Order Receipt</span>
            <IconButton onClick={handleCloseReceipt} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {receiptData && (
            <div>
              {/* Printable Receipt */}
              <div style={{ display: 'none' }}>
                <div ref={receiptRef} style={{ padding: '20px', maxWidth: '300px', margin: '0 auto' }}>
                  <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <h2 style={{ margin: '5px 0' }}>Your Store Name</h2>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>123 Store Address</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>Tel: (123) 456-7890</p>
                  </div>
                  
                  <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                    <p style={{ margin: '5px 0' }}>Order #: {receiptData.orderNumber}</p>
                    <p style={{ margin: '5px 0' }}>{format(new Date(receiptData.date), 'MMM d, yyyy hh:mm a')}</p>
                    <p style={{ margin: '5px 0' }}>Customer: {receiptData.customerName}</p>
                  </div>
                  
                  <Divider style={{ margin: '10px 0' }} />
                  
                  <div style={{ marginBottom: '10px' }}>
                    {receiptData.items.map((item, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                        <div>
                          <div>{item.quantity}x {item.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{formatCurrency(item.price)} each</div>
                        </div>
                        <div>{formatCurrency(item.total)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <Divider style={{ margin: '10px 0' }} />
                  
                  <div style={{ marginBottom: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal:</span>
                      <span>{formatCurrency(receiptData.subtotal)}</span>
                    </div>
                    {receiptData.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Discount:</span>
                        <span>-{formatCurrency(receiptData.discount)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tax (0%):</span>
                      <span>{formatCurrency(receiptData.tax)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold' }}>
                      <span>Total:</span>
                      <span>{formatCurrency(receiptData.total)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                      <span>Amount Paid:</span>
                      <span>{formatCurrency(receiptData.amountPaid)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontWeight: 'bold' }}>
                      <span>Change:</span>
                      <span>{formatCurrency(receiptData.change)}</span>
                    </div>
                  </div>
                  
                  <Divider style={{ margin: '15px 0 10px' }} />
                  
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>Thank you for your purchase!</p>
                    <p style={{ margin: '5px 0', fontSize: '12px' }}>Please come again</p>
                  </div>
                </div>
              </div>
              
              {/* Receipt Preview */}
              <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: '20px', border: '1px solid #eee', padding: '15px', borderRadius: '4px' }}>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <h2 style={{ margin: '5px 0' }}>Your Store Name</h2>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>123 Store Address</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>Tel: (123) 456-7890</p>
                </div>
                
                <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                  <p style={{ margin: '5px 0' }}>Order #: {receiptData.orderNumber}</p>
                  <p style={{ margin: '5px 0' }}>{format(new Date(receiptData.date), 'MMM d, yyyy hh:mm a')}</p>
                  <p style={{ margin: '5px 0' }}>Customer: {receiptData.customerName}</p>
                </div>
                
                <Divider style={{ margin: '10px 0' }} />
                
                <div style={{ marginBottom: '10px' }}>
                  {receiptData.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                      <div>
                        <div>{item.quantity}x {item.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{formatCurrency(item.price)} each</div>
                      </div>
                      <div>{formatCurrency(item.total)}</div>
                    </div>
                  ))}
                </div>
                
                <Divider style={{ margin: '10px 0' }} />
                
                <div style={{ marginBottom: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>{formatCurrency(receiptData.subtotal)}</span>
                  </div>
                  {receiptData.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Discount:</span>
                      <span>-{formatCurrency(receiptData.discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tax (0%):</span>
                    <span>{formatCurrency(receiptData.tax)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold' }}>
                    <span>Total:</span>
                    <span>{formatCurrency(receiptData.total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <span>Amount Paid:</span>
                    <span>{formatCurrency(receiptData.amountPaid)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontWeight: 'bold' }}>
                    <span>Change:</span>
                    <span>{formatCurrency(receiptData.change)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between', padding: '16px 24px' }}>
          <Button onClick={handleCloseReceipt} color="primary">
            Close
          </Button>
          <Button 
            onClick={handlePrint} 
            color="primary"
            variant="contained"
            startIcon={<PrintIcon />}
          >
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CashierDashboard;
