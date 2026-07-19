<script lang="ts">
  import { onMount } from 'svelte';
  import { usersApi } from '$lib/api/users.api';
  import { rolesApi } from '$lib/api/roles.api';
  import { userPermissions } from '$lib/stores/auth';
  import { toastStore } from '$lib/stores/toast';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import { formatDateTime } from '$lib/utils/format';
  import type { User, Role } from '$lib/types';

  let permissions: string[] = $state([]);
  userPermissions.subscribe((v) => permissions = v);

  let users = $state<User[]>([]);
  let roles = $state<Role[]>([]);
  let loading = $state(true);
  let search = $state('');
  let pg = $state(1);
  let totalPages = $state(1);
  let total = $state(0);
  let showModal = $state(false);
  let modalMode = $state<'create'|'edit'>('create');
  let editingUser = $state<User|null>(null);
  let saving = $state(false);
  let formName = $state('');
  let formEmail = $state('');
  let formPassword = $state('');
  let formRoleId = $state('');
  let formIsActive = $state(true);
  let showDeleteModal = $state(false);
  let deletingUser = $state<User|null>(null);
  let deleting = $state(false);

  async function loadUsers() {
    loading = true;
    try {
      const p: Record<string,string> = { page: String(pg), limit: '10' };
      if (search) p.search = search;
      const r = await usersApi.getAll(p);
      users = r.data; totalPages = r.meta.totalPages; total = r.meta.total;
    } catch {}
    loading = false;
  }

  onMount(() => { loadUsers(); rolesApi.getAll().then(r => roles = r).catch(() => {}); });

  function openCreate() { modalMode='create'; formName=''; formEmail=''; formPassword=''; formRoleId=roles[0]?.id||''; formIsActive=true; editingUser=null; showModal=true; }
  function openEdit(u: User) { modalMode='edit'; editingUser=u; formName=u.name; formEmail=u.email; formPassword=''; formRoleId=u.role.id; formIsActive=u.isActive; showModal=true; }

  async function handleSubmit() {
    saving = true;
    try {
      if (modalMode === 'create') { await usersApi.create({ name:formName, email:formEmail, password:formPassword, roleId:formRoleId, isActive:formIsActive }); toastStore.success('User created'); }
      else if (editingUser) { const d: any = { name:formName, email:formEmail, roleId:formRoleId, isActive:formIsActive }; if (formPassword) d.password = formPassword; await usersApi.update(editingUser.id, d); toastStore.success('User updated'); }
      showModal = false; loadUsers();
    } catch {} saving = false;
  }

  async function handleDelete() {
    if (!deletingUser) return; deleting = true;
    try { await usersApi.delete(deletingUser.id); toastStore.success('User deleted'); showDeleteModal=false; deletingUser=null; loadUsers(); } catch {} deleting = false;
  }
</script>

<svelte:head><title>Users — RBAC Panel</title></svelte:head>

<div class="space-y-6 animate-fade-in">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div><h1 class="text-2xl font-bold text-text-primary">Users</h1><p class="text-sm text-text-muted mt-1">{total} total</p></div>
    {#if permissions.includes('users:create')}<Button onclick={openCreate}>+ Add User</Button>{/if}
  </div>

  <Card class="!p-4"><form onsubmit={(e)=>{e.preventDefault();pg=1;loadUsers();}} class="flex gap-3"><div class="flex-1"><Input placeholder="Search..." bind:value={search} id="user-search" /></div><Button type="submit" variant="outline">Search</Button></form></Card>

  <Card class="!p-0 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead><tr class="border-b border-border bg-surface-100/50">
          <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">User</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Role</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Status</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Last Login</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase">Actions</th>
        </tr></thead>
        <tbody>
          {#if loading}{#each Array(5) as _}<tr class="border-b border-border/50"><td class="px-4 py-3" colspan="5"><div class="skeleton h-8 w-full"></div></td></tr>{/each}
          {:else if users.length === 0}<tr><td colspan="5" class="px-4 py-12 text-center text-sm text-text-muted">No users found</td></tr>
          {:else}{#each users as u}
            <tr class="border-b border-border/50 hover:bg-surface-100/50 transition-colors">
              <td class="px-4 py-3"><div class="flex items-center gap-3"><div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-white text-xs font-bold">{u.name.slice(0,2).toUpperCase()}</div><div><p class="text-sm font-medium text-text-primary">{u.name}</p><p class="text-xs text-text-muted">{u.email}</p></div></div></td>
              <td class="px-4 py-3"><Badge>{u.role.name}</Badge></td>
              <td class="px-4 py-3"><Badge variant={u.isActive?'success':'error'}>{u.isActive?'Active':'Inactive'}</Badge></td>
              <td class="px-4 py-3"><span class="text-sm text-text-muted">{u.lastLoginAt?formatDateTime(u.lastLoginAt):'Never'}</span></td>
              <td class="px-4 py-3"><div class="flex justify-end gap-1">
                {#if permissions.includes('users:update')}<Button size="sm" variant="ghost" onclick={()=>openEdit(u)}>Edit</Button>{/if}
                {#if permissions.includes('users:delete')}<Button size="sm" variant="ghost" onclick={()=>{deletingUser=u;showDeleteModal=true;}} class="!text-error">Delete</Button>{/if}
              </div></td>
            </tr>
          {/each}{/if}
        </tbody>
      </table>
    </div>
    {#if totalPages > 1}<div class="flex items-center justify-between border-t border-border px-4 py-3"><p class="text-sm text-text-muted">Page {pg}/{totalPages}</p><div class="flex gap-2"><Button size="sm" variant="outline" disabled={pg<=1} onclick={()=>{pg--;loadUsers();}}>Prev</Button><Button size="sm" variant="outline" disabled={pg>=totalPages} onclick={()=>{pg++;loadUsers();}}>Next</Button></div></div>{/if}
  </Card>
</div>

<Modal bind:open={showModal} title={modalMode==='create'?'Add User':'Edit User'}>
  <form onsubmit={(e)=>{e.preventDefault();handleSubmit();}} class="flex flex-col gap-4">
    <Input label="Name" bind:value={formName} required id="m-name" />
    <Input label="Email" type="email" bind:value={formEmail} required id="m-email" />
    <Input label="Password" type="password" bind:value={formPassword} required={modalMode==='create'} id="m-pass" />
    <div class="flex flex-col gap-1.5"><label for="m-role" class="text-sm font-medium text-text-secondary">Role</label><select bind:value={formRoleId} id="m-role" class="h-10 w-full rounded-lg border border-border bg-surface-50 px-3 text-sm text-text-primary">{#each roles as r}<option value={r.id}>{r.name}</option>{/each}</select></div>
    <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" bind:checked={formIsActive} class="accent-brand-500" /><span class="text-sm text-text-secondary">Active</span></label>
  </form>
  {#snippet actions()}<Button variant="outline" onclick={()=>showModal=false}>Cancel</Button><Button loading={saving} onclick={handleSubmit}>{modalMode==='create'?'Create':'Save'}</Button>{/snippet}
</Modal>

<Modal bind:open={showDeleteModal} title="Delete User">
  <p class="text-sm text-text-secondary">Delete <strong>{deletingUser?.name}</strong>? This cannot be undone.</p>
  {#snippet actions()}<Button variant="outline" onclick={()=>showDeleteModal=false}>Cancel</Button><Button variant="destructive" loading={deleting} onclick={handleDelete}>Delete</Button>{/snippet}
</Modal>
