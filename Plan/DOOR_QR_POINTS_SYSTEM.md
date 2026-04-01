# Plan: Door QR Points System - First Scanner Wins

## Overview

A system where the store has a permanent QR code displayed on the door. Customers scan it to "claim" points. When a purchase is made, the merchant enters the amount and generates points - the **first customer who scanned** gets those points.

## Current System vs Requested System

### Current (QRGenerator.jsx)
- Merchant enters amount → generates unique time-limited QR
- Customer scans that specific QR → gets points
- Each purchase = new QR code

### Requested (Door QR System)
- Store has **permanent QR on door** (never changes)
- Customer scans door QR → registers their interest, waits on "pending points" page
- Merchant enters purchase amount → points go to the first waiting customer
- First scanner gets the points (winner's race)

---

## Implementation Plan

### Phase 1: Database Schema Changes

#### 1.1 Create Pending Claims Table
```sql
CREATE TABLE pending_point_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  user_id UUID REFERENCES users,
  membership_id UUID REFERENCES user_store_memberships,
  status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'claimed', 'expired'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ NULL,
  amount_claimed NUMERIC NULL,
  points_claimed INTEGER NULL
);
```

#### 1.2 Add Indexes
- Index on (store_id, status) for fast lookups
- Index on (user_id, store_id) to prevent duplicates

---

### Phase 2: Door QR Implementation

#### 2.1 Create Permanent Door QR Component
- Generate static QR containing store URL with store slug
- Format: `https://app.domain.com/claim/{storeSlug}` or `t.me/{bot}?start=claim_{storeSlug}`
- QR never changes - displayed permanently on store door

#### 2.2 Create Claim Landing Page (`/claim/:storeSlug`)
- When customer scans door QR, open this page
- Show "Waiting for merchant to confirm purchase..."
- Display pending animation
- When merchant generates points, redirect to success with points

---

### Phase 3: Merchant Dashboard Updates

#### 3.1 Update QRGenerator Page
- Add option to toggle between:
  - "Generate new QR" (current system)
  - "Assign to waiting customer" (door QR system)

#### 3.2 Create Waiting Customers List
- Show list of customers currently waiting (scanned door QR, not yet claimed)
- Display: username/time waiting
- Merchant selects which customer to assign points to
- Or auto-assign to first in queue

#### 3.3 Points Assignment Flow
```
1. Merchant enters purchase amount
2. System calculates points
3. Merchant clicks "Assign Points"
4. System finds first waiting customer (FIFO)
5. Points added to that customer's membership
6. Customer sees success screen with points earned
7. Remove from waiting list, mark as claimed
```

---

### Phase 4: Customer Flow

#### 4.1 Door QR Scan Flow
```
1. Customer scans door QR
2. App opens /claim/{storeSlug}
3. Check if user already has pending claim for this store
4. If not, create pending claim (status: 'waiting')
5. Show "Waiting for merchant..." screen with animation
6. Poll or use subscription for status updates
7. When status changes to 'claimed', show success with points
```

#### 4.2 Success Screen
- Show "You earned X points!"
- Show total points balance
- Option to scan again for next purchase

---

### Phase 5: Edge Cases & Safety

#### 5.1 Timeout Handling
- Pending claims expire after X minutes (e.g., 10 min)
- If no merchant assigns points, status becomes 'expired'
- Customer sees "Claim expired, please scan again"

#### 5.2 Duplicate Prevention
- One pending claim per user per store at a time
- If already waiting, show existing wait status

#### 5.3 Merchant Controls
- "Clear all waiting" button for merchant
- Manual assign to specific customer option
- Cancel specific waiting claim

---

## File Structure

### New Files
1. `src/pages/ClaimPoints.jsx` - Customer landing page after scanning door QR
2. `src/components/PendingClaimCard.jsx` - Shows waiting customer in merchant dashboard
3. `src/hooks/usePendingClaim.js` - Hook for managing pending claims

### Modified Files
1. `src/pages/QRGenerator.jsx` - Add door QR mode, waiting customers list
2. `src/App.jsx` - Add `/claim/:storeSlug` route
3. `src/store/userStore.js` - Add claim-related methods

---

## UI/UX Design

### Door QR Display
- Large, scannable QR code
- Store name below
- "Scan to earn points" label
- Weather-resistant design suggestion for physical print

### Customer Waiting Screen
- Animated waiting indicator
- "You've scanned first! Waiting for merchant..."
- Show position in queue (e.g., "You're #1 in line")
- Estimated wait time

### Merchant Waiting List
- Card-based list of waiting customers
- Show: avatar, username, time waiting
- "Assign Points" button per customer
- Quick amount input field

### Success Screen
- Confetti animation
- "You earned X points!"
- Points balance update
- "Scan again for your next purchase"

---

## Data Flow Diagram

```
┌─────────────────┐         ┌──────────────────┐
│   Store Door    │         │  Merchant POS   │
│   (Permanent QR)│         │ (Enter Amount)  │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│  Customer App  │         │  Supabase        │
│ (Claim Page)   │────────▶│ (Pending Claims) │
│ Creates Claim  │         │                  │
└─────────────────┘         └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  Merchant selects│
                             │  waiting customer│
                             └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  Points credited │
                             │  to customer     │
                             └──────────────────┘
```

---

## Acceptance Criteria

- [ ] Store can display permanent QR code on door
- [ ] Customer scanning door QR creates pending claim
- [ ] Merchant sees list of waiting customers
- [ ] Merchant can enter amount and assign to waiting customer
- [ ] First customer in queue gets the points
- [ ] Customer sees success screen with earned points
- [ ] Pending claims expire after timeout
- [ ] Only one pending claim per user per store

## Implementation Priority

1. **P0**: Create pending_claims table
2. **P0**: Implement ClaimPoints page
3. **P0**: Update QRGenerator with waiting customers
4. **P1**: Add success flow and notifications
5. **P2**: Add expiry handling and edge cases
