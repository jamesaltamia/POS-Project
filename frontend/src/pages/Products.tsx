import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([
    {
      id: "1",
      name: "Coffee Mug",
      price: 650.0,
      stock: 150,
      category: "Home Goods",
    },
    {
      id: "2",
      name: "Laptop Charger",
      price: 1500.0,
      stock: 80,
      category: "Electronics",
    },
    {
      id: "3",
      name: "T-Shirt",
      price: 999.0,
      stock: 200,
      category: "Clothing",
    },
  ]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [currentProduct, setCurrentProduct] = React.useState<Product | null>(
    null
  );
  const [formData, setFormData] = React.useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });

  const formatPrice = (price: number): string => {
    return `₱${price.toFixed(2)}`;
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
      });
    } else {
      setCurrentProduct(null);
      setFormData({ name: "", price: "", stock: "", category: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (currentProduct) {
      // Edit product
      setProducts(
        products.map((p) =>
          p.id === currentProduct.id
            ? {
                ...p,
                name: formData.name,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category: formData.category,
              }
            : p
        )
      );
    } else {
      // Add product
      const newProduct: Product = {
        id: (products.length + 1).toString(),
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
      };
      setProducts([...products, newProduct]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: "mochaBrown.main" }}>
        Product Management
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        sx={{
          marginBottom: 2,
          backgroundColor: "mintGreen.main",
          "&:hover": { backgroundColor: "mintGreen.dark" },
        }}
      >
        Add Product
      </Button>

      <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Price (₱)</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell align="right">
                  {formatPrice(product.price)}
                </TableCell>
                <TableCell align="right">{product.stock}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleDelete(product.id)}
                    sx={{ color: "purrPink.main" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle
          sx={{ backgroundColor: "mochaBrown.main", color: "creamBeige.main" }}
        >
          {currentProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent sx={{ paddingTop: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Product Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price (₱)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.price}
            onChange={handleChange}
            inputProps={{ step: "0.01", min: "0" }}
          />
          <TextField
            margin="dense"
            name="stock"
            label="Stock"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.stock}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="category"
            label="Category"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.category}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: "calicoGray.main" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: "mintGreen.main",
              "&:hover": { backgroundColor: "mintGreen.dark" },
            }}
          >
            {currentProduct ? "Save Changes" : "Add Product"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
