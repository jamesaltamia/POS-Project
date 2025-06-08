import React from "react";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface User {
  id: string;
  username: string;
  role: "Administrator" | "Manager" | "Cashier";
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = React.useState<User[]>([
    { id: "1", username: "admin", role: "Administrator" },
    { id: "2", username: "manager1", role: "Manager" },
    { id: "3", username: "cashier1", role: "Cashier" },
  ]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [formData, setFormData] = React.useState({
    username: "",
    role: "Cashier" as "Administrator" | "Manager" | "Cashier",
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setCurrentUser(user);
      setFormData({ username: user.username, role: user.role });
    } else {
      setCurrentUser(null);
      setFormData({ username: "", role: "Cashier" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (currentUser) {
      // Edit user
      setUsers(
        users.map((u) =>
          u.id === currentUser.id
            ? { ...u, username: formData.username, role: formData.role }
            : u
        )
      );
    } else {
      // Add user
      const newUser: User = {
        id: `${users.length + 1}`,
        username: formData.username,
        role: formData.role,
      };
      setUsers([...users, newUser]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/* Header section with FlexBox */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ color: "#8B4513", fontWeight: "bold" }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: "#90EE90",
            color: "#000",
            "&:hover": { backgroundColor: "#7CCD7C" },
          }}
        > 
          Add User
        </Button>
      </Box>

      {/* Table Container */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: "12px", boxShadow: 3 }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Username</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
              >
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      backgroundColor:
                        user.role === "Administrator"
                          ? "#ffeb3b"
                          : user.role === "Manager"
                          ? "#2196f3"
                          : "#4caf50",
                      color: user.role === "Administrator" ? "#000" : "#fff",
                    }}
                  >
                    {user.role}
                  </Box>
                </TableCell>
                <TableCell>
                  {/* Actions with FlexBox */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(user)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(user.id)}
                      size="small"
                      sx={{ color: "#e91e63" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            backgroundColor: "#8B4513",
            color: "#fff",
            textAlign: "center",
          }}
        >
          {currentUser ? "Edit User" : "Add New User"}
        </DialogTitle>
        <DialogContent sx={{ paddingTop: 2 }}>
          {/* Form fields with FlexBox container */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              paddingTop: 1,
            }}
          >
            <TextField
              autoFocus
              name="username"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.username}
              onChange={handleTextFieldChange}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleSelectChange}
              >
                <MenuItem value="Cashier">Cashier</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Administrator">Administrator</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
            padding: 2,
          }}
        >
          <Button onClick={handleCloseDialog} sx={{ color: "#757575" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: "#90EE90",
              color: "#000",
              "&:hover": { backgroundColor: "#7CCD7C" },
            }}
          >
            {currentUser ? "Save Changes" : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;