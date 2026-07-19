<script lang="ts">
  import { onMount } from 'svelte';
  import { rolesApi } from '$lib/api/roles.api';
  import { permissionsApi } from '$lib/api/permissions.api';
  import { userPermissions } from '$lib/stores/auth';
  import { toastStore } from '$lib/stores/toast';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import type { Role, Permission } from '$lib/types';

  let perms: string[] = $state([]);
  userPermissions.subscribe((v) => perms = v);

  let roles = $state<Role[]>([]);
  let allPermissions = $state<Permission[]>([]);
  let groupedPermissions = $state<Record<string, Permission[]>>({});
  let loading = $state(true);

  let showModal = $state(false);
  let modalMode = $state<'create'|'edit'>('create');
  let editingRole = $state<Role|null>(null);
  let saving = $state(false);
  let formName = $state('');
  let formDesc = $state('');

  let showPermsModal = $state(false);
  let permsRole = $state<Role|null>(null);
  let selectedPerms = $state<Set<string>>(new Set());
  let savingPerms = $state(false);

  let showDeleteModal = $state(false);
  let deletingRole = $state<Role|null>(null);
  let deleting = $state(false);

  async function load() {
    loading = true;
    try {
      roles = await rolesApi.getAll();
      const p = await permissionsApi.getAll();
      allPermissions = p.permissions;
      groupedPermissions = p.grouped;
    } catch {} loading = false;
  }

  onMount(load);

  function openCreate() { modalMode='create'; formName=''; formDesc=''; editingRole=null; showModal=true; }
  function openEdit(r: Role) { modalMode='edit'; editingRole=r; formName=r.name; formDesc=r.description||''; showModal=true; }

  function openPerms(r: Role) {
    permsRole = r;
    selectedPerms = new Set(r.rolePermissions.map(rp => rp.permission.id));
    showPermsModal = true;
  }

  async function handleSubmit() {
    saving = true;
    try {
      if (modalMode === 'create') { await rolesApi.create({ name: formName, description: formDesc }); toastStore.success('Role created'); }
      else if (editingRole) { await rolesApi.update(editingRole.id, { name: formName, description: formDesc }); toastStore.success('Role updated'); }
      showModal = false; load();
    } catch {} saving = false;
  }

  async function handleSavePerms() {
    if (!permsRole) return;
    savingPerms = true;
    try {
      await rolesApi.assignPermissions(permsRole.id, [...selectedPerms]);
      toastStore.success('Permissions updated');
      showPermsModal = false; load();
    } catch {} savingPerms = false;
  }

  function togglePerm(id: string) {
    const s = new Set(selectedPerms);
    if (s.has(id)) s.delete(id); else s.add(id);
    selectedPerms = s;
  }

  async function handleDelete() {
    if (!deletingRole) return; deleting = true;
    try { await rolesApi.delete(deletingRole.id); toastStore.success('Role deleted'); showDeleteModal = false; load(); } catch {} deleting = false;
  }
</script>

<svelte:head><title>Roles — RBAC Panel</title></svelte:head>

<div class="space-y-6 animate-fade-in">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div><h1 class="text-2xl font-bold text-text-primary">Roles</h1><p class="text-sm text-text-muted mt-1">Manage roles and permissions</p></div>
    {#if perms.includes('roles:create')}<Button onclick={openCreate}>+ Add Role</Button>{/if}
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {#if loading}{#each Array(4) as _}<div class="skeleton h-40 rounded-xl"></div>{/each}
    {:else}{#each roles as role}
      <Card hover>
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="text-base font-semibold text-text-primary flex items-center gap-2">{role.name} {#if role.isSystem}<Badge variant="info">System</Badge>{/if}</h3>
            <p class="text-xs text-text-muted mt-1">{role.description || 'No description'}</p>
          </div>
          <Badge variant="outline">{role._count.users} users</Badge>
        </div>
        <div class="flex flex-wrap gap-1 mb-4">
          {#each role.rolePermissions.slice(0,5) as rp}<Badge variant="default">{rp.permission.name}</Badge>{/each}
          {#if role.rolePermissions.length > 5}<Badge variant="outline">+{role.rolePermissions.length - 5}</Badge>{/if}
        </div>
        <div class="flex gap-2">
          {#if perms.includes('roles:update')}<Button size="sm" variant="outline" onclick={()=>openPerms(role)}>Permissions</Button><Button size="sm" variant="ghost" onclick={()=>openEdit(role)}>Edit</Button>{/if}
          {#if perms.includes('roles:delete') && !role.isSystem}<Button size="sm" variant="ghost" class="!text-error" onclick={()=>{deletingRole=role;showDeleteModal=true;}}>Delete</Button>{/if}
        </div>
      </Card>
    {/each}{/if}
  </div>
</div>

<Modal bind:open={showModal} title={modalMode==='create'?'Add Role':'Edit Role'}>
  <form onsubmit={(e)=>{e.preventDefault();handleSubmit();}} class="flex flex-col gap-4">
    <Input label="Role Name" bind:value={formName} required id="role-name" />
    <Input label="Description" bind:value={formDesc} id="role-desc" />
  </form>
  {#snippet actions()}<Button variant="outline" onclick={()=>showModal=false}>Cancel</Button><Button loading={saving} onclick={handleSubmit}>{modalMode==='create'?'Create':'Save'}</Button>{/snippet}
</Modal>

<Modal bind:open={showPermsModal} title="Manage Permissions — {permsRole?.name}" class="!max-w-2xl">
  <div class="max-h-96 overflow-y-auto space-y-4">
    {#each Object.entries(groupedPermissions) as [mod, modPerms]}
      <div>
        <h4 class="text-sm font-semibold text-text-primary mb-2 capitalize">{mod}</h4>
        <div class="grid grid-cols-2 gap-2">
          {#each modPerms as p}
            <label class="flex items-center gap-2 rounded-lg border border-border p-2 hover:bg-surface-100 cursor-pointer transition-colors">
              <input type="checkbox" checked={selectedPerms.has(p.id)} onchange={()=>togglePerm(p.id)} class="accent-brand-500" />
              <div><p class="text-sm text-text-primary">{p.action}</p><p class="text-xs text-text-muted">{p.description}</p></div>
            </label>
          {/each}
        </div>
      </div>
    {/each}
  </div>
  {#snippet actions()}<Button variant="outline" onclick={()=>showPermsModal=false}>Cancel</Button><Button loading={savingPerms} onclick={handleSavePerms}>Save Permissions</Button>{/snippet}
</Modal>

<Modal bind:open={showDeleteModal} title="Delete Role">
  <p class="text-sm text-text-secondary">Delete <strong>{deletingRole?.name}</strong>?</p>
  {#snippet actions()}<Button variant="outline" onclick={()=>showDeleteModal=false}>Cancel</Button><Button variant="destructive" loading={deleting} onclick={handleDelete}>Delete</Button>{/snippet}
</Modal>
