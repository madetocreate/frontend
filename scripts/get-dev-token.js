#!/usr/bin/env node

/**
 * Dev Token Generator
 * 
 * Generates a dev token from the backend and outputs it.
 * Can be used to manually set the token in localStorage or for automation.
 * 
 * Usage:
 *   node scripts/get-dev-token.js
 *   # or
 *   npm run dev:token
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                     process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL || 
                     process.env.NEXT_PUBLIC_BACKEND_URL || 
                     'http://localhost:4000';

async function getDevToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/dev/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId: 'aklow-main',
        userId: 'dev-user',
        role: 'tenant_admin'
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      console.error('❌ Failed to get dev token:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${error.message || error.error || 'Unknown error'}`);
      process.exit(1);
    }

    const data = await response.json();
    
    console.log('\n✅ Dev Token generated successfully!\n');
    console.log('Token:', data.token);
    console.log('\n📋 User Info:');
    console.log('   Tenant ID:', data.tenantId);
    console.log('   User ID:', data.userId);
    console.log('   Role:', data.role);
    console.log('\n💡 To use this token in the browser:');
    console.log('   1. Open browser console (F12)');
    console.log('   2. Run: localStorage.setItem("auth_token", "' + data.token + '")');
    console.log('   3. Refresh the page\n');
    
    // Also output just the token for easy copying
    console.log('🔑 Token only (for easy copy):');
    console.log(data.token);
    console.log('');
    
    return data.token;
  } catch (error) {
    console.error('❌ Error getting dev token:');
    console.error('   ', error.message);
    console.error('\n💡 Make sure the backend server is running on', API_BASE_URL);
    process.exit(1);
  }
}

getDevToken();

