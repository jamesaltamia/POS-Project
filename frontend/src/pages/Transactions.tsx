import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import PrintIcon from "@mui/icons-material/Print";
import { styled } from "@mui/material/styles";
import SnackbarAlert from "../components/SnackbarAlert";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const availableProducts: Product[] = [
  { id: "p001", name: "Espresso Blend Coffee (250g)", price: 15.0, stock: 100 },
  { id: "p002", name: "Ceramic Coffee Mug", price: 10.0, stock: 150 },
  { id: "p003", name: "Artisan Chocolate Bar", price: 5.0, stock: 80 },
  { id: "p004", name: "French Press (350ml)", price: 35.0, stock: 50 },
  { id: "p005", name: "Travel Tumbler", price: 20.0, stock: 120 },
];

const PaymentTransaction: React.FC = () => {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [discountPercentage, setDiscountPercentage] = React.useState(0);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [receiptContent, setReceiptContent] = React.useState("");
  const [openReceiptDialog, setOpenReceiptDialog] = React.useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const filteredProducts = availableProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(
      cart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discountPercentage) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount();
  };

  const handleProcessPayment = () => {
    const total = calculateTotal();
    const amountPaid = parseFloat(paymentAmount);

    if (isNaN(amountPaid) || amountPaid < total) {
      alert("Payment amount is insufficient or invalid!");
      return;
    }

    const change = amountPaid - total;
    generateReceipt(total, amountPaid, change);
    setOpenReceiptDialog(true);
    setCart([]); // Clear cart after successful transaction
    setPaymentAmount("");
    setDiscountPercentage(0);
    setSnackbar({ open: true, message: "Transaction saved successfully!", severity: "success" });
  };

  const generateReceipt = (
    total: number,
    amountPaid: number,
    change: number
  ) => {
    let receipt = `
      ===================================
             POS System Receipt
      ===================================
      Date: ${new Date().toLocaleDateString()}
      Time: ${new Date().toLocaleTimeString()}
      -----------------------------------
      Items:
    `;
    cart.forEach((item) => {
      receipt += `\n${item.name} x ${item.quantity} @ ₱${item.price.toFixed(
        2
      )} = ₱${(item.price * item.quantity).toFixed(2)}`;
    });
    receipt += `
      -----------------------------------
      Subtotal:   ₱${calculateSubtotal().toFixed(2)}
      Discount (${discountPercentage}%): -₱${calculateDiscountAmount().toFixed(
      2
    )}
      Total:      ₱${total.toFixed(2)}
      Amount Paid:₱${amountPaid.toFixed(2)}
      Change:     ₱${change.toFixed(2)}
      ===================================
      Thank you for your purchase!
      ===================================
    `;
    setReceiptContent(receipt);
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open("", "", "height=600,width=400");
    if (printWindow) {
      printWindow.document.write("<pre>" + receiptContent + "</pre>");
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: "mochaBrown.main" }}>
        Payment Transaction
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          "& > *": { flex: "1 1 400px", minWidth: "400px" },
        }}
      >
        <Paper
          elevation={3}
          sx={{ padding: 3, borderRadius: "12px", height: "100%" }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "mochaBrown.main" }}
          >
            Products
          </Typography>
          <TextField
            label="Search Products"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Add</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">
                        ₱{product.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => addToCart(product)}
                          sx={{ color: "mintGreen.main" }}
                        >
                          <AddShoppingCartIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>

        <Paper
          elevation={3}
          sx={{ padding: 3, borderRadius: "12px", height: "100%" }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "mochaBrown.main" }}
          >
            Cart
          </Typography>
          <TableContainer
            sx={{ marginBottom: 2, maxHeight: 250, overflowY: "auto" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">
                      ₱{item.price.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="secondary"
                        onClick={() => removeFromCart(item.id)}
                        sx={{ color: "purrPink.main" }}
                      >
                        <RemoveShoppingCartIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" sx={{ color: "mochaBrown.main" }}>
            Subtotal: ₱{calculateSubtotal().toFixed(2)}
          </Typography>
          <TextField
            label="Discount (%)"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={discountPercentage === 0 ? "" : discountPercentage}
            onChange={(e) =>
              setDiscountPercentage(parseInt(e.target.value) || 0)
            }
            InputProps={{ inputProps: { min: 0, max: 100 } }}
            sx={{ marginBottom: 2 }}
          />
          <Typography variant="h6" sx={{ color: "mochaBrown.main" }}>
            Discount: ₱{calculateDiscountAmount().toFixed(2)}
          </Typography>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: "softOrange.main",
              fontWeight: "bold",
              marginTop: 1,
            }}
          >
            Total: ₱{calculateTotal().toFixed(2)}
          </Typography>

          <TextField
            label="Amount Paid"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleProcessPayment}
            disabled={cart.length === 0}
            sx={{
              backgroundColor: "mintGreen.main",
              "&:hover": { backgroundColor: "mintGreen.dark" },
            }}
          >
            Process Payment
          </Button>
        </Paper>
      </Box>

      <Dialog
        open={openReceiptDialog}
        onClose={() => setOpenReceiptDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ backgroundColor: "mochaBrown.main", color: "creamBeige.main" }}
        >
          Transaction Receipt
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              fontSize: "0.9rem",
              color: "mochaBrown.main",
            }}
          >
            {receiptContent}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenReceiptDialog(false)}
            sx={{ color: "calicoGray.main" }}
          >
            Close
          </Button>
          <Button
            onClick={handlePrintReceipt}
            variant="contained"
            startIcon={<PrintIcon />}
            sx={{
              backgroundColor: "softOrange.main",
              "&:hover": { backgroundColor: "softOrange.dark" },
            }}
          >
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default PaymentTransaction;
