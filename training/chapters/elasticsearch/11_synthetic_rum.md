---
layout: section
---

# User Experience Monitoring

---

# Two Approaches to Monitor User Experience

<v-clicks>

| Approach | What is it? | When to use |
|----------|-------------|-------------|
| **Synthetic Monitoring** | 🤖 Simulated user journeys | Proactive, scheduled checks |
| **RUM (Real User Monitoring)** | 👤 Real user interactions | Actual user experience data |

**Best practice**: Use **both** together!

- Synthetic → Detect issues **before** users
- RUM → Understand **real** user experience

</v-clicks>

---

# Synthetic Monitoring: Overview

**Synthetic Monitoring** = automated testing from user perspective

<v-clicks>

**Use cases**:
- ✅ Check website availability (uptime)
- ✅ Verify critical user journeys work
- ✅ Monitor API endpoints
- ✅ Detect performance degradation
- ✅ Test from multiple geographic locations

**How it works**:
```
Elastic Agent → Runs Playwright scripts every X minutes
              → Records response time, screenshots, errors
              → Sends data to Elasticsearch
```

</v-clicks>

---

# Synthetic Monitoring: Architecture

```
┌─────────────────────────────────────────────┐
│           Kibana UI (Synthetics)            │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Monitors   │  │  Journey Scripts     │ │
│  └──────────────┘  └──────────────────────┘ │
└─────────────────────────┬───────────────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │  Elastic Agent   │
                 │  + Synthetics    │
                 │  Integration     │
                 └──────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐   ┌──────────┐
    │Your Site │    │Your API  │   │3rd Party │
    │(every 5m)│    │(every 1m)│   │Service   │
    └──────────┘    └──────────┘   └──────────┘
```

---

# Synthetic Monitoring: Types of Monitors

<v-clicks>

**1. Lightweight HTTP Monitor**
- Simple ping/HTTP check
- Response time, status code
- Fast, minimal resource usage

```yaml
# Example: Check website homepage
URL: https://parkki.com
Method: GET
Schedule: Every 3 minutes
```

**2. Browser Monitor (Journey)**
- Full user journey with Playwright
- Multi-step interactions
- Screenshots, network traces

```javascript
// Example: Login and book parking
step('Navigate to login', async () => { ... })
step('Fill credentials', async () => { ... })
step('Book parking', async () => { ... })
```

</v-clicks>

---

# Synthetic Monitoring: Browser Monitor Example

```javascript
// synthetics/journeys/booking.journey.ts
import { journey, step, monitor, expect } from '@elastic/synthetics';

journey('Parking Booking Flow', ({ page, params }) => {

  step('Load homepage', async () => {
    await page.goto('https://parkki.com');
    await expect(page.locator('h1')).toHaveText('Find Parking');
  });

  step('Search for parking', async () => {
    await page.fill('#location', 'Paris Center');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.parking-list');
  });

  step('Select parking', async () => {
    await page.click('.parking-card:first-child .book-button');
    await expect(page.url()).toContain('/booking');
  });

  step('Complete booking', async () => {
    await page.fill('#name', params.testUser);
    await page.fill('#card', params.testCard);
    await page.click('#confirm-booking');
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

---

# Synthetic Monitoring: Configuration in Kibana

Kibana → Observability → Synthetics

<v-clicks>

**Create a monitor**:
1. Choose type: HTTP or Browser
2. Configure:
   - Name: "Parkki Booking Flow"
   - Schedule: Every 10 minutes
   - Locations: Paris, London, New York
3. For browser monitors: Upload Playwright script
4. Set alerts: Alert if 2 consecutive failures

**Monitor from multiple locations**:
- Europe (Paris, London, Frankfurt)
- North America (New York, California)
- Asia (Singapore, Tokyo)

</v-clicks>

---

# Synthetic Monitoring: Setup with Fleet

<v-clicks>

**Step 1**: Add Synthetics integration to a policy

```yaml
# In Fleet policy
Integration: Elastic Synthetics
  - Browser monitors: enabled
  - Locations: [us-east, eu-west, ap-south]
  - Schedule: Every 5m
```

**Step 2**: Deploy monitor scripts

```bash
# Project structure
synthetics/
  ├── synthetics.config.ts
  └── journeys/
      ├── homepage.journey.ts
      ├── booking.journey.ts
      └── api-health.journey.ts
```

**Step 3**: Push to Elastic

```bash
npx @elastic/synthetics push --auth <api-key>
```

</v-clicks>
