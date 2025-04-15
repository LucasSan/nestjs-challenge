### **Architecture**

- https://app.ilograph.com/@lucassan/challenge

For the Orders functionality, how is the order system related to records? The answer is — it really shouldn’t be. These two domains should be decoupled, with no direct dependency between them.

So, I decided to create a new service called orders-service, which handles order placement independently. I also integrated a queue system using RabbitMQ to emit an event whenever a new order is placed.

The record-service acts as a consumer for this event. When it receives the message, it processes it by updating the stock — specifically, decreasing the quantity of the records involved in the order.

Additionally, I believe we should consider introducing a dedicated inventory-service to better encapsulate and manage all stock-related responsibilities moving forward.

So, with this solution we can achieve a more loosely coupled architecture

### Improvements Ideas

- Create a Inventory-Service
- Create the Infrastructure (Cloud based)

**High Availability**

- Deploy in multiple Availability Zones (configure it on Subnet level)
- On Database layer we can configure a RDS Multi-AZ

**High Scalability**

- Auto Scaling (Horizontal by default)
- Load Balancer to route the traffic

**Fault Tolerance**

- Maybe backup & restore strategy

**Performance**

- Caching ✅
- Pagination ✅
- CDN (CloudFront that will use Edge Locations)
- For the Search feature, add Algolia to it

**DoD (Definition Of Done)**

- All tests passing and with at least 80% branch cover
- Green Pipeline
- Code Review
- QA Tests
- docs
