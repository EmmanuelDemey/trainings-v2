---
layout: section
---

# Part 14: APM and Application Logs

---

# RUM (Real User Monitoring): Overview

**RUM** = monitoring **actual** user experience in real-time

<v-clicks>

**What RUM captures**:
- 📊 Page load performance
- 🖱️ User interactions (clicks, scrolls)
- ⚠️ JavaScript errors
- 🌐 Network requests (XHR, Fetch)
- 📱 Device/browser information
- 🌍 Geographic location

**Key difference from Synthetic**:
- Synthetic → Simulated, scheduled
- RUM → Real users, real conditions, real devices

</v-clicks>

---

# RUM Architecture

```
┌─────────────────────────────────────────────┐
│            User's Browser                   │
│                                             │
│  Your Website/App                           │
│    └── Elastic APM RUM Agent (JS)          │
│          ↓                                  │
│    Collects: page loads, clicks, errors    │
└─────────────────────┬───────────────────────┘
                      │ HTTPS
                      ▼
             ┌──────────────────┐
             │   APM Server     │  (or Elastic Agent)
             └──────────────────┘
                      │
                      ▼
             ┌──────────────────┐
             │  Elasticsearch   │
             └──────────────────┘
                      │
                      ▼
             ┌──────────────────┐
             │  Kibana APM UI   │
             │  + Dashboards    │
             └──────────────────┘
```

---

# RUM Setup: Step 1 - Install APM Server

**Option A: Elastic Agent with APM integration** (recommended)

```yaml
# In Fleet, add APM integration
Integration: Elastic APM
  - RUM enabled: true
  - APM Server URL: https://apm.example.com:8200
  - Secret token: <generated>
  - CORS allowed origins: https://parkki.com
```

**Option B: Standalone APM Server**

```yaml
# apm-server.yml
apm-server:
  host: "0.0.0.0:8200"
  rum:
    enabled: true
    allow_origins: ['https://parkki.com']
    allow_headers: ['*']

output.elasticsearch:
  hosts: ["https://es.cloud:9243"]
```

---

# RUM Setup: Step 2 - Install RUM Agent

**Add to your website** (React example):

```javascript
// src/index.js
import { init as initApm } from '@elastic/apm-rum';

const apm = initApm({
  serviceName: 'parkki-frontend',
  serverUrl: 'https://apm.example.com:8200',
  serviceVersion: '1.2.0',
  environment: 'production',

  // Distributed tracing
  distributedTracingOrigins: ['https://api.parkki.com'],

  // Performance monitoring
  transactionSampleRate: 0.5,  // Sample 50% of page loads

  // Error tracking
  capturePageLoadSpans: true,
  logLevel: 'warn'
});

export default apm;
```

---

# RUM Setup: Step 3 - Track Custom Events

```javascript
// Track custom user actions
import apm from './apm';

// Track a custom transaction
const transaction = apm.startTransaction('booking-flow', 'user-interaction');

async function bookParking(parkingId) {
  const span = apm.startSpan('book-parking-api');

  try {
    const response = await fetch(`/api/bookings`, {
      method: 'POST',
      body: JSON.stringify({ parkingId })
    });

    if (span) span.end();

    // Track custom metric
    apm.setCustomContext({
      booking: { parkingId, success: true }
    });

    if (transaction) transaction.end();

  } catch (error) {
    apm.captureError(error);
    if (span) span.end();
    if (transaction) transaction.end();
  }
}

// Track page views
apm.setUserContext({
  id: user.id,
  username: user.name,
  email: user.email
});
```

---

# RUM Metrics Collected

<v-clicks>

**Page Load Metrics**:
- DOM Interactive
- DOM Complete
- Load Event End
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

**User Behavior**:
- Navigation timing
- Resource timing (CSS, JS, images)
- User interactions (clicks, forms)
- Single Page App route changes

**Errors**:
- JavaScript errors
- Promise rejections
- Network errors

</v-clicks>

---

# RUM in Kibana: User Experience Dashboard

Kibana → Observability → User Experience

<v-clicks>

**Core Web Vitals**:
```
┌─────────────────────────────────────────────┐
│  LCP: 2.1s  │  FID: 45ms  │  CLS: 0.05    │
│  (Good)     │  (Good)     │  (Good)       │
└─────────────────────────────────────────────┘
```

**Filters available**:
- Browser (Chrome, Firefox, Safari...)
- Device (Desktop, Mobile, Tablet)
- Location (Country, City)
- OS (Windows, macOS, iOS, Android)
- Page URL

**Views**:
- Performance distribution
- Slowest pages
- Error rate by page
- Geographic performance map

</v-clicks>

---

# RUM: Performance Analysis Example

**Scenario**: "Why is checkout slow?"

<v-clicks>

**Step 1: Identify the issue**
```
Page: /checkout
Avg Load Time: 8.2s (vs 2.5s site average)
LCP: 6.5s (Poor)
```

**Step 2: Drill down**
- Click on `/checkout` page
- See waterfall of resources
- Identify bottleneck: `payment-widget.js` (4.2s)

**Step 3: Check user segments**
- Filter by device: Mobile users = 12s load time!
- Filter by location: Asia users = 15s load time!

**Step 4: Action**
- Optimize payment widget
- Add CDN in Asia
- Lazy load heavy resources

</v-clicks>

---

# RUM: Error Tracking

**Kibana → APM → Errors**

<v-clicks>

**Error details**:
```javascript
Error: Cannot read property 'price' of undefined
  at BookingForm.js:45:12
  at onClick (Button.js:23)

User: john.doe@example.com
Browser: Chrome 120 on Windows
Page: /parking/central/book
Session ID: abc-def-123
Timestamp: 2025-01-14 10:23:45
```

**Error rate metrics**:
- Total errors per minute
- Unique errors
- Error percentage by page
- Most common errors
- Error trends over time

</v-clicks>

---

# Architecture APM

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Application    │     │   APM Server    │     │ Elasticsearch   │
│  + APM Agent    │────▶│                 │────▶│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │  Kibana APM UI  │
                                                └─────────────────┘
```

<v-clicks>

**Components**:
- **APM Agent**: Instruments your application
- **APM Server**: Collects and transforms data
- **Elasticsearch**: Storage
- **Kibana APM UI**: Visualization

</v-clicks>

---

# Available APM Agents

<v-clicks>

| Language | Agent |
|---------|-------|
| Java | elastic-apm-agent |
| Node.js | elastic-apm-node |
| Python | elastic-apm |
| .NET | Elastic.Apm |
| Go | apm-agent-go |
| Ruby | elastic-apm |
| PHP | elastic-apm-php-agent |

</v-clicks>

---

# Configuration APM Agent (Node.js)

```javascript
// First line of your app!
const apm = require('elastic-apm-node').start({
  serviceName: 'parkki-api',
  serverUrl: 'http://apm-server:8200',
  environment: 'production',

  // Sampling
  transactionSampleRate: 0.1,  // 10% des transactions

  // Capture
  captureBody: 'all',
  captureHeaders: true
});
```

---

# Configuration APM Agent (Java)

```bash
# Start with agent
java -javaagent:/path/to/elastic-apm-agent.jar \
     -Delastic.apm.service_name=parkki-api \
     -Delastic.apm.server_urls=http://apm-server:8200 \
     -Delastic.apm.environment=production \
     -Delastic.apm.transaction_sample_rate=0.1 \
     -jar parkki-api.jar
```

<v-click>

Or via `elasticapm.properties`:
```properties
service_name=parkki-api
server_urls=http://apm-server:8200
environment=production
transaction_sample_rate=0.1
```

</v-click>

---

# Automatic vs Manual Instrumentation

**Automatic** (by default):

<v-clicks>

- HTTP requests/responses
- Database queries (SQL, MongoDB, Redis)
- External HTTP calls
- Message queues (RabbitMQ, Kafka)

</v-clicks>

<v-click>

**Manual** (for custom):
```javascript
const span = apm.startSpan('custom-operation');
try {
  // Your code
  await processOrder(order);
} finally {
  span.end();
}
```

</v-click>

---

# Sampling Strategies

```javascript
// Sample rate (% of transactions)
transactionSampleRate: 0.1  // 10%

// Or dynamic
transactionSampleRate: (transactionName) => {
  if (transactionName.includes('/health')) return 0;
  if (transactionName.includes('/api/critical')) return 1;
  return 0.1;
}
```

---

# Logs/APM Correlation

Injecting Trace ID into logs:

```javascript
// Logger with trace ID
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format((info) => {
      const traceId = apm.currentTransaction?.traceId;
      if (traceId) {
        info.trace_id = traceId;
        info.transaction_id = apm.currentTransaction.id;
      }
      return info;
    })(),
    winston.format.json()
  )
});
```
