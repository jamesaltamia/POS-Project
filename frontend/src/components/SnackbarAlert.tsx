import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material/Alert';

interface SnackbarAlertProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
}

const SnackbarAlert: React.FC<SnackbarAlertProps> = ({ open, message, severity = 'info', onClose }) => {
  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <MuiAlert elevation={6} variant="filled" onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default SnackbarAlert;
