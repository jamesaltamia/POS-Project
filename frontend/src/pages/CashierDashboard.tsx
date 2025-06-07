import React, { useState, useEffect } from 'react';
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

import { 
  Add as AddIcon, 
  Remove as RemoveIcon, 
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Discount as DiscountIcon,
  Search as SearchIcon
} from '@mui/icons-material';
// format function is not currently used, keeping it commented in case needed later
// import { format } from 'date-fns';
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

const CashierPage: React.FC = () => {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>(null);
  const [customDiscount, setCustomDiscount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim()) {
      alert('Please enter customer name');
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
        payment_method: 'cash', // Default to cash, can be made dynamic
        notes: discountType ? `Discount applied: ${discountType}` : '',
      };

      const response = await createTransaction(orderData);
      setOrderNumber(response.data.id || 'N/A');
      setOrderComplete(true);
      
      // Reset form
      setCart([]);
      setCustomerName('');
      setCustomerEmail('');
      setDiscountType(null);
      setCustomDiscount('');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close order complete dialog
  const handleCloseOrderComplete = () => {
    setOrderComplete(false);
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
              <Box>
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
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1">Total:</Typography>
                  <Typography variant="subtitle1">{formatCurrency(total)}</Typography>
                </Box>
                
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleSubmitOrder}
                  disabled={cart.length === 0 || isSubmitting}
                  startIcon={<ReceiptIcon />}
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
      
      {/* Order Complete Dialog */}
      <Dialog open={orderComplete} onClose={handleCloseOrderComplete}>
        <DialogTitle>Order Complete!</DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={2}>
            <ReceiptIcon color="success" sx={{ '&.MuiSvgIcon-root': { color: 'success.main' }, fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Thank you for your order!
            </Typography>
            <Typography variant="body1" gutterBottom>
              Order #{orderNumber} has been placed successfully.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {customerEmail && 'A receipt has been sent to your email.'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderComplete} color="primary" fullWidth>
            Start New Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CashierPage;
