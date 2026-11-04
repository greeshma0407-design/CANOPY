import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Key,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Check,
  AlertTriangle,
  Copy,
  Send,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { canopyApi, ApiError } from '../../utils/apiClient';
import { User, UserRole, UserCreatePayload, UserUpdatePayload, Invitation } from '../../types';
import { useAuth } from '../../context/AuthContext';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'CAMPUS_ADMIN', label: 'Campus Administrator (Full platform & user control)' },
  { value: 'CAMPUS_MANAGER', label: 'Campus Manager (All modules & report generation)' },
  { value: 'DATA_ENTRY_OPERATOR', label: 'Data Entry Operator (Records & calculations)' },
  { value: 'VIEWER', label: 'Viewer / Auditor (Read-only access)' },
];

export const UsersPage: React.FC = () => {
  const { user: currentAuthUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('DATA_ENTRY_OPERATOR');
  const [newPassword, setNewPassword] = useState('');

  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('VIEWER');
  const [editIsActive, setEditIsActive] = useState(true);

  const [resetPasswordVal, setResetPasswordVal] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Invitation states
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('DATA_ENTRY_OPERATOR');
  const [generatedInvite, setGeneratedInvite] = useState<Invitation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchInvitations = useCallback(async () => {
    try {
      const data = await canopyApi.getInvitations();
      setInvitations(data.filter(i => !i.is_accepted));
    } catch {
      // Ignored
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await canopyApi.getUsers();
      setUsers(data);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setErrorMsg(apiErr?.message || 'Failed to load user roster.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchInvitations();
  }, [fetchUsers, fetchInvitations]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // 1. Add User Handler
  const handleOpenAdd = () => {
    setNewEmail('');
    setNewName('');
    setNewRole('DATA_ENTRY_OPERATOR');
    setNewPassword('');
    setModalError(null);
    setAddModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (newPassword.length < 8) {
      setModalError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UserCreatePayload = {
        email: newEmail.trim(),
        full_name: newName.trim(),
        role: newRole,
        password: newPassword,
        is_active: true,
      };
      await canopyApi.createUser(payload);
      setAddModalOpen(false);
      showSuccess(`Created user account for ${payload.email}.`);
      fetchUsers();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setModalError(apiErr?.message || 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Edit User Handler
  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setEditName(user.full_name);
    setEditRole(user.role);
    setEditIsActive(user.is_active);
    setModalError(null);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setModalError(null);

    setIsSubmitting(true);
    try {
      const payload: UserUpdatePayload = {
        full_name: editName.trim(),
        role: editRole,
        is_active: editIsActive,
      };
      await canopyApi.updateUser(selectedUser.id, payload);
      setEditModalOpen(false);
      showSuccess(`Updated profile for ${selectedUser.email}.`);
      fetchUsers();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setModalError(apiErr?.message || 'Failed to update user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Reset Password Handler
  const handleOpenReset = (user: User) => {
    setSelectedUser(user);
    setResetPasswordVal('');
    setModalError(null);
    setResetModalOpen(true);
  };

  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (resetPasswordVal.length < 8) {
      setModalError('New password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await canopyApi.updateUser(selectedUser.id, { password: resetPasswordVal });
      setResetModalOpen(false);
      showSuccess(`Password successfully reset for ${selectedUser.email}.`);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setModalError(apiErr?.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Delete User Handler
  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setModalError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await canopyApi.deleteUser(selectedUser.id);
      setDeleteModalOpen(false);
      showSuccess(`User account ${selectedUser.email} has been removed.`);
      fetchUsers();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setModalError(apiErr?.message || 'Failed to delete user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);
    try {
      const inv = await canopyApi.createInvitation({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setGeneratedInvite(inv);
      showSuccess(`Invitation generated for ${inviteEmail}.`);
      fetchInvitations();
    } catch (err: any) {
      setModalError(err?.message || 'Failed to issue invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      await canopyApi.revokeInvitation(invitationId);
      showSuccess('Invitation revoked.');
      fetchInvitations();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to revoke invitation.');
    }
  };

  // Metrics
  const totalUsers = users.length;
  const adminCount = users.filter(u => (u.role === 'ADMIN' || u.role === 'CAMPUS_ADMIN') && u.is_active).length;
  const managerCount = users.filter(u => u.role === 'CAMPUS_MANAGER' && u.is_active).length;
  const operatorCount = users.filter(u => u.role === 'DATA_ENTRY_OPERATOR' && u.is_active).length;
  const viewerCount = users.filter(u => u.role === 'VIEWER' && u.is_active).length;

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
      case 'CAMPUS_ADMIN':
        return 'danger';
      case 'CAMPUS_MANAGER':
        return 'success';
      case 'DATA_ENTRY_OPERATOR':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
            Institutional User Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Role-based access control, operator privileges, and credential administration.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUsers}
            icon={<RefreshCw size={14} />}
          >
            Refresh Roster
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setGeneratedInvite(null);
              setInviteEmail('');
              setInviteRole('DATA_ENTRY_OPERATOR');
              setModalError(null);
              setInviteModalOpen(true);
            }}
            icon={<Send size={14} />}
          >
            Invite Member
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<UserPlus size={15} />}
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(78, 135, 82, 0.18)',
            border: '1px solid rgba(78, 135, 82, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#8FD895',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(192, 87, 70, 0.15)',
            border: '1px solid rgba(192, 87, 70, 0.35)',
            borderRadius: 'var(--radius-md)',
            color: '#FFAAA0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid-cols-4">
        <Card>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Total User Accounts
          </div>
          <div
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '0.3rem',
            }}
          >
            {totalUsers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Registered platform accounts
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Active Administrators
          </div>
          <div
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--ochre)',
              marginTop: '0.3rem',
            }}
          >
            {adminCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Full system &amp; user control
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Managers &amp; Operators
          </div>
          <div
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--sage)',
              marginTop: '0.3rem',
            }}
          >
            {managerCount + operatorCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {managerCount} Manager(s) · {operatorCount} Operator(s)
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Auditors &amp; Viewers
          </div>
          <div
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#8FD895',
              marginTop: '0.3rem',
            }}
          >
            {viewerCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Read-only verified reviewers
          </div>
        </Card>
      </div>

      {/* Users Table Card */}
      <Card
        title="Campus User Roster"
        subtitle="Manage accounts, change roles, reset access keys, and deactivate operators"
        action={
          <Badge variant="success">
            {users.filter(u => u.is_active).length} Active Accounts
          </Badge>
        }
      >
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} color="var(--sage)" style={{ margin: '0 auto 0.75rem auto' }} />
            <p>Loading institutional user roster…</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Users size={32} color="var(--sage)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.35rem' }}>No users found</h4>
            <p style={{ fontSize: '0.85rem' }}>Click "Add New User" to register the first team member.</p>
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: '0.5rem' }}>
            <table className="canopy-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Institutional Email</th>
                  <th>Platform Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isCurrent = u.id === currentAuthUser?.id;
                  const initials = u.full_name
                    .split(' ')
                    .map(p => p[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'U';

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--card-elevated)',
                              border: '1px solid var(--border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: 'var(--sage)',
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {u.full_name}
                              {isCurrent && (
                                <span
                                  style={{
                                    marginLeft: '0.45rem',
                                    fontSize: '0.7rem',
                                    color: 'var(--sage)',
                                    fontWeight: 500,
                                  }}
                                >
                                  (You)
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              <code>{u.id}</code>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <Badge variant={getRoleBadgeVariant(u.role as UserRole)}>
                          {u.role.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={u.is_active ? 'success' : 'danger'}>
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(u)}
                            title="Edit User Details and Role"
                            icon={<Edit2 size={13} />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenReset(u)}
                            title="Reset Password"
                            icon={<Key size={13} />}
                          >
                            Reset
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenDelete(u)}
                            title="Delete User"
                            icon={<Trash2 size={13} />}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invitations Card */}
      {invitations.length > 0 && (
        <Card
          title="Pending Campus Invitations"
          subtitle="Active invitation tokens awaiting acceptance by invited staff and operators"
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Invited Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assigned Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Invitation Link</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Expires</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => {
                  const joinUrl = `${window.location.origin}/join?token=${inv.token}`;
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#F2EFE5' }}>{inv.email}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <Badge variant={getRoleBadgeVariant(inv.role)}>{inv.role}</Badge>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(joinUrl);
                            showSuccess(`Link copied for ${inv.email}`);
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(165, 181, 139, 0.25)',
                            borderRadius: '4px',
                            color: '#A5B58B',
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Copy size={12} />
                          <span>Copy Link</span>
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#A0A595', fontSize: '0.78rem' }}>
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRevokeInvite(inv.id)}
                          icon={<Trash2 size={13} />}
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Invite Team Member */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member to Campus"
      >
        {generatedInvite ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                backgroundColor: 'rgba(78, 135, 82, 0.18)',
                border: '1px solid rgba(78, 135, 82, 0.4)',
                borderRadius: '6px',
                padding: '0.85rem 1rem',
                color: '#8FD895',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle size={16} />
              <span>Invitation generated for {generatedInvite.email}!</span>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#A0A595', lineHeight: 1.4 }}>
              Share this secure registration link with the invited team member. The token expires in 7 days.
            </p>

            <div
              style={{
                backgroundColor: '#101410',
                border: '1px solid rgba(165, 181, 139, 0.25)',
                borderRadius: '6px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.78rem',
                color: '#F2EFE5',
                wordBreak: 'break-all',
              }}
            >
              {`${window.location.origin}/join?token=${generatedInvite.token}`}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button
                variant="primary"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/join?token=${generatedInvite.token}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                icon={copiedLink ? <Check size={15} /> : <Copy size={15} />}
              >
                {copiedLink ? 'Copied to Clipboard!' : 'Copy Invitation Link'}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {modalError && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(192, 87, 70, 0.15)',
                  border: '1px solid rgba(192, 87, 70, 0.35)',
                  borderRadius: '6px',
                  color: '#FFAAA0',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <Input
              label="Recipient Institutional Email"
              type="email"
              placeholder="e.g. operator@college.edu.in"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              hint="An invitation token will be generated specifically for this address."
            />

            <Select
              label="Assigned System Role"
              options={ROLE_OPTIONS}
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
            />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button variant="ghost" type="button" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={isSubmitting} icon={<Send size={15} />}>
                Generate Invitation
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal 1: Add New User */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New User Account"
      >
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modalError && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(192, 87, 70, 0.15)',
                border: '1px solid rgba(192, 87, 70, 0.35)',
                borderRadius: '6px',
                color: '#FFAAA0',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={15} />
              <span>{modalError}</span>
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Ananya Sharma"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <Input
            label="Institutional Email"
            type="email"
            placeholder="e.g. ananya@canopy.local"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />

          <Select
            label="Platform Role"
            value={newRole}
            options={ROLE_OPTIONS}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
          />

          <Input
            label="Initial Password"
            type="password"
            placeholder="Minimum 8 characters"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            hint="User will be able to log in immediately with this credential."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <Button variant="ghost" onClick={() => setAddModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting} icon={<UserPlus size={15} />}>
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Edit User */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit User: ${selectedUser?.email}`}
      >
        <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modalError && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(192, 87, 70, 0.15)',
                border: '1px solid rgba(192, 87, 70, 0.35)',
                borderRadius: '6px',
                color: '#FFAAA0',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={15} />
              <span>{modalError}</span>
            </div>
          )}

          <Input
            label="Full Name"
            required
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <Select
            label="Platform Role"
            value={editRole}
            options={ROLE_OPTIONS}
            onChange={(e) => setEditRole(e.target.value as UserRole)}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Account Active Status
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: 'var(--sage)' }}
              />
              <span>Account is active and permitted to log in</span>
            </label>
            {!editIsActive && (
              <span style={{ fontSize: '0.75rem', color: 'var(--ochre)' }}>
                Deactivated users cannot authenticate or access any Canopy API endpoints.
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <Button variant="ghost" onClick={() => setEditModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting} icon={<Check size={15} />}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Reset Password */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`Reset Password for ${selectedUser?.email}`}
      >
        <form onSubmit={handleSaveResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modalError && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(192, 87, 70, 0.15)',
                border: '1px solid rgba(192, 87, 70, 0.35)',
                borderRadius: '6px',
                color: '#FFAAA0',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={15} />
              <span>{modalError}</span>
            </div>
          )}

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Set a new temporary or permanent credential for <strong>{selectedUser?.full_name}</strong>.
          </p>

          <Input
            label="New Password"
            type="password"
            placeholder="Minimum 8 characters"
            required
            value={resetPasswordVal}
            onChange={(e) => setResetPasswordVal(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <Button variant="ghost" onClick={() => setResetModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting} icon={<Key size={15} />}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Delete Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm User Deletion"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modalError && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(192, 87, 70, 0.15)',
                border: '1px solid rgba(192, 87, 70, 0.35)',
                borderRadius: '6px',
                color: '#FFAAA0',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={15} />
              <span>{modalError}</span>
            </div>
          )}

          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(212, 163, 115, 0.1)',
              border: '1px solid rgba(212, 163, 115, 0.3)',
              borderRadius: '6px',
              display: 'flex',
              gap: '0.65rem',
              alignItems: 'flex-start',
            }}
          >
            <AlertTriangle size={18} color="var(--ochre)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Are you sure you want to permanently delete the account for{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{selectedUser?.full_name}</strong> (
              <code>{selectedUser?.email}</code>)? This action cannot be undone.
            </div>
          </div>

          {selectedUser?.role === 'ADMIN' && (
            <div style={{ fontSize: '0.78rem', color: 'var(--ochre)' }}>
              Note: If this is the last active administrator on the platform, the backend will reject deletion.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              loading={isSubmitting}
              icon={<Trash2 size={15} />}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
