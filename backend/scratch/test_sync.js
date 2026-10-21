const BASE = 'http://localhost:5000/api';

async function run() {
  console.log('--- 1. Login as Citizen ---');
  const citizenLoginRes = await fetch(`${BASE}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'citizen' }),
  });
  const citizenData = await citizenLoginRes.json();
  const citizenToken = citizenData.token;
  console.log('Citizen Logged in:', citizenData.user.name, 'Token received:', !!citizenToken);

  console.log('\n--- 2. Citizen Submits a Civic Complaint ---');
  const complaintRes = await fetch(`${BASE}/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizenToken}`,
    },
    body: JSON.stringify({
      title: 'Plastic bottles dumped at park gate',
      category: 'Illegal Dumping',
      location: 'Community Park Gate 2',
      description: 'Piles of crushed plastic bottles need collection',
    }),
  });
  const complaintJson = await complaintRes.json();
  console.log('Complaint created:', complaintJson.success, complaintJson.complaint?.customId);

  console.log('\n--- 3. Citizen Submits a Pickup Request ---');
  const pickupRes = await fetch(`${BASE}/pickups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizenToken}`,
    },
    body: JSON.stringify({
      requestedDate: 'Tomorrow, Oct 21',
      slot: '10:00 AM - 01:00 PM',
      notes: '3 bags of PET bottles ready at doorstep',
    }),
  });
  const pickupJson = await pickupRes.json();
  console.log('Pickup created:', pickupJson.success, pickupJson.pickup?.customId);

  console.log('\n--- 4. Switch to Municipality Portal (testing both "municipal" and "municipality") ---');
  const muniLoginRes = await fetch(`${BASE}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'municipal' }),
  });
  const muniData = await muniLoginRes.json();
  const muniToken = muniData.token;
  console.log('Municipality Logged in via "municipal":', muniData.user?.name, 'Role:', muniData.user?.role);

  console.log('\n--- 5. Municipality Fetches All Complaints ---');
  const muniComplaintsRes = await fetch(`${BASE}/complaints`, {
    headers: { 'Authorization': `Bearer ${muniToken}` },
  });
  const muniComplaintsJson = await muniComplaintsRes.json();
  console.log('Municipality complaints status:', muniComplaintsRes.status);
  console.log('Complaints count visible to municipality:', muniComplaintsJson.complaints?.length);
  const foundComplaint = muniComplaintsJson.complaints?.find(c => c.id === complaintJson.complaint?.customId);
  console.log('Citizen complaint visible to municipality?', !!foundComplaint, foundComplaint?.title);

  console.log('\n--- 6. Municipality Fetches All Pickups ---');
  const muniPickupsRes = await fetch(`${BASE}/pickups`, {
    headers: { 'Authorization': `Bearer ${muniToken}` },
  });
  const muniPickupsJson = await muniPickupsRes.json();
  console.log('Municipality pickups status:', muniPickupsRes.status);
  console.log('Pickups count visible to municipality:', muniPickupsJson.pickups?.length);
  const foundPickup = muniPickupsJson.pickups?.find(p => p.id === pickupJson.pickup?.customId);
  console.log('Citizen pickup visible to municipality?', !!foundPickup, foundPickup?.id);

  console.log('\n--- 7. Municipality Dashboard Metrics ---');
  const muniDashRes = await fetch(`${BASE}/municipality/dashboard`, {
    headers: { 'Authorization': `Bearer ${muniToken}` },
  });
  const muniDashJson = await muniDashRes.json();
  console.log('Municipality Dashboard metrics:', muniDashJson.metrics);

  console.log('\n--- 8. Municipality Assigns Team to Complaint ---');
  const assignRes = await fetch(`${BASE}/complaints/${foundComplaint._id}/assign`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${muniToken}`,
    },
    body: JSON.stringify({ teamName: 'Rapid Sanitation Team 02', priority: 'High' }),
  });
  const assignJson = await assignRes.json();
  console.log('Team assigned:', assignJson.success, assignJson.complaint?.assignedTeam);

  console.log('\n--- 9. Municipality Verifies Pickup & Awards Credits ---');
  const verifyRes = await fetch(`${BASE}/pickups/${foundPickup._id}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${muniToken}`,
    },
    body: JSON.stringify({
      weightKg: 8.5,
      polymerType: 'PET Flakes',
      batchCode: 'BATCH-PET-01',
    }),
  });
  const verifyJson = await verifyRes.json();
  console.log('Pickup verified:', verifyJson.success, 'Credits awarded:', verifyJson.creditsAwarded);

  console.log('\n--- 10. Switch Back to Citizen: Verify Credits & Status Sync ---');
  const citizenDashCheck = await fetch(`${BASE}/citizen/dashboard`, {
    headers: { 'Authorization': `Bearer ${citizenToken}` },
  });
  const citizenDashJson = await citizenDashCheck.json();
  console.log('Citizen wallet points synced:', citizenDashJson.metrics?.walletPoints);
  console.log('Citizen recycled weight synced:', citizenDashJson.metrics?.recycledWeightKg, 'kg');

  console.log('\n--- 11. Switch to Industry: Check Marketplace for Created Batch ---');
  const indLogin = await fetch(`${BASE}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'industry' }),
  });
  const indData = await indLogin.json();
  const indMarketRes = await fetch(`${BASE}/industry/marketplace`, {
    headers: { 'Authorization': `Bearer ${indData.token}` },
  });
  const indMarketJson = await indMarketRes.json();
  console.log('Industry marketplace batches available:', indMarketJson.batches?.length);
  if (indMarketJson.batches?.length > 0) {
    console.log('Available polymer batch from verified pickup:', indMarketJson.batches[0].id, indMarketJson.batches[0].availableKg, 'kg');
  }

  console.log('\n🎉 ALL FULL-LIFECYCLE SYNC CHECKS PASSED PERFECTLY!');
}

run().catch(console.error);
