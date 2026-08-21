const API_URL = process.env.API_URL || "http://127.0.0.1:5000/api";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function request(path, options = {}, token = "") {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${data.message || ""}`);
  }
  return data;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await request("/health");
      return;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error("API server did not become ready");
}

async function createResource(resource, payload, token) {
  return request(`/${resource}`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

async function removeResource(resource, id, token) {
  await request(`/${resource}/${id}`, { method: "DELETE" }, token);
}

async function run() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required for smoke tests");
  }

  await waitForServer();

  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!login.token) throw new Error("Login did not return a JWT token");
  const token = login.token;

  const me = await request("/auth/me", {}, token);
  if (me.email !== ADMIN_EMAIL.toLowerCase()) throw new Error("Authenticated user does not match admin");

  const suffix = Date.now();
  const created = [];

  try {
    const farmer = await createResource("farmers", {
      name: `CI Farmer ${suffix}`,
      village: "Test Village",
      mobile: "9999999999",
      bank: "Test Bank",
      account: `ACC${suffix}`,
      status: "Pending",
    }, token);
    created.push(["farmers", farmer._id]);

    const labour = await createResource("labours", {
      labourId: `LABCI${suffix}`,
      name: `CI Labour ${suffix}`,
      mobile: "8888888888",
      village: "Test Village",
      workType: "Loading",
      dailyWage: 500,
      status: "Active",
    }, token);
    created.push(["labours", labour._id]);

    const purchase = await createResource("purchases", {
      purchaseId: `PURCI${suffix}`,
      farmer: farmer.name,
      paddyType: "Swarna",
      quantity: 10,
      rate: 2000,
      moisture: 12,
      truck: "OD-02-AB-1234",
    }, token);
    created.push(["purchases", purchase._id]);
    if (purchase.total !== 20000) throw new Error("Purchase total calculation failed");

    const payment = await createResource("payments", {
      farmer: farmer.name,
      amount: 15000,
      method: "UPI",
      date: new Date().toISOString(),
      status: "Paid",
    }, token);
    created.push(["payments", payment._id]);

    const stock = await createResource("stocks", {
      rice: "Swarna",
      godown: "Godown A",
      quantity: 25,
      rate: 2400,
    }, token);
    created.push(["stocks", stock._id]);

    const truck = await createResource("trucks", {
      truckNo: `OD-02-CI-${String(suffix).slice(-4)}`,
      driver: "CI Driver",
      mobile: "7777777777",
      farmer: farmer.name,
      quantity: 10,
      status: "In Transit",
      type: "Incoming",
      purpose: "Paddy Purchase",
    }, token);
    created.push(["trucks", truck._id]);

    const dashboard = await request("/dashboard", {}, token);
    if (dashboard.farmers < 1) throw new Error("Dashboard farmer aggregation failed");
    if (dashboard.purchases < 1) throw new Error("Dashboard purchase aggregation failed");
    if (!Array.isArray(dashboard.recentPurchases)) throw new Error("Dashboard recent purchases missing");

    const farmers = await request("/farmers", {}, token);
    if (!farmers.some((item) => item._id === farmer._id)) throw new Error("Farmer list did not contain created record");

    console.log("Godown ERP authenticated API smoke test passed");
  } finally {
    for (const [resource, id] of created.reverse()) {
      try {
        await removeResource(resource, id, token);
      } catch (error) {
        console.error(`Cleanup failed for ${resource}/${id}:`, error.message);
      }
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
