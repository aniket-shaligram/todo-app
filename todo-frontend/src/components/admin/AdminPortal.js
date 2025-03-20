import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';

const API_URL = 'http://localhost:8080/api';

const AdminPortal = () => {
  const [tenants, setTenants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTenant, setNewTenant] = useState({
    email: '',
    password: '',
    name: '',
    subscriptionTier: 'FREE'
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/tenants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTenants(response.data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleCreateTenant = async () => {
    try {
      await axios.post(`${API_URL}/admin/tenants`, newTenant, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOpenDialog(false);
      setNewTenant({
        email: '',
        password: '',
        name: '',
        subscriptionTier: 'FREE'
      });
      fetchTenants();
    } catch (error) {
      console.error('Error creating tenant:', error);
    }
  };

  const handleUpdateSubscription = async (tenantId, newTier) => {
    try {
      await axios.put(
        `${API_URL}/admin/tenants/${tenantId}/subscription`,
        { subscriptionTier: newTier },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchTenants();
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        await axios.delete(`${API_URL}/admin/tenants/${tenantId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchTenants();
      } catch (error) {
        console.error('Error deleting tenant:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tenant Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 3 }}
        >
          Add New Tenant
        </Button>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Subscription</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.email}</TableCell>
                  <TableCell>{tenant.subscriptionTier}</TableCell>
                  <TableCell>{tenant.active ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleUpdateSubscription(tenant.id, tenant.subscriptionTier === 'FREE' ? 'PRO' : 'FREE')}
                    >
                      {tenant.subscriptionTier === 'FREE' ? 'Upgrade to Pro' : 'Downgrade to Free'}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteTenant(tenant.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Add New Tenant</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={newTenant.name}
              onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={newTenant.email}
              onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newTenant.password}
              onChange={(e) => setNewTenant({ ...newTenant, password: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Subscription Tier"
              value={newTenant.subscriptionTier}
              onChange={(e) => setNewTenant({ ...newTenant, subscriptionTier: e.target.value })}
              margin="normal"
            >
              <MenuItem value="FREE">Free</MenuItem>
              <MenuItem value="PRO">Pro</MenuItem>
              <MenuItem value="ENTERPRISE">Enterprise</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTenant} variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminPortal;
