---
layout: cover
---

# 3 - Événements Node.js

---

# Architecture event-driven

- Une grande partie de l'API Node.js est construite autour du module **`events`**
- HTTP server, streams, child process, websockets... émettent et écoutent des événements
- Pattern **Observateur** natif

```javascript
const { EventEmitter } = require('node:events');

const bus = new EventEmitter();

bus.on('user:created', (user) => {
  console.log('Nouvel utilisateur:', user.id);
});

bus.emit('user:created', { id: 1, email: 'manu@sparks.fr' });
```

---

# EventEmitter - API principale

| Méthode | Description |
|---------|-------------|
| `on(event, listener)` | Abonne un listener |
| `once(event, listener)` | Abonne pour une seule émission |
| `off / removeListener` | Désabonne |
| `emit(event, ...args)` | Déclenche les listeners |
| `removeAllListeners(event?)` | Vide les listeners |
| `listenerCount(event)` | Nombre d'auditeurs |
| `setMaxListeners(n)` | Désactive l'avertissement à 10 listeners |

---

# Héritage et composition

- On peut **étendre** EventEmitter pour créer ses propres composants observables

```javascript
class OrderService extends EventEmitter {
  async create(payload) {
    const order = await this.repo.save(payload);
    this.emit('order:created', order);
    return order;
  }
}

const service = new OrderService();
service.on('order:created', sendConfirmationEmail);
service.on('order:created', updateInventory);
```

---

# Erreurs et événement `error`

- Émettre `error` **sans listener** plante le process

```javascript
emitter.emit('error', new Error('boom'));
// throw new Error('boom') si pas de listener
```

- Toujours brancher un listener `error` ou utiliser `events.errorMonitor`

```javascript
const { errorMonitor } = require('node:events');

emitter.on(errorMonitor, (err) => {
  logger.warn('event error', err);
});
```

---

# EventEmitter et async/await

- `events.once(emitter, event)` retourne une Promise
- `events.on(emitter, event)` retourne un async iterable

```javascript
const { once, on } = require('node:events');

const [data] = await once(server, 'listening');

for await (const [conn] of on(server, 'connection')) {
  handle(conn);
}
```

---

# Comparaison avec RxJS

- **EventEmitter** : push pur, pas de composition, pas de back-pressure
- **RxJS** : Observable, opérateurs (`map`, `filter`, `debounce`, `throttle`, `mergeMap`...)

```javascript
import { fromEvent, throttleTime, map } from 'rxjs';

fromEvent(emitter, 'tick')
  .pipe(
    throttleTime(1000),
    map(() => Date.now()),
  )
  .subscribe(console.log);
```

- À utiliser quand vous avez besoin de **composer** des flux d'événements complexes

---

# Architecture event-driven distribuée

- Au-delà du process Node.js, l'event-driven s'applique à **plusieurs services**
  - Brokers : **Kafka**, **RabbitMQ** (AMQP), **NATS**, **Redis Streams**
  - CQRS / Event Sourcing
  - SAGA pattern pour la cohérence inter-services
- Avantages :
  - **Découplage** entre producteurs et consommateurs
  - Scalabilité horizontale
  - Rejouabilité de l'historique
- Inconvénients :
  - Complexité opérationnelle
  - Cohérence éventuelle, pas immédiate

---

# Bonnes pratiques

- Préfixer les événements par un domaine (`user:created`, `order:paid`)
- Documenter les payloads (typage TS, schemas JSON)
- Toujours nettoyer les listeners pour éviter les **fuites mémoire**
- Limiter le nombre de listeners (`setMaxListeners` est un avertissement, pas un mur)
- Préférer un module dédié pour le bus d'événements applicatif
