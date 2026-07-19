<script lang="ts">
  import { onMount } from 'svelte';
  import { profileApi } from '$lib/api/profile.api';
  import { authStore, currentUser } from '$lib/stores/auth';
  import { toastStore } from '$lib/stores/toast';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { formatDateTime } from '$lib/utils/format';

  let user = $state<any>(null);
  currentUser.subscribe((v) => user = v);

  let profile = $state<any>(null);
  let loading = $state(true);

  let editName = $state('');
  let editEmail = $state('');
  let savingProfile = $state(false);

  let currentPassword = $state('');
  let newPassword = $state('');
  let savingPassword = $state(false);

  onMount(async () => {
    try { profile = await profileApi.get(); editName = profile.name; editEmail = profile.email; } catch {}
    loading = false;
  });

  async function handleUpdateProfile() {
    savingProfile = true;
    try {
      const updated = await profileApi.update({ name: editName, email: editEmail });
      profile = updated;
      authStore.setUser({ ...user, name: editName, email: editEmail });
      toastStore.success('Profile updated');
    } catch {} savingProfile = false;
  }

  async function handleChangePassword() {
    savingPassword = true;
    try {
      await profileApi.changePassword({ currentPassword, newPassword });
      toastStore.success('Password changed');
      currentPassword = ''; newPassword = '';
    } catch {} savingPassword = false;
  }
</script>

<svelte:head><title>Profile — RBAC Panel</title></svelte:head>

<div class="space-y-6 animate-fade-in max-w-2xl">
  <div><h1 class="text-2xl font-bold text-text-primary">Profile Settings</h1><p class="text-sm text-text-muted mt-1">Manage your account</p></div>

  {#if loading}<div class="space-y-4">{#each Array(2) as _}<div class="skeleton h-48 rounded-xl"></div>{/each}</div>
  {:else}
    <!-- Profile Info -->
    <Card>
      <div class="flex items-center gap-4 mb-6">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white text-xl font-bold shadow-lg">
          {profile?.name?.slice(0,2).toUpperCase()}
        </div>
        <div>
          <h2 class="text-lg font-semibold text-text-primary">{profile?.name}</h2>
          <p class="text-sm text-text-muted">{profile?.email}</p>
          <Badge variant="default" class="mt-1">{profile?.role?.name}</Badge>
        </div>
      </div>

      <form onsubmit={(e)=>{e.preventDefault();handleUpdateProfile();}} class="flex flex-col gap-4">
        <Input label="Full Name" bind:value={editName} required id="profile-name" />
        <Input label="Email" type="email" bind:value={editEmail} required id="profile-email" />
        <div class="flex justify-end">
          <Button type="submit" loading={savingProfile}>Update Profile</Button>
        </div>
      </form>
    </Card>

    <!-- Change Password -->
    <Card>
      <h3 class="text-base font-semibold text-text-primary mb-4">Change Password</h3>
      <form onsubmit={(e)=>{e.preventDefault();handleChangePassword();}} class="flex flex-col gap-4">
        <Input label="Current Password" type="password" bind:value={currentPassword} required id="cur-pass" />
        <Input label="New Password" type="password" bind:value={newPassword} required id="new-pass" />
        <p class="text-xs text-text-muted -mt-2">Min 8 chars, uppercase, lowercase, number, special char</p>
        <div class="flex justify-end">
          <Button type="submit" loading={savingPassword}>Change Password</Button>
        </div>
      </form>
    </Card>

    <!-- Account Info -->
    <Card>
      <h3 class="text-base font-semibold text-text-primary mb-3">Account Info</h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between"><span class="text-text-muted">Last Login</span><span class="text-text-primary">{profile?.lastLoginAt ? formatDateTime(profile.lastLoginAt) : 'N/A'}</span></div>
        <div class="flex justify-between"><span class="text-text-muted">Member Since</span><span class="text-text-primary">{profile?.createdAt ? formatDateTime(profile.createdAt) : 'N/A'}</span></div>
        <div class="flex justify-between"><span class="text-text-muted">Status</span><Badge variant={profile?.isActive?'success':'error'}>{profile?.isActive?'Active':'Inactive'}</Badge></div>
      </div>
    </Card>
  {/if}
</div>
